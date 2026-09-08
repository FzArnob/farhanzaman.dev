import * as THREE from 'three';

/**
 * Canvas labels for things that must sit *inside* the 3D depth buffer — a slab face, a
 * tile front, a gallery caption on a plinth. Anything that can live in front of the
 * whole canvas belongs in the DOM overlay instead, where it stays selectable and
 * readable by a screen reader.
 *
 * Textures are cached by their full draw signature and disposed by the caller's act.
 */

/*
  The flat site's faces, so 3D type and DOM type are the same type. Titillium Web is
  loaded from view/static as a local @font-face, which also means no webfont request
  on the critical path.
*/
const DISPLAY = '"titillium-font","Titillium Web",system-ui,sans-serif';
const BODY = '"titillium-font","Titillium Web",system-ui,sans-serif';
const MONO = 'ui-monospace,"SF Mono",Consolas,monospace';

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

  /*
    Quieter than it looks it should be. This is the inside of a prism, not a poster:
    it exists to give the glass something to bend, and the readable content is the
    logo plate suspended inside it. Turned up, it fought the plate and the copy.
  */
  for (let i = 0; i < 22; i++) {
    const crimson = rnd() > 0.7;
    g.fillStyle = `rgba(${crimson ? '253,33,85' : '0,211,180'},${0.05 + rnd() * 0.2})`;
    const w = 30 + rnd() * 190;
    const h = 8 + rnd() * 36;
    g.fillRect(rnd() * (512 - w), rnd() * (512 - h), w, h);
  }
  for (let i = 0; i < 4; i++) {
    g.strokeStyle = `rgba(0,211,180,${0.1 + rnd() * 0.16})`;
    g.lineWidth = 1 + rnd() * 1.5;
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
 * One expertise name, drawn as a word on a 4:1 canvas for the tag sphere.
 *
 * A stroke behind the fill is what keeps it readable wherever the sphere's rotation
 * happens to put it — over the void, over the particle net, or over a bright glow.
 * Titillium is the flat site's face, so the cloud reads as the same design.
 */
export function wordTexture(text: string, colour: string, light: boolean): THREE.CanvasTexture {
  const key = `word|${text}|${colour}|${light}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const W = 512;
  const H = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  g.clearRect(0, 0, W, H);
  g.textAlign = 'center';
  g.textBaseline = 'middle';

  // Shrink to fit rather than clip: "Business Communication" has to survive.
  let size = 74;
  do {
    g.font = `600 ${size}px ${BODY}`;
    if (g.measureText(text).width <= W - 26) break;
    size -= 3;
  } while (size > 22);

  g.lineWidth = Math.max(4, size * 0.14);
  g.strokeStyle = light ? 'rgba(255,255,255,0.92)' : 'rgba(4,7,9,0.92)';
  g.strokeText(text, W / 2, H / 2);
  g.fillStyle = colour;
  g.fillText(text, W / 2, H / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/**
 * A qualification block's face: institute, role, dates and — where there is room for
 * it — a line or two of what actually happened there.
 *
 * Unlike labelTexture this draws NO opaque panel. The block behind it is an irregular
 * extruded shape with a chamfered corner, and a rectangular plate of colour laid over
 * that would put the rectangle straight back. The scrim here fades out at its own
 * edges instead, so the silhouette the visitor reads is the block's, not the texture's.
 *
 * `detailLines` is the mobile lever. A portrait phone shows the same block at roughly
 * a third of the pixel width a desktop does, so the answer is fewer words at a larger
 * size rather than the same paragraph shrunk past legibility — the full history is one
 * tap away on /about either way.
 */
export interface PanelOpts {
  title: string;
  role: string;
  dates: string;
  detail?: string;
  accent: string;
  light: boolean;
  width?: number;
  height?: number;
  /** 0 disables the description entirely. */
  detailLines?: number;
  /** Multiplies every type size. Portrait passes >1. */
  typeScale?: number;
}

export function panelTexture(opts: PanelOpts): THREE.CanvasTexture {
  const {
    title,
    role,
    dates,
    detail = '',
    accent,
    light,
    width = 768,
    height = 384,
    detailLines = 2,
    typeScale = 1,
  } = opts;

  const key = [
    'panel', title, role, dates, detail, accent, light,
    width + 'x' + height, detailLines, typeScale,
  ].join('|');
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d')!;

  /*
    The scrim. Two gradients rather than a fill: a vertical one for the body and a
    horizontal one that dies off before the right edge, so no side of it ever lands
    as a straight line against the block behind.
  */
  const ink = light ? '255,255,255' : '6,12,14';
  const body = g.createLinearGradient(0, 0, 0, height);
  body.addColorStop(0, 'rgba(' + ink + ',' + (light ? 0.86 : 0.8) + ')');
  body.addColorStop(0.72, 'rgba(' + ink + ',' + (light ? 0.78 : 0.66) + ')');
  body.addColorStop(1, 'rgba(' + ink + ',0)');
  g.fillStyle = body;
  g.fillRect(0, 0, width, height);

  const sideways = g.createLinearGradient(0, 0, width, 0);
  sideways.addColorStop(0, 'rgba(' + ink + ',0.22)');
  sideways.addColorStop(0.62, 'rgba(' + ink + ',0)');
  g.fillStyle = sideways;
  g.fillRect(0, 0, width, height);

  const pad = Math.round(width * 0.075);
  const s = (n: number) => Math.round(height * n * typeScale);

  // The accent rule, inset so it reads as part of the card rather than the block edge.
  g.fillStyle = accent;
  g.fillRect(pad - Math.round(width * 0.028), Math.round(height * 0.16), 6, Math.round(height * 0.5));

  let y = Math.round(height * 0.29);
  g.textAlign = 'left';

  g.font = '600 ' + s(0.155) + 'px ' + DISPLAY;
  g.fillStyle = light ? '#111719' : '#f2f7f6';
  g.fillText(fit(g, title, width - pad * 2), pad, y);

  y += s(0.135);
  g.font = '600 ' + s(0.105) + 'px ' + DISPLAY;
  g.fillStyle = accent;
  g.fillText(fit(g, role, width - pad * 2), pad, y);

  y += s(0.115);
  g.font = '400 ' + s(0.085) + 'px ' + MONO;
  g.fillStyle = light ? '#5c6a67' : '#9db0ac';
  g.fillText(dates, pad, y);

  const trimmed = detail.trim();
  if (detailLines > 0 && trimmed) {
    y += s(0.12);
    g.font = '400 ' + s(0.082) + 'px ' + BODY;
    g.fillStyle = light ? '#3d4a48' : '#b9c6c3';
    for (const line of wrap(g, trimmed, width - pad * 2, detailLines)) {
      g.fillText(line, pad, y);
      y += s(0.105);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

/** Greedy word wrap, ellipsised on the last line it is allowed. */
function wrap(
  g: CanvasRenderingContext2D,
  text: string,
  max: number,
  maxLines: number
): string[] {
  const words = text.split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (g.measureText(next).width <= max) {
      line = next;
      continue;
    }
    lines.push(line || word);
    line = line ? word : '';
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  // Anything left over is signalled, not silently dropped.
  const used = lines.join(' ').length;
  if (used < text.length - 1 && lines.length) {
    lines[lines.length - 1] = fit(g, lines[lines.length - 1] + ' ' + text.slice(used).trim(), max);
  }
  return lines;
}


/** Frees every cached texture. Called when the stage unmounts. */
export function disposeLabelCache(): void {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
