/**
 * Act 01 — The Prism.
 *
 * The site's own monogram, extruded and turning slowly at the origin. Three spectrum
 * beams leave stage right, one per designation; hovering a designation in the DOM
 * overlay sets `focusBeam`, which ignites that beam and yaws the mark toward it.
 *
 * The mark itself is built in markRig.ts, because act 09 closes on the same solid: a
 * lit, bevelled mesh on WebGL, and on the CSS renderer a true extrusion — two faces and
 * a wall on every edge, relit as it turns. This act only decides how it is posed.
 *
 * The ghost name plate that used to sit behind the glass is gone. It existed to be
 * refracted — the letters warping and re-forming as the mark turned was an image only
 * a transmission pass could make — and without that pass it was a second, blurrier
 * copy of the headline the overlay already carries, sitting in the middle of the
 * frame. The words are still in the document, in the overlay, where they are
 * selectable and readable at any size.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { beamGradient } from '../look';
import { bandHex } from '../../lib/band';
import { prismFocus } from '../liveState';
import { buildMark, type MarkPose } from '../markRig';
import { ACT_BY_ID, actPresence, clamp01 } from '../timeline';

const BEAM_BANDS = [0, 0.5, 1];

export function createPrismAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.intro;
  const root = el('div', 'pz3-act pz3-act-prism', ctx.host);
  const p = newProjected();

  const mark = buildMark(ctx, root, { size: 10, peak: 0.5 });

  /* Three beams leaving stage right, one per designation. */
  const beams = BEAM_BANDS.map((band) => {
    const outer = el('div', 'pz3 pz3-beam', root);
    outer.style.width = 3.4 * UNIT + 'px';
    outer.style.height = 0.045 * UNIT + 'px';
    const inner = el('div', 'pz3-beam-core', outer);
    inner.style.backgroundImage = beamGradient(bandHex(band));
    return { item: new Item(outer), inner, thickness: 1 };
  });

  /** Damped values that survive between frames. */
  let roll = 0;
  let lift = 0;

  const pose: MarkPose = {
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
    fade: 1,
    split: 1,
    splitDepth: 0,
    rearOpacity: 0.85,
    // No halo here. A teal bloom behind the mark read as a lamp sitting in the middle
    // of the glyph rather than light coming off it; the mark carries its own colour.
    // Act 09 still uses the rig's glow, tight and faint, which is why it stays.
    glowY: 0,
    glowZ: -1.4,
    glow: 0,
    glowScale: 1,
    shine: 1,
    sheen: 1,
    sweep: 0,
    order: 2600,
  };

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        mark.hide();
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time, delta } = f;
      const focus = prismFocus.beam;

      /* ---- the mark ---- */
      // A yaw toward whichever designation is hovered, plus pointer parallax.
      const aim = focus >= 0 ? (1 - focus) * 0.22 : 0;
      const k = 1 - Math.exp(-delta * 4);
      roll += (aim + prismFocus.pointerX * 0.07 - roll) * k;
      lift += (prismFocus.pointerY * 0.12 - lift) * k;

      pose.y = lift;
      /*
        Read from the act rather than from the page, so the mark's turn and its growth
        are the same at the top of the ride however the acts below it are budgeted.
        Both finish at the end of the intro's own hold: the drift past the mark is the
        departure, and it should be at full size before that begins.
      */
      const u = clamp01((f.t - act.t0) / (act.enterT + act.holdT));
      // Scroll drives the turn; a slow idle rotation keeps it alive when parked.
      pose.ry = u * 0.9 + time * 0.1;
      pose.rx = Math.sin(u * 0.6) * 0.1;
      pose.rz = roll;
      pose.scale = 0.92 + (1.16 - 0.92) * u;
      pose.fade = presence;
      pose.sweep = time * 0.55;
      pose.sheen = 0.55 + 0.45 * Math.sin(time * 1.3);
      mark.update(f, pose);

      /* ---- the beams ---- */
      for (let i = 0; i < beams.length; i++) {
        const beam = beams[i];
        cam.project(2.5, (1 - i) * 0.5, 0, p);
        if (!beam.item.show(p.visible)) continue;
        const lit = focus === i ? 1 : focus >= 0 ? 0.16 : 0.42;
        const pulse = 0.5 + 0.5 * Math.sin(time * 1.1 + i * 2.1);
        beam.item.opacity(presence * (lit + pulse * 0.14) * (f.look.bloom ? 1 : 0.85) * p.fog);
        beam.item.order(2500);
        // World +Z rotation is counter-clockwise; screen Y points down, so the sign flips.
        const roll2 = (-(1 - i) * 0.14 * 180) / Math.PI;
        beam.item.transform(place(p.x, p.y, p.scale, `rotate(${q(roll2)}deg)`));
        // A focused beam thickens rather than brightening alone.
        const want = focus === i ? 2.4 : 1;
        beam.thickness += (want - beam.thickness) * (1 - Math.exp(-delta * 6));
        beam.inner.style.transform = `scaleY(${beam.thickness.toFixed(2)})`;
      }
    },
  };
}
