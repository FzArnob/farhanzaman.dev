/**
 * The site logo, inlined.
 *
 * `view/static/favicon.svg` is already drawn as two colour-separated copies of the
 * same mark — a magenta group and a teal group sitting ~3.9px apart. Inlining it
 * makes those two groups addressable, so the loader's glitch pulls the real artwork
 * apart instead of faking a split with filters.
 */

interface LogoMarkProps {
  className?: string;
  /** Decorative by default; pass a label when the mark stands alone as content. */
  title?: string;
}

export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* channel A — magenta */}
      <g className="ch-a" fill="#FD2155">
        <polygon
          points="35.809,5.92 35.842,10.792 73.078,10.498 65.111,20.013 20.598,19.741 20.428,43.179
          24.88,43.191 25.22,25.007 67.496,25.007 86.697,5.773"
        />
        <polygon
          points="40.702,32.104 35.842,32.104 35.538,43.812 54.297,44.083 45.754,53.237 20.032,53.003
          20.032,97.548 40.645,77.998 40.633,65.148 36.224,65.198 36.224,76.712 24.241,86.812 24.428,58.281
          46.276,58.659 67.496,38.839 40.579,38.683"
        />
      </g>
      {/* channel B — teal */}
      <g className="ch-b" fill="#00D3B4">
        <polygon
          points="39.663,4.146 39.697,9.018 76.933,8.724 68.965,18.239 24.452,17.968 24.282,41.406
          28.734,41.417 29.074,23.234 71.35,23.234 90.551,4"
        />
        <polygon
          points="44.556,30.331 39.697,30.331 39.392,42.039 58.151,42.31 49.608,51.464 23.886,51.23
          23.886,95.774 44.5,76.224 44.488,63.375 40.078,63.426 40.078,74.938 28.095,85.038 28.282,56.508
          50.132,56.886 71.35,37.066 44.434,36.91"
        />
      </g>
    </svg>
  );
}
