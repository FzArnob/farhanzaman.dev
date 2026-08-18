import { useEffect, useState } from 'react';
import { LogoMark } from './LogoMark';

interface GlitchLoaderProps {
  /** 0–1. Anything below 0 means "unknown" and the bar idles instead. */
  progress?: number;
  /** Raster logo for routes with their own mark (gaming). Falls back to the SVG. */
  image?: string;
  /** Plays the fade-out; the parent unmounts once it finishes. */
  exiting?: boolean;
}

/** Boot lines, revealed one per step as the load progresses. */
const STATUS = ['INITIALISING', 'DECODING PROFILE', 'RESOLVING CHANNELS', 'LOCK'];

export function GlitchLoader({ progress = -1, image, exiting = false }: GlitchLoaderProps) {
  const [step, setStep] = useState(0);

  // The status line advances on its own so the loader reads as busy even when the
  // real progress is unknown; it never runs past the last "working" line.
  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((current) => (current < STATUS.length - 2 ? current + 1 : current));
    }, 320);
    return () => window.clearInterval(id);
  }, []);

  const done = progress >= 1;
  const label = done ? STATUS[STATUS.length - 1] : STATUS[step];
  const fill = progress >= 0 ? progress : 0.12 + step * 0.24;

  return (
    <div id="glitch-loader" className="bg1" data-exiting={exiting || undefined}>
      <div className="loader-mark">
        {image ? (
          <div className="loader-raster">
            <img className="ch-a" src={image} alt="" />
            <img className="ch-b" src={image} alt="" />
            <img className="ch-plain" src={image} alt="" />
          </div>
        ) : (
          <LogoMark />
        )}
        <span className="loader-tear" aria-hidden="true"></span>
        <span className="loader-scan" aria-hidden="true"></span>
      </div>

      <div className="loader-readout">
        <div className="loader-status" role="status">
          {label}
        </div>
        <div className="loader-track">
          <span
            className="loader-fill"
            style={{ transform: `scaleX(${Math.min(Math.max(fill, 0), 1)})` }}
          ></span>
        </div>
      </div>
    </div>
  );
}
