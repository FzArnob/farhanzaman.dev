import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Achievement } from '../../types/profile';

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
}

/** Year only — the full timestamp is noise next to a logo. */
function year(date: string): string {
  return date?.slice(0, 4) ?? '';
}

/**
 * Certificates as a constellation.
 *
 * The nodes lay themselves out with normal flex wrapping; the lines are measured
 * afterwards and drawn behind, in the same style as the background particle
 * network — so the section reads as part of the same field. The lines are static
 * SVG, so they cost nothing per frame.
 */
export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [box, setBox] = useState({ width: 0, height: 0 });

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wrapBox = wrap.getBoundingClientRect();
    const centres = nodeRefs.current.map((node) => {
      if (!node) return null;
      const nodeBox = node.getBoundingClientRect();
      return {
        x: nodeBox.left - wrapBox.left + nodeBox.width / 2,
        y: nodeBox.top - wrapBox.top + nodeBox.height / 2,
      };
    });

    const next: Edge[] = [];
    const connect = (a: number, b: number) => {
      const from = centres[a];
      const to = centres[b];
      if (!from || !to) return;
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      next.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, length });
    };

    // A chain through every node, plus a few longer struts so it reads as a
    // network rather than a queue.
    for (let i = 0; i < centres.length - 1; i++) connect(i, i + 1);
    for (let i = 0; i + 3 < centres.length; i += 3) connect(i, i + 3);

    setEdges(next);
    setBox({ width: wrapBox.width, height: wrapBox.height });
  }, []);

  useEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [measure, achievements.length]);

  return (
    <div className="row" id="achievements">
      <div className="constellation" ref={wrapRef} data-reveal="net">
        <svg
          className="constellation-lines"
          viewBox={`0 0 ${box.width || 1} ${box.height || 1}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {edges.map((edge, index) => (
            <line
              key={index}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              style={
                {
                  '--len': edge.length,
                  '--rv-delay': `${Math.min(index, 8) * 60 + 200}ms`,
                } as CSSProperties
              }
            />
          ))}
        </svg>

        {/* `achievement-node` and the img's `data-tooltip` are the hooks sync.ts
            binds its certificate tracking to — keep both. */}
        <div className="constellation-nodes" data-reveal="pop" data-reveal-step="55">
          {achievements.map((item, index) => (
            <a
              key={item.achievement_id}
              className="cert-node achievement-node"
              href={item.certification_url}
              target="_blank"
              rel="noreferrer"
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
            >
              <img
                src={item.certification_logo}
                alt={`${item.name} certificate`}
                data-tooltip={item.name}
                loading="lazy"
              />
              <span className="cert-meta">
                <b>{item.name}</b>
                <span>
                  {item.level}
                  {item.certification_date ? ` · ${year(item.certification_date)}` : ''}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
