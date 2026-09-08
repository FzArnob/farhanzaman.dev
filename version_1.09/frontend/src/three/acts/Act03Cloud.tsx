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
 * HUD shows only the name, its level and how long it has been in use.
 *
 * The cloud is fitted to the frame every frame rather than being a fixed 7-unit
 * sphere. three's `fov` is vertical, so a portrait phone has barely a quarter of a
 * desktop's horizontal field: a sphere sized for one runs off both sides of the other,
 * which is what was cutting "Java", "MongoDB" and "Illustrator" in half. The radii are
 * solved per axis from what the camera can actually see, so the names always land
 * inside the viewport with a margin, at any size and either orientation.
 */

/** Biggest base sprite scale — the widest word the fit has to leave room for. */
const MAX_WORD = 0.92;

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

    return expertises.map((item, i) => {
      // Fibonacci sphere: an even spread at any count, so adding a 24th expertise in
      // the admin editor re-solves the layout instead of leaving a gap.
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const months = Number(item.duration) || 0;
      // sqrt keeps the 3-to-48-month spread from letting one word dominate.
      const weight = Math.sqrt(months / longest);
      // Advanced is the exception, so advanced is the accent: crimson for the handful
      // of them, teal for intermediate and beginner alike.
      const advanced = /advanced/i.test(item.level);

      return {
        id: item.expertise_id,
        name: item.name,
        level: item.level,
        months,
        weight,
        // Level picks a pole. Only ever teal or crimson — never anything between.
        colour: poleValue(advanced ? 1 : 0),
        // A point on the UNIT sphere. The radii are solved per frame against the
        // viewport, so the layout cannot bake a size in.
        unit: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r),
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
        // A sane first frame; useFrame owns the position from then on.
        sprite.position.copy(word.unit).multiplyScalar(WORLD.expertise.radius);
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
    const camera = state.camera as THREE.PerspectiveCamera;
    const centreDist = camera.position.distanceTo(_c);

    /*
      The fit. What the camera can see at the cloud's own depth, in world units.

      Type shrinks with the frame but bottoms out at 55%: past that the names stop
      being readable and there is no point fitting them on screen at all. Whatever the
      type ends up as, the radii then reserve room for the widest word, so a name
      centred at the edge of the cloud still lands inside the viewport.

      X and Z share a radius deliberately — the cloud spins about Y, and an ellipse
      that is wider than it is deep would swing outside the frame as it turned.
    */
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * centreDist;
    const halfW = halfH * camera.aspect;
    const textScale = THREE.MathUtils.clamp(halfW / 7, 0.55, 1);
    const wordHalfW = MAX_WORD * 2 * textScale;
    const wordHalfH = MAX_WORD * 0.5 * textScale;
    const limit = WORLD.expertise.radius;
    const rx = Math.min(limit, Math.max(1.2, halfW * 0.9 - wordHalfW));
    // Tighter than the sides: the masthead owns the top of the frame and the readout
    // the bottom, and the 9-degree idle tilt borrows a little height from Z.
    const ry = Math.min(limit, Math.max(1.2, halfH * 0.74 - wordHalfH - 0.45));

    const nearest = centreDist - rx;
    const farthest = centreDist + rx;

    sprites.forEach((sprite, i) => {
      const unit = words[i].unit;
      sprite.position.set(unit.x * rx, unit.y * ry, unit.z * rx);

      sprite.getWorldPosition(_v);
      const dist = camera.position.distanceTo(_v);
      const front = clamp01(1 - (dist - nearest) / Math.max(0.001, farthest - nearest));

      const isHovered = hovered === i;
      const dim = hovered >= 0 && !isHovered ? 0.35 : 1;
      sprite.material.opacity = presence * (0.18 + front * 0.82) * dim;

      const base = (0.42 + words[i].weight * 0.5) * textScale;
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
