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
 * Where the shards ARE is not decided here: fx/shards.ts owns their motion and the
 * lease protocol, so this renderer and the WebGL one cannot disagree about it.
 */

import type { Quality } from '../../lib/quality';
import { Camera, newProjected } from '../camera';
import type { WorldLook } from '../look';
import { CRIMSON_RGB, TEAL_RGB } from '../look';
import { mulberry } from '../shapes';
import { WORLD } from '../timeline';
import { SHARD_RADIUS, ShardSim } from './shards';

/** Alpha buckets. Eight steps is past the point anyone can see a seam. */
const BUCKETS = 8;
/** One full turn, for the round motes. */
const TAU = Math.PI * 2;

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

  constructor(quality: Quality) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pz3-points';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.g = this.canvas.getContext('2d', { alpha: true, desynchronized: true })!;
    this.dust = dustPositions(quality.dust);
    this.sim = new ShardSim(quality.shards);
    for (let i = 0; i < BUCKETS; i++) this.paths.push(new Path2D());
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
      // moveTo first: without it, arc() draws a line from wherever the path left off.
      this.paths[bucket].moveTo(p.x + r, p.y);
      this.paths[bucket].arc(p.x, p.y, r, 0, TAU);
      if (size >= 3) {
        const hot = this.paths[Math.min(BUCKETS - 1, bucket + 2)];
        const hx = p.x - r * 0.3;
        const hy = p.y - r * 0.3;
        hot.moveTo(hx + r * 0.42, hy);
        hot.arc(hx, hy, r * 0.42, 0, TAU);
      }
    }

    g.fillStyle = `rgb(${look.dust})`;
    for (let b = 0; b < BUCKETS; b++) {
      g.globalAlpha = (b + 0.5) / BUCKETS;
      g.fill(this.paths[b]);
    }
  }

  /** The shards, wherever the simulation put them this frame, as folded diamonds. */
  private drawShards(cam: Camera, look: WorldLook, time: number): void {
    const sim = this.sim;
    const count = sim.count;
    if (count === 0) return;
    const g = this.g;
    const p = this.p;
    this.glint = new Path2D();

    // Two colours, so two passes; alpha is bucketed inside each.
    for (let pass = 0; pass < 2; pass++) {
      for (let b = 0; b < BUCKETS; b++) this.paths[b] = new Path2D();
      let drew = false;

      for (let i = 0; i < count; i++) {
        if (sim.crimson[i] !== pass) continue;

        cam.project(sim.x[i], sim.y[i], sim.z[i], p);
        if (!p.visible) continue;
        const r = SHARD_RADIUS * sim.scale[i] * p.scale;
        if (r < 0.4) continue;
        if (p.x < -r * 2 || p.y < -r * 2 || p.x > this.width + r * 2 || p.y > this.height + r * 2) {
          continue;
        }
        // Each shard's own share of the light, so no two flakes shine alike.
        const alpha = p.fog * 0.86 * sim.bright[i];
        if (alpha < 0.02) continue;

        // A flake, not a die: the octahedron squashed on one axis, as a diamond.
        const a = sim.phase[i] + time * sim.spin[i];
        const cos = Math.cos(a) * r;
        const sin = Math.sin(a) * r;
        const bucket = Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS));
        const path = this.paths[bucket];
        const tipX = p.x + cos;
        const tipY = p.y + sin;
        const sideX = p.x - sin * 0.45;
        const sideY = p.y + cos * 0.45;
        const backX = p.x - cos;
        const backY = p.y - sin;
        path.moveTo(tipX, tipY);
        path.lineTo(sideX, sideY);
        path.lineTo(backX, backY);
        path.lineTo(p.x + sin * 0.45, p.y - cos * 0.45);
        path.closePath();
        /*
          The fold. A flake is two facets meeting along its long axis, and they cannot
          both face the light — so half of it goes into a hotter bucket and the shard
          stops being a flat lozenge. It is the same four points already computed, one
          of them dropped, which is why a shard costs no more to shade than to draw.
        */
        const lit = this.paths[Math.min(BUCKETS - 1, bucket + 2)];
        lit.moveTo(tipX, tipY);
        lit.lineTo(sideX, sideY);
        lit.lineTo(backX, backY);
        lit.closePath();
        // Close enough to catch the key outright — and only the brighter-turned ones.
        if (r > 3.2 && sim.bright[i] > 0.7) {
          this.glint.moveTo(tipX, tipY);
          this.glint.lineTo(sideX, sideY);
          this.glint.lineTo(p.x + cos * 0.2 + sin * 0.1, p.y + sin * 0.2 - cos * 0.1);
          this.glint.closePath();
        }
        drew = true;
      }

      if (!drew) continue;
      const rgb = pass === 1 ? CRIMSON_RGB : TEAL_RGB;
      g.fillStyle = `rgb(${rgb})`;
      for (let b = 0; b < BUCKETS; b++) {
        g.globalAlpha = ((b + 0.5) / BUCKETS) * (look.bloom ? 0.9 : 0.7);
        g.fill(this.paths[b]);
      }
    }

    // One white pass over both colours, last, so a near shard reads as glass catching
    // the light rather than as a brighter piece of its own colour.
    g.fillStyle = '#ffffff';
    g.globalAlpha = look.bloom ? 0.34 : 0.2;
    g.fill(this.glint);
  }
}
