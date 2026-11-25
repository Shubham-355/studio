/* Main-thread side of paint.worker.js: send a plate, get its pixels back. */

type Reply = { id: number; bitmap?: ImageBitmap; style?: Record<string, string>; error?: string; kept?: Blob };
type Pending = { resolve: (r: Reply) => void; w: Worker; store?: (blob: Blob) => void };

// Two workers paint side by side: the first scene's plates are slow one after another (the face alone takes seconds),
// so pairing them up gets the eye on screen sooner. A machine with very few cores keeps one.
const POOL = typeof navigator !== "undefined" && (navigator.hardwareConcurrency || 2) <= 2 ? 1 : 2;

let workers: Worker[] | null | undefined;
let seq = 0;
const pending = new Map<number, Pending>();
const keeping = new Map<number, (blob: Blob) => void>();
const busy = new Map<Worker, number>();

function getWorkers(): Worker[] | null {
  if (workers !== undefined) return workers;
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return (workers = null);
  try {
    const list: Worker[] = [];
    for (let i = 0; i < POOL; i++) {
      const w = new Worker(new URL("./paint.worker.js", import.meta.url), { type: "module" });
      w.onmessage = (e: MessageEvent<Reply>) => {
        const k = e.data.kept;
        if (k) { const store = keeping.get(e.data.id); keeping.delete(e.data.id); store?.(k); return; }
        const p = pending.get(e.data.id);
        if (p) { pending.delete(e.data.id); busy.set(w, (busy.get(w) || 1) - 1); if (p.store && e.data.bitmap) keeping.set(e.data.id, p.store); p.resolve(e.data); }
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

/* ---------- plates a returning visitor already has ----------
   Every plate is painted from fixed seeds, so the same inputs always give the same picture. The first visit keeps a
   lossless copy of each one in the browser's cache; later visits draw those instead of painting again. Each build has
   its own cache, and older ones are deleted. */
const BUILD = process.env.NEXT_PUBLIC_PLATES || "dev";
const CACHE = "odysseys-plates-" + BUILD;
let shelf: Promise<Cache | null> | null = null;

function openShelf(): Promise<Cache | null> {
  if (shelf) return shelf;
  if (typeof caches === "undefined" || typeof isSecureContext === "undefined" || !isSecureContext) return (shelf = Promise.resolve(null));
  shelf = caches.open(CACHE).then(async (c) => {
    try { for (const k of await caches.keys()) if (k.startsWith("odysseys-plates-") && k !== CACHE) await caches.delete(k); } catch {}
    return c;
  }).catch(() => null);
  return shelf;
}

// A short, stable name for a plate's inputs (FNV-1a over the whole description); the full description is checked on read.
function plateKey(desc: string) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < desc.length; i++) { const c = desc.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519); }
  return `https://plates.invalid/${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
}

function apply(cv: HTMLCanvasElement, bitmap: ImageBitmap, style?: Record<string, string>) {
  cv.width = bitmap.width;
  cv.height = bitmap.height;
  if (style) Object.assign(cv.style, style);
  const ctx = cv.getContext("2d");
  ctx?.drawImage(bitmap, 0, 0);
  bitmap.close();
}

async function fromShelf(desc: string): Promise<{ bitmap: ImageBitmap; style: Record<string, string> } | null> {
  try {
    const c = await openShelf(); if (!c) return null;
    const r = await c.match(plateKey(desc)); if (!r || r.headers.get("x-plate") !== encodeURIComponent(desc)) return null;
    const style = JSON.parse(decodeURIComponent(r.headers.get("x-style") || "%7B%7D"));
    return { bitmap: await createImageBitmap(await r.blob()), style };
  } catch { return null; }
}

function toShelf(desc: string, style: Record<string, string> | undefined, blob: Blob) {
  openShelf().then(async (c) => {
    if (!c) return;
    await c.put(plateKey(desc), new Response(blob, { headers: { "content-type": "image/png", "x-plate": encodeURIComponent(desc), "x-style": encodeURIComponent(JSON.stringify(style || {})) } }));
    // plates are kept per screen size, so a much-resized window would keep adding them: hold about two sizes' worth, oldest out first
    const all = await c.keys(); for (const r of all.slice(0, Math.max(0, all.length - 60))) await c.delete(r);
  }).catch(() => {});
}

/** Paints `fn(canvas, ...args)` (or reuses the copy kept from an earlier visit) and copies the result into `cv`. Resolves false if it could not. */
export async function paintRemote(cv: HTMLCanvasElement, fn: string, args: unknown[], cw: number, ch: number): Promise<boolean> {
  const list = getWorkers();
  if (!list || !list.length) return false;
  const dpr = devicePixelRatio || 1;
  const desc = JSON.stringify([fn, args, Math.round(cw), Math.round(ch), dpr]);
  const kept = await fromShelf(desc);
  if (kept) { apply(cv, kept.bitmap, kept.style); return true; }
  const w = list.reduce((a, b) => ((busy.get(b) || 0) < (busy.get(a) || 0) ? b : a));
  busy.set(w, (busy.get(w) || 0) + 1);
  const id = ++seq, canKeep = !!(await openShelf());
  const meta: { style?: Record<string, string> } = {};
  const r = await new Promise<Reply>((resolve) => {
    pending.set(id, { resolve, w, store: canKeep ? (blob) => toShelf(desc, meta.style, blob) : undefined });
    w.postMessage({ id, fn, args, cw, ch, dpr, keep: canKeep });
  });
  if (!r.bitmap) return false;
  meta.style = r.style;
  apply(cv, r.bitmap, r.style);
  return true;
}
