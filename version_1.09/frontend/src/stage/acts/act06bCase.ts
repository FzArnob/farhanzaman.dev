/**
 * Act 06b — Core open.
 *
 * Click the front core and the camera flies through a facet into its interior. Inside:
 * `tech_stack` as satellite chips on orbits, `challenges` as glowing fracture lines in
 * the inner wall, and the project's media on the chamber itself.
 *
 * This replaces the old /work?id= page with no route change and no reload — the same
 * fields, read from the same JSON, in a place instead of on a page. The words that go
 * with it are the overlay's ProjectPanel; nothing here is text.
 *
 * The shell is a backdrop rather than a projected solid. The camera is 4.2 units inside
 * a chamber 9 units across, so the wall fills the frame in every direction — projecting
 * it would be a great deal of arithmetic to arrive at a full-screen rectangle.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import { Item, UNIT, el, place, q, span } from '../dom';
import { bandHex } from '../../lib/band';
import { RECT, filament, rimSheen, slab } from '../glass';
import { glowGradient, TEAL_RGB } from '../look';
import { caseOpenState } from '../liveState';
import { WORLD, clamp01, smooth } from '../timeline';
import { glassTone, projectRgb, rgbString } from '../../lib/projectTheme';

/** Chips are the tech stack, capped so a 20-item stack does not become confetti. */
const MAX_CHIPS = 18;
/** A chip's size, in world units: a bar, not a label. */
const CHIP_W = 0.9;
const CHIP_H = 0.28;
const CHIP_D = 0.14;
const CHAMBER_R = 8.8;

export function createCaseAct(ctx: BuildContext): Act {
  const root = el('div', 'pz3-act pz3-act-case', ctx.host);
  const a = newProjected();
  const b = newProjected();
  const look = ctx.look;

  const shell = el('div', 'pz3-chamber', root);
  shell.style.background = look.frameBack;
  const shellArt = el('div', 'pz3-chamber-art', shell);
  const vignette = el('div', 'pz3-chamber-vignette', shell);
  vignette.style.background =
    `radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 34%, ${look.background} 100%)`;

  const glowEl = el('div', 'pz3 pz3-glow', root);
  glowEl.style.width = glowEl.style.height = 18 * UNIT + 'px';
  glowEl.style.backgroundImage = glowGradient(TEAL_RGB, 0.34);
  const glow = new Item(glowEl);

  /*
    Up to eighteen chips, built once and re-coloured when the project changes. Each is
    a small bar with real sides, turned to face the middle of the chamber, so it
    foreshortens and shows its end as it swings round rather than being squeezed flat.
  */
  const chips = Array.from({ length: MAX_CHIPS }, () => {
    const node = el('div', 'pz3 pz3-chip', root);
    node.style.width = q(CHIP_W * UNIT) + 'px';
    node.style.height = q(CHIP_H * UNIT) + 'px';
    const turn = el('div', 'pz3-chip-3d', node);
    slab(turn, RECT, CHIP_W * UNIT, CHIP_H * UNIT, CHIP_D * UNIT, look);
    const face = el('div', 'pz3-chip-face', turn);
    return { item: new Item(node), turn, face };
  });

  /* Eight fracture lines at six segments each: the most any project asks for. */
  const cracks = Array.from({ length: 8 * 6 }, () => {
    const node = el('div', 'pz3 pz3-line pz3-crack', root);
    // A fracture in glass is lit from inside it, brightest along its centre — which is
    // what a filament is. A flat fill would read as a drawn line on the wall instead.
    node.style.backgroundImage = filament(look.bloom ? '253,33,85' : '215,15,65', look);
    return new Item(node);
  });

  let currentId: string | null = null;
  let chipCount = 0;
  let crackCount = 0;

  /** Reads the open project and re-dresses the chamber for it. */
  function dress(): void {
    const id = ctx.openProject();
    if (id === currentId) return;
    currentId = id;
    const project = id ? ctx.profile.projects.find((pr) => pr.project_id === id) ?? null : null;
    if (!project) return;

    const art = project.media?.find((m) => m.media_type === 'Image')?.media_link ?? '';
    shellArt.style.backgroundImage = art ? `url("${art}")` : 'none';
    // You are inside the project's crystal now, so the light in here is its colour.
    glowEl.style.backgroundImage = glowGradient(rgbString(glassTone(projectRgb(project), !look.bloom)), 0.34);

    const stack = String(project.tech_stack || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_CHIPS);
    chipCount = stack.length;
    for (let i = 0; i < chipCount; i++) {
      chips[i].face.style.backgroundColor = bandHex(i / Math.max(1, chipCount - 1));
      chips[i].face.style.backgroundImage = rimSheen(look);
    }

    // One fracture per challenge sentence, drawn into the inner wall.
    crackCount = Math.max(
      1,
      Math.min(
        8,
        String(project.challenges || '')
          .split(/[.;]\s+/)
          .filter((s) => s.trim().length > 8).length
      )
    );
  }

  return {
    root,
    update(f: Frame) {
      dress();
      const open = caseOpenState.progress;
      if (open <= 0.004) {
        if (root.style.display !== 'none') root.style.display = 'none';
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time } = f;
      const eased = smooth(clamp01(open));
      const z0 = WORLD.works.z - WORLD.works.radius;

      shell.style.opacity = (eased * 0.96).toFixed(3);

      cam.project(0, 0, z0, a);
      if (glow.show(a.visible)) {
        glow.transform(place(a.x, a.y, a.scale));
        glow.opacity(eased * f.look.glow * 0.6);
        glow.order(20);
      }

      /* ---- the tech stack, in orbit ---- */
      for (let i = 0; i < chips.length; i++) {
        const chip = chips[i];
        if (i >= chipCount) {
          chip.item.show(false);
          continue;
        }
        const orbit = 3.4 + (i % 3) * 1.5;
        const angle = (i / Math.max(1, chipCount)) * Math.PI * 2 + time * (0.1 + (i % 3) * 0.05);
        const y = Math.sin(angle * 1.6 + i) * 1.9;
        cam.project(Math.cos(angle) * orbit, y, z0 + Math.sin(angle) * orbit, a);
        if (!chip.item.show(a.visible)) continue;
        chip.item.transform(place(a.x, a.y, a.scale * eased));
        chip.item.opacity(eased * 0.9);
        chip.item.order(Math.round(4000 - a.depth * 8));
        chip.item.el.style.setProperty('--pz3-persp', q(a.depth * UNIT) + 'px');
        // Face the middle: the face's normal turned to point back along the radius.
        const faceYaw = Math.atan2(-Math.cos(angle), -Math.sin(angle));
        chip.turn.style.transform = `rotateY(${q((faceYaw * 180) / Math.PI)}deg)`;
      }

      /* ---- the challenges, as cracks in the wall ---- */
      // Fracture lines breathe: the challenges are live, not resolved.
      const crackAlpha = eased * (0.45 + 0.35 * Math.sin(time * 1.4));
      for (let i = 0; i < cracks.length; i++) {
        const crack = Math.floor(i / 6);
        const seg = i % 6;
        if (crack >= crackCount) {
          cracks[i].show(false);
          continue;
        }
        const angle = (crack / crackCount) * Math.PI * 2;
        const tilt = -0.5 + (crack / Math.max(1, crackCount - 1)) * 1.0;
        // A jagged polyline across the shell, so it reads as a crack, not a meridian.
        const at = (s: number) => {
          const wobble = s === 0 ? 0 : ((s % 2 === 0 ? 1 : -1) * 0.5) / s;
          const aa = angle + wobble * 0.16;
          return [
            Math.cos(aa) * CHAMBER_R,
            tilt * 6 + (s === 0 ? 0 : s * 1.15 - 3.4),
            z0 + Math.sin(aa) * CHAMBER_R,
          ];
        };
        const from = at(seg);
        const to = at(seg + 1);
        if (!cam.segment(from[0], from[1], from[2], to[0], to[1], to[2], a, b)) {
          cracks[i].show(false);
          continue;
        }
        cracks[i].show(true);
        cracks[i].transform(span(a.x, a.y, b.x, b.y, 1.5));
        cracks[i].opacity(crackAlpha);
        cracks[i].order(15);
      }
    },
  };
}
