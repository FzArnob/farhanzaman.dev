/**
 * Act 07 — The Void Gallery.
 *
 * The only act with a floor. The shift in gravity is the point: it marks the move from
 * work to person, and after 700vh of weightlessness it lands without a word of copy.
 *
 * Works hang at staggered depths down a dark hall, each lit by its own soft spill that
 * bounces a tint of the image onto the surrounding dark. Category sets the plinth
 * colour. thumb_url loads first and image_url swaps in on approach, so nothing is ever
 * a grey rectangle and nothing loads eleven full-resolution photographs.
 *
 * The floor is drawn as a clipped plane: four corners projected, one `clip-path`. That
 * is the whole surface — no tessellation, no texture, and the perspective is exact
 * because the corners came out of the same projection everything else uses.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q } from '../dom';
import { HOBBIES_PREVIEW, buildGallery } from '../data';
import { bandHex } from '../../lib/band';
import { extrude, leafCount, reflection, rimSheen } from '../glass';
import { glowGradient } from '../look';
import { galleryState } from '../liveState';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/** How deep a frame stands off the wall, in world units. */
const FRAME_DEPTH = 0.14;

export function createHobbiesAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.hobbies;
  const root = el('div', 'pz3-act pz3-act-hall', ctx.host);
  const p = newProjected();
  const look = ctx.look;
  const { zNear, zFar, floorY } = WORLD.hobbies;

  /* The floor arrives with the act and leaves with it — gravity is temporary. */
  const floorEl = el('div', 'pz3-floor', root);
  floorEl.style.background = look.bloom
    ? 'linear-gradient(180deg, rgba(9,14,16,0.96) 0%, rgba(4,6,7,0.7) 100%)'
    : 'linear-gradient(180deg, rgba(223,230,228,0.96) 0%, rgba(240,244,243,0.72) 100%)';
  const floorCorners = newProjected();

  const frames = buildGallery(ctx.profile.gallery);

  const works = frames.map((frame, i) => {
    const spillEl = el('div', 'pz3 pz3-glow', root);
    spillEl.style.width = spillEl.style.height = 6 * UNIT + 'px';
    spillEl.style.backgroundImage = glowGradient('255,255,255', 0.42);

    const outer = el('div', 'pz3 pz3-art', root);
    outer.style.width = q(frame.width * UNIT) + 'px';
    outer.style.height = q(frame.height * UNIT) + 'px';
    const turn = el('div', 'pz3-art-3d', outer);

    /*
      Works hang on the walls of a hall the camera walks down, so they are seen at an
      angle for the whole act — which is the one condition under which a frame's depth
      is the difference between a painting and a poster.
    */
    extrude(turn, '', FRAME_DEPTH * UNIT, leafCount(ctx.quality.extrusion), look);

    const img = el('img', 'pz3-art-img', turn);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    // The pane over the work. A gallery is lit from above; this is that light on glass.
    const gloss = el('div', 'pz3-gloss', turn);
    gloss.style.backgroundImage = reflection(look);

    // The plinth carries the category, as a band-coloured bar under the work.
    const plinth = el('div', 'pz3 pz3-plinth', root);
    plinth.style.width = q(frame.width * 0.72 * UNIT) + 'px';
    plinth.style.height = q(0.06 * UNIT) + 'px';
    plinth.style.backgroundColor = bandHex(frame.band);
    plinth.style.backgroundImage = rimSheen(look);

    outer.addEventListener('pointerenter', () => {
      galleryState.hovered = i;
    });
    outer.addEventListener('pointerleave', () => {
      if (galleryState.hovered === i) galleryState.hovered = -1;
    });
    outer.addEventListener('click', () => ctx.onLightbox(i));

    return {
      frame,
      item: new Item(outer),
      turn,
      img,
      spill: new Item(spillEl),
      plinth: new Item(plinth),
      /** Damped: the yaw toward the walkway, the swell on approach, the fade. */
      yaw: frame.x < 0 ? 0.5 : -0.5,
      shown: 1,
      alpha: 0,
      /** Which source is loaded — nothing, the thumb, or the full image. */
      level: 0,
    };
  });

  galleryState.total = ctx.profile.gallery.length;
  galleryState.shown = Math.min(HOBBIES_PREVIEW, ctx.profile.gallery.length);

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.04, 0.03);
      if (presence <= 0.005) {
        if (root.style.display !== 'none') root.style.display = 'none';
        if (root.style.pointerEvents !== 'none') root.style.pointerEvents = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';
      if (root.style.pointerEvents !== 'auto') root.style.pointerEvents = 'auto';

      const { cam, delta } = f;
      galleryState.total = ctx.profile.gallery.length;
      galleryState.shown = galleryState.expanded
        ? ctx.profile.gallery.length
        : Math.min(HOBBIES_PREVIEW, ctx.profile.gallery.length);

      /*
        The floor.

        Four corners projected and joined with one `clip-path` — no tessellation, no
        texture, and the perspective is exact because the corners came out of the same
        projection everything else uses.

        The near edge is held just in front of the camera rather than at the hall's own
        near end. Once the camera is inside the hall that end is behind it, and a quad
        that straddles the eye cannot be projected at all: the two front corners come
        out behind the viewer and the floor blinks away exactly when the visitor is
        standing on it. Sliding the edge forward clips the plane instead of losing it,
        and the part that gets cut is the part that was behind you.
      */
      const half = 13;
      const near = Math.min(zNear + 12, cam.pos.z - 0.6);
      const far = zFar - 12;
      let clip = '';
      let ok = far < near;
      const corners: Array<[number, number, number]> = [
        [-half, floorY, near],
        [half, floorY, near],
        [half, floorY, far],
        [-half, floorY, far],
      ];
      for (const c of corners) {
        if (!ok) break;
        cam.project(c[0], c[1], c[2], floorCorners);
        if (floorCorners.depth <= 0.05) {
          ok = false;
          break;
        }
        clip += (clip ? ',' : '') + `${q(floorCorners.x)}px ${q(floorCorners.y)}px`;
      }
      if (ok) {
        floorEl.style.display = '';
        floorEl.style.clipPath = `polygon(${clip})`;
        floorEl.style.opacity = (presence * 0.9).toFixed(3);
      } else {
        floorEl.style.display = 'none';
      }

      /* ---- the works ---- */
      const k = 1 - Math.exp(-delta * 4);
      const ks = 1 - Math.exp(-delta * 6);
      const camZ = cam.pos.z;

      for (let i = 0; i < works.length; i++) {
        const w = works[i];
        const inWindow = i < galleryState.shown;
        // Outside the current window this work is not in the hall at all — no image
        // request, no spill, nothing to draw.
        if (!inWindow && w.alpha <= 0.01) {
          w.item.show(false);
          w.spill.show(false);
          w.plinth.show(false);
          continue;
        }

        const nearness = clamp01(1 - Math.abs(camZ - w.frame.z) / 22);

        /*
          Thumb first; the full image is requested only once the camera is close. A
          work outside the window asks for nothing, which is what keeps the initial
          payload to six thumbnails instead of eleven full-resolution photographs.
        */
        if (inWindow && w.level === 0) {
          w.level = 1;
          w.img.src = w.frame.item.thumb_url;
        } else if (inWindow && w.level === 1 && nearness > 0.45) {
          w.level = 2;
          w.img.src = w.frame.item.image_url;
        }

        const hovered = galleryState.hovered === i;
        // Works angle in toward the walkway, the way they would be hung in a real hall.
        const face = w.frame.x < 0 ? 0.5 : -0.5;
        w.yaw += (face * (1 - nearness * 0.7) - w.yaw) * k;
        const x = w.frame.x * (1 - nearness * 0.12);
        w.shown += ((1 + nearness * 0.1 + (hovered ? 0.1 : 0)) - w.shown) * ks;
        w.alpha += ((inWindow ? 0.3 + nearness * 0.7 : 0) - w.alpha) * k;

        cam.project(x, w.frame.y, w.frame.z, p);
        if (w.item.show(p.visible)) {
          w.item.transform(place(p.x, p.y, p.scale * w.shown));
          w.item.opacity(w.alpha * presence * p.fog);
          w.item.order(Math.round(4000 - p.depth * 8));
          w.item.el.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
          w.turn.style.transform = `rotateY(${q((w.yaw * 180) / Math.PI)}deg)`;
        }

        cam.project(x, w.frame.y - w.frame.height / 2 - 0.28, w.frame.z, p);
        if (w.plinth.show(p.visible)) {
          w.plinth.transform(place(p.x, p.y, p.scale * w.shown));
          w.plinth.opacity(w.alpha * presence * 0.85 * p.fog);
          w.plinth.order(Math.round(4001 - p.depth * 8));
        }

        /*
          The spill is the whole lighting design here: each work lights its own patch
          of the dark, so the hall is read entirely through the art on its walls.
        */
        cam.project(x + (w.frame.x < 0 ? 1.6 : -1.6), w.frame.y, w.frame.z + 1.4, p);
        if (w.spill.show(p.visible && nearness > 0.01)) {
          w.spill.transform(place(p.x, p.y, p.scale));
          w.spill.opacity(
            nearness * presence * (f.look.bloom ? 0.5 : 0.2) * (hovered ? 1.5 : 1) * p.fog
          );
          w.spill.order(Math.round(3900 - p.depth * 8));
        }
      }
    },
  };
}
