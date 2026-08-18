/**
 * Particle network — the site's permanent background noise.
 *
 * Descended from the old hero-only `particleNetwork`, rewritten for the whole
 * document. The differences that matter:
 *
 *  - hard particle cap, so a 4K monitor doesn't quadruple the frame cost
 *  - spatial hash grid instead of the O(n²) link pass
 *  - device pixel ratio capped at 1.5 (it is a backdrop, not artwork)
 *  - pointer tracked on `document`, and **never** `preventDefault`ed — the old
 *    touchmove handler cancelled the event, which site-wide would have stopped
 *    scrolling on every mobile page
 *  - periodic "packet burst": a band of the field tears sideways for ~180ms
 *  - runs on the shared rAF loop, so it pauses with everything else
 */

import { onFrame } from './motion/raf';
import { currentTheme } from './theme';
import { prefersReducedMotion } from './motion/tokens';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Fades in from 0 so spawned particles don't pop. */
  a: number;
}

const LINK_DISTANCE_WIDE = 170;
const LINK_DISTANCE_NARROW = 120;
const MAX_DPR = 1.5;
/** Extra particles a click may add on top of the baseline. */
const SPAWN_BUDGET = 12;

interface Palette {
  dot: string;
  link: [number, number, number];
  accent: [number, number, number];
  alpha: number;
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const teal = parseRgb(style.getPropertyValue('--theme-color')) ?? [0, 211, 180];
  const magenta = parseRgb(style.getPropertyValue('--theme-secondary-color')) ?? [253, 33, 85];
  const light = currentTheme() === 'light';
  return {
    dot: light ? 'rgba(90,90,90,0.55)' : 'rgba(154,154,154,0.75)',
    link: teal,
    accent: magenta,
    alpha: light ? 0.3 : 0.45,
  };
}

function parseRgb(value: string): [number, number, number] | null {
  const hex = value.trim();
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

export function initParticleField(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let dpr = 1;
  let linkDistance = LINK_DISTANCE_WIDE;
  let particles: Particle[] = [];
  let baseline = 0;
  let palette = readPalette();

  /* --- pointer ------------------------------------------------------- */
  let pointer: { x: number; y: number } | null = null;
  const pointerNode: Particle = { x: 0, y: 0, vx: 0, vy: 0, r: 0, a: 1 };

  /* --- glitch pulse -------------------------------------------------- */
  let pulseUntil = 0;
  let nextPulse = performance.now() + 4000 + Math.random() * 6000;
  let bandTop = 0;
  let bandHeight = 0;
  let bandShift = 0;

  /* --- spatial hash -------------------------------------------------- */
  let cols = 0;
  let rows = 0;
  let buckets: number[][] = [];

  function targetCount(): number {
    const area = width * height;
    return window.innerWidth <= 800
      ? Math.min(Math.round(area / 30000), 40)
      : Math.min(Math.round(area / 22000), 90);
  }

  function spawn(x?: number, y?: number): Particle {
    return {
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1.4 + Math.random() * 1.1,
      a: 0,
    };
  }

  function rebuild(): void {
    baseline = targetCount();
    particles = Array.from({ length: baseline }, () => spawn());
    // Stagger the fade-in so the field assembles rather than appearing at once.
    particles.forEach((p, i) => {
      p.a = -(i / particles.length) * 0.8;
    });
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = window.innerWidth;
    height = window.innerHeight;
    linkDistance = width <= 800 ? LINK_DISTANCE_NARROW : LINK_DISTANCE_WIDE;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.max(1, Math.ceil(width / linkDistance));
    rows = Math.max(1, Math.ceil(height / linkDistance));
    buckets = Array.from({ length: cols * rows }, () => []);
    rebuild();
  }

  function bucketIndex(x: number, y: number): number {
    const cx = Math.min(cols - 1, Math.max(0, Math.floor(x / linkDistance)));
    const cy = Math.min(rows - 1, Math.max(0, Math.floor(y / linkDistance)));
    return cy * cols + cx;
  }

  function draw(now: number, delta: number): void {
    const stepScale = delta / 16.667;
    const pulsing = now < pulseUntil;

    if (now > nextPulse) {
      pulseUntil = now + 180;
      nextPulse = now + 6000 + Math.random() * 8000;
      bandHeight = 60 + Math.random() * 80;
      bandTop = Math.random() * Math.max(height - bandHeight, 1);
      bandShift = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
    }

    ctx!.clearRect(0, 0, width, height);

    for (const bucket of buckets) bucket.length = 0;

    // Integrate + bucket in one pass.
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.a < 1) p.a = Math.min(p.a + 0.012 * stepScale, 1);

      p.x += p.vx * stepScale;
      p.y += p.vy * stepScale;

      // Wrap rather than bounce: a drifting field shouldn't have visible walls.
      if (p.x < -40) p.x = width + 40;
      else if (p.x > width + 40) p.x = -40;
      if (p.y < -40) p.y = height + 40;
      else if (p.y > height + 40) p.y = -40;

      buckets[bucketIndex(p.x, p.y)].push(i);
    }

    // The pointer joins the network as a stationary node. One reused object —
    // this is read inside the innermost loop, so it must not allocate.
    if (pointer) {
      pointerNode.x = pointer.x;
      pointerNode.y = pointer.y;
      buckets[bucketIndex(pointer.x, pointer.y)].push(particles.length);
    }

    const at = (index: number): Particle =>
      index === particles.length ? pointerNode : particles[index];

    /* --- links --------------------------------------------------------
       Only the 9 cells around each particle are tested, so the cost scales
       with local density rather than the square of the total count. */
    const [lr, lg, lb] = palette.link;
    const [ar, ag, ab] = palette.accent;
    ctx!.lineWidth = 0.7;

    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const own = buckets[cy * cols + cx];
        if (own.length === 0) continue;

        for (let ny = cy; ny <= cy + 1; ny++) {
          for (let nx = cx - 1; nx <= cx + 1; nx++) {
            if (ny === cy && nx < cx) continue;
            if (nx < 0 || nx >= cols || ny >= rows) continue;
            const other = buckets[ny * cols + nx];
            if (other.length === 0) continue;
            const same = ny === cy && nx === cx;

            for (let i = 0; i < own.length; i++) {
              const a = at(own[i]);
              for (let j = same ? i + 1 : 0; j < other.length; j++) {
                const b = at(other[j]);
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > linkDistance * linkDistance) continue;

                const distance = Math.sqrt(distSq);
                const closeness = 1 - distance / linkDistance;
                let alpha = closeness * palette.alpha * Math.max(a.a, 0) * Math.max(b.a, 0);
                if (pulsing) alpha *= 1.6;
                if (alpha <= 0.004) continue;

                // Near links tint toward magenta, far ones stay teal.
                const mix = closeness * closeness;
                ctx!.strokeStyle = `rgba(${Math.round(lr + (ar - lr) * mix)},${Math.round(
                  lg + (ag - lg) * mix
                )},${Math.round(lb + (ab - lb) * mix)},${alpha.toFixed(3)})`;
                ctx!.beginPath();
                ctx!.moveTo(a.x, a.y);
                ctx!.lineTo(b.x, b.y);
                ctx!.stroke();
              }
            }
          }
        }
      }
    }

    /* --- dots --------------------------------------------------------- */
    ctx!.fillStyle = palette.dot;
    for (const p of particles) {
      if (p.a <= 0) continue;
      const torn = pulsing && p.y > bandTop && p.y < bandTop + bandHeight;
      ctx!.globalAlpha = p.a;
      ctx!.beginPath();
      ctx!.arc(torn ? p.x + bandShift : p.x, p.y, p.r, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;
  }

  /* --- lifecycle ------------------------------------------------------ */

  resize();

  let stopFrame: (() => void) | null = null;
  const reduced = prefersReducedMotion();

  if (reduced) {
    // One static frame: the texture is part of the design, the drift is not.
    particles.forEach((p) => (p.a = 1));
    draw(performance.now(), 16.667);
  } else {
    stopFrame = onFrame(draw);
  }

  const onResize = () => {
    resize();
    if (reduced) {
      particles.forEach((p) => (p.a = 1));
      draw(performance.now(), 16.667);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
  };

  const onPointerLeave = () => {
    pointer = null;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (reduced || particles.length >= baseline + SPAWN_BUDGET) return;
    for (let i = 0; i < 3; i++) {
      particles.push(spawn(event.clientX, event.clientY));
    }
    // Let the burst decay back to the baseline instead of accumulating.
    window.setTimeout(() => {
      particles.splice(baseline, particles.length - baseline);
    }, 6000);
  };

  const onThemeChange = () => {
    palette = readPalette();
    if (reduced) draw(performance.now(), 16.667);
  };

  window.addEventListener('resize', onResize);
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('fz:theme', onThemeChange);

  return () => {
    stopFrame?.();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('fz:theme', onThemeChange);
  };
}
