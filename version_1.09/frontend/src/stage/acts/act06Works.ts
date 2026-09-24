/**
 * Act 06 — Works.
 *
 * The camera sits at the hub of a ring of crystal prisms, one per project, all facing
 * inward. Scroll turns the ring and brings one to front-centre at full size.
 *
 * The home view carries the five most recent projects, ordered the way the flat site
 * orders them — newest contribution first. "View all N projects" grows the ring in
 * place: the radius opens up and the remaining crystals fade in between the existing
 * ones. It stays one continuous scene rather than becoming a separate page.
 *
 * A crystal is a hexagonal column with a pyramid at each end — the shape quartz
 * actually grows into. On CSS it is built as the real solid (css3d.ts, prism): the
 * same twenty-four triangles as the WebGL mesh, each its own element, relit every frame
 * from its normal and flashing as it turns through the key. Six spindle-shaped cards
 * around an axis used to stand in for it, and read as cards: their points never met,
 * and a flat silhouette behind them never turned.
 *
 * Each crystal is cut from its project's own glass — `theme_color` in profile.json —
 * with the project's `logo` held inside it as an inclusion. Inside, not on: on WebGL
 * every facet refracts the mark by its own angle (gl/GLStage.ts, withInclusion); on CSS
 * the mark hangs at the crystal's centre, square to the eye, and the browser sorts it
 * between the near faces and the far ones, so the glass and its edges pass over it.
 *
 * A crystal arriving at the front slows and settles with one facet square to the
 * camera, so the mark is read through a flat face rather than across a seam, and it
 * picks its spin back up as it leaves.
 *
 * The transition between crystals is the point of the act. The outgoing prism sheds
 * shards into the shared pool and those same shards reassemble as the incoming one —
 * one pool, constant count, nothing allocated mid-scroll.
 *
 * On the WebGL renderer each crystal is the same seeded prism as real faceted glass,
 * and the DOM element that would have held its faces stays behind empty, exactly over
 * it, as the thing a click lands on: the stage never raycasts, it lets the browser
 * hit-test an element instead.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { HOME_COUNT, orderProjects } from '../data';
import { shardClaims } from '../fx/shards';
import { CssNode, CssScene, buildSolid, cssMatrix, prism, type M3 } from '../css3d';
import type { GLNode } from '../gl/api';
import { facetBody } from '../glass';
import { glowGradient } from '../look';
import { worksState } from '../liveState';
import { crystalSpec, mulberry } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence, clamp01, itemIndex, smooth } from '../timeline';
import {
  glassTone,
  hexString,
  logoSrc,
  monogramUri,
  projectRgb,
  rgbString,
} from '../../lib/projectTheme';

/** How many shards a crystal scatters through on a handoff. */
const SCATTER = 28;

/** One facet's turn: a hexagonal column comes square to you every sixty degrees. */
const FACET = Math.PI / 3;

/** The inclusion's width, as a share of the column's narrowest width across its flats. */
const INCLUSION_SPAN = 0.9;

/** The transpose of a rotation — its inverse. */
function transpose(m: M3, out: M3): M3 {
  out[0] = m[0];
  out[1] = m[3];
  out[2] = m[6];
  out[3] = m[1];
  out[4] = m[4];
  out[5] = m[7];
  out[6] = m[2];
  out[7] = m[5];
  out[8] = m[8];
  return out;
}

export function createWorksAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.works;
  const root = el('div', 'pz3-act pz3-act-works', ctx.host);
  const p = newProjected();
  const look = ctx.look;

  const ordered = orderProjects(ctx.profile.projects);
  const perCrystal =
    ctx.quality.shards > 0 ? Math.floor(ctx.quality.shards / Math.max(1, ordered.length)) : 0;

  const lit = ctx.quality.tier !== 'low';
  const inverse: M3 = new Array(9);

  const crystals = ordered.map((project, i) => {
    const seed = Number(project.project_id) || i + 1;
    const spec = crystalSpec(seed, 2.5);
    const height = spec.half * 2 + spec.cap * 2;
    const apothem = spec.radius * Math.cos(Math.PI / 6);

    // The project's colour, pulled into the band this world can show glass in.
    const tone = glassTone(projectRgb(project), !look.bloom);
    const toneRgb = rgbString(tone);
    const logo = logoSrc(project);
    const fallback = monogramUri(project.name);

    let solid: GLNode | null = null;
    let halo: GLNode | null = null;
    let glow: Item | null = null;
    let scene: CssScene | null = null;
    let inclusion: Item | null = null;
    let outer: HTMLElement;

    if (ctx.gl) {
      // On WebGL the element is only a hit area over the mesh, so it needs a size.
      outer = el('div', 'pz3 pz3-crystal', root);
      outer.style.width = q(spec.radius * 2 * UNIT) + 'px';
      outer.style.height = q(height * UNIT) + 'px';
      solid = ctx.gl.solid({
        kind: 'prism',
        seed,
        scale: 2.5,
        tint: hexString(tone) as `#${string}`,
        logo,
        fallback,
      });
      halo = ctx.gl.solid({ kind: 'halo', size: 12, tint: hexString(tone) as `#${string}`, strength: 0.36 });
    } else {
      scene = new CssScene(root, 'pz3-crystal');
      outer = scene.outer;
      const shape = prism(spec);

      /*
        The glass. Each face is the project's colour, deepening along its length at an
        angle of its own so no two neighbours are painted alike; the per-frame light and
        glint do the rest. The shadow is held back — glass in shade darkens but stays
        clear, and the mark has to be read through whichever faces are turned from the key.
      */
      const body = new CssNode(scene);
      buildSolid(body, shape, [1, 1, 1], (_, k) => facetBody(look, toneRgb, 0.8, 24 + k * 37), {
        shadow: 0.55,
        glint: lit ? (look.bloom ? 0.85 : 0.6) : 0,
        lit,
      });

      /*
        The mark, hung at the centre and turned every frame to face the eye. It is inside
        the same 3D context as the faces, so the browser draws it behind the near ones and
        in front of the far ones: it sits in the glass, not on it. The project's colour
        pools behind it, so a dark wordmark reads as a silhouette against its own brand
        and a white one as light within light. Its width stays inside the narrower top
        ring's flats, so however the crystal turns it never pokes through a face.
      */
      const span = apothem * spec.taper * 2 * INCLUSION_SPAN * UNIT;
      const holder = el('div', 'pz3-crystal-inclusion', scene.el);
      holder.style.width = q(span) + 'px';
      holder.style.height = q(span * 1.6) + 'px';
      holder.style.backgroundImage =
        `radial-gradient(closest-side, rgba(${toneRgb},${look.bloom ? 0.7 : 0.45}) 0%,` +
        ` rgba(${toneRgb},${look.bloom ? 0.22 : 0.14}) 55%, rgba(${toneRgb},0) 100%)`;
      const img = el('img', '', holder);
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      img.onerror = () => {
        if (img.src !== fallback) img.src = fallback;
      };
      img.src = logo;
      inclusion = new Item(holder);

      /*
        The edges, as a cage just outside the glass. It is never culled, so the far
        edges show through the near faces — dimmed by them, the way the back of a real
        crystal is — and that crossing of near and far lines is most of what tells the
        eye this is a solid and not a cut-out.
      */
      const edges = new CssNode(scene);
      edges.size(1.004);
      buildSolid(edges, shape, [1, 1, 1], () => '', {
        wire: look.bloom ? 'rgba(255,255,255,0.42)' : 'rgba(40,62,58,0.42)',
      });

      const glowEl = el('div', 'pz3 pz3-glow', root);
      glowEl.style.width = glowEl.style.height = 12 * UNIT + 'px';
      glowEl.style.backgroundImage = glowGradient(toneRgb, 0.4);
      glow = new Item(glowEl);
    }

    outer.addEventListener('click', () => {
      if (i === worksState.index) ctx.onOpenProject(project.project_id);
    });

    return {
      project,
      item: new Item(outer),
      scene,
      inclusion,
      glow,
      solid,
      halo,
      lean: spec.lean,
      /*
        The turn at which a facet is square to the camera, which is where a crystal
        comes to rest at the front. Both renderers build the same solid — its faces sit
        between the vertices and take half the top ring's twist — so one angle serves.
      */
      rest: spec.twist / 2,
      yaw: i,
      shardFrom: i * perCrystal,
      shardCount: perCrystal,
    };
  });

  /** Where a crystal's shards scatter to mid-handoff. Seeded, so it repeats exactly. */
  const scatterRnd = mulberry(31337);
  const scatter = crystals.map(() =>
    Array.from({ length: SCATTER }, () => [
      (scatterRnd() - 0.5) * 9,
      (scatterRnd() - 0.5) * 7,
      (scatterRnd() - 0.5) * 9,
    ])
  );

  worksState.total = ordered.length;
  worksState.shown = Math.min(HOME_COUNT, ordered.length);

  let radius: number = WORLD.works.radius;
  let ring = 0;

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        if (root.style.pointerEvents !== 'none') root.style.pointerEvents = 'none';
        for (const c of crystals) {
          c.solid?.show(false);
          c.halo?.show(false);
        }
        return;
      }
      if (root.style.display === 'none') root.style.display = '';
      if (root.style.pointerEvents !== 'auto') root.style.pointerEvents = 'auto';

      const { cam, time, delta } = f;
      const total = crystals.length;
      const shown = worksState.expanded ? total : Math.min(HOME_COUNT, total);
      worksState.shown = shown;
      worksState.total = total;

      // Expanding opens the ring rather than replacing it: same scene, more room.
      const wantRadius = WORLD.works.radius * (worksState.expanded ? 1.34 : 1);
      radius += (wantRadius - radius) * (1 - Math.exp(-delta * 3));
      const step = (Math.PI * 2) / Math.max(1, shown);

      /*
        Stepped across the act's hold, so the ring is only ever turned while the camera
        is parked on its hub. It used to run across the whole window and round to the
        nearest of `shown - 1` steps, which gave the first and last projects half the
        dwell of the middle ones — and spent that half on the fly-in and the fly-out,
        where the crystal was still fading up or already dissolving.
      */
      const index = itemIndex(f.t, act, shown);
      worksState.index = index;

      // Ease to the nearest index so a crystal is centred and full size for most of the
      // act, instead of every position being a half-way blur between two.
      const target = index * step;
      ring += (target - ring) * (1 - Math.exp(-delta * 4.5));

      const remaining = Math.abs(ring - target) / step;
      const handoff = clamp01(remaining);
      worksState.handoff = handoff;

      const cosR = Math.cos(ring);
      const sinR = Math.sin(ring);
      const z0 = WORLD.works.z;

      for (let i = 0; i < total; i++) {
        const c = crystals[i];
        if (i >= shown) {
          c.item.show(false);
          c.glow?.show(false);
          c.solid?.show(false);
          c.halo?.show(false);
          continue;
        }

        const angle = i * step;
        const lx = Math.sin(angle) * radius;
        const lz = -Math.cos(angle) * radius;
        // The ring's own turn, about the hub the camera is sitting on.
        const wx = lx * cosR + lz * sinR;
        const wz = -lx * sinR + lz * cosR;

        // Angular distance from dead ahead — exact, rather than inferred from scroll,
        // because the two disagree during the eased turn.
        let delta2 = angle - ring;
        delta2 = Math.atan2(Math.sin(delta2), Math.cos(delta2));
        const near = clamp01(1 - Math.abs(delta2) / step);

        /*
          The crystal's own turn. Away from the front it spins freely; as it arrives it
          slows and a spring draws it to the nearest face-on facet, with a slow sway
          left in so it never looks switched off. The well is sixty degrees wide and the
          sway a tenth of that, so a parked crystal can never slip into the next facet.
        */
        const pull = near * near;
        c.yaw += delta * 0.14 * (1 - 0.9 * pull);
        const settle = c.rest + Math.round((c.yaw - c.rest) / FACET) * FACET + Math.sin(time * 0.45 + i) * 0.1;
        c.yaw += (settle - c.yaw) * (1 - Math.exp(-delta * 2.4 * pull));
        const tilt = Math.sin(time * 0.2 + i) * 0.08;

        const scale = (0.42 + (1.12 - 0.42) * near * near) * (1 - handoff * 0.12 * near);

        const fade = presence * (0.3 + 0.7 * near) * (1 - handoff * 0.2 * near);
        if (c.solid) {
          c.solid.show(true);
          c.solid.pose(wx, 0, z0 + wz, tilt, c.yaw, c.lean);
          c.solid.size(scale);
          c.solid.fade(fade);
          // The crystal at the front is the one lit from inside, and its mark with it.
          c.solid.shine(0.6 + near * 1.4);
        }

        cam.project(wx, 0, z0 + wz, p);
        if (c.item.show(p.visible)) {
          c.item.transform(place(p.x, p.y, p.scale * scale));
          c.item.order(Math.round(4000 - p.depth * 8));
          // On WebGL the element is only a hit area over the mesh; it has nothing to turn.
          if (c.scene) {
            c.item.opacity(fade * p.fog);
            c.item.el.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
            c.scene.pose(0, 0, 0, tilt, c.yaw, c.lean);
            c.scene.commitView(cam);
            // Undo the solid's turn, so the mark inside it always faces the eye.
            transpose(c.scene.viewRotation, inverse);
            c.inclusion?.transform(cssMatrix(inverse, 0, 0, 0) + ' translate(-50%,-50%)');
            c.inclusion?.opacity(0.45 + 0.55 * near);
          }
        }

        /*
          The glow stands just behind the crystal, where the CSS stage paints its own, so
          it backlights the glass instead of washing over it. In front, an additive halo
          in a light brand colour — Pocketalk's yellow — turned the whole crystal and the
          mark inside it into one flat glare.
        */
        if (c.halo) {
          c.halo.show(near > 0.01);
          c.halo.pose(wx * 1.08, 0, z0 + wz * 1.08);
          c.halo.fade(presence * near * 0.85);
        } else if (c.glow) {
          cam.project(wx * 0.9, 0, z0 + wz * 0.9, p);
          if (c.glow.show(p.visible && near > 0.01)) {
            c.glow.transform(place(p.x, p.y, p.scale));
            c.glow.opacity(presence * near * f.look.glow * 0.85 * p.fog);
            c.glow.order(Math.round(3900 - p.depth * 8));
          }
        }
      }

      /**
       * The handoff: the two crystals either side of the boundary lease their shard
       * slices, and the pool eases those shards out of the old prism, through a seeded
       * scatter, and back onto the new one. Nothing is created or destroyed.
       */
      if (perCrystal > 0 && handoff > 0.02 && shown > 1) {
        /*
          Which crystal we are coming from: the neighbour the ring is still swinging
          away from. Taken from the ring's own eased angle rather than re-derived from
          scroll, because the two disagree during the turn — and because the scroll
          position is a step function now, so it no longer says which way we are going.
        */
        const from = Math.max(
          0,
          Math.min(shown - 1, index + (ring < target ? -1 : 1))
        );
        if (from !== index) {
          const out = crystals[from];
          const eased = smooth(1 - handoff);
          const lanes = Math.min(out.shardCount, SCATTER);
          for (let k = 0; k < lanes; k++) {
            const off = scatter[from][k];
            const a1 = from * step;
            const a2 = index * step;
            const fx = Math.sin(a1) * radius + off[0];
            const fz = -Math.cos(a1) * radius + off[2];
            const tx = Math.sin(a2) * radius + off[0];
            const tz = -Math.cos(a2) * radius + off[2];
            const y = off[1];
            const x1 = fx * cosR + fz * sinR;
            const z1 = -fx * sinR + fz * cosR;
            const x2 = tx * cosR + tz * sinR;
            const z2 = -tx * sinR + tz * cosR;
            shardClaims.leases.set(out.shardFrom + k, {
              x: x1 + (x2 - x1) * eased,
              y,
              z: z0 + z1 + (z2 - z1) * eased,
              claim: handoff,
              scale: 1.5,
            });
          }
        }
      }
    },
  };
}
