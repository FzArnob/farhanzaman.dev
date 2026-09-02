import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadGamingVideos } from '../../data/loadProfile';
import type { GamingVideo } from '../../types/gaming';
import type { WorldLook } from '../materials/palette';
import { TEAL } from '../materials/presets';
import { arcadeState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence } from '../timeline';
import { loadTexture } from '../useRemoteTexture';

/**
 * Act 07b — The Arcade.
 *
 * A curved video wall at the far end of the gallery hall: the Run Fz Run channel on a
 * cylindrical thumbnail grid. All 83 clips are in the data, but only the tiles actually
 * facing the camera get a texture, so the wall costs a handful of loads rather than 83.
 *
 * The grid is horizontal — the one place in the build that could have grown a second
 * vertical scroller, and deliberately doesn't.
 */

export { arcadeState };

const COLUMNS = 14;
const ROWS = 5;
const RADIUS = 13;
const TILE_W = 1.72;
const TILE_H = 0.98;

interface Tile {
  video: GamingVideo;
  column: number;
  row: number;
  angle: number;
}

export function Act08Arcade({
  look,
  onSelect,
}: {
  look: WorldLook;
  onSelect: (video: GamingVideo) => void;
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const wallRef = useRef<THREE.Group>(null);
  const [videos, setVideos] = useState<GamingVideo[]>([]);

  // Loaded lazily: nobody who stops before act 07 should pay for 83 video records.
  useEffect(() => {
    let live = true;
    loadGamingVideos()
      .then((data) => {
        if (!live) return;
        const all = data.pages.flatMap((page) => page.videos);
        setVideos(all);
      })
      .catch(() => {
        /* the wall simply stays empty */
      });
    return () => {
      live = false;
    };
  }, []);

  const tiles = useMemo<Tile[]>(() => {
    const out: Tile[] = [];
    const wanted = Math.min(videos.length, COLUMNS * ROWS);
    for (let i = 0; i < wanted; i++) {
      const column = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      out.push({
        video: videos[i],
        column,
        row,
        // Wrap the grid onto a cylinder facing the walkway.
        angle: (column / COLUMNS - 0.5) * Math.PI * 0.9,
      });
    }
    return out;
  }, [videos]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(TILE_W, TILE_H), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const materials = useMemo(
    () =>
      tiles.map(
        () =>
          new THREE.MeshBasicMaterial({
            color: look.bloom ? 0x0d1518 : 0xdfe7e5,
            transparent: true,
            opacity: 0,
            toneMapped: false,
          })
      ),
    [tiles, look.bloom]
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  /** Thumbnails load for the tiles that are actually facing you. */
  useEffect(() => {
    let live = true;
    const wanted = tiles.slice(0, COLUMNS * 2);
    Promise.all(
      wanted.map((tile, i) =>
        loadTexture(tile.video.video_thumbnail).then((tex) => {
          if (!live || !tex || !materials[i]) return;
          materials[i].map = tex;
          materials[i].color.setHex(0xffffff);
          materials[i].needsUpdate = true;
        })
      )
    ).catch(() => {
      /* thumbnails are decorative; a miss is not fatal */
    });
    return () => {
      live = false;
    };
  }, [tiles, materials]);

  const wallZ = WORLD.arcade.z;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    // A full act of its own now, on the same presence curve as every other one,
    // rather than a coda tacked onto the end of the gallery.
    const presence = actPresence(t, ACT_BY_ID.arcade, 0.04, 0.04);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const time = state.clock.elapsedTime;
    if (wallRef.current) {
      // A slow drift, so the wall reads as a live feed rather than a poster.
      wallRef.current.rotation.y = Math.sin(time * 0.08) * 0.06;
    }

    materials.forEach((m, i) => {
      const hovered = arcadeState.hovered === i;
      const target = presence * (m.map ? (hovered ? 1 : 0.82) : 0.3);
      m.opacity = THREE.MathUtils.damp(m.opacity, target, 5, delta);
    });
  });

  if (tiles.length === 0) return null;

  return (
    <group ref={groupRef} position={[0, 0.4, wallZ]}>
      <group ref={wallRef}>
        {tiles.map((tile, i) => {
          const x = Math.sin(tile.angle) * RADIUS;
          const z = RADIUS - Math.cos(tile.angle) * RADIUS;
          const y = (ROWS / 2 - tile.row - 0.5) * (TILE_H + 0.14);
          return (
            <mesh
              key={tile.video.video_url}
              geometry={geometry}
              material={materials[i]}
              position={[x, y, -z]}
              rotation={[0, -tile.angle, 0]}
              name={`clip-${i}`}
              onPointerOver={(e) => {
                e.stopPropagation();
                arcadeState.hovered = i;
              }}
              onPointerOut={() => {
                if (arcadeState.hovered === i) arcadeState.hovered = -1;
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(tile.video);
              }}
            />
          );
        })}
      </group>
      <pointLight position={[0, 0, 4]} intensity={look.bloom ? 14 : 8} color={TEAL} distance={34} />
    </group>
  );
}
