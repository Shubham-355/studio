/* eslint-disable @typescript-eslint/no-unused-expressions -- short-circuit calls are the house style here */
/* Scroll-driven painted homepage. The scroll position maps to a timeline t (0 -> TEND);
   each world paints itself onto canvases once, then every frame only moves cameras. */
import { loadPainter } from "@/lib/painter";
import { COMPANIES } from "./content";

const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lin = (a, b, x) => cl((x - a) / (b - a)), sm = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); }, mx = (a, b, t) => a + (b - a) * t;
const EASE = 'cubic-bezier(.2,.7,.2,1)';
export const TEND = 28.6;
export const SPACER_VH = 2120;
const RANGE = [[0, 1.62], [-1, 4.42], [2.6, 14.06], [-2, -1], [2.6, 18.21], [16.6, 22.91], [21.4, 25.11], [24.1, 99]];
const NAVT = [0, 1.0, 4.3, 13.0, 13.0, 17.5, 22.5, 24.6];
const JUMP = { home: 0, how: 14.2, companies: 18.6, contact: 26.9 };
const PA = 3.2, PB = 4.4, TB1 = 12.4, GAP = TB1 - PB;
const V1 = s => s <= PB ? s : s + GAP, VI1 = t => t <= PB ? t : t <= TB1 ? PB : t - GAP;
const QA = 16.6, QB = 18.2, QL = 1.2, QK = (QB - QA) / QL, QD = QB - QA - QL;
const V = s => { const u = V1(s); return u <= QA ? u : u <= QA + QL ? QA + (u - QA) * QK : u + QD; }, VI = t => VI1(t <= QA ? t : t <= QB ? QA + (t - QA) / QK : t - QD);
const QS = .95, QY = .04, QZ = -3.5, QX = .5, YC = 1.335, QR = y => y <= 1.24 ? .22 : y >= 1.52 ? .34 : y < 1.36 ? mx(.22, .28, (y - 1.24) / .12) : mx(.28, .34, (y - 1.36) / .16);
export const NAMES = ['The sky with an eye', 'The apple on the board', 'The beach', 'The underwater hall', 'The board in the sand', 'The desert arcade', 'The quiet room', 'The night sea'];
const INK = [0, 1, 1, 0, 1, 1, 1, 0], SOFT = [0, 0, 1, 0, 1, 0, 1, 0];
const CZ = [6, 11, 16, 21], DOORZ = 27;
const CPTS = [[18.2, -2], [19.35, 3.4], [20.05, 8.4], [20.75, 13.4], [21.45, 18.4], [21.95, 21.2], [22.9, 26.62]];
const BEATS = [.05, 2.0, 2.95, 12.45].concat([14.3, 14.74, 15.24, 15.73, 16.23, 16.6, 17.65, 18.6, 19.35, 20.05, 20.75, 21.45, 22.1, 23.6, 25.7, 27.1, 28.4]);
const BEDS = [{ f: 420, g: .5, s: .05 }, { f: 800, g: .26, s: .2 }, { f: 1100, g: .3, s: .65 }, { f: 170, g: .8, s: .04 }, { f: 1000, g: .28, s: .55 }, { f: 300, g: .45, s: 0 }, { f: 260, g: .04, s: 0 }, { f: 520, g: .32, s: .45 }];
export const NOTES = [
  'Scroll 0–1.58. The eye looks down first (0–0.2), then one camera pitch from the sky to the horizon: the torn sky and the eye slide up, near clouds pass at 1.35×, the sky warms toward the low sun. Horizon at 45% when settled.',
  'Apple on the checkerboard, one-point perspective, low sun on the left: cast shadows, contact shadows and the glossy reflection are computed on the real floor. One bite 2.62–2.76. Push 3.2–4.4: the camera travels along the ray into the bite; the beach is a live render behind it, flesh warms to sand.',
  'Lands on the beach frame with the ball rolling to rest in front of the 8×8 board. Rise 12.4–14.05 into the overhead view.',
  '',
  'Board reached from the beach rise (ends 14.05, pawn emerges 13.1–13.9); pawn crosses 14.25–16.55, wave makes the queen. Into the queen 16.6–18.2 (1.2 screens of scroll): settle over the crown, push into the front arch (board blurs by depth), sunset light stains the porcelain stroke by stroke, the arch widens into the arcade and the board squares become its floor.',
  'Arcade seen through the crown arch from 16.6, full frame at 18.2. Founders at z 6/11/16/21: thoughts resolve as the camera nears (dz 4.9→3.2) and scatter again on the way back. Hover: object turns, panel slides out.',
  'Walk through the door 21.9–22.9. Dolly 22.9–24.1. Window 24.1–25.1: camera turns into the lower-left pane, world 8 visible through the glass throughout.',
  'Quote 25.25–26.25. Tear opens 26.2–26.85; arm emerges from shadow inside it and holds the card (thumb in front, fingers behind). Card leaves 27.4; tear closes 27.55–28.05 as the camera lowers to the water; footer from 27.75.',
];

export class HomeEngine {
  /** host: { props: { motion, notes }, getState(), setState(patch, cb?), forceUpdate() } */
  constructor(host) {
    this.host = host;
    this.st = { apple8: {}, sandboard: {}, roomqueen: {} };
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
  async waitLibs() { for (let i = 0; i < 400 && !(window.Painter && window.Painter.beach6cfg && window.Painter.apple8Sky && window.Scene3D); i++) await new Promise(r => setTimeout(r, 30)); }

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
    this.layout1(); this.layout2(); this.layout3(); this.layout4(); this.layout6(); this.layout7(); this.layout8();
    this.blocks = this.$$('[data-copy]').map(el => ({ el, m: el.dataset.copy === 'm', id: el.dataset.id, a: +el.dataset.a, b: +el.dataset.b, hero: el.hasAttribute('data-hero'), w: this.$$('[data-w]', el), v: -1 }));
    this.dvEls = this.$$('[data-dove]'); this.fEls = this.$$('[data-founder]'); this.pshEls = this.$$('[data-pshadow]');
    this.fst = this.fEls.map(el => ({ ph: 0, hv: 0, orb: 0, th: this.$$('[data-th]', el), res: this.$('[data-res]', el), turn: this.$('[data-turn]', el), head: this.$('[data-head]', el), body: this.$('[data-body]', el), orbs: this.$$('[data-orb]', el), panel: this.$('[data-panel]', el) }));
    this.$$('[data-kscale]').forEach(el => el.style.zoom = this.n ? '1.1' : String(Math.min(1.45, this.H / 620)));
    this._ballT = null; this._nogl = !!this.q('nogl');
    this.m3d = { apple8: this.$('[data-3d="apple8"]'), sandboard: this.$('[data-3d="sandboard"]'), roomqueen: this.$('[data-3d="roomqueen"]') };
    this.ch = { nav: this.$('[data-nav]'), prog: this.$('[data-mprog]'), cta: this.$('[data-navcta]') };
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
    const fov = n ? 42 : 30, F = H / 2 / Math.tan(fov * Math.PI / 360), L = H * 1.5, tan1 = -.05 * H / F, tan0 = (.45 * H + L - H / 2) / F, Yh = L - .55 * H, Hp = Yh + .34 * H, sunX = W * (n ? .2 : .45);
    const C = n ? [0, 1.25, 9.6] : [-1, 1.1, 9.8], shift = n ? 0 : .05 * W;
    const peb = n ? [{ x: -.55, z: 6.1, r: .1 }, { x: .12, z: 6.5, r: .07 }, { kind: 'scallop', flip: 1, x: .5, z: 5.6, r: .15, rot: .5 }, { kind: 'spiral', x: -.2, z: 5.2, r: .2, rot: 1.1 }] : [{ x: -2.5, z: 4.4, r: .15 }, { x: -1.75, z: 3.3, r: .09 }, { kind: 'scallop', flip: 1, x: .3, z: 4.0, r: .2, rot: .6 }, { kind: 'spiral', x: -.9, z: 4.9, r: .26, rot: .9 }, { kind: 'scallop', x: 1.1, z: 2.6, r: .16, rot: -.4 }];
    this.g2 = { W, H, n, fov, F, L, tan0, tan1, Yh, Hp, sunX, C, shift, peb, gulls: n ? [[.15, .2], [.75, .16], [.86, .22]] : [[.9, .2], [.95, .14], [.46, .13]] };
    const plate = this.$('[data-plate]', w2), cl = this.$('[data-a8cloud]', w2), sea = this.$('[data-a8sea]', w2);
    if (plate) Object.assign(plate.style, { width: W + 'px', height: Hp + 'px' });
    if (cl) Object.assign(cl.style, { width: W * 1.3 + 'px', height: H * .42 + 'px', left: -.15 * W + 'px' });
    if (sea) { const sh = H * .16; Object.assign(sea.style, { width: W + 'px', height: sh + 'px' }); sea.width = Math.round(W * .6); sea.height = Math.round(sh * .6); }
    this.q2 = { world: w2, plate, cl, sea, sx: sea && sea.getContext('2d'), gulls: this.$$('[data-gull2]', w2), alay: this.$('[data-applelayer]') };
    Object.assign(this.st.apple8, { cam: null, peb });
  }
  tiltAt(t) { const G = this.g2; if (!G) return null; const e = sm(.08, 1.58, t), tn = mx(G.tan0, G.tan1, e); return { e, tn, top: this.H / 2 + G.F * tn - G.Yh, topE: this.H - G.L }; }
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
    const st = this.st.apple8; if (t >= PB || !st || !st.Ds) return { cx: 0, cy: 0, cs: 1 };
    const W = this.W, H = this.H, e = sm(PA, PB, t), k0 = .15, D = st.Ds, C0 = [W * .55, H * .66], R = st.pm ? st.pm[2] : 0;
    let k = Math.pow(k0, 1 - e), C = C0;
    for (let i = 0; i < 3; i++) { const dm = Math.max(1, Math.min(C[0], W - C[0], C[1], H - C[1])); k = Math.min(1, Math.max(Math.pow(k0, 1 - e), R * 1.08 / dm)); const u = (k - k0) / (1 - k0); C = [mx(C0[0], D[0], u), mx(C0[1], D[1], u)]; }
    return { cx: D[0] - k * C[0], cy: D[1] - k * C[1], cs: k };
  }
  cam6(t) {
    const S = this.S6, e0 = sm(PA, PB, t);
    const c = { x: S.Xb, y: 1, z: S.Zend + .2 - .6 * (1 - e0), ph: 0, f: S.F, cx: this.W / 2, cy: S.hy };
    const e = sm(TB1, 14.05, t); if (e <= 0) return c; const O = S.camO;
    return { x: mx(c.x, O.x, e), y: mx(1, O.y, e), z: mx(c.z, O.z, e), ph: mx(0, O.ph, e), f: Math.exp(mx(Math.log(c.f), Math.log(O.f), e)), cx: mx(c.cx, O.cx, e), cy: mx(c.cy, O.cy, e) };
  }
  ball6At(t) { const S = this.S6, b = S.rest, a = { X: b.X + .6, Z: b.Z - .05 }, u = sm(PA + .45 * (PB - PA), PB, t), L = Math.hypot(b.X - a.X, b.Z - a.Z) + .1; return { X: mx(a.X, b.X, u), Z: mx(a.Z, b.Z, u), rho: u * L / S.br }; }
  layout4() {
    const w5 = this.wEl[4]; if (!w5) return; const s5 = this.$('[data-surf5]', w5);
    this.q5 = { world: w5, clip: this.$('[data-w5clip]'), wcam: this.$('[data-w5cam]'), tall: this.$('[data-tall]', w5), s5, sx5: s5 && s5.getContext('2d'), b6: this.$('[data-paint="b6tall"]', w5), ql: this.$('[data-qlayer]') };
    if (this.q5.b6) this.q5.b6.style.transformOrigin = '0 0'; this.st.sandboard.qel = this.q5.ql;
    w5.style.maskSize = w5.style.webkitMaskSize = '100% 100%, 100% 100%'; w5.style.maskRepeat = w5.style.webkitMaskRepeat = 'no-repeat';
  }
  layout6() {
    const W = this.W, H = this.H, n = this.n, w6 = this.wEl[5]; if (!w6) return;
    this.F6 = n ? H * .52 : H * .9; this.hy6 = H * .56; this.px6 = n ? [-.4, .4, -.4, .4] : [-1.35, 1.35, -1.35, 1.35]; this.pw6 = n ? 1.05 : 1;
    const fl = this.$('[data-qfloor]', w6); if (fl) { fl.width = Math.round(W * 1.16 * .6); fl.height = Math.round(H * 1.16 * .6); fl._k = .6; }
    this.q6 = { world: w6, cam: this.$('[data-cam]', w6), plate: this.$('[data-plate]', w6), door: this.$('[data-door]', w6), train: this.$('[data-train]', w6), floor: fl };
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
    this.thumbEl = this.$('[data-thumb]'); const cc = this.$('[data-id="ccard"]'); this.cardW = cc ? cc.offsetWidth || 320 : 320; if (cc) cc.style.transformOrigin = n ? '50% 0' : '0 0';
  }
  mixc(a, b, t) { const P = window.Painter, A = P.hex(a), B = P.hex(b); return `rgb(${Math.round(mx(A[0], B[0], t))},${Math.round(mx(A[1], B[1], t))},${Math.round(mx(A[2], B[2], t))})`; }

  /* ---------- painting ---------- */
  queuePaint() {
    const P = new Proxy({}, { get: (_, k) => window.Painter[k] }), g = this.g1, n = this.n, R = this.room;
    const J = [
      [0, 'sky1', cv => P.sky(cv, { seed: 1, w: cv.offsetWidth, h: cv.offsetHeight, stops: [[0, '#79A6DC'], [.4, '#4F84C8'], [1, '#3E78C4']], clouds: n ? 6 : 11, cy0: .17, cy1: .7, cs0: .05, cs1: .11 })],
      [0, 'near1', cv => P.cloudLayer(cv, { seed: 5, spots: n ? [[.06, .92, .12], [.95, .95, .1]] : [[.03, .9, .08], [.97, .88, .07], [.99, .5, .05]] })],
      [0, 'face', cv => P.face6(cv, g.fw, g.fh)], [0, 'eyeball', cv => P.eyeball6(cv, g.fw, g.fh)], [0, 'iris', cv => P.iris6(cv, g.ir, n ? 1600 : 3200)],
      [0, 'eyeshade', cv => P.eyeShade6(cv, g.fw, g.fh)], [0, 'eyeglint', cv => P.eyeGlint6(cv, g.fw, g.fh, g.ir)],
      [0, 'lid', cv => { P.lid6(cv, g.fw, g.fh); cv.style.transform = `translateY(${-g.lidUp}px)`; }], 
      [0, 'skin', cv => P.skinField6(cv, g.PW, g.PH, g.E, g.ox, g.oy)],
      [1, 'a8sky', cv => P.apple8Sky(cv, this.g2)], [1, 'a8cloud', cv => P.apple8Clouds(cv, this.g2)],
      [2, 'b6sky', cv => P.beach6Sky(cv, this.S6)], [2, 'b6g0', cv => P.beach6Ground(cv, this.S6, 0)], [2, 'b6gull', cv => P.gull6(cv)], [2, 'b6g1', cv => P.beach6Ground(cv, this.S6, 1)],
            [4, 'b6tall', cv => P.beach6Tall(cv, this.S6)],
      [5, 'desert', cv => P.arcade7(cv, { hy: .56, F: n ? .52 : .9, xw: n ? 1.3 : 2.6 })], [5, 'founder', cv => P.founder7(cv, +cv.dataset.v)], [5, 'head', cv => P.head7(cv, +cv.dataset.v)], [5, 'thought', cv => P.thought7(cv, cv.dataset.kind)], [5, 'resolved', cv => P.resolved(cv, +cv.dataset.v)], [5, 'planet', cv => P.planet(cv, cv.dataset.col)],
      [6, 'room', cv => P.room(cv, R)],
      [7, 'night', cv => P.nightSea(cv, { hy: .413, mx: this.g8.mx })], [7, 'morning', cv => P.morning(cv)], [7, 'moon', cv => P.moon(cv)], [7, 'reach3', cv => P.reach3(cv)], [7, 'thumb3', cv => P.thumb3(cv)],
    ];
    const at = parseFloat(this.q('at')), aw = isNaN(at) ? -1 : this.worldAt(at);
    this.pq = []; J.forEach(([w, k, fn]) => { if (aw >= 0 && Math.abs(w - aw) > 1 && !(aw === 1 && w === 2)) return; this.$$(`[data-paint="${k}"]`).forEach(cv => this.pq.push({ w, cv, fn })); });
    const token = (this._pt = (this._pt || 0) + 1);
    // Plates near the visible world get a deadline; far ones wait for genuinely idle time so they never stall a scroll.
    const idle = (f, urgent) => window.requestIdleCallback ? requestIdleCallback(f, urgent ? { timeout: 100 } : undefined) : setTimeout(f, urgent ? 16 : 120);
    const step = deadline => {
      if (token !== this._pt || !this._alive || !this.pq.length) return;
      const cur = this.worldAt(this.t || 0); let bi = 0, bd = 99; this.pq.forEach((j, i) => { const d = Math.abs(j.w - cur) + (j.w < cur ? .5 : 0); if (d < bd) { bd = d; bi = i; } });
      if (bd > 1.5 && (this._moving || (deadline && !deadline.didTimeout && deadline.timeRemaining() < 8))) { idle(step, false); return; }
      const j = this.pq.splice(bi, 1)[0], cv = j.cv;
      cv.getBoundingClientRect = () => ({ width: cv.offsetWidth, height: cv.offsetHeight, left: 0, top: 0, right: cv.offsetWidth, bottom: cv.offsetHeight });
      const wd = cv.closest('[data-world]'), hid = wd && wd.style.display === 'none'; if (hid) wd.style.display = '';
      try { j.fn(cv); } catch (e) { console.warn('paint ' + (cv.dataset.paint || '') + ': ' + (e && e.message || String(e))); } delete cv.getBoundingClientRect; if (hid) wd.style.display = 'none';
      const nxt = this.pq.length ? Math.min(...this.pq.map(x => Math.abs(x.w - this.worldAt(this.t || 0)))) : 9;
      if (this.pq.length) idle(step, nxt <= 1.5); else if (window.Scene3D && !this._nogl) window.Scene3D.load();
    };
    idle(step, true);
  }

  /* ---------- frame loop ---------- */
  loop() {
    if (!this._alive) return; const pn = performance.now(); clearTimeout(this._lt); this._lt = setTimeout(this._loopF, 120); if (this._lastF && pn - this._lastF < 8) return; this._lastF = pn;
    requestAnimationFrame(this._loopF);
    if (!this.W) { if (innerWidth > 0) { const n = innerWidth < 820; if (n !== this.state.narrow) this.setState({ narrow: n }); else this.relayout(true); } return; }
    if (this._at == null) { const a = parseFloat(this.q('at')); this._at = isNaN(a) ? false : a; if (this._at !== false) { this.t = this._at; this._introT0 = performance.now() - 5000; } }
    const sT = this._at !== false ? VI(this._at) : cl(scrollY / this.H, 0, VI(TEND));
    if (this.s == null) this.s = VI(this.t || 0);
    if (this.red()) { const b = this.beat(V(sT)); if (b !== this._beat) { if (this._beat != null) this.fadeSwap(); this._beat = b; } this.t = b; this.s = VI(b); }
    else { const d = sT - this.s; this._moving = Math.abs(d) > .01; this.s = Math.abs(d) < .0008 ? sT : this.s + d * .085; this.t = this._at !== false ? this._at : V(this.s); this._beat = null; }
    this.now = performance.now() / 1000;
    try { this.render(this.t); } catch (e) { if (!this._errd) { this._errd = 1; console.error(e); } }
  }
  beat(x) { let b = BEATS[0]; for (const v of BEATS) if (x >= v - .3) b = v; return b; }
  fadeSwap() { ['[data-stage]', '[data-copylayer]'].forEach(s => { const el = this.$(s); el && el.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 600, easing: 'ease-out' }); }); }
  worldAt(t) { let k = 0; for (let i = 0; i < 8; i++) if (t >= NAVT[i]) k = i; return k; }
  render(t) {
    this.mv = {}; this.m3 = 'none'; this.tilt = this.tiltAt(t); this.qstate(t);
    for (let k = 0; k < 8; k++) { const el = this.wEl[k]; if (!el) continue; const on = t >= RANGE[k][0] && t < RANGE[k][1]; if (el._on !== on) { el._on = on; el.style.visibility = on ? 'visible' : 'hidden'; el.style.display = on ? '' : 'none'; } if (on) this['w' + (k + 1)](t); }
    this.st.apple8.active = t < PB + .02; this.st.sandboard.active = t > 2.55 && t < 18.25; if (t >= PB && this.q1 && this.q1.near) this.S(this.q1.near, 'visibility', 'hidden'); this.drawBall(t); this.st.roomqueen.active = t > 21.3 && t < 25.2;
    this.carry(t); this.copy(t); this.ui(t); this.mounts(t);
  }

  w1(t) {
    const g = this.g1, q = this.q1, P = window.Painter, W = this.W, H = this.H; if (!g || !q) return;
    if (this._s1 !== 1) { this._s1 = 1; const inn = this.tear.at(g.cx, g.cy, g.rx, g.ry, 0), out = this.tear.at(g.cx, g.cy, g.rx, g.ry, 1);
      q.plate.style.clipPath = `path(evenodd, "M0 0H${W}V${H + 60}H0Z ${P.toPath(out)}")`; if (this.rimCtx) P.tearRim6(this.rimCtx, inn, out, this.tear, g.cx, g.cy, this.dpr1); }
    const T = this.tilt, off = T ? T.top - H : 0;
    this.S(this.wEl[0], 'transform', `translateY(${off.toFixed(1)}px)`); this.S(q.face, 'transform', 'none');
    const gz = sm(0, .2, t), f = (1 - sm(.8, .95, t)) * (1 - gz);
    this.S(q.eye, 'transform', `translate(${((this.mx || 0) * g.ex * f).toFixed(1)}px,${((this.my || 0) * g.ey * f + g.ey * 1.15 * gz).toFixed(1)}px)`);
    this._pk = mx(this._pk ?? 1, this._hov && t < .4 ? .8 : 1, .07); this.S(q.pupil, 'transform', `scale(${this._pk.toFixed(3)})`);
  }
  /* one camera: pitch from the sky down to the horizon, then a push along the ray into the bite */
  w2(t) {
    const W = this.W, H = this.H, q = this.q2, G = this.g2, T = this.tilt; if (!q || !G || !T) return;
    const dy = T.top - T.topE;
    this.S(q.plate, 'transform', `translateY(${T.top.toFixed(1)}px)`);
    this.S(q.cl, 'transform', `translate(${(Math.sin(this.now * .015) * W * .06).toFixed(1)}px,${(T.topE + dy * 1.12 + G.Yh - H * .5).toFixed(1)}px)`);
    const nr = this.q1 && this.q1.near; if (nr) { const o = (T.top - H) * 1.35, on = o > -H * 1.3; this.S(nr, 'visibility', on ? 'visible' : 'hidden'); if (on) this.S(nr, 'transform', `translate(${(Math.sin(this.now * .05) * 24).toFixed(1)}px,${o.toFixed(1)}px)`); }
    const sy = T.top + G.Yh - 2, seaOn = sy < H; this.S(q.sea, 'visibility', seaOn ? 'visible' : 'hidden');
    if (seaOn && q.sx) { this.S(q.sea, 'transform', `translateY(${sy.toFixed(1)}px)`); window.Painter.sea8(q.sx, q.sea.width, q.sea.height, G.sunX * .6, this.now, .6); }
    q.gulls.forEach((el, i) => { const gp = G.gulls[i]; if (!gp) return; const a = this.now * (.04 + i * .011) + i * 2.1, x = W * gp[0] + Math.sin(a) * W * .03, y = dy + H * gp[1] + Math.sin(a * 1.7) * 6, s2 = (this.n ? .3 : .34) + i * .05, fl = .7 + Math.sin(this.now * 3 + i * 1.3) * .3, dir = Math.cos(a) >= 0 ? 1 : -1;
      this.S(el, 'transform', `translate(${(x - 45).toFixed(1)}px,${(y - 20).toFixed(1)}px) scale(${(s2 * dir).toFixed(3)},${(s2 * fl).toFixed(3)})`); });
    const st = this.st.apple8, pe = sm(PA, PB, t);
    st.cam = { C: G.C, pitch: Math.atan(T.tn), fov: G.fov, shift: G.shift }; st.peb = G.peb;
    st.dolly = pe; st.bk = [sm(2.62, 2.69, t), sm(2.71, 2.79, t)]; st.bite = Math.max(st.bk[0], st.bk[1]); st.port = pe < .72 ? mx(.1, .15, sm(.3, .72, pe)) : mx(.15, 1.3, sm(.72, .97, pe)); st.sand = sm(.5, .85, pe);
    if (st.bk[0] > .3 && !this._bit1) { this._bit1 = 1; this.crunch(); } if (st.bk[0] < .1) this._bit1 = 0; if (st.bk[1] > .3 && !this._bit2) { this._bit2 = 1; this.crunch(); } if (st.bk[1] < .1) this._bit2 = 0;
    this.S(q.alay, 'visibility', t < PB - .0005 ? 'visible' : 'hidden');
    let m3 = 'linear-gradient(transparent,transparent)';
    if (st.ready && st.pm && st.ac && st.bite > .02) { const far = (x, y) => Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)), [ax, ay, aR] = st.ac, [px, py, pR] = st.pm;
      m3 = aR * .8 > far(ax, ay) || pR > far(px, py) ? 'none' : `radial-gradient(circle ${(aR * .8).toFixed(1)}px at ${ax.toFixed(1)}px ${ay.toFixed(1)}px, #000 98%, transparent 100%), radial-gradient(circle ${pR.toFixed(1)}px at ${px.toFixed(1)}px ${py.toFixed(1)}px, #000 98%, transparent 100%)`; }
    this.m3 = m3;
  }
  w3(t) {
    const W = this.W, H = this.H, q = this.q3, S = this.S6, n = this.n; if (!q || !S) return; const P = window.Painter, pr = P.cam6.proj;
    const C = this.cam3(t), m3 = this.m3 || 'none';
    this.S(q.world, 'clipPath', 'none'); this.S(q.world, 'maskImage', m3); this.S(q.world, 'webkitMaskImage', m3);
    this.S(q.cam, 'transform', `translate(${C.cx.toFixed(1)}px,${C.cy.toFixed(1)}px) scale(${C.cs.toFixed(4)})`);
    const c = this.cam6(t), s = c.f / S.F, vh = c.cy - c.f * Math.tan(c.ph);
    this.S(q.sky, 'transform', `matrix(${s.toFixed(5)},0,0,${s.toFixed(5)},${(W / 2 - s * W / 2 - s * .04 * W).toFixed(2)},${(vh - s * S.hy - s * .04 * H).toFixed(2)})`);
    const hm = (el, pose) => { if (!el) return; const z1 = Math.max(c.z, pose.z) + 1.6, pts = [[c.x - 1.5, z1], [c.x + 1.5, z1], [c.x + 1.5, z1 + 6], [c.x - 1.5, z1 + 6]];
      this.S(el, 'transform', P.homog(pts.map(([X, Z]) => { const p = pr(pose, X, 0, Z); return [p[0] + .1 * W, p[1]]; }), pts.map(([X, Z]) => pr(c, X, 0, Z)))); };
    hm(q.g0, S.pose0); hm(q.g1, S.poseE); this.S(q.g1, 'opacity', '1');
    if (q.sx) { const k = q.surf._k; P.surf6(q.sx, Object.assign({}, c, { f: c.f * k, cx: c.cx * k, cy: c.cy * k }), S, this.now, 0, k, q.surf.width, q.surf.height); }
    const gOn = t > 2.6 && t < 12.9 && c.ph < .3;
    q.gulls.forEach((el, i) => { if (!gOn) { this.S(el, 'visibility', 'hidden'); return; } const a = this.now * (.05 + i * .012) + i * 2.1, x = W * (n ? .3 + i * .2 : .26 + i * .13) + Math.sin(a) * W * (n ? .12 : .07), y = Math.max(n ? 132 : 124, H * (.1 + i * .045)) + Math.sin(a * 1.7) * 10 - (vh - S.hy), s2 = (n ? .45 : .6) + i * .12, fl = .7 + Math.sin(this.now * 3.2 + i * 1.3) * .3, dir = Math.cos(a) >= 0 ? 1 : -1;
      this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${(x - 45).toFixed(1)}px,${(y - 20).toFixed(1)}px) scale(${(s2 * dir).toFixed(3)},${(s2 * fl).toFixed(3)})`); });
  }
  drawBall(t) {
    const q = this.q3, x = q && q.bx, S = this.S6; if (!x || !S) return; const on = t > 2.6 && t < 17.55;
    this.S(q.ball, 'visibility', on ? 'visible' : 'hidden'); if (!on || this._ballT === t) return; this._ballT = t;
    const k = q.ball._k, P = window.Painter, pr = P.cam6.proj; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, q.ball.width, q.ball.height);
    let c, ox = 0, oy = 0; if (t < 14.05) c = this.cam6(t); else c = this.qs ? this.qs.c6 : S.camO;
    this.S(q.ball, 'filter', (this.qs && this.qs.blur > .05 ? `blur(${this.qs.blur.toFixed(2)}px) ` : '') + 'sepia(.28) saturate(1.06) hue-rotate(-9deg) brightness(1.02)');
    const C3 = this.cam3(t); x.setTransform(k * C3.cs, 0, 0, k * C3.cs, k * (C3.cx + ox), k * (C3.cy + oy));
    { const mm = t < PB ? (this.m3 || 'none') : 'none'; this.S(q.ball, 'maskImage', mm); this.S(q.ball, 'webkitMaskImage', mm); }
    const b = this.ball6At(t), r = S.br, sn = S.sun, cp = pr(c, b.X, r, b.Z); if (cp[2] < .15) return;
    const L = Math.hypot(sn[0], sn[1]), ux = sn[0] / L, uz = sn[1] / L, sx0 = b.X + sn[0] * r, sz0 = b.Z + sn[1] * r;
    x.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, la = Math.cos(a) * r * 1.7, lc = Math.sin(a) * r, p = pr(c, sx0 + ux * la - uz * lc, 0, sz0 + uz * la + ux * lc); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); } x.closePath();
    x.filter = 'blur(2px)'; x.fillStyle = 'rgba(70,84,128,.34)'; x.fill(); x.filter = 'none';
    const R = c.f * r / cp[2], g = pr(c, b.X, 0, b.Z); x.fillStyle = 'rgba(46,48,70,.35)'; x.beginPath(); x.ellipse(g[0], g[1], R * .55, Math.max(1, R * .16), 0, 0, 7); x.fill();
    P.ball6(x, cp[0], cp[1], R, b.rho, this.ballTex);
  }
  w4() { /* the underwater hall is not part of this cut */ }
  w5(t) {
    const W = this.W, H = this.H, q = this.q5, S = this.S6; if (!q || !S) return; const P = window.Painter, pr = P.cam6.proj;
    const e = sm(TB1, 14.05, t), ty = -1.2 * H, C = this.cam3(t), Q = this.qs;
    { const mm = t < PB ? (this.m3 || 'none') : 'none'; this.S(q.clip, 'maskImage', mm); this.S(q.clip, 'webkitMaskImage', mm); }
    this.S(q.wcam, 'transform', C.cs !== 1 ? `translate(${C.cx.toFixed(1)}px,${C.cy.toFixed(1)}px) scale(${C.cs.toFixed(4)})` : 'none');
    this.S(q.tall, 'transform', `translate(0px,${ty.toFixed(1)}px)`);
    this.S(q.tall, 'filter', Q && Q.blur > .05 ? `blur(${Q.blur.toFixed(2)}px)` : 'none');
    this.S(q.tall, 'visibility', Q && Q.p > .72 ? 'hidden' : 'visible');
    if (q.b6) { let tf = 'none'; if (Q) { const o = [-.06 * W, ty], G = [[-2, -2.5], [2, -2.5], [2, -6], [-2, -6]].map(([x, z]) => [S.Xb + x * S.q, S.Zb - z * S.q]), d = G.map(([X, Z]) => pr(Q.c6, X, 0, Z));
      if (d.every(v => v[2] > .05)) tf = P.homog(G.map(([X, Z]) => { const s = pr(S.camO, X, 0, Z); return [s[0] - o[0], s[1] - o[1]]; }), d.map(v => [v[0] - o[0], v[1] - o[1]])); }
      this.S(q.b6, 'transform', tf); }
    if (e < .999) { const c = this.cam6(t); this.S(q.world, 'transform', P.homog(S.board.map(([X, Z]) => pr(S.camO, X, 0, Z)), S.board.map(([X, Z]) => pr(c, X, 0, Z))));
      const R = Math.max(1, sm(.3, .85, e) * 1.35 * Math.hypot(W, H)), m = `${this.w5mask}, radial-gradient(circle ${R.toFixed(0)}px at ${this.w5c[0].toFixed(0)}px ${this.w5c[1].toFixed(0)}px, #000 55%, transparent 100%)`;
      this.S(q.world, 'maskImage', m); this.S(q.world, 'webkitMaskImage', m); }
    else { this.S(q.world, 'transform', 'none'); this.S(q.world, 'maskImage', 'none'); this.S(q.world, 'webkitMaskImage', 'none'); }
    const p = lin(14.25, 16.55, t), sb = this.st.sandboard; sb.p = p; sb.pk = sm(13.1, 13.9, t);
    if (q.sx5 && !(Q && Q.p > .72)) { const k = q.s5._k, cc = Q ? Q.c6 : S.camO; P.surf6(q.sx5, Object.assign({}, cc, { f: cc.f * k, cx: cc.cx * k, cy: cc.cy * k }), S, this.now, Math.sin(lin(.84, .99, p) * Math.PI), k, q.s5.width, q.s5.height); }
    const f = Math.min(1, p / .86) * 5;
    for (let k = 0; k < 5; k++) { let v = 1 - sm(.42, .56, Math.abs(f - k - .5)); if (k === 0 && f < .5) v = t < 14.25 ? sm(13.9, 14.1, t) : 1; if (k === 4 && f >= 4.5) v = 1; if (t < 13.9) v = 0; if (t > QA) v = k === 4 ? 1 - sm(QA, QA + .16, t) : 0; this.mv['stg' + k] = v; }
    if (!this.n && sb.sx != null) { const P0 = t > QA && this._stgP ? this._stgP : (this._stgP = [sb.sx * W + 110, Math.min(ty + 1.2 * H + sb.sy * H - 150, H - 250)]); for (let k = 0; k < 5; k++) this.pos['stg' + k] = P0; }
  }
  /* into the queen: one camera from the overhead board view, down to the crown, through its front arch into the arcade */
  qstate(t) {
    const st = this.st.sandboard, W = this.W, H = this.H, S = this.S6; if (!S) return;
    const m = sm(.9, .97, lin(14.25, 16.55, t)), p = lin(QA, QB, t);
    st.qrot = (1 - m) * 2.4 + Math.sin(this.now * .25) * .25 * (1 - sm(0, .3, p));
    const on = t > QA && t < QB; this.S(this.q5 && this.q5.ql, 'visibility', on ? 'visible' : 'hidden');
    if (!on) { st.q = null; this.qs = null; return; }
    const a = W / H, th = Math.tan((a < 1 ? 44 : 30) * Math.PI / 360), O = a < 1 ? [26, 8.5, .3] : [18.5, 9.4, 0], S1 = a < 1 ? [4.4, .8] : [3.5, -.35];
    const A = [QX, QY + QS * YC, QZ + QS * QR(YC)], dE = Math.min(.07 / th, .12 / (th * a));
    const pol = (y, z) => [Math.hypot(y - A[1], z - A[2]), Math.atan2(y - A[1], z - A[2])], [dO, eO] = pol(O[0], O[1]), [d1, e1] = pol(S1[0], S1[1]);
    const u1 = sm(0, .3, p), u2 = sm(.24, .66, p), u3 = sm(.58, 1, p);
    const d = Math.exp(Math.log(dO) + (Math.log(d1) - Math.log(dO)) * u1 + (Math.log(dE) - Math.log(d1)) * u2) - (dE + .14) * u3, el = eO + (e1 - eO) * u1 - e1 * u2;
    const xq = QX * u1, C = [xq, A[1] + d * Math.sin(el), A[2] + d * Math.cos(el)], LO = [0, 0, O[2]], L1 = [0, .78, QZ], L2 = [0, A[1], A[2] - 1];
    const L = [0, 1, 2].map(i => LO[i] + (L1[i] - LO[i]) * u1 + (L2[i] - L1[i]) * u2); L[0] = xq;
    let fy = L[1] - C[1], fz = L[2] - C[2]; const fl = Math.hypot(fy, fz); fy /= fl; fz /= fl; const fp = H / 2 / th;
    const prj = V3 => { const dx = V3[0] - C[0], dy = V3[1] - C[1], dz = V3[2] - C[2], z = dy * fy + dz * fz; return [W / 2 + dx / z * fp, H / 2 - (-dy * fz + dz * fy) / z * fp, z]; };
    const g = 1 + 3 * sm(.6, .92, p), w = .016 * g, h = .035 * g, cr = Math.cos(st.qrot), sr = Math.sin(st.qrot), ol = [];
    const pt = (px, y) => { const ly = YC + y, rr = Math.max(QR(ly), .2), an = Math.PI / 2 + px / rr, lx = rr * Math.cos(an), lz = rr * Math.sin(an); return prj([QX + QS * (lx * cr + lz * sr), QY + QS * ly, QZ + QS * (-lx * sr + lz * cr)]); };
    for (let i = 0; i <= 6; i++) ol.push(pt(-w + 2 * w * i / 6, -h));
    for (let i = 1; i <= 6; i++) ol.push(pt(w, -h + (2 * h - w) * i / 6));
    for (let i = 1; i < 14; i++) { const an = Math.PI * i / 14; ol.push(pt(w * Math.cos(an), h - w + w * Math.sin(an))); }
    for (let i = 0; i <= 6; i++) ol.push(pt(-w, h - w - (2 * h - w) * i / 6));
    let hole = null, clip = 'none', hc = [W / 2, H / 2];
    if (ol.every(v => v[2] > .02)) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; ol.forEach(v => { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); });
      if (!(x0 < 0 && y0 < 0 && x1 > W && y1 > H)) { const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; hc = [cx, cy];
        clip = `polygon(${ol.map(v => `${(cx + (v[0] - cx) * 1.12).toFixed(1)}px ${(cy + (v[1] - cy) * 1.12).toFixed(1)}px`).join(',')})`; hole = [cx / W, 1 - cy / H, (x1 - x0) * .62 / W, (y1 - y0) * .62 / H]; } }
    const c6 = { x: S.Xb + C[0] * S.q, y: C[1] * S.q, z: S.Zb - C[2] * S.q, ph: Math.atan2(C[1] - L[1], C[2] - L[2]), f: fp, cx: W / 2, cy: H / 2 };
    st.q = { cam: { C, L }, near: cl(Math.abs(d) * .25, .004, .1), warm: lin(.46, .7, p), open: g, openP: sm(.6, .9, p), hole: hole || [.5, .5, 9, 9], slide: p, split: true };
    this.qs = { p, c6, clip, hc, blur: 12 * sm(.12, .55, p) };
  }
  qfloor(Q) {
    const cv = this.q6 && this.q6.floor; if (!cv) return; const on = !!Q && Q.p > .6 && Q.p < 1;
    this.S(cv, 'visibility', on ? 'visible' : 'hidden'); if (!on) return;
    const x = cv.getContext('2d'), k = cv._k, W = this.W, H = this.H, F = this.F6, hy = this.hy6, XW = this.n ? 1.3 : 2.6, P = window.Painter;
    const u = sm(.6, .97, Q.p), zo = (1 - u) * 4, dy = 0;
    this.S(cv, 'opacity', (1 - sm(.93, 1, Q.p)).toFixed(3));
    x.setTransform(k, 0, 0, k, .08 * W * k, .08 * H * k); x.clearRect(-.08 * W, -.08 * H, W * 1.16, H * 1.16);
    const pj = (X, z) => [W / 2 + X * F / z, hy + F / z + dy], hz = P.hex('#E9B47C'), C0 = [P.hex('#5B9CC8'), P.hex('#E6D3AE')], C1 = [P.hex('#9E523A'), P.hex('#D3BF9B')], MID = P.hex('#C99466');
    for (let zb = 60; zb >= -5; zb--) { const za = Math.max(.35, zb - 1 + zo), zbb = zb + zo; if (zbb <= .35) continue;
      for (let X = -Math.ceil(XW); X < Math.ceil(XW); X++) { const xa = Math.max(-XW, X), xb = Math.min(XW, X + 1); if (xb <= xa) continue;
        const dk = ((X + zb) & 1) === 0 ? 0 : 1, r = (((X * 73 + zb * 37) % 17) + 17) % 17 / 17, kt = cl((u * 1.7 - r * .35 - Math.min(1, zb / 25) * .35) / .9), fade = Math.min(1, zbb / 40) * .8;
        const c = C0[dk].map((v, i) => { const mid = dk ? v : MID[i], b = kt < .5 ? mx(v, mid, kt * 2) : mx(mid, C1[dk][i], kt * 2 - 1); return Math.round(mx(b, hz[i], fade * kt)); });
        const pp = [pj(xa, za), pj(xb, za), pj(xb, zbb), pj(xa, zbb)]; x.beginPath(); pp.forEach((v, i) => i ? x.lineTo(v[0], v[1]) : x.moveTo(v[0], v[1])); x.closePath();
        x.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; x.fill(); if (zbb < 14) { x.strokeStyle = `rgba(90,52,36,${(.35 * Math.min(1, 3 / zbb)).toFixed(2)})`; x.lineWidth = Math.max(.6, 2.4 / zbb); x.stroke(); } } }
  }
  w6(t) {
    const W = this.W, H = this.H, q = this.q6, n = this.n; if (!q) return;
    const hy = this.hy6, Q = this.qs;
    if (Q) { const s = mx(.82, 1, sm(.2, 1, Q.p)), k = sm(.6, 1, Q.p), Tx = mx(Q.hc[0], W / 2, k), Ty = mx(Q.hc[1], hy, k);
      this.S(q.cam, 'transform', `translate(${(Tx - s * W / 2).toFixed(1)}px,${(Ty - s * hy).toFixed(1)}px) scale(${s.toFixed(4)})`); this.S(q.world, 'clipPath', Q.clip); }
    else { this.S(q.cam, 'transform', 'none'); this.S(q.world, 'clipPath', 'none'); }
    this.S(q.world, 'webkitMaskImage', 'none'); this.S(q.world, 'maskImage', 'none');
    this.qfloor(Q);
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
      const R = sm(4.9, 3.2, dz), hcY = co.stand ? 99 : 227, tY = co.stand ? -26 : 102, N = fs.th.length;
      fs.ph += dt * ((1 - R) * 1.1 + .04);
      fs.th.forEach((te, j) => { const a = j / N * Math.PI * 2 + fs.ph * (.7 + (j % 3) * .25) * (j % 2 ? 1 : -1), rad = 80 + Math.sin(fs.ph * 1.7 + j * 1.3) * 34, ej = sm(j * .025, .5 + j * .035, R);
        const px = mx(150 + Math.cos(a) * rad * 1.5, 150, ej) - 46, py = mx(hcY - 12 + Math.sin(a) * rad * .95, tY, ej) - 46;
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
  dovePos(k, t) {
    const B = this.B, t0 = 4.2 + k * .09, u = lin(t0, t0 + .95, t); if (!B || u <= 0 || u >= 1) return null;
    const a = [-2.55, -1.85, -1.15, -.45, .35][k], R = Math.max(this.W, this.H) * 1.05, e = Math.pow(u, 1.7);
    return [B.x + Math.cos(a) * R * e, B.y + Math.sin(a) * R * e * .8 - u * this.H * .1, .3 + u * u * 3.4, Math.cos(a) < 0 ? -1 : 1];
  }
  carry(t) {
    this.dvEls.forEach((el, k) => { const p = this.dovePos(k, t); if (!p) { this.S(el, 'visibility', 'hidden'); [...el.children].forEach(c => this.S(c, 'visibility', 'hidden')); return; } const up = ((this.now * 7 + k * .37) | 0) % 2;
      this.S(el, 'visibility', 'visible'); this.S(el, 'transform', `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) scale(${(p[2] * p[3]).toFixed(3)},${p[2].toFixed(3)})`); this.S(el, 'filter', p[2] > 2.2 ? `blur(${((p[2] - 2.2) * 1.5).toFixed(1)}px)` : 'none');
      const cs = el.children; if (cs[0]) this.S(cs[0], 'visibility', up ? 'visible' : 'hidden'); if (cs[1]) this.S(cs[1], 'visibility', up ? 'hidden' : 'visible'); });
    const wc = this.q7 && this.q7.wincam; if (wc) { const v = t >= 21.9 && t < 25.1 && this.cam7; this.S(wc, 'visibility', v ? 'visible' : 'hidden'); if (v) { this.S(wc, 'transform', this.cam7); wc.parentElement.style.clipPath = this.wEl[6].style.clipPath; } }
  }
  introK() { if (!this._introT0) return 0; return lin(0, 1.6, (performance.now() - this._introT0) / 1000); }
  copy(t) {
    const ik = this.introK();
    for (const b of this.blocks || []) {
      let v = b.m ? (this.mv[b.id] || 0) : sm(b.a, b.a + .16, t) * (1 - sm(b.b - .16, b.b, t));
      if (b.m && !this.n && b.id !== 'ccard' && !this.pos[b.id]) v = 0;
      if (b.hero) v *= ik;
      if (b.id === 'ccard') { if (this.cardT) this.S(b.el, 'transform', this.cardT); }
      else if (b.m && !this.n) { const p = this.pos[b.id]; if (p) { const bh = b.h || (b.h = b.el.offsetHeight || 0), bw = b.ow || (b.ow = b.el.offsetWidth || 0), y = cl(p[1], 104, Math.max(104, this.H - bh - 20)), x = cl(p[0], 20, Math.max(20, this.W - bw - 76)); this.S(b.el, 'transform', `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`); } }
      if (Math.abs(v - b.v) < .003 && !(v === 0 && b.v !== 0) && !(v === 1 && b.v !== 1)) continue; b.v = v;
      b.el.style.visibility = v > 0 ? 'visible' : 'hidden'; b.el.style.pointerEvents = v > .6 ? 'auto' : 'none'; if (b.m) b.el.style.opacity = sm(0, .45, v).toFixed(3);
      const N = b.w.length || 1;
      b.w.forEach((w, i) => { const x = cl((v - i / N * .5) / .5); w.style.opacity = x.toFixed(3); w.style.transform = x >= 1 ? 'none' : `translateY(${((1 - x) * 14).toFixed(1)}px)`; w.style.filter = x >= 1 ? 'none' : `blur(${((1 - x) * 8).toFixed(1)}px)`; });
    }
    this.pos = {};
  }
  ui(t) {
    const wi = this.worldAt(t);
    if (wi !== this._wi) {
      this._wi = wi; const c = INK[wi] ? '#1B1D24' : '#F3EEE4';
      const nav = this.ch.nav; if (nav) { nav.style.color = c; nav.style.textShadow = SOFT[wi] ? '0 0 2px rgba(251,246,234,.9),0 1px 14px rgba(251,246,234,.95)' : wi === 0 ? '0 1px 2px rgba(18,34,68,.7),0 0 16px rgba(18,34,68,.6)' : 'none'; }
      this.bed(wi); if (this.props.notes || this.q('notes') === '1') this.setState({ world: wi });
    }
    if (this._ac && this.state.sound && t > QA && t < QB) this.bedMix(sm(QA + .64, QA + 1.12, t));
    const pr = this.ch.prog; if (pr) this.S(pr, 'transform', `scaleX(${(t / TEND).toFixed(4)})`);
    const nc = this.ch.cta; if (nc) { const on = t > .5; this.S(nc, 'opacity', on ? '1' : '0'); this.S(nc, 'translate', on ? '0px 0' : '24px 0'); this.S(nc, 'pointerEvents', on ? 'auto' : 'none'); }
  }
  // three.js scenes live around the stretch where their world is on screen: mounted early so shaders compile
  // before they are needed, and kept a little longer so scrolling across a boundary does not rebuild them.
  mounts(t) {
    if (!window.Scene3D || this._nogl) return;
    const M = [['apple8', -1, PB + .05], ['sandboard', 2.55, 18.3], ['roomqueen', 21.3, 25.2]];
    M.forEach(([k, a, b]) => { const el = this.m3d[k]; if (!el) return; const on = el._sc ? t > a - .8 && t < b + .8 : t > a - .5 && t < b + .3;
      if (on && !el._sc) el._sc = window.Scene3D.mount(el, k, () => this.st[k]).catch(e => { console.warn('3d ' + k + ': ' + (e && (e.message || e.type) || e)); return null; });
      else if (!on && el._sc) { const p = el._sc; el._sc = null; p.then(s => s && s.dispose()); } });
  }
  disposeAll() { this.$$('[data-3d]').forEach(el => { if (el._sc) { const p = el._sc; el._sc = null; p.then(s => s && s.dispose()); } }); }

  /* ---------- loader / blink ---------- */
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
    this.fHover[i] = on; const fs = this.fst && this.fst[i]; if (!fs || !fs.panel) return;
    fs.panel.style.opacity = on ? '1' : '0'; fs.panel.style.transform = on ? 'translateX(0)' : `translateX(${i % 2 ? 20 : -20}px)`; if (on) this.paper(.35);
  }
  forceOpen(o) {
        const m = /^f(\d)$/.exec(o || ''); if (m) setTimeout(() => this.founderHover(+m[1], true), 600);
  }

  /* ---------- sound ---------- */
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
  bedMix(k) { const A = BEDS[4], B = BEDS[5], T = this._ac.currentTime, f = (a, b) => a + (b - a) * k; this._lp.frequency.setTargetAtTime(f(A.f, B.f), T, .15); this._bg.gain.setTargetAtTime(f(A.g, B.g), T, .15); this._sg.gain.setTargetAtTime(f(A.s, B.s) * .5, T, .15); this._lg.gain.setTargetAtTime(f(A.s, B.s) * .45, T, .15); }
  tick() { const ac = this._ac, s = ac.createBufferSource(); s.buffer = this._noise; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2600; const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(.35, t); g.gain.exponentialRampToValueAtTime(.001, t + .03); s.connect(f).connect(g).connect(this._master); s.start(t, Math.random() * 3); s.stop(t + .05); }
  gull() { const ac = this._ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(1050, t + .28); o.frequency.setValueAtTime(1450, t + .34); o.frequency.exponentialRampToValueAtTime(1000, t + .62); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03, t + .04); g.gain.linearRampToValueAtTime(.0, t + .3); g.gain.linearRampToValueAtTime(.025, t + .38); g.gain.linearRampToValueAtTime(0, t + .66); o.connect(g).connect(this._master); o.start(t); o.stop(t + .7); }
  paper(vol = 1) {
    if (!this.state.sound || !this._ac) return;
    const ac = this._ac, s = ac.createBufferSource(); s.buffer = this._noise; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800;
    const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(0, t); for (let i = 0; i < 8; i++) g.gain.linearRampToValueAtTime((.15 + Math.random() * .35) * vol, t + .03 + i * .04); g.gain.linearRampToValueAtTime(0, t + .4);
    s.connect(f).connect(g).connect(ac.destination); s.start(t, Math.random() * 3); s.stop(t + .45);
  }
  crunch() { if (!this.state.sound || !this._ac) return; const ac = this._ac, s = ac.createBufferSource(); s.buffer = this._noise; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2; const g = ac.createGain(), t = ac.currentTime; g.gain.setValueAtTime(0, t); for (let i = 0; i < 5; i++) g.gain.linearRampToValueAtTime(.3 + Math.random() * .4, t + .02 + i * .03); g.gain.linearRampToValueAtTime(0, t + .22); s.connect(f).connect(g).connect(ac.destination); s.start(t, Math.random() * 3); s.stop(t + .25); }

  go(to, e) { e && e.preventDefault && e.preventDefault(); if (this.state.menu) this.setState({ menu: false }); scrollTo({ top: VI(JUMP[to] ?? 0) * (this.H || innerHeight), behavior: this.red() ? 'auto' : 'smooth' }); }
}

function pathv(t, pts) { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return mx(pts[i - 1][1], pts[i][1], sm(pts[i - 1][0], pts[i][0], t)); return pts[pts.length - 1][1]; }
