/**
 * The dust and the shards — the two things in the world there are thousands of.
 *
 * Everything else on the stage is a DOM element, because everything else is a thing
 * you can point at, read, or click. These are neither: they are the volume the camera
 * travels through, and there can be eighteen hundred of them. A `<div>` each would be
 * eighteen hundred composited layers to give the void a sense of speed, which is the
 * one place the DOM approach would fall over.
 *
 * So they live on a single 2D canvas — no WebGL, no shaders, no context that a
 * locked-down laptop can refuse to give us. The cost is one projection per point and
 * one batched fill per alpha bucket, and the whole field is drawn in a handful of
 * paths rather than a few thousand state changes.
 *
 * The shard pool keeps the WebGL build's lease protocol exactly: acts do not create
 * shards, they claim a slice of the pool for one frame and say where those shards
 * should be. That is what makes the Forge's shatter-and-reassemble handoff possible —
 * the shards leaving the outgoing project core are the same ones that build the
 * incoming one — and it is why nothing is ever allocated mid-scroll.
 */

import type { Quality } from '../../lib/quality';
import { Camera, newProjected } from '../camera';
import type { WorldLook } from '../look';
import { CRIMSON_RGB, TEAL_RGB } from '../look';
import { boot } from '../liveState';
import { mulberry, fzSurfaceSamples } from '../shapes';
import { WORLD, clamp01, ramp, smooth } from '../timeline';

export interface ShardLease {
  /** Where the shard is being pulled to, in world units. */
  x: number;
  y: number;
  z: number;
  /** 0 = free drift, 1 = fully claimed. */
  claim: number;
  scale: number;
}

/**
 * Acts publish claims here during their update; the field consumes them and clears the
 * map, so a lease only ever lasts one frame and a stale claim cannot strand a shard.
 */
export const shardClaims: { leases: Map<number, ShardLease> } = { leases: new Map() };

interface Shard {
  hx: number;
  hy: number;
  hz: number;
  spin: number;
  drift: number;
  scale: number;
  phase: number;
  /** Teal, or the one in four that is crimson. */
  crimson: boolean;
}

/** Alpha buckets. Eight steps is past the point anyone can see a seam. */
const BUCKETS = 8;
/** One full turn, for the round motes. */
const TAU = Math.PI * 2;

export class PointField {
  readonly canvas: HTMLCanvasElement;
  private readonly g: CanvasRenderingContext2D;
  private readonly dust: Float32Array;
  private readonly shards: Shard[] = [];
  private readonly samples: Array<[number, number, number]>;
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

    /*
      Spread through the whole travelled corridor rather than per act, so dust is
      already with you wherever you are on the scroll instead of fading in at each
      boundary. Seeded, so the void is the same void on every load.
    */
    const rnd = mulberry(4421);
    const zSpan = Math.abs(WORLD.contact.z) + 16;
    this.dust = new Float32Array(quality.dust * 3);
    for (let i = 0; i < quality.dust; i++) {
      this.dust[i * 3] = (rnd() - 0.5) * 58;
      this.dust[i * 3 + 1] = (rnd() - 0.5) * 30;
      this.dust[i * 3 + 2] = 8 - rnd() * zSpan;
    }

    const srnd = mulberry(9137);
    const shardSpan = Math.abs(WORLD.contact.z) + 12;
    for (let i = 0; i < quality.shards; i++) {
      this.shards.push({
        hx: (srnd() - 0.5) * 34,
        hy: (srnd() - 0.5) * 16,
        hz: 6 - srnd() * shardSpan,
        spin: (srnd() - 0.5) * 0.5,
        drift: 0.3 + srnd() * 0.9,
        scale: 0.45 + srnd() * 1.15,
        phase: srnd() * 6.283,
        // One in four is crimson and the rest are teal — the pool's only variation.
        // Any more colour and it drifts off-brand into grey confetti.
        crimson: srnd() > 0.74,
      });
    }

    this.samples = fzSurfaceSamples(40, 11);
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
    this.drawShards(cam, look, time, t);

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
      g.globalAlpha = ((b + 0.5) / BUCKETS) * 1;
      g.fill(this.paths[b]);
    }
  }

  /**
   * The shards. Free drift, unless something has claimed them this frame: act 00
   * solving the mark out of them at boot, or the works ring throwing them from one
   * crystal to the next.
   */
  private drawShards(cam: Camera, look: WorldLook, time: number, t: number): void {
    const count = this.shards.length;
    if (count === 0) {
      shardClaims.leases.clear();
      return;
    }
    const g = this.g;
    const p = this.p;
    this.glint = new Path2D();

    // The calibration solve: shards ease from wherever they were drifting onto their
    // target point on the mark, shrinking as they land so it reads as solid rather
    // than encrusted.
    if (!boot.done) {
      const k = smooth(boot.progress);
      const lanes = Math.min(this.samples.length, count);
      for (let i = 0; i < lanes; i++) {
        const s = this.samples[i];
        shardClaims.leases.set(i, {
          x: s[0] * 1.75,
          y: s[1] * 1.75,
          z: s[2] * 1.75,
          claim: k,
          scale: 1.4 + (0.28 - 1.4) * k,
        });
      }
    }

    // Act 09 pulls every shard in around the closing mark.
    const eased = smooth(ramp(t, 0.93, 1.0));
    const syncZ = WORLD.contact.z + 1.6;

    // Two colours, so two passes; alpha is bucketed inside each.
    for (let pass = 0; pass < 2; pass++) {
      for (let b = 0; b < BUCKETS; b++) this.paths[b] = new Path2D();
      let drew = false;

      for (let i = 0; i < count; i++) {
        const sh = this.shards[i];
        if (sh.crimson !== (pass === 1)) continue;

        let x = sh.hx + Math.cos(time * 0.17 * sh.drift + sh.phase) * 0.7;
        let y = sh.hy + Math.sin(time * 0.22 * sh.drift + sh.phase) * 0.8;
        let z = sh.hz;
        let scale = sh.scale;

        const lease = shardClaims.leases.get(i);
        if (lease && lease.claim > 0) {
          const k = clamp01(lease.claim);
          x += (lease.x - x) * k;
          y += (lease.y - y) * k;
          z += (lease.z - z) * k;
          scale = sh.scale * (1 - k) + lease.scale * k;
        }

        if (eased > 0) {
          // Ring in around the closing mark rather than collapsing to a point.
          x += (Math.cos(sh.phase) * 7 * (1 - eased * 0.72) - x) * eased;
          y += (0.4 + Math.sin(sh.phase) * 2.1 * (1 - eased * 0.72) - y) * eased;
          z += (syncZ - z) * eased;
          scale += (sh.scale * 1.5 - scale) * eased;
        }

        cam.project(x, y, z, p);
        if (!p.visible) continue;
        const r = 0.15 * scale * p.scale;
        if (r < 0.4) continue;
        if (p.x < -r * 2 || p.y < -r * 2 || p.x > this.width + r * 2 || p.y > this.height + r * 2) {
          continue;
        }
        const alpha = p.fog * 0.92;
        if (alpha < 0.02) continue;

        // A flake, not a die: the octahedron squashed on one axis, as a diamond.
        const a = sh.phase + time * sh.spin;
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
        const lit = this.paths[Math.min(BUCKETS - 1, bucket + 3)];
        lit.moveTo(tipX, tipY);
        lit.lineTo(sideX, sideY);
        lit.lineTo(backX, backY);
        lit.closePath();
        // Close enough to catch the key outright.
        if (r > 3.2) {
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
        g.globalAlpha = ((b + 0.5) / BUCKETS) * (look.bloom ? 1 : 0.75);
        g.fill(this.paths[b]);
      }
    }

    // One white pass over both colours, last, so a near shard reads as glass catching
    // the light rather than as a brighter piece of its own colour.
    g.fillStyle = '#ffffff';
    g.globalAlpha = look.bloom ? 0.5 : 0.28;
    g.fill(this.glint);

    shardClaims.leases.clear();
  }
}
