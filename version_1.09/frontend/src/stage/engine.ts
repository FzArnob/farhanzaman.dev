/**
 * One loop, forever.
 *
 * The stage mounts once and never unmounts. Acts inside it appear and disappear by
 * scroll proximity — the same `actPresence` curve the WebGL build used — so peak cost
 * stays flat however much content the admin editor adds later. An act that is not on
 * screen is `display:none` and is not visited at all.
 *
 * The whole world is driven from a single requestAnimationFrame callback. There is no
 * per-act rAF, no ResizeObserver churn and no React state anywhere on the path: React
 * renders the copy overlay, and this renders the place the copy is standing in. The
 * two meet only through src/stage/liveState.ts, which imports nothing.
 *
 * The stage is aria-hidden and role="presentation". Not a character of the copy lives
 * only here — the corridor blocks carry real text so they can be read and indexed, but
 * every act's content is also in the overlay — so deleting this module would leave a
 * readable site.
 */

import type { Quality } from '../lib/quality';
import type { GamingVideo } from '../types/gaming';
import type { Profile } from '../types/profile';
import { Camera } from './camera';
import { el } from './dom';
import type { WorldLook } from './look';
import { boot, caseOpenState } from './liveState';
import { clamp01, smooth } from './timeline';

export interface Frame {
  /** Damped scroll position, 0..1. The only clock the acts read. */
  t: number;
  /** Seconds since the stage started. */
  time: number;
  /** Seconds since the previous frame, clamped. */
  delta: number;
  cam: Camera;
  look: WorldLook;
  quality: Quality;
}

export interface Act {
  /** The act's own layer. Owned by the act, parented by the stage. */
  root: HTMLElement;
  update(f: Frame): void;
  /** Called when the viewport changes, for acts that solve their own fit. */
  resize?(width: number, height: number): void;
  dispose?(): void;
}

export interface BuildContext {
  host: HTMLElement;
  profile: Profile;
  quality: Quality;
  look: WorldLook;
  /** Which project core the camera has flown into, read every frame. */
  openProject: () => string | null;
  onOpenProject: (id: string) => void;
  onLightbox: (index: number) => void;
  onAchievement: (index: number) => void;
  onOpenClip: (clip: GamingVideo) => void;
  /** Called once if the first second of real frames disagrees with the guessed tier. */
  onDemote: () => void;
}

export type ActFactory = (ctx: BuildContext) => Act;

/**
 * Builds the world and runs it.
 *
 * `chamber` is the one piece of camera state the engine owns rather than the timeline:
 * how far the camera is into an opened project core. It eases both ways, so escaping
 * flies back out to the ring angle it left from.
 */
export class StageEngine {
  private readonly cam = new Camera();
  private readonly acts: Act[] = [];
  private readonly ctx: BuildContext;
  private readonly root: HTMLElement;
  private frameId = 0;
  private started = 0;
  private last = 0;
  private chamber = 0;
  private bootElapsed = 0;
  private samples: number[] = [];
  private settled = false;
  private readTime: () => number;
  private detach: Array<() => void> = [];

  private readonly frame: Frame;

  constructor(ctx: BuildContext, factories: ActFactory[], readT: () => number) {
    this.ctx = ctx;
    this.readTime = readT;

    this.root = el('div', 'pz3-stage', ctx.host);
    this.root.setAttribute('aria-hidden', 'true');
    this.root.setAttribute('role', 'presentation');
    this.root.style.background = ctx.look.background;

    this.frame = {
      t: 0,
      time: 0,
      delta: 0,
      cam: this.cam,
      look: ctx.look,
      quality: ctx.quality,
    };

    this.cam.fog(ctx.look.fogNear, ctx.look.fogFar);

    const inner: BuildContext = { ...ctx, host: this.root };
    for (const make of factories) {
      const act = make(inner);
      this.acts.push(act);
      // Factories parent their own root, so an act can choose its place in the stack.
      if (act.root.parentNode !== this.root) this.root.appendChild(act.root);
    }

    this.bind();
    this.measure();
  }

  private bind(): void {
    const onResize = () => this.measure();
    window.addEventListener('resize', onResize, { passive: true });
    this.detach.push(() => window.removeEventListener('resize', onResize));

    /*
      Pointer parallax. The stage itself never hit-tests — the acts that respond to a
      pointer put a real element under it and let the browser do that work, which is
      the one thing a DOM scene gets for free that a canvas has to raycast for.
    */
    const onMove = (e: PointerEvent) => {
      this.cam.pointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    this.detach.push(() => window.removeEventListener('pointermove', onMove));

    // Calibration is never a toll booth: any click or key ends it now.
    const onSkip = () => boot.skip();
    window.addEventListener('pointerdown', onSkip, { once: true });
    window.addEventListener('keydown', onSkip, { once: true });
    this.detach.push(() => {
      window.removeEventListener('pointerdown', onSkip);
      window.removeEventListener('keydown', onSkip);
    });
  }

  private measure(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.cam.resize(w, h);
    for (const act of this.acts) act.resize?.(w, h);
  }

  start(): void {
    if (this.frameId) return;
    this.started = 0;
    this.last = 0;
    const tick = (now: number) => {
      this.frameId = requestAnimationFrame(tick);
      this.run(now);
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private run(now: number): void {
    if (!this.started) this.started = now;
    /*
      Clamped for the same reason the scroll follower clamps: a backgrounded tab
      resumes with a multi-second step, and every damped value in the world would
      snap. A quarter of a second is long enough that a genuinely slow frame still
      advances properly.
    */
    const delta = this.last ? Math.min((now - this.last) / 1000, 0.25) : 0.016;
    this.last = now;

    const f = this.frame;
    f.t = this.readTime();
    f.time = (now - this.started) / 1000;
    f.delta = delta;

    // The calibration clock: 900 ms cold, 400 ms once the data is in hand, instant on
    // a skip. It drives the curtain, the camera's hold and act 00's solve.
    if (!boot.done) {
      this.bootElapsed += delta;
      const duration = boot.skipped ? 0.16 : boot.ready ? 0.4 : 0.9;
      boot.progress = clamp01(this.bootElapsed / duration);
      if (boot.progress >= 1) boot.done = true;
    }

    const open = this.ctx.openProject() !== null;
    this.chamber += ((open ? 1 : 0) - this.chamber) * (1 - Math.exp(-delta * 2.6));
    caseOpenState.progress = this.chamber;

    const hold = boot.done ? 0 : 1 - smooth(boot.progress);
    this.cam.update(f.t, delta, this.chamber, hold, this.ctx.quality.tier === 'low' ? 0.4 : 1);

    for (let i = 0; i < this.acts.length; i++) this.acts[i].update(f);
    this.probe(delta);
  }

  /**
   * Measured tiering. The device signals give a first guess; if the first second of
   * real frames disagrees, the tier drops once. A demotion mid-scroll would be more
   * jarring than the frames it saves, so it only ever happens at the start.
   */
  private probe(delta: number): void {
    if (this.settled) return;
    this.samples.push(delta);
    if (this.samples.length < 45) return;
    this.settled = true;
    // Discard the first ten: the build and the first paints land there and are not
    // representative of a settled scroll.
    const window = this.samples.slice(10);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const floor = this.ctx.quality.tier === 'high' ? 45 : 28;
    if (1 / mean < floor) this.ctx.onDemote();
  }

  /** How far the camera is into an opened core, for the acts that need to know. */
  get chamberProgress(): number {
    return this.chamber;
  }

  dispose(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    for (const off of this.detach) off();
    this.detach = [];
    for (const act of this.acts) act.dispose?.();
    this.acts.length = 0;
    this.root.remove();
  }
}
