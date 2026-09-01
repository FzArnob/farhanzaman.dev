import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Achievement } from '../../types/profile';
import { hexTileGeometry } from '../geometry/facetedCore';
import type { WorldLook } from '../materials/palette';
import { CRIMSON, TEAL } from '../materials/presets';
import { constellationState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence } from '../timeline';
import { useRemoteTexture } from '../useRemoteTexture';

/**
 * Act 06 — The Constellation.
 *
 * Ten hexagonal glass tiles in a star field, each carrying its certificate mark. The
 * certification logos are already SVGs in view/static/svg/, so they load as textures
 * with no raster assets to produce.
 *
 * Position is data, not decoration: X is the certification date and distance from the
 * axis is the level, with Advanced innermost. So the shape of the constellation is the
 * actual trajectory — 2021 basics out on the rim, 2023 SQL right at the core. Faint
 * lines join tiles from the same issuer.
 */

export { constellationState };

const LEVEL_RADIUS: Record<string, number> = {
  advanced: 0.3,
  intermediate: 0.66,
  basic: 1,
  beginner: 1,
};

interface Tile {
  achievement: Achievement;
  position: THREE.Vector3;
  issuer: string;
}

function issuerOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'other';
  }
}

export function buildConstellation(achievements: Achievement[]): { tiles: Tile[]; links: [number, number][] } {
  const times = achievements.map((a) => new Date(a.certification_date).getTime() || 0);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = Math.max(1, max - min);
  const spread = WORLD.constellation.spread;

  const tiles: Tile[] = achievements.map((achievement, i) => {
    const k = ((new Date(achievement.certification_date).getTime() || min) - min) / span;
    const radial = LEVEL_RADIUS[achievement.level.toLowerCase()] ?? 0.8;
    // Spiral the angle so tiles at the same date and level do not overlap.
    const angle = i * 2.399963;
    const r = radial * spread * 0.62;
    return {
      achievement,
      position: new THREE.Vector3(
        // Date runs left (oldest) to right (newest).
        (k - 0.5) * spread * 1.9,
        Math.sin(angle) * r,
        Math.cos(angle) * r * 0.7
      ),
      issuer: issuerOf(achievement.certification_url),
    };
  });

  const links: [number, number][] = [];
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i].issuer === tiles[j].issuer) links.push([i, j]);
    }
  }
  return { tiles, links };
}

function Tile({
  tile,
  index,
  geometry,
  look,
  envMap,
  onSelect,
}: {
  tile: Tile;
  index: number;
  geometry: THREE.BufferGeometry;
  look: WorldLook;
  envMap: THREE.Texture | null;
  onSelect: (index: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const faceRef = useRef<THREE.Mesh>(null);
  // certification_logo is a site-relative path such as view/static/svg/sql.svg.
  const logo = useRemoteTexture(`/${tile.achievement.certification_logo.replace(/^\/+/, '')}`);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: look.frameBack,
        roughness: 0.3,
        metalness: 0.35,
        envMapIntensity: 1.3,
        transparent: true,
        opacity: 0.92,
      }),
    [look.frameBack]
  );
  useEffect(() => {
    material.envMap = envMap;
    material.needsUpdate = true;
  }, [material, envMap]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const hovered = constellationState.hovered === index;
    const time = state.clock.elapsedTime;
    // Hover turns the tile edge-on and then face-on: it "flips" to show its detail.
    const targetY = hovered ? 0 : Math.sin(time * 0.35 + index) * 0.5 + Math.PI * 0.16;
    mesh.rotation.y = THREE.MathUtils.damp(mesh.rotation.y, targetY, 5, delta);
    mesh.rotation.z = Math.sin(time * 0.22 + index * 1.7) * 0.08;
    const scale = hovered ? 1.35 : 1;
    mesh.scale.setScalar(THREE.MathUtils.damp(mesh.scale.x, scale, 6, delta));
    mesh.position.y = tile.position.y + Math.sin(time * 0.4 + index * 2.1) * 0.16;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={tile.position}
      name={`cert-${index}`}
      onPointerOver={(e) => {
        e.stopPropagation();
        constellationState.hovered = index;
      }}
      onPointerOut={() => {
        if (constellationState.hovered === index) constellationState.hovered = -1;
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
    >
      {logo && (
        <mesh ref={faceRef} position={[0, 0, 0.09]}>
          <planeGeometry args={[1.15, 1.15]} />
          <meshBasicMaterial map={logo} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </mesh>
  );
}

export function Act06Constellation({
  look,
  envMap,
  achievements,
  onSelect,
}: {
  look: WorldLook;
  envMap: THREE.Texture | null;
  achievements: Achievement[];
  onSelect: (index: number) => void;
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const linkRef = useRef<THREE.LineSegments>(null);
  const act = ACT_BY_ID.constellation;

  const { tiles, links } = useMemo(() => buildConstellation(achievements), [achievements]);
  const geometry = useMemo(() => hexTileGeometry(0.85, 0.14), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const linkGeometry = useMemo(() => {
    const verts = new Float32Array(links.length * 6);
    links.forEach(([a, b], i) => {
      const pa = tiles[a].position;
      const pb = tiles[b].position;
      verts.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geo;
  }, [links, tiles]);
  useEffect(() => () => linkGeometry.dispose(), [linkGeometry]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.035, 0.035);
    group.visible = presence > 0.005;
    if (!group.visible) return;
    if (linkRef.current) {
      (linkRef.current.material as THREE.LineBasicMaterial).opacity = presence * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, WORLD.constellation.z]}>
      <lineSegments ref={linkRef} geometry={linkGeometry}>
        <lineBasicMaterial
          color={TEAL}
          transparent
          opacity={0.3}
          blending={look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      {tiles.map((tile, i) => (
        <Tile
          key={tile.achievement.achievement_id}
          tile={tile}
          index={i}
          geometry={geometry}
          look={look}
          envMap={envMap}
          onSelect={onSelect}
        />
      ))}
      <pointLight position={[0, 6, 10]} intensity={look.bloom ? 22 : 11} color={TEAL} distance={44} />
      <pointLight position={[-8, -4, 4]} intensity={look.bloom ? 10 : 5} color={CRIMSON} distance={38} />
    </group>
  );
}

