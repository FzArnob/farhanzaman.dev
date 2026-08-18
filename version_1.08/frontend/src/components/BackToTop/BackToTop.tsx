import { useEffect, useState } from 'react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      id="back-to-top-btn"
      type="button"
      className={show ? 'show' : undefined}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <span className="ico-gen" aria-hidden="true">
        H
      </span>
    </button>
  );
}
