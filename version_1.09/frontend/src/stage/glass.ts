/**
 * The stage's material.
 *
 * Everything here is meant to be cut from one piece of glass, and this is where that
 * glass is defined — once, so a card in the corridor, a facet of a project crystal, a
 * turbine blade and a certificate tile are all lit by the same key from the same
 * direction. Before this file each act mixed its own gradient, and the world read as a
 * set of flat coloured panels that happened to share a palette.
 *
 * It is all background gradients, and that is the constraint the whole file is built
 * around. No `filter`, no `backdrop-filter`, no blurred `box-shadow`: those are paint,
 * and paint on an element the loop is transforming is paid for every frame it moves.
 * A gradient is rasterised once when the element is built and composited for the rest
 * of its life, so an object can be as glassy as it likes and still cost a scrolling
 * frame nothing. Softness that would otherwise want a blur is drawn as a radial
 * gradient instead, which the rasteriser gives away free.
 *
 * Depth is the other half of looking like glass. A gradient on a flat div reads as a
 * painted highlight rather than as a solid, so `slab` gives a flat object — a card, a
 * tile, a frame — the rest of its solid: a back face and a wall standing on every edge
 * of its outline, each one a real plane in the object's own preserve-3d group. The
 * solids that turn right round — the mark, the skills core, the crystals — are built
 * by css3d.ts, which also relights them every frame.
 */

import { el, q } from './dom';
import type { WorldLook } from './look';

/**
 * Where the key light is, as a CSS gradient angle: high and to the left, in front.
 *
 * Every specular on the stage is struck from this one number. That is the entire
 * reason objects from different acts look like they belong in the same room — light
 * that disagrees about its own direction reads as decoration rather than as light.
 */
export const KEY_DEG = 143;
/** The opposite corner, where a pane's own colour pools and the shadow gathers. */
export const SHADE_DEG = KEY_DEG + 180;

/** Void can carry a white highlight; over Studio's near-white ground it would vanish. */
function keyStrength(look: WorldLook): number {
  return look.bloom ? 1 : 0.62;
}

/**
 * A pane of glass — the surface every flat object on the stage is made of.
 *
 * Four layers, in the order light actually arrives: the specular where the key lands,
 * the lit edge falling away from it, the body tint gathering toward the far corner,
 * and a bounce along the bottom so the unlit side reads as glass in shadow rather than
 * as a hole cut in the world.
 *
 * Returns a `background-image` only. Put the opaque fill underneath it in
 * `background-color`, so the gradients have something to be glass *over*.
 */
export function glassPane(look: WorldLook, rgb: string, strength = 1): string {
  const s = keyStrength(look) * strength;
  const dark = look.bloom ? '0,0,0' : '86,104,101';
  return [
    `radial-gradient(ellipse 62% 44% at 20% 12%, rgba(255,255,255,${(0.3 * s).toFixed(3)}) 0%,` +
      ` rgba(255,255,255,${(0.07 * s).toFixed(3)}) 46%, rgba(255,255,255,0) 78%)`,
    `linear-gradient(${KEY_DEG}deg, rgba(255,255,255,${(0.22 * s).toFixed(3)}) 0%,` +
      ` rgba(255,255,255,0) 27%)`,
    `linear-gradient(${SHADE_DEG}deg, rgba(${rgb},${(0.24 * s).toFixed(3)}) 0%,` +
      ` rgba(${rgb},0) 56%)`,
    `linear-gradient(0deg, rgba(${dark},${(0.22 * s).toFixed(3)}) 0%, rgba(${dark},0) 34%)`,
  ].join(',');
}

/**
 * The lit rim of a pane: an accent edge that runs white where the key strikes it and
 * falls into shadow at the far corner, instead of being one flat colour all the way
 * round. A rim that is equally bright on every side is the clearest single tell that
 * something is a rectangle rather than an object.
 *
 * Returns a `background-image`; the accent itself goes in `background-color`.
 */
export function rimSheen(look: WorldLook): string {
  const s = keyStrength(look);
  return (
    `linear-gradient(${KEY_DEG}deg, rgba(255,255,255,${(0.9 * s).toFixed(3)}) 0%,` +
    ` rgba(255,255,255,${(0.22 * s).toFixed(3)}) 18%, rgba(255,255,255,0) 42%,` +
    ` rgba(0,0,0,0) 58%, rgba(0,0,0,${(0.5 * s).toFixed(3)}) 100%)`
  );
}

/** The facet's body: the glass's own colour, deepening along its length. */
export function facetBody(look: WorldLook, rgb: string, key: number, angle: number): string {
  const deep = look.bloom ? '0,0,0' : '116,136,134';
  return (
    `linear-gradient(${q(angle)}deg, rgba(${rgb},${(key * 0.6).toFixed(3)}) 0%,` +
    ` rgba(${rgb},${(key * 0.3).toFixed(3)}) 52%,` +
    ` rgba(${deep},${look.bloom ? 0.48 : 0.2}) 100%)`
  );
}

/**
 * A line, as a round filament rather than a flat ribbon.
 *
 * Every line on the stage is a one-pixel div scaled to length, and a solid fill makes
 * it read as exactly that. A cross-section ramp — colour at the outside, a hot core
 * down the middle — is all it takes for the same div to read as a cylinder lit from
 * the front. See LINE_BASE in dom.ts for why the element is tall enough to hold a
 * gradient at all.
 */
export function filament(rgb: string, look: WorldLook): string {
  const core = look.bloom ? 'rgba(255,255,255,0.92)' : `rgba(${rgb},1)`;
  const mid = look.bloom ? 0.5 : 0.62;
  return (
    `linear-gradient(180deg, rgba(${rgb},0) 0%, rgba(${rgb},${mid.toFixed(2)}) 28%,` +
    ` ${core} 50%, rgba(${rgb},${mid.toFixed(2)}) 72%, rgba(${rgb},0) 100%)`
  );
}

/**
 * A pane's reflection: the sky the glass is standing under, as one soft diagonal
 * sweep across the top corner. Used where a surface carries an image — a gallery
 * work, an arcade thumbnail — because there the highlight is the only thing saying
 * the picture is behind glass rather than printed on air.
 */
export function reflection(look: WorldLook): string {
  const s = keyStrength(look);
  return (
    `linear-gradient(${KEY_DEG - 18}deg, rgba(255,255,255,${(0.26 * s).toFixed(3)}) 0%,` +
    ` rgba(255,255,255,${(0.07 * s).toFixed(3)}) 14%, rgba(255,255,255,0) 34%,` +
    ` rgba(255,255,255,0) 100%)`
  );
}

/** The dark interior a slab is cut from, per world. */
export function bodyRgb(look: WorldLook): string {
  return look.bloom ? '10,20,22' : '176,192,189';
}

/** The key, as a direction on the screen (y down): up and to the left, from KEY_DEG. */
const KEY_2D: [number, number] = [
  -Math.sin((KEY_DEG * Math.PI) / 180),
  Math.cos((KEY_DEG * Math.PI) / 180),
];

export interface SlabOptions {
  /** The colour the walls' lit front edge takes, as "r,g,b". White when omitted. */
  tint?: string;
  /** Paints a front face at z = 0 as well, under whatever the caller puts there. */
  front?: string;
  /** How opaque the walls are. Glass cards want to be seen into; frames do not. */
  alpha?: number;
}

/**
 * The rest of a flat object's solid: its back face and a wall on every edge.
 *
 * `outline` is the silhouette in fractions of the object's box (0..1, y down) — the
 * same numbers its clip-path is written from, so the walls stand exactly on the edge
 * the face is cut to. The walls run from the front plane (z = 0) back `depth` pixels,
 * and the back face closes the solid there, turned to look backwards.
 *
 * Every wall is one element: stood on its edge by `rotateZ`, folded back into the
 * screen by `rotateX(-90deg)`, and culled when it turns away, so a card seen square on
 * costs the browser nothing extra, and a card seen at an angle shows exactly the sides
 * a real one would. The walls take their light once, from which way their outward
 * normal points against the key: the top-left edges catch it, the bottom-right ones
 * fall into shadow — the same key every gradient on the stage is struck from.
 *
 * The parent must be a preserve-3d group whose box is the object's box.
 */
export function slab(
  parent: HTMLElement,
  outline: Array<[number, number]>,
  width: number,
  height: number,
  depth: number,
  look: WorldLook,
  opts: SlabOptions = {}
): HTMLElement {
  const group = el('div', 'pz3-slab', parent);
  const body = bodyRgb(look);
  const tint = opts.tint ?? '255,255,255';
  const alpha = opts.alpha ?? 0.94;
  const s = keyStrength(look);

  let pts = outline.map(([x, y]) => [x * width, y * height] as [number, number]);
  // rotateX(-90deg) turns a wall's face toward its edge's left-hand side, which is the
  // outside only for an outline wound anticlockwise on screen. Wind it that way.
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    area += x1 * y2 - x2 * y1;
  }
  if (area > 0) pts = pts.slice().reverse();

  if (opts.front) {
    const front = el('div', 'pz3-slab-front', group);
    front.style.clipPath = clipOf(outline);
    front.style.background = opts.front;
  }

  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 0.5) continue;
    const angle = Math.atan2(by - ay, bx - ax);
    // The outward normal, on the screen: the edge's direction turned a quarter.
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const lit = Math.max(0, nx * KEY_2D[0] + ny * KEY_2D[1]);
    const k = 0.3 + 0.7 * lit;
    const wall = el('div', 'pz3-slab-wall', group);
    // A pixel over at each end, so neighbouring walls close their corner.
    wall.style.width = q(len + 1) + 'px';
    wall.style.height = q(depth) + 'px';
    wall.style.backgroundColor = `rgba(${body},${alpha.toFixed(3)})`;
    // Down the wall is back into the object: the lit front edge falls into the body.
    wall.style.backgroundImage =
      `linear-gradient(180deg, rgba(${tint},${(0.75 * k * s).toFixed(3)}) 0%,` +
      ` rgba(${tint},${(0.22 * k * s).toFixed(3)}) 34%, rgba(${tint},0) 70%),` +
      `linear-gradient(0deg, rgba(0,0,0,${((1 - k) * (look.bloom ? 0.55 : 0.28)).toFixed(3)}),` +
      ` rgba(0,0,0,${((1 - k) * (look.bloom ? 0.55 : 0.28)).toFixed(3)}))`;
    wall.style.transform =
      `translate3d(${q(ax)}px,${q(ay)}px,0) rotateZ(${q((angle * 180) / Math.PI)}deg)` +
      ' translateX(-0.5px) rotateX(-90deg)';
  }

  /*
    The back, turned to look backwards. The turn mirrors it left to right, so its
    outline is drawn mirrored to land back on the walls.
  */
  const back = el('div', 'pz3-slab-back', group);
  back.style.transform = `translateZ(${q(-depth)}px) rotateY(180deg)`;
  back.style.clipPath = clipOf(outline.map(([x, y]) => [1 - x, y] as [number, number]));
  back.style.backgroundColor = `rgba(${body},${alpha.toFixed(3)})`;
  back.style.backgroundImage =
    `linear-gradient(${SHADE_DEG}deg, rgba(${tint},${(0.12 * s).toFixed(3)}) 0%, rgba(${tint},0) 60%)`;
  return group;
}

/** An outline in fractions of its box, as the clip-path that cuts a face to it. */
export function clipOf(outline: Array<[number, number]>): string {
  return (
    'polygon(' +
    outline.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(',') +
    ')'
  );
}

/** A rectangle's outline, for the slabs that are plain boxes. */
export const RECT: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
