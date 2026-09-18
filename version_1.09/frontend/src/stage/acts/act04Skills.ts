/**
 * Act 04 — Skills: the crystal core.
 *
 * A dark dodecahedron lit from inside, in a wire cage turning the other way; around
 * it a tilted orbit — three hairline rings and one crystal per skill. The camera
 * arrives slightly above and holds while the scroll brings each skill round to the
 * front in turn, where it swells, brightens and reads out into the DOM overlay. The near half of the orbit carries labels, so the stack
 * reads at a glance and the one at the front reads in full.
 *
 * Two numbers live in each crystal. Its size is the skill's percentage, so the orbit
 * is a chart you can read at a glance; the label carries the percentage and the
 * months exactly. Colour follows the site's two poles and nothing else.
 *
 * The act is written once and runs on either renderer. Everything about the motion —
 * which skill is lit, how far the orbit has turned, where each crystal is — is worked
 * out here in plain numbers. The last step either poses WebGL nodes or writes CSS 3D
 * transforms, and the labels are DOM on both, projected from the same world positions
 * the crystals are drawn at. The reference this follows had a hologram disc of rings on
 * the floor under the core; that was left out on purpose.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { newProjected } from '../camera';
import {
  CssNode,
  CssScene,
  apply,
  buildSolid,
  cssMatrix,
  dodecahedron,
  euler,
  icosahedron,
  mul,
  octahedron,
} from '../css3d';
import { Item, UNIT, el, place, q } from '../dom';
import { stacked } from '../framing';
import type { GLLight, GLNode, Tint } from '../gl/api';
import { CRIMSON_RGB, glowGradient, TEAL_RGB } from '../look';
import { skillsState } from '../liveState';
import { mulberry } from '../shapes';
import { ACT_BY_ID, WORLD, actPresence, clamp01 } from '../timeline';

/** Where the core hangs above the axis the camera travels. */
const CORE_Y = 0.3;
/**
 * The window of scroll the camera holds on the core (timeline.ts has the matching
 * keyframes). The skills are stepped through inside it, not across the whole act, so
 * none of them is read out while the camera is still flying in.
 */
const HOLD: readonly [number, number] = [0.375, 0.435];

const CORE_RADIUS = 1.05;
const CAGE_RADIUS = 1.24;
/** The orbit plane leans toward the camera by this much, so its rings open up. */
const TILT = 0.24;
const RINGS: ReadonlyArray<{ radius: number; y: number; tilt: number; tint: Tint }> = [
  { radius: 2.95, y: 0, tilt: 0.05, tint: 'teal' },
  { radius: 3.55, y: 0.16, tilt: -0.07, tint: 'crimson' },
  { radius: 4.15, y: -0.1, tilt: 0.1, tint: 'teal' },
];
/** Where round the orbit the lit skill is brought to: in front, and a little right. */
const FRONT = 0.95;
/** How much larger the lit skill's card is drawn than the rest. */
const LABEL_GROW = 1.28;

interface Gem {
  name: string;
  percentage: number;
  months: number;
  angle: number;
  radius: number;
  size: number;
  tint: Tint;
  phase: number;
  tumble: [number, number];
  /** Damped scale, so the crystal at the front grows into place rather than snapping. */
  shown: number;
  label: Item;
  labelEl: HTMLElement;
  /** The label's rendered width, read once it has been laid out. */
  labelW: number;
  /** Whether the label currently hangs to the left of its crystal. */
  labelLeft: boolean;
  /** Damped label scale, so the lit skill's card swells rather than snapping. */
  labelGrow: number;
  gl: GLNode | null;
  css: CssNode | null;
}

export function createSkillsAct(ctx: BuildContext): Act {
  const act = ACT_BY_ID.skills;
  const root = el('div', 'pz3-act pz3-act-skills', ctx.host);
  const p = newProjected();
  const look = ctx.look;
  const z0 = WORLD.skills.z;

  const rnd = mulberry(4007);
  const skills = ctx.profile.skills;
  const count = skills.length;
  const step = (Math.PI * 2) / Math.max(1, count);

  /* ------------------------------------------------------------ the numbers */

  const gems: Gem[] = skills.map((skill, i) => {
    const percentage = clamp01(Number(skill.percentage) / 100);
    const months = Number(skill.duration) || 0;

    const labelEl = el('div', 'pz3-skill-label', root);
    const tint: Tint = i % 3 === 1 ? 'crimson' : 'teal';
    if (tint === 'crimson') labelEl.classList.add('is-crimson');
    el('strong', '', labelEl).textContent = skill.name;
    el('small', '', labelEl).textContent = `${Math.round(percentage * 100)}% · ${months} MO`;

    return {
      name: skill.name,
      percentage,
      months,
      angle: i * step,
      // Between the inner and outer rings, never on either, so none sits on a line.
      radius: 3.25 + rnd() * 0.75,
      // A stronger skill is a larger crystal: the orbit reads as a chart at a glance.
      size: 0.16 + percentage * 0.13,
      tint,
      phase: rnd() * Math.PI * 2,
      tumble: [0.22 + rnd() * 0.16, 0.14 + rnd() * 0.14],
      shown: 1,
      label: new Item(labelEl),
      labelEl,
      labelW: 0,
      labelLeft: false,
      labelGrow: 1,
      gl: null,
      css: null,
    };
  });

  /* ------------------------------------------------------ WebGL or CSS 3D */

  let glRig: {
    rig: GLNode;
    core: GLNode;
    cage: GLNode;
    plane: GLNode;
    spin: GLNode;
    halo: GLNode;
    inner: GLLight;
    rim: GLLight;
  } | null = null;

  let cssRig: {
    scene: CssScene;
    box: Item;
    core: CssNode;
    cage: CssNode;
    plane: CssNode;
    spin: CssNode;
    glow: Item;
  } | null = null;

  if (ctx.gl) {
    const gl = ctx.gl;
    const rig = gl.node();
    const core = gl.node(rig);
    gl.solid({ kind: 'core', radius: CORE_RADIUS }, core);
    const cage = gl.solid({ kind: 'cage', radius: CAGE_RADIUS, tint: 'teal' }, rig);
    const plane = gl.node(rig);
    const spin = gl.node(plane);
    for (const ring of RINGS) {
      gl.solid({ kind: 'orbit', radius: ring.radius, tint: ring.tint }, plane).pose(0, ring.y, 0, 0, 0, ring.tilt);
    }
    for (const gem of gems) {
      gem.gl = gl.solid({ kind: 'gem', radius: gem.size, tint: gem.tint }, spin);
    }
    const halo = gl.solid({ kind: 'halo', size: 9, tint: 'teal', strength: 0.24 });
    glRig = {
      rig,
      core,
      cage,
      plane,
      spin,
      halo,
      // The core's own light, from inside it, and a crimson one low and to the right —
      // the reference's two, at well under its strength.
      inner: gl.light('teal', 7, 12),
      rim: gl.light('crimson', 4, 10),
    };
  } else {
    const glowEl = el('div', 'pz3 pz3-glow', root);
    glowEl.style.width = glowEl.style.height = 9 * UNIT + 'px';
    glowEl.style.backgroundImage = glowGradient(TEAL_RGB, 0.42);

    const scene = new CssScene(root, 'pz3-skills-rig');
    const core = new CssNode(scene);
    const coreRgb = look.bloom ? '7,34,34' : '120,160,154';
    buildSolid(
      core,
      dodecahedron(),
      [CORE_RADIUS, CORE_RADIUS, CORE_RADIUS],
      (_, i) =>
        // Dark metal lit from inside: a teal core glowing through each pentagon's middle.
        `radial-gradient(circle at 50% 55%, rgba(${TEAL_RGB},${look.bloom ? 0.5 : 0.35}) 0%,` +
        ` rgba(${TEAL_RGB},0) 70%), linear-gradient(${140 + i * 17}deg,` +
        ` rgba(${coreRgb},0.96), rgba(${look.bloom ? '2,12,12' : '84,120,114'},0.96))`
    );
    const cage = new CssNode(scene);
    buildSolid(cage, icosahedron(), [CAGE_RADIUS, CAGE_RADIUS, CAGE_RADIUS], () => '', {
      wire: look.bloom ? 'rgba(125,255,246,0.3)' : 'rgba(0,120,104,0.45)',
    });

    const plane = new CssNode(scene);
    const spin = new CssNode(plane);
    for (const ring of RINGS) {
      const ringEl = el('div', 'pz3-orbit-ring', plane.el);
      ringEl.style.width = ringEl.style.height = q(ring.radius * 2 * UNIT) + 'px';
      const rgb = ring.tint === 'crimson' ? CRIMSON_RGB : TEAL_RGB;
      ringEl.style.borderColor = `rgba(${rgb},${look.bloom ? 0.5 : 0.62})`;
      ringEl.style.transform =
        cssMatrix(mul(euler(0, 0, ring.tilt), euler(Math.PI / 2, 0, 0)), 0, ring.y, 0) + ' translate(-50%,-50%)';
    }
    const lit = ctx.quality.tier !== 'low';
    for (const gem of gems) {
      const node = new CssNode(spin);
      const rgb = gem.tint === 'crimson' ? CRIMSON_RGB : TEAL_RGB;
      buildSolid(
        node,
        octahedron(),
        [gem.size, gem.size * 1.9, gem.size],
        (n) =>
          `linear-gradient(${Math.round(150 + n[0] * 60)}deg, rgba(255,255,255,${look.bloom ? 0.34 : 0.22}) 0%,` +
          ` rgba(${rgb},0.92) 30%, rgba(${rgb},0.72) 100%)`,
        { lit }
      );
      gem.css = node;
    }

    cssRig = { scene, box: new Item(scene.outer), core, cage, plane, spin, glow: new Item(glowEl) };
  }

  /* ----------------------------------------------------------------- motion */

  let spinAngle = -FRONT;
  const planeRot = euler(TILT, 0, 0);
  const spinRot = euler(0, 0, 0);

  const hide = () => {
    if (root.style.display !== 'none') root.style.display = 'none';
    if (glRig) {
      glRig.rig.show(false);
      glRig.halo.show(false);
      glRig.inner.power(0);
      glRig.rim.power(0);
    }
  };

  return {
    root,
    update(f: Frame) {
      const presence = actPresence(f.t, act, 0.035, 0.035);
      if (presence <= 0.005) {
        hide();
        return;
      }
      if (root.style.display === 'none') root.style.display = '';

      const { cam, time, delta } = f;
      const progress = clamp01((f.t - HOLD[0]) / (HOLD[1] - HOLD[0]));
      const index = Math.min(count - 1, Math.floor(progress * count));
      skillsState.index = Math.max(0, index);

      // Turn the orbit so the indexed crystal comes round to FRONT. The index only ever
      // moves one step at a time, so the target never wraps and the ease never spins
      // the long way round.
      const target = index * step - FRONT;
      spinAngle += (target - spinAngle) * (1 - Math.exp(-delta * 4));
      const spin = spinAngle + Math.sin(time * 0.25) * 0.05;

      const coreRx = Math.sin(time * 0.4) * 0.08;
      const coreRy = time * 0.16 + progress * Math.PI * 0.7;
      const cageRy = -time * 0.22;
      const planeRx = TILT + Math.sin(time * 0.3) * 0.02;
      const planeRz = Math.sin(time * 0.21) * 0.03;
      euler(planeRx, 0, planeRz, planeRot);
      euler(0, spin, 0, spinRot);
      const toWorld = mul(planeRot, spinRot);
      const k = 1 - Math.exp(-delta * 6);

      /* ---- the crystals, and the labels projected from where they are ---- */
      // With the copy along the bottom the orbit is framed small, and six labels at a
      // fixed type size would cover it: only the lit skill keeps its label there.
      const narrow = stacked('skills', cam.width);

      for (let i = 0; i < gems.length; i++) {
        const gem = gems[i];
        const active = i === index;
        gem.shown += ((active ? 1.32 : 1) - gem.shown) * k;
        const bob = Math.sin(gem.angle * 1.4) * 0.28 + Math.sin(time * 0.8 + i) * 0.08;
        const lx = Math.cos(gem.angle) * gem.radius;
        const lz = Math.sin(gem.angle) * gem.radius;
        const rx = time * gem.tumble[0] + gem.phase;
        const rz = time * gem.tumble[1] + gem.phase * 0.4;

        if (gem.gl) {
          gem.gl.pose(lx, bob, lz, rx, 0, rz);
          gem.gl.size(gem.shown, gem.shown * 1.9, gem.shown);
          gem.gl.shine(active ? 3 : 1);
        } else if (gem.css) {
          gem.css.pose(lx, bob, lz, rx, 0, rz);
          gem.css.size(gem.shown);
        }

        /*
          Only the near half of the orbit is labelled. Twelve labels at once fight each
          other and the core for the middle of the frame; the six nearest are enough to
          read the ring by, and every skill comes round to the front in turn anyway.
          `front` is how far round toward the camera the crystal is, from -1 to 1.
        */
        const front = Math.sin(gem.angle - spin);
        const w = apply(toWorld, [lx, bob, lz]);
        cam.project(w[0], CORE_Y + w[1], z0 + w[2], p);
        if (!gem.label.show(p.visible && (active || (!narrow && front > 0.12)))) continue;
        const alpha = active ? 1 : clamp01((front - 0.12) * 2.2) * 0.62;
        const reach = Math.max(14, gem.size * 1.9 * p.scale * gem.shown * 0.55);
        if (!gem.labelW) gem.labelW = gem.labelEl.offsetWidth;
        // The lit skill's card reads as the selected one, so it swells with the crystal.
        gem.labelGrow += ((active ? LABEL_GROW : 1) - gem.labelGrow) * k;
        const grow = gem.labelGrow;
        // A label that would run off the right edge hangs on the crystal's left instead.
        // The card grows away from its leader, so the swell counts toward that reach.
        const left = p.x + reach + gem.labelW * grow > cam.width - 34;
        if (left !== gem.labelLeft) {
          gem.labelLeft = left;
          gem.labelEl.classList.toggle('is-left', left);
        }
        // Scaled about the edge the leader meets — see the transform-origin in the CSS.
        const scale = ` scale(${grow.toFixed(3)})`;
        gem.label.transform(
          left
            ? `translate3d(${q(p.x - reach)}px,${q(p.y)}px,0) translate(-100%,-50%)${scale}`
            : `translate3d(${q(p.x + reach)}px,${q(p.y)}px,0) translate(0,-50%)${scale}`
        );
        gem.label.opacity(presence * alpha * p.fog);
        gem.label.order(active ? 3200 : Math.round(3000 - p.depth * 8));
        gem.labelEl.classList.toggle('is-active', active);
      }

      /* ---- the rig ---- */
      if (glRig) {
        const g = glRig;
        g.rig.show(true);
        g.rig.pose(0, CORE_Y, z0);
        g.rig.fade(presence);
        g.core.pose(0, 0, 0, coreRx, coreRy, 0);
        g.core.shine(1);
        g.cage.pose(0, 0, 0, 0, cageRy, 0);
        g.plane.pose(0, 0, 0, planeRx, 0, planeRz);
        g.spin.pose(0, 0, 0, 0, spin, 0);
        g.halo.show(true);
        g.halo.pose(0, CORE_Y, z0 - 0.6);
        g.halo.fade(presence);
        g.inner.pose(0, CORE_Y + 0.5, z0 + 1.5);
        g.inner.power(presence);
        g.rim.pose(2.8, CORE_Y - 1.5, z0 + 0.5);
        g.rim.power(presence);
      } else if (cssRig) {
        const c = cssRig;
        cam.project(0, CORE_Y, z0, p);
        if (c.box.show(p.visible)) {
          c.box.transform(place(p.x, p.y, p.scale));
          c.box.opacity(presence * p.fog);
          c.box.order(Math.round(4000 - p.depth * 8));
          c.scene.outer.style.setProperty('--pz3-persp', q(p.depth * UNIT) + 'px');
          c.core.pose(0, 0, 0, coreRx, coreRy, 0);
          c.cage.pose(0, 0, 0, 0, cageRy, 0);
          c.plane.pose(0, 0, 0, planeRx, 0, planeRz);
          c.spin.pose(0, 0, 0, 0, spin, 0);
          c.scene.commitView(cam);
        }
        cam.project(0, CORE_Y, z0 - 0.6, p);
        if (c.glow.show(p.visible)) {
          c.glow.transform(place(p.x, p.y, p.scale));
          c.glow.opacity(presence * look.glow * p.fog);
          c.glow.order(Math.round(3900 - p.depth * 8));
        }
      }
    },
  };
}
