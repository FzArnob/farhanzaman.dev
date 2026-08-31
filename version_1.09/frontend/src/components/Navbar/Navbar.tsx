import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { toggleTheme } from '../../lib/theme';

export type NavKey = 'home' | 'about' | 'expertise' | 'works' | 'hobbies';

const ALL_LINKS: { key: NavKey; label: string; to: string }[] = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'expertise', label: 'Expertise', to: '/expertise' },
  { key: 'works', label: 'Works', to: '/works' },
  { key: 'hobbies', label: 'Hobbies', to: '/hobbies' },
];

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
  const menuRef = useRef<HTMLUListElement>(null);
  const links = hideHomeLink ? ALL_LINKS.filter((link) => link.key !== 'home') : ALL_LINKS;

  const onMenuButtonClick = () => {
    const menu = menuRef.current;
    if (!menu) return;
    menu.classList.toggle('mobile-nav-menu');
    setTimeout(function () {
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }, 100);
  };

  return (
    <div style={{ transitionDuration: '0.2s' }} className="navbar animate-left" id="navbar">
      <div className="nav-container">
        <Link className="nav-logo c1 active" to="/">
          <img alt="logo" src={logo} className="fa-logo" />
          <span className="nav-corner bg2 animate-top"></span>
        </Link>
        {!logoOnly && (
          <>
            <ul className="nav-menu animate-right" id="nav-menu" ref={menuRef}>
              {links.map((link) => (
                <li className="nav-item" key={link.key}>
                  <Link
                    className={'nav-links c1' + (active === link.key ? ' active' : '')}
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="nav-icon animate-top" id="nav-menu-button" onClick={onMenuButtonClick}>
              <span className="ico-gen mobile-menu-icon">G</span>
            </div>
            <div
              className="themeBtn animate-right"
              id="theme-toogle-button"
              onClick={() => toggleTheme()}
            >
              <span className="ico-gen themeBtn-icon" id="theme-btn">
                E
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
