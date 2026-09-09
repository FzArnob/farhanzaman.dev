import { useEffect, useRef } from 'react';
import { initParticleNetwork } from '../lib/particleNetwork';
import { useScrollRig } from '../stage/ScrollRig';
import { ACT_BY_ID, actPresence, clamp01 } from '../stage/timeline';

/**
 * The flat site's own particle network, reused as the connective tissue of the 3D world.
 *
 * It sits between the stage and the DOM overlay: the crystals float behind the net,
 * the copy sits in front of it. That is what stops the works act reading as objects on
 * a black void — the prisms hang inside a live network, which is exactly what the flat
 * design's hero was doing in 2D.
 *
 * Its opacity is a function of scroll rather than a constant: strongest through the
 * works and expertise acts where the network means something, almost gone in the
 * gallery where the artwork has to be the brightest thing on screen.
 */
export function ParticleLayer({ enabled = true }: { enabled?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rig = useScrollRig();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    /*
      Brand colours only, and still a lower density than the flat hero: this net runs
      behind a whole world, so it has to stay cheap. It was too sparse to read as a
      net at all though, so the density, the line weight and the reach all come up —
      and the staggered spawn drops from 250ms to 40ms a particle, because at this
      count the original interval took the better part of a minute to fill the screen
      and the hero spent its whole first impression nearly empty.

      It also opts out of pointer handling — the stage below owns that.
    */
    const stop = initParticleNetwork(host, {
      velocity: 0.6,
      density: 19000,
      netLineDistance: 190,
      netLineColor: 'rgba(0, 211, 180, 0.62)',
      netLineWidth: 1,
      spawnInterval: 40,
      particleColors: ['#00d3b4', '#00d3b4', '#00d3b4', '#fd2155'],
      interactive: false,
    });
    return stop;
  }, [enabled]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled) return;
    let frame = 0;
    const tick = () => {
      const t = rig.state.current.t;
      /*
        Where the net earns its place: the expertise sphere and the works ring are
        both about connections, so it comes forward there. The gallery is about
        photographs, so it gets out of the way.
      */
      const works = actPresence(t, ACT_BY_ID.works, 0.06, 0.06);
      const expertise = actPresence(t, ACT_BY_ID.expertise, 0.06, 0.06);
      const gallery = actPresence(t, ACT_BY_ID.hobbies, 0.05, 0.05);
      /*
        The floor used to be 0.2, which left the net a barely-there smudge everywhere
        outside those two acts — including the intro, the first thing anyone sees. It
        is now legible by default and the acts still shape it; the gallery still steps
        back, just not all the way to invisible.
      */
      const base = 0.46;
      const opacity = clamp01(base + works * 0.4 + expertise * 0.32 - gallery * 0.16);
      host.style.opacity = opacity.toFixed(3);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rig, enabled]);

  if (!enabled) return null;
  return <div ref={hostRef} className="prism-particles" aria-hidden="true" />;
}
