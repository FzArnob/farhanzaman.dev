/**
 * The geometry, as CSS can hold it.
 *
 * Every shape in the WebGL build was either an extrusion of a 2D outline or a solid
 * with flat facets, which is the lucky case for a port: an outline becomes a
 * `clip-path` and a facet becomes an element with a static 3D transform. The seeded
 * randomness is carried over verbatim — the same `mulberry` PRNG with the same seeds —
 * so a project's crystal and a corridor block's chamfer are the shapes they always
 * were.
 */

/** Deterministic PRNG — the same project_id always yields the same crystal. */
export function mulberry(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ----------------------------------------------------------------- the mark */

/**
 * The site's own logo: the two teal polygons from view/static/favicon.svg, verbatim.
 *
 * Kept as numbers rather than fetched and parsed so the mark is on screen in the first
 * frame with no network round-trip — and the logo never changes, so there is nothing
 * to keep in sync.
 */
const FZ_POLYGONS = [
  '39.663,4.146 39.697,9.018 76.933,8.724 68.965,18.239 24.452,17.968 24.282,41.406 28.734,41.417 29.074,23.234 71.35,23.234 90.551,4',
  '44.556,30.331 39.697,30.331 39.392,42.039 58.151,42.31 49.608,51.464 23.886,51.23 23.886,95.774 44.5,76.224 44.488,63.375 40.078,63.426 40.078,74.938 28.095,85.038 28.282,56.508 50.132,56.886 71.35,37.066 44.434,36.91',
];

/** Centre of the mark in its own 100-unit SVG space, and the scale down to world units. */
const CX = 57;
const CY = 50.5;
const SCALE = 0.026;

/** The mark's extent in world units, so the stage can size the element that holds it. */
export const MARK = {
  width: 100 * SCALE,
  height: 100 * SCALE,
  /** Extrusion depth, as the WebGL build had it. */
  depth: 0.3,
};

/**
 * The crimson layer's offset, measured from the favicon: the crimson polygon starts at
 * (35.809, 5.92) where the teal one starts at (39.663, 4.146). That is (−3.854, +1.774)
 * in the mark's own space — about 6% of its width at 205°.
 *
 * Everything in the scene that fringes colour is derived from this one vector.
 */
export const ABERRATION = {
  svg: [-3.854, 1.774] as const,
  world: [-3.854 * SCALE, -1.774 * SCALE] as const,
  ratio: Math.hypot(3.854, 1.774) / (90.551 - 23.886),
};

/**
 * The mark as an SVG, in a 100×100 viewBox centred the way the extruded geometry was.
 * One string, cloned for every extrusion layer.
 */
export function markSvg(fill: string, stroke = '', strokeWidth = 0.7): string {
  // An optional cut edge. Glass is brightest where a face ends, and on a mark built
  // from flat polygons that edge is the only place the material can show at all.
  const edge = stroke
    ? ` stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"`
    : '';
  const polys = FZ_POLYGONS.map(
    (points) => `<polygon points="${points}" fill="${fill}"${edge}/>`
  ).join('');
  return (
    `<svg viewBox="${CX - 50} ${CY - 50} 100 100" width="100%" height="100%" ` +
    `aria-hidden="true" focusable="false">${polys}</svg>`
  );
}

/**
 * The mark as a mask, for the travelling specular highlight.
 *
 * The WebGL build lit the sheen with a white point light on a slow orbit. There are no
 * lights here, so the highlight is a white blob that travels behind this mask — which
 * means it can only ever appear ON the mark, never as a glow floating beside it.
 */
export function markMaskUri(): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CX - 50} ${CY - 50} 100 100">` +
    FZ_POLYGONS.map((points) => `<polygon points="${points}" fill="#fff"/>`).join('') +
    '</svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* --------------------------------------------------------- corridor blocks */

/** A point `d` of the way from (x,y) toward (tx,ty), never past 42% of the span. */
function towards(x: number, y: number, tx: number, ty: number, d: number): [number, number] {
  const dx = tx - x;
  const dy = ty - y;
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(d / len, 0.42);
  return [x + dx * k, y + dy * k];
}

/**
 * A block face: a rectangle knocked out of true.
 *
 * Corners take a few percent of jitter and exactly one is chamfered. The bounds stay
 * broadly rectangular on purpose — four lines of type have to sit inside and stay
 * inside as the block yaws — and the face inset is set wide enough that neither the
 * jitter nor the chamfer can ever reach a word.
 *
 * Returned as percentages so one clip-path serves the block at any size.
 */
export function blockClip(w: number, h: number, rnd: () => number): string {
  const unit = Math.min(w, h);
  const jx = () => ((rnd() - 0.5) * unit * 0.08) / w;
  const jy = () => ((rnd() - 0.5) * unit * 0.08) / h;
  // Clockwise from the top left, in 0..1 face space.
  const pts: [number, number][] = [
    [0 + jx(), 0 + jy()],
    [1 + jx(), 0 + jy()],
    [1 + jx(), 1 + jy()],
    [0 + jx(), 1 + jy()],
  ];

  const cut = Math.floor(rnd() * 4);
  const size = 0.1 + rnd() * 0.18;

  const out: string[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = pts[i];
    if (i === cut) {
      const prev = pts[(i + 3) % 4];
      const next = pts[(i + 1) % 4];
      const a = towards(x, y, prev[0], prev[1], size);
      const b = towards(x, y, next[0], next[1], size);
      out.push(pct(a[0], a[1]), pct(b[0], b[1]));
    } else {
      out.push(pct(x, y));
    }
  }
  return `polygon(${out.join(',')})`;
}

function pct(x: number, y: number): string {
  return `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`;
}

/* ------------------------------------------------------------ tiles, blades */

/** A flat-topped hexagon, for a certificate tile. */
export function hexClip(): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    pts.push(pct(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5));
  }
  return `polygon(${pts.join(',')})`;
}

/**
 * One face of a quartz prism: a long hexagon with a point at each end.
 *
 * Six of these around an axis is the shape a crystal actually grows into — a
 * hexagonal column with pyramidal caps — and it is the silhouette the WebGL cores had,
 * built from six faces instead of twenty-eight triangles. The cap fraction is the
 * pyramid's share of the total height.
 */
export function spindleClip(cap: number): string {
  const c = Math.max(0.02, Math.min(0.45, cap));
  return `polygon(50% 0%, 100% ${(c * 100).toFixed(1)}%, 100% ${((1 - c) * 100).toFixed(1)}%, 50% 100%, 0% ${((1 - c) * 100).toFixed(1)}%, 0% ${(c * 100).toFixed(1)}%)`;
}

/** A blade: a tapered aerofoil, root at the bottom, tip at the top. */
export function bladeClip(): string {
  return 'polygon(28% 100%, 72% 100%, 60% 6%, 50% 0%, 40% 6%)';
}

/* ---------------------------------------------------------------- crystals */

export interface CrystalSpec {
  /** Half the column height, and the girth, in world units. */
  half: number;
  radius: number;
  /** How far each pyramid reaches past the column. */
  cap: number;
  /** The top ring is a little narrower, and the two rings are out of register. */
  taper: number;
  twist: number;
  lean: number;
}

/**
 * A project's crystal. Height, girth, cap length, taper and a slight lean all vary
 * with the seed, so the eight are recognisably one family and never the same object
 * twice — the same five draws, in the same order, the WebGL build made.
 */
export function crystalSpec(seed: number, scale = 1): CrystalSpec {
  const rnd = mulberry(seed * 7919 + 13);
  return {
    radius: (0.62 + rnd() * 0.28) * scale,
    half: (1.0 + rnd() * 0.55) * scale,
    cap: (0.55 + rnd() * 0.5) * scale,
    taper: 0.78 + rnd() * 0.18,
    twist: rnd() * 0.5,
    lean: (rnd() - 0.5) * 0.22,
  };
}

/**
 * What is inside a project's crystal.
 *
 * The WebGL build drew this to a canvas and mapped it across the facets: a seeded
 * abstract that gives the glass something to bend, deliberately quiet because the
 * readable content is the logo suspended inside it. Same PRNG, same seed, same
 * twenty-two rectangles and four hairlines — as an SVG the browser can hold as one
 * static background image instead of a texture upload.
 */
export function crystalInteriorUri(seed: number, light: boolean): string {
  const rnd = mulberry(seed * 104729 + 7);
  const parts: string[] = [];
  parts.push(
    light
      ? '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dde8e6"/><stop offset="1" stop-color="#f6faf9"/></linearGradient>'
      : '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#06181c"/><stop offset="1" stop-color="#170a11"/></linearGradient>'
  );
  const body: string[] = ['<rect width="512" height="512" fill="url(#g)"/>'];
  for (let i = 0; i < 22; i++) {
    const crimson = rnd() > 0.7;
    const alpha = (0.05 + rnd() * 0.2).toFixed(3);
    const w = 30 + rnd() * 190;
    const h = 8 + rnd() * 36;
    const x = rnd() * (512 - w);
    const y = rnd() * (512 - h);
    body.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ` +
        `fill="rgba(${crimson ? '253,33,85' : '0,211,180'},${alpha})"/>`
    );
  }
  for (let i = 0; i < 4; i++) {
    const alpha = (0.1 + rnd() * 0.16).toFixed(3);
    const width = (1 + rnd() * 1.5).toFixed(2);
    const y1 = (rnd() * 512).toFixed(1);
    const y2 = (rnd() * 512).toFixed(1);
    body.push(
      `<line x1="0" y1="${y1}" x2="512" y2="${y2}" stroke="rgba(0,211,180,${alpha})" stroke-width="${width}"/>`
    );
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" preserveAspectRatio="none">` +
    `<defs>${parts.join('')}</defs>${body.join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* --------------------------------------------------------- surface samples */

/**
 * Points on the mark itself, used by act 00 to solve shards onto it.
 *
 * The WebGL build sampled random vertices of the extruded geometry; there is no
 * extrusion to sample here, so this walks the outline instead and jitters each pick
 * across the mark's own depth. Same seeded sequence, same scatter, same landing.
 */
export function fzSurfaceSamples(count: number, seed = 5): Array<[number, number, number]> {
  const pts: Array<[number, number]> = [];
  for (const poly of FZ_POLYGONS) {
    for (const pair of poly.trim().split(/\s+/)) {
      const [sx, sy] = pair.split(',');
      pts.push([(parseFloat(sx) - CX) * SCALE, (CY - parseFloat(sy)) * SCALE]);
    }
  }
  const rnd = mulberry(seed);
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    const [x, y] = pts[Math.floor(rnd() * pts.length)];
    // Along the extrusion, so the solved mark has thickness rather than being a decal.
    out.push([x, y, (rnd() - 0.5) * MARK.depth]);
  }
  return out;
}
