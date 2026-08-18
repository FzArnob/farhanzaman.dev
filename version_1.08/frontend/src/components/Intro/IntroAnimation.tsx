import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { scroll } from 'motion';
import Typed from 'typed.js';
import { onFrame } from '../../lib/motion/raf';
import { isCoarsePointer, prefersReducedMotion } from '../../lib/motion/tokens';
import type { ProfileInfo } from '../../types/profile';
import { Icon } from '../Icon/Icon';

/** How far a magnetic button leans toward the pointer, px. */
const MAGNET = 6;

export function IntroAnimation({ info }: { info: ProfileInfo }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const designationRef = useRef<HTMLDivElement>(null);

  /* Typed designations, with a channel-split burst on every swap. */
  useEffect(() => {
    if (!designationRef.current) return;
    const typed = new Typed('#designation', {
      strings: info.designations,
      typeSpeed: 150,
      backSpeed: 40,
      loop: true,
      onStringTyped: () => {
        // The text changes on every cycle, so this can't use the `data-text`
        // pseudo-element trick — a shadow-based split does the same job.
        const node = designationRef.current;
        if (!node || prefersReducedMotion()) return;
        node.classList.remove('glitch-burst');
        void node.offsetWidth;
        node.classList.add('glitch-burst');
      },
    });
    return () => typed.destroy();
  }, [info.designations]);

  /* Hero exit: the only scrubbed region on the page. Nothing is pinned, so the
     native scroll feel is untouched — especially on mobile. */
  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text || prefersReducedMotion()) return;

    return scroll(
      (progress: number) => {
        const eased = Math.min(progress * 1.4, 1);
        // `scale`, not `transform` — .intro-text is centred with
        // translate(-50%, -50%) and writing transform here would wipe it.
        text.style.scale = (1 - eased * 0.08).toFixed(3);
        text.style.opacity = (1 - eased).toFixed(3);
      },
      { target: wrap, offset: ['start start', 'end start'] }
    );
  }, []);

  /* Magnetic hover on the three hero buttons. */
  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return;
    const buttons = Array.from(
      wrapRef.current?.querySelectorAll<HTMLElement>('.magnetic') ?? []
    );
    if (buttons.length === 0) return;

    const state = buttons.map((element) => ({ element, x: 0, y: 0, tx: 0, ty: 0 }));

    const onMove = (event: PointerEvent) => {
      for (const item of state) {
        const box = item.element.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const near = Math.hypot(dx, dy) < box.width / 2 + 60;
        item.tx = near ? Math.max(Math.min(dx / 4, MAGNET), -MAGNET) : 0;
        item.ty = near ? Math.max(Math.min(dy / 4, MAGNET), -MAGNET) : 0;
      }
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    const stop = onFrame((_now, delta) => {
      const k = 1 - Math.exp(-delta / 90);
      for (const item of state) {
        item.x += (item.tx - item.x) * k;
        item.y += (item.ty - item.y) * k;
        item.element.style.translate = `${item.x.toFixed(2)}px ${item.y.toFixed(2)}px`;
      }
    });

    return () => {
      document.removeEventListener('pointermove', onMove);
      stop();
      for (const item of state) item.element.style.translate = '';
    };
  }, []);

  return (
    <div className="intro-animation">
      <div className="particle-network-animation" id="wrap" ref={wrapRef}>
        <div className="intro-text" ref={textRef}>
          <div className="intro-kicker mono">{info.address}</div>
          <div className="intro-text-medium">
            <span
              className="wobble intro-text-secondary-theme-color op1 inline"
              data-animation="upscale"
              id="nick_name"
            >
              {info.first_name}{' '}
            </span>
            <span className="wobble c1">{info.last_name}</span>
          </div>
          <div className="intro-designation-text c1">
            <div className="intro-text-medium-1 c1"></div>
            <div className="intro-text-medium-2" id="designation" ref={designationRef}></div>
          </div>
          <div
            className="intro-text-small c1"
            id="intro_text"
            dangerouslySetInnerHTML={{ __html: info.intro_text }}
          ></div>
          <br />
          <div className="intro-btn">
            <div id="button-3" className="magnetic">
              <div id="circle"></div>
              <a href="#contact-section">Contact Me</a>
            </div>
            <a
              id="resume"
              target="_blank"
              href={info.resume_url}
              className="btn-5 btn-5a icon-resume magnetic"
              rel="noreferrer"
            >
              Resume
            </a>
            <Link id="syncbot-btn" to="/syncbot" className="syncbot-trigger magnetic">
              <span className="syncbot-trigger-sheen" aria-hidden="true"></span>
              <span className="syncbot-trigger-core" aria-hidden="true"></span>
              <span className="syncbot-trigger-label">
                <Icon name="bot" size={20} />
                Ask AI
              </span>
            </Link>
          </div>
        </div>

        <div className="scroll-hint" aria-hidden="true">
          <span className="scroll-hint-label">scroll</span>
          <span className="scroll-hint-line"></span>
        </div>
      </div>
      <div className="mobile-wrap"></div>
      <div className="bottom-gradient"></div>
    </div>
  );
}
