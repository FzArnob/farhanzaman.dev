import { getCookie, setCookie } from './cookies';
import { prefersReducedMotion } from './motion/tokens';

export type Theme = 'dark' | 'light';

const THEME_HREF: Record<Theme, string> = {
  dark: '/view/css/theme/dark.css',
  light: '/view/css/theme/light.css',
};

function appendThemeLink(theme: Theme): void {
  document
    .querySelector('head')!
    .insertAdjacentHTML(
      'beforeend',
      `<link type="text/css" rel="stylesheet" href="${THEME_HREF[theme]}" data-theme="${theme}" />`
    );
}

/** The theme currently applied. Defaults to dark, which is what a first visit gets. */
export function currentTheme(): Theme {
  return getCookie('theme') === 'light' ? 'light' : 'dark';
}

/** True when the visitor has never picked a theme — the theme hint popup is shown once. */
export function isFirstVisit(): boolean {
  return getCookie('theme') === '';
}

/** Applies the stored theme, defaulting to dark on a first visit. Run once before the app renders. */
export function initTheme(): void {
  const stored = getCookie('theme');
  if (stored === '') {
    setCookie('theme', 'dark', 30);
    appendThemeLink('dark');
  } else if (stored === 'dark') {
    appendThemeLink('dark');
  } else if (stored === 'light') {
    appendThemeLink('light');
  }
  document.documentElement.dataset.theme = currentTheme();
}

/**
 * A one-shot full-screen scanline tear over the swap, so the theme change reads as
 * a channel switch rather than forty elements each crossfading on their own clock.
 */
function playSwapGlitch(): void {
  if (prefersReducedMotion()) return;
  const overlay = document.createElement('div');
  overlay.id = 'theme-swap';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  // Belt and braces: if the animation never fires, don't leave the overlay behind.
  window.setTimeout(() => overlay.remove(), 600);
}

/** Returns the theme that was active *before* the toggle, matching the old tracking behaviour. */
export function toggleTheme(): Theme {
  const previous = getCookie('theme') as Theme | '';
  const existingLinks = document.querySelectorAll('head link[data-theme]');

  if (existingLinks.length > 0) {
    setTimeout(function () {
      existingLinks.forEach((existingLink) => {
        existingLink.remove();
      });
    }, 1000);
  }

  const next: Theme = previous === 'dark' ? 'light' : 'dark';
  setCookie('theme', next, 30);
  appendThemeLink(next);
  document.documentElement.dataset.theme = next;

  playSwapGlitch();
  window.dispatchEvent(new CustomEvent('fz:theme', { detail: next }));

  return previous === 'light' ? 'light' : 'dark';
}
