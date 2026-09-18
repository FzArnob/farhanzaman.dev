/**
 * Which renderer draws the world: WebGL where the machine will give us a real context,
 * the DOM and a 2D canvas everywhere else.
 *
 * WebGL is in every current browser, but "supported" is not "available". A context can
 * be refused outright — a GPU on the browser's blocklist, hardware acceleration turned
 * off by a person or by IT policy, a remote desktop, a privacy mode — and a portfolio is
 * exactly the kind of page that gets opened on a locked-down work laptop. So the WebGL
 * stage is an upgrade over the CSS stage, never a replacement for it: both render the
 * same world through the same camera, and this file decides which one a visitor gets.
 *
 * Two details decide it, and both are easy to get wrong:
 *
 *   - It asks for WebGL 2 specifically. three.js dropped WebGL 1 in r163, so a machine
 *     that only offers WebGL 1 is a machine three cannot draw on at all.
 *   - It passes `failIfMajorPerformanceCaveat`. Without it a blocklisted GPU still
 *     hands back a context — a software rasteriser that would draw the world at a few
 *     frames a second. The CSS stage is far better than that, so a software context
 *     counts as no context.
 *
 * No three.js import here, or anywhere this is imported from: the shell has to decide
 * without paying for the library it may not use.
 */

import type { Quality } from './quality';

export type RendererKind = 'webgl' | 'css';

let available: boolean | null = null;

/**
 * `?renderer=webgl|css` forces one. The CSS stage is how the fallback gets tested on a
 * machine that has a perfectly good GPU, and forcing WebGL is how it gets tested on
 * one — a headless browser, say — that only has a software rasteriser.
 */
function forcedRenderer(): RendererKind | null {
  if (typeof location === 'undefined') return null;
  const value = new URLSearchParams(location.search).get('renderer');
  return value === 'webgl' || value === 'css' ? value : null;
}

/** True when this machine will hand over a hardware-accelerated WebGL 2 context. */
export function webglAvailable(): boolean {
  if (available !== null) return available;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
    });
    available = gl !== null;
    // Give the probe's context straight back: browsers cap how many can be live at
    // once, and the real stage is about to ask for one of its own.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    available = false;
  }
  return available;
}

/**
 * The WebGL stage lost its context and could not keep it, or failed to build. Every
 * later build in this session goes straight to CSS rather than trying again — a theme
 * switch should not mean a second blank frame on a machine that already said no.
 */
export function markWebglUnavailable(): void {
  available = false;
}

export function pickRenderer(quality: Quality): RendererKind {
  if (quality.tier === 'static') return 'css';
  const forced = forcedRenderer();
  if (forced === 'css') return 'css';
  // Forcing WebGL skips the performance caveat, but a machine that really cannot make
  // a context still gets the CSS stage rather than nothing.
  if (forced === 'webgl') return available === false ? 'css' : 'webgl';
  return webglAvailable() ? 'webgl' : 'css';
}
