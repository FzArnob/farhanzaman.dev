/**
 * The shard pool's motion — one simulation, two renderers.
 *
 * The stage draws through WebGL where it can and through the DOM and a 2D canvas where
 * it cannot, and the shards are the one thing both renderers have to agree about
 * exactly: act 00 solves them onto the mark, the works ring throws them from one
 * crystal to the next, and act 09 gathers every one of them in around the closing
 * mark. If each renderer carried its own copy of that choreography, the two versions
 * of the site would drift apart the first time either was touched.
 *
 * So this file owns where every shard is, and nothing else. It never draws. The 2D
 * point field turns each shard into a folded diamond; the WebGL field writes the same
 * numbers into an instance matrix and gets a real crystal that catches real light.
 *
 * The lease protocol is unchanged from the WebGL build: acts do not create shards,
 * they claim a slice of the pool for one frame and say where those shards should be.
 * That is what makes the Forge's shatter-and-reassemble handoff possible — the shards
 * leaving the outgoing project core are the same ones that build the incoming one —
 * and it is why nothing is ever allocated mid-scroll.
 */

import { boot, contactMark } from '../liveState';
import { fzSurfaceSamples, mulberry } from '../shapes';
import { ACT_BY_ID, WORLD, clamp01, ramp, smooth } from '../timeline';

/** The gather runs over act 09's arrival, so it is finished before its hold begins. */
const CONTACT = ACT_BY_ID.contact;

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
 * Acts publish claims here during their update; the pool consumes them and clears the
 * map, so a lease only ever lasts one frame and a stale claim cannot strand a shard.
 */
export const shardClaims: { leases: Map<number, ShardLease> } = { leases: new Map() };

/** A shard's radius in world units at scale 1. Both renderers size from this. */
export const SHARD_RADIUS = 0.15;

export class ShardSim {
  readonly count: number;

  /** Teal, or the one in four that is crimson. */
  readonly crimson: Uint8Array;
  /**
   * Each shard's own share of the light, 0.42–1. Without it the pool is two flat
   * colours at one brightness and reads as confetti; with it, some flakes are turned
   * toward the key and some away, which is what a cloud of real crystal does.
   */
  readonly bright: Float32Array;
  /** In-plane spin, for the 2D renderer's diamond. Radians per second. */
  readonly spin: Float32Array;
  readonly phase: Float32Array;
  /** Tumble rates about three axes, for the 3D renderer. Stride 3. */
  readonly tumble: Float32Array;

  /** This frame's result. */
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly z: Float32Array;
  readonly scale: Float32Array;

  private readonly hx: Float32Array;
  private readonly hy: Float32Array;
  private readonly hz: Float32Array;
  private readonly drift: Float32Array;
  private readonly base: Float32Array;
  private readonly samples: Array<[number, number, number]>;

  constructor(count: number) {
    const n = Math.max(0, count | 0);
    this.count = n;
    this.crimson = new Uint8Array(n);
    this.bright = new Float32Array(n);
    this.spin = new Float32Array(n);
    this.phase = new Float32Array(n);
    this.tumble = new Float32Array(n * 3);
    this.x = new Float32Array(n);
    this.y = new Float32Array(n);
    this.z = new Float32Array(n);
    this.scale = new Float32Array(n);
    this.hx = new Float32Array(n);
    this.hy = new Float32Array(n);
    this.hz = new Float32Array(n);
    this.drift = new Float32Array(n);
    this.base = new Float32Array(n);

    /*
      The original seeded stream, draw for draw, so every shard still hangs where it
      always did. What is new about a shard — its brightness, whether it is one of the
      larger ones, how it tumbles — comes from a second stream, so adding it could not
      move a single existing flake.
    */
    const srnd = mulberry(9137);
    const vary = mulberry(2718);
    const span = Math.abs(WORLD.contact.z) + 12;
    for (let i = 0; i < n; i++) {
      this.hx[i] = (srnd() - 0.5) * 34;
      this.hy[i] = (srnd() - 0.5) * 16;
      this.hz[i] = 6 - srnd() * span;
      this.spin[i] = (srnd() - 0.5) * 0.5;
      this.drift[i] = 0.3 + srnd() * 0.9;
      this.base[i] = 0.45 + srnd() * 1.15;
      this.phase[i] = srnd() * 6.283;
      // One in four is crimson and the rest are teal — the pool's only hue variation.
      // Any more colour and it drifts off-brand into grey confetti.
      this.crimson[i] = srnd() > 0.74 ? 1 : 0;

      this.bright[i] = 0.42 + vary() * 0.58;
      // About one in eight is a larger piece. The field's scale is right as it is;
      // the few bigger ones are what give it a foreground to measure it against.
      if (vary() < 0.13) this.base[i] *= 1.6 + vary() * 0.9;
      this.tumble[i * 3] = (vary() - 0.5) * 0.9;
      this.tumble[i * 3 + 1] = (vary() - 0.5) * 1.1;
      this.tumble[i * 3 + 2] = (vary() - 0.5) * 0.7;
    }

    this.samples = fzSurfaceSamples(40, 11);
  }

  /**
   * Where every shard is this frame: free drift, pulled by whatever has leased it, and
   * — over the last few percent of the scroll — gathered in around the closing mark.
   * Consumes and clears the frame's leases.
   */
  step(time: number, t: number): void {
    const n = this.count;
    if (n === 0) {
      shardClaims.leases.clear();
      return;
    }

    // The calibration solve: shards ease from wherever they were drifting onto their
    // target point on the mark, shrinking as they land so it reads as solid rather
    // than encrusted.
    if (!boot.done) {
      const k = smooth(boot.progress);
      const lanes = Math.min(this.samples.length, n);
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

    /*
      Act 09 gathers every shard into an orbit around the closing mark — a flat ring
      seen nearly edge-on, turning slowly — wherever the mark has been hung this frame
      and sized to it. It used to close to a disc in front of a fixed point, which on
      most screens was right behind the contact details.
    */
    const eased = smooth(ramp(t, CONTACT.t0, CONTACT.h0));
    const ring = 2.3 * contactMark.scale;
    const turn = time * 0.12;

    for (let i = 0; i < n; i++) {
      const phase = this.phase[i];
      const drift = this.drift[i];
      let x = this.hx[i] + Math.cos(time * 0.17 * drift + phase) * 0.7;
      let y = this.hy[i] + Math.sin(time * 0.22 * drift + phase) * 0.8;
      let z = this.hz[i];
      let scale = this.base[i];

      const lease = shardClaims.leases.get(i);
      if (lease && lease.claim > 0) {
        const k = clamp01(lease.claim);
        x += (lease.x - x) * k;
        y += (lease.y - y) * k;
        z += (lease.z - z) * k;
        scale = this.base[i] * (1 - k) + lease.scale * k;
      }

      if (eased > 0) {
        // Ring in from wide, each shard on its own lane so the orbit has some depth.
        const a = phase + turn * drift;
        const r = ring * (0.86 + drift * 0.24) * (1 + (1 - eased) * 2.2);
        x += (contactMark.x + Math.cos(a) * r - x) * eased;
        y += (contactMark.y + Math.sin(a) * r * 0.14 - y) * eased;
        z += (contactMark.z + Math.sin(a) * r * 0.8 - z) * eased;
        scale += (this.base[i] * (0.35 + 0.55 * Math.min(1.4, contactMark.scale)) - scale) * eased;
      }

      this.x[i] = x;
      this.y[i] = y;
      this.z[i] = z;
      this.scale[i] = scale;
    }

    shardClaims.leases.clear();
  }
}
