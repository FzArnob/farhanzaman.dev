interface SectionHeadProps {
  /** Two-digit section number, e.g. "02". */
  index: string;
  title: string;
  /** Short factual line above the title — counts are read off the profile data. */
  meta?: string;
}

/**
 * Every section opens the same way: an index, the title resolving out of its two
 * colour channels, and a rule that draws itself.
 */
export function SectionHead({ index, title, meta }: SectionHeadProps) {
  return (
    <div className="row">
      <div className="section-block">
        <div className="section-index" data-reveal="rise">
          <em>{index}</em>
          {meta}
        </div>
        <div
          className="section-head decode decode-hover"
          data-reveal="decode"
          data-reveal-delay="80"
          data-text={title}
        >
          {title}
        </div>
        <div className="section-rule" data-reveal="line" data-reveal-delay="200"></div>
      </div>
    </div>
  );
}
