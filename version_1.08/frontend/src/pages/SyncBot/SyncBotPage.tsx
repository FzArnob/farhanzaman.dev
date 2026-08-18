import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import {
  createEngine,
  detectDevice,
  streamReply,
  warmUp,
  type ChatEngine,
  type DeviceProfile,
} from '../../lib/syncbot/engine';
import { buildDossier } from '../../lib/syncbot/knowledge';
import { fastAnswer } from '../../lib/syncbot/facts';
import {
  buildMessages,
  greeting,
  starterQuestions,
  type ChatTurn,
} from '../../lib/syncbot/prompt';
import {
  createSpeaker,
  detectVoiceSupport,
  primeVoices,
  startListening,
  METER_BARS,
  type ListenSession,
  type Speaker,
} from '../../lib/syncbot/voice';
import { RichText } from '../../components/SyncBot/RichText';
import { sync, track } from '../../lib/sync';

type Phase = 'linking' | 'ready' | 'error' | 'unsupported';

interface BootLine {
  id: number;
  text: string;
  /** Rendered dim once the next stage starts. */
  done: boolean;
}

/** Boot messages unlocked as the real download progress crosses each threshold. */
const BOOT_STAGES: { at: number; text: string }[] = [
  { at: 0, text: 'handshake // gpu adapter acquired' },
  { at: 0.02, text: 'fetching neural weights' },
  { at: 0.35, text: 'weights streaming — shards inbound' },
  { at: 0.7, text: 'compiling gpu kernels' },
  { at: 0.93, text: 'warming inference pipeline' },
  { at: 0.999, text: 'link established' },
];

/**
 * Ambient text drifting behind the console. Deliberately meaningless as reading
 * material — it is texture, not copy, which is why it sits at ~5% opacity.
 */
const DRIFT_COLUMNS = [
  ['SYNC', 'TENSOR', 'LOCAL', 'SHARD', 'KERNEL', 'CACHE', 'TOKEN', 'GRAPH'],
  ['NEURAL', 'STREAM', 'DEVICE', 'WEIGHTS', 'PRIVATE', 'VECTOR', 'INDEX', 'LAYER'],
  ['DOSSIER', 'INFER', 'OFFLINE', 'MATRIX', 'CONTEXT', 'PROMPT', 'DECODE', 'STATE'],
  ['RUNTIME', 'BUFFER', 'ATTEND', 'SIGNAL', 'MEMORY', 'EMBED', 'SAMPLE', 'LOGIT'],
];

/**
 * The horizontal crawl. Kept static per phase rather than mirroring the live
 * status text: the marquee loops on a percentage of its own width, so a caption
 * that changed every few hundred milliseconds would visibly jump each time.
 */
const TICKER_TEXT: Record<Phase, string> = {
  linking:
    'establishing neural link · streaming weights · compiling kernels · establishing neural link · ',
  ready:
    'nothing you type here leaves this tab · every answer is generated on your own gpu · ',
  error: 'link dropped · the whole story is still on the site · link dropped · ',
  unsupported: 'no neural link here · the whole story is still on the site · ',
};

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** One bar per loudness sample the meter keeps; heights come from the mic. */
const WAVE_BARS = Array.from({ length: METER_BARS }, (_, bar) => bar);

export function SyncBotPage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('syncbot');

  const [phase, setPhase] = useState<Phase>('linking');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('probing hardware');
  const [bootLines, setBootLines] = useState<BootLine[]>([]);
  const [errorText, setErrorText] = useState('');
  const [device, setDevice] = useState<DeviceProfile | null>(null);

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);

  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const engineRef = useRef<ChatEngine | null>(null);
  const startedRef = useRef(false);
  const stageRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aliveRef = useRef(true);
  const sessionRef = useRef<ListenSession | null>(null);
  const speakerRef = useRef<Speaker | null>(null);
  const waveRef = useRef<HTMLSpanElement>(null);

  const voice = useMemo(detectVoiceSupport, []);

  useDocumentTitle('SyncBot - ' + info.full_name);

  // Indexing 90 KB of profile JSON is cheap, but there is no reason to redo it per render.
  const dossier = useMemo(() => buildDossier(profile), [profile]);
  const starters = useMemo(() => starterQuestions(info.first_name), [info.first_name]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      // Leaving the page must not leave the microphone open or the tab talking.
      sessionRef.current?.abort();
      speakerRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!voice.synthesis) return;
    primeVoices();
    const speaker = createSpeaker({
      onStart: () => aliveRef.current && setSpeaking(true),
      onEnd: () => aliveRef.current && setSpeaking(false),
    });
    speakerRef.current = speaker;
    return () => {
      speaker.cancel();
      speakerRef.current = null;
    };
  }, [voice.synthesis]);

  /** Opens (or reopens) the thread. Instant — the greeting is not generated. */
  const openThread = useCallback(() => {
    setTurns([{ role: 'assistant', content: greeting(info.first_name) }]);
    setStreaming(false);
  }, [info.first_name]);

  const pushBootLine = useCallback((text: string) => {
    setBootLines((lines) => {
      if (lines.some((line) => line.text === text)) return lines;
      return [
        ...lines.map((line) => ({ ...line, done: true })),
        { id: lines.length, text, done: false },
      ];
    });
  }, []);

  /** Downloads and compiles the model. Runs at most once per page load. */
  const startEngine = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    setPhase('linking');
    setProgress(0);
    setBootLines([]);
    stageRef.current = 0;
    setStatusText('probing hardware');

    const detected = await detectDevice();
    if (!aliveRef.current) return;
    setDevice(detected);

    if (!detected.supported) {
      setPhase('unsupported');
      setErrorText(detected.reason ?? 'WebGPU is not available in this browser.');
      startedRef.current = false;
      track(
        'syncbot',
        sync.features.syncbot_console,
        sync.activities.page_view,
        sync.actions.syncbot_unavailable
      );
      return;
    }

    pushBootLine(BOOT_STAGES[0].text);
    stageRef.current = 1;

    try {
      const loaded = await createEngine(detected, (report) => {
        if (!aliveRef.current) return;
        setProgress(report.progress || 0);
        setStatusText(report.text || '');
        while (
          stageRef.current < BOOT_STAGES.length &&
          (report.progress || 0) >= BOOT_STAGES[stageRef.current].at
        ) {
          pushBootLine(BOOT_STAGES[stageRef.current].text);
          stageRef.current += 1;
        }
      });
      if (!aliveRef.current) return;

      engineRef.current = loaded.engine;
      setProgress(1);
      pushBootLine(`dossier indexed — ${dossier.recordCount} records`);

      // Compile the decode kernels here, behind the boot animation, rather than
      // letting the visitor's first question pay for them.
      await warmUp(loaded.engine);
      if (!aliveRef.current) return;

      pushBootLine(BOOT_STAGES[BOOT_STAGES.length - 1].text);
      setPhase('ready');
      track(
        'syncbot',
        sync.features.syncbot_console,
        sync.activities.page_view,
        sync.actions.syncbot_ready
      );
      openThread();
    } catch (error) {
      if (!aliveRef.current) return;
      setPhase('error');
      setErrorText(
        error instanceof Error ? error.message : 'The model could not be loaded on this device.'
      );
      startedRef.current = false;
    }
  }, [dossier.recordCount, openThread, pushBootLine]);

  // Landing on /syncbot is intent enough — no second click before the download starts.
  useEffect(() => {
    void startEngine();
  }, [startEngine]);

  useEffect(() => {
    if (ready && phase === 'ready' && !streaming) inputRef.current?.focus();
  }, [ready, phase, streaming]);

  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [turns, streaming]);

  const ask = useCallback(
    async (question: string, viaVoice = false) => {
      const engine = engineRef.current;
      const trimmed = question.trim();
      if (!engine || !trimmed || streaming) return;

      // A new question always silences the previous answer, and resets the
      // speaker's cursor whether or not this one will be read aloud.
      const speaker = speakerRef.current;
      speaker?.cancel();
      const voiced = viaVoice && speaker !== null;

      setDraft('');
      setStreaming(true);
      const history = turns.filter((turn) => turn.content.length > 0);
      setTurns((current) => [
        ...current,
        { role: 'user', content: trimmed },
        { role: 'assistant', content: '' },
      ]);
      track(
        'syncbot',
        sync.features.syncbot_console,
        sync.activities.submit,
        viaVoice ? sync.actions.syncbot_voice_question : sync.actions.syncbot_question
      );

      try {
        // Looked-up answers short-circuit the model entirely: no prefill, no
        // decode, no chance of a hallucinated date. See lib/syncbot/facts.ts.
        const looked = fastAnswer({
          profile,
          dossier,
          question: trimmed,
          modelLabel: device?.tier === 'light' ? 'a 360M language model' : 'a 0.5B language model',
        });
        if (looked) {
          if (voiced) speaker?.speak(looked);
          setTurns((current) => {
            const next = [...current];
            next[next.length - 1] = { role: 'assistant', content: looked };
            return next;
          });
          return;
        }

        // The greeting is UI copy, not a real turn — it would only confuse the model.
        const priorTurns = history.slice(1);
        const messages = buildMessages(
          dossier,
          priorTurns,
          trimmed,
          info.full_name,
          info.first_name
        );
        const final = await streamReply(engine, messages, (text) => {
          if (!aliveRef.current) return;
          // Speaking sentence-by-sentence as they land, rather than waiting for
          // the full answer, is what keeps a spoken reply from starting seconds
          // after the visitor stopped talking.
          if (voiced) speaker?.push(text);
          setTurns((current) => {
            const next = [...current];
            next[next.length - 1] = { role: 'assistant', content: text };
            return next;
          });
        });
        if (!aliveRef.current) return;
        if (voiced) speaker?.finish(final.trim());
        setTurns((current) => {
          const next = [...current];
          next[next.length - 1] = { role: 'assistant', content: final.trim() };
          return next;
        });
      } catch (error) {
        if (!aliveRef.current) return;
        speaker?.cancel();
        setTurns((current) => {
          const next = [...current];
          next[next.length - 1] = {
            role: 'assistant',
            content: `Signal lost — ${error instanceof Error ? error.message : 'generation failed'}. Try asking again.`,
          };
          return next;
        });
      } finally {
        if (aliveRef.current) setStreaming(false);
      }
    },
    [device?.tier, dossier, info.first_name, info.full_name, profile, streaming, turns]
  );

  // The listening session captures `ask` for as long as the mic is open, so it
  // reads the current one from a ref rather than closing over a stale copy.
  const askRef = useRef(ask);
  useEffect(() => {
    askRef.current = ask;
  }, [ask]);

  // getUserMedia makes starting a session async, so a second tap can land before
  // the first one has a session to abort. The token retires that orphan.
  const listenTokenRef = useRef(0);

  const stopListening = useCallback(() => {
    listenTokenRef.current += 1;
    sessionRef.current?.abort();
    sessionRef.current = null;
    setListening(false);
    setHeard('');
  }, []);

  const toggleListening = useCallback(async () => {
    if (listening) {
      stopListening();
      return;
    }
    if (streaming) return;

    // Barge-in: talking over the previous answer stops it.
    speakerRef.current?.cancel();
    setVoiceError('');
    setHeard('');
    setListening(true);
    const token = (listenTokenRef.current += 1);

    try {
      const session = await startListening({
        onLevel: (levels) => {
          // Each bar carries its own level, written straight onto the element.
          // Going through React state would re-render the page at 60fps.
          const bars = waveRef.current?.children;
          if (!bars) return;
          for (let i = 0; i < bars.length && i < levels.length; i += 1) {
            (bars[i] as HTMLElement).style.setProperty('--syncbot-level', levels[i].toFixed(2));
          }
        },
        onInterim: (text) => aliveRef.current && setHeard(text),
        onFinal: (text) => {
          if (!aliveRef.current) return;
          sessionRef.current = null;
          setListening(false);
          setHeard('');
          void askRef.current(text, true);
        },
        onError: (message) => aliveRef.current && setVoiceError(message),
        onEnd: () => {
          // Recognition closes itself after a pause. If no final result arrived
          // the panel still has to come back down.
          if (!aliveRef.current) return;
          sessionRef.current = null;
          setListening(false);
        },
      });

      // Retired while getUserMedia was still resolving — drop it on the floor.
      if (listenTokenRef.current !== token || !aliveRef.current) {
        session.abort();
        return;
      }
      sessionRef.current = session;
    } catch (error) {
      if (!aliveRef.current) return;
      setListening(false);
      setVoiceError(error instanceof Error ? error.message : 'Voice input is unavailable.');
    }
  }, [listening, stopListening, streaming]);

  /** Start over — including a freshly worded opening line. */
  const resetThread = useCallback(() => {
    if (streaming || !engineRef.current) return;
    stopListening();
    speakerRef.current?.cancel();
    track(
      'syncbot',
      sync.features.syncbot_console,
      sync.activities.click,
      sync.actions.syncbot_reset
    );
    openThread();
  }, [openThread, stopListening, streaming]);

  const percent = Math.round(progress * 100);

  return (
    <PageShell ready={ready}>
      <Navbar />
      <main className="syncbot-page">
        {/* --- ambient background: grid, aurora and drifting type ---------- */}
        <div className="syncbot-ambient" aria-hidden="true">
          <span className="syncbot-aurora syncbot-aurora-a"></span>
          <span className="syncbot-aurora syncbot-aurora-b"></span>
          <span className="syncbot-mesh"></span>
          <div className="syncbot-drift">
            {DRIFT_COLUMNS.map((words, column) => (
              <div className="syncbot-drift-col" key={column}>
                <div className="syncbot-drift-run">
                  {/* Two identical halves, each taller than the viewport, so the
                      -50% translate loops without ever exposing a seam. */}
                  {[0, 1].map((half) => (
                    <div className="syncbot-drift-half" key={half}>
                      {words.map((word) => (
                        <span key={word}>{word}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="syncbot-ticker">
            <div className="syncbot-ticker-run">
              {[0, 1].map((copy) => (
                <span key={copy}>{TICKER_TEXT[phase]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* --- console ---------------------------------------------------- */}
        <section className="syncbot-console">
          {/* There is no visible title bar, but the page still needs a heading. */}
          <h1 className="syncbot-sr">SyncBot</h1>

          {phase === 'ready' && (
            <div className="syncbot-toolbar">
              <button
                type="button"
                className="syncbot-reset"
                onClick={resetThread}
                disabled={streaming}
                title="Start over"
                aria-label="Start over"
              >
                <Icon name="refresh" size={23} />
              </button>
            </div>
          )}

          {phase === 'linking' && (
            <div className="syncbot-boot">
              <div className="syncbot-reactor">
                <span className="syncbot-ring syncbot-ring-1"></span>
                <span className="syncbot-ring syncbot-ring-2"></span>
                <span className="syncbot-ring syncbot-ring-3"></span>
                <span className="syncbot-sweep"></span>
                <span className="syncbot-orbit syncbot-orbit-1">
                  <i></i>
                </span>
                <span className="syncbot-orbit syncbot-orbit-2">
                  <i></i>
                </span>
                <svg className="syncbot-gauge" viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="syncbot-gauge-track" cx="60" cy="60" r={RING_RADIUS} />
                  <circle
                    className="syncbot-gauge-value"
                    cx="60"
                    cy="60"
                    r={RING_RADIUS}
                    style={{
                      strokeDasharray: RING_LENGTH,
                      strokeDashoffset: RING_LENGTH * (1 - progress),
                    }}
                  />
                </svg>
                <span className="syncbot-core" aria-hidden="true"></span>
                <span className="syncbot-percent">
                  {percent}
                  <i>%</i>
                </span>
              </div>

              <div className="syncbot-bar" role="progressbar" aria-valuenow={percent}>
                <span className="syncbot-bar-fill" style={{ width: `${percent}%` }}></span>
              </div>

              <ul className="syncbot-log">
                {bootLines.map((line) => (
                  <li key={line.id} className={line.done ? 'done' : 'active'}>
                    <Icon name={line.done ? 'check' : 'chevron'} size={15} />
                    {line.text}
                  </li>
                ))}
              </ul>

              <p className="syncbot-status" role="status">
                {statusText || 'initialising…'}
              </p>
              <p className="syncbot-note">
                <Icon name="lock" size={15} />
                {device ? `A ${device.downloadMB} MB model` : 'The model'} downloads once, then your
                browser caches it — every later visit opens straight away. It runs on your GPU,
                nothing is sent to a server.
              </p>
            </div>
          )}

          {(phase === 'unsupported' || phase === 'error') && (
            <div className="syncbot-fallback">
              <span className="syncbot-fallback-glyph">
                <Icon name="warning" size={40} />
              </span>
              <h2 className="syncbot-fallback-title">
                {phase === 'unsupported' ? 'No neural link on this device' : 'The link dropped'}
              </h2>
              <p className="syncbot-fallback-text">{errorText}</p>
              {device && !device.supported && (
                <p className="syncbot-fallback-text">
                  Everything SyncBot would have told you is on the site already.
                </p>
              )}
              <div className="syncbot-fallback-actions">
                <Link className="syncbot-chip" to="/about">
                  <Icon name="person" size={16} />
                  About {info.first_name}
                </Link>
                <Link className="syncbot-chip" to="/works">
                  <Icon name="work" size={16} />
                  His work
                </Link>
                <a
                  className="syncbot-chip"
                  href={info.resume_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="document" size={16} />
                  Resume
                </a>
                {phase === 'error' && (
                  <button
                    type="button"
                    className="syncbot-chip syncbot-chip-action"
                    onClick={() => void startEngine()}
                  >
                    <Icon name="refresh" size={16} />
                    Retry link
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div className="syncbot-thread" ref={scrollRef}>
                {turns.map((turn, index) => (
                  <div key={index} className={`syncbot-turn syncbot-turn-${turn.role}`}>
                    <span className="syncbot-avatar">
                      <Icon name={turn.role === 'user' ? 'person' : 'bot'} size={17} />
                    </span>
                    <div className="syncbot-bubble">
                      <RichText
                        content={turn.content}
                        trailing={
                          streaming && index === turns.length - 1 ? (
                            turn.content.length === 0 ? (
                              <span className="syncbot-thinking" aria-label="Thinking">
                                <i></i>
                                <i></i>
                                <i></i>
                              </span>
                            ) : (
                              <span className="syncbot-caret" aria-hidden="true"></span>
                            )
                          ) : null
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {turns.length <= 1 && !streaming && (
                <div className="syncbot-starters">
                  {starters.map((question) => (
                    <button
                      key={question}
                      type="button"
                      className="syncbot-chip"
                      onClick={() => void ask(question)}
                    >
                      <Icon name="sparkle" size={15} />
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {(listening || speaking || voiceError) && (
                <div className={`syncbot-voice-note ${voiceError ? 'error' : ''}`} role="status">
                  <Icon
                    name={voiceError ? 'warning' : listening ? 'lock' : 'volume_up'}
                    size={15}
                  />
                  <span>
                    {voiceError ||
                      // The model and the answers never leave the tab, but
                      // SpeechRecognition hands the audio to the browser vendor.
                      // Claiming otherwise on this page would be a lie.
                      (listening
                        ? 'Your browser handles speech-to-text — this part is not on-device.'
                        : 'Speaking the answer…')}
                  </span>
                  {speaking && !listening && !voiceError && (
                    <button type="button" onClick={() => speakerRef.current?.cancel()}>
                      Stop
                    </button>
                  )}
                </div>
              )}

              <form
                className="syncbot-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask(draft);
                }}
              >
                {listening ? (
                  /* The text field gives way to the meter — the visitor is
                     talking, so there is nothing to type into. */
                  <div className="syncbot-listen">
                    <span className="syncbot-listen-wave" ref={waveRef} aria-hidden="true">
                      {WAVE_BARS.map((bar) => (
                        <i key={bar} />
                      ))}
                    </span>
                    <span className={`syncbot-listen-text ${heard ? 'heard' : ''}`}>
                      {heard || 'Listening… speak now'}
                    </span>
                    <button
                      type="button"
                      className="syncbot-listen-stop"
                      onClick={stopListening}
                      aria-label="Cancel voice input"
                      title="Cancel"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="syncbot-field">
                    <Icon name="bolt" size={18} className="syncbot-field-ico" />
                    <input
                      ref={inputRef}
                      type="text"
                      className="syncbot-input"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={streaming ? 'Generating…' : `Ask about ${info.first_name}…`}
                      disabled={streaming}
                      aria-label="Your question"
                    />
                  </div>
                )}

                {voice.recognition && (
                  <button
                    type="button"
                    className={`syncbot-mic ${listening ? 'live' : ''}`}
                    onClick={() => void toggleListening()}
                    disabled={streaming}
                    title={listening ? 'Stop listening' : 'Ask by voice'}
                    aria-label={listening ? 'Stop listening' : 'Ask by voice'}
                    aria-pressed={listening}
                  >
                    <Icon name="mic" size={20} />
                  </button>
                )}

                <button
                  type="submit"
                  className="syncbot-send"
                  disabled={streaming || listening || !draft.trim()}
                >
                  <Icon name="send" size={18} />
                  <span className="syncbot-send-text">Send</span>
                </button>
              </form>
            </>
          )}
        </section>

        <p className="syncbot-foot">
          <Icon name="memory" size={14} />
          Runs on your device. No key, no server, no history kept.
        </p>
      </main>
    </PageShell>
  );
}
