import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { boot } from './liveState';
import { useScrollRig } from './ScrollRig';
import { useStageState } from './StageState';
import { CAMERA_KEYS, WORLD, clamp01, smooth } from './timeline';

/**
 * One camera on one path. Sections are places, so the transitions between them are
 * travel rather than crossfades — the whole reason the page reads as a world instead
 * of eight widgets sharing a canvas.
 *
 * Piecewise-eased through CAMERA_KEYS rather than a spline through them, because the
 * acts need the camera to be exactly where the keyframe says at each boundary; a
 * Catmull-Rom's arc-length reparameterisation would slide it off by a few percent and
 * the works ring would no longer be centred at the hub.
 */

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _overridePos = new THREE.Vector3();
const _overrideLook = new THREE.Vector3();

function sample(t: number, outPos: THREE.Vector3, outLook: THREE.Vector3): void {
  let i = 0;
  while (i < CAMERA_KEYS.length - 2 && t > CAMERA_KEYS[i + 1].t) i++;
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[i + 1];
  const u = smooth((t - a.t) / (b.t - a.t));
  outPos.set(
    THREE.MathUtils.lerp(a.p[0], b.p[0], u),
    THREE.MathUtils.lerp(a.p[1], b.p[1], u),
    THREE.MathUtils.lerp(a.p[2], b.p[2], u)
  );
  outLook.set(
    THREE.MathUtils.lerp(a.l[0], b.l[0], u),
    THREE.MathUtils.lerp(a.l[1], b.l[1], u),
    THREE.MathUtils.lerp(a.l[2], b.l[2], u)
  );
}

export function CameraRig({ parallax = 1 }: { parallax?: number }) {
  const camera = useThree((s) => s.camera);
  const rig = useScrollRig();
  const stage = useStageState();

  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const blend = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_state, delta) => {
    const t = rig.state.current.t;
    sample(t, _pos, _look);

    /**
     * Core open: the camera leaves the spline and flies through a facet into the
     * chamber. Escape flies it back out to the same ring angle, because `blend` eases
     * both ways and the spline position it returns to is still a function of t.
     */
    const open = stage.refs.openProject.current !== null;
    blend.current = THREE.MathUtils.damp(blend.current, open ? 1 : 0, 2.6, delta);
    if (blend.current > 0.001) {
      const chamberZ = WORLD.works.z - WORLD.works.radius;
      _overridePos.set(0, 0.4, chamberZ + 4.2);
      _overrideLook.set(0, 0, chamberZ);
      const k = smooth(clamp01(blend.current));
      _pos.lerp(_overridePos, k);
      _look.lerp(_overrideLook, k);
    }

    // The calibration hold: the camera sits slightly back until the mark has assembled.
    if (!boot.done) {
      const k = 1 - smooth(boot.progress);
      _pos.z += k * 2.6;
    }

    const p = pointer.current;
    p.x = THREE.MathUtils.damp(p.x, p.tx, 3.2, delta);
    p.y = THREE.MathUtils.damp(p.y, p.ty, 3.2, delta);

    camera.position.copy(_pos);
    camera.lookAt(_look);
    // Parallax as a rotation rather than a translation: it never breaks the framing
    // of whichever act the spline has carefully composed.
    const amount = parallax * (1 - blend.current * 0.7);
    camera.rotateY(-p.x * 0.06 * amount);
    camera.rotateX(-p.y * 0.04 * amount);
    // -3: the camera must be final before any act measures its distance.
    // Never use a POSITIVE priority here — R3F would stop auto-rendering.
  }, -3);

  return null;
}
