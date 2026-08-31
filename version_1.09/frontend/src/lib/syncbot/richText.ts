/**
 * A very small markdown-ish parser for chat messages.
 *
 * A 1.5B model writes the way it was trained to: dashed lists, `**bold**`, and
 * `[https://x](https://x)` links where the label is just the URL again. Rendering
 * that as pre-wrapped plain text is what made the answers look raw. This turns it
 * into blocks the UI can style, and — the part that matters — pulls links, emails
 * and phone numbers out as real, tappable entities.
 *
 * Deliberately not a markdown library: the input is short, untrusted-ish model
 * output, and the only constructs worth supporting are the handful above.
 */

export type LinkKind = 'url' | 'email' | 'phone';

export interface EntitySpan {
  kind: 'entity';
  type: LinkKind;
  href: string;
  label: string;
  /** Letter from icons-font when the target is a known social platform. */
  glyph?: string;
}

export type Span =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'em'; text: string }
  | { kind: 'code'; text: string }
  | EntitySpan;

export type Block =
  | { kind: 'paragraph'; spans: Span[] }
  | { kind: 'heading'; spans: Span[] }
  | { kind: 'list'; ordered: boolean; items: Span[][] }
  | { kind: 'pre'; text: string };

/** Hosts worth naming, with their glyph in icons-font (see SocialContact). */
const PLATFORMS: { host: RegExp; name: string; glyph: string }[] = [
  { host: /(^|\.)linkedin\.com$/i, name: 'LinkedIn', glyph: 'C' },
  { host: /(^|\.)github\.com$/i, name: 'GitHub', glyph: 'B' },
  { host: /(^|\.)facebook\.com$/i, name: 'Facebook', glyph: 'A' },
  { host: /(^|\.)(wa\.me|whatsapp\.com)$/i, name: 'WhatsApp', glyph: 'D' },
];

/**
 * Bare hostnames are only linkified for this list. Matching any `x.y` would turn
 * "React.js" and "socket.io" into dead links every time the model lists a stack.
 */
const BARE_TLDS = 'com|net|org|dev|me|info|edu|gov|xyz|bd';

const INLINE = new RegExp(
  [
    '`([^`]+)`', // 1 code
    '\\[([^\\]\\n]*)\\]\\(\\s*([^)\\s]+)\\s*\\)', // 2 label, 3 href
    '\\*\\*([^*]+)\\*\\*', // 4 strong
    '\\*([^*\\n]+)\\*', // 5 em
    '(https?://[^\\s<>()\\[\\]]+)', // 6 absolute url
    '(www\\.[^\\s<>()\\[\\]]+)', // 7 www url
    '([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})', // 8 email
    `((?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+(?:${BARE_TLDS})(?:/[^\\s<>()\\[\\]]*)?)`, // 9 bare host
    '(\\(?\\+?\\d[\\d ()\\-.]{7,}\\d)', // 10 phone
  ].join('|'),
  'g'
);

/** Decides whether an href can be used as-is. "www.x.com" cannot — it is relative. */
const HAS_SCHEME = /^(https?:\/\/|mailto:|tel:)/i;
/** Decides whether a *label* is really just the URL repeated. */
const LOOKS_LIKE_URL = /^(https?:\/\/|www\.|mailto:|tel:)/i;

function absolute(href: string): string {
  return HAS_SCHEME.test(href) ? href : `https://${href}`;
}

/**
 * "https://github.com/FzArnob" -> the handle "FzArnob", carried by the GitHub
 * glyph. Naming the platform in the label instead would read "GitHub: GitHub"
 * every time the model writes its usual `Platform: <link>` line.
 */
function describe(href: string): { label: string; glyph?: string } {
  let url: URL;
  try {
    url = new URL(absolute(href));
  } catch {
    return { label: href };
  }

  const platform = PLATFORMS.find((entry) => entry.host.test(url.hostname));
  if (!platform) {
    const host = url.hostname.replace(/^www\./i, '');
    return { label: host || href };
  }

  const handle = url.pathname.split('/').filter(Boolean).pop();
  return { label: handle || platform.name, glyph: platform.glyph };
}

function urlEntity(rawHref: string, rawLabel?: string): EntitySpan {
  const described = describe(rawHref);
  // A label that is just the URL again is noise — name the destination instead.
  const given = rawLabel?.trim();
  const useGiven = given && !LOOKS_LIKE_URL.test(given);
  return {
    kind: 'entity',
    type: 'url',
    href: absolute(rawHref),
    label: useGiven ? given : described.label,
    glyph: described.glyph,
  };
}

function mailEntity(address: string): EntitySpan {
  const clean = address.replace(/^mailto:/i, '');
  return { kind: 'entity', type: 'email', href: `mailto:${clean}`, label: clean };
}

/**
 * Accepts the shapes a phone number actually takes ("(+880) 1521581368",
 * "880-152-1581368") and rejects the things that merely look like one — date
 * ranges such as "2022 - 2024 12" are the common false positive in career text.
 */
function phoneEntity(raw: string): { lead: string; entity: EntitySpan } | null {
  // "provided (880 1521581368)." matches through the digits but stops short of
  // the closing bracket; an orphaned "(" belongs to the sentence, not the number.
  const lead = raw.startsWith('(') && !raw.includes(')') ? '(' : '';
  const number = raw.slice(lead.length).trim();

  const digits = number.replace(/\D/g, '');
  const separators = number.replace(/\d/g, '').length;
  if (digits.length < 9 || digits.length > 15) return null;
  if (separators > 5 || /\s[-–]\s/.test(number)) return null;

  const prefix = number.includes('+') ? '+' : '';
  return {
    lead,
    entity: { kind: 'entity', type: 'phone', href: `tel:${prefix}${digits}`, label: number },
  };
}

/** URLs at the end of a sentence swallow the punctuation; hand it back as text. */
function splitTrailingPunctuation(value: string): [string, string] {
  const match = /[.,;:!?)]+$/.exec(value);
  if (!match) return [value, ''];
  return [value.slice(0, match.index), value.slice(match.index)];
}

export function parseSpans(line: string): Span[] {
  const spans: Span[] = [];
  let cursor = 0;

  const pushText = (text: string) => {
    if (!text) return;
    const previous = spans[spans.length - 1];
    if (previous?.kind === 'text') previous.text += text;
    else spans.push({ kind: 'text', text });
  };

  INLINE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = INLINE.exec(line)) !== null) {
    pushText(line.slice(cursor, match.index));
    cursor = INLINE.lastIndex;

    const [, code, linkLabel, linkHref, strong, em, url, www, email, host, phone] = match;

    if (code !== undefined) {
      spans.push({ kind: 'code', text: code });
    } else if (linkHref !== undefined) {
      if (/^mailto:/i.test(linkHref)) spans.push(mailEntity(linkHref));
      else if (/^tel:/i.test(linkHref)) {
        const phoneMatch = phoneEntity(linkHref.replace(/^tel:/i, ''));
        if (phoneMatch) spans.push(phoneMatch.entity);
        else pushText(match[0]);
      } else spans.push(urlEntity(linkHref, linkLabel));
    } else if (strong !== undefined) {
      spans.push({ kind: 'strong', text: strong });
    } else if (em !== undefined) {
      spans.push({ kind: 'em', text: em });
    } else if (url !== undefined || www !== undefined || host !== undefined) {
      const [target, tail] = splitTrailingPunctuation((url ?? www ?? host)!);
      spans.push(urlEntity(target));
      pushText(tail);
    } else if (email !== undefined) {
      const [address, tail] = splitTrailingPunctuation(email);
      spans.push(mailEntity(address));
      pushText(tail);
    } else if (phone !== undefined) {
      const phoneMatch = phoneEntity(phone);
      if (phoneMatch) {
        pushText(phoneMatch.lead);
        spans.push(phoneMatch.entity);
      } else pushText(phone);
    }
  }

  pushText(line.slice(cursor));
  return spans;
}

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let fence: string[] | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: 'paragraph', spans: parseSpans(paragraph.join('\n')) });
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push({
      kind: 'list',
      ordered: list.ordered,
      items: list.items.map((item) => parseSpans(item)),
    });
    list = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (fence) {
        blocks.push({ kind: 'pre', text: fence.join('\n') });
        fence = null;
      } else {
        flushAll();
        fence = [];
      }
      continue;
    }
    if (fence) {
      fence.push(line);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushAll();
      blocks.push({ kind: 'heading', spans: parseSpans(heading[1]) });
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      flushParagraph();
      const ordered = ORDERED_ITEM.test(line);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(item[1]);
      continue;
    }

    // An unmarked line directly under a bullet is that bullet's continuation.
    if (list) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }
    paragraph.push(line);
  }

  // An unterminated fence means the model is still streaming it.
  if (fence?.length) blocks.push({ kind: 'pre', text: fence.join('\n') });
  flushAll();
  return blocks;
}
