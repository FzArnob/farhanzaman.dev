/**
 * The dust and the shards — the two things in the world there are thousands of.
 *
 * This is the fallback renderer's version of them. Where WebGL is available the same
 * field is drawn by src/stage/gl/ as real geometry; here, where it is not, everything
 * else on the stage is a DOM element because everything else is a thing you can point
 * at, read, or click. These are neither: they are the volume the camera travels
 * through, and there can be eighteen hundred of them. A `<div>` each would be eighteen
 * hundred composited layers to give the void a sense of speed, which is the one place
 * the DOM approach would fall over.
 *
 * So they live on a single 2D canvas. The cost is one projection per point and one
 * batched fill per alpha bucket, and the whole field is drawn in a handful of paths
 * rather than a few thousand state changes.
 *
 * Flat is not the same as fake, though. A shard is the same solid here as on WebGL —
 * an icosahedron drawn out long and narrow, tumbling on the same three axes at the same
 * rates — and this file is a small software renderer for it: twelve vertices turned
 * and projected, the faces turned away from the eye culled, and each face that is left
 * shaded from its own normal against the key, with a glint on the one that throws the
 * key back at you. The faces go into the same batched buckets as everything else, so a
 * cloud of real solids still costs a few dozen fills a frame. Only a shard too small to
 * have a visible face — a pixel or two across — is still drawn as a speck.
 *
 * Where the shards ARE is not decided here: fx/shards.ts owns their motion and the
 * lease protocol, so this renderer and the WebGL one cannot disagree about it.
 */

import type { Quality } from '../../lib/quality';
import { Camera, newProjected } from '../camera';
import type { WorldLook } from '../look';
import { CRIMSON_RGB, TEAL_RGB } from '../look';
import { KEY, euler, icosahedron, type M3 } from '../css3d';
import { mulberry } from '../shapes';
import { WORLD } from '../timeline';
import { SHARD_RADIUS, ShardSim } from './shards';

/** Alpha buckets. Eight steps is past the point anyone can see a seam. */
const BUCKETS = 8;
/** One full turn, for the round motes. */
const TAU = Math.PI * 2;

/** The shard, as WebGL builds it: an icosahedron of SHARD_RADIUS, drawn out long. */
const ICO = icosahedron();
const SHARD_ACROSS = 0.62;
const SHARD_ALONG = 1.4;
/** Below this projected radius, in pixels, a shard has no face to see and is a speck. */
const SOLID_PX = 2.2;
/** Steps of light a face can take, and of fog a shard can be in. */
const SHADES = 8;
const FOGS = 4;
/** The most near motes that are drawn as lit spheres in one frame. */
const SPHERES = 48;

/**
 * The seeded dust volume. Exported so the WebGL field fills exactly the same void:
 * one generator, so switching renderers cannot rearrange the stars.
 */
export function dustPositions(count: number): Float32Array {
  /*
    Spread through the whole travelled corridor rather than per act, so dust is already
    with you wherever you are on the scroll instead of fading in at each boundary.
    Seeded, so the void is the same void on every load.
  */
  const rnd = mulberry(4421);
  const zSpan = Math.abs(WORLD.contact.z) + 16;
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = (rnd() - 0.5) * 58;
    out[i * 3 + 1] = (rnd() - 0.5) * 30;
    out[i * 3 + 2] = 8 - rnd() * zSpan;
  }
  return out;
}

export class PointField {
  readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly dust: Float32Array;
  private readonly sim: ShardSim;
  private readonly p = newProjected();
  private dpr = 1;
  private width = 0;
  private height = 0;
  /** One reusable path per bucket, so a frame allocates nothing. */
  private readonly paths: Path2D[] = [];
  /** The white catchlight on whatever is close enough to have one. Rare, so unbucketed. */
  private glint = new Path2D();
  /** Shard faces, by colour, fog and light: [colour][fog][shade], flattened. */
  private readonly faces: Path2D[] = [];
  /** Each shade's fill, per colour, for the world this field was last drawn in. */
  private fills: string[] = [];
  private fillsFor = '';
  /** One shard's turn, its vertices in the world and on the screen — reused, never grown. */
  private readonly rot: M3 = new Array(9);
  private readonly wx = new Float32Array(ICO.verts.length);
  private readonly wy = new Float32Array(ICO.verts.length);
  private readonly wz = new Float32Array(ICO.verts.length);
  private readonly sx = new Float32Array(ICO.verts.length);
  private readonly sy = new Float32Array(ICO.verts.length);
  private readonly vp = newProjected();
  /** The near motes, queued to be drawn as spheres after the buckets: x, y, r, alpha. */
  private readonly spheres = new Float32Array(SPHERES * 4);

  constructor(quality: Quality) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pz3-points';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.g = this.canvas.getContext('2d', { alpha: true, desynchronized: true })!;
    this.dust = dustPositions(quality.dust);
    this.sim = new ShardSim(quality.shards);
    for (let i = 0; i < BUCKETS; i++) this.paths.push(new Path2D());
    for (let i = 0; i < 2 * FOGS * SHADES; i++) this.faces.push(new Path2D());
  }

  resize(width: number, height: number, quality: Quality): void {
    // A point field gains nothing from a retina buffer and costs four times the fill,
    // so it is capped well below the tier's own ceiling.
    this.dpr = Math.min(quality.dpr, 1.5);
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  draw(cam: Camera, look: WorldLook, time: number, t: number): void {
    const g = this.g;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.width, this.height);
    // Additive over the void; over a near-white ground it would be invisible, so
    // Studio composites normally instead.
    g.globalCompositeOperation = look.bloom ? 'lighter' : 'source-over';

    this.drawDust(cam, look);
    this.sim.step(time, t);
    this.drawShards(cam, look, time);

    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
  }

  private drawDust(cam: Camera, look: WorldLook): void {
    const n = this.dust.length / 3;
    if (n === 0) return;
    const g = this.g;
    const p = this.p;
    for (let b = 0; b < BUCKETS; b++) this.paths[b] = new Path2D();
    let spheres = 0;

    for (let i = 0; i < n; i++) {
      cam.project(this.dust[i * 3], this.dust[i * 3 + 1], this.dust[i * 3 + 2], p);
      if (!p.visible) continue;
      if (p.x < -8 || p.y < -8 || p.x > this.width + 8 || p.y > this.height + 8) continue;
      const alpha = p.fog * look.dustOpacity;
      if (alpha < 0.02) continue;
      // three's sizeAttenuation, exactly: a 0.075-unit point at this depth.
      const size = 0.075 * p.scale;
      if (size < 0.35) continue;
      const bucket = Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS));
      /*
        Under about a pixel and a half there is no shape to see and a rect is the
        cheapest thing that can be filled, which is most of the field. Above it the
        mote is close enough to read as an object, so it gets drawn round and — closer
        still — a brighter side where the key would strike it. That is the whole
        difference between a starfield of squares and a volume of dust hanging in a
        room, and it is paid for only by the handful of motes near enough to earn it.
      */
      if (size < 1.6) {
        this.paths[bucket].rect(p.x - size / 2, p.y - size / 2, size, size);
        continue;
      }
      const r = size * 0.5;
      /*
        Near enough to be seen as round, a mote is seen as a ball: shaded from the key
        across its whole face rather than a disc with a dot on it. Each one is its own
        gradient, so only the nearest few are — the rest of the field stays batched.
      */
      if (size >= 3 && spheres < SPHERES) {
        const k = spheres * 4;
        this.spheres[k] = p.x;
        this.spheres[k + 1] = p.y;
        this.spheres[k + 2] = r;
        this.spheres[k + 3] = alpha;
        spheres++;
        continue;
      }
      // moveTo first: without it, arc() draws a line from wherever the path left off.
      this.paths[bucket].moveTo(p.x + r, p.y);
      this.paths[bucket].arc(p.x, p.y, r, 0, TAU);
    }

    g.fillStyle = `rgb(${look.dust})`;
    for (let b = 0; b < BUCKETS; b++) {
      g.globalAlpha = (b + 0.5) / BUCKETS;
      g.fill(this.paths[b]);
    }

    const [dr, dg, db] = look.dust.split(',').map((c) => Number(c.trim()) || 0);
    const shadow = `${Math.round(dr * 0.22)},${Math.round(dg * 0.22)},${Math.round(db * 0.22)}`;
    for (let j = 0; j < spheres; j++) {
      const x = this.spheres[j * 4];
      const y = this.spheres[j * 4 + 1];
      const r = this.spheres[j * 4 + 2];
      g.globalAlpha = this.spheres[j * 4 + 3];
      // Lit from the key's side: the hot spot up and to the left, the terminator opposite.
      const ball = g.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.06, x, y, r);
      ball.addColorStop(0, 'rgb(255,255,255)');
      ball.addColorStop(0.3, `rgb(${look.dust})`);
      ball.addColorStop(1, `rgb(${shadow})`);
      g.fillStyle = ball;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
  }

  /** Each shade's fill for both colours, rebuilt only when the world changes. */
  private shadeFills(look: WorldLook): string[] {
    const key = look.bloom ? 'void' : 'studio';
    if (this.fillsFor === key) return this.fills;
    this.fillsFor = key;
    this.fills = [];
    for (const rgb of [TEAL_RGB, CRIMSON_RGB]) {
      const [r, g, b] = rgb.split(',').map((c) => Number(c.trim()));
      for (let s = 0; s < SHADES; s++) {
        const t = (s + 0.5) / SHADES;
        // The body darkens into shadow; the top of the range lifts toward white.
        const k = 0.22 + 0.95 * t;
        const lift = Math.max(0, t - 0.72) * 1.6;
        const c = (v: number) => Math.round(Math.min(255, v * k + (255 - v * k) * lift));
        this.fills.push(`rgb(${c(r)},${c(g)},${c(b)})`);
      }
    }
    return this.fills;
  }

  /** The shards, wherever the simulation put them this frame, as the solids they are. */
  private drawShards(cam: Camera, look: WorldLook, time: number): void {
    const sim = this.sim;
    const count = sim.count;
    if (count === 0) return;
    const g = this.g;
    const p = this.p;
    const vp = this.vp;
    const rot = this.rot;
    const { wx, wy, wz, sx, sy } = this;
    const verts = ICO.verts;
    const tris = ICO.faces;
    this.glint = new Path2D();
    for (let k = 0; k < this.faces.length; k++) this.faces[k] = new Path2D();
    const ex = cam.pos.x;
    const ey = cam.pos.y;
    const ez = cam.pos.z;

    for (let i = 0; i < count; i++) {
      const cx = sim.x[i];
      const cy = sim.y[i];
      const cz = sim.z[i];
      cam.project(cx, cy, cz, p);
      if (!p.visible) continue;
      const size = SHARD_RADIUS * sim.scale[i];
      const r = size * p.scale;
      if (r < 0.4) continue;
      const reach = r * SHARD_ALONG * 1.2;
      if (p.x < -reach || p.y < -reach || p.x > this.width + reach || p.y > this.height + reach) {
        continue;
      }
      const fog = Math.min(FOGS - 1, Math.floor(p.fog * FOGS));
      const colour = sim.crimson[i];
      const base = (colour * FOGS + fog) * SHADES;
      const bright = sim.bright[i];

      if (r < SOLID_PX) {
        // A speck: too small for a face, so its own share of the light and nothing more.
        const shade = Math.min(SHADES - 1, Math.floor(bright * SHADES * 0.85));
        this.faces[base + shade].rect(p.x - r * 0.5, p.y - r, r, r * 2);
        continue;
      }

      // The same turn the WebGL instance takes, in the same Euler order.
      const phase = sim.phase[i];
      euler(
        phase + time * sim.tumble[i * 3],
        phase * 1.7 + time * sim.tumble[i * 3 + 1],
        phase * 0.6 + time * sim.tumble[i * 3 + 2],
        rot
      );
      const across = size * SHARD_ACROSS;
      const along = size * SHARD_ALONG;
      let behind = false;
      for (let v = 0; v < verts.length; v++) {
        const lx = verts[v][0] * across;
        const ly = verts[v][1] * along;
        const lz = verts[v][2] * across;
        const x = cx + rot[0] * lx + rot[1] * ly + rot[2] * lz;
        const y = cy + rot[3] * lx + rot[4] * ly + rot[5] * lz;
        const z = cz + rot[6] * lx + rot[7] * ly + rot[8] * lz;
        wx[v] = x;
        wy[v] = y;
        wz[v] = z;
        cam.project(x, y, z, vp);
        if (vp.scale === 0) {
          behind = true;
          break;
        }
        sx[v] = vp.x;
        sy[v] = vp.y;
      }
      if (behind) continue;

      // Toward the eye, and halfway between that and the key: where a face must point
      // to throw the key's reflection straight at you.
      let tx = ex - cx;
      let ty = ey - cy;
      let tz = ez - cz;
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl;
      ty /= tl;
      tz /= tl;
      let hx = KEY[0] + tx;
      let hy = KEY[1] + ty;
      let hz = KEY[2] + tz;
      const hl = Math.hypot(hx, hy, hz) || 1;
      hx /= hl;
      hy /= hl;
      hz /= hl;

      for (let f = 0; f < tris.length; f++) {
        const [a, b, c] = tris[f];
        const ux = wx[b] - wx[a];
        const uy = wy[b] - wy[a];
        const uz = wz[b] - wz[a];
        const vx = wx[c] - wx[a];
        const vy = wy[c] - wy[a];
        const vz = wz[c] - wz[a];
        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;
        // Outward, whatever the winding: away from the shard's own centre.
        const mx = (wx[a] + wx[b] + wx[c]) / 3;
        const my = (wy[a] + wy[b] + wy[c]) / 3;
        const mz = (wz[a] + wz[b] + wz[c]) / 3;
        if (nx * (mx - cx) + ny * (my - cy) + nz * (mz - cz) < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }
        // Turned away from the eye: the far side of a solid is never drawn.
        if (nx * (ex - mx) + ny * (ey - my) + nz * (ez - mz) <= 0) continue;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;

        const lambert = Math.max(0, nx * KEY[0] + ny * KEY[1] + nz * KEY[2]);
        const light = (0.18 + 0.82 * lambert) * (0.55 + 0.45 * bright);
        const shade = Math.min(SHADES - 1, Math.floor(light * SHADES));
        const path = this.faces[base + shade];
        path.moveTo(sx[a], sy[a]);
        path.lineTo(sx[b], sy[b]);
        path.lineTo(sx[c], sy[c]);
        path.closePath();

        const spec = Math.max(0, nx * hx + ny * hy + nz * hz);
        if (spec > 0.9 && r > 3) {
          this.glint.moveTo(sx[a], sy[a]);
          this.glint.lineTo(sx[b], sy[b]);
          this.glint.lineTo(sx[c], sy[c]);
          this.glint.closePath();
        }
      }
    }

    const fills = this.shadeFills(look);
    const strength = look.bloom ? 0.95 : 0.8;
    for (let colour = 0; colour < 2; colour++) {
      for (let fog = 0; fog < FOGS; fog++) {
        g.globalAlpha = ((fog + 1) / FOGS) * strength;
        const base = (colour * FOGS + fog) * SHADES;
        for (let shade = 0; shade < SHADES; shade++) {
          g.fillStyle = fills[colour * SHADES + shade];
          g.fill(this.faces[base + shade]);
        }
      }
    }

    // One white pass over both colours, last: the faces throwing the key at the eye.
    g.fillStyle = '#ffffff';
    g.globalAlpha = look.bloom ? 0.55 : 0.4;
    g.fill(this.glint);
  }
}
