/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    Painter?: any;
    Scene3D?: any;
  }
}

let loading: Promise<void> | null = null;

// The plates extend window.Painter in order, so they have to load sequentially.
export function loadPainter(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      await import("./painter.js");
      await import("./worlds.js");
      await import("./worlds5.js");
      await import("./worlds6.js");
      await import("./eye6.js");
      await import("./worlds7.js");
      await import("./scene3d.js");
    })();
  }
  return loading;
}
