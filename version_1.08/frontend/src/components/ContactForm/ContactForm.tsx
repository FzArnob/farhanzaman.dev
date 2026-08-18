import { useEffect, useRef, useState, type FormEvent } from 'react';
import { sendDirectMessage } from '../../lib/api';

const EMPTY = { name: '', email: '', subject: '', message: '' };
type Field = keyof typeof EMPTY;
type Errors = Partial<Record<Field, string>>;

const LABELS: Record<Field, string> = {
  name: 'Your name',
  email: 'Your email',
  subject: 'Subject',
  message: 'Message',
};

/** Validation runs per field, so the message can sit next to the input that failed. */
function validate(field: Field, value: string): string {
  const trimmed = value.trim();
  switch (field) {
    case 'name':
      return trimmed.length < 4 ? 'At least 4 characters' : '';
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? '' : 'Enter a valid email';
    case 'subject':
      return trimmed.length < 4 ? 'At least 4 characters' : '';
    case 'message':
      return trimmed.length === 0 ? 'Write something' : '';
  }
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const set = (field: Field) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    setValues((previous) => ({ ...previous, [field]: value }));
    // Only correct an error the visitor is already seeing; don't start shouting
    // at them while they are still typing their first character.
    if (touched[field]) {
      setErrors((previous) => ({ ...previous, [field]: validate(field, value) }));
    }
  };

  const blur = (field: Field) => () => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({ ...previous, [field]: validate(field, values[field]) }));
  };

  const shake = () => {
    const form = formRef.current;
    if (!form) return;
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Errors = {};
    (Object.keys(EMPTY) as Field[]).forEach((field) => {
      const error = validate(field, values[field]);
      if (error) nextErrors[field] = error;
    });

    setTouched({ name: true, email: true, subject: true, message: true });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error');
      setMessage('Check the highlighted fields');
      shake();
      return;
    }

    setStatus('sending');
    setMessage('Transmitting…');

    sendDirectMessage(values)
      .then(() => {
        setStatus('sent');
        setMessage('Message sent — thank you');
        setValues(EMPTY);
        setTouched({});
        timers.current.push(
          window.setTimeout(() => {
            setStatus('idle');
            setMessage('');
          }, 4000)
        );
      })
      .catch((requestError: Error) => {
        console.log('Request error:', requestError);
        setStatus('error');
        setMessage(requestError.message || 'Could not send — try again');
        shake();
        timers.current.push(
          window.setTimeout(() => {
            setStatus('idle');
            setMessage('');
          }, 5000)
        );
      });
  };

  const tone = status === 'sent' ? 'ok' : status === 'error' ? 'error' : undefined;

  return (
    <form
      ref={formRef}
      method="post"
      role="form"
      id="direct-message"
      className="contactForm"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="row">
        {(['name', 'email', 'subject'] as Field[]).map((field) => (
          <div className="col-md-12 mb-3" key={field}>
            <div className="form-group field">
              <label className="mono-label" htmlFor={`message-${field}`}>
                {LABELS[field]}
              </label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                className="form-control"
                id={`message-${field}`}
                placeholder={LABELS[field]}
                value={values[field]}
                onChange={set(field)}
                onBlur={blur(field)}
                aria-invalid={errors[field] ? true : undefined}
                aria-describedby={errors[field] ? `error-${field}` : undefined}
              />
              <span className="field-line" aria-hidden="true"></span>
              <span className="field-error" id={`error-${field}`}>
                {errors[field]}
              </span>
            </div>
          </div>
        ))}

        <div className="col-md-12 mb-3">
          <div className="form-group field">
            <label className="mono-label" htmlFor="message">
              {LABELS.message}
            </label>
            <textarea
              className="form-control"
              name="message"
              rows={5}
              placeholder={LABELS.message}
              id="message"
              value={values.message}
              onChange={set('message')}
              onBlur={blur('message')}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'error-message' : undefined}
            ></textarea>
            <span className="field-line" aria-hidden="true"></span>
            <span className="field-error" id="error-message">
              {errors.message}
            </span>
          </div>
        </div>

        <div className="col-md-12">
          <div className="form-status" data-tone={tone} role="status">
            {message}
          </div>
          <button
            type="submit"
            className="button button-a button-big button-rouded"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send Message'}
          </button>
        </div>
      </div>
    </form>
  );
}
