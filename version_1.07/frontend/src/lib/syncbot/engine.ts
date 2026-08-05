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
 * Qwen2.5-Instruct is the pick: it follows "answer only from the dossier"
 * instructions far more reliably than same-size Llama/SmolLM builds, and the 1.5B
 * weights land around 1.1 GB — small enough for a phone, sharp enough to hold a
 * conversation. `q4f16` halves the download but needs the shader-f16 WebGPU
 * feature, which older Intel/Android GPUs lack, hence the f32 twins.
 */
const MODELS = {
  standard: {
    f16: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    f32: 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC',
  },
  light: {
    f16: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    f32: 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC',
  },
} as const;

export type ModelTier = keyof typeof MODELS;

export interface DeviceProfile {
  supported: boolean;
  /** Why WebGPU is unavailable, for the "no link" panel. */
  reason?: string;
  tier: ModelTier;
  modelId: string;
  /** Smaller model retried automatically if the first one runs out of memory. */
  fallbackModelId: string;
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
  const coarseDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && deviceMemory <= 6;

  // ~1.5 GB of addressable buffer is roughly what the 1.5B weights need headroom for.
  const roomy = maxBuffer >= 1_500_000_000 && maxBinding >= 1_000_000_000;
  const tier: ModelTier = roomy && deviceMemory > 4 && !coarseDevice ? 'standard' : 'light';
  const precision = shaderF16 ? 'f16' : 'f32';

  return {
    supported: true,
    tier,
    modelId: MODELS[tier][precision],
    fallbackModelId: MODELS.light[precision],
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
    // Comfortably fits the retrieved dossier plus a few turns of history, and
    // keeps the KV cache small enough for modest GPUs.
    context_window_size: 4096,
    temperature: 0.5,
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
    max_tokens: options.maxTokens ?? 420,
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
