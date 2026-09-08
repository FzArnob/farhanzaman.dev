import { useEffect, useRef, useState, type FormEvent } from 'react';
import { sendDirectMessage } from '../../lib/api';

/**
 * The direct-message form, in the Prism world's own clothes.
 *
 * Lifted out of overlay/ContactCopy so /about can carry the same form the contact act
 * does. It was the last thing on that page still wearing the flat site's bootstrap-ish
 * `.form-control` markup, which is exactly why the page read as broken: half prism,
 * half v1.07.
 *
 * It posts to the same backend/api/send-direct-message.php the site has always used.
 */

const EMPTY = { name: '', email: '', subject: '', message: '' };

type State = 'idle' | 'sending' | 'sent' | 'error';

export function PrismContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const timers = useRef<number[]>([]);

  // The old copy of this leaked its timeouts; unmounting mid-flight left them to fire
  // setState on a dead component.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

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
  );
}
