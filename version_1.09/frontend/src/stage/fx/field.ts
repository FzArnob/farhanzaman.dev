/**
 * The dust and the shards, as an act.
 *
 * Volumetric dust is the only thing that gives the camera's travel a sense of speed and
 * scale — the void has no floor and no horizon — so unlike every other act this one is
 * never off. It runs the whole length of the scroll.
 *
 * On WebGL the dust is a point cloud and each shard is a real faceted crystal in one
 * instanced draw; on the CSS renderer both are drawn to a 2D canvas (fx/PointField.ts).
 * Either way fx/shards.ts decides where every shard is, so the choreography the other
 * acts lease — the mark solving out of them, the works ring's handoff — is identical.
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

  if (ctx.gl) {
    const field = ctx.gl.field(ctx.quality.dust, ctx.quality.shards);
    return {
      root,
      update(f: Frame) {
        field.update(f.time, f.t);
      },
    };
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
