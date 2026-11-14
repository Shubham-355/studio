/* eslint-disable @typescript-eslint/no-unused-expressions -- short-circuit calls are the house style here */
/* Scroll-driven painted homepage. The scroll position maps to a timeline t (0 -> TEND);
   each world paints itself onto canvases once, then every frame only moves cameras. */
import { loadPainter } from "@/lib/painter";
import { canPaintRemotely, paintRemote } from "@/lib/painter/remote";
import { COMPANIES, KEEP } from "./content";

const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lin = (a, b, x) => cl((x - a) / (b - a)), sm = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); }, mx = (a, b, t) => a + (b - a) * t;
const EASE = 'cubic-bezier(.2,.7,.2,1)';
export const TEND = 28.6;
export const SPACER_VH = 2120;
const RANGE = [[0, 1.62], [-1, 12.87], [2.6, 14.06], [-2, -1], [2.6, 18.21], [16.6, 22.91], [21.4, 25.11], [22.9, 99]];
const NAVT = [0, 1.0, 4.1, 13.0, 13.0, 17.5, 22.5, 24.6];
const JUMP = { home: 0, how: 14.2, companies: 18.6, contact: 26.9 };
const PA = 3.2, PB = 4.7, TB1 = 12.4, TBE = 14.05;
/* apple -> board, one camera over 1.5 screens: tilt to the floor (0-.2), dive into one cream tile (.2-.45); the tile becomes e2 (.45-.6: both cameras keep a slow push while the apple layer gives way to the board's own square, colour and texture only); pull straight up to the overhead board (.6-1) */
const DU1 = .2, UF = .45, UP = .6, TH = PA + UF * (PB - PA), SB = (PB - PA) * (1 - UF), TF = TB1 + (UP - UF) / (1 - UF) * (TBE - TB1), DTILE = [-2, 2];
const V1 = s => s <= TH ? s : s <= PB ? TB1 + (s - TH) / SB * (TBE - TB1) : s + TBE - PB, VI1 = t => t <= TH ? t : t < TB1 ? TH : t <= TBE ? TH + (t - TB1) / (TBE - TB1) * SB : t - (TBE - PB);
const QA = 16.6, QB = 18.2, QL = 1.2, QK = (QB - QA) / QL, QD = QB - QA - QL;
// The sky tilt (0.08 to 1.58) gets 1.2 screens of scroll instead of 1.5.
const V0 = s => s <= .08 ? s : s <= 1.28 ? .08 + (s - .08) * 1.25 : s + .3, VI0 = t => t <= .08 ? t : t <= 1.58 ? .08 + (t - .08) / 1.25 : t - .3;
const V = s => { const u = V1(V0(s)); return u <= QA ? u : u <= QA + QL ? QA + (u - QA) * QK : u + QD; }, VI = t => VI0(VI1(t <= QA ? t : t <= QB ? QA + (t - QA) / QK : t - QD));
const QS = .95, QY = .04, QZ = -3.5, QX = .5, YC = 1.335, QR = y => y <= 1.24 ? .22 : y >= 1.52 ? .34 : y < 1.36 ? mx(.22, .28, (y - 1.24) / .12) : mx(.28, .34, (y - 1.36) / .16);
export const NAMES = ['The sky with an eye', 'The apple on the board', 'The beach', 'The underwater hall', 'The board in the sand', 'The desert arcade', 'The quiet room', 'The night sea'];
const INK = [0, 1, 1, 0, 1, 1, 1, 0], SOFT = [0, 0, 1, 0, 1, 0, 0, 0];
// door in the back wall: half width, height and threshold top; the leaf hinges at DZL, the doorway's far face is DZF; it swings to DSW
const CZ = [6, 11, 16, 21], DOORZ = 27, DHW = .47, DHH = 1.92, DTS = .07, DZL = DOORZ + .27, DZF = DOORZ + .25, DSW = 170 * Math.PI / 180, DSTOP = [DHW + 2 * DHW * Math.cos(10 * Math.PI / 180) + .05, 0, DZF + .03];
const ACT = ['keydown', 'touchstart', 'wheel', 'focusin'];
const AK = 1 / .14, ZE = -2 - 1 / QS;
const CPTS = [[18.2, -2], [19.35, 3.4], [20.05, 8.4], [20.75, 13.4], [21.45, 18.4], [22.9, 26.8]];
const BEATS = [.05, 2.0, 2.95].concat([14.3, 14.74, 15.24, 15.73, 16.23, 16.6, 17.65, 18.6, 19.35, 20.05, 20.75, 21.45, 22.1, 23.6, 25.7, 27.1, 28.4]);
export const NOTES = [
  'Time 0–1.58 (1.2 screens of scroll). The eye looks down first, then one camera pitch from the sky to the horizon: the peach horizon glow rises at the bottom while the tear is still leaving the top. Three cloud layers: far 0.92×, mid 1×, near 1.45×. Horizon at 45% when settled.',
  'Apple on the checkerboard, one-point perspective, low sun on the left: cast shadows, contact shadows and the glossy reflection are computed on the real floor. The apple stays whole. 3.2–4.7 (1.5 screens), one camera: tilt to the floor 0–20%, dive straight down into the cream tile at (−2, 2) 20–45%, then the tile becomes e2 45–60% (slow push, the apple layer gives way to the board square underneath), pull straight up to the overhead board 60–100%.',
  'Overhead 8×8 board in the sand: reached by the pull-up from e2 (board time 12.4–14.05). The pawn grows out of e2 from the first board frame. Beach ground = ground19: one shader for sea depth, ripples, caustics, two overlapping 7.2 s swash waves with lacy foam, fresh wet marks (~2 s), breaking lines and wet/dry sand. Gulls: one canvas, 2–3 birds, edge to edge on paths that avoid the copy and the pawn file.',
  '',
  'Board reached from the beach rise (ends 14.05, pawn emerges 13.1–13.9); pawn crosses 14.25–16.55, wave makes the queen. Into the queen 16.6–18.2 (1.2 screens of scroll): settle over the crown, push into the front arch (board blurs by depth), sunset light stains the porcelain stroke by stroke, the arch widens into the arcade and the board squares become its floor.',
  'One camera: the arcade is a 3D hall rendered from the queen camera mapped through the crown arch (no copy), so the camera walks on into it from 18.2. Founders at z 6/11/16/21: thoughts resolve as the camera nears (dz 4.9→3.2) and scatter again on the way back. Hover: object turns, panel slides out.',
  'Door in the back wall from the first frame (perspective-mapped wood leaf, hinge screen-left); it swings inward to 170° with scroll 21.5–22.3, flat against the inside wall on a brass stop before the camera reaches the doorway while the camera walks straight through it (21.45–22.9). Dolly 22.9–24.1. Window 24.1–25.1: camera turns into the lower-left pane, world 8 visible through the glass throughout.',
  'Quote 25.25–26.25. Tear rips open from a crack in three stages 26.2–26.66; the letter slides out of its lower-left edge on its own (pushed from behind) 26.66–26.9, back in 27.3–27.54; tear closes along its edges 27.55–28.05 as the camera lowers to the water; footer from 27.75.',
];

export class HomeEngine {
  /** host: { props: { motion, notes }, getState(), setState(patch, cb?), forceUpdate() } */
  constructor(host) {
    this.host = host;
    this.st = { apple8: { ext: true }, sandboard: { ext: true }, roomqueen: { ext: true }, arcade8: { ext: true } };
    this.fHover = [];
    this.companies = COMPANIES;
    this.decks = {}; // cloud card layouts per scene (sk: tilt sky, b3: beach, n8: night sea)
  }
  get state() { return this.host.getState(); }
  get props() { return this.host.props; }
  setState(p, cb) { this.host.setState(p, cb); }

  $(s, r) { return (r || document).querySelector(s); }
  $$(s, r) { return Array.from((r || document).querySelectorAll(s)); }
  q(k) { try { return new URLSearchParams(location.search).get(k); } catch { return null; } }
  red() { return this.props.motion === false || matchMedia('(prefers-reduced-motion: reduce)').matches; }
  S(el, p, v) { if (el && el['_' + p] !== v) { el['_' + p] = v; el.style[p] = v; } }

  start() {
    if (this.q('noloader') || this.q('t') || this.q('at')) this.setState({ loader: false });
    const nq = this.q('notes'); if (nq != null) this.setState({ notes: nq === '1' });
    this._onResize = () => { const n = innerWidth < 820; if (n !== this.state.narrow) { this.setState({ narrow: n }); return; } this.host.forceUpdate(); clearTimeout(this._rt); this._rt = setTimeout(() => this.relayout(true), 250); };
    addEventListener('resize', this._onResize);
    // The loop idles once nothing moves; any input or a tab coming back wakes it.
    this._onVis = () => { if (document.visibilityState !== 'hidden' && this._alive && this._loopF) { this._lastF = 0; this._lastR = 0; this._loopF(); } };
    this._onAct = () => { this._act = performance.now(); };
    document.addEventListener('visibilitychange', this._onVis); ACT.forEach(e => addEventListener(e, this._onAct, { passive: true }));
    this._alive = true; this.t = 0; this.mv = {}; this.pos = {};
    loadPainter().then(() => this.waitLibs()).then(() => { if (this._alive) this.boot(); }).catch(e => console.error(e));
  }
  narrowChanged() { if (!this.W) return; requestAnimationFrame(() => { this.disposeAll(); this.relayout(true); }); }
  destroy() {
    this._alive = false; removeEventListener('resize', this._onResize);
    document.removeEventListener('visibilitychange', this._onVis); ACT.forEach(e => removeEventListener(e, this._onAct));
    this.disposeAll(); this._cursorCleanup && this._cursorCleanup(); clearTimeout(this._blinkT); clearTimeout(this._lidT); clearTimeout(this._lt); this._snd && this._snd.dispose(); cancelAnimationFrame(this._wr);
  }
  async waitLibs() { for (let i = 0; i < 400 && !(window.Painter && window.Painter.beach6cfg && window.Painter.apple8Sky && window.Painter.cloud10 && window.Painter.eye12 && window.Painter.blink14 && window.Painter.paint16 && window.Painter.room17 && window.Scene3D); i++) await new Promise(r => setTimeout(r, 30)); }
  pal() { return window.Painter.cloudPal10 || { day: {}, warm: {}, night: {} }; }
  /* cloud depth: self-drift (a few px/s per layer) and parallax factor; both off with reduced motion */
  drift(i) { return this._rm ? 0 : 36 * Math.sin((this.now || 0) * [2, 3.5, 5][i] / 36 + i * 1.7); }
  pf(f) { return this._rm ? 1 : f; }
  // The torn sky's shadow on the face, painted once: a warm vignette inside the hole, a soft cast shadow and the paper's cut edge.
  tearShadow(inn, out) {
    const cv = this.q1 && this.q1.tsh, P = window.Painter; if (!cv) return; const W = this.W, H = this.H, d = Math.min(1.5, devicePixelRatio || 1), n = this.n;
    cv.width = Math.round(W * d); cv.height = Math.round((H + 60) * d); const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H + 60);
    const outside = (dx, dy) => [inn, out].forEach(pts => c.fill(new Path2D(`M${-300 + dx} ${-300 + dy}H${W + 300 + dx}V${H + 360 + dy}H${-300 + dx}Z ` + P.toPath(pts.map(([x, y]) => [x + dx, y + dy]))), 'evenodd'));
    const G1 = this.g1; if (G1) { c.save(); c.translate(G1.cx, G1.cy); c.scale(G1.rx * 1.12, G1.ry * 1.12); const vg = c.createRadialGradient(0, .08, 0, 0, .08, 1); vg.addColorStop(0, 'rgba(40,18,10,0)'); vg.addColorStop(.55, 'rgba(40,18,10,.04)'); vg.addColorStop(.85, 'rgba(40,18,10,.2)'); vg.addColorStop(1, 'rgba(40,18,10,.36)'); c.fillStyle = vg; c.fillRect(-2, -2, 4, 4); c.restore();
      const bg = c.createLinearGradient(0, G1.cy - G1.ry * 1.15, 0, G1.cy - G1.ry * .35); bg.addColorStop(0, 'rgba(46,22,12,.3)'); bg.addColorStop(1, 'rgba(46,22,12,0)'); c.fillStyle = bg; c.fillRect(0, G1.cy - G1.ry * 1.25, W, G1.ry * .9); }
    const B = 20000; c.fillStyle = '#000';
    [[0, 3, .55], [0, 9, .42], [1.5, 12, .3], [6, 22, .14]].forEach(([oy, b, a]) => { c.save(); c.shadowColor = `rgba(38,20,12,${a})`; c.shadowBlur = b * d; c.shadowOffsetX = B * d; c.shadowOffsetY = oy * d; outside(-B, 0); c.restore(); });
    const th = n ? 2 : 3; c.fillStyle = 'rgba(92,70,48,.4)'; outside(0, th + 1); c.fillStyle = '#CDBFA5'; outside(0, th);
  }

  boot() {
    if (!window.Painter || !window.Painter.desert) return;
    if (!document.getElementById('brushy')) document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="brushy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="ripple" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="8" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="14" xChannelSelector="R" yChannelSelector="G"/></filter></svg>');
    // Read the serif family once now, while styles are clean; reading it mid-animation forces a full style recalc.
    window.Painter._serif = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'Instrument Serif';
    this.grain(); this.relayout(false); this.queuePaint();
    const qt = parseFloat(this.q('t')); if (!isNaN(qt) && qt >= 0 && qt <= TEND + 1) { scrollTo(0, VI(qt) * innerHeight); this.t = qt; this._introT0 = performance.now() - 5000; }
    if (this.state.loader) this.runLoader(); else if (!this._introT0) this._introT0 = performance.now() + 100;
    this.initCursor(); this.blink(); this.snd(); this.wave();
    // sound stays on across reloads: the first tap or key press (outside the sound button) brings it back, as browsers require a gesture
    try { if (sessionStorage.getItem('hpSound') === '1') { const ev = ['pointerdown', 'keydown'], g = e => { if (e.target && e.target.closest && e.target.closest('[aria-label="Ambient sound"],[aria-label="Sound"]')) return; ev.forEach(k => removeEventListener(k, g, true)); if (!this.state.sound) this.toggleSound(); }; ev.forEach(k => addEventListener(k, g, true)); } } catch { /* storage blocked */ }
    this._loopF = () => this.loop(); this._loopF();
    const o = this.q('open'); if (o) setTimeout(() => this.forceOpen(o), 1800);
  }
  grain() {
    const g = this.$('[data-grain]'); if (!g || g._g) return; g._g = 1;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.12  0 0 0 .5 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>';
    g.style.backgroundImage = getComputedStyle(g).backgroundImage + ', url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* ---------- layout ---------- */
  relayout(repaint) {
    this.W = innerWidth; this.H = innerHeight; this.n = this.state.narrow;
    this._stgY = null; this.wEl = [1, 2, 3, 4, 5, 6, 7, 8].map(k => this.$(`[data-world="${k}"]`)); this.wEl.forEach(e => { if (e) { e._on = undefined; } });
    this.layout1(); this.layout2(); this.layout3(); this.layout4(); this.layout6(); this.layout7(); this.layout8();
    this.blocks = this.$$('[data-copy]').map(el => ({ el, m: el.dataset.copy === 'm', id: el.dataset.id, a: +el.dataset.a, b: +el.dataset.b, hero: el.hasAttribute('data-hero'), w: this.$$('[data-w]', el), v: -1 }));
    this.dvEls = this.$$('[data-dove]'); this.fEls = this.$$('[data-founder]');
    this.fst = this.fEls.map(el => ({ ph: 0, hv: 0, orb: 0, th: this.$$('[data-th]', el), res: this.$('[data-res]', el), turn: this.$('[data-turn]', el), head: this.$('[data-head]', el), body: this.$('[data-body]', el), orbs: this.$$('[data-orb]', el), panel: this.$('[data-panel]', el) }));
    this.$$('[data-kscale]').forEach(el => el.style.zoom = this.n ? '1.1' : String(Math.min(1.45, this.H / 620)));
    this._ballT = null; this._nogl = !!this.q('nogl');
    this.m3d = { apple8: this.$('[data-3d="apple8"]'), sandboard: this.$('[data-3d="sandboard"]'), roomqueen: this.$('[data-3d="roomqueen"]'), arcade8: this.$('[data-3d="arcade8"]') };
    this.ch = { nav: this.$('[data-nav]'), prog: this.$('[data-mprog]'), cta: this.$('[data-navcta]'), links: this.$('[data-navlinks]') }; this._navW = null;
    if (repaint) this.queuePaint();
  }
  layout1() {
    const P = window.Painter, W = this.W, H = this.H, n = this.n;
    let rx = (n ? W * .36 : Math.min(W * .2, 300)) * 1.12, ry = rx * (n ? .8 : .64);
    this.tear = (this.tear && this.tear.fib) ? this.tear : P.ragged6(17); this._s1 = null;
    const TK = 1.2, top0 = n ? 76 : 100, hs = this.$('[data-hero]'), hb = hs && hs.getBoundingClientRect(), bot0 = (hb && hb.height ? hb.top : H * .8) - (n ? 28 : 44);
    if (2 * ry * TK > bot0 - top0) { const k = Math.max(.5, (bot0 - top0) / (2 * ry * TK)); rx *= k; ry *= k; }
    const cx = W / 2, cy = Math.max(top0 + ry * TK, Math.min(H * .45, bot0 - ry * TK));
    const fw = Math.round(rx * 2.7), fh = Math.round(ry * 2.7), E = P.eyeGeom(fw, fh), M = 3.6;
    const PW = Math.round(fw * M), PH = Math.round(fh * M), ox = (PW - fw) / 2, oy = (PH - fh) / 2, pr = E.eh * .8 * .416;
    const P0 = { x: cx - fw / 2 + E.cx, y: cy - fh / 2 + E.cy };
    this.g1 = { cx, cy, rx, ry, fw, fh, E, PW, PH, ox, oy, pr, P0, ir: E.eh * .8, lidUp: E.eh * 2.55, ex: E.ew * .13, ey: E.eh * .28, fsEnd: 1.2 * Math.hypot(W, H) / pr };
    const face = this.$('[data-face]'); if (!face) return;
    Object.assign(face.style, { width: PW + 'px', height: PH + 'px', left: (cx - fw / 2 - ox) + 'px', top: (cy - fh / 2 - oy) + 'px', transformOrigin: `${ox + E.cx}px ${oy + E.cy}px` });
    const sz = (el, x, y) => el && Object.assign(el.style, { left: x + 'px', top: y + 'px', width: fw + 'px', height: fh + 'px' });
    sz(this.$('[data-eyeball]'), ox, oy); sz(this.$('[data-eyeball] canvas'), 0, 0); sz(this.$('[data-facecv]'), ox, oy); sz(this.$('[data-lidwin]'), ox, oy); sz(this.$('[data-lid]'), 0, 0); sz(this.$('[data-shadewin]'), ox, oy);
    const IS = E.eh * .8 * 2.3; Object.assign(this.$('[data-iris]').style, { left: (E.cx - IS / 2) + 'px', top: (E.cy - IS / 2) + 'px', width: IS + 'px', height: IS + 'px' });
    const rc = this.$('[data-rimcv]'); if (rc) { const d = Math.min(2, devicePixelRatio || 1); rc.width = Math.round(W * d); rc.height = Math.round(H * d); this.rimCtx = rc.getContext('2d'); this.dpr1 = d; }
    Object.assign(this.$('[data-pupil]').style, { left: (E.cx - pr) + 'px', top: (E.cy - pr) + 'px', width: pr * 2 + 'px', height: pr * 2 + 'px' });
    const m = `radial-gradient(ellipse 50% 50% at 50% 50%, #000 80%, transparent 98%)`; const fc = this.$('[data-facecv]'); fc.style.webkitMaskImage = fc.style.maskImage = m;
    this.$('[data-shadewin]').style.clipPath = `path("${E.path}")`; this.$('[data-lidwin]').style.clipPath = 'none';
    // the upper lid is drawn live: its skin texture is painted once, a moment after layout, so it never delays the first frame
    { const lc = this.$('[data-lid]'), d = Math.min(2, devicePixelRatio || 1); lc.width = Math.round(fw * d); lc.height = Math.round(fh * d); Object.assign(lc.style, { width: fw + 'px', height: fh + 'px', transform: 'none' }); this.lidCtx = lc.getContext('2d'); this.lidCtx.setTransform(d, 0, 0, d, 0, 0);
      this.lid14 = { tex: null, lashes: [], w: fw, h: fh }; this._lc = -1; clearTimeout(this._lidT); this._lidT = setTimeout(() => { const L = this.lid14; if (L && P.lidTex14) { L.tex = P.lidTex14(fw, fh); this._lc = -1; } }, 700); }
    const cap = this.$('[data-herocap]');
    if (cap) cap.style.display = (!n && cx + rx + 44 + 230 > W - 16) ? 'none' : ''; if (cap) Object.assign(cap.style, n ? { left: (cx - rx) + 'px', top: Math.max(76, cy - ry - 64) + 'px', maxWidth: rx * 2 + 'px' } : { left: (cx + rx + 44) + 'px', top: (cy - ry * .3) + 'px', maxWidth: '220px' });
    this.q1 = { face, eye: this.$('[data-eyeball]'), wrap: this.$('[data-skywrap]'), plate: this.$('[data-skyplate]'), rim: this.$('[data-rim]'), near: this.$('[data-near]'), lid: this.$('[data-lid]'), pupil: this.$('[data-pupil]'), glint: this.$('[data-glint]'), scrim: this.$('[data-navscrim]'), cl: this.$('[data-skycl]'), tsh: this.$('[data-tearsh]') };
  }
  layout2() {
    const W = this.W, H = this.H, n = this.n, w2 = this.wEl[1]; if (!w2) return;
    const fov = n ? 42 : 30, F = H / 2 / Math.tan(fov * Math.PI / 360), L = H * 1.35, tan1 = -.1 * H / F, tan0 = (.45 * H + L - H / 2) / F, Yh = L - .55 * H, Hp = Yh + .34 * H;
    /* standing eye height, a touch down and across the floor; apple on the right third, sun low on the horizon between the headline and the apple */
    const C = n ? [0, 1.6, 9.6] : [-.78, 1.92, 11.15], shift = 0, yaw = n ? 0 : .12, aX = W / 2 + F * Math.tan(Math.atan2(-C[0], C[2]) + yaw), aHalf = F * 1.45 / Math.hypot(C[0], C[2]), hlR = Math.min(64, W * .0444) + Math.min(W * .36, 560);
    const sunX = n ? W * .28 : Math.max(hlR + 24, (hlR + aX - aHalf) / 2), sa = Math.atan((sunX - W / 2) / F) - yaw, sel = .175, ld = [Math.sin(sa) * Math.cos(sel), Math.sin(sel), -Math.cos(sa) * Math.cos(sel)];
    const peb = n ? [{ x: -.55, z: 6.1, r: .1 }, { x: .12, z: 6.5, r: .07 }, { kind: 'scallop', flip: 1, x: .5, z: 5.6, r: .19, rot: .5 }, { kind: 'spiral', x: -.2, z: 5.2, r: .2, rot: 1.1 }] : [{ x: -2.5, z: 4.4, r: .15 }, { x: -1.75, z: 3.3, r: .09 }, { kind: 'spiral', x: -.9, z: 4.9, r: .26, rot: .9 }, { kind: 'scallop', flip: 1, x: .55, z: 4.6, r: .24, rot: .5 }];
    this.g2 = { W, H, n, fov, F, L, tan0, tan1, Yh, Hp, sunX, C, shift, yaw, ld, peb, gulls: n ? [[.15, .2], [.75, .16], [.86, .22]] : [[.9, .2], [.95, .14], [.46, .13]] };
    const plate = this.$('[data-plate]', w2), sea = this.$('[data-a8sea]', w2);
    if (plate) Object.assign(plate.style, { width: W + 'px', height: Hp + 'px' });
    if (sea) { const sh = H * .2; Object.assign(sea.style, { width: W + 'px', height: sh + 'px' }); sea.width = Math.round(W * .6); sea.height = Math.round(sh * .6); }
    // One cloud deck spans the whole tilt, from around the torn sky down to the horizon: a warm horizon band (f .4),
    // the main layer (f 1) and a near layer above the apple (f 1.4). Positions are CSS px; sizes scale with the viewport.
    {
      const g1 = this.g1 || { cx: W / 2, cy: H * .45, rx: W * .2, ry: W * .13 }, U = Math.max(.45, Math.min(W, 1.6 * H) / 1440), PAL = this.pal(), { cx, cy, rx, ry } = g1;
      const lay = (y0, f, k, seed, col, h, items) => ({ w: W * 1.2, h, k, x0: -.1 * W, y0, f, seed, col, list: items.map(([X, Y, S, kd, tl, fl]) => [X + .1 * W, Y - y0, S * U, kd, tl || 0, fl || 1]) });
      this.decks.sk = [
        lay(0, .4, .55, 7, PAL.warm, H * 1.1, [[W * .03, H * .87, 30, 'flat'], [W * .15, H * .955, 50, 'flat', -.02], [W * .215, H * .9, 20, 'wisp'], [W * .5, H * .96, 60, 'flat', .02, -1], [W * .575, H * .91, 22, 'heap'], [W * .81, H * .945, 40, 'flat', .01], [W * .965, H * .885, 28, 'wisp', 0, -1]]),
        lay(-.1 * H, 1, .5, 19, PAL.day, H * 1.9, [[cx + rx * .8, cy + ry * .62, 175, 'mass', -.03], [cx - rx * 1.3, cy - ry * .4, 150, 'mass', .04, -1], [W * .86, H * .27, 26, 'wisp', .02], [W * .61, H * .14, 15, 'heap', 0, -1], [W * .08, H * .66, 20, 'flat', -.04], [W * .95, H * .6, 34, 'tall', 0, -1],
          [W * .18, H * 1.12, 120, 'tall', .03], [W * .3, H * 1.2, 48, 'heap', -.05, -1], [W * .06, H * 1.26, 24, 'wisp'], [W * .77, H * 1.02, 80, 'heap', .02, -1], [W * .9, H * 1.1, 36, 'flat', -.03], [W * .52, H * 1.36, 18, 'wisp', 0, -1],
          [W * .1, H * 1.56, 44, 'flat', .02], [W * .37, H * 1.66, 26, 'flat', -.02, -1], [W * .63, H * 1.52, 58, 'flat', .01], [W * .71, H * 1.6, 16, 'wisp'], [W * .93, H * 1.68, 22, 'flat', -.03, -1]]),
        lay(0, 1.4, .4, 29, Object.assign({ blur: 3 }, PAL.day), H * 1.9, [[-W * .03, H * 1.0, 80, 'heap'], [W * 1.02, H * 1.04, 70, 'tall', 0, -1], [W * .12, H * 1.42, 110, 'heap', .03], [W * .9, H * 1.66, 120, 'mass', -.02, -1]]),
      ];
      this.$$('[data-skyl]').forEach((cv, i) => { const L = this.decks.sk[i]; if (L) Object.assign(cv.style, { left: L.x0 + 'px', top: L.y0 + 'px', width: L.w + 'px', height: L.h + 'px' }); });
      const nr = this.$('[data-near]'), Ln = this.decks.sk[2]; if (nr) Object.assign(nr.style, { left: Ln.x0 + 'px', top: '0px', width: Ln.w + 'px', height: Ln.h + 'px' });
    }
    this.q2 = { world: w2, plate, sea, sx: sea && sea.getContext('2d'), gulls: this.$$('[data-gull2]', w2), alay: this.$('[data-applelayer]'), skycl: this.$('[data-skycl]'), skl: this.$$('[data-skyl]') };
    Object.assign(this.st.apple8, { cam: null, peb });
  }
  diveH() { const G = this.g2; return .47 / (Math.tan(G.fov * Math.PI / 360) * Math.max(1, this.W / this.H)); }
  dive(u) {
    const G = this.g2, y0 = G.yaw, n = this.n, E = x => .5 * x + .5 * x * x * (3 - 2 * x), T = DTILE, hE = this.diveH();
    const p0 = Math.atan(G.tan1), p1 = (n ? -80 : -78) * Math.PI / 180, d1 = n ? 2.8 : 3.0;
    const fw = (p, y) => [-Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)], at = (p, d, y) => { const f = fw(p, y); return [T[0] - d * f[0], -d * f[1], T[1] - d * f[2]]; };
    let P, pitch, yaw = y0;
    if (u <= DU1) { const e = E(u / DU1), P1 = at(p1, d1, y0); P = G.C.map((v, i) => mx(v, P1[i], e)); pitch = mx(p0, p1, e); }
    else { const e = E(Math.min(1, (u - DU1) / (UF - DU1))); pitch = mx(p1, -Math.PI / 2, e); yaw = mx(y0, 0, e); P = at(pitch, Math.exp(mx(Math.log(d1), Math.log(hE), e)) * this.push(u), yaw); }
    return { P, pitch, yaw };
  }
  tiltAt(t) { const G = this.g2; if (!G) return null; const e = sm(.08, 1.58, t); let tn = mx(G.tan0, G.tan1, e); if (t > PA) tn = Math.max(-60, Math.tan(this.dive(this.au(t)).pitch)); return { e, tn, top: this.H / 2 + G.F * tn - G.Yh, topE: this.H - G.L }; }
  layout3() {
    const W = this.W, H = this.H, n = this.n, w3 = this.wEl[2], P = window.Painter; if (!w3) return;
    const S = this.S6 = P.beach6cfg(W, H, n), px = (el, w, h) => el && Object.assign(el.style, { width: w + 'px', height: h + 'px' });
    /* board slides right so the headline column sits over open sand/sea */
    this.bdx = 0; if (!n && S.board) { const xs = S.board.map(([X, Z]) => P.cam6.proj(S.camO, X, 0, Z)[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), gx = this.gutter(), need = gx + Math.max(Math.min(W * .38, 600), 320) + 40; this.bdx = Math.max(0, Math.min(need - x0, W - gx - x1)); }
    const bc = this.$('[data-ball6]');
    { /* CSS filter on the beach layers (sepia .28, saturate 1.06, hue-rotate -9deg, brightness 1.02) as one matrix, so the tile's sand matches the beach pixel for pixel */
      const mul = (A, B) => A.map((_, i) => { const r = Math.floor(i / 3), c = i % 3; return A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; }), b = .72, s = 1.06, hc = Math.cos(-9 * Math.PI / 180), hs = Math.sin(-9 * Math.PI / 180), br = 1.02;
      const sep = [.393 + .607 * b, .769 - .769 * b, .189 - .189 * b, .349 - .349 * b, .686 + .314 * b, .168 - .168 * b, .272 - .272 * b, .534 - .534 * b, .131 + .869 * b];
      const sat = [.213 + .787 * s, .715 - .715 * s, .072 - .072 * s, .213 - .213 * s, .715 + .285 * s, .072 - .072 * s, .213 - .213 * s, .715 - .715 * s, .072 + .928 * s];
      const hue = [.213 + hc * .787 - hs * .213, .715 - hc * .715 - hs * .715, .072 - hc * .072 + hs * .928, .213 - hc * .213 + hs * .143, .715 + hc * .285 + hs * .140, .072 - hc * .072 - hs * .283, .213 - hc * .213 - hs * .787, .715 - hc * .715 + hs * .715, .072 + hc * .928 + hs * .072];
      this.fm3 = mul([br, 0, 0, 0, br, 0, 0, 0, br], mul(hue, mul(sat, sep))); }
    [[bc, .9]].forEach(([c, k]) => { if (c) { c.width = Math.round(W * k); c.height = Math.round(H * k); c._k = k; } });
    const pr = P.cam6.proj, pts = S.board.map(([X, Z]) => pr(S.camO, X, 0, Z)).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    this.w5mask = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><filter id="f"><feGaussianBlur stdDeviation="2.5"/></filter><polygon points="' + pts + '" fill="#fff" filter="url(#f)"/></svg>') + '")';
    this.w5c = pr(S.camO, S.Xb, 0, S.Zb); this.ballTex = this.ballTex || P.ballTex();
    // beach clouds: a warm band on the horizon and a near layer, carried with the beach sky (layer 1 is not used here)
    const PAL = this.pal(), hz = S.hy + .04 * H;
    this.decks.b3 = [
      { w: W * 1.08, h: H * .16, k: .6, x0: 0, y0: hz - H * .16, f: .4, seed: 31, col: PAL.warm, list: n ? [[.12, .7, .02], [.5, .6, .016], [.86, .72, .02]] : [[.06, .72, .011], [.22, .6, .008], [.4, .74, .012], [.6, .62, .009], [.78, .74, .011], [.94, .6, .008]] }, null,
      { w: W * 1.08, h: H * .5, k: .45, x0: 0, y0: -H * .04, f: 1.4, seed: 37, col: Object.assign({ blur: 3 }, PAL.day), list: n ? [[.04, .32, .1], [.97, .26, .085]] : [[.02, .34, .06], [.98, .24, .05]] },
    ];
    this.$$('[data-b3c]', w3).forEach(cv => { const L = this.decks.b3[+cv.dataset.l]; if (L) px(cv, L.w, L.h); });
    this.q3 = { world: w3, cam: this.$('[data-cam]', w3), ball: bc, bx: bc && bc.getContext('2d'), b3c: this.$$('[data-b3c]', w3) };
  }
  /* progress through the apple -> board move (0-1) from either side of the handover */
  au(t) { return t <= TH ? lin(PA, PB, t) : t < TB1 ? UF : UF + lin(TB1, TBE, t) * (1 - UF); }
  /* the slow push while the tile fills the screen, shared by both cameras: constant speed, so the camera never stops before the pull-up */
  push(u) { return Math.exp(-.13 * lin(UF, UP, u)); }
  /* board camera: straight down over e2, filling the screen with the square, then straight up to the overhead framing (S.camO) */
  pullCam(t) {
    const S = this.S6, W = this.W, H = this.H, a = W / H, fq = a < 1 ? 44 : 30, th = Math.tan(fq * Math.PI / 360), u = this.au(t);
    const hh = .42 / (th * Math.max(1, a)) * this.push(Math.min(u, UP)), x = lin(UP, 1, u), e = .3 * (1 - (1 - x) * (1 - x)) + .7 * x * x * (3 - 2 * x), O = a < 1 ? [26, 8.5, .3] : [18.5, 9.4, 0];
    const eL = sm(.3, 1, x), L = [mx(.5, 0, eL), mx(.04, 0, eL), mx(2.5, O[2], eL)], dO = Math.hypot(O[0], O[1] - O[2]), d = Math.exp(mx(Math.log(hh), Math.log(dO), e)), el = mx(Math.PI / 2 - 1e-4, Math.atan2(O[0], O[1] - O[2]), e);
    const C = [L[0], L[1] + d * Math.sin(el), L[2] + d * Math.cos(el)];
    /* the board's sideways offset (bdx) rides in the projection centre during the pull, so the board render always covers the frame; at the end it hands over to the CSS shift at the same pixels */
    const sh = (this.bdx || 0) * eL;
    return { C, L, fov: fq, x, e, sh, c6: { x: S.Xb + C[0] * S.q, y: C[1] * S.q, z: S.Zb - C[2] * S.q, ph: el, f: H / 2 / th, cx: W / 2 + sh, cy: H / 2 } };
  }
  cam6(t) { return t < TBE ? this.pullCam(t).c6 : this.S6.camO; }
  ball6At() { const S = this.S6, b = S.rest; return { X: b.X, Z: b.Z, rho: (Math.hypot(.6, .05) + .1) / S.br }; }
  layout4() {
    const w5 = this.wEl[4]; if (!w5) return;
    this.q5 = { bgl: this.$('[data-bgl]'), world: w5, clip: this.$('[data-w5clip]'), wcam: this.$('[data-w5cam]'), tall: this.$('[data-tall]', w5), ql: this.$('[data-qlayer]') };
    this.st.sandboard.qel = this.q5.ql;
    { const W = this.W, H = this.H, g = this.$('[data-g18]'), fo = this.$('[data-f18]'), M = Math.ceil(this.bdx || 0) + 24, cw = W + 2 * M;
      [g, fo].forEach(el => el && Object.assign(el.style, { left: -M + 'px', width: cw + 'px', height: H + 'px' }));
      if (g && !g._G) g._G = window.Ground19 ? window.Ground19(g) : { ok: false };
      const dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(3.2e6 / (cw * H)));
      if (fo) { fo.width = Math.round(cw * .6); fo.height = Math.round(H * .6); fo._k = .6; }
      Object.assign(this.q5, { g18: g, f18: fo, fx: fo && fo.getContext('2d'), gM: M, gB: [Math.round(cw * dpr), Math.round(H * dpr)] }); }
    w5.style.maskSize = w5.style.webkitMaskSize = '100% 100%, 100% 100%'; w5.style.maskRepeat = w5.style.webkitMaskRepeat = 'no-repeat';
  }
  layout6() {
    const H = this.H, n = this.n, w6 = this.wEl[5]; if (!w6) return;
    this.F6 = n ? H * .52 : H * .9; this.hy6 = H * .56; this.fovW = 2 * Math.atan(H / 2 / this.F6) * 180 / Math.PI; this.px6 = n ? [-.4, .4, -.4, .4] : [-1.35, 1.35, -1.35, 1.35]; this.pw6 = n ? 1.05 : 1;
    Object.assign(this.st.arcade8, { xw: n ? 1.3 : 2.6, ze: ZE, dz: DOORZ, fs: this.px6.map((x, i) => [-x, CZ[i], 2.4]) });
    this.dk6 = null;
    this.q6 = { world: w6, cam: this.$('[data-cam]', w6), plate: this.$('[data-plate]', w6), door: this.$('[data-door]', w6), leafw: this.$('[data-leafw]', w6), leaf: this.$('[data-leaf]', w6), train: this.$('[data-train]', w6) };
  }
  layout7() {
    const W = this.W, H = this.H, n = this.n, w7 = this.wEl[6]; if (!w7) return;
    this.room = n ? { b: [.1, .14, .9, .66], win: [.42, .2, .74, .5] } : { b: [.2, .1, .8, .7], win: [.555, .26, .695, .66] };
    this.winDx = (this.room.win[0] - (n ? .52 : .62)) * W; /* the night layer follows the window's move so the view inside it is unchanged */
    const [x0, y0, x1, y1] = this.room.win.map((v, i) => v * (i % 2 ? H : W)); this.win0 = [x0, y0, x1, y1];
    const fr = this.$('[data-winframe]'); if (fr) Object.assign(fr.style, { left: (x0 - 14) + 'px', top: (y0 - 14) + 'px', width: (x1 - x0 + 28) + 'px', height: (y1 - y0 + 28) + 'px' });
    ['[data-winsill]', '[data-winglass]', '[data-winsky]'].forEach(sl => { const e = this.$(sl); if (e) e.style.display = n ? 'none' : ''; });
    const qb = this.$('[data-3d="roomqueen"]'); if (qb) Object.assign(qb.style, n ? { left: '-4%', top: '18%', width: '64%', height: '66%' } : { left: '32%', top: '4%', width: '30%', height: '92%' });
    const tb = this.$('[data-table]'); if (tb) Object.assign(tb.style, n ? { left: '80%', top: '64%', display: '' } : { display: 'none' });
    const pw = (x1 - x0) * .5, ph = (y1 - y0) * .56; this.pane = { x: x0 + (x1 - x0) * .25, y: y0 + (y1 - y0) * .72, z: 1.2 * Math.max(W / pw, H / ph) };
    this._lqB = null; this._spB = null; this.q7 = { leafBw: this.$('[data-leafbw]', w7), leafB: this.$('[data-leafb]', w7), world: w7, cam: this.$('[data-cam]', w7), wincam: this.$('[data-wincam]'), rcv: w7.querySelector('[data-paint="room"]') };
  }
  layout8() {
    const W = this.W, H = this.H, n = this.n, w8 = this.wEl[7], P = window.Painter; if (!w8) return;
    const rx = n ? W * .28 : Math.min(W * .17, 260);
    const g = this.g8 = { cx: n ? W * .7 : W * .72, cy: n ? H * .22 : H * .42, rx, ry: rx * .82, ks: n ? Math.min(.58, H / 1300) : Math.min(1.4, H / 700), mx: n ? .2 : .3 };
    this.ctear = this.ctear && this.ctear.fib ? this.ctear : P.ragged6(29);
    const ms = n ? 96 : 150, moon = this.$('[data-moon]', w8); if (moon) Object.assign(moon.style, { width: ms + 'px', height: ms + 'px' });
    this.moon0 = [W * g.mx - ms / 2, H * (n ? .1 : .2) - ms / 2];
    // moonlit cloud cards over the night sea: a band on the horizon, a mid layer and a near one
    const NC = this.pal().night, hz8 = H * .62;
    this.decks.n8 = [
      { w: W * 1.1, h: H * .14, k: .6, x0: -.05 * W, y0: hz8 - H * .14, f: .4, seed: 41, col: NC, list: n ? [[.12, .66, .02], [.48, .56, .016], [.85, .7, .02]] : [[.05, .7, .011], [.2, .56, .008], [.38, .72, .012], [.56, .6, .009], [.74, .72, .011], [.92, .58, .008]] },
      { w: W * 1.1, h: H * .4, k: .55, x0: -.05 * W, y0: H * .1, f: 1, seed: 43, col: NC, list: n ? [[.1, .55, .06], [.86, .75, .05]] : [[.06, .5, .035], [.5, .72, .03], [.94, .4, .04], [.62, .92, .026]] },
      { w: W * 1.2, h: H * .5, k: .45, x0: -.1 * W, y0: -H * .06, f: 1.4, seed: 47, col: Object.assign({ blur: 3 }, NC), list: n ? [[.04, .3, .1]] : [[.02, .36, .06], [.99, .22, .05]] },
    ];
    this.$$('[data-n8c]', w8).forEach(cv => { const L = this.decks.n8[+cv.dataset.l]; if (L) Object.assign(cv.style, { left: L.x0 + 'px', top: L.y0 + 'px', width: L.w + 'px', height: L.h + 'px' }); });
    this.q8 = { world: w8, ncl: this.$('[data-ncl]', w8), n8c: this.$$('[data-n8c]', w8), cam: this.$('[data-cam]', w8), plate: this.$('[data-nightplate]', w8), rimcv: this.$('[data-crimcv]', w8), moon, refl: this.$('[data-reflect]', w8) };
    const T = this.ctear, inn = T.at(g.cx, g.cy, g.rx, g.ry, 0), out = T.at(g.cx, g.cy, g.rx, g.ry, 1); this.ct8 = out; this._k8 = null; this._rip = null;
    // the torn paper rim is painted once at full size; opening and closing the tear only scales it
    const rc = this.q8.rimcv; if (rc) { const d = Math.min(2, devicePixelRatio || 1); rc.width = Math.round(W * d); rc.height = Math.round(H * d); rc.style.transformOrigin = `${g.cx.toFixed(1)}px ${g.cy.toFixed(1)}px`; rc.style.visibility = 'hidden'; try { P.tearRim6(rc.getContext('2d'), inn, out, T, g.cx, g.cy, d); } catch (e) { console.warn('rim8: ' + e.message); } }
    const cc = this.cardEl = this.$('[data-id="ccard"]'); this.cardSheen = this.$('[data-sheen]');
    if (!this._deckle) { const r = P.rng(13), pts = [], j = () => (r() * 1.7).toFixed(2);
      for (let i = 0; i <= 40; i++) pts.push(`${(i * 2.5).toFixed(1)}% ${j()}px`); for (let i = 1; i <= 20; i++) pts.push(`calc(100% - ${j()}px) ${(i * 5).toFixed(1)}%`);
      for (let i = 39; i >= 0; i--) pts.push(`${(i * 2.5).toFixed(1)}% calc(100% - ${j()}px)`); for (let i = 19; i >= 1; i--) pts.push(`${j()}px ${(i * 5).toFixed(1)}%`);
      this._deckle = `polygon(${pts.join(',')})`; }
    if (cc) cc.querySelectorAll('[data-deckle],[data-sheen]').forEach(el => { el.style.clipPath = this._deckle; });
    this._tp = null; try { this.layoutTips(); } catch (e) { console.warn('tips8: ' + e.message); }
  }
  /* letter handover: the tear rips open from a crack; gloved fingertips push the letter out through its lower-left edge */
  layoutTips() {
    const g = this.g8, W = this.W, H = this.H, n = this.n, Tp = window.Tips, out = this.ct8, cc = this.cardEl; this.tip = null; if (!g || !Tp || !out || !cc) return;
    const c = [g.cx, g.cy], Wc = cc.offsetWidth || 300, Hc = cc.offsetHeight || 170, sc = n ? cl(Math.min(H / 820, W / 400), .7, 1) : cl(H / 780, .84, 1), r = -6 * Math.PI / 180, co = Math.cos(r), sn = Math.sin(r);
    const wp = (p, P) => [P[0] + (p[0] * co - p[1] * sn) * sc, P[1] + (p[0] * sn + p[1] * co) * sc];
    const inside = (p, poly) => { let q = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) q = !q; } return q; };
    const sec = this.$('#start'), boxes = [[0, 0, W, 100]];
    if (sec) { const sl = sec.offsetLeft, st = sec.offsetTop, h2 = sec.querySelector('h2'), row = h2 && h2.nextElementSibling;
      if (h2) { let l = 1e9, rr = -1e9; h2.querySelectorAll('[data-w]').forEach(w => { l = Math.min(l, w.offsetLeft); rr = Math.max(rr, w.offsetLeft + w.offsetWidth); }); if (rr > l) boxes.push([sl + l, st + h2.offsetTop, sl + rr, st + h2.offsetTop + h2.offsetHeight]); }
      if (row) [...row.children].forEach(e => boxes.push([sl + e.offsetLeft, st + e.offsetTop, sl + e.offsetLeft + e.offsetWidth, st + e.offsetTop + e.offsetHeight])); }
    const M = 22, inBox = p => p[0] < 12 || p[1] < 12 || p[0] > W - 12 || p[1] > H - 12 || boxes.some(B => p[0] > B[0] - M && p[0] < B[2] + M && p[1] > B[1] - M && p[1] < B[3] + M);
    const grid = []; for (let i = 0; i <= 10; i++) for (let j = 0; j <= 5; j++) grid.push([Wc * i / 10, Hc * j / 5]); 
    const em = cc.querySelector('[data-w]'), ex0 = em ? em.offsetLeft : 26, ey0 = em ? em.offsetTop : 28, ew = em ? Math.min(em.scrollWidth, em.offsetWidth) : 220, eh = em ? em.offsetHeight : 28;
    const eBox = []; for (let i = 0; i <= 6; i++) for (let j = 0; j <= 1; j++) eBox.push([ex0 + ew * i / 6 + 4, ey0 + eh * j]);
    const AN = [Wc * .8, Hc * .5]; let best = null;
    for (let deg = 115; deg <= 215; deg += 2.5) {
      const a = deg * Math.PI / 180; let bi = 0, bd = 1e9; out.forEach((q, i) => { const d = Math.abs(Math.atan2((q[1] - c[1]) / g.ry, (q[0] - c[0]) / g.rx) - Math.atan2(Math.sin(a), Math.cos(a))); const dd = Math.min(d, Math.PI * 2 - d); if (dd < bd) { bd = dd; bi = i; } });
      const B = out[bi], inw = [c[0] - B[0], c[1] - B[1]], il = Math.hypot(inw[0], inw[1]) || 1, Kw = [B[0] + inw[0] / il * 7, B[1] + inw[1] / il * 7];
      const k0 = wp(AN, [0, 0]), P = [Kw[0] - k0[0], Kw[1] - k0[1]];
      let hidden = 0; [[Wc, 0], [Wc, Hc * .25], [Wc, Hc * .5], [Wc, Hc * .75], [Wc, Hc]].forEach(q => { if (!inside(wp(q, P), out)) hidden++; });
      let vis = 0, bad = 0, eh2 = 0; grid.forEach(q => { const w = wp(q, P); if (!inside(w, out)) { vis++; if (inBox(w)) bad++; } }); eBox.forEach(q => { if (inside(wp(q, P), out)) eh2++; });
      const dw = [-co, -sn], al = dw[0] * inw[0] / -il + dw[1] * inw[1] / -il;
      const f = vis / grid.length, score = hidden * 3 + bad / grid.length * 12 + eh2 * 1.5 + Math.abs(f - .75) * 2 + (1 - al) * 4 + Math.abs(deg - 155) / 300;
      if (!best || score < best.score) best = { score, P, Kw, deg };
    }
    // start hidden inside the hole: drawn back toward its centre and a little smaller (deeper), then pushed out to the final pose
    const aS = [-co, -sn], ctr = wp([Wc / 2, Hc / 2 - 20], best.P); let V = [c[0] - ctr[0], c[1] - ctr[1]], ks = 1, found = false;
    const wps = (p, P, k) => [P[0] + (p[0] * co - p[1] * sn) * sc * k, P[1] + (p[0] * sn + p[1] * co) * sc * k];
    for (const k of [1, .9, .8, .7, .6, .5]) { for (let l = 0; l <= 1.2 && !found; l += .05) { const ck = wps([Wc / 2, Hc / 2 - 20], [0, 0], k), P = [c[0] - ck[0] + (1 - l) * 0 - V[0] * (1 - l) * 0, c[1] - ck[1]];
        const Pl = [mx(best.P[0], P[0], l), mx(best.P[1], P[1], l)], kl = mx(1, k, l); if ([[0, 0], [Wc, 0], [Wc, Hc], [0, Hc]].every(q => inside(wps(q, Pl, kl), out))) { V = [Pl[0] - best.P[0], Pl[1] - best.P[1]]; ks = kl; found = true; } } if (found) break; }
    if (!found) { const ck = wps([Wc / 2, Hc / 2 - 20], [0, 0], .5); V = [c[0] - ck[0] - best.P[0], c[1] - ck[1] - best.P[1]]; ks = .5; }
    this.tip = { P: best.P, Kw: best.Kw, r, sc, aS, V, ks, Wc, Hc };
    // no hand: the letter is pushed out from the other side on its own
    const sv = k => this.$(`[data-armsvg="${k}"]`); if (sv('thumb')) sv('thumb').innerHTML = ''; if (sv('front')) sv('front').innerHTML = '';
    const back = this.$('[data-armback]'); if (back) back.style.display = 'none';
    const pad = 12 * sc;
    const near = q => (() => { const d = [q[0] - best.P[0], q[1] - best.P[1]], lx = (d[0] * co + d[1] * sn) / sc, ly = (-d[0] * sn + d[1] * co) / sc; return lx > -pad && lx < Wc + pad && ly > -pad && ly < Hc + pad; })();
    const idxs = []; out.forEach((q, i) => { if (near(q)) idxs.push(i); });
    const flapG = this.$('[data-armflap]'); if (flapG) { flapG.innerHTML = Tp.edge(out, idxs, c, 11); flapG.removeAttribute('transform'); }
    const xq = wp([Wc * .4, Hc * .4], best.P), exl = Math.hypot(xq[0] - c[0], xq[1] - c[1]) || 1, ex = [(xq[0] - c[0]) / exl, (xq[1] - c[1]) / exl];
    let th = 1e9; grid.forEach(q => { const w = wp(q, best.P); if (!inside(w, out)) th = Math.min(th, (w[0] - c[0]) * ex[0] + (w[1] - c[1]) * ex[1]); });
    this.tipX = { ex, th: Math.min(th - 14, Math.min(g.rx, g.ry) * .35) };
    const wraps = this.$$('[data-armwrap]'), cp = this.exitClip(q => q);
    wraps.slice(0, 2).forEach(e => { e.style.clipPath = cp; });
    this.armEls = { wraps, movers: this.$$('[data-armmove]'), flapG };
    cc.style.transformOrigin = '0px 0px'; this._cardClip = null;
  }
  exitClip(tf) {
    const g = this.g8, X = this.tipX, o = this.ct8, P = window.Painter, c = [g.cx, g.cy], f = X.ex, pp = [-f[1], f[0]], B = 6000, side = p => (p[0] - c[0]) * f[0] + (p[1] - c[1]) * f[1] - X.th, res = [];
    for (let i = 0; i < o.length; i++) { const a = o[i], b = o[(i + 1) % o.length], sa = side(a), sb = side(b);
      if (sa >= 0) res.push(a); if ((sa >= 0) !== (sb >= 0)) { const t = sa / (sa - sb); res.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } }
    const b0 = [c[0] + f[0] * X.th, c[1] + f[1] * X.th], q = [[b0[0] + pp[0] * B, b0[1] + pp[1] * B], [b0[0] + pp[0] * B + f[0] * B, b0[1] + pp[1] * B + f[1] * B], [b0[0] - pp[0] * B + f[0] * B, b0[1] - pp[1] * B + f[1] * B], [b0[0] - pp[0] * B, b0[1] - pp[1] * B]];
    return `path(evenodd, "${P.toPath(q.map(tf))}${res.length > 2 ? ' ' + P.toPath(res.map(tf)) : ''}")`;
  }
  /* the tear at rip progress p: a crack that rips open along its edges in three quick stages (paper thickness and fibres throughout) */
  tearAt(p) {
    const g = this.g8, T = this.ctear; if (!g || !T) return null;
    if (!this._rip) { const inn = T.at(g.cx, g.cy, g.rx, g.ry, 0), out = T.at(g.cx, g.cy, g.rx, g.ry, 1), a = -.32, u = [Math.cos(a), Math.sin(a)], nu = [-u[1], u[0]], R = window.Painter.rng(61);
      const pr = inn.map(q => (q[0] - g.cx) * u[0] + (q[1] - g.cy) * u[1]), mxp = Math.max(...pr.map(Math.abs)) || 1;
      this._rip = { inn, out, u, nu, pr, mxp, side: inn.map(q => ((q[0] - g.cx) * nu[0] + (q[1] - g.cy) * nu[1]) >= 0 ? 1 : -1), dl: pr.map(v => .07 * Math.abs(v) / mxp + .03 * R()) }; }
    const K = this._rip, Lf = mx(.22, 1, sm(0, .42, p)), zz = v => 4 * Math.sin(v * .09) + 2.4 * Math.sin(v * .23 + 1);
    const inn = [], out = [], e = [];
    for (let i = 0; i < K.inn.length; i++) {
      const d = K.dl[i], ei = .36 * sm(.16 + d, .3 + d, p) + .34 * sm(.46 + d, .6 + d, p) + .3 * sm(.76 + d * .5, .9 + d * .5, p);
      const v = K.pr[i] * Lf, ck = [g.cx + K.u[0] * v + K.nu[0] * (zz(K.pr[i]) * Lf + K.side[i] * 2.6), g.cy + K.u[1] * v + K.nu[1] * (zz(K.pr[i]) * Lf + K.side[i] * 2.6)];
      const I = [mx(ck[0], K.inn[i][0], ei), mx(ck[1], K.inn[i][1], ei)], th = .3 + .7 * ei;
      inn.push(I); out.push([I[0] + (K.out[i][0] - K.inn[i][0]) * th, I[1] + (K.out[i][1] - K.inn[i][1]) * th]); e.push(ei);
    }
    return { inn, out, e };
  }
  // the day sky behind the night tear puts its clouds around the opening
  tearSky() { const g = this.g8; return { cx: g.cx, cy: g.cy, rx: g.rx }; }
  mixc(a, b, t) { const P = window.Painter, A = P.hex(a), B = P.hex(b); return `rgb(${Math.round(mx(A[0], B[0], t))},${Math.round(mx(A[1], B[1], t))},${Math.round(mx(A[2], B[2], t))})`; }

  /* ---------- painting ---------- */
  queuePaint() {
    const P = new Proxy({}, { get: (_, k) => window.Painter[k] }), g = this.g1, n = this.n, R = this.room;
    const J = [
      [0, 'sky1', cv => P.sky(cv, { seed: 1, w: cv.offsetWidth, h: cv.offsetHeight, stops: [[0, '#79A6DC'], [.4, '#4F84C8'], [1, '#3E78C4']], clouds: 0 })],
      [0, 'near1', cv => P.deck11(cv, this.decks.sk[2])], [0, 'sk1', cv => P.deck11(cv, this.decks.sk[+cv.dataset.l])],
      [0, 'face', cv => P.face6(cv, g.fw, g.fh, { noUp: true })], [0, 'eyeball', cv => P.eyeball6(cv, g.fw, g.fh)], [0, 'iris', cv => P.iris6(cv, g.ir, n ? 1600 : 3200)],
      [0, 'eyeshade', cv => P.eyeShade6(cv, g.fw, g.fh)], [0, 'eyeglint', cv => P.eyeGlint6(cv, g.fw, g.fh, g.ir)],
      [0, 'skin', cv => P.skinField6(cv, g.PW, g.PH, g.E, g.ox, g.oy)],
      [1, 'a8sky', cv => P.apple9Sky(cv, this.g2)],
      [2, 'b3c', cv => P.deck10(cv, this.decks.b3[+cv.dataset.l])], [7, 'n8c', cv => P.deck10(cv, this.decks.n8[+cv.dataset.l])],
      [2, 'b6gull', cv => P.gull6(cv)],
      [5, 'desert', cv => P.arcade7(cv, { hy: .56, F: n ? .52 : .9, xw: n ? 1.3 : 2.6 })], [5, 'founder', cv => P.founder7(cv, +cv.dataset.v)], [5, 'head', cv => P.head7(cv, +cv.dataset.v)], [5, 'thought', cv => P.thought7(cv, cv.dataset.kind)], [5, 'resolved', cv => P.resolved(cv, +cv.dataset.v)], [5, 'planet', cv => P.planet(cv, cv.dataset.col)],
      [6, 'room', cv => P.room(cv, R)],
      [7, 'night', cv => P.nightSea(cv, { hy: .413, mx: this.g8.mx })], [7, 'morning', cv => P.morning9(cv, this.tearSky())], [7, 'moon', cv => P.moon(cv)],
    ];
    // The heavy plates (up to several seconds of brushwork each) are painted in a worker when the browser allows it.
    // Each entry says which painter to call there and with what; non-plain inputs are rebuilt worker-side.
    const RM = {
      near1: () => ['deck11', [this.decks.sk[2]]], sk1: cv => ['deck11', [this.decks.sk[+cv.dataset.l]]],
      b3c: cv => ['deck10', [this.decks.b3[+cv.dataset.l]]], n8c: cv => ['deck10', [this.decks.n8[+cv.dataset.l]]],
      sky1: cv => ['sky', [{ seed: 1, w: cv.offsetWidth, h: cv.offsetHeight, stops: [[0, '#79A6DC'], [.4, '#4F84C8'], [1, '#3E78C4']], clouds: 0 }]],
      face: () => ['face6', [g.fw, g.fh, { noUp: true }]], eyeball: () => ['eyeball6', [g.fw, g.fh]], iris: () => ['iris6', [g.ir, n ? 1600 : 3200]],
      eyeshade: () => ['eyeShade6', [g.fw, g.fh]], eyeglint: () => ['eyeGlint6', [g.fw, g.fh, g.ir]],
      skin: () => ['skinField6', [g.PW, g.PH, { $eye: [g.fw, g.fh] }, g.ox, g.oy]],
      a8sky: () => ['apple9Sky', [this.g2]], room: () => ['room', [R]],
      desert: () => ['arcade7', [{ hy: .56, F: n ? .52 : .9, xw: n ? 1.3 : 2.6 }]], founder: cv => ['founder7', [+cv.dataset.v]],
      night: () => ['nightSea', [{ hy: .413, mx: this.g8.mx }]], morning: () => ['morning9', [this.tearSky()]],
    };
    const remote = canPaintRemotely() && !this.q('noworker');
    const at = parseFloat(this.q('at')), aw = isNaN(at) ? -1 : this.worldAt(at);
    this.pq = []; J.forEach(([w, k, fn]) => { if (aw >= 0 && Math.abs(w - aw) > 1 && !(aw === 1 && w === 2)) return; this.$$(`[data-paint="${k}"]`).forEach(cv => this.pq.push({ w, cv, fn, rm: remote && RM[k] })); });
    this._hero = this.pq.filter(j => j.w === 0).map(j => j.cv);
    const token = (this._pt = (this._pt || 0) + 1);
    // Plates near the visible world get a deadline; far ones wait for genuinely idle time so they never stall a scroll.
    const idle = (f, urgent) => window.requestIdleCallback ? requestIdleCallback(f, urgent ? { timeout: 100 } : undefined) : setTimeout(f, urgent ? 16 : 120);
    const nearest = lane => { const cur = this.worldAt(this.t || 0); let bi = -1, bd = 99; this.pq.forEach((j, i) => { if (!!j.rm !== lane) return; const d = Math.abs(j.w - cur) + (j.w < cur ? .5 : 0); if (d < bd) { bd = d; bi = i; } }); return [bi, bd]; };
    const show = cv => { const wd = cv.closest('[data-world]'), hid = wd && wd.style.display === 'none'; if (hid) wd.style.display = ''; return () => { if (hid) wd.style.display = 'none'; }; };
    const done = () => { if (!this.pq.length && window.Scene3D && !this._nogl) window.Scene3D.load(); };
    // Worker lane: one plate at a time, nearest world first. A plate the worker cannot paint drops back to the main lane.
    const remoteStep = () => {
      if (token !== this._pt || !this._alive) return;
      const [bi] = nearest(true); if (bi < 0) return done();
      const j = this.pq.splice(bi, 1)[0], cv = j.cv, back = show(cv), cw = cv.offsetWidth, ch = cv.offsetHeight, [fn, args] = j.rm(cv); back();
      paintRemote(cv, fn, args, cw, ch).then(ok => {
        if (token !== this._pt) return;
        if (ok) cv._pv = (cv._pv || 0) + 1; else { j.rm = null; this.pq.push(j); idle(step, true); }
        remoteStep();
      });
    };
    const step = deadline => {
      if (token !== this._pt || !this._alive) return;
      const [bi, bd] = nearest(false); if (bi < 0) return done();
      if (bd > 1.5 && (this._moving || (deadline && !deadline.didTimeout && deadline.timeRemaining() < 8))) { idle(step, false); return; }
      const j = this.pq.splice(bi, 1)[0], cv = j.cv;
      cv.getBoundingClientRect = () => ({ width: cv.offsetWidth, height: cv.offsetHeight, left: 0, top: 0, right: cv.offsetWidth, bottom: cv.offsetHeight });
      const wd = cv.closest('[data-world]'), hid = wd && wd.style.display === 'none'; if (hid) wd.style.display = '';
      try { j.fn(cv); cv._pv = (cv._pv || 0) + 1; } catch (e) { cv._pf = 1; console.warn('paint ' + (cv.dataset.paint || '') + ': ' + (e && e.message || String(e))); } delete cv.getBoundingClientRect; if (hid) wd.style.display = 'none';
      const [nb, nd] = nearest(false);
      if (nb >= 0) idle(step, nd <= 1.5); else done();
    };
    idle(step, true); remoteStep();
  }

  /* ---------- frame loop ---------- */
  loop() {
    if (!this._alive) return; const pn = performance.now(); clearTimeout(this._lt);
    this._lt = setTimeout(this._loopF, document.visibilityState === 'hidden' && pn - (this._act || 0) > 10000 && this._lastR ? 1000 : 120); if (!this._rafP) { this._rafP = true; requestAnimationFrame(() => { this._rafP = false; this._loopF(); }); } if (this._lastF && pn - this._lastF < 4) return; this._lastF = pn;
    if (!this.W) { if (innerWidth > 0) { const n = innerWidth < 820; if (n !== this.state.narrow) this.setState({ narrow: n }); else this.relayout(true); } return; }
    if (this._at == null) { const a = parseFloat(this.q('at')); this._at = isNaN(a) ? false : a; if (this._at !== false) { this.t = this._at; this._introT0 = performance.now() - 5000; } }
    const sT = this._at !== false ? VI(this._at) : cl(scrollY / this.H, 0, VI(TEND));
    if (this.s == null) this.s = VI(this.t || 0);
    if (this.red()) { const b = this.beat(V(sT)); if (b !== this._beat) { if (this._beat != null) this.fadeSwap(); this._beat = b; } this.t = b; this.s = VI(b); }
    else { const d = sT - this.s; this._moving = Math.abs(d) > .01; this.s = Math.abs(d) < .0008 ? sT : this.s + d * .085; this.t = this._at !== false ? this._at : V(this.s); this._beat = null; }
    this.now = performance.now() / 1000;
    // Once the page has been still for a while, keep only a slow heartbeat; while it moves, frame times steer the 3D resolution.
    const busy = Math.abs(sT - this.s) > .0005 || this._sY !== scrollY || pn - (this._act || 0) < 1500 || pn - (this._introT0 || 0) < 8000 || this.state.loader || this._at !== false;
    this._sY = scrollY; if (busy) this._busyT = pn;
    if (!busy && pn - (this._busyT || 0) > 1200 && pn - (this._lastR || 0) < (this.t >= TB1 && this.t < QB ? 15 : 32)) return;
    if (busy && this._lastR && window.Scene3D && window.Scene3D.quality) window.Scene3D.quality.report(pn - this._lastR, this.n ? 33.4 : 16.7);
    this._lastR = pn;
    try { this.render(this.t); } catch (e) { if (!this._errd) { this._errd = 1; console.error(e); } }
  }
  beat(x) { let b = BEATS[0]; for (const v of BEATS) if (x >= v - .3) b = v; return b; }
  fadeSwap() { ['[data-stage]', '[data-copylayer]'].forEach(s => { const el = this.$(s); el && el.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 600, easing: 'ease-out' }); }); }
  worldAt(t) { let k = 0; for (let i = 0; i < 8; i++) if (t >= NAVT[i]) k = i; return k; }
  render(t) {
    this._mq = this._mq || matchMedia('(prefers-reduced-motion: reduce)'); this._rm = this.props.motion === false || this._mq.matches;
    this.mv = {}; this.m3 = 'none'; this.tilt = this.tiltAt(t); this.qstate(t); this.boardShift(t);
    for (let k = 0; k < 8; k++) { const el = this.wEl[k]; if (!el) continue; const on = t >= RANGE[k][0] && t < RANGE[k][1]; if (el._on !== on) { el._on = on; el.style.visibility = on ? 'visible' : 'hidden'; el.style.display = on ? '' : 'none'; } if (on) this['w' + (k + 1)](t); }
    this.st.apple8.active = t < TF + .02; this.st.sandboard.active = t > 2.55 && t < 18.25; if (t >= PB && this.q1 && this.q1.near) this.S(this.q1.near, 'visibility', 'hidden'); if (t >= PB && this.q2 && this.q2.skycl) this.S(this.q2.skycl, 'visibility', 'hidden'); if (this.q5 && !(this.wEl[4] && this.wEl[4]._on)) [this.q5.bgl, this.q5.g18, this.q5.f18].forEach(el => this.S(el, 'visibility', 'hidden')); this.drawBall(t); this.st.roomqueen.active = t > 21.3 && t < 25.2; this.st.arcade8.active = t > 16.55 && t < 22.95;
    this.carry(t); this.copy(t); this.ui(t); this.mounts(t); this.drive();
  }

  w1(t) {
    const g = this.g1, q = this.q1, P = window.Painter, W = this.W, H = this.H; if (!g || !q) return;
    if (this._s1 !== 1) { this._s1 = 1; const inn = this.tear.at(g.cx, g.cy, g.rx, g.ry, 0), out = this.tear.at(g.cx, g.cy, g.rx, g.ry, 1);
      q.plate.style.clipPath = `path(evenodd, "M0 0H${W}V${H + 60}H0Z ${P.toPath(out)}")`; if (q.cl) q.cl.style.clipPath = `path(evenodd, "M-600 -600H${W + 600}V${H * 3.5}H-600Z ${P.toPath(out)}")`;
      if (this.rimCtx) P.tearRim6(this.rimCtx, inn, out, this.tear, g.cx, g.cy, this.dpr1); this.tearShadow(inn, out); }
    const T = this.tilt, off = T ? Math.round(T.top) - H : 0, rm = this._rm;
    this.S(this.wEl[0], 'transform', `translateY(${off}px)`);
    /* the face sits behind the hole: it travels a little less than the torn sky */
    const sh = rm ? 0 : Math.min(g.ry * .3, Math.max(0, -off * .1)); this.S(q.face, 'transform', sh > .05 ? `translateY(${sh.toFixed(1)}px)` : 'none');
    const gz = sm(0, .2, t), f = (1 - sm(.8, .95, t)) * (1 - gz);
    // the eye follows a fine pointer, eased and held within 6px; it holds still and dips slightly while the lid is down
    const fine = this._fine ?? (this._fine = matchMedia('(pointer: fine)').matches), fol = fine && !rm;
    if (this._sb == null) this._sb = t > .012; if (!this._sb && t > .012) { this._sb = true; if (t < .4 && !rm) this.startBlink(false); }
    const bc = this.blinkC(performance.now());
    if (bc <= 0) { this._ex = mx(this._ex || 0, fol ? (this.mx || 0) * 6 : 0, .05); this._ey = mx(this._ey || 0, fol ? (this.my || 0) * 6 : 0, .05); }
    const em = Math.hypot(this._ex, this._ey), ek = em > 6 ? 6 / em : 1;
    this.S(q.eye, 'transform', `translate(${(this._ex * ek * f - g.E.ew * .012 * bc).toFixed(2)}px,${(this._ey * ek * f + g.ey * 1.15 * gz + g.E.eh * .04 * bc).toFixed(2)}px)`);
    this.drawLid(bc);
    this._pk = mx(this._pk ?? 1, this._hov && t < .4 ? .8 : 1, .07); this.S(q.pupil, 'transform', `scale(${this._pk.toFixed(3)})`);
  }
  /* one camera: pitch from the sky down to the horizon, then the tilt and dive into one cream tile */
  w2(t) {
    const W = this.W, H = this.H, q = this.q2, G = this.g2, T = this.tilt; if (!q || !G || !T) return;
    const dy = T.top - T.topE;
    this.S(q.plate, 'transform', `translateY(${Math.round(T.top)}px)`);
    { const sc = q.skycl, off = Math.round(T.top) - H, on = t < PB; if (sc) { this.S(sc, 'visibility', on ? 'visible' : 'hidden'); if (on) { this.S(sc, 'transform', `translateY(${off}px)`); q.skl.forEach((cv, i) => { const L = this.decks.sk && this.decks.sk[i]; if (L) this.S(cv, 'transform', `translate(${this.drift(i).toFixed(1)}px,${((this.pf(L.f) - 1) * off).toFixed(1)}px)`); }); } } }
    const nr = this.q1 && this.q1.near; if (nr) { const o = (T.top - H) * this.pf(1.4), on = o > -H * 1.95; this.S(nr, 'visibility', on ? 'visible' : 'hidden'); if (on) this.S(nr, 'transform', `translate(${this.drift(2).toFixed(1)}px,${o.toFixed(1)}px)`); }
    const sy = T.top + G.Yh - 2, seaOn = sy < H && sy > -H; this.S(q.sea, 'visibility', seaOn ? 'visible' : 'hidden');
    if (seaOn && q.sx) { this.S(q.sea, 'transform', `translateY(${sy.toFixed(1)}px)`); window.Painter.sea8(q.sx, q.sea.width, q.sea.height, G.sunX * .6, this.now, .6); }
    q.gulls.forEach((el, i) => { const gp = G.gulls[i]; if (!gp) return; const a = this.now * (.04 + i * .011) + i * 2.1, x = W * gp[0] + Math.sin(a) * W * .03, y = dy + H * gp[1] + Math.sin(a * 1.7) * 6, s2 = (this.n ? .3 : .34) + i * .05, fl = .7 + Math.sin(this.now * 3 + i * 1.3) * .3, dir = Math.cos(a) >= 0 ? 1 : -1;
      this.S(el, 'transform', `translate(${(x - 45).toFixed(1)}px,${(y - 20).toFixed(1)}px) scale(${(s2 * dir).toFixed(3)},${(s2 * fl).toFixed(3)})`); });
    const st = this.st.apple8, u = this.au(t), D = this.dive(u);
    st.cam = { C: G.C, P: t > PA ? D.P : null, pitch: t > PA ? D.pitch : Math.atan(T.tn), fov: G.fov, shift: G.shift, yaw: t > PA ? D.yaw : G.yaw, ld: G.ld }; st.peb = G.peb;
    this.S(q.alay, 'visibility', t < TF ? 'visible' : 'hidden'); this.S(q.alay, 'opacity', (1 - sm(UF, UP, u)).toFixed(3));
  }
  w3(t) {
    const W = this.W, H = this.H, q = this.q3, S = this.S6; if (!q || !S) return;
    /* clouds only: the sky itself is ground18's flat sky, the ground is ground18 */
    const on = t >= TB1; this.S(q.cam, 'visibility', on ? 'visible' : 'hidden'); if (!on) return;
    const c = this.cam6(t), s = c.f / S.F, vh = c.cy - c.f * Math.tan(c.ph);
    const sx0 = W / 2 - s * W / 2 - s * .04 * W, sy0 = vh - s * S.hy - s * .04 * H;
    // the beach clouds ride with the sky and drift a little apart in depth while the beach holds
    const v3 = this._rm ? 0 : cl(-(t - 8.4) * H * .03, -H * .08, H * .08);
    q.b3c.forEach(cv => { const i = +cv.dataset.l, L = this.decks.b3 && this.decks.b3[i]; if (L) this.S(cv, 'transform', `matrix(${s.toFixed(5)},0,0,${s.toFixed(5)},${(sx0 + s * L.x0 + this.drift(i)).toFixed(2)},${(sy0 + s * L.y0 + v3 * this.pf(L.f)).toFixed(2)})`); });
  }
  drawBall(t) {
    const q = this.q3, x = q && q.bx, S = this.S6; if (!x || !S) return; const on = t >= TB1 && t < 17.55;
    this.S(q.ball, 'visibility', on ? 'visible' : 'hidden'); if (!on || this._ballT === t) return; this._ballT = t;
    const k = q.ball._k, P = window.Painter, pr = P.cam6.proj; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, q.ball.width, q.ball.height);
    let c; if (t < 14.05) c = this.cam6(t); else c = this.qs ? this.qs.c6 : S.camO;
    this.S(q.ball, 'filter', (this.qs && this.qs.blur > .05 ? `blur(${this.qs.blur.toFixed(2)}px) ` : '') + 'sepia(.28) saturate(1.06) hue-rotate(-9deg) brightness(1.02)');
    x.setTransform(k, 0, 0, k, 0, 0);
    const b = this.ball6At(t), r = S.br, sn = S.sun, cp = pr(c, b.X, r, b.Z); if (cp[2] < .15) return;
    const L = Math.hypot(sn[0], sn[1]), ux = sn[0] / L, uz = sn[1] / L, sx0 = b.X + sn[0] * r, sz0 = b.Z + sn[1] * r;
    x.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, la = Math.cos(a) * r * 1.7, lc = Math.sin(a) * r, p = pr(c, sx0 + ux * la - uz * lc, 0, sz0 + uz * la + ux * lc); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); } x.closePath();
    x.filter = 'blur(2px)'; x.fillStyle = 'rgba(70,84,128,.34)'; x.fill(); x.filter = 'none';
    const R = c.f * r / cp[2], g = pr(c, b.X, 0, b.Z); x.fillStyle = 'rgba(46,48,70,.35)'; x.beginPath(); x.ellipse(g[0], g[1], R * .55, Math.max(1, R * .16), 0, 0, 7); x.fill();
    P.ball6(x, cp[0], cp[1], R, b.rho, this.ballTex);
  }
  w4() { /* the underwater hall is not part of this cut */ }
  /* the strip of sky and sand the board leaves behind on the left when it slides right; the slide eases in with the overhead view */
  boardShift(t) {
    const f = this.bdx > 0 ? this.bdx * (t >= TBE ? 1 : 0) * (t >= QB ? 0 : 1 - (this.qs ? sm(0, .3, this.qs.p) : 0)) : 0, v = f > .05 ? f.toFixed(1) + 'px 0px' : 'none'; this._bf = f > .05 ? f : 0;
    [this.q5 && this.q5.clip, this.$('[data-ball6]'), this.q5 && this.q5.ql, this.wEl && this.wEl[5]].forEach(el => this.S(el, 'translate', v));
  }
  /* the side gutter every block lines up on; the stage cards sit under the beach headline */
  gutter() { return this.n ? 16 : cl(this.W * .0444, 28, 64); }
  stgSpot() { if (this._stgY == null) { const h = this.$('[data-bh]'); if (!h) return null; const r = h.getBoundingClientRect(); if (!(r.height > 0)) return null; this._stgY = r.bottom + 48; } return [this.gutter(), this._stgY]; }
  w5(t) {
    const W = this.W, H = this.H, q = this.q5, S = this.S6; if (!q || !S) return;
    const ty = -1.2 * H, Q = this.qs, bOn = t >= TB1, sb = this.st.sandboard, pc = bOn && t < TBE ? this.pullCam(t) : null;
    this.S(q.clip, 'visibility', bOn ? 'visible' : 'hidden'); this.S(q.world, 'visibility', bOn ? 'visible' : 'hidden');
    sb.pc = pc ? { C: pc.C, L: pc.L, fov: pc.fov, ox: pc.sh / W } : null;
    this.S(q.tall, 'transform', `translate(0px,${ty.toFixed(1)}px)`);
    this.S(q.tall, 'filter', Q && Q.blur > .05 ? `blur(${Q.blur.toFixed(2)}px)` : 'none');
    this.S(q.tall, 'visibility', bOn && !(Q && Q.inside) ? 'visible' : 'hidden');
    /* the one beach ground (ground19): sea, shoreline, wet and dry sand and the flat sky, one shader, always on while the beach is in view */
    const G18 = q.g18 && q.g18._G, gon = bOn && !!(G18 && G18.ok) && !(Q && Q.inside);
    this.S(q.g18, 'visibility', gon ? 'visible' : 'hidden'); this.S(q.f18, 'visibility', gon ? 'visible' : 'hidden');
    { const bl = Q && Q.blur > .05 ? `blur(${Q.blur.toFixed(2)}px)` : 'none'; this.S(q.g18, 'filter', bl); this.S(q.f18, 'filter', bl); }
    this.S(q.world, 'transform', 'none'); this.S(q.world, 'maskImage', 'none'); this.S(q.world, 'webkitMaskImage', 'none');
    const p = lin(14.25, 16.55, t); sb.p = p; /* the pawn's top is there from the first board frame; it grows with the camera's height so it never crowds the lens */
    sb.pk = pc ? cl((pc.C[1] - .95) / 3.3, .03, 1) : 1;
    /* sample the board's own e2 pixels once while it fills the screen, through the beach filter, so the colour the tile turns to is the board's */
    if (pc && pc.x <= 0 && !sb.e2px) sb.probe = true;
    if (sb.e2px && !this._e2 && this.fm3) { const m = this.fm3, c = sb.e2px.map(v => v / 255), o = [0, 1, 2].map(r => cl(m[r * 3] * c[0] + m[r * 3 + 1] * c[1] + m[r * 3 + 2] * c[2])); this._e2 = window.__e2 = { raw: sb.e2px.map(Math.round), shown: '#' + o.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase() }; }
    if (gon) { const cc = Q ? Q.c6 : this.cam6(t), cm = Object.assign({}, cc, { cx: cc.cx + q.gM });
      G18.draw({ cam: cm, S, now: this.now || 0, sky: true, w: W + 2 * q.gM, h: H, bw: q.gB[0], bh: q.gB[1] }); }
    const f = Math.min(1, p / .86) * 5;
    for (let k = 0; k < 5; k++) { let v = 1 - sm(.42, .56, Math.abs(f - k - .5)); if (k === 0 && f < .5) v = t < 14.25 ? sm(13.6, 13.76, t) : 1; if (k === 4 && f >= 4.5) v = 1; if (t < 13.6) v = 0; if (t > QA) v = k === 4 ? 1 - sm(QA, QA + .16, t) : 0; this.mv['stg' + k] = v; }
    { const P0 = this.stgSpot(); if (P0) for (let k = 0; k < 5; k++) this.pos['stg' + k] = P0; }
    this.wgulls(t);
  }
  /* one gull seen from above, drawn as paths (anti-aliased at device resolution): white body and wing roots, pale grey upper wing, black tips, yellow beak.
     sp = wingspan px, fl = flap (-1 up .. 1 down, 0 = glide with a slight bend), bk = bank (-1..1), sh = draw as a soft shadow silhouette */
  gullPath(x, X, Y, rot, sp, fl, bk, sh) {
    const s = sp / 2; x.save(); x.translate(X, Y); x.rotate(rot + Math.PI / 2);
    const fs = 1 - .26 * Math.abs(fl), sw = .05 * fl;
    const wing = sd => { const L = s * fs * (1 + bk * sd * .14); x.beginPath(); x.moveTo(0, -.09 * s);
      x.quadraticCurveTo(sd * L * .42, -.2 * s - sw * s, sd * L * .62, -.13 * s - sw * s); x.quadraticCurveTo(sd * L * .86, -.07 * s, sd * L, .06 * s + sw * s * .5);
      x.quadraticCurveTo(sd * L * .8, .1 * s, sd * L * .6, .06 * s); x.quadraticCurveTo(sd * L * .3, .16 * s, 0, .12 * s); x.closePath(); return L; };
    if (sh) { [-1, 1].forEach(wing); x.fill(); x.beginPath(); x.ellipse(0, .02 * s, .065 * s, .33 * s, 0, 0, 7); x.fill(); x.restore(); return; }
    [-1, 1].forEach(sd => { const L = wing(sd), gr = x.createLinearGradient(0, 0, sd * L, 0); gr.addColorStop(0, '#F6F6F3'); gr.addColorStop(.22, '#E4E7EA'); gr.addColorStop(.5, '#C9CFD7'); gr.addColorStop(.76, '#BCC3CC'); gr.addColorStop(.8, '#2E2F35'); gr.addColorStop(1, '#1C1C21'); x.fillStyle = gr; x.fill();
      x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = Math.max(.6, s * .018); x.beginPath(); x.moveTo(sd * L * .6, .06 * s); x.quadraticCurveTo(sd * L * .3, .16 * s, 0, .12 * s); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(sd * L * .93, .04 * s, s * .016, 0, 7); x.fill(); });
    x.fillStyle = '#FAFAF7'; x.beginPath(); x.ellipse(0, .03 * s, .07 * s, .3 * s, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-.07 * s, .24 * s); x.quadraticCurveTo(0, .4 * s, .07 * s, .24 * s); x.fill();
    x.beginPath(); x.arc(0, -.3 * s, .058 * s, 0, 7); x.fill();
    x.fillStyle = 'rgba(150,158,170,.35)'; x.beginPath(); x.ellipse(bk * .02 * s, .06 * s, .035 * s, .18 * s, 0, 0, 7); x.fill();
    x.fillStyle = '#E2B53E'; x.beginPath(); x.moveTo(-.018 * s, -.35 * s); x.lineTo(0, -.43 * s); x.lineTo(.018 * s, -.35 * s); x.closePath(); x.fill();
    x.restore();
  }
  /* overhead gulls: world objects at real heights, all drawn into one canvas each frame (shadows first). 2-3 in view, entering and leaving at the frame edges,
     on paths checked against the copy, the stage labels and the pawn's file so they never cross them. Mostly gliding, now and then two or three slow flaps, banking into turns. */
  wgulls(t) {
    const q = this.q5, Lr = q && q.bgl, S = this.S6; if (!Lr || !S) return; const W = this.W, H = this.H, Q = this.qs, P = window.Painter, pr = P.cam6.proj;
    const gA = t >= TBE ? 1 : t >= TB1 ? sm(.62, .8, this.pullCam(t).x) : 0, on = gA > 0 && !(Q && Q.inside);
    this.S(Lr, 'visibility', on ? 'visible' : 'hidden'); let K = Lr._k; if (!K) K = Lr._k = { cv: Lr.querySelector('[data-gcv]'), B: [], a: [], f: 0, box: [], tn: 0 };
    if (!on || !K.cv) { K.B = []; return; }
    const d = Math.min(2, devicePixelRatio || 1), cv = K.cv; if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d); }
    const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); x.setTransform(d, 0, 0, d, 0, 0);
    const c = Q ? Q.c6 : this.cam6(t), now = this.now || 0, rm = this._rm, dt = cl(now - (K.tn || now), 0, .1), bf = this._bf || 0; K.tn = now;
    if (!(K.f++ % 10)) { K.box = (this.blocks || []).filter(b => b.el.style.visibility !== 'hidden').map(b => b.el.getBoundingClientRect()).filter(r => r.width > 0).map(r => [r.left, r.top, r.right, r.bottom]);
      /* the pawn's whole file, rank 2 to the queen's square */
      const a2 = pr(c, S.Xb + .5 * S.q, .3, S.Zb - 2.5 * S.q), a8 = pr(c, S.Xb + .5 * S.q, .3, S.Zb + 3.5 * S.q);
      if (a2[2] > .1 && a8[2] > .1) { const fw = Math.abs(c.f * S.q / a2[2]) * .75; K.box.push([Math.min(a2[0], a8[0]) + bf - fw, Math.min(a2[1], a8[1]) - fw * 1.6, Math.max(a2[0], a8[0]) + bf + fw, Math.max(a2[1], a8[1]) + fw * .6]); } }
    const HT = [1.28, 1.42, 1.58, 1.74], TP = [70, 63, 56, 48], VF = [1, .9, .8, .7], N = rm ? 2 : 3, mg = 60, cs = Math.cos(c.ph), sn = Math.sin(c.ph), O = S.camO, uk = H / 1080;
    const inV = p => p[2] > .05 && p[0] + bf > -mg && p[0] + bf < W + mg && p[1] > -mg && p[1] < H + mg;
    /* pixels per world unit at a point: sizes are set so a bird is TP px wide at the overhead framing (1080p), then follow true perspective */
    const ppu = (cc, X, Y, Z) => { const a = pr(cc, X - .05, Y, Z), b = pr(cc, X + .05, Y, Z); return Math.hypot(b[0] - a[0], b[1] - a[1]) * 10; };
    if (!K.ref || K.refH !== H) { K.refH = H; K.ref = HT.map(Y => ppu(O, S.Xb, Y, S.Zb)); }
    const clearOf = (pts, m) => pts.every(p => !K.box.some(r => p[0] + bf > r[0] - m && p[0] + bf < r[2] + m && p[1] > r[1] - m && p[1] < r[3] + m));
    const spawn = i => { const Y = HT[i], m = TP[i] * uk * .6;
      for (let k = 0; k < 30; k++) { const u = mx(.05, .95, Math.random()) * W - bf, v = mx(.08, .92, Math.random()) * H;
        const a = (u - c.cx) / c.f, b = -(v - c.cy) / c.f, dy = b * cs - sn, dz = b * sn + cs, tt = (Y - c.y) / dy; if (!(tt > .2 && tt < 30)) continue;
        const T = [c.x + tt * a, c.z + tt * dz], th = rm ? (Math.random() < .5 ? .15 : Math.PI - .15) + (Math.random() - .5) * .3 : Math.random() * Math.PI * 2, dd = [Math.cos(th), Math.sin(th)];
        const reach = sg => { let s = 0; while (s < 60 && inV(pr(c, T[0] + sg * dd[0] * s, Y, T[1] + sg * dd[1] * s))) s += .01 + s * .03; return s; };
        const s0 = reach(-1), s1 = reach(1), L = s0 + s1; if (L < .6) continue;
        const pts = []; for (let j = 0; j <= 24; j++) pts.push(pr(c, T[0] + dd[0] * (L * j / 24 - s0), Y, T[1] + dd[1] * (L * j / 24 - s0))); if (!clearOf(pts, m)) continue;
        return { X: T[0] - dd[0] * (s0 + .02), Y, Z: T[1] - dd[1] * (s0 + .02), th, v: cl(L / mx(16, 24, Math.random()), .02, .4) * VF[i], age: 0, seen: false, ph: Math.random() * 6.28, fc: 7 + Math.random() * 5, ft: Math.random() * 8 }; }
      return null; };
    const draw = [];
    for (let i = 0; i < N; i++) {
      let b = K.B[i]; if (!b) { if ((K.f + i * 7) % 12) continue; b = K.B[i] = spawn(i); if (!b) continue; }
      const wob = rm ? 0 : .1 * Math.sin(now * .09 + b.ph), thv = b.th + wob, turn = rm ? 0 : .1 * .09 * Math.cos(now * .09 + b.ph);
      b.X += Math.cos(thv) * b.v * dt; b.Z += Math.sin(thv) * b.v * dt; b.age += dt;
      const p = pr(c, b.X, b.Y, b.Z), vis = inV(p); if (vis) b.seen = true;
      if ((!vis && b.seen) || b.age > 60) { K.B[i] = null; continue; }
      if (p[2] < .08) continue;
      const pu = ppu(c, b.X, b.Y, b.Z), sp = TP[i] * uk * pu / K.ref[i], el = Math.atan2(c.y - b.Y, Math.hypot(b.X - c.x, b.Z - c.z)), wt = sm(.12, .55, el);
      const p2 = pr(c, b.X + Math.cos(thv) * .03, b.Y, b.Z + Math.sin(thv) * .03), rot = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
      const hit = K.box.some(r => p[0] + bf > r[0] - sp * .4 && p[0] + bf < r[2] + sp * .4 && p[1] > r[1] - sp * .3 && p[1] < r[3] + sp * .3);
      K.a[i] = mx(K.a[i] == null ? 1 : K.a[i], hit ? 0 : 1, .08);
      const tf = rm ? 99 : (now + b.ft) % b.fc, fl = tf < 2.1 ? Math.sin(tf / 2.1 * Math.PI * 2 * 2.5) * Math.sin(Math.PI * tf / 2.1) : 0, bk = cl(turn * 28, -.5, .5);
      const gx = b.X + S.sun[0] * b.Y * .4, gz = b.Z + S.sun[1] * b.Y * .4, ps = pr(c, gx, 0, gz), ps2 = pr(c, gx + Math.cos(thv) * .03, 0, gz + Math.sin(thv) * .03);
      draw.push({ p, rot, sp, fl, bk, al: K.a[i] * wt * gA, ps, rs: Math.atan2(ps2[1] - ps[1], ps2[0] - ps[0]), ks: ps[2] > .05 ? sp * ppu(c, gx, 0, gz) / pu * (1.04 - .14 * (b.Y - 1.28) / .46) : 0, Y: b.Y });
    }
    draw.forEach(g => { if (!(g.ks > 0) || g.al < .01) return; const hy = (g.Y - 1.28) / .46; x.save(); x.globalAlpha = g.al * mx(.3, .16, hy); x.fillStyle = '#3A2C24'; x.filter = `blur(${((1.2 + 2.6 * hy) * uk * 1.4).toFixed(2)}px)`; this.gullPath(x, g.ps[0], g.ps[1], g.rs, g.ks, g.fl, g.bk, true); x.restore(); });
    draw.forEach(g => { if (g.al < .01) return; x.save(); x.globalAlpha = g.al; this.gullPath(x, g.p[0], g.p[1], g.rot, g.sp, g.fl, g.bk, false); x.restore(); });
  }
  /* into the queen: one camera from the overhead board view, down to the crown, through its front arch into the arcade */
  qstate(t) {
    const st = this.st.sandboard, W = this.W, H = this.H, S = this.S6, ql = this.q5 && this.q5.ql; if (!S) return;
    const m = sm(.9, .97, lin(14.25, 16.55, t)), p = lin(QA, QB, t);
    st.qrot = (1 - m) * 2.4 + Math.sin(this.now * .25) * .25 * (1 - sm(0, .3, p));
    if (!(t > QA && t < QB)) { st.q = null; this.qs = null; this.S(ql, 'visibility', 'hidden'); return; }
    const a = W / H, fq = a < 1 ? 44 : 30, th0 = Math.tan(fq * Math.PI / 360), fv = sm(.5, 1, p), fov = mx(fq, this.fovW || fq, fv), th = Math.tan(fov * Math.PI / 360), oy = .06 * fv, cy0 = H / 2 + oy * H;
    const O = a < 1 ? [26, 8.5, .3] : [18.5, 9.4, 0], S1 = a < 1 ? [4.4, .8] : [3.5, -.35];
    const A = [QX, QY + QS * YC, QZ + QS * QR(YC)], dE = Math.min(.07 / th0, .12 / (th0 * a));
    const pol = (y, z) => [Math.hypot(y - A[1], z - A[2]), Math.atan2(y - A[1], z - A[2])], [dO, eO] = pol(O[0], O[1]), [d1, e1] = pol(S1[0], S1[1]);
    const u1 = sm(0, .3, p), u2 = sm(.24, .66, p), u3 = sm(.58, 1, p);
    const d = Math.exp(Math.log(dO) + (Math.log(d1) - Math.log(dO)) * u1 + (Math.log(dE) - Math.log(d1)) * u2) - (dE + .14) * u3, el = eO + (e1 - eO) * u1 - e1 * u2;
    const xq = QX * u1, C = [xq, A[1] + d * Math.sin(el), A[2] + d * Math.cos(el)], LO = [0, 0, O[2]], L1 = [0, .78, QZ], L2 = [0, A[1], A[2] - 1];
    const L = [0, 1, 2].map(i => LO[i] + (L1[i] - LO[i]) * u1 + (L2[i] - L1[i]) * u2); L[0] = xq;
    let fy = L[1] - C[1], fz = L[2] - C[2]; const fl = Math.hypot(fy, fz); fy /= fl; fz /= fl; const fp = H / 2 / th;
    const prj = V3 => { const dx = V3[0] - C[0], dy = V3[1] - C[1], dz = V3[2] - C[2], z = dy * fy + dz * fz; return [W / 2 + dx / z * fp, cy0 - (-dy * fz + dz * fy) / z * fp, z]; };
    const g = 1 + 3 * sm(.55, .8, p), w = .016 * g, h = .035 * g, cr = Math.cos(st.qrot), sr = Math.sin(st.qrot), ol = [];
    const pt = (px, y) => { const ly = YC + y, rr = Math.max(QR(ly), .2), an = Math.PI / 2 + px / rr, lx = rr * Math.cos(an), lz = rr * Math.sin(an); return prj([QX + QS * (lx * cr + lz * sr), QY + QS * ly, QZ + QS * (-lx * sr + lz * cr)]); };
    for (let i = 0; i <= 6; i++) ol.push(pt(-w + 2 * w * i / 6, -h));
    for (let i = 1; i <= 6; i++) ol.push(pt(w, -h + (2 * h - w) * i / 6));
    for (let i = 1; i < 14; i++) { const an = Math.PI * i / 14; ol.push(pt(w * Math.cos(an), h - w + w * Math.sin(an))); }
    for (let i = 0; i <= 6; i++) ol.push(pt(-w, h - w - (2 * h - w) * i / 6));
    let hole = null, clip = 'none', hc = [W / 2, H / 2], sc = null;
    if (ol.every(v => v[2] > .02)) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; ol.forEach(v => { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); });
      if (!(x0 < 0 && y0 < 0 && x1 > W && y1 > H)) { const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; hc = [cx, cy];
        clip = `polygon(${ol.map(v => `${(cx + (v[0] - cx) * 1.12).toFixed(1)}px ${(cy + (v[1] - cy) * 1.12).toFixed(1)}px`).join(',')})`; hole = [cx / W, 1 - cy / H, (x1 - x0) * .75 / W, (y1 - y0) * .75 / H];
        // the arch's screen rect: while the hall is only seen through it, the arcade renders just this scissor
        sc = [Math.max(0, Math.floor(cx + (x0 - cx) * 1.12) - 2), Math.max(0, Math.floor(cy + (y0 - cy) * 1.12) - 2), Math.min(W, Math.ceil(cx + (x1 - cx) * 1.12) + 2), Math.min(H, Math.ceil(cy + (y1 - cy) * 1.12) + 2)]; } }
    /* the arcade lives behind the crown arch: queen-local space -> arcade space (rotation + uniform scale), so both renders share one camera */
    const loc = P3 => { const dx = (P3[0] - QX) / QS, dy = (P3[1] - QY) / QS, dz = (P3[2] - QZ) / QS; return [dx * cr - dz * sr, dy, dx * sr + dz * cr]; };
    const toA = P3 => { const l = loc(P3); return [-l[0] * AK, (l[1] - YC + .14) * AK, (QR(YC) - l[2]) * AK + ZE]; };
    const lz = loc(C)[2], R0 = QR(YC), pass = lz < R0 + .012, inside = lz < R0 * .92 - .004; if (inside) { clip = 'none'; sc = null; }
    const c6 = { x: S.Xb + C[0] * S.q, y: C[1] * S.q, z: S.Zb - C[2] * S.q, ph: Math.atan2(C[1] - L[1], C[2] - L[2]), f: fp, cx: W / 2, cy: cy0 };
    st.q = { cam: { C, L }, fov, oy, near: cl(Math.abs(d) * .25, .004, .1), warm: lin(.46, .7, p), open: g, openP: sm(.6, .9, p), hole: hole || [.5, .5, 9, 9], slide: p, split: true, pass };
    this.qs = { p, c6, clip, sc, hc, blur: 12 * sm(.12, .55, p), inside, a: { C: toA(C), L: toA(L), fov, oy } };
    this.S(ql, 'visibility', inside ? 'hidden' : 'visible');
  }
  proj6(cm) {
    const W = this.W, H = this.H, C = cm.C, L = cm.L; let f = [L[0] - C[0], L[1] - C[1], L[2] - C[2]]; const fl = Math.hypot(f[0], f[1], f[2]); f = f.map(v => v / fl);
    let r = [-f[2], 0, f[0]]; const rl = Math.hypot(r[0], r[2]) || 1; r = [r[0] / rl, 0, r[2] / rl];
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]], Fp = H / 2 / Math.tan(cm.fov * Math.PI / 360), cy = H / 2 + cm.oy * H;
    return (X, Y, Z) => { const d0 = X - C[0], d1 = Y - C[1], d2 = Z - C[2], z = d0 * f[0] + d1 * f[1] + d2 * f[2]; return [W / 2 + (d0 * r[0] + d1 * r[1] + d2 * r[2]) / z * Fp, cy - (d0 * u[0] + d1 * u[1] + d2 * u[2]) / z * Fp, z, Fp / z]; };
  }
  w6(t) {
    const W = this.W, H = this.H, q = this.q6, n = this.n; if (!q) return;
    const hy = this.hy6, Q = this.qs, a8 = this.st.arcade8, cz = pathc(t);
    const cm = Q && Q.a ? Q.a : { C: [0, 1, cz], L: [0, 1, cz + 1], fov: this.fovW, oy: .06 }; a8.cam = cm; a8.sc = Q && Q.clip !== 'none' ? Q.sc : null; const pj = this.proj6(cm);
    this.S(q.cam, 'transform', 'none'); this.S(q.world, 'clipPath', Q ? Q.clip : 'none'); this.S(q.world, 'webkitMaskImage', 'none'); this.S(q.world, 'maskImage', 'none');
    this.S(q.plate, 'visibility', a8.ready ? 'hidden' : 'visible');
    const dt = Math.min(.1, Math.max(0, this.now - (this._n6 || this.now))); this._n6 = this.now;
    this.fEls.forEach((el, i) => {
      const co = this.companies[i], fs = this.fst[i]; if (!fs) return;
      const pr = pj(-this.px6[i], 0, CZ[i]), dz = pr[2];
      this.fBox = this.fBox || []; this.fBox[i] = null;
      if (dz < .3) { this.S(el, 'visibility', 'hidden'); this.mv['card' + i] = 0; return; }
      const s = pr[3], k = s * this.pw6 / 300, X = pr[0], Yb = pr[1]; this.fBox[i] = [X - 190 * k, Yb - 700 * k, X + 190 * k, Yb];
      this.S(el, 'visibility', 'visible');
      this.S(el, 'transform', `translate(${(X - 150 * k).toFixed(1)}px,${(Yb - 600 * k).toFixed(1)}px) scale(${k.toFixed(4)})`); this.S(el, 'zIndex', String(Math.max(1, Math.round(1000 - dz * 10))));
      const R = sm(4.9, 3.2, dz), hcY = co.stand ? 99 : 227, tY = co.stand ? -26 : 102, N = fs.th.length;
      fs.ph += dt * ((1 - R) * 1.1 + .04);
      fs.th.forEach((te, j) => { const a = j / N * Math.PI * 2 + fs.ph * (.7 + (j % 3) * .25) * (j % 2 ? 1 : -1), rad = 80 + Math.sin(fs.ph * 1.7 + j * 1.3) * 34, ej = sm(j * .025, .5 + j * .035, R);
        const ox = 150 + Math.cos(a) * rad * 1.5 - 46, oy = hcY - 12 + Math.sin(a) * rad * .95 - 46;
        const px = mx(ox + 46, 150, ej) - 46, py = mx(oy + 46, tY, ej) - 46;
        this.S(te, 'transform', `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) rotate(${((fs.ph * 1.5 + j) * (1 - ej)).toFixed(2)}rad) scale(${mx(1, .15, ej).toFixed(3)})`); this.S(te, 'opacity', (1 - sm(.75, 1, ej)).toFixed(3)); });
      const rs = sm(.55, 1, R); fs.hv = mx(fs.hv, this.fHover[i] ? 1 : 0, .06);
      this.S(fs.res, 'opacity', sm(.45, .8, R).toFixed(3));
      this.S(fs.turn, 'transform', `translateY(${(Math.sin(this.now * 1.1 + i) * 4).toFixed(1)}px) rotateY(${(Math.sin(this.now * .7) * (4 + fs.hv * 30)).toFixed(1)}deg) scale(${(mx(.3, 1, rs) * (1 + fs.hv * .08)).toFixed(3)})`);
      if (fs.orbs.length) { fs.orb += dt * (.4 + fs.hv * 1.6); fs.orbs.forEach((p, j) => { const a = fs.orb * (1.6 - j * .4) + j * 2.1, rx = j ? 70 : 46, ry = j ? 20 : 13; this.S(p, 'transform', `translate(${(90 + Math.cos(a) * rx - 12).toFixed(1)}px,${(90 + Math.sin(a) * ry - 12).toFixed(1)}px)`); this.S(p, 'zIndex', Math.sin(a) > 0 ? '2' : '0'); }); }
      this.S(fs.head, 'transform', `rotate(${((1 - R) * 7 - R * 4).toFixed(2)}deg)`);
      this.S(fs.body, 'transform', `rotate(${((1 - R) * .8).toFixed(2)}deg) scaleY(${(1 - (1 - R) * .014).toFixed(4)})`);
      this.mv['card' + i] = sm(3.9, 3.1, dz) * sm(1.0, 1.6, dz);
      if (!n) { const gx = this.gutter(); this.pos['card' + i] = X < W / 2 ? [W - gx - 280, 'mid'] : [gx, 'mid']; }
    });
    /* the door ends the hall from the first frame: closed, edge-lit (brighter per founder passed); after the last founder it swings inward with scroll.
       Frame, jambs, step and the door's light are 3D (scene3d); the painted wood leaf is perspective-mapped onto its hinge here. */
    { const rc = this.q7 && this.q7.rcv; if (rc && this.room) a8.room = { cv: rc, v: rc._pv || 0, rk: [this.F6 / W, this.F6 / H, this.hy6 / H, pathc(99)], b: this.room.b }; }
    const op = sm(21.5, 22.3, t), sw = sm(21.5, 22.3, t), th = sw * DSW; a8.door = [th, op, sw];
    if (!this._dcv && q.leaf) { const cv = q.leaf.querySelector('[data-leafcv]'); if (cv) { this.paintDoor(cv); this._dcv = cv; } } a8.leafCv = this._dcv || null; a8.leafOn = t < 22.9;
    this.d6 = { cz: cm.C[2] }; this.gap = null; this.gapPoly = null;
    const P = (x, y, z) => { const p = pj(x, y, z); return p[2] > .02 ? p : null; };
    /* the room fills the opening from the frame's front edge, so its walls, ceiling and floor meet the jambs, lintel and threshold edge to edge */
    const ZR = DZF, fo = [P(-DHW, DHH, ZR), P(DHW, DHH, ZR), P(DHW, DTS, ZR), P(-DHW, DTS, ZR)], lq = this.leafQuad(P, th);
    /* measured at the back of the frame (DZF), so the clip stays valid while the camera passes the door plane on its way to the hand-off */
    if (fo.every(Boolean)) {
      const fx = fo.map(p => p[0]), fy = fo.map(p => p[1]); this.gap = [Math.min(...fx), Math.min(...fy), Math.max(...fx), Math.max(...fy)];
      this.S(q.door, 'visibility', 'hidden'); this.S(q.leafw, 'visibility', 'hidden');
      /* the room (world 7) shows through the back of the doorway minus whatever the leaf still covers */
      if (sw > 0) {
        const G = this.gap, pth = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
        let leaf = lq.every(Boolean) ? lq.map(p => [p[0], p[1]]) : null;
        if (leaf) [[0, G[0], 1], [0, G[2], -1], [1, G[1], 1], [1, G[3], -1]].forEach(([k, v, sg]) => { if (!leaf || !leaf.length) return; const o = []; for (let i = 0; i < leaf.length; i++) { const A = leaf[i], B = leaf[(i + 1) % leaf.length], ia = (A[k] - v) * sg >= 0, ib = (B[k] - v) * sg >= 0; if (ia) o.push(A); if (ia !== ib) { const u = (v - A[k]) / (B[k] - A[k]); o.push([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u]); } } leaf = o; });
        this.gapPoly = `path(evenodd, "${pth(fo)}${leaf && leaf.length > 2 ? ' ' + pth(leaf) : ''}")`;
      }
    }
    else { this.S(q.door, 'visibility', 'hidden'); this.S(q.leafw, 'visibility', 'hidden'); }
    this.S(q.train, 'transform', `translate(${(((this.now * 22) % (W * 1.5)) - W * .25).toFixed(1)}px,${(hy - 10).toFixed(1)}px)`);
  }
  /* door leaf: hinge on the screen-left jamb (world +x), swings inward; 4 projected corners: hinge-top, free-top, free-bottom, hinge-bottom */
  leafQuad(P, th) { const c = Math.cos(th), s = Math.sin(th), L = 2 * DHW + .009, x0 = DHW + .012, y0 = DHH - .003, y1 = DTS + .003, lp = (u, v) => P(x0 - u * L * c, y0 - v * (y0 - y1), DZL + u * L * s); return [lp(0, 0), lp(1, 0), lp(1, 1), lp(0, 1)]; }
  h3d(w, h, p) { const [x0, y0] = p[0], [x1, y1] = p[1], [x2, y2] = p[2], [x3, y3] = p[3];
    const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1 || 1e-9;
    const g = (sx * dy2 - dx2 * sy) / den, k = (dx1 * sy - sx * dy1) / den, a = (x1 - x0 + g * x1) / w, b = (x3 - x0 + k * x3) / h, d = (y1 - y0 + g * y1) / w, e = (y3 - y0 + k * y3) / h;
    return 'matrix3d(' + [a, d, 0, g / w, b, e, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].map(v => +v.toPrecision(9)).join(',') + ')'; }
  leafPose(el, lq, sw) { if (!el) return; if (!lq || !lq.every(Boolean)) { this.S(el, 'visibility', 'hidden'); return; }
    if (!el._k) { el._k = { lsh: el.querySelector('[data-lsh]'), lsh2: el.querySelector('[data-lsh2]'), ldk: el.querySelector('[data-ldk]') }; this.paintDoor(el.querySelector('[data-leafcv]')); }
    this.S(el, 'visibility', 'visible'); this.S(el, 'transform', this.h3d(480, 944, lq));
    const K = el._k, sh = (1 - sm(0, .35, sw)).toFixed(3); this.S(K.lsh, 'opacity', sh); this.S(K.lsh2, 'opacity', sh); this.S(K.ldk, 'opacity', (.06 + .3 * sm(0, .6, sw)).toFixed(3)); }
  room7(q, on) { if (q._r7 === on) return; q._r7 = on; if (q.rcv) q.rcv.style.visibility = on ? 'hidden' : ''; q.world.style.background = on ? 'transparent' : '#E6DCCB';
    if (!on && q.lay) q.lay.forEach(([el]) => { this.S(el, 'translate', 'none'); this.S(el, 'scale', 'none'); }); }
  leafB() { const q = this.q7; if (!q || !q.leafB) return; const on = false; this.S(q.leafBw, 'visibility', on ? 'visible' : 'hidden'); if (!on) return;
    if (!this._lqB) { const z = pathc(99), pj = this.proj6({ C: [0, 1, z], L: [0, 1, z + 1], fov: this.fovW, oy: .06 }); this._lqB = this.leafQuad((x, y, zz) => { const p = pj(x, y, zz); return p[2] > .02 ? p : null; }, DSW); }
    this.S(q.leafBw, 'transform', this.cam7 || 'none'); this.leafPose(q.leafB, this._lqB, 1);
    if (!this._spB) { const z = pathc(99), pj = this.proj6({ C: [0, 1, z], L: [0, 1, z + 1], fov: this.fovW, oy: .06 }); this._spB = (x, y, zz) => { const p = pj(x, y, zz); return p[2] > .02 ? p : null; }; } this.stopPose(q.leafBw, this._spB); }
  /* small brass doorstop on the inside wall where the open leaf lands */
  stopPose(wrap, P) { const el = wrap && (wrap._st || (wrap._st = wrap.querySelector('[data-dstop]'))); if (!el) return; const p = P(DSTOP[0], DSTOP[1], DSTOP[2]); if (!p) { this.S(el, 'visibility', 'hidden'); return; }
    this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${(p[0] - 10).toFixed(1)}px,${(p[1] - 12).toFixed(1)}px) scale(${(p[3] * .07 / 20).toFixed(4)})`); }
  paintDoor(cv) { if (!cv) return; const W = 480, H = 944, x = cv.getContext('2d'); let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const grain = (x0, y0, w, h, vert, n) => { x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip();
      for (let i = 0; i < n; i++) { const o = r() * (vert ? w : h), a = 1 + r() * 4, f = .004 + r() * .01, ph = r() * 6.28, dk = r() < .62, L = vert ? h : w;
        x.strokeStyle = dk ? `rgba(22,12,7,${(.12 + r() * .3).toFixed(3)})` : `rgba(112,74,46,${(.08 + r() * .18).toFixed(3)})`; x.lineWidth = .5 + r() * 2.2; x.beginPath();
        for (let q = 0; q <= L + 6; q += 6) { const dd = o + Math.sin(q * f + ph) * a + Math.sin(q * f * 3.7 + ph * 2) * a * .3; vert ? x.lineTo(x0 + dd, y0 + q) : x.lineTo(x0 + q, y0 + dd); } x.stroke(); }
      x.restore(); };
    const poly = (pts, col) => { x.fillStyle = col; x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.closePath(); x.fill(); };
    const rr = (X, Y, w, h, rad) => { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, rad); else x.rect(X, Y, w, h); x.fill(); };
    x.fillStyle = '#3B2518'; x.fillRect(0, 0, W, H); grain(0, 0, W, H, true, 340);
    const sx = W * .15, mc = [W * .475, W * .525], rt = H * .09, rm = [H * .47, H * .53], rb = H * .86;
    [[sx, 0, W - 2 * sx, rt], [sx, rm[0], W - 2 * sx, rm[1] - rm[0]], [sx, rb, W - 2 * sx, H - rb]].forEach(([a, b, c, d]) => { x.fillStyle = '#3A2417'; x.fillRect(a, b, c, d); grain(a, b, c, d, false, 46); x.fillStyle = 'rgba(15,8,4,.55)'; x.fillRect(a, b, 1.5, d); x.fillRect(a + c - 1.5, b, 1.5, d); });
    [[sx, rt, mc[0], rm[0]], [mc[1], rt, W - sx, rm[0]], [sx, rm[1], mc[0], rb], [mc[1], rm[1], W - sx, rb]].forEach(([a, b, c, d]) => { const bv = 20, ia = a + 3, ib = b + 3, ic = c - 3, id = d - 3;
      x.fillStyle = 'rgba(12,6,3,.8)'; x.fillRect(a, b, c - a, d - b); x.fillStyle = '#3F281A'; x.fillRect(ia, ib, ic - ia, id - ib); grain(ia, ib, ic - ia, id - ib, true, 40);
      poly([[ia, ib], [ic, ib], [ic - bv, ib + bv], [ia + bv, ib + bv]], 'rgba(255,214,160,.30)'); poly([[ia, id], [ic, id], [ic - bv, id - bv], [ia + bv, id - bv]], 'rgba(8,4,2,.42)');
      poly([[ia, ib], [ia + bv, ib + bv], [ia + bv, id - bv], [ia, id]], 'rgba(255,214,160,.10)'); poly([[ic, ib], [ic - bv, ib + bv], [ic - bv, id - bv], [ic, id]], 'rgba(8,4,2,.25)');
      x.fillStyle = 'rgba(255,228,184,.6)'; x.fillRect(ia + bv, ib + bv - 1, ic - ia - 2 * bv, 1.6); x.fillStyle = 'rgba(255,220,170,.38)'; x.fillRect(ia, ib, ic - ia, 1.4);
      x.fillStyle = 'rgba(8,4,2,.35)'; x.fillRect(ia + bv, id - bv, ic - ia - 2 * bv, 1.4); });
    let g2 = x.createLinearGradient(0, 0, W, 0); g2.addColorStop(0, 'rgba(10,5,2,.35)'); g2.addColorStop(.06, 'rgba(10,5,2,0)'); g2.addColorStop(.94, 'rgba(10,5,2,0)'); g2.addColorStop(1, 'rgba(10,5,2,.35)'); x.fillStyle = g2; x.fillRect(0, 0, W, H);
    g2 = x.createLinearGradient(0, H * .82, 0, H); g2.addColorStop(0, 'rgba(10,5,2,0)'); g2.addColorStop(1, 'rgba(10,5,2,.42)'); x.fillStyle = g2; x.fillRect(0, H * .82, W, H * .18);
    [H * .13, H * .5, H * .85].forEach(y => { x.fillStyle = '#17110D'; x.fillRect(0, y - 26, 15, 52); x.fillStyle = 'rgba(170,150,120,.35)'; x.fillRect(0, y - 26, 15, 1.5); });
    const hx = W * .925, hy = H * .5; x.fillStyle = 'rgba(8,4,2,.45)'; rr(hx - 13, hy - 46, 30, 104, 10);
    let g = x.createLinearGradient(hx - 12, 0, hx + 12, 0); g.addColorStop(0, '#7A5A24'); g.addColorStop(.4, '#D9B860'); g.addColorStop(1, '#6E4F1E'); x.fillStyle = g; rr(hx - 12, hy - 50, 24, 100, 9);
    x.fillStyle = 'rgba(8,4,2,.4)'; x.beginPath(); x.arc(hx + 2, hy + 4, 17, 0, 7); x.fill();
    g = x.createRadialGradient(hx - 5, hy - 6, 1, hx, hy, 17); g.addColorStop(0, '#FFF3C8'); g.addColorStop(.25, '#E6C66C'); g.addColorStop(.7, '#9A7430'); g.addColorStop(1, '#4E3814'); x.fillStyle = g; x.beginPath(); x.arc(hx, hy, 16, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,250,232,.95)'; x.beginPath(); x.arc(hx - 6, hy - 7, 2.6, 0, 7); x.fill();
    x.fillStyle = '#1A1006'; x.beginPath(); x.arc(hx, hy + 30, 3.4, 0, 7); x.fill(); x.fillRect(hx - 1.5, hy + 30, 3, 10); }
  /* card 05 sits under the window: if its top would come within 24px of the frame and sill, lower it just enough (only that card, only when needed) */
  fitK5(q) { const i = KEEP.findIndex(k => k.n === '05'), el = q.world.querySelectorAll('[data-keep]')[i], w = this.win0; if (!el || !w) return;
    if (el.dataset.y0 == null) el.dataset.y0 = el.style.top; el.style.top = el.dataset.y0;
    const y = el.offsetTop, h = el.offsetHeight, x = el.offsetLeft, hw = el.offsetWidth / 2; if (!h) return false;
    const need = w[3] + 14 + 12 + 24 + 12, top = y - h; if (x + hw > w[0] - 52 && x - hw < w[2] + 52 && top < need) el.style.top = (y + need - top) + 'px'; q.lay = null; return true; }
  w7(t) {
    const W = this.W, H = this.H, q = this.q7; if (!q) return;
    { const key = W + 'x' + H + (document.fonts ? document.fonts.status : ''); if (q._k5 !== key && this.fitK5(q) !== false) q._k5 = key; }
    const g = this.gap, d6 = this.d6;
    this.room7(q, t < 22.9 && !!this.st.arcade8.roomOK);
    if (t < 22.9) {
      this.leafB(t);
      q.world.style.clipPath = g && this.gapPoly ? this.gapPoly : 'polygon(0 0,0 0,0 0)'; if (!g || !d6) return;
      /* each room layer sits at its own depth behind the doorway (from where it meets the floor), so it grows with true perspective as the camera walks in */
      if (!q.lay) { const ks = q.world.querySelectorAll('[data-keep]'); if (ks.length) { q.lay = []; const add = (el, yb) => { if (!el || el.style.display === 'none') return; el.style.transformOrigin = '0 0'; q.lay.push([el, el.offsetLeft, el.offsetTop, yb(el)]); };
        add(q.world.querySelector('[data-3d="roomqueen"]'), e => e.offsetTop + e.offsetHeight * (this.n ? .78 : .895)); if (this.n) add(q.world.querySelector('[data-table]'), e => e.offsetTop + e.offsetHeight); ks.forEach(e => add(e, e => e.offsetTop)); } }
      const F = this.F6, cy = this.hy6, cx = W / 2, dl = Math.max(0, pathc(99) - d6.cz), deB = .93 * F / Math.max(1, this.room.b[3] * H - cy);
      const kd = yb => { const De = Math.min(deB, .93 * F / Math.max(1, yb - cy)); return De / (De + dl); }, kb = kd(this.room.b[3] * H), A = [cx * (1 - kb), cy * (1 - kb)];
      this.cam7 = `translate(${A[0].toFixed(1)}px,${A[1].toFixed(1)}px) scale(${kb.toFixed(4)})`; this.S(q.cam, 'transform', this.cam7);
      (q.lay || []).forEach(([el, ox, oy, yb]) => { const r = kd(yb) / kb; this.S(el, 'translate', `${((1 - r) * (cx - ox)).toFixed(1)}px ${((1 - r) * (cy - oy)).toFixed(1)}px`); this.S(el, 'scale', r.toFixed(4)); });
      const w = this.win0; this.win = [A[0] + w[0] * kb, A[1] + w[1] * kb, A[0] + w[2] * kb, A[1] + w[3] * kb]; return;
    }
    q.world.style.clipPath = 'none';
    const e6 = sm(21.9, 22.9, t), dol = lin(22.9, 24.1, t), e7 = sm(24.1, 25.1, t), C = [W / 2, H / 2];
    const z0 = mx(1.3, 1, e6) * (1 + dol * .05), pane = this.pane;
    const w0 = [C[0] + (pane.x - C[0]) * z0, C[1] + (pane.y - C[1]) * z0], Sm = Math.pow(pane.z / 1.05, e7);
    const z = z0 * Sm, A = [0, 1].map(k => w0[k] + (C[k] * (1 - z0) - w0[k]) * Sm + (C[k] - w0[k]) * e7);
    this.cam7 = `translate(${A[0].toFixed(1)}px,${A[1].toFixed(1)}px) scale(${z.toFixed(4)})`;
    this.S(q.cam, 'transform', this.cam7); this.leafB(t);
    const w = this.win0; this.win = [A[0] + w[0] * z, A[1] + w[1] * z, A[0] + w[2] * z, A[1] + w[3] * z];
  }
  w8(t) {
    const W = this.W, H = this.H, q = this.q8, g = this.g8, P = window.Painter; if (!q) return;
    let w = this.win; if (t < 22.9) { const g = this.gap; w = t >= 22.3 && g && w ? [Math.max(w[0], g[0]), Math.max(w[1], g[1]), Math.min(w[2], g[2]), Math.min(w[3], g[3])] : null; if (!w || w[2] - w[0] < 1 || w[3] - w[1] < 1) w = [0, 0, 0, 0]; } else if (t < 24.1 && !w) w = [0, 0, 0, 0]; if (t < 24.1 && this.n) w = [0, 0, 0, 0]; this.S(q.world, 'opacity', t < 24.1 ? sm(22.9, 23.25, t).toFixed(3) : '1'); q.world.style.clipPath = t < 25.1 && w ? `polygon(${w[0].toFixed(1)}px ${w[1].toFixed(1)}px,${w[2].toFixed(1)}px ${w[1].toFixed(1)}px,${w[2].toFixed(1)}px ${w[3].toFixed(1)}px,${w[0].toFixed(1)}px ${w[3].toFixed(1)}px)` : 'none';
    const e7 = sm(24.1, 25.1, t), z = mx(1.22, 1, e7), foot = sm(27.7, 28.5, t), ty = -H * .36 * foot - H * .06 * (1 - e7), tx = (this.winDx || 0) * (1 - e7);
    this.S(q.cam, 'transform', `translate(${(W / 2 * (1 - z) + tx).toFixed(1)}px,${(H / 2 * (1 - z) + ty).toFixed(1)}px) scale(${z.toFixed(4)})`);
    const fm = this._rm ? 0 : 1; this.S(q.moon, 'transform', `translate(${(this.moon0[0] + (this.mx || 0) * 12 * fm).toFixed(1)}px,${(this.moon0[1] + (this.my || 0) * 8 * fm).toFixed(1)}px)`);
    const v8 = this._rm ? 0 : cl(-(t - 26.6) * H * .03, -H * .08, H * .08);
    q.n8c.forEach((cv, i) => { const L = this.decks.n8 && this.decks.n8[i]; if (L) this.S(cv, 'transform', `translate(${this.drift(i).toFixed(1)}px,${(v8 * this.pf(L.f)).toFixed(1)}px)`); });
    const rO = lin(26.2, 26.66, t), rC = lin(27.55, 28.05, t), rp = rC > 0 ? 1 - rC : rO;
    if (rp > 0) {
      if (this._k8 == null || Math.abs(rp - this._k8) > .0015 || (rp === 1 && this._k8 !== 1)) { this._k8 = rp; const TA = this.tearAt(rp);
        if (TA) { const cp = `path(evenodd, "M0 0H${W}V${H * 1.5}H0Z ${P.toPath(TA.out)}")`; q.plate.style.clipPath = cp; if (q.ncl) q.ncl.style.clipPath = cp;
          const rc = q.rimcv; if (rc) { const T = this.ctear, d = Math.min(2, devicePixelRatio || 1), Tq = { pat: T.pat, fib: T.fib, curls: T.curls, off: T.off.map((o, i) => o * (TA.e[i] || 0)) };
            rc.style.transform = 'none'; rc.style.visibility = 'visible'; try { P.tearRim6(rc.getContext('2d'), TA.inn, TA.out, Tq, g.cx, g.cy, d); } catch { /* keep the last rim */ } T.pat = Tq.pat; } } }
    } else if (this._k8 !== 0) { this._k8 = 0; q.plate.style.clipPath = 'none'; if (q.ncl) q.ncl.style.clipPath = 'none'; if (q.rimcv) q.rimcv.style.visibility = 'hidden'; }
    /* the letter slides out once the tear is fully open, and back in before it closes */
    const now = this.now || 0, TP = this.tip, AE = this.armEls, red = this.red(), eo = x => 1 - Math.pow(1 - x, 3);
    this._hv = mx(this._hv || 0, this._chov ? 1 : 0, .14); const hv = this._hv < .002 ? 0 : this._hv;
    const sl = rp >= 1 ? Math.min(eo(lin(26.66, 26.9, t)), eo(1 - lin(27.3, 27.54, t))) : 0, on = sl > .001;
    const ox = W / 2 * (1 - z), oy = H / 2 * (1 - z) + ty;
    if (TP && AE) {
      const u = 1 - sl, ho = 14 * hv * sl, kt = mx(1, TP.ks, u), Pt = [TP.P[0] + TP.V[0] * u + TP.aS[0] * ho, TP.P[1] + TP.V[1] * u + TP.aS[1] * ho], Kt = [TP.Kw[0] + TP.V[0] * u + TP.aS[0] * ho, TP.Kw[1] + TP.V[1] * u + TP.aS[1] * ho];
      const sw = red ? 0 : .6 * Math.sin(now * Math.PI / 2), s = TP.sc * kt * (1 + .015 * hv), rd = TP.r * 180 / Math.PI;
      const M = `translate(${Kt[0].toFixed(1)}px,${Kt[1].toFixed(1)}px) rotate(${sw.toFixed(3)}deg) translate(${(Pt[0] - Kt[0]).toFixed(1)}px,${(Pt[1] - Kt[1]).toFixed(1)}px) rotate(${rd.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      const camT = `translate(${ox.toFixed(1)}px,${oy.toFixed(1)}px) scale(${z.toFixed(4)})`, vv = on ? 'visible' : 'hidden';
      AE.wraps.forEach((e, i) => { this.S(e, 'visibility', i < 2 ? vv : (on ? 'visible' : 'hidden')); this.S(e, 'opacity', i < 2 ? '1' : sm(0, .2, sl).toFixed(3)); this.S(e, 'transform', camT); });
      AE.movers.forEach(e => this.S(e, 'transform', M));
      this.cardT = camT + ' ' + M;
      if (on) { const a = (TP.r + sw * Math.PI / 180), ca = Math.cos(a), sa = Math.sin(a), sr = sw * Math.PI / 180, O = [Kt[0] + (Pt[0] - Kt[0]) * Math.cos(sr) - (Pt[1] - Kt[1]) * Math.sin(sr), Kt[1] + (Pt[0] - Kt[0]) * Math.sin(sr) + (Pt[1] - Kt[1]) * Math.cos(sr)];
        const cp = this.exitClip(([x, y]) => { const dx = x - O[0], dy = y - O[1]; return [(dx * ca + dy * sa) / s, (-dx * sa + dy * ca) / s]; }); if (cp !== this._cardClip && this.cardEl) { this._cardClip = cp; this.cardEl.style.clipPath = cp; } }
    }
    if (this.cardSheen) this.S(this.cardSheen, 'opacity', (hv * .9).toFixed(3));
    this.mv.ccard = on ? 1 : 0;
    this.S(q.refl, 'transform', `translateX(${(Math.sin(this.now * .7) * 5).toFixed(1)}px)`);
  }
  dovePos(k, t) {
    const B = this.B, t0 = 4.2 + k * .09, u = lin(t0, t0 + .95, t); if (!B || u <= 0 || u >= 1) return null;
    const a = [-2.55, -1.85, -1.15, -.45, .35][k], R = Math.max(this.W, this.H) * 1.05, e = Math.pow(u, 1.7);
    return [B.x + Math.cos(a) * R * e, B.y + Math.sin(a) * R * e * .8 - u * this.H * .1, .3 + u * u * 3.4, Math.cos(a) < 0 ? -1 : 1];
  }
  carry(t) {
    this.dvEls.forEach((el, k) => { const p = this.dovePos(k, t); if (!p) { this.S(el, 'visibility', 'hidden'); [...el.children].forEach(c => this.S(c, 'visibility', 'hidden')); return; } const up = ((this.now * 7 + k * .37) | 0) % 2;
      this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) scale(${(p[2] * p[3]).toFixed(3)},${p[2].toFixed(3)})`); this.S(el, 'filter', p[2] > 2.2 ? `blur(${((p[2] - 2.2) * 1.5).toFixed(1)}px)` : 'none');
      const cs = el.children; if (cs[0]) this.S(cs[0], 'visibility', up ? 'visible' : 'hidden'); if (cs[1]) this.S(cs[1], 'visibility', up ? 'hidden' : 'visible'); });
    const wc = this.q7 && this.q7.wincam; if (wc) { const v = t >= 21.4 && t < 25.1 && this.cam7; let wo = 1; if (v && t < 22.9) { const g = this.gap, w = this.win; if (g && w) { const ia = Math.max(0, Math.min(w[2], g[2]) - Math.max(w[0], g[0])) * Math.max(0, Math.min(w[3], g[3]) - Math.max(w[1], g[1])), wa = Math.max(1, (w[2] - w[0]) * (w[3] - w[1])); wo = ia / wa > .995 || (!this.n && t >= 22.3 && ia > 0) ? 1 : 0; } else wo = 0; }
      this.S(wc, 'opacity', wo.toFixed(3)); { const sk = this.q7.winsky || (this.q7.winsky = this.$('[data-winsky]')), u = Math.max(0, Math.min(1, (t - 24.1) / .35)); if (sk) this.S(sk, 'opacity', (1 - u * u * (3 - 2 * u)).toFixed(3)); } this.S(wc, 'visibility', v && wo > 0 ? 'visible' : 'hidden'); if (v) { this.S(wc, 'transform', this.cam7); wc.parentElement.style.clipPath = this.wEl[6].style.clipPath; } }
  }
  introK() { if (!this._introT0) return 0; return lin(0, 1.6, (performance.now() - this._introT0) / 1000); }
  /* text reveal: headline lines rise 12px and fade in over 600ms, 80ms apart; body and labels fade 150ms after the last line; out plays the same in reverse */
  seqOf(b) { const RM = this._rm, hw = [], bw = []; b.w.forEach(w => (w.closest('[data-hl]') ? hw : bw).push(w)); const it = [];
    let li = -1, top = null, par = null; hw.forEach(w => { const h = w.closest('[data-hl]'), y = w.offsetTop; if (h !== par || top === null || Math.abs(y - top) > 4) { li++; top = y; par = h; } it.push({ w, s: RM ? 0 : li * 80, d: RM ? 300 : 600, y: !RM }); });
    const nl = li + 1, he = nl ? (nl - 1) * 80 + 600 : 0, bs = RM ? 0 : (nl ? he + 150 : 0); bw.forEach(w => it.push({ w, s: bs, d: RM ? 300 : 600, y: false }));
    b.seq = it; b.T = Math.max(1, ...it.map(e => e.s + e.d)); if (b.k == null) b.k = 0; b.k = Math.min(b.k, b.T); }
  copy(t) {
    const ik = this.introK(), now = performance.now(), dt = Math.min(100, Math.max(0, now - (this._cpN || now))); this._cpN = now;
    if (this._rm == null) { this._rm = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => (this.blocks || []).forEach(b => { if (!b.k) b.seq = null; })); }
    for (const b of this.blocks || []) {
      let v = b.m ? (this.mv[b.id] || 0) : sm(b.a, b.a + .16, t) * (1 - sm(b.b - .16, b.b, t));
      if (b.m && !this.n && b.id !== 'ccard' && !this.pos[b.id]) v = 0;
      if (b.hero) v *= ik;
      if (b.id === 'ccard') { if (this.cardT) this.S(b.el, 'transform', this.cardT); }
      else if (b.m && (!this.n || /^stg/.test(b.id))) { const p = this.pos[b.id]; if (p) { const bh = b.h || (b.h = b.el.offsetHeight || 0), bw = b.ow || (b.ow = b.el.offsetWidth || 0), py = p[1] === 'mid' ? this.H * .525 - bh / 2 : p[1], y = /^stg/.test(b.id) ? py : cl(py, 104, Math.max(104, this.H - bh - 20)), x = /^stg/.test(b.id) ? p[0] : cl(p[0], 16, Math.max(16, this.W - bw - 16));
        if (/^card/.test(b.id) && this.fBox) { const ci = +b.id.slice(4); let ov = 0; this.fBox.forEach((B, j) => { if (!B || j === ci) return; const ix = Math.min(x + bw, B[2]) - Math.max(x, B[0]), iy = Math.min(y + bh, B[3]) - Math.max(y, B[1]); if (ix > 0 && iy > 0) ov = Math.max(ov, Math.min(ix, iy)); }); v *= 1 - sm(0, 24, ov); } this.S(b.el, 'transform', `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`); } }
      const on = v > .5;
      if (!b.seq || (b.k === 0 && on && !b.on)) { if (on || !b.seq) this.seqOf(b); }
      b.on = on; const k0 = b.k; b.k = cl(b.k + (on ? dt : -dt), 0, b.T);
      if (b.m && Math.abs(v - b.v) >= .003) b.el.style.opacity = sm(0, .45, v).toFixed(3); b.v = v;
      const vis = b.k > 0 || (b.m && v > 0 && on);
      if (b._vis !== vis) { b._vis = vis; b.el.style.visibility = vis ? 'visible' : 'hidden'; }
      b.el.style.pointerEvents = on && b.k > b.T * .5 ? 'auto' : 'none';
      if (b.k === k0 && b._done) continue; b._done = b.k === 0 || b.k === b.T;
      for (const e of b.seq) { const x = cl((b.k - e.s) / e.d), q = 1 - (1 - x) * (1 - x) * (1 - x); e.w.style.opacity = q.toFixed(3); e.w.style.transform = e.y && q < 1 ? `translateY(${((1 - q) * 12).toFixed(1)}px)` : 'none'; e.w.style.filter = 'none'; }
    }
    this.pos = {};
  }
  ui(t) {
    const wi = this.worldAt(t);
    if (wi !== this._wi) {
      const pw = this._wi; this._wi = wi; const c = INK[wi] ? '#1E1B18' : '#F2EEE6';
      const nav = this.ch.nav; if (nav) { if (nav._tr0 == null) nav._tr0 = nav.style.transition; nav.style.transition = wi === 6 || pw === 6 ? 'color 300ms ease,text-shadow 300ms ease' : nav._tr0; nav.style.color = c; { const lk = this.ch.links; if (lk) lk.style.textShadow = wi === 5 ? '0 0 2px rgba(251,246,234,.9),0 1px 14px rgba(251,246,234,.95)' : ''; } nav.style.textShadow = SOFT[wi] ? '0 0 2px rgba(251,246,234,.9),0 1px 14px rgba(251,246,234,.95)' : wi === 0 ? '0 1px 2px rgba(18,34,68,.7),0 0 16px rgba(18,34,68,.6)' : 'none'; }
      if (this.props.notes || this.q('notes') === '1') this.setState({ world: wi });
    }
    const pr = this.ch.prog; if (pr) this.S(pr, 'transform', `scaleX(${(t / TEND).toFixed(4)})`);
    // The nav call to action slides in once the hero is left behind (with a little hysteresis), pushing the links aside.
    const nc = this.ch.cta, nl = this.ch.links;
    if (nc) {
      let on = !!this._navOn;
      if (this._at !== false) on = t > .3;
      else { const y0 = VI(.3) * this.H; if (!on && scrollY > y0 + 20) on = true; else if (on && scrollY < y0 - 20) on = false; }
      if (on !== this._navOn || this._navW !== nc.offsetWidth) {
        this._navOn = on; this._navW = nc.offsetWidth;
        nc.style.transitionDelay = on ? '0ms,0ms,220ms,220ms' : '0ms';
        nc.style.opacity = on ? '1' : '0'; nc.style.translate = on ? '0px 0' : '32px 0'; nc.style.pointerEvents = on ? 'auto' : 'none';
        nc.tabIndex = on ? 0 : -1; nc.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (nl) { nl.style.transitionDelay = on ? '0ms' : '100ms'; const lg = nl.firstElementChild ? parseFloat(getComputedStyle(nl.firstElementChild).columnGap) || 24 : 24; nl.style.transform = `translateX(${on ? -(nc.offsetWidth + lg) : 0}px)`; }
      }
    }
  }
  // three.js scenes live around the stretch where their world is on screen: mounted early so shaders compile
  // before they are needed, and kept a little longer so scrolling across a boundary does not rebuild them.
  mounts(t) {
    if (!window.Scene3D || this._nogl) return;
    // At the very top the apple is still hidden behind the eye: build it once the page has settled, or as soon as the reader scrolls.
    if (!this._glReady) { if (t < .02 && !this._moving) { if (!this._glIdle) this._glIdle = (window.requestIdleCallback || setTimeout)(() => { this._glReady = true; }, { timeout: 2500 }); return; } this._glReady = true; }
    const M = [['apple8', -1, TF + .05], ['sandboard', 2.55, 18.3], ['arcade8', 15.9, 23.0], ['roomqueen', 20.4, 25.2]];
    M.forEach(([k, a, b]) => { const el = this.m3d[k]; if (!el) return; const on = el._sc ? t > a - .8 && t < b + .8 : t > a - .5 && t < b + .3;
      if (on && !el._sc) el._sc = window.Scene3D.mount(el, k, () => this.st[k]).catch(e => { console.warn('3d ' + k + ': ' + (e && (e.message || e.type) || e)); return null; });
      else if (!on && el._sc) { const p = el._sc; el._sc = null; p.then(s => s && s.dispose()); } });
  }
  // The engine renders every 3D scene from its own loop (sandboard and arcade8 share one camera), so frame times cover all of them.
  drive() { for (const k of ['apple8', 'sandboard', 'arcade8', 'roomqueen']) { const el = this.m3d[k]; if (el && el._sc && el.__frame) try { el.__frame(); } catch (e) { if (!this._derr) { this._derr = 1; console.warn('3d frame ' + k + ': ' + (e && e.message)); } } } }
  disposeAll() { this.$$('[data-3d]').forEach(el => { if (el._sc) { const p = el._sc; el._sc = null; p.then(s => s && s.dispose()); } }); }

  /* ---------- loader / blink ---------- */
  runLoader() {
    const P = window.Painter, red = this.red();
    const line = P.tornLine(77), pts = line.map(([x, y]) => `calc(50% + ${x.toFixed(1)}px) ${y}%`), rimW = line.map((_, i) => 4 + ((i * 37) % 7));
    const L = this.$('[data-lhalf="l"]'), R = this.$('[data-lhalf="r"]'); if (!L || !R) { this._introT0 = performance.now(); return; }
    L.style.clipPath = `polygon(0 0,${pts.join(',')},0 100%)`; R.style.clipPath = `polygon(${pts.join(',')},100% 100%,100% 0)`;
    this.$('[data-lrim]', L).style.clipPath = `polygon(${pts.join(',')},${line.map(([x, y], i) => `calc(50% + ${(x - rimW[i]).toFixed(1)}px) ${y}%`).reverse().join(',')})`;
    this.$('[data-lrim]', R).style.clipPath = `polygon(${pts.join(',')},${line.map(([x, y], i) => `calc(50% + ${(x + rimW[i]).toFixed(1)}px) ${y}%`).reverse().join(',')})`;
    const t0 = performance.now();
    if (!red) this.$$('[data-lword]').forEach(w => { w.style.webkitMaskImage = w.style.maskImage = 'linear-gradient(90deg,#000 42%,rgba(0,0,0,.35) 50%,transparent 58%)'; w.style.webkitMaskSize = w.style.maskSize = '260% 100%'; w.animate([{ maskPosition: '100% 0', webkitMaskPosition: '100% 0' }, { maskPosition: '0% 0', webkitMaskPosition: '0% 0' }], { duration: 900, easing: 'cubic-bezier(.5,.1,.3,1)', fill: 'both' }); });
    // the page only tears open once the first scene (sky, face, eye, skin) is painted, capped so a slow device is never stuck here
    this.heroReady(6000).then(() => {
      if (!this._alive) return;
      if (red) { const d = Math.max(100, 500 - (performance.now() - t0)); this.$('[data-loader]').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: d, fill: 'forwards' }); setTimeout(() => this.setState({ loader: false }), d + 750); this._introT0 = performance.now() + d + 400; return; }
      const d = Math.max(60, 980 - (performance.now() - t0)), o = { duration: 760, delay: d, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' };
      L.animate([{ transform: 'translateX(0) rotate(0deg)', opacity: 1 }, { transform: 'translateX(-62%) rotate(-3deg)', opacity: .2 }], o);
      R.animate([{ transform: 'translateX(0) rotate(0deg)', opacity: 1 }, { transform: 'translateX(62%) rotate(3deg)', opacity: .2 }], o);
      this._introT0 = performance.now() + d + 170; setTimeout(() => this.setState({ loader: false }), d + 800);
    });
  }
  heroReady(cap) {
    const cvs = this._hero || [], t0 = performance.now();
    return new Promise(res => { const tick = () => { if (!this._alive || performance.now() - t0 > cap || cvs.every(cv => cv._pv || cv._pf)) res(); else setTimeout(tick, 50); }; tick(); });
  }
  // every 3 to 8 seconds while the eye is on screen, one in five a double blink
  blink() {
    clearTimeout(this._blinkT);
    this._blinkT = setTimeout(() => { if (!this.red() && (this.t || 0) < .8 && !document.hidden) this.startBlink(Math.random() < .2); this.blink(); }, 3000 + Math.random() * 5000);
  }
  startBlink(dbl) { if (!this._bk) { this._bk = { t0: performance.now(), dbl }; this._snd && this._snd.blink(); } this._act = performance.now(); }
  /* lid closure 0..1: close 110ms ease-in, hold 50ms, open 190ms ease-out; a double blink repeats after 70ms */
  blinkC(now) {
    const b = this._bk; if (!b) return 0; const C = 110, Hd = 50, O = 190, T1 = C + Hd + O, GAP = 70, e = now - b.t0;
    if (e >= (b.dbl ? 2 * T1 + GAP : T1)) { this._bk = null; return 0; }
    const one = x => x < 0 ? 0 : x < C ? (x / C) ** 2 : x < C + Hd ? 1 : x < T1 ? (1 - (x - C - Hd) / O) ** 2 : 0;
    return b.dbl && e >= T1 ? one(e - T1 - GAP) : one(e);
  }
  drawLid(c) {
    const L = this.lid14, x = this.lidCtx, g = this.g1, P = window.Painter; if (!L || !x || !g || !P.lidDraw14) return;
    if (!L.lashes.length) L.lashes = P.lashes14(g.E);
    if (Math.abs(c - this._lc) < 1e-4) return; this._lc = c;
    P.lidDraw14(x, L.w, L.h, g.E, c, L.tex, L.lashes, 2 * c);
  }

  /* ---------- cursor ---------- */
  // A small dot that tracks the pointer exactly and becomes a magnifying lens over anything interactive; buttons pull toward it.
  initCursor() {
    const pm = e => { this._act = performance.now(); const g = this.g1; if (!g) return; this.mx = cl((e.clientX - g.P0.x) / (this.W * .5), -1, 1); this.my = cl((e.clientY - g.P0.y) / (this.H * .5), -1, 1); };
    addEventListener('pointermove', pm, { passive: true });
    if (!matchMedia('(pointer: fine)').matches || this._cursorCleanup) { this._cursorCleanup = () => removeEventListener('pointermove', pm); return; }
    const pos = document.createElement('div'), ring = document.createElement('div');
    Object.assign(pos.style, { position: 'fixed', left: '0', top: '0', zIndex: '9999', pointerEvents: 'none', willChange: 'transform' });
    Object.assign(ring.style, { width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px', borderRadius: '50%', background: '#1B1D24', boxShadow: '0 0 0 1.5px rgba(243,238,228,.9)', transition: `width 600ms ${EASE},height 600ms ${EASE},margin 600ms ${EASE},background 600ms ease,box-shadow 600ms ease,backdrop-filter 600ms ease` });
    pos.appendChild(ring); document.body.appendChild(pos); document.documentElement.classList.add('dc-cursor');
    let tx = -80, ty = -80;
    pos.style.transform = 'translate3d(-80px,-80px,0)';
    const lensOn = { width: '64px', height: '64px', marginLeft: '-32px', marginTop: '-32px', background: 'radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(255,255,255,0) 45%),repeating-linear-gradient(0deg,rgba(27,29,36,.07) 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,rgba(27,29,36,.06) 0 1px,transparent 1px 5px)', boxShadow: 'inset 0 0 0 1.5px rgba(27,29,36,.85),inset 0 -6px 12px rgba(0,0,0,.18),0 0 0 1px rgba(243,238,228,.8)', backdropFilter: 'contrast(1.25) saturate(1.35) brightness(1.06)', WebkitBackdropFilter: 'contrast(1.25) saturate(1.35) brightness(1.06)' };
    const lensOff = { width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px', background: '#1B1D24', boxShadow: '0 0 0 1.5px rgba(243,238,228,.9)', backdropFilter: 'none', WebkitBackdropFilter: 'none' };
    let queued = false;
    const magnets = () => {
      queued = false; const ms = this.$$('[data-magnet]'), rs = ms.map(m => m.getBoundingClientRect());
      ms.forEach((m, i) => { const r = rs[i]; if (!r.width) return; const cx = r.left + r.width / 2 - (m._dx || 0), cy = r.top + r.height / 2 - (m._dy || 0), dx = tx - cx, dy = ty - cy, R = Math.max(r.width, r.height) / 2 + 40, k = Math.hypot(dx, dy) < R ? .25 : 0, nx = dx * k, ny = dy * k;
        if (nx === (m._dx || 0) && ny === (m._dy || 0)) return; m._dx = nx; m._dy = ny; m.style.transform = nx || ny ? `translate(${nx.toFixed(1)}px,${ny.toFixed(1)}px)` : ''; });
    };
    const move = e => {
      tx = e.clientX; ty = e.clientY; pos.style.transform = `translate3d(${tx}px,${ty}px,0)`; if (this.red() || queued) return;
      queued = true; requestAnimationFrame(magnets);
    };
    const over = e => { const hit = e.target.closest && e.target.closest('a,button,[data-hover],article'); this._hov = !!(hit && hit.closest('a,button')); Object.assign(ring.style, hit ? lensOn : lensOff); };
    addEventListener('mousemove', move, { passive: true }); addEventListener('mouseover', over, { passive: true });
    this._cursorCleanup = () => { removeEventListener('pointermove', pm); removeEventListener('mousemove', move); removeEventListener('mouseover', over); pos.remove(); document.documentElement.classList.remove('dc-cursor'); };
  }

  /* ---------- founders ---------- */
  founderHover(i, on) {
    // the panel itself follows in w6, and only slides out while the founder is at a readable distance
    this.fHover[i] = on; if (on) this.paper(.35);
  }
  cardHover(on) { if (on && !this._chov) this.paper(.3); this._chov = on ? 1 : 0; this._act = performance.now(); }
  forceOpen(o) {
        const m = /^f(\d)$/.exec(o || ''); if (m) setTimeout(() => this.founderHover(+m[1], true), 600);
  }

  /* ---------- sound (engine: lib/painter/sound18.js) ---------- */
  snd() { if (!this._snd && window.HPSound) this._snd = new window.HPSound({ getT: () => this.t || 0, reduced: () => this.red(), bars: () => this.$$('[data-bar]'), sides: () => (this.px6 || [-1, 1, -1, 1]).map(x => (x < 0 ? -1 : 1) * (this.n ? .3 : .55)) }); return this._snd; }
  // the desktop sound button: a muted speaker crossfades into five bars that move as a slow wave while sound is on
  wave() {
    if (this._wr) return; let last = performance.now(); this._wp = this.state.sound ? 1 : 0;
    const PAT = [.45, .8, 1, .7, .5], f = () => {
      this._wr = requestAnimationFrame(f); const n = performance.now(), dt = Math.min(.1, (n - last) / 1000); last = n;
      const p = this._wp = Math.max(0, Math.min(1, this._wp + (this.state.sound ? dt : -dt) / .3)), red = this.red();
      if (p === 0 && this._wf) return; if (p === 1 && red && this._wf === 2) return; this._wf = p === 0 ? 1 : p === 1 && red ? 2 : 0;
      const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, s = n / 1000;
      this.$$('[data-spkx]').forEach(g => { g.style.opacity = (1 - e).toFixed(3); });
      this.$$('[data-wavebox]').forEach(g => { g.style.opacity = e.toFixed(3); });
      this.$$('[data-wave]').forEach((w, k) => {
        const r = red ? PAT[k] : .3 + .7 * (.5 + .5 * Math.sin(s * (.85 + k * .19) + k * 1.7)) * (.75 + .25 * Math.sin(s * .41 + k * 2.3));
        w.style.transform = 'scaleY(' + (.125 + (r - .125) * e).toFixed(3) + ')';
      });
    }; f();
  }
  toggleSound() { const S = this.snd(); if (!S) return; const on = !this.state.sound; if (S.setOn(on)) this.setState({ sound: on }); }
  paper(vol = 1) { this._snd && this._snd.paper(vol); }

  go(to, e) { e && e.preventDefault && e.preventDefault(); if (this.state.menu) this.setState({ menu: false }); scrollTo({ top: VI(JUMP[to] ?? 0) * (this.H || innerHeight), behavior: this.red() ? 'auto' : 'smooth' }); }
}

/* walk path through the founders: monotone cubic, so the camera never stops between points (eases only at the two ends) */
/* the last stretch carries the camera a quarter metre further, clear of the frame, before the room takes over (earlier path unchanged) */
function pathc(t) { return pathc0(t) + .25 * sm(22.45, 22.9, t); }
function pathc0(t) { const P = CPTS, n = P.length; if (t <= P[0][0]) return P[0][1]; if (t >= P[n - 1][0]) return P[n - 1][1];
  const d = [], m = [0]; for (let i = 0; i < n - 1; i++) d.push((P[i + 1][1] - P[i][1]) / (P[i + 1][0] - P[i][0]));
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i]); m[n - 1] = 0;
  let i = 0; while (t > P[i + 1][0]) i++; const hh = P[i + 1][0] - P[i][0], s = (t - P[i][0]) / hh, s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * P[i][1] + (s3 - 2 * s2 + s) * hh * m[i] + (-2 * s3 + 3 * s2) * P[i + 1][1] + (s3 - s2) * hh * m[i + 1]; }
