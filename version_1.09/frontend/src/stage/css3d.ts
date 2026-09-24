/**
 * Solids in CSS — the fallback's answer to the WebGL stage's meshes.
 *
 * The CSS stage used to fake depth by stacking copies of a silhouette back along Z.
 * That reads as depth from straight ahead and as a comb of cards from anywhere else,
 * which is why the mark looked flat the moment it turned. This builds the real thing
 * instead: every face of a solid is its own element, placed exactly by a `matrix3d`
 * inside one `preserve-3d` context, so the browser projects, sorts and culls them the
 * way a GPU would. A dodecahedron is twelve pentagons; the extruded monogram is its
 * two faces and a wall standing on every edge of its outline.
 *
 * Light is the other half of a solid. A face that keeps one brightness as it turns is
 * a painted card. So each face carries a dark overlay, and every frame its opacity is
 * set from how directly that face's normal — rotated into the world — looks at the
 * key light. Opacity is a compositor property: relighting costs no paint.
 *
 * Poses use three's Euler order (XYZ) and its axes (y up), so a solid posed here and
 * the same solid posed on the WebGL stage are turned to the same angle. The only place
 * CSS's y-down axis appears is `cssMatrix`, where it is folded in once.
 *
 * Rotations are written relative to the camera, not the world. A CSS 3D context's axes
 * are the screen's; when the stage camera yaws — the drift past the mark, the slide
 * across the constellation — a world-space turn written straight into CSS would be
 * seen from the wrong side. `viewOf` puts the camera's own basis in front of it.
 */

import type { Camera } from './camera';
import { UNIT, el, q } from './dom';
import type { CrystalSpec } from './shapes';

export type Vec = [number, number, number];
/** Row-major 3×3. */
export type M3 = number[];

export const IDENTITY: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

function norm(x: number, y: number, z: number): Vec {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

function cross(a: Vec, b: Vec): Vec {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec, b: Vec): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function sub(a: Vec, b: Vec): Vec {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/** three's Matrix4.makeRotationFromEuler for order XYZ, as a row-major 3×3. */
export function euler(rx: number, ry: number, rz: number, out: M3 = new Array(9)): M3 {
  const a = Math.cos(rx);
  const b = Math.sin(rx);
  const c = Math.cos(ry);
  const d = Math.sin(ry);
  const e = Math.cos(rz);
  const f = Math.sin(rz);
  const ae = a * e;
  const af = a * f;
  const be = b * e;
  const bf = b * f;
  out[0] = c * e;
  out[1] = -c * f;
  out[2] = d;
  out[3] = af + be * d;
  out[4] = ae - bf * d;
  out[5] = -b * c;
  out[6] = bf - ae * d;
  out[7] = be + af * d;
  out[8] = a * c;
  return out;
}

export function mul(a: M3, b: M3, out: M3 = new Array(9)): M3 {
  const r = new Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    }
  }
  for (let k = 0; k < 9; k++) out[k] = r[k];
  return out;
}

export function apply(m: M3, v: Vec): Vec {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/**
 * A world rotation, re-expressed in the camera's frame: Cᵀ·R, where C's columns are
 * the camera's right, up and back. What a CSS 3D context needs, since its axes are the
 * screen's.
 */
export function viewOf(cam: Camera, r: M3, out: M3 = new Array(9)): M3 {
  const rows: Vec[] = [
    [cam.right.x, cam.right.y, cam.right.z],
    [cam.up.x, cam.up.y, cam.up.z],
    [-cam.fwd.x, -cam.fwd.y, -cam.fwd.z],
  ];
  for (let i = 0; i < 3; i++) {
    const [bx, by, bz] = rows[i];
    for (let j = 0; j < 3; j++) out[i * 3 + j] = bx * r[j] + by * r[3 + j] + bz * r[6 + j];
  }
  return out;
}

/**
 * A pose as CSS: rotation, translation in world units, and scale — with the y flip
 * between three's axes and the screen's folded in here and nowhere else.
 *
 * Flipping y is a reflection F, so a rotation R becomes F·R·F: every entry that pairs
 * y with x or z changes sign. The translation just has its y negated and is scaled to
 * UNIT pixels.
 */
export function cssMatrix(
  r: M3,
  tx: number,
  ty: number,
  tz: number,
  sx = 1,
  sy = 1,
  sz = 1
): string {
  const c00 = r[0];
  const c01 = -r[1];
  const c02 = r[2];
  const c10 = -r[3];
  const c11 = r[4];
  const c12 = -r[5];
  const c20 = r[6];
  const c21 = -r[7];
  const c22 = r[8];
  const f = (n: number) => (Math.round(n * 10000) / 10000).toString();
  return (
    `matrix3d(${f(c00 * sx)},${f(c10 * sx)},${f(c20 * sx)},0,` +
    `${f(c01 * sy)},${f(c11 * sy)},${f(c21 * sy)},0,` +
    `${f(c02 * sz)},${f(c12 * sz)},${f(c22 * sz)},0,` +
    `${q(tx * UNIT)},${q(-ty * UNIT)},${q(tz * UNIT)},1)`
  );
}

/**
 * The key light, in the world: high, to the left, and in front. It is the direction
 * glass.ts paints every gradient from and the WebGL stage's key shines from, so a CSS
 * face, a painted pane and a lit mesh all agree about where the light is.
 */
export const KEY: Vec = norm(-0.5, 0.62, 0.6);

/** How dark a face turned fully away from the key gets. */
const SHADOW = 0.78;

function shadeFor(normal: Vec): number {
  const lambert = Math.max(0, dot(normal, KEY));
  // A floor of ambient, so the unlit side is glass in shadow rather than a hole.
  return (1 - (0.24 + 0.76 * lambert)) * SHADOW;
}

/**
 * The key's reflection off a face, as seen from `half` — the direction halfway between
 * the key and the eye. Tight on purpose: a facet flashes as it passes through the angle
 * and is dark either side of it, which is how cut glass tells you it is turning.
 */
function glintFor(normal: Vec, half: Vec): number {
  const h = Math.max(0, dot(normal, half));
  return Math.pow(h, 28);
}

/* ----------------------------------------------------------------- nodes */

interface LitFace {
  shade: HTMLElement;
  normal: Vec;
  last: number;
  /** How much of SHADOW this face may take — less for glass, which stays clear in shade. */
  shadow: number;
  glint: HTMLElement | null;
  strength: number;
  lastGlint: number;
}

/**
 * One transform in a CSS solid's hierarchy. Children move with it; its own faces are
 * relit from its rotation in the world.
 */
export class CssNode {
  readonly el: HTMLElement;
  readonly children: CssNode[] = [];
  readonly lit: LitFace[] = [];
  private px = 0;
  private py = 0;
  private pz = 0;
  private rx = 0;
  private ry = 0;
  private rz = 0;
  private sx = 1;
  private sy = 1;
  private sz = 1;
  private readonly local: M3 = IDENTITY.slice();
  readonly world: M3 = IDENTITY.slice();
  private lastTransform = '';
  private visible = true;

  constructor(parent: HTMLElement | CssNode, className = '') {
    const host = parent instanceof CssNode ? parent.el : parent;
    this.el = el('div', `pz3-poly-node${className ? ' ' + className : ''}`, host);
    if (parent instanceof CssNode) parent.children.push(this);
  }

  pose(x: number, y: number, z: number, rx = 0, ry = 0, rz = 0): void {
    this.px = x;
    this.py = y;
    this.pz = z;
    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
  }

  size(sx: number, sy = sx, sz = sx): void {
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
  }

  show(on: boolean): void {
    if (on !== this.visible) {
      this.visible = on;
      this.el.style.display = on ? '' : 'none';
    }
  }

  /**
   * Writes this node's transform — `rot` is what goes into CSS, which for a scene's
   * root is the camera-relative rotation — and relights its faces from `world`.
   */
  protected write(rot: M3, world: M3, half: Vec | null): void {
    const m = cssMatrix(rot, this.px, this.py, this.pz, this.sx, this.sy, this.sz);
    if (m !== this.lastTransform) {
      this.lastTransform = m;
      this.el.style.transform = m;
    }
    for (let i = 0; i < 9; i++) this.world[i] = world[i];
    for (const face of this.lit) {
      const n = apply(world, face.normal);
      const shade = Math.round(shadeFor(n) * face.shadow * 100) / 100;
      if (shade !== face.last) {
        face.last = shade;
        face.shade.style.opacity = String(shade);
      }
      if (face.glint && half) {
        const glint = Math.round(glintFor(n, half) * face.strength * 100) / 100;
        if (glint !== face.lastGlint) {
          face.lastGlint = glint;
          face.glint.style.opacity = String(glint);
        }
      }
    }
  }

  /** Commit a child: its own rotation into CSS, its world rotation into its light. */
  commit(parentWorld: M3, half: Vec | null = null): void {
    if (!this.visible) return;
    euler(this.rx, this.ry, this.rz, this.local);
    const world = mul(parentWorld, this.local);
    this.write(this.local, world, half);
    for (const child of this.children) child.commit(world, half);
  }

  /** For the scene root, which needs its own rotation before viewOf. */
  protected localRotation(): M3 {
    return euler(this.rx, this.ry, this.rz, this.local);
  }
}

/**
 * The root of a CSS solid: one 3D context, placed like any other stage element and
 * given the camera's real distance as its perspective. Everything built under it is
 * projected by the browser through that one lens.
 */
export class CssScene extends CssNode {
  /** The placed element: `place()` writes here, perspective lives here. */
  readonly outer: HTMLElement;
  private readonly view: M3 = IDENTITY.slice();

  constructor(parent: HTMLElement, className = '') {
    const outer = el('div', `pz3 pz3-poly${className ? ' ' + className : ''}`, parent);
    super(outer, 'pz3-poly-root');
    this.outer = outer;
  }

  /** The rotation last written into CSS: the solid's own, in the camera's frame. */
  get viewRotation(): M3 {
    return this.view;
  }

  /** Commit the whole solid for this frame, as seen from `cam`. */
  commitView(cam: Camera): void {
    const world = this.localRotation().slice();
    viewOf(cam, world, this.view);
    // Toward the eye is the camera's back; halfway between that and the key is where
    // a face has to point to throw the key's reflection straight at you.
    const half = norm(KEY[0] - cam.fwd.x, KEY[1] - cam.fwd.y, KEY[2] - cam.fwd.z);
    this.write(this.view, world, half);
    for (const child of this.children) child.commit(world, half);
  }
}

/* ----------------------------------------------------------------- faces */

/**
 * One flat face, from its corners in the node's own world units (y up) and its
 * outward normal. The element is the face's bounding box in its own plane, clipped to
 * the polygon; `matrix3d` stands it in place.
 *
 * The normal is passed rather than recomputed because the y flip into CSS is a
 * reflection, and a reflection turns a cross product inside out: computed from the
 * flipped corners, every normal would point into the solid and cull the wrong side.
 */
export function face(
  node: CssNode,
  corners: Vec[],
  normal: Vec,
  paint: string,
  opts: FaceOptions = {}
): HTMLElement {
  const toCss = (v: Vec): Vec => [v[0] * UNIT, -v[1] * UNIT, v[2] * UNIT];
  const pts = corners.map(toCss);
  const n: Vec = norm(normal[0], -normal[1], normal[2]);
  const o = pts[0];
  const u = norm(...sub(pts[1], o));
  const w = cross(n, u);

  const flat = pts.map((p) => {
    const d = sub(p, o);
    return [dot(d, u), dot(d, w)];
  });
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of flat) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  const width = Math.max(0.5, maxX - minX);
  const height = Math.max(0.5, maxY - minY);

  const node3 = el('div', `pz3-poly-face${opts.className ? ' ' + opts.className : ''}`, node.el);
  if (opts.cull !== false && !opts.wire) node3.classList.add('pz3-cull');
  node3.style.width = q(width) + 'px';
  node3.style.height = q(height) + 'px';
  if (opts.wire) {
    /*
      A wireframe face is its outline and nothing else, drawn as an SVG over the face's
      own box. It is not clipped — a clip would shave half the stroke off every edge —
      and it is never culled, because a cage is seen through: its far side is the half
      that makes it read as a cage rather than a flat star.
    */
    const pts = flat.map(([x, y]) => `${q(x - minX)},${q(y - minY)}`).join(' ');
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${q(width)} ${q(height)}" overflow="visible">` +
      `<polygon points="${pts}" fill="none" stroke="${opts.wire}" stroke-width="1.2" ` +
      'stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
    node3.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    node3.style.overflow = 'visible';
  } else {
    node3.style.clipPath =
      'polygon(' +
      flat
        .map(([x, y]) => `${(((x - minX) / width) * 100).toFixed(2)}% ${(((y - minY) / height) * 100).toFixed(2)}%`)
        .join(',') +
      ')';
    node3.style.background = paint;
  }

  const ox = o[0] + u[0] * minX + w[0] * minY;
  const oy = o[1] + u[1] * minX + w[1] * minY;
  const oz = o[2] + u[2] * minX + w[2] * minY;
  const f = (v: number) => (Math.round(v * 10000) / 10000).toString();
  node3.style.transform =
    `matrix3d(${f(u[0])},${f(u[1])},${f(u[2])},0,${f(w[0])},${f(w[1])},${f(w[2])},0,` +
    `${f(n[0])},${f(n[1])},${f(n[2])},0,${q(ox)},${q(oy)},${q(oz)},1)`;

  if (opts.lit !== false && !opts.wire) {
    const shade = el('i', 'pz3-poly-shade', node3);
    const glint = opts.glint ? el('i', 'pz3-poly-glint', node3) : null;
    node.lit.push({
      shade,
      normal,
      last: -1,
      shadow: opts.shadow ?? 1,
      glint,
      strength: opts.glint ?? 0,
      lastGlint: -1,
    });
  }
  return node3;
}

export interface FaceOptions {
  /** Hide the face when it turns away. Default true; ignored for wireframe. */
  cull?: boolean;
  /** Relight every frame from the face's normal. Default true. */
  lit?: boolean;
  /** Scales how dark the face gets turned from the key. Default 1. */
  shadow?: number;
  /** Flash white, up to this opacity, as the face reflects the key at the eye. */
  glint?: number;
  /** Draw only the outline, in this colour. */
  wire?: string;
  className?: string;
}

/* -------------------------------------------------------------- solids */

export interface Solid {
  verts: Vec[];
  faces: number[][];
}

const PHI = (1 + Math.sqrt(5)) / 2;

/** The regular icosahedron, three's vertex and face order. */
export function icosahedron(): Solid {
  const t = PHI;
  const raw = [
    -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, 0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, t, 0, -1, t,
    0, 1, -t, 0, -1, -t, 0, 1,
  ];
  const verts: Vec[] = [];
  for (let i = 0; i < raw.length; i += 3) verts.push(norm(raw[i], raw[i + 1], raw[i + 2]));
  const idx = [
    0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1,
    8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
  ];
  const faces: number[][] = [];
  for (let i = 0; i < idx.length; i += 3) faces.push([idx[i], idx[i + 1], idx[i + 2]]);
  return { verts, faces };
}

/** The regular octahedron — the CSS skill crystal, a third of an icosahedron's faces. */
export function octahedron(): Solid {
  return {
    verts: [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    faces: [
      [0, 2, 4],
      [0, 4, 3],
      [0, 3, 5],
      [0, 5, 2],
      [1, 2, 5],
      [1, 5, 3],
      [1, 3, 4],
      [1, 4, 2],
    ],
  };
}

/**
 * A project's crystal — a hexagonal column with a pyramid at each end, the top ring a
 * little narrower and turned out of register with the bottom one. The same vertices
 * and the same triangles as the WebGL prism (gl/GLStage.ts, prismGeometry), so a
 * project's crystal is one object on both renderers, down to where it comes to rest.
 *
 * The twist is why each long side is two triangles rather than one face: its four
 * corners are no longer in one plane, and the fold down its diagonal is a real edge.
 */
export function prism(spec: CrystalSpec): Solid {
  const sides = 6;
  const verts: Vec[] = [];
  const ring = (y: number, r: number, rot: number) => {
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 + rot;
      verts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
  };
  ring(-spec.half, spec.radius, 0);
  ring(spec.half, spec.radius * spec.taper, spec.twist);
  const tip = verts.push([0, spec.half + spec.cap, 0]) - 1;
  const base = verts.push([0, -spec.half - spec.cap, 0]) - 1;
  const faces: number[][] = [];
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    faces.push([i, sides + j, j], [i, sides + i, sides + j], [sides + i, tip, sides + j], [j, base, i]);
  }
  return { verts, faces };
}

/**
 * The regular dodecahedron as twelve pentagons, built as the icosahedron's dual: each
 * of its twelve vertices becomes a face whose corners are the centres of the five
 * triangles around it. Twelve elements instead of the thirty-six triangles a mesh
 * would use, and each one a true face with a single normal.
 */
export function dodecahedron(): Solid {
  const ico = icosahedron();
  const centres: Vec[] = ico.faces.map(([a, b, c]) => {
    const va = ico.verts[a];
    const vb = ico.verts[b];
    const vc = ico.verts[c];
    return norm(va[0] + vb[0] + vc[0], va[1] + vb[1] + vc[1], va[2] + vb[2] + vc[2]);
  });
  const faces: number[][] = [];
  ico.verts.forEach((v, vi) => {
    const around = ico.faces.map((f, fi) => (f.includes(vi) ? fi : -1)).filter((fi) => fi >= 0);
    // Order the five corners by angle about the vertex's own axis.
    const axisA = norm(...cross(v, Math.abs(v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
    const axisB = cross(v, axisA);
    around.sort((p, r) => {
      const cp = centres[p];
      const cr = centres[r];
      return Math.atan2(dot(cp, axisB), dot(cp, axisA)) - Math.atan2(dot(cr, axisB), dot(cr, axisA));
    });
    faces.push(around);
  });
  return { verts: centres, faces };
}

/**
 * Builds a convex solid's faces into a node. Each face's outward normal is checked
 * against its centre — for a convex solid round the origin the two must agree — so a
 * face list in either winding comes out culling the right side.
 */
export function buildSolid(
  node: CssNode,
  solid: Solid,
  scale: Vec,
  paint: (normal: Vec, index: number) => string,
  opts: FaceOptions = {}
): void {
  solid.faces.forEach((indices, i) => {
    const corners = indices.map((k) => {
      const v = solid.verts[k];
      return [v[0] * scale[0], v[1] * scale[1], v[2] * scale[2]] as Vec;
    });
    const centre: Vec = [0, 0, 0];
    for (const c of corners) {
      centre[0] += c[0] / corners.length;
      centre[1] += c[1] / corners.length;
      centre[2] += c[2] / corners.length;
    }
    let n = norm(...cross(sub(corners[1], corners[0]), sub(corners[2], corners[0])));
    if (dot(n, centre) < 0) n = [-n[0], -n[1], -n[2]];
    face(node, corners, n, paint(n, i), opts);
  });
}

/**
 * Walls for a 2D outline extruded `depth` deep, centred on z = 0: one quad standing on
 * every edge, facing outward. The outline's winding decides which side is out, so a
 * polygon given clockwise or anticlockwise both come out right.
 */
export function buildWalls(
  node: CssNode,
  outline: Array<[number, number]>,
  depth: number,
  paint: (normal: Vec) => string
): void {
  let area = 0;
  for (let i = 0; i < outline.length; i++) {
    const [x1, y1] = outline[i];
    const [x2, y2] = outline[(i + 1) % outline.length];
    area += x1 * y2 - x2 * y1;
  }
  const half = depth / 2;
  for (let i = 0; i < outline.length; i++) {
    const [ax, ay] = outline[i];
    const [bx, by] = outline[(i + 1) % outline.length];
    const ex = bx - ax;
    const ey = by - ay;
    if (Math.hypot(ex, ey) < 1e-4) continue;
    // Anticlockwise (positive area): the outside of edge (ex, ey) is (ey, −ex).
    const n = area > 0 ? norm(ey, -ex, 0) : norm(-ey, ex, 0);
    face(
      node,
      [
        [ax, ay, half],
        [bx, by, half],
        [bx, by, -half],
        [ax, ay, -half],
      ],
      n,
      paint(n),
      { className: 'pz3-poly-wall' }
    );
  }
}
