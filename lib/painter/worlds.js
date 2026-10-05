/* v4 world plates. Extends window.Painter (load after painter.js) */
(function init() {
  const P = window.Painter; if (!P) { setTimeout(init, 20); return; } if (P.desert) return;
  const hex = P.hex, lerp = (a, b, t) => a + (b - a) * t;
  const bz = (p0, p1, p2, p3, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); };
  const sz = cv => ({ w: cv.offsetWidth || 2, h: cv.offsetHeight || 2 });
  const blob = (ctx, x, y, rx, ry, c, blur) => { ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); ctx.restore(); };

  P.cloudLayer = (cv, o) => {
    const k = o.k ?? .5, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(o.seed || 3);
    P.clouds(ctx, o.spots.map(([x, y, q]) => ({ x: x * w, y: y * h, s: q * Math.min(w, 1600 * k) })), { light: '#F6F1E7', mid: '#F1E3D3', shadow: '#E7C9B0', base: o.base || '#DCC8B8' }, r);
    P.overpaint(ctx, w, h, { len: [12 * k * 2, 34 * k * 2], wid: [5 * k * 2, 11 * k * 2], a: [.3, .6], ang: () => 0, area: 420 * k * k * 4, jit: 6 }, r);
  };

  P.skinField = (cv, W, H, E, ox, oy) => {
    const k = .32; const { ctx, w, h } = P.setup(cv, W * k, H * k); const r = P.rng(12);
    const ex = (ox + E.cx) * k, ey = (oy + E.cy) * k, s = E.ew * k, eh = E.eh * k;
    const g = ctx.createRadialGradient(ex - s * .2, ey - s * .3, s * .2, ex, ey, Math.max(w, h) * .62);
    g.addColorStop(0, '#E4B899'); g.addColorStop(.3, '#D6A283'); g.addColorStop(.65, '#B57A5E'); g.addColorStop(1, '#8A5842');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    blob(ctx, ex, ey - eh * 2.4, s * 1.5, eh * 1.2, 'rgba(110,62,46,.42)', s * .18);
    blob(ctx, ex + s * .15, ey + eh * 3.2, s * 1.3, eh * 1.6, 'rgba(248,222,198,.5)', s * .2);
    blob(ctx, ex - s * 1.35, ey + eh * 1.5, s * .32, eh * 4, 'rgba(120,70,52,.42)', s * .16);
    blob(ctx, ex + s * 1.6, ey - eh * .5, s * .5, eh * 3, 'rgba(120,70,52,.3)', s * .2);
    for (let i = 0; i < 900; i++) { const t = r(); const x = ex + (t - .5) * s * 2.3; const y = ey - (E.eh * 2 + Math.sin(t * Math.PI) * E.eh * .6) * k + (r() - .5) * eh * .45; P.stroke(ctx, x, y, -.35 + t * .55 + (r() - .5) * .3, (10 + r() * 18) * k, (1.5 + r() * 2.5) * k, hex(r() < .5 ? '#4A2E22' : '#6B4331'), .45 + r() * .4, (r() - .5) * .3); }
    const around = (x, y) => Math.atan2(y - ey, x - ex) + Math.PI / 2;
    P.overpaint(ctx, w, h, { len: [8, 26], wid: [3, 8], a: [.35, .65], ang: around, area: 200, jit: 9 }, r);
    ctx.save(); ctx.scale(k, k); ctx.translate(ox, oy); ctx.globalCompositeOperation = 'destination-out'; ctx.fill(new Path2D(E.path)); ctx.restore();
  };

  P.shore = (cv, o) => { const s = sz(cv); return P.boardScene(cv, { seed: 21, w: s.w, h: s.h, hy: o.hy, f: .62, z0: .7, tile: .5, rows: 14, clouds: 9, stops: [[0, '#8FB0D8'], [.26, '#C4D2E2'], [.44, '#F2D4BC'], [.5, '#F2C7A5'], [1, '#F2C7A5']] }); };

  P.pebbles = cv => {
    const k = .7, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(22);
    for (let i = 0; i < 26; i++) {
      const x = r() * w, y = h * (.35 + r() * .6), q = (6 + r() * 16) * k * (y / h + .3);
      blob(ctx, x + q * .5, y + q * .35, q * 1.1, q * .35, 'rgba(60,30,20,.35)', q * .3);
      if (r() < .3) { // shell
        ctx.fillStyle = P.linear(ctx, [[0, '#FBF1E4'], [1, '#D8B79A']], x, y - q, x, y + q * .4);
        ctx.beginPath(); ctx.moveTo(x - q, y + q * .3); ctx.quadraticCurveTo(x, y - q * 1.3, x + q, y + q * .3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(160,110,80,.6)'; ctx.lineWidth = 1.2 * k; for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(x, y + q * .25); ctx.lineTo(x + j * q * .4, y - q * .55 + Math.abs(j) * q * .2); ctx.stroke(); }
      } else {
        const c = ['#9E958A', '#C9BCA8', '#6E665E', '#B8A58E'][(r() * 4) | 0];
        ctx.fillStyle = P.linear(ctx, [[0, '#F3EEE4'], [.35, c], [1, '#3E3630']], x - q, y - q, x + q, y + q);
        ctx.beginPath(); ctx.ellipse(x, y, q, q * (.55 + r() * .25), r() * .6 - .3, 0, 7); ctx.fill();
      }
    }
    P.overpaint(ctx, w, h, { len: [3, 9], wid: [1.5, 4], a: [.3, .6], ang: () => r() * 3, area: 90, jit: 14 }, r);
  };

  P.oceanIn = cv => { const s = sz(cv); return P.sky(cv, {
    seed: 31, w: s.w, h: s.h, stops: [[0, '#5E97D6'], [.42, '#BFD6EA'], [.56, '#E9EEF0'], [1, '#E9EEF0']], clouds: 10, cy0: .04, cy1: .34, cs0: .04, cs1: .1,
    after: (ctx, w, h, r) => {
      const hy = h * .56, cy = x => { const u = Math.abs(x / w - .5) * 2; return hy - h * .035 - h * .66 * Math.pow(u, 3.2); };
      ctx.beginPath(); ctx.moveTo(0, hy); for (let i = 0; i <= 80; i++) ctx.lineTo(i / 80 * w, cy(i / 80 * w)); ctx.lineTo(w, hy); ctx.closePath();
      ctx.fillStyle = P.linear(ctx, [[0, '#7E1E24'], [.55, '#A8363A'], [1, '#CF9A94']], 0, 0, 0, hy); ctx.fill();
      ctx.strokeStyle = 'rgba(241,228,200,.85)'; ctx.lineWidth = 4 * (P._k || 1); ctx.beginPath(); for (let i = 0; i <= 80; i++) { const x = i / 80 * w; i ? ctx.lineTo(x, cy(x)) : ctx.moveTo(x, cy(x)); } ctx.stroke();
      P.sea(ctx, w, hy, h, { far: '#3E8A94', near: '#1F5A66', mid: '#6FAFB5', foam: '#F3EEE4' }, r);
    } }); };

  P.wave = cv => {
    const k = .6, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(32); P._k = k;
    const A = [0, h * .84], B1 = [w * .3, h * .78], B2 = [w * .5, h * .6], C = [w * .62, h * .34], D1 = [w * .7, h * .14], D2 = [w * .86, h * .1], E = [w * .97, h * .22];
    const body = new Path2D(); body.moveTo(0, h); body.lineTo(A[0], A[1]); body.bezierCurveTo(B1[0], B1[1], B2[0], B2[1], C[0], C[1]); body.bezierCurveTo(D1[0], D1[1], D2[0], D2[1], E[0], E[1]); body.bezierCurveTo(w * 1.02, h * .3, w * .95, h * .42, w * .9, h * .5); body.lineTo(w, h * .56); body.lineTo(w, h); body.closePath();
    ctx.fillStyle = P.linear(ctx, [[0, '#9FD3CE'], [.3, '#3E8E96'], [.7, '#1F5A66'], [1, '#123F4A']], w * .6, h * .15, w * .75, h); ctx.fill(body);
    ctx.save(); ctx.clip(body); blob(ctx, w * .86, h * .5, w * .1, h * .16, 'rgba(8,34,44,.6)', 26 * k); blob(ctx, w * .55, h * .5, w * .2, h * .08, 'rgba(200,236,230,.35)', 30 * k); ctx.restore();
    for (let i = 0; i < 520; i++) { const t = r(); const p = t < .5 ? bz(A, B1, B2, C, t * 2) : bz(C, D1, D2, E, (t - .5) * 2); const j = (r() - .2) * h * .05; P.stroke(ctx, p[0] + (r() - .5) * 10 * k, p[1] + j, (t - .55) * 1.6 + (r() - .5) * .5, (8 + r() * 26) * k, (2 + r() * 5) * k, hex(r() < .7 ? '#F6F3EC' : '#CFE4E2'), .5 + r() * .45, (r() - .5) * .4); }
    for (let i = 0; i < 260; i++) { const t = .55 + r() * .45; const p = bz(C, D1, D2, E, (t - .5) * 2); const d = r() * h * .12; P.stroke(ctx, p[0] + (r() - .5) * w * .05, p[1] - d, -1.2 + r() * .4, (2 + r() * 6) * k, (1.5 + r() * 3) * k, [236, 240, 238], .3 + r() * .5, .1); }
    P.overpaint(ctx, w, h, { len: [14, 44], wid: [5, 12], a: [.3, .6], ang: (x, y) => -.6 + x / w * .9, area: 300, jit: 10 }, r);
  };

  P.hall = cv => { const s = sz(cv); return P.sky(cv, {
    seed: 41, w: s.w, h: s.h, k: .55, big: .55, stops: [[0, '#6FC0C2'], [.18, '#2E8C95'], [.5, '#16506C'], [.56, '#123A55'], [.57, '#9E9A86'], [.7, '#C9B994'], [1, '#D8C7A3']], clouds: 0,
    after: (ctx, w, h, r) => {
      const hy = h * .56, vx = w * .5, K = P._k || 1;
      for (let side = -1; side <= 1; side += 2) for (let i = 7; i >= 0; i--) {
        const z = 1 + i * .75, x = vx + side * (w * .66) / z, by = hy + h * .5 / z, ch = h * (i % 3 === 1 ? .55 : 1.05) / z, cw = w * .055 / z, fog = Math.min(1, i / 7.5) * .85;
        const lit = P.hex('#E9E1CE'), fc = P.hex('#15506A');
        const c1 = [lerp(lit[0], fc[0], fog), lerp(lit[1], fc[1], fog), lerp(lit[2], fc[2], fog)], c2 = [c1[0] * .7, c1[1] * .75, c1[2] * .8];
        ctx.fillStyle = P.linear(ctx, [[0, P.rgba(c2, 1)], [.35, P.rgba(c1, 1)], [1, P.rgba(c2, 1)]], x - cw / 2, 0, x + cw / 2, 0);
        ctx.beginPath(); ctx.moveTo(x - cw / 2, by); ctx.lineTo(x - cw / 2, by - ch);
        if (i % 3 === 1) { for (let j = 0; j <= 6; j++) ctx.lineTo(x - cw / 2 + cw * j / 6, by - ch - (r() - .3) * cw * .5); } else ctx.lineTo(x + cw / 2, by - ch);
        ctx.lineTo(x + cw / 2, by); ctx.closePath(); ctx.fill();
        if (i % 3 !== 1) { ctx.fillStyle = P.rgba(c1, 1); ctx.fillRect(x - cw * .75, by - ch - cw * .3, cw * 1.5, cw * .3); }
        ctx.strokeStyle = P.rgba(c2, .6); ctx.lineWidth = Math.max(1, 2 * K / z); for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x - cw / 2 + cw * j / 4, by); ctx.lineTo(x - cw / 2 + cw * j / 4, by - ch * .95); ctx.stroke(); }
        blob(ctx, x, by, cw * 1.2, cw * .2, 'rgba(18,58,85,.35)', 4 * K);
      }
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 7; i++) { const x = w * (.1 + r() * .8), sw = w * (.02 + r() * .05); ctx.fillStyle = P.linear(ctx, [[0, 'rgba(242,217,160,.34)'], [1, 'rgba(242,217,160,0)']], 0, 0, 0, h * .9); ctx.beginPath(); ctx.moveTo(x - sw, 0); ctx.lineTo(x + sw, 0); ctx.lineTo(x + sw * 3 + w * .06, h * .9); ctx.lineTo(x - sw * 2 + w * .06, h * .9); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      for (let i = 0; i < w * h / 900; i++) { const y = lerp(hy, h, Math.pow(r(), .8)), t = (y - hy) / (h - hy), x = r() * w; P.stroke(ctx, x, y, (r() - .5) * .15, (6 + t * 40) * K, (1 + t * 4) * K, hex(r() < .5 ? '#EFE3C4' : '#AE9B74'), .35 + r() * .35, .35); }
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = 'rgba(242,217,160,.28)'; ctx.lineWidth = 1.5 * K;
      for (let i = 0; i < 70; i++) { const x = r() * w, y = lerp(hy + h * .05, h, r()), q = (10 + r() * 30) * K * ((y - hy) / (h - hy) + .4); ctx.beginPath(); ctx.ellipse(x, y, q, q * .3, 0, r() * 3, r() * 3 + 2.5); ctx.stroke(); }
      ctx.restore();
    } }); };

  P.fish = cv => {
    const { ctx, w, h } = P.setup(cv, 90, 40); const r = P.rng(44);
    ctx.fillStyle = P.linear(ctx, [[0, '#2A4E62'], [.5, '#1B3A4E'], [1, '#0F2638']], 0, 8, 0, 34);
    ctx.beginPath(); ctx.ellipse(40, 20, 28, 10, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(66, 20); ctx.lineTo(86, 8); ctx.lineTo(82, 20); ctx.lineTo(86, 32); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(242,217,160,.45)'; ctx.beginPath(); ctx.ellipse(38, 15, 18, 3, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#F3EEE4'; ctx.beginPath(); ctx.arc(20, 18, 2, 0, 7); ctx.fill();
    P.overpaint(ctx, w, h, { len: [3, 8], wid: [1, 2.5], a: [.3, .6], ang: () => 0, area: 30, jit: 14 }, r);
  };

  P.beachTall = cv => { const s = sz(cv); return P.sky(cv, {
    seed: 51, w: s.w, h: s.h, k: .5, stops: [[0, '#5E97D2'], [.12, '#7FB2DE'], [.2, '#D5E6EE'], [1, '#D5E6EE']], clouds: 7, cy0: .02, cy1: .15, cs0: .025, cs1: .055,
    after: (ctx, w, h, r) => {
      const U = h / 2.2, hy = U * .46, K = P._k || 1;
      P.sea(ctx, w, hy, U * .9, { far: '#3E9AA2', near: '#4FA9A6', mid: '#9FD8CE', foam: '#F3EEE4' }, r);
      ctx.fillStyle = P.linear(ctx, [[0, '#5FB8B0'], [.55, '#8FCFC0'], [.8, '#CFE3CF'], [1, '#EAD9B8']], 0, U * .9, 0, U * 1.3); ctx.fillRect(0, U * .9, w, U * .4);
      const y0 = U * 1.3;
      ctx.fillStyle = P.linear(ctx, [[0, '#EAD9B8'], [.5, '#EFE0C2'], [.72, '#E3CFA8'], [.8, '#C9AE84'], [.86, '#B99E77'], [.9, '#9FD3C4'], [1, '#4FA9A6']], 0, y0, 0, h); ctx.fillRect(0, y0, w, h - y0);
      for (let i = 0; i < w * (h - y0) / 700; i++) { const x = r() * w, y = lerp(y0, h * .95, r()); P.stroke(ctx, x, y, (r() - .5) * .25, (10 + r() * 30) * K, (1.5 + r() * 3) * K, hex(r() < .5 ? '#F6EBD3' : '#CDB58C'), .3 + r() * .35, .35); }
      ctx.strokeStyle = 'rgba(246,243,236,.9)'; ctx.lineWidth = 5 * K; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = i / 60 * w, y = y0 + (h - y0) * .885 + Math.sin(i * .7) * 6 * K + Math.sin(i * .23) * 10 * K; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const t = i / 11, x = lerp(w * .72, w * .5, t), y = lerp(U * 1.02, U * .26, t), sw = lerp(w * .13, w * .07, t), sh = lerp(U * .055, U * .03, t);
        blob(ctx, x + sw * .6, Math.max(y + sh, U * .9) + sh * .4, sw * .7, sh * .3, 'rgba(30,70,80,.28)', 6 * K);
        ctx.fillStyle = P.linear(ctx, [[0, '#FBF6EA'], [1, '#DCD0BB']], x, y, x, y + sh * .35); ctx.fillRect(x - sw / 2, y, sw, sh * .35);
        ctx.fillStyle = P.linear(ctx, [[0, '#E9DECB'], [1, '#AE9E84']], x, y + sh * .35, x, y + sh); ctx.fillRect(x - sw / 2, y + sh * .35, sw, sh * .65);
        ctx.fillStyle = 'rgba(60,70,80,.22)'; ctx.fillRect(x + sw * .38, y, sw * .12, sh);
      }
    } }); };

  P.foam = cv => {
    const k = .6, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(55);
    ctx.fillStyle = P.linear(ctx, [[0, 'rgba(159,211,196,0)'], [.35, 'rgba(159,211,196,.55)'], [1, 'rgba(79,169,166,.9)']], 0, 0, 0, h); ctx.fillRect(0, h * .3, w, h * .7);
    for (let i = 0; i < w * h / 60; i++) { const x = r() * w, y = h * (.25 + Math.pow(r(), 2) * .5) + Math.sin(x * .02) * h * .05; P.stroke(ctx, x, y, (r() - .5) * .3, (4 + r() * 18) * k, (1.5 + r() * 4) * k, [246, 243, 236], .4 + r() * .5, .3); }
  };

  P.dunes = cv => {
    const k = .5, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(61); P._k = k;
    [[.04, '#E8C48E', '#B98050', 1.3, 0], [.2, '#DDAA68', '#A86A3A', 1.8, 2], [.38, '#EBC894', '#B67A48', 1.1, 4]].forEach(([y0, c1, c2, f, ph]) => {
      const pts = []; for (let i = 0; i <= 50; i++) { const x = i / 50 * w; pts.push([x, h * y0 + Math.sin(i / 50 * Math.PI * f + ph) * h * .05 + Math.sin(i * .4 + ph) * h * .008]); }
      ctx.beginPath(); ctx.moveTo(0, h); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(w, h); ctx.closePath();
      ctx.fillStyle = P.linear(ctx, [[0, c1], [.25, c2], [1, '#8E5A34']], 0, h * y0, 0, h); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(75,58,82,.28)'; ctx.beginPath(); ctx.moveTo(0, h); pts.forEach(p => ctx.lineTo(p[0] + w * .05, p[1] + h * .06)); ctx.lineTo(w, h); ctx.closePath(); ctx.fill(); ctx.restore();
      for (let i = 0; i < 600; i++) { const p = pts[(r() * 50) | 0]; const y = p[1] + r() * h * .3; P.stroke(ctx, p[0] + (r() - .5) * 40 * k, y, (r() - .5) * .12, (16 + r() * 40) * k, (1.5 + r() * 3) * k, hex(r() < .5 ? '#F4D8A8' : '#9E6A40'), .3 + r() * .35, .4); }
      ctx.strokeStyle = 'rgba(255,240,210,.7)'; ctx.lineWidth = 3 * k; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    });
    P.overpaint(ctx, w, h, { len: [14, 40], wid: [5, 12], a: [.3, .6], ang: () => (r() - .5) * .2, area: 360, jit: 9 }, r);
  };

  P.desert = (cv, o) => { const s = sz(cv); return P.sky(cv, {
    seed: 71, w: s.w, h: s.h, big: .45, stops: [[0, '#B0604A'], [.28, '#D9895A'], [.54, '#E8A866'], [.56, '#EDBB80'], [1, '#EDBB80']], clouds: 4, cy0: .06, cy1: .26, cs0: .04, cs1: .08, light: '#F6D7AE', mid: '#EDBB8A', shadow: '#B9786A', base: '#CE8C6C',
    after: (ctx, w, h, r) => {
      const hy = h * o.hy, vx = w * .5, K = P._k || 1, gap = w * (o.gap || .13);
      ctx.fillStyle = P.linear(ctx, [[0, '#D8A868'], [.35, '#C98E4E'], [1, '#A8703A']], 0, hy, 0, h); ctx.fillRect(0, hy, w, h - hy);
      ctx.fillStyle = '#8E4A36'; const tx = vx - w * .06; ctx.fillRect(tx, hy - h * .24, w * .018, h * .24); ctx.fillRect(tx - w * .004, hy - h * .245, w * .026, h * .012);
      ctx.fillStyle = '#A85A3C'; ctx.fillRect(vx + w * .045, hy - h * .07, w * .05, h * .07);
      for (let side = -1; side <= 1; side += 2) {
        const X = u => side < 0 ? lerp(-w * .02, vx - gap, u) : lerp(w * 1.02, vx + gap, u), T = u => lerp(-h * .02, hy - h * .11, u), B = u => lerp(h * 1.04, hy + h * .012, u);
        const lit = side < 0;
        ctx.fillStyle = P.linear(ctx, [[0, lit ? '#D06C3C' : '#8E4632'], [1, lit ? '#E39A66' : '#A65A40']], X(0), 0, X(1), 0);
        ctx.beginPath(); ctx.moveTo(X(0), T(0)); ctx.lineTo(X(1), T(1)); ctx.lineTo(X(1), B(1)); ctx.lineTo(X(0), B(0)); ctx.closePath(); ctx.fill();
        for (let j = 0; j < 14; j++) {
          const u0 = 1 - 1 / (1 + j * .75), u1 = 1 - 1 / (1 + (j + .55) * .75); if (u1 > .985) break;
          const xa = X(u0), xb = X(u1), ba = B(u0), bb = B(u1), ta = lerp(T(u0), ba, .36), tb = lerp(T(u1), bb, .36), mxp = (xa + xb) / 2, my = (ta + tb) / 2 - Math.abs(ta - ba) * .12;
          ctx.fillStyle = lit ? '#4B3A52' : '#3A2C42'; ctx.beginPath(); ctx.moveTo(xa, ba); ctx.lineTo(xa, ta); ctx.quadraticCurveTo(mxp, my - Math.abs(xb - xa) * .5, xb, tb); ctx.lineTo(xb, bb); ctx.closePath(); ctx.fill();
          if (lit) { ctx.fillStyle = 'rgba(75,58,82,.45)'; ctx.beginPath(); ctx.moveTo(xb, bb); ctx.lineTo(xa, ba); ctx.lineTo(xa + (vx - xa) * .9 + w * .15, ba + (h - ba) * .05); ctx.lineTo(xb + (vx - xb) * .9 + w * .12, bb + (h - bb) * .05); ctx.closePath(); ctx.fill(); }
        }
      }
      for (let i = 0; i < w * (h - hy) / 500; i++) { const y = lerp(hy, h, Math.pow(r(), .7)), t = (y - hy) / (h - hy); P.stroke(ctx, r() * w, y, (r() - .5) * .1, (6 + t * 40) * K, (1 + t * 3) * K, hex(r() < .5 ? '#E5B878' : '#A8703A'), .25 + r() * .3, .2); }
    } }); };

  P.room = (cv, o) => {
    const k = .6, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(81); P._k = k;
    const [bx0, by0, bx1, by1] = [o.b[0] * w, o.b[1] * h, o.b[2] * w, o.b[3] * h], [wx0, wy0, wx1, wy1] = [o.win[0] * w, o.win[1] * h, o.win[2] * w, o.win[3] * h];
    const poly = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); };
    poly([[0, 0], [w, 0], [bx1, by0], [bx0, by0]], P.linear(ctx, [[0, '#CFC1AA'], [1, '#DDD1BD']], 0, 0, 0, by0));
    poly([[0, 0], [bx0, by0], [bx0, by1], [0, h]], P.linear(ctx, [[0, '#CDBFA8'], [1, '#DED3C0']], 0, 0, bx0, 0));
    poly([[w, 0], [bx1, by0], [bx1, by1], [w, h]], P.linear(ctx, [[0, '#BBAA92'], [1, '#D2C5AF']], w, 0, bx1, 0));
    poly([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], P.linear(ctx, [[0, '#E6DCCB'], [.6, '#E9DCCB'], [1, '#D8C4B4']], 0, by0, 0, by1));
    poly([[0, h], [bx0, by1], [bx1, by1], [w, h]], P.linear(ctx, [[0, '#4E3424'], [1, '#6E4B34']], 0, by1, 0, h));
    const vx = (bx0 + bx1) / 2, vy = (by0 + by1) / 2;
    ctx.strokeStyle = 'rgba(40,24,16,.55)'; ctx.lineWidth = 2 * k; for (let i = 0; i <= 16; i++) { const x = lerp(bx0, bx1, i / 16); ctx.beginPath(); ctx.moveTo(x, by1); ctx.lineTo(vx + (x - vx) * ((h - vy) / (by1 - vy)), h); ctx.stroke(); }
    ctx.fillStyle = '#1B2440'; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const fx = (x, y) => [vx + (x - vx) * ((h - vy) / (y - vy)), h];
    const a = fx(wx0 - w * .02, by1 + 1), b = fx(wx1 + w * .03, by1 + 1);
    poly([[wx0, by1], [wx1, by1], [b[0] - w * .1, h * .92], [a[0] - w * .14, h * .92]], 'rgba(201,140,131,.38)');
    poly([[wx0, wy1], [wx1, wy1], [wx1 - (wx1 - wx0) * .05, by1], [wx0 - (wx1 - wx0) * .1, by1]], 'rgba(201,140,131,.18)');
    ctx.restore();
    blob(ctx, bx0, (by0 + by1) / 2, w * .02, (by1 - by0) * .6, 'rgba(90,70,50,.18)', 20 * k);
    blob(ctx, bx1, (by0 + by1) / 2, w * .02, (by1 - by0) * .6, 'rgba(90,70,50,.22)', 20 * k);
    ctx.fillStyle = 'rgba(40,24,16,.35)'; ctx.fillRect(bx0, by1 - 8 * k, bx1 - bx0, 8 * k);
    P.overpaint(ctx, w, h, { len: [14, 42], wid: [5, 13], a: [.3, .6], ang: (x, y) => y > by1 ? Math.atan2(y - vy, x - vx) : (r() - .5) * .3 + Math.PI / 2, area: 330, jit: 7 }, r);
    P.overpaint(ctx, w, h, { len: [5, 16], wid: [2, 5], a: [.25, .5], ang: () => r() * 3, area: 900, jit: 11 }, r);
  };

  P.nightSea = (cv, o) => { const s = sz(cv); return P.sky(cv, {
    seed: 91, w: s.w, h: s.h, stops: [[0, '#0A1022'], [.3, '#141B33'], [o.hy - .01, '#26314F'], [o.hy, '#141B33'], [1, '#090E1E']], clouds: 4, cy0: o.hy - .14, cy1: o.hy - .04, cs0: .03, cs1: .06, light: '#3A4666', mid: '#2A3554', shadow: '#1A2440', base: '#141C33',
    after: (ctx, w, h, r) => {
      const hy = h * o.hy, mx = w * o.mx, K = P._k || 1;
      for (let i = 0; i < w * (h - hy) / 90; i++) { const y = lerp(hy, h, Math.pow(r(), .9)), t = (y - hy) / (h - hy), x = r() * w; P.stroke(ctx, x, y, (r() - .5) * .06, (4 + t * 30) * K, (1 + t * 3) * K, hex(r() < .5 ? '#1E2946' : '#0E1428'), .5, .2); }
      for (let i = 0; i < 1600; i++) { const y = lerp(hy, h, Math.pow(r(), 1.2)), t = (y - hy) / (h - hy), g = (r() + r() + r() - 1.5) * (w * .03 + t * w * .12); P.stroke(ctx, mx + g, y, (r() - .5) * .05, (3 + t * 26 * r()) * K, (1 + t * 3) * K, hex(r() < .6 ? '#AFB8C9' : '#F1E6C8'), .35 + r() * .55 * (1 - Math.abs(g) / (w * .18)), .15); }
    },
    post: (ctx, w, h, r) => {
      const K = P._k || 1, hy = h * o.hy, n = Math.round(w * hy / (7000 * K * K));
      for (let i = 0; i < n; i++) { const x = r() * w, y = r() * hy * .92, q = (r() < .12 ? 2.3 : 1) * K; P.stroke(ctx, x + 1.5, y + 1.5, r() * 3, (3 + r() * 6) * q, (2.5 + r() * 3) * q, [5, 8, 20], .35, .2); P.stroke(ctx, x, y, r() * 3, (3 + r() * 6) * q, (2.5 + r() * 3) * q, [246, 242, 232], .95, .2); }
    } }); };

  P.reach2 = cv => {
    const { ctx, w, h } = P.setup(cv, 340, 320); const r = P.rng(33);
    const g = ctx.createLinearGradient(w, 0, w * .4, h * .5); g.addColorStop(0, '#8A5842'); g.addColorStop(1, '#E4B999');
    ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineWidth = 74; ctx.beginPath(); ctx.moveTo(w + 40, -30); ctx.quadraticCurveTo(w * .7, h * .24, w * .45, h * .42); ctx.stroke();
    ctx.fillStyle = '#E2B494'; ctx.beginPath(); ctx.ellipse(w * .4, h * .47, 58, 44, -.6, 0, 7); ctx.fill();
    [[.22, .54, -.9], [.26, .62, -1.1], [.33, .67, -1.3]].forEach(([fx, fy, a]) => { ctx.save(); ctx.translate(w * fx + 30, h * fy - 10); ctx.rotate(a); const gg = ctx.createLinearGradient(0, -14, 0, 14); gg.addColorStop(0, '#B8836A'); gg.addColorStop(.5, '#EFCBAC'); gg.addColorStop(1, '#B07A60'); ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(-64, -14, 70, 28, 14); ctx.fill(); ctx.fillStyle = '#F0D6C8'; ctx.beginPath(); ctx.roundRect(-62, -10, 18, 20, 8); ctx.fill(); ctx.restore(); });
    P.overpaint(ctx, w, h, { len: [8, 22], wid: [3, 8], a: [.35, .65], ang: () => -0.8, area: 160, jit: 12 }, r);
  };
  P.morning = cv => { const s = sz(cv); return P.sky(cv, { seed: 9, w: s.w, h: s.h, stops: [[0, '#4F84C8'], [.6, '#9DBEE4'], [1, '#EAD8C6']], clouds: 7, cy0: .15, cy1: .85, cs0: .04, cs1: .08 }); };

  P.dove = (cv, up) => {
    const { ctx, w, h } = P.setup(cv, 120, 80); const r = P.rng(up ? 71 : 72);
    const wing = up ? [[58, 40], [44, 2], [66, 0], [76, 38]] : [[58, 46], [40, 78], [64, 74], [76, 46]];
    ctx.fillStyle = P.linear(ctx, [[0, '#FBF8F2'], [1, '#CFC5B6']], 0, up ? 0 : 80, 0, 44);
    ctx.beginPath(); ctx.moveTo(wing[0][0], wing[0][1]); ctx.bezierCurveTo(wing[1][0], wing[1][1], wing[2][0], wing[2][1], wing[3][0], wing[3][1]); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.linear(ctx, [[0, '#FBF8F2'], [1, '#B9AE9E']], 0, 32, 0, 56);
    ctx.beginPath(); ctx.ellipse(60, 44, 26, 10, -.08, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(36, 44); ctx.lineTo(12, 36); ctx.lineTo(16, 54); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(86, 38, 8.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#C9A27A'; ctx.beginPath(); ctx.moveTo(93, 37); ctx.lineTo(101, 40); ctx.lineTo(93, 41); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1B1D24'; ctx.beginPath(); ctx.arc(88, 36, 1.4, 0, 7); ctx.fill();
    P.overpaint(ctx, w, h, { len: [3, 9], wid: [1.2, 3], a: [.3, .6], ang: () => .1, area: 26, jit: 12 }, r);
  };
})();
