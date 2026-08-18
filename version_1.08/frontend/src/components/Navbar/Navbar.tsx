import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { scroll } from 'motion';
import { toggleTheme } from '../../lib/theme';
import { useWindowSize } from '../../hooks/useWindowSize';

export type NavKey = 'home' | 'about' | 'expertise' | 'works' | 'hobbies';

const ALL_LINKS: { key: NavKey; label: string; to: string }[] = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'expertise', label: 'Expertise', to: '/expertise' },
  { key: 'works', label: 'Works', to: '/works' },
  { key: 'hobbies', label: 'Hobbies', to: '/hobbies' },
];

/** Scroll past this before the bar takes on a background. */
const SOLID_AT = 70;

interface NavbarProps {
  /** Highlighted menu entry. */
  active?: NavKey;
  /** The home page drops its own "Home" entry — the logo covers it. */
  hideHomeLink?: boolean;
  /** Logo image; the gaming page uses its own. */
  logo?: string;
  /** Gaming shows the logo only — no menu, no theme toggle. */
  logoOnly?: boolean;
}

export function Navbar({
  active,
  hideHomeLink = false,
  logo = '/view/static/favicon.svg',
  logoOnly = false,
}: NavbarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowSize();

  const links = hideHomeLink ? ALL_LINKS.filter((link) => link.key !== 'home') : ALL_LINKS;

  /* Background on scroll, and hide when scrolling down. This replaces the old
     window scroll listener that also rebuilt text nodes on every event. */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let previous = window.scrollY;

    return scroll(() => {
      const y = window.scrollY;
      const down = y > previous && y > SOLID_AT * 3;
      previous = y;

      bar.classList.toggle('bg2', y > SOLID_AT);
      bar.classList.toggle('nav-shadow', y > SOLID_AT);
      // Never hide the bar while the mobile menu is open under it.
      bar.dataset.hidden = down && !menuOpen ? 'true' : 'false';
    });
  }, [menuOpen]);

  /* The active-link underline is one element that slides between items. */
  useLayoutEffect(() => {
    const underline = underlineRef.current;
    const menu = menuRef.current;
    if (!underline || !menu) return;

    const current = menu.querySelector<HTMLElement>('.nav-links.active');
    if (!current || width <= 880) {
      underline.dataset.visible = 'false';
      return;
    }

    underline.style.width = current.offsetWidth + 'px';
    underline.style.transform = `translateX(${current.offsetLeft}px)`;
    underline.dataset.visible = 'true';
  }, [active, width, links.length]);

  return (
    <div className="navbar animate-left" id="navbar" ref={barRef} data-hidden="false">
      <div className="nav-container">
        <Link className="nav-logo c1 active" to="/" aria-label="Home">
          <img alt="Farhan Zaman logo" src={logo} className="fa-logo" />
          <span className="nav-corner bg2 animate-top" aria-hidden="true"></span>
        </Link>
        {!logoOnly && (
          <>
            <ul
              className={'nav-menu animate-right' + (menuOpen ? ' mobile-nav-menu' : '')}
              id="nav-menu"
              ref={menuRef}
              style={width <= 880 ? { display: menuOpen ? 'block' : 'none' } : undefined}
            >
              {links.map((link) => (
                <li className="nav-item" key={link.key}>
                  <Link
                    className={'nav-links c1' + (active === link.key ? ' active' : '')}
                    to={link.to}
                    aria-current={active === link.key ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <span className="nav-underline" ref={underlineRef} aria-hidden="true"></span>
            </ul>
            <button
              className="nav-icon animate-top"
              id="nav-menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="nav-menu"
              aria-label="Menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="ico-gen mobile-menu-icon" aria-hidden="true">
                G
              </span>
            </button>
            <button
              className="themeBtn animate-right"
              id="theme-toogle-button"
              type="button"
              aria-label="Switch theme"
              onClick={() => toggleTheme()}
            >
              <span className="ico-gen themeBtn-icon" id="theme-btn" aria-hidden="true">
                E
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
