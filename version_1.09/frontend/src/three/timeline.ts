/**
 * The scroll contract.
 *
 * The whole site is one scroll normalised to `t ∈ [0,1]`. Every animation is a pure
 * function of `t`, so the world is scrubbable and the copy can never drift out of step
 * with the geometry.
 *
 * The nine acts are the flat site's own sections and pages, one for one — nothing was
 * invented and nothing was left behind:
 *
 *   01 Intro        IntroAnimation      name, designations, intro_text, socials
 *   02 Background   #about-section       educations + experiences + about_text
 *   03 Expertise    #expertise-section   the tag sphere, which was already 3D
 *   04 Skills       SkillBars            12 skills with percentages
 *   05 Achievements Achievements         10 certificates
 *   06 Works        #works-section       the 5 most recent, expandable to all 8
 *   07 Hobbies      #gallery-section     the gallery, expandable to all 11
 *   08 Arcade       GamingPage           Run Fz Run
 *   09 Contact      #contact-section     form, details, footer
 *
 * Plus the SyncBot console, which is resident rather than an act.
 */

export type ActId =
  | 'intro'
  | 'background'
  | 'expertise'
  | 'skills'
  | 'achievements'
  | 'works'
  | 'hobbies'
  | 'arcade'
  | 'contact';

export interface ActSpec {
  id: ActId;
  /** 01–09. */
  index: number;
  /** The flat site's own section name — used in the centre-bottom readout. */
  name: string;
  t0: number;
  t1: number;
  /** 0 = teal pole, 1 = crimson pole. Nothing lands in between. */
  band: number;
  /** Deep-link path, so every existing URL still resolves. */
  path: string;
}

/**
 * Act windows. Wider than eight acts were, because the fades are now sequential —
 * each act's copy has to be fully out before the next starts coming in, which costs
 * dead space at every boundary.
 */
export const ACTS: ActSpec[] = [
  { id: 'intro', index: 1, name: 'Intro', t0: 0.0, t1: 0.1, band: 0, path: '/' },
  { id: 'background', index: 2, name: 'Background', t0: 0.1, t1: 0.23, band: 0, path: '/about' },
  { id: 'expertise', index: 3, name: 'Expertise', t0: 0.23, t1: 0.35, band: 0, path: '/expertise' },
  { id: 'skills', index: 4, name: 'Skills', t0: 0.35, t1: 0.45, band: 0, path: '/skills' },
  { id: 'achievements', index: 5, name: 'Achievements', t0: 0.45, t1: 0.55, band: 1, path: '/achievements' },
  { id: 'works', index: 6, name: 'Works', t0: 0.55, t1: 0.7, band: 1, path: '/works' },
  { id: 'hobbies', index: 7, name: 'Hobbies', t0: 0.7, t1: 0.83, band: 1, path: '/hobbies' },
  { id: 'arcade', index: 8, name: 'Gaming', t0: 0.83, t1: 0.91, band: 1, path: '/gaming' },
  { id: 'contact', index: 9, name: 'Contact', t0: 0.91, t1: 1.0, band: 1, path: '/contact' },
];

export const ACT_BY_ID = Object.fromEntries(ACTS.map((a) => [a.id, a])) as Record<ActId, ActSpec>;

/** Where every act physically sits. One axis, one journey. */
export const WORLD = {
  intro: { z: 0 },
  background: { zNear: -10, zFar: -38, wallX: 7.4 },
  expertise: { z: -56, radius: 7, y: 1.1 },
  skills: { z: -72, radius: 4.4 },
  achievements: { z: -92, spread: 11 },
  works: { z: -118, radius: 15 },
  hobbies: { zNear: -146, zFar: -184, floorY: -3.4, wallX: 7.4 },
  arcade: { z: -196, radius: 14 },
  contact: { z: -216 },
} as const;

export interface CamKey {
  t: number;
  p: readonly [number, number, number];
  l: readonly [number, number, number];
}

/**
 * Camera keyframes: piecewise and eased, exact at every keyframe.
 *
 * Deliberately not a spline through all of them — arc-length reparameterisation would
 * slide the camera off the keyframe `t` values, and the acts need to know exactly
 * where it is at each boundary. The holds are load-bearing: the works act keeps the
 * camera at the ring's hub for its whole window while the ring turns around it.
 *
 * Each distance is set from the act's own radius, roughly 2.5×, so the object reads at
 * about half the frame height and leaves the copy column clear.
 */
export const CAMERA_KEYS: CamKey[] = [
  { t: 0.0, p: [0, 0.25, 7.4], l: [0, 0, 0] }, // 01 the mark, dead ahead
  { t: 0.07, p: [2.1, 0.7, 3.8], l: [0, 0, -1] }, // drift past it
  { t: 0.12, p: [0.4, 0.45, -7], l: [0, 0, -16] }, // 02 into the corridor
  { t: 0.23, p: [0, 0.4, -36], l: [0, 0, -48] }, // arrive at "now"
  { t: 0.28, p: [0, 0.5, -38], l: [0, 0, -56] }, // 03 the sphere, 18 ahead
  { t: 0.35, p: [0, 0.5, -38], l: [0, 0, -56] }, // held while it turns
  { t: 0.4, p: [0, 0.6, -56], l: [0, 0, -72] }, // 04 turbine, near on-axis
  { t: 0.45, p: [0, 0.5, -70], l: [0, 0, -84] }, // leaving the turbine
  { t: 0.5, p: [0, 0.6, -76], l: [0, 0, -92] }, // 05 the constellation
  { t: 0.55, p: [-6, 0.6, -78], l: [0, 0, -92] }, // drift across it
  { t: 0.6, p: [0, 0.2, -118], l: [0, 0, -133] }, // 06 at the ring's hub
  { t: 0.7, p: [0, 0.2, -118], l: [0, 0, -133] }, // held while the ring turns
  { t: 0.74, p: [7, 1.6, -128], l: [0, 0, -140] }, // slip out between two crystals
  { t: 0.78, p: [0, -1.2, -146], l: [0, -1, -160] }, // 07 the hall — a floor appears
  { t: 0.83, p: [0, -1.2, -172], l: [0, -1, -188] },
  { t: 0.87, p: [0, -0.6, -186], l: [0, -0.4, -198] }, // 08 the arcade wall
  { t: 0.91, p: [0, 0.1, -196], l: [0, 0.2, -208] },
  { t: 1.0, p: [0, 0.25, -202], l: [0, 0.5, -216] }, // 09 contact
];

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Smoothstep. Used everywhere so easing is consistent across acts. */
export function smooth(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

/** 0 → 1 across [a,b], eased. */
export function ramp(t: number, a: number, b: number): number {
  return smooth((t - a) / (b - a));
}

/**
 * How present an act's GEOMETRY is. Overlapping is fine and desirable here — one
 * crystal field should still be dissolving as the next comes into view, or the
 * world would blink between rooms.
 */
export function actPresence(t: number, act: ActSpec, lead = 0.03, tail = 0.03): number {
  const inn = ramp(t, act.t0 - lead, act.t0 + lead * 0.5);
  const out = 1 - ramp(t, act.t1 - tail * 0.5, act.t1 + tail);
  return clamp01(inn * out);
}

/**
 * How present an act's COPY is — and this one never overlaps.
 *
 * Each act owns a slice of its window for its text; the slices do not touch. The
 * outgoing block reaches zero before the incoming one leaves zero, so two headlines
 * can never be readable at the same time. That was the single worst thing about the
 * first pass: at every boundary two paragraphs sat on top of each other.
 *
 *   t0            t0+in                    t1-out         t1
 *   │──── fade in ────│──── fully legible ────│── fade out ──│
 *                                                            ↑ next act's t0
 */
const COPY_IN = 0.26; // fraction of the window spent fading in
const COPY_OUT = 0.3; // fraction spent fading out — ends before the boundary

export function copyPresence(t: number, act: ActSpec): number {
  const span = act.t1 - act.t0;
  const inEnd = act.t0 + span * COPY_IN;
  const outStart = act.t1 - span * COPY_OUT;
  // A hair inside the boundary, so the handover has a beat of empty screen.
  const outEnd = act.t1 - span * 0.04;
  if (t <= act.t0) return 0;
  if (t >= outEnd) return 0;
  if (t < inEnd) return smooth((t - act.t0) / (inEnd - act.t0));
  if (t > outStart) return 1 - smooth((t - outStart) / (outEnd - outStart));
  return 1;
}

/** The act that owns a given t. */
export function actAt(t: number): ActSpec {
  for (let i = ACTS.length - 1; i >= 0; i--) if (t >= ACTS[i].t0 - 1e-6) return ACTS[i];
  return ACTS[0];
}

/**
 * Deep links resolve to a t and the camera flies there instead of cutting, so every
 * URL the flat site published still works. Home is the exception: it is the start of
 * the ride, not a jump into it.
 */
export function tForPath(pathname: string): number | null {
  const hit = ACTS.find((a) => a.path === pathname);
  if (!hit) return null;
  if (hit.index === 1) return 0;
  // Land where the copy is fully legible rather than on the boundary.
  return hit.t0 + (hit.t1 - hit.t0) * 0.4;
}
