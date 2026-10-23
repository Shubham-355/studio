/* Paints the heavy plates off the main thread. The painters are plain canvas code; here they draw into
   OffscreenCanvases and the finished bitmap is handed back to the page, so scrolling never waits on them. */
self.window = self;
self.document = { createElement: () => new OffscreenCanvas(2, 2) };

const ready = (async () => {
  await import("./painter.js");
  await import("./worlds.js");
  await import("./worlds5.js");
  await import("./worlds6.js");
  await import("./eye6.js");
  await import("./eye12.js");
  await import("./worlds7.js");
  await import("./worlds8.js");
  await import("./worlds9.js");
  await import("./clouds10.js");
  await import("./paint17.js");
  // worlds5/6/8/9, eye12, clouds10 and paint17 attach themselves after polling for their dependencies.
  for (let i = 0; i < 200 && !(self.Painter && self.Painter.cloud10 && self.Painter.eye12 && self.Painter.paint16 && self.Painter.room17); i++) await new Promise((r) => setTimeout(r, 10));
})();

// A stand-in for the <canvas> element: the painters read its laid-out size and may set its CSS size.
function surface(cw, ch) {
  const oc = new OffscreenCanvas(Math.max(2, Math.round(cw)), Math.max(2, Math.round(ch)));
  const style = {};
  const cv = {
    oc, style, dataset: {}, offsetWidth: cw, offsetHeight: ch,
    get width() { return oc.width; }, set width(v) { oc.width = v; },
    get height() { return oc.height; }, set height(v) { oc.height = v; },
    getContext: (t, o) => oc.getContext(t, o),
    getBoundingClientRect: () => ({ width: cw, height: ch, left: 0, top: 0, right: cw, bottom: ch }),
  };
  return cv;
}

// Arguments that are not plain data are rebuilt here from what they were made of.
function resolve(a, env) {
  if (a && typeof a === "object") {
    if (a.$beach) return self.Painter.beach6cfg(a.$beach[0], a.$beach[1], a.$beach[2]);
    if (a.$eye) return self.Painter.eyeGeom(a.$eye[0], a.$eye[1]);
  }
  return a;
}

self.onmessage = async (e) => {
  const { id, fn, args, cw, ch, dpr } = e.data;
  try {
    await ready;
    self.devicePixelRatio = dpr;
    const cv = surface(cw, ch);
    self.Painter[fn](cv, ...args.map((a) => resolve(a)));
    const bitmap = cv.oc.transferToImageBitmap();
    self.postMessage({ id, bitmap, style: cv.style }, [bitmap]);
  } catch (err) {
    self.postMessage({ id, error: String((err && err.message) || err) });
  }
};
