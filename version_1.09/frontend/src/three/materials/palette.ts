import * as THREE from 'three';
import { bandValue } from '../../lib/band';

/**
 * The palette is the site's existing theme, unchanged.
 *   #00d3b4  signal teal      (theme primary)
 *   #fd2155  split crimson    (theme secondary)
 *   #00947f  light-mode teal  (already in view/css/theme/light.css for contrast)
 *
 * The dispersion band between the two ends is used for hairlines, beams and node
 * glows only — never for a surface and never for text.
 */
export const TEAL = 0x00d3b4;
export const CRIMSON = 0xfd2155;
export const TEAL_INK_LIGHT = 0x00947f;

/**
  * Colour at a position on the dispersion band, as a THREE.Color. The interpolation
  * itself lives in lib/band.ts so the DOM overlay can use it without importing three.
  */
export function bandColor(band: number, target = new THREE.Color()): THREE.Color {
  return target.setHex(bandValue(band));
}

/**
 * The two worlds.
 *
 * Void (dark) lights the glass from inside and lets bloom carry it. Studio (light)
 * lights it from outside and lets the caustics carry it — bloom is off there, because
 * an additive glow over a near-white ground is invisible and only costs frames.
 */
export interface WorldLook {
  background: number;
  fogNear: number;
  fogFar: number;
  ambient: number;
  keyIntensity: number;
  rimIntensity: number;
  fillIntensity: number;
  exposure: number;
  /** Multiplier on every additive element. */
  glow: number;
  slab: number;
  dust: number;
  dustOpacity: number;
  frameBack: number;
  bloom: boolean;
}

export const VOID_LOOK: WorldLook = {
  background: 0x06080a,
  fogNear: 26,
  fogFar: 108,
  ambient: 0.5,
  keyIntensity: 2.4,
  rimIntensity: 1.7,
  fillIntensity: 1.1,
  exposure: 1.15,
  glow: 1,
  slab: 0x1b2427,
  dust: 0xffffff,
  dustOpacity: 0.58,
  frameBack: 0x0b1114,
  bloom: true,
};

export const STUDIO_LOOK: WorldLook = {
  background: 0xeef2f1,
  fogNear: 30,
  fogFar: 128,
  ambient: 1.3,
  keyIntensity: 1.5,
  rimIntensity: 1.0,
  fillIntensity: 1.7,
  exposure: 0.95,
  glow: 0.22,
  slab: 0xf3f8f7,
  dust: 0x5c7a76,
  dustOpacity: 0.3,
  frameBack: 0xffffff,
  bloom: false,
};

export function lookFor(light: boolean): WorldLook {
  return light ? STUDIO_LOOK : VOID_LOOK;
}

/**
 * A procedural equirectangular environment: a vertical ground gradient with a teal
 * blob, a crimson blob and a white key. Cheap to build, no HDR to download, and it
 * puts the brand colours into every reflection and refraction in the scene.
 */
export function buildEnvTexture(light: boolean): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext('2d')!;

  const base = g.createLinearGradient(0, 0, 0, 256);
  if (light) {
    base.addColorStop(0, '#ffffff');
    base.addColorStop(0.5, '#e9efee');
    base.addColorStop(1, '#ccd8d5');
  } else {
    base.addColorStop(0, '#10191d');
    base.addColorStop(0.52, '#040709');
    base.addColorStop(1, '#0b1114');
  }
  g.fillStyle = base;
  g.fillRect(0, 0, 512, 256);

  const blob = (cx: number, cy: number, r: number, rgb: string, alpha: number) => {
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(${rgb},${alpha})`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  blob(130, 92, 132, '0,211,180', light ? 0.55 : 1);
  blob(372, 152, 122, '253,33,85', light ? 0.38 : 0.72);
  blob(252, 20, 92, '255,255,255', light ? 0.85 : 0.42);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
