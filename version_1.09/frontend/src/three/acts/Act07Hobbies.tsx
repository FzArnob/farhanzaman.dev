import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GalleryItem } from '../../types/profile';
import { bandColor, type WorldLook } from '../materials/palette';
import { TEAL } from '../materials/presets';
import { galleryState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';
import { useRemoteTexture } from '../useRemoteTexture';

/**
 * Act 07 — The Void Gallery.
 *
 * The only act with a floor. The shift in gravity is the point: it marks the move from
 * work to person, and after 700vh of weightlessness it lands without a word of copy.
 *
 * Eleven works hang at staggered depths down a dark hall, each lit by its own soft
 * spill that bounces a tint of the image onto the surrounding dark. Category sets the
 * plinth colour. thumb_url loads first and image_url swaps in on approach, so nothing
 * is ever a grey rectangle and nothing loads eleven full-resolution photographs.
 */

export { galleryState };

interface Frame {
  item: GalleryItem;
  z: number;
  x: number;
  y: number;
  width: number;
  height: number;
  band: number;
}

/** The flat home page showed a six-item preview; Explore opens the rest. */
export const HOBBIES_PREVIEW = 6;

export function buildGallery(items: GalleryItem[]): Frame[] {
  const categories = [...new Set(items.map((i) => i.category))].sort();
  const { zNear, zFar, wallX } = WORLD.hobbies;
  return items.map((item, i) => {
    const k = items.length <= 1 ? 0 : i / (items.length - 1);
    // Alternate walls so the camera has something to look at on both sides.
    const side = i % 2 === 0 ? -1 : 1;
    const catIndex = categories.indexOf(item.category);
    return {
      item,
      z: zNear + (zFar - zNear) * k,
      x: side * wallX,
      y: -0.6 + ((i % 3) - 1) * 0.75,
      // Portrait and landscape both occur in the data; a fixed 4:3 would crop badly,
      // so the frame starts square and the loaded texture corrects it.
      width: 2.6,
      height: 2.6,
      band: categories.length <= 1 ? 0 : catIndex / (categories.length - 1),
    };
  });
}

function Artwork({
  frame,
  index,
  look,
  onSelect,
}: {
  frame: Frame;
  index: number;
  look: WorldLook;
  onSelect: (index: number) => void;
}) {
  // Outside the current window this work is not in the hall at all — no texture
  // request, no light, nothing to draw.
  const inWindow = index < galleryState.shown;
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const spillRef = useRef<THREE.PointLight>(null);
  const nearRef = useRef(0);

  // Thumb first; the full image is requested only once the camera is close. A work
  // outside the window asks for nothing, which is what keeps the initial payload
  // to six thumbnails instead of eleven full-resolution photographs.
  const thumb = useRemoteTexture(inWindow ? frame.item.thumb_url : null);
  const wantFull = inWindow && nearRef.current > 0.45;
  const full = useRemoteTexture(wantFull ? frame.item.image_url : null);
  const texture = full ?? thumb;

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        toneMapped: false,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.map = texture ?? null;
    material.needsUpdate = true;
  }, [material, texture]);

  // Correct the frame to the image's real aspect once it is known.
  useEffect(() => {
    const mesh = planeRef.current;
    if (!mesh || !texture) return;
    const img = texture.image as { width?: number; height?: number } | undefined;
    const w = img?.width ?? 1;
    const h = img?.height ?? 1;
    if (!w || !h) return;
    const aspect = w / h;
    mesh.scale.set(aspect >= 1 ? 1 : aspect, aspect >= 1 ? 1 / aspect : 1, 1);
  }, [texture]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const shown = index < galleryState.shown;
    group.visible = shown || material.opacity > 0.01;
    if (!shown) {
      material.opacity = THREE.MathUtils.damp(material.opacity, 0, 5, delta);
      if (spillRef.current) spillRef.current.intensity = 0;
      return;
    }
    const camZ = state.camera.position.z;
    const near = clamp01(1 - Math.abs(camZ - frame.z) / 22);
    nearRef.current = near;

    const hovered = galleryState.hovered === index;
    // Works angle in toward the walkway, the way they would be hung in a real hall.
    const face = frame.x < 0 ? 0.5 : -0.5;
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, face * (1 - near * 0.7), 4, delta);
    group.position.x = THREE.MathUtils.damp(group.position.x, frame.x * (1 - near * 0.12), 4, delta);

    const scale = 1 + near * 0.1 + (hovered ? 0.1 : 0);
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, scale, 6, delta));

    material.opacity = THREE.MathUtils.damp(material.opacity, texture ? 0.3 + near * 0.7 : 0, 4, delta);

    // The spill is the whole lighting design here: each work lights its own patch of
    // the dark, so the hall is read entirely through the art on its walls.
    if (spillRef.current) {
      spillRef.current.intensity = near * (look.bloom ? 9 : 3) * (hovered ? 1.5 : 1);
    }
  });

  return (
    <group ref={groupRef} position={[frame.x, frame.y, frame.z]}>
      <mesh
        ref={planeRef}
        material={material}
        name={`art-${index}`}
        onPointerOver={(e) => {
          e.stopPropagation();
          galleryState.hovered = index;
        }}
        onPointerOut={() => {
          if (galleryState.hovered === index) galleryState.hovered = -1;
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(index);
        }}
      >
        <planeGeometry args={[frame.width, frame.height]} />
      </mesh>
      {/* The plinth carries the category, as a band-coloured bar under the work. */}
      <mesh position={[0, -frame.height / 2 - 0.28, 0]}>
        <boxGeometry args={[frame.width * 0.72, 0.06, 0.06]} />
        <meshBasicMaterial
          color={bandColor(frame.band).getHex()}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={spillRef}
        position={[frame.x < 0 ? 1.6 : -1.6, 0, 1.4]}
        intensity={0}
        color={0xffffff}
        distance={12}
        decay={2}
      />
    </group>
  );
}

export function Act07Hobbies({
  look,
  gallery,
  onSelect,
}: {
  look: WorldLook;
  gallery: GalleryItem[];
  onSelect: (index: number) => void;
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const act = ACT_BY_ID.hobbies;

  const frames = useMemo(() => buildGallery(gallery), [gallery]);
  const { zNear, zFar, floorY } = WORLD.hobbies;

  useEffect(() => {
    galleryState.total = gallery.length;
    galleryState.shown = galleryState.expanded
      ? gallery.length
      : Math.min(HOBBIES_PREVIEW, gallery.length);
  }, [gallery.length]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.04, 0.03);
    group.visible = presence > 0.005;
    if (!group.visible) return;
    galleryState.total = gallery.length;
    galleryState.shown = galleryState.expanded
      ? gallery.length
      : Math.min(HOBBIES_PREVIEW, gallery.length);
    if (floorRef.current) {
      (floorRef.current.material as THREE.MeshStandardMaterial).opacity = presence * 0.9;
    }
  });

  return (
    <group ref={groupRef}>
      {/* The floor arrives with the act and leaves with it — gravity is temporary. */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, floorY, (zNear + zFar) / 2]}
      >
        <planeGeometry args={[26, Math.abs(zFar - zNear) + 24]} />
        <meshStandardMaterial
          color={look.bloom ? 0x040607 : 0xdfe6e4}
          roughness={0.72}
          metalness={0.08}
          transparent
          opacity={0.85}
        />
      </mesh>

      {frames.map((frame, i) => (
        <Artwork key={frame.item.gallery_item_id} frame={frame} index={i} look={look} onSelect={onSelect} />
      ))}

      {/*
        Barely there. The hall is meant to be read by the light each work throws onto
        the dark around it, so a general fill flattens exactly the effect the act is
        built on — and on the floor it turned into a bright slab across half the frame.
      */}
      <pointLight
        position={[0, 3, (zNear + zFar) / 2]}
        intensity={look.bloom ? 0.8 : 2.2}
        color={TEAL}
        distance={30}
      />
    </group>
  );
}
