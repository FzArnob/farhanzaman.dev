import { PrismContactForm } from '../components/ContactForm/PrismContactForm';
import type { Profile } from '../types/profile';
import { ActSection } from './ActSection';

/**
 * Act 09's copy — the contact block, the form and the footer credit.
 *
 * The form itself now lives in components/ContactForm/PrismContactForm, because
 * /about carries the same one; it posts to the same backend/api/send-direct-message.php
 * the site has always used. On submit the panels flatten into the beam, so the send is
 * the visual payoff rather than a toast that appears and vanishes.
 */

export function ContactCopy({ profile }: { profile: Profile }) {
  const { info } = profile;

  return (
    <ActSection id="contact" eyebrow="Contact" title="Let’s build something" align="center" drift={12}>
      <p className="prism-text prism-center prism-text-short">{info.contact_preference_details}</p>

      <div className="prism-contact">
        <a className="prism-address" href={`mailto:${info.email}`}>
          {info.email}
        </a>
        <div className="prism-contact-grid">
          <p>
            <span>Phone</span>
            <a href={`tel:${info.phone}`}>{info.phone}</a>
          </p>
          <p>
            <span>Also</span>
            <a href={`mailto:${info.alternative_email}`}>{info.alternative_email}</a>
          </p>
          <p>
            <span>Where</span>
            {info.address}
          </p>
        </div>
      </div>

      <PrismContactForm />

      <div className="prism-actions prism-center">
        <a className="prism-btn" href={info.github_url} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="prism-btn" href={info.linkedin_url} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="prism-btn" href={info.whatsapp_url} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="prism-btn" href={info.resume_url} target="_blank" rel="noreferrer">
          Resume
        </a>
      </div>
    </ActSection>
  );
}
