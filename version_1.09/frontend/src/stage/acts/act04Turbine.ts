/**
 * Act 04 — The Turbine.
 *
 * Twelve glass blades radiating from a hub, viewed near on-axis. Blade LENGTH is the
 * skill's percentage and blade TWIST is its duration, so two variables live in one
 * mark — a bar chart would have needed a second chart for the second number, and all
 * twelve values are comparable in a single glance instead of twelve rows of scrolling.
 *
 * Whichever blade reaches the top reads out into the DOM overlay. The rotor turns so
 * that the indexed blade sits at twelve o'clock rather than spinning freely, so the
 * number in the copy always matches the blade the visitor is looking at.
 *
 * The twist is a gradient rather than a deformed mesh. On a blade seen this close to
 * on-axis the twist only ever showed as a highlight running at an angle down its
 * length, which is exactly what a linear gradient is.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { bandHex } from '../../lib/band';
import { extrude, facetPane, glassPane, leafCount } from '../glass';
import { TEAL_RGB } from '../look';
import { turbineState } from '../liveState';
import { bladeClip } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/** How thick a blade is cut, in world units. Thin — it is an aerofoil, not a fin. */
const BLADE_DEPTH = 0.09;

export function createTurbineAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.skills;
  const root = el('div', 'pz3-act pz3-act-turbine', ctx.host);
  const p = newProjected();
  const skills = ctx.profile.skills;
  const look = ctx.look;

  const blades = skills.map((skill, i) => {
    const percentage = clamp01(Number(skill.percentage) / 100);
    const months = Number(skill.duration) || 0;
    // 50–88% across the data; remap so the spread is legible rather than literal.
    const length = 1.5 + percentage * WORLD.skills.radius * 0.85;
    const width = 0.3 + percentage * 0.16;
    // 8–36 months; a half-turn at the tip is as much twist as reads cleanly.
    const twist = (Math.min(months, 36) / 36) * Math.PI * 0.55;

    const clip = bladeClip();
    const outer = el('div', 'pz3 pz3-blade', root);
    outer.style.width = q(width * UNIT) + 'px';
    outer.style.height = q(length * UNIT) + 'px';
    const body = el('div', 'pz3-blade-3d', outer);

    /*
      A blade has a ground edge. That is the whole reason it is extruded rather than
      being one clipped sliver: seen this close to on-axis the twelve blades overlap
      constantly, and without an edge to separate them the ring reads as a flat paper
      pinwheel instead of a rotor of cut glass.
    */
    extrude(body, clip, BLADE_DEPTH * UNIT, leafCount(ctx.quality.extrusion), look);

    /*
      The blade's glass, and its twist. The highlight runs across the blade at the
      angle the twist would have carried it, so a long-held skill reads as a blade
      turned further into the light — and facetPane lights the two long edges, which
      on an aerofoil are the leading and trailing edges the key would actually catch.
    */
    const angle = 90 + (twist * 180) / Math.PI;
    const node = el('div', 'pz3-blade-face', body);
    node.style.clipPath = clip;
    /*
      The blade's own body, opaque enough to sit in front of its extrusion. A facet
      pane is glass all the way through, which is right for a crystal with an interior
      to show and wrong for a blade with a dark cut edge behind it — left translucent
      the twelve blades read as black spokes rather than as lit glass.
    */
    node.style.backgroundColor = look.bloom ? 'rgba(0,211,180,0.62)' : 'rgba(0,148,127,0.5)';
    node.style.backgroundImage = facetPane(look, TEAL_RGB, 0.55 + percentage * 0.4, angle);

    const tip = el('div', 'pz3 pz3-blade-tip', root);
    tip.style.width = tip.style.height = 0.15 * UNIT + 'px';
    // A band-coloured tip mark, so the ring of twelve tips reads as a scale.
    tip.style.background = bandHex(i / Math.max(1, skills.length - 1));

    return {
      item: new Item(outer),
      outer,
      tip: new Item(tip),
      angle: (i / skills.length) * Math.PI * 2,
      length,
      /** Damped, so the readout blade grows into place rather than snapping. */
      shown: 0.9,
    };
  });

  /* The hub, and the fixed readout marker at twelve o'clock. */
  const hubEl = el('div', 'pz3 pz3-hub', root);
  hubEl.style.width = hubEl.style.height = 1.1 * UNIT + 'px';
  hubEl.style.backgroundColor = look.bloom ? '#0d1518' : '#c9d6d3';
  hubEl.style.backgroundImage = glassPane(look, TEAL_RGB);
  const hub = new Item(hubEl);

  const markerEl = el('div', 'pz3 pz3-marker', root);
  markerEl.style.width = 0.035 * UNIT + 'px';
  markerEl.style.height = 0.7 * UNIT + 'px';
  markerEl.style.background = '#00d3b4';
  const marker = new Item(markerEl);

  let rotor = 0;

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.035, 0.035);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time, delta } = f;
      const z = WORLD.skills.z;

      /**
       * Scroll indexes the readout blade. The rotor turns so the indexed blade sits at
       * the readout position rather than spinning freely.
       */
      const progress = clamp01((f.t - act.t0) / (act.t1 - act.t0));
      const index = turbineState.frozen
        ? turbineState.index
        : Math.min(blades.length - 1, Math.floor(progress * blades.length));
      turbineState.index = index;

      const target = -blades[index].angle;
      rotor += (target - rotor) * (1 - Math.exp(-delta * 5));
      // A slight wobble keeps the assembly from reading as a static diagram.
      const wobbleX = Math.sin(time * 0.4) * 0.05;
      const wobbleY = Math.cos(time * 0.31) * 0.06;
      const cosWX = Math.cos(wobbleX);
      const sinWX = Math.sin(wobbleX);
      const cosWY = Math.cos(wobbleY);
      const sinWY = Math.sin(wobbleY);
      const k = 1 - Math.exp(-delta * 6);

      /** Rotor space to world: the two wobbles, applied about the hub. */
      const put = (lx: number, ly: number, lz: number) => {
        const x1 = lx * cosWY + lz * sinWY;
        const z1 = -lx * sinWY + lz * cosWY;
        const y2 = ly * cosWX - z1 * sinWX;
        const z2 = ly * sinWX + z1 * cosWX;
        return cam.project(x1, y2, z + z2, p);
      };

      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];
        const theta = blade.angle + rotor;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);
        const isActive = i === index;
        blade.shown += ((isActive ? 1.1 : 0.9) - blade.shown) * k;

        // The blade's centre, half its length out from the hub along its own spoke.
        const reach = blade.length / 2 + 0.35;
        put(-sin * reach, cos * reach, 0);
        if (blade.item.show(p.visible)) {
          blade.item.transform(
            // World rotations run counter-clockwise; screen Y points down, so the sign
            // flips on the way into CSS.
            place(p.x, p.y, p.scale * blade.shown, `rotate(${q((-theta * 180) / Math.PI)}deg)`)
          );
          blade.item.opacity(presence * 0.95 * p.fog);
          blade.item.order(Math.round(4000 - p.depth * 8));
          // The camera's real distance, so the blade's edge foreshortens rather than
          // simply squashing as the rotor carries it round.
          blade.outer.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
        }

        const tipReach = blade.length + 0.4;
        put(-sin * tipReach, cos * tipReach, 0);
        if (blade.tip.show(p.visible)) {
          blade.tip.transform(place(p.x, p.y, p.scale));
          blade.tip.opacity(presence * 0.9 * p.fog);
          blade.tip.order(Math.round(4001 - p.depth * 8));
        }
      }

      put(0, 0, 0);
      if (hub.show(p.visible)) {
        hub.transform(place(p.x, p.y, p.scale));
        hub.opacity(presence * p.fog);
        hub.order(Math.round(4000 - p.depth * 8));
      }

      // Fixed: the rotor turns beneath it, so it takes no rotor transform.
      cam.project(0, WORLD.skills.radius + 1.5, z + 0.4, p);
      if (marker.show(p.visible)) {
        marker.transform(place(p.x, p.y, p.scale));
        marker.opacity(presence * 0.85 * p.fog);
        marker.order(Math.round(4002 - p.depth * 8));
      }
    },
  };
}
