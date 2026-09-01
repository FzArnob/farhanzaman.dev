import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { demote, type Quality } from '../lib/quality';
import type { Profile } from '../types/profile';
import type { GamingVideo } from '../types/gaming';
import { CameraRig } from './CameraRig';
import { Act00Calibration } from './acts/Act00Calibration';
import { Act01Prism } from './acts/Act01Prism';
import { Act02Spine } from './acts/Act02Spine';
import { Act03Lattice } from './acts/Act03Lattice';
import { boot, latticeState } from './liveState';
import { Act04Turbine } from './acts/Act04Turbine';
import { Act05Forge } from './acts/Act05Forge';
import { Act05bCore } from './acts/Act05bCore';
import { Act06Constellation } from './acts/Act06Constellation';
import { Act07Gallery } from './acts/Act07Gallery';
import { Act07bArcade } from './acts/Act07bArcade';
import { Act08Sync } from './acts/Act08Sync';
import { DustField } from './fx/DustField';
import { ShardPool } from './fx/ShardPool';
import { buildEnvTexture, lookFor } from './materials/palette';
import { disposeLabelCache } from './materials/labels';
import { useStageState } from './StageState';
import { disposeTextureCache } from './useRemoteTexture';

/**
 * One canvas, forever.
 *
 * It mounts once and never unmounts. Acts inside it appear and disappear by scroll
 * proximity, so peak scene cost stays flat however much content the admin editor adds
 * later. The canvas itself is aria-hidden: not a character of the copy lives in a
 * texture, and deleting this component leaves a readable site behind.
 */

/**
 * Bloom, chromatic aberration and SMAA come from postprocessing, which is a third of
 * the 3D chunk on its own. Split out so the scene renders first and the polish lands a
 * beat later — and so the low tier, which uses none of it, never downloads it.
 */
const PostFX = lazy(() => import('./fx/PostFX').then((m) => ({ default: m.PostFX })));

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
 * real frames disagrees, the tier drops. Runs once — a demotion mid-scroll would be
 * more jarring than the frames it saves.
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

/** Pointer interaction that needs a raycast against instanced geometry. */
function LatticePointer() {
  const { camera, gl, scene } = useThree();
  const stage = useStageState();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const drag = useRef<{ active: boolean; x: number; moved: number } | null>(null);

  useEffect(() => {
    const element = gl.domElement;

    const hitNode = (event: PointerEvent): number => {
      const rect = element.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const mesh = scene.getObjectByName('lattice-nodes') as THREE.InstancedMesh | undefined;
      if (!mesh || !mesh.visible) return -1;
      const hits = raycaster.intersectObject(mesh, false);
      return hits.length > 0 && hits[0].instanceId !== undefined ? hits[0].instanceId : -1;
    };

    const onDown = (event: PointerEvent) => {
      // Mouse only: on touch, a vertical swipe must always belong to the page.
      drag.current = { active: true, x: event.clientX, moved: 0 };
    };

    const onMove = (event: PointerEvent) => {
      const d = drag.current;
      if (d?.active) {
        const dx = event.clientX - d.x;
        d.x = event.clientX;
        d.moved += Math.abs(dx);
        // Horizontal-only, so the page keeps every vertical gesture.
        latticeState.spinVelocity = dx * 0.02;
        return;
      }
      latticeState.hovered = hitNode(event);
    };

    const onUp = (event: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      // A drag is a spin; only a genuine tap selects.
      if (d.moved > 6) return;
      const index = hitNode(event);
      if (index >= 0) {
        stage.setExpertise(latticeState.selected === index ? -1 : index);
        latticeState.selected = latticeState.selected === index ? -1 : index;
      }
    };

    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    return () => {
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [camera, gl, scene, raycaster, pointer, stage]);

  // Keep the module-level mirror in step when the overlay changes the selection.
  useEffect(() => {
    latticeState.selected = stage.expertise;
  }, [stage.expertise]);

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
        // The transmission pass needs to read the frame it is refracting.
        preserveDrawingBuffer: false,
      }}
      camera={{ fov: 50, near: 0.1, far: 340, position: [0, 0.2, 6] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        // R3F spreads unknown props onto its wrapper div, so the canvas itself has
        // to be marked here. Everything readable is in the DOM overlay; the canvas
        // is decoration and must not appear in the accessibility tree.
        gl.domElement.setAttribute('aria-hidden', 'true');
        gl.domElement.setAttribute('role', 'presentation');
      }}
    >
      <Housekeeping />
      <Environment light={light} onReady={setEnvMap} />
      <FrameProbe quality={quality} onDemote={() => setQuality((q) => demote(q))} />
      <CameraRig parallax={quality.tier === 'low' ? 0.4 : 1} />
      <LatticePointer />

      <Act00Calibration quality={quality} />

      <Act01Prism
        quality={quality}
        look={look}
        envMap={envMap}
        name={profile.info.full_name}
        designations={profile.info.designations}
      />
      <Act02Spine
        look={look}
        envMap={envMap}
        educations={profile.educations}
        experiences={profile.experiences}
      />
      {/* The lattice nodes carry their own colour, so it needs no environment map. */}
      <Act03Lattice look={look} expertises={profile.expertises} projects={profile.projects} />
      <Act04Turbine look={look} envMap={envMap} skills={profile.skills} />
      <Act05Forge
        quality={quality}
        look={look}
        envMap={envMap}
        projects={profile.projects}
        onOpen={stage.setOpenProject}
      />
      <Act05bCore quality={quality} look={look} envMap={envMap} project={openProject} />
      <Act06Constellation
        look={look}
        envMap={envMap}
        achievements={profile.achievements}
        onSelect={stage.setAchievement}
      />
      <Act07Gallery look={look} gallery={profile.gallery} onSelect={stage.setLightbox} />
      <Act07bArcade look={look} onSelect={onOpenClip} />
      {/* The address stays in the DOM overlay, where it is a real mailto link. */}
      <Act08Sync quality={quality} look={look} envMap={envMap} headline="Let’s build something" />

      <ShardPool quality={quality} envMap={envMap} />
      <DustField quality={quality} look={look} />
      {quality.tier !== 'low' && (
        <Suspense fallback={null}>
          <PostFX quality={quality} look={look} />
        </Suspense>
      )}
    </Canvas>
  );
}

