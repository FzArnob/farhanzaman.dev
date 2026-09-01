import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import type { Project } from '../../types/profile';
import { facetedCoreGeometry, mulberry } from '../geometry/facetedCore';
import { coreFaceTexture } from '../materials/labels';
import type { WorldLook } from '../materials/palette';
import { CRIMSON, TEAL, TEAL_RGB, coreMaterial, glowSprite } from '../materials/presets';
import { shardClaims } from '../fx/ShardPool';
import { forgeState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, clamp01, smooth } from '../timeline';
import { useTextureWindow } from '../useRemoteTexture';

/**
 * Act 05 — The Forge.
 *
 * The camera flies INSIDE a 28-unit ring carrying one faceted core per project, all
 * facing inward. You sit at the hub and the ring turns around you, indexing one core
 * to front-centre at full scale. Each core's silhouette is seeded from its project_id,
 * so all eight are distinct but obviously one family.
 *
 * The transition is the point. The outgoing core shatters into the shared shard pool
 * and those exact shards reassemble as the incoming one — one instanced mesh, constant
 * count, zero allocation. The shards have been drifting with the camera since act 00,
 * so the handoff never pops in, which is the thing a hard swap cannot do.
 */

export { forgeState };

const _v = new THREE.Vector3();
const _target = new THREE.Vector3();

interface Core {
  project: Project;
  seed: number;
  angle: number;
  home: THREE.Vector3;
  geometry: THREE.BufferGeometry;
  /** Shard slice this core leases during a handoff. */
  shardFrom: number;
  shardCount: number;
}

export function Act05Forge({
  quality,
  look,
  envMap,
  projects,
  onOpen,
}: {
  quality: Quality;
  look: WorldLook;
  envMap: THREE.Texture | null;
  projects: Project[];
  onOpen: (id: string) => void;
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const coreRefs = useRef<THREE.Mesh[]>([]);
  const glowRefs = useRef<THREE.Sprite[]>([]);
  const act = ACT_BY_ID.forge;

  const cores = useMemo<Core[]>(() => {
    const count = projects.length;
    // The shard pool is split evenly between cores so a handoff always has instances.
    const perCore = quality.shards > 0 ? Math.floor(quality.shards / Math.max(1, count)) : 0;
    return projects.map((project, i) => {
      const angle = (i / count) * Math.PI * 2;
      const seed = Number(project.project_id) || i + 1;
      return {
        project,
        seed,
        angle,
        // Ring lies in the XZ plane: angle 0 sits directly ahead of the hub camera.
        home: new THREE.Vector3(
          Math.sin(angle) * WORLD.forge.radius,
          0,
          -Math.cos(angle) * WORLD.forge.radius
        ),
        geometry: facetedCoreGeometry(seed, 3.2, 0),
        shardFrom: i * perCore,
        shardCount: perCore,
      };
    });
  }, [projects, quality.shards]);

  useEffect(() => () => cores.forEach((c) => c.geometry.dispose()), [cores]);

  const materials = useMemo(() => cores.map(() => coreMaterial(quality)), [cores, quality]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  useEffect(() => {
    materials.forEach((m) => {
      m.envMap = envMap;
      m.needsUpdate = true;
    });
  }, [materials, envMap]);

  const glows = useMemo(() => cores.map(() => glowSprite(TEAL_RGB, 13, 0.42)), [cores]);
  useEffect(() => () => glows.forEach((g) => g.material.dispose()), [glows]);

  /**
   * Only the active core's artwork and its two neighbours are resident. The seeded
   * abstract stands in until the real image arrives, so a facet is never blank.
   */
  const urls = useMemo(
    () => cores.map((c) => c.project.logo_image || c.project.media?.[0]?.media_link || null),
    [cores]
  );
  const textureAt = useTextureWindow(urls, forgeState.index, 1);

  useEffect(() => {
    materials.forEach((m, i) => {
      const remote = textureAt(urls[i]);
      const next = remote ?? coreFaceTexture(cores[i].seed, !look.bloom);
      if (m.map !== next) {
        m.map = next;
        m.needsUpdate = true;
      }
    });
  }, [materials, textureAt, urls, cores, look.bloom]);

  /** Where each core's shards scatter to mid-handoff. Seeded, so it is repeatable. */
  const scatter = useMemo(() => {
    const rnd = mulberry(31337);
    return cores.map(() =>
      Array.from({ length: 32 }, () => new THREE.Vector3((rnd() - 0.5) * 9, (rnd() - 0.5) * 7, (rnd() - 0.5) * 9))
    );
  }, [cores]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.03, 0.04);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const ring = ringRef.current!;
    const time = state.clock.elapsedTime;
    const count = cores.length;

    /**
     * Scroll maps to a continuous ring position. The camera is held at the hub for the
     * whole act by the spline, so this rotation is the only thing that moves — which is
     * why indexing has to feel like the ring turning, not like a carousel snapping.
     */
    const span = act.t1 - act.t0;
    const progress = clamp01((t - act.t0) / span) * (count - 1);
    const index = Math.max(0, Math.min(count - 1, Math.round(progress)));
    forgeState.index = index;

    // Ease to the nearest index rather than tracking scroll linearly, so a core is
    // centred and full size for most of the act instead of every position being a
    // half-way blur between two.
    const step = (Math.PI * 2) / count;
    // +index, not -index: rotating the ring by θ moves a core from angle a to a−θ.
    const target = index * step;
    ring.rotation.y = THREE.MathUtils.damp(ring.rotation.y, target, 4.5, delta);

    // How far the ring still has to turn, 0..1 — this IS the handoff.
    const remaining = Math.abs(ring.rotation.y - target) / step;
    const handoff = clamp01(remaining) * (count > 1 ? 1 : 0);
    forgeState.handoff = handoff;

    cores.forEach((_core, i) => {
      const mesh = coreRefs.current[i];
      const glow = glowRefs.current[i];
      const material = materials[i];
      if (!mesh || !material) return;

      // Angular distance from dead ahead, so "near" is exact rather than inferred
      // from the scroll — the two disagree during the eased turn.
      let angle = i * step - ring.rotation.y;
      angle = Math.atan2(Math.sin(angle), Math.cos(angle));
      const near = clamp01(1 - Math.abs(angle) / step);

      const scale = THREE.MathUtils.lerp(0.34, 1.05, near * near) * (1 - handoff * 0.14 * near);
      mesh.scale.setScalar(scale);
      mesh.rotation.y += delta * (0.1 + near * 0.28);
      mesh.rotation.x = Math.sin(time * 0.2 + i) * 0.1;

      material.opacity = presence * THREE.MathUtils.lerp(0.26, 1, near) * (1 - handoff * 0.22 * near);
      if (glow) glow.material.opacity = presence * near * look.glow * 0.9;
    });

    /**
     * The handoff. The two cores either side of the boundary lease their shard slices
     * and the pool eases those instances from the outgoing core, out through a seeded
     * scatter, and back in onto the incoming one. Nothing is created or destroyed.
     */
    if (quality.shards > 0 && handoff > 0.02) {
      // The shards travel from whichever core is leaving to the one arriving.
      const from = Math.max(0, Math.min(count - 1, Math.round(progress - Math.sign(progress - index) * 0.5)));
      const to = index;
      const out = cores[from];
      const inn = cores[to];
      if (out && inn) {
        // Ring rotation has to be applied by hand: the pool writes world matrices.
        const spin = ring.rotation.y;
        const worldOf = (core: Core, offset: THREE.Vector3, target: THREE.Vector3) => {
          target.copy(core.home).add(offset);
          const x = target.x * Math.cos(spin) + target.z * Math.sin(spin);
          const z = -target.x * Math.sin(spin) + target.z * Math.cos(spin);
          target.set(x, target.y, z + WORLD.forge.z);
          return target;
        };

        const eased = smooth(1 - handoff);
        const lanes = Math.min(out.shardCount, scatter[from].length);
        for (let k = 0; k < lanes; k++) {
          const offset = scatter[from][k];
          // Out of the old core, through the scatter, into the new one.
          worldOf(out, offset, _v);
          worldOf(inn, offset, _target);
          _v.lerp(_target, eased);
          shardClaims.leases.set(out.shardFrom + k, {
            target: _v.clone(),
            claim: handoff,
            scale: 1.6,
          });
        }
      }
    }
    // -2: publish leases before ShardPool (-1) consumes them.
  }, -2);

  return (
    <group ref={groupRef} position={[0, 0, WORLD.forge.z]}>
      <group ref={ringRef}>
        {cores.map((core, i) => (
          <group key={core.project.project_id}>
            <mesh
              ref={(el) => {
                if (el) coreRefs.current[i] = el;
              }}
              geometry={core.geometry}
              material={materials[i]}
              position={core.home}
              // Faces inward, toward the camera at the hub.
              onUpdate={(self) => self.lookAt(0, 0, 0)}
              name={`core-${core.project.project_id}`}
              onClick={(event) => {
                event.stopPropagation();
                if (i === forgeState.index) onOpen(core.project.project_id);
              }}
            />
            <primitive
              object={glows[i]}
              ref={(el: THREE.Sprite | null) => {
                if (el) glowRefs.current[i] = el;
              }}
              position={core.home.clone().multiplyScalar(0.94)}
            />
          </group>
        ))}
        {/* The ring itself, as a hairline, so the eight positions read as one system. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[WORLD.forge.radius, 0.02, 3, 96]} />
          <meshBasicMaterial color={0x9a63fb} transparent opacity={0.28} toneMapped={false} />
        </mesh>
      </group>
      {/* Lights ride with the hub so the front core is always the best lit. */}
      <pointLight position={[0, 3, -6]} intensity={look.bloom ? 26 : 12} color={TEAL} distance={40} />
      <pointLight position={[4, -2, -2]} intensity={look.bloom ? 14 : 7} color={CRIMSON} distance={36} />
    </group>
  );
}
