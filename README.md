# Odysseys

A scroll-driven homepage for a venture studio, painted entirely in the browser. Scrolling moves a camera through eight oil-painted worlds: a torn sky with an eye, an apple on a chessboard, a beach, a board in the sand, a desert arcade of founders, a quiet room and a night sea.

## Running

```bash
bun install
bun dev
```

Open http://localhost:3000.

## How it is put together

- `lib/painter/` — procedural canvas painters (sky, sea, sand, eye, hands, torn paper) and the three.js scenes. They load client-side in order and extend `window.Painter` / `window.Scene3D`.
- `components/home/engine.js` — maps scroll to a timeline `t`, paints each world once into its canvases, then moves cameras, masks and copy every frame.
- `components/home/Stage.tsx` — the world markup the engine drives.
- `components/home/Copy.tsx` — headings, cards, contact and footer that fade in on their stretch of the timeline.
- `components/home/content.ts` — studio name, stages, companies and what the founder keeps.

## Debug parameters

| Param | Effect |
| --- | --- |
| `?at=19.4` | Freeze the timeline at a moment (also paints only nearby worlds) |
| `?t=8` | Start scrolled to a moment |
| `?noloader=1` | Skip the torn-paper intro |
| `?notes=1` | Show motion notes for the current world |
| `?nogl=1` | Disable the three.js scenes |
| `?open=f1` | Open a founder's panel |
