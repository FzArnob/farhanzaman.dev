/**
 * Thin wrapper around @mlc-ai/web-llm.
 *
 * The library (and the model weights) are pulled from the CDN on first use rather
 * than bundled, so visitors who never open /syncbot download nothing extra.
 * Everything runs on the visitor's GPU — no key, no server, no data leaves the tab.
 */

const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm';

export interface InitProgress {
  text: string;
  /** 0..1 */
  progress: number;
}

export interface ChatEngine {
  reload(modelId: string, config?: unknown): Promise<void>;
  chat: {
    completions: {
      create(request: unknown): Promise<AsyncIterable<{ choices: { delta: { content?: string } }[] }>>;
    };
  };
  getMessage(): Promise<string>;
  interruptGenerate(): void;
  unload(): Promise<void>;
}

interface WebLLMModule {
  CreateMLCEngine(
    modelId: string,
    options: { initProgressCallback?: (report: InitProgress) => void },
    config?: unknown
  ): Promise<ChatEngine>;
}

/**
 * Sizing is a first-impression decision, not a benchmark one. The visitor is
 * staring at a progress ring on a page they clicked out of curiosity, so the
 * download has to be small enough that they don't leave — and the answers only
 * have to be *read off* the dossier, never reasoned out, because the facts that
 * a small model gets wrong (dates, totals) are computed in `knowledge.ts` and
 * `facts.ts` before the prompt is ever built.
 *
 * Qwen2.5-0.5B-Instruct is that trade: ~265 MB on the wire against ~830 MB for
 * the 1.5B it replaces, roughly 3x the tokens per second, and still solid at
 * "answer from the text above". SmolLM2-360M (~195 MB) is the floor for devices
 * that cannot allocate even that. `q4f16` needs the shader-f16 WebGPU feature,
 * which older Intel/Android GPUs lack, hence the f32 twins.
 */
const MODELS = {
  standard: {
    f16: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    f32: 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
  },
  light: {
    f16: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    f32: 'SmolLM2-360M-Instruct-q4f32_1-MLC',
  },
} as const;

/** Rounded weight-download size per tier, for the boot copy. */
const DOWNLOAD_MB: Record<keyof typeof MODELS, number> = { standard: 265, light: 195 };

export type ModelTier = keyof typeof MODELS;

export interface DeviceProfile {
  supported: boolean;
  /** Why WebGPU is unavailable, for the "no link" panel. */
  reason?: string;
  tier: ModelTier;
  modelId: string;
  /** Smaller model retried automatically if the first one runs out of memory. */
  fallbackModelId: string;
  /** Approximate MB the visitor is about to download, shown during the boot. */
  downloadMB: number;
  shaderF16: boolean;
  adapterName?: string;
}

interface GPUAdapterLike {
  features: { has(name: string): boolean };
  limits: Record<string, number>;
  info?: { vendor?: string; architecture?: string };
}

/**
 * Chooses the largest model the device can plausibly hold. Deliberately
 * conservative: a visitor who gets a slightly smaller model still gets an answer,
 * whereas an over-ambitious pick fails at load with a wall of WebGPU errors.
 */
export async function detectDevice(): Promise<DeviceProfile> {
  const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<GPUAdapterLike | null> } })
    .gpu;

  const unsupported = (reason: string): DeviceProfile => ({
    supported: false,
    reason,
    tier: 'light',
    modelId: MODELS.light.f32,
    fallbackModelId: MODELS.light.f32,
    downloadMB: DOWNLOAD_MB.light,
    shaderF16: false,
  });

  if (!gpu) {
    return unsupported(
      'This browser has no WebGPU. Chrome, Edge or Brave 113+ (or Safari 18+) can run the model locally.'
    );
  }

  let adapter: GPUAdapterLike | null = null;
  try {
    adapter = await gpu.requestAdapter();
  } catch {
    adapter = null;
  }
  if (!adapter) {
    return unsupported(
      'No WebGPU adapter available. Hardware acceleration may be switched off in the browser settings.'
    );
  }

  const shaderF16 = adapter.features.has('shader-f16');
  const maxBuffer = Number(adapter.limits?.maxBufferSize ?? 0);
  const maxBinding = Number(adapter.limits?.maxStorageBufferBindingSize ?? 0);
  const deviceMemory = Number(
    (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8
  );
  // The 0.5B weights want ~950 MB of headroom once the KV cache and workspace are
  // allocated, so the bar is far lower than it was for the 1.5B: all but the most
  // constrained phones now get the standard tier.
  const roomy = maxBuffer >= 900_000_000 && maxBinding >= 600_000_000;
  const tier: ModelTier = roomy && deviceMemory > 2 ? 'standard' : 'light';
  const precision = shaderF16 ? 'f16' : 'f32';

  return {
    supported: true,
    tier,
    modelId: MODELS[tier][precision],
    fallbackModelId: MODELS.light[precision],
    downloadMB: DOWNLOAD_MB[tier],
    shaderF16,
    adapterName: adapter.info?.vendor,
  };
}

let modulePromise: Promise<WebLLMModule> | null = null;

/** The CDN module is fetched at most once per page load. */
function loadWebLLM(): Promise<WebLLMModule> {
  // The URL is held in a variable so Vite leaves the import alone at build time.
  modulePromise ??= import(/* @vite-ignore */ WEBLLM_CDN) as Promise<WebLLMModule>;
  return modulePromise;
}

export interface LoadedEngine {
  engine: ChatEngine;
  modelId: string;
  /** True when the first choice failed and the smaller model was used instead. */
  downgraded: boolean;
}

/**
 * Loads the engine, retrying once with the lighter model if the preferred one
 * cannot be allocated — the common failure on low-VRAM laptops and phones.
 */
export async function createEngine(
  device: DeviceProfile,
  onProgress: (report: InitProgress) => void
): Promise<LoadedEngine> {
  const webllm = await loadWebLLM();

  const config = {
    // Half the previous window. The prompt is a trimmed dossier plus four short
    // turns — around 1,300 tokens at its widest — so 2048 is all that is ever
    // used, and the KV cache it does not allocate is memory the visitor keeps.
    // (Must stay >= the model lib's 1k prefill chunk.)
    context_window_size: 2048,
    // Low: every answer is a restatement of the records, not a piece of writing.
    // Spread here shows up as invented dates, not as personality.
    temperature: 0.3,
    top_p: 0.9,
  };

  try {
    const engine = await webllm.CreateMLCEngine(
      device.modelId,
      { initProgressCallback: onProgress },
      config
    );
    return { engine, modelId: device.modelId, downgraded: false };
  } catch (error) {
    if (device.modelId === device.fallbackModelId) throw error;
    onProgress({ text: 'Reallocating for a lighter core…', progress: 0 });
    const engine = await webllm.CreateMLCEngine(
      device.fallbackModelId,
      { initProgressCallback: onProgress },
      config
    );
    return { engine, modelId: device.fallbackModelId, downgraded: true };
  }
}

/**
 * Burns one token through the pipeline before the console opens.
 *
 * The first generation after a load pays for the WebGPU shader compilation of
 * every kernel in the decode path — seconds, on a cold cache. Paying it here,
 * while the boot log still says "warming inference pipeline", means the
 * visitor's actual first question starts producing text immediately. Failure is
 * ignored on purpose: a warm-up that throws is not a reason to refuse the chat.
 */
export async function warmUp(engine: ChatEngine): Promise<void> {
  try {
    await engine.chat.completions.create({
      stream: false,
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 1,
    });
  } catch {
    /* best effort */
  }
}

export interface ReplyOptions {
  maxTokens?: number;
  /** Overrides the engine default — the greeting wants more spread than an answer. */
  temperature?: number;
}

/** Streams a completion, invoking `onDelta` with the full text so far. */
export async function streamReply(
  engine: ChatEngine,
  messages: { role: string; content: string }[],
  onDelta: (text: string) => void,
  options: ReplyOptions = {}
): Promise<string> {
  const completion = await engine.chat.completions.create({
    stream: true,
    messages,
    // A grounded answer is 2-3 sentences. The old 420 only ever bought the model
    // room to keep restating itself, and every token of it was decode time.
    max_tokens: options.maxTokens ?? 260,
    ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
  });

  let text = '';
  for await (const part of completion) {
    const delta = part.choices?.[0]?.delta?.content;
    if (delta) {
      text += delta;
      onDelta(text);
    }
  }
  return (await engine.getMessage()) || text;
}
