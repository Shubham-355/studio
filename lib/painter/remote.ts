/* Main-thread side of paint.worker.js: send a plate, get its pixels back. */

type Reply = { id: number; bitmap?: ImageBitmap; style?: Record<string, string>; error?: string };
type Pending = { resolve: (r: Reply) => void };

let worker: Worker | null | undefined;
let seq = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return (worker = null);
  try {
    const w = new Worker(new URL("./paint.worker.js", import.meta.url), { type: "module" });
    w.onmessage = (e: MessageEvent<Reply>) => {
      const p = pending.get(e.data.id);
      if (p) { pending.delete(e.data.id); p.resolve(e.data); }
    };
    // If the worker dies, everything still waiting falls back to painting on the main thread.
    w.onerror = () => {
      worker = null;
      pending.forEach((p, id) => p.resolve({ id, error: "worker failed" }));
      pending.clear();
    };
    worker = w;
  } catch {
    worker = null;
  }
  return worker;
}

export function canPaintRemotely() {
  return getWorker() !== null;
}

/** Paints `fn(canvas, ...args)` in the worker and copies the result into `cv`. Resolves false if it could not. */
export function paintRemote(cv: HTMLCanvasElement, fn: string, args: unknown[], cw: number, ch: number): Promise<boolean> {
  const w = getWorker();
  if (!w) return Promise.resolve(false);
  const id = ++seq;
  return new Promise<Reply>((resolve) => {
    pending.set(id, { resolve });
    w.postMessage({ id, fn, args, cw, ch, dpr: devicePixelRatio || 1 });
  }).then((r) => {
    if (!r.bitmap) return false;
    cv.width = r.bitmap.width;
    cv.height = r.bitmap.height;
    Object.assign(cv.style, r.style);
    const ctx = cv.getContext("2d");
    ctx?.drawImage(r.bitmap, 0, 0);
    r.bitmap.close();
    return true;
  });
}
