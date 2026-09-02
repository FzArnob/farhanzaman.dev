import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Skill } from '../../types/profile';
import { bladeGeometry } from '../geometry/crystal';
import { bandColor, type WorldLook } from '../materials/palette';
import { CRIMSON, TEAL } from '../materials/presets';
import { turbineState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/**
 * Act 04 — The Turbine.
 *
 * 12 glass blades radiating from a hub, viewed near on-axis. Blade LENGTH is the
 * skill's percentage and blade TWIST is its duration, so two variables live in one
 * mark — a bar chart would have needed a second chart for the second number, and all
 * 12 values are comparable in a single glance instead of 12 rows of scrolling.
 *
 * Whichever blade reaches the top reads out into the DOM overlay.
 */

export { turbineState };

export function Act04Turbine({
  look,
  envMap,
  skills,
}: {
  look: WorldLook;
  envMap: THREE.Texture | null;
  skills: Skill[];
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const bladeRefs = useRef<THREE.Mesh[]>([]);
  const act = ACT_BY_ID.skills;

  const blades = useMemo(
    () =>
      skills.map((skill, i) => {
        const percentage = clamp01(Number(skill.percentage) / 100);
        const months = Number(skill.duration) || 0;
        // 50–88% across the data; remap so the spread is legible rather than literal.
        const length = 1.5 + percentage * WORLD.skills.radius * 0.85;
        // 8–36 months; a half-turn at the tip is as much twist as reads cleanly.
        const twist = (Math.min(months, 36) / 36) * Math.PI * 0.55;
        return {
          id: skill.skill_id,
          name: skill.name,
          description: skill.description,
          percentage: Number(skill.percentage),
          months,
          angle: (i / skills.length) * Math.PI * 2,
          geometry: bladeGeometry(length, 0.3 + percentage * 0.16, twist),
          length,
        };
      }),
    [skills]
  );

  useEffect(() => () => blades.forEach((b) => b.geometry.dispose()), [blades]);

  const bladeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.18,
        metalness: 0.4,
        envMapIntensity: 1.7,
        flatShading: true,
        transparent: true,
        opacity: 0.95,
      }),
    []
  );
  useEffect(() => {
    bladeMaterial.envMap = envMap;
    bladeMaterial.needsUpdate = true;
  }, [bladeMaterial, envMap]);
  useEffect(() => () => bladeMaterial.dispose(), [bladeMaterial]);

  const hubMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x0d1518,
        roughness: 0.3,
        metalness: 0.6,
        transparent: true,
      }),
    []
  );
  useEffect(() => () => hubMaterial.dispose(), [hubMaterial]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.035, 0.035);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const rotor = rotorRef.current!;
    const time = state.clock.elapsedTime;

    /**
     * Scroll indexes the readout blade. The rotor turns so the indexed blade sits at
     * 12 o'clock — the readout position — rather than spinning freely, so the number
     * in the DOM always matches the blade the visitor is looking at.
     */
    const progress = clamp01((t - act.t0) / (act.t1 - act.t0));
    const index = turbineState.frozen
      ? turbineState.index
      : Math.min(blades.length - 1, Math.floor(progress * blades.length));
    turbineState.index = index;

    const targetRotation = -blades[index].angle;
    rotor.rotation.z = THREE.MathUtils.damp(rotor.rotation.z, targetRotation, 5, delta);
    // A slight wobble keeps the assembly from reading as a static diagram.
    rotor.rotation.x = Math.sin(time * 0.4) * 0.05;
    rotor.rotation.y = Math.cos(time * 0.31) * 0.06;

    bladeMaterial.opacity = presence * 0.95;
    hubMaterial.opacity = presence;

    blades.forEach((_blade, i) => {
      const mesh = bladeRefs.current[i];
      if (!mesh) return;
      const isActive = i === index;
      const target = isActive ? 1.1 : 0.9;
      mesh.scale.setScalar(THREE.MathUtils.damp(mesh.scale.x, target, 6, delta));
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, WORLD.skills.z]}>
      <group ref={rotorRef}>
        {blades.map((blade, i) => (
          <group key={blade.id} rotation={[0, 0, blade.angle]}>
            <mesh
              ref={(el) => {
                if (el) bladeRefs.current[i] = el;
              }}
              geometry={blade.geometry}
              material={bladeMaterial}
              // The blade's own +Z is its length; stand it up in the rotor plane.
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, blade.length / 2 + 0.35, 0]}
            />
            {/* A band-coloured tip mark, so the ring of 12 tips reads as a scale. */}
            <mesh position={[0, blade.length + 0.4, 0]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshBasicMaterial
                color={bandColor(i / Math.max(1, blades.length - 1)).getHex()}
                transparent
                opacity={0.9}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
        <mesh material={hubMaterial}>
          <icosahedronGeometry args={[0.55, 1]} />
        </mesh>
      </group>
      {/* Readout marker at 12 o'clock — fixed, the rotor turns beneath it. */}
      <mesh position={[0, WORLD.skills.radius + 1.5, 0.4]}>
        <boxGeometry args={[0.035, 0.7, 0.035]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <pointLight position={[3, 3, 5]} intensity={look.bloom ? 8 : 4} color={TEAL} distance={22} />
      <pointLight position={[-3, -2, 3]} intensity={look.bloom ? 4 : 2} color={CRIMSON} distance={20} />
    </group>
  );
}
