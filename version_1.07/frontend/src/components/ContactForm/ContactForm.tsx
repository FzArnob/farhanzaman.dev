import { useRef, useState, type FormEvent } from 'react';
import { sendDirectMessage } from '../../lib/api';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const timers = useRef<number[]>([]);

  const set = (field: keyof typeof EMPTY) => (event: { target: { value: string } }) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    sendDirectMessage(values)
      .then(() => {
        setSent(true);
        setValues(EMPTY);
        timers.current.push(window.setTimeout(() => setSent(false), 3000));
      })
      .catch((requestError: Error) => {
        console.log('Request error:', requestError);
        setError(requestError.message);
        timers.current.push(window.setTimeout(() => setError(''), 4000));
      });
  };

  return (
    <form action="" method="post" role="form" id="direct-message" className="contactForm" onSubmit={onSubmit}>
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="form-group">
            <input
              type="text"
              name="name"
              className="form-control"
              id="message-name"
              placeholder="Your Name"
              data-rule="minlen:4"
              data-msg="Please enter at least 4 chars"
              value={values.name}
              onChange={set('name')}
            />
            <div className="validation"></div>
          </div>
        </div>
        <div className="col-md-12 mb-3">
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              name="email"
              id="message-email"
              placeholder="Your Email"
              data-rule="email"
              data-msg="Please enter a valid email"
              value={values.email}
              onChange={set('email')}
            />
            <div className="validation"></div>
          </div>
        </div>
        <div className="col-md-12 mb-3">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              name="subject"
              id="message-subject"
              placeholder="Subject"
              data-rule="minlen:4"
              data-msg="Please enter at least 8 chars of subject"
              value={values.subject}
              onChange={set('subject')}
            />
            <div className="validation"></div>
          </div>
        </div>
        <div className="col-md-12 mb-3">
          <div className="form-group">
            <textarea
              className="form-control"
              name="message"
              rows={5}
              data-rule="required"
              data-msg="Please write something for us"
              placeholder="Message"
              id="message"
              value={values.message}
              onChange={set('message')}
            ></textarea>
            <div className="validation"></div>
          </div>
        </div>
        <div id="sendmessage" style={{ display: sent ? 'block' : undefined }}>
          Your message has been sent. Thank you!
        </div>
        <div id="errormessage" style={{ display: error ? 'block' : undefined }}>
          {error}
        </div>
        <div className="col-md-12">
          <button type="submit" className="button button-a button-big button-rouded">
            Send Message
          </button>
        </div>
      </div>
    </form>
  );
}
