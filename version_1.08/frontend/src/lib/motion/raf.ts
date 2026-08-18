/**
 * One requestAnimationFrame loop for the whole site.
 *
 * The particle field, the cursor and the skill sphere all need per-frame work.
 * Three independent loops is how a page like this ends up at 30fps, so they all
 * subscribe here instead. The loop stops itself when nothing is subscribed and
 * whenever the tab is hidden.
 */

export type FrameCallback = (time: number, delta: number) => void;

const subscribers = new Set<FrameCallback>();
let handle = 0;
let last = 0;
let running = false;

function tick(time: number): void {
  handle = requestAnimationFrame(tick);
  // Clamp: after a tab switch or a long task the gap can be seconds, and every
  // subscriber integrates by delta.
  const delta = Math.min(time - last, 64);
  last = time;
  for (const callback of subscribers) callback(time, delta);
}

function start(): void {
  if (running || subscribers.size === 0 || document.hidden) return;
  running = true;
  last = performance.now();
  handle = requestAnimationFrame(tick);
}

function stop(): void {
  if (!running) return;
  running = false;
  cancelAnimationFrame(handle);
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
}

/** Subscribes to the shared loop. Returns an unsubscribe function. */
export function onFrame(callback: FrameCallback): () => void {
  subscribers.add(callback);
  start();
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) stop();
  };
}

/* ------------------------------------------------------------------ *
 * Read / write batching
 *
 * Layout reads (getBoundingClientRect, offsetWidth) invalidate on every
 * preceding style write. Queue them separately so a frame does all reads,
 * then all writes, instead of interleaving and forcing a reflow per element.
 * ------------------------------------------------------------------ */

const reads: (() => void)[] = [];
const writes: (() => void)[] = [];
let flushScheduled = false;

function flush(): void {
  flushScheduled = false;
  const pendingReads = reads.splice(0);
  const pendingWrites = writes.splice(0);
  for (const read of pendingReads) read();
  for (const write of pendingWrites) write();
}

function schedule(): void {
  if (flushScheduled) return;
  flushScheduled = true;
  requestAnimationFrame(flush);
}

/** Queues a layout read for the next frame's read phase. */
export function measure(callback: () => void): void {
  reads.push(callback);
  schedule();
}

/** Queues a style write for the next frame's write phase. */
export function mutate(callback: () => void): void {
  writes.push(callback);
  schedule();
}
