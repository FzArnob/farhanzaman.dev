/**
 * Device tiering.
 *
 * A 3D portfolio that only works on the machine it was built on is a liability, so
 * the tier is measured rather than guessed: renderer string first, then a short
 * frame probe that can demote a tier that turns out to be optimistic.
 */

export type Tier = 'high' | 'mid' | 'low' | 'flat';

export interface Quality {
  tier: Tier;
  /** Device pixel ratio ceiling. */
  dpr: number;
  /** Size of the global shard pool. */
  shards: number;
  /** Points in the dust field. */
  dust: number;
  /** Whether MeshPhysicalMaterial.transmission is affordable at all. */
  transmission: boolean;
  /** Whether wavelength dispersion (three r165+) is affordable on top of that. */
  dispersion: boolean;
  bloom: boolean;
  chromaticAberration: boolean;
  antialias: boolean;
}

const PRESETS: Record<Exclude<Tier, 'flat'>, Omit<Quality, 'tier'>> = {
  high: {
    dpr: 2,
    shards: 256,
    dust: 2400,
    transmission: true,
    dispersion: true,
    bloom: true,
    chromaticAberration: true,
    antialias: true,
  },
  mid: {
    dpr: 1.5,
    shards: 96,
    dust: 1200,
    transmission: false,
    dispersion: false,
    bloom: true,
    chromaticAberration: true,
    antialias: true,
  },
  low: {
    dpr: 1,
    shards: 0,
    dust: 500,
    transmission: false,
    dispersion: false,
    bloom: false,
    chromaticAberration: false,
    antialias: false,
  },
};

export const FLAT: Quality = {
  tier: 'flat',
  dpr: 1,
  shards: 0,
  dust: 0,
  transmission: false,
  dispersion: false,
  bloom: false,
  chromaticAberration: false,
  antialias: false,
};

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Explicit opt-out, so a visitor who just wants to read can say so. */
export function flatModeRequested(): boolean {
  if (typeof window === 'undefined') return true;
  if (new URLSearchParams(location.search).has('flat')) return true;
  try {
    return localStorage.getItem('fz-flat') === '1';
  } catch {
    return false;
  }
}

export function setFlatMode(on: boolean): void {
  try {
    if (on) localStorage.setItem('fz-flat', '1');
    else localStorage.removeItem('fz-flat');
  } catch {
    /* private mode — the URL flag still works */
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    // Chrome hands out a software context on some managed machines; still usable.
    return true;
  } catch {
    return false;
  }
}

/** Reads the unmasked GPU string when the extension is available. */
function rendererString(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) return '';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const raw = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return String(raw || '').toLowerCase();
  } catch {
    return '';
  }
}

function guessTier(): Exclude<Tier, 'flat'> {
  const gpu = rendererString();
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;

  // Software rasterisers cannot afford a transmission pass at any resolution.
  if (/swiftshader|basic render|software|llvmpipe/.test(gpu)) return 'low';

  if (mobile) {
    // Apple silicon phones handle mid comfortably; most Android midrange does not.
    if (/apple/.test(gpu)) return 'mid';
    return cores >= 8 ? 'mid' : 'low';
  }

  if (/rtx|radeon rx|apple m[1-9]|arc a[0-9]/.test(gpu)) return 'high';
  if (/geforce|radeon|apple/.test(gpu)) return 'high';
  if (/intel|uhd|iris/.test(gpu)) return cores >= 8 ? 'mid' : 'low';
  if (memory && memory <= 4) return 'low';
  return cores >= 8 ? 'high' : 'mid';
}

/**
 * `?tier=high|mid|low|flat` forces a tier. This is how the device matrix gets tested
 * without a drawer full of phones — and how a visitor on a machine the probe
 * misjudges can overrule it.
 */
function forcedTier(): Tier | null {
  if (typeof location === 'undefined') return null;
  const value = new URLSearchParams(location.search).get('tier');
  return value === 'high' || value === 'mid' || value === 'low' || value === 'flat' ? value : null;
}

export function detectQuality(): Quality {
  if (typeof window === 'undefined') return FLAT;
  const forced = forcedTier();
  if (forced === 'flat') return FLAT;
  if (forced) return { tier: forced, ...PRESETS[forced] };
  // Reduced motion is a hard switch to flat, not a slowed-down version of the ride.
  if (prefersReducedMotion() || flatModeRequested() || !hasWebGL()) return FLAT;
  const tier = guessTier();
  return { tier, ...PRESETS[tier] };
}

/** Demote one step. Called by the frame probe when the guess proves optimistic. */
export function demote(q: Quality): Quality {
  if (q.tier === 'high') return { tier: 'mid', ...PRESETS.mid };
  if (q.tier === 'mid') return { tier: 'low', ...PRESETS.low };
  return q;
}
