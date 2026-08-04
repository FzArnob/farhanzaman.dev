import type { ProfileInfo } from '../../types/profile';

/** Facebook / GitHub / LinkedIn / WhatsApp — the letters map to glyphs in icons-font. */
export function SocialContact({ info }: { info: ProfileInfo }) {
  const socialLinks = [
    { href: info.facebook_url, text: 'A' },
    { href: info.github_url, text: 'B' },
    { href: info.linkedin_url, text: 'C' },
    { href: info.whatsapp_url, text: 'D' },
  ];

  return (
    <div id="social-contact" className="socials">
      <ul>
        {socialLinks.map((link) => (
          <li key={link.text}>
            <a href={link.href} target="_blank" rel="noreferrer">
              <span className="ico-circle">{link.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
