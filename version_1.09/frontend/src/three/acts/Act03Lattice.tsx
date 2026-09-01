import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildExpertiseGraph } from '../../lib/expertiseGraph';
import type { Expertise, Project } from '../../types/profile';
import type { WorldLook } from '../materials/palette';
import { bandColor } from '../materials/palette';
import { TEAL } from '../materials/presets';
import { latticeState } from '../liveState';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence } from '../timeline';

/**
 * Act 03 — The Lattice.
 *
 * 23 expertise nodes on an icosahedral shell. Radius carries duration, emission
 * carries level, and the edges are the co-occurrence graph derived in
 * lib/expertiseGraph.ts — two nodes are joined when a real project used both.
 *
 * Drag spins it. On touch the drag is horizontal-only, so a vertical swipe always
 * belongs to the page and never gets swallowed here.
 */

export { latticeState };

const _v = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/**
 * Fibonacci sphere: an even spread for any node count, so adding a 24th expertise in
 * the admin editor re-solves the layout instead of leaving a gap.
 */
function shellPositions(count: number, radius: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return out;
}

export function Act03Lattice({
  look,
  expertises,
  projects,
}: {
  look: WorldLook;
  expertises: Expertise[];
  projects: Project[];
}) {
  const rig = useScrollRig();
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);
  const shellRef = useRef<THREE.LineSegments>(null);
  const act = ACT_BY_ID.lattice;

  const graph = useMemo(() => buildExpertiseGraph(expertises, projects), [expertises, projects]);
  const positions = useMemo(
    () => shellPositions(graph.nodes.length, WORLD.lattice.radius),
    [graph.nodes.length]
  );

  const nodeGeometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  /**
   * Basic, not standard: a node is a signal, not a surface. It carries its own
   * colour at full strength regardless of where the lights are, which is what makes
   * "glow = level" legible — and it is one uniform instead of a lighting solve.
   */
  const nodeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        // NOT vertexColors: that switches on USE_COLOR, which multiplies by a
        // per-vertex `color` attribute this geometry has not got — the result is
        // black. instanceColor alone is what an InstancedMesh needs.
        transparent: true,
        opacity: 1,
        toneMapped: false,
      }),
    []
  );
  useEffect(
    () => () => {
      nodeGeometry.dispose();
      nodeMaterial.dispose();
    },
    [nodeGeometry, nodeMaterial]
  );

  /** Edge geometry: one segment pair per co-occurrence, colour written per vertex. */
  const edgeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array(graph.edges.length * 6);
    const colors = new Float32Array(graph.edges.length * 6);
    graph.edges.forEach((edge, i) => {
      const a = positions[edge.a];
      const b = positions[edge.b];
      verts.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    });
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [graph.edges, positions]);

  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  /** The containing shell, drawn as a faint icosahedral wireframe for scale. */
  const shellGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(WORLD.lattice.radius * 1.04, 1)),
    []
  );
  useEffect(() => () => shellGeometry.dispose(), [shellGeometry]);

  // Colours are static per node; only scale and emissive change per frame.
  useEffect(() => {
    const mesh = nodesRef.current;
    if (!mesh) return;
    graph.nodes.forEach((node, i) => {
      /*
        Level reads twice over: as hue along the dispersion band (advanced at the
        teal end, beginner at the crimson end) and as brightness. Two channels, so
        it survives a colour-blind viewer and a dim screen — and the band is used
        rather than a straight teal→crimson lerp because that one crosses grey and
        turned every intermediate node to mud.
      */
      bandColor(1 - node.glow, _c);
      _c.multiplyScalar(0.5 + node.glow * 0.5);
      mesh.setColorAt(i, _c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // setColorAt creates instanceColor lazily; the material compiled before that
    // existed, so it needs one recompile or every node draws black.
    nodeMaterial.needsUpdate = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }, [graph.nodes, nodeMaterial]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.04, 0.04);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const spinGroup = spinRef.current!;
    const mesh = nodesRef.current!;
    const time = state.clock.elapsedTime;

    // Drag momentum, then a slow idle turn so it never looks frozen.
    latticeState.spin += latticeState.spinVelocity * delta;
    latticeState.spinVelocity *= Math.exp(-delta * 3.2);
    spinGroup.rotation.y = latticeState.spin + time * 0.05;
    spinGroup.rotation.x = Math.sin(time * 0.13) * 0.12;

    const selected = latticeState.selected;
    const hovered = latticeState.hovered;
    const active = selected >= 0 ? selected : hovered;
    const neighbours = active >= 0 ? graph.neighbours[active] : null;

    graph.nodes.forEach((node, i) => {
      const base = 0.11 + node.weight * 0.27;
      const isActive = i === active;
      const isNeighbour = neighbours ? neighbours.includes(i) : false;
      const dim = active >= 0 && !isActive && !isNeighbour ? 0.55 : 1;
      const target = base * (isActive ? 1.75 : isNeighbour ? 1.25 : 1) * dim;

      _v.copy(positions[i]);
      // Selected node eases outward so it reads as "brought to the front".
      if (isActive) _v.multiplyScalar(1.1);
      _s.setScalar(target);
      _m.compose(_v, _q.identity(), _s);
      mesh.setMatrixAt(i, _m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    nodeMaterial.opacity = presence;

    // Edges ignite around whatever is active; everything else stays a hairline.
    const colors = edgeGeometry.attributes.color as THREE.BufferAttribute;
    graph.edges.forEach((edge, i) => {
      const touches = active >= 0 && (edge.a === active || edge.b === active);
      const lit = touches ? 1 : active >= 0 ? 0.08 : 0.15;
      const strength = lit * presence * Math.min(1, 0.4 + edge.shared * 0.3);
      _c.setHex(TEAL).multiplyScalar(strength);
      colors.setXYZ(i * 2, _c.r, _c.g, _c.b);
      colors.setXYZ(i * 2 + 1, _c.r, _c.g, _c.b);
    });
    colors.needsUpdate = true;

    if (edgeRef.current) {
      (edgeRef.current.material as THREE.LineBasicMaterial).opacity = presence;
    }
    if (shellRef.current) {
      (shellRef.current.material as THREE.LineBasicMaterial).opacity = presence * 0.16;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, WORLD.lattice.z]}>
      <group ref={spinRef}>
        <lineSegments ref={shellRef} geometry={shellGeometry}>
          <lineBasicMaterial color={TEAL} transparent opacity={0.16} toneMapped={false} />
        </lineSegments>
        <lineSegments ref={edgeRef} geometry={edgeGeometry}>
          <lineBasicMaterial
            vertexColors
            transparent
            opacity={1}
            blending={look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
        <instancedMesh
          ref={nodesRef}
          args={[nodeGeometry, nodeMaterial, graph.nodes.length]}
          frustumCulled={false}
          name="lattice-nodes"
        />
      </group>
      {/* The nodes light themselves; these only pick out the shell wireframe. */}
      <pointLight position={[14, 10, 14]} intensity={look.bloom ? 18 : 8} color={TEAL} distance={60} />
    </group>
  );
}

