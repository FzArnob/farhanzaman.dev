/**
 * Act 06 — Works.
 *
 * The camera sits at the hub of a ring of crystal prisms, one per project, all facing
 * inward. Scroll turns the ring and brings one to front-centre at full size; the
 * particle net behind them is the flat site's own animation, so they hang inside a
 * live network rather than in an empty void.
 *
 * The home view carries the five most recent projects, ordered the way the flat site
 * orders them — newest contribution first. "View all N projects" grows the ring in
 * place: the radius opens up and the remaining crystals fade in between the existing
 * ones. It stays one continuous scene rather than becoming a separate page.
 *
 * A crystal is six faces around an axis, each clipped to a pointed spindle — the shape
 * quartz actually grows into, and the silhouette the WebGL cores had, in six elements
 * instead of twenty-eight triangles. `backface-visibility: hidden` does the front-face
 * culling the material used to ask for, for free.
 *
 * The transition between crystals is the point of the act. The outgoing prism sheds
 * shards into the shared pool and those same shards reassemble as the incoming one —
 * one canvas, constant count, nothing allocated mid-scroll.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { HOME_COUNT, orderProjects } from '../data';
import { shardClaims } from '../fx/PointField';
import { facetPane } from '../glass';
import { glowGradient, TEAL_RGB } from '../look';
import { worksState } from '../liveState';
import { crystalInteriorUri, crystalSpec, mulberry, spindleClip } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence, clamp01, smooth } from '../timeline';

/** How many shards a crystal scatters through on a handoff. */
const SCATTER = 28;

export function createWorksAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.works;
  const root = el('div', 'pz3-act pz3-act-works', ctx.host);
  const p = newProjected();
  const look = ctx.look;

  const ordered = orderProjects(ctx.profile.projects);
  const perCrystal =
    ctx.quality.shards > 0 ? Math.floor(ctx.quality.shards / Math.max(1, ordered.length)) : 0;

  const crystals = ordered.map((project, i) => {
    const seed = Number(project.project_id) || i + 1;
    const spec = crystalSpec(seed, 2.5);
    const height = spec.half * 2 + spec.cap * 2;
    const capFraction = spec.cap / height;

    const outer = el('div', 'pz3 pz3-crystal', root);
    outer.style.width = q(spec.radius * 2 * UNIT) + 'px';
    outer.style.height = q(height * UNIT) + 'px';
    const spin = el('div', 'pz3-crystal-3d', outer);

    const apothem = spec.radius * Math.cos(Math.PI / 6);
    const clip = spindleClip(capFraction);

    /*
      The body.

      Six turning faces alone do not read as a solid: between the two you can see is a
      third turned edge-on, and the void shows through the seam. So the silhouette is
      drawn once, square to the camera, and the facets ride on top of it. That is also
      where the crystal's contents live — the same seeded abstract the WebGL cores
      carried, quiet on purpose, because what you are meant to read is the logo
      suspended inside rather than the pattern in the glass.
    */
    const core = el('div', 'pz3-crystal-core', outer);
    core.style.width = q(apothem * 2 * UNIT) + 'px';
    core.style.height = q(height * UNIT) + 'px';
    core.style.marginLeft = q(-apothem * UNIT) + 'px';
    core.style.marginTop = q(-height * UNIT * 0.5) + 'px';
    core.style.clipPath = clip;
    const glassRgb = look.bloom ? '0,211,180' : '0,148,127';
    core.style.backgroundImage =
      /*
        Two things happen inside a piece of glass that never happen on a painted panel,
        and both of them are here. The key does not stop at the surface — it carries
        into the body and lands on the far wall, offset from where it went in. And the
        crystal's own colour pools where the light came to rest rather than where it
        struck. Put those below the facets and above the seeded interior and the thing
        acquires an inside.
      */
      `radial-gradient(ellipse 46% 30% at 32% 20%, rgba(255,255,255,${look.bloom ? 0.34 : 0.2}) 0%,` +
      ` rgba(255,255,255,0) 72%),` +
      `radial-gradient(ellipse 36% 48% at 74% 78%, rgba(${glassRgb},${look.bloom ? 0.44 : 0.24}) 0%,` +
      ` rgba(${glassRgb},0) 78%),` +
      `linear-gradient(104deg, rgba(${glassRgb},0.42) 0%,` +
      ` rgba(${glassRgb},0.16) 52%,` +
      ` rgba(${look.bloom ? '4,26,26' : '150,175,170'},0.55) 100%),` +
      crystalInteriorUri(seed, !look.bloom);

    /*
      The six long faces. Each one is a side of the hexagon — side length equals the
      circumradius — stood on the apothem, so the column is exactly the width the
      geometry was. A hair over, so two neighbours never leave a hairline between them.
      The lean is folded into the group rather than each face.
    */
    for (let face = 0; face < 6; face++) {
      const node = el('div', 'pz3-crystal-face', spin);
      node.style.width = q(spec.radius * 1.03 * UNIT) + 'px';
      node.style.height = q(height * UNIT) + 'px';
      node.style.marginLeft = q(-spec.radius * 1.03 * UNIT * 0.5) + 'px';
      node.style.marginTop = q(-height * UNIT * 0.5) + 'px';
      node.style.clipPath = clip;
      node.style.transform =
        `rotateY(${q(face * 60 + (spec.twist * 180) / Math.PI)}deg) translateZ(${q(apothem * UNIT)}px)`;
      /*
        Flat shading, as the material had it: each facet takes a fixed share of the key
        light, and which one is bright is decided by which one is turned toward you.
        The group's rotation does that, so nothing here is touched again after build.

        facetPane adds the part that was missing — a hot line down each facet's two long
        edges. That is where a real prism gives itself away: the ground edge between two
        faces catches the key from whatever direction it arrives, so a turning crystal
        is a moving cage of bright lines. Without them, six shaded quadrilaterals stay
        six shaded quadrilaterals however carefully they are lit.
      */
      const key = 0.16 + 0.5 * Math.abs(Math.cos((face / 6) * Math.PI * 2 + 0.6));
      node.style.backgroundImage = facetPane(look, glassRgb, key, 24 + face * 11);
    }

    const glowEl = el('div', 'pz3 pz3-glow', root);
    glowEl.style.width = glowEl.style.height = 12 * UNIT + 'px';
    glowEl.style.backgroundImage = glowGradient(TEAL_RGB, 0.4);

    /*
      The project's real artwork goes on a billboard inside the crystal rather than on
      its faces: mapped across six facets it came out as an unreadable smear, and the
      whole point of a prism is that you see through it.
    */
    const logoEl = el('img', 'pz3 pz3-crystal-logo', root);
    const art = project.logo_image || project.media?.[0]?.media_link || '';
    if (art) logoEl.src = art;
    logoEl.alt = '';
    logoEl.loading = 'lazy';
    logoEl.decoding = 'async';
    logoEl.style.width = logoEl.style.height = 2 * UNIT + 'px';

    outer.addEventListener('click', () => {
      if (i === worksState.index) ctx.onOpenProject(project.project_id);
    });

    return {
      project,
      item: new Item(outer),
      spin,
      glow: new Item(glowEl),
      logo: new Item(logoEl),
      hasArt: Boolean(art),
      lean: spec.lean,
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
      const presence = actPresence(f.t, act, 0.035, 0.045);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        if (root.style.pointerEvents !== 'none') root.style.pointerEvents = 'none';
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

      const span = act.t1 - act.t0;
      const progress = clamp01((f.t - act.t0) / span) * Math.max(0, shown - 1);
      const index = Math.max(0, Math.min(shown - 1, Math.round(progress)));
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
          c.glow.show(false);
          c.logo.show(false);
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

        const scale = (0.42 + (1.12 - 0.42) * near * near) * (1 - handoff * 0.12 * near);

        cam.project(wx, 0, z0 + wz, p);
        if (c.item.show(p.visible)) {
          c.item.transform(place(p.x, p.y, p.scale * scale));
          c.item.opacity(presence * (0.3 + 0.7 * near) * (1 - handoff * 0.2 * near) * p.fog);
          c.item.order(Math.round(4000 - p.depth * 8));
          c.item.el.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
          c.spin.style.transform =
            `rotateY(${q(((time * 0.14 + i) * 180) / Math.PI)}deg) ` +
            `rotateX(${q((-Math.sin(time * 0.2 + i) * 0.08 * 180) / Math.PI)}deg) ` +
            `rotateZ(${q((-c.lean * 180) / Math.PI)}deg)`;
        }

        // The logo billboard: inside the crystal, always facing you, and only legible
        // on the crystal that is actually at the front.
        if (c.logo.show(p.visible && c.hasArt && near > 0.02)) {
          c.logo.transform(place(p.x, p.y, p.scale * scale));
          c.logo.opacity(presence * near * near * 0.95 * p.fog);
          c.logo.order(Math.round(4001 - p.depth * 8));
        }

        cam.project(wx * 0.9, 0, z0 + wz * 0.9, p);
        if (c.glow.show(p.visible && near > 0.01)) {
          c.glow.transform(place(p.x, p.y, p.scale));
          c.glow.opacity(presence * near * f.look.glow * 0.85 * p.fog);
          c.glow.order(Math.round(3900 - p.depth * 8));
        }
      }

      /**
       * The handoff: the two crystals either side of the boundary lease their shard
       * slices, and the pool eases those shards out of the old prism, through a seeded
       * scatter, and back onto the new one. Nothing is created or destroyed.
       */
      if (perCrystal > 0 && handoff > 0.02 && shown > 1) {
        const from = Math.max(
          0,
          Math.min(shown - 1, Math.round(progress + Math.sign(index - progress)))
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
