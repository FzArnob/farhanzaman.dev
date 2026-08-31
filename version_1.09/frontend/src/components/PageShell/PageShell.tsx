import type { ReactNode } from 'react';
import { PreLoader } from '../PreLoader/PreLoader';

interface PageShellProps {
  /** False keeps the pre-loader up; matches the original fonts-then-one-second reveal. */
  ready: boolean;
  loaderImage?: string;
  /** Fixed-position siblings rendered before the pre-loader (photo viewer, back-to-top). */
  overlays?: ReactNode;
  /** Hides the page behind a full-screen overlay without unmounting it. */
  hidden?: boolean;
  children: ReactNode;
}

export function PageShell({ ready, loaderImage, overlays, hidden = false, children }: PageShellProps) {
  return (
    <>
      {overlays}
      {!ready && <PreLoader image={loaderImage} />}
      <div
        className="main-page bg1 c1"
        style={{ display: ready ? 'block' : 'none', visibility: hidden ? 'hidden' : 'visible' }}
      >
        {children}
      </div>
    </>
  );
}
