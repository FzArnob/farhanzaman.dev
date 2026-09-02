import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { ABERRATION, fzMonogramGeometry } from '../geometry/fzMonogram';
import { bandColor, type WorldLook } from '../materials/palette';
import {
  CRIMSON,
  TEAL,
  TEAL_RGB,
  beamMaterial,
  glowSprite,
  prismMaterial,
  prismRearMaterial,
} from '../materials/presets';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, ramp, smooth } from '../timeline';

/**
 * Act 08 — Sync.
 *
 * Every shard the page has used converges here (the pool handles that end of it). The
 * three spectra fold back into one beam, the beam writes the address, and the monogram
 * reassembles behind it with the crimson layer sliding back into register — the
 * aberration resolved.
 *
 * It is the reference clip's closing shot, except here it is earned: the visitor
 * watched the light split 900vh ago, and the mark coming back into focus is the answer
 * to the question the hero asked.
 */

export function Act09Contact({
  quality,
  look,
  envMap,
}: {
  quality: Quality;
  look: WorldLook;
  envMap: THREE.Texture | null;
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const markRef = useRef<THREE.Group>(null);
  const rearRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const beamsRef = useRef<THREE.Group>(null);
  const act = ACT_BY_ID.contact;

  const geometry = useMemo(() => fzMonogramGeometry(), []);
  const front = useMemo(() => prismMaterial(quality, !look.bloom), [quality, look.bloom]);
  const rear = useMemo(() => prismRearMaterial(quality), [quality]);

  useEffect(() => {
    front.envMap = envMap;
    rear.envMap = envMap;
    front.needsUpdate = true;
    rear.needsUpdate = true;
  }, [front, rear, envMap]);
  useEffect(
    () => () => {
      front.dispose();
      rear.dispose();
    },
    [front, rear]
  );

  const glow = useMemo(() => glowSprite(TEAL_RGB, 26, 0.34), []);
  useEffect(() => () => glow.material.dispose(), [glow]);

  /** Three beams converging into one, mirroring act 01's three leaving. */
  const beams = useMemo(
    () =>
      [0, 0.5, 1].map((band, i) => {
        const mat = beamMaterial(bandColor(band).getHex(), !look.bloom);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.07), mat);
        mesh.position.set(-8, 3.8 + (1 - i) * 1.6, 0);
        mesh.rotation.z = (1 - i) * -0.12;
        return mesh;
      }),
    [look.bloom]
  );
  useEffect(
    () => () =>
      beams.forEach((b) => {
        b.geometry.dispose();
        (b.material as THREE.Material).dispose();
      }),
    [beams]
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.04, 0.01);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const time = state.clock.elapsedTime;
    // How far through the resolution we are: 0 at the act's start, 1 at the very end.
    const resolve = smooth(ramp(t, act.t0 + 0.01, 1.0));

    const mark = markRef.current!;
    mark.rotation.y = THREE.MathUtils.damp(mark.rotation.y, 0, 2.2, delta) + (1 - resolve) * Math.sin(time * 0.6) * 0.5;
    // High enough to clear the contact form, which owns the middle of the frame.
    mark.position.y = THREE.MathUtils.lerp(6.4, 4.9, resolve);
    mark.scale.setScalar(THREE.MathUtils.lerp(1.1, 1.75, resolve));

    /**
     * The payoff: the crimson layer slides from a wide offset back to the logo's own
     * 6%-of-width vector. The mark comes into focus exactly as the scroll runs out.
     */
    if (rearRef.current) {
      const drift = 1 - resolve;
      rearRef.current.position.set(
        ABERRATION.world[0] * (1 + drift * 9),
        ABERRATION.world[1] * (1 + drift * 9),
        -0.16 - drift * 0.5
      );
    }

    front.opacity = presence;
    rear.opacity = presence * (0.85 - resolve * 0.1);

    if (glowRef.current) glowRef.current.material.opacity = presence * look.glow * resolve * 0.9;

    beams.forEach((beam, i) => {
      const mat = beam.material as THREE.MeshBasicMaterial;
      mat.opacity = presence * (0.3 + 0.3 * Math.sin(time * 1.2 + i * 2)) * (look.bloom ? 1 : 0.8);
      // The three fold toward the beam line as the invitation resolves.
      beam.position.y = 3.8 + (1 - i) * 1.6 * (1 - resolve * 0.94);
      beam.rotation.z = (1 - i) * -0.12 * (1 - resolve);
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, WORLD.contact.z]}>
      <primitive object={glow} ref={glowRef} position={[0, 4.6, -1.2]} />

      {/*
        No headline plate here. The DOM carries those words — one copy, selectable,
        and readable at any size — and printing them into a texture as well only
        put two versions of the same sentence on top of each other.
      */}
      <group ref={beamsRef}>
        {beams.map((beam, i) => (
          <primitive key={i} object={beam} />
        ))}
      </group>

      <group ref={markRef} position={[0, 4.9, 0]}>
        <mesh ref={rearRef} geometry={geometry} material={rear} scale={1.006} />
        <mesh geometry={geometry} material={front} />
      </group>

      <pointLight position={[2.6, 6, 3]} intensity={look.bloom ? 9 : 4} color={TEAL} distance={24} />
      <pointLight position={[-2.4, 3.6, 2]} intensity={look.bloom ? 5 : 2.5} color={CRIMSON} distance={22} />
    </group>
  );
}
