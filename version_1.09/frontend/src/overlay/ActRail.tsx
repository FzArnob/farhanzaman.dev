import { useEffect, useRef } from 'react';
import { poleHex } from '../lib/band';
import { useCurrentAct, useScrollRig } from '../stage/ScrollRig';
import { ACTS } from '../stage/timeline';

/**
 * The section tracker, centre-right.
 *
 * Dots only — no numbers. Position is what the rail is for; the name of the section
 * you are in belongs to the readout at the centre bottom, and printing it in two
 * places at once just makes the eye choose. The name still appears here on hover and
 * as the accessible label, so nothing is hidden from a screen reader or a keyboard.
 *
 * The progress fill is written straight from the rAF loop, so it tracks the scroll
 * exactly without re-rendering the rail sixty times a second.
 */
export function ActRail() {
  const rig = useScrollRig();
  const current = useCurrentAct();
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const t = rig.state.current.t;
      if (fillRef.current) fillRef.current.style.height = `${(t * 100).toFixed(2)}%`;
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
                style={{ ['--edge' as string]: poleHex(act.band) }}
                aria-current={active ? 'true' : undefined}
                aria-label={act.name}
                title={act.name}
                onClick={() => rig.seek(act.t0 + (act.t1 - act.t0) * 0.4)}
              >
                <i />
                <span>{act.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
