import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { CRIMSON, TEAL } from './palette';

/**
 * Glass presets.
 *
 * Transmission renders the scene to an offscreen buffer per object, so the budget is
 * ONE transmissive object on screen at a time — the prism, or the active project core,
 * or the closing mark. Below the high tier, transmission is swapped for a polished
 * envMap look, which is visually close at a fraction of the cost.
 */

export function prismMaterial(q: Quality, light = false): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    /*
      The mark is teal and crimson — that is the logo, and the glass has to say so.
      It used to be near-colourless (0xdefff9), which under bloom read as a white
      object with a red shadow rather than as the brand mark. The body is now the
      theme teal at full saturation; white belongs to the travelling specular
      highlight and to nothing else, which is what the clearcoat below is for.

      The Studio (light) ground needs the darker teal for the same reason it always
      did: a bright tint over near-white cannot hold an edge.
    */
    color: light ? 0x00947f : TEAL,
    emissive: TEAL,
    // Just enough self-light that the mark never sinks into the void; the lights
    // and the environment still do the shaping.
    emissiveIntensity: light ? 0.06 : 0.22,
    metalness: 0,
    roughness: q.transmission ? 0.04 : 0.09,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    // The one white in the material: the specular sheen that the sweeping key light
    // drags across the facets.
    specularColor: 0xffffff,
    specularIntensity: 1,
    transparent: true,
    side: THREE.DoubleSide,
  });
  if (q.transmission) {
    m.transmission = 1;
    m.thickness = 1.1;
    m.ior = 1.62;
    // Real wavelength dispersion, three r165+. This is the whole metaphor made literal.
    if (q.dispersion && 'dispersion' in m) m.dispersion = 0.7;
  } else {
    // No transmission budget: read the mark as polished glass rather than clear
    // glass. High metalness plus a partial alpha lets the environment carry it.
    m.metalness = light ? 0.55 : 0.4;
    m.envMapIntensity = light ? 1.7 : 2.8;
    m.opacity = light ? 0.86 : 0.66;
  }
  return m;
}

/** The offset crimson layer behind the prism — the aberration, in geometry. */
export function prismRearMaterial(q: Quality): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: CRIMSON,
    emissive: CRIMSON,
    emissiveIntensity: 0.18,
    metalness: 0,
    roughness: 0.14,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  if (q.transmission) {
    m.transmission = 0.82;
    m.thickness = 0.9;
    m.ior = 1.5;
    if (q.dispersion && 'dispersion' in m) m.dispersion = 0.4;
  } else {
    m.metalness = 0.3;
    m.envMapIntensity = 2;
    m.opacity = 0.52;
  }
  return m;
}

/**
 * A project core. Faceted and flat-shaded so the seeded silhouette reads, with the
 * project's media mapped across the facets. Front faces only: DoubleSide plus any
 * transmission shows the inside of the crystal through its own front and the texture
 * arrives mirrored.
 */
export function coreMaterial(q: Quality): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    metalness: 0.2,
    roughness: 0.28,
    envMapIntensity: 1.6,
    flatShading: true,
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide,
  });
  if (q.transmission) {
    m.transmission = 0.1;
    m.thickness = 0.5;
  }
  return m;
}

/** Frosted glass: timeline slabs, certificate tiles, form panels. Never transmissive. */
export function frostMaterial(color = 0x1b2427): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.12,
    envMapIntensity: 1.1,
    transparent: true,
    opacity: 0.9,
  });
}

/**
 * The 256-instance shard pool. One draw call, tinted per instance teal↔crimson.
 *
 * No `vertexColors` here either: it would enable USE_COLOR and multiply by a
 * per-vertex attribute the tetrahedron does not carry, zeroing every shard.
 * instanceColor is set by setColorAt and three defines USE_INSTANCING_COLOR itself.
 */
export function shardMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    roughness: 0.16,
    metalness: 0.35,
    envMapIntensity: 1.4,
    flatShading: true,
    transparent: true,
    opacity: 0.92,
  });
}

/**
 * An additive beam. Used for the spectrum rays, the spine cable and the closing beam.
 * On the light theme these switch to normal blending, because additive over a
 * near-white ground is invisible.
 */
export function beamMaterial(color: number, light: boolean): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    map: beamRamp(),
    alphaMap: beamRamp(),
    transparent: true,
    // Normal blending over white needs full strength to read at all; additive over
    // the void needs restraint or it blows out.
    opacity: light ? 0.85 : 0.45,
    blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

/**
 * A left-to-right alpha ramp. Beams fade out along their length instead of ending
 * at a hard edge, which is what stops them reading as bars laid over the scene.
 */
let rampTexture: THREE.Texture | null = null;

export function beamRamp(): THREE.Texture {
  if (rampTexture) return rampTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 1;
  const g = canvas.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 1);
  rampTexture = new THREE.CanvasTexture(canvas);
  return rampTexture;
}

/** A soft radial sprite, used for every glow in the scene. Cached by colour. */
const glowCache = new Map<string, THREE.Texture>();

export function glowTexture(rgb: string, peak = 0.5): THREE.Texture {
  const key = `${rgb}|${peak}`;
  const hit = glowCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const g = canvas.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},${peak})`);
  grad.addColorStop(0.38, `rgba(${rgb},${peak * 0.26})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  glowCache.set(key, tex);
  return tex;
}

export const TEAL_RGB = '0,211,180';
export const CRIMSON_RGB = '253,33,85';

export function glowSprite(rgb: string, scale: number, peak = 0.5): THREE.Sprite {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(rgb, peak),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      toneMapped: false,
    })
  );
  s.scale.set(scale, scale, 1);
  return s;
}

export { TEAL, CRIMSON };
