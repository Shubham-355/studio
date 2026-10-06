/* v6 beach: one camera model shared by the painted plates and the motion. Load after worlds5.js */
(function init() {
  const P = window.Painter; if (!P || !P.beachTall5) { setTimeout(init, 20); return; } if (P.beach6cfg) return;
  const hex = P.hex, rgba = P.rgba, lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const blob = (ctx, x, y, rx, ry, c, blur, rot = 0) => { ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); ctx.fill(); ctx.restore(); };

  /* ---------- camera ---------- */
  const proj = (c, X, Y, Z) => { const dx = X - c.x, dy = Y - c.y, dz = Z - c.z, cs = Math.cos(c.ph), sn = Math.sin(c.ph), up = dy * cs + dz * sn, fw = -dy * sn + dz * cs; return [c.cx + c.f * dx / fw, c.cy - c.f * up / fw, fw]; };
  const unproj = (c, u, v) => { const a = (u - c.cx) / c.f, b = -(v - c.cy) / c.f, cs = Math.cos(c.ph), sn = Math.sin(c.ph), dy = b * cs - sn; if (dy > -1e-4) return null; const t = -c.y / dy; return [c.x + t * a, c.z + t * (b * sn + cs), t]; };
  P.cam6 = { proj, unproj };
  P.homog = (s, d) => {
    const A = [], B = [];
    for (let i = 0; i < 4; i++) { const [x, y] = s[i], [u, v] = d[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v); }
    for (let i = 0; i < 8; i++) {
      let p = i; for (let j = i + 1; j < 8; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
      [A[i], A[p]] = [A[p], A[i]]; [B[i], B[p]] = [B[p], B[i]]; const q = A[i][i] || 1e-12;
      for (let j = i + 1; j < 8; j++) { const f = A[j][i] / q; if (!f) continue; for (let k = i; k < 8; k++) A[j][k] -= f * A[i][k]; B[j] -= f * B[i]; }
    }
    const h = []; for (let i = 7; i >= 0; i--) { let s2 = B[i]; for (let k = i + 1; k < 8; k++) s2 -= A[i][k] * h[k]; h[i] = s2 / A[i][i]; }
    const f = v => (Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(9));
    return `matrix3d(${f(h[0])},${f(h[3])},0,${f(h[6])},${f(h[1])},${f(h[4])},0,${f(h[7])},0,0,1,0,${f(h[2])},${f(h[5])},0,1)`;
  };

  /* ---------- scene ---------- */
  P.beach6cfg = (W, H, n) => {
    const F = n ? W * 1.3 : H * .95, hy = H * (n ? .36 : .33), xs = n ? .6 : 1, q = .25, Xb = -.8 * xs, Zb = 8, Zend = Zb - 2.6;
    const XsB = Xb - .875 - .22, Xs = Z => XsB + .1 * (Z - Zb);
    const Xwet = Z => { const b = Xs(Z) + .45, env = Math.exp(-Math.pow((Z - Zb) / 1.7, 4)), lobe = Xb + 1.08 + .12 * Math.sin(Z * 2.3); return b + env * Math.max(0, lobe - b); };
    const m = W / H < 1, p3 = m ? [12.5, 4.6, .2, 44] : [9.4, 3.6, -.1, 30];
    const camO = { x: Xb, y: p3[0] * q, z: Zb - p3[1] * q, ph: Math.atan2(p3[0], p3[1] - p3[2]), f: H / 2 / Math.tan(p3[3] * Math.PI / 360), cx: W / 2, cy: H / 2 };
    const chair = { X: -.8 * xs, Z: 2.75 }, umb = { X: -.3 * xs, Z: 3.75 };
    const r = P.rng(606), prints = [], p0 = [chair.X - .42, chair.Z + .05], Ze = chair.Z + 1.9, p1 = [Xs(Ze) + .12, Ze];
    const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), N = Math.round(L / .3), ux = (p1[0] - p0[0]) / L, uz = (p1[1] - p0[1]) / L;
    for (let i = 0; i <= N; i++) { const t = i / N, sd = i % 2 ? 1 : -1; prints.push({ X: lerp(p0[0], p1[0], t) - uz * .055 * sd, Z: lerp(p0[1], p1[1], t) + ux * .055 * sd, a: Math.atan2(uz, ux), wet: t > .72 }); }
    const shells = [{ X: .3 * xs, Z: 2.4, s: 1 }, { X: .95 * xs, Z: 4.7, s: .8 }, { X: Xs(6.2) + .32, Z: 6.2, s: .9 }];
    const flecks = Array.from({ length: 320 }, () => ({ z: .3 + Math.pow(r(), 1.5) * 70, o: r(), s: .012 + r() * .028 }));
    return { W, H, n, F, hy, xs, q, Xb, Zb, Zend, Xs, Xwet, camO, chair, umb, prints, shells, flecks,
      pose0: { x: 0, y: 1, z: 0, ph: 0, f: F, cx: W / 2, cy: hy }, poseE: { x: Xb, y: 1, z: Zend, ph: 0, f: F, cx: W / 2, cy: hy },
      camEye: { x: Xb, y: 1, z: Zb + .9, ph: 0, f: F, cx: W / 2, cy: hy },
      ball0: { X: -.15 * xs, Z: 5.0 }, rest: { X: Xb + .9 * q, Z: Zb - 3.1 * q }, br: .125, sun: [-.3, -1.35],
      board: [[-3.75, -2.75], [3.75, -2.75], [3.75, 2.75], [-3.75, 2.75]].map(([x, z]) => [Xb + x * q, Zb - z * q]) };
  };

  /* ---------- ground colour, anchored to world position ---------- */
  const C = { turq: [92, 198, 188], teal: [52, 152, 172], deep: [40, 104, 160], far: [74, 128, 178], wetD: [146, 124, 96], wetL: [194, 172, 134], dry: [238, 218, 180], dryS: [222, 198, 158], haze: [218, 232, 236] };
  const noise = (X, Z) => Math.sin(X * 2.1 + Z * 1.3) * .5 + Math.sin(X * 5.3 - Z * 3.7 + 1.3) * .3 + Math.sin(X * 11.7 + Z * 9.1) * .2;
  const region = (S, X, Z) => X < S.Xs(Z) ? 0 : X < S.Xwet(Z) ? 1 : 2;
  const colAt = (S, X, Z, t) => {
    const xs = S.Xs(Z), d = xs - X; let col;
    if (d > 0) { const u = cl(d / 3.2); col = u < .35 ? mix(C.turq, C.teal, u / .35) : mix(C.teal, C.deep, (u - .35) / .65); col = mix(col, C.far, cl((Z - 14) / 50) * .7); }
    else { const xw = S.Xwet(Z); if (X < xw) { const e = cl((X - xs) / Math.max(.05, xw - xs)); col = mix(C.wetD, C.wetL, Math.pow(e, .6)); }
      else { const e = cl((X - xw) / .35); col = mix(C.wetL, C.dry, Math.pow(e, .5)); col = mix(col, C.dryS, cl(.25 + noise(X, Z) * .25)); } }
    return mix(col, C.haze, cl((1 - Math.exp(-t / 48)) * .92));
  };

  const shell = (ctx, x, y, q, rot, c1, c2) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    blob(ctx, q * .3, q * .5, q * 1.05, q * .3, 'rgba(90,96,130,.35)', q * .25);
    ctx.fillStyle = P.linear(ctx, [[0, c1], [1, c2]], 0, -q, 0, q * .3);
    ctx.beginPath(); ctx.moveTo(-q * .22, q * .3); for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI, rr = q * (1 + (i % 2 ? -.06 : .04)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .95 + q * .05); } ctx.lineTo(q * .22, q * .3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(150,96,70,.5)'; ctx.lineWidth = Math.max(.6, q * .05); for (let j = -5; j <= 5; j++) { const a = -Math.PI / 2 + j * .26; ctx.beginPath(); ctx.moveTo(0, q * .25); ctx.lineTo(Math.cos(a) * q * .95, Math.sin(a) * q * .9 + q * .05); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,250,236,.7)'; ctx.beginPath(); ctx.ellipse(-q * .2, -q * .72, q * .3, q * .08, -.2, 0, 7); ctx.fill();
    ctx.restore();
  };

  /* ---------- ground painter (any camera) ---------- */
  P.ground6 = (ctx, c, w, y0, y1, S, r, K, o = {}) => {
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(ctx.canvas.height, Math.ceil(y1)); if (y1 <= y0) return;
    const cell = Math.max(3, Math.round(4 * K));
    for (let y = y0; y < y1; y += cell) for (let x = 0; x < w; x += cell) { const g = unproj(c, x + cell / 2, y + cell / 2); if (!g) continue; ctx.fillStyle = rgba(colAt(S, g[0], g[1], g[2]), 1); ctx.fillRect(x, y, cell + .6, cell + .6); }
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = y1 - y0; tmp.getContext('2d').drawImage(ctx.canvas, 0, y0, w, y1 - y0, 0, 0, w, y1 - y0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
    ctx.filter = `blur(${(2.2 * K).toFixed(1)}px)`; ctx.drawImage(tmp, 0, y0); ctx.filter = 'none';
    const N = w * (y1 - y0) / ((o.area || 40) * K * K);
    for (let i = 0; i < N; i++) {
      const x = r() * w, y = lerp(y0, y1, r()), g = unproj(c, x, y); if (!g) continue; const [X, Z, t] = g, rg = region(S, X, Z);
      const base = colAt(S, X, Z, t); let dX, dZ, Lw;
      if (rg === 2) { dX = 1; dZ = .08 * Math.sin(X * 3 + Z * 5); Lw = .05 + r() * .2; } else { dX = .1; dZ = 1; Lw = rg ? .1 + r() * .3 : .15 + r() * .6; }
      const nr = Math.hypot(dX, dZ), e = .02, p1 = proj(c, X, 0, Z), p2 = proj(c, X + dX / nr * e, 0, Z + dZ / nr * e); if (p1[2] < .05 || p2[2] < .05) continue;
      const sx = (p2[0] - p1[0]) / e, sy = (p2[1] - p1[1]) / e, sc = Math.hypot(sx, sy), len = cl(sc * Lw, 1.5 * K, 46 * K), ang = Math.atan2(sy, sx);
      const j = (r() - .5) * (rg === 2 ? 18 : 12); let col = [base[0] + j, base[1] + j, base[2] + j * .8];
      if (rg === 1 && r() < .32) col = mix(col, [200, 214, 228], .55);
      if (rg === 0 && r() < .12) col = mix(col, [236, 246, 244], .5);
      P.stroke(ctx, x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2, ang, len, cl(len * .2, .7 * K, 7 * K), col, .25 + r() * .3, (r() - .5) * .25);
    }
    // wind ripples on dry sand
    ctx.lineCap = 'round';
    for (let Z0 = Math.max(c.z + .4, .6); Z0 < c.z + 16; Z0 += .15 + (Z0 - c.z) * .03) {
      const ph = Z0 * 7.3; let prev = null, prevD = null;
      for (let X = Math.max(S.Xwet(Z0) + .12, c.x - 8); X < c.x + 7; X += .045 + Math.max(0, Z0 - c.z) * .01) {
        const Z = Z0 + .035 * Math.sin(X * 2.7 + ph) + .02 * Math.sin(X * 7.1 + ph * 1.7);
        if (X < S.Xwet(Z) + .1) { prev = null; continue; }
        const p = proj(c, X, 0, Z); if (p[2] < .12 || p[0] < -40 || p[0] > w + 40 || p[1] < y0 - 20 || p[1] > y1 + 40) { prev = null; continue; }
        const pd = proj(c, X, 0, Z - .03);
        if (prev && Math.abs(Math.sin(X * 1.3 + ph)) > .22) { const sc = c.f / p[2];
          ctx.strokeStyle = 'rgba(160,128,92,.2)'; ctx.lineWidth = cl(sc * .016, .5, 6 * K); ctx.beginPath(); ctx.moveTo(prevD[0], prevD[1]); ctx.lineTo(pd[0], pd[1]); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,249,234,.34)'; ctx.lineWidth = cl(sc * .011, .5, 4.5 * K); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); }
        prev = p; prevD = pd;
      }
    }
    if (o.feat) paintFeatures(ctx, c, w, S, r, K);
    P.overpaint(ctx, w, ctx.canvas.height, { len: [3 * K, 10 * K], wid: [1 * K, 2.6 * K], a: [.14, .3], area: 650 * K * K, jit: 10, angJ: .4, mask: (x, y) => y > y0 + 2 && y < y1 }, r);
    ctx.restore();
  };

  const gpath = (ctx, c, pts) => { const q = pts.map(([X, Z]) => proj(c, X, 0, Z)); if (q.some(p => p[2] < .08)) return false; ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); return true; };
  const ell = (X, Z, a, rx, rz, n = 16) => Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), lx = Math.cos(t) * rx, lz = Math.sin(t) * rz; return [X + lx * ca - lz * sa, Z + lx * sa + lz * ca]; });
  const CH = { A: [60, 211], B: [250, 50], D: [268, 211], E: [175, 114], F: [138, 145], Q: [192, 140], b0: [85, 190], b1: [248, 190] };
  const qpt = (a, q, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * q[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * q[1] + t * t * b[1]];

  const paintFeatures = (ctx, c, w, S, r, K) => {
    const hC = ctx.canvas.height, sh = document.createElement('canvas'), sw = document.createElement('canvas'); sh.width = sw.width = w; sh.height = sw.height = hC;
    const a = sh.getContext('2d'), b = sw.getContext('2d'); a.fillStyle = a.strokeStyle = 'rgb(146,160,204)'; b.fillStyle = 'rgb(206,164,150)'; a.lineCap = 'round';
    const sn = S.sun, cast = (X, Y, Z) => [X + sn[0] * Y, Z + sn[1] * Y];
    const ch = S.chair, pw = (px, py, side) => cast(ch.X + (px - 150) / 300, (211 - py) / 300, ch.Z + side * .17);
    const line = (P1, P2, wd) => { const p = proj(c, P1[0], 0, P1[1]), q = proj(c, P2[0], 0, P2[1]); if (p[2] < .08 || q[2] < .08) return; a.lineWidth = Math.max(.8, wd * c.f * 2 / (p[2] + q[2])); a.beginPath(); a.moveTo(p[0], p[1]); a.lineTo(q[0], q[1]); a.stroke(); };
    [-1, 1].forEach(sd => { [[CH.A, CH.B], [CH.D, CH.E], [CH.b0, CH.b1]].forEach(([p, q]) => line(pw(...p, sd), pw(...q, sd), .028)); });
    [CH.B, CH.F].forEach(p => line(pw(...p, -1), pw(...p, 1), .03));
    const slL = [], slR = []; for (let i = 0; i <= 12; i++) { const p = qpt(CH.B, CH.Q, CH.F, i / 12); slL.push(pw(p[0], p[1], -1)); slR.push(pw(p[0], p[1], 1)); }
    if (gpath(b, c, slL.concat(slR.reverse()))) b.fill();
    const tw = qpt(CH.B, CH.Q, CH.F, .6), tc = pw(tw[0], tw[1] - 8, 0); if (gpath(a, c, ell(tc[0], tc[1], .2, .1, .08))) a.fill();
    const U = S.umb, top = cast(U.X + .16, 1.34, U.Z); line([U.X, U.Z], top, .02);
    const cc = cast(U.X + .147, 1.22, U.Z), st = 1.9, puffs = [[-.4, .06, .15], [-.2, .14, .22], [.04, .21, .27], [.27, .14, .21], [.44, .06, .13], [-.02, .06, .2]];
    const cv3 = document.createElement('canvas'); cv3.width = w; cv3.height = hC; const k3 = cv3.getContext('2d'); k3.fillStyle = 'rgb(128,146,196)';
    k3.save(); if (gpath(k3, c, [[cc[0] - 2, cc[1] - .02 * st], [cc[0] + 2, cc[1] - .02 * st], [cc[0] + 2, cc[1] + 3], [cc[0] - 2, cc[1] + 3]])) k3.clip();
    puffs.forEach(([pa, pb, pr]) => { if (gpath(k3, c, Array.from({ length: 22 }, (_, i) => { const t = i / 22 * Math.PI * 2; return [cc[0] + (pa + Math.cos(t) * pr) * 1.05, cc[1] + (pb + Math.sin(t) * pr * .8) * st]; }))) k3.fill(); });
    k3.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${(1.8 * K).toFixed(1)}px)`; ctx.globalAlpha = .5; ctx.drawImage(sh, 0, 0); ctx.globalAlpha = .38; ctx.drawImage(sw, 0, 0); ctx.filter = `blur(${(1 * K).toFixed(1)}px)`; ctx.globalAlpha = .6; ctx.drawImage(cv3, 0, 0); ctx.restore();
    S.prints.forEach(p => {
      if (gpath(ctx, c, ell(p.X, p.Z - .014, p.a, .085, .036))) { ctx.fillStyle = 'rgba(255,248,232,.42)'; ctx.fill(); }
      if (gpath(ctx, c, ell(p.X, p.Z + .004, p.a, .072, .03))) { ctx.fillStyle = p.wet ? 'rgba(104,88,70,.5)' : 'rgba(168,136,100,.42)'; ctx.fill(); }
      if (gpath(ctx, c, ell(p.X + Math.cos(p.a) * .1, p.Z + Math.sin(p.a) * .1, p.a, .03, .028, 10))) { ctx.fillStyle = p.wet ? 'rgba(104,88,70,.45)' : 'rgba(168,136,100,.36)'; ctx.fill(); }
    });
    S.shells.forEach(s => { const p = proj(c, s.X, 0, s.Z); if (p[2] < .2) return; const q = c.f * .034 * s.s / p[2]; if (q < .8) return; shell(ctx, p[0], p[1], q, (s.X * 3) % 1 - .5, '#FBF1E4', s.s < .9 ? '#D8A98E' : '#D8B79A'); });
  };

  /* ---------- sky ---------- */
  const skyStops = hf => [[0, '#4C86CE'], [hf * .5, '#78ACDF'], [hf * .86, '#B6D3E8'], [Math.max(0, hf - .002), '#DAE8EC'], [Math.min(1, hf + .002), '#DAE8EC'], [1, '#DAE8EC']];
  const skyArt = (ctx, w, h, r, hp, K, W) => {
    const yw = x => { const u = Math.abs(x / w - .5) * 2; return hp - h * .004 - hp * 1.08 * Math.pow(u, 2.5); };
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, hp); for (let i = 0; i <= 120; i++) ctx.lineTo(i / 120 * w, yw(i / 120 * w)); ctx.lineTo(w, hp); ctx.closePath();
    ctx.globalAlpha = .16; ctx.fillStyle = P.linear(ctx, [[0, '#9A2A30'], [.6, '#B8474C'], [1, '#D8948E']], 0, 0, 0, hp); ctx.fill(); ctx.clip();
    for (let i = 0; i < 300; i++) P.stroke(ctx, r() * w, r() * hp, -Math.PI / 2 + (r() - .5) * .3, (6 + r() * 20) * K, (1 + r() * 2.5) * K, r() < .5 ? [160, 50, 54] : [232, 196, 186], .5, .2);
    ctx.restore();
    ctx.strokeStyle = 'rgba(244,222,212,.3)'; ctx.lineWidth = 2 * K; ctx.beginPath(); let on = false; for (let i = 0; i <= 120; i++) { const x = i / 120 * w, y = yw(x); if (y < hp - 3) { on ? ctx.lineTo(x, y) : ctx.moveTo(x, y); on = true; } else on = false; } ctx.stroke();
    ctx.fillStyle = P.linear(ctx, [[0, 'rgba(218,232,236,0)'], [1, 'rgba(218,232,236,.9)']], 0, hp - h * .15, 0, hp); ctx.fillRect(0, hp - h * .15, w, h * .15);
    const m = Math.min(w, 1600 * K), list = [[.1, .34, .05], [.33, .15, .034], [.57, .4, .058], [.8, .22, .044], [.97, .46, .03]].map(([x, y, s]) => ({ x: x * w, y: y * hp, s: s * m }));
    P.clouds(ctx, list, { light: '#F6F1E7', mid: '#F1E3D3', shadow: '#E7C9B0' }, r);
    [[.23, 1], [.41, .72]].forEach(([x, s]) => { const bx = x * w, q = 9 * K * s * (W < 600 ? .8 : 1), y = hp - K;
      ctx.fillStyle = 'rgba(64,72,96,.72)'; ctx.beginPath(); ctx.moveTo(bx - q * .75, y - q * .22); ctx.lineTo(bx + q * .9, y - q * .22); ctx.lineTo(bx + q * .6, y); ctx.lineTo(bx - q * .5, y); ctx.fill();
      ctx.fillStyle = '#FBF8F0'; ctx.beginPath(); ctx.moveTo(bx, y - q * 1.9); ctx.lineTo(bx + q * .8, y - q * .3); ctx.lineTo(bx, y - q * .3); ctx.fill();
      ctx.fillStyle = '#E2DDD2'; ctx.beginPath(); ctx.moveTo(bx - q * .08, y - q * 1.5); ctx.lineTo(bx - q * .62, y - q * .3); ctx.lineTo(bx - q * .08, y - q * .3); ctx.fill();
      ctx.fillStyle = 'rgba(218,232,236,.35)'; ctx.fillRect(bx - q, y - q * 2, q * 2, q * 2); });
  };
  P.beach6Sky = (cv, S) => { const W = S.W, H = S.H, k = S.n ? 1 : .8, hf = (S.hy + .04 * H) / (1.08 * H);
    return P.sky(cv, { seed: 61, w: W * 1.08, h: H * 1.08, k, stops: skyStops(hf), after: (ctx, w, h, r) => skyArt(ctx, w, h, r, h * hf, k, W) }); };

  P.beach6Ground = (cv, S, which) => {
    const W = S.W, H = S.H, k = S.n ? 1.6 : 1.05, { ctx, w, h } = P.setup(cv, W * 1.2 * k, H * k), r = P.rng(71 + which);
    ctx.clearRect(0, 0, w, h); const c0 = which ? S.poseE : S.pose0, c = Object.assign({}, c0, { f: c0.f * k, cx: (c0.cx + .1 * W) * k, cy: c0.cy * k });
    P.ground6(ctx, c, w, c.cy, h, S, r, k, { feat: !which });
    if (which) { ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = P.linear(ctx, [[0, '#000'], [.7, '#000'], [1, 'rgba(0,0,0,0)']], 0, c.cy, 0, h); ctx.fillRect(0, 0, w, h); ctx.restore(); }
  };

  P.beach6Tall = (cv, S) => {
    const W = S.W, H = S.H, k = S.n ? 1.2 : .85, bx = .06 * W, hf = S.hy / (2.2 * H);
    return P.sky(cv, { seed: 62, w: W * 1.12, h: 2.2 * H, k, stops: skyStops(hf), after: (ctx, w, h, r) => skyArt(ctx, w, h, r, S.hy * k, k, W),
      post: (ctx, w, h, r) => {
        const sc = (cm, oy) => Object.assign({}, cm, { f: cm.f * k, cx: (cm.cx + bx) * k, cy: (cm.cy + oy) * k });
        const yH = Math.round(H * k), yO = Math.round(1.2 * H * k), ce = sc(S.camEye, 0);
        P.ground6(ctx, ce, w, ce.cy, yH, S, r, k, {});
        P.ground6(ctx, sc(S.camO, 1.2 * H), w, yO, h, S, r, k, {});
        const rows = yO - yH + 4, im = ctx.getImageData(0, yH - 2, w, rows), d = im.data;
        const R = Math.round(28 * k), smooth = off => { const o = new Float32Array(w * 3); for (let ch = 0; ch < 3; ch++) { let acc = 0, cnt = 0; for (let x = -R; x < w + R; x++) { const xa = x + R; if (xa >= 0 && xa < w) { acc += d[off + xa * 4 + ch]; cnt++; } const xr = x - R - 1; if (xr >= 0 && xr < w) { acc -= d[off + xr * 4 + ch]; cnt--; } if (x >= 0 && x < w) o[x * 3 + ch] = acc / Math.max(1, cnt); } } return o; };
        const sA = smooth(0), sB = smooth((rows - 1) * w * 4), rA = d.slice(0, w * 4), rB = d.slice((rows - 1) * w * 4, rows * w * 4);
        for (let y = 1; y < rows - 1; y++) { const t = y / (rows - 1), tt = t * t * (3 - 2 * t), wa = cl(1 - t / .1), wb = cl((t - .9) / .1);
          for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; for (let ch = 0; ch < 3; ch++) { let v = sA[x * 3 + ch] * (1 - tt) + sB[x * 3 + ch] * tt; v = v * (1 - wa) + rA[x * 4 + ch] * wa; v = v * (1 - wb) + rB[x * 4 + ch] * wb; d[i + ch] = v; } d[i + 3] = 255; } }
        ctx.putImageData(im, 0, yH - 2);
        const bm = (x, y) => y > yH - 10 && y < yO + 10;
        P.overpaint(ctx, w, h, { len: [10 * k, 34 * k], wid: [3 * k, 8 * k], a: [.35, .6], area: 60 * k * k, jit: 10, angJ: .25, mask: bm }, r);
        P.overpaint(ctx, w, h, { len: [4 * k, 14 * k], wid: [1.2 * k, 3.5 * k], a: [.3, .55], area: 30 * k * k, jit: 16, angJ: .3, mask: bm }, r);
        
      } });
  };

  /* ---------- moving water (per frame) ---------- */
  P.surf6 = (ctx, c, S, now, surge, K, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const xf = Z => S.Xs(Z) + .2 + .15 * Math.sin(now * .55 - Z * .33) + .05 * Math.sin(Z * 2.1 + now * .31) + surge * (S.Xb + 1.0 - S.Xs(Z));
    const A = [], B = [], G = [];
    for (let Z = Math.max(c.z + .12, .3); Z < c.z + 80; Z += .03 + (Z - c.z) * .07) { const f = xf(Z), b = proj(c, f, 0, Z); if (b[2] < .08) continue; A.push(proj(c, S.Xs(Z) - .6, 0, Z)); B.push(b); G.push(proj(c, f + .1, 0, Z)); }
    if (B.length < 2) return;
    const band = (P1, P2) => { ctx.beginPath(); P1.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let i = P2.length - 1; i >= 0; i--) ctx.lineTo(P2[i][0], P2[i][1]); ctx.closePath(); };
    band(A, B); ctx.fillStyle = 'rgba(128,212,204,.3)'; ctx.fill();
    band(B, G); ctx.fillStyle = 'rgba(250,252,248,.16)'; ctx.fill();
    ctx.lineCap = 'round';
    for (let j = 0; j < 3; j++) {
      const u = (now * .085 + j / 3) % 1, dx = 1.9 * (1 - u), al = Math.sin(u * Math.PI) * .42; ctx.strokeStyle = `rgba(248,252,250,${al.toFixed(3)})`; let prev = null, i = 0;
      for (let Z = Math.max(c.z + .3, .5); Z < c.z + 60; Z += .06 + (Z - c.z) * .08, i++) { const p = proj(c, S.Xs(Z) - dx + .05 * Math.sin(Z * 1.7 + j), 0, Z); if (p[2] < .1) { prev = null; continue; } if (prev && i % 3) { ctx.lineWidth = cl(c.f / p[2] * .014, .5, 5 * K); ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); } prev = p; }
    }
    for (let pass = 0; pass < 2; pass++) { ctx.strokeStyle = pass ? 'rgba(255,255,252,.92)' : 'rgba(228,244,240,.5)';
      for (let i = 1; i < B.length; i++) { const p = B[i], q = B[i - 1]; ctx.lineWidth = cl(c.f / p[2] * (pass ? .02 : .05), .6, (pass ? 7 : 14) * K); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); } }
    ctx.fillStyle = 'rgba(255,255,252,.82)';
    S.flecks.forEach(fk => { if (fk.z < c.z + .12) return; const p = proj(c, xf(fk.z) - fk.o * .2, 0, fk.z); if (p[2] < .08 || p[0] < -20 || p[0] > w + 20 || p[1] < -20 || p[1] > h + 20) return; const rr = c.f * fk.s / p[2]; if (rr < .35) return; ctx.beginPath(); ctx.ellipse(p[0], p[1], rr, rr * .45, 0, 0, 7); ctx.fill(); });
  };

  /* ---------- the ball (per frame) ---------- */
  P.ballTex = () => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), r = P.rng(88); for (let i = 0; i < 420; i++) P.stroke(x, r() * 128, r() * 128, (r() - .5) * 1.2 + (r() < .5 ? 0 : Math.PI / 2), 4 + r() * 14, 1 + r() * 3, r() < .5 ? [255, 255, 255] : [0, 0, 0], .35, .3); return c; };
  P.ball6 = (ctx, x, y, R, rho, tex) => {
    const cols = ['#C85A4C', '#F1E6D0', '#3F8C98', '#F1E6D0', '#DDAE52', '#F1E6D0'];
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.clip();
    ctx.fillStyle = '#F1E6D0'; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    for (let k = 0; k < 6; k++) {
      let c0 = (k + .5) * Math.PI / 3 + rho; c0 = Math.atan2(Math.sin(c0), Math.cos(c0)); if (Math.abs(c0) >= 2.09) continue;
      const a = Math.max(-Math.PI / 2, c0 - Math.PI / 6), b = Math.min(Math.PI / 2, c0 + Math.PI / 6); if (b <= a) continue;
      ctx.beginPath(); for (let i = 0; i <= 18; i++) { const th = i / 18 * Math.PI; ctx.lineTo(x - R * Math.cos(th), y - R * Math.sin(th) * Math.sin(a)); } for (let i = 18; i >= 0; i--) { const th = i / 18 * Math.PI; ctx.lineTo(x - R * Math.cos(th), y - R * Math.sin(th) * Math.sin(b)); } ctx.closePath(); ctx.fillStyle = cols[k]; ctx.fill();
    }
    let g = ctx.createRadialGradient(x - R * .28, y - R * .52, R * .05, x, y, R * 1.02); g.addColorStop(0, 'rgba(255,250,236,.5)'); g.addColorStop(.4, 'rgba(255,246,228,.06)'); g.addColorStop(.78, 'rgba(46,52,84,.2)'); g.addColorStop(1, 'rgba(34,38,66,.5)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    g = ctx.createLinearGradient(0, y + R * .3, 0, y + R); g.addColorStop(0, 'rgba(240,206,150,0)'); g.addColorStop(1, 'rgba(240,206,150,.3)'); ctx.fillStyle = g; ctx.fillRect(x - R, y, 2 * R, R);
    if (tex && R > 4) { ctx.globalAlpha = .18; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(tex, x - R, y - R, 2 * R, 2 * R); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,242,214,.7)'; ctx.lineWidth = Math.max(.8, R * .07); ctx.beginPath(); ctx.arc(x, y, R * .96, Math.PI * 1.12, Math.PI * 1.82); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,250,.85)'; ctx.beginPath(); ctx.ellipse(x - R * .3, y - R * .5, R * .16, R * .09, -.5, 0, 7); ctx.fill();
  };

  /* ---------- the chair, in profile, facing the sea ---------- */
  const woodRail = (ctx, x1, y1, x2, y2, wd, base, r, rim = .75) => {
    const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a), up = ny > 0 ? -1 : 1, c = hex(base);
    ctx.lineCap = 'round'; ctx.strokeStyle = base; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    for (let i = 0; i < L / 2.2; i++) { const t = r(), o = (r() - .5) * wd * .75, j = (r() - .5) * 26; P.stroke(ctx, x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o, a + (r() - .5) * .06, 3 + r() * 11, .6 + r() * 1.3, [c[0] + j, c[1] + j, c[2] + j * .9], .55, 0); }
    const ox = nx * up * wd * .36, oy = ny * up * wd * .36;
    ctx.strokeStyle = `rgba(255,234,196,${rim})`; ctx.lineWidth = Math.max(.8, wd * .22); ctx.beginPath(); ctx.moveTo(x1 + ox, y1 + oy); ctx.lineTo(x2 + ox, y2 + oy); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,34,44,.3)'; ctx.lineWidth = Math.max(.6, wd * .18); ctx.beginPath(); ctx.moveTo(x1 - ox, y1 - oy); ctx.lineTo(x2 - ox, y2 - oy); ctx.stroke();
  };
  P.chair6 = cv => {
    const { ctx } = P.setup(cv, 600, 440); ctx.setTransform(2, 0, 0, 2, 0, 0); const r = P.rng(61), fr = p => [p[0] + 7, p[1] - 4];
    woodRail(ctx, ...fr(CH.A), ...fr(CH.B), 7, '#6C5E52', r, .45); woodRail(ctx, ...fr(CH.D), ...fr(CH.E), 7, '#6C5E52', r, .4); woodRail(ctx, ...fr(CH.b0), ...fr(CH.b1), 5, '#65584C', r, .3);
    const N = 28, low = [], top = []; for (let i = 0; i <= N; i++) { const t = i / N, p = qpt(CH.B, CH.Q, CH.F, t), th = 3 + 11 * Math.sin(Math.PI * Math.pow(t, .9)); low.push(p); top.push([p[0] + 2, p[1] - th]); }
    const cols = ['#C9644F', '#F2E2C4', '#C9644F', '#F2E2C4', '#C9644F'], cr = cols.map(hex);
    for (let s = 0; s < 5; s++) { const f0 = s / 5, f1 = (s + 1) / 5; ctx.beginPath(); for (let i = 0; i <= N; i++) ctx.lineTo(lerp(low[i][0], top[i][0], f0), lerp(low[i][1], top[i][1], f0)); for (let i = N; i >= 0; i--) ctx.lineTo(lerp(low[i][0], top[i][0], f1), lerp(low[i][1], top[i][1], f1)); ctx.closePath(); ctx.fillStyle = cols[s]; ctx.fill(); }
    const sl = new Path2D(); low.forEach((p, i) => i ? sl.lineTo(p[0], p[1]) : sl.moveTo(p[0], p[1])); for (let i = N; i >= 0; i--) sl.lineTo(top[i][0], top[i][1]); sl.closePath();
    ctx.save(); ctx.clip(sl);
    let g = ctx.createLinearGradient(0, 40, 0, 160); g.addColorStop(0, 'rgba(255,238,205,.4)'); g.addColorStop(1, 'rgba(120,60,50,.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 300, 220);
    for (let i = 0; i < 300; i++) { const t = r() * .98, ii = Math.floor(t * N), f = r(), a = low[ii], b = top[ii], c2 = low[ii + 1], s = Math.min(4, Math.floor(f * 5)), j = (r() - .5) * 22;
      P.stroke(ctx, lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(c2[1] - a[1], c2[0] - a[0]) + (r() - .5) * .1, 4 + r() * 9, .9 + r() * 1.6, [cr[s][0] + j, cr[s][1] + j, cr[s][2] + j], .45, .1); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(120,56,44,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); low.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,236,206,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); top.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    const at = t => { const i = Math.round(t * N); return { c: [lerp(low[i][0], top[i][0], .5), lerp(low[i][1], top[i][1], .5)], a: Math.atan2(low[i + 1][1] - low[i - 1][1], low[i + 1][0] - low[i - 1][0]) + Math.PI }; };
    const T = at(.62); ctx.save(); ctx.translate(T.c[0], T.c[1] - 4); ctx.rotate(T.a);
    for (let L = 0; L < 3; L++) { ctx.fillStyle = L % 2 ? '#E1E6E2' : '#F2F3EE'; ctx.beginPath(); ctx.roundRect(-27 + L * 1.5, -L * 4.2 - 4.5, 54 - L * 3, 5.2, 2.4); ctx.fill(); }
    ctx.fillStyle = 'rgba(92,134,162,.55)'; ctx.fillRect(-18, -12.8, 4.5, 13.2); ctx.fillRect(12, -12.8, 3.5, 13.2);
    ctx.fillStyle = 'rgba(255,246,226,.85)'; ctx.fillRect(-23, -13.4, 46, 1.4); ctx.fillStyle = 'rgba(60,70,96,.2)'; ctx.fillRect(-27, -.6, 54, 2);
    ctx.restore();
    const Hh = at(.3); ctx.save(); ctx.translate(Hh.c[0] + 2, Hh.c[1] - 5); ctx.rotate((Hh.a - Math.PI) * .45);
    const hat = new Path2D(); hat.ellipse(0, 0, 31, 6.5, 0, 0, 7); hat.moveTo(-14, -1); hat.bezierCurveTo(-15, -18, 15, -18, 14, -1); hat.closePath();
    ctx.fillStyle = P.linear(ctx, [[0, '#EFD8A0'], [1, '#B8944F']], 0, -6, 0, 6); ctx.beginPath(); ctx.ellipse(0, 0, 31, 6.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = P.linear(ctx, [[0, '#F5E0AA'], [.6, '#D2B06C'], [1, '#A5844A']], -14, 0, 14, 0); ctx.beginPath(); ctx.moveTo(-14, -1); ctx.bezierCurveTo(-15, -18, 15, -18, 14, -1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A8453C'; ctx.beginPath(); ctx.moveTo(-14.2, -2); ctx.lineTo(14.2, -2); ctx.lineTo(13.4, -6.2); ctx.lineTo(-13.4, -6.2); ctx.fill();
    ctx.save(); ctx.clip(hat); for (let i = 0; i < 90; i++) P.stroke(ctx, (r() - .5) * 60, (r() - .5) * 16 - 3, (r() - .5) * .8, 3 + r() * 5, .7, r() < .5 ? [196, 158, 96] : [246, 226, 176], .5, .3); ctx.restore();
    ctx.strokeStyle = 'rgba(255,246,218,.85)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-11, -9); ctx.bezierCurveTo(-8, -14.5, 8, -14.5, 11, -9); ctx.stroke();
    ctx.restore();
    woodRail(ctx, ...CH.A, ...CH.B, 8, '#8E7A66', r); woodRail(ctx, ...CH.D, ...CH.E, 8, '#857260', r); woodRail(ctx, ...CH.b0, ...CH.b1, 5.5, '#7E6C5C', r, .5);
    [CH.B, CH.F, CH.E].forEach(p => { ctx.fillStyle = '#6E5E50'; ctx.beginPath(); ctx.arc(p[0], p[1], 4.4, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,236,200,.6)'; ctx.beginPath(); ctx.arc(p[0] - 1, p[1] - 1.4, 1.6, 0, 7); ctx.fill(); });
    ctx.setTransform(1, 0, 0, 1, 0, 0); P.overpaint(ctx, 600, 440, { len: [4, 12], wid: [1.2, 3], a: [.3, .55], area: 110, jit: 14, ang: () => r() * Math.PI }, r);
  };

  /* ---------- the umbrella, backlit ---------- */
  P.umb6 = cv => {
    const { ctx } = P.setup(cv, 720, 840); ctx.setTransform(2, 0, 0, 2, 0, 0); const r = P.rng(62), gy = 412;
    blob(ctx, 162, gy, 18, 4.5, 'rgba(208,184,146,.9)', 1.2);
    ctx.save(); ctx.translate(160, gy); ctx.rotate(.12); ctx.translate(-160, -gy);
    woodRail(ctx, 160, gy + 2, 160, 108, 5.5, '#8A7461', r, .7); woodRail(ctx, 160, 108, 160, 40, 4.5, '#8A7461', r, .6); ctx.fillStyle = '#6A5A4C'; ctx.fillRect(156.5, 232, 7, 5);
    const cx = 160, top = 36, rimY = 98, rx = 152, ry = 15, n = 8, tip = k => { const a = k / n * Math.PI * 2 + .2; return [cx + rx * Math.cos(a), rimY + ry * Math.sin(a), Math.sin(a)]; };
    ctx.fillStyle = '#7C4A3E'; ctx.beginPath(); ctx.ellipse(cx, rimY, rx, ry, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,36,.6)'; ctx.lineWidth = 1.2; for (let k = 0; k < n; k++) { const t = tip(k); ctx.beginPath(); ctx.moveTo(cx, rimY - 6); ctx.lineTo(t[0], t[1]); ctx.stroke(); }
    const dome = new Path2D(); dome.moveTo(cx - rx, rimY); dome.quadraticCurveTo(cx - rx * .82, top + 6, cx, top); dome.quadraticCurveTo(cx + rx * .82, top + 6, cx + rx, rimY);
    const fronts = []; for (let k = 0; k < n; k++) { const t = tip(k); if (t[2] > -.05) fronts.push(t); } fronts.sort((a, b) => b[0] - a[0]);
    let prev = [cx + rx, rimY]; const edge = [prev]; fronts.concat([[cx - rx, rimY]]).forEach(t => { dome.quadraticCurveTo((prev[0] + t[0]) / 2, (prev[1] + t[1]) / 2 - 7, t[0], t[1]); edge.push(t); prev = t; }); dome.closePath();
    ctx.save(); ctx.clip(dome);
    ctx.fillStyle = '#F4E6CC'; ctx.fillRect(0, 0, 360, 140);
    for (let k = 0; k < n; k++) { const a = tip(k), b = tip(k + 1); if (a[2] < -.2 && b[2] < -.2) continue; if (k % 2) continue;
      ctx.fillStyle = '#CE6B57'; ctx.beginPath(); ctx.moveTo(cx, top); ctx.quadraticCurveTo(lerp(cx, a[0], .6) + (a[0] - cx) * .12, top + (a[1] - top) * .3, a[0], a[1] + 6); ctx.lineTo(b[0], b[1] + 6); ctx.quadraticCurveTo(lerp(cx, b[0], .6) + (b[0] - cx) * .12, top + (b[1] - top) * .3, cx, top); ctx.fill(); }
    let g = ctx.createRadialGradient(cx + 22, top + 32, 4, cx + 22, top + 32, 150); g.addColorStop(0, 'rgba(255,244,214,.5)'); g.addColorStop(1, 'rgba(255,244,214,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 360, 140);
    g = ctx.createLinearGradient(0, top, 0, rimY + ry); g.addColorStop(0, 'rgba(90,40,40,0)'); g.addColorStop(1, 'rgba(90,40,40,.26)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 360, 140);
    ctx.strokeStyle = 'rgba(80,50,44,.24)'; ctx.lineWidth = 1.3; for (let k = 0; k < n; k++) { const a = tip(k); ctx.beginPath(); ctx.moveTo(cx, top); ctx.quadraticCurveTo(lerp(cx, a[0], .6) + (a[0] - cx) * .12, top + (a[1] - top) * .3, a[0], a[1]); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(110,56,46,.5)'; ctx.lineWidth = 2.6; ctx.beginPath(); edge.forEach((p, i) => { if (!i) ctx.moveTo(p[0], p[1] - 2); else { const q = edge[i - 1]; ctx.quadraticCurveTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 9, p[0], p[1] - 2); } }); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,214,.6)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - rx * .8, rimY - 20); ctx.quadraticCurveTo(cx - rx * .6, top + 6, cx, top + 1); ctx.quadraticCurveTo(cx + rx * .6, top + 6, cx + rx * .8, rimY - 20); ctx.stroke();
    ctx.fillStyle = '#6A5A4C'; ctx.beginPath(); ctx.arc(cx, top - 3, 3.6, 0, 7); ctx.fill();
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0); P.overpaint(ctx, 720, 840, { len: [4, 14], wid: [1.4, 3.4], a: [.3, .55], area: 120, jit: 14, ang: () => r() * Math.PI }, r);
  };

  P.gull6 = cv => {
    const { ctx } = P.setup(cv, 180, 80); ctx.setTransform(2, 0, 0, 2, 0, 0);
    [1, -1].forEach(s => { const ex = 45 + s * 18;
      P.stroke(ctx, 45, 22, s > 0 ? -.32 : Math.PI + .32, 19, 3.2, [236, 238, 240], .95, s > 0 ? -.2 : .2);
      P.stroke(ctx, ex, 16, s > 0 ? .46 : Math.PI - .46, 17, 2.4, [206, 212, 220], .95, s > 0 ? .18 : -.18);
      P.stroke(ctx, ex + s * 12, 21.6, s > 0 ? .5 : Math.PI - .5, 6, 2, [62, 64, 76], .9, 0); });
    ctx.fillStyle = '#F2F2F0'; ctx.beginPath(); ctx.ellipse(45, 23, 6.5, 3.2, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(150,158,176,.6)'; ctx.beginPath(); ctx.ellipse(45, 24.4, 5, 1.6, 0, 0, 7); ctx.fill();
  };
})();
