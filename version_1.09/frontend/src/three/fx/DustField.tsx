import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { mulberry } from '../geometry/crystal';
import { glowTexture } from '../materials/presets';
import type { WorldLook } from '../materials/palette';
import { WORLD } from '../timeline';

/**
 * Volumetric dust. The void has no floor and no horizon, so this is the only thing
 * that gives the camera's travel a sense of speed and scale.
 *
 * Static geometry, one draw call, no per-frame work at all — the parallax comes free
 * from the camera moving through it.
 */
export function DustField({ quality, look }: { quality: Quality; look: WorldLook }) {
  const matRef = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const n = quality.dust;
    const rnd = mulberry(4421);
    const pos = new Float32Array(n * 3);
    const zSpan = Math.abs(WORLD.contact.z) + 16;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * 58;
      pos[i * 3 + 1] = (rnd() - 0.5) * 30;
      pos[i * 3 + 2] = 8 - rnd() * zSpan;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [quality.dust]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const m = matRef.current;
    if (!m) return;
    m.color.setHex(look.dust);
    m.opacity = look.dustOpacity;
    // Additive white over a near-white ground is invisible; Studio uses normal blending.
    m.blending = look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending;
    m.needsUpdate = true;
  }, [look]);

  if (quality.dust === 0) return null;
  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        size={0.075}
        sizeAttenuation
        transparent
        depthWrite={false}
        map={glowTexture('255,255,255', 1)}
        toneMapped={false}
      />
    </points>
  );
}
