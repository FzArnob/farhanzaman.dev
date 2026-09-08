import { useEffect, useRef } from 'react';
import { initParticleNetwork } from '../../lib/particleNetwork';

/**
 * The particle net, behind the About page.
 *
 * /about is a document rather than an act, but it is reached from inside the Prism
 * world and has to feel like the same place when you get there. The net is the cheapest
 * honest way to say so: same animation, same brand colours, same density as the layer
 * that runs behind the 3D canvas.
 *
 * Pointer handling is off. On the world it is off because the WebGL canvas owns the
 * pointer; here it is off because the page underneath owns it, and a canvas that
 * swallowed clicks would break every link on the page.
 */
export function AboutBackdrop() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return initParticleNetwork(host, {
      velocity: 0.55,
      density: 19000,
      netLineDistance: 190,
      netLineColor: 'rgba(0, 211, 180, 0.5)',
      netLineWidth: 1,
      spawnInterval: 40,
      particleColors: ['#00d3b4', '#00d3b4', '#00d3b4', '#fd2155'],
      interactive: false,
    });
  }, []);

  return <div ref={hostRef} className="a3d-backdrop" aria-hidden="true" />;
}
