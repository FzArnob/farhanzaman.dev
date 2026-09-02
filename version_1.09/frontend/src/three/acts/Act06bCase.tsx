import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import type { Project } from '../../types/profile';
import type { WorldLook } from '../materials/palette';
import { bandColor } from '../materials/palette';
import { CRIMSON, TEAL, TEAL_RGB, glowSprite } from '../materials/presets';
import { caseOpenState } from '../liveState';
import { WORLD, clamp01, smooth } from '../timeline';
import { useRemoteTexture } from '../useRemoteTexture';

/**
 * Act 05b — Core open.
 *
 * Click the front core and the camera flies through a facet into its interior. Inside:
 * `tech_stack` as satellite chips on orbits, `challenges` as glowing fracture lines in
 * the inner wall, and `media[]` on the chamber facets.
 *
 * This replaces the old /work?id= page with no route change and no reload — the same
 * fields, read from the same JSON, in a place instead of on a page.
 */

export { caseOpenState };

const _v = new THREE.Vector3();

export function Act06bCase({
  quality,
  look,
  envMap,
  project,
}: {
  quality: Quality;
  look: WorldLook;
  envMap: THREE.Texture | null;
  project: Project | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const chamberRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);
  const fractureRef = useRef<THREE.LineSegments>(null);
  const openRef = useRef(0);

  /** Chips are the tech stack, capped so a 20-item stack does not become confetti. */
  const stack = useMemo(() => {
    if (!project) return [];
    return String(project.tech_stack || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 18);
  }, [project]);

  /** Fracture lines: one per challenge sentence, drawn into the inner wall. */
  const challengeCount = useMemo(() => {
    if (!project) return 0;
    return Math.max(
      1,
      Math.min(
        8,
        String(project.challenges || '')
          .split(/[.;]\s+/)
          .filter((s) => s.trim().length > 8).length
      )
    );
  }, [project]);

  const chamberGeometry = useMemo(() => new THREE.IcosahedronGeometry(9, 1), []);
  useEffect(() => () => chamberGeometry.dispose(), [chamberGeometry]);

  const chamberMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // Seen from the inside, so the shell has to render its back faces.
        side: THREE.BackSide,
        roughness: 0.42,
        metalness: 0.3,
        envMapIntensity: 0.8,
        flatShading: true,
        transparent: true,
        opacity: 0,
      }),
    []
  );
  useEffect(() => {
    chamberMaterial.envMap = envMap;
    chamberMaterial.needsUpdate = true;
  }, [chamberMaterial, envMap]);
  useEffect(() => () => chamberMaterial.dispose(), [chamberMaterial]);

  const mediaTexture = useRemoteTexture(
    project?.media?.find((m) => m.media_type === 'Image')?.media_link ?? project?.logo_image ?? null
  );

  useEffect(() => {
    chamberMaterial.map = mediaTexture ?? null;
    chamberMaterial.color.setHex(mediaTexture ? 0xffffff : look.frameBack);
    chamberMaterial.needsUpdate = true;
  }, [chamberMaterial, mediaTexture, look.frameBack]);

  /** Fracture geometry: radial cracks on the inner wall, one per challenge. */
  const fractureGeometry = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < challengeCount; i++) {
      const a = (i / challengeCount) * Math.PI * 2;
      const tilt = -0.5 + (i / Math.max(1, challengeCount - 1)) * 1.0;
      // A jagged polyline across the shell, so it reads as a crack, not a meridian.
      let prev = new THREE.Vector3(Math.cos(a) * 8.8, tilt * 6, Math.sin(a) * 8.8);
      for (let s = 1; s <= 6; s++) {
        const wobble = ((s % 2 === 0 ? 1 : -1) * 0.5) / s;
        const aa = a + wobble * 0.16;
        const next = new THREE.Vector3(
          Math.cos(aa) * 8.8,
          tilt * 6 + s * 1.15 - 3.4,
          Math.sin(aa) * 8.8
        );
        points.push(prev.x, prev.y, prev.z, next.x, next.y, next.z);
        prev = next;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geo;
  }, [challengeCount]);
  useEffect(() => () => fractureGeometry.dispose(), [fractureGeometry]);

  const chipGeometry = useMemo(() => new THREE.BoxGeometry(0.9, 0.28, 0.1), []);
  useEffect(() => () => chipGeometry.dispose(), [chipGeometry]);

  const glow = useMemo(() => glowSprite(TEAL_RGB, 18, 0.34), []);
  useEffect(() => () => glow.material.dispose(), [glow]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // The whole chamber fades in as the camera arrives, so there is no hard cut.
    const want = project ? 1 : 0;
    openRef.current = THREE.MathUtils.damp(openRef.current, want, 3.4, delta);
    const open = openRef.current;
    caseOpenState.progress = open;
    group.visible = open > 0.004;
    if (!group.visible) return;

    const time = state.clock.elapsedTime;
    const eased = smooth(clamp01(open));

    chamberMaterial.opacity = eased * 0.96;
    if (chamberRef.current) chamberRef.current.rotation.y = time * 0.03;

    if (fractureRef.current) {
      const mat = fractureRef.current.material as THREE.LineBasicMaterial;
      // Fracture lines breathe: the challenges are live, not resolved.
      mat.opacity = eased * (0.45 + 0.35 * Math.sin(time * 1.4));
    }

    if (satellitesRef.current) {
      satellitesRef.current.rotation.y = time * 0.12;
      satellitesRef.current.children.forEach((chip, i) => {
        const orbit = 3.4 + (i % 3) * 1.5;
        const a = (i / Math.max(1, stack.length)) * Math.PI * 2 + time * (0.1 + (i % 3) * 0.05);
        const y = Math.sin(a * 1.6 + i) * 1.9;
        _v.set(Math.cos(a) * orbit, y, Math.sin(a) * orbit);
        chip.position.lerp(_v, 1 - Math.exp(-delta * 6));
        chip.lookAt(0, 0, 0);
        chip.scale.setScalar(eased);
        const mat = (chip as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = eased * 0.9;
      });
    }

    glow.material.opacity = eased * look.glow * 0.6;
  });

  if (!project) {
    // Still mounted so the fade-out can run; geometry is simply invisible.
    return <group ref={groupRef} visible={false} />;
  }

  return (
    <group ref={groupRef} position={[0, 0, WORLD.works.z - WORLD.works.radius]}>
      <mesh ref={chamberRef} geometry={chamberGeometry} material={chamberMaterial} />
      <primitive object={glow} />

      <lineSegments ref={fractureRef} geometry={fractureGeometry}>
        <lineBasicMaterial
          color={CRIMSON}
          transparent
          opacity={0}
          blending={look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <group ref={satellitesRef}>
        {stack.map((tech, i) => (
          <mesh key={`${tech}-${i}`} geometry={chipGeometry} scale={0}>
            <meshBasicMaterial
              color={bandColor(i / Math.max(1, stack.length - 1)).getHex()}
              transparent
              opacity={0}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight position={[0, 2, 0]} intensity={look.bloom ? 22 : 12} color={TEAL} distance={26} />
      <pointLight position={[3, -3, 2]} intensity={look.bloom ? 10 : 5} color={CRIMSON} distance={22} />
      {quality.transmission && <ambientLight intensity={0.3} />}
    </group>
  );
}
