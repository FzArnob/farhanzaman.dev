import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

/**
 * Remote image → texture.
 *
 * The project media and gallery images live on live.staticflickr.com, which serves
 * `access-control-allow-origin: *`, so they can be uploaded to WebGL directly with
 * crossOrigin set. That was the plan's biggest open risk and it is measurably fine —
 * but a third-party CDN can still fail, so every caller renders correctly with a null
 * texture and the load is fire-and-forget.
 *
 * Images are downscaled through a canvas before upload: the originals are up to
 * several thousand pixels wide and a core facet never needs more than 1024.
 */

const MAX = 1024;
const cache = new Map<string, THREE.Texture>();
const pending = new Map<string, Promise<THREE.Texture | null>>();

function downscale(img: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  if (longest <= MAX) return img;
  const k = MAX / longest;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * k));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * k));
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function loadTexture(url: string): Promise<THREE.Texture | null> {
  const hit = cache.get(url);
  if (hit) return Promise.resolve(hit);
  const inflight = pending.get(url);
  if (inflight) return inflight;

  const job = new Promise<THREE.Texture | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      const source = downscale(img);
      const tex =
        source instanceof HTMLCanvasElement ? new THREE.CanvasTexture(source) : new THREE.Texture(source);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.needsUpdate = true;
      cache.set(url, tex);
      pending.delete(url);
      resolve(tex);
    };
    img.onerror = () => {
      // A missing image is not an error worth breaking the scene over.
      pending.delete(url);
      resolve(null);
    };
    img.src = url;
  });

  pending.set(url, job);
  return job;
}

/** One texture, loaded when `url` becomes non-empty. */
export function useRemoteTexture(url: string | null | undefined): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(() => (url ? cache.get(url) ?? null : null));

  useEffect(() => {
    if (!url) {
      setTex(null);
      return;
    }
    const known = cache.get(url);
    if (known) {
      setTex(known);
      return;
    }
    let live = true;
    loadTexture(url).then((t) => {
      if (live) setTex(t);
    });
    return () => {
      live = false;
    };
  }, [url]);

  return tex;
}

/**
 * A window of textures around an index — only the active item and its neighbours are
 * resident, which is how the texture-memory ceiling is held with 83 clips and 61
 * images in the data.
 */
export function useTextureWindow(urls: (string | null | undefined)[], index: number, radius = 1) {
  const [, bump] = useState(0);
  const wanted = useMemo(() => {
    const out: string[] = [];
    for (let d = -radius; d <= radius; d++) {
      const i = (index + d + urls.length) % urls.length;
      const url = urls[i];
      if (url) out.push(url);
    }
    return out;
  }, [urls, index, radius]);

  useEffect(() => {
    let live = true;
    Promise.all(wanted.map(loadTexture)).then(() => {
      if (live) bump((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [wanted]);

  return (url: string | null | undefined) => (url ? cache.get(url) ?? null : null);
}

/** Frees every cached remote texture. Called when the stage unmounts. */
export function disposeTextureCache(): void {
  cache.forEach((t) => t.dispose());
  cache.clear();
}
