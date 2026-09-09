/**
 * The two worlds, as CSS.
 *
 * These are the same numbers the WebGL stage used (src/three/materials/palette.ts in
 * v1.09.0), converted from three's units to the ones a stylesheet can consume: colours
 * as strings, light intensities folded into the alpha of a gradient. Nothing about the
 * look changed in the port — Void is still lit from inside and carried by glow, Studio
 * still lit from outside with the glow turned almost off, because an additive-looking
 * highlight over a near-white ground is invisible either way it is drawn.
 *
 * The palette is the site's existing theme and has no third hue:
 *   #00d3b4  signal teal      (theme primary)
 *   #fd2155  split crimson    (theme secondary)
 *   #00947f  light-mode teal  (already in view/css/theme/light.css for contrast)
 */

export interface WorldLook {
  /** The ground the stage paints, which is also the colour distance fades toward. */
  background: string;
  /** Linear fog, in world units. Distance fade is applied as opacity. */
  fogNear: number;
  fogFar: number;
  /** Multiplier on every glow in the scene. */
  glow: number;
  /** Frosted panel fill — timeline blocks, certificate tiles. */
  slab: string;
  /** The back of a framed thing. */
  frameBack: string;
  /** Ink on a slab face, and the two quieter ranks under it. */
  ink: string;
  ink2: string;
  ink3: string;
  /** Dust colour and its opacity ceiling. */
  dust: string;
  dustOpacity: number;
  /** Glass body of the mark and of a project core. */
  glass: string;
  glassEdge: string;
  /** True in Void: additive-style highlights read, so they are drawn. */
  bloom: boolean;
}

export const TEAL = '#00d3b4';
export const CRIMSON = '#fd2155';
export const TEAL_RGB = '0,211,180';
export const CRIMSON_RGB = '253,33,85';

export const VOID_LOOK: WorldLook = {
  background: '#06080a',
  fogNear: 26,
  fogFar: 108,
  glow: 1,
  slab: 'rgba(27,36,39,0.92)',
  frameBack: '#0b1114',
  ink: '#e9efee',
  ink2: '#93a29f',
  ink3: '#6d7c79',
  dust: '255,255,255',
  dustOpacity: 0.58,
  glass: TEAL,
  glassEdge: 'rgba(233,240,238,0.9)',
  bloom: true,
};

export const STUDIO_LOOK: WorldLook = {
  background: '#eef2f1',
  fogNear: 30,
  fogFar: 128,
  glow: 0.22,
  slab: 'rgba(243,248,247,0.94)',
  frameBack: '#ffffff',
  ink: '#111719',
  ink2: '#5c6a67',
  ink3: '#75817d',
  dust: '92,122,118',
  dustOpacity: 0.3,
  glass: '#00947f',
  glassEdge: 'rgba(17,23,25,0.75)',
  bloom: false,
};

export function lookFor(light: boolean): WorldLook {
  return light ? STUDIO_LOOK : VOID_LOOK;
}

/** A soft radial glow, as a background image. The only "sprite" the stage needs. */
export function glowGradient(rgb: string, peak = 0.5): string {
  return (
    `radial-gradient(closest-side, rgba(${rgb},${peak}) 0%, ` +
    `rgba(${rgb},${(peak * 0.26).toFixed(3)}) 38%, rgba(${rgb},0) 100%)`
  );
}

/**
 * A beam: full strength at its origin, gone by the far end. The WebGL build drew this
 * as a 128×1 alpha ramp on a plane; it is the same ramp, as a gradient.
 */
export function beamGradient(colour: string): string {
  return `linear-gradient(90deg, ${colour} 0%, ${colour}8c 45%, ${colour}00 100%)`;
}
