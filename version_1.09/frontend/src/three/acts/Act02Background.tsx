import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Education, Experience } from '../../types/profile';
import type { WorldLook } from '../materials/palette';
import { panelTexture } from '../materials/labels';
import { CRIMSON, TEAL, TEAL_RGB, glowSprite } from '../materials/presets';
import { useScrollRig } from '../ScrollRig';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/**
 * Act 02 — The Spine.
 *
 * Time becomes depth: a block's Z is its date, so the corridor you fly down is a
 * timeline you travel, and education and experience are visibly simultaneous — the one
 * thing two stacked HTML timelines cannot show. Dates set the order and the direction;
 * spaceOut then guarantees each block enough room to actually be read, because the
 * real history clusters and a to-scale corridor hid two roles behind a third.
 *
 * The blocks used to line two walls at x = ±7.4 and carry a name and a year range.
 * They now cluster around the teal cable, and each one carries the whole entry —
 * institute, role, dates and what happened there — because the overlay no longer
 * prints any of it. Act 02's copy is a teaser and a See More; this IS the timeline.
 *
 * Nothing here is a perfect rectangle. Every block is a quadrilateral with jittered
 * corners and one chamfered corner, seeded from Math.random at mount, so the corridor
 * is recognisably the same place on every load without being the same drawing.
 *
 * You arrive at *now* at the near end and stop there. The present is the destination.
 */

interface Slab {
  id: string;
  kind: 'education' | 'experience';
  title: string;
  role: string;
  dates: string;
  detail: string;
  z: number;
  present: boolean;
}

/** Where the cable and the two rows sit, per orientation. */
interface Layout {
  /** Height of the cable itself — the line everything else is measured from. */
  cableY: number;
  /** Sideways offset from the cable. */
  lateral: number;
  /** How far above the cable the education row floats... */
  above: number;
  /** ...and how far below it the experience row does. */
  below: number;
  width: number;
  height: number;
  /** Least distance in Z between two blocks in the SAME row. See spaceOut. */
  minGap: number;
  detailLines: number;
  typeScale: number;
}

/*
  Landscape reads left-and-right of the line; portrait reads above-and-below it.

  That is not a nicety. three's `fov` is VERTICAL, so a portrait phone at 50 degrees
  has a horizontal field under a third of a desktop's — anything placed sideways is
  simply off screen there, which is exactly what the old wall at x = ±7.4 was. Height
  is the one axis a phone has to spare, so on a phone the corridor stacks instead of
  widening and the camera flies down the gap between the two rows.

  Both layouts are also composed against the DOM: the act's copy owns the bottom left,
  so the rows are biased off that corner rather than centred on the camera. On a phone
  that means lifting the cable itself to the middle of the frame, which is where a
  phone has room for it anyway.
*/
const LANDSCAPE: Layout = {
  cableY: -0.7,
  lateral: 3.3,
  above: 0.78,
  below: 0.55,
  width: 3.5,
  height: 1.6,
  minGap: 8,
  detailLines: 2,
  typeScale: 1,
};

/*
  Portrait is tuned for the narrowest screen it has to work on — 320 CSS px — rather
  than for a comfortable phone, because a block that is legible at 320 is legible
  everywhere. That means taller blocks (portrait has height to spare) carrying larger
  type and a single line of description; the full text of every entry is one tap away
  on /about, and a paragraph shrunk to fit here would be decorative, not readable.
*/
const PORTRAIT: Layout = {
  cableY: 0.15,
  lateral: 0.3,
  above: 2.1,
  below: 2.2,
  width: 2.7,
  height: 1.9,
  minGap: 9,
  detailLines: 1,
  typeScale: 1.3,
};

/** How far inside the block's nominal bounds the type sits, in world units. */
const FACE_INSET = 0.3;
const DEPTH = 0.11;

function year(date: string | null): number {
  if (!date) return new Date().getFullYear();
  const y = parseInt(String(date).slice(0, 4), 10);
  return Number.isFinite(y) ? y : new Date().getFullYear();
}

/** Strips the markup the admin editor leaves in `activity` and `project_details`. */
function plain(html: string | null): string {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Guarantees every block in a row its own moment on screen.
 *
 * Dates alone bunch badly, and the real data is the proof: the three roles have
 * midpoints in 2019, 2021 and 2024 against a corridor that spans 2009 to now, which
 * put them 3–4 units apart — close enough that the newest two overlapped on screen
 * and the third was hidden behind them. Order and direction still come from the
 * dates; this only pushes neighbours apart until each one can be read.
 *
 * The gap collapses to whatever the corridor can afford if a row ever grows long
 * enough that the requested spacing will not fit, so the row can never run past
 * either end of the cable.
 */
function spaceOut(rows: Slab[], minGap: number, zNear: number, zFar: number): void {
  if (rows.length < 2) return;
  rows.sort((a, b) => a.z - b.z);
  const gap = Math.min(minGap, (zNear - zFar) / (rows.length - 1));

  for (let i = 1; i < rows.length; i++) {
    rows[i].z = Math.max(rows[i].z, rows[i - 1].z + gap);
  }
  // Pushing forward can run the newest entry past the near end; sliding the whole
  // row back preserves every gap, and the far end then lands inside zFar by
  // construction, because the gap was capped at the corridor's own length.
  const over = rows[rows.length - 1].z - zNear;
  if (over > 0) for (const r of rows) r.z -= over;
}

export function buildSpine(
  educations: Education[],
  experiences: Experience[],
  minGap = 8
): Slab[] {
  const rows: Slab[] = [];
  const all = [
    ...educations.map((e) => ({ kind: 'education' as const, row: e })),
    ...experiences.map((e) => ({ kind: 'experience' as const, row: e })),
  ];

  // The corridor spans the whole career, oldest at the far end.
  const starts = all.map((a) => year(a.row.start_date));
  const ends = all.map((a) =>
    a.row.is_present === '1' ? new Date().getFullYear() : year(a.row.end_date)
  );
  const minYear = Math.min(...starts);
  const maxYear = Math.max(...ends);
  const span = Math.max(1, maxYear - minYear);

  const { zNear, zFar } = WORLD.background;
  for (const { kind, row } of all) {
    const from = year(row.start_date);
    const to = row.is_present === '1' ? new Date().getFullYear() : year(row.end_date);
    // Oldest to zFar, newest to zNear.
    const mid = (from + to) / 2;
    const k = (mid - minYear) / span;
    const education = kind === 'education';
    rows.push({
      id: kind + '-' + ('education_id' in row ? row.education_id : row.experience_id),
      kind,
      title: row.institute_name,
      role: education ? (row as Education).subject : (row as Experience).position,
      dates: from + ' → ' + (row.is_present === '1' ? 'now' : to),
      detail: education
        ? plain((row as Education).activity)
        : plain((row as Experience).project_details),
      z: zFar + (zNear - zFar) * k,
      present: row.is_present === '1',
    });
  }

  /*
    Each row is spaced on its own, then the roles are held half a gap further out.

    Spacing them independently lands both rows on the same depths — the two histories
    run in parallel, so their date order is the same order — and a pair arriving
    together is two things to read at once and half the corridor left empty. Offsetting
    one row interleaves them: education, role, education, role, one block at a time,
    each on its own side of the line.
  */
  spaceOut(rows.filter((r) => r.kind === 'education'), minGap, zNear, zFar);
  spaceOut(rows.filter((r) => r.kind === 'experience'), minGap, zNear - minGap / 2, zFar);

  return rows.sort((a, b) => a.z - b.z);
}

/** A point `d` of the way from (x,y) toward (tx,ty), never past 42% of the span. */
function towards(x: number, y: number, tx: number, ty: number, d: number): [number, number] {
  const dx = tx - x;
  const dy = ty - y;
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(d / len, 0.42);
  return [x + dx * k, y + dy * k];
}

/**
 * A block face: a rectangle knocked out of true.
 *
 * Corners take a few percent of jitter and exactly one is chamfered. The bounds stay
 * broadly rectangular on purpose — four lines of type have to sit inside and stay
 * inside as the block yaws — and FACE_INSET is set wide enough that neither the
 * jitter nor the chamfer can ever reach a word.
 */
function blockShape(w: number, h: number, rnd: () => number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const unit = Math.min(w, h);
  const j = () => (rnd() - 0.5) * unit * 0.08;
  const pts: [number, number][] = [
    [-hw + j(), hh + j()],
    [hw + j(), hh + j()],
    [hw + j(), -hh + j()],
    [-hw + j(), -hh + j()],
  ];

  const cut = Math.floor(rnd() * 4);
  const size = unit * (0.1 + rnd() * 0.18);

  const shape = new THREE.Shape();
  for (let i = 0; i < 4; i++) {
    const [x, y] = pts[i];
    if (i === cut) {
      const prev = pts[(i + 3) % 4];
      const next = pts[(i + 1) % 4];
      const a = towards(x, y, prev[0], prev[1], size);
      const b = towards(x, y, next[0], next[1], size);
      if (i === 0) shape.moveTo(a[0], a[1]);
      else shape.lineTo(a[0], a[1]);
      shape.lineTo(b[0], b[1]);
    } else if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

export function Act02Background({
  look,
  envMap,
  educations,
  experiences,
}: {
  look: WorldLook;
  envMap: THREE.Texture | null;
  educations: Education[];
  experiences: Experience[];
}) {
  const rig = useScrollRig();
  const size = useThree((s) => s.size);
  const groupRef = useRef<THREE.Group>(null);
  const slabRefs = useRef<THREE.Group[]>([]);
  const act = ACT_BY_ID.background;

  // One threshold, not a curve: the two layouts are different arrangements rather
  // than two ends of a scale, so there is nothing sensible to interpolate between.
  const layout = size.width / Math.max(1, size.height) < 1.1 ? PORTRAIT : LANDSCAPE;

  const slabs = useMemo(
    () => buildSpine(educations, experiences, layout.minGap),
    [educations, experiences, layout.minGap]
  );

  const slabMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: look.slab,
        roughness: 0.5,
        metalness: 0.14,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      }),
    [look.slab]
  );

  useEffect(() => {
    slabMaterial.envMap = envMap;
    slabMaterial.needsUpdate = true;
  }, [slabMaterial, envMap]);

  useEffect(() => () => slabMaterial.dispose(), [slabMaterial]);

  const cable = useMemo(() => {
    const { zNear, zFar } = WORLD.background;
    const length = Math.abs(zNear - zFar) + 6;
    const geo = new THREE.CylinderGeometry(0.014, 0.014, length, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: TEAL,
      transparent: true,
      opacity: 0.5,
      blending: look.bloom ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(0, layout.cableY, (zNear + zFar) / 2);
    return mesh;
  }, [look.bloom, layout]);

  useEffect(
    () => () => {
      cable.geometry.dispose();
      (cable.material as THREE.Material).dispose();
    },
    [cable]
  );

  const pulses = useMemo(() => [0, 1, 2].map(() => glowSprite(TEAL_RGB, 1.3, 0.95)), []);
  useEffect(() => () => pulses.forEach((p) => p.material.dispose()), [pulses]);

  /**
   * Geometry and placement per block. Rebuilt when the layout flips, which is the
   * only time a block's proportions change. Math.random rather than a fixed seed is
   * the whole point: the corridor is re-cut on every load.
   */
  const blocks = useMemo(() => {
    const rnd = Math.random;
    return slabs.map((slab, i) => {
      const education = slab.kind === 'education';
      const side = education ? -1 : 1;

      // Per-block variation, so the two rows are not two straight lines of clones.
      const wobble = 0.82 + rnd() * 0.36;
      const w = layout.width * (0.94 + rnd() * 0.12);
      const h = layout.height * (0.94 + rnd() * 0.12);

      const shape = blockShape(w, h, rnd);
      const box = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
      // ExtrudeGeometry grows along +Z from the shape plane; recentre it on the face.
      box.translate(0, 0, -DEPTH / 2);

      return {
        box,
        edges: new THREE.EdgesGeometry(box),
        w,
        h,
        x: side * layout.lateral * wobble,
        y: layout.cableY + (education ? layout.above : -layout.below) * wobble,
        // A slight roll, alternating, so they read as floating rather than mounted.
        roll: (rnd() - 0.5) * 0.12 + (i % 2 ? 0.03 : -0.03),
        baseYaw: education ? 0.42 : -0.42,
      };
    });
  }, [slabs, layout]);

  useEffect(
    () => () =>
      blocks.forEach((b) => {
        b.box.dispose();
        b.edges.dispose();
      }),
    [blocks]
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = rig.state.current.t;
    const presence = actPresence(t, act, 0.04, 0.04);
    group.visible = presence > 0.005;
    if (!group.visible) return;

    const time = state.clock.elapsedTime;
    const camZ = state.camera.position.z;
    slabMaterial.opacity = presence * 0.9;
    (cable.material as THREE.MeshBasicMaterial).opacity = presence * 0.5;

    blocks.forEach((block, i) => {
      const node = slabRefs.current[i];
      if (!node) return;
      const slab = slabs[i];
      /*
        Each block turns to face you at closest approach and falls back after. That
        is what makes the pass readable: held at a fixed yaw a block is either edge on
        for most of the fly-past, or never angled at all.
      */
      const dist = Math.abs(camZ - slab.z);
      const near = clamp01(1 - dist / 13);
      node.rotation.y = block.baseYaw * (1 - near * 0.9);
      node.rotation.z = block.roll * (1 - near * 0.6);
      // A slow bob, phase-shifted per block, so the corridor is never quite still.
      node.position.y = block.y + Math.sin(time * 0.5 + i * 1.7) * 0.07 + near * 0.1;
      node.scale.setScalar(1 + near * 0.07);
    });

    // Pulses travel toward you along the cable: the present is drawing closer.
    const { zNear, zFar } = WORLD.background;
    pulses.forEach((p, i) => {
      const u = (time * 0.19 + i / pulses.length) % 1;
      p.position.set(0, layout.cableY, zFar + (zNear - zFar) * u);
      p.material.opacity = presence * 0.9 * Math.sin(u * Math.PI) * look.glow;
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={cable} />
      {pulses.map((p, i) => (
        <primitive key={i} object={p} />
      ))}

      {slabs.map((slab, i) => {
        const block = blocks[i];
        const isEdu = slab.kind === 'education';
        const accent = isEdu ? '#00d3b4' : '#fd2155';
        const faceW = block.w - FACE_INSET;
        const faceH = block.h - FACE_INSET;
        return (
          <group
            key={slab.id}
            ref={(el) => {
              if (el) slabRefs.current[i] = el;
            }}
            position={[block.x, block.y, slab.z]}
          >
            <mesh geometry={block.box} material={slabMaterial} />
            {/* Edge wire in the row's colour; a live edge if the role is current. */}
            <lineSegments geometry={block.edges}>
              <lineBasicMaterial
                color={isEdu ? TEAL : CRIMSON}
                transparent
                opacity={slab.present ? 0.95 : 0.5}
                toneMapped={false}
              />
            </lineSegments>
            <mesh position={[0, 0, DEPTH / 2 + 0.005]}>
              <planeGeometry args={[faceW, faceH]} />
              <meshBasicMaterial
                map={panelTexture({
                  title: slab.title,
                  role: slab.role,
                  dates: slab.dates + (slab.present ? '  ●' : ''),
                  detail: slab.detail,
                  accent,
                  light: !look.bloom,
                  width: 768,
                  height: Math.round((768 * faceH) / faceW),
                  detailLines: layout.detailLines,
                  typeScale: layout.typeScale,
                })}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
