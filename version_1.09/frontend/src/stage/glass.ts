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
 * painted highlight rather than as a solid, so `extrude` gives a silhouette real
 * thickness by stacking copies of it back along Z inside a preserve-3d group. It is
 * the same trick the monogram in act 01 is built from, generalised: it works on any
 * clip-path, needs no geometry, and the thickness only becomes visible as an object
 * comes close — which is exactly when a real edge would show.
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

/**
 * One facet of a crystal.
 *
 * `key` is the facet's share of the light, decided by which way it is turned; `angle`
 * runs along the facet's length. The first layer is the important one: two hot lines
 * down the facet's long edges, where the glass turns away and the key skims it. That
 * is what makes a prism read as *cut* — without lit edges, six shaded quadrilaterals
 * are just six shaded quadrilaterals.
 */
export function facetPane(look: WorldLook, rgb: string, key: number, angle: number): string {
  const s = keyStrength(look);
  const edge = key * s;
  const deep = look.bloom ? '0,0,0' : '116,136,134';
  return [
    `linear-gradient(90deg, rgba(255,255,255,${(edge * 0.85).toFixed(3)}) 0%,` +
      ` rgba(255,255,255,0) 8%, rgba(255,255,255,0) 92%,` +
      ` rgba(255,255,255,${(edge * 0.6).toFixed(3)}) 100%)`,
    `linear-gradient(${q(angle)}deg, rgba(255,255,255,${(edge * 0.72).toFixed(3)}) 0%,` +
      ` rgba(255,255,255,${(edge * 0.1).toFixed(3)}) 34%, rgba(255,255,255,0) 62%)`,
    `linear-gradient(${q(angle)}deg, rgba(${rgb},${(key * 0.6).toFixed(3)}) 0%,` +
      ` rgba(${rgb},${(key * 0.3).toFixed(3)}) 52%,` +
      ` rgba(${deep},${look.bloom ? 0.48 : 0.2}) 100%)`,
  ].join(',');
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

/**
 * How many leaves an extrusion gets at a given quality.
 *
 * Far fewer than the monogram's stack, deliberately. The mark is deep and permanently
 * turned, so it needs enough copies that the banding between them disappears. A card
 * or a tile is a thin slab that only ever swings through a shallow angle, and there
 * two or three silhouettes already read as a solid edge. Every leaf is a full-area
 * clipped fill, so this number is fill rate — it is the one place in the material
 * where being generous would actually cost a frame.
 */
export function leafCount(extrusion: number): number {
  return Math.max(2, Math.min(4, Math.round(extrusion * 0.28)));
}

/** The dark interior an extrusion is cut from, per world. */
export function bodyRgb(look: WorldLook): string {
  return look.bloom ? '10,20,22' : '176,192,189';
}

/**
 * Gives a flat silhouette thickness, by stacking copies of it back along Z.
 *
 * The caller's element must already be inside a `preserve-3d` group carrying the
 * camera's real distance — then the stack foreshortens correctly, and the thickness
 * only shows as the object turns or comes close, which is when a real edge would show
 * too.
 *
 * The leaves are drawn at low alpha and accumulate into a solid interior, so the count
 * is a quality dial rather than a correctness one: five leaves and fourteen differ in
 * how smooth the edge band is, not in whether the object has one.
 */
export function extrude(
  parent: HTMLElement,
  clip: string,
  depthPx: number,
  layers: number,
  look: WorldLook
): HTMLElement {
  const stack = el('div', 'pz3-extrude', parent);
  const rgb = bodyRgb(look);
  const n = Math.max(2, layers);
  // Enough per leaf to build a solid body at any count, never enough to read as banding.
  const step = 0.62 / n + 0.04;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const leaf = el('div', 'pz3-extrude-leaf', stack);
    if (clip) leaf.style.clipPath = clip;
    // The band darkens with depth, the way the inside of a thick edge does.
    leaf.style.background = `rgba(${rgb},${(1 - k * 0.45).toFixed(3)})`;
    leaf.style.opacity = (step * (look.bloom ? 1 : 0.8)).toFixed(3);
    leaf.style.transform = `translateZ(${q(-k * depthPx)}px)`;
  }
  return stack;
}
