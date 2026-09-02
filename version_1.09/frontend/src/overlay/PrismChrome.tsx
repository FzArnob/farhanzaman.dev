import { useEffect, useRef, useState } from 'react';
import { toggleTheme } from '../lib/theme';
import { boot } from '../three/liveState';
import { useScrollRig } from '../three/ScrollRig';

/**
 * Fixed chrome: the mark, the theme switch, the SyncBot entry, and the calibration
 * curtain that covers the first fraction of a second.
 *
 * There is no view switch. The site is the 3D site — the only reason a visitor ever
 * sees anything else is that their browser cannot run WebGL, and that is decided for
 * them rather than offered as a choice.
 */

export function PrismMasthead({
  nickName,
  onOpenBot,
}: {
  nickName: string;
  onOpenBot: () => void;
}) {
  const rig = useScrollRig();

  return (
    <header className="prism-masthead">
      <button type="button" className="prism-mark" onClick={() => rig.seek(0)} aria-label="Back to the start">
        <img src="/view/static/favicon.svg" alt="" width="24" height="24" />
        <span>{nickName}</span>
      </button>
      <div className="prism-masthead-actions">
        <button type="button" className="prism-icon-btn" onClick={onOpenBot}>
          SyncBot
        </button>
        <button type="button" className="prism-icon-btn" onClick={() => toggleTheme()}>
          Theme
        </button>
      </div>
    </header>
  );
}

/**
 * The calibration curtain. Covers the void while act 00 solves the mark out of
 * shards, then lifts. Never a toll booth: it is skippable and it caps itself at
 * under a second.
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
      <img src="/view/static/favicon.svg" alt="" width="48" height="48" />
      <p>Calibrating</p>
      <span>click to skip</span>
    </div>
  );
}
