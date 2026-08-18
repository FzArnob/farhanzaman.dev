import { useRef, useState } from 'react';
import type { ProfileInfo } from '../../types/profile';

export function ContactInfo({ info }: { info: ProfileInfo }) {
  const listItems = [
    { key: 'address', label: 'Location', text: info.address, icon: 'K' },
    { key: 'phone', label: 'Phone', text: info.phone, icon: 'L' },
    { key: 'email', label: 'Email', text: info.email, icon: 'M' },
  ];

  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef(0);

  const copy = (key: string, text: string) => {
    // Clipboard access can be refused (insecure context, permissions); the row
    // simply doesn't flash in that case.
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(key);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), 1600);
      },
      () => {}
    );
  };

  return (
    <div id="info" className="more-info">
      <p className="lead" data-reveal="rise">
        {info.contact_preference_details}
      </p>
      <ul className="list-ico" data-reveal="stagger">
        {listItems.map((item) => (
          <li
            key={item.key}
            className="copy-row"
            data-copied={copied === item.key || undefined}
            onClick={() => copy(item.key, item.text)}
            title={`Copy ${item.label.toLowerCase()}`}
          >
            <span className="ico-gen text-icon" aria-hidden="true">
              {item.icon}
            </span>{' '}
            {item.text}
            <span className="copy-flag" aria-hidden="true">
              copied
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
