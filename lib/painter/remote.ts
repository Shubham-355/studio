/* Main-thread side of paint.worker.js: send a plate, get its pixels back. */

type Reply = { id: number; bitmap?: ImageBitmap; style?: Record<string, string>; error?: string };
type Pending = { resolve: (r: Reply) => void; w: Worker };

// Two workers paint side by side: the first scene's plates are slow one after another (the face alone takes seconds),
// so pairing them up gets the eye on screen sooner. A machine with very few cores keeps one.
const POOL = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 2) <= 2 ? 1 : 2;

let workers: Worker[] | null | undefined;
let seq = 0;
const pending = new Map<number, Pending>();
const busy = new Map<Worker, number>();

function getWorkers(): Worker[] | null {
  if (workers !== undefined) return workers;
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return (workers = null);
  try {
    const list: Worker[] = [];
    for (let i = 0; i < POOL; i++) {
      const w = new Worker(new URL("./paint.worker.js", import.meta.url), { type: "module" });
      w.onmessage = (e: MessageEvent<Reply>) => {
        const p = pending.get(e.data.id);
        if (p) { pending.delete(e.data.id); busy.set(w, (busy.get(w) || 1) - 1); p.resolve(e.data); }
      };
      // If a worker dies, whatever it was painting falls back to the main thread and the rest of the pool carries on.
      w.onerror = () => {
        if (!workers) return;
        workers = workers.filter((x) => x !== w);
        if (!workers.length) workers = null;
        pending.forEach((p, id) => { if (p.w === w) { pending.delete(id); p.resolve({ id, error: "worker failed" }); } });
      };
      busy.set(w, 0);
      list.push(w);
    }
    workers = list;
  } catch {
    workers = null;
  }
  return workers;
}

export function canPaintRemotely() {
  return getWorkers() !== null;
}

/** How many plates can be painted at the same time. */
export function remoteLanes() {
  return getWorkers()?.length ?? 0;
}

/** Paints `fn(canvas, ...args)` in the least busy worker and copies the result into `cv`. Resolves false if it could not. */
export function paintRemote(cv: HTMLCanvasElement, fn: string, args: unknown[], cw: number, ch: number): Promise<boolean> {
  const list = getWorkers();
  if (!list || !list.length) return Promise.resolve(false);
  const w = list.reduce((a, b) => ((busy.get(b) || 0) < (busy.get(a) || 0) ? b : a));
  busy.set(w, (busy.get(w) || 0) + 1);
  const id = ++seq;
  return new Promise<Reply>((resolve) => {
    pending.set(id, { resolve, w });
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
