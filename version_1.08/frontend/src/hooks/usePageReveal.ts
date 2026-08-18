import { useEffect, useState } from 'react';
import { initReveal } from '../lib/motion/reveal';
import { synchronizePage, type SyncPage } from '../lib/sync';
import { initWobbleInteractions } from '../lib/wobble';

interface RevealOptions {
  /** Hold the page until it has everything it needs (e.g. profile data). */
  enabled?: boolean;
  /** Extra label for the work-details page view action. */
  workTitle?: string;
}

/** Never wait longer than this for a webfont — `font-display: swap` covers the rest. */
const FONT_TIMEOUT = 1400;

/**
 * Gates the page on its two custom fonts, then starts the scroll reveal engine,
 * binds the wobble interactions and reports the page view.
 *
 * The fonts are still awaited because the icon face renders as bare letters until
 * it lands, but the wait is now capped and there is no artificial hold on top of
 * it — a warm cache reveals the page immediately.
 */
export function usePageReveal(pageName: SyncPage, options: RevealOptions = {}): boolean {
  const { enabled = true, workTitle } = options;
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setFontsReady(true);
    };

    const titillium = new FontFace(
      'titillium-font',
      'url(/view/static/TitilliumWeb-Regular.woff2) format("woff2")'
    );
    const icons = new FontFace('icons-font', 'url(/view/static/icons.woff2) format("woff2")');

    const cap = window.setTimeout(done, FONT_TIMEOUT);

    Promise.all([titillium.load(), icons.load()])
      .catch((error) => {
        console.error('Font loading failed:', error);
      })
      .finally(done);

    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, []);

  const ready = fontsReady && enabled;

  useEffect(() => {
    if (!ready) return;

    // React has rendered by now, so the DOM the engines need exists.
    initWobbleInteractions();
    const stopReveal = initReveal();
    const stopSync = synchronizePage(pageName, workTitle);

    return () => {
      stopReveal();
      stopSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return ready;
}
