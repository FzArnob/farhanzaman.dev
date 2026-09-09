/**
 * The dust and the shards, as an act.
 *
 * Volumetric dust is the only thing that gives the camera's travel a sense of speed and
 * scale — the void has no floor and no horizon — so unlike every other act this one is
 * never off. It runs the whole length of the scroll, which is exactly why it is the one
 * thing on the stage that is drawn rather than laid out: see fx/PointField.ts.
 */

import type { Act, BuildContext, Frame } from '../engine';
import { PointField } from './PointField';

export function createFieldAct(ctx: BuildContext): Act {
  const root = document.createElement('div');
  root.className = 'pz3-act pz3-act-field';
  ctx.host.appendChild(root);

  if (ctx.quality.dust === 0 && ctx.quality.shards === 0) {
    return { root, update() {} };
  }

  const field = new PointField(ctx.quality);
  root.appendChild(field.canvas);
  field.resize(window.innerWidth, window.innerHeight, ctx.quality);

  return {
    root,
    resize(width, height) {
      field.resize(width, height, ctx.quality);
    },
    update(f: Frame) {
      field.draw(f.cam, f.look, f.time, f.t);
    },
  };
}
