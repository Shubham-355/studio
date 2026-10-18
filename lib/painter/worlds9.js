/* v10: layered tilt clouds, one-sand beach, torn night with the painted hand. Load after worlds8.js */
(function init() {
  const P = window.Painter; if (!P || !P.apple8Sky || !P.cam6) { setTimeout(init, 20); return; } if (P.cloud9) return;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), rgba = P.rgba;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const { proj, unproj } = P.cam6;

  /* ---------- clouds: soft round dabs, warm lit crown, cool shaded base, no directional smear ---------- */
  P.cloud9 = (ctx, x, y, s, r, o = {}) => {
    const lit = o.lit || [255, 246, 232], mid = o.mid || [238, 230, 222], sh = o.sh || [182, 192, 212], base = o.base || [158, 172, 200];
    const k = 5 + (r() * 4 | 0), puffs = [];
    for (let i = 0; i < k; i++) { const t = i / (k - 1) - .5; puffs.push({ x: x + t * s * 2.1 + (r() - .5) * s * .25, y: y - Math.cos(t * Math.PI) * s * .4 * (.7 + r() * .5), r: s * (.36 + r() * .3) * (1 - Math.abs(t) * .5) }); }
    const top = Math.min(...puffs.map(p => p.y - p.r)), bot = y + s * .2, hh = Math.max(1, bot - top);
    const bx0 = Math.min(...puffs.map(p => p.x - p.r)) - 12, bx1 = Math.max(...puffs.map(p => p.x + p.r)) + 12, by0 = top - 12, by1 = bot + 12;
    const oc = document.createElement('canvas'); oc.width = Math.max(4, Math.ceil(bx1 - bx0)); oc.height = Math.max(4, Math.ceil(by1 - by0)); const c = oc.getContext('2d'); c.translate(-bx0, -by0);
    c.fillStyle = rgba(base, .5); c.beginPath(); c.ellipse(x, bot - s * .07, s * 1.05, s * .12, 0, 0, 7); c.fill();
    const W2 = puffs.map(p => p.r * p.r), tot = W2.reduce((a, b) => a + b, 0), N = Math.round(cl(1.6 * tot / (s * s * .0144), 110, 320)), dabs = [];
    for (let i = 0; i < N; i++) {
      let q = r() * tot, p = puffs[0]; for (let j = 0; j < puffs.length; j++) { q -= W2[j]; if (q <= 0) { p = puffs[j]; break; } }
      const a = r() * 6.283, rr = Math.sqrt(r()) * p.r * .92, px = p.x + Math.cos(a) * rr, py = Math.min(bot - s * .05, p.y + Math.sin(a) * rr);
      const v = cl((py - top) / hh), side = (px - p.x) / p.r, rim = rr / p.r;
      let col = mix(lit, mid, ss(.1, .55, v + side * .1)); col = mix(col, sh, ss(.5, .95, v + rim * .12 - .04)); col = mix(col, base, ss(.86, 1, v) * .65);
      dabs.push({ px, py, d: s * (.12 + r() * .16) * (1 - rim * .4), col, v, a: .45 + r() * .3 });
    }
    dabs.sort((a, b) => b.v - a.v);
    dabs.forEach(d => { const g = c.createRadialGradient(d.px, d.py, 0, d.px, d.py, d.d); g.addColorStop(0, rgba(d.col, d.a)); g.addColorStop(.6, rgba(d.col, d.a * .7)); g.addColorStop(1, rgba(d.col, 0)); c.fillStyle = g; c.beginPath(); c.arc(d.px, d.py, d.d, 0, 6.283); c.fill(); });
    ctx.save(); ctx.filter = `blur(${Math.max(1, s * .034 + (o.blur || 0)).toFixed(1)}px)`; ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(oc, bx0, by0); ctx.restore();
  };
  P.cloudLayer9 = (cv, G, which) => {
    const L = G.cl9[which]; const { ctx, w, h } = P.setup(cv, L.w * L.k, L.h * L.k); ctx.clearRect(0, 0, w, h); const r = P.rng(91 + which * 7);
    L.list.forEach(([x, y, s]) => P.cloud9(ctx, x * w, y * h, s * w, r, L.col));
  };

  /* tilt plate: one gradient, deep blue at the top to peach at the horizon; clouds live on their own layers */
  P.apple9Sky = (cv, G) => {
    const { W, H, Yh, Hp, sunX, n } = G, k = n ? .9 : .7, f = y => cl(y / Hp);
    const stops = [[0, '#3E78C4'], [f(Yh - H * .62), '#5A8BCB'], [f(Yh - H * .42), '#8FB0D6'], [f(Yh - H * .26), '#C9CBD2'], [f(Yh - H * .14), '#EBCDB2'], [f(Yh - H * .05), '#F4BF8C'], [f(Yh) - .0006, '#F6B474'], [f(Yh), '#33627F'], [1, '#24506C']];
    return P.sky(cv, {
      seed: 81, w: W, h: Hp, k, stops, clouds: 0,
      after: (ctx, w, h, r) => {
        const s = w / W, yh = Yh * s, H2 = H * s;
        ctx.fillStyle = P.linear(ctx, [[0, 'rgba(250,214,170,0)'], [1, 'rgba(250,206,150,.5)']], 0, yh - H2 * .26, 0, yh); ctx.fillRect(0, yh - H2 * .26, w, H2 * .26);
        P.sea(ctx, w, yh, h, { far: '#3D6C8B', near: '#21496A', mid: '#4C7E9E', foam: '#BFD3DC' }, r);
        for (let i = 0; i < 320; i++) { const y = yh + Math.pow(r(), 1.5) * (h - yh), tt = (y - yh) / (h - yh || 1);
          P.stroke(ctx, r() * w, y, (r() - .5) * .03, (24 + tt * 180 * r()) * s, (1 + tt * 5) * s, r() < .55 ? [28, 64, 92] : [104, 146, 172], .22 + r() * .3, (r() - .5) * .08); }
      },
      post: (ctx, w, h, r) => {
        const s = w / W, yh = Yh * s, H2 = H * s, sx = sunX * s, sy = yh - H2 * .062, sr = H2 * .034;
        let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H2 * .42); g.addColorStop(0, 'rgba(255,230,180,.6)'); g.addColorStop(.35, 'rgba(255,214,160,.22)'); g.addColorStop(1, 'rgba(255,214,160,0)');
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, yh); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, yh);
        g = ctx.createRadialGradient(sx, sy, sr * .1, sx, sy, sr * 1.18); g.addColorStop(0, '#FFF8EA'); g.addColorStop(.72, '#FFE7BE'); g.addColorStop(.86, 'rgba(255,220,160,.7)'); g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.18, 0, 7); ctx.fill(); ctx.restore();
        for (let i = 0; i < 520; i++) { const y = yh + Math.pow(r(), 1.25) * (h - yh) * .85, tt = (y - yh) / (h - yh || 1), sp = H2 * .018 + tt * H2 * .5, x = sx + (r() - .5) * 2 * sp * (.25 + r() * .75);
          P.stroke(ctx, x, y, (r() - .5) * .04, (2 + tt * 18 * r()) * s, (.6 + tt * 2.2) * s, [255, 226 + r() * 26 | 0, 176 + r() * 50 | 0], .3 + r() * .5, 0); }
        ctx.fillStyle = 'rgba(24,52,74,.6)'; ctx.fillRect(0, yh - .6 * s, w, Math.max(1, 1.3 * s));
      },
    });
  };

  /* the day sky seen through the night tear (the hero's sky) */
  P.morning9 = (cv, o) => {
    const br = cv.getBoundingClientRect(), w0 = br.width, h0 = br.height;
    return P.sky(cv, { seed: 9, w: w0, h: h0, k: .6, stops: [[0, '#79A6DC'], [.45, '#4F84C8'], [1, '#3E78C4']], clouds: 0,
      post: (ctx, w, h, r) => { const s = w / w0, cx = o.cx * s, cy = o.cy * s, R = o.rx * s;
        [[.05, -.98, .17], [-.58, -.52, .27], [.4, -.22, .21], [-.2, .42, .19], [.64, .52, .16]].forEach(([dx, dy, k]) => P.cloud9(ctx, cx + dx * R, cy + dy * R * .82, k * R, r)); } });
  };

  /* ---------- one sand: #D9C3A0, one grain, ripples parallel to the shore ---------- */
  const wetW = Z => .95 + .22 * Math.sin(Z * 1.3 + .7) + .12 * Math.sin(Z * 3.7 + 2.1) + .06 * Math.sin(Z * 9.1);
  const orig = P.beach6cfg;
  P.beach6cfg = (W, H, n) => {
    const S = orig(W, H, n); S.wetW = wetW; S.Xwet = Z => S.Xs(Z) + wetW(Z) * .8;
    if (S.board) { const xs = S.board.map(p => p[0]), zs = S.board.map(p => p[1]); S.bb = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]; }
    return S;
  };
  const C = { turq: [92, 198, 188], teal: [52, 152, 172], deep: [40, 104, 160], far: [74, 128, 178], haze: [218, 232, 236] };
  const SAND = [217, 195, 160], HI = [236, 220, 190], SH = [190, 180, 166], WET = [136, 116, 92], GLOSS = [178, 186, 194];
  const SUN = (() => { const l = Math.hypot(.45, 1.35); return [-.45 / l, 1.35 / l]; })();
  const nz = (X, Z) => Math.sin(X * 1.7 + Z * .9) * .5 + Math.sin(X * 4.3 - Z * 2.9 + 1.3) * .3 + Math.sin(X * 9.7 + Z * 7.3) * .2;
  const edge = (S, Z) => S.Xs(Z) + .03 * Math.sin(Z * 2.3 + 1);
  const wetE = (S, X, Z) => (X - edge(S, Z)) / (S.wetW || wetW)(Z) + .1 * nz(X * 2.2, Z * 2.2) + .05 * Math.sin(Z * 13 + X * 3);
  const near = (S, X, Z) => { const b = S.bb; if (!b) return null; const dx = Math.max(b[0] - X, 0, X - b[1]), dz = Math.max(b[2] - Z, 0, Z - b[3]), d = Math.hypot(dx, dz); if (d <= 0 || d > .2) return null; return { d, nx: (X < b[0] ? -dx : dx) / d, nz: (Z < b[2] ? -dz : dz) / d }; };
  const inBoard = (S, X, Z, m) => { const b = S.bb; return b && X > b[0] - m && X < b[1] + m && Z > b[2] - m && Z < b[3] + m; };
  const sandAt = (S, X, Z) => {
    const v = nz(X * .7, Z * .7) * .5 + .5; let col = mix(SAND, v > .5 ? HI : SH, Math.abs(v - .5) * .3);
    const e = wetE(S, X, Z); if (e < 1) { const w = 1 - ss(0, 1, e); col = mix(col, WET, Math.pow(w, .85) * .82); col = mix(col, GLOSS, Math.pow(w, 4) * .3); }
    const b = near(S, X, Z); if (b) { const side = b.d > .055 ? 1 : -1, lit = side * (b.nx * SUN[0] + b.nz * SUN[1]), ridge = Math.exp(-Math.pow((b.d - .055) / .028, 2));
      col = mix(col, lit > 0 ? HI : SH, ridge * (.25 + Math.abs(lit) * .5)); col = mix(col, [150, 140, 134], Math.exp(-b.d / .022) * .5); }
    return col;
  };
  const colAt = (S, X, Z, t) => {
    const d = edge(S, Z) - X; let col;
    if (d > 0) { const u = cl(d / 3.2); col = u < .35 ? mix(C.turq, C.teal, u / .35) : mix(C.teal, C.deep, (u - .35) / .65); col = mix(col, C.far, cl((Z - 14) / 50) * .7); }
    else col = sandAt(S, X, Z);
    return mix(col, C.haze, cl((1 - Math.exp(-t / 48)) * .92));
  };
  P.sandAt9 = sandAt;

  P.ground6 = (ctx, c, w, y0, y1, S, r, K, o = {}) => {
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(ctx.canvas.height, Math.ceil(y1)); if (y1 <= y0) return;
    const cell = Math.max(3, Math.round(4 * K));
    for (let y = y0; y < y1; y += cell) for (let x = 0; x < w; x += cell) { const g = unproj(c, x + cell / 2, y + cell / 2); if (!g) continue; ctx.fillStyle = rgba(colAt(S, g[0], g[1], g[2]), 1); ctx.fillRect(x, y, cell + .6, cell + .6); }
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = y1 - y0; tmp.getContext('2d').drawImage(ctx.canvas, 0, y0, w, y1 - y0, 0, 0, w, y1 - y0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
    ctx.filter = `blur(${(2.2 * K).toFixed(1)}px)`; ctx.drawImage(tmp, 0, y0); ctx.filter = 'none';
    const shoreAng = (X, Z) => { const p1 = proj(c, X, 0, Z), p2 = proj(c, X + .002, 0, Z + .02); return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]); };
    /* grain: every stroke runs along the shore, one scale in world units */
    const N = w * (y1 - y0) / ((o.area || 40) * K * K);
    for (let i = 0; i < N; i++) {
      const x = r() * w, y = lerp(y0, y1, r()), g = unproj(c, x, y); if (!g) continue; const [X, Z, t] = g, sea = X < edge(S, Z);
      if (!sea && inBoard(S, X, Z, -.02)) continue;
      const base = colAt(S, X, Z, t), Lw = sea ? .15 + r() * .6 : .03 + r() * .09, e = .02;
      const p1 = proj(c, X, 0, Z), p2 = proj(c, X + .1 * e, 0, Z + e); if (p1[2] < .05 || p2[2] < .05) continue;
      const sx = (p2[0] - p1[0]) / e, sy = (p2[1] - p1[1]) / e, sc = Math.hypot(sx, sy), len = cl(sc * Lw, 1.5 * K, 40 * K), ang = Math.atan2(sy, sx);
      const j = (r() - .5) * (sea ? 12 : 9); let col = [base[0] + j, base[1] + j, base[2] + j * .8];
      if (sea && r() < .12) col = mix(col, [236, 246, 244], .5);
      if (!sea && wetE(S, X, Z) < .22 && r() < .15) col = mix(col, [190, 198, 208], .35);
      P.stroke(ctx, x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2, ang, len, cl(len * .22, .6 * K, 5 * K), col, sea ? .2 + r() * .25 : .14 + r() * .18, (r() - .5) * .2);
    }
    /* wind ripples: lines parallel to the waterline, even world spacing, lit crest toward the sun */
    ctx.lineCap = 'round';
    for (let k = 0; k < 190; k++) {
      const U = k * .075 + .014 * Math.sin(k * 2.7); let prev = null, prevD = null;
      for (let Z = Math.max(c.z + .35, .5); Z < c.z + 18; Z += .04 + Math.max(0, Z - c.z) * .02) {
        const X = S.Xs(Z) + .5 + U + .016 * Math.sin(Z * .9 + k * .45) + .008 * Math.sin(Z * 2.6 + k * 1.3) + .003 * Math.sin(Z * 7 + k);
        if (X > c.x + 9 || X < c.x - 9 || inBoard(S, X, Z, .09) || Math.abs(Math.sin(Z * .8 + k * 2.3) + .5 * Math.sin(Z * 2.1 + k)) < .22) { prev = null; continue; }
        const p = proj(c, X, 0, Z); if (p[2] < .12 || p[0] < -40 || p[0] > w + 40 || p[1] < y0 - 20 || p[1] > y1 + 40) { prev = null; continue; }
        const pd = proj(c, X + .013, 0, Z);
        if (prev) { const sc = c.f / p[2], a = ss(.85, 1.2, wetE(S, X, Z)); if (a > .02) {
          ctx.strokeStyle = `rgba(150,140,128,${(.13 * a).toFixed(3)})`; ctx.lineWidth = cl(sc * .01, .4, 3.5 * K); ctx.beginPath(); ctx.moveTo(prevD[0], prevD[1]); ctx.lineTo(pd[0], pd[1]); ctx.stroke();
          ctx.strokeStyle = `rgba(250,238,214,${(.19 * a).toFixed(3)})`; ctx.lineWidth = cl(sc * .0065, .4, 2.6 * K); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); } }
        prev = p; prevD = pd;
      }
    }
    if (o.feat && P._feat6) P._feat6(ctx, c, w, S, r, K);
    P.overpaint(ctx, w, ctx.canvas.height, { len: [3 * K, 9 * K], wid: [1 * K, 2.4 * K], a: [.12, .26], area: 650 * K * K, jit: 8, angJ: .2, ang: (x, y) => { const g = unproj(c, x, y); return g ? shoreAng(g[0], g[1]) : 0; }, mask: (x, y) => y > y0 + 2 && y < y1 }, r);
    ctx.restore();
  };

  /* tall plate: the overhead ground is painted continuously (no blended band) */
  if (P._skyStops6) P.beach6Tall = (cv, S) => {
    const W = S.W, H = S.H, k = S.n ? 1.2 : .85, bx = .06 * W, hf = S.hy / (2.2 * H);
    return P.sky(cv, { seed: 62, w: W * 1.12, h: 2.2 * H, k, stops: P._skyStops6(hf), after: (ctx, w, h, r) => P._skyArt6(ctx, w, h, r, S.hy * k, k, W),
      post: (ctx, w, h, r) => {
        const sc = (cm, oy) => Object.assign({}, cm, { f: cm.f * k, cx: (cm.cx + bx) * k, cy: (cm.cy + oy) * k });
        const yH = Math.round(H * k), ce = sc(S.camEye, 0);
        P.ground6(ctx, ce, w, ce.cy, yH, S, r, k, {});
        P.ground6(ctx, sc(S.camO, 1.2 * H), w, yH, h, S, r, k, {});
      } });
  };

  /* ---------- the hand that offers the letter ---------- */
  const SK = { base: [204, 148, 116], sh: [104, 64, 58], moon: [188, 196, 224], warm: [248, 176, 112] };
  const MOON = [-.6, -.8];
  const HAND = { A: [474, 52], E: [418, 104], F: [356, 160], W: [288, 224], GP: [168, 304] };
  P.hand9 = HAND;
  const crs = (pts, n) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)).concat([i + t])); } }
    const l = pts[pts.length - 1]; out.push([l[0], l[1], pts.length - 1]); return out;
  };
  const shade = u => {
    const c = Math.sqrt(Math.max(0, 1 - u * u)), m = cl(u * .7 + c * .45), wm = Math.pow(cl(-u * .95 + .05), 1.4), core = Math.exp(-Math.pow((u + .5) / .22, 2));
    let col = mix(SK.sh, SK.base, cl(.25 + c * .6 + m * .35)); col = mix(col, SK.moon, m * m * .5); col = mix(col, SK.warm, wm * .6); return mix(col, SK.sh, core * .35 * (1 - wm));
  };
  const tube = (ctx, pts, wd, r, o = {}) => {
    const S = crs(pts, o.n || 8), W = S.map(s => { const i = Math.min(wd.length - 2, Math.floor(s[2])); return lerp(wd[i], wd[i + 1], s[2] - i); });
    const N = S.map((s, i) => { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; let nx = -ty, ny = tx; if (nx * MOON[0] + ny * MOON[1] < 0) { nx = -nx; ny = -ny; } return [nx, ny, tx, ty]; });
    const L = S.map((s, i) => [s[0] + N[i][0] * W[i] / 2, s[1] + N[i][1] * W[i] / 2]), R = S.map((s, i) => [s[0] - N[i][0] * W[i] / 2, s[1] - N[i][1] * W[i] / 2]), e = S.length - 1;
    const path = new Path2D(); L.forEach((p, i) => i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]));
    path.quadraticCurveTo(S[e][0] + N[e][2] * W[e] * 1.0, S[e][1] + N[e][3] * W[e] * 1.0, R[e][0], R[e][1]);
    for (let i = e - 1; i >= 0; i--) path.lineTo(R[i][0], R[i][1]);
    path.quadraticCurveTo(S[0][0] - N[0][2] * W[0] * .7, S[0][1] - N[0][3] * W[0] * .7, L[0][0], L[0][1]); path.closePath();
    ctx.fillStyle = rgba(shade(0), 1); ctx.fill(path);
    ctx.save(); ctx.clip(path); ctx.lineCap = 'round';
    for (let i = 0; i < S.length; i++) { const w = W[i], [nx, ny, tx, ty] = N[i];
      for (let u = -1.05; u <= 1.06; u += .13) { const uu = u + (r() - .5) * .08, col = shade(cl(uu, -1, 1)), j = (r() - .5) * 10, x = S[i][0] + nx * uu * w / 2, y = S[i][1] + ny * uu * w / 2, len = w * (.35 + r() * .3);
        ctx.strokeStyle = rgba([col[0] + j, col[1] + j * .8, col[2] + j * .7], .5 + r() * .3); ctx.lineWidth = w * (.1 + r() * .08);
        ctx.beginPath(); ctx.moveTo(x - tx * len / 2, y - ty * len / 2); ctx.quadraticCurveTo(x + nx * w * .03, y + ny * w * .03, x + tx * len / 2, y + ty * len / 2); ctx.stroke(); } }
    ctx.restore();
    ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(SK.sh, o.edge ?? .2); ctx.lineWidth = 1; ctx.stroke(path); ctx.restore();
    return { S, W, N, path };
  };
  const nail = (ctx, a, b, t, len, wid, off) => {
    const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); let nx = -Math.sin(ang), ny = Math.cos(ang); if (nx * MOON[0] + ny * MOON[1] < 0) { nx = -nx; ny = -ny; }
    ctx.save(); ctx.translate(x + nx * off, y + ny * off); ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, -wid / 2, 0, wid / 2); g.addColorStop(0, '#E6D2CE'); g.addColorStop(.5, '#D6AFA4'); g.addColorStop(1, '#B4877C');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, len / 2, wid / 2, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(116,70,60,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(0, 0, len / 2, wid / 2, 0, Math.PI * .58, Math.PI * 1.42); ctx.stroke();
    ctx.fillStyle = 'rgba(250,246,250,.55)'; ctx.beginPath(); ctx.ellipse(len * .05, -wid * .2, len * .26, wid * .09, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(246,236,228,.75)'; ctx.beginPath(); ctx.ellipse(len * .44, 0, len * .07, wid * .4, 0, 0, 7); ctx.fill();
    ctx.restore();
  };
  const knob = (ctx, x, y, r0, a) => {
    let g = ctx.createRadialGradient(x + 2.5, y + 3.5, 0, x + 2.5, y + 3.5, r0 * 1.1); g.addColorStop(0, 'rgba(96,56,50,.22)'); g.addColorStop(1, 'rgba(96,56,50,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + 2.5, y + 3.5, r0 * 1.1, 0, 7); ctx.fill();
    g = ctx.createRadialGradient(x - 1, y - 1.5, 0, x, y, r0); g.addColorStop(0, `rgba(232,224,236,${a})`); g.addColorStop(1, 'rgba(232,224,236,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r0, 0, 7); ctx.fill();
  };
  const crease = (ctx, a, b, w, t, al = .42) => {
    const x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t), ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang), ny = Math.cos(ang), tx = Math.cos(ang), ty = Math.sin(ang);
    ctx.lineCap = 'round';
    [[0, `rgba(112,66,58,${al})`, .9], [1.6, `rgba(240,216,204,${al * .7})`, .8]].forEach(([o, c, lw]) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x + nx * w * .38 + tx * o, y + ny * w * .38 + ty * o); ctx.quadraticCurveTo(x + tx * (o + 2.2), y + ty * (o + 2.2), x - nx * w * .3 + tx * o, y - ny * w * .3 + ty * o); ctx.stroke(); });
  };
  const IDX = [[215.4, 252.2], [183, 276], [167.5, 295.7], [160.8, 311.3]], IW = [16.5, 15, 13.5, 12];
  const index = (ctx, r) => { tube(ctx, IDX, IW, r, { n: 8, edge: .14 }); crease(ctx, IDX[1], IDX[2], 15, .1, .26); crease(ctx, IDX[2], IDX[3], 13.5, .12, .22); knob(ctx, IDX[1][0] - 1, IDX[1][1] - 2, 6, .3); nail(ctx, IDX[2], IDX[3], .66, 10, 8.4, 2); };

  P.reach9 = cv => {
    const { ctx } = P.setup(cv, 1040, 880); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 520, 440); const r = P.rng(41);
    const H = HAND, d = [-.8, .6], p = [-.6, -.8], at = (o, a, b) => [o[0] + d[0] * a + p[0] * b, o[1] + d[1] * a + p[1] * b], W0 = H.W;
    /* arm, painted alone so its fade into the depth of the tear never touches the hand */
    const oc = document.createElement('canvas'); oc.width = 1040; oc.height = 880; const a = oc.getContext('2d'); a.setTransform(2, 0, 0, 2, 0, 0);
    const arm = tube(a, [H.A, H.E, H.F, at(W0, 4, 0), at(W0, 34, -1)], [30, 35, 39, 36, 40], r, { n: 14, edge: .16 });
    a.save(); a.clip(arm.path); a.lineCap = 'round';
    a.strokeStyle = 'rgba(232,222,236,.16)'; a.lineWidth = 7; a.beginPath(); a.moveTo(...at(H.F, -30, 11)); a.quadraticCurveTo(...at(H.F, 20, 13), ...at(W0, -16, 9)); a.stroke();
    a.strokeStyle = 'rgba(112,66,58,.14)'; a.lineWidth = 3; a.beginPath(); a.moveTo(...at(H.F, 0, -6)); a.quadraticCurveTo(...at(H.F, 45, -9), ...at(W0, -8, -11)); a.stroke();
    a.restore();
    a.globalCompositeOperation = 'source-atop'; let g = a.createLinearGradient(H.A[0], H.A[1], H.F[0], H.F[1]); g.addColorStop(0, 'rgba(46,58,92,.85)'); g.addColorStop(.6, 'rgba(56,66,100,.3)'); g.addColorStop(1, 'rgba(56,66,100,0)'); a.fillStyle = g; a.fillRect(0, 0, 520, 440);
    a.globalCompositeOperation = 'destination-out'; g = a.createLinearGradient(H.A[0], H.A[1], H.F[0], H.F[1]); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.12, 'rgba(0,0,0,.92)'); g.addColorStop(.55, 'rgba(0,0,0,0)'); a.fillStyle = g; a.fillRect(0, 0, 520, 440);
    ctx.drawImage(oc, 0, 0, 520, 440);
    /* thumb: under the curled fingers, its tip tucked behind the letter */
    tube(ctx, [at(W0, 14, -18), [246, 300], [200, 318], [164, 320]], [26, 22, 18, 15], r, { n: 8, edge: .14 }); nail(ctx, [200, 318], [164, 320], .5, 11, 8.5, 2.6);
    /* back of the hand: one shape from wrist to knuckles, lit across its width */
    const Ki = IDX[0], Km = [223.8, 263.4], Kr = [232.2, 274.6], Kp = [249.6, 281.4];
    const WT = at(W0, -16, 20), WB = at(W0, -16, -19), KT = at(Ki, 0, 8), KB = at(Kp, 2, -7), KC = at([228, 269], 8, 0);
    const bp = new Path2D(); bp.moveTo(...WT); bp.quadraticCurveTo(...at([(WT[0] + KT[0]) / 2, (WT[1] + KT[1]) / 2], 0, 3), ...KT); bp.quadraticCurveTo(...KC, ...KB); bp.quadraticCurveTo(...at([(WB[0] + KB[0]) / 2, (WB[1] + KB[1]) / 2], 0, -5), ...WB); bp.closePath();
    const hc = document.createElement('canvas'); hc.width = 1040; hc.height = 880; const hx = hc.getContext('2d'); hx.setTransform(2, 0, 0, 2, 0, 0); { const ctx = hx;
    ctx.fillStyle = rgba(shade(.1), 1); ctx.fill(bp);
    ctx.save(); ctx.clip(bp); ctx.lineCap = 'round';
    for (let i = 0; i <= 26; i++) { const t = i / 26, L = [lerp(WT[0], KT[0], t), lerp(WT[1], KT[1], t)], R = [lerp(WB[0], KB[0], t), lerp(WB[1], KB[1], t)], wd = Math.hypot(L[0] - R[0], L[1] - R[1]);
      for (let u = -1.05; u <= 1.06; u += .1) { const uu = u + (r() - .5) * .07, col = shade(cl(uu * .8 + .08, -1, 1)), j = (r() - .5) * 9, f = (uu + 1) / 2, x = lerp(R[0], L[0], f), y = lerp(R[1], L[1], f), len = 9 + r() * 7;
        ctx.strokeStyle = rgba([col[0] + j, col[1] + j * .8, col[2] + j * .7], .5 + r() * .3); ctx.lineWidth = wd * (.05 + r() * .04); ctx.beginPath(); ctx.moveTo(x - d[0] * len / 2, y - d[1] * len / 2); ctx.lineTo(x + d[0] * len / 2, y + d[1] * len / 2); ctx.stroke(); } }
    [[Ki, 13], [Km, 5], [Kr, -5], [Kp, -14]].forEach(([K, o]) => { const s0 = at(W0, 16, o), e = at(K, -7, 0), m = [lerp(s0[0], e[0], .5) + p[0] * 1.2, lerp(s0[1], e[1], .5) + p[1] * 1.2];
      ctx.strokeStyle = 'rgba(118,74,62,.1)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s0[0] - p[0] * 1.8, s0[1] - p[1] * 1.8); ctx.quadraticCurveTo(m[0] - p[0] * 1.8, m[1] - p[1] * 1.8, e[0] - p[0] * 1.8, e[1] - p[1] * 1.8); ctx.stroke();
      ctx.strokeStyle = 'rgba(240,218,208,.2)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(...s0); ctx.quadraticCurveTo(...m, ...e); ctx.stroke(); });
    ctx.restore();
    const f0 = at(W0, -16, 0), f1 = at(W0, 6, 0), fg = ctx.createLinearGradient(f0[0], f0[1], f1[0], f1[1]); fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = fg; ctx.fillRect(0, 0, 520, 440); ctx.globalCompositeOperation = 'source-over'; }
    ctx.drawImage(hc, 0, 0, 520, 440);
    /* curled middle, ring and little fingers, with their shadow on the thumb */
    const CF = [[Kp, [245.5, 304], [255, 310], [12.5, 12, 11]], [Kr, [225, 302.7], [236, 311.4], [15, 14.5, 13.5]], [Km, [213.8, 293.8], [225.8, 304.4], [16, 15.5, 14.5]]];
    ctx.save(); ctx.filter = 'blur(3px)'; ctx.strokeStyle = 'rgba(70,36,34,.3)'; ctx.lineCap = 'round';
    CF.forEach(([K, a1, a2, w]) => { ctx.lineWidth = w[1]; ctx.beginPath(); ctx.moveTo(a1[0] + 3, a1[1] + 5); ctx.lineTo(a2[0] + 3, a2[1] + 5); ctx.stroke(); }); ctx.restore();
    CF.forEach(([K, a1, a2, w]) => { tube(ctx, [at(K, -6, 0), a1, a2], w, r, { n: 6, edge: .12 }); knob(ctx, a1[0] - 1, a1[1] - 1.5, w[1] * .45, .32); });
    index(ctx, r);
    [Ki, Km, Kr, Kp].forEach((K, i) => knob(ctx, K[0] + p[0] * 2, K[1] + p[1] * 2, 7.5 - i * .7, .34));
    const c0 = at(W0, 12, 15), c1 = at(W0, 15, 5); ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(108,64,56,.13)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(...c0); ctx.quadraticCurveTo(...c1, ...at(W0, 15, -6)); ctx.stroke();
  };
  /* the index finger in front of the letter, with its soft shadow on the paper */
  P.pinch9 = cv => {
    const { ctx } = P.setup(cv, 1040, 880); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 520, 440); const r = P.rng(43), I = IDX;
    ctx.save(); ctx.filter = 'blur(5px)'; ctx.strokeStyle = 'rgba(22,16,28,.36)'; ctx.lineCap = 'round'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(I[1][0] - 6, I[1][1] + 13); ctx.quadraticCurveTo(I[2][0] - 7, I[2][1] + 13, I[3][0] - 7, I[3][1] + 11); ctx.stroke(); ctx.restore();
    index(ctx, r);
    ctx.globalCompositeOperation = 'destination-out'; const g = ctx.createRadialGradient(I[0][0], I[0][1], 0, I[0][0], I[0][1], 26); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.5, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 520, 440); ctx.globalCompositeOperation = 'source-over';
  };
})();

export {};
