/**
 * Act 03 — Expertise.
 *
 * The flat site's skill canvas was already a rotating 3D tag cloud, so this is that
 * same design, moved into the scene it belongs in: the expertise names on a sphere,
 * always facing you, turning slowly, sized by how long each has been used.
 *
 * Words face the camera by construction here — a `<div>` has no orientation to fight —
 * which is what the WebGL build spent a sprite material on. Hover and drag are the
 * browser's, not a raycaster's: the word under the pointer is the word the pointer is
 * over, because there is a real element there.
 *
 * The cloud is fitted to the frame every frame rather than being a fixed 7-unit
 * sphere. The field of view is vertical, so a portrait phone has barely a quarter of a
 * desktop's horizontal field: a sphere sized for one runs off both sides of the other.
 * The radii are solved per axis from what the camera can actually see, so the names
 * always land inside the viewport with a margin, at any size and either orientation.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { poleHex } from '../../lib/band';
import { cloudState } from '../liveState';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/** Biggest base sprite scale — the widest word the fit has to leave room for. */
const MAX_WORD = 0.92;

/** The word canvas was 512×128 at 74px; those proportions set the type here. */
const LABEL_W = 512;
const LABEL_H = 128;
const LABEL_SIZE = 74;

let measurer: CanvasRenderingContext2D | null = null;

/**
 * Shrink to fit rather than clip: "Business Communication" has to survive.
 *
 * Measured against a 2D context rather than by laying the element out and reading it
 * back, which would be twenty-three forced reflows during build for a number the font
 * metrics already know.
 */
function fittedSize(text: string): number {
  if (!measurer) measurer = document.createElement('canvas').getContext('2d');
  let size = LABEL_SIZE;
  if (measurer) {
    do {
      measurer.font = `600 ${size}px "titillium-font","Titillium Web",system-ui,sans-serif`;
      if (measurer.measureText(text).width <= LABEL_W - 26) break;
      size -= 3;
    } while (size > 22);
  }
  return size;
}

export function createCloudAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.expertise;
  const root = el('div', 'pz3-act pz3-act-cloud', ctx.host);
  const p = newProjected();

  /** Longest duration in the data, so the size scale is relative rather than absolute. */
  const longest = Math.max(1, ...ctx.profile.expertises.map((e) => Number(e.duration) || 0));
  const n = ctx.profile.expertises.length;
  const golden = Math.PI * (3 - Math.sqrt(5));

  const words = ctx.profile.expertises.map((item, i) => {
    // Fibonacci sphere: an even spread at any count, so adding a 24th expertise in the
    // admin editor re-solves the layout instead of leaving a gap.
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const months = Number(item.duration) || 0;
    // sqrt keeps the 3-to-48-month spread from letting one word dominate.
    const weight = Math.sqrt(months / longest);
    // Advanced is the exception, so advanced is the accent: crimson for the handful of
    // them, teal for intermediate and beginner alike. Only ever a pole, never between.
    const advanced = /advanced/i.test(item.level);

    const node = el('div', 'pz3 pz3-word', root);
    node.textContent = item.name;
    node.style.color = poleHex(advanced ? 1 : 0);
    // The 4:1 label, at the size the canvas would have drawn it.
    node.style.width = LABEL_W + 'px';
    node.style.height = LABEL_H + 'px';
    node.style.lineHeight = LABEL_H + 'px';
    const size = fittedSize(item.name);
    node.style.fontSize = size + 'px';
    node.style.setProperty('--pz3-stroke', q(Math.max(4, size * 0.14)) + 'px');

    const index = i;
    node.addEventListener('pointerenter', () => {
      cloudState.hovered = index;
    });
    node.addEventListener('pointerleave', () => {
      if (cloudState.hovered === index) cloudState.hovered = -1;
    });

    return {
      item: new Item(node),
      weight,
      // A point on the UNIT sphere. The radii are solved per frame against the
      // viewport, so the layout cannot bake a size in.
      ux: Math.cos(theta) * r,
      uy: y,
      uz: Math.sin(theta) * r,
      /** Damped on-screen scale, so a hover grows rather than snaps. */
      shown: 0.42 + weight * 0.5,
    };
  });

  cloudState.count = words.length;

  /*
    Drag to spin, tap to read. Horizontal only — on touch a vertical swipe must always
    belong to the page, never to the sphere — and a drag past a few pixels is a spin
    rather than a tap, so letting go over a word does not also select it.
  */
  let drag: { x: number; moved: number } | null = null;
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, moved: 0 };
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag.x = e.clientX;
    drag.moved += Math.abs(dx);
    cloudState.spinVelocity = dx * 0.02;
  };
  const onUp = () => {
    drag = null;
  };
  root.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);

  return {
    root,

    dispose() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    },

    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.04, 0.04);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        // The act owns the pointer only while it is on screen.
        if (root.style.pointerEvents !== 'none') root.style.pointerEvents = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';
      if (root.style.pointerEvents !== 'auto') root.style.pointerEvents = 'auto';

      const { cam, time, delta } = f;

      // Drag momentum, then a slow idle turn — the same 135° drift the flat cloud had.
      cloudState.spin += cloudState.spinVelocity * delta;
      cloudState.spinVelocity *= Math.exp(-delta * 3.2);
      const spinY = cloudState.spin + time * 0.11;
      const tilt = Math.sin(time * 0.14) * 0.16;
      const cosY = Math.cos(spinY);
      const sinY = Math.sin(spinY);
      const cosX = Math.cos(tilt);
      const sinX = Math.sin(tilt);

      const cxw = 0;
      const cyw = WORLD.expertise.y;
      const czw = WORLD.expertise.z;
      const centreDist = Math.hypot(cam.pos.x - cxw, cam.pos.y - cyw, cam.pos.z - czw);

      /*
        The fit. What the camera can see at the cloud's own depth, in world units.

        Type shrinks with the frame but bottoms out at 55%: past that the names stop
        being readable and there is no point fitting them on screen at all. Whatever
        the type ends up as, the radii then reserve room for the widest word, so a name
        centred at the edge of the cloud still lands inside the viewport.

        X and Z share a radius deliberately — the cloud spins about Y, and an ellipse
        that is wider than it is deep would swing outside the frame as it turned.
      */
      const halfH = (cam.height / 2 / cam.focal) * centreDist;
      const halfW = (halfH * cam.width) / cam.height;
      const textScale = Math.max(0.55, Math.min(1, halfW / 7));
      const wordHalfW = MAX_WORD * 2 * textScale;
      const wordHalfH = MAX_WORD * 0.5 * textScale;
      const limit = WORLD.expertise.radius;
      const rx = Math.min(limit, Math.max(1.2, halfW * 0.9 - wordHalfW));
      // Tighter than the sides: the masthead owns the top of the frame and the readout
      // the bottom, and the idle tilt borrows a little height from Z.
      const ry = Math.min(limit, Math.max(1.2, halfH * 0.74 - wordHalfH - 0.45));

      const nearest = centreDist - rx;
      const farthest = centreDist + rx;
      const hovered = cloudState.hovered;
      const k = 1 - Math.exp(-delta * 8);

      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        // Spin about Y, then the idle tilt about X — the group's own two rotations.
        const x0 = w.ux * rx;
        const y0 = w.uy * ry;
        const z0 = w.uz * rx;
        const x1 = x0 * cosY + z0 * sinY;
        const z1 = -x0 * sinY + z0 * cosY;
        const y2 = y0 * cosX - z1 * sinX;
        const z2 = y0 * sinX + z1 * cosX;

        cam.project(cxw + x1, cyw + y2, czw + z2, p);
        if (!w.item.show(p.visible)) continue;

        /*
          The depth fade, measured properly: distance from the camera, remapped across
          the sphere's own diameter. The near hemisphere is fully opaque and the far
          one drops to a fifth, which is what stops the names reading as one solid
          block — and it is the same near/far weighting the flat tag cloud had.
        */
        const front = clamp01(1 - (p.depth - nearest) / Math.max(0.001, farthest - nearest));
        const isHovered = hovered === i;
        const dim = hovered >= 0 && !isHovered ? 0.35 : 1;
        w.item.opacity(presence * (0.18 + front * 0.82) * dim * p.fog);

        const base = (0.42 + w.weight * 0.5) * textScale;
        // The near face grows a little as well, which reads as perspective on type
        // that is technically always facing you.
        const target = base * (0.86 + front * 0.28) * (isHovered ? 1.25 : 1);
        w.shown += (target - w.shown) * k;
        // The label is 128px tall for one world unit of sprite height.
        w.item.transform(place(p.x, p.y, (p.scale * w.shown) / (LABEL_H / UNIT)));
        w.item.order(Math.round(4000 - p.depth * 8));
      }
    },
  };
}
