/**
 * Framing: where an act's subject goes on a screen that also has to hold its copy.
 *
 * Every act was composed on a landscape frame, with the copy in a column down the left
 * and the subject in the middle. Below the overlay's 820px breakpoint that column goes
 * full width along the bottom, and the subject was still composed for the middle — so
 * on a phone the mark, the skills orbit, the constellation and the works crystal all
 * sat under the text, and the orbit and the constellation ran off both sides because
 * the field of view is vertical and a portrait frame is narrow.
 *
 * The fix is the camera's, not each act's. A lens shift moves the whole world up into
 * the space the copy leaves, and a zoom fits the subject to that space. Mid-width
 * landscape screens have the mirror problem — a 1024px frame spends 40% of its width
 * on the copy column, and a centred orbit runs under it — so there a subject that
 * asks for it is shifted sideways, just far enough to clear the column. It is a
 * projection change, not a move — the camera stays where the timeline put it — so the
 * perspective, the fog and the parallax are all untouched, and the WebGL layer and the
 * DOM agree because both read the same projection (see GLStage.render).
 *
 * Each framed act says what has to stay in frame, measured from its resting camera. The
 * overlay publishes where its copy actually is (ActSection → layoutState), so the space
 * is measured, not guessed from a breakpoint that could drift from the stylesheet.
 * Acts with no subject here keep the frame they were composed for: the corridor and the
 * sphere solve their own fit, and the contact act hangs its mark in the gap itself.
 */

import { FOV } from './camera';
import { layoutState } from './liveState';
import { ACTS, actPresence, type ActId } from './timeline';

export interface Subject {
  /** Distance from the act's resting camera to the subject's centre, world units. */
  depth: number;
  /** The subject's centre above that camera's axis, world units. */
  y: number;
  /** Half-extents that have to stay in frame, world units. */
  halfW: number;
  halfH: number;
  /** Past this it stops reading, so it would rather sit partly under the copy. */
  minZoom: number;
  /** Whether to move clear of a side column of copy, not only a stacked one. */
  side?: boolean;
}

/**
 * Mutable on purpose: an act whose layout changes with the frame (the constellation
 * and the hall both close up on a narrow screen) writes its own extents here.
 */
export const SUBJECTS: Partial<Record<ActId, Subject>> = {
  // The mark, dead ahead of the opening camera.
  intro: { depth: 7.4, y: 0, halfW: 1.45, halfH: 1.5, minZoom: 0.6, side: true },
  // The outer ring and its crystals, and the caption hanging under the core.
  skills: { depth: 11.54, y: -0.45, halfW: 4.9, halfH: 2.45, minZoom: 0.5, side: true },
  achievements: { depth: 16, y: 0, halfW: 5.3, halfH: 4.9, minZoom: 0.5, side: true },
  // The front crystal's heart, where its artwork hangs; its point can run under the copy.
  works: { depth: 15, y: 0, halfW: 2.2, halfH: 2.6, minZoom: 0.72, side: true },
  hobbies: { depth: 18, y: 0.4, halfW: 8.8, halfH: 1.9, minZoom: 0.55, side: true },
  // The wall's five rows and its middle columns; the rest of the curve can run off the
  // sides, which is what a wall seen from inside a hall does anyway.
  arcade: { depth: 11.5, y: 1, halfW: 2.6, halfH: 2.75, minZoom: 0.6, side: true },
};

/** The overlay's breakpoint, for the first frames before the copy has been measured. */
const STACK_BREAKPOINT = 820;

/** Whether this act's copy runs along the bottom of the frame rather than down a side. */
export function stacked(id: ActId, width: number): boolean {
  const copy = layoutState.copy[id];
  if (!copy) return width <= STACK_BREAKPOINT;
  return copy.right - copy.left > width * 0.6;
}

export interface Framing {
  /** Lens shift, CSS px. Positive X moves the world right; negative Y lifts it. */
  shiftX: number;
  shiftY: number;
  zoom: number;
}

/** Below this, a subject clearing a side column would rather overlap it a little. */
const SIDE_MIN_ZOOM = 0.8;
/** The rail's strip down the right edge. */
const RAIL = 44;

/**
 * How much room a side column of copy leaves this act, as a half-width in world units at
 * the subject's depth and the smallest zoom framing will use. Null where the copy is not
 * a side column. An act that can close up its own layout reads this to do so before
 * framing has to shrink it further.
 */
export function sideRoom(id: ActId, width: number, height: number): number | null {
  const subject = SUBJECTS[id];
  const copy = layoutState.copy[id];
  if (!subject || !copy || stacked(id, width)) return null;
  const perUnit = height / 2 / Math.tan((FOV * Math.PI) / 360) / subject.depth;
  return (width - RAIL - (copy.right + 20)) / 2 / SIDE_MIN_ZOOM / perUnit;
}

/** One act's framing into `out`; false where the act keeps its composed frame. */
function frameAct(id: ActId, width: number, height: number, out: Framing): boolean {
  const subject = SUBJECTS[id];
  if (!subject) return false;
  const copy = layoutState.copy[id];
  const focal = height / 2 / Math.tan((FOV * Math.PI) / 360);
  const perUnit = focal / subject.depth;

  if (!stacked(id, width)) {
    if (!subject.side || !copy) return false;
    // Between the copy column and the rail. The least shift that clears the column,
    // and only as much zoom as the space demands, so a wide screen is left alone.
    const left = copy.right + 20;
    const right = width - RAIL;
    const half = subject.halfW * perUnit;
    if (width / 2 - half >= left) return false;
    const zoom = Math.max(SIDE_MIN_ZOOM, Math.min(1, (right - left) / (2 * half)));
    const reach = half * zoom;
    const shift = Math.min(left - (width / 2 - reach), Math.max(0, right - (width / 2 + reach)));
    out.shiftX = Math.max(0, shift);
    out.shiftY = 0;
    out.zoom = zoom;
    return true;
  }

  const top = (layoutState.ceiling || 64) + 6;
  // The copy's top edge, but never less room than a quarter of the frame: a subject
  // squeezed into a sliver is worse than one the copy overlaps a little.
  const floor = copy ? copy.top - 8 : height * 0.55;
  const bottom = Math.min(height, Math.max(floor, top + height * 0.26));

  // Symmetric about the centre, clear of whichever side is tighter (the rail's side).
  const margin = copy ? Math.max(copy.left, width - copy.right) : 30;
  const halfWidth = width / 2 - margin - 4;
  const halfHeight = (bottom - top) / 2;

  const fit = Math.min(1, halfWidth / (subject.halfW * perUnit), halfHeight / (subject.halfH * perUnit));
  const zoom = Math.max(subject.minZoom, fit);

  // Put the subject's centre at the middle of the space it was given.
  out.zoom = zoom;
  out.shiftX = 0;
  out.shiftY = (top + bottom) / 2 - height / 2 + subject.y * perUnit * zoom;
  return true;
}

const scratch: Framing = { shiftX: 0, shiftY: 0, zoom: 1 };

/**
 * The framing at t: each act's own, weighted by how present that act is, so the frame
 * eases from one composition to the next as the camera flies between them instead of
 * cutting at the boundary.
 */
export function framingAt(t: number, width: number, height: number, out: Framing): Framing {
  let weight = 0;
  let shiftX = 0;
  let shiftY = 0;
  let zoom = 0;
  for (const act of ACTS) {
    const w = actPresence(t, act);
    if (w <= 0) continue;
    weight += w;
    if (frameAct(act.id, width, height, scratch)) {
      shiftX += scratch.shiftX * w;
      shiftY += scratch.shiftY * w;
      zoom += scratch.zoom * w;
    } else {
      zoom += w;
    }
  }
  if (weight < 1e-4) {
    out.shiftX = 0;
    out.shiftY = 0;
    out.zoom = 1;
  } else {
    out.shiftX = shiftX / weight;
    out.shiftY = shiftY / weight;
    out.zoom = zoom / weight;
  }
  return out;
}
