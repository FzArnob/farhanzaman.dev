import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ConstellationCopy,
  ForgeCopy,
  GalleryCopy,
  LatticeCopy,
  PrismCopy,
  SpineCopy,
  TurbineCopy,
} from '../../overlay/ActCopy';
import { ActRail } from '../../overlay/ActRail';
import { ClipPlayer, Lightbox } from '../../overlay/Lightbox';
import { CalibrationCurtain, PrismMasthead } from '../../overlay/PrismChrome';
import { ProjectPanel } from '../../overlay/ProjectPanel';
import { SyncCopy } from '../../overlay/SyncCopy';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { detectQuality, setFlatMode, type Quality } from '../../lib/quality';
import { HEIGHT_VH, ScrollRig, useScrollRig } from '../../three/ScrollRig';
import { StageStateProvider, useStageState } from '../../three/StageState';
import { tForPath } from '../../three/timeline';
import type { GamingVideo } from '../../types/gaming';
import '../../styles/24-prism.css';

/**
 * PRISM — the whole site as one continuous 3D world.
 *
 * One canvas behind, one DOM overlay in front, one scroll driving both. The old routes
 * still resolve: each maps to a `t` and the camera flies there rather than cutting, so
 * arriving from a bookmark or a search result looks deliberate.
 *
 * Both heavy branches are code-split. The overlay, the scroll rig and the timeline
 * import no three.js at all (that is what src/three/liveState.ts and src/lib/band.ts
 * are for), so the shell paints the hero copy before the 3D chunk has been requested —
 * which is what LCP actually measures.
 */

const Stage = lazy(() => import('../../three/Stage').then((m) => ({ default: m.Stage })));
const FlatMode = lazy(() => import('./FlatMode'));

function Deeplink() {
  const rig = useScrollRig();
  const { pathname } = useLocation();

  useEffect(() => {
    const t = tForPath(pathname);
    if (t === null || t === 0) return;
    // Let the first frames render, then fly — a cut on arrival reads as a bug.
    const id = window.setTimeout(() => rig.seek(t), 420);
    return () => window.clearTimeout(id);
  }, [pathname, rig]);

  return null;
}

function Overlays({ clip, onClip }: { clip: GamingVideo | null; onClip: (clip: GamingVideo | null) => void }) {
  const profile = useProfile();
  const stage = useStageState();
  const project = useMemo(
    () => profile.projects.find((p) => p.project_id === stage.openProject) ?? null,
    [profile.projects, stage.openProject]
  );

  return (
    <>
      <ProjectPanel project={project} onClose={() => stage.setOpenProject(null)} />
      <Lightbox
        gallery={profile.gallery}
        index={stage.lightbox}
        onIndex={stage.setLightbox}
        onClose={() => stage.setLightbox(null)}
      />
      <ClipPlayer clip={clip} onClose={() => onClip(null)} />
    </>
  );
}

function PrismWorld({ quality }: { quality: Quality }) {
  const profile = useProfile();
  const [clip, setClip] = useState<GamingVideo | null>(null);
  const [light, setLight] = useState(() => document.querySelector('link[data-theme="light"]') !== null);

  useDocumentTitle(profile.info.full_name);

  /**
   * The existing theme switch swaps a <link> in <head> rather than setting a class, so
   * the stage watches for that instead of being told. Keeps lib/theme.ts untouched.
   */
  useEffect(() => {
    const read = () => setLight(document.querySelector('link[data-theme="light"]') !== null);
    const observer = new MutationObserver(read);
    observer.observe(document.head, { childList: true });
    read();
    return () => observer.disconnect();
  }, []);

  const onFlat = useCallback(() => {
    setFlatMode(true);
    window.location.reload();
  }, []);

  return (
    <ScrollRig>
      <StageStateProvider>
        <Deeplink />

        {/* The only thing in the document flow: 900vh of scroll for the world to run on. */}
        <div className="prism-scroll" style={{ height: `${HEIGHT_VH}vh` }} aria-hidden="true" />

        <Suspense fallback={null}>
          <Stage profile={profile} quality={quality} light={light} onOpenClip={setClip} />
        </Suspense>

        <div className="prism-overlay">
          <PrismMasthead nickName={profile.info.nick_name} onFlat={onFlat} />
          <ActRail />

          <main className="prism-acts">
            <PrismCopy profile={profile} />
            <SpineCopy profile={profile} />
            <LatticeCopy profile={profile} />
            <TurbineCopy profile={profile} />
            <ForgeCopy profile={profile} />
            <ConstellationCopy profile={profile} />
            <GalleryCopy profile={profile} />
            <SyncCopy profile={profile} />
          </main>
        </div>

        <Overlays clip={clip} onClip={setClip} />
        <CalibrationCurtain />
      </StageStateProvider>
    </ScrollRig>
  );
}

export function PrismPage() {
  // Measured once at mount: the tier can only be known on the device it runs on.
  const [quality] = useState<Quality>(detectQuality);

  if (quality.tier === 'flat') {
    return (
      <Suspense fallback={null}>
        <FlatMode />
      </Suspense>
    );
  }
  return <PrismWorld quality={quality} />;
}
