import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Education, Experience } from '../../types/profile';
import type { WorldLook } from '../materials/palette';
import { labelTexture } from '../materials/labels';
import { CRIMSON, TEAL, TEAL_RGB, glowSprite } from '../materials/presets';
import { spineFocus } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/**
 * Act 02 — The Spine.
 *
 * Time becomes depth. A node's Z is its normalised date and a slab's length is its
 * duration, so the corridor you fly down is a to-scale timeline. Education lines the
 * left wall, experience the right; they are simultaneous and comparable and never
 * fight for column width, which is the thing two stacked HTML timelines can't do.
 *
 * You arrive at *now* at the near end and stop there. The present is the destination.
 */

interface Slab {
  id: string;
  kind: 'education' | 'experience';
  title: string;
  sub: string;
  z: number;
  length: number;
  present: boolean;
}

export { spineFocus };

function year(date: string | null): number {
  if (!date) return new Date().getFullYear();
  const y = parseInt(String(date).slice(0, 4), 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

export function buildSpine(educations: Education[], experiences: Experience[]): Slab[] {
  const rows: Slab[] = [];
  const all = [
    ...educations.map((e) => ({ kind: 'education' as const, row: e })),
    ...experiences.map((e) => ({ kind: 'experience' as const, row: e })),
  ];

  // The corridor spans the whole career, oldest at the far end.
  const starts = all.map((a) => year(a.row.start_date));
  const ends = all.map((a) => (a.row.is_present === '1' ? new Date().getFullYear() : year(a.row.end_date)));
  const minYear = Math.min(...starts);
  const maxYear = Math.max(...ends);
  const span = Math.max(1, maxYear - minYear);

  const { zNear, zFar } = WORLD.background;
  for (const { kind, row } of all) {
    const from = year(row.start_date);
    const to = row.is_present === '1' ? new Date().getFullYear() : year(row.end_date);
    // Oldest → zFar, newest → zNear.
    const mid = (from + to) / 2;
    const k = (mid - minYear) / span;
    rows.push({
      id: `${kind}-${'education_id' in row ? row.education_id : row.experience_id}`,
      kind,
      title: row.institute_name,
      sub: `${from} → ${row.is_present === '1' ? 'now' : to}`,
      z: zFar + (zNear - zFar) * k,
      length: Math.max(1.1, ((to - from) / span) * 3.4 + 1.1),
      present: row.is_present === '1',
    });
  }
  return rows.sort((a, b) => a.z - b.z);
}

export function Act02Background({
  look,
  envMap,
  educations,
  experiences,
}: {
  look: WorldLook;
  envMap: THREE.Texture | null;
  educations: Education[];
  experiences: Experience[];
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const slabRefs = useRef<THREE.Group[]>([]);
  const act = ACT_BY_ID.background;

  const slabs = useMemo(() => buildSpine(educations, experiences), [educations, experiences]);

  const slabMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: look.slab,
        roughness: 0.55,
        metalness: 0.12,
        transparent: true,
        opacity: 0.9,
      }),
    [look.slab]
  );

  useEffect(() => {
    slabMaterial.envMap = envMap;
    slabMaterial.needsUpdate = true;
  }, [slabMaterial, envMap]);

  useEffect(() => () => slabMaterial.dispose(), [slabMaterial]);

  const cable = useMemo(() => {
    const { zNear, zFar } = WORLD.background;
    const length = Math.abs(zNear - zFar) + 6;
    const geo = new THREE.CylinderGeometry(0.014, 0.014, length, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: TEAL,
      transparent: true,
      opacity: 0.5,
      blending: look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(0, -0.7, (zNear + zFar) / 2);
    return mesh;
  }, [look.bloom]);

  useEffect(
    () => () => {
      cable.geometry.dispose();
      (cable.material as THREE.Material).dispose();
    },
    [cable]
  );

  const pulses = useMemo(() => [0, 1, 2].map(() => glowSprite(TEAL_RGB, 1.3, 0.95)), []);
  useEffect(() => () => pulses.forEach((p) => p.material.dispose()), [pulses]);

  /** Box and edge geometry per slab, built once — a slab's size never changes. */
  const shapes = useMemo(
    () =>
      slabs.map((slab) => {
        const box = new THREE.BoxGeometry(slab.length * 1.15, 1.15, 0.12);
        return { box, edges: new THREE.EdgesGeometry(box) };
      }),
    [slabs]
  );
  useEffect(
    () => () =>
      shapes.forEach((s) => {
        s.box.dispose();
        s.edges.dispose();
      }),
    [shapes]
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.04, 0.04);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const time = state.clock.elapsedTime;
    const camZ = state.camera.position.z;
    slabMaterial.opacity = presence * 0.9;
    (cable.material as THREE.MeshBasicMaterial).opacity = presence * 0.5;

    slabs.forEach((slab, i) => {
      const node = slabRefs.current[i];
      if (!node) return;
      // Each slab yaws to face you at closest approach, then falls back.
      const dist = Math.abs(camZ - slab.z);
      const near = clamp01(1 - dist / 12);
      const base = slab.kind === 'education' ? 0.44 : -0.44;
      const focused = spineFocus.id === slab.id;
      node.rotation.y = base * (1 - near * 0.85) + (focused ? -base * 0.3 : 0);
      const lift = near * 0.16 + (focused ? 0.3 : 0);
      node.position.y = 0.1 + lift;
      node.scale.setScalar(1 + near * 0.06 + (focused ? 0.1 : 0));
    });

    // Pulses travel toward you along the cable: the present is drawing closer.
    const { zNear, zFar } = WORLD.background;
    pulses.forEach((p, i) => {
      const u = (time * 0.19 + i / pulses.length) % 1;
      p.position.set(0, -0.7, zFar + (zNear - zFar) * u);
      p.material.opacity = presence * 0.9 * Math.sin(u * Math.PI) * look.glow;
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={cable} />
      {pulses.map((p, i) => (
        <primitive key={i} object={p} />
      ))}

      {slabs.map((slab, i) => {
        const isEdu = slab.kind === 'education';
        const x = isEdu ? -WORLD.background.wallX : WORLD.background.wallX;
        const accent = isEdu ? '#00d3b4' : '#fd2155';
        return (
          <group
            key={slab.id}
            ref={(el) => {
              if (el) slabRefs.current[i] = el;
            }}
            position={[x, 0.1, slab.z]}
          >
            <mesh geometry={shapes[i].box} material={slabMaterial} />
            {/* Edge wire in the wall's colour; a live edge if the role is current. */}
            <lineSegments geometry={shapes[i].edges}>
              <lineBasicMaterial
                color={isEdu ? TEAL : CRIMSON}
                transparent
                opacity={slab.present ? 0.95 : 0.5}
                toneMapped={false}
              />
            </lineSegments>
            <mesh position={[0, 0, 0.075]}>
              <planeGeometry args={[slab.length * 1.15 - 0.14, 0.98]} />
              <meshBasicMaterial
                map={labelTexture({
                  title: slab.title,
                  sub: slab.sub + (slab.present ? '  ●' : ''),
                  accent,
                  light: !look.bloom,
                  width: 640,
                  height: 160,
                })}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
