/**
 * The scroll contract.
 *
 * The whole Prism page is one scroll normalised to `t ∈ [0,1]`. Every animation in
 * the build is a pure function of `t`, which is what makes the site scrubbable and
 * impossible to desynchronise. Both the 3D acts and the DOM overlay read these same
 * numbers, so copy can never drift out of step with the world.
 *
 * Positions in WORLD are the plan's layout: the camera travels down −Z and each act
 * is a place along that axis.
 */

export type ActId =
  | 'prism'
  | 'spine'
  | 'lattice'
  | 'turbine'
  | 'forge'
  | 'constellation'
  | 'gallery'
  | 'sync';

export interface ActSpec {
  id: ActId;
  /** 01–08, the number shown in the rail. */
  index: number;
  name: string;
  /** Which slice of the scroll this act owns. */
  t0: number;
  t1: number;
  /** Position on the dispersion band, 0 = teal … 1 = crimson. */
  band: number;
  /** Deep-link path this act answers to, so old URLs keep working. */
  path: string;
}

export const ACTS: ActSpec[] = [
  { id: 'prism', index: 1, name: 'The Prism', t0: 0.0, t1: 0.1, band: 0.0, path: '/' },
  { id: 'spine', index: 2, name: 'Background', t0: 0.1, t1: 0.24, band: 0.14, path: '/about' },
  { id: 'lattice', index: 3, name: 'Expertise', t0: 0.24, t1: 0.36, band: 0.28, path: '/expertise' },
  { id: 'turbine', index: 4, name: 'Skills', t0: 0.36, t1: 0.44, band: 0.4, path: '/skills' },
  { id: 'forge', index: 5, name: 'Works', t0: 0.44, t1: 0.66, band: 0.56, path: '/works' },
  { id: 'constellation', index: 6, name: 'Achievements', t0: 0.66, t1: 0.78, band: 0.74, path: '/achievements' },
  { id: 'gallery', index: 7, name: 'Hobbies', t0: 0.78, t1: 0.92, band: 0.86, path: '/hobbies' },
  { id: 'sync', index: 8, name: 'Contact', t0: 0.92, t1: 1.0, band: 1.0, path: '/contact' },
];

export const ACT_BY_ID = Object.fromEntries(ACTS.map((a) => [a.id, a])) as Record<ActId, ActSpec>;

/** Where every act physically sits. One axis, one journey. */
export const WORLD = {
  prism: { z: 0 },
  spine: { zNear: -8, zFar: -32, wallX: 6.2 },
  lattice: { z: -48, radius: 5.5 },
  turbine: { z: -62, radius: 4 },
  forge: { z: -84, radius: 14 },
  constellation: { z: -112, spread: 10 },
  gallery: { zNear: -128, zFar: -162, floorY: -3.2, wallX: 9.4 },
  sync: { z: -178 },
} as const;

/**
 * Camera keyframes: piecewise and eased, exact at every keyframe.
 *
 * Deliberately NOT a Catmull-Rom through all of them — arc-length reparameterisation
 * would slide the camera off the keyframe `t` values, and the acts need to know
 * exactly where the camera is at each boundary. The hold between 0.50 and 0.64 is
 * load-bearing: it keeps the camera at the hub of the works ring for the whole of
 * act 05 while the ring turns around it.
 */
export interface CamKey {
  t: number;
  p: readonly [number, number, number];
  l: readonly [number, number, number];
}

export const CAMERA_KEYS: CamKey[] = [
  // Each distance is set from the act's own radius: roughly 2.5x, so the object
  // reads at about half the frame height and the copy column stays clear of it.
  { t: 0.0, p: [0, 0.25, 7.4], l: [0, 0, 0] }, // 01 the prism, dead ahead
  { t: 0.08, p: [2.1, 0.7, 3.8], l: [0, 0, -1] }, // drift past it
  { t: 0.14, p: [0.4, 0.45, -5], l: [0, 0, -14] }, // 02 into the corridor
  { t: 0.24, p: [0, 0.4, -29], l: [0, 0, -40] }, // arrive at "now"
  { t: 0.29, p: [0, 0.6, -30], l: [0, 0, -48] }, // 03 the lattice, 18 ahead
  { t: 0.33, p: [17, 3.2, -48], l: [0, 0, -48] }, // swing around it
  { t: 0.37, p: [0, 0.7, -46], l: [0, 0, -62] }, // 04 turbine, near on-axis
  { t: 0.44, p: [0, 0.4, -68], l: [0, 0, -84] }, // 05 ring approach
  { t: 0.5, p: [0, 0.1, -84], l: [0, 0, -98] }, // at the hub
  { t: 0.64, p: [0, 0.1, -84], l: [0, 0, -98] }, // held while the ring indexes
  { t: 0.7, p: [9, 2.6, -92], l: [0, 0, -102] }, // slip out between two cores
  { t: 0.74, p: [15, 2.2, -100], l: [0, 0, -112] }, // 06 orbit the constellation
  { t: 0.78, p: [-15, 1.4, -100], l: [0, 0, -112] },
  { t: 0.83, p: [0, -1.2, -124], l: [0, -1, -140] }, // 07 the hall — the floor appears
  { t: 0.92, p: [0, -1.2, -152], l: [0, -1, -168] },
  { t: 1.0, p: [0, 0.25, -164], l: [0, 0.4, -178] }, // 08 sync
];

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Smoothstep. Used everywhere so easing is consistent across acts. */
export function smooth(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

/** 0 → 1 across [a,b], eased. The workhorse for act fades. */
export function ramp(t: number, a: number, b: number): number {
  return smooth((t - a) / (b - a));
}

/**
 * How "present" an act is at time t: ramps up over `lead` before t0 and down over
 * `tail` after t1. Acts multiply their opacity by this and skip work when it is 0,
 * which is what keeps peak scene cost flat as content grows.
 */
export function actPresence(t: number, act: ActSpec, lead = 0.03, tail = 0.03): number {
  const inn = ramp(t, act.t0 - lead, act.t0 + lead * 0.5);
  const out = 1 - ramp(t, act.t1 - tail * 0.5, act.t1 + tail);
  return clamp01(inn * out);
}

/** The act that owns a given t. */
export function actAt(t: number): ActSpec {
  for (let i = ACTS.length - 1; i >= 0; i--) if (t >= ACTS[i].t0 - 1e-6) return ACTS[i];
  return ACTS[0];
}

/**
 * Deep links resolve to a t, and the camera flies there instead of cutting.
 * The home path is the one exception: it is the start of the ride, not a jump into it,
 * so it returns exactly 0 and the caller skips the flight entirely.
 */
export function tForPath(pathname: string): number | null {
  const hit = ACTS.find((a) => a.path === pathname);
  if (!hit) return null;
  if (hit.index === 1) return 0;
  // Land just inside the act rather than on its boundary.
  return hit.t0 + (hit.t1 - hit.t0) * 0.18;
}
