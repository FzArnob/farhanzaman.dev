import type { ProfileInfo } from '../../types/profile';

/** Facebook / GitHub / LinkedIn / WhatsApp — the letters map to glyphs in icons-font. */
export function SocialContact({ info }: { info: ProfileInfo }) {
  const socialLinks = [
    { href: info.facebook_url, glyph: 'A', label: 'Facebook' },
    { href: info.github_url, glyph: 'B', label: 'GitHub' },
    { href: info.linkedin_url, glyph: 'C', label: 'LinkedIn' },
    { href: info.whatsapp_url, glyph: 'D', label: 'WhatsApp' },
  ];

  return (
    <div id="social-contact" className="socials">
      <ul data-reveal="pop" data-reveal-step="50">
        {socialLinks.map((link) => (
          <li key={link.glyph}>
            <a href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
              <span className="ico-circle" aria-hidden="true">
                {link.glyph}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
