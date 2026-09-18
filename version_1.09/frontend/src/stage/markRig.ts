/**
 * The monogram, as a solid — on either renderer.
 *
 * Act 01 opens on it and act 09 closes on it, so it is built here once and posed by
 * both. The act says where the mark is, how it is turned, how far the crimson layer
 * has split from the teal one and how strongly the key is sweeping across it; this
 * builds the thing that is posed.
 *
 * On WebGL it is the extruded mesh: a real bevel, a clearcoat, and a white point light
 * on a slow orbit whose reflection travels across the facets. On CSS it is two faces
 * and a wall standing on every edge of the outline, each wall relit every frame from
 * its own normal — a true extrusion rather than the stack of copies it used to be,
 * which only read as depth from dead ahead.
 *
 * The crimson layer is the logo's own chromatic split, measured from the favicon
 * (shapes.ABERRATION), and on both renderers it is a second solid of its own sitting
 * behind the teal — so as the mark turns you see it as an object, not a shadow.
 */

import { newProjected } from './camera';
import { CssNode, CssScene, buildWalls, type Vec } from './css3d';
import { Item, UNIT, el, place, q } from './dom';
import type { BuildContext, Frame } from './engine';
import type { GLLight, GLNode } from './gl/api';
import { glowGradient, TEAL_RGB } from './look';
import { ABERRATION, MARK, markMaskUri, markOutlines, markSvg } from './shapes';

export interface MarkPose {
  x: number;
  y: number;
  z: number;
  /** XYZ Euler, radians — the WebGL stage's convention, and css3d's. */
  rx: number;
  ry: number;
  rz: number;
  scale: number;
  fade: number;
  /** Multiplier on the logo's own aberration: 1 is in register, as the favicon has it. */
  split: number;
  /** How much further back than usual the crimson layer sits, in world units. */
  splitDepth: number;
  rearOpacity: number;
  /** Where the glow hangs, and how strongly. */
  glowY: number;
  glowZ: number;
  glow: number;
  /** The glow's size, as a multiple of the size it was built at. */
  glowScale: number;
  /** How hard the glass glows from inside, as a multiple of its resting value. */
  shine: number;
  /** 0–1: how hard the travelling key catches the face. */
  sheen: number;
  /** The key's position on its orbit, radians. */
  sweep: number;
  /** Paint order for the CSS path — the mark's own and its glow's. */
  order: number;
}

export interface MarkRig {
  update(f: Frame, pose: MarkPose): void;
  hide(): void;
}

/** Where the crimson solid sits relative to the teal one, at a given split. */
function rearOffset(split: number, splitDepth: number): Vec {
  return [ABERRATION.world[0] * split, ABERRATION.world[1] * split, -(0.16 + splitDepth)];
}

export function buildMark(
  ctx: BuildContext,
  root: HTMLElement,
  glow: { size: number; peak: number }
): MarkRig {
  return ctx.gl ? glMark(ctx, glow) : cssMark(ctx, root, glow);
}

/* ------------------------------------------------------------------ WebGL */

function glMark(ctx: BuildContext, glow: { size: number; peak: number }): MarkRig {
  const gl = ctx.gl!;
  const group: GLNode = gl.node();
  const front = gl.solid({ kind: 'mark', layer: 'front' }, group);
  const rear = gl.solid({ kind: 'mark', layer: 'rear' }, group);
  // Not a child of the mark: a glow does not turn with the thing it surrounds.
  const halo = gl.solid({ kind: 'halo', size: glow.size, tint: 'teal', strength: glow.peak * 0.42 });
  const key: GLLight = gl.light('white', 3.2, 9);

  return {
    update(_f, m) {
      group.show(true);
      group.pose(m.x, m.y, m.z, m.rx, m.ry, m.rz);
      group.size(m.scale);
      group.fade(m.fade);
      front.shine(m.shine);
      rear.shine(m.shine);
      const [dx, dy, dz] = rearOffset(m.split, m.splitDepth);
      rear.pose(dx, dy, dz);
      rear.fade(m.rearOpacity / 0.85);

      halo.show(true);
      halo.pose(m.x, m.glowY, m.glowZ);
      halo.size(m.glowScale);
      halo.fade(m.glow * m.fade);

      // The key rides a slow orbit in front of the mark, so its reflection crosses the
      // face and runs off the edge — the one white thing this act is allowed. The orbit
      // is sized to the mark, so a small mark is swept by the same share of light.
      key.pose(
        m.x + Math.cos(m.sweep) * 2.6 * m.scale,
        m.y + Math.sin(m.sweep * 0.7) * 1.7 * m.scale,
        m.z + 3.2 * m.scale
      );
      key.power(m.sheen * m.fade);
    },
    hide() {
      group.show(false);
      halo.show(false);
      key.power(0);
    },
  };
}

/* -------------------------------------------------------------------- CSS */

/**
 * One extruded copy of the mark: its face, its back, and the walls between them. The
 * face is the logo's own SVG — a cut edge stroked round it, where glass is brightest —
 * and the walls take the body colour and are relit from their normals every frame.
 */
function cssSolid(
  parent: CssNode,
  front: string,
  back: string,
  edge: string,
  wall: (n: Vec) => string
): { node: CssNode; face: HTMLElement; parts: HTMLElement[] } {
  const node = new CssNode(parent);
  const half = (MARK.depth / 2) * UNIT;
  const w = MARK.width * UNIT;
  const h = MARK.height * UNIT;

  const faceEl = el('div', 'pz3-mark-face pz3-cull', node.el);
  faceEl.style.width = w + 'px';
  faceEl.style.height = h + 'px';
  faceEl.innerHTML = markSvg(front, edge);
  faceEl.style.transform = `translate3d(-50%,-50%,${q(half)}px)`;

  const backEl = el('div', 'pz3-mark-face pz3-cull', node.el);
  backEl.style.width = w + 'px';
  backEl.style.height = h + 'px';
  backEl.innerHTML = markSvg(back);
  backEl.style.transform = `translate3d(-50%,-50%,${q(-half)}px) rotateY(180deg)`;

  for (const outline of markOutlines()) buildWalls(node, outline, MARK.depth, wall);

  const parts = [faceEl, backEl, ...Array.from(node.el.querySelectorAll<HTMLElement>('.pz3-poly-wall'))];
  return { node, face: faceEl, parts };
}

function cssMark(ctx: BuildContext, root: HTMLElement, glow: { size: number; peak: number }): MarkRig {
  const look = ctx.look;
  const p = newProjected();

  /* The glow behind the mark: soft teal, as one gradient. */
  const glowEl = el('div', 'pz3 pz3-glow', root);
  glowEl.style.width = glowEl.style.height = glow.size * UNIT + 'px';
  glowEl.style.backgroundImage = glowGradient(TEAL_RGB, glow.peak);
  const glowItem = new Item(glowEl);

  const scene = new CssScene(root, 'pz3-markbox');
  const box = new Item(scene.outer);

  const tealWall = (n: Vec) => {
    // The body colour, a touch deeper on the walls than on the face. The lit overlay
    // does the shading; this only has to be the colour the glass is.
    void n;
    return look.bloom
      ? 'linear-gradient(180deg, rgba(0,190,162,0.95), rgba(0,120,104,0.95))'
      : 'linear-gradient(180deg, rgba(0,148,127,0.95), rgba(0,104,90,0.95))';
  };
  const crimsonWall = () =>
    look.bloom
      ? 'linear-gradient(180deg, rgba(253,33,85,0.92), rgba(160,14,50,0.92))'
      : 'linear-gradient(180deg, rgba(215,15,65,0.9), rgba(150,8,44,0.9))';

  // Rear first, so on a tie in depth the teal face wins.
  const rear = cssSolid(
    scene,
    look.bloom ? '#fd2155' : '#d70f41',
    look.bloom ? '#8e0f30' : '#a50a33',
    look.bloom ? 'rgba(255,190,205,0.85)' : 'rgba(120,0,30,0.6)',
    crimsonWall
  );
  const front = cssSolid(
    scene,
    look.glass,
    look.bloom ? '#006b5c' : '#00735f',
    look.bloom ? 'rgba(226,255,250,0.9)' : 'rgba(0,60,50,0.6)',
    tealWall
  );

  /*
    The white in this act. The mark's own colour is the logo's teal and crimson, so the
    only thing allowed to be white is the key — a highlight travelling across the face
    and off the edge. Masked to the mark's own silhouette, so it can only ever land ON
    the glyph and never hang beside it like a lamp.
  */
  const sheen = el('div', 'pz3-mark-sheen', front.face);
  sheen.style.maskImage = markMaskUri();
  sheen.style.webkitMaskImage = markMaskUri();
  const blob = el('div', 'pz3-mark-sheen-blob', sheen);
  blob.style.width = blob.style.height = q(1.9 * UNIT) + 'px';
  blob.style.backgroundImage = glowGradient('255,255,255', 0.85);

  let rearOpacity = -1;

  return {
    update(f, m) {
      const { cam } = f;
      cam.project(m.x, m.y, m.z, p);
      if (box.show(p.visible)) {
        box.transform(place(p.x, p.y, p.scale * m.scale));
        box.opacity(m.fade * p.fog);
        box.order(m.order);
        // The camera's real distance in the element's own units — which the placement
        // scale has shrunk, so it is divided back out.
        scene.outer.style.setProperty('--pz3-persp', q((p.depth * UNIT) / m.scale) + 'px');
        scene.pose(0, 0, 0, m.rx, m.ry, m.rz);
        const [dx, dy, dz] = rearOffset(m.split, m.splitDepth);
        rear.node.pose(dx, dy, dz);
        scene.commitView(cam);

        // Opacity goes on the rear's faces, never on its node: opacity on anything
        // inside a preserve-3d context flattens it into a picture of itself.
        const want = Math.round(m.rearOpacity * 100) / 100;
        if (want !== rearOpacity) {
          rearOpacity = want;
          for (const part of rear.parts) part.style.opacity = String(want);
        }

        // The key's orbit, read on the mark's own face: it crosses and leaves.
        blob.style.transform =
          `translate3d(${q(Math.cos(m.sweep) * 3.2 * UNIT * 0.42)}px,` +
          `${q(-Math.sin(m.sweep * 0.7) * 2.0 * UNIT * 0.42)}px,0) translate(-50%,-50%)`;
        sheen.style.opacity = ((look.bloom ? 0.62 : 0.34) * m.sheen).toFixed(3);
      }

      cam.project(m.x, m.glowY, m.glowZ, p);
      if (glowItem.show(p.visible && m.glow > 0.002)) {
        glowItem.transform(place(p.x, p.y, p.scale * m.glowScale));
        glowItem.opacity(m.fade * m.glow * look.glow * p.fog);
        glowItem.order(m.order - 200);
      }
    },
    hide() {
      box.show(false);
      glowItem.show(false);
    },
  };
}
