/**
 * Act 09 — Sync.
 *
 * Every shard the page has used converges here (the point field handles that end of
 * it). The three spectra fold back into one beam, and the monogram reassembles with the
 * crimson layer sliding back into register — the aberration resolved.
 *
 * It is the hero's closing answer, except here it is earned: the visitor watched the
 * light split 900vh ago, and the mark coming back into focus is the reply to the
 * question the first act asked.
 *
 * No headline plate. The DOM carries those words — one copy, selectable, and readable
 * at any size — and printing them here as well only put two versions of the same
 * sentence on top of each other.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { bandHex } from '../../lib/band';
import { beamGradient, glowGradient, TEAL_RGB } from '../look';
import { ABERRATION, MARK, markSvg } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence, ramp, smooth } from '../timeline';

function buildStack(parent: HTMLElement, colour: string, layers: number, className: string) {
  const stack = el('div', `pz3-mark-stack ${className}`, parent);
  const depth = MARK.depth * UNIT;
  for (let i = 0; i < layers; i++) {
    const layer = el('div', 'pz3-mark-layer', stack);
    layer.innerHTML = markSvg(colour);
    layer.style.transform = `translateZ(${q(-(i / (layers - 1)) * depth)}px)`;
    layer.style.opacity = i === 0 ? '0.92' : String(0.5 / layers + 0.06);
  }
  return stack;
}

export function createContactAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.contact;
  const root = el('div', 'pz3-act pz3-act-sync', ctx.host);
  const p = newProjected();
  const z0 = WORLD.contact.z;
  const layers = Math.max(2, ctx.quality.extrusion);

  const glowEl = el('div', 'pz3 pz3-glow', root);
  glowEl.style.width = glowEl.style.height = 26 * UNIT + 'px';
  glowEl.style.backgroundImage = glowGradient(TEAL_RGB, 0.34);
  const glow = new Item(glowEl);

  const markEl = el('div', 'pz3 pz3-mark', root);
  markEl.style.width = MARK.width * UNIT + 'px';
  markEl.style.height = MARK.height * UNIT + 'px';
  const mark = new Item(markEl);
  const spin = el('div', 'pz3-mark-3d', markEl);
  const rear = buildStack(spin, ctx.look.bloom ? '#fd2155' : '#d70f41', layers, 'pz3-mark-rear');
  buildStack(spin, ctx.look.glass, layers, 'pz3-mark-front');

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

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.04, 0.01);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time, delta } = f;
      // How far through the resolution we are: 0 at the act's start, 1 at the very end.
      const resolve = smooth(ramp(f.t, act.t0 + 0.01, 1.0));

      yaw += (0 - yaw) * (1 - Math.exp(-delta * 2.2));
      const turn = yaw + (1 - resolve) * Math.sin(time * 0.6) * 0.5;
      // High enough to clear the contact form, which owns the middle of the frame.
      const y = 6.4 + (4.9 - 6.4) * resolve;
      const scale = 1.1 + (1.75 - 1.1) * resolve;

      cam.project(0, y, z0, p);
      if (mark.show(p.visible)) {
        mark.transform(place(p.x, p.y, p.scale * scale));
        mark.opacity(presence * p.fog);
        mark.order(2600);
        markEl.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
        spin.style.transform = `rotateY(${q((turn * 180) / Math.PI)}deg)`;
        /**
         * The payoff: the crimson layer slides from a wide offset back to the logo's
         * own 6%-of-width vector. The mark comes into focus exactly as the scroll runs
         * out.
         */
        const drift = 1 - resolve;
        rear.style.transform =
          `translate3d(${q(ABERRATION.world[0] * (1 + drift * 9) * UNIT)}px,` +
          `${q(-ABERRATION.world[1] * (1 + drift * 9) * UNIT)}px,` +
          `${q((-0.16 - drift * 0.5) * UNIT)}px)`;
        rear.style.opacity = (0.85 - resolve * 0.1).toFixed(3);
      }

      cam.project(0, 4.6, z0 - 1.2, p);
      if (glow.show(p.visible)) {
        glow.transform(place(p.x, p.y, p.scale));
        glow.opacity(presence * f.look.glow * resolve * 0.9 * p.fog);
        glow.order(2400);
      }

      for (let i = 0; i < beams.length; i++) {
        // The three fold toward the beam line as the invitation resolves.
        const by = 3.8 + (1 - i) * 1.6 * (1 - resolve * 0.94);
        const roll = (1 - i) * -0.12 * (1 - resolve);
        cam.project(-8, by, z0, p);
        if (!beams[i].show(p.visible)) continue;
        beams[i].transform(place(p.x, p.y, p.scale, `rotate(${q((-roll * 180) / Math.PI)}deg)`));
        beams[i].opacity(
          presence * (0.3 + 0.3 * Math.sin(time * 1.2 + i * 2)) * (f.look.bloom ? 1 : 0.8) * p.fog
        );
        beams[i].order(2500);
      }
    },
  };
}
