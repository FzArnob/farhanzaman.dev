import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { poleValue } from '../../lib/band';
import type { Expertise } from '../../types/profile';
import { wordTexture } from '../materials/labels';
import type { WorldLook } from '../materials/palette';
import { useScrollRig } from '../ScrollRig';
import { cloudState } from '../liveState';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/**
 * Act 03 — Expertise.
 *
 * The flat site's skill canvas was already a rotating 3D tag cloud, so this is that
 * same design, moved into the scene it belongs in: 23 expertise names on a sphere,
 * always facing you, turning slowly, sized by how long each has been used.
 *
 * Built from sprites rather than extruded text on purpose. A sprite always faces the
 * camera — which is exactly the behaviour TagCloud had — and a word is one 256×64
 * canvas, so 23 of them cost less than a single piece of extruded typography would.
 *
 * No descriptions anywhere: they were removed from this act at your request, and the
 * DOM panel shows only the name, its level and how long it has been in use.
 */
export function Act03Cloud({
  look,
  expertises,
}: {
  look: WorldLook;
  expertises: Expertise[];
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const act = ACT_BY_ID.expertise;

  /** Longest duration in the data, so the size scale is relative rather than absolute. */
  const longest = useMemo(
    () => Math.max(1, ...expertises.map((e) => Number(e.duration) || 0)),
    [expertises]
  );

  const words = useMemo(() => {
    const n = expertises.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const radius = WORLD.expertise.radius;

    return expertises.map((item, i) => {
      // Fibonacci sphere: an even spread at any count, so adding a 24th expertise in
      // the admin editor re-solves the layout instead of leaving a gap.
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const months = Number(item.duration) || 0;
      // sqrt keeps the 3-to-48-month spread from letting one word dominate.
      const weight = Math.sqrt(months / longest);
      const advanced = /advanced|intermediate/i.test(item.level);

      return {
        id: item.expertise_id,
        name: item.name,
        level: item.level,
        months,
        weight,
        // Level picks a pole. Only ever teal or crimson — never anything between.
        colour: poleValue(advanced ? 0 : 1),
        home: new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius),
      };
    });
  }, [expertises, longest]);

  useEffect(() => {
    cloudState.count = words.length;
  }, [words.length]);

  const sprites = useMemo(
    () =>
      words.map((word) => {
        const map = wordTexture(word.name, `#${word.colour.toString(16).padStart(6, '0')}`, !look.bloom);
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
            opacity: 0,
          })
        );
        // 4:1 canvas, so the sprite has to match or the word stretches.
        const scale = 0.42 + word.weight * 0.5;
        sprite.scale.set(scale * 4, scale, 1);
        sprite.position.copy(word.home);
        return sprite;
      }),
    [words, look.bloom]
  );

  useEffect(
    () => () =>
      sprites.forEach((s) => {
        s.material.dispose();
      }),
    [sprites]
  );

  const _v = useMemo(() => new THREE.Vector3(), []);
  const _c = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.04, 0.04);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const spin = spinRef.current!;
    const time = state.clock.elapsedTime;

    // Drag momentum, then a slow idle turn — the same 135° drift the flat cloud had.
    cloudState.spin += cloudState.spinVelocity * delta;
    cloudState.spinVelocity *= Math.exp(-delta * 3.2);
    spin.rotation.y = cloudState.spin + time * 0.11;
    spin.rotation.x = Math.sin(time * 0.14) * 0.16;

    const hovered = cloudState.hovered;

    /*
      The depth fade, measured properly: distance from the camera, remapped across
      the sphere's own diameter. The near hemisphere is fully opaque and the far one
      drops to a fifth, which is what stops 23 names reading as one solid block —
      and it is the same near/far weighting the flat tag cloud had.
    */
    group.getWorldPosition(_c);
    const centreDist = state.camera.position.distanceTo(_c);
    const radius = WORLD.expertise.radius;
    const nearest = centreDist - radius;
    const farthest = centreDist + radius;

    sprites.forEach((sprite, i) => {
      sprite.getWorldPosition(_v);
      const dist = state.camera.position.distanceTo(_v);
      const front = clamp01(1 - (dist - nearest) / Math.max(0.001, farthest - nearest));

      const isHovered = hovered === i;
      const dim = hovered >= 0 && !isHovered ? 0.35 : 1;
      sprite.material.opacity = presence * (0.18 + front * 0.82) * dim;

      const base = 0.42 + words[i].weight * 0.5;
      // The near face grows a little as well, which reads as perspective on type
      // that is technically always facing you.
      const target = base * (0.86 + front * 0.28) * (isHovered ? 1.25 : 1);
      const s = THREE.MathUtils.damp(sprite.scale.y, target, 8, delta);
      sprite.scale.set(s * 4, s, 1);
    });
  });

  return (
    /* Lifted a touch so the sphere's lowest words clear the centre-bottom readout. */
    <group ref={groupRef} position={[0, WORLD.expertise.y, WORLD.expertise.z]}>
      <group ref={spinRef} name="cloud-words">
        {sprites.map((sprite, i) => (
          <primitive key={words[i].id} object={sprite} />
        ))}
      </group>
    </group>
  );
}
