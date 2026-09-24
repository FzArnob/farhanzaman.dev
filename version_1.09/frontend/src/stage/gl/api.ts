/**
 * The contract between the acts and the WebGL layer.
 *
 * An act is written once and runs on either renderer. Its motion — where the ring has
 * turned to, which skill is lit, how far the closing mark has resolved — is computed
 * the same way in both, and only the last step differs: the CSS path writes that pose
 * onto DOM elements, the WebGL path writes it onto a node in a scene graph. That is the
 * only way two renderers of one world stay the same world.
 *
 * This file has no three.js import, and must never get one. The acts import it, the
 * acts are in the CSS path, and the CSS path exists precisely for machines that should
 * not have to download a 3D library they cannot run. The implementation lives in
 * GLStage.ts and is only ever reached through a dynamic import.
 */

import type { Camera } from '../camera';

/**
 * The palette, as the WebGL layer takes it. White is for light, never for a body.
 * A `#rrggbb` is a project's own brand colour, and only a project's crystal and its
 * halo are ever given one.
 */
export type Tint = 'teal' | 'crimson' | 'white' | `#${string}`;

/**
 * Everything the WebGL stage knows how to build. Each is a solid the CSS stage builds
 * too, from the same numbers, so a crystal is the same crystal on either renderer.
 */
export type SolidSpec =
  /** The monogram, extruded. Front is the teal glass; rear is the crimson split. */
  | { kind: 'mark'; layer: 'front' | 'rear' }
  /**
   * A project core: the seeded hexagonal prism from shapes.crystalSpec, cut from glass
   * of the project's colour, with its logo suspended at the centre. `logo` is an image
   * URL, and `fallback` the mark used if it will not load. Each facet refracts it on
   * its own, so the mark reads as inside the glass.
   */
  | { kind: 'prism'; seed: number; scale: number; tint: Tint; logo: string; fallback: string }
  /** A skill crystal: an icosahedron, stretched along its axis by the caller. */
  | { kind: 'gem'; radius: number; tint: Tint }
  /** The skills core: a dark dodecahedron lit from inside. */
  | { kind: 'core'; radius: number }
  /** A wireframe cage around the core. */
  | { kind: 'cage'; radius: number; tint: Tint }
  /** An orbit: a hairline ring. */
  | { kind: 'orbit'; radius: number; tint: Tint }
  /** A soft glow that always faces the camera. */
  | { kind: 'halo'; size: number; tint: Tint; strength: number };

/** One thing in the scene graph. Children move with their parent. */
export interface GLNode {
  show(on: boolean): void;
  /** Position and XYZ Euler rotation, radians, relative to the parent. */
  pose(x: number, y: number, z: number, rx?: number, ry?: number, rz?: number): void;
  size(sx: number, sy?: number, sz?: number): void;
  /** 0–1, multiplied down through every child. How an act fades a whole assembly. */
  fade(a: number): void;
  /**
   * Multiplier on the node's own self-light. 1 is its resting glow. On a prism it also
   * lights the logo inside: 2 is the crystal at the front, fully legible.
   */
  shine(k: number): void;
}

/** A local light — the key that sweeps the mark, the core's inner glow. */
export interface GLLight {
  pose(x: number, y: number, z: number): void;
  /** Multiplier on the light's base intensity. 0 turns it off without a recompile. */
  power(k: number): void;
}

/** The dust and the shards. Stepped once a frame by the field act. */
export interface GLField {
  update(time: number, t: number): void;
}

export interface GLStage {
  readonly canvas: HTMLCanvasElement;
  node(parent?: GLNode): GLNode;
  solid(spec: SolidSpec, parent?: GLNode): GLNode;
  light(tint: Tint, intensity: number, distance: number): GLLight;
  field(dust: number, shards: number): GLField;
}

/** What the engine drives. The acts only ever see GLStage. */
export interface GLDriver extends GLStage {
  resize(width: number, height: number): void;
  render(cam: Camera): void;
  dispose(): void;
}
