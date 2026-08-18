/**
 * Answers that are looked up, not generated.
 *
 * Three kinds of question are handled here instead of by the model:
 *
 *  - **Arithmetic** ("how many years of experience, with a breakdown"). This is
 *    what the console used to get spectacularly wrong: it read the month counts
 *    off the technology list, added them together, and reported the sum as a
 *    career total. The numbers are in profile.json and the sum is a subtraction
 *    of dates — there is nothing for a language model to contribute.
 *  - **Transcription** ("how do I reach him"). An email address or a phone
 *    number is only useful if it is exactly right, and small models drop digits.
 *  - **Questions about SyncBot itself**, which the dossier says nothing about,
 *    so the model would either refuse or invent.
 *
 * Everything else falls through to the model. These replies cost zero tokens
 * and land instantly, which is also why the most-asked questions now feel fast.
 */

import type { Profile } from '../../types/profile';
import {
  absoluteUrl,
  formatMonths,
  isOnTopic,
  tenures,
  totalExperienceMonths,
  type Dossier,
} from './knowledge';

/** Said when the question has nothing to do with the profile. */
export function offTopicReply(firstName: string): string {
  return `That is outside what I know. I only hold ${firstName}'s profile — his roles and experience, projects, technologies, education, certifications and contact details. Ask me about any of those.`;
}

/* -------------------------------------------------------------- matchers */

const QUANTITY =
  /\b(how long|how many|how much|total|totals|overall|combined|altogether|breakdown|break it down|years?|yrs?|duration|tenure|seniority)\b/i;
const CAREER =
  /\b(experience|experienced|career|worked|working|work history|professional|profession|job|jobs|employment|employer|employers|role|roles|position|positions)\b/i;
/**
 * Named channels only. An earlier draft also matched "hire", which turned "why
 * should I hire him?" — a question that wants an argument — into a contact card.
 * Wanting to work with him is not the same as asking for his phone number.
 */
const CONTACT =
  /\b(contact|contacts|reach him|reach out|get in touch|email|e-mail|mail him|phone|resume|résumé|\bcv\b|linkedin|github|whatsapp)\b/i;
const SELF =
  /\b(who are you|what are you|your name|are you (a |an )?(bot|ai|human|real|person|robot|llm|model|chatgpt|gpt|claude|gemini)|what (model|llm|ai) (are|do)|which (model|llm)|what can you do|how do you work|are you online|do you (store|save|send|keep|record))\b/i;

/**
 * Guards the experience matcher. "How many years has he used React" is a
 * question about one technology, and its answer lives in that technology's own
 * record — sending back the whole career breakdown would be a non-sequitur.
 */
function namesSomethingSpecific(question: string, profile: Profile): boolean {
  const asked = question.toLowerCase();
  const named = [
    ...profile.expertises.map((item) => item.name),
    ...profile.projects.map((item) => item.name),
    ...profile.skills.map((item) => item.name),
  ];
  return named.some((name) => {
    const term = name.toLowerCase();
    return term.length > 2 && new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(asked);
  });
}

/* --------------------------------------------------------------- answers */

function experienceAnswer(profile: Profile): string {
  const { info, experiences } = profile;
  const roles = tenures(experiences);
  const total = formatMonths(totalExperienceMonths(experiences));

  const lines = roles.map(
    (role) =>
      `- **${role.position}** at ${role.employer} — ${role.span} · ${role.duration}${role.current ? ' and counting' : ''}`
  );

  return [
    `${info.first_name} has **${total}** of professional experience, across ${roles.length} roles:`,
    '',
    ...lines,
    '',
    'That total counts the roles themselves, so the gap between two of them is not included.',
  ].join('\n');
}

function contactAnswer(profile: Profile): string {
  const { info } = profile;

  // profile.json often repeats a value in the "alternative" field; listing the
  // same address twice reads as an error.
  const unique = (...values: (string | null | undefined)[]) => [
    ...new Set(values.map((value) => (value ?? '').trim()).filter(Boolean)),
  ];

  const lines: string[] = [];
  const push = (label: string, values: string[]) => {
    if (values.length) lines.push(`- ${label}: ${values.join(' · ')}`);
  };

  push('Email', unique(info.email, info.alternative_email));
  push('Phone', unique(info.phone, info.secondary_phone));
  push('LinkedIn', unique(info.linkedin_url));
  push('GitHub', unique(info.github_url));
  push('WhatsApp', unique(info.whatsapp_url));
  push('Resume', unique(absoluteUrl(info.resume_url, info.website_base_url)));

  return [
    `Here is how to reach ${info.first_name}:`,
    '',
    ...lines,
    '',
    info.address ? `He is based in ${info.address.trim()}.` : '',
  ]
    .filter((line, index, all) => line !== '' || all[index - 1] !== '')
    .join('\n')
    .trim();
}

function selfAnswer(firstName: string, modelLabel: string): string {
  return `I am SyncBot — ${modelLabel} running inside this browser tab, on your own GPU. My whole world is ${firstName}'s profile: his roles, projects, technologies, education, certifications and contact details. Nothing you type is sent to a server, and nothing is kept once you close the tab.`;
}

/* ----------------------------------------------------------------- entry */

export interface FastAnswerInput {
  profile: Profile;
  dossier: Dossier;
  question: string;
  /** Short human name for the loaded model, e.g. "a 0.5B language model". */
  modelLabel: string;
}

/**
 * Returns a finished answer when the question is one of the looked-up kinds or
 * is plainly off-topic, and `null` when the model should handle it.
 */
export function fastAnswer({
  profile,
  dossier,
  question,
  modelLabel,
}: FastAnswerInput): string | null {
  const asked = question.trim();
  if (!asked) return null;

  if (SELF.test(asked)) return selfAnswer(profile.info.first_name, modelLabel);

  if (CONTACT.test(asked) && !namesSomethingSpecific(asked, profile)) {
    return contactAnswer(profile);
  }

  if (QUANTITY.test(asked) && CAREER.test(asked) && !namesSomethingSpecific(asked, profile)) {
    return experienceAnswer(profile);
  }

  if (!isOnTopic(dossier.chunks, asked)) return offTopicReply(profile.info.first_name);

  return null;
}
