import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/**
 * Cross-cutting interaction state: which project core is open, which artwork is in the
 * lightbox, which expertise node is selected.
 *
 * These change rarely and the DOM overlay must re-render when they do, so they are
 * real React state. Each one is also mirrored into a ref, because the render loop reads
 * them every frame and a stale closure over a state value would be a bug that only
 * shows up as a camera that refuses to fly.
 */

export interface StageStateApi {
  /** project_id of the core the camera has flown into, or null. */
  openProject: string | null;
  setOpenProject: (id: string | null) => void;
  /** Index into the gallery, for the full-resolution lightbox. */
  lightbox: number | null;
  setLightbox: (index: number | null) => void;
  /** Expertise node index selected in the lattice, or -1. */
  expertise: number;
  setExpertise: (index: number) => void;
  /** Achievement index hovered/selected in the constellation, or -1. */
  achievement: number;
  setAchievement: (index: number) => void;
  /** Live mirrors for the render loop. */
  refs: {
    openProject: React.MutableRefObject<string | null>;
    lightbox: React.MutableRefObject<number | null>;
    achievement: React.MutableRefObject<number>;
  };
}

const StageStateContext = createContext<StageStateApi | null>(null);

export function useStageState(): StageStateApi {
  const api = useContext(StageStateContext);
  if (!api) throw new Error('useStageState must be used inside <StageStateProvider>');
  return api;
}

export function StageStateProvider({ children }: { children: ReactNode }) {
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [expertise, setExpertise] = useState(-1);
  const [achievement, setAchievement] = useState(-1);

  const openProjectRef = useRef<string | null>(null);
  const lightboxRef = useRef<number | null>(null);
  const achievementRef = useRef(-1);

  openProjectRef.current = openProject;
  lightboxRef.current = lightbox;
  achievementRef.current = achievement;

  // Escape closes whatever is open, innermost first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (lightbox !== null) setLightbox(null);
      else if (openProject) setOpenProject(null);
      else if (expertise >= 0) setExpertise(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, openProject, expertise]);

  // An open core or lightbox owns the viewport; the page must not scroll behind it.
  useEffect(() => {
    const locked = openProject !== null || lightbox !== null;
    document.documentElement.classList.toggle('prism-locked', locked);
    return () => document.documentElement.classList.remove('prism-locked');
  }, [openProject, lightbox]);

  const api = useMemo<StageStateApi>(
    () => ({
      openProject,
      setOpenProject,
      lightbox,
      setLightbox,
      expertise,
      setExpertise,
      achievement,
      setAchievement,
      refs: {
        openProject: openProjectRef,
        lightbox: lightboxRef,
        achievement: achievementRef,
      },
    }),
    [openProject, lightbox, expertise, achievement]
  );

  return <StageStateContext.Provider value={api}>{children}</StageStateContext.Provider>;
}
