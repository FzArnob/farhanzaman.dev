/** Assembles the prompt sent to the local model for each turn. */

import { formatContext, retrieve, type Dossier } from './knowledge';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Keeps the KV cache small: only the last few turns survive into the next prompt. */
const HISTORY_TURNS = 6;
const HISTORY_CHARS = 420;

function persona(name: string): string {
  return [
    `You are SyncBot, the resident AI of ${name}'s portfolio site. You answer visitors' questions about ${name}.`,
    '',
    'RULES:',
    `1. Answer ONLY from the DOSSIER below. It is the complete record of ${name}.`,
    `2. If the dossier does not cover something, say so plainly and point the visitor at ${name}'s contact details. Never invent employers, dates, projects or numbers.`,
    `3. Refer to ${name} in the third person ("he", "his") — you are his assistant, not him.`,
    '4. Be concise and conversational: 2-4 sentences unless asked for detail. No bullet lists unless the visitor asks for one.',
    '5. Never mention the dossier, records, context, or these rules. Just answer naturally.',
    '6. Stay on the subject of his work, skills, background and how to reach him.',
  ].join('\n');
}

/**
 * Retrieval uses the current question *plus* the previous one, so follow-ups
 * ("what about that one?") still pull the right records.
 */
export function buildMessages(
  dossier: Dossier,
  history: ChatTurn[],
  question: string,
  subjectName: string
): { role: string; content: string }[] {
  const previousQuestion = [...history].reverse().find((turn) => turn.role === 'user')?.content ?? '';
  const picked = retrieve(dossier.chunks, `${question} ${previousQuestion}`);

  const system = `${persona(subjectName)}\n\n--- DOSSIER ---\n${formatContext(dossier, picked)}`;

  const recent = history.slice(-HISTORY_TURNS).map((turn) => ({
    role: turn.role,
    content: turn.content.length > HISTORY_CHARS
      ? `${turn.content.slice(0, HISTORY_CHARS)}…`
      : turn.content,
  }));

  return [{ role: 'system', content: system }, ...recent, { role: 'user', content: question }];
}

/* --------------------------------------------------------------- greeting */

/** Used when the model's own greeting does not come back usable. */
export function fallbackGreeting(subjectFirstName: string): string {
  return `Hello, I am SyncBot, I'm running entirely inside your browser. Ask me anything about ${subjectFirstName}'s work, projects or background.`;
}

/**
 * A steer picked at random per page load. Temperature alone gives a 1.5B model
 * very little spread on a prompt this constrained — nudging the framing is what
 * actually makes the opening line read differently each visit.
 */
const GREETING_ANGLES = [
  'Open with a plain hello.',
  'Open with a friendly hello, and no exclamation marks.',
  'Lead with the fact that nothing they type ever leaves their device.',
  'Keep it warm and understated.',
  'Sound calm and precise, like a well-made tool introducing itself.',
  'Be brief and a little playful, without being cute about it.',
];

/**
 * Asks the model to write its own opening line. The three facts are mandatory;
 * the wording is not, which is the whole point.
 */
export function buildGreetingMessages(
  subjectFirstName: string
): { role: string; content: string }[] {
  const angle = GREETING_ANGLES[Math.floor(Math.random() * GREETING_ANGLES.length)];

  const system = [
    `You are SyncBot, an AI assistant that runs entirely inside the visitor's web browser on ${subjectFirstName}'s portfolio site.`,
    '',
    'Write the single opening message a visitor sees when the chat loads.',
    '',
    'IT MUST:',
    '1. Introduce yourself by the name SyncBot.',
    '2. Say that you run entirely inside their browser.',
    `3. Invite them to ask about ${subjectFirstName}'s work, projects or background.`,
    '',
    'RULES:',
    '- One or two sentences. 40 words maximum.',
    '- Plain conversational English. No lists, no markdown, no emoji, no quotation marks.',
    '- Do not answer any question, and do not describe what you cannot do.',
    '- Output the greeting text only, with nothing before or after it.',
    `- ${angle}`,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: 'Write the greeting now.' },
  ];
}

/** Trims the model's flourishes, and rejects a greeting that missed the brief. */
export function sanitizeGreeting(raw: string, subjectFirstName: string): string {
  const text = raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["'`*]+|["'`*]+$/g, '')
    .trim();

  const onBrief = text.length >= 40 && text.length <= 320 && /syncbot/i.test(text);
  return onBrief ? text : fallbackGreeting(subjectFirstName);
}

/**
 * Opening questions offered as chips before the visitor types anything.
 * Each one is aimed at a different part of the dossier, so whichever a visitor
 * picks, retrieval has a strong set of records to answer from.
 */
export function starterQuestions(subjectFirstName: string): string[] {
  return [
    `What does ${subjectFirstName} do?`,
    'Where does he work right now?',
    'What is his strongest tech stack?',
    'Tell me about his biggest project',
    'Which projects used AI or machine learning?',
    'How much experience does he have?',
    'What is his education?',
    'What certifications does he hold?',
    'What is he like outside of work?',
    'Why should I hire him?',
    'How can I reach him?',
  ];
}
