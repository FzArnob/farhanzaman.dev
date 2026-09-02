/**
 * The two-pole accent ramp — the site's only colours, with no third hue anywhere.
 *
 * The theme is #00d3b4 and #fd2155 and nothing else. An interpolation between them
 * is a trap: the short way round the wheel passes through yellow and orange, the long
 * way through blue and violet, and a straight RGB lerp collapses to a muddy grey at
 * the midpoint. All three introduce colours that are not the brand.
 *
 * So the ramp snaps to the nearest pole and only blends across a narrow crossover.
 * Every dot, mark, edge and glyph in the build lands on teal or on crimson; the short
 * blend zone exists purely so a gradient bar does not have a hard seam in it.
 *
 * Lives in lib/ with no three.js import: the DOM overlay needs these values, and one
 * `import * as THREE` in the shell's import graph would pull ~900 KB into the chunk
 * that has to paint first.
 */

export const TEAL_HEX = 0x00d3b4;
export const CRIMSON_HEX = 0xfd2155;

/** Where the crossover sits, and how wide it is. */
const MID = 0.5;
const HALF_BLEND = 0.07;

function mix(a: number, b: number, u: number): number {
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  return (
    (Math.round(ar + (br - ar) * u) << 16) |
    (Math.round(ag + (bg - ag) * u) << 8) |
    Math.round(ab + (bb - ab) * u)
  );
}

/**
 * Numeric colour at a position on the ramp. 0 = teal, 1 = crimson.
 * Anything outside the crossover is exactly one of the two brand values.
 */
export function bandValue(x: number): number {
  const t = x < 0 ? 0 : x > 1 ? 1 : x;
  if (t <= MID - HALF_BLEND) return TEAL_HEX;
  if (t >= MID + HALF_BLEND) return CRIMSON_HEX;
  return mix(TEAL_HEX, CRIMSON_HEX, (t - (MID - HALF_BLEND)) / (HALF_BLEND * 2));
}

/** CSS hex at a position on the ramp. */
export function bandHex(x: number): string {
  return `#${bandValue(x).toString(16).padStart(6, '0')}`;
}

/**
 * The pole a value belongs to. Used wherever a colour has to be unambiguous — a
 * label, a status dot, a node — so nothing ever renders in the crossover.
 */
export function poleHex(x: number): string {
  return x < MID ? '#00d3b4' : '#fd2155';
}

export function poleValue(x: number): number {
  return x < MID ? TEAL_HEX : CRIMSON_HEX;
}

/** The literal 50/50 mix, for the one place a "combined" colour is wanted. */
export const BLEND_HEX = `#${mix(TEAL_HEX, CRIMSON_HEX, 0.5).toString(16).padStart(6, '0')}`;
export const BLEND_VALUE = mix(TEAL_HEX, CRIMSON_HEX, 0.5);
