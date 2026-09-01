import { useRef, useState, type FormEvent } from 'react';
import { sendDirectMessage } from '../lib/api';
import type { Profile } from '../types/profile';
import { ActSection } from './ActSection';

/**
 * Act 08's copy — the contact block and the form.
 *
 * The form posts to the same backend/api/send-direct-message.php the site already
 * uses; only the shell around it changed. On submit the panels flatten into the beam,
 * so the send is the visual payoff rather than a toast that appears and vanishes.
 */

const EMPTY = { name: '', email: '', subject: '', message: '' };

export function SyncCopy({ profile }: { profile: Profile }) {
  const { info } = profile;
  const [values, setValues] = useState(EMPTY);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const timers = useRef<number[]>([]);

  const set = (field: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    sendDirectMessage(values)
      .then(() => {
        setState('sent');
        setValues(EMPTY);
        timers.current.push(window.setTimeout(() => setState('idle'), 4000));
      })
      .catch((requestError: Error) => {
        setState('error');
        setError(requestError.message || 'That did not go through. Try again, or email directly.');
        timers.current.push(window.setTimeout(() => setState('idle'), 5000));
      });
  };

  return (
    <ActSection id="sync" eyebrow="Contact" title="Let’s build something" align="center" drift={14} titleHidden>
      <p className="prism-lead prism-center prism-lead-short">{info.contact_preference_details}</p>

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

      <form className={`prism-form prism-form-${state}`} onSubmit={onSubmit} noValidate>
        <div className="prism-panel">
          <label>
            <span>Your name</span>
            <input type="text" value={values.name} onChange={set('name')} required minLength={2} />
          </label>
          <label>
            <span>Your email</span>
            <input type="email" value={values.email} onChange={set('email')} required />
          </label>
        </div>
        <div className="prism-panel">
          <label>
            <span>Subject</span>
            <input type="text" value={values.subject} onChange={set('subject')} required />
          </label>
        </div>
        <div className="prism-panel">
          <label>
            <span>Message</span>
            <textarea rows={3} value={values.message} onChange={set('message')} required minLength={8} />
          </label>
        </div>
        <div className="prism-form-foot">
          <button type="submit" className="prism-btn prism-btn-solid" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Send message'}
          </button>
          <p role="status" aria-live="polite" className="prism-form-status">
            {state === 'sent' && 'Message sent — I will get back to you.'}
            {state === 'error' && error}
          </p>
        </div>
      </form>

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
          Résumé
        </a>
      </div>
    </ActSection>
  );
}
