/**
 * The camera, and the projection every act draws through.
 *
 * This is the same camera the WebGL build had — the same CAMERA_KEYS, the same 50°
 * vertical field, the same piecewise easing, the same pointer parallax applied as a
 * rotation rather than a translation. What changed is where the divide happens: three
 * did the perspective divide on the GPU, and this does it here, once per object per
 * frame, so an act can place a `<div>` at a world coordinate.
 *
 * Doing the divide in JS rather than handing the whole scene to a CSS `perspective`
 * container is deliberate and is what makes the port cheap:
 *
 *   - depth is a number we hold, so fog, culling and paint order are all trivial and
 *     exact, where `preserve-3d` would make us fight the browser for all three;
 *   - only the objects an act actually shows are touched — everything else is
 *     `display:none` and costs nothing at all;
 *   - each element ends up with a plain 2D `translate/scale`, which the compositor
 *     handles without a single layout or paint.
 *
 * An object's own turn still uses a real 3D transform — `perspective()` as a transform
 * function, the same technique hooks/useScroll3D.ts uses on the About page — so a
 * block that yaws to face you foreshortens properly.
 */

import { CAMERA_KEYS, WORLD, clamp01, smooth } from './timeline';

/** three's default camera: 50° vertical field, near 0.1, far 420. */
const FOV = 50;
const NEAR = 0.12;

export interface Projected {
  /** Screen position in CSS pixels. */
  x: number;
  y: number;
  /** Distance along the view axis, in world units. */
  depth: number;
  /** World units to CSS pixels at this depth. */
  scale: number;
  /** Linear fog: 1 in front of fogNear, 0 past fogFar. */
  fog: number;
  /** False when the point is behind the camera or fully fogged out. */
  visible: boolean;
}

type Vec = { x: number; y: number; z: number };

function set(v: Vec, x: number, y: number, z: number): Vec {
  v.x = x;
  v.y = y;
  v.z = z;
  return v;
}

function norm(v: Vec): Vec {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  v.x /= len;
  v.y /= len;
  v.z /= len;
  return v;
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

/**
 * Piecewise-eased through CAMERA_KEYS rather than a spline through them, because the
 * acts need the camera to be exactly where the keyframe says at each boundary. A
 * Catmull-Rom's arc-length reparameterisation would slide it off by a few percent and
 * the works ring would no longer be centred on its hub.
 */
function sampleKeys(t: number, pos: Vec, look: Vec): void {
  let i = 0;
  while (i < CAMERA_KEYS.length - 2 && t > CAMERA_KEYS[i + 1].t) i++;
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[i + 1];
  const u = smooth((t - a.t) / (b.t - a.t));
  set(pos, lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u));
  set(look, lerp(a.l[0], b.l[0], u), lerp(a.l[1], b.l[1], u), lerp(a.l[2], b.l[2], u));
}

export class Camera {
  readonly pos: Vec = { x: 0, y: 0.25, z: 7.4 };
  /** View basis. Right-handed, forward pointing INTO the screen. */
  private fwd: Vec = { x: 0, y: 0, z: -1 };
  private right: Vec = { x: 1, y: 0, z: 0 };
  private up: Vec = { x: 0, y: 1, z: 0 };

  /** Viewport, in CSS pixels. */
  width = 1;
  height = 1;
  private cx = 0;
  private cy = 0;
  /** World-units-to-pixels at unit depth. */
  focal = 1;

  private target: Vec = { x: 0, y: 0, z: 0 };
  private fogNear = 26;
  private fogFar = 108;

  /** Pointer parallax, damped. */
  private px = 0;
  private py = 0;
  private tx = 0;
  private ty = 0;

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.cx = width / 2;
    this.cy = height / 2;
    /*
      three's fov is VERTICAL, so the focal length comes off the height and the same
      value serves both axes — which is why a portrait phone sees so much less of the
      world sideways, and why the acts that fan out sideways solve their own fit.
    */
    this.focal = height / 2 / Math.tan((FOV * Math.PI) / 360);
  }

  fog(near: number, far: number): void {
    this.fogNear = near;
    this.fogFar = far;
  }

  pointer(x: number, y: number): void {
    this.tx = x;
    this.ty = y;
  }

  /**
   * Place the camera for this frame.
   *
   * `override` is the opened-project chamber: the camera leaves the spline and flies
   * through a facet into the core, then eases back out to the same ring angle it left
   * from, because the spline position it returns to is still a function of t.
   */
  update(t: number, delta: number, chamber: number, bootHold: number, parallax: number): void {
    sampleKeys(t, this.pos, this.target);

    if (chamber > 0.001) {
      const chamberZ = WORLD.works.z - WORLD.works.radius;
      const k = smooth(clamp01(chamber));
      this.pos.x = lerp(this.pos.x, 0, k);
      this.pos.y = lerp(this.pos.y, 0.4, k);
      this.pos.z = lerp(this.pos.z, chamberZ + 4.2, k);
      this.target.x = lerp(this.target.x, 0, k);
      this.target.y = lerp(this.target.y, 0, k);
      this.target.z = lerp(this.target.z, chamberZ, k);
    }

    // The calibration hold: the camera sits slightly back until the mark has assembled.
    this.pos.z += bootHold * 2.6;

    // An exponential follower, correct at any frame rate given the real elapsed time.
    const k = 1 - Math.exp(-delta * 3.2);
    this.px += (this.tx - this.px) * k;
    this.py += (this.ty - this.py) * k;

    // Basis from the look-at, three's convention with world up = +Y.
    const f = norm(
      set(this.fwd, this.target.x - this.pos.x, this.target.y - this.pos.y, this.target.z - this.pos.z)
    );
    // right = fwd × worldUp, which for up = +Y reduces to (-f.z, 0, f.x)
    const r = norm(set(this.right, -f.z, 0, f.x));
    // up = right × fwd
    set(this.up, r.y * f.z - r.z * f.y, r.z * f.x - r.x * f.z, r.x * f.y - r.y * f.x);

    /*
      Parallax as a rotation of the basis rather than a translation of the eye: it
      never breaks the framing of whichever act the spline has carefully composed.
    */
    const amount = parallax * (1 - chamber * 0.7);
    this.yaw(-this.px * 0.06 * amount);
    this.pitch(-this.py * 0.04 * amount);
  }

  private yaw(a: number): void {
    if (!a) return;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const f = this.fwd;
    const r = this.right;
    const fx = f.x * c - r.x * s;
    const fy = f.y * c - r.y * s;
    const fz = f.z * c - r.z * s;
    set(this.right, r.x * c + f.x * s, r.y * c + f.y * s, r.z * c + f.z * s);
    set(this.fwd, fx, fy, fz);
  }

  private pitch(a: number): void {
    if (!a) return;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const f = this.fwd;
    const u = this.up;
    const fx = f.x * c + u.x * s;
    const fy = f.y * c + u.y * s;
    const fz = f.z * c + u.z * s;
    set(this.up, u.x * c - f.x * s, u.y * c - f.y * s, u.z * c - f.z * s);
    set(this.fwd, fx, fy, fz);
  }

  /**
   * World point to screen. `out` is caller-owned so the loop allocates nothing.
   *
   * Note the projection uses one focal length for both axes, which is exactly what a
   * vertical-fov perspective matrix does once the aspect divide is unwound.
   */
  project(x: number, y: number, z: number, out: Projected): Projected {
    const dx = x - this.pos.x;
    const dy = y - this.pos.y;
    const dz = z - this.pos.z;
    const depth = dx * this.fwd.x + dy * this.fwd.y + dz * this.fwd.z;
    out.depth = depth;
    if (depth <= NEAR) {
      out.visible = false;
      out.x = out.y = 0;
      out.scale = 0;
      out.fog = 0;
      return out;
    }
    const sx = dx * this.right.x + dy * this.right.y + dz * this.right.z;
    const sy = dx * this.up.x + dy * this.up.y + dz * this.up.z;
    const k = this.focal / depth;
    out.x = this.cx + sx * k;
    out.y = this.cy - sy * k;
    out.scale = k;
    // Linear fog, as three computes it: fully clear in front of near, gone past far.
    out.fog = clamp01((this.fogFar - depth) / (this.fogFar - this.fogNear));
    out.visible = out.fog > 0.004;
    return out;
  }

  /**
   * A segment, clipped against the near plane.
   *
   * The corridor cable and the constellation's issuer links both run past the camera
   * as it travels, so at least one end is usually behind it. Clipping the segment
   * rather than dropping it is what keeps the cable drawn all the way to the edge of
   * the frame instead of blinking out as its far end goes by.
   *
   * Returns false when the whole segment is behind the camera.
   */
  segment(
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    outA: Projected, outB: Projected
  ): boolean {
    this.project(ax, ay, az, outA);
    this.project(bx, by, bz, outB);
    const da = outA.depth;
    const db = outB.depth;
    if (da <= NEAR && db <= NEAR) return false;
    if (da <= NEAR || db <= NEAR) {
      // Slide the behind-the-camera end forward to where the segment crosses the plane.
      const u = (NEAR - da) / (db - da);
      const cx = ax + (bx - ax) * u;
      const cy = ay + (by - ay) * u;
      const cz = az + (bz - az) * u;
      // A hair past the plane, so the divide never lands on zero.
      const k = 1.0001;
      if (da <= NEAR) this.project(ax + (cx - ax) * k, ay + (cy - ay) * k, az + (cz - az) * k, outA);
      else this.project(bx + (cx - bx) * k, by + (cy - by) * k, bz + (cz - bz) * k, outB);
    }
    return true;
  }

  /** Paint order. Nearer is higher, in the range CSS can hold without churn. */
  static order(depth: number): number {
    const z = 4000 - Math.round(depth * 8);
    return z < 1 ? 1 : z > 4000 ? 4000 : z;
  }
}

export function newProjected(): Projected {
  return { x: 0, y: 0, depth: 0, scale: 0, fog: 0, visible: false };
}
