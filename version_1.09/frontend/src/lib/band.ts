/**
 * The dispersion band, with no three.js attached.
 *
 * The DOM overlay needs these colours for its rail, its act numbers and its accent
 * edges. Keeping the maths here rather than in three/materials/palette.ts is what lets
 * the overlay — and therefore the whole app shell — be bundled without three: one
 * `import * as THREE` anywhere in the shell's import graph would pull 900 KB into the
 * chunk that has to paint first.
 *
 * The band runs from the site's teal to the site's crimson the long, cool way round the
 * wheel, which happens to be the order light actually disperses in.
 */

export const BAND_STOPS: readonly (readonly [number, number])[] = [
  [0.0, 0x00d1b3],
  [0.14, 0x12a6e2],
  [0.28, 0x2b7cf5],
  [0.42, 0x6a6bf8],
  [0.56, 0x9a63fb],
  [0.7, 0xc258fd],
  [0.82, 0xef4ae8],
  [0.92, 0xfd47a6],
  [1.0, 0xfd2159],
];

function mix(a: number, b: number, u: number): number {
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const r = Math.round(ar + (br - ar) * u);
  const g = Math.round(ag + (bg - ag) * u);
  const bl = Math.round(ab + (bb - ab) * u);
  return (r << 16) | (g << 8) | bl;
}

/** Numeric colour at a position on the band. */
export function bandValue(band: number): number {
  const x = band < 0 ? 0 : band > 1 ? 1 : band;
  for (let i = 0; i < BAND_STOPS.length - 1; i++) {
    const [p0, c0] = BAND_STOPS[i];
    const [p1, c1] = BAND_STOPS[i + 1];
    if (x <= p1) return mix(c0, c1, p1 === p0 ? 0 : (x - p0) / (p1 - p0));
  }
  return BAND_STOPS[BAND_STOPS.length - 1][1];
}

/** CSS hex at a position on the band. */
export function bandHex(band: number): string {
  return `#${bandValue(band).toString(16).padStart(6, '0')}`;
}
