import { useEffect, useRef, useState } from 'react';
import { setFlatMode } from '../lib/quality';
import { toggleTheme } from '../lib/theme';
import { boot } from '../three/liveState';
import { useScrollRig } from '../three/ScrollRig';

/**
 * Fixed chrome: the mark, the theme switch, the flat-mode escape hatch, and the
 * calibration curtain that covers the first 900 ms.
 */

export function PrismMasthead({ nickName, onFlat }: { nickName: string; onFlat: () => void }) {
  const rig = useScrollRig();

  return (
    <header className="prism-masthead">
      <button
        type="button"
        className="prism-mark"
        onClick={() => rig.seek(0)}
        aria-label="Back to the top"
      >
        <img src="/view/static/favicon.svg" alt="" width="22" height="22" />
        <span>{nickName}</span>
      </button>
      <div className="prism-masthead-actions">
        <button
          type="button"
          className="prism-icon-btn"
          // toggleTheme swaps a <link> in <head>; PrismWorld observes that and
          // hands the new look to the stage, so nothing needs nudging here.
          onClick={() => toggleTheme()}
        >
          Theme
        </button>
        <button
          type="button"
          className="prism-icon-btn"
          onClick={() => {
            setFlatMode(true);
            onFlat();
          }}
          title="Switch to the flat, non-3D version of this site"
        >
          Flat view
        </button>
      </div>
    </header>
  );
}

/**
 * The calibration curtain. Covers the void while act 00 solves the mark out of shards,
 * then lifts. It is never a toll booth: it is skippable, and it caps itself at a second.
 */
export function CalibrationCurtain() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        // Hold opaque for the first half, then wipe.
        const k = Math.max(0, (boot.progress - 0.45) / 0.55);
        el.style.opacity = String(1 - k);
      }
      if (boot.done) {
        setGone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (gone) return null;

  return (
    <div ref={ref} className="prism-curtain" role="status" aria-live="polite">
      <img src="/view/static/favicon.svg" alt="" width="46" height="46" />
      <p>Calibrating</p>
      <span>click to skip</span>
    </div>
  );
}
