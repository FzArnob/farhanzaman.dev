import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Quality } from '../../lib/quality';
import { ABERRATION, fzMonogramGeometry } from '../geometry/fzMonogram';
import type { WorldLook } from '../materials/palette';
import { bandColor } from '../materials/palette';
import {
  CRIMSON,
  TEAL,
  TEAL_RGB,
  beamMaterial,
  glowSprite,
  prismMaterial,
  prismRearMaterial,
} from '../materials/presets';
import { prismFocus } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, actPresence } from '../timeline';

/**
 * Act 01 — The Prism.
 *
 * The site's own monogram, extruded into glass and turning slowly at the origin. The
 * name is set on a plane BEHIND it, so with transmission on, the glass genuinely
 * refracts the letters: they warp, tear and re-form as the mark turns. That image can
 * only exist here, which is why it is the hero.
 *
 * Three spectrum beams leave stage right, one per designation. Hovering a designation
 * in the DOM overlay sets `focusBeam`, which ignites that beam and yaws the mark
 * toward it.
 */

export { prismFocus };

const BEAM_BANDS = [0, 0.5, 1];

export function Act01Prism({
  quality,
  look,
  envMap,
  name,
  designations,
}: {
  quality: Quality;
  look: WorldLook;
  envMap: THREE.Texture | null;
  name: string;
  designations: string[];
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const markRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const beamsRef = useRef<THREE.Group>(null);
  const act = ACT_BY_ID.intro;

  const geometry = useMemo(() => fzMonogramGeometry(), []);
  const front = useMemo(() => prismMaterial(quality, !look.bloom), [quality, look.bloom]);
  const rear = useMemo(() => prismRearMaterial(quality), [quality]);

  /**
   * The name plate. Drawn to a canvas rather than DOM-over-canvas because it has to sit
   * *behind* the glass in the depth buffer for the refraction to pick it up — a DOM
   * layer can only ever be in front of or behind the whole canvas.
   *
   * The DOM overlay carries the same words for screen readers and search engines.
   */
  const plateTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const g = canvas.getContext('2d')!;
    g.clearRect(0, 0, 2048, 512);
    g.textAlign = 'center';
    // Ghost type: it exists to be refracted, so it must never compete with the
    // DOM headline that carries the same words.
    g.font = '700 196px "Chakra Petch","Titillium Web",system-ui,sans-serif';
    g.fillStyle = look.bloom ? 'rgba(233,240,238,0.2)' : 'rgba(17,23,25,0.22)';
    g.fillText(name.toUpperCase(), 1024, 232);
    g.font = '500 46px "IBM Plex Mono",ui-monospace,monospace';
    g.fillStyle = look.bloom ? 'rgba(0,211,180,0.26)' : 'rgba(0,148,127,0.3)';
    g.fillText(designations.join('  ·  ').toUpperCase(), 1024, 336);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [name, designations, look.bloom]);

  useEffect(() => () => plateTexture.dispose(), [plateTexture]);

  useEffect(() => {
    front.envMap = envMap;
    rear.envMap = envMap;
    front.needsUpdate = true;
    rear.needsUpdate = true;
  }, [front, rear, envMap]);

  const glow = useMemo(() => glowSprite(TEAL_RGB, 10, 0.5), []);
  useEffect(() => () => glow.material.dispose(), [glow]);

  const beams = useMemo(
    () =>
      BEAM_BANDS.map((band, i) => {
        const colour = bandColor(band).getHex();
        const mat = beamMaterial(colour, !look.bloom);
        // Short enough to dissolve well before the right-hand rail.
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.045), mat);
        mesh.position.set(2.5, (1 - i) * 0.5, 0);
        mesh.rotation.z = (1 - i) * 0.14;
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
    const presence = actPresence(t, act, 0.02, 0.05);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const time = state.clock.elapsedTime;
    const mark = markRef.current!;

    // Scroll drives the turn; a slow idle rotation keeps it alive when parked.
    mark.rotation.y = t * 9 + time * 0.1;
    mark.rotation.x = Math.sin(t * 6) * 0.1;

    // Pointer parallax, and a yaw toward whichever designation is hovered.
    const focus = prismFocus.beam;
    const aim = focus >= 0 ? (1 - focus) * 0.22 : 0;
    mark.rotation.z = THREE.MathUtils.damp(mark.rotation.z, aim + prismFocus.pointerX * 0.07, 4, delta);
    mark.position.y = THREE.MathUtils.damp(mark.position.y, prismFocus.pointerY * 0.12, 4, delta);

    const scale = THREE.MathUtils.lerp(0.92, 1.16, Math.min(1, t / act.t1));
    mark.scale.setScalar(scale);

    front.opacity = presence;
    rear.opacity = presence * 0.85;

    if (plateRef.current) {
      /*
        The ghost name exists only to be refracted. With a transmission pass it
        warps and re-forms behind the glass, which is the hero image; without one
        it is just a second, blurrier copy of the DOM headline directly behind the
        mark, so below the high tier it does not render at all.
      */
      (plateRef.current.material as THREE.MeshBasicMaterial).opacity =
        quality.transmission ? presence * 0.9 : 0;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = presence * look.glow;
    }

    beams.forEach((beam, i) => {
      const mat = beam.material as THREE.MeshBasicMaterial;
      const lit = focus === i ? 1 : focus >= 0 ? 0.16 : 0.42;
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.1 + i * 2.1);
      mat.opacity = presence * (lit + pulse * 0.14) * (look.bloom ? 1 : 0.85);
      beam.scale.y = THREE.MathUtils.damp(beam.scale.y, focus === i ? 2.4 : 1, 6, delta);
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* The name sits behind the glass so the transmission pass refracts it. */}
      <mesh ref={plateRef} position={[0, 0.02, -2.6]}>
        <planeGeometry args={[7, 1.75]} />
        <meshBasicMaterial map={plateTexture} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      <primitive object={glow} ref={glowRef} position={[0, 0, -1.4]} />

      <group ref={markRef}>
        {/* Crimson layer, offset by the logo's own aberration vector. */}
        <mesh
          geometry={geometry}
          material={rear}
          position={[ABERRATION.world[0], ABERRATION.world[1], -0.16]}
          scale={1.006}
        />
        <mesh geometry={geometry} material={front} />
      </group>

      <group ref={beamsRef}>
        {beams.map((beam, i) => (
          <primitive key={i} object={beam} />
        ))}
      </group>

      {/* Key and rim, placed to rake across the mark's facets. */}
      <pointLight position={[2.4, 1.6, 2.6]} intensity={look.bloom ? 7 : 3} color={TEAL} distance={14} />
      <pointLight position={[-2.2, -1.2, 1.4]} intensity={look.bloom ? 4 : 2} color={CRIMSON} distance={12} />
    </group>
  );
}
