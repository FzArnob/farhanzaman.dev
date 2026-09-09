/**
 * The stage's DOM primitives.
 *
 * Two rules hold the frame budget together and they both live here.
 *
 * The first is that the loop only ever writes `transform`, `opacity`, `z-index` and
 * `display`. Nothing it touches can cause a layout: every stage element is absolutely
 * positioned at the origin of its layer and moved from there, so the browser has no
 * geometry to re-solve. Nothing it touches causes a paint either — the compositor
 * already holds the pixels.
 *
 * The second is that an assignment the DOM does not need never happens. Writing an
 * identical string to `style.transform` still marks the element dirty and buys a style
 * recalculation on the next frame, and a scroll that parks — which is most of the time
 * a visitor spends on a page — would pay that for every object in the act. `Item`
 * remembers what it last wrote and skips the write when nothing moved, so a stationary
 * world costs approximately nothing.
 */

/** Creates an element, classes it, and parents it. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  parent?: HTMLElement
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  parent?: Element
): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (parent) parent.appendChild(node);
  return node;
}

/**
 * One positioned thing on the stage: a block, a word, a blade, a frame.
 *
 * Opacity is quantised to three decimals and the transform to two — below that the
 * difference is invisible and the only thing another decimal buys is a style write
 * that would otherwise have been skipped.
 */
export class Item {
  readonly el: HTMLElement;
  private lastTransform = '';
  private lastOpacity = -1;
  private lastOrder = -99999;
  private visible = true;

  constructor(node: HTMLElement) {
    this.el = node;
  }

  /** Hides with `display:none`: out of the act, out of the frame's work entirely. */
  show(on: boolean): boolean {
    if (on !== this.visible) {
      this.visible = on;
      this.el.style.display = on ? '' : 'none';
    }
    return on;
  }

  transform(value: string): void {
    if (value !== this.lastTransform) {
      this.lastTransform = value;
      this.el.style.transform = value;
    }
  }

  opacity(value: number): void {
    const v = value < 0 ? 0 : value > 1 ? 1 : value;
    const q = Math.round(v * 1000) / 1000;
    if (q !== this.lastOpacity) {
      this.lastOpacity = q;
      this.el.style.opacity = String(q);
    }
  }

  order(z: number): void {
    if (z !== this.lastOrder) {
      this.lastOrder = z;
      this.el.style.zIndex = String(z);
    }
  }
}

/**
 * Pixels per world unit at authoring time.
 *
 * Every stage element is built at this scale and then divided back down by `place`,
 * which is what lets an act say "3.5 units wide" and get the size the same object had
 * in the WebGL build. It is also why type on a corridor block is sharp: at the depth
 * the blocks are read from, the resulting scale factor is close to 1.
 */
export const UNIT = 100;

/** Rounds for the transform string: two decimals of a pixel is well past sight. */
export function q(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

/**
 * The standard placement: put the element's centre at a screen point and scale it.
 *
 * `scale` here is world-units-to-pixels, and every stage element is authored at
 * UNIT px to the world unit, so one multiply puts a div at the size the same object
 * had in the WebGL build.
 *
 * `own` is the object's own orientation — a roll, a yaw, a squash — and goes in ahead
 * of the centring translate so it happens about the element's middle rather than its
 * top-left corner. Every stage element sets `transform-origin: 0 0`, which is what
 * makes the placement exact; the centring is done here instead, in the one place that
 * knows the order the functions have to be in.
 */
export function place(x: number, y: number, scale: number, own = ''): string {
  return (
    `translate3d(${q(x)}px,${q(y)}px,0) scale(${(scale / UNIT).toFixed(4)})` +
    (own ? ' ' + own : '') +
    ' translate(-50%,-50%)'
  );
}

/**
 * How tall a line element is built, in pixels, before `span` scales it.
 *
 * A line used to be one pixel tall, which is all a flat fill needs — but a flat fill
 * is also why lines read as ribbons rather than as anything with a round side. A
 * filament (see glass.ts) is a cross-section ramp, and a ramp needs somewhere to
 * happen: at one pixel there is nothing to put a hot core in the middle of. So lines
 * are built this tall, carry their gradient at that size, and `span` divides back down
 * to whatever the frame actually asked for.
 */
export const LINE_BASE = 8;

/**
 * A screen-space line between two projected points — the cable in the corridor, the
 * links between certificates from the same issuer.
 *
 * Drawn from its two ends rather than as a projected cylinder because a line has no
 * thickness worth foreshortening: the result is identical and it costs one rotate.
 *
 * `thickness` is in screen pixels. Perspective on a line has to come from the caller,
 * by cutting a long run into segments and giving each one the thickness its own depth
 * earns — a single rotated rect has one width along its whole length, so a cable that
 * takes its thickness from either end is wrong at the other one.
 */
export function span(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  base = LINE_BASE
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    `translate3d(${q(x1)}px,${q(y1)}px,0) rotate(${q(angle)}deg) ` +
    `scale(${q(len)},${(Math.max(0.5, thickness) / base).toFixed(4)}) translate(0,-50%)`
  );
}
