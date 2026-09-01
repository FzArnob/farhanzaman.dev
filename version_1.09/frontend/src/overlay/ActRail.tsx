import { useEffect, useRef } from 'react';
import { bandHex } from '../lib/band';
import { useCurrentAct, useScrollRig } from '../three/ScrollRig';
import { ACTS } from '../three/timeline';

/**
 * The act rail.
 *
 * 900vh of scroll is a lot to ask, so nobody is ever trapped in it: the rail names
 * every act, shows where you are on the dispersion band, and jumps. The scroll itself
 * is never blocked or snapped — the rail is an escape hatch, not a replacement.
 *
 * The progress fill is written straight from the rAF loop, so it tracks the scroll
 * exactly without re-rendering the rail sixty times a second.
 */
export function ActRail() {
  const rig = useScrollRig();
  const current = useCurrentAct();
  const fillRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const t = rig.state.current.t;
      if (fillRef.current) fillRef.current.style.height = `${t * 100}%`;
      if (readoutRef.current) readoutRef.current.textContent = `${Math.round(t * 100)}%`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rig]);

  return (
    <nav className="prism-rail" aria-label="Sections">
      <div className="prism-rail-track">
        <div ref={fillRef} className="prism-rail-fill" />
      </div>
      <ol className="prism-rail-list">
        {ACTS.map((act) => {
          const active = current.id === act.id;
          return (
            <li key={act.id}>
              <button
                type="button"
                className={active ? 'is-active' : undefined}
                style={{ ['--edge' as string]: bandHex(act.band) }}
                aria-current={active ? 'true' : undefined}
                onClick={() => rig.seek(act.t0 + (act.t1 - act.t0) * 0.18)}
              >
                <i />
                <em>{String(act.index).padStart(2, '0')}</em>
                <span>{act.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <span ref={readoutRef} className="prism-rail-readout" aria-hidden="true">
        0%
      </span>
    </nav>
  );
}
