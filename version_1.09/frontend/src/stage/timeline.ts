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

/**
 * An act's scroll budget, in vh — three separate amounts, not one window.
 *
 * This is the whole point of the layout. An act used to be a single span and
 * everything inside it competed for the same scroll: the camera flew in, the copy
 * faded up, the items stepped past, the copy went out and the camera left, all sharing
 * one window. The cost landed entirely on the ends. The first item was the one on
 * screen while the room was still materialising and the camera was still moving, and
 * the last was the one on screen while both were being taken away — so the two items a
 * visitor is most likely to stop on were the two that were never still.
 *
 * The arrival and the departure are paid for separately now:
 *
 *   enter — the camera flies to the act's viewpoint and the copy comes up. No item is
 *           stepped through here; item 1 is already the current one and is simply
 *           waiting, fully framed, by the time this ends.
 *   hold  — the act's own scroll, and the only part the content sees. The camera is
 *           parked, or making the act's own traverse, and every item gets an equal
 *           slice of it, the first and last included.
 *   exit  — the copy goes out and the camera starts to leave. The last item is still
 *           the current one for all of it.
 *
 * The numbers are vh, so they are directly comparable to a screen: 40 is a bit under
 * half a screen of wheel for a handover, and skills gives each of its twelve crystals
 * thirteen. Changing one act's budget does not move the content of any other — the
 * windows are derived from the totals, and the camera keyframes are anchored to the
 * act beats rather than to numbers that would have to be re-typed by hand.
 */
interface ActBeats {
  id: ActId;
  /** 01–09. */
  index: number;
  /** The flat site's own section name — used in the centre-bottom readout. */
  name: string;
  /** 0 = teal pole, 1 = crimson pole. Nothing lands in between. */
  band: number;
  /**
   * Deep-link path, so every existing URL still resolves.
   *
   * `null` for an act that has a page of its own rather than a position on this
   * scroll — Background is the one: /about is the v1.07 About page again, reached
   * from the act's See More button, so the act itself is not addressable.
   */
  path: string | null;
  /** Arriving, in vh. Zero for the intro: you are already there. */
  enter: number;
  /** The act's own scroll, in vh. Items are stepped through in here and nowhere else. */
  hold: number;
  /** Leaving, in vh. */
  exit: number;
}

const BEATS: ActBeats[] = [
  { id: 'intro', index: 1, name: 'Intro', band: 0, path: '/', enter: 0, hold: 65, exit: 40 },
  { id: 'background', index: 2, name: 'Background', band: 0, path: null, enter: 40, hold: 110, exit: 40 },
  { id: 'expertise', index: 3, name: 'Expertise', band: 0, path: '/expertise', enter: 40, hold: 80, exit: 40 },
  // Twelve skills, one at a time: the hold is sized from the count rather than guessed.
  { id: 'skills', index: 4, name: 'Skills', band: 0, path: '/skills', enter: 40, hold: 156, exit: 40 },
  { id: 'achievements', index: 5, name: 'Achievements', band: 1, path: '/achievements', enter: 40, hold: 85, exit: 40 },
  // Five crystals on the home ring, eight once it is expanded.
  { id: 'works', index: 6, name: 'Works', band: 1, path: '/works', enter: 40, hold: 130, exit: 40 },
  { id: 'hobbies', index: 7, name: 'Hobbies', band: 1, path: '/hobbies', enter: 40, hold: 110, exit: 40 },
  { id: 'arcade', index: 8, name: 'Gaming', band: 1, path: '/gaming', enter: 40, hold: 65, exit: 40 },
  // The last exit is the resolution at the bottom of the page, not a handover.
  { id: 'contact', index: 9, name: 'Contact', band: 1, path: '/contact', enter: 40, hold: 85, exit: 35 },
];

export interface ActSpec {
  id: ActId;
  index: number;
  name: string;
  band: number;
  path: string | null;
  /** Start of the act — the arrival begins here. */
  t0: number;
  /** End of the arrival, start of the hold. Item 1 is framed and still from here on. */
  h0: number;
  /** End of the hold, start of the departure. The last item stays current past here. */
  h1: number;
  /** End of the act. */
  t1: number;
  /** The three beats in t-units, for curves that have to match a transition's width. */
  enterT: number;
  holdT: number;
  exitT: number;
}

/** The ride's total length. Derived: every vh in the table above is in here once. */
export const HEIGHT_VH: number = BEATS.reduce((sum, b) => sum + b.enter + b.hold + b.exit, 0);

export const ACTS: ActSpec[] = (() => {
  let vh = 0;
  return BEATS.map((b) => {
    const t0 = vh / HEIGHT_VH;
    const h0 = (vh + b.enter) / HEIGHT_VH;
    const h1 = (vh + b.enter + b.hold) / HEIGHT_VH;
    vh += b.enter + b.hold + b.exit;
    const t1 = vh / HEIGHT_VH;
    return {
      id: b.id,
      index: b.index,
      name: b.name,
      band: b.band,
      path: b.path,
      t0,
      h0,
      h1,
      t1,
      enterT: h0 - t0,
      holdT: h1 - h0,
      exitT: t1 - h1,
    };
  });
})();

export const ACT_BY_ID = Object.fromEntries(ACTS.map((a) => [a.id, a])) as Record<ActId, ActSpec>;

const LAST = ACTS[ACTS.length - 1];

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

/** Which beat boundary of an act a camera keyframe is pinned to. */
type Beat = 't0' | 'h0' | 'h1' | 't1';

interface CamKeySpec {
  act: ActId;
  at: Beat;
  p: readonly [number, number, number];
  l: readonly [number, number, number];
}

/**
 * Camera keyframes: piecewise and eased, exact at every keyframe.
 *
 * Pinned to act beats rather than to bare numbers, which is what keeps the camera
 * honest about the three budgets. A key on `h0` is the end of an arrival, a key on
 * `h1` the start of a departure, and a pair of identical poses on `h0`/`h1` is a park:
 * the camera does not move for the whole of that act's own scroll, which is the
 * condition for its items to be read one at a time. Re-budgeting an act now moves its
 * keys with it instead of leaving the camera pointed at where the act used to be.
 *
 * Deliberately not a spline through all of them — arc-length reparameterisation would
 * slide the camera off the keyframe `t` values, and the acts need to know exactly
 * where it is at each boundary.
 *
 * Each distance is set from the act's own radius, roughly 2.5×, so the object reads at
 * about half the frame height and leaves the copy column clear.
 */
const CAM_KEY_SPECS: CamKeySpec[] = [
  { act: 'intro', at: 't0', p: [0, 0.25, 7.4], l: [0, 0, 0] }, // 01 the mark, dead ahead
  { act: 'intro', at: 'h1', p: [2.1, 0.7, 3.8], l: [0, 0, -1] }, // drift past it
  { act: 'background', at: 'h0', p: [0.4, 0.45, -7], l: [0, 0, -16] }, // 02 into the corridor
  { act: 'background', at: 'h1', p: [0, 0.4, -36], l: [0, 0, -48] }, // arrive at "now"
  { act: 'expertise', at: 'h0', p: [0, 0.5, -38], l: [0, 0, -56] }, // 03 the sphere, 18 ahead
  { act: 'expertise', at: 'h1', p: [0, 0.5, -38], l: [0, 0, -56] }, // parked while it turns
  { act: 'skills', at: 'h0', p: [0, 1.3, -60.5], l: [0, 0.3, -72] }, // 04 the crystal core, from a little above
  { act: 'skills', at: 'h1', p: [0, 1.3, -60.5], l: [0, 0.3, -72] }, // parked while each skill comes round
  { act: 'achievements', at: 't0', p: [0, 2.6, -67], l: [0, 0.4, -84] }, // rise over the orbit and on
  { act: 'achievements', at: 'h0', p: [0, 0.6, -76], l: [0, 0, -92] }, // 05 the constellation
  { act: 'achievements', at: 'h1', p: [-6, 0.6, -78], l: [0, 0, -92] }, // drift across it
  { act: 'works', at: 'h0', p: [0, 0.2, -118], l: [0, 0, -133] }, // 06 at the ring's hub
  { act: 'works', at: 'h1', p: [0, 0.2, -118], l: [0, 0, -133] }, // parked while the ring turns
  { act: 'hobbies', at: 't0', p: [7, 1.6, -128], l: [0, 0, -140] }, // slip out between two crystals
  { act: 'hobbies', at: 'h0', p: [0, -1.2, -146], l: [0, -1, -160] }, // 07 the hall — a floor appears
  { act: 'hobbies', at: 'h1', p: [0, -1.2, -172], l: [0, -1, -188] }, // the far end of the hall
  { act: 'arcade', at: 'h0', p: [0, -0.6, -186], l: [0, -0.4, -198] }, // 08 the arcade wall
  { act: 'arcade', at: 'h1', p: [0, 0.1, -196], l: [0, 0.2, -208] },
  { act: 'contact', at: 'h0', p: [0, 0.25, -202], l: [0, 0.5, -216] }, // 09 contact
  // Parked to the bottom of the page: the form has to be usable while it is read.
  { act: 'contact', at: 't1', p: [0, 0.25, -202], l: [0, 0.5, -216] },
];

export const CAMERA_KEYS: CamKey[] = CAM_KEY_SPECS.map((k) => ({
  t: ACT_BY_ID[k.act][k.at],
  p: k.p,
  l: k.l,
}));

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
 * How much of a transition the geometry starts early and finishes late by.
 *
 * Without it the rooms would hand over on an exact frontier and the world would blink
 * between them. At 0.4 an act's crystals begin materialising four tenths of its
 * arrival before the act formally starts, and the outgoing act is still dissolving
 * four tenths of a departure into it — they overlap, but only inside the scroll that
 * was set aside for the handover, so neither one eats the other's hold.
 */
const BLEED = 0.4;

/**
 * How present an act's GEOMETRY is.
 *
 * Fully there by the time the arrival ends and still fully there when the departure
 * begins, because the ramps *are* the transitions: an act's hold is exactly the span
 * over which this is flat at 1, which is what lets an item be looked at rather than
 * watched arriving. Overlapping neighbours is fine and desirable — one crystal field
 * should still be dissolving as the next comes into view, or the world would blink
 * between rooms.
 */
export function actPresence(t: number, act: ActSpec, bleed = BLEED): number {
  // The first act has no arrival — the page opens on it — and the last has no
  // departure, because the ride ends there rather than handing over to anything.
  const inn =
    act.index === 1 ? 1 : ramp(t, act.t0 - act.enterT * bleed, act.h0 - act.enterT * bleed);
  const out =
    act === LAST ? 1 : 1 - ramp(t, act.h1 + act.exitT * bleed, act.t1 + act.exitT * bleed);
  return clamp01(inn * out);
}

/**
 * 0 → 1 across an act's hold, with both transitions taken out.
 *
 * This is the only clock an act's content should run on. Reading it from `t0` instead
 * is what used to make the first item flash past during the fly-in.
 */
export function holdProgress(t: number, act: ActSpec): number {
  return clamp01((t - act.h0) / Math.max(1e-6, act.holdT));
}

/**
 * Which of `count` items the act is on.
 *
 * Every item gets one equal slice of the hold — `floor`, not `round`. Rounding across
 * `count - 1` steps gives the first and last items half a slice each, which is the
 * wrong way round: those two are the ones with a transition sitting next to them, so
 * they are the two that most need a full one. Outside the hold the value saturates, so
 * item 1 is already current for the whole arrival and the last item stays current for
 * the whole departure.
 */
export function itemIndex(t: number, act: ActSpec, count: number): number {
  if (count <= 1) return 0;
  return Math.min(count - 1, Math.floor(holdProgress(t, act) * count));
}

/**
 * Which act, if any, owns the copy at t.
 *
 * Scroll decides whose turn it is to speak. It does not scrub the fade: the copy used
 * to be a ramp over the first quarter of a window, so arriving at an act showed you a
 * headline at 5% opacity and you had to keep scrolling to be allowed to read it. The
 * fade is a timed animation now, owned by useActFade — reaching the act is the
 * trigger, and standing still is enough to see it finish.
 *
 * The copy owns the arrival and the hold; the departure belongs to nobody. That beat
 * is the handover, so it still gets its stretch of empty screen and two headlines are
 * never legible at once — but it is a budget of its own now rather than a slice taken
 * off the end of the content's own window.
 */
export function copyOwner(t: number): ActId | null {
  const act = actAt(t);
  if (t < act.t0) return null;
  // The last act has nothing to hand over to, and the bottom of the scroll is exactly
  // where its form has to be usable, so it keeps its copy all the way to t = 1.
  if (act === LAST) return act.id;
  return t < act.h1 ? act.id : null;
}

/** The act that owns a given t. */
export function actAt(t: number): ActSpec {
  for (let i = ACTS.length - 1; i >= 0; i--) if (t >= ACTS[i].t0 - 1e-6) return ACTS[i];
  return ACTS[0];
}

/**
 * Where a jump to an act should land: the top of its hold.
 *
 * The arrival has already been paid for by the time you get there, so the room is
 * built, the camera is parked and the first item is the current one — and it stays
 * current for its whole slice, instead of being a fifth of the way through it the
 * moment you arrive.
 */
export function tForAct(act: ActSpec): number {
  return act.index === 1 ? 0 : act.h0;
}

/**
 * Deep links resolve to a t and the camera flies there instead of cutting, so every
 * URL the flat site published still works. Home is the exception: it is the start of
 * the ride, not a jump into it.
 */
export function tForPath(pathname: string): number | null {
  const hit = ACTS.find((a) => a.path === pathname);
  return hit ? tForAct(hit) : null;
}
