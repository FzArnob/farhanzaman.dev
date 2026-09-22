/**
 * Act 09 — Sync.
 *
 * Every shard the page has used converges here (fx/shards.ts handles that end of it).
 * The three spectra fold back into one beam, and the monogram reassembles with the
 * crimson layer sliding back into register — the aberration resolved.
 *
 * It is the hero's closing answer, except here it is earned: the visitor watched the
 * light split at the top of the ride, and the mark coming back into focus is the reply
 * to the question the first act asked. It is the same solid act 01 opened on (markRig.ts), so
 * on either renderer the mark that closes the page is the mark that opened it.
 *
 * No headline plate. The DOM carries those words — one copy, selectable, and readable
 * at any size — and printing them here as well only put two versions of the same
 * sentence on top of each other.
 *
 * The mark is small and quiet, and it hangs in the middle of whatever space the copy
 * leaves above itself. It used to be a fixed point in the world, which was high enough
 * to clear the form on one screen and nowhere else: on a wide one it was twice the
 * height of the frame and ran off the top, glowing, and on a phone it sat under the
 * heading. Now the space is measured (layoutState) and the mark is sized to it, from
 * the camera the scroll comes to rest on, so it settles into place as the page ends.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { FOV, newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { bandHex } from '../../lib/band';
import { contactMark, layoutState } from '../liveState';
import { beamGradient } from '../look';
import { buildMark, type MarkPose } from '../markRig';
import { MARK } from '../shapes';
import { ACT_BY_ID, CAMERA_KEYS, WORLD, actPresence, ramp, smooth } from '../timeline';

/*
  The camera the page comes to rest on. The mark is placed through it rather than
  through the live camera, so it is a real point in the world — the approach still
  moves it, and the parallax still turns it — that happens to land in the gap.
*/
const REST = CAMERA_KEYS[CAMERA_KEYS.length - 1];
const FWD = (() => {
  const x = REST.l[0] - REST.p[0];
  const y = REST.l[1] - REST.p[1];
  const z = REST.l[2] - REST.p[2];
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len] as const;
})();
const RIGHT = (() => {
  const len = Math.hypot(FWD[2], FWD[0]);
  return [-FWD[2] / len, 0, FWD[0] / len] as const;
})();
const UP = [
  RIGHT[1] * FWD[2] - RIGHT[2] * FWD[1],
  RIGHT[2] * FWD[0] - RIGHT[0] * FWD[2],
  RIGHT[0] * FWD[1] - RIGHT[1] * FWD[0],
] as const;

/** On screen, the mark is at most this share of the frame's height: small, not a banner. */
const MAX_SHARE = 0.15;
const MAX_PX = 180;
const MIN_PX = 34;

export function createContactAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.contact;
  const root = el('div', 'pz3-act pz3-act-sync', ctx.host);
  const p = newProjected();
  const z0 = WORLD.contact.z;

  // A tight, faint glow — sized per frame with the mark, through glowScale.
  const mark = buildMark(ctx, root, { size: 7, peak: 0.2 });
  // How far in front of the resting camera the mark hangs.
  const depth = (z0 - REST.p[2]) / FWD[2];

  /** Three beams converging into one, mirroring act 01's three leaving. */
  const beams = [0, 0.5, 1].map((band) => {
    const outer = el('div', 'pz3 pz3-beam', root);
    outer.style.width = 14 * UNIT + 'px';
    outer.style.height = 0.07 * UNIT + 'px';
    const inner = el('div', 'pz3-beam-core', outer);
    inner.style.backgroundImage = beamGradient(bandHex(band));
    return new Item(outer);
  });

  let yaw = 0;

  const pose: MarkPose = {
    x: 0,
    y: 0,
    z: z0,
    rx: 0,
    ry: 0,
    rz: 0,
    scale: 1,
    fade: 1,
    split: 1,
    splitDepth: 0,
    rearOpacity: 0.85,
    glowY: 4.6,
    glowZ: z0 - 1.2,
    glow: 0,
    glowScale: 1,
    shine: 0.55,
    sheen: 0,
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
      /*
        How far through the resolution we are. It runs over the arrival and lands on
        the top of the hold, not on t = 1: the mark coming back into focus is the last
        act's way of announcing itself, and once it has, the rest of the act's scroll
        belongs to the form — which has to be still and finished while it is filled in.
      */
      const resolve = smooth(ramp(f.t, act.t0, act.h0));

      yaw += (0 - yaw) * (1 - Math.exp(-delta * 2.2));

      /*
        The gap: from under the masthead to the top of the contact copy, centred on the
        copy. The mark takes two thirds of it, capped so a tall screen gets a small mark
        with room around it rather than a large one. Where there is barely any gap — a
        phone with the form open — it keeps a floor and hangs from the top instead.
      */
      const width = cam.width;
      const height = cam.height;
      const focal = height / 2 / Math.tan((FOV * Math.PI) / 360);
      const copy = layoutState.copy.contact;
      const top = layoutState.ceiling || 64;
      const gap = Math.max(0, (copy ? copy.top : height * 0.4) - top);
      const px = Math.max(MIN_PX, Math.min(gap * 0.66, height * MAX_SHARE, MAX_PX));
      const sx = copy ? (copy.left + copy.right) / 2 : width / 2;
      const sy = top + Math.max(gap, px + 8) / 2;
      const u = ((sx - width / 2) / focal) * depth;
      const v = ((height / 2 - sy) / focal) * depth;
      const size = (px * depth) / (MARK.height * focal);
      const ax = REST.p[0] + FWD[0] * depth + RIGHT[0] * u + UP[0] * v;
      const ay = REST.p[1] + FWD[1] * depth + RIGHT[1] * u + UP[1] * v;
      const az = REST.p[2] + FWD[2] * depth + RIGHT[2] * u + UP[2] * v;
      contactMark.x = ax;
      contactMark.y = ay;
      contactMark.z = az;
      contactMark.scale = size;

      // It settles down into the gap and grows the last few percent as it resolves.
      pose.x = ax;
      pose.y = ay + (1 - resolve) * 0.9 * size;
      pose.z = az;
      pose.ry = yaw + (1 - resolve) * Math.sin(time * 0.6) * 0.5;
      pose.scale = size * (0.72 + 0.28 * resolve);
      pose.fade = presence;
      /**
       * The payoff: the crimson layer slides from a wide offset back to the logo's own
       * 6%-of-width vector. The mark comes into focus exactly as the scroll runs out.
       */
      const drift = 1 - resolve;
      pose.split = 1 + drift * 9;
      pose.splitDepth = drift * 0.5;
      pose.rearOpacity = 0.85 - resolve * 0.1;
      pose.glowY = pose.y;
      pose.glowZ = az - 1.2 * size;
      pose.glowScale = size;
      pose.glow = resolve * 0.55;
      // The key only finds the face once it has come into register, and only just.
      pose.sheen = resolve * 0.14;
      pose.sweep = time * 0.4;
      mark.update(f, pose);

      for (let i = 0; i < beams.length; i++) {
        // The three fold toward the beam line — through the mark — as it resolves.
        const by = ay + (1 - i) * 1.6 * size * (1 - resolve * 0.94);
        const roll = (1 - i) * -0.12 * (1 - resolve);
        cam.project(-8, by, az, p);
        if (!beams[i].show(p.visible)) continue;
        beams[i].transform(place(p.x, p.y, p.scale, `rotate(${q((-roll * 180) / Math.PI)}deg)`));
        beams[i].opacity(
          presence * (0.2 + 0.18 * Math.sin(time * 1.2 + i * 2)) * (f.look.bloom ? 1 : 0.8) * p.fog
        );
        beams[i].order(2500);
      }
    },
  };
}
