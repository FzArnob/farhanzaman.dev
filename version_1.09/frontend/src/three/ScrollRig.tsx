import Lenis from 'lenis';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ACTS, actAt, clamp01, type ActSpec } from './timeline';

/**
 * Scroll is the only clock.
 *
 * `raw` is the page scroll normalised to [0,1]. `t` is a damped follower of it, so the
 * camera has inertia without lag. Both live in a ref — the render loop reads them every
 * frame and must never trigger React work.
 *
 * The API and the current act are deliberately two separate contexts. The API object is
 * stable for the lifetime of the page, so an effect that depends on `seek` runs exactly
 * once; the act changes eight times and only the components that display it re-render.
 * Merging the two cost real time to debug: every act boundary invalidated the
 * deep-link effect, which re-ran `seek` and pulled the visitor back toward the top
 * mid-scroll.
 */

export interface ScrollState {
  /** Damped scroll position. Read this in useFrame. */
  t: number;
  /** Undamped scroll position. */
  raw: number;
  /** Signed scroll velocity, in t-units per second. */
  velocity: number;
}

interface RigApi {
  state: React.MutableRefObject<ScrollState>;
  /** Fly to a t rather than cutting — used by deep links and the rail. Stable. */
  seek: (t: number, immediate?: boolean) => void;
  /** Total scrollable height in vh, so the spacer and the rail agree. */
  heightVh: number;
}

const RigContext = createContext<RigApi | null>(null);
const ActContext = createContext<ActSpec>(ACTS[0]);

export function useScrollRig(): RigApi {
  const rig = useContext(RigContext);
  if (!rig) throw new Error('useScrollRig must be used inside <ScrollRig>');
  return rig;
}

/** Which act is on screen right now. Re-renders only on an act boundary. */
export function useCurrentAct(): ActSpec {
  return useContext(ActContext);
}

const HEIGHT_VH = 900;

/**
 * Momentum scrolling can be turned off with `?smooth=0`. It is a real preference —
 * some people find inertial scroll unpleasant, and it stops short of flat mode — and
 * it is also the seam that makes the page drivable from a test script, since Lenis
 * owns the scroll position while it is running.
 */
function smoothRequested(): boolean {
  if (typeof location === 'undefined') return true;
  const value = new URLSearchParams(location.search).get('smooth');
  return value !== '0' && value !== 'false';
}

function maxScroll(): number {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

export function ScrollRig({
  children,
  smoothScroll,
}: {
  children: ReactNode;
  smoothScroll?: boolean;
}) {
  const smooth = smoothScroll ?? smoothRequested();
  const state = useRef<ScrollState>({ t: 0, raw: 0, velocity: 0 });
  const [act, setAct] = useState<ActSpec>(ACTS[0]);
  const lenisRef = useRef<Lenis | null>(null);

  /**
   * Marks the document as Prism-driven. 24-prism.css uses this to switch off the base
   * stylesheet's global `scroll-behavior: smooth` — Lenis and the act timeline both
   * need the browser to apply scroll positions immediately — and to make the overlay
   * copy selectable again.
   */
  useEffect(() => {
    document.documentElement.classList.add('prism-active');
    return () => document.documentElement.classList.remove('prism-active');
  }, []);

  useEffect(() => {
    let lenis: Lenis | null = null;
    if (smooth) {
      lenis = new Lenis({
        duration: 1.05,
        // A gentle exponential feels like weight; anything slower reads as lag.
        easing: (x) => 1 - Math.pow(1 - x, 3),
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        // Vertical only: horizontal drag belongs to the acts that spin.
        orientation: 'vertical',
        gestureOrientation: 'vertical',
      });
      lenisRef.current = lenis;
    }

    let frame = 0;
    let last = performance.now();
    let currentAct = ACTS[0].id;

    const tick = (now: number) => {
      const elapsed = (now - last) / 1000;
      last = now;
      lenis?.raf(now);

      /*
        The follower is exponential, so it is correct at any frame rate as long as
        it is given the real elapsed time. Clamping dt the way a physics step would
        is actively wrong here: at 2 fps a 50 ms cap closes only a third of the gap
        per frame and `t` ends up seconds behind the scroll, showing the wrong act.
        The 0.25 s cap exists only to stop a backgrounded tab from resuming with a
        multi-second step, and an exponential treats that as "snap", which is right.
      */
      const dt = Math.min(elapsed, 0.25);
      const raw = clamp01(window.scrollY / maxScroll());
      const prev = state.current.t;
      const next = prev + (raw - prev) * (1 - Math.exp(-dt * 7.5));
      state.current.raw = raw;
      state.current.t = next;
      state.current.velocity = dt > 0 ? (next - prev) / dt : 0;

      const nowAct = actAt(next);
      if (nowAct.id !== currentAct) {
        currentAct = nowAct.id;
        setAct(nowAct);
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [smooth]);

  // Stable for the lifetime of the page: nothing here closes over changing state.
  const seek = useCallback((t: number, immediate = false) => {
    const target = clamp01(t) * maxScroll();
    if (lenisRef.current && !immediate) {
      lenisRef.current.scrollTo(target, { duration: 1.2 });
    } else {
      // 24-prism.css forces scroll-behavior:auto, so this lands immediately.
      window.scrollTo({ top: target, behavior: 'auto' });
    }
  }, []);

  const api = useMemo<RigApi>(() => ({ state, seek, heightVh: HEIGHT_VH }), [seek]);

  return (
    <RigContext.Provider value={api}>
      <ActContext.Provider value={act}>{children}</ActContext.Provider>
    </RigContext.Provider>
  );
}

export { HEIGHT_VH };
