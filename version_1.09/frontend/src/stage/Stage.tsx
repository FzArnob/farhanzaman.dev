import { useEffect, useRef, useState } from 'react';
import { demote, type Quality } from '../lib/quality';
import type { GamingVideo } from '../types/gaming';
import type { Profile } from '../types/profile';
import { createPrismAct } from './acts/act01Prism';
import { createBackgroundAct } from './acts/act02Background';
import { createCloudAct } from './acts/act03Cloud';
import { createTurbineAct } from './acts/act04Turbine';
import { createAchievementsAct } from './acts/act05Achievements';
import { createWorksAct } from './acts/act06Works';
import { createCaseAct } from './acts/act06bCase';
import { createHobbiesAct } from './acts/act07Hobbies';
import { createArcadeAct } from './acts/act08Arcade';
import { createContactAct } from './acts/act09Contact';
import { createFieldAct } from './fx/field';
import { StageEngine, type ActFactory } from './engine';
import { lookFor } from './look';
import { boot } from './liveState';
import { useScrollRig } from './ScrollRig';
import { useStageState } from './StageState';

/**
 * The world, mounted.
 *
 * This is the whole of what used to be a `<Canvas>` and eleven `useFrame` subscribers.
 * React's part is now exactly two things: build the stage when the theme or the tier
 * changes, and tear it down on unmount. Everything between those two moments is the
 * engine's single rAF loop writing transforms — no reconciliation, no state, no
 * re-render at sixty frames a second.
 *
 * The acts are listed in paint order, back to front. The field goes down first because
 * dust and shards hang behind everything; the case chamber goes last because when it
 * opens, it is the only thing in the world.
 */

const ACTS: ActFactory[] = [
  createFieldAct,
  createPrismAct,
  createBackgroundAct,
  createCloudAct,
  createTurbineAct,
  createAchievementsAct,
  createWorksAct,
  createHobbiesAct,
  createArcadeAct,
  createContactAct,
  createCaseAct,
];

export function Stage({
  profile,
  quality: initialQuality,
  light,
  onOpenClip,
}: {
  profile: Profile;
  quality: Quality;
  light: boolean;
  onOpenClip: (video: GamingVideo) => void;
}) {
  // Measured tiering: the engine's probe can demote a guess the device cannot hold,
  // once, at the start. A rebuild is cheap here — it is DOM, not a scene graph.
  const [quality, setQuality] = useState(initialQuality);
  useEffect(() => setQuality(initialQuality), [initialQuality]);
  const hostRef = useRef<HTMLDivElement>(null);
  const rig = useScrollRig();
  const stage = useStageState();

  /*
    The stage reads live values through refs rather than closing over React state: the
    loop runs between renders, and a stale closure over `openProject` would be a bug
    that only shows up as a camera which refuses to fly.
  */
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const clipRef = useRef(onOpenClip);
  clipRef.current = onOpenClip;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Profile data is in hand by the time the stage mounts, so calibration runs short.
    boot.ready = true;

    const engine = new StageEngine(
      {
        host,
        profile,
        quality,
        look: lookFor(light),
        openProject: () => stageRef.current.refs.openProject.current,
        onOpenProject: (id) => stageRef.current.setOpenProject(id),
        onLightbox: (index) => stageRef.current.setLightbox(index),
        onAchievement: (index) => stageRef.current.setAchievement(index),
        onOpenClip: (clip) => clipRef.current(clip),
        onDemote: () => setQuality((current) => demote(current)),
      },
      ACTS,
      () => rig.state.current.t
    );
    engine.start();
    return () => engine.dispose();
    // Theme and tier are the only things that change what is built. Both are rare, and
    // both change every colour in the world, so a rebuild is the honest answer.
  }, [profile, quality, light, rig]);

  return <div ref={hostRef} className="pz3-host" aria-hidden="true" role="presentation" />;
}
