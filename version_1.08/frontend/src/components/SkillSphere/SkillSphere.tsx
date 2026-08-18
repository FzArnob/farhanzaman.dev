import { useEffect, useMemo, useRef, useState } from 'react';
import { inView } from 'motion';
import { onFrame } from '../../lib/motion/raf';
import { isCoarsePointer, prefersReducedMotion } from '../../lib/motion/tokens';
import { useWindowSize } from '../../hooks/useWindowSize';
import type { Expertise } from '../../types/profile';

/** Idle spin, radians per 60fps frame. */
const IDLE_SPIN = 0.0022;
/** How hard the pointer pushes the spin. */
const POINTER_GAIN = 0.006;
/** Assemble travel, ms. */
const ASSEMBLE = 900;

interface Point {
  x: number;
  y: number;
  z: number;
  /** Where this tag starts before it condenses onto the sphere. */
  sx: number;
  sy: number;
}

/**
 * Fibonacci sphere: evenly spaced points with no clustering at the poles, which is
 * what a ring-stacked layout gives you.
 */
function sphere(count: number): Point[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = golden * i;
    // Scatter seeds are deterministic per index, so a re-render doesn't reshuffle.
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const angle = (seed - Math.floor(seed)) * Math.PI * 2;
    const spread = 1.6 + ((Math.sin(i * 78.233) * 43758.5453) % 1);
    points.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      sx: Math.cos(angle) * spread,
      sy: Math.sin(angle) * spread,
    });
  }
  return points;
}

/**
 * The expertise cloud.
 *
 * Replaces the TagCloud dependency: smaller, resize-safe, and — the reason it was
 * worth writing — the tags are ours, so they can fly in out of the particle field
 * and surface their level/duration/description on lock-on. Those three fields used
 * to be visible only on the Expertise page.
 */
export function SkillSphere({ expertises }: { expertises: Expertise[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [locked, setLocked] = useState<Expertise | null>(null);
  const { width } = useWindowSize();

  // Below 640px a sphere is worse than a grid — 23 tags need the space more than
  // they need the effect. Touch and reduced-motion get the same treatment.
  const flat = width < 640 || isCoarsePointer() || prefersReducedMotion();

  const radius = useMemo(() => {
    if (width <= 800) return Math.max(Math.min(width / 2.6, 220), 130);
    return Math.min(width / 4.4, 240);
  }, [width]);

  const points = useMemo(() => sphere(expertises.length), [expertises.length]);
  const fontSize = Math.max(11, Math.min(Math.round(radius / 15), 19));

  useEffect(() => {
    if (flat) return;
    const container = containerRef.current;
    if (!container) return;

    const tags = tagRefs.current.filter((tag): tag is HTMLButtonElement => tag !== null);
    if (tags.length === 0) return;

    let angleX = 0.4;
    let angleY = 0;
    let spinX = 0;
    let spinY = IDLE_SPIN;
    let targetSpinX = 0;
    let targetSpinY = IDLE_SPIN;
    let onScreen = false;
    let assembleStart = 0;

    const stopView = inView(
      container,
      () => {
        if (assembleStart === 0) {
          assembleStart = performance.now();
          container.dataset.assembling = 'true';
        }
        onScreen = true;
        return () => {
          onScreen = false;
        };
      },
      { amount: 0.2 }
    );

    const onPointerMove = (event: PointerEvent) => {
      const box = container.getBoundingClientRect();
      const nx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const ny = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
      targetSpinY = IDLE_SPIN + nx * POINTER_GAIN;
      targetSpinX = -ny * POINTER_GAIN;
    };

    const onPointerLeave = () => {
      targetSpinY = IDLE_SPIN;
      targetSpinX = 0;
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave);

    const stopFrame = onFrame((now, delta) => {
      // Off-screen the sphere idles at a crawl rather than stopping dead, so
      // scrolling back to it doesn't reveal a frozen object.
      const step = (delta / 16.667) * (onScreen ? 1 : 0.15);
      if (!onScreen && assembleStart === 0) return;

      spinX += (targetSpinX - spinX) * 0.06;
      spinY += (targetSpinY - spinY) * 0.06;
      angleX += spinX * step;
      angleY += spinY * step;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const t = assembleStart === 0 ? 0 : Math.min((now - assembleStart) / ASSEMBLE, 1);
      // easeOutExpo — arrives fast, settles slow
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

      for (let i = 0; i < tags.length; i++) {
        const point = points[i];
        const tag = tags[i];

        // rotate around Y, then X
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;
        const y2 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;

        // Blend from the scatter seed toward the sphere position.
        const x = (point.sx + (x1 - point.sx) * eased) * radius;
        const y = (point.sy + (y2 - point.sy) * eased) * radius;

        // z in [-1, 1] -> depth scale; the back of the sphere recedes.
        const depth = (z2 + 2) / 3;
        tag.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(
          1
        )}px, 0) scale(${(depth * eased + (1 - eased) * 0.4).toFixed(3)})`;
        tag.style.opacity = (depth * depth * eased).toFixed(3);
        tag.style.filter = eased < 1 ? `blur(${((1 - eased) * 4).toFixed(1)}px)` : '';
        tag.style.zIndex = String(Math.round(depth * 100));
      }

      if (t >= 1 && container.dataset.assembling === 'true') {
        delete container.dataset.assembling;
        container.dataset.assembled = 'true';
      }
    });

    return () => {
      stopView();
      stopFrame();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [flat, points, radius]);

  const tags = expertises.map((item, index) => (
    <button
      key={item.expertise_id}
      type="button"
      className="sphere-tag"
      ref={(node) => {
        tagRefs.current[index] = node;
      }}
      style={flat ? undefined : { fontSize }}
      data-locked={locked?.expertise_id === item.expertise_id || undefined}
      onPointerEnter={() => setLocked(item)}
      onFocus={() => setLocked(item)}
      onPointerLeave={() => setLocked(null)}
      onBlur={() => setLocked(null)}
      onClick={() => setLocked(item)}
      aria-describedby="sphere-readout"
    >
      {item.name}
    </button>
  ));

  if (flat) {
    return (
      <div className="skill-cloud-wrap">
        <div className="skill-grid" data-reveal="pop">
          {tags}
        </div>
        <Readout locked={locked} />
      </div>
    );
  }

  return (
    <div className="skill-cloud-wrap">
      <div
        className="skill-sphere"
        ref={containerRef}
        data-assembled="false"
        style={{ width: radius * 2, height: radius * 2 }}
      >
        {tags}
      </div>
      <Readout locked={locked} />
    </div>
  );
}

function Readout({ locked }: { locked: Expertise | null }) {
  return (
    <div className="sphere-readout" id="sphere-readout" data-open={locked ? 'true' : undefined}>
      <div className="sphere-readout-name">{locked?.name ?? '—'}</div>
      <div className="sphere-readout-meta">
        {locked ? `${locked.level} · ${locked.duration} months` : 'hover a tag'}
      </div>
      <p className="sphere-readout-text">{locked?.description ?? ''}</p>
    </div>
  );
}
