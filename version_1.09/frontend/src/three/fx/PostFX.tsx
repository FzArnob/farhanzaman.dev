import { Bloom, ChromaticAberration, EffectComposer, SMAA, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { ABERRATION } from '../geometry/fzMonogram';
import type { WorldLook } from '../materials/palette';

/**
 * Post-processing.
 *
 * The chromatic-aberration offset is not dialled in by eye. In the favicon the crimson
 * layer sits at (−3.854, +1.774) in the mark's own 100-unit space — about 6% of its
 * width, at 205°. That exact vector, scaled down to screen-space units, is the offset
 * here, so the whole scene's colour fringing is *measured from the logo* rather than
 * chosen. It is the same relationship the hero object states in geometry.
 *
 * Bloom is off on the Studio (light) theme: an additive glow over a near-white ground
 * is invisible and only costs frames. Studio reads through caustics and contact
 * shadows instead.
 */
export function PostFX({ quality, look }: { quality: Quality; look: WorldLook }) {
  /** The logo's offset in screen-space units, kept small enough to read as fringing. */
  const offset = useMemo(() => {
    const scale = 0.0016;
    return new THREE.Vector2(
      Math.cos(ABERRATION.angle) * ABERRATION.ratio * scale * 100,
      Math.sin(ABERRATION.angle) * ABERRATION.ratio * scale * 100
    );
  }, []);

  const bloom = quality.bloom && look.bloom;
  const aberration = quality.chromaticAberration;

  // Nothing to composite: skip the extra render target entirely.
  if (!bloom && !aberration && quality.tier === 'low') return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {bloom ? (
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.24}
          mipmapBlur
          radius={0.72}
        />
      ) : (
        <></>
      )}
      {aberration ? (
        <ChromaticAberration
          offset={offset}
          radialModulation
          modulationOffset={0.35}
          blendFunction={BlendFunction.NORMAL}
        />
      ) : (
        <></>
      )}
      {quality.tier === 'high' ? (
        <Vignette offset={0.32} darkness={look.bloom ? 0.62 : 0.28} eskil={false} />
      ) : (
        <></>
      )}
      {quality.antialias && quality.tier === 'high' ? <SMAA /> : <></>}
    </EffectComposer>
  );
}
