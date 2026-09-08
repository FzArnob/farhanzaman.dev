import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleTheme } from '../lib/theme';
import { boot } from '../three/liveState';
import { useCurrentAct, useScrollRig } from '../three/ScrollRig';

/**
 * Fixed chrome: the mark, the theme switch, the SyncBot entry, and the calibration
 * curtain that covers the first fraction of a second.
 *
 * There is no view switch. The site is the 3D site — the only reason a visitor ever
 * sees anything else is that their browser cannot run WebGL, and that is decided for
 * them rather than offered as a choice.
 */

/**
 * The mark, on its corner.
 *
 * This is the flat site's own masthead — .nav-corner and .fa-logo from 05-navbar.css:
 * a square rotated 40 degrees and hung off the top-left of the viewport, with the
 * monogram floating on it. v1.09 had flattened it to a 24px favicon and a word, which
 * lost the one piece of chrome the site has always been recognised by.
 *
 * It is smaller than the flat site's (a 210px corner against 300px, a 54px mark
 * against 96px) because the Prism world has to keep its corners quiet, and the word
 * beside it is gone: at this size it would cross the diagonal. The nickname is still
 * the button's accessible name.
 */
export function PrismMark({ nickName, onClick }: { nickName: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="prism-mark"
      onClick={onClick}
      aria-label={nickName + ' — back to the start'}
    >
      <span className="prism-mark-corner" aria-hidden="true" />
      <img className="prism-mark-logo" src="/view/static/favicon.svg" alt="" width="54" height="54" />
    </button>
  );
}

export function PrismMasthead({
  nickName,
  onOpenBot,
}: {
  nickName: string;
  onOpenBot: () => void;
}) {
  const rig = useScrollRig();
  const act = useCurrentAct();

  return (
    <header className="prism-masthead">
      <PrismMark nickName={nickName} onClick={() => rig.seek(0)} />
      <div className="prism-masthead-actions">
        {/*
          Act 02's way out, and only act 02's: /about is the Background act's own page,
          so the link belongs to the act rather than to the site. It joins the row the
          world already uses for the things you can click instead of standing in the
          middle of the corridor, which is the part of the frame the blocks fly through.
        */}
        {act.id === 'background' && (
          <Link className="prism-icon-btn prism-icon-btn-cta" to="/about">
            About Me
            <i className="prism-btn-chevron" aria-hidden="true" />
          </Link>
        )}
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
