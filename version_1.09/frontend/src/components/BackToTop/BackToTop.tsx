import { useEffect, useState } from 'react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.pageYOffset > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      id="back-to-top-btn"
      className={show ? 'show' : undefined}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <span className="ico-gen">H</span>
    </button>
  );
}
