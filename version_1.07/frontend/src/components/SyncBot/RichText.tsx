import { Fragment, useMemo, type ReactNode } from 'react';
import { parseBlocks, type EntitySpan, type Span } from '../../lib/syncbot/richText';
import { Icon, type IconName } from '../Icon/Icon';

const ENTITY_ICON: Record<EntitySpan['type'], IconName> = {
  url: 'link',
  email: 'mail',
  phone: 'call',
};

/**
 * Contact details and links render as tappable chips rather than inline text:
 * on a phone `tel:` and `mailto:` are the whole point, and a chip gives the
 * target a hit area instead of a five-word underline mid-sentence.
 */
function Entity({ span }: { span: EntitySpan }) {
  const external = span.type === 'url';
  return (
    <a
      className={`syncbot-ent syncbot-ent-${span.type}`}
      href={span.href}
      title={span.href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      {span.glyph ? (
        // Material Symbols has no brand marks; icons-font carries the site's own.
        <span className="ico-gen syncbot-ent-brand" aria-hidden="true">
          {span.glyph}
        </span>
      ) : (
        <Icon name={ENTITY_ICON[span.type]} size={14} />
      )}
      <span className="syncbot-ent-label">{span.label}</span>
      {external && <Icon name="open_in_new" size={12} className="syncbot-ent-out" />}
    </a>
  );
}

function Spans({ spans }: { spans: Span[] }) {
  return (
    <>
      {spans.map((span, index) => {
        switch (span.kind) {
          case 'strong':
            return <strong key={index}>{span.text}</strong>;
          case 'em':
            return <em key={index}>{span.text}</em>;
          case 'code':
            return <code key={index}>{span.text}</code>;
          case 'entity':
            return <Entity key={index} span={span} />;
          default:
            return <Fragment key={index}>{span.text}</Fragment>;
        }
      })}
    </>
  );
}

interface RichTextProps {
  content: string;
  /** Streaming caret, tucked onto the end of the last block so it reads inline. */
  trailing?: ReactNode;
}

export function RichText({ content, trailing }: RichTextProps) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <div className="syncbot-md">
      {blocks.map((block, index) => {
        const last = index === blocks.length - 1;
        const tail = last ? trailing : null;

        switch (block.kind) {
          case 'heading':
            return (
              <h3 key={index}>
                <Spans spans={block.spans} />
                {tail}
              </h3>
            );
          case 'pre':
            return (
              <Fragment key={index}>
                <pre>
                  <code>{block.text}</code>
                </pre>
                {tail}
              </Fragment>
            );
          case 'list': {
            const items = block.items.map((spans, item) => (
              <li key={item}>
                {/* The marker is a flex item; the body must stay one inline run,
                    or every span and chip becomes its own un-wrapping column. */}
                <span className="syncbot-li-body">
                  <Spans spans={spans} />
                  {last && item === block.items.length - 1 ? tail : null}
                </span>
              </li>
            ));
            return block.ordered ? (
              <ol key={index}>{items}</ol>
            ) : (
              <ul key={index}>{items}</ul>
            );
          }
          default:
            return (
              <p key={index}>
                <Spans spans={block.spans} />
                {tail}
              </p>
            );
        }
      })}
      {/* An empty message still has to hold the caret. */}
      {blocks.length === 0 && trailing}
    </div>
  );
}
