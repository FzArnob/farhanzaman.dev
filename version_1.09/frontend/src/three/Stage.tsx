import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { demote, type Quality } from '../lib/quality';
import type { Profile } from '../types/profile';
import type { GamingVideo } from '../types/gaming';
import { CameraRig } from './CameraRig';
import { Act00Calibration } from './acts/Act00Calibration';
import { Act01Prism } from './acts/Act01Prism';
import { Act02Background } from './acts/Act02Background';
import { Act03Cloud } from './acts/Act03Cloud';
import { Act04Turbine } from './acts/Act04Turbine';
import { Act05Achievements } from './acts/Act05Achievements';
import { Act06Works } from './acts/Act06Works';
import { Act06bCase } from './acts/Act06bCase';
import { Act07Hobbies } from './acts/Act07Hobbies';
import { Act08Arcade } from './acts/Act08Arcade';
import { Act09Contact } from './acts/Act09Contact';
import { DustField } from './fx/DustField';
import { ShardPool } from './fx/ShardPool';
import { boot, cloudState } from './liveState';
import { buildEnvTexture, lookFor } from './materials/palette';
import { disposeLabelCache } from './materials/labels';
import { useStageState } from './StageState';
import { disposeTextureCache } from './useRemoteTexture';

/**
 * One canvas, forever.
 *
 * It mounts once and never unmounts. Acts inside it appear and disappear by scroll
 * proximity, so peak scene cost stays flat however much content the admin editor adds
 * later. The canvas is aria-hidden and role="presentation": not a character of the
 * copy lives in a texture, so deleting this component would leave a readable site.
 *
 * There is deliberately NO post-processing pass. Bloom and chromatic aberration cost
 * 74 KB gzipped and a full-screen render target, and both are achievable more cheaply
 * here: the glow is additive sprites the scene needed anyway, and the colour fringing
 * is the mark's own offset crimson layer — geometry rather than a shader. On a slow
 * connection that trade is the difference between a scene that appears and one that is
 * still downloading.
 */

/** Builds the PMREM environment and keeps it in step with the theme. */
function Environment({ light, onReady }: { light: boolean; onReady: (t: THREE.Texture) => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const look = lookFor(light);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const source = buildEnvTexture(light);
    const target = pmrem.fromEquirectangular(source);
    source.dispose();
    pmrem.dispose();

    scene.environment = target.texture;
    scene.background = new THREE.Color(look.background);
    scene.fog = new THREE.Fog(look.background, look.fogNear, look.fogFar);
    gl.toneMappingExposure = look.exposure;
    onReady(target.texture);

    return () => {
      target.dispose();
      scene.environment = null;
    };
  }, [gl, scene, light, look, onReady]);

  return (
    <>
      <ambientLight intensity={look.ambient} />
      <directionalLight position={[3, 4, 5]} intensity={look.keyIntensity} color={0x00d3b4} />
      <directionalLight position={[-4, -1, -3]} intensity={look.rimIntensity} color={0xfd2155} />
      <directionalLight position={[0, 3, 8]} intensity={look.fillIntensity} />
    </>
  );
}

/**
 * Measured tiering. The renderer string gives a first guess; if the first second of
 * real frames disagrees, the tier drops once. A demotion mid-scroll would be more
 * jarring than the frames it saves, so it only ever happens at the start.
 */
function FrameProbe({ quality, onDemote }: { quality: Quality; onDemote: () => void }) {
  const samples = useRef<number[]>([]);
  const settled = useRef(false);

  useFrame((_state, delta) => {
    if (settled.current) return;
    samples.current.push(delta);
    if (samples.current.length < 45) return;
    settled.current = true;
    // Discard the first ten: shader compilation lands there and is not representative.
    const window = samples.current.slice(10);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const fps = 1 / mean;
    const floor = quality.tier === 'high' ? 45 : 28;
    if (fps < floor) onDemote();
  });

  return null;
}

/**
 * Pointer handling for the expertise sphere: hover a word, drag to spin.
 *
 * Sprites are raycastable, so this walks the word group rather than needing separate
 * hit-test geometry. Drag is horizontal-only — on touch a vertical swipe must always
 * belong to the page, never to the sphere.
 */
function CloudPointer() {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const drag = useRef<{ x: number; moved: number } | null>(null);

  useEffect(() => {
    const element = gl.domElement;

    const hit = (event: PointerEvent): number => {
      const group = scene.getObjectByName('cloud-words');
      if (!group || !group.parent?.visible) return -1;
      const rect = element.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(group.children, false);
      if (hits.length === 0) return -1;
      return group.children.indexOf(hits[0].object);
    };

    const onDown = (event: PointerEvent) => {
      drag.current = { x: event.clientX, moved: 0 };
    };
    const onMove = (event: PointerEvent) => {
      const d = drag.current;
      if (d) {
        const dx = event.clientX - d.x;
        d.x = event.clientX;
        d.moved += Math.abs(dx);
        cloudState.spinVelocity = dx * 0.02;
        return;
      }
      cloudState.hovered = hit(event);
    };
    const onUp = (event: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      // A drag is a spin; only a genuine tap selects.
      if (!d || d.moved > 6) return;
      const index = hit(event);
      if (index >= 0) cloudState.selected = cloudState.selected === index ? -1 : index;
    };

    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    return () => {
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [camera, gl, scene, raycaster, pointer]);

  return null;
}

/** Frees every cached texture when the stage goes away. */
function Housekeeping() {
  useEffect(
    () => () => {
      disposeLabelCache();
      disposeTextureCache();
    },
    []
  );
  return null;
}

export function Stage({
  profile,
  quality: initialQuality,
  light,
  onOpenClip,
}: {
  profile: Profile;
  quality: Quality;
  light: boolean;
  onOpenClip: (video: GamingVideo) => void;
}) {
  const [quality, setQuality] = useState(initialQuality);
  const [envMap, setEnvMap] = useState<THREE.Texture | null>(null);
  const stage = useStageState();
  const look = useMemo(() => lookFor(light), [light]);

  useEffect(() => setQuality(initialQuality), [initialQuality]);

  // Profile data is in hand by the time the stage mounts, so calibration runs short.
  useEffect(() => {
    boot.ready = true;
  }, []);

  const openProject = useMemo(
    () => profile.projects.find((p) => p.project_id === stage.openProject) ?? null,
    [profile.projects, stage.openProject]
  );

  return (
    <Canvas
      className="prism-canvas"
      aria-hidden="true"
      dpr={[1, quality.dpr]}
      gl={{
        antialias: quality.antialias,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 50, near: 0.1, far: 420, position: [0, 0.25, 7.4] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        // R3F spreads unknown props onto its wrapper div, so the canvas itself has
        // to be marked here. Everything readable is in the DOM overlay.
        gl.domElement.setAttribute('aria-hidden', 'true');
        gl.domElement.setAttribute('role', 'presentation');
      }}
    >
      <Housekeeping />
      <Environment light={light} onReady={setEnvMap} />
      <FrameProbe quality={quality} onDemote={() => setQuality((q) => demote(q))} />
      <CameraRig parallax={quality.tier === 'low' ? 0.4 : 1} />
      <CloudPointer />

      <Act00Calibration quality={quality} />

      <Act01Prism
        quality={quality}
        look={look}
        envMap={envMap}
        name={profile.info.full_name}
        designations={profile.info.designations}
      />
      <Act02Background
        look={look}
        envMap={envMap}
        educations={profile.educations}
        experiences={profile.experiences}
      />
      {/* The tag sphere carries its own colour, so it needs no environment map. */}
      <Act03Cloud look={look} expertises={profile.expertises} />
      <Act04Turbine look={look} envMap={envMap} skills={profile.skills} />
      <Act05Achievements
        look={look}
        envMap={envMap}
        achievements={profile.achievements}
        onSelect={stage.setAchievement}
      />
      <Act06Works
        quality={quality}
        look={look}
        envMap={envMap}
        projects={profile.projects}
        onOpen={stage.setOpenProject}
      />
      <Act06bCase quality={quality} look={look} envMap={envMap} project={openProject} />
      <Act07Hobbies look={look} gallery={profile.gallery} onSelect={stage.setLightbox} />
      <Act08Arcade look={look} onSelect={onOpenClip} />
      <Act09Contact quality={quality} look={look} envMap={envMap} />

      <ShardPool quality={quality} envMap={envMap} />
      <DustField quality={quality} look={look} />
    </Canvas>
  );
}
