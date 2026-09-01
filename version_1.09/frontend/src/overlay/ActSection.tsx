import type { ReactNode } from 'react';
import { useCurrentAct } from '../three/ScrollRig';
import { ACT_BY_ID, type ActId } from '../three/timeline';
import { bandHex } from '../lib/band';
import { useActFade } from './useActFade';

/**
 * One act's copy, as real HTML over the canvas.
 *
 * Every act is in the document at all times and in scroll order, so the reading order
 * a screen reader gets is the reading order the eye gets. Acts that are not on screen
 * are marked aria-hidden and inert: without that, an opacity-0 block is still in the
 * accessibility tree and all eight acts would be announced at once.
 */
export function ActSection({
  id,
  eyebrow,
  title,
  children,
  align = 'left',
  drift = 26,
  titleHidden = false,
}: {
  id: ActId;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: 'left' | 'center';
  drift?: number;
  /** Keep the heading for the accessibility tree but let the 3D carry it visually. */
  titleHidden?: boolean;
}) {
  const ref = useActFade(id, drift);
  const act = ACT_BY_ID[id];
  const current = useCurrentAct();
  const isCurrent = current.id === id;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={`act-${id}`}
      className={`prism-act prism-act-${align}`}
      style={{ ['--edge' as string]: bandHex(act.band) }}
      aria-labelledby={`act-${id}-title`}
      aria-hidden={!isCurrent}
      // `inert` keeps keyboard focus inside the act the visitor can actually see.
      // React 18 has no typing for it, so it goes through as a plain attribute.
      {...(!isCurrent ? ({ inert: '' } as Record<string, string>) : {})}
    >
      <p className="prism-act-num">
        <span>{String(act.index).padStart(2, '0')}</span>
        <i />
        {eyebrow ?? act.name}
      </p>
      <h2
        id={`act-${id}-title`}
        className={titleHidden ? 'prism-act-title prism-sr' : 'prism-act-title'}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
