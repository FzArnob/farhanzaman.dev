import type { ProfileInfo } from '../../types/profile';

export function ContactInfo({ info }: { info: ProfileInfo }) {
  const listItems = [
    { text: info.address, icon: 'K' },
    { text: info.phone, icon: 'L' },
    { text: info.email, icon: 'M' },
  ];

  return (
    <div id="info" className="more-info">
      <p className="lead">{info.contact_preference_details}</p>
      <ul className="list-ico">
        {listItems.map((item) => (
          <li key={item.icon}>
            <span className="ico-gen text-icon">{item.icon}</span> {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
