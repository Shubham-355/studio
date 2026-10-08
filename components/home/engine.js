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
  q(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  red() { return this.props.motion === false || matchMedia('(prefers-reduced-motion: reduce)').matches; }
  S(el, p, v) { if (el && el['_' + p] !== v) { el['_' + p] = v; el.style[p] = v; } }

  start() {
    if (this.q('noloader') || this.q('t') || this.q('at')) this.setState({ loader: false });
    this._onResize = () => { const n = innerWidth < 820; if (n !== this.state.narrow) { this.setState({ narrow: n }); return; } this.host.forceUpdate(); clearTimeout(this._rt); this._rt = setTimeout(() => this.relayout(true), 250); };
    addEventListener('resize', this._onResize);
    this._alive = true; this.t = 0; this.mv = {}; this.pos = {};
    loadPainter().then(() => this.waitLibs()).then(() => { if (this._alive) this.boot(); }).catch(e => console.error(e));
  }
  narrowChanged() { requestAnimationFrame(() => { this.disposeAll(); this.relayout(true); }); }
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
}
