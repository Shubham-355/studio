/* eslint-disable @typescript-eslint/no-unused-expressions -- short-circuit calls are the house style here */
/* Scroll-driven painted homepage. The scroll position maps to a timeline t (0 → TEND);
   each world paints itself onto canvases once, then every frame only moves cameras. */
import { loadPainter } from "@/lib/painter";
import { COMPANIES } from "./content";

const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lin = (a, b, x) => cl((x - a) / (b - a)), sm = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); }, mx = (a, b, t) => a + (b - a) * t;
const EASE = 'cubic-bezier(.2,.7,.2,1)';
export const TEND = 28.6;
const RANGE = [[0, 1.96], [1.45, 5.46], [4.45, 14.06], [-2, -1], [4.45, 17.26], [17.55, 22.91], [21.4, 25.11], [24.1, 99]];
const NAVT = [0, 1.75, 4.95, 13.0, 13.0, 17.9, 22.5, 24.6];
const JUMP = { home: 0, how: 14.2, companies: 18.6, contact: 26.9 };
const TB0 = 5.45, TB1 = 12.4, SL = 4.2, SR = (TB1 - TB0) / SL, DV = TB1 - TB0 - SL;
// The beach walk plays slower than the scroll, so time and scroll are remapped around it.
const V = s => s <= TB0 ? s : s <= TB0 + SL ? TB0 + (s - TB0) * SR : s + DV, VI = t => t <= TB0 ? t : t <= TB1 ? TB0 + (t - TB0) / SR : t - DV;
export const SPACER_VH = 2685;
export const NAMES = ['The sky with an eye', 'The apple on the board', 'The beach', 'The underwater hall', 'The board in the sand', 'The desert arcade', 'The quiet room', 'The night sea'];
const INK = [0, 1, 1, 0, 1, 1, 1, 0], SOFT = [0, 0, 1, 0, 1, 0, 1, 0];
const CZ = [6, 11, 16, 21], DOORZ = 27;
const CPTS = [[18.2, -2], [19.35, 3.4], [20.05, 8.4], [20.75, 13.4], [21.45, 18.4], [21.95, 21.2], [22.9, 26.62]];
const BEATS = [.2, 2.5, 4.3, 6.4, 8.6, 10.4, 11.8, 13.3].concat([14.3, 14.74, 15.24, 15.73, 16.23, 16.6, 17.5, 18.6, 19.35, 20.05, 20.75, 21.45, 22.1, 23.6, 25.7, 27.1, 28.4]);
const BEDS = [{ f: 420, g: .5, s: .05 }, { f: 800, g: .26, s: .2 }, { f: 1100, g: .3, s: .65 }, { f: 170, g: .8, s: .04 }, { f: 1000, g: .28, s: .55 }, { f: 1900, g: .2, s: .02 }, { f: 260, g: .04, s: 0 }, { f: 520, g: .32, s: .45 }];
export const NOTES = [
  'Scroll 0–1.95. Tear ×8 around the eye while the face dollies toward the pupil; pupil zoom to black; the board grows inside a circular reflection 1.45–1.95.',
  'Apple sits on the board from the first frame: perspective approach 1.45–3.3 (scale 1/z, z 7→1). Low sun from the left, long contact shadow to the right. Bites 3.35 / 3.65 / 3.95. Inside the bite, the back faces render the beach through a screen-space portal. Doorway 4.45–5.45: zoom about the bite point; doves fly out past the lens.',
  'One pinhole camera for the whole beach: ground plates are mapped by homography (matrix3d), so the diagonal shoreline, footprints and shadows stay glued to the sand. Walk 5.55–11.2 past the chair; ball rolls 5.7–11.0 to the board edge. Rise 12.4–14.05: the camera climbs into the 3D board camera, world 5 is mapped onto the sand and widens until it is the frame.',
  '',
  'Board reached from the beach rise (ends 14.05, pawn emerges 13.1–13.9); pawn crosses 14.25–16.55, wave makes the queen. 16.6–16.9 camera lowers back to eye level; 16.9–17.25 turns inland (feathered pan); 17.2–17.95 low travel over dune layers at 1/z depth, light warming.',
  'Arcade appears on the horizon 17.6 (world scaled 0.14→1 about the vanishing point, feathered). Dunes sink 17.8–18.2. Founders at z 6/11/16/21: thoughts resolve as the camera nears (dz 4.9→3.2) and scatter again on the way back. Hover: object turns, panel slides out.',
  'Walk through the door 21.9–22.9. Dolly 22.9–24.1. Window 24.1–25.1: camera turns into the lower-left pane, world 8 visible through the glass throughout.',
  'Quote 25.25–26.25. Tear opens 26.2–26.85; arm emerges from shadow inside it and holds the card (thumb in front, fingers behind). Card leaves 27.4; tear closes 27.55–28.05 as the camera lowers to the water; footer from 27.75.',
];

function pathv(t, pts) { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return mx(pts[i - 1][1], pts[i][1], sm(pts[i - 1][0], pts[i][0], t)); return pts[pts.length - 1][1]; }

export class HomeEngine {
  /** host: { props: { motion, notes }, getState(), setState(patch, cb?), forceUpdate() } */
  constructor(host) {
    this.host = host;
    this.st = { apple5: {}, sandboard: {}, roomqueen: {} };
    this.fHover = [];
    this.companies = COMPANIES;
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
    this._alive = true; this.t = 0; this.mv = {}; this.pos = {};
    loadPainter().then(() => this.waitLibs()).then(() => { if (this._alive) this.boot(); }).catch(e => console.error(e));
  }
  narrowChanged() { if (!this.W) return; requestAnimationFrame(() => { this.disposeAll(); this.relayout(true); }); }
  destroy() {
    this._alive = false; removeEventListener('resize', this._onResize);
    this.disposeAll(); this._cursorCleanup && this._cursorCleanup(); clearTimeout(this._blinkT); clearTimeout(this._lt); clearInterval(this._fx); this._ac && this._ac.close();
  }
  async waitLibs() { for (let i = 0; i < 400 && !(window.Painter && window.Painter.beach6cfg && window.Scene3D); i++) await new Promise(r => setTimeout(r, 30)); }

  boot() {
    if (!window.Painter || !window.Painter.desert) return;
    if (!document.getElementById('brushy')) document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="brushy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="ripple" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="8" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="14" xChannelSelector="R" yChannelSelector="G"/></filter></svg>');
    this.grain(); this.relayout(false); this.queuePaint();
    const qt = parseFloat(this.q('t')); if (!isNaN(qt) && qt >= 0 && qt <= TEND + 1) { scrollTo(0, VI(qt) * innerHeight); this.t = qt; this._introT0 = performance.now() - 5000; }
    if (this.state.loader) this.runLoader(); else if (!this._introT0) this._introT0 = performance.now() + 100;
    this.initCursor(); this.blink();
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
    this.wEl = [1, 2, 3, 4, 5, 6, 7, 8].map(k => this.$(`[data-world="${k}"]`)); this.wEl.forEach(e => { if (e) { e._on = undefined; } });
    this.layout1(); this.layout2(); this.layout3(); this.layout4(); this.layout6(); this.layout7(); this.layout8(); this.layoutT();
    this.blocks = this.$$('[data-copy]').map(el => ({ el, m: el.dataset.copy === 'm', id: el.dataset.id, a: +el.dataset.a, b: +el.dataset.b, hero: el.hasAttribute('data-hero'), w: this.$$('[data-w]', el), v: -1 }));
    this.dvEls = this.$$('[data-dove]'); this.fEls = this.$$('[data-founder]'); this.pshEls = this.$$('[data-pshadow]');
    this.fst = this.fEls.map(el => ({ ph: 0, hv: 0, orb: 0, th: this.$$('[data-th]', el), res: this.$('[data-res]', el), turn: this.$('[data-turn]', el), head: this.$('[data-head]', el), body: this.$('[data-body]', el), orbs: this.$$('[data-orb]', el), panel: this.$('[data-panel]', el) }));
    this.$$('[data-kscale]').forEach(el => el.style.zoom = this.n ? '1.1' : String(Math.min(1.45, this.H / 620)));
    const sand = this.$('[data-sand]'); if (sand) { sand.width = Math.round(this.W / 2); sand.height = Math.round(this.H / 2); this.sandCtx = sand.getContext('2d'); }
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
    this.$('[data-lidwin]').style.clipPath = this.$('[data-shadewin]').style.clipPath = `path("${E.path}")`;
    const cap = this.$('[data-herocap]');
    if (cap) cap.style.display = (!n && cx + rx + 44 + 230 > W - 16) ? 'none' : ''; if (cap) Object.assign(cap.style, n ? { left: (cx - rx) + 'px', top: Math.max(76, cy - ry - 64) + 'px', maxWidth: rx * 2 + 'px' } : { left: (cx + rx + 44) + 'px', top: (cy - ry * .3) + 'px', maxWidth: '220px' });
    this.q1 = { face, eye: this.$('[data-eyeball]'), wrap: this.$('[data-skywrap]'), plate: this.$('[data-skyplate]'), rim: this.$('[data-rim]'), near: this.$('[data-near]'), lid: this.$('[data-lid]'), pupil: this.$('[data-pupil]'), glint: this.$('[data-glint]'), scrim: this.$('[data-navscrim]') };
  }
  layout2() {
    const W = this.W, H = this.H, n = this.n, w2 = this.wEl[1]; if (!w2) return;
    const A = n ? { x: -.05 * W, y: .14 * H, w: 1.1 * W, h: .6 * H } : { x: .3 * W, y: .02 * H, w: .72 * W, h: .96 * H };
    const ab = this.$('[data-3d="apple5"]'); if (ab) Object.assign(ab.style, { left: A.x + 'px', top: A.y + 'px', width: A.w + 'px', height: A.h + 'px' });
    this.appleBox = A; this.rb = A.h * .1; this.B = { x: A.x + A.w * .62, y: A.y + A.h * .52 }; this._Bset = false;
    this.cover = Math.hypot(W / 2, H / 2) * 1.08;
    this.q2 = { world: w2, cam: this.$('[data-cam]', w2), plate: this.$('[data-plate]', w2), fg: this.$('[data-fg]', w2), apple: ab, glint: this.$('[data-glint]', w2) };
  }
  smax() { const B = this.B, W = this.W, H = this.H; const d = Math.max(Math.hypot(B.x, B.y), Math.hypot(W - B.x, B.y), Math.hypot(B.x, H - B.y), Math.hypot(W - B.x, H - B.y)); return 1.3 * d / this.rb; }
  layout3() {
    const W = this.W, H = this.H, n = this.n, w3 = this.wEl[2], P = window.Painter; if (!w3) return;
    const S = this.S6 = P.beach6cfg(W, H, n), px = (el, w, h) => el && Object.assign(el.style, { width: w + 'px', height: h + 'px' });
    const sky = this.$('[data-sky6]', w3), g0 = this.$('[data-g0]', w3), g1 = this.$('[data-g1]', w3), surf = this.$('[data-surf3]', w3), bc = this.$('[data-ball6]'), s5 = this.$('[data-surf5]');
    px(sky, W * 1.08, H * 1.08); px(g0, W * 1.2, H); px(g1, W * 1.2, H);
    [[surf, .6], [bc, .9], [s5, .6]].forEach(([c, k]) => { if (c) { c.width = Math.round(W * k); c.height = Math.round(H * k); c._k = k; } });
    const pr = P.cam6.proj, pts = S.board.map(([X, Z]) => pr(S.camO, X, 0, Z)).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    this.w5mask = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><filter id="f"><feGaussianBlur stdDeviation="2.5"/></filter><polygon points="' + pts + '" fill="#fff" filter="url(#f)"/></svg>') + '")';
    this.w5c = pr(S.camO, S.Xb, 0, S.Zb); this.ballTex = this.ballTex || P.ballTex();
    this.q3 = { world: w3, cam: this.$('[data-cam]', w3), sky, g0, g1, surf, sx: surf && surf.getContext('2d'), chair: this.$('[data-chair]', w3), umb: this.$('[data-umb]', w3), gulls: this.$$('[data-gull]', w3), ball: bc, bx: bc && bc.getContext('2d') };
  }
  cam3(t) {
    const d = lin(4.45, 5.45, t); let cs = 1, cx = 0, cy = 0;
    if (d < 1 && this.B) { const e = sm(0, 1, d), z = mx(1.6, 1, e), B = this.B; cs = z; cx = B.x * (1 - z); cy = B.y * (1 - z); }
    return { cx, cy, cs };
  }
  cam6(t) {
    const S = this.S6, u = sm(5.55, 11.2, t), hold = sm(11.2, TB1, t);
    const c = { x: S.Xb * sm(.48, 1, u), y: 1, z: S.Zend * u + .2 * hold, ph: 0, f: S.F, cx: this.W / 2, cy: S.hy };
    const e = sm(TB1, 14.05, t); if (e <= 0) return c; const O = S.camO;
    return { x: mx(c.x, O.x, e), y: mx(1, O.y, e), z: mx(c.z, O.z, e), ph: mx(0, O.ph, e), f: Math.exp(mx(Math.log(c.f), Math.log(O.f), e)), cx: mx(c.cx, O.cx, e), cy: mx(c.cy, O.cy, e) };
  }
  ball6At(t) { const S = this.S6, u = sm(5.7, 11.0, t), a = S.ball0, b = S.rest, L = Math.hypot(b.X - a.X, b.Z - a.Z) + .1; return { X: mx(a.X, b.X, u) + .14 * S.xs * Math.sin(u * Math.PI), Z: mx(a.Z, b.Z, u), rho: u * L / S.br }; }
  // Flattens the first beach frame into one texture; the apple's bite shows it through a portal.
  comp3() {
    const q = this.q3, W = this.W, H = this.H, S = this.S6, P = window.Painter; if (!q || !q.g0 || q.g0.width < 3 || !S) return;
    const k = .5, c = this._comp || (this._comp = document.createElement('canvas')); c.width = Math.round(W * k); c.height = Math.round(H * k);
    const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0);
    if (q.sky && q.sky.width > 2) x.drawImage(q.sky, -.04 * W, -.04 * H, 1.08 * W, 1.08 * H); x.drawImage(q.g0, -.1 * W, 0, 1.2 * W, H);
    const pr = P.cam6.proj, c0 = S.pose0;
    [[q.umb, S.umb, 360 / 278, 360, 420, 160, 412], [q.chair, S.chair, 1, 300, 220, 150, 211]].forEach(([el, o, u, nw, nh, ax, ay]) => { if (!el || el.width < 3) return; const p = pr(c0, o.X, 0, o.Z), kk = c0.f / p[2] * u / nw; x.drawImage(el, p[0] - ax * kk, p[1] - ay * kk, nw * kk, nh * kk); });
    const b = this.ball6At(5.45), cp = pr(c0, b.X, S.br, b.Z); P.ball6(x, cp[0], cp[1], c0.f * S.br / cp[2], b.rho, this.ballTex);
    const st = this.st.apple5; st.tex = c; st.texV = (st.texV || 0) + 1;
  }
  layout4() {
    const w5 = this.wEl[4]; if (!w5) return; const s5 = this.$('[data-surf5]', w5);
    this.q5 = { world: w5, clip: this.$('[data-w5clip]'), wcam: this.$('[data-w5cam]'), tall: this.$('[data-tall]', w5), s5, sx5: s5 && s5.getContext('2d') };
    w5.style.maskSize = w5.style.webkitMaskSize = '100% 100%, 100% 100%'; w5.style.maskRepeat = w5.style.webkitMaskRepeat = 'no-repeat';
  }
  layout6() {
    const H = this.H, n = this.n, w6 = this.wEl[5]; if (!w6) return;
    this.F6 = n ? H * .52 : H * .9; this.hy6 = H * .56; this.px6 = n ? [-.4, .4, -.4, .4] : [-1.35, 1.35, -1.35, 1.35]; this.pw6 = n ? 1.05 : 1;
    this.q6 = { world: w6, cam: this.$('[data-cam]', w6), plate: this.$('[data-plate]', w6), door: this.$('[data-door]', w6), train: this.$('[data-train]', w6) };
  }
  layout7() {
    const W = this.W, H = this.H, n = this.n, w7 = this.wEl[6]; if (!w7) return;
    this.room = n ? { b: [.1, .14, .9, .66], win: [.52, .2, .84, .5] } : { b: [.2, .1, .8, .7], win: [.62, .26, .76, .66] };
    const [x0, y0, x1, y1] = this.room.win.map((v, i) => v * (i % 2 ? H : W)); this.win0 = [x0, y0, x1, y1];
    const fr = this.$('[data-winframe]'); if (fr) Object.assign(fr.style, { left: (x0 - 14) + 'px', top: (y0 - 14) + 'px', width: (x1 - x0 + 28) + 'px', height: (y1 - y0 + 28) + 'px' });
    const qb = this.$('[data-3d="roomqueen"]'); if (qb) Object.assign(qb.style, n ? { left: '-4%', top: '18%', width: '64%', height: '66%' } : { left: '32%', top: '4%', width: '30%', height: '92%' });
    const tb = this.$('[data-table]'); if (tb) Object.assign(tb.style, n ? { left: '80%', top: '64%', display: '' } : { display: 'none' });
    const pw = (x1 - x0) * .5, ph = (y1 - y0) * .56; this.pane = { x: x0 + (x1 - x0) * .25, y: y0 + (y1 - y0) * .72, z: 1.2 * Math.max(W / pw, H / ph) };
    this.q7 = { world: w7, cam: this.$('[data-cam]', w7), wincam: this.$('[data-wincam]') };
  }
  layout8() {
    const W = this.W, H = this.H, n = this.n, w8 = this.wEl[7]; if (!w8) return;
    const rx = n ? W * .28 : Math.min(W * .17, 260);
    this.g8 = { cx: n ? W * .7 : W * .72, cy: n ? H * .22 : H * .42, rx, ry: rx * .82, ks: n ? Math.min(.58, H / 1300) : Math.min(1.4, H / 700), mx: n ? .78 : .82 };
    this.ctear = this.ctear || window.Painter.ragged(0, 0, 1, 1, 29);
    const ms = n ? 96 : 150, moon = this.$('[data-moon]', w8); if (moon) Object.assign(moon.style, { width: ms + 'px', height: ms + 'px' });
    this.moon0 = [W * this.g8.mx - ms / 2, H * (n ? .12 : .22) - ms / 2];
    this.q8 = { world: w8, cam: this.$('[data-cam]', w8), plate: this.$('[data-nightplate]', w8), rim: this.$('[data-crim]', w8), moon, reach: this.$('[data-reach]', w8), tsh: this.$('[data-tsh]', w8), refl: this.$('[data-reflect]', w8) };
    this.thumbEl = this.$('[data-thumb]'); const cc = this.$('[data-id="ccard"]'); this.cardW = cc ? cc.offsetWidth || 320 : 320;
  }
  layoutT() {
    const k = this.tk = .55, P = window.Painter; this.tf = this.$('[data-tfront]'); this.tb = this.$('[data-tback]');
    [this.tf, this.tb].forEach(c => { if (c) { c.width = Math.round(this.W * k); c.height = Math.round(this.H * k); } });
    this.tfx = this.tf && this.tf.getContext('2d'); this.tbx = this.tb && this.tb.getContext('2d');
    this.tspr = this.tspr || ['shell', 'stone', 'print', 'grass', 'tuft', 'drift'].reduce((o, q) => (o[q] = P.tsprite(q), o), {});
    const r = P.rng(77), U = { shell: .12, stone: .1, print: .16, grass: .34, tuft: .24, drift: .7 }, kinds = ['shell', 'stone', 'grass', 'tuft', 'drift', 'shell', 'stone', 'tuft'];
    this.tsp = Array.from({ length: 40 }, (_, i) => { const q = kinds[i % 8]; return { k: q, x: (r() - .5) * 3.4, z: .5 + r() * 6, u: U[q] }; }).concat(Array.from({ length: 16 }, (_, i) => ({ k: 'print', x: (i % 2 ? .1 : -.1) + Math.sin(i * .4) * .15, z: .45 + i * .34, u: .16 })));
  }
  mixc(a, b, t) { const P = window.Painter, A = P.hex(a), B = P.hex(b); return `rgb(${Math.round(mx(A[0], B[0], t))},${Math.round(mx(A[1], B[1], t))},${Math.round(mx(A[2], B[2], t))})`; }
  mixc2(a, b, t) { const p = s => s.match(/\d+/g).map(Number), A = p(a), B = p(b); return `rgb(${Math.round(mx(A[0], B[0], t))},${Math.round(mx(A[1], B[1], t))},${Math.round(mx(A[2], B[2], t))})`; }

  /* ---------- painting ---------- */
  // Plates are painted one per idle slot, nearest world first, so the first frame is not blocked.
  queuePaint() {
    const P = new Proxy({}, { get: (_, k) => window.Painter[k] }), g = this.g1, n = this.n, R = this.room;
    const J = [
      [0, 'sky1', cv => P.sky(cv, { seed: 1, w: cv.offsetWidth, h: cv.offsetHeight, stops: [[0, '#79A6DC'], [.4, '#4F84C8'], [1, '#3E78C4']], clouds: n ? 6 : 11, cy0: .17, cy1: .7, cs0: .05, cs1: .11 })],
      [0, 'near1', cv => P.cloudLayer(cv, { seed: 5, spots: n ? [[.06, .92, .12], [.95, .95, .1]] : [[.03, .9, .08], [.97, .88, .07], [.99, .5, .05]] })],
      [0, 'face', cv => P.face6(cv, g.fw, g.fh)], [0, 'eyeball', cv => P.eyeball6(cv, g.fw, g.fh)], [0, 'iris', cv => P.iris6(cv, g.ir, n ? 1600 : 3200)],
      [0, 'eyeshade', cv => P.eyeShade6(cv, g.fw, g.fh)], [0, 'eyeglint', cv => P.eyeGlint6(cv, g.fw, g.fh, g.ir)],
      [0, 'lid', cv => { P.lid6(cv, g.fw, g.fh); cv.style.transform = `translateY(${-g.lidUp}px)`; }],
      [0, 'skin', cv => P.skinField6(cv, g.PW, g.PH, g.E, g.ox, g.oy)],
      [1, 'shore5', cv => P.shore5(cv, { hy: .5 })], [1, 'shells5', cv => P.shells5(cv)], [1, 'dove', cv => P.dove(cv, cv.dataset.up === '1')],
      [2, 'b6sky', cv => P.beach6Sky(cv, this.S6)], [2, 'b6g0', cv => P.beach6Ground(cv, this.S6, 0)], [2, 'b6umb', cv => P.umb6(cv)], [2, 'b6chair', cv => P.chair6(cv)], [2, 'b6gull', cv => P.gull6(cv)], [2, 'b6g1', cv => P.beach6Ground(cv, this.S6, 1)],
      [4, 'b6tall', cv => P.beach6Tall(cv, this.S6)],
      [5, 'desert', cv => P.desert(cv, { hy: .552, gap: n ? .22 : .13 })], [5, 'founder', cv => P.founder(cv, +cv.dataset.v)], [5, 'head', cv => P.head(cv, +cv.dataset.v)], [5, 'thought', cv => P.thought(cv, cv.dataset.kind)], [5, 'resolved', cv => P.resolved(cv, +cv.dataset.v)], [5, 'planet', cv => P.planet(cv, cv.dataset.col)],
      [6, 'room', cv => P.room(cv, R)],
      [7, 'night', cv => P.nightSea(cv, { hy: .413, mx: this.g8.mx })], [7, 'morning', cv => P.morning(cv)], [7, 'moon', cv => P.moon(cv)], [7, 'reach3', cv => P.reach3(cv)], [7, 'thumb3', cv => P.thumb3(cv)],
    ];
    const at = parseFloat(this.q('at')), aw = isNaN(at) ? -1 : this.worldAt(at);
    this.pq = []; J.forEach(([w, k, fn]) => { if (aw >= 0 && Math.abs(w - aw) > 1 && !(aw === 1 && w === 2)) return; this.$$(`[data-paint="${k}"]`).forEach(cv => this.pq.push({ w, cv, fn })); });
    const token = (this._pt = (this._pt || 0) + 1);
    const idle = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 100 }) : f => setTimeout(f, 16);
    const step = () => {
      if (token !== this._pt || !this._alive || !this.pq.length) return;
      const cur = this.worldAt(this.t || 0); let bi = 0, bd = 99; this.pq.forEach((j, i) => { const d = Math.abs(j.w - cur) + (j.w < cur ? .5 : 0); if (d < bd) { bd = d; bi = i; } });
      const j = this.pq.splice(bi, 1)[0], cv = j.cv;
      cv.getBoundingClientRect = () => ({ width: cv.offsetWidth, height: cv.offsetHeight, left: 0, top: 0, right: cv.offsetWidth, bottom: cv.offsetHeight });
      const wd = cv.closest('[data-world]'), hid = wd && wd.style.display === 'none'; if (hid) wd.style.display = '';
      try { j.fn(cv); } catch (e) { console.warn(e); } delete cv.getBoundingClientRect; if (hid) wd.style.display = 'none';
      if (j.w === 2 && !this.pq.some(x => x.w === 2)) { try { this.comp3(); } catch (e) { console.warn(e); } }
      idle(step);
    };
    idle(step);
  }

  /* ---------- frame loop ---------- */
  loop() {
    if (!this._alive) return; const pn = performance.now(); if (this._lastF && pn - this._lastF < 8) return; this._lastF = pn;
    requestAnimationFrame(this._loopF); clearTimeout(this._lt); this._lt = setTimeout(this._loopF, 120);
    if (!this.W) return;
    if (this._at == null) { const a = parseFloat(this.q('at')); this._at = isNaN(a) ? false : a; if (this._at !== false) { this.t = this._at; this._introT0 = performance.now() - 5000; } }
    const tgt = this._at !== false ? this._at : V(cl(scrollY / this.H, 0, VI(TEND)));
    if (this.red()) { const b = this.beat(tgt); if (b !== this._beat) { if (this._beat != null) this.fadeSwap(); this._beat = b; } this.t = b; }
    else { const d = tgt - this.t; this.t = Math.abs(d) < .0008 ? tgt : this.t + d * .085; this._beat = null; }
    this.now = performance.now() / 1000;
    try { this.render(this.t); } catch (e) { if (!this._errd) { this._errd = 1; console.error(e); } }
  }
  beat(x) { let b = BEATS[0]; for (const v of BEATS) if (x >= v - .3) b = v; return b; }
  fadeSwap() { ['[data-stage]', '[data-copylayer]'].forEach(s => { const el = this.$(s); el && el.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 700, easing: 'ease-out' }); }); }
  worldAt(t) { let k = 0; for (let i = 0; i < 8; i++) if (t >= NAVT[i]) k = i; return k; }
  render(t) {
    this.mv = {};
    for (let k = 0; k < 8; k++) { const el = this.wEl[k]; if (!el) continue; const on = t >= RANGE[k][0] && t < RANGE[k][1]; if (el._on !== on) { el._on = on; el.style.visibility = on ? 'visible' : 'hidden'; el.style.display = on ? '' : 'none'; } if (on) this['w' + (k + 1)](t); }
    this.st.apple5.active = t > 1.4 && t < 5.5; this.st.sandboard.active = t > 4.4 && t < 17.3; this.drawBall(t); this.st.roomqueen.active = t > 21.3 && t < 25.2;
    this.travel(t); this.carry(t); this.copy(t); this.ui(t); this.mounts(t);
  }

  /* ---------- 1 · the sky with an eye ---------- */
  w1(t) {
    const g = this.g1, q = this.q1, P = window.Painter, W = this.W, H = this.H; if (!g || !q) return;
    const a = sm(.45, 1.0, t), s = 1 + a * a * 7, b = lin(.95, 1.45, t), zb = sm(0, 1, b);
    if (a < .999) {
      if (s !== this._s1) { this._s1 = s; const inn = this.tear.at(g.cx, g.cy, g.rx * s, g.ry * s, 0), out = this.tear.at(g.cx, g.cy, g.rx * s, g.ry * s, 1);
        q.plate.style.clipPath = `path(evenodd, "M0 0H${W}V${H}H0Z ${P.toPath(out)}")`; if (this.rimCtx) P.tearRim6(this.rimCtx, inn, out, this.tear, g.cx, g.cy, this.dpr1); }
      this.S(q.wrap, 'visibility', 'visible');
    } else this.S(q.wrap, 'visibility', 'hidden');
    if (a > .4 && !this._tore1) { this._tore1 = true; this.paper(); } if (a < .1) this._tore1 = false;
    const fs = (1 + a * .5) * Math.pow(g.fsEnd / 1.5, zb), sh = sm(0, .7, b);
    this.S(q.face, 'transform', `translate(${((W / 2 - g.P0.x) * sh).toFixed(1)}px,${((H / 2 - g.P0.y) * sh).toFixed(1)}px) scale(${fs.toFixed(4)})`);
    this.S(q.face, 'visibility', b > .985 ? 'hidden' : 'visible');
    const f = 1 - sm(.8, .95, t);
    this.S(q.eye, 'transform', `translate(${((this.mx || 0) * g.ex * f).toFixed(1)}px,${((this.my || 0) * g.ey * f).toFixed(1)}px)`);
    this._pk = mx(this._pk ?? 1, this._hov && t < .4 ? .8 : 1, .07); this.S(q.pupil, 'transform', `scale(${mx(1, this._pk, f).toFixed(3)})`);
    this.S(q.glint, 'opacity', (1 - sm(.3, .6, b)).toFixed(3));
    this.S(q.scrim, 'opacity', (1 - sm(.3, .9, a)).toFixed(3));
    this.S(q.near, 'transform', `translateX(${(Math.sin(this.now * .05) * 24).toFixed(1)}px) scale(${(1 + a * 2.6).toFixed(3)})`);
  }

  /* ---------- 2 · the apple on the board ---------- */
  w2(t) {
    const W = this.W, H = this.H, q = this.q2; if (!q) return;
    const r1 = sm(1.45, 1.95, t), d = lin(4.45, 5.45, t);
    let cs = 1, cx = 0, cy = 0, clip = 'none';
    if (t < 1.95) { const R = Math.max(.5, r1 * this.cover); clip = `circle(${R.toFixed(1)}px at ${W / 2}px ${H / 2}px)`; cs = mx(1.12, 1, r1); cx = W / 2 * (1 - cs); cy = H / 2 * (1 - cs);
      this.S(q.glint, 'visibility', r1 > .02 && r1 < .98 ? 'visible' : 'hidden'); this.S(q.glint, 'transform', `translate(${(W / 2 - R * .42).toFixed(1)}px,${(H / 2 - R * .5).toFixed(1)}px) rotate(-24deg) scale(${(R / 300).toFixed(3)})`);
    } else this.S(q.glint, 'visibility', 'hidden');
    const stA = this.st.apple5, A = this.appleBox;
    if (stA.bx != null && (t <= 4.45 || !this._Bset)) { this.B = { x: A.x + stA.bx * A.w, y: A.y + stA.by * A.h }; this._Bset = true; }
    let S = 1; if (d > 0) { S = Math.pow(this.smax(), sm(0, 1, d)); cs = S; cx = this.B.x * (1 - S); cy = this.B.y * (1 - S); }
    this.S(q.world, 'clipPath', clip);
    this.S(q.cam, 'transform', `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) scale(${cs.toFixed(4)})`);
    const u = sm(1.45, 4.45, t);
    this.S(q.plate, 'transform', `scale(${(1 + u * .2).toFixed(4)})`);
    this.S(q.fg, 'transform', `translateY(${(u * H * .08).toFixed(1)}px) scale(${(1 + u * .9).toFixed(4)})`);
    const ap = sm(1.45, 3.3, t), s = 1 / mx(7, 1, ap), sp = 1 / mx(2.2, 1, ap), Ox = A.x + A.w * .5, Oy = A.y + A.h * .78;
    const tx = (W / 2 - Ox) * (1 - sp), ty = (H * .5 - Oy) * (1 - sp);
    this.S(q.apple, 'transform', `translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${s.toFixed(4)})`);
    const b1 = sm(3.35, 3.6, t), b2 = sm(3.65, 3.9, t), b3 = sm(3.95, 4.2, t);
    stA.bk = [b2, b1, b3]; stA.bite = Math.max(.001, (b1 + b2 + b3) / 3);
    if (b1 > .5 && !this._bit1) { this._bit1 = 1; this.crunch(); } if (b2 > .5 && !this._bit2) { this._bit2 = 1; this.crunch(); } if (b3 > .5 && !this._bit3) { this._bit3 = 1; this.crunch(); } if (b1 < .2) this._bit1 = this._bit2 = this._bit3 = 0;
    const C3 = this.cam3(t), ox = A.x + A.w * .5 * (1 - s) + tx, oy = A.y + A.h * .78 * (1 - s) + ty;
    stA.portal = [cx + cs * ox, cy + cs * oy, cs * s * A.w, cs * s * A.h, C3.cx, C3.cy, C3.cs * W, C3.cs * H];
  }

  /* ---------- 3 · the beach ---------- */
  w3(t) {
    const W = this.W, H = this.H, q = this.q3, S = this.S6, n = this.n; if (!q || !S) return; const P = window.Painter, pr = P.cam6.proj;
    const d = lin(4.45, 5.45, t), C = this.cam3(t);
    if (d < 1) { const e = sm(0, 1, d), Sx = Math.pow(this.smax(), e), rC = this.rb * Sx * mx(.15, .7, e), B = this.B; this.S(q.world, 'clipPath', `circle(${rC.toFixed(1)}px at ${B.x.toFixed(1)}px ${B.y.toFixed(1)}px)`); }
    else this.S(q.world, 'clipPath', 'none');
    this.S(q.cam, 'transform', `translate(${C.cx.toFixed(1)}px,${C.cy.toFixed(1)}px) scale(${C.cs.toFixed(4)})`);
    const c = this.cam6(t), s = c.f / S.F, vh = c.cy - c.f * Math.tan(c.ph);
    this.S(q.sky, 'transform', `matrix(${s.toFixed(5)},0,0,${s.toFixed(5)},${(W / 2 - s * W / 2 - s * .04 * W).toFixed(2)},${(vh - s * S.hy - s * .04 * H).toFixed(2)})`);
    const hm = (el, pose) => { if (!el) return; const z1 = Math.max(c.z, pose.z) + 1.6, pts = [[c.x - 1.5, z1], [c.x + 1.5, z1], [c.x + 1.5, z1 + 6], [c.x - 1.5, z1 + 6]];
      this.S(el, 'transform', P.homog(pts.map(([X, Z]) => { const p = pr(pose, X, 0, Z); return [p[0] + .1 * W, p[1]]; }), pts.map(([X, Z]) => pr(c, X, 0, Z)))); };
    hm(q.g0, S.pose0); hm(q.g1, S.poseE); this.S(q.g1, 'opacity', sm(.35, .8, sm(5.55, 11.2, t)).toFixed(3));
    const spr = (el, o, u, nw, ax, ay) => { if (!el) return; const p = pr(c, o.X, 0, o.Z); if (p[2] < .25 || c.ph > .45) { this.S(el, 'visibility', 'hidden'); return; } const k = c.f / p[2] * u / nw;
      this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${(p[0] - ax * k).toFixed(1)}px,${(p[1] - ay * k).toFixed(1)}px) scale(${k.toFixed(4)})`); this.S(el, 'zIndex', String(Math.round(1000 - p[2] * 40)));
      this.S(el, 'filter', p[2] < 1.2 ? `blur(${((1.2 - p[2]) * 4 / k).toFixed(2)}px)` : 'none'); };
    spr(q.umb, S.umb, 360 / 278, 360, 160, 412); spr(q.chair, S.chair, 1, 300, 150, 211);
    if (q.sx) { const k = q.surf._k; P.surf6(q.sx, Object.assign({}, c, { f: c.f * k, cx: c.cx * k, cy: c.cy * k }), S, this.now, 0, k, q.surf.width, q.surf.height); }
    const gOn = t > 5.5 && t < 12.9 && c.ph < .3;
    q.gulls.forEach((el, i) => { if (!gOn) { this.S(el, 'visibility', 'hidden'); return; } const a = this.now * (.05 + i * .012) + i * 2.1, x = W * (n ? .3 + i * .2 : .26 + i * .13) + Math.sin(a) * W * (n ? .12 : .07), y = Math.max(n ? 132 : 124, H * (.1 + i * .045)) + Math.sin(a * 1.7) * 10 - (vh - S.hy), s2 = (n ? .45 : .6) + i * .12, fl = .7 + Math.sin(this.now * 3.2 + i * 1.3) * .3, dir = Math.cos(a) >= 0 ? 1 : -1;
      this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${(x - 45).toFixed(1)}px,${(y - 20).toFixed(1)}px) scale(${(s2 * dir).toFixed(3)},${(s2 * fl).toFixed(3)})`); });
  }
  drawBall(t) {
    const q = this.q3, x = q && q.bx, S = this.S6; if (!x || !S) return; const on = t > 4.45 && t < 17.3;
    this.S(q.ball, 'visibility', on ? 'visible' : 'hidden'); if (!on) return;
    const k = q.ball._k, P = window.Painter, pr = P.cam6.proj; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, q.ball.width, q.ball.height);
    let c, ox = 0, oy = 0; if (t < 14.05) c = this.cam6(t); else { c = S.camO; ox = -sm(16.9, 17.25, t) * 1.06 * this.W; oy = 1.2 * this.H * sm(16.6, 16.9, t); }
    const C3 = this.cam3(t); x.setTransform(k * C3.cs, 0, 0, k * C3.cs, k * (C3.cx + ox), k * (C3.cy + oy));
    this.S(q.ball, 'clipPath', t < 5.45 ? q.world.style.clipPath : 'none');
    const b = this.ball6At(t), r = S.br, sn = S.sun, cp = pr(c, b.X, r, b.Z); if (cp[2] < .15) return;
    const L = Math.hypot(sn[0], sn[1]), ux = sn[0] / L, uz = sn[1] / L, sx0 = b.X + sn[0] * r, sz0 = b.Z + sn[1] * r;
    x.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, la = Math.cos(a) * r * 1.7, lc = Math.sin(a) * r, p = pr(c, sx0 + ux * la - uz * lc, 0, sz0 + uz * la + ux * lc); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); } x.closePath();
    x.filter = 'blur(2px)'; x.fillStyle = 'rgba(70,84,128,.34)'; x.fill(); x.filter = 'none';
    const R = c.f * r / cp[2], g = pr(c, b.X, 0, b.Z); x.fillStyle = 'rgba(46,48,70,.35)'; x.beginPath(); x.ellipse(g[0], g[1], R * .55, Math.max(1, R * .16), 0, 0, 7); x.fill();
    P.ball6(x, cp[0], cp[1], R, b.rho, this.ballTex);
  }
  w4() { /* the underwater hall is not part of this cut */ }

  /* ---------- 5 · the board in the sand ---------- */
  w5(t) {
    const W = this.W, H = this.H, q = this.q5, S = this.S6; if (!q || !S) return; const P = window.Painter, pr = P.cam6.proj;
    const e = sm(TB1, 14.05, t), back = sm(16.6, 16.9, t), pan = sm(16.9, 17.25, t), ty = -1.2 * H * (1 - back), C = this.cam3(t);
    this.S(q.clip, 'clipPath', t < 5.45 && this.q3 ? this.q3.world.style.clipPath : 'none');
    this.S(q.wcam, 'transform', C.cs !== 1 ? `translate(${C.cx.toFixed(1)}px,${C.cy.toFixed(1)}px) scale(${C.cs.toFixed(4)})` : 'none');
    this.S(q.tall, 'transform', `translate(${(-pan * 1.06 * W).toFixed(1)}px,${ty.toFixed(1)}px)`);
    if (e < .999) { const c = this.cam6(t); this.S(q.world, 'transform', P.homog(S.board.map(([X, Z]) => pr(S.camO, X, 0, Z)), S.board.map(([X, Z]) => pr(c, X, 0, Z))));
      const R = Math.max(1, sm(.3, .85, e) * 1.35 * Math.hypot(W, H)), m = `${this.w5mask}, radial-gradient(circle ${R.toFixed(0)}px at ${this.w5c[0].toFixed(0)}px ${this.w5c[1].toFixed(0)}px, #000 55%, transparent 100%)`;
      this.S(q.world, 'maskImage', m); this.S(q.world, 'webkitMaskImage', m); }
    else { this.S(q.world, 'transform', 'none'); this.S(q.world, 'maskImage', 'none'); this.S(q.world, 'webkitMaskImage', 'none'); }
    const p = lin(14.25, 16.55, t), sb = this.st.sandboard; sb.p = p; sb.pk = sm(13.1, 13.9, t);
    if (q.sx5) { const k = q.s5._k; P.surf6(q.sx5, Object.assign({}, S.camO, { f: S.camO.f * k, cx: S.camO.cx * k, cy: S.camO.cy * k }), S, this.now, Math.sin(lin(.84, .99, p) * Math.PI), k, q.s5.width, q.s5.height); }
    const f = Math.min(1, p / .86) * 4;
    for (let k = 0; k < 5; k++) { let v = 1 - sm(.3, .45, Math.abs(f - k)); if (k === 0 && t < 14.25) v = sm(13.9, 14.1, t); if (k === 4 && f >= 4) v = 1; if (t > 16.6 || t < 13.9) v = 0; this.mv['stg' + k] = v; }
    if (!this.n && sb.sx != null) { const P0 = [sb.sx * W + 110, Math.min(ty + 1.2 * H + sb.sy * H - 150, H - 250)]; for (let k = 0; k < 5; k++) this.pos['stg' + k] = P0; }
  }
  // Low run inland over dune layers between the board and the desert arcade.
  travel(t) {
    const f = this.tf, bk = this.tb, x = this.tfx; if (!f || !bk || !x) return;
    const on = t > 16.88 && t < 18.25;
    if (!on) { if (f._on !== false) { f._on = false; f.style.visibility = 'hidden'; bk.style.visibility = 'hidden'; } return; }
    f._on = true; f.style.visibility = 'visible';
    const W = this.W, H = this.H, n = this.n, K = this.tk, TR = 4.4;
    const pan = sm(16.9, 17.25, t), dx = (1 - pan) * 1.06 * W, s = lin(17.2, 17.95, t), warm = sm(17.0, 17.9, t), sink = sm(17.8, 18.2, t) * H * 1.3;
    const hy = mx(H * .46, H * .56, sm(17.2, 17.7, t)), F = n ? W * 1.5 : H * 1.05, hc = .5 + .14 * Math.pow(Math.sin(s * Math.PI * 2.5), 2);
    const skyIn = t < 17.6, w2 = warm < .5 ? warm * 2 : (warm - .5) * 2, m3 = (a, b, c) => warm < .5 ? this.mixc(a, b, w2) : this.mixc(b, c, w2), skyc = [m3('#5B98D6', '#9FB2C4', '#B8674E'), m3('#86BCE4', '#E6CBA2', '#DB8E5C'), m3('#DCEEF0', '#F3DDB4', '#EAAF70')];
    const sky = c => { const gr = c.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, skyc[0]); gr.addColorStop(.55, skyc[1]); gr.addColorStop(1, skyc[2]); c.fillStyle = gr; c.fillRect(-W, 0, 3 * W, hy + 2);
      const sx = W * .22, sy = mx(H * .1, hy - H * .12, warm), sg = c.createRadialGradient(sx, sy, 0, sx, sy, W * .3); sg.addColorStop(0, 'rgba(255,246,222,.85)'); sg.addColorStop(.1, 'rgba(255,232,196,.35)'); sg.addColorStop(1, 'rgba(255,232,196,0)'); c.fillStyle = sg; c.fillRect(-W, 0, 3 * W, hy); };
    x.setTransform(K, 0, 0, K, 0, 0); x.clearRect(0, 0, W, H); x.save(); x.translate(dx, 0);
    if (skyIn) sky(x);
    x.fillStyle = this.mixc('#EFE2C6', '#DDB070', warm); x.fillRect(-W, hy + sink - 1, 3 * W, H * 2);
    const hz = skyc[2], D = [];
    for (let j = 0; j < 9; j++) { const z = .8 + j * .85 - s * TR; if (z > .16) D.push({ z, j, t: 0 }); }
    this.tsp.forEach(o => { const z = o.z - s * TR; if (z > .14 && z < 7) D.push({ z, o, t: 1 }); });
    for (let r = 0; r < 12; r++) { const z = .22 + (((r * .15 - s * TR) % 1.8) + 1.8) % 1.8; D.push({ z, r, t: 2 }); }
    D.sort((a, b) => b.z - a.z);
    const X0 = -.3 * W - 20, X1 = W + 20;
    D.forEach(d => {
      const z = d.z, S = F / z;
      if (d.t === 0) {
        const j = d.j, A = .2 + ((j * 37) % 10) / 10 * .25, ph = j * 1.7, haze = Math.min(1, z / 7);
        const col = this.mixc('#F2E4C4', '#E8B676', warm);
        const pts = []; for (let xs = X0; xs <= X1; xs += 14) { const xw = (xs - W / 2) / S, ht = A * (.55 + .3 * Math.sin(xw * .9 + ph) + .15 * Math.sin(xw * 2.3 + ph * 2)); pts.push([xs, hy + (hc - ht) * S + sink]); }
        let top = 1e9; pts.forEach(p => { if (p[1] < top) top = p[1]; }); if (top > H + 10) return;
        x.beginPath(); x.moveTo(X0, H * 3); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(X1, H * 3); x.closePath();
        const gr = x.createLinearGradient(0, top, 0, top + S * .5 + 40); gr.addColorStop(0, this.mixc2(col, hz, haze * .75)); gr.addColorStop(1, this.mixc2(this.mixc('#CDB38A', '#B97A4C', warm), hz, haze * .6)); x.fillStyle = gr; x.fill();
        x.strokeStyle = `rgba(255,246,226,${(.75 * (1 - haze)).toFixed(2)})`; x.lineWidth = Math.max(1, S * .006); x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
        if (z < 3.2) { x.strokeStyle = `rgba(140,100,64,${(.22 * (1 - z / 3.2)).toFixed(2)})`; x.lineWidth = Math.max(1, S * .004); for (let r = 1; r < 5; r++) { x.beginPath(); pts.forEach((p, i) => { const yy = p[1] + r * S * .05 + Math.sin(p[0] * .02 + r) * S * .012; i ? x.lineTo(p[0], yy) : x.moveTo(p[0], yy); }); x.stroke(); } }
      } else if (d.t === 1) {
        const o = d.o, sp = this.tspr[o.k]; if (!sp) return; const wpx = o.u * S, hpx = wpx * sp.height / sp.width, xs = W / 2 + o.x * S, yb = hy + hc * S + sink; if (yb - hpx > H + 10) return;
        x.drawImage(sp, xs - wpx / 2, yb - hpx, wpx, hpx);
      } else {
        const yb = hy + hc * S + sink; if (yb > H + 20) return; x.strokeStyle = `rgba(150,110,72,${(.32 * Math.min(1, 1 / z)).toFixed(2)})`; x.lineWidth = Math.max(1, S * .006);
        x.beginPath(); for (let xs = X0; xs <= X1; xs += 24) { const yy = yb + Math.sin(xs * .01 + d.r * 2) * S * .02; xs === X0 ? x.moveTo(xs, yy) : x.lineTo(xs, yy); } x.stroke();
      }
    });
    x.fillStyle = 'rgba(120,86,56,.45)'; for (let i = 0; i < 60; i++) { const yy = H * (.72 + (((i * .618 + s * 5) % 1)) * .3) + sink, xx = ((i * .414) % 1) * W * 1.3 - .3 * W; x.fillRect(xx, yy, 1.5 + (i % 3), 1.5 + (i % 3)); }
    x.restore();
    if (dx > 0) { x.globalCompositeOperation = 'destination-out'; const g = x.createLinearGradient(dx - .3 * W, 0, dx, 0); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.04, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(dx - .3 * W, 0, .3 * W, H); x.fillStyle = '#000'; x.fillRect(-10, 0, Math.max(0, dx - .3 * W + 16), H); x.globalCompositeOperation = 'source-over'; }
    if (!skyIn && this.tbx) { this.S(bk, 'visibility', 'visible'); bk._on = true; const b = this.tbx; b.setTransform(K, 0, 0, K, 0, 0); b.clearRect(0, 0, W, H); sky(b); b.fillStyle = skyc[2]; b.fillRect(0, hy, W, H); }
    else this.S(bk, 'visibility', 'hidden');
  }

  /* ---------- 6 · the desert arcade ---------- */
  w6(t) {
    const W = this.W, H = this.H, q = this.q6, n = this.n; if (!q) return;
    const hy = this.hy6, ap = sm(17.6, 18.2, t), s6 = Math.exp(Math.log(.14) * (1 - ap));
    this.S(q.cam, 'transform', ap < 1 ? `translate(${(W / 2 * (1 - s6)).toFixed(1)}px,${(hy * (1 - s6)).toFixed(1)}px) scale(${s6.toFixed(4)})` : 'none');
    let mk = 'none'; if (ap < 1) { const f = lin(.862, 1, s6), rx = mx(.56 * W * s6, 2.6 * W, f * f), ry = mx(.56 * H * s6, 2.6 * H, f * f); mk = `radial-gradient(ellipse ${rx.toFixed(0)}px ${ry.toFixed(0)}px at ${(W / 2).toFixed(0)}px ${hy.toFixed(0)}px, #000 62%, transparent 100%)`; }
    this.S(q.world, 'webkitMaskImage', mk); this.S(q.world, 'maskImage', mk);
    const c = pathv(t, CPTS), F = this.F6, dt = Math.min(.1, Math.max(0, this.now - (this._n6 || this.now))); this._n6 = this.now;
    this.S(q.plate, 'transform', `scale(${(1 + (c + 2) * .011).toFixed(4)})`);
    q.plate.style.transformOrigin = `50% ${(hy + H * .08) / (H * 1.16) * 100}%`;
    this.fEls.forEach((el, i) => {
      const dz = CZ[i] - c, sh = this.pshEls[i], co = this.companies[i], fs = this.fst[i]; if (!fs) return;
      if (dz < .3) { this.S(el, 'visibility', 'hidden'); this.S(sh, 'visibility', 'hidden'); this.mv['card' + i] = 0; return; }
      const s = F / dz, k = s * this.pw6 / 300, X = W / 2 + this.px6[i] * s, Yb = hy + s;
      this.S(el, 'visibility', 'visible'); this.S(sh, 'visibility', 'visible');
      this.S(el, 'transform', `translate(${(X - 150 * k).toFixed(1)}px,${(Yb - 600 * k).toFixed(1)}px) scale(${k.toFixed(4)})`); this.S(el, 'zIndex', String(Math.round(1000 - dz * 10)));
      this.S(sh, 'transform', `translate(${X.toFixed(1)}px,${(Yb - 22 * k).toFixed(1)}px) scale(${(k * 2.4).toFixed(4)},${k.toFixed(4)})`);
      // Thoughts orbit loosely far away, then resolve into one object as the camera nears.
      const R = sm(4.9, 3.2, dz), hcY = co.stand ? 99 : 227, tY = co.stand ? -26 : 102, N = fs.th.length;
      fs.ph += dt * ((1 - R) * 1.1 + .04);
      fs.th.forEach((te, j) => { const a = j / N * Math.PI * 2 + fs.ph * (.7 + (j % 3) * .25) * (j % 2 ? 1 : -1), rad = 80 + Math.sin(fs.ph * 1.7 + j * 1.3) * 34, ej = sm(j * .025, .5 + j * .035, R);
        const px = mx(150 + Math.cos(a) * rad * 1.25, 150, ej) - 28, py = mx(hcY - 12 + Math.sin(a) * rad * .8, tY, ej) - 28;
        this.S(te, 'transform', `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) rotate(${((fs.ph * 1.5 + j) * (1 - ej)).toFixed(2)}rad) scale(${mx(1, .15, ej).toFixed(3)})`); this.S(te, 'opacity', (1 - sm(.75, 1, ej)).toFixed(3)); });
      const rs = sm(.55, 1, R); fs.hv = mx(fs.hv, this.fHover[i] ? 1 : 0, .06);
      this.S(fs.res, 'opacity', sm(.45, .8, R).toFixed(3));
      this.S(fs.turn, 'transform', `translateY(${(Math.sin(this.now * 1.1 + i) * 4).toFixed(1)}px) rotateY(${(Math.sin(this.now * .7) * (4 + fs.hv * 30)).toFixed(1)}deg) scale(${(mx(.3, 1, rs) * (1 + fs.hv * .08)).toFixed(3)})`);
      if (fs.orbs.length) { fs.orb += dt * (.4 + fs.hv * 1.6); fs.orbs.forEach((p, j) => { const a = fs.orb * (1.6 - j * .4) + j * 2.1, rx = j ? 70 : 46, ry = j ? 20 : 13; this.S(p, 'transform', `translate(${(90 + Math.cos(a) * rx - 12).toFixed(1)}px,${(90 + Math.sin(a) * ry - 12).toFixed(1)}px)`); this.S(p, 'zIndex', Math.sin(a) > 0 ? '2' : '0'); }); }
      this.S(fs.head, 'transform', `rotate(${((1 - R) * 7 - R * 4).toFixed(2)}deg)`);
      this.S(fs.body, 'transform', `rotate(${((1 - R) * .8).toFixed(2)}deg) scaleY(${(1 - (1 - R) * .014).toFixed(4)})`);
      this.mv['card' + i] = sm(3.9, 3.1, dz) * sm(1.0, 1.6, dz);
      if (!n) this.pos['card' + i] = this.px6[i] < 0 ? [X + 150 * k + 24, Yb - 400 * k] : [X - 150 * k - 344, Yb - 400 * k];
    });
    const dzD = DOORZ - c;
    if (dzD > .05) { const s = F / dzD, kd = s / 200, X = W / 2, Yb = hy + s; this.S(q.door, 'visibility', 'visible'); this.S(q.door, 'transform', `translate(${(X - 110 * kd).toFixed(1)}px,${(Yb - 400 * kd).toFixed(1)}px) scale(${kd.toFixed(4)})`); this.S(q.door, 'zIndex', String(Math.round(1000 - dzD * 10))); this.gap = [X - 94 * kd, Yb - 384 * kd, X + 94 * kd, Yb]; }
    else this.S(q.door, 'visibility', 'hidden');
    this.S(q.train, 'transform', `translate(${(((this.now * 22) % (W * 1.5)) - W * .25).toFixed(1)}px,${(hy - 10).toFixed(1)}px)`);
  }

  /* ---------- 7 · the quiet room ---------- */
  w7(t) {
    const W = this.W, H = this.H, q = this.q7; if (!q) return;
    const g = this.gap; q.world.style.clipPath = t < 22.9 && g ? `polygon(${g[0].toFixed(1)}px ${g[1].toFixed(1)}px,${g[2].toFixed(1)}px ${g[1].toFixed(1)}px,${g[2].toFixed(1)}px ${g[3].toFixed(1)}px,${g[0].toFixed(1)}px ${g[3].toFixed(1)}px)` : 'none';
    const e6 = sm(21.9, 22.9, t), dol = lin(22.9, 24.1, t), e7 = sm(24.1, 25.1, t), C = [W / 2, H / 2];
    const z0 = mx(1.3, 1, e6) * (1 + dol * .05), pane = this.pane;
    const w0 = [C[0] + (pane.x - C[0]) * z0, C[1] + (pane.y - C[1]) * z0], Sm = Math.pow(pane.z / 1.05, e7);
    const z = z0 * Sm, A = [0, 1].map(k => w0[k] + (C[k] * (1 - z0) - w0[k]) * Sm + (C[k] - w0[k]) * e7);
    this.cam7 = `translate(${A[0].toFixed(1)}px,${A[1].toFixed(1)}px) scale(${z.toFixed(4)})`;
    this.S(q.cam, 'transform', this.cam7);
    const w = this.win0; this.win = [A[0] + w[0] * z, A[1] + w[1] * z, A[0] + w[2] * z, A[1] + w[3] * z];
  }

  /* ---------- 8 · the night sea ---------- */
  w8(t) {
    const W = this.W, H = this.H, q = this.q8, g = this.g8, P = window.Painter; if (!q) return;
    const w = this.win; q.world.style.clipPath = t < 25.1 && w ? `polygon(${w[0].toFixed(1)}px ${w[1].toFixed(1)}px,${w[2].toFixed(1)}px ${w[1].toFixed(1)}px,${w[2].toFixed(1)}px ${w[3].toFixed(1)}px,${w[0].toFixed(1)}px ${w[3].toFixed(1)}px)` : 'none';
    const e7 = sm(24.1, 25.1, t), z = mx(1.22, 1, e7), foot = sm(27.7, 28.5, t), ty = -H * .36 * foot - H * .06 * (1 - e7);
    this.S(q.cam, 'transform', `translate(${(W / 2 * (1 - z)).toFixed(1)}px,${(H / 2 * (1 - z) + ty).toFixed(1)}px) scale(${z.toFixed(4)})`);
    this.S(q.moon, 'transform', `translate(${(this.moon0[0] + (this.mx || 0) * 12).toFixed(1)}px,${(this.moon0[1] + (this.my || 0) * 8).toFixed(1)}px)`);
    const qo = sm(26.2, 26.85, t), cz = sm(27.55, 28.05, t);
    if (qo > 0 && cz < .999) {
      const k = (.08 + .92 * qo) * (1 - cz * .94); if (k !== this._k8) { this._k8 = k; const inn = this.ctear.at(g.cx, g.cy, g.rx * k, g.ry * k, 0), out = this.ctear.at(g.cx, g.cy, g.rx * k, g.ry * k, 1);
        q.plate.style.clipPath = `path(evenodd, "M0 0H${W}V${H * 1.5}H0Z ${P.toPath(out)}")`; q.rim.style.clipPath = `path(evenodd, "${P.toPath(out)} ${P.toPath(inn)}")`; }
      if (qo > .4 && !this._tore2) { this._tore2 = true; this.paper(); }
    } else if (this._k8 !== 0) { this._k8 = 0; q.plate.style.clipPath = 'none'; q.rim.style.clipPath = 'circle(0px)'; if (qo <= 0) this._tore2 = false; }
    const rq = sm(.6, 1, qo), ks = g.ks * mx(.7, 1, rq) * (1 - cz * .6), rx0 = g.cx - 330 * ks + cz * 80, ry0 = g.cy - 60 * ks - cz * 50, vis = qo > .6 && cz < .4;
    if (q.tsh) { this.S(q.tsh, 'visibility', qo > .3 && cz < .9 ? 'visible' : 'hidden'); this.S(q.tsh, 'transform', `translate(${(g.cx + 20 * ks).toFixed(1)}px,${(g.cy - 40 * ks).toFixed(1)}px) scale(${(g.rx / 150 * (.08 + .92 * qo) * (1 - cz * .9)).toFixed(3)})`); }
    this.S(q.reach, 'visibility', vis ? 'visible' : 'hidden'); this.S(q.reach, 'transform', `translate(${rx0.toFixed(1)}px,${ry0.toFixed(1)}px) scale(${ks.toFixed(3)})`);
    const ox = W / 2 * (1 - z), oy = H / 2 * (1 - z) + ty, th = this.thumbEl;
    if (th) { this.S(th, 'visibility', vis ? 'visible' : 'hidden'); this.S(th, 'transform', `translate(${(ox + rx0 * z).toFixed(1)}px,${(oy + ry0 * z).toFixed(1)}px) scale(${(ks * z).toFixed(4)})`); }
    const gx = ox + (rx0 + 60 * ks) * z, gy = oy + (ry0 + 296 * ks) * z, cw = this.cardW || 320;
    const cx = this.n ? Math.max(12, gx - cw / 2) : gx - 22, cy = gy - 12;
    this.cardT = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) rotate(${this.n ? -3 : 4}deg) perspective(700px) rotateY(${this.n ? 8 : 12}deg) rotateX(5deg)`;
    this.mv.ccard = sm(26.55, 26.9, t) * (1 - sm(27.4, 27.58, t));
    this.S(q.refl, 'transform', `translateX(${(Math.sin(this.now * .7) * 5).toFixed(1)}px)`);
  }

  /* ---------- things carried between worlds ---------- */
  dovePos(k, t) {
    const B = this.B, t0 = 4.2 + k * .09, u = lin(t0, t0 + .95, t); if (!B || u <= 0 || u >= 1) return null;
    const a = [-2.55, -1.85, -1.15, -.45, .35][k], R = Math.max(this.W, this.H) * 1.05, e = Math.pow(u, 1.7);
    return [B.x + Math.cos(a) * R * e, B.y + Math.sin(a) * R * e * .8 - u * this.H * .1, .3 + u * u * 3.4, Math.cos(a) < 0 ? -1 : 1];
  }
  carry(t) {
    this.dvEls.forEach((el, k) => { const p = this.dovePos(k, t); if (!p) { this.S(el, 'visibility', 'hidden'); [...el.children].forEach(c => this.S(c, 'visibility', 'hidden')); return; } const up = ((this.now * 7 + k * .37) | 0) % 2;
      this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) scale(${(p[2] * p[3]).toFixed(3)},${p[2].toFixed(3)})`); this.S(el, 'filter', p[2] > 2.2 ? `blur(${((p[2] - 2.2) * 1.5).toFixed(1)}px)` : 'none');
      const cs = el.children; if (cs[0]) this.S(cs[0], 'visibility', up ? 'visible' : 'hidden'); if (cs[1]) this.S(cs[1], 'visibility', up ? 'hidden' : 'visible'); });
    const sc = this.sandCtx, sEl = this.$('[data-sand]');
    if (sc && t > 16.95 && t < 18.2 && !this.red()) {
      const I = sm(16.95, 17.3, t) * (1 - sm(17.9, 18.2, t)), w = sc.canvas.width, h = sc.canvas.height; this.S(sEl, 'visibility', 'visible'); sc.clearRect(0, 0, w, h);
      const N = this.n ? 60 : 140; for (let i = 0; i < N; i++) { const r1 = (i * 0.6180339) % 1, r2 = (i * 0.4142135) % 1, sp = .4 + r2 * .8; const x = w - (((r1 + this.now * sp * .5) % 1) * (w + 80)) + 40, y = h * (.2 + r2 * .8) + Math.sin(this.now * 2 + i) * 6, L = 14 + r2 * 40; sc.strokeStyle = `rgba(${210 + (i % 3) * 12},${160 + (i % 4) * 10},${100 + (i % 5) * 6},${(.25 + r1 * .45) * I})`; sc.lineWidth = .8 + r2 * 1.6; sc.beginPath(); sc.moveTo(x, y); sc.lineTo(x + L, y - L * .08); sc.stroke(); }
    } else if (sEl && sEl._visibility !== 'hidden') { this.S(sEl, 'visibility', 'hidden'); sc && sc.clearRect(0, 0, sc.canvas.width, sc.canvas.height); }
    const wc = this.q7 && this.q7.wincam; if (wc) { const v = t >= 21.9 && t < 25.1 && this.cam7; this.S(wc, 'visibility', v ? 'visible' : 'hidden'); if (v) { this.S(wc, 'transform', this.cam7); wc.parentElement.style.clipPath = this.wEl[6].style.clipPath; } }
  }

  /* ---------- copy and chrome ---------- */
  introK() { if (!this._introT0) return 0; return lin(0, 1.6, (performance.now() - this._introT0) / 1000); }
  copy(t) {
    const ik = this.introK();
    for (const b of this.blocks || []) {
      let v = b.m ? (this.mv[b.id] || 0) : sm(b.a, b.a + .16, t) * (1 - sm(b.b - .16, b.b, t));
      if (b.hero) v *= ik;
      if (b.id === 'ccard') { if (this.cardT) this.S(b.el, 'transform', this.cardT); }
      else if (b.m && !this.n) { const p = this.pos[b.id]; if (p) this.S(b.el, 'transform', `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px)`); }
      if (Math.abs(v - b.v) < .003 && !(v === 0 && b.v !== 0) && !(v === 1 && b.v !== 1)) continue; b.v = v;
      b.el.style.visibility = v > 0 ? 'visible' : 'hidden'; b.el.style.pointerEvents = v > .6 ? 'auto' : 'none';
      const N = b.w.length || 1;
      b.w.forEach((w, i) => { const x = cl((v - i / N * .5) / .5); w.style.opacity = x.toFixed(3); w.style.transform = x >= 1 ? 'none' : `translateY(${((1 - x) * 14).toFixed(1)}px)`; w.style.filter = x >= 1 ? 'none' : `blur(${((1 - x) * 8).toFixed(1)}px)`; });
    }
    this.pos = {};
  }
  ui(t) {
    const wi = this.worldAt(t);
    if (wi !== this._wi) {
      this._wi = wi; const c = INK[wi] ? '#1B1D24' : '#F3EEE4';
      const nav = this.$('[data-nav]'); if (nav) { nav.style.color = c; nav.style.textShadow = SOFT[wi] ? '0 0 2px rgba(251,246,234,.9),0 1px 14px rgba(251,246,234,.95)' : wi === 0 ? '0 1px 2px rgba(18,34,68,.7),0 0 16px rgba(18,34,68,.6)' : 'none'; }
      this.bed(wi); if (this.props.notes || this.q('notes') === '1') this.setState({ world: wi });
    }
    const pr = this.$('[data-mprog]'); if (pr) this.S(pr, 'transform', `scaleX(${(t / TEND).toFixed(4)})`);
    const nc = this.$('[data-navcta]'); if (nc) { const on = t > .5; this.S(nc, 'opacity', on ? '1' : '0'); this.S(nc, 'translate', on ? '0px 0' : '24px 0'); this.S(nc, 'pointerEvents', on ? 'auto' : 'none'); }
  }
  // three.js scenes only live while their world is on screen.
  mounts(t) {
    if (!window.Scene3D || this.q('nogl')) return;
    const M = [['apple5', 1.4, 5.5], ['sandboard', 4.4, 17.3], ['roomqueen', 21.3, 25.2]];
    M.forEach(([k, a, b]) => { const el = this.$(`[data-3d="${k}"]`); if (!el) return; const on = t > a && t < b;
      if (on && !el._sc) el._sc = window.Scene3D.mount(el, k, () => this.st[k]).catch(e => { console.warn(e); return null; });
      else if (!on && el._sc) { const p = el._sc; el._sc = null; p.then(s => s && s.dispose()); } });
  }
  disposeAll() { this.$$('[data-3d]').forEach(el => { if (el._sc) { const p = el._sc; el._sc = null; p.then(s => s && s.dispose()); } }); }

  /* ---------- loader / blink ---------- */
  // The studio name is torn in half along a ragged line and the halves slide apart.
  runLoader() {
    const P = window.Painter, red = this.red();
    const line = P.tornLine(77), pts = line.map(([x, y]) => `calc(50% + ${x.toFixed(1)}px) ${y}%`), rimW = line.map((_, i) => 4 + ((i * 37) % 7));
    const L = this.$('[data-lhalf="l"]'), R = this.$('[data-lhalf="r"]'); if (!L || !R) { this._introT0 = performance.now(); return; }
    L.style.clipPath = `polygon(0 0,${pts.join(',')},0 100%)`; R.style.clipPath = `polygon(${pts.join(',')},100% 100%,100% 0)`;
    this.$('[data-lrim]', L).style.clipPath = `polygon(${pts.join(',')},${line.map(([x, y], i) => `calc(50% + ${(x - rimW[i]).toFixed(1)}px) ${y}%`).reverse().join(',')})`;
    this.$('[data-lrim]', R).style.clipPath = `polygon(${pts.join(',')},${line.map(([x, y], i) => `calc(50% + ${(x + rimW[i]).toFixed(1)}px) ${y}%`).reverse().join(',')})`;
    if (red) { this.$('[data-loader]').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 500, fill: 'forwards' }); setTimeout(() => this.setState({ loader: false }), 1250); this._introT0 = performance.now() + 900; return; }
    this.$$('[data-lword]').forEach(w => { w.style.webkitMaskImage = w.style.maskImage = 'linear-gradient(90deg,#000 42%,rgba(0,0,0,.35) 50%,transparent 58%)'; w.style.webkitMaskSize = w.style.maskSize = '260% 100%'; w.animate([{ maskPosition: '100% 0', webkitMaskPosition: '100% 0' }, { maskPosition: '0% 0', webkitMaskPosition: '0% 0' }], { duration: 900, easing: 'cubic-bezier(.5,.1,.3,1)', fill: 'both' }); });
    const o = { duration: 760, delay: 980, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' };
    L.animate([{ transform: 'translateX(0) rotate(0deg)', opacity: 1 }, { transform: 'translateX(-62%) rotate(-3deg)', opacity: .2 }], o);
    R.animate([{ transform: 'translateX(0) rotate(0deg)', opacity: 1 }, { transform: 'translateX(62%) rotate(3deg)', opacity: .2 }], o);
    this._introT0 = performance.now() + 1150; setTimeout(() => this.setState({ loader: false }), 1780);
  }
  blink() {
    const lid = this.q1 && this.q1.lid, g = this.g1;
    if (lid && g && !this.red() && (this.t || 0) < .8) lid.animate([{ transform: `translateY(${-g.lidUp}px)`, easing: 'cubic-bezier(.55,0,.85,.45)' }, { transform: 'translateY(0px)', offset: .26 }, { transform: 'translateY(0px)', offset: .34, easing: 'cubic-bezier(.25,.55,.35,1)' }, { transform: `translateY(${-g.lidUp}px)` }], { duration: 430 });
    this._blinkT = setTimeout(() => this.blink(), 4000 + Math.random() * 3000);
  }

  /* ---------- cursor ---------- */
  // A small dot that tracks the pointer exactly and becomes a magnifying lens over anything interactive; buttons pull toward it.
  initCursor() {
    const pm = e => { const g = this.g1; if (!g) return; this.mx = cl((e.clientX - g.P0.x) / (this.W * .5), -1, 1); this.my = cl((e.clientY - g.P0.y) / (this.H * .5), -1, 1); };
    addEventListener('pointermove', pm, { passive: true });
    if (!matchMedia('(pointer: fine)').matches || this._cursorCleanup) { this._cursorCleanup = () => removeEventListener('pointermove', pm); return; }
    const pos = document.createElement('div'), ring = document.createElement('div');
    Object.assign(pos.style, { position: 'fixed', left: '0', top: '0', zIndex: '9999', pointerEvents: 'none' });
    Object.assign(ring.style, { width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px', borderRadius: '50%', background: '#1B1D24', boxShadow: '0 0 0 1.5px rgba(243,238,228,.9)', transition: `width 600ms ${EASE},height 600ms ${EASE},margin 600ms ${EASE},background 600ms ease,box-shadow 600ms ease,backdrop-filter 600ms ease` });
    pos.appendChild(ring); document.body.appendChild(pos); document.documentElement.classList.add('dc-cursor');
    let tx = -80, ty = -80;
    pos.style.transform = 'translate3d(-80px,-80px,0)';
    const lensOn = { width: '64px', height: '64px', marginLeft: '-32px', marginTop: '-32px', background: 'radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(255,255,255,0) 45%),repeating-linear-gradient(0deg,rgba(27,29,36,.07) 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,rgba(27,29,36,.06) 0 1px,transparent 1px 5px)', boxShadow: 'inset 0 0 0 1.5px rgba(27,29,36,.85),inset 0 -6px 12px rgba(0,0,0,.18),0 0 0 1px rgba(243,238,228,.8)', backdropFilter: 'contrast(1.25) saturate(1.35) brightness(1.06)', WebkitBackdropFilter: 'contrast(1.25) saturate(1.35) brightness(1.06)' };
    const lensOff = { width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px', background: '#1B1D24', boxShadow: '0 0 0 1.5px rgba(243,238,228,.9)', backdropFilter: 'none', WebkitBackdropFilter: 'none' };
    const move = e => {
      tx = e.clientX; ty = e.clientY; pos.style.transform = `translate3d(${tx}px,${ty}px,0)`; if (this.red()) return;
      this.$$('[data-magnet]').forEach(m => { const r = m.getBoundingClientRect(); if (!r.width) return; const cx = r.left + r.width / 2 - (m._dx || 0), cy = r.top + r.height / 2 - (m._dy || 0), dx = tx - cx, dy = ty - cy, R = Math.max(r.width, r.height) / 2 + 40, k = Math.hypot(dx, dy) < R ? .25 : 0; m._dx = dx * k; m._dy = dy * k; m.style.transform = `translate(${m._dx.toFixed(1)}px,${m._dy.toFixed(1)}px)`; });
    };
    const over = e => { const hit = e.target.closest && e.target.closest('a,button,[data-hover],article'); this._hov = !!(hit && hit.closest('a,button')); Object.assign(ring.style, hit ? lensOn : lensOff); };
    addEventListener('mousemove', move); addEventListener('mouseover', over);
    this._cursorCleanup = () => { removeEventListener('pointermove', pm); removeEventListener('mousemove', move); removeEventListener('mouseover', over); pos.remove(); document.documentElement.classList.remove('dc-cursor'); };
  }

  /* ---------- founders ---------- */
  founderHover(i, on) {
    this.fHover[i] = on; const fs = this.fst && this.fst[i]; if (!fs || !fs.panel) return;
    fs.panel.style.opacity = on ? '1' : '0'; fs.panel.style.transform = on ? 'translateX(0)' : `translateX(${i % 2 ? 20 : -20}px)`; if (on) this.paper(.35);
  }
  forceOpen(o) { const m = /^f(\d)$/.exec(o || ''); if (m) setTimeout(() => this.founderHover(+m[1], true), 600); }

  /* ---------- sound ---------- */
  // Everything is synthesised from one buffer of pink noise; each world sets its own bed.
  toggleSound() {
    if (!this._ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const ac = new AC(), len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b0 = .99765 * b0 + w * .099; b1 = .963 * b1 + w * .2965; b2 = .57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * .1848) * .12; }
      const src = () => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; return s; };
      const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      const w = src(), lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; const bg = ac.createGain(); bg.gain.value = .5; w.connect(lp).connect(bg).connect(master);
      const wl = ac.createOscillator(), wlg = ac.createGain(); wl.frequency.value = .06; wlg.gain.value = 160; wl.connect(wlg).connect(lp.frequency);
      const s = src(), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 560; bp.Q.value = .6; const sg = ac.createGain(); sg.gain.value = 0; const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .09; lg.gain.value = 0; lfo.connect(lg).connect(sg.gain); s.connect(bp).connect(sg).connect(master);
      w.start(); s.start(0, 1.3); wl.start(); lfo.start();
      Object.assign(this, { _ac: ac, _master: master, _noise: buf, _lp: lp, _bg: bg, _sg: sg, _lg: lg });
      this._fx = setInterval(() => { if (!this.state.sound) return; const wi = this._wi; if (wi === 6) this.tick(); if ((wi === 2 || wi === 4) && Math.random() < .45) this.gull(); }, 1000);
    }
    const on = !this.state.sound; this._ac.resume();
    this._master.gain.setTargetAtTime(on ? .55 : 0, this._ac.currentTime, .6);
    this.$$('[data-bar]').forEach((b, i) => { b._a && b._a.cancel(); b._a = null; if (on && !this.red()) b._a = b.animate([{ transform: 'scaleY(.3)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(.5)' }, { transform: 'scaleY(.3)' }], { duration: 1400 + i * 260, iterations: Infinity, easing: 'ease-in-out' }); });
    this.setState({ sound: on }, () => this.bed(this._wi || 0));
  }
  bed(wi) { if (!this._ac) return; const b = BEDS[wi] || BEDS[0], T = this._ac.currentTime; this._lp.frequency.setTargetAtTime(b.f, T, 1.2); this._bg.gain.setTargetAtTime(b.g, T, 1.2); this._sg.gain.setTargetAtTime(b.s * .5, T, 1.2); this._lg.gain.setTargetAtTime(b.s * .45, T, 1.2); }
  tick() { const ac = this._ac, s = ac.createBufferSource(); s.buffer = this._noise; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2600; const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .03); s.connect(f).connect(g).connect(this._master); s.start(t, Math.random() * 3); s.stop(t + .05); }
  gull() { const ac = this._ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(1050, t + .28); o.frequency.setValueAtTime(1450, t + .34); o.frequency.exponentialRampToValueAtTime(1000, t + .62); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03, t + .04); g.gain.linearRampToValueAtTime(.0, t + .3); g.gain.linearRampToValueAtTime(.025, t + .38); g.gain.linearRampToValueAtTime(0, t + .66); o.connect(g).connect(this._master); o.start(t); o.stop(t + .7); }
  paper(vol = 1) {
    if (!this.state.sound || !this._ac) return;
    const ac = this._ac, s = ac.createBufferSource(); s.buffer = this._noise; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
    const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(0, t); for (let i = 0; i < 8; i++) g.gain.linearRampToValueAtTime((.15 + Math.random() * .35) * vol, t + .03 + i * .04); g.gain.linearRampToValueAtTime(0, t + .4);
    s.connect(f).connect(g).connect(ac.destination); s.start(t, Math.random() * 3); s.stop(t + .45);
  }
  crunch() { if (!this.state.sound || !this._ac) return; const ac = this._ac, s = ac.createBufferSource(); s.buffer = this._noise; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2; const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(0, t); for (let i = 0; i < 5; i++) g.gain.linearRampToValueAtTime(.3 + Math.random() * .4, t + .02 + i * .03); g.gain.linearRampToValueAtTime(0, t + .22); s.connect(f).connect(g).connect(ac.destination); s.start(t, Math.random() * 3); s.stop(t + .25); }

  /* ---------- navigation ---------- */
  go(to, e) { e && e.preventDefault && e.preventDefault(); if (this.state.menu) this.setState({ menu: false }); scrollTo({ top: VI(JUMP[to] ?? 0) * (this.H || innerHeight), behavior: this.red() ? 'auto' : 'smooth' }); }
}
