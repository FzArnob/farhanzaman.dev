import type { ReactNode } from 'react';
import { poleHex } from '../lib/band';
import { useCurrentAct } from '../three/ScrollRig';
import { ACT_BY_ID, type ActId } from '../three/timeline';
import { useActFade } from './useActFade';

/**
 * One act's copy, as real HTML over the canvas.
 *
 * The type follows the flat site exactly: `.prism-head` is its `.section-head`,
 * `.prism-text` is its `.section-text`, and both come from the same Titillium face and
 * the same `.c1`/`.c2` theme colours. Nothing here invents a scale.
 *
 * Every act is in the document at all times and in scroll order, so a screen reader
 * gets the same reading order the eye does. Acts that are off screen are marked
 * aria-hidden and inert: without that, an opacity-0 block is still in the
 * accessibility tree and all nine acts would be announced at once.
 */
export function ActSection({
  id,
  eyebrow,
  title,
  children,
  align = 'left',
  drift = 22,
  titleHidden = false,
  className,
}: {
  id: ActId;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: 'left' | 'center';
  drift?: number;
  /** Keeps the heading for the accessibility tree while the 3D carries it visually. */
  titleHidden?: boolean;
  /**
   * An extra class on the section, for an act that needs to sit somewhere other than
   * the bottom-left column. Background uses it: its copy is a single button pinned to
   * the spine in the middle of the screen, with everything else read-only to a screen
   * reader.
   */
  className?: string;
}) {
  const ref = useActFade(id, drift);
  const act = ACT_BY_ID[id];
  const current = useCurrentAct();
  const isCurrent = current.id === id;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={`act-${id}`}
      className={`prism-act prism-act-${align}${className ? ' ' + className : ''}`}
      // Only ever teal or crimson — the accent never lands between the two.
      style={{ ['--edge' as string]: poleHex(act.band) }}
      aria-labelledby={`act-${id}-title`}
      aria-hidden={!isCurrent}
      {...(!isCurrent ? ({ inert: '' } as Record<string, string>) : {})}
    >
      <p className="prism-eyebrow">{eyebrow ?? act.name}</p>
      <h2
        id={`act-${id}-title`}
        className={titleHidden ? 'prism-head prism-sr' : 'prism-head'}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
