import { useEffect, useRef, useState } from 'react';
import { demote, type Quality } from '../lib/quality';
import { markWebglUnavailable, pickRenderer, type RendererKind } from '../lib/renderer';
import type { GamingVideo } from '../types/gaming';
import type { Profile } from '../types/profile';
import { createPrismAct } from './acts/act01Prism';
import { createBackgroundAct } from './acts/act02Background';
import { createCloudAct } from './acts/act03Cloud';
import { createSkillsAct } from './acts/act04Skills';
import { createAchievementsAct } from './acts/act05Achievements';
import { createWorksAct } from './acts/act06Works';
import { createCaseAct } from './acts/act06bCase';
import { createHobbiesAct } from './acts/act07Hobbies';
import { createArcadeAct } from './acts/act08Arcade';
import { createContactAct } from './acts/act09Contact';
import { createFieldAct } from './fx/field';
import { StageEngine, type ActFactory, type BuildContext } from './engine';
import type { GLDriver } from './gl/api';
import { lookFor } from './look';
import { boot } from './liveState';
import { useScrollRig } from './ScrollRig';
import { useStageState } from './StageState';

/**
 * The world, mounted.
 *
 * React's part is exactly two things: build the stage when the theme, the tier or the
 * renderer changes, and tear it down on unmount. Everything between those two moments
 * is the engine's single rAF loop — no reconciliation, no state, no re-render at sixty
 * frames a second.
 *
 * There are two renderers and one world. Where lib/renderer.ts finds a hardware WebGL 2
 * context, the solids — the mark, the crystals, the skills core, the shards — are real
 * lit geometry drawn by three.js; everywhere else the same acts build them out of CSS
 * 3D faces and a 2D canvas. three.js is only fetched on the first path: a visitor on
 * the CSS stage never downloads it. And the WebGL path can always step down — if the
 * library fails to load, the stage fails to build, or the GPU drops the context halfway
 * down the page, the stage rebuilds on CSS and the visitor keeps their place.
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
  createSkillsAct,
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
  // once, at the start. A rebuild is cheap — nothing here outlives the stage.
  const [quality, setQuality] = useState(initialQuality);
  useEffect(() => setQuality(initialQuality), [initialQuality]);
  const [renderer, setRenderer] = useState<RendererKind>(() => pickRenderer(initialQuality));
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
    host.dataset.renderer = renderer;

    const look = lookFor(light);
    const ctx: Omit<BuildContext, 'gl'> = {
      host,
      profile,
      quality,
      look,
      openProject: () => stageRef.current.refs.openProject.current,
      onOpenProject: (id) => stageRef.current.setOpenProject(id),
      onLightbox: (index) => stageRef.current.setLightbox(index),
      onAchievement: (index) => stageRef.current.setAchievement(index),
      onOpenClip: (clip) => clipRef.current(clip),
      onDemote: () => setQuality((current) => demote(current)),
    };
    const readT = () => rig.state.current.t;

    let engine: StageEngine | null = null;
    let cancelled = false;

    /** WebGL did not work out, for whatever reason: the CSS stage takes over. */
    const fallBack = () => {
      if (cancelled) return;
      markWebglUnavailable();
      setRenderer('css');
    };

    if (renderer === 'css') {
      engine = new StageEngine(ctx, ACTS, readT);
      engine.start();
    } else {
      import('./gl/GLStage')
        .then(({ WebGLStage }) => {
          if (cancelled) return;
          let gl: GLDriver | null = null;
          try {
            gl = new WebGLStage({ look, quality, onLost: fallBack });
            engine = new StageEngine(ctx, ACTS, readT, gl);
          } catch (error) {
            // A context that could not be made, or an act that could not build on it.
            // Either way no engine owns the GL stage yet, so it is disposed here — and an
            // engine that threw half-built may have left its root behind in the host.
            console.warn('[stage] WebGL build failed; using the CSS stage.', error);
            gl?.dispose();
            host.querySelectorAll('.pz3-stage').forEach((node) => node.remove());
            fallBack();
            return;
          }
          engine.start();
        })
        .catch((error) => {
          console.warn('[stage] WebGL renderer failed to load; using the CSS stage.', error);
          fallBack();
        });
    }

    return () => {
      cancelled = true;
      engine?.dispose();
    };
    // Theme, tier and renderer are the only things that change what is built. All
    // three are rare, and each changes every material in the world, so a rebuild is
    // the honest answer.
  }, [profile, quality, light, rig, renderer]);

  return <div ref={hostRef} className="pz3-host" aria-hidden="true" role="presentation" />;
}
