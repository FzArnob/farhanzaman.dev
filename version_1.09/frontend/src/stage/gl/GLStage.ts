/**
 * The WebGL stage — the world as real, lit geometry.
 *
 * The CSS stage fakes a solid out of layers and gradients because layers and
 * gradients are all a DOM has. Here the monogram is an extruded mesh, a crystal is
 * faceted glass that the lights actually strike, and a highlight is where the key is
 * reflected rather than where a gradient was painted. That is the difference the
 * visitor sees, and it is the only reason this module exists.
 *
 * It does not own the camera, the scroll or the choreography. The stage's Camera is
 * copied into three's every frame — position, basis, parallax and all — so a WebGL
 * crystal and the DOM label hanging off it are projected through exactly the same
 * lens. The acts decide where things are; this only draws them.
 *
 * It is only ever reached through a dynamic import from Stage.tsx, and only on a
 * machine lib/renderer.ts has already found a hardware WebGL 2 context on. If the
 * context is lost mid-session, `onLost` hands control back and the stage rebuilds on
 * the CSS renderer; nobody is left looking at a black canvas.
 *
 * Cost is tiered, because bloom and clearcoat are exactly the fill-rate a weak GPU
 * lacks:
 *
 *   high   physical materials with clearcoat, bloom, 4× multisampling
 *   mid    standard materials, bloom, 2× multisampling
 *   low    standard materials, no bloom, the device's own antialiasing
 *
 * and the Studio theme never blooms at all: an additive glow over a near-white ground
 * is invisible, whatever it costs.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Quality } from '../../lib/quality';
import { Camera, FAR, FOV, NEAR } from '../camera';
import { dustPositions } from '../fx/PointField';
import { SHARD_RADIUS, ShardSim } from '../fx/shards';
import type { WorldLook } from '../look';
import { crystalSpec, markOutlines, MARK } from '../shapes';
import { glassTone, parseHex } from '../../lib/projectTheme';
import type { GLDriver, GLField, GLLight, GLNode, SolidSpec, Tint } from './api';

/* ------------------------------------------------------------------ palette */

function tintHex(tint: Tint, look: WorldLook): number {
  if (tint.startsWith('#')) {
    const [r, g, b] = glassTone(parseHex(tint), !look.bloom);
    return (r << 16) | (g << 8) | b;
  }
  if (tint === 'white') return 0xffffff;
  if (tint === 'crimson') return look.bloom ? 0xfd2155 : 0xd70f41;
  return look.bloom ? 0x00d3b4 : 0x00947f;
}

/* ------------------------------------------------------------------- nodes */

/**
 * A dust mote's size. three attenuates a point by half the viewport height over depth,
 * where a perspective projection divides by tan(fov/2) as well — so the 0.075-unit mote
 * the CSS field draws is this much larger here, not 0.075.
 */
const DUST_SIZE = 0.075 / Math.tan((FOV * Math.PI) / 360);

/** A mesh or sprite a node owns, with the values fade and shine scale from. */
interface Part {
  obj: THREE.Mesh | THREE.Sprite | THREE.Points;
  material: THREE.Material & { opacity: number };
  opacity: number;
  /** Resting emissive intensity, or -1 for an unlit material whose glow is its alpha. */
  emissive: number;
  /** Anything else the node's shine drives — a prism's inclusion. */
  onShine?: (k: number) => void;
}

class Node implements GLNode {
  readonly obj: THREE.Object3D;
  readonly parts: Part[] = [];
  readonly children: Node[] = [];
  private ownFade = 1;
  private ownShine = 1;
  private shineDirty = false;

  constructor(obj: THREE.Object3D) {
    this.obj = obj;
  }

  show(on: boolean): void {
    this.obj.visible = on;
  }

  pose(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): void {
    this.obj.position.set(x, y, z);
    this.obj.rotation.set(rx, ry, rz);
  }

  size(sx: number, sy = sx, sz = sx): void {
    this.obj.scale.set(sx, sy, sz);
  }

  fade(a: number): void {
    this.ownFade = a < 0 ? 0 : a > 1 ? 1 : a;
  }

  shine(k: number): void {
    if (k !== this.ownShine) {
      this.ownShine = k;
      this.shineDirty = true;
    }
  }

  /**
   * Pushes fade down the tree and shine into this node's own parts. Run once a frame,
   * before the draw, so an act can fade a whole assembly by touching its root.
   */
  apply(parentFade: number): void {
    const fade = parentFade * this.ownFade;
    for (const part of this.parts) {
      part.material.opacity = part.opacity * fade * (part.emissive < 0 ? this.ownShine : 1);
      // A faded-out part is skipped by the renderer entirely rather than drawn at zero.
      part.obj.visible = fade > 0.003;
      if (this.shineDirty && part.emissive >= 0) {
        (part.material as THREE.MeshStandardMaterial).emissiveIntensity = part.emissive * this.ownShine;
      }
      if (this.shineDirty) part.onShine?.(this.ownShine);
    }
    this.shineDirty = false;
    for (const child of this.children) child.apply(fade);
  }
}

/* --------------------------------------------------------------- geometry */

/**
 * The monogram, extruded: the same outlines the CSS stage stands its walls on, the
 * same depth, and the same small bevel the WebGL build had — enough for the edge to
 * catch the key without rounding the mark's straight cuts. Centred on its own depth
 * so it turns about its middle, and left alone in x/y so the shards act 00 solves
 * onto the outline land on this mesh.
 */
function markGeometry(): THREE.ExtrudeGeometry {
  const shapes = markOutlines().map((points) => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    shape.closePath();
    return shape;
  });
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: MARK.depth,
    bevelEnabled: true,
    bevelThickness: 0.026,
    bevelSize: 0.02,
    bevelSegments: 2,
    // The mark is all straight edges; curve subdivision would only add triangles.
    curveSegments: 1,
  });
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  geo.translate(0, 0, -(box.min.z + box.max.z) / 2);
  return geo;
}

/**
 * A project core — a hexagonal column with pyramidal caps, the shape quartz grows
 * into. Built from crystalSpec, the same five seeded draws the CSS crystal is cut
 * from, so a project's prism is one object on both renderers.
 */
function prismGeometry(seed: number, scale: number): THREE.BufferGeometry {
  const spec = crystalSpec(seed, scale);
  const sides = 6;
  const ring = (y: number, r: number, rot: number) =>
    Array.from({ length: sides }, (_, i) => {
      const a = (i / sides) * Math.PI * 2 + rot;
      return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    });
  const lower = ring(-spec.half, spec.radius, 0);
  const upper = ring(spec.half, spec.radius * spec.taper, spec.twist);
  const tip = new THREE.Vector3(0, spec.half + spec.cap, 0);
  const base = new THREE.Vector3(0, -spec.half - spec.cap, 0);

  const pos: number[] = [];
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) =>
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    tri(lower[i], upper[j], lower[j]);
    tri(lower[i], upper[i], upper[j]);
    tri(upper[i], tip, upper[j]);
    tri(lower[j], base, lower[i]);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  // Non-indexed, so every face keeps its own normal: flat facets, which is what glints.
  geo.computeVertexNormals();
  return geo;
}

/** A soft round glow, drawn once and shared by every halo and every dust mote. */
function glowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.38, 'rgba(255,255,255,0.26)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A hard-edged disc for the dust, so a near mote is a round object and not a smudge. */
function moteTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.72, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* -------------------------------------------------------------- inclusion */

/** The logo canvas: square, the mark fitted inside it, transparent everywhere else. */
const INCLUSION_PX = 512;

/**
 * A project's logo as a texture, drawn into a square canvas so every mark — a wide
 * wordmark, a square badge — lands in the same frame the shader samples.
 *
 * The texture exists at once, empty, and fills when the image arrives, so building the
 * ring never waits on the network. A logo that will not load (a host without CORS
 * headers cannot be uploaded to WebGL at all) is replaced by the fallback, the
 * project's monogram, rather than by nothing.
 */
function inclusionTexture(url: string, fallback: string, anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = INCLUSION_PX;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;

  const draw = (img: HTMLImageElement) => {
    const g = canvas.getContext('2d');
    if (!g) return;
    const w = img.naturalWidth || INCLUSION_PX;
    const h = img.naturalHeight || INCLUSION_PX;
    const k = INCLUSION_PX / Math.max(w, h);
    g.clearRect(0, 0, INCLUSION_PX, INCLUSION_PX);
    g.drawImage(img, (INCLUSION_PX - w * k) / 2, (INCLUSION_PX - h * k) / 2, w * k, h * k);
    tex.needsUpdate = true;
  };
  const load = (src: string, onFail?: () => void) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => draw(img);
    if (onFail) img.onerror = onFail;
    img.src = src;
  };
  load(url || fallback, url && url !== fallback ? () => load(fallback) : undefined);
  return tex;
}

/**
 * The logo, inside the glass.
 *
 * A mark painted on a crystal reads as a sticker, and a mark floated in front of one
 * reads as a label. What makes something read as *inside* a piece of cut glass is that
 * every facet shows it from a slightly different place: the eye's ray bends at each
 * face by a different amount, so the object breaks at every seam and the pieces slide
 * against each other as the crystal turns. That is what this does, per pixel.
 *
 * The mark is a billboard through the crystal's centre, square to the eye. Each
 * fragment of a front facet refracts the view ray through that facet's own normal
 * (glass, n ≈ 1.5) and looks the logo up where the bent ray crosses the billboard. The
 * face turned toward you shows the mark almost true; the faces either side show it
 * displaced and magnified, the way a real inclusion looks.
 *
 * Three rays rather than one: red, green and blue refract at slightly different
 * indices, so a mark seen through an oblique facet fringes into its colours at the
 * edges — the dispersion that separates a crystal from a lens. Around the mark, the
 * crystal's own colour gathers the way light pools about an object in glass. It is
 * read from a low mip of the same texture, so the glow is exactly the logo's
 * silhouette, blurred, for the price of one lookup.
 *
 * It is all spliced into the standard material, so the crystal keeps every bit of the
 * lighting, clearcoat and fog it already had.
 */
function withInclusion(
  material: THREE.MeshStandardMaterial,
  map: THREE.Texture,
  size: number,
  tint: THREE.Color,
  lift: number
): (k: number) => void {
  const uniforms = {
    uIncl: { value: map },
    uInclSize: { value: size },
    uInclShine: { value: 1 },
    uInclTint: { value: tint },
    uInclLift: { value: lift },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vInclCentre;
        varying float vInclScale;`
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vInclCentre = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        vInclScale = length(modelViewMatrix[0].xyz);`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uIncl;
        uniform float uInclSize;
        uniform float uInclShine;
        uniform vec3 uInclTint;
        uniform float uInclLift;
        varying vec3 vInclCentre;
        varying float vInclScale;

        // Where the view ray, bent by this facet, crosses the billboard through C.
        vec2 inclusionUv(vec3 P, vec3 V, vec3 N, vec3 C, vec3 nP, vec3 bu, vec3 bv, float s, float eta) {
          vec3 R = refract(V, N, eta);
          float d = dot(R, nP);
          if (d > -1e-4) return vec2(-1.0);
          float t = dot(C - P, nP) / d;
          if (t < 0.0) return vec2(-1.0);
          vec3 H = P + R * t - C;
          return vec2(dot(H, bu), dot(H, bv)) / s + 0.5;
        }
        float inBox(vec2 uv) {
          return step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
        }`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float inclGlare = 1.0;
        {
          vec3 P = -vViewPosition;
          vec3 V = normalize(P);
          vec3 N = normalize(normal);
          N = dot(N, V) > 0.0 ? -N : N;
          vec3 C = vInclCentre;
          vec3 nP = normalize(-C);
          vec3 bu = normalize(cross(vec3(0.0, 1.0, 0.0), nP));
          vec3 bv = cross(nP, bu);
          float s = uInclSize * vInclScale;

          vec2 uvR = inclusionUv(P, V, N, C, nP, bu, bv, s, 1.0 / 1.44);
          vec2 uvG = inclusionUv(P, V, N, C, nP, bu, bv, s, 1.0 / 1.50);
          vec2 uvB = inclusionUv(P, V, N, C, nP, bu, bv, s, 1.0 / 1.56);
          vec4 tR = texture2D(uIncl, uvR) * inBox(uvR);
          vec4 tG = texture2D(uIncl, uvG) * inBox(uvG);
          vec4 tB = texture2D(uIncl, uvB) * inBox(uvB);
          float a = (tR.a + tG.a + tB.a) / 3.0;
          vec3 ink = vec3(tR.r * tR.a, tG.g * tG.a, tB.b * tB.a);

          // The brand light pooled around the mark, and a softer echo of it from deeper
          // in. Both from low mips: neither costs more than a lookup.
          float glow = textureLod(uIncl, uvG, 5.5).a * inBox(uvG);
          vec2 uvE = inclusionUv(P, V, N, C - nP * s * 0.5, nP, bu, bv, s * 1.16, 1.0 / 1.5);
          float echo = textureLod(uIncl, uvE, 3.0).a * inBox(uvE);

          float lit = clamp(uInclShine * 0.5, 0.0, 1.0);
          float around = 1.0 - a;
          // The mark stands in front of the glass behind it...
          diffuseColor.rgb = mix(diffuseColor.rgb, ink / max(a, 1e-3) * 0.45, a * lit * 0.85);
          diffuseColor.a = min(1.0, diffuseColor.a * (1.0 + a * lit * 0.14));
          // ...is lit from inside, and is backed by the crystal's own colour. Half-lit, not
          // fully: a pale mark at full self-light crosses the bloom threshold and flares
          // into a white blob that no longer reads as anything.
          totalEmissiveRadiance += ink * uInclLift * lit * 0.5;
          totalEmissiveRadiance += uInclTint * (glow * 0.62 + echo * 0.22) * around * lit * uInclLift;
          // Where the mark is, the surface's own glare is held back (see below).
          inclGlare = 1.0 - 0.8 * clamp(max(a, glow) * lit, 0.0, 1.0);
        }`
      )
      /*
        The fill light sits at the eye, so a facet square to the camera mirrors it
        straight back — and the front crystal parks exactly that way. Left alone, the
        mark disappears under a white sheet of glare. So the surface specular and the
        clearcoat are damped where the mark is; everywhere else the glass shines as before.
      */
      .replace(
        '#include <lights_physical_fragment>',
        `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat *= inclGlare;
        #endif`
      )
      .replace(
        'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
        'vec3 outgoingLight = totalDiffuse + totalSpecular * inclGlare + totalEmissiveRadiance;'
      );
  };
  return (k) => {
    uniforms.uInclShine.value = k;
  };
}

/* ----------------------------------------------------------------- stage */

export interface GLStageOptions {
  look: WorldLook;
  quality: Quality;
  /** The context is gone and will not come back: rebuild on the CSS renderer. */
  onLost: () => void;
}

export class WebGLStage implements GLDriver {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly composer: EffectComposer | null = null;
  private readonly look: WorldLook;
  private readonly physical: boolean;
  private readonly roots: Node[] = [];
  private readonly fields: Array<{ update(time: number, t: number): void }> = [];
  private readonly geometries = new Map<string, THREE.BufferGeometry>();
  private readonly trash: Array<{ dispose(): void }> = [];
  private readonly dust: THREE.PointsMaterial[] = [];
  private readonly basis = new THREE.Matrix4();
  private readonly axis = {
    x: new THREE.Vector3(),
    y: new THREE.Vector3(),
    z: new THREE.Vector3(),
  };
  private glow: THREE.Texture | null = null;
  private readonly onContextLost: (e: Event) => void;

  constructor(opts: GLStageOptions) {
    const { look, quality } = opts;
    this.look = look;
    this.physical = quality.tier === 'high';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pz3-gl';
    this.canvas.setAttribute('aria-hidden', 'true');

    const bloom = look.bloom && quality.tier !== 'low';
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // With a composer, antialiasing happens on its multisampled target instead.
      antialias: !bloom,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dpr));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // A touch under neutral in the void: the brief was less shine than the reference.
    this.renderer.toneMappingExposure = look.bloom ? 0.8 : 1;

    this.onContextLost = (e: Event) => {
      // Prevent the default so the browser does not also print a warning about it;
      // the stage is leaving for the CSS renderer either way.
      e.preventDefault();
      opts.onLost();
    };
    this.canvas.addEventListener('webglcontextlost', this.onContextLost);

    this.camera = new THREE.PerspectiveCamera(FOV, 1, NEAR, FAR);

    this.scene.background = new THREE.Color(look.background);
    this.scene.fog = new THREE.Fog(look.background, look.fogNear, look.fogFar);
    this.lightScene();

    if (bloom) {
      const target = new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        samples: quality.tier === 'high' ? 4 : 2,
      });
      const composer = new EffectComposer(this.renderer, target);
      composer.addPass(new RenderPass(this.scene, this.camera));
      /*
        Well under the reference's bloom. Its 1.15 over a 0.08 threshold turns every
        crystal into a lamp; the brief here was the same world with less shine, so
        only what is genuinely bright — the lit edge, the active skill, the core —
        spills, and it spills softly.
      */
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.42, 0.7));
      composer.addPass(new OutputPass());
      this.composer = composer;
    }
  }

  /**
   * The room. Three directional lights from the directions the CSS stage paints its
   * gradients from — key high and to the left in front, crimson rim from behind and
   * below, a soft fill from the eye — plus a room environment, which is what gives a
   * clearcoat something to reflect. Without an environment a glossy surface only ever
   * shows the three lights as dots; with one, every facet carries a gradient of the
   * room across it, and that is most of what makes glass look like glass.
   */
  private lightScene(): void {
    const look = this.look;
    const scene = this.scene;
    scene.add(new THREE.AmbientLight(look.bloom ? 0x2a3b3c : 0xffffff, look.bloom ? 0.35 : 0.9));

    const key = new THREE.DirectionalLight(look.bloom ? 0xe6fffb : 0xffffff, look.bloom ? 1.0 : 1.7);
    key.position.set(-4, 5, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xfd2155, look.bloom ? 0.55 : 0.4);
    rim.position.set(5, -2, -4);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(look.bloom ? 0x00d3b4 : 0xffffff, look.bloom ? 0.22 : 0.5);
    fill.position.set(0, 2, 8);
    scene.add(fill);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = look.bloom ? 0.26 : 0.7;
    room.dispose();
    pmrem.dispose();
    this.trash.push(env);
  }

  /* ---------------------------------------------------------------- the API */

  node(parent?: GLNode): GLNode {
    const node = new Node(new THREE.Group());
    this.attach(node, parent);
    return node;
  }

  solid(spec: SolidSpec, parent?: GLNode): GLNode {
    const node = new Node(new THREE.Group());
    const add = (obj: Part['obj'], material: Part['material'], emissive: number) => {
      node.obj.add(obj);
      node.parts.push({ obj, material, opacity: material.opacity, emissive });
      this.trash.push(material);
    };
    const look = this.look;
    const bloom = look.bloom;

    switch (spec.kind) {
      case 'mark': {
        const geo = this.cached('mark', markGeometry);
        const front = spec.layer === 'front';
        const tint = front ? 'teal' : 'crimson';
        const m = this.glass({
          color: tintHex(tint, look),
          emissive: tintHex(tint, look),
          emissiveIntensity: bloom ? (front ? 0.14 : 0.09) : 0.03,
          metalness: front ? 0.55 : 0.45,
          roughness: front ? 0.2 : 0.26,
          opacity: front ? 1 : 0.85,
        });
        add(new THREE.Mesh(geo, m), m, m.emissiveIntensity);
        break;
      }
      case 'prism': {
        const geo = this.cached(`prism:${spec.seed}:${spec.scale}`, () =>
          prismGeometry(spec.seed, spec.scale)
        );
        /*
          The project's own glass. Void's body is the brand colour taken most of the way
          to black — about the ratio the teal cores had to #00d3b4 — so the colour reads
          from the lit edges and the light inside rather than as a painted solid. Studio's
          is the colour washed toward white: glass under daylight.
        */
        const hex = tintHex(spec.tint, look);
        const tone = new THREE.Color(hex);
        // Scaled in sRGB, as the teal core's hex was: the same 0.3 in linear light is
        // nearer 0.6 to the eye, and the crystal comes out a lamp.
        const srgb = (k: number, c: number) => (((hex >> c) & 255) / 255) * k;
        const body = bloom
          ? new THREE.Color().setRGB(srgb(0.3, 16), srgb(0.3, 8), srgb(0.3, 0), THREE.SRGBColorSpace)
          : tone.clone().lerp(new THREE.Color(0xffffff), 0.32);
        const m = this.glass({
          color: body.getHex(),
          emissive: tone.getHex(),
          emissiveIntensity: bloom ? 0.1 : 0.03,
          metalness: 0.5,
          roughness: 0.24,
          opacity: 0.88,
          flatShading: true,
        });
        const crystal = crystalSpec(spec.seed, spec.scale);
        const map = inclusionTexture(
          spec.logo,
          spec.fallback,
          Math.min(4, this.renderer.capabilities.getMaxAnisotropy())
        );
        this.trash.push(map);
        const onShine = withInclusion(
          m,
          map,
          // Most of the column's width, so the mark sits in the glass with air round it.
          crystal.radius * Math.cos(Math.PI / 6) * 1.5,
          tone,
          bloom ? 1 : 0.55
        );
        add(new THREE.Mesh(geo, m), m, m.emissiveIntensity);
        node.parts[node.parts.length - 1].onShine = onShine;
        break;
      }
      case 'gem': {
        const geo = this.cached(`gem:${spec.radius}`, () => new THREE.IcosahedronGeometry(spec.radius, 0));
        const m = this.glass({
          color: tintHex(spec.tint, look),
          emissive: tintHex(spec.tint, look),
          emissiveIntensity: bloom ? 0.14 : 0.04,
          metalness: 0.6,
          roughness: 0.28,
          opacity: 0.93,
          flatShading: true,
        });
        add(new THREE.Mesh(geo, m), m, m.emissiveIntensity);
        break;
      }
      case 'core': {
        const geo = this.cached(`core:${spec.radius}`, () => new THREE.DodecahedronGeometry(spec.radius, 0));
        const m = this.glass({
          color: bloom ? 0x071c1c : 0x2b5752,
          emissive: bloom ? 0x00cdbd : 0x00947f,
          emissiveIntensity: bloom ? 0.18 : 0.05,
          metalness: 0.72,
          roughness: 0.2,
          opacity: 0.97,
          flatShading: true,
        });
        add(new THREE.Mesh(geo, m), m, m.emissiveIntensity);
        break;
      }
      case 'cage': {
        const geo = this.cached(`cage:${spec.radius}`, () => new THREE.IcosahedronGeometry(spec.radius, 1));
        const m = new THREE.MeshBasicMaterial({
          color: spec.tint === 'teal' && bloom ? 0x7dfff6 : tintHex(spec.tint, look),
          wireframe: true,
          transparent: true,
          opacity: bloom ? 0.16 : 0.3,
          blending: bloom ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false,
        });
        add(new THREE.Mesh(geo, m), m, -1);
        break;
      }
      case 'orbit': {
        const geo = this.cached(`orbit:${spec.radius}`, () => new THREE.TorusGeometry(spec.radius, 0.009, 4, 200));
        const m = new THREE.MeshBasicMaterial({
          color: tintHex(spec.tint, look),
          transparent: true,
          opacity: bloom ? 0.42 : 0.55,
          blending: bloom ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(geo, m);
        // A torus is built in the XY plane; an orbit lies flat, and the caller tilts it.
        ring.rotation.x = Math.PI / 2;
        add(ring, m, -1);
        break;
      }
      case 'halo': {
        const m = new THREE.SpriteMaterial({
          map: this.glowMap(),
          color: tintHex(spec.tint, look),
          transparent: true,
          opacity: spec.strength * (bloom ? 1 : 0.35),
          blending: bloom ? THREE.AdditiveBlending : THREE.NormalBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(m);
        sprite.scale.set(spec.size, spec.size, 1);
        add(sprite, m, -1);
        break;
      }
    }

    this.attach(node, parent);
    return node;
  }

  light(tint: Tint, intensity: number, distance: number): GLLight {
    // Created at zero: an act turns its light up as it arrives, and a light that is
    // present but dark costs no recompile when it comes on.
    const light = new THREE.PointLight(tintHex(tint, this.look), 0, distance, 2);
    this.scene.add(light);
    const base = intensity * (this.look.bloom ? 1 : 0.5);
    return {
      pose: (x, y, z) => {
        light.position.set(x, y, z);
      },
      power: (k) => {
        light.intensity = base * k;
      },
    };
  }

  field(dust: number, shards: number): GLField {
    const look = this.look;
    const sim = new ShardSim(shards);

    if (dust > 0) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(dustPositions(dust), 3));
      const m = new THREE.PointsMaterial({
        color: new THREE.Color(`rgb(${look.dust})`),
        size: DUST_SIZE,
        sizeAttenuation: true,
        map: this.moteMap(),
        transparent: true,
        opacity: look.dustOpacity,
        depthWrite: false,
        blending: look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      this.scene.add(new THREE.Points(geo, m));
      this.dust.push(m);
      this.trash.push(geo, m);
    }

    if (sim.count === 0) return { update: () => sim.step(0, 0) };

    const geo = new THREE.IcosahedronGeometry(SHARD_RADIUS, 0);
    const m = this.glass({
      color: 0xffffff,
      emissive: 0x000000,
      emissiveIntensity: 0,
      metalness: 0.6,
      roughness: 0.2,
      opacity: 1,
      flatShading: true,
    });
    m.transparent = false;
    /*
      Instanced colour only tints the diffuse, and a crystal with no self-light at all
      goes black on the side away from the key. So the shader takes the instance colour
      into its emissive too, at a fraction — each shard glows in its own colour and at
      its own brightness, and none of them glows much.
    */
    const glow = look.bloom ? 0.16 : 0.04;
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        #ifdef USE_COLOR
          totalEmissiveRadiance += vColor.rgb * ${glow.toFixed(3)};
        #endif`
      );
    };
    const mesh = new THREE.InstancedMesh(geo, m, sim.count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Drift and leases can carry a shard anywhere in the corridor.
    mesh.frustumCulled = false;
    const teal = new THREE.Color(tintHex('teal', look));
    const crimson = new THREE.Color(tintHex('crimson', look));
    const colour = new THREE.Color();
    for (let i = 0; i < sim.count; i++) {
      colour.copy(sim.crimson[i] ? crimson : teal).multiplyScalar(sim.bright[i]);
      mesh.setColorAt(i, colour);
    }
    this.scene.add(mesh);
    this.trash.push(geo, m);

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Euler();
    const turn = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    const field = {
      update: (time: number, t: number) => {
        sim.step(time, t);
        for (let i = 0; i < sim.count; i++) {
          const phase = sim.phase[i];
          rotation.set(
            phase + time * sim.tumble[i * 3],
            phase * 1.7 + time * sim.tumble[i * 3 + 1],
            phase * 0.6 + time * sim.tumble[i * 3 + 2]
          );
          turn.setFromEuler(rotation);
          const s = sim.scale[i];
          // Long and narrow: a flake of crystal, not a die.
          scale.set(s * 0.62, s * 1.4, s * 0.62);
          position.set(sim.x[i], sim.y[i], sim.z[i]);
          matrix.compose(position, turn, scale);
          mesh.setMatrixAt(i, matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
    this.fields.push(field);
    return field;
  }

  /* ------------------------------------------------------------- the frame */

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.composer?.setPixelRatio(this.renderer.getPixelRatio());
    this.composer?.setSize(width, height);
  }

  /**
   * Draw the frame through the stage's own camera.
   *
   * The basis is copied rather than rebuilt from a look-at: the stage camera's pointer
   * parallax is a rotation of that basis, and a look-at would quietly drop it — every
   * WebGL object would then sit a few pixels away from the DOM label pinned to it.
   */
  render(cam: Camera): void {
    const { x, y, z } = this.axis;
    x.set(cam.right.x, cam.right.y, cam.right.z);
    y.set(cam.up.x, cam.up.y, cam.up.z);
    // three's camera looks down its own −Z, so its Z axis is the stage's forward, negated.
    z.set(-cam.fwd.x, -cam.fwd.y, -cam.fwd.z);
    this.basis.makeBasis(x, y, z);
    this.camera.quaternion.setFromRotationMatrix(this.basis);
    this.camera.position.set(cam.pos.x, cam.pos.y, cam.pos.z);
    this.camera.updateMatrixWorld();

    /*
      The projection comes straight off the stage camera's focal length and centre, not
      off a field of view: framing shifts the lens and zooms it on narrow screens, and
      an off-axis frustum is the only projection that puts a mesh exactly under the DOM
      label the stage projected for it.
    */
    const k = NEAR / cam.focal;
    this.camera.projectionMatrix.makePerspective(
      -cam.cx * k,
      (cam.width - cam.cx) * k,
      cam.cy * k,
      -(cam.height - cam.cy) * k,
      NEAR,
      FAR
    );
    this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();
    // A point sprite is sized off the viewport height, not the projection, so it is
    // zoomed by hand to stay the size the 2D field draws it.
    for (const m of this.dust) m.size = DUST_SIZE * cam.zoom;

    for (const root of this.roots) root.apply(1);

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    // Detach first: disposing the renderer loses the context on purpose, and that must
    // not read as a failure and send the next build to the CSS stage.
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    for (const geo of this.geometries.values()) geo.dispose();
    for (const item of this.trash) item.dispose();
    this.glow?.dispose();
    // The composer frees its own buffers but not its passes, and bloom holds a chain of
    // render targets that would otherwise outlive every theme switch.
    for (const pass of this.composer?.passes ?? []) pass.dispose();
    this.composer?.dispose();
    const context = this.renderer.getContext();
    this.renderer.dispose();
    /*
      Hand the context straight back rather than waiting for GC: a theme switch builds
      a new stage at once, and browsers cap live contexts. Through the raw context, not
      three's forceContextLoss — dispose() has just cleared the extension cache that
      goes through — and not at all if the GPU has already taken it.
    */
    if (!context.isContextLost()) context.getExtension('WEBGL_lose_context')?.loseContext();
    this.canvas.remove();
  }

  /* --------------------------------------------------------------- helpers */

  private attach(node: Node, parent?: GLNode): void {
    if (parent) {
      const owner = parent as Node;
      owner.obj.add(node.obj);
      owner.children.push(node);
    } else {
      this.scene.add(node.obj);
      this.roots.push(node);
    }
  }

  private cached<G extends THREE.BufferGeometry>(key: string, make: () => G): G {
    let geo = this.geometries.get(key) as G | undefined;
    if (!geo) {
      geo = make();
      this.geometries.set(key, geo);
    }
    return geo;
  }

  private glowMap(): THREE.Texture {
    if (!this.glow) this.glow = glowTexture();
    return this.glow;
  }

  private mote: THREE.Texture | null = null;
  private moteMap(): THREE.Texture {
    if (!this.mote) {
      this.mote = moteTexture();
      this.trash.push(this.mote);
    }
    return this.mote;
  }

  /**
   * The crystal material. Physical with a clearcoat on the high tier — a second
   * specular lobe over the body, which is the whole difference between a coloured
   * solid and a piece of glass — and standard everywhere else, which carries the same
   * colour, metal and roughness at a fraction of the shading cost.
   *
   * Never transmissive. Transmission renders the scene again into a buffer every
   * frame any transmissive object is on screen; it is the single most expensive
   * switch in three, and the reference's 0.12 of it was not visible.
   */
  private glass(p: {
    color: number;
    emissive: number;
    emissiveIntensity: number;
    metalness: number;
    roughness: number;
    opacity: number;
    flatShading?: boolean;
  }): THREE.MeshStandardMaterial {
    const shared = {
      color: p.color,
      emissive: p.emissive,
      emissiveIntensity: p.emissiveIntensity,
      metalness: p.metalness,
      roughness: p.roughness,
      transparent: true,
      opacity: p.opacity,
      flatShading: p.flatShading ?? false,
      side: THREE.FrontSide,
    };
    if (this.physical) {
      return new THREE.MeshPhysicalMaterial({
        ...shared,
        clearcoat: 0.6,
        clearcoatRoughness: 0.12,
      });
    }
    return new THREE.MeshStandardMaterial(shared);
  }
}
