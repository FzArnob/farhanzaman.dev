import * as THREE from 'three';

/**
 * Canvas labels for things that must sit *inside* the 3D depth buffer — a slab face, a
 * tile front, a gallery caption on a plinth. Anything that can live in front of the
 * whole canvas belongs in the DOM overlay instead, where it stays selectable and
 * readable by a screen reader.
 *
 * Textures are cached by their full draw signature and disposed by the caller's act.
 */

const DISPLAY = '"Chakra Petch","Titillium Web",system-ui,sans-serif';
const MONO = '"IBM Plex Mono",ui-monospace,monospace';

export interface LabelOpts {
  title: string;
  sub?: string;
  accent: string;
  light: boolean;
  /** Aspect of the plane this maps to, so text is never stretched. */
  width?: number;
  height?: number;
  align?: 'left' | 'center';
}

const cache = new Map<string, THREE.CanvasTexture>();

export function labelTexture(opts: LabelOpts): THREE.CanvasTexture {
  const {
    title,
    sub = '',
    accent,
    light,
    width = 512,
    height = 128,
    align = 'left',
  } = opts;
  const key = `${title}|${sub}|${accent}|${light}|${width}x${height}|${align}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d')!;

  g.fillStyle = light ? 'rgba(255,255,255,0.93)' : 'rgba(10,16,19,0.88)';
  g.fillRect(0, 0, width, height);
  // The accent stripe is the only place the band colour touches a surface.
  g.fillStyle = accent;
  g.fillRect(0, 0, 5, height);

  const pad = align === 'center' ? width / 2 : 26;
  g.textAlign = align;
  const titleSize = Math.round(height * 0.32);
  g.font = `600 ${titleSize}px ${DISPLAY}`;
  g.fillStyle = light ? '#111719' : '#e9efee';
  g.fillText(fit(g, title, width - pad - 20), pad, height * 0.46);

  if (sub) {
    const subSize = Math.round(height * 0.19);
    g.font = `400 ${subSize}px ${MONO}`;
    g.fillStyle = light ? '#5c6a67' : '#93a29f';
    g.fillText(fit(g, sub, width - pad - 20), pad, height * 0.76);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Trims with an ellipsis rather than letting a long institute name overflow. */
function fit(g: CanvasRenderingContext2D, text: string, max: number): string {
  if (g.measureText(text).width <= max) return text;
  let out = text;
  while (out.length > 4 && g.measureText(out + '…').width > max) out = out.slice(0, -1);
  return out + '…';
}

/**
 * Stands in for a project's artwork on the facets of its core. The real logo_image and
 * media[] load over this once they arrive; until then it is a seeded abstract that
 * still reads as "screen content" rather than a grey placeholder.
 *
 * No text: an icosahedron's UVs are per-face, so type mapped onto it arrives
 * fragmented and mirrored. Copy belongs in the DOM rail.
 */
export function coreFaceTexture(seed: number, light: boolean): THREE.CanvasTexture {
  const key = `core|${seed}|${light}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const g = canvas.getContext('2d')!;
  let s = (seed * 104729 + 7) >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

  const bg = g.createLinearGradient(0, 0, 512, 512);
  if (light) {
    bg.addColorStop(0, '#dde8e6');
    bg.addColorStop(1, '#f6faf9');
  } else {
    bg.addColorStop(0, '#06181c');
    bg.addColorStop(1, '#170a11');
  }
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 34; i++) {
    const crimson = rnd() > 0.66;
    g.fillStyle = `rgba(${crimson ? '253,33,85' : '0,211,180'},${0.12 + rnd() * 0.55})`;
    const w = 26 + rnd() * 210;
    const h = 8 + rnd() * 44;
    g.fillRect(rnd() * (512 - w), rnd() * (512 - h), w, h);
  }
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = `rgba(0,211,180,${0.22 + rnd() * 0.42})`;
    g.lineWidth = 1 + rnd() * 2;
    g.beginPath();
    g.moveTo(0, rnd() * 512);
    g.lineTo(512, rnd() * 512);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/**
 * The closing plate: the beam writes the invitation.
 *
 * The address deliberately is NOT here. The DOM overlay carries it as a real
 * mailto link — selectable, clickable, readable by a screen reader — and printing
 * it in the texture as well just put two copies of the same words on top of each
 * other. The beam gets the line that is pure payoff; the DOM keeps the content.
 */
export function addressTexture(headline: string, light: boolean): THREE.CanvasTexture {
  const key = `addr|${headline}|${light}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 320;
  const g = canvas.getContext('2d')!;
  g.clearRect(0, 0, 2048, 320);
  g.textAlign = 'center';

  g.font = `700 168px ${DISPLAY}`;
  g.fillStyle = light ? '#0f1618' : '#ffffff';
  g.shadowColor = '#00d3b4';
  g.shadowBlur = light ? 0 : 46;
  g.fillText(headline.toUpperCase(), 1024, 216);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Frees every cached texture. Called when the stage unmounts. */
export function disposeLabelCache(): void {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
