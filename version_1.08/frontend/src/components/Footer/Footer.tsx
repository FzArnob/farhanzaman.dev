import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../../data/ProfileContext';

/**
 * `overlay` sits on top of the parallax contact section (home, about),
 * `page` is the plain footer on the inner pages, `gaming` is the yellow-accented one.
 */
export type FooterVariant = 'overlay' | 'page' | 'gaming';

const NAME_STYLE: CSSProperties = {
  backgroundColor: 'rgba(0,0,0, 0.2)',
  borderRadius: '3px',
  padding: '0px 10px 2px 10px',
};

const GAMING_NAME_STYLE: CSSProperties = {
  backgroundColor: 'rgba(0,0,0, 0.2)',
  color: '#fcba03',
  borderRadius: '3px',
  padding: '0px 10px 2px 10px',
};

export function Footer({ variant = 'page' }: { variant?: FooterVariant }) {
  const { info } = useProfile();
  const containerClass = variant === 'page' ? 'container c1' : 'container';
  const creditsClass = variant === 'page' ? 'credits c1' : 'credits';
  const nameStyle =
    variant === 'overlay' ? NAME_STYLE : variant === 'gaming' ? GAMING_NAME_STYLE : undefined;

  return (
    <footer>
      <div className={containerClass}>
        <div className="row">
          <div className="col-sm-12">
            <div className="copyright-box" data-reveal="rise">
              <p className="copyright">
                &copy; Copyright <strong>{info.website_domain_name}</strong>. All Rights Reserved
              </p>
              <div className={creditsClass}>
                Designed by{' '}
                <Link to="/about" id="footer_name" style={nameStyle}>
                  {info.full_name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
