import { useEffect, useRef } from 'react';
import { poleHex } from '../lib/band';
import { useCurrentAct, useScrollRig } from '../stage/ScrollRig';
import { ACTS } from '../stage/timeline';

/**
 * The centre-bottom readout: which section you are exploring.
 *
 * This is the counterpart to the dots on the right. The rail says *where* you are in
 * the journey; this says *what* you are looking at, in the flat site's own section
 * names — Intro, Background, Expertise, Skills, Achievements, Works, Hobbies, Gaming,
 * Contact.
 *
 * The bar underneath fills across the current act rather than the whole page, so it
 * doubles as "how much of this section is left" — which is the thing a visitor
 * actually wants to know before deciding to keep scrolling.
 */
export function SectionReadout() {
  const rig = useScrollRig();
  const act = useCurrentAct();
  const barRef = useRef<HTMLSpanElement>(null);
  const stepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const t = rig.state.current.t;
      const within = Math.max(0, Math.min(1, (t - act.t0) / (act.t1 - act.t0)));
      if (barRef.current) barRef.current.style.transform = `scaleX(${within.toFixed(3)})`;
      if (stepRef.current) stepRef.current.textContent = `${act.index} / ${ACTS.length}`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rig, act]);

  return (
    <div
      className="prism-readout"
      style={{ ['--edge' as string]: poleHex(act.band) }}
      role="status"
      aria-live="polite"
    >
      <p className="prism-readout-line">
        <span className="prism-readout-label">Exploring</span>
        <span className="prism-readout-name">{act.name}</span>
        <span ref={stepRef} className="prism-readout-step">
          {act.index} / {ACTS.length}
        </span>
      </p>
      <span className="prism-readout-bar">
        <span ref={barRef} />
      </span>
      <p className="prism-readout-hint">Scroll to travel</p>
    </div>
  );
}
