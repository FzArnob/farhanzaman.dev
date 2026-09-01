import * as THREE from 'three';

/**
 * The hero object is the site's own logo, extruded.
 *
 * These are the two teal polygons from view/static/favicon.svg, verbatim. Keeping the
 * numbers here rather than fetching and parsing the SVG means the geometry is
 * available on the first frame with no network round-trip and no SVGLoader in the
 * bundle — and the mark never changes, so there is nothing to keep in sync.
 */
const FZ_POLYGONS = [
  '39.663,4.146 39.697,9.018 76.933,8.724 68.965,18.239 24.452,17.968 24.282,41.406 28.734,41.417 29.074,23.234 71.35,23.234 90.551,4',
  '44.556,30.331 39.697,30.331 39.392,42.039 58.151,42.31 49.608,51.464 23.886,51.23 23.886,95.774 44.5,76.224 44.488,63.375 40.078,63.426 40.078,74.938 28.095,85.038 28.282,56.508 50.132,56.886 71.35,37.066 44.434,36.91',
];

/** Centre of the mark in its own 100-unit SVG space, and the scale down to world units. */
const CX = 57;
const CY = 50.5;
const SCALE = 0.026;

/**
 * The crimson layer's offset, measured from the favicon: the crimson polygon starts at
 * (35.809, 5.92) where the teal one starts at (39.663, 4.146). That is (−3.854, +1.774)
 * in the mark's own space — about 6% of its width at 205°. SVG y points down, so the
 * sign of y flips on the way into world space.
 *
 * Everything else in the scene that fringes colour is derived from this one vector.
 */
export const ABERRATION = {
  svg: [-3.854, 1.774] as const,
  world: [-3.854 * SCALE, -1.774 * SCALE] as const,
  /** Fraction of the mark's width. Feeds the chromatic-aberration post pass. */
  ratio: Math.hypot(3.854, 1.774) / (90.551 - 23.886),
  /** Direction in radians, screen space (y down). */
  angle: Math.atan2(1.774, -3.854),
};

function shapeFromPoints(points: string): THREE.Shape {
  const shape = new THREE.Shape();
  const pairs = points.trim().split(/\s+/);
  for (let i = 0; i < pairs.length; i++) {
    const [sx, sy] = pairs[i].split(',');
    const x = (parseFloat(sx) - CX) * SCALE;
    const y = (CY - parseFloat(sy)) * SCALE;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

let cached: THREE.ExtrudeGeometry | null = null;

/**
 * The extruded mark, centred on its own bounding box so rotation happens about the
 * visual centre. Cached: two meshes share it (teal in front, crimson behind) and the
 * closing act reuses the same buffer again.
 */
export function fzMonogramGeometry(): THREE.ExtrudeGeometry {
  if (cached) return cached;
  const shapes = FZ_POLYGONS.map(shapeFromPoints);
  cached = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.026,
    bevelSize: 0.02,
    bevelSegments: 2,
    // The mark is all straight edges; curve subdivision would only add triangles.
    curveSegments: 1,
  });
  cached.center();
  cached.computeBoundingSphere();
  return cached;
}

/** Surface points on the mark, used by act 00 to solve shards onto it. */
export function fzSurfaceSamples(count: number, seed = 5): THREE.Vector3[] {
  const geo = fzMonogramGeometry();
  const pos = geo.attributes.position;
  const out: THREE.Vector3[] = [];
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < count; i++) {
    const v = Math.floor(rnd() * pos.count);
    out.push(new THREE.Vector3(pos.getX(v), pos.getY(v), pos.getZ(v)));
  }
  return out;
}
