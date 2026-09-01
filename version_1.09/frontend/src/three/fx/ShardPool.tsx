import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { mulberry } from '../geometry/facetedCore';
import { CRIMSON, TEAL, shardMaterial } from '../materials/presets';
import { useScrollRig } from '../ScrollRig';
import { WORLD, clamp01, ramp, smooth } from '../timeline';

/**
 * One instanced mesh of shards, allocated at boot and freed never.
 *
 * Acts do not create shards; they lease a slice of this pool and write matrices into
 * it. That is what makes the Forge's shatter-and-reassemble handoff possible at all —
 * the shards that fly off the outgoing project core are the same instances that build
 * the incoming one, so there is no allocation mid-transition and nothing pops in.
 *
 * Every Vector3/Quaternion/Matrix4 here is allocated once at module scope. Zero
 * garbage per frame means no GC stutter during a scroll.
 */

interface Shard {
  home: THREE.Vector3;
  euler: THREE.Vector3;
  spin: number;
  drift: number;
  scale: number;
  phase: number;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();
const _white = new THREE.Color(0xffffff);

/** Where a shard is leased to, per frame. Written by the acts that claim them. */
export interface ShardLease {
  /** Target position; the pool eases toward it. */
  target: THREE.Vector3;
  /** 0 = free drift, 1 = fully claimed. */
  claim: number;
  scale: number;
}

/**
 * Acts publish their claims here during useFrame, at priority -2. The pool reads
 * them at -1 and clears the map, so a lease only ever lasts one frame and a stale
 * claim cannot strand a shard mid-air.
 */
export const shardClaims: { leases: Map<number, ShardLease> } = { leases: new Map() };

export function ShardPool({ quality, envMap }: { quality: Quality; envMap: THREE.Texture | null }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const rig = useScrollRig();
  const count = quality.shards;

  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.16, 0), []);
  const material = useMemo(() => shardMaterial(), []);

  const shards = useMemo<Shard[]>(() => {
    const rnd = mulberry(9137);
    const list: Shard[] = [];
    // Spread through the whole travelled corridor so shards are already with you
    // wherever you are on the scroll, rather than fading in per act.
    const zSpan = Math.abs(WORLD.sync.z) + 12;
    for (let i = 0; i < count; i++) {
      list.push({
        home: new THREE.Vector3((rnd() - 0.5) * 34, (rnd() - 0.5) * 16, 6 - rnd() * zSpan),
        euler: new THREE.Vector3(rnd() * 6.283, rnd() * 6.283, rnd() * 6.283),
        spin: (rnd() - 0.5) * 0.5,
        drift: 0.3 + rnd() * 0.9,
        scale: 0.45 + rnd() * 1.15,
        phase: rnd() * 6.283,
      });
    }
    return list;
  }, [count]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const rnd = mulberry(4242);
    for (let i = 0; i < count; i++) {
      _c.setHex(rnd() > 0.74 ? CRIMSON : TEAL).lerp(_white, rnd() * 0.4);
      mesh.setColorAt(i, _c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // As in the lattice: instanceColor appears only once setColorAt has run, so the
    // material has to recompile for USE_INSTANCING_COLOR to be defined.
    material.needsUpdate = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }, [count, material]);

  useEffect(() => {
    material.envMap = envMap;
    material.needsUpdate = true;
  }, [material, envMap]);

  // -1: after the acts that lease shards (-2), before everything else.
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const t = rig.state.current.t;
    const time = state.clock.elapsedTime;

    // Act 08 pulls every shard in to write the address.
    const converge = ramp(t, 0.93, 1.0);
    const eased = smooth(converge);
    const syncZ = WORLD.sync.z + 1.6;

    for (let i = 0; i < count; i++) {
      const sh = shards[i];
      _p.copy(sh.home);
      _p.y += Math.sin(time * 0.22 * sh.drift + sh.phase) * 0.8;
      _p.x += Math.cos(time * 0.17 * sh.drift + sh.phase) * 0.7;

      let scale = sh.scale;
      const lease = shardClaims.leases.get(i);
      if (lease && lease.claim > 0) {
        const k = clamp01(lease.claim);
        _p.lerp(lease.target, k);
        scale = sh.scale * (1 - k) + lease.scale * k;
      }

      if (eased > 0) {
        // Ring in around the closing plate rather than collapsing to a point.
        _p.x = THREE.MathUtils.lerp(_p.x, Math.cos(sh.phase) * 7 * (1 - eased * 0.72), eased);
        _p.y = THREE.MathUtils.lerp(_p.y, 0.4 + Math.sin(sh.phase) * 2.1 * (1 - eased * 0.72), eased);
        _p.z = THREE.MathUtils.lerp(_p.z, syncZ, eased);
        scale = THREE.MathUtils.lerp(scale, sh.scale * 1.5, eased);
      }

      _e.set(sh.euler.x + time * sh.spin, sh.euler.y + time * sh.spin * 0.7, sh.euler.z);
      _q.setFromEuler(_e);
      _s.setScalar(scale);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Leases are per-frame: clear them so a stale claim cannot strand a shard.
    shardClaims.leases.clear();
  }, -1);

  if (count === 0) return null;
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
