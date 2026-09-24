/**
 * A project's own colour and mark.
 *
 * The rest of the build keeps to two hues (see band.ts). Projects are the one
 * deliberate exception: each carries its brand colour and logo in profile.json, and
 * that colour lives only inside its own crystal and the few surfaces that belong to
 * the project — never on the world around it. A ring of eight brands reads as eight
 * objects; the room they stand in stays teal and crimson.
 *
 * Lives in lib/ with no three.js import, because the overlay and the flat pages need
 * these values as well as the stage.
 */

import type { Project } from '../types/profile';

export type Rgb = [number, number, number];

/** The theme teal, for a project whose colour is missing or unreadable. */
const FALLBACK: Rgb = [0, 211, 180];

/** `#rgb` or `#rrggbb`, with or without the hash. Anything else is the fallback. */
export function parseHex(hex: string | null | undefined): Rgb {
  const raw = String(hex || '').trim().replace(/^#/, '');
  const full = /^[0-9a-f]{3}$/i.test(raw) ? raw.replace(/./g, (c) => c + c) : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) return [...FALLBACK];
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function projectRgb(project: Project): Rgb {
  return parseHex(project.theme_color);
}

export function rgbString([r, g, b]: Rgb): string {
  return `${r},${g},${b}`;
}

export function hexString([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function toHsl([r, g, b]: Rgb): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R ? ((G - B) / d + (G < B ? 6 : 0)) / 6 : max === G ? ((B - R) / d + 2) / 6 : ((R - G) / d + 4) / 6;
  return [h, s, l];
}

function fromHsl(h: number, s: number, l: number): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255].map(Math.round) as Rgb;
  const hue = (p: number, q: number, t: number) => {
    const u = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (u < 1 / 6) return p + (q - p) * 6 * u;
    if (u < 1 / 2) return q;
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue(p, q, h + 1 / 3), hue(p, q, h), hue(p, q, h - 1 / 3)].map((c) => Math.round(c * 255)) as Rgb;
}

/**
 * The brand colour, as glass can carry it.
 *
 * Brand colours are chosen for a white page, and a crystal is not one. A near-white
 * brand (Examiner's pale cyan) turns the Void crystal into a lamp and vanishes on
 * Studio's ground; a near-black one is a hole in either. So hue and saturation are
 * kept — that is what makes the colour the brand's — and only lightness is pulled into
 * the band each world can show glass in.
 */
export function glassTone(rgb: Rgb, light: boolean): Rgb {
  const [h, s, l] = toHsl(rgb);
  const [lo, hi] = light ? [0.3, 0.5] : [0.4, 0.62];
  return fromHsl(h, s, Math.min(hi, Math.max(lo, l)));
}

/** Up to two initials: "Pocketalk Ventana" → PV, "Simba(CSA)" → S. */
export function monogram(name: string): string {
  const words = String(name || '')
    .replace(/\(.*?\)/g, ' ')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  return (words.slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase();
}

/**
 * A stand-in mark for a project with no logo yet: its initials, white, on nothing.
 * Transparent like a real logo, so the crystal treats the two the same way.
 */
export function monogramUri(name: string): string {
  const text = monogram(name);
  const size = text.length > 1 ? 210 : 280;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
    `<text x="256" y="256" dy="0.35em" text-anchor="middle" font-family="Titillium Web, Arial, sans-serif" ` +
    `font-weight="700" font-size="${size}" fill="#ffffff" letter-spacing="-6">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The mark to show: the project's logo, or its monogram when there is none. */
export function logoSrc(project: Project): string {
  return project.logo?.trim() || monogramUri(project.name);
}
