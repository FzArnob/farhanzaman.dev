import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import type { Project } from '../../types/profile';
import { crystalGeometry, mulberry } from '../geometry/crystal';
import { coreFaceTexture } from '../materials/labels';
import type { WorldLook } from '../materials/palette';
import { CRIMSON, TEAL, TEAL_RGB, coreMaterial, glowSprite } from '../materials/presets';
import { shardClaims } from '../fx/ShardPool';
import { worksState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, clamp01, smooth } from '../timeline';
import { useTextureWindow } from '../useRemoteTexture';

/**
 * Act 06 — Works.
 *
 * The camera sits at the hub of a ring of crystal prisms, one per project, all facing
 * inward. Scroll turns the ring and brings one to front-centre at full size; the
 * particle net behind them is the flat site's own animation, so they hang inside a
 * live network rather than in an empty void.
 *
 * The home view carries the five most recent projects, ordered the way the flat site
 * orders them — newest contribution first. "View all N projects" grows the ring in
 * place: the camera eases back, the radius opens up and the remaining crystals fade
 * in between the existing ones. It stays one continuous scene rather than becoming a
 * separate page.
 *
 * The transition between crystals is the point of the act. The outgoing prism sheds
 * shards into the shared pool and those same instances reassemble as the incoming
 * one — one instanced mesh, constant count, no allocation mid-scroll.
 */

const HOME_COUNT = 5;

const _v = new THREE.Vector3();
const _target = new THREE.Vector3();

interface Crystal {
  project: Project;
  seed: number;
  geometry: THREE.BufferGeometry;
  shardFrom: number;
  shardCount: number;
}

/** Newest contribution first — "Present" counts as today. */
export function orderProjects(projects: Project[]): Project[] {
  const when = (p: Project) => {
    const raw = p.last_contribution_date;
    if (!raw || /present/i.test(raw)) return Date.now();
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };
  return [...projects].sort((a, b) => when(b) - when(a));
}

export function Act06Works({
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
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const logoRefs = useRef<THREE.Mesh[]>([]);
  const glowRefs = useRef<THREE.Sprite[]>([]);
  const act = ACT_BY_ID.works;
  // `as const` on WORLD makes the literal type 15, so this needs widening.
  const radiusRef = useRef<number>(WORLD.works.radius);

  const ordered = useMemo(() => orderProjects(projects), [projects]);

  const crystals = useMemo<Crystal[]>(() => {
    const perCrystal =
      quality.shards > 0 ? Math.floor(quality.shards / Math.max(1, ordered.length)) : 0;
    return ordered.map((project, i) => {
      const seed = Number(project.project_id) || i + 1;
      return {
        project,
        seed,
        geometry: crystalGeometry(seed, 2.5),
        shardFrom: i * perCrystal,
        shardCount: perCrystal,
      };
    });
  }, [ordered, quality.shards]);

  useEffect(() => () => crystals.forEach((c) => c.geometry.dispose()), [crystals]);

  const materials = useMemo(() => crystals.map(() => coreMaterial(quality)), [crystals, quality]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  useEffect(() => {
    materials.forEach((m) => {
      m.envMap = envMap;
      m.needsUpdate = true;
    });
  }, [materials, envMap]);

  const glows = useMemo(() => crystals.map(() => glowSprite(TEAL_RGB, 12, 0.4)), [crystals]);
  useEffect(() => () => glows.forEach((g) => g.material.dispose()), [glows]);

  /** Only the front project's artwork and its two neighbours stay resident. */
  const urls = useMemo(
    () => crystals.map((c) => c.project.logo_image || c.project.media?.[0]?.media_link || null),
    [crystals]
  );
  const textureAt = useTextureWindow(urls, worksState.index, 1);

  /*
    The crystal body always wears the seeded abstract: it gives the glass something
    to refract and it is the same every visit. The project's real logo goes on a
    billboard inside the crystal instead — mapped across six facets it came out as
    an unreadable smear, and the whole point of a prism is that you see through it.
  */
  useEffect(() => {
    materials.forEach((m, i) => {
      const next = coreFaceTexture(crystals[i].seed, !look.bloom);
      if (m.map !== next) {
        m.map = next;
        m.needsUpdate = true;
      }
    });
  }, [materials, crystals, look.bloom]);

  const logoMaterials = useMemo(
    () =>
      crystals.map(
        () =>
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            toneMapped: false,
          })
      ),
    [crystals]
  );
  useEffect(() => () => logoMaterials.forEach((m) => m.dispose()), [logoMaterials]);

  useEffect(() => {
    logoMaterials.forEach((m, i) => {
      const remote = textureAt(urls[i]);
      if (m.map !== remote) {
        m.map = remote ?? null;
        m.needsUpdate = true;
      }
    });
  }, [logoMaterials, textureAt, urls]);

  /** Where a crystal's shards scatter to mid-handoff. Seeded, so it repeats exactly. */
  const scatter = useMemo(() => {
    const rnd = mulberry(31337);
    return crystals.map(() =>
      Array.from(
        { length: 28 },
        () => new THREE.Vector3((rnd() - 0.5) * 9, (rnd() - 0.5) * 7, (rnd() - 0.5) * 9)
      )
    );
  }, [crystals]);

  useEffect(() => {
    worksState.total = ordered.length;
    worksState.shown = worksState.expanded ? ordered.length : Math.min(HOME_COUNT, ordered.length);
  }, [ordered.length]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.035, 0.045);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const ring = ringRef.current!;
    const time = state.clock.elapsedTime;
    const total = crystals.length;
    const shown = worksState.expanded ? total : Math.min(HOME_COUNT, total);
    worksState.shown = shown;
    worksState.total = total;

    // Expanding opens the ring rather than replacing it: same scene, more room.
    const wantRadius = WORLD.works.radius * (worksState.expanded ? 1.34 : 1);
    radiusRef.current = THREE.MathUtils.damp(radiusRef.current, wantRadius, 3, delta);
    const radius = radiusRef.current;
    const step = (Math.PI * 2) / Math.max(1, shown);

    const span = act.t1 - act.t0;
    const progress = clamp01((t - act.t0) / span) * Math.max(0, shown - 1);
    const index = Math.max(0, Math.min(shown - 1, Math.round(progress)));
    worksState.index = index;

    // Ease to the nearest index so a crystal is centred and full size for most of
    // the act, instead of every position being a half-way blur between two.
    const target = index * step;
    ring.rotation.y = THREE.MathUtils.damp(ring.rotation.y, target, 4.5, delta);

    const remaining = Math.abs(ring.rotation.y - target) / step;
    const handoff = clamp01(remaining);
    worksState.handoff = handoff;

    crystals.forEach((_crystal, i) => {
      const mesh = meshRefs.current[i];
      const glow = glowRefs.current[i];
      const material = materials[i];
      if (!mesh || !material) return;

      const visible = i < shown;
      if (!visible) {
        material.opacity = THREE.MathUtils.damp(material.opacity, 0, 5, delta);
        mesh.visible = material.opacity > 0.01;
        if (glow) glow.material.opacity = 0;
        return;
      }
      mesh.visible = true;

      // Position is recomputed every frame because both the radius and the count
      // can change while the act is on screen.
      const a = i * step;
      mesh.position.set(Math.sin(a) * radius, 0, -Math.cos(a) * radius);
      mesh.lookAt(0, 0, 0);
      if (glow) glow.position.copy(mesh.position).multiplyScalar(0.9);

      // Angular distance from dead ahead — exact, rather than inferred from scroll,
      // because the two disagree during the eased turn.
      let angle = a - ring.rotation.y;
      angle = Math.atan2(Math.sin(angle), Math.cos(angle));
      const near = clamp01(1 - Math.abs(angle) / step);

      const scale = THREE.MathUtils.lerp(0.42, 1.12, near * near) * (1 - handoff * 0.12 * near);
      mesh.scale.setScalar(scale);
      // The lookAt above sets the whole orientation, so the spin has to be re-applied.
      mesh.rotateY(time * 0.14 + i);
      mesh.rotateX(Math.sin(time * 0.2 + i) * 0.08);

      material.opacity = presence * THREE.MathUtils.lerp(0.3, 1, near) * (1 - handoff * 0.2 * near);
      if (glow) glow.material.opacity = presence * near * look.glow * 0.85;

      // The logo billboard: inside the crystal, always facing the camera, and only
      // legible on the crystal that is actually at the front.
      const logo = logoRefs.current[i];
      if (logo) {
        logo.position.copy(mesh.position);
        logo.quaternion.copy(state.camera.quaternion);
        const mat = logo.material as THREE.MeshBasicMaterial;
        const wanted = mat.map ? presence * near * near * 0.95 : 0;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, wanted, 6, delta);
        const tex = mat.map;
        if (tex && tex.image) {
          // Fit the plane to the logo's own aspect so nothing is stretched.
          const img = tex.image as { width?: number; height?: number };
          const aspect = (img.width || 1) / (img.height || 1);
          const h = 2 * scale;
          logo.scale.set(h * aspect, h, 1);
        }
      }
    });

    /**
     * The handoff: the two crystals either side of the boundary lease their shard
     * slices and the pool eases those instances out of the old prism, through a
     * seeded scatter, and back onto the new one. Nothing is created or destroyed.
     */
    if (quality.shards > 0 && handoff > 0.02 && shown > 1) {
      const spin = ring.rotation.y;
      const from = Math.max(0, Math.min(shown - 1, Math.round(progress + Math.sign(index - progress))));
      const out = crystals[from];
      const inn = crystals[index];
      if (out && inn && from !== index) {
        const worldOf = (slot: number, offset: THREE.Vector3, dst: THREE.Vector3) => {
          const a = slot * step;
          dst.set(Math.sin(a) * radius, 0, -Math.cos(a) * radius).add(offset);
          const x = dst.x * Math.cos(spin) + dst.z * Math.sin(spin);
          const z = -dst.x * Math.sin(spin) + dst.z * Math.cos(spin);
          dst.set(x, dst.y, z + WORLD.works.z);
          return dst;
        };
        const eased = smooth(1 - handoff);
        const lanes = Math.min(out.shardCount, scatter[from].length);
        for (let k = 0; k < lanes; k++) {
          const offset = scatter[from][k];
          worldOf(from, offset, _v);
          worldOf(index, offset, _target);
          _v.lerp(_target, eased);
          shardClaims.leases.set(out.shardFrom + k, {
            target: _v.clone(),
            claim: handoff,
            scale: 1.5,
          });
        }
      }
    }
  }, -2);

  return (
    <group ref={groupRef} position={[0, 0, WORLD.works.z]}>
      <group ref={ringRef}>
        {crystals.map((crystal, i) => (
          <group key={crystal.project.project_id}>
            <mesh
              ref={(el) => {
                if (el) meshRefs.current[i] = el;
              }}
              geometry={crystal.geometry}
              material={materials[i]}
              name={`crystal-${crystal.project.project_id}`}
              onClick={(event) => {
                event.stopPropagation();
                if (i === worksState.index) onOpen(crystal.project.project_id);
              }}
            />
            <mesh
              ref={(el) => {
                if (el) logoRefs.current[i] = el;
              }}
              material={logoMaterials[i]}
              renderOrder={2}
            >
              <planeGeometry args={[1, 1]} />
            </mesh>
            <primitive
              object={glows[i]}
              ref={(el: THREE.Sprite | null) => {
                if (el) glowRefs.current[i] = el;
              }}
            />
          </group>
        ))}
      </group>
      {/* Lights ride with the hub, so the front crystal is always the best lit. */}
      <pointLight position={[0, 3, -6]} intensity={look.bloom ? 26 : 12} color={TEAL} distance={44} />
      <pointLight position={[4, -2, -2]} intensity={look.bloom ? 14 : 7} color={CRIMSON} distance={38} />
    </group>
  );
}
