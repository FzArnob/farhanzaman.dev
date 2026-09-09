import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AchievementsCopy,
  ArcadeCopy,
  BackgroundCopy,
  ExpertiseCopy,
  HobbiesCopy,
  IntroCopy,
  SkillsCopy,
  WorksCopy,
} from '../../overlay/ActCopy';
import { ActRail } from '../../overlay/ActRail';
import { ContactCopy } from '../../overlay/ContactCopy';
import { ClipPlayer, Lightbox } from '../../overlay/Lightbox';
import { ParticleLayer } from '../../overlay/ParticleLayer';
import { CalibrationCurtain, PrismMasthead } from '../../overlay/PrismChrome';
import { ProjectPanel } from '../../overlay/ProjectPanel';
import { SectionReadout } from '../../overlay/SectionReadout';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { detectQuality, type Quality } from '../../lib/quality';
import { HEIGHT_VH, ScrollRig, useScrollRig } from '../../stage/ScrollRig';
import { StageStateProvider, useStageState } from '../../stage/StageState';
import { tForPath } from '../../stage/timeline';
import type { GamingVideo } from '../../types/gaming';
import { StaticFallback } from './StaticFallback';
import '../../styles/24-prism.css';
import '../../styles/26-stage.css';

/**
 * PRISM — the whole site, as one continuous 3D world.
 *
 * Nine acts, one stage, one scroll. There is no flat/3D switch: this is the site. The
 * only alternative rendering is StaticFallback, which catches someone who has asked
 * the OS for reduced motion and is chosen for them rather than offered as an option.
 *
 * The world is built out of DOM and one 2D canvas — no WebGL, no scene graph, no
 * shader compilation, and nothing that a locked-down machine or a driver blocklist can
 * refuse to give us. src/stage/ holds the camera, the projection and the nine acts;
 * the whole of it is a fraction of the download the three.js build needed and it
 * starts on the first frame rather than after a compile.
 *
 * The stage is still code-split, because the overlay is what has to paint first: the
 * copy, the rail and the readout import nothing from src/stage/ but liveState and the
 * timeline, neither of which carries a renderer.
 */

const Stage = lazy(() => import('../../stage/Stage').then((m) => ({ default: m.Stage })));
const SyncBotConsole = lazy(() =>
  import('../SyncBot/SyncBotPage').then((m) => ({ default: m.SyncBotPage }))
);

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

function Overlays({
  clip,
  onClip,
}: {
  clip: GamingVideo | null;
  onClip: (clip: GamingVideo | null) => void;
}) {
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
  const [bot, setBot] = useState(false);
  const [light, setLight] = useState(
    () => document.querySelector('link[data-theme="light"]') !== null
  );

  useDocumentTitle(profile.info.full_name);

  /**
   * The existing theme switch swaps a <link> in <head> rather than setting a class,
   * so the stage watches for that instead of being told. Keeps lib/theme.ts untouched.
   */
  useEffect(() => {
    const read = () => setLight(document.querySelector('link[data-theme="light"]') !== null);
    const observer = new MutationObserver(read);
    observer.observe(document.head, { childList: true });
    read();
    return () => observer.disconnect();
  }, []);

  return (
    <ScrollRig>
      <StageStateProvider>
        <Deeplink />

        {/* The only thing in the document flow: the scroll the world runs on. */}
        <div className="prism-scroll" style={{ height: `${HEIGHT_VH}vh` }} aria-hidden="true" />

        <Suspense fallback={null}>
          <Stage profile={profile} quality={quality} light={light} onOpenClip={setClip} />
        </Suspense>

        {/* The flat site's own particle network, between the stage and the copy. */}
        <ParticleLayer enabled={quality.particles} />

        <div className="prism-overlay">
          <PrismMasthead nickName={profile.info.nick_name} onOpenBot={() => setBot(true)} />
          <ActRail />
          <SectionReadout />

          <main className="prism-acts">
            <IntroCopy profile={profile} />
            <BackgroundCopy profile={profile} />
            <ExpertiseCopy profile={profile} />
            <SkillsCopy profile={profile} />
            <AchievementsCopy profile={profile} />
            <WorksCopy profile={profile} />
            <HobbiesCopy profile={profile} />
            <ArcadeCopy />
            <ContactCopy profile={profile} />
          </main>
        </div>

        <Overlays clip={clip} onClip={setClip} />

        {bot && (
          <div className="prism-console" role="dialog" aria-modal="true" aria-label="SyncBot">
            <button
              type="button"
              className="prism-close prism-console-close"
              onClick={() => setBot(false)}
              aria-label="Close SyncBot"
            >
              Esc
            </button>
            <Suspense fallback={<p className="prism-text">Waking SyncBot…</p>}>
              <SyncBotConsole />
            </Suspense>
          </div>
        )}

        <CalibrationCurtain />
      </StageStateProvider>
    </ScrollRig>
  );
}

export function PrismPage() {
  // Measured once at mount: the tier can only be known on the device it runs on.
  const [quality] = useState<Quality>(detectQuality);

  if (quality.tier === 'static') return <StaticFallback />;
  return <PrismWorld quality={quality} />;
}
