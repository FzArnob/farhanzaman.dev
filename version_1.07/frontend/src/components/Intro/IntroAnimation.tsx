import { useEffect, useRef, type MouseEvent } from 'react';
import Typed from 'typed.js';
import { initParticleNetwork } from '../../lib/particleNetwork';
import type { ProfileInfo } from '../../types/profile';

export function IntroAnimation({ info }: { info: ProfileInfo }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const designationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    return initParticleNetwork(wrapRef.current);
  }, []);

  useEffect(() => {
    if (!designationRef.current) return;
    const typed = new Typed('#designation', {
      strings: info.designations,
      typeSpeed: 150,
      backSpeed: 40,
      loop: true,
    });
    return () => typed.destroy();
  }, [info.designations]);

  /** Leaves a trail of expanding dots behind the pointer. */
  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const x = event.pageX;
    const y = event.pageY;
    const sizeInt = 15;
    if (x > 0 && y > 0) {
      const ball = document.createElement('div');
      ball.classList.add('ball');
      ball.setAttribute(
        'style',
        `left: ${x}px;top: ${y}px;height: ${sizeInt}px; width: ${sizeInt}px;`
      );
      ball.addEventListener('animationend', function (this: HTMLDivElement) {
        this.parentNode?.removeChild(this);
      });
      wrap.appendChild(ball);
    }
  };

  return (
    <div className="intro-animation">
      <div className="particle-network-animation" id="wrap" ref={wrapRef} onMouseMove={onMouseMove}>
        <div className="intro-text">
          <div className="intro-text-medium">
            <span
              className="wobble intro-text-secondary-theme-color op1 inline"
              data-animation="upscale"
              id="nick_name"
            >
              Farhan{' '}
            </span>
            <span className="wobble c1">Zaman</span>
          </div>
          <div className="intro-designation-text c1">
            <div className="intro-text-medium-1 c1"></div>
            <div className="intro-text-medium-2" id="designation" ref={designationRef}></div>
          </div>
          <div
            className="intro-text-small c1"
            data-animation="fade"
            id="intro_text"
            dangerouslySetInnerHTML={{ __html: info.intro_text }}
          ></div>
          <br />
          <div className="intro-btn">
            <div id="button-3">
              <div id="circle"></div>
              <a href="#contact-section">Contact Me</a>
            </div>
            <a
              id="resume"
              target="_blank"
              href={info.resume_url}
              className="btn-5 btn-5a icon-resume"
              rel="noreferrer"
            >
              Resume
            </a>
          </div>
        </div>
      </div>
      <div className="mobile-wrap"></div>
      <div className="bottom-gradient"></div>
    </div>
  );
}
