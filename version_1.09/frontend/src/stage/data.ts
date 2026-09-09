/**
 * How the profile becomes a place.
 *
 * These are the pure derivations the acts are built from — where a job sits in the
 * corridor, which certificates share an issuer, what order the projects go in. They
 * were spread across the act files before and are gathered here for one reason: the
 * DOM overlay needs several of them too, and the overlay must not import the stage.
 *
 * Nothing here touches the DOM, and nothing here knows what a pixel is.
 */

import type {
  Achievement,
  Education,
  Experience,
  GalleryItem,
  Project,
} from '../types/profile';
import { WORLD } from './timeline';

/* ------------------------------------------------------------------ works */

/** The flat home page carried the five most recent; Expand opens the rest. */
export const HOME_COUNT = 5;

/** Newest contribution first — "Present" counts as today. */
export function orderProjects(projects: Project[]): Project[] {
  const when = (p: Project) => {
    const raw = p.last_contribution_date;
    if (!raw || /present/i.test(raw)) return Date.now();
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };
  return [...projects].sort((a, b) => when(b) - when(a));
}

/* ------------------------------------------------------------- background */

export interface Slab {
  id: string;
  kind: 'education' | 'experience';
  title: string;
  role: string;
  dates: string;
  detail: string;
  z: number;
  present: boolean;
}

function year(date: string | null): number {
  if (!date) return new Date().getFullYear();
  const y = parseInt(String(date).slice(0, 4), 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

/** Strips the markup the admin editor leaves in `activity` and `project_details`. */
export function plain(html: string | null): string {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Guarantees every block in a row its own moment on screen.
 *
 * Dates alone bunch badly, and the real data is the proof: the three roles have
 * midpoints in 2019, 2021 and 2024 against a corridor that spans 2009 to now, which
 * put them 3–4 units apart — close enough that the newest two overlapped on screen and
 * the third was hidden behind them. Order and direction still come from the dates;
 * this only pushes neighbours apart until each one can be read.
 *
 * The gap collapses to whatever the corridor can afford if a row ever grows long
 * enough that the requested spacing will not fit, so the row can never run past either
 * end of the cable.
 */
function spaceOut(rows: Slab[], minGap: number, zNear: number, zFar: number): void {
  if (rows.length < 2) return;
  rows.sort((a, b) => a.z - b.z);
  const gap = Math.min(minGap, (zNear - zFar) / (rows.length - 1));

  for (let i = 1; i < rows.length; i++) {
    rows[i].z = Math.max(rows[i].z, rows[i - 1].z + gap);
  }
  // Pushing forward can run the newest entry past the near end; sliding the whole row
  // back preserves every gap, and the far end then lands inside zFar by construction,
  // because the gap was capped at the corridor's own length.
  const over = rows[rows.length - 1].z - zNear;
  if (over > 0) for (const r of rows) r.z -= over;
}

/**
 * Time becomes depth: a block's Z is its date, so the corridor you fly down is a
 * timeline you travel, and education and experience are visibly simultaneous.
 *
 * Each row is spaced on its own, then the roles are held half a gap further out.
 * Spacing them independently lands both rows on the same depths — the two histories
 * run in parallel, so their date order is the same order — and a pair arriving
 * together is two things to read at once and half the corridor left empty. Offsetting
 * one row interleaves them: education, role, education, role, one at a time.
 */
export function buildSpine(
  educations: Education[],
  experiences: Experience[],
  minGap = 8
): Slab[] {
  const rows: Slab[] = [];
  const all = [
    ...educations.map((e) => ({ kind: 'education' as const, row: e })),
    ...experiences.map((e) => ({ kind: 'experience' as const, row: e })),
  ];
  if (all.length === 0) return rows;

  // The corridor spans the whole career, oldest at the far end.
  const starts = all.map((a) => year(a.row.start_date));
  const ends = all.map((a) =>
    a.row.is_present === '1' ? new Date().getFullYear() : year(a.row.end_date)
  );
  const minYear = Math.min(...starts);
  const maxYear = Math.max(...ends);
  const span = Math.max(1, maxYear - minYear);

  const { zNear, zFar } = WORLD.background;
  for (const { kind, row } of all) {
    const from = year(row.start_date);
    const to = row.is_present === '1' ? new Date().getFullYear() : year(row.end_date);
    const mid = (from + to) / 2;
    const k = (mid - minYear) / span;
    const education = kind === 'education';
    rows.push({
      id: kind + '-' + ('education_id' in row ? row.education_id : row.experience_id),
      kind,
      title: row.institute_name,
      role: education ? (row as Education).subject : (row as Experience).position,
      dates: from + ' → ' + (row.is_present === '1' ? 'now' : to),
      detail: education
        ? plain((row as Education).activity)
        : plain((row as Experience).project_details),
      z: zFar + (zNear - zFar) * k,
      present: row.is_present === '1',
    });
  }

  spaceOut(rows.filter((r) => r.kind === 'education'), minGap, zNear, zFar);
  spaceOut(rows.filter((r) => r.kind === 'experience'), minGap, zNear - minGap / 2, zFar);

  return rows.sort((a, b) => a.z - b.z);
}

/* ----------------------------------------------------------- achievements */

const LEVEL_RADIUS: Record<string, number> = {
  advanced: 0.3,
  intermediate: 0.66,
  basic: 1,
  beginner: 1,
};

export interface CertTile {
  achievement: Achievement;
  x: number;
  y: number;
  z: number;
  issuer: string;
}

function issuerOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'other';
  }
}

/**
 * Position is data, not decoration: X is the certification date and distance from the
 * axis is the level, with Advanced innermost. So the shape of the constellation is the
 * actual trajectory — 2021 basics out on the rim, 2023 SQL right at the core. Faint
 * lines join tiles from the same issuer.
 */
export function buildConstellation(achievements: Achievement[]): {
  tiles: CertTile[];
  links: [number, number][];
} {
  const times = achievements.map((a) => new Date(a.certification_date).getTime() || 0);
  const min = times.length ? Math.min(...times) : 0;
  const max = times.length ? Math.max(...times) : 1;
  const span = Math.max(1, max - min);
  const spread = WORLD.achievements.spread;

  const tiles: CertTile[] = achievements.map((achievement, i) => {
    const k = ((new Date(achievement.certification_date).getTime() || min) - min) / span;
    const radial = LEVEL_RADIUS[achievement.level.toLowerCase()] ?? 0.8;
    // Spiral the angle so tiles at the same date and level do not overlap.
    const angle = i * 2.399963;
    const r = radial * spread * 0.62;
    return {
      achievement,
      // Date runs left (oldest) to right (newest).
      x: (k - 0.5) * spread * 1.9,
      y: Math.sin(angle) * r,
      z: Math.cos(angle) * r * 0.7,
      issuer: issuerOf(achievement.certification_url),
    };
  });

  const links: [number, number][] = [];
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i].issuer === tiles[j].issuer) links.push([i, j]);
    }
  }
  return { tiles, links };
}

/* ---------------------------------------------------------------- hobbies */

/** The flat home page showed a six-item preview; Explore opens the rest. */
export const HOBBIES_PREVIEW = 6;

export interface Frame {
  item: GalleryItem;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  band: number;
}

/**
 * Eleven works hang at staggered depths down a dark hall, alternating walls so the
 * camera has something to look at on both sides. Category sets the plinth colour.
 */
export function buildGallery(items: GalleryItem[]): Frame[] {
  const categories = [...new Set(items.map((i) => i.category))].sort();
  const { zNear, zFar, wallX } = WORLD.hobbies;
  return items.map((item, i) => {
    const k = items.length <= 1 ? 0 : i / (items.length - 1);
    const side = i % 2 === 0 ? -1 : 1;
    const catIndex = categories.indexOf(item.category);
    return {
      item,
      z: zNear + (zFar - zNear) * k,
      x: side * wallX,
      y: -0.6 + ((i % 3) - 1) * 0.75,
      // Portrait and landscape both occur in the data; a fixed 4:3 would crop badly,
      // so the frame starts square and the loaded image corrects it.
      width: 2.6,
      height: 2.6,
      band: categories.length <= 1 ? 0 : catIndex / (categories.length - 1),
    };
  });
}
