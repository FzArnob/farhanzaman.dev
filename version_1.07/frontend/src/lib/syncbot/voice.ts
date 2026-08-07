/**
 * Voice in and voice out for SyncBot.
 *
 * Input is the Web Speech API's SpeechRecognition; output is speechSynthesis.
 * Both ship with the browser, so voice adds nothing to the download the visitor
 * already paid for.
 *
 * PRIVACY: speechSynthesis is local, but SpeechRecognition is *not* — Chrome and
 * Edge stream the captured audio to their vendor's speech service. That is the
 * one part of this page that leaves the device, which is why the listening panel
 * says so out loud. Everything else (the model, the dossier, the answers) still
 * runs entirely on the visitor's GPU.
 *
 * lib.dom has no SpeechRecognition typings, so the slice this file uses is
 * declared below rather than pulling in a dependency for it.
 */

import { parseBlocks, type Span } from './richText';

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternative;
}

interface RecognitionResultList {
  length: number;
  [index: number]: RecognitionResult;
}

interface RecognitionEvent {
  resultIndex: number;
  results: RecognitionResultList;
}

interface RecognitionErrorEvent {
  error: string;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export interface VoiceSupport {
  recognition: boolean;
  synthesis: boolean;
}

export function detectVoiceSupport(): VoiceSupport {
  return {
    recognition: recognitionCtor() !== null,
    synthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}

/** Recognition error codes, phrased for someone who is not debugging a browser. */
const ERROR_TEXT: Record<string, string> = {
  'not-allowed': 'Microphone access is blocked. Allow it from the address bar, then try again.',
  'service-not-allowed': 'The browser would not start its speech service.',
  'no-speech': 'I did not catch that — tap the mic and try again.',
  'audio-capture': 'No microphone was found on this device.',
  network: 'The browser speech service could not be reached.',
  // The visitor pressed stop; they know why it stopped.
  aborted: '',
};

/* ------------------------------------------------------------------- input */

/** Bars in the level meter. At METER_STEP_MS each, that is ~1.2s of history. */
export const METER_BARS = 20;

/** How often a fresh sample enters the meter and the older ones shuffle along. */
const METER_STEP_MS = 60;

export interface ListenHandlers {
  /** Recent 0..1 microphone loudness, one entry per meter bar, oldest first. */
  onLevel: (levels: number[]) => void;
  /** Best guess so far, replaced as the visitor keeps talking. */
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  /** Recognition has released the microphone, whatever the outcome. */
  onEnd: () => void;
}

export interface ListenSession {
  /** Ends the utterance and keeps whatever was heard. */
  stop(): void;
  /** Throws the utterance away. */
  abort(): void;
}

/**
 * Taps the microphone purely to drive the level meter. Recognition does not
 * expose loudness, and a panel that says "Listening…" without reacting to the
 * room gives the visitor no way to tell a dead mic from a quiet one.
 */
async function startMeter(onLevel: (levels: number[]) => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const context = new Ctor();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);

  const samples = new Uint8Array(analyser.fftSize);
  // Oldest bar first. Every step drops the leftmost one and appends the newest,
  // so the meter scrolls the way a recorder's waveform does.
  const history = new Array<number>(METER_BARS).fill(0);
  let peak = 0;
  let stepped = 0;
  let frame = 0;

  const tick = (now: number) => {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (let i = 0; i < samples.length; i += 1) {
      const deviation = (samples[i] - 128) / 128;
      sum += deviation * deviation;
    }
    // Speech RMS sits around 0.05–0.2, so it needs scaling to fill the meter.
    peak = Math.max(peak, Math.min(1, Math.sqrt(sum / samples.length) * 4.5));

    // A bar is the loudest moment since the previous one rather than whichever
    // instant the frame landed on: one 5ms window per step would miss the peak
    // of most syllables and the meter would read far quieter than the room.
    if (now - stepped >= METER_STEP_MS) {
      stepped = now;
      history.shift();
      history.push(peak);
      peak = 0;
      onLevel(history);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    source.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    void context.close();
  };
}

export async function startListening(handlers: ListenHandlers): Promise<ListenSession> {
  const Ctor = recognitionCtor();
  if (!Ctor) throw new Error('This browser cannot listen. Type your question instead.');

  const recognition = new Ctor();
  recognition.lang = 'en-US';
  // One question per press: recognition closes itself on the first pause, which
  // is the cue to send. Continuous mode would leave the visitor hunting for stop.
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let stopMeter: (() => void) | null = null;
  const release = () => {
    stopMeter?.();
    stopMeter = null;
  };

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? '';
      if (result.isFinal) final += text;
      else interim += text;
    }
    if (interim.trim()) handlers.onInterim(interim.trim());
    if (final.trim()) handlers.onFinal(final.trim());
  };

  recognition.onerror = (event) => {
    const message = ERROR_TEXT[event.error] ?? 'Voice input failed. Type your question instead.';
    if (message) handlers.onError(message);
  };

  recognition.onend = () => {
    release();
    handlers.onEnd();
  };

  // The meter is a nicety — if the raw mic tap fails, recognition still runs and
  // will report the real reason through onerror.
  stopMeter = await startMeter(handlers.onLevel).catch(() => null);
  recognition.start();

  return {
    stop: () => recognition.stop(),
    abort: () => {
      release();
      recognition.abort();
    },
  };
}

/* ------------------------------------------------------------------ output */

let cachedVoice: SpeechSynthesisVoice | null | undefined;

/** getVoices() is empty until the list loads, so this is called early and re-run. */
export function primeVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined;
  });
}

function preferredVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  // Still loading — do not cache the miss.
  if (!voices.length) return null;
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
  cachedVoice =
    english.find((voice) => /natural|neural|google|samantha|aria|jenny/i.test(voice.name)) ??
    english[0] ??
    null;
  return cachedVoice;
}

export interface Speaker {
  /** Speaks any *complete* sentences in `text` that have not been spoken yet. */
  push(text: string): void;
  /** Speaks the remainder, closing punctuation or not. */
  finish(text: string): void;
  /** Silences everything queued and rewinds to the start of the next answer. */
  cancel(): void;
}

/** Titles and short forms whose full stop does not end a sentence. */
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'md', 'st', 'jr', 'sr', 'prof', 'inc', 'ltd', 'etc',
  'vs', 'approx', 'fig', 'eg', 'ie', 'no',
]);

/** True when the full stop at `dot` closes an abbreviation rather than a sentence. */
function isAbbreviation(text: string, dot: number): boolean {
  let start = dot;
  while (start > 0 && /[A-Za-z]/.test(text[start - 1])) start -= 1;
  const word = text.slice(start, dot);
  if (!word) return false;
  // Two letters or fewer catches initials and Md./Dr./St. without a list.
  return word.length <= 2 || ABBREVIATIONS.has(word.toLowerCase());
}

/**
 * Finds the end of the last complete sentence after `from`.
 *
 * Requires whitespace after the terminator so a decimal ("3.5") stays whole, and
 * skips abbreviations so "Md. Farhan" is not read as two sentences. A full stop
 * that is still the final character waits for the next token rather than
 * guessing — `finish()` speaks whatever is left over.
 */
function lastSentenceEnd(text: string, from: number): number {
  for (let i = text.length - 2; i > from; i -= 1) {
    const char = text[i];
    if (char !== '.' && char !== '!' && char !== '?' && char !== '\n') continue;
    const next = text[i + 1];
    if (char !== '\n' && next !== ' ' && next !== '\n') continue;
    if (char === '.' && isAbbreviation(text, i)) continue;
    return i + 1;
  }
  return from;
}

/**
 * Speaks an answer as it streams.
 *
 * Chunking by sentence is not only about latency: Chrome silently drops a single
 * utterance that runs much past ~15 seconds, so one long answer handed over
 * whole would cut off mid-word.
 */
export function createSpeaker(handlers: { onStart: () => void; onEnd: () => void }): Speaker {
  let spoken = 0;
  let pending = 0;
  let announced = false;

  const finished = () => {
    pending -= 1;
    if (pending > 0 || !announced) return;
    announced = false;
    handlers.onEnd();
  };

  const enqueue = (chunk: string) => {
    const words = toSpeech(chunk);
    if (words.length < 2) return;

    const utterance = new SpeechSynthesisUtterance(words);
    const voice = preferredVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1.02;
    utterance.onstart = () => {
      if (announced) return;
      announced = true;
      handlers.onStart();
    };
    utterance.onend = finished;
    utterance.onerror = finished;

    pending += 1;
    window.speechSynthesis.speak(utterance);
  };

  return {
    push(text) {
      const boundary = lastSentenceEnd(text, spoken);
      if (boundary <= spoken) return;
      enqueue(text.slice(spoken, boundary));
      spoken = boundary;
    },
    finish(text) {
      if (text.length > spoken) enqueue(text.slice(spoken));
      spoken = text.length;
    },
    cancel() {
      window.speechSynthesis.cancel();
      spoken = 0;
      pending = 0;
      if (!announced) return;
      announced = false;
      handlers.onEnd();
    },
  };
}

function spansToSpeech(spans: Span[]): string {
  return spans
    .map((span) => {
      if (span.kind !== 'entity') return span.text;
      if (span.type === 'email') {
        return span.label.replace(/@/g, ' at ').replace(/\./g, ' dot ');
      }
      if (span.type === 'phone') {
        // Read as digits. A synthesiser given "8801521581368" says
        // "eight trillion eight hundred and one billion…".
        const digits = span.label.replace(/\D/g, '').split('').join(' ');
        return span.label.includes('+') ? `plus ${digits}` : digits;
      }
      return span.label;
    })
    .join('');
}

/**
 * Turns a rendered answer back into something worth hearing: chips become their
 * labels, code blocks are dropped, and list items become sentences.
 */
export function toSpeech(content: string): string {
  const parts: string[] = [];

  for (const block of parseBlocks(content)) {
    if (block.kind === 'pre') continue;
    if (block.kind === 'list') {
      for (const item of block.items) parts.push(spansToSpeech(item));
    } else {
      parts.push(spansToSpeech(block.spans));
    }
  }

  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    // Each block becomes its own sentence, but a heading or a "Details:" lead-in
    // already carries its punctuation — appending another gives "details:.".
    .map((part) => (/[.!?:;,]$/.test(part) ? part : `${part}.`))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
