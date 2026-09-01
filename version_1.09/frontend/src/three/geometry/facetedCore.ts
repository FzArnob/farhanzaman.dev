import * as THREE from 'three';

/** Deterministic PRNG — the same project_id always yields the same crystal. */
export function mulberry(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * A project vessel: an icosahedron whose vertices are pushed out by a seeded amount.
 *
 * Detail 0 keeps it to 20 big facets, which is what makes it read as a shard of
 * something rather than a lumpy ball. The displacement is keyed on the rounded vertex
 * position so the triangles that share a corner move together — PolyhedronGeometry is
 * non-indexed, so displacing per-vertex-index would tear the mesh open.
 */
export function facetedCoreGeometry(seed: number, radius = 1, detail = 0): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const rnd = mulberry(seed * 7919 + 13);
  const scaleFor = new Map<string, number>();
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const key = `${Math.round(v.x * 900)}|${Math.round(v.y * 900)}|${Math.round(v.z * 900)}`;
    let s = scaleFor.get(key);
    if (s === undefined) {
      s = 0.62 + rnd() * 0.76;
      scaleFor.set(key, s);
    }
    pos.setXYZ(i, v.x * s, v.y * s, v.z * s);
  }

  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * A hexagonal tile for the achievement constellation: a flat prism with a slight
 * bevel, so it catches a highlight when it turns edge-on.
 */
export function hexTileGeometry(radius = 1, thickness = 0.12): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.03,
    bevelSegments: 1,
    curveSegments: 1,
  });
  geo.center();
  return geo;
}

/**
 * One glass blade for the skills turbine. Length carries the percentage and the twist
 * carries the duration, so both numbers live in one mark.
 */
export function bladeGeometry(length: number, width = 0.34, twist = 0): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(width, 0.07, length, 1, 1, 6);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const half = length / 2;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Twist about the blade's own long axis, ramping from root to tip.
    const k = (v.z + half) / length;
    const a = twist * k;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // Taper the tip so the blade reads as an aerofoil rather than a stick.
    const taper = 1 - 0.45 * k;
    pos.setXYZ(i, (v.x * c - v.y * s) * taper, (v.x * s + v.y * c) * taper, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
