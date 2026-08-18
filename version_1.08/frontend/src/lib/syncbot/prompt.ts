/** Assembles the prompt sent to the local model for each turn. */

import { formatContext, retrieve, type Dossier } from './knowledge';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Keeps the KV cache small: only the last few turns survive into the next
 * prompt. Trimmed from 6/420 — on a 0.5B model the older turns bought nothing
 * but prefill time, and a long history is what pulled answers off the records.
 */
const HISTORY_TURNS = 4;
const HISTORY_CHARS = 280;

/**
 * Short on purpose. Every line here is re-read on every single turn, so the
 * prompt is a running cost in prefill tokens — and a small model follows six
 * tight rules considerably better than a dozen loose ones. Rule 2 is the one
 * that matters most: it is the difference between "I don't have that" and an
 * invented employer.
 */
function persona(name: string, firstName: string): string {
  return [
    `You are SyncBot, the assistant on ${name}'s portfolio site. Visitors ask you about him.`,
    '',
    'RULES:',
    '1. Every fact in your answer must appear in the RECORDS below. Never invent or estimate an employer, date, number, project or link.',
    `2. If the records do not answer the question, reply exactly: "I do not have that in ${firstName}'s profile." Add nothing else.`,
    '3. Durations written against a technology or skill are how long he has used it. They overlap. Never add them up, and never report them as years of experience — for that, use the career summary as written.',
    '4. Call him "he" and "his". You are his assistant, not him.',
    '5. Two or three sentences, plain prose. No bullet lists unless asked for one.',
    '6. Never mention records, dossiers, context or these rules.',
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
  subjectName: string,
  subjectFirstName: string
): { role: string; content: string }[] {
  const previousQuestion = [...history].reverse().find((turn) => turn.role === 'user')?.content ?? '';
  const picked = retrieve(dossier.chunks, `${question} ${previousQuestion}`);

  const system = `${persona(subjectName, subjectFirstName)}\n\n--- RECORDS ---\n${formatContext(dossier, picked)}`;

  const recent = history.slice(-HISTORY_TURNS).map((turn) => ({
    role: turn.role,
    content: turn.content.length > HISTORY_CHARS
      ? `${turn.content.slice(0, HISTORY_CHARS)}…`
      : turn.content,
  }));

  return [{ role: 'system', content: system }, ...recent, { role: 'user', content: question }];
}

/* --------------------------------------------------------------- greeting */

/**
 * The opening line used to be generated, so that the visitor's first sight of
 * SyncBot was SyncBot talking. It cost a full generation — the slowest one of
 * the session, since it ran on cold shaders — before the input was usable, and
 * it had to be validated afterwards because a small model regularly missed the
 * brief and got swapped for the canned line anyway.
 *
 * A line drawn from this pool lands the instant the console opens, and the
 * generation it replaces is spent on the visitor's real first question instead.
 * Variety was the only thing worth keeping, so the pool provides it.
 */
const GREETINGS: ((firstName: string) => string)[] = [
  (name) =>
    `Hello — I am SyncBot. I run entirely inside this browser tab, so ask me anything about ${name}'s work, projects or background.`,
  (name) =>
    `I am SyncBot, running on your device rather than a server. Ask me about ${name}'s roles, the things he has built, or how to reach him.`,
  (name) =>
    `SyncBot here. Everything I know is ${name}'s profile, and everything you type stays in this tab. What would you like to know?`,
  (name) =>
    `Hi, I am SyncBot — a small model loaded into your browser. Ask me about ${name}'s experience, his projects, or the stack he works in.`,
  (name) =>
    `I am SyncBot. No server, no account, nothing leaving this tab. Ask me anything about ${name}'s work or background.`,
  (name) =>
    `Hello. I am SyncBot, and I answer from ${name}'s profile alone — his experience, projects, skills and contact details. Where shall we start?`,
];

/** The opening message, varied per page load. */
export function greeting(subjectFirstName: string): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)](subjectFirstName);
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
