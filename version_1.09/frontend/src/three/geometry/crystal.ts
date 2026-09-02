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
 * A prism, in the mineral sense: a hexagonal column with pyramidal caps, the shape a
 * quartz crystal actually grows into.
 *
 * The first pass used a displaced icosahedron, which reads as a lumpy rock rather
 * than a prism — and the whole metaphor is optical, so the projects have to look like
 * something light would pass through. This is built from an explicit vertex ring so
 * the facets stay flat and large: six long faces that catch the key light one at a
 * time as it turns, which is what makes it glint.
 *
 * Seeded per project: height, girth, cap length and a slight taper all vary, so the
 * eight are recognisably one family and never the same object twice. ~28 triangles.
 */
export function crystalGeometry(seed: number, scale = 1): THREE.BufferGeometry {
  const rnd = mulberry(seed * 7919 + 13);

  const sides = 6;
  const radius = (0.62 + rnd() * 0.28) * scale;
  const half = (1.0 + rnd() * 0.55) * scale; // half the column height
  const cap = (0.55 + rnd() * 0.5) * scale; // how far each pyramid reaches
  const taper = 0.78 + rnd() * 0.18; // the top ring is a little narrower
  const twist = rnd() * 0.5; // the two rings are not in register
  const lean = (rnd() - 0.5) * 0.22; // a slight lean, so none stands to attention

  const positions: number[] = [];
  const uvs: number[] = [];

  const ring = (y: number, r: number, rot: number) =>
    Array.from({ length: sides }, (_, i) => {
      const a = (i / sides) * Math.PI * 2 + rot;
      return new THREE.Vector3(Math.cos(a) * r + y * lean, y, Math.sin(a) * r);
    });

  const lower = ring(-half, radius, 0);
  const upper = ring(half, radius * taper, twist);
  const tip = new THREE.Vector3(half * lean + lean * cap, half + cap, 0);
  const base = new THREE.Vector3(-half * lean - lean * cap, -half - cap, 0);

  const push = (v: THREE.Vector3, u: number, w: number) => {
    positions.push(v.x, v.y, v.z);
    uvs.push(u, w);
  };

  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    // Each long face gets the full width of the texture, so a project's artwork
    // reads once per facet instead of being sliced six ways.
    const u0 = 0;
    const u1 = 1;

    // Column: two triangles per face.
    push(lower[i], u0, 0.12);
    push(lower[j], u1, 0.12);
    push(upper[j], u1, 0.88);

    push(lower[i], u0, 0.12);
    push(upper[j], u1, 0.88);
    push(upper[i], u0, 0.88);

    // Top pyramid.
    push(upper[i], u0, 0.88);
    push(upper[j], u1, 0.88);
    push(tip, 0.5, 1);

    // Bottom pyramid.
    push(lower[j], u1, 0.12);
    push(lower[i], u0, 0.12);
    push(base, 0.5, 0);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * A small floating shard: a squat four-sided crystal. Used by the instanced pool, so
 * it has to be as cheap as possible while still catching a highlight.
 */
export function shardGeometry(): THREE.BufferGeometry {
  const geo = new THREE.OctahedronGeometry(0.15, 0);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  // Squash one axis so a shard reads as a flake rather than a die.
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * 0.45);
  geo.computeVertexNormals();
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
    const t = 1 - 0.45 * k;
    pos.setXYZ(i, (v.x * c - v.y * s) * t, (v.x * s + v.y * c) * t, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
