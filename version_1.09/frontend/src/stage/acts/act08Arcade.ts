/**
 * Act 08 — The Arcade.
 *
 * A curved video wall at the far end of the gallery hall: the Run Fz Run channel on a
 * cylindrical thumbnail grid. All of the clips are in the data, but only the tiles
 * actually facing the camera get an image, so the wall costs a handful of loads rather
 * than eighty-three.
 *
 * The grid is horizontal — the one place in the build that could have grown a second
 * vertical scroller, and deliberately doesn't.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { loadGamingVideos } from '../../data/loadProfile';
import type { GamingVideo } from '../../types/gaming';
import { glassPane, reflection } from '../glass';
import { TEAL_RGB } from '../look';
import { arcadeState } from '../liveState';
import { ACT_BY_ID, WORLD, actPresence } from '../timeline';

const COLUMNS = 14;
const ROWS = 5;
const RADIUS = 13;
const TILE_W = 1.72;
const TILE_H = 0.98;
/** Thumbnails load for the tiles that are actually facing you. */
const EAGER = COLUMNS * 2;

export function createArcadeAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.arcade;
  const root = el('div', 'pz3-act pz3-act-arcade', ctx.host);
  const p = newProjected();
  const look = ctx.look;
  const wallZ = WORLD.arcade.z;

  interface Tile {
    item: Item;
    turn: HTMLElement;
    img: HTMLImageElement;
    x: number;
    y: number;
    z: number;
    angle: number;
    alpha: number;
    video: GamingVideo | null;
  }

  const tiles: Tile[] = [];

  for (let i = 0; i < COLUMNS * ROWS; i++) {
    const column = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    // Wrap the grid onto a cylinder facing the walkway.
    const angle = (column / COLUMNS - 0.5) * Math.PI * 0.9;

    const outer = el('div', 'pz3 pz3-clip', root);
    outer.style.width = q(TILE_W * UNIT) + 'px';
    outer.style.height = q(TILE_H * UNIT) + 'px';
    /*
      A bevel rather than an extrusion. Every tile on this wall is wrapped onto a
      cylinder that faces the walkway, so no tile ever turns far enough for a real edge
      to show — seventy extruded tiles would be four hundred elements of fill nobody
      can see. A lit top-left and a shaded bottom-right say "thick screen" from the one
      angle these are ever viewed from, and cost one gradient.
    */
    outer.style.backgroundColor = look.bloom ? '#0d1518' : '#dfe7e5';
    outer.style.backgroundImage = glassPane(look, TEAL_RGB);
    const turn = el('div', 'pz3-clip-3d', outer);
    const img = el('img', 'pz3-clip-img', turn);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    // The glass the thumbnail sits behind: without it the picture reads as printed on
    // air rather than as a screen in a wall.
    const gloss = el('div', 'pz3-gloss', turn);
    gloss.style.backgroundImage = reflection(look);

    const index = i;
    outer.addEventListener('pointerenter', () => {
      arcadeState.hovered = index;
    });
    outer.addEventListener('pointerleave', () => {
      if (arcadeState.hovered === index) arcadeState.hovered = -1;
    });
    outer.addEventListener('click', () => {
      const tile = tiles[index];
      if (tile.video) ctx.onOpenClip(tile.video);
    });

    tiles.push({
      item: new Item(outer),
      turn,
      img,
      x: Math.sin(angle) * RADIUS,
      y: (ROWS / 2 - row - 0.5) * (TILE_H + 0.14),
      z: -(RADIUS - Math.cos(angle) * RADIUS),
      angle,
      alpha: 0,
      video: null,
    });
  }

  // Loaded lazily: nobody who stops before act 07 should pay for eighty-three records.
  let live = true;
  loadGamingVideos()
    .then((data) => {
      if (!live) return;
      const all = data.pages.flatMap((page) => page.videos);
      for (let i = 0; i < tiles.length && i < all.length; i++) {
        tiles[i].video = all[i];
        if (i < EAGER) tiles[i].img.src = all[i].video_thumbnail;
      }
      arcadeState.loaded = Math.min(all.length, tiles.length);
    })
    .catch(() => {
      /* the wall simply stays empty */
    });

  return {
    root,
    dispose() {
      live = false;
    },
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.04, 0.04);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        if (root.style.pointerEvents !== 'none') root.style.pointerEvents = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';
      if (root.style.pointerEvents !== 'auto') root.style.pointerEvents = 'auto';

      const { cam, time, delta } = f;
      // A slow drift, so the wall reads as a live feed rather than a poster.
      const sway = Math.sin(time * 0.08) * 0.06;
      const cosS = Math.cos(sway);
      const sinS = Math.sin(sway);
      const k = 1 - Math.exp(-delta * 5);

      for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        if (!tile.video) {
          tile.item.show(false);
          continue;
        }
        // The wall's own sway, about the group's axis.
        const x = tile.x * cosS + tile.z * sinS;
        const z = -tile.x * sinS + tile.z * cosS;

        cam.project(x, tile.y + 0.4, wallZ + z, p);
        if (!tile.item.show(p.visible)) continue;

        // Tiles further round the cylinder need their thumbnail once they are in view.
        if (i >= EAGER && !tile.img.src && p.fog > 0.15) tile.img.src = tile.video.video_thumbnail;

        const hovered = arcadeState.hovered === i;
        const want = presence * (tile.img.src ? (hovered ? 1 : 0.82) : 0.3);
        tile.alpha += (want - tile.alpha) * k;
        tile.item.transform(place(p.x, p.y, p.scale));
        tile.item.opacity(tile.alpha * p.fog);
        tile.item.order(Math.round(4000 - p.depth * 8));
        tile.item.el.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
        // Each tile is tangent to the cylinder, so it faces the walkway rather than
        // the camera — which is what gives the wall its curve.
        tile.turn.style.transform = `rotateY(${q((-(tile.angle + sway) * 180) / Math.PI)}deg)`;
      }
    },
  };
}
