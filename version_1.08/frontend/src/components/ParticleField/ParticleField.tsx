import { useEffect, useRef } from 'react';
import { initParticleField } from '../../lib/particleField';

/**
 * The one canvas for the whole site. Mounted once in App so it survives route
 * changes; `pointer-events: none` and `z-index: -1` keep it strictly behind and
 * out of the way of every interaction.
 */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return initParticleField(ref.current);
  }, []);

  return <canvas id="particle-field" ref={ref} aria-hidden="true"></canvas>;
}
