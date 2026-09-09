/**
 * Act 01 — The Prism.
 *
 * The site's own monogram, extruded into glass and turning slowly at the origin.
 * Three spectrum beams leave stage right, one per designation; hovering a designation
 * in the DOM overlay sets `focusBeam`, which ignites that beam and yaws the mark
 * toward it.
 *
 * The extrusion is a stack of copies of the logo, each a step further back in a
 * `preserve-3d` group. That is the whole trick this act needed: the mark is a flat
 * outline with straight edges, so a stack of it at low alpha builds exactly the
 * banded, faceted depth the extruded geometry had, and the whole assembly turns on one
 * transform instead of a few thousand triangles.
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
import { beamGradient, glowGradient, TEAL_RGB } from '../look';
import { bandHex } from '../../lib/band';
import { prismFocus } from '../liveState';
import { MARK, ABERRATION, markMaskUri, markSvg } from '../shapes';
import { ACT_BY_ID, actPresence } from '../timeline';

const BEAM_BANDS = [0, 0.5, 1];

/**
 * One stack of the mark, `layers` deep, in a single colour.
 *
 * Two things separate this from a comb of identical copies. The front layer is given a
 * cut edge — a hairline stroke in the world's own highlight colour, which is where
 * glass catches light and the only place a mark built from flat polygons can show what
 * it is made of. And the body thins as it recedes rather than holding one density all
 * the way back, so the extrusion reads as depth falling away instead of as a stack of
 * cards seen edge-on.
 */
function buildStack(
  parent: HTMLElement,
  colour: string,
  layers: number,
  className: string,
  edge: string
) {
  const stack = el('div', `pz3-mark-stack ${className}`, parent);
  const depth = MARK.depth * UNIT;
  const body = 0.5 / layers + 0.06;
  for (let i = 0; i < layers; i++) {
    const k = i / (layers - 1);
    const layer = el('div', 'pz3-mark-layer', stack);
    layer.innerHTML = i === 0 ? markSvg(colour, edge) : markSvg(colour);
    // Front layer at z = 0, the rest receding, so the mark's face is where the
    // geometry's front face was.
    layer.style.transform = `translateZ(${q(-k * depth)}px)`;
    // The face carries the colour; the body behind it only has to build density.
    layer.style.opacity = i === 0 ? '0.92' : (body * (1 - k * 0.5)).toFixed(3);
  }
  return stack;
}

export function createPrismAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.intro;
  const root = el('div', 'pz3-act pz3-act-prism', ctx.host);
  const p = newProjected();
  const layers = Math.max(2, ctx.quality.extrusion);

  /* The glow behind the mark: 10 world units of soft teal, as one gradient. */
  const glowEl = el('div', 'pz3 pz3-glow', root);
  glowEl.style.width = glowEl.style.height = 10 * UNIT + 'px';
  glowEl.style.backgroundImage = glowGradient(TEAL_RGB, 0.5);
  const glow = new Item(glowEl);

  /* The mark. Outer carries placement and fade, inner carries the turn. */
  const markEl = el('div', 'pz3 pz3-mark', root);
  markEl.style.width = MARK.width * UNIT + 'px';
  markEl.style.height = MARK.height * UNIT + 'px';
  const mark = new Item(markEl);
  const spin = el('div', 'pz3-mark-3d', markEl);
  // Crimson layer first, offset by the logo's own aberration vector.
  const rear = buildStack(
    spin,
    ctx.look.bloom ? '#fd2155' : '#d70f41',
    layers,
    'pz3-mark-rear',
    ctx.look.bloom ? 'rgba(255,190,205,0.85)' : 'rgba(120,0,30,0.6)'
  );
  rear.style.transform =
    `translate3d(${q(ABERRATION.world[0] * UNIT)}px,${q(-ABERRATION.world[1] * UNIT)}px,` +
    `${q(-0.16 * UNIT)}px)`;
  buildStack(
    spin,
    ctx.look.glass,
    layers,
    'pz3-mark-front',
    ctx.look.bloom ? 'rgba(226,255,250,0.9)' : 'rgba(0,60,50,0.6)'
  );

  /*
    The white in this act. The mark's own colour is the logo's teal and crimson, so the
    only thing allowed to be white is this: a hard key on a slow orbit whose highlight
    travels across the facets and off the edge. It reads as the mark catching the light
    rather than as a white object, which is the whole point — so it is masked to the
    mark's own silhouette and rides inside the turning group.
  */
  const sheen = el('div', 'pz3-mark-sheen', spin);
  sheen.style.maskImage = markMaskUri();
  sheen.style.webkitMaskImage = markMaskUri();
  const sheenBlob = el('div', 'pz3-mark-sheen-blob', sheen);
  sheenBlob.style.width = sheenBlob.style.height = q(1.9 * UNIT) + 'px';
  sheenBlob.style.backgroundImage = glowGradient('255,255,255', 0.85);

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

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.02, 0.05);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time, delta } = f;
      const focus = prismFocus.beam;

      /* ---- the mark ---- */
      // Scroll drives the turn; a slow idle rotation keeps it alive when parked.
      const yaw = f.t * 9 + time * 0.1;
      const pitch = Math.sin(f.t * 6) * 0.1;
      // A yaw toward whichever designation is hovered, plus pointer parallax.
      const aim = focus >= 0 ? (1 - focus) * 0.22 : 0;
      const k = 1 - Math.exp(-delta * 4);
      roll += (aim + prismFocus.pointerX * 0.07 - roll) * k;
      lift += (prismFocus.pointerY * 0.12 - lift) * k;

      const scale = 0.92 + (1.16 - 0.92) * Math.min(1, f.t / act.t1);

      cam.project(0, lift, 0, p);
      if (mark.show(p.visible)) {
        mark.transform(place(p.x, p.y, p.scale * scale));
        mark.opacity(presence * p.fog);
        mark.order(2600);
        // Exact perspective: the camera's own distance, in the element's local units.
        markEl.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
        spin.style.transform =
          `rotateY(${q((yaw * 180) / Math.PI)}deg) rotateX(${q((-pitch * 180) / Math.PI)}deg) ` +
          `rotateZ(${q((-roll * 180) / Math.PI)}deg)`;
      }

      /* ---- the glow behind the mark ---- */
      cam.project(0, 0, -1.4, p);
      if (glow.show(p.visible)) {
        glow.transform(place(p.x, p.y, p.scale));
        glow.opacity(presence * f.look.glow * p.fog);
        glow.order(2400);
      }

      /* ---- the travelling highlight, on the mark's own face ---- */
      const sweep = time * 0.55;
      // The key's orbit, read in the mark's own space: it crosses the face and leaves.
      sheenBlob.style.transform =
        `translate3d(${q(Math.cos(sweep) * 3.2 * UNIT * 0.42)}px,` +
        `${q(-Math.sin(sweep * 0.7) * 2.0 * UNIT * 0.42)}px,0) translate(-50%,-50%)`;
      sheen.style.opacity = (
        (f.look.bloom ? 0.62 : 0.34) *
        (0.55 + 0.45 * Math.sin(time * 1.3))
      ).toFixed(3);

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
