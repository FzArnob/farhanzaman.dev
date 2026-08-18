import type { ReactNode } from 'react';
import { GlitchLoader } from '../GlitchLoader/GlitchLoader';
import { useLoaderGate } from '../GlitchLoader/useLoaderGate';

interface PageShellProps {
  /** False keeps the page hidden; the loader appears only if the wait is long enough to notice. */
  ready: boolean;
  loaderImage?: string;
  /** Fixed-position siblings rendered before the loader (photo viewer, back-to-top). */
  overlays?: ReactNode;
  /** Hides the page behind a full-screen overlay without unmounting it. */
  hidden?: boolean;
  children: ReactNode;
}

export function PageShell({
  ready,
  loaderImage,
  overlays,
  hidden = false,
  children,
}: PageShellProps) {
  const loader = useLoaderGate(ready);

  return (
    <>
      {overlays}
      {loader.visible && (
        <GlitchLoader image={loaderImage} exiting={loader.exiting} progress={ready ? 1 : -1} />
      )}
      <div
        className="main-page bg1 c1"
        style={{ display: ready ? 'block' : 'none', visibility: hidden ? 'hidden' : 'visible' }}
      >
        {children}
      </div>
    </>
  );
}
