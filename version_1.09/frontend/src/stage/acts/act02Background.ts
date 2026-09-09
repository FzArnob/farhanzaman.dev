/**
 * Act 02 — The Spine.
 *
 * Time becomes depth: a block's Z is its date, so the corridor you fly down is a
 * timeline you travel, and education and experience are visibly simultaneous — the one
 * thing two stacked HTML timelines cannot show. You arrive at *now* at the near end and
 * stop there. The present is the destination.
 *
 * Nothing here is a perfect rectangle. Every block is a quadrilateral with jittered
 * corners and one chamfered corner, seeded from Math.random at build, so the corridor
 * is recognisably the same place on every load without being the same drawing.
 *
 * The one thing this rendering gains over the WebGL one: a block's text is text. It
 * was a canvas texture before, redrawn per block per layout and invisible to everything
 * that reads a page. Here the institute, the role, the dates and the description are
 * real DOM, laid out to the same proportions the texture used — so the corridor is
 * indexable and a screen reader gets it for free, and the type is resolution
 * independent instead of being a 768-pixel-wide bitmap stretched across a slab.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q, span } from '../dom';
import { buildSpine, type Slab } from '../data';
import { extrude, filament, glassPane, leafCount, rimSheen } from '../glass';
import { glowGradient, TEAL_RGB } from '../look';
import { blockClip, mulberry } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/** Where the cable and the two rows sit, per orientation. */
interface Layout {
  cableY: number;
  lateral: number;
  above: number;
  below: number;
  width: number;
  height: number;
  minGap: number;
  detailLines: number;
  typeScale: number;
}

/*
  Landscape reads left-and-right of the line; portrait reads above-and-below it.

  That is not a nicety. The field of view is VERTICAL, so a portrait phone has a
  horizontal field under a third of a desktop's — anything placed sideways is simply
  off screen there. Height is the one axis a phone has to spare, so on a phone the
  corridor stacks instead of widening and the camera flies down the gap between the
  two rows.
*/
const LANDSCAPE: Layout = {
  cableY: -0.7,
  lateral: 3.3,
  above: 0.78,
  below: 0.55,
  width: 3.5,
  height: 1.6,
  minGap: 8,
  detailLines: 2,
  typeScale: 1,
};

/*
  Portrait is tuned for the narrowest screen it has to work on — 320 CSS px — rather
  than for a comfortable phone, because a block that is legible at 320 is legible
  everywhere.
*/
const PORTRAIT: Layout = {
  cableY: 0.15,
  lateral: 0.3,
  above: 2.1,
  below: 2.2,
  width: 2.7,
  height: 1.9,
  minGap: 9,
  detailLines: 1,
  typeScale: 1.3,
};

/** How far inside the block's nominal bounds the type sits, in world units. */
const FACE_INSET = 0.3;
/**
 * How many pieces the cable is drawn in. Sixteen is where the taper stops being
 * visibly stepped at the near end, which is the only place the eye can resolve it.
 */
const CABLE_SEGMENTS = 16;
/** A card is a slab of glass this thick, in world units, not a decal. */
const BLOCK_DEPTH = 0.17;
/** The face was authored as a 768-wide texture; the type scale is still read off it. */
const FACE_TEXTURE_WIDTH = 768;

interface Block {
  item: Item;
  turn: HTMLElement;
  x: number;
  y: number;
  roll: number;
  baseYaw: number;
  slab: Slab;
}

/**
 * One line of the card, positioned by the baseline the canvas version used.
 *
 * The original drew four `fillText` calls at fractions of the face height. Those exact
 * fractions are kept, with the baseline turned back into a top offset, so the card is
 * the same card — same rhythm, same hierarchy — without a bitmap in sight.
 */
function line(
  parent: HTMLElement,
  text: string,
  faceH: number,
  size: number,
  baseline: number,
  colour: string,
  weight: string,
  pad: number,
  right: number
): HTMLElement {
  const node = el('div', 'pz3-block-line', parent);
  node.textContent = text;
  const px = faceH * size;
  node.style.fontSize = q(px) + 'px';
  // Titillium sits at roughly 0.78 of its em above the baseline.
  node.style.top = q(faceH * baseline - px * 0.78) + 'px';
  node.style.left = q(pad) + 'px';
  node.style.width = q(right - pad) + 'px';
  node.style.color = colour;
  node.style.fontWeight = weight;
  return node;
}

export function createBackgroundAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.background;
  const root = el('div', 'pz3-act pz3-act-spine', ctx.host);
  const a = newProjected();
  const b = newProjected();
  const look = ctx.look;

  /*
    The cable: one line down the middle of the corridor, and three pulses on it.

    Cut into segments, because a cable is a cylinder and a cylinder has perspective. A
    single rotated div has one width along its whole length, so it has to be given one
    depth's worth of thickness — and the corridor runs from arm's reach to eighty units
    away, which is the difference between a hairline and a slab. Each segment takes the
    thickness and the fog its own depth earns, so the cable tapers away from you the way
    it is supposed to, and the segments behind the camera are simply not drawn.
  */
  const cableSegs = Array.from({ length: CABLE_SEGMENTS }, () => {
    const node = el('div', 'pz3 pz3-line pz3-cable', root);
    node.style.backgroundImage = filament(TEAL_RGB, look);
    return new Item(node);
  });

  const pulses = [0, 1, 2].map(() => {
    const node = el('div', 'pz3 pz3-glow', root);
    node.style.width = node.style.height = 1.3 * UNIT + 'px';
    node.style.backgroundImage = glowGradient(TEAL_RGB, 0.95);
    return new Item(node);
  });

  let layout: Layout = LANDSCAPE;
  let blocks: Block[] = [];
  const holder = el('div', 'pz3-layer', root);

  /**
   * Builds the corridor. Rerun when the layout flips, which is the only time a
   * block's proportions change. Math.random rather than a fixed seed is the whole
   * point: the corridor is re-cut on every load.
   */
  function build(next: Layout): void {
    layout = next;
    holder.textContent = '';
    blocks = [];

    const slabs = buildSpine(ctx.profile.educations, ctx.profile.experiences, layout.minGap);
    const rnd = mulberry(Math.floor(Math.random() * 0xffffffff) || 7);

    slabs.forEach((slab, i) => {
      const education = slab.kind === 'education';
      const side = education ? -1 : 1;
      const accent = education ? '#00d3b4' : look.bloom ? '#fd2155' : '#d70f41';

      // Per-block variation, so the two rows are not two straight lines of clones.
      const wobble = 0.82 + rnd() * 0.36;
      const w = layout.width * (0.94 + rnd() * 0.12);
      const h = layout.height * (0.94 + rnd() * 0.12);
      const clip = blockClip(w, h, rnd);

      const outer = el('div', 'pz3 pz3-block', holder);
      outer.style.width = q(w * UNIT) + 'px';
      outer.style.height = q(h * UNIT) + 'px';
      const turn = el('div', 'pz3-block-3d', outer);

      /*
        The card's thickness, behind everything else on it. A corridor of decals reads
        as a corridor of stickers however well lit they are; the moment a card yaws
        toward you at closest approach, this is the edge that turns with it.
      */
      extrude(turn, clip, BLOCK_DEPTH * UNIT, leafCount(ctx.quality.extrusion), look);

      // Edge wire in the row's colour; a live edge if the role is current.
      const edge = el('div', 'pz3-block-edge', turn);
      edge.style.clipPath = clip;
      edge.style.backgroundColor = accent;
      edge.style.backgroundImage = rimSheen(look);
      edge.style.opacity = slab.present ? '0.95' : '0.5';

      const body = el('div', 'pz3-block-body', turn);
      body.style.clipPath = clip;
      body.style.backgroundColor = look.slab;
      body.style.backgroundImage = glassPane(look, education ? TEAL_RGB : '253,33,85');

      const faceW = (w - FACE_INSET) * UNIT;
      const faceH = (h - FACE_INSET) * UNIT;
      const face = el('div', 'pz3-block-face', turn);
      face.style.width = q(faceW) + 'px';
      face.style.height = q(faceH) + 'px';
      /*
        The scrim. Two gradients rather than a fill: a vertical one for the body and a
        horizontal one that dies off before the right edge, so no side of it ever
        lands as a straight line against the block behind.
      */
      const ink = look.bloom ? '6,12,14' : '255,255,255';
      face.style.backgroundImage =
        `linear-gradient(90deg, rgba(${ink},0.22) 0%, rgba(${ink},0) 62%),` +
        `linear-gradient(180deg, rgba(${ink},${look.bloom ? 0.8 : 0.86}) 0%,` +
        ` rgba(${ink},${look.bloom ? 0.66 : 0.78}) 72%, rgba(${ink},0) 100%)`;

      const pad = Math.round(faceW * 0.075);
      const right = faceW - pad;
      const s = (n: number) => n * layout.typeScale;
      const texel = faceW / FACE_TEXTURE_WIDTH;

      // The accent rule, inset so it reads as part of the card rather than the block edge.
      const rule = el('div', 'pz3-block-rule', face);
      rule.style.left = q(pad - faceW * 0.028) + 'px';
      rule.style.top = q(faceH * 0.16) + 'px';
      rule.style.width = q(6 * texel) + 'px';
      rule.style.height = q(faceH * 0.5) + 'px';
      rule.style.background = accent;

      line(face, slab.title, faceH, s(0.155), 0.29, look.ink, '600', pad, right);
      line(face, slab.role, faceH, s(0.105), 0.425, accent, '600', pad, right);
      const dates = line(
        face,
        slab.dates + (slab.present ? '  ●' : ''),
        faceH,
        s(0.085),
        0.54,
        look.bloom ? '#9db0ac' : '#5c6a67',
        '400',
        pad,
        right
      );
      dates.classList.add('pz3-block-mono');

      const detail = slab.detail.trim();
      if (layout.detailLines > 0 && detail) {
        const node = line(
          face,
          detail,
          faceH,
          s(0.082),
          0.66,
          look.bloom ? '#b9c6c3' : '#3d4a48',
          '400',
          pad,
          right
        );
        node.classList.add('pz3-block-detail');
        node.style.height = q(faceH * s(0.105) * layout.detailLines) + 'px';
        node.style.lineHeight = q(faceH * s(0.105)) + 'px';
        node.style.setProperty('--pz3-lines', String(layout.detailLines));
      }

      blocks.push({
        item: new Item(outer),
        turn,
        x: side * layout.lateral * wobble,
        y: layout.cableY + (education ? layout.above : -layout.below) * wobble,
        // A slight roll, alternating, so they read as floating rather than mounted.
        roll: (rnd() - 0.5) * 0.12 + (i % 2 ? 0.03 : -0.03),
        baseYaw: education ? 0.42 : -0.42,
        slab,
      });
    });
  }

  // One threshold, not a curve: the two layouts are different arrangements rather than
  // two ends of a scale, so there is nothing sensible to interpolate between.
  const wanted = (w: number, h: number) => (w / Math.max(1, h) < 1.1 ? PORTRAIT : LANDSCAPE);
  build(wanted(window.innerWidth, window.innerHeight));

  return {
    root,

    resize(width, height) {
      const next = wanted(width, height);
      if (next !== layout) build(next);
    },

    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.04, 0.04);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time } = f;
      const { zNear, zFar } = WORLD.background;
      const mid = (zNear + zFar) / 2;
      const half = (Math.abs(zNear - zFar) + 6) / 2;

      /* ---- the cable ---- */
      const zA = mid - half;
      const zB = mid + half;
      for (let i = 0; i < cableSegs.length; i++) {
        const seg = cableSegs[i];
        const z0 = zA + ((zB - zA) * i) / CABLE_SEGMENTS;
        const z1 = zA + ((zB - zA) * (i + 1)) / CABLE_SEGMENTS;
        if (!cam.segment(0, layout.cableY, z0, 0, layout.cableY, z1, a, b)) {
          seg.show(false);
          continue;
        }
        seg.show(true);
        /*
          0.028 units across, the cylinder's own diameter, at this segment's own scale.
          The nearer end is the min of the two: a segment clipped against the near plane
          reports an enormous scale there, and taking the max of the pair is what used
          to turn the last few units of cable into a slab across the middle of the act.
          The ceiling is the belt to that brace — a cable is never thicker than this,
          however close the camera gets to it.
        */
        const thick = Math.min(6, Math.max(1, 0.028 * Math.min(a.scale, b.scale)));
        seg.transform(span(a.x, a.y, b.x, b.y, thick));
        seg.opacity(presence * 0.5 * Math.max(a.fog, b.fog));
        seg.order(1);
      }

      /* ---- pulses travelling toward you: the present is drawing closer ---- */
      for (let i = 0; i < pulses.length; i++) {
        const u = (time * 0.19 + i / pulses.length) % 1;
        cam.project(0, layout.cableY, zFar + (zNear - zFar) * u, a);
        if (!pulses[i].show(a.visible)) continue;
        pulses[i].transform(place(a.x, a.y, a.scale));
        pulses[i].opacity(presence * 0.9 * Math.sin(u * Math.PI) * f.look.glow * a.fog);
        pulses[i].order(2);
      }

      /* ---- the blocks ---- */
      const camZ = cam.pos.z;
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        /*
          Each block turns to face you at closest approach and falls back after. That
          is what makes the pass readable: held at a fixed yaw a block is either edge
          on for most of the fly-past, or never angled at all.
        */
        const dist = Math.abs(camZ - block.slab.z);
        const near = clamp01(1 - dist / 13);
        // A slow bob, phase-shifted per block, so the corridor is never quite still.
        const y = block.y + Math.sin(time * 0.5 + i * 1.7) * 0.07 + near * 0.1;

        cam.project(block.x, y, block.slab.z, a);
        if (!block.item.show(a.visible)) continue;
        block.item.transform(place(a.x, a.y, a.scale * (1 + near * 0.07)));
        block.item.opacity(presence * 0.9 * a.fog);
        block.item.order(Math.round(4000 - a.depth * 8));
        block.item.el.style.setProperty('--pz3-persp', q(a.depth * UNIT) + 'px');
        block.turn.style.transform =
          `rotateY(${q((block.baseYaw * (1 - near * 0.9) * 180) / Math.PI)}deg) ` +
          `rotateZ(${q((-block.roll * (1 - near * 0.6) * 180) / Math.PI)}deg)`;
      }
    },
  };
}
