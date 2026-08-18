/**
 * Turns profile.json into a retrievable dossier for the in-browser LLM.
 *
 * profile.json is ~90 KB — an order of magnitude more than a 1.5B model's context
 * window can hold. So the profile is split into small labelled chunks once, and each
 * question pulls only the handful of chunks it actually needs (keyword + IDF scoring,
 * no embeddings — retrieval has to stay instant and dependency-free).
 */

import type { Profile } from '../../types/profile';

export interface KnowledgeChunk {
  id: string;
  /** Short label the model sees as a section heading, e.g. "PROJECT / Pocketalk Ventana". */
  topic: string;
  /** Body text handed to the model. */
  text: string;
  /** Lowercased haystack used for scoring: topic + text + any extra aliases. */
  haystack: string;
  /** Used to break ties and to pick sensible defaults when a question matches nothing. */
  priority: number;
}

export interface Dossier {
  /** Identity block prepended to every prompt, regardless of the question. */
  core: string;
  chunks: KnowledgeChunk[];
  /** Number of source records indexed — surfaced in the boot sequence. */
  recordCount: number;
}

/** profile.json stores rich text; the model only wants the words. */
function clean(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * profile.json stores the resume as a site-relative path. Left as-is it reaches
 * the visitor as bare text — the link parser will not linkify something without
 * a scheme or a recognised TLD, and a model quoting it produces a dead link.
 */
export function absoluteUrl(value: string, base: string): string {
  const path = (value ?? '').trim();
  if (!path) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function clip(value: string, max: number): string {
  const text = clean(value);
  if (text.length <= max) return text;
  // Cut on a word boundary so the model never sees a severed token.
  return text.slice(0, text.lastIndexOf(' ', max) || max).trimEnd() + '…';
}

/* ------------------------------------------------------------------ dates */

/**
 * Every duration in the dossier is worked out here rather than left as two dates
 * for the model to subtract. A 0.5B model cannot do calendar arithmetic — asked
 * for a total it will confidently add up numbers that were never meant to be
 * added — so it is only ever handed finished phrases like "4 years 4 months".
 */

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthName(value: string | null): string {
  const date = parseDate(value);
  if (!date) return value ?? '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** "2022-03-29" + is_present "1" -> "Mar 2022 - present". */
function period(start: string, end: string | null, isPresent: string): string {
  const from = monthName(start);
  const to = isPresent === '1' ? 'present' : monthName(end);
  if (from && to) return `${from} - ${to}`;
  return from || to || 'date not recorded';
}

/** Whole months between two dates, not counting a partial final month. */
function monthsBetween(from: Date, to: Date): number {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(months, 0);
}

/**
 * The end of a role, as an exclusive bound.
 *
 * `end_date` in profile.json is the last day *worked*, so a role recorded as
 * 2021-09-01 to 2022-02-28 covers six months, not the five that subtracting the
 * two dates gives. Ongoing roles end now.
 */
function roleEnd(item: { end_date: string | null; is_present: string }, now: Date): Date {
  if (item.is_present === '1') return now;
  const end = parseDate(item.end_date);
  if (!end) return now;
  const exclusive = new Date(end);
  exclusive.setDate(exclusive.getDate() + 1);
  return exclusive;
}

/** 52 -> "4 years 4 months". The one phrasing used everywhere. */
export function formatMonths(total: number): string {
  const months = Math.max(Math.round(total), 0);
  if (months < 1) return 'less than a month';
  const whole = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    whole ? `${whole} year${whole === 1 ? '' : 's'}` : '',
    rest ? `${rest} month${rest === 1 ? '' : 's'}` : '',
  ].filter(Boolean);
  return parts.join(' ');
}

export interface Tenure {
  id: string;
  position: string;
  employer: string;
  span: string;
  months: number;
  duration: string;
  current: boolean;
}

/** profile.json prefixes past titles with "Former"; that belongs to the timeline UI. */
function title(position: string): string {
  return clean(position).replace(/^former\s+/i, '');
}

/** One entry per role, newest first, each with its length already worked out. */
export function tenures(experiences: Profile['experiences']): Tenure[] {
  const now = new Date();
  return experiences
    .map((item) => {
      const from = parseDate(item.start_date);
      const months = from ? monthsBetween(from, roleEnd(item, now)) : 0;
      return {
        id: item.experience_id,
        position: title(item.position),
        employer: clean(item.institute_name),
        span: period(item.start_date, item.end_date, item.is_present),
        months,
        duration: formatMonths(months),
        current: item.is_present === '1',
        sort: from?.getTime() ?? 0,
      };
    })
    .sort((a, b) => b.sort - a.sort)
    .map(({ sort: _sort, ...entry }) => entry);
}

/**
 * Total professional experience: the union of the role periods, so that
 * overlapping jobs are not double-counted and the gaps between them are not
 * counted at all. This is the number the console used to get badly wrong.
 */
export function totalExperienceMonths(experiences: Profile['experiences']): number {
  const now = new Date();
  const spans = experiences
    .map((item) => {
      const from = parseDate(item.start_date);
      const to = roleEnd(item, now);
      return from ? { from, to: to < from ? from : to } : null;
    })
    .filter((span): span is { from: Date; to: Date } => span !== null)
    .sort((a, b) => a.from.getTime() - b.from.getTime());

  const merged: { from: Date; to: Date }[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.from <= last.to) {
      if (span.to > last.to) last.to = span.to;
    } else {
      merged.push({ ...span });
    }
  }
  return merged.reduce((sum, span) => sum + monthsBetween(span.from, span.to), 0);
}

/** Months a technology or soft skill has been in use — never a job duration. */
function usedFor(months: string | number | null | undefined): string {
  const value = Number(months);
  if (!Number.isFinite(value) || value <= 0) return '';
  return `used on and off for about ${formatMonths(value)}`;
}

function chunk(
  id: string,
  topic: string,
  text: string,
  priority: number,
  aliases = ''
): KnowledgeChunk {
  return {
    id,
    topic,
    text,
    haystack: `${topic} ${text} ${aliases}`.toLowerCase(),
    priority,
  };
}

/** Builds the identity block plus every retrievable chunk. Runs once per session. */
export function buildDossier(profile: Profile): Dossier {
  const { info, educations, experiences, expertises, skills, achievements, projects, gallery } =
    profile;
  const chunks: KnowledgeChunk[] = [];

  const roles = tenures(experiences);
  const totalExperience = formatMonths(totalExperienceMonths(experiences));
  const current = roles.find((item) => item.current);
  const currentRole = current
    ? `${current.position} at ${current.employer} (${current.span}, ${current.duration} so far)`
    : 'see the career history';

  // profile.json often repeats a value in the "alternative" field; listing the same
  // address twice reads as an error in an answer.
  const unique = (...values: (string | null | undefined)[]) => [
    ...new Set(values.map((value) => clean(value)).filter(Boolean)),
  ];
  const emails = unique(info.email, info.alternative_email);
  const phones = unique(info.phone, info.secondary_phone);

  const core = [
    `SUBJECT: ${info.full_name} (goes by ${info.first_name}${info.nick_name && info.nick_name !== info.first_name ? `, nickname "${info.nick_name}"` : ''}).`,
    `ROLES: ${info.designations.map((role) => clean(role)).join(' / ')}.`,
    `CURRENTLY: ${currentRole}.`,
    `TOTAL PROFESSIONAL EXPERIENCE: ${totalExperience} across ${roles.length} roles. Use this figure exactly as written.`,
    `BASED IN: ${clean(info.address) || 'not recorded'}.`,
    `SUMMARY: ${clip(info.about_text, 420)}`,
    `CONTACT: email ${emails.join(' or ')}; phone ${phones.join(' / ')}; LinkedIn ${info.linkedin_url}; GitHub ${info.github_url}; website ${info.website_domain_name}.`,
  ].join('\n');

  // The console's worst answers were all arithmetic: totals invented by adding
  // together numbers from the technology list. Stating the totals as finished
  // prose, at the top of the career section, leaves nothing to work out.
  chunks.push(
    chunk(
      'career-summary',
      'CAREER SUMMARY / TOTAL EXPERIENCE',
      [
        `${info.first_name} has ${totalExperience} of total professional experience, counted across ${roles.length} roles with the gaps between them excluded.`,
        'Role by role:',
        ...roles.map(
          (role) =>
            `- ${role.position} at ${role.employer} (${role.span}) — ${role.duration}${role.current ? ', ongoing' : ''}.`
        ),
        'These are the only durations that count as work experience. The month figures listed against individual technologies and skills are how long each one has been in use, they overlap heavily, and they must never be added together or reported as years of experience.',
      ].join('\n'),
      98,
      'experience years total overall how long duration tenure career breakdown seniority worked employment history summary'
    )
  );

  // The core summary is clipped to keep every prompt small, so the full statement —
  // research interests, university societies — lives on as its own retrievable chunk.
  chunks.push(
    chunk(
      'background',
      'BACKGROUND / IN HIS OWN WORDS',
      `${clean(info.about_text)} His stated roles are: ${info.designations.map((role) => clean(role)).join(', ')}.`,
      90,
      'background story bio about interests research passion motivation ai ml machine learning artificial intelligence computer vision image processing volunteering societies'
    )
  );

  // --- Career -------------------------------------------------------------
  experiences.forEach((item, index) => {
    const links = [item.project_text_1, item.project_text_2, item.project_text_3]
      .filter(Boolean)
      .join(', ');
    const role = roles.find((entry) => entry.id === item.experience_id);
    chunks.push(
      chunk(
        `exp-${item.experience_id}`,
        `EXPERIENCE / ${title(item.position)} @ ${item.institute_name}`,
        [
          `${title(item.position)} at ${item.institute_name}, ${period(item.start_date, item.end_date, item.is_present)}${role ? ` — ${role.duration} in the role` : ''}.`,
          item.project_details ? `Focus: ${clean(item.project_details)}.` : '',
          links ? `Worked on: ${links}.` : '',
          item.is_present === '1' ? 'This is his current job.' : '',
        ]
          .filter(Boolean)
          .join(' '),
        // Newest role first; the current job outranks everything else in the career section.
        item.is_present === '1' ? 95 : 70 - index,
        'work job employer career role company position hire experience'
      )
    );
  });

  educations.forEach((item, index) => {
    chunks.push(
      chunk(
        `edu-${item.education_id}`,
        `EDUCATION / ${item.institute_name}`,
        [
          `${clean(item.subject)} at ${item.institute_name}, ${period(item.start_date, item.end_date, item.is_present)}.`,
          item.activity ? `${clean(item.activity)}.` : '',
          item.is_present === '1' ? 'Currently studying this.' : '',
        ]
          .filter(Boolean)
          .join(' '),
        item.is_present === '1' ? 80 : 55 - index,
        'study studied degree university school college education academic graduated'
      )
    );
  });

  // --- Projects -----------------------------------------------------------
  if (projects.length) {
    chunks.push(
      chunk(
        'project-index',
        'PROJECT INDEX',
        `He has ${projects.length} documented projects: ${projects
          .map((item) => `${item.name} (${item.type}, ${item.stack}, ${item.work_role})`)
          .join('; ')}.`,
        85,
        'projects portfolio work built made shipped apps products'
      )
    );
  }

  projects.forEach((item) => {
    chunks.push(
      chunk(
        `project-${item.project_id}`,
        `PROJECT / ${item.name}`,
        [
          `${item.name} — ${item.type} ${item.stack} project, his role: ${item.work_role}.`,
          item.tech_stack ? `Tech: ${clean(item.tech_stack)}.` : '',
          item.methodology ? `Method: ${clean(item.methodology)}.` : '',
          item.current_status ? `Status: ${clean(item.current_status)}.` : '',
          item.details ? `About: ${clip(item.details, 520)}` : '',
          item.scope_of_work ? `His scope: ${clip(item.scope_of_work, 260)}` : '',
          item.challenges ? `Challenges: ${clip(item.challenges, 260)}` : '',
          item.live_url ? `Live: ${item.live_url}.` : '',
          item.source_url ? `Source: ${item.source_url}.` : '',
        ]
          .filter(Boolean)
          .join(' '),
        75,
        'project built develop app product client'
      )
    );
  });

  // --- Technologies -------------------------------------------------------
  if (expertises.length) {
    chunks.push(
      chunk(
        'expertise-index',
        'TECHNOLOGY INDEX',
        `Technologies he has worked with, each with the level he claims: ${expertises
          .map((item) => `${item.name} (${item.level})`)
          .join(', ')}.`,
        88,
        'tech stack technologies languages frameworks tools knows skilled proficient'
      )
    );
  }

  expertises.forEach((item) => {
    chunks.push(
      chunk(
        `expertise-${item.expertise_id}`,
        `TECHNOLOGY / ${item.name}`,
        `${item.name} — ${item.level} level${usedFor(item.duration) ? `, ${usedFor(item.duration)}` : ''}. ${clean(item.description)}`,
        60,
        'technology language framework tool library know experience with'
      )
    );
  });

  // Soft skills are short; grouping keeps them from crowding out richer chunks.
  for (let index = 0; index < skills.length; index += 6) {
    const group = skills.slice(index, index + 6);
    chunks.push(
      chunk(
        `skills-${index}`,
        'SKILLS',
        group
          .map(
            (item) =>
              `${item.name} (self-rated ${item.percentage}%${usedFor(item.duration) ? `, ${usedFor(item.duration)}` : ''}): ${clean(item.description)}`
          )
          .join(' '),
        65,
        'skills strengths good at abilities soft skills competencies'
      )
    );
  }

  // --- Achievements -------------------------------------------------------
  if (achievements.length) {
    chunks.push(
      chunk(
        'achievement-index',
        'CERTIFICATION INDEX',
        `Certifications and achievements: ${achievements
          .map((item) => `${item.name} (${item.level}, ${item.certification_date?.slice(0, 4) ?? ''})`)
          .join('; ')}.`,
        78,
        'certificates certifications achievements awards badges credentials qualified'
      )
    );
  }

  achievements.forEach((item) => {
    chunks.push(
      chunk(
        `achievement-${item.achievement_id}`,
        `CERTIFICATION / ${item.name}`,
        `${item.name} — ${item.level} level, dated ${item.certification_date}. ${clip(item.description, 260)}${item.certification_url ? ` Certificate: ${item.certification_url}` : ''}`,
        50,
        'certificate certification achievement award exam test credential'
      )
    );
  });

  // --- Personal -----------------------------------------------------------
  if (gallery.length) {
    const categories = [...new Set(gallery.map((item) => item.category))];
    chunks.push(
      chunk(
        'gallery',
        'HOBBIES / CREATIVE WORK',
        `Outside engineering he makes visual art and photography — ${gallery.length} pieces across ${categories.join(', ')}. Selected works: ${gallery
          .slice(0, 8)
          .map((item) => `${item.name} (${item.category})`)
          .join(', ')}.`,
        62,
        'hobbies art photography drawing creative interests personal fun free time passion'
      )
    );
  }

  chunks.push(
    chunk(
      'contact',
      'CONTACT',
      // Deduplicated for the same reason as the core block: "email x (alt x)"
      // reads as a mistake, and the model will faithfully repeat it.
      `Email ${emails.join(' or ')}. Phone ${phones.join(' / ')}. Located ${clean(info.address)}. LinkedIn ${info.linkedin_url}. GitHub ${info.github_url}. Facebook ${info.facebook_url}. WhatsApp ${info.whatsapp_url}. Resume: ${absoluteUrl(info.resume_url, info.website_base_url)}. ${clip(info.contact_preference_details, 200)}`,
      72,
      'contact reach email phone hire available resume cv linkedin github whatsapp connect'
    )
  );

  return {
    core,
    chunks,
    recordCount:
      experiences.length +
      educations.length +
      projects.length +
      expertises.length +
      skills.length +
      achievements.length +
      gallery.length,
  };
}

const STOP_WORDS = new Set([
  'a', 'about', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been', 'but', 'by',
  'can', 'did', 'do', 'does', 'doing', 'for', 'from', 'get', 'had', 'has', 'have', 'he', 'her',
  'him', 'his', 'how', 'i', 'if', 'in', 'is', 'it', 'its', 'just', 'know', 'like', 'ma', 'me',
  'much', 'my', 'of', 'on', 'or', 'she', 'so', 'some', 'tell', 'than', 'that', 'the', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'to', 'us', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would', 'you', 'your', 'farhan',
  'zaman', 'fz',
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((term) => term.replace(/^[.]+|[.]+$/g, ''))
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

/**
 * Ranks every chunk against `query`.
 *
 * Scoring is IDF-weighted term overlap: a term that appears in only one chunk
 * ("pocketalk") is worth far more than one that appears everywhere ("project").
 */
function rank(
  chunks: KnowledgeChunk[],
  query: string
): { terms: string[]; ranked: KnowledgeChunk[] } {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return { terms, ranked: [] };

  // Document frequency and the matcher for each term are computed once, not once
  // per chunk — otherwise scoring is quadratic in the number of chunks.
  const scoring = terms.map((term) => {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    const documentFrequency = chunks.filter((item) => item.haystack.includes(term)).length;
    return {
      pattern,
      term,
      idf: Math.log(1 + chunks.length / Math.max(documentFrequency, 1)),
    };
  });

  const ranked = chunks
    .map((item) => {
      let score = 0;
      for (const { term, pattern, idf } of scoring) {
        // A whole-word hit is the strong signal; a bare substring catches
        // plurals and compounds ("react" inside "react-native") at a discount.
        if (pattern.test(item.haystack)) score += idf;
        else if (item.haystack.includes(term)) score += idf * 0.4;
      }
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.priority - a.item.priority)
    .map((entry) => entry.item);

  return { terms, ranked };
}

/**
 * Words that carry conversation rather than subject matter. Stripped before the
 * off-topic test only — they are still useful for *ranking*, where "details" and
 * "projects" legitimately pull different chunks, but a question built entirely
 * out of them ("tell me more", "anything else?") is vague, not off-topic.
 */
const FILLER = new Set<string>([
  'again', 'also', 'anything', 'bit', 'brief', 'briefly', 'compare', 'could', 'describe',
  'detail', 'details', 'else', 'elaborate', 'everything', 'explain', 'give', 'good', 'great',
  'hello', 'help', 'hey', 'hi', 'interesting', 'list', 'little', 'lot', 'many', 'maybe',
  'mean', 'more', 'most', 'nice', 'now', 'ok', 'okay', 'one', 'other', 'others', 'please',
  'point', 'really', 'say', 'short', 'should', 'show', 'summarise', 'summarize', 'summary',
  'sure', 'thanks', 'thing', 'things', 'think', 'top', 'want', 'well', 'yeah', 'yes',
]);

/**
 * False only when the visitor used substantive words and not one of them appears
 * anywhere in the profile — "what's the capital of France", "write me a poem".
 *
 * The asymmetry is deliberate. Refusing needs positive evidence that the subject
 * is somewhere else, because a wrong refusal is far more annoying to a visitor
 * than a slightly loose answer. So a question with nothing substantive left
 * after the filler is stripped counts as on-topic, and the caller answers it
 * from the overview chunks.
 */
export function isOnTopic(chunks: KnowledgeChunk[], query: string): boolean {
  const { terms, ranked } = rank(chunks, query);
  if (ranked.length > 0) return true;
  return terms.every((term) => FILLER.has(term));
}

/** Picks the chunks most relevant to `query`, up to `budget` characters. */
export function retrieve(chunks: KnowledgeChunk[], query: string, budget = 2400): KnowledgeChunk[] {
  const { ranked } = rank(chunks, query);

  // A question that matches nothing ("hey", "tell me more") still deserves an
  // answer, so fall back to the highest-priority overview chunks.
  const ordered = ranked.length
    ? ranked
    : [...chunks].sort((a, b) => b.priority - a.priority);

  const picked: KnowledgeChunk[] = [];
  let used = 0;
  for (const item of ordered) {
    const cost = item.topic.length + item.text.length + 4;
    if (picked.length >= 2 && used + cost > budget) continue;
    picked.push(item);
    used += cost;
    if (used > budget) break;
  }
  return picked;
}

/** Formats retrieved chunks into the dossier section of the system prompt. */
export function formatContext(dossier: Dossier, picked: KnowledgeChunk[]): string {
  const sections = picked.map((item) => `[${item.topic}]\n${item.text}`).join('\n\n');
  return `${dossier.core}\n\n--- RELEVANT RECORDS ---\n\n${sections}`;
}
