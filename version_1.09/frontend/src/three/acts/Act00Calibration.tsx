import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { fzSurfaceSamples } from '../geometry/fzMonogram';
import { shardClaims } from '../fx/ShardPool';
import { boot } from '../liveState';
import { clamp01, smooth } from '../timeline';

/**
 * Act 00 — Calibration.
 *
 * Runs once, before t=0, in place of the old spinning-favicon preloader.
 *
 * Forty shards scattered through the void solve onto surface positions on the extruded
 * monogram and lock, while the crimson layer slides from a wide offset into its final
 * 6%-of-width register — the aberration resolving into focus. The mark assembling
 * itself out of the same shard pool that will carry the rest of the page is the
 * cheapest possible way to state the whole concept in under a second.
 *
 * It is never a toll booth: any click or key skips it, and a warm cache runs it short.
 */

export { boot };

const SHARDS = 40;
const _v = new THREE.Vector3();

export function Act00Calibration({ quality }: { quality: Quality }) {
  const elapsed = useRef(0);
  const samples = useMemo(() => fzSurfaceSamples(SHARDS, 11), []);

  useEffect(() => {
    const onSkip = () => boot.skip();
    window.addEventListener('pointerdown', onSkip, { once: true });
    window.addEventListener('keydown', onSkip, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onSkip);
      window.removeEventListener('keydown', onSkip);
    };
  }, []);

  useFrame((_state, delta) => {
    if (boot.done) return;
    elapsed.current += delta;

    // 900 ms cold, 400 ms once the data is already in hand, instant on a skip.
    const duration = boot.skipped ? 0.16 : boot.ready ? 0.4 : 0.9;
    boot.progress = clamp01(elapsed.current / duration);
    if (boot.progress >= 1) {
      boot.done = true;
      shardClaims.leases.clear();
      return;
    }

    if (quality.shards === 0) return;

    /**
     * The solve. Shards ease from wherever they were drifting onto their target vertex
     * on the mark — claimed, not created, so these are the same instances that will be
     * drifting through act 05 a moment later.
     */
    const k = smooth(boot.progress);
    const lanes = Math.min(SHARDS, quality.shards);
    for (let i = 0; i < lanes; i++) {
      _v.copy(samples[i]).multiplyScalar(1.75);
      shardClaims.leases.set(i, {
        target: _v.clone(),
        claim: k,
        // Shrink as they land, so the mark reads as solid rather than encrusted.
        scale: THREE.MathUtils.lerp(1.4, 0.28, k),
      });
    }
    // -2: publish leases before ShardPool (-1) consumes them.
  }, -2);

  return null;
}
