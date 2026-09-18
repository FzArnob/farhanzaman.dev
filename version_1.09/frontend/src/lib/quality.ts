/**
 * Device and network tiering.
 *
 * A portfolio that only works on the machine it was built on is a liability, so what
 * the world costs is measured against the device rather than assumed. The tier scales
 * how many points are in the field and how deep the CSS extrusions are, and on the
 * WebGL renderer it also picks the materials and passes: clearcoat and 4x multisampling
 * on high, bloom on high and mid, neither on low (see stage/gl/GLStage.ts).
 *
 * Whether WebGL runs at all is not a tier. lib/renderer.ts decides that from whether a
 * hardware context can be had, and the CSS stage takes over wherever it cannot. The
 * tier itself is guessed from cores, memory, form factor and the connection — the GPU
 * string is never read — and the engine's frame probe corrects a guess that was wrong.
 *
 * `static` is not a choice anybody makes: it is what someone who has asked the OS for
 * reduced motion gets, and it is the one case where a moving world would be wrong
 * rather than merely expensive.
 */

export type Tier = 'high' | 'mid' | 'low' | 'static';

export interface Quality {
  tier: Tier;
  /** Backing-store ratio for the point canvas. Nothing else is rasterised by us. */
  dpr: number;
  /** Size of the shard pool. */
  shards: number;
  /** Points in the dust field. */
  dust: number;
  /** How many copies of the mark build an extrusion. */
  extrusion: number;
}

const PRESETS: Record<Exclude<Tier, 'static'>, Omit<Quality, 'tier'>> = {
  high: { dpr: 1.5, shards: 200, dust: 1800, extrusion: 14 },
  mid: { dpr: 1.25, shards: 84, dust: 900, extrusion: 9 },
  low: { dpr: 1, shards: 0, dust: 380, extrusion: 5 },
};

export const STATIC: Quality = {
  tier: 'static',
  dpr: 1,
  shards: 0,
  dust: 0,
  extrusion: 0,
};

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface NetworkInfo {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

/**
 * The connection, where the browser will say. A visitor on 2G or with Data Saver on
 * gets the low tier regardless of how fast their device is: the bottleneck is the wire,
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
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;

  // On a slow link, fidelity is not the constraint — bytes are.
  if (networkTier() === 'slow') return 'low';
  // A small screen is a small compositor budget, whatever the chip is called.
  if (mobile) return cores >= 6 ? 'mid' : 'low';
  if (memory && memory <= 4) return 'low';
  return cores >= 8 ? 'high' : 'mid';
}

/**
 * `?tier=high|mid|low|static` forces a tier. This is how the device matrix gets tested
 * without a drawer full of phones, and how a visitor on a machine the guess misjudges
 * can overrule it.
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
  if (prefersReducedMotion()) return STATIC;
  const tier = guessTier();
  return { tier, ...PRESETS[tier] };
}

/** Demote one step. Called by the frame probe when the guess proves optimistic. */
export function demote(q: Quality): Quality {
  if (q.tier === 'high') return { tier: 'mid', ...PRESETS.mid };
  if (q.tier === 'mid') return { tier: 'low', ...PRESETS.low };
  return q;
}
