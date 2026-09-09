/**
 * Act 05 — The Constellation.
 *
 * Hexagonal glass tiles in a star field, each carrying its certificate mark. The
 * certification logos are already SVGs in view/static/svg/, so they are `<img>` here
 * with no raster assets to produce and no texture cache to manage — the browser's own
 * image cache does that job, and a logo that fails to load simply leaves the tile bare
 * rather than stalling a loader.
 *
 * Position is data, not decoration: X is the certification date and distance from the
 * axis is the level, with Advanced innermost. So the shape of the constellation is the
 * actual trajectory. Faint lines join tiles from the same issuer.
 *
 * Hover turns a tile face-on — it "flips" to present itself — and a click sends the
 * index to the overlay, which is where the certificate's name, level and link live.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q, span } from '../dom';
import { buildConstellation } from '../data';
import { extrude, filament, glassPane, leafCount } from '../glass';
import { TEAL_RGB } from '../look';
import { constellationState } from '../liveState';
import { hexClip } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence } from '../timeline';

/** hexTileGeometry(0.85, 0.14): the tile's radius, and the logo plane inside it. */
const TILE_RADIUS = 0.85;
const LOGO_SIZE = 1.15;
/** How thick the hexagon is cut, in world units. */
const TILE_DEPTH = 0.16;

export function createAchievementsAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.achievements;
  const root = el('div', 'pz3-act pz3-act-certs', ctx.host);
  const a = newProjected();
  const b = newProjected();
  const look = ctx.look;

  const { tiles, links } = buildConstellation(ctx.profile.achievements);

  const nodes = tiles.map((tile, i) => {
    const outer = el('div', 'pz3 pz3-tile', root);
    outer.style.width = outer.style.height = TILE_RADIUS * 2 * UNIT + 'px';
    const turn = el('div', 'pz3-tile-3d', outer);

    /*
      A certificate is a cut hexagon of glass, not a hexagonal sticker. Hover flips a
      tile face-on, which means every tile spends most of its time turned away from you
      — and a turned decal is an invisible decal. The extrusion is what it turns on.
    */
    const clip = hexClip();
    extrude(turn, clip, TILE_DEPTH * UNIT, leafCount(ctx.quality.extrusion), look);

    const face = el('div', 'pz3-tile-face', turn);
    face.style.clipPath = clip;
    face.style.backgroundColor = look.frameBack;
    face.style.backgroundImage = glassPane(look, TEAL_RGB);

    const logo = el('img', 'pz3-tile-logo', turn);
    logo.src = '/' + tile.achievement.certification_logo.replace(/^\/+/, '');
    logo.alt = '';
    logo.loading = 'lazy';
    logo.decoding = 'async';
    logo.width = LOGO_SIZE * UNIT;
    logo.height = LOGO_SIZE * UNIT;

    outer.addEventListener('pointerenter', () => {
      constellationState.hovered = i;
    });
    outer.addEventListener('pointerleave', () => {
      if (constellationState.hovered === i) constellationState.hovered = -1;
    });
    outer.addEventListener('click', () => ctx.onAchievement(i));

    return { item: new Item(outer), turn, tile, spin: Math.PI * 0.16, shown: 1 };
  });

  /* Faint lines between tiles from the same issuer. */
  const wires = links.map(() => {
    const node = el('div', 'pz3 pz3-line pz3-wire', root);
    node.style.backgroundImage = filament(TEAL_RGB, look);
    return new Item(node);
  });

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.035, 0.035);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        if (root.style.pointerEvents !== 'none') root.style.pointerEvents = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';
      if (root.style.pointerEvents !== 'auto') root.style.pointerEvents = 'auto';

      const { cam, time, delta } = f;
      const z = WORLD.achievements.z;
      const k = 1 - Math.exp(-delta * 5);
      const ks = 1 - Math.exp(-delta * 6);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const tile = node.tile;
        const hovered = constellationState.hovered === i;

        // Hover turns the tile edge-on and then face-on: it flips to show its detail.
        const wantSpin = hovered ? 0 : Math.sin(time * 0.35 + i) * 0.5 + Math.PI * 0.16;
        node.spin += (wantSpin - node.spin) * k;
        node.shown += ((hovered ? 1.35 : 1) - node.shown) * ks;
        const y = tile.y + Math.sin(time * 0.4 + i * 2.1) * 0.16;

        cam.project(tile.x, y, z + tile.z, a);
        if (!node.item.show(a.visible)) continue;
        node.item.transform(place(a.x, a.y, a.scale * node.shown));
        node.item.opacity(presence * 0.92 * a.fog);
        node.item.order(Math.round(4000 - a.depth * 8));
        node.item.el.style.setProperty('--pz3-persp', q(a.depth * UNIT) + 'px');
        node.turn.style.transform =
          `rotateY(${q((node.spin * 180) / Math.PI)}deg) ` +
          `rotateZ(${q((-Math.sin(time * 0.22 + i * 1.7) * 0.08 * 180) / Math.PI)}deg)`;
      }

      for (let i = 0; i < wires.length; i++) {
        const [from, to] = links[i];
        const p1 = tiles[from];
        const p2 = tiles[to];
        if (!cam.segment(p1.x, p1.y, z + p1.z, p2.x, p2.y, z + p2.z, a, b)) {
          wires[i].show(false);
          continue;
        }
        wires[i].show(true);
        wires[i].transform(span(a.x, a.y, b.x, b.y, 1.6));
        wires[i].opacity(presence * 0.3 * Math.max(a.fog, b.fog));
        wires[i].order(1);
      }
    },
  };
}
