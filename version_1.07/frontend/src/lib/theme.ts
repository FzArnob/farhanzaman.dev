import { getCookie, setCookie } from './cookies';

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

  if (previous === 'dark') {
    setCookie('theme', 'light', 30);
    appendThemeLink('light');
  } else if (previous === 'light') {
    setCookie('theme', 'dark', 30);
    appendThemeLink('dark');
  }

  return previous === 'light' ? 'light' : 'dark';
}
