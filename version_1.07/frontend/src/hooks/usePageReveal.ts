import { useEffect, useState } from 'react';
import { synchronizePage, type SyncPage } from '../lib/sync';
import { initWobbleInteractions, wobbleAnimation } from '../lib/wobble';

interface RevealOptions {
  /** Hold the pre-loader until the page has everything it needs (e.g. profile data). */
  enabled?: boolean;
  /** Extra label for the work-details page view action. */
  workTitle?: string;
}

/**
 * Reproduces the original reveal sequence: wait for the two custom fonts, pause a
 * second on the pre-loader, then show the page, start the wobble animations and
 * report the page view.
 */
export function usePageReveal(pageName: SyncPage, options: RevealOptions = {}): boolean {
  const { enabled = true, workTitle } = options;
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;

    const titillium = new FontFace(
      'titillium-font',
      'url(/view/static/TitilliumWeb-Regular.ttf)'
    );
    const icons = new FontFace('icons-font', 'url(/view/static/icons.ttf)');

    Promise.all([titillium.load(), icons.load()])
      .then(() => {
        timer = window.setTimeout(() => {
          if (!cancelled) setFontsReady(true);
        }, 1000);
      })
      .catch((error) => {
        console.error('Font loading failed:', error);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const ready = fontsReady && enabled;

  useEffect(() => {
    if (!ready) return;

    initWobbleInteractions();
    wobbleAnimation();
    window.addEventListener('scroll', wobbleAnimation);
    const stopSync = synchronizePage(pageName, workTitle);

    return () => {
      window.removeEventListener('scroll', wobbleAnimation);
      stopSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return ready;
}
