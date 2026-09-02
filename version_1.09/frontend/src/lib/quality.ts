/**
 * Device and network tiering.
 *
 * A 3D portfolio that only works on the machine it was built on is a liability, so the
 * tier is measured rather than guessed: the renderer string and the connection give a
 * first answer, and a short frame probe can demote a tier that proves optimistic.
 *
 * There is no user-facing "flat mode" any more. `static` is not a choice — it is what
 * a browser that cannot run WebGL gets, or someone who has asked the OS for reduced
 * motion. Everyone else gets the 3D site at whatever fidelity their device can hold.
 */

export type Tier = 'high' | 'mid' | 'low' | 'static';

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
  /** The 2D particle network layer. First thing to go on a weak device. */
  particles: boolean;
  antialias: boolean;
  /** How many remote textures may be in flight at once. */
  textureConcurrency: number;
}

const PRESETS: Record<Exclude<Tier, 'static'>, Omit<Quality, 'tier'>> = {
  high: {
    dpr: 2,
    shards: 200,
    dust: 1800,
    transmission: true,
    dispersion: true,
    particles: true,
    antialias: true,
    textureConcurrency: 4,
  },
  mid: {
    dpr: 1.5,
    shards: 84,
    dust: 900,
    transmission: false,
    dispersion: false,
    particles: true,
    antialias: true,
    textureConcurrency: 3,
  },
  low: {
    dpr: 1,
    shards: 0,
    dust: 380,
    transmission: false,
    dispersion: false,
    particles: false,
    antialias: false,
    textureConcurrency: 2,
  },
};

export const STATIC: Quality = {
  tier: 'static',
  dpr: 1,
  shards: 0,
  dust: 0,
  transmission: false,
  dispersion: false,
  particles: false,
  antialias: false,
  textureConcurrency: 2,
};

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
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

interface NetworkInfo {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

/**
 * The connection, where the browser will say. A visitor on 2G or with Data Saver on
 * gets the low tier regardless of how fast their GPU is: the bottleneck is the wire,
 * and the low tier is the one that asks for the fewest bytes.
 */
export function networkTier(): 'slow' | 'ok' {
  const nav = navigator as Navigator & { connection?: NetworkInfo };
  const c = nav.connection;
  if (!c) return 'ok';
  if (c.saveData) return 'slow';
  if (c.effectiveType && /(^|-)(slow-)?2g$/.test(c.effectiveType)) return 'slow';
  if (typeof c.downlink === 'number' && c.downlink > 0 && c.downlink < 1.2) return 'slow';
  return 'ok';
}

function guessTier(): Exclude<Tier, 'static'> {
  const gpu = rendererString();
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;

  // On a slow link, fidelity is not the constraint — bytes are.
  if (networkTier() === 'slow') return 'low';

  // Software rasterisers cannot afford a transmission pass at any resolution.
  if (/swiftshader|basic render|software|llvmpipe/.test(gpu)) return 'low';

  if (mobile) {
    // Apple silicon phones handle mid comfortably; most Android midrange does not.
    if (/apple/.test(gpu)) return 'mid';
    return cores >= 8 ? 'mid' : 'low';
  }

  if (/rtx|radeon rx|apple m[1-9]|arc a[0-9]|geforce|radeon|apple/.test(gpu)) return 'high';
  if (/intel|uhd|iris/.test(gpu)) return cores >= 8 ? 'mid' : 'low';
  if (memory && memory <= 4) return 'low';
  return cores >= 8 ? 'high' : 'mid';
}

/**
 * `?tier=high|mid|low|static` forces a tier. This is how the device matrix gets
 * tested without a drawer full of phones, and how a visitor on a machine the probe
 * misjudges can overrule it.
 */
function forcedTier(): Tier | null {
  if (typeof location === 'undefined') return null;
  const value = new URLSearchParams(location.search).get('tier');
  return value === 'high' || value === 'mid' || value === 'low' || value === 'static' ? value : null;
}

export function detectQuality(): Quality {
  if (typeof window === 'undefined') return STATIC;
  const forced = forcedTier();
  if (forced === 'static') return STATIC;
  if (forced) return { tier: forced, ...PRESETS[forced] };
  // Reduced motion means no camera travel at all, not a slower ride.
  if (prefersReducedMotion() || !hasWebGL()) return STATIC;
  const tier = guessTier();
  return { tier, ...PRESETS[tier] };
}

/** Demote one step. Called by the frame probe when the guess proves optimistic. */
export function demote(q: Quality): Quality {
  if (q.tier === 'high') return { tier: 'mid', ...PRESETS.mid };
  if (q.tier === 'mid') return { tier: 'low', ...PRESETS.low };
  return q;
}
