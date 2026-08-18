import { useEffect, useRef } from 'react';
import { onFrame } from '../../lib/motion/raf';
import { isCoarsePointer, prefersReducedMotion } from '../../lib/motion/tokens';

/** How many trail dots are recycled. The old version created a node per mousemove. */
const TRAIL_POOL = 14;
/** Minimum gap between two trail dots, ms. */
const TRAIL_INTERVAL = 40;
/** Minimum travel before another dot is worth emitting, px. */
const TRAIL_DISTANCE = 12;
/** Ring follow time constant, ms — higher lags more. */
const RING_TAU = 70;

const TEXT_TARGETS = 'input, textarea, [contenteditable="true"]';
const MEDIA_TARGETS = '.image-container, .work-media, #largePhoto, .thumbnail-g, .work-card-image';
const LINK_TARGETS =
  'a, button, [role="button"], .work-card, .point-box, .cert-node, .sphere-tag, ' +
  '.themeBtn, .nav-icon, #back-to-top-btn, .rail-item, #closeButton, .achievement-node';

function classify(target: EventTarget | null): string {
  if (!(target instanceof Element)) return 'default';
  if (target.closest(TEXT_TARGETS)) return 'text';
  if (target.closest(MEDIA_TARGETS)) return 'media';
  if (target.closest(LINK_TARGETS)) return 'link';
  return 'default';
}

interface CursorProps {
  /** Gaming keeps its native cursors — pointer, caret and all. */
  enabled?: boolean;
}

/**
 * The read-head: a teal probe locked to the pointer, a magenta ring trailing it on a
 * spring, and the implode trail promoted site-wide.
 *
 * The native cursor is hidden while this is mounted, which is exactly why
 * `:focus-visible` rings are mandatory (see 24-motion.css) — a keyboard user has
 * to keep some way of knowing where they are.
 */
export function Cursor({ enabled = true }: CursorProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const active = enabled && !isCoarsePointer();

  useEffect(() => {
    const layer = layerRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!layer || !dot || !ring || !active) return;

    const reduced = prefersReducedMotion();
    const root = document.documentElement;
    root.dataset.cursorHidden = 'true';

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;
    let visible = false;

    /* --- trail pool --------------------------------------------------- */
    const pool: HTMLSpanElement[] = [];
    if (!reduced) {
      for (let i = 0; i < TRAIL_POOL; i++) {
        const span = document.createElement('span');
        span.className = 'trail-dot';
        layer.appendChild(span);
        pool.push(span);
      }
    }
    let poolIndex = 0;
    let lastEmit = 0;
    let lastEmitX = x;
    let lastEmitY = y;

    function emitTrail(now: number): void {
      if (reduced || pool.length === 0) return;
      if (now - lastEmit < TRAIL_INTERVAL) return;
      const dx = x - lastEmitX;
      const dy = y - lastEmitY;
      if (dx * dx + dy * dy < TRAIL_DISTANCE * TRAIL_DISTANCE) return;

      const span = pool[poolIndex];
      poolIndex = (poolIndex + 1) % pool.length;
      span.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      // Restart the keyframe on a recycled node.
      span.classList.remove('live');
      void span.offsetWidth;
      span.classList.add('live');

      lastEmit = now;
      lastEmitX = x;
      lastEmitY = y;
    }

    /* --- frame -------------------------------------------------------- */
    const stopFrame = onFrame((now, delta) => {
      if (!visible) return;
      // Exponential follow: frame-rate independent, and it settles instead of
      // oscillating the way a naive lerp does on a dropped frame.
      const k = reduced ? 1 : 1 - Math.exp(-delta / RING_TAU);
      ringX += (x - ringX) * k;
      ringY += (y - ringY) * k;

      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      emitTrail(now);
    });

    /* --- input -------------------------------------------------------- */
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        visible = true;
        ringX = x;
        ringY = y;
        layer.style.opacity = '1';
      }
    };

    const onOver = (event: PointerEvent) => {
      layer.dataset.target = classify(event.target);
    };

    const onDown = () => {
      layer.dataset.pressed = 'true';
    };
    const onUp = () => {
      delete layer.dataset.pressed;
    };

    const onLeave = () => {
      visible = false;
      layer.style.opacity = '0';
    };

    layer.style.opacity = '0';
    layer.style.transition = 'opacity 160ms cubic-bezier(0.4, 0, 0.2, 1)';

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      stopFrame();
      delete root.dataset.cursorHidden;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      for (const span of pool) span.remove();
    };
  }, [active]);

  // Nothing rendered at all when the custom cursor stands down, otherwise the
  // probe and ring park themselves in the top-left corner.
  if (!active) return null;

  return (
    <div id="cursor-layer" ref={layerRef} data-target="default" aria-hidden="true">
      <span className="cursor-ring" ref={ringRef}></span>
      <span className="cursor-dot" ref={dotRef}></span>
    </div>
  );
}
