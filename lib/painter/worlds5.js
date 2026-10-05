/* v5 plates. Extends window.Painter (load after painter.js + worlds.js) */
(function init() {
  const P = window.Painter; if (!P || !P.desert) { setTimeout(init, 20); return; } if (P.beachDay) return;
  const hex = P.hex, rgba = P.rgba, lerp = (a, b, t) => a + (b - a) * t;
  const sz = cv => ({ w: cv.offsetWidth || 2, h: cv.offsetHeight || 2 });
  const blob = (ctx, x, y, rx, ry, c, blur, rot = 0) => { ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); ctx.fill(); ctx.restore(); };
  const poly = (ctx, pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); };
  const lg = (ctx, stops, x0, y0, x1, y1) => P.linear(ctx, stops, x0, y0, x1, y1);
  const brush = (ctx, w, h, r, o) => P.overpaint(ctx, w, h, Object.assign({ len: [4, 12], wid: [1.5, 4], a: [.25, .5], ang: () => 0, area: 60, jit: 12 }, o), r);
  const setupK = (cv, k) => { const s = sz(cv); return P.setup(cv, s.w * k, s.h * k); };

  /* ---------- world 2: clean board at dawn ---------- */
  P.shore5 = (cv, o) => { const s = sz(cv); return P.sky(cv, {
    seed: 21, w: s.w, h: s.h, k: .6, stops: [[0, '#86A9D6'], [.24, '#BFCFE3'], [.42, '#F0D5C0'], [.5, '#F6C9A2'], [1, '#F2C7A5']], clouds: 8, cy0: .05, cy1: .38, cs0: .03, cs1: .075,
    after: (ctx, w, h) => { const hy = h * o.hy, sx = w * .14; const g = ctx.createRadialGradient(sx, hy - h * .02, 2, sx, hy - h * .02, w * .32); g.addColorStop(0, 'rgba(255,238,200,.95)'); g.addColorStop(.12, 'rgba(255,214,168,.55)'); g.addColorStop(1, 'rgba(255,214,168,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); },
    post: (ctx, w, h, r) => {
      const hy = h * o.hy, K = P._k || 1, vx = w * .5, f = h * .62, z0 = .7, rows = 14, tile = .5;
      P.sea(ctx, w, hy, h, { far: '#6E96A6', near: '#4F8A96', mid: '#9FC2C4', foam: '#F6E6D2' }, r);
      const sx = w * .14; ctx.save(); ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 90; i++) { const y = hy + Math.pow(r(), 1.6) * h * .06, t = (y - hy) / (h * .06); P.stroke(ctx, sx + (r() - .5) * w * (.02 + t * .08), y, 0, (3 + t * 14) * K, (1 + t * 2) * K, [255, 226, 180], .5 + r() * .4, 0); } ctx.restore();
      ctx.fillStyle = 'rgba(255,240,220,.6)'; ctx.fillRect(0, hy - K, w, 2 * K);
      const sunC = ctx.createRadialGradient(sx, hy - h * .018, 0, sx, hy - h * .018, h * .03); sunC.addColorStop(0, '#FFF6E2'); sunC.addColorStop(.7, '#FFE7C0'); sunC.addColorStop(1, 'rgba(255,231,192,0)'); ctx.fillStyle = sunC; ctx.beginPath(); ctx.arc(sx, hy - h * .018, h * .03, 0, 7); ctx.fill();
      P.board(ctx, w, h, { hy, vx, f, z0, rows, tile, cols: 44, haze: '#F2D4BC' });
      const img = ctx.getImageData(0, 0, w, h).data, px = (x, y) => { const i = ((y | 0) * w + (x | 0)) * 4; return [img[i], img[i + 1], img[i + 2]]; };
      const y0 = hy + f / (z0 + rows * tile) + 2, N = w * (h - y0) / 55;
      for (let i = 0; i < N; i++) {
        const y = lerp(y0, h - 1, Math.pow(r(), .75)), x = r() * w, d = (y - hy) / (h - hy);
        const radial = r() < .55, ang = radial ? Math.atan2(y - hy, x - vx) : 0, len = (2 + r() * 22) * d * 2.2 * K + K, wid = (.8 + r() * 3.5) * d * 2 * K + .5;
        const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len; if (x2 < 0 || x2 >= w || y2 >= h) continue;
        const c1 = px(x, y), c2 = px(x2, y2); if (Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]) > 40) continue;
        const j = (r() - .5) * 14; P.stroke(ctx, x, y, ang, len, wid, [c1[0] + j, c1[1] + j, c1[2] + j * .8], .35 + r() * .35, 0);
      }
      ctx.fillStyle = lg(ctx, [[0, 'rgba(242,212,188,.55)'], [1, 'rgba(242,212,188,0)']], 0, hy, 0, y0 + h * .05); ctx.fillRect(0, hy, w, y0 + h * .05 - hy);
    } }); };

  const starfish = (ctx, x, y, R, rot, r) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, .55);
    ctx.fillStyle = 'rgba(70,30,20,.35)'; ctx.filter = `blur(${R * .12}px)`; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, q = i % 2 ? R * .38 : R; ctx.lineTo(Math.cos(a) * q + R * .2, Math.sin(a) * q + R * .12); } ctx.fill(); ctx.filter = 'none';
    const g = ctx.createRadialGradient(-R * .2, -R * .2, 0, 0, 0, R); g.addColorStop(0, '#F0A060'); g.addColorStop(.6, '#D0643A'); g.addColorStop(1, '#9A3E22'); ctx.fillStyle = g;
    ctx.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2 + (r() - .5) * .05, q = i % 2 ? R * .38 : R * (.9 + r() * .15); const pa = (i - .5) / 10 * Math.PI * 2; i ? ctx.quadraticCurveTo(Math.cos(pa) * q * .75, Math.sin(pa) * q * .75, Math.cos(a) * q, Math.sin(a) * q) : ctx.moveTo(Math.cos(a) * q, Math.sin(a) * q); } ctx.fill();
    ctx.fillStyle = 'rgba(255,220,180,.8)'; for (let i = 0; i < 40; i++) { const a = r() * 7, d = r() * R * .8; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, R * .035, 0, 7); ctx.fill(); }
    ctx.restore();
  };
  const shell = (ctx, x, y, q, rot, c1, c2) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    blob(ctx, q * .45, q * .18, q * 1.05, q * .32, 'rgba(70,40,25,.35)', q * .25);
    ctx.fillStyle = lg(ctx, [[0, c1], [1, c2]], 0, -q, 0, q * .3);
    ctx.beginPath(); ctx.moveTo(-q * .22, q * .3); for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; const rr = q * (1 + (i % 2 ? -.06 : .04)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .95 + q * .05); } ctx.lineTo(q * .22, q * .3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(150,96,70,.55)'; ctx.lineWidth = Math.max(.8, q * .05); for (let j = -5; j <= 5; j++) { const a = -Math.PI / 2 + j * .26; ctx.beginPath(); ctx.moveTo(0, q * .25); ctx.lineTo(Math.cos(a) * q * .95, Math.sin(a) * q * .9 + q * .05); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,250,.55)'; ctx.beginPath(); ctx.ellipse(-q * .3, -q * .45, q * .18, q * .08, -.5, 0, 7); ctx.fill();
    ctx.fillStyle = c2; ctx.fillRect(-q * .24, q * .2, q * .48, q * .16);
    ctx.restore();
  };
  const stone = (ctx, x, y, q, r) => {
    blob(ctx, x + q * .7, y + q * .3, q * 1.3, q * .3, 'rgba(70,40,25,.4)', q * .25);
    const c = ['#9E958A', '#C9BCA8', '#7E7268', '#B8A58E', '#D8CCBA'][(r() * 5) | 0];
    ctx.fillStyle = lg(ctx, [[0, '#F6F0E4'], [.3, c], [1, '#3E3630']], x - q, y - q, x + q * .6, y + q * .8);
    ctx.beginPath(); ctx.ellipse(x, y, q, q * (.5 + r() * .2), r() * .6 - .3, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,252,244,.8)'; ctx.beginPath(); ctx.ellipse(x - q * .4, y - q * .22, q * .22, q * .08, -.3, 0, 7); ctx.fill();
  };
  P.shells5 = cv => {
    const k = .7; const { ctx, w, h } = setupK(cv, k); const r = P.rng(24);
    const items = []; for (let i = 0; i < 26; i++) items.push({ x: r() * w, y: h * (.62 + r() * .36), t: r() });
    items.push({ x: w * .22, y: h * .86, t: 2 }, { x: w * .78, y: h * .7, t: 2 });
    items.sort((a, b) => a.y - b.y).forEach(it => {
      const q = (5 + r() * 12) * k * (it.y / h * 2.2 + .3);
      if (it.t === 2) starfish(ctx, it.x, it.y, q * 2.4, r() * 3, r);
      else if (it.t < .42) shell(ctx, it.x, it.y, q, (r() - .5) * 1.2, ['#FBF1E4', '#F7DCCB', '#F2E6D2'][(r() * 3) | 0], ['#D8B79A', '#C98E7A', '#B99E77'][(r() * 3) | 0]);
      else stone(ctx, it.x, it.y, q * .8, r);
    });
    brush(ctx, w, h, r, { ang: () => 0, area: 120, a: [.2, .4] });
  };

  /* ---------- world 3: the beach ---------- */
  P.beachDay = (cv, o) => { const s = sz(cv); return P.sky(cv, {
    seed: 33, w: s.w, h: s.h, k: .75, stops: [[0, '#5B98D6'], [o.hy * .55, '#86BCE4'], [o.hy - .01, '#DCEEF0'], [o.hy, '#DCEEF0'], [1, '#EFE2C6']], clouds: 6, cy0: .05, cy1: o.hy - .14, cs0: .03, cs1: .06,
    after: (ctx, w, h, r) => {
      const hy = h * o.hy, K = P._k || 1;
      ctx.save(); const cy = x => { const u = Math.abs(x / w - .5) * 2; return hy - h * .02 - h * .9 * Math.pow(u, 2.6); };
      ctx.beginPath(); ctx.moveTo(0, hy); for (let i = 0; i <= 80; i++) ctx.lineTo(i / 80 * w, cy(i / 80 * w)); ctx.lineTo(w, hy); ctx.closePath();
      ctx.globalAlpha = .2; ctx.fillStyle = lg(ctx, [[0, '#8E1E26'], [1, '#C8646A']], 0, 0, 0, hy); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(244,226,210,.35)'; ctx.lineWidth = 3 * K; ctx.beginPath(); for (let i = 0; i <= 80; i++) { const x = i / 80 * w; i ? ctx.lineTo(x, cy(x)) : ctx.moveTo(x, cy(x)); } ctx.stroke();
      ctx.fillStyle = lg(ctx, [[0, 'rgba(226,240,240,0)'], [1, 'rgba(226,240,240,.75)']], 0, hy - h * .2, 0, hy); ctx.fillRect(0, hy - h * .2, w, h * .2); ctx.restore();
    },
    post: (ctx, w, h, r) => {
      const hy = h * o.hy, sh = h * o.shore, K = P._k || 1;
      P.sea(ctx, w, hy, sh, { far: '#3B9CB4', near: '#52C2BE', mid: '#A6E0D6', foam: '#F7F5EE' }, r);
      ctx.fillStyle = 'rgba(248,250,246,.7)'; ctx.fillRect(0, hy - K, w, 1.6 * K);
      for (let i = 0; i < 5; i++) { const x = w * (.08 + i * .2 + r() * .06), y = hy - K, q = (5 + r() * 5) * K; ctx.fillStyle = '#FBFAF4'; ctx.beginPath(); ctx.moveTo(x, y - q * 1.6); ctx.lineTo(x + q * .9, y - q * .1); ctx.lineTo(x, y - q * .1); ctx.fill(); ctx.fillStyle = '#E9E4D6'; ctx.beginPath(); ctx.moveTo(x - q * .1, y - q * 1.3); ctx.lineTo(x - q * .7, y - q * .1); ctx.lineTo(x - q * .1, y - q * .1); ctx.fill(); ctx.fillStyle = '#4A4A58'; ctx.fillRect(x - q * .7, y - q * .1, q * 1.7, q * .25); }
      for (let i = 0; i < 4; i++) { const y = lerp(hy + (sh - hy) * .35, sh, i / 3.3); ctx.strokeStyle = `rgba(250,250,245,${.35 + i * .12})`; ctx.lineWidth = (1 + i) * K; ctx.beginPath(); for (let j = 0; j <= 50; j++) { const x = j / 50 * w, yy = y + Math.sin(j * .8 + i * 2) * 2 * K * (1 + i); j ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
      ctx.fillStyle = lg(ctx, [[0, '#B9A07A'], [.35, '#CDB690'], [1, '#E8D8B8']], 0, sh, 0, sh + h * .07); ctx.fillRect(0, sh, w, h * .07);
      ctx.fillStyle = 'rgba(240,248,245,.5)'; for (let i = 0; i < 40; i++) { const x = r() * w, y = sh + r() * h * .05; ctx.beginPath(); ctx.ellipse(x, y, (8 + r() * 30) * K, 1.4 * K, 0, 0, 7); ctx.fill(); }
      const y0 = sh + h * .07; ctx.fillStyle = lg(ctx, [[0, '#E8D8B8'], [.4, '#F1E4C8'], [1, '#F6ECD6']], 0, y0, 0, h); ctx.fillRect(0, y0, w, h - y0);
      for (let i = 0; i < w * (h - sh) / 220; i++) { const y = lerp(sh, h, Math.pow(r(), .8)), d = (y - hy) / (h - hy), x = r() * w; P.stroke(ctx, x, y, (r() - .5) * .12, (5 + r() * 26) * d * 1.8 * K, (1 + r() * 3) * d * 1.8 * K, hex(r() < .5 ? '#FBF3E0' : '#D6C09A'), .3 + r() * .35, .3); }
      for (let i = 0; i < 26; i++) { const t = i / 25, x = w * (.62 - t * .18 + Math.sin(t * 5) * .03) + (i % 2 ? 1 : -1) * w * .006 * (1 - t * .7), y = lerp(h * .98, sh + h * .08, Math.pow(t, .7)), q = lerp(10, 2.2, Math.pow(t, .5)) * K; blob(ctx, x, y, q * .55, q * .22, 'rgba(160,128,90,.42)', q * .12); blob(ctx, x - q * .1, y - q * .06, q * .4, q * .14, 'rgba(252,246,232,.5)', q * .08); }
      for (let i = 0; i < 22; i++) { const y = lerp(y0, h, Math.pow(r(), .8)), q = (2 + (y - hy) / (h - hy) * 9) * K; shell(ctx, r() * w, y, q, (r() - .5), '#FBF1E4', '#D8B79A'); }
      brush(ctx, w, h, r, { mask: (x, y) => y > sh, area: 380, a: [.2, .4], ang: () => (r() - .5) * .2 });
    } }); };

  P.wash = cv => {
    const k = .7; const { ctx, w, h } = setupK(cv, k); const r = P.rng(57);
    const edge = x => h * .78 + Math.sin(x / w * 18) * h * .08 + Math.sin(x / w * 41 + 1) * h * .04;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); for (let i = 60; i >= 0; i--) ctx.lineTo(i / 60 * w, edge(i / 60 * w)); ctx.closePath();
    ctx.fillStyle = lg(ctx, [[0, 'rgba(82,194,190,.0)'], [.3, 'rgba(120,210,200,.55)'], [1, 'rgba(210,240,232,.7)']], 0, 0, 0, h); ctx.fill();
    for (let i = 0; i < w / 2; i++) { const x = r() * w, y = edge(x) - r() * h * .25; P.stroke(ctx, x, y, (r() - .5) * .4, (3 + r() * 14) * k, (1 + r() * 3) * k, [250, 250, 246], .4 + r() * .5, .4); }
    ctx.strokeStyle = 'rgba(255,255,252,.9)'; ctx.lineWidth = 2.4 * k; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = i / 60 * w; i ? ctx.lineTo(x, edge(x)) : ctx.moveTo(x, edge(x)); } ctx.stroke();
  };

  const stripes = (ctx, path, x0, x1, n, cols, ang = 0) => { ctx.save(); ctx.clip(path); const sw = (x1 - x0) / n; for (let i = 0; i < n + 2; i++) { ctx.fillStyle = cols[i % cols.length]; ctx.save(); ctx.translate(x0 + i * sw, 0); ctx.rotate(ang); ctx.fillRect(0, -2000, sw + .6, 4000); ctx.restore(); } ctx.restore(); };
  const wood = (ctx, x1, y1, x2, y2, wd, c = '#9A6A42') => { ctx.lineCap = 'round'; ctx.strokeStyle = c; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.strokeStyle = 'rgba(255,230,190,.35)'; ctx.lineWidth = wd * .3; ctx.beginPath(); ctx.moveTo(x1 - wd * .2, y1); ctx.lineTo(x2 - wd * .2, y2); ctx.stroke(); };
  const umbrella = (ctx, cx, top, rw, rh, cols, r) => {
    const n = 8, ex = i => cx - rw + 2 * rw * i / n, ey = i => top + rh + Math.sin(i / n * Math.PI) * rh * .12;
    for (let i = 0; i < n; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(cx, top); ctx.quadraticCurveTo(lerp(cx, ex(i), .55), top + rh * .08, ex(i), ey(i)); ctx.quadraticCurveTo((ex(i) + ex(i + 1)) / 2, (ey(i) + ey(i + 1)) / 2 + rh * .1, ex(i + 1), ey(i + 1)); ctx.quadraticCurveTo(lerp(cx, ex(i + 1), .55), top + rh * .08, cx, top); ctx.fill(); }
    const sh = ctx.createLinearGradient(cx - rw, 0, cx + rw, 0); sh.addColorStop(0, 'rgba(255,250,240,.22)'); sh.addColorStop(.45, 'rgba(255,250,240,0)'); sh.addColorStop(1, 'rgba(40,30,40,.3)'); ctx.fillStyle = sh;
    ctx.beginPath(); ctx.moveTo(cx, top); ctx.quadraticCurveTo(cx - rw * .6, top + rh * .05, ex(0), ey(0)); for (let i = 1; i <= n; i++) ctx.quadraticCurveTo((ex(i - 1) + ex(i)) / 2, (ey(i - 1) + ey(i)) / 2 + rh * .1, ex(i), ey(i)); ctx.quadraticCurveTo(cx + rw * .6, top + rh * .05, cx, top); ctx.fill();
    ctx.fillStyle = '#6E4B34'; ctx.beginPath(); ctx.arc(cx, top, rw * .04, 0, 7); ctx.fill();
  };
  P.prop = (cv, kind) => {
    const { ctx, w, h } = P.setup(cv, cv.offsetWidth || 300, cv.offsetHeight || 300); const r = P.rng(kind.length * 31 + kind.charCodeAt(0));
    const gy = h - 6, gshadow = (x, y, rx, ry, a = .3) => blob(ctx, x, y, rx, ry, `rgba(60,70,90,${a})`, 5);
    if (kind.startsWith('chair')) {
      const cols = kind === 'chairT' ? ['#2F8A8E', '#F2E9D8'] : ['#B8403A', '#F2E9D8'], wrong = kind === 'chairW';
      if (wrong) poly(ctx, [[w * .22, gy], [w * .8, gy], [w * .5, gy - h * .1], [-w * .1, gy - h * .1]], 'rgba(60,70,90,.26)');
      else poly(ctx, [[w * .2, gy], [w * .78, gy], [w * 1.0, gy - h * .08], [w * .42, gy - h * .08]], 'rgba(60,70,90,.26)');
      ctx.save(); ctx.filter = 'blur(3px)'; ctx.restore();
      wood(ctx, w * .24, h * .1, w * .16, gy, 9); wood(ctx, w * .76, h * .1, w * .84, gy, 9);
      wood(ctx, w * .3, h * .55, w * .26, gy, 8, '#8A5A36'); wood(ctx, w * .7, h * .55, w * .74, gy, 8, '#8A5A36');
      const sl = new Path2D(); sl.moveTo(w * .25, h * .12); sl.lineTo(w * .75, h * .12); sl.quadraticCurveTo(w * .79, h * .45, w * .8, h * .64); sl.quadraticCurveTo(w * .5, h * .72, w * .2, h * .64); sl.quadraticCurveTo(w * .21, h * .45, w * .25, h * .12); sl.closePath();
      stripes(ctx, sl, w * .2, w * .8, 7, cols);
      ctx.save(); ctx.clip(sl); ctx.fillStyle = lg(ctx, [[0, 'rgba(255,250,240,.15)'], [.6, 'rgba(0,0,0,0)'], [1, 'rgba(40,30,30,.3)']], 0, h * .12, 0, h * .68); ctx.fillRect(0, 0, w, h); ctx.restore();
      wood(ctx, w * .22, h * .11, w * .78, h * .11, 10); wood(ctx, w * .16, h * .64, w * .84, h * .64, 8, '#8A5A36');
    } else if (kind.startsWith('umb')) {
      const tilt = kind === 'umbT' ? -.32 : kind === 'umbF' ? .12 : 0, cols = kind === 'umbT' ? ['#2F8A8E', '#F4ECDC'] : kind === 'umbF' ? ['#D9A441', '#F4ECDC'] : ['#B8403A', '#F4ECDC'];
      gshadow(w * .66, gy - 4, w * .3, h * .025);
      ctx.save(); ctx.translate(w / 2, gy); ctx.rotate(tilt); ctx.translate(-w / 2, -gy);
      wood(ctx, w / 2, h * .12, w / 2, gy, 7, '#7A5236');
      umbrella(ctx, w / 2, h * .06, w * .46, h * .2, cols, r); ctx.restore();
    } else if (kind === 'cloudumb') {
      gshadow(w * .5, gy - 4, w * .26, h * .02, .18);
      wood(ctx, w / 2, h * .12, w / 2, gy, 7, '#7A5236');
      umbrella(ctx, w / 2, h * .06, w * .46, h * .2, ['#3E78C4', '#F4ECDC'], r);
      P.clouds(ctx, [{ x: w * .5, y: h * .6, s: w * .2 }], { light: '#FFFFFF', mid: '#F4F1EA', shadow: '#C9D2DC', base: '#D6DEE6' }, r);
    } else if (kind === 'towel') {
      gshadow(w * .55, gy - 2, w * .46, h * .12, .22);
      const p = new Path2D(); p.moveTo(w * .1, gy - h * .1); p.lineTo(w * .82, gy - h * .1); p.lineTo(w * .95, gy - h * .52); p.lineTo(w * .28, gy - h * .52); p.closePath();
      stripes(ctx, p, w * .1, w * .95, 9, ['#2F8A8E', '#F6EFE0', '#D9A441', '#F6EFE0'], -.35);
      poly(ctx, [[w * .1, gy - h * .1], [w * .82, gy - h * .1], [w * .82, gy], [w * .1, gy]], '#23676A');
      poly(ctx, [[w * .82, gy - h * .1], [w * .95, gy - h * .52], [w * .95, gy - h * .42], [w * .82, gy]], '#1C5558');
    } else if (kind === 'hat') {
      gshadow(w * .58, gy - 6, w * .44, h * .16, .25);
      ctx.fillStyle = lg(ctx, [[0, '#F2DDA0'], [1, '#C9A45E']], 0, h * .4, 0, gy); ctx.beginPath(); ctx.ellipse(w / 2, gy - h * .22, w * .47, h * .2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = lg(ctx, [[0, '#F6E6B4'], [1, '#B89250']], w * .3, 0, w * .7, 0); ctx.beginPath(); ctx.ellipse(w / 2, gy - h * .36, w * .22, h * .3, 0, Math.PI, 0); ctx.lineTo(w * .72, gy - h * .3); ctx.lineTo(w * .28, gy - h * .3); ctx.fill();
      ctx.fillStyle = '#A8242A'; ctx.fillRect(w * .28, gy - h * .42, w * .44, h * .1);
      for (let i = 0; i < 90; i++) { const a = r() * 7, d = r(); P.stroke(ctx, w / 2 + Math.cos(a) * w * .45 * d, gy - h * .22 + Math.sin(a) * h * .18 * d, a + 1.57, 6, 1.2, [170, 130, 70], .4, .2); }
    } else if (kind === 'bucket') {
      gshadow(w * .62, gy - 4, w * .36, h * .07, .28);
      const top = h * .34, bw = w * .3, tw = w * .38;
      ctx.fillStyle = lg(ctx, [[0, '#B77A48'], [.35, '#E0A870'], [1, '#7A4A2A']], w / 2 - tw, 0, w / 2 + tw, 0); ctx.beginPath(); ctx.moveTo(w / 2 - tw, top); ctx.lineTo(w / 2 + tw, top); ctx.lineTo(w / 2 + bw, gy - 6); ctx.lineTo(w / 2 - bw, gy - 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(70,40,20,.45)'; ctx.lineWidth = 1.5; for (let i = 1; i < 7; i++) { const u = i / 7; ctx.beginPath(); ctx.moveTo(lerp(w / 2 - tw, w / 2 + tw, u), top); ctx.lineTo(lerp(w / 2 - bw, w / 2 + bw, u), gy - 6); ctx.stroke(); }
      ctx.fillStyle = '#5A5A62'; ctx.fillRect(w / 2 - tw * .96, top + h * .08, tw * 1.92, h * .04); ctx.fillRect(w / 2 - bw * 1.02, gy - h * .16, bw * 2.04, h * .04);
      ctx.fillStyle = '#4A2E1C'; ctx.beginPath(); ctx.ellipse(w / 2, top, tw, h * .06, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#E3CFA8'; ctx.beginPath(); ctx.ellipse(w / 2, top + 3, tw * .85, h * .04, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#5A5A62'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(w / 2, top, tw * .9, h * .3, 0, Math.PI, 0); ctx.stroke();
      wood(ctx, w * .86, h * .06, w * .7, gy - h * .1, 5, '#8A5A36'); poly(ctx, [[w * .64, gy - h * .16], [w * .8, gy - h * .02], [w * .66, gy], [w * .56, gy - h * .1]], '#C9CCD2');
    } else if (kind === 'castle') {
      gshadow(w * .6, gy - 4, w * .46, h * .07, .3);
      const sand = (x, y, ww, hh, broken) => { ctx.fillStyle = lg(ctx, [[0, '#F2DDB0'], [.4, '#E3C690'], [1, '#B8955E']], x, 0, x + ww, 0); ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, y); if (broken) { for (let j = 0; j <= 6; j++) ctx.lineTo(x + ww * j / 6, y + (r() - .2) * hh * .25); } else { for (let j = 0; j < 4; j++) { const a = x + ww * j / 4; ctx.lineTo(a, y - hh * .08); ctx.lineTo(a + ww / 8, y - hh * .08); ctx.lineTo(a + ww / 8, y); ctx.lineTo(a + ww / 4, y); } } ctx.lineTo(x + ww, gy); ctx.closePath(); ctx.fill(); };
      sand(w * .12, h * .5, w * .76, h * .5); sand(w * .18, h * .2, w * .2, h * .4); sand(w * .62, h * .36, w * .2, h * .4, true); sand(w * .4, h * .1, w * .18, h * .4);
      ctx.fillStyle = '#4A3A2A'; ctx.beginPath(); ctx.arc(w * .49, gy - h * .1, w * .045, Math.PI, 0); ctx.fill();
      wood(ctx, w * .49, h * .02, w * .49, h * .12, 2, '#5A3A22'); poly(ctx, [[w * .49, h * .02], [w * .56, h * .045], [w * .49, h * .07]], '#A8242A');
      brush(ctx, w, h, r, { ang: () => Math.PI / 2, area: 30, a: [.2, .45] });
    } else if (kind === 'tower') {
      gshadow(w * .62, gy - 4, w * .36, h * .025, .25);
      [[.28, .44], [.72, .56]].forEach(([a, b]) => { wood(ctx, w * a, h * .46, w * (a - .06), gy, 7, '#EDE6DA'); wood(ctx, w * b, h * .46, w * (b + .06), gy, 7, '#D8D0C2'); });
      wood(ctx, w * .22, h * .75, w * .78, h * .75, 5, '#E3DCCD');
      for (let i = 0; i < 6; i++) wood(ctx, w * (.45 + i * .02), h * (.5 + i * .08), w * (.62 + i * .02), h * (.5 + i * .08), 3, '#CFC6B6');
      ctx.fillStyle = lg(ctx, [[0, '#FBF8F2'], [1, '#CFC6B6']], w * .2, 0, w * .8, 0); ctx.fillRect(w * .2, h * .22, w * .6, h * .26);
      ctx.fillStyle = '#26335A'; ctx.fillRect(w * .28, h * .27, w * .18, h * .1); ctx.fillRect(w * .54, h * .27, w * .18, h * .1);
      poly(ctx, [[w * .12, h * .23], [w * .5, h * .1], [w * .88, h * .23]], '#B8403A');
      wood(ctx, w * .5, h * .1, w * .5, h * .01, 3, '#6E4B34'); poly(ctx, [[w * .5, h * .01], [w * .66, h * .035], [w * .5, h * .06]], '#D9A441');
      ctx.fillStyle = '#B8403A'; ctx.fillRect(w * .2, h * .44, w * .6, h * .03);
    } else if (kind === 'ball') {
      const R = w * .46, cx = w / 2, cy = h / 2, cols = ['#B8403A', '#F6EFE0', '#2F8A8E', '#F6EFE0', '#D9A441', '#F6EFE0'];
      for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, i / 6 * Math.PI * 2, (i + 1) / 6 * Math.PI * 2); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#F6EFE0'; ctx.beginPath(); ctx.arc(cx, cy, R * .16, 0, 7); ctx.fill();
      const g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .05, cx, cy, R); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(40,30,40,.45)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    } else if (kind === 'gull') {
      const body = lg(ctx, [[0, '#FFFFFF'], [1, '#D6D8DC']], 0, h * .3, 0, h * .7);
      ctx.fillStyle = '#9AA0AA'; ctx.beginPath(); ctx.moveTo(w * .46, h * .5); ctx.quadraticCurveTo(w * .25, h * .1, w * .02, h * .28); ctx.quadraticCurveTo(w * .24, h * .34, w * .4, h * .6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * .54, h * .5); ctx.quadraticCurveTo(w * .75, h * .1, w * .98, h * .28); ctx.quadraticCurveTo(w * .76, h * .34, w * .6, h * .6); ctx.fill();
      ctx.fillStyle = '#23252C'; ctx.beginPath(); ctx.moveTo(w * .02, h * .28); ctx.quadraticCurveTo(w * .08, h * .22, w * .14, h * .25); ctx.lineTo(w * .1, h * .32); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * .98, h * .28); ctx.quadraticCurveTo(w * .92, h * .22, w * .86, h * .25); ctx.lineTo(w * .9, h * .32); ctx.fill();
      ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(w * .5, h * .55, w * .16, h * .13, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(w * .64, h * .48, h * .1, 0, 7); ctx.fill();
      ctx.fillStyle = '#E3B040'; ctx.beginPath(); ctx.moveTo(w * .72, h * .47); ctx.lineTo(w * .8, h * .5); ctx.lineTo(w * .72, h * .52); ctx.fill(); ctx.fillStyle = '#1B1D24'; ctx.beginPath(); ctx.arc(w * .66, h * .46, 1.4, 0, 7); ctx.fill();
    } else if (kind === 'ballunder') {
      const cx = w / 2, cy = h / 2, R = w * .2;
      const halo = ctx.createRadialGradient(cx, cy, R * .8, cx, cy, w * .5); halo.addColorStop(0, 'rgba(240,252,248,.85)'); halo.addColorStop(.4, 'rgba(170,230,226,.4)'); halo.addColorStop(1, 'rgba(170,230,226,0)'); ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(250,255,250,.5)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(cx, cy, R * (1.3 + i * .35), R * (1.3 + i * .35) * .9, 0, r() * 3, r() * 3 + 2); ctx.stroke(); }
      const cols = ['#8E2E2A', '#CFC6B4', '#1F6A6E', '#CFC6B4', '#A87E30', '#CFC6B4'];
      for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, i / 6 * Math.PI * 2, (i + 1) / 6 * Math.PI * 2); ctx.closePath(); ctx.fill(); }
      const g = ctx.createRadialGradient(cx, cy, R * .2, cx, cy, R); g.addColorStop(0, 'rgba(10,30,40,.35)'); g.addColorStop(.85, 'rgba(10,30,40,.1)'); g.addColorStop(1, 'rgba(255,255,250,.7)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    }
    if (kind !== 'ball' && kind !== 'gull' && kind !== 'ballunder') brush(ctx, w, h, r, { area: 70, a: [.25, .5], ang: () => (r() - .5) * 3 });
  };

  /* ---------- world 4: stone hall ---------- */
  const column = (ctx, x, by, cw, ch, fog, broken, r, K) => {
    const fc = hex('#15506A'), mixf = c => rgba([lerp(c[0], fc[0], fog), lerp(c[1], fc[1], fog), lerp(c[2], fc[2], fog)], 1);
    const lit = hex('#E6DDC8'), mid = hex('#B8AE96'), dk = hex('#5E6A68');
    const top = by - ch, path = new Path2D(); path.moveTo(x - cw / 2, by); path.lineTo(x - cw / 2, top);
    if (broken) { const n = 7; for (let j = 0; j <= n; j++) path.lineTo(x - cw / 2 + cw * j / n, top + (j % 2 ? cw * (.15 + r() * .5) : -cw * r() * .3)); } else path.lineTo(x + cw / 2, top);
    path.lineTo(x + cw / 2, by); path.closePath();
    const g = ctx.createLinearGradient(x - cw / 2, 0, x + cw / 2, 0); g.addColorStop(0, mixf(dk)); g.addColorStop(.28, mixf(lit)); g.addColorStop(.6, mixf(mid)); g.addColorStop(1, mixf(dk)); ctx.fillStyle = g; ctx.fill(path);
    ctx.save(); ctx.clip(path);
    const N = 12; for (let j = 0; j < N; j++) { const a0 = -Math.PI / 2 + j / N * Math.PI, a1 = -Math.PI / 2 + (j + 1) / N * Math.PI, x0 = x + Math.sin(a0) * cw / 2, x1 = x + Math.sin(a1) * cw / 2; if (x1 - x0 < .6) continue; const fg = ctx.createLinearGradient(x0, 0, x1, 0); fg.addColorStop(0, `rgba(20,30,34,${.34 * (1 - fog)})`); fg.addColorStop(.45, `rgba(255,250,236,${.18 * (1 - fog)})`); fg.addColorStop(1, `rgba(20,30,34,${.22 * (1 - fog)})`); ctx.fillStyle = fg; ctx.fillRect(x0, top - cw, x1 - x0, ch + cw * 2); }
    for (let i = 0; i < 60 * (1 - fog) + 6; i++) { const u = Math.pow(r(), 1.8), y = by - u * ch * .75, xx = x + (r() - .5) * cw; P.stroke(ctx, xx, y, -Math.PI / 2 + (r() - .5) * .3, (4 + r() * 18) * K * (cw / 60 + .3), (1 + r() * 3) * K * (cw / 70 + .3), hex(r() < .5 ? '#3E5A3A' : r() < .5 ? '#6C7A3A' : '#2E4A40'), (.35 + r() * .45) * (1 - fog * .7), .3); }
    ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(230,250,220,${.3 * (1 - fog)})`; ctx.lineWidth = Math.max(.8, 1.4 * K);
    for (let i = 0; i < 16; i++) { const yy = top + r() * ch; ctx.beginPath(); for (let j = 0; j <= 10; j++) { const xx = x - cw / 2 + cw * j / 10; const y2 = yy + Math.sin(j * 1.3 + i) * cw * .12 + (r() - .5) * cw * .05; j ? ctx.lineTo(xx, y2) : ctx.moveTo(xx, y2); } ctx.stroke(); }
    ctx.restore();
    if (!broken) { ctx.fillStyle = mixf(lit); ctx.fillRect(x - cw * .72, top - cw * .28, cw * 1.44, cw * .28); ctx.fillStyle = mixf(mid); ctx.beginPath(); ctx.moveTo(x - cw * .72, top); ctx.quadraticCurveTo(x, top + cw * .5, x + cw * .72, top); ctx.fill(); ctx.fillStyle = mixf(dk); ctx.fillRect(x + cw * .45, top - cw * .28, cw * .27, cw * .28); }
    ctx.fillStyle = mixf(mid); ctx.fillRect(x - cw * .7, by - cw * .3, cw * 1.4, cw * .3); ctx.fillStyle = mixf(lit); ctx.beginPath(); ctx.ellipse(x, by - cw * .3, cw * .62, cw * .12, 0, Math.PI, 0); ctx.fill();
    blob(ctx, x + cw * .4, by, cw * 1.4, cw * .18, 'rgba(18,58,85,.4)', 4 * K);
    if (broken && fog < .6) for (let i = 0; i < 5; i++) { const fx = x + (r() - .5) * cw * 3, fs = cw * (.1 + r() * .18); ctx.fillStyle = mixf(mid); ctx.beginPath(); ctx.moveTo(fx - fs, by); ctx.lineTo(fx - fs * .4, by - fs * .8); ctx.lineTo(fx + fs, by - fs * .3); ctx.lineTo(fx + fs * .8, by); ctx.fill(); }
  };
  P.hall5 = cv => { const s = sz(cv); return P.sky(cv, {
    seed: 41, w: s.w, h: s.h, k: .6, big: .5, stops: [[0, '#6FC0C2'], [.18, '#2E8C95'], [.5, '#16506C'], [.56, '#123A55'], [.57, '#9E9A86'], [.7, '#C9B994'], [1, '#D8C7A3']], clouds: 0,
    post: (ctx, w, h, r) => {
      const hy = h * .56, vx = w * .5, K = P._k || 1;
      for (let i = 0; i < w * h / 700; i++) { const y = lerp(hy, h, Math.pow(r(), .8)), t = (y - hy) / (h - hy), x = r() * w; P.stroke(ctx, x, y, (r() - .5) * .08, (6 + t * 40) * K, (1 + t * 4) * K, hex(r() < .5 ? '#EFE3C4' : '#AE9B74'), .35 + r() * .35, .12); }
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = 'rgba(242,230,180,.3)'; ctx.lineWidth = 1.5 * K;
      for (let i = 0; i < 110; i++) { const y = lerp(hy + h * .03, h, Math.pow(r(), .7)), t = (y - hy) / (h - hy), x = r() * w, q = (10 + r() * 30) * K * (t + .3); ctx.beginPath(); ctx.ellipse(x, y, q, q * .28, 0, r() * 3, r() * 3 + 2.6); ctx.stroke(); }
      ctx.restore();
      for (let i = 7; i >= 0; i--) for (let side = -1; side <= 1; side += 2) {
        const z = 1 + i * .75, x = vx + side * (w * .66) / z, by = hy + h * .5 / z, br = (i + (side > 0 ? 1 : 0)) % 3 === 1, ch = h * (br ? .5 + r() * .2 : 1.05) / z, cw = w * .07 / z;
        column(ctx, x, by, cw, ch, Math.min(1, i / 7.5) * .85, br, r, K);
      }
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i++) { const x = w * (.1 + r() * .8), sw = w * (.02 + r() * .05); ctx.fillStyle = lg(ctx, [[0, 'rgba(242,217,160,.3)'], [1, 'rgba(242,217,160,0)']], 0, 0, 0, h * .9); ctx.beginPath(); ctx.moveTo(x - sw, 0); ctx.lineTo(x + sw, 0); ctx.lineTo(x + sw * 3 + w * .06, h * .9); ctx.lineTo(x - sw * 2 + w * .06, h * .9); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    } }); };
  P.caustic = cv => {
    const k = .5; const { ctx, w, h } = setupK(cv, k); const r = P.rng(99);
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = 'rgba(235,255,240,.7)'; ctx.lineCap = 'round';
    const cell = 46 * k * 2, pts = []; for (let y = -cell; y < h + cell; y += cell) for (let x = -cell; x < w + cell; x += cell) pts.push([x + (r() - .5) * cell * .9, y + (r() - .5) * cell * .9]);
    const cols = Math.ceil((w + 2 * cell) / cell);
    ctx.filter = 'blur(2px)';
    pts.forEach((p, i) => { [i + 1, i + cols, i + cols + 1].forEach(j => { const q = pts[j]; if (!q || Math.hypot(q[0] - p[0], q[1] - p[1]) > cell * 1.7) return; ctx.lineWidth = (.7 + r() * 1.3) * k * 2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.quadraticCurveTo((p[0] + q[0]) / 2 + (r() - .5) * cell * .4, (p[1] + q[1]) / 2 + (r() - .5) * cell * .4, q[0], q[1]); ctx.stroke(); }); });
  };

  /* ---------- world 5: same beach, empty end ---------- */
  P.beachTall5 = cv => { const s = sz(cv); return P.sky(cv, {
    seed: 52, w: s.w, h: s.h, k: .5, stops: [[0, '#5B98D6'], [.12, '#86BCE4'], [.205, '#DCEEF0'], [1, '#DCEEF0']], clouds: 7, cy0: .02, cy1: .15, cs0: .02, cs1: .045,
    post: (ctx, w, h, r) => {
      const U = h / 2.2, hy = U * .46, K = P._k || 1;
      P.sea(ctx, w, hy, U * .64, { far: '#3B9CB4', near: '#52C2BE', mid: '#A6E0D6', foam: '#F7F5EE' }, r);
      ctx.fillStyle = 'rgba(248,250,246,.7)'; ctx.fillRect(0, hy - K, w, 1.6 * K);
      ctx.fillStyle = lg(ctx, [[0, '#B9A07A'], [.3, '#CDB690'], [1, '#E8D8B8']], 0, U * .64, 0, U * .72); ctx.fillRect(0, U * .64, w, U * .08);
      ctx.strokeStyle = 'rgba(255,255,250,.85)'; ctx.lineWidth = 2.5 * K; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = i / 60 * w, y = U * .642 + Math.sin(i * .7) * 2 * K; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      const y0 = U * .72; ctx.fillStyle = lg(ctx, [[0, '#E8D8B8'], [.25, '#F1E4C8'], [.5, '#EFE0C2'], [.78, '#E6D3AE'], [.86, '#CDB690'], [.9, '#A6D8CC'], [1, '#52C2BE']], 0, y0, 0, h); ctx.fillRect(0, y0, w, h - y0);
      const tx = w * .1, ty = U * .645, ts = U * .05; ctx.fillStyle = '#EDE6DA'; ctx.fillRect(tx - ts * .3, ty - ts * .5, ts * .06, ts * .5); ctx.fillRect(tx + ts * .24, ty - ts * .5, ts * .06, ts * .5); ctx.fillRect(tx - ts * .36, ty - ts * .85, ts * .72, ts * .36); poly(ctx, [[tx - ts * .45, ty - ts * .85], [tx, ty - ts * 1.05], [tx + ts * .45, ty - ts * .85]], '#B8403A');
      for (let i = 0; i < w * (h - y0) / 500; i++) { const x = r() * w, y = lerp(y0, h * .96, r()); P.stroke(ctx, x, y, (r() - .5) * .2, (8 + r() * 26) * K, (1.5 + r() * 3) * K, hex(r() < .5 ? '#FBF3E0' : '#CDB58C'), .3 + r() * .35, .3); }
      for (let i = 0; i < 18; i++) { const x = w * (.3 + i * .012 + Math.sin(i) * .01), y = lerp(U * 1.05, U * 1.35, i / 17); blob(ctx, x + (i % 2 ? 6 : -6) * K, y, 5 * K, 9 * K, 'rgba(150,120,85,.4)', 2); }
      for (let i = 0; i < 26; i++) { const y = lerp(U * .75, h * .9, r()); shell(ctx, r() * w, y, (3 + r() * 5) * K * (y > U ? 2 : 1), (r() - .5), '#FBF1E4', '#D8B79A'); }
    } }); };

  /* ---------- world 5 → 6: travel sprites ---------- */
  P.tsprite = kind => {
    const c = document.createElement('canvas'), S = { shell: [64, 48], grass: [90, 90], drift: [220, 70], stone: [60, 40], print: [60, 40], tuft: [70, 60] }[kind]; c.width = S[0]; c.height = S[1];
    const ctx = c.getContext('2d'), w = c.width, h = c.height, r = P.rng(kind.length * 7);
    if (kind === 'shell') shell(ctx, w / 2, h * .7, w * .32, -.2, '#FBF1E4', '#D8A98E');
    if (kind === 'stone') stone(ctx, w * .45, h * .6, w * .3, r);
    if (kind === 'print') { blob(ctx, w * .3, h * .55, w * .14, h * .3, 'rgba(140,100,60,.45)', 1.5, .2); blob(ctx, w * .7, h * .45, w * .14, h * .3, 'rgba(140,100,60,.45)', 1.5, .2); }
    if (kind === 'grass' || kind === 'tuft') { blob(ctx, w * .55, h * .94, w * .4, h * .06, 'rgba(90,60,50,.3)', 3); for (let i = 0; i < (kind === 'grass' ? 26 : 14); i++) { const a = -Math.PI / 2 + (r() - .5) * 1.5; P.stroke(ctx, w / 2 + (r() - .5) * w * .2, h * .95, a, h * (.4 + r() * .5), 1.5 + r() * 1.5, hex(['#B8A060', '#8E8A48', '#D8C488', '#6E6A38'][(r() * 4) | 0]), .9, (r() - .5) * .5); } }
    if (kind === 'drift') { blob(ctx, w * .56, h * .8, w * .46, h * .14, 'rgba(90,60,50,.32)', 3); ctx.fillStyle = lg(ctx, [[0, '#E8DCC8'], [.5, '#B9A48A'], [1, '#6E5A48']], 0, h * .25, 0, h * .8); ctx.beginPath(); ctx.moveTo(w * .06, h * .55); ctx.quadraticCurveTo(w * .3, h * .22, w * .7, h * .32); ctx.lineTo(w * .95, h * .2); ctx.lineTo(w * .9, h * .38); ctx.quadraticCurveTo(w * .6, h * .8, w * .1, h * .75); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = 1.2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(w * .1, h * (.5 + i * .04)); ctx.quadraticCurveTo(w * .5, h * (.35 + i * .06), w * .88, h * (.3 + i * .02)); ctx.stroke(); } }
    return c;
  };

  /* ---------- world 6: founders ---------- */
  const skinC = ['#C99A7A', '#8A5E48', '#E2B898', '#B07A5A'];
  P.founder = (cv, v) => {
    const { ctx, w, h } = P.setup(cv, 300, 400); const r = P.rng(300 + v), sit = v === 1 || v === 3;
    const coat = ['#2A2C33', '#4A3A36', '#26335A', '#3E4A44'][v], lite = mixL(coat, .35), dark = mixL(coat, -.35), sk = skinC[v];
    const shade = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, lite); g.addColorStop(.35, coat); g.addColorStop(1, dark); return g; };
    if (sit) {
      ctx.fillStyle = '#5A3A26'; [[.3, .62], [.7, .62]].forEach(([x]) => ctx.fillRect(w * x - 5, h * .66, 10, h * .33)); ctx.fillRect(w * .24, h * .2, 9, h * .5); ctx.fillStyle = lg(ctx, [[0, '#8A5E3E'], [1, '#5A3A26']], 0, h * .6, 0, h * .68); ctx.fillRect(w * .22, h * .62, w * .56, h * .05); ctx.fillRect(w * .23, h * .2, w * .06, h * .44);
      ctx.fillStyle = shade(w * .34, w * .7); ctx.beginPath(); ctx.moveTo(w * .36, h * .62); ctx.lineTo(w * .7, h * .6); ctx.lineTo(w * .72, h * .67); ctx.lineTo(w * .36, h * .69); ctx.fill();
      ctx.fillStyle = dark; ctx.fillRect(w * .6, h * .66, w * .06, h * .3); ctx.fillRect(w * .5, h * .66, w * .06, h * .3); ctx.fillStyle = '#16171C'; ctx.fillRect(w * .48, h * .95, w * .1, h * .03); ctx.fillRect(w * .58, h * .95, w * .1, h * .03);
      ctx.fillStyle = shade(w * .34, w * .66); ctx.beginPath(); ctx.moveTo(w * .38, h * .64); ctx.lineTo(w * .36, h * .28); ctx.quadraticCurveTo(w * .5, h * .2, w * .64, h * .28); ctx.lineTo(w * .64, h * .64); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(w * .62, h * .3); ctx.quadraticCurveTo(w * .7, h * .45, w * .66, h * .6); ctx.lineTo(w * .6, h * .6); ctx.lineTo(w * .58, h * .34); ctx.fill();
      ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(w * .64, h * .61, 10, 7, 0, 0, 7); ctx.fill();
    } else {
      blob(ctx, w * .5, h * .985, w * .2, h * .015, 'rgba(40,24,30,.45)', 3);
      ctx.fillStyle = dark; ctx.fillRect(w * .41, h * .7, w * .08, h * .27); ctx.fillStyle = mixL(coat, -.2); ctx.fillRect(w * .51, h * .7, w * .08, h * .27);
      ctx.fillStyle = '#16171C'; ctx.beginPath(); ctx.ellipse(w * .44, h * .975, w * .065, h * .02, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(w * .56, h * .975, w * .065, h * .02, 0, 0, 7); ctx.fill();
      ctx.fillStyle = shade(w * .3, w * .7); ctx.beginPath(); ctx.moveTo(w * .36, h * .08); ctx.quadraticCurveTo(w * .5, h * .03, w * .64, h * .08); ctx.quadraticCurveTo(w * .72, h * .12, w * .7, h * .3); ctx.lineTo(w * .7, h * .74); ctx.lineTo(w * .3, h * .74); ctx.lineTo(w * .3, h * .3); ctx.quadraticCurveTo(w * .28, h * .12, w * .36, h * .08); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .5, h * .1); ctx.lineTo(w * .5, h * .74); ctx.stroke();
      ctx.fillStyle = lite; ctx.beginPath(); ctx.moveTo(w * .31, h * .14); ctx.quadraticCurveTo(w * .26, h * .4, w * .3, h * .56); ctx.lineTo(w * .35, h * .56); ctx.lineTo(w * .36, h * .16); ctx.fill();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(w * .69, h * .14); ctx.quadraticCurveTo(w * .74, h * .4, w * .7, h * .56); ctx.lineTo(w * .65, h * .56); ctx.lineTo(w * .64, h * .16); ctx.fill();
      ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(w * .325, h * .575, 8, 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = mixL(sk, -.3); ctx.beginPath(); ctx.ellipse(w * .675, h * .575, 8, 10, 0, 0, 7); ctx.fill();
      ctx.fillStyle = v === 2 ? '#E9DDC3' : '#F3EEE4'; ctx.beginPath(); ctx.moveTo(w * .44, h * .06); ctx.lineTo(w * .5, h * .16); ctx.lineTo(w * .56, h * .06); ctx.fill();
      if (v === 0) { ctx.fillStyle = '#A8242A'; ctx.beginPath(); ctx.moveTo(w * .49, h * .1); ctx.lineTo(w * .51, h * .1); ctx.lineTo(w * .52, h * .3); ctx.lineTo(w * .5, h * .33); ctx.lineTo(w * .48, h * .3); ctx.fill(); }
    }
    ctx.fillStyle = mixL(sk, -.2); ctx.fillRect(sit ? w * .46 : w * .46, sit ? h * .17 : h * .0, w * .08, h * .06);
    brush(ctx, w, h, r, { area: 50, a: [.2, .45], ang: () => Math.PI / 2 + (r() - .5) * .3 });
  };
  const mixL = (c, k) => { const a = hex(c); return rgba(k > 0 ? a.map(x => x + (255 - x) * k) : a.map(x => x * (1 + k)), 1); };
  P.head = (cv, v) => {
    const { ctx, w, h } = P.setup(cv, 90, 110); const r = P.rng(400 + v), sk = skinC[v];
    const hair = ['#1E1A18', '#5A3A26', '#2A2420', '#8A8A88'][v];
    if (v === 0 || v === 3) {
      ctx.fillStyle = lg(ctx, [[0, mixL(sk, .15)], [1, mixL(sk, -.35)]], 10, 0, 80, 0); ctx.beginPath(); ctx.ellipse(45, 60, 29, 36, 0, 0, 7); ctx.fill();
      ctx.fillStyle = lg(ctx, [[0, mixL(hair, .2)], [1, hair]], 0, 20, 0, 90); ctx.beginPath(); ctx.ellipse(45, 54, 31, 36, 0, Math.PI * .95, Math.PI * 2.05); ctx.lineTo(74, 80); ctx.quadraticCurveTo(45, 96, 16, 80); ctx.closePath(); ctx.fill();
      ctx.fillStyle = mixL(sk, -.1); ctx.beginPath(); ctx.ellipse(15, 62, 5, 9, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(75, 62, 5, 9, 0, 0, 7); ctx.fill();
      if (v === 3) { ctx.fillStyle = '#2A2C33'; ctx.beginPath(); ctx.ellipse(45, 36, 42, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(45, 26, 26, 22, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(19, 26, 52, 10); }
    } else {
      ctx.fillStyle = lg(ctx, [[0, mixL(sk, .25)], [.3, sk], [.55, mixL(sk, -.55)], [1, mixL(sk, -.7)]], 14, 0, 80, 0); ctx.beginPath(); ctx.ellipse(45, 58, 27, 35, -.08, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(20,14,14,.45)'; ctx.beginPath(); ctx.ellipse(52, 50, 20, 7, 0, 0, 7); ctx.fill();
      ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(46, 40, 31, 24, -.1, Math.PI, 0); ctx.quadraticCurveTo(80, 70, 70, 96); ctx.lineTo(62, 60); ctx.quadraticCurveTo(46, 30, 24, 44); ctx.quadraticCurveTo(16, 70, 22, 96); ctx.quadraticCurveTo(10, 70, 15, 40); ctx.fill();
    }
    brush(ctx, w, h, r, { area: 20, a: [.2, .4], ang: () => Math.PI / 2 });
  };
  P.thought = (cv, kind) => {
    const { ctx, w, h } = P.setup(cv, 56, 56); const r = P.rng(kind.length * 17 + kind.charCodeAt(1));
    const c = w / 2;
    if (kind === 'box') { poly(ctx, [[10, 22], [34, 14], [48, 22], [24, 30]], '#D8B07A'); poly(ctx, [[10, 22], [24, 30], [24, 50], [10, 42]], '#A87A48'); poly(ctx, [[24, 30], [48, 22], [48, 42], [24, 50]], '#C0925A'); ctx.fillStyle = 'rgba(240,230,210,.8)'; ctx.fillRect(28, 32, 12, 4); }
    if (kind === 'form') { ctx.save(); ctx.translate(c, c); ctx.rotate((r() - .5) * .6); ctx.fillStyle = '#F6F1E6'; ctx.fillRect(-15, -20, 30, 40); ctx.fillStyle = '#9AA0AA'; for (let i = 0; i < 6; i++) ctx.fillRect(-11, -14 + i * 6, i % 2 ? 16 : 22, 2); ctx.fillStyle = '#A8242A'; ctx.fillRect(4, 12, 7, 5); ctx.restore(); }
    if (kind === 'rope') { ctx.strokeStyle = '#C9A46A'; ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < 40; i++) { const a = i * .5, d = 6 + i * .4; ctx.lineTo(c + Math.cos(a) * d * (1 + (r() - .5) * .3), c + Math.sin(a) * d * .7); } ctx.stroke(); }
    if (kind === 'clock') { ctx.fillStyle = '#B8964E'; ctx.beginPath(); ctx.arc(c, c + 3, 19, 0, 7); ctx.fill(); ctx.fillStyle = '#F6F1E6'; ctx.beginPath(); ctx.arc(c, c + 3, 15, 0, 7); ctx.fill(); ctx.strokeStyle = '#1B1D24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c, c + 3); ctx.lineTo(c + 7, c - 4); ctx.moveTo(c, c + 3); ctx.lineTo(c, c - 9); ctx.stroke(); ctx.fillStyle = '#B8964E'; ctx.beginPath(); ctx.arc(c - 13, c - 14, 6, 0, 7); ctx.arc(c + 13, c - 14, 6, 0, 7); ctx.fill(); }
    if (kind === 'pill') { ctx.fillStyle = lg(ctx, [[0, '#F2A65A'], [1, '#B8643A']], 16, 0, 40, 0); ctx.beginPath(); ctx.roundRect(16, 14, 24, 34, 5); ctx.fill(); ctx.fillStyle = '#F6F1E6'; ctx.fillRect(18, 24, 20, 14); ctx.fillStyle = '#F3EEE4'; ctx.beginPath(); ctx.roundRect(14, 6, 28, 9, 3); ctx.fill(); }
    if (kind === 'card') { ctx.save(); ctx.translate(c, c); ctx.rotate((r() - .5) * .8); ctx.fillStyle = '#F6F1E6'; ctx.fillRect(-20, -12, 40, 24); ctx.fillStyle = '#2F6F7A'; ctx.fillRect(-20, -12, 40, 7); ctx.fillStyle = '#9AA0AA'; ctx.fillRect(-15, 0, 22, 2); ctx.fillRect(-15, 5, 14, 2); ctx.restore(); }
    if (kind === 'letter') { ctx.save(); ctx.translate(c, c); ctx.rotate((r() - .5) * .6); ctx.fillStyle = '#F2EAD8'; ctx.fillRect(-20, -13, 40, 26); ctx.strokeStyle = '#B9A585'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-20, -13); ctx.lineTo(0, 3); ctx.lineTo(20, -13); ctx.stroke(); ctx.fillStyle = '#A8242A'; ctx.beginPath(); ctx.arc(0, 3, 3.5, 0, 7); ctx.fill(); ctx.restore(); }
    if (kind === 'phone') { ctx.save(); ctx.translate(c, c); ctx.rotate(-.6); ctx.fillStyle = '#1B1D24'; ctx.beginPath(); ctx.roundRect(-22, -5, 44, 10, 5); ctx.fill(); ctx.beginPath(); ctx.ellipse(-18, 3, 8, 6, 0, 0, 7); ctx.ellipse(18, 3, 8, 6, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-16, -3, 30, 2); ctx.restore(); }
    if (kind === 'bubble') { ctx.fillStyle = '#F6F1E6'; ctx.beginPath(); ctx.ellipse(c, c - 4, 22, 15, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(c - 8, c + 8); ctx.lineTo(c - 14, c + 20); ctx.lineTo(c + 2, c + 9); ctx.fill(); ctx.fillStyle = '#1B1D24'; [-8, 0, 8].forEach(d => { ctx.beginPath(); ctx.arc(c + d, c - 4, 2.2, 0, 7); ctx.fill(); }); }
    if (kind === 'thread') { ['#A8242A', '#2F6F7A', '#D9A441'].forEach((col, j) => { ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(4, 10 + j * 14); for (let i = 0; i < 6; i++) ctx.bezierCurveTo(r() * w, r() * h, r() * w, r() * h, r() * w, r() * h); ctx.stroke(); }); }
    if (kind === 'number') { ctx.fillStyle = '#F3EEE4'; ctx.font = 'italic 600 30px ' + (getComputedStyle(document.documentElement).getPropertyValue('--font-cormorant').trim() || 'Cormorant') + ', serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(['7', '42', '%', '3.1', '0'][(r() * 5) | 0], c, c); ctx.strokeStyle = 'rgba(27,29,36,.6)'; ctx.lineWidth = 1; ctx.strokeText('', c, c); }
    if (kind === 'gear') { ctx.fillStyle = '#B8964E'; ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, q = i % 2 ? 20 : 15; ctx.lineTo(c + Math.cos(a) * q, c + Math.sin(a) * q); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#6E5226'; ctx.beginPath(); ctx.arc(c, c, 6, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,240,200,.4)'; ctx.beginPath(); ctx.arc(c - 4, c - 5, 8, 3.4, 4.8); ctx.lineTo(c, c); ctx.fill(); }
  };
  P.resolved = (cv, v) => {
    const { ctx, w, h } = P.setup(cv, 180, 180); const r = P.rng(500 + v), c = w / 2;
    if (v === 0) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(c, h * .66, w * .44, h * .15, 0, 0, 7); ctx.clip(); P.sea(ctx, w, h * .5, h * .82, { far: '#3E8A94', near: '#1F5A66', mid: '#6FAFB5', foam: '#F3EEE4' }, r); ctx.restore();
      ctx.strokeStyle = 'rgba(243,238,228,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(c, h * .66, w * .44, h * .15, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = lg(ctx, [[0, '#6E4B34'], [1, '#3E2A1E']], 0, h * .56, 0, h * .66); ctx.beginPath(); ctx.moveTo(c - 44, h * .58); ctx.lineTo(c + 50, h * .58); ctx.lineTo(c + 34, h * .67); ctx.lineTo(c - 36, h * .67); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5A3A26'; ctx.fillRect(c - 2, h * .14, 4, h * .45);
      ctx.fillStyle = lg(ctx, [[0, '#FBF8F2'], [1, '#D8CBB3']], c, 0, c + 40, 0); ctx.beginPath(); ctx.moveTo(c + 4, h * .16); ctx.quadraticCurveTo(c + 40, h * .34, c + 38, h * .54); ctx.lineTo(c + 4, h * .54); ctx.fill();
      ctx.beginPath(); ctx.moveTo(c - 4, h * .22); ctx.quadraticCurveTo(c - 30, h * .38, c - 34, h * .54); ctx.lineTo(c - 4, h * .54); ctx.fill();
      ctx.fillStyle = '#A8242A'; ctx.beginPath(); ctx.moveTo(c + 2, h * .1); ctx.lineTo(c + 16, h * .13); ctx.lineTo(c + 2, h * .16); ctx.fill();
    }
    if (v === 1) {
      ctx.fillStyle = '#7A5236'; ctx.fillRect(c - 52, h * .12, 104, 136); ctx.fillStyle = lg(ctx, [[0, '#F7D99A'], [1, '#E0A45E']], 0, h * .16, 0, h * .8); ctx.fillRect(c - 42, h * .17, 84, 118);
      ctx.fillStyle = 'rgba(120,70,40,.5)'; ctx.fillRect(c - 42, h * .62, 84, 34); ctx.fillStyle = '#8C4A32'; ctx.fillRect(c + 4, h * .5, 26, 22); ctx.fillRect(c + 6, h * .62, 4, 14); ctx.fillRect(c + 24, h * .62, 4, 14);
      ctx.fillStyle = '#2F6F7A'; ctx.fillRect(c - 32, h * .36, 3, 44); const lg2 = ctx.createRadialGradient(c - 30, h * .32, 2, c - 30, h * .32, 40); lg2.addColorStop(0, 'rgba(255,250,220,1)'); lg2.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lg2; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#F3E6C8'; ctx.beginPath(); ctx.moveTo(c - 40, h * .36); ctx.lineTo(c - 20, h * .36); ctx.lineTo(c - 25, h * .28); ctx.lineTo(c - 35, h * .28); ctx.fill();
      ctx.fillStyle = '#7A5236'; ctx.fillRect(c - 3, h * .17, 6, 118); ctx.fillRect(c - 42, h * .44, 84, 6);
      ctx.fillStyle = '#EFE6D6'; ctx.fillRect(c - 60, h * .86, 120, 8);
    }
    if (v === 2) {
      const g = ctx.createRadialGradient(c - 18, h * .34, 4, c, h * .48, 66); g.addColorStop(0, 'rgba(120,200,210,.9)'); g.addColorStop(1, 'rgba(20,50,80,.95)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, h * .48, 64, 0, 7); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'screen'; const gl = ctx.createRadialGradient(c + 14, h * .36, 1, c + 14, h * .36, 34); gl.addColorStop(0, 'rgba(255,240,170,1)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h); ctx.restore();
      ctx.fillStyle = '#F3E6C8'; ctx.beginPath(); ctx.arc(c + 14, h * .36, 5, 0, 7); ctx.fill(); ctx.strokeStyle = '#2A3A48'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c + 14, h * .36); ctx.quadraticCurveTo(c + 4, h * .3, c - 4, h * .44); ctx.stroke();
      ctx.fillStyle = lg(ctx, [[0, '#4A5E6E'], [1, '#1B2A38']], 0, h * .42, 0, h * .6); ctx.beginPath(); ctx.moveTo(c - 30, h * .52); ctx.quadraticCurveTo(c - 10, h * .38, c + 20, h * .5); ctx.lineTo(c + 36, h * .44); ctx.lineTo(c + 34, h * .58); ctx.lineTo(c + 20, h * .54); ctx.quadraticCurveTo(c - 10, h * .66, c - 30, h * .52); ctx.fill();
      ctx.fillStyle = '#F3EEE4'; ctx.beginPath(); ctx.arc(c - 20, h * .5, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#E9DDC3'; [0, 1, 2, 3].forEach(i => { ctx.beginPath(); ctx.arc(c - 8 + i * 8, h * .56, 1.6, 0, 7); ctx.fill(); });
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(c, h * .48, 64, 3.6, 4.6); ctx.stroke(); ctx.fillStyle = '#B8964E'; ctx.fillRect(c - 26, h * .82, 52, 12);
    }
    if (v === 3) {
      ctx.fillStyle = lg(ctx, [[0, '#E6C98A'], [1, '#6E5226']], c - 30, 0, c + 30, 0); ctx.beginPath(); ctx.moveTo(c - 30, h * .94); ctx.lineTo(c + 30, h * .94); ctx.lineTo(c + 10, h * .78); ctx.lineTo(c - 10, h * .78); ctx.fill(); ctx.fillRect(c - 3, h * .5, 6, h * .3);
      ctx.strokeStyle = '#B8964E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(c, h * .5, 70, 20, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(c, h * .5, 46, 13, 0, 0, 7); ctx.stroke();
      const sg = ctx.createRadialGradient(c - 5, h * .47, 2, c, h * .5, 16); sg.addColorStop(0, '#FFF1C0'); sg.addColorStop(1, '#D9A441'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(c, h * .5, 15, 0, 7); ctx.fill();
    }
  };
  P.planet = (cv, col) => { const { ctx, w, h } = P.setup(cv, 24, 24); const g = ctx.createRadialGradient(8, 8, 1, 12, 12, 11); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.3, col); g.addColorStop(1, mixL(col, -.5)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(12, 12, 10, 0, 7); ctx.fill(); };

  /* ---------- world 8: the reaching hand ---------- */
  const segF = (ctx, pts, wd, dir) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a), ww = wd[i];
      const g = ctx.createLinearGradient(x1 - nx * ww / 2, y1 - ny * ww / 2, x1 + nx * ww / 2, y1 + ny * ww / 2);
      g.addColorStop(0, dir > 0 ? '#F2CCAE' : '#8A5842'); g.addColorStop(.4, '#E2B494'); g.addColorStop(1, dir > 0 ? '#8A5842' : '#F2CCAE');
      ctx.strokeStyle = g; ctx.lineWidth = ww; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    for (let i = 1; i < pts.length - 1; i++) { const [x, y] = pts[i], a = Math.atan2(pts[i + 1][1] - pts[i - 1][1], pts[i + 1][0] - pts[i - 1][0]) + Math.PI / 2, ww = wd[i] * .34; ctx.strokeStyle = 'rgba(120,70,52,.6)'; ctx.lineWidth = 1.4; for (let k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * ww + k * 1.5, y + Math.sin(a) * ww); ctx.quadraticCurveTo(x + k * 3, y + 3, x - Math.cos(a) * ww + k * 1.5, y - Math.sin(a) * ww); ctx.stroke(); } }
    const n = pts.length, [tx, ty] = pts[n - 1], [px, py] = pts[n - 2], a = Math.atan2(ty - py, tx - px), nw = wd[n - 2] * .56;
    ctx.save(); ctx.translate(tx - Math.cos(a) * nw * .45, ty - Math.sin(a) * nw * .45); ctx.rotate(a); ctx.fillStyle = '#F2D6C8'; ctx.beginPath(); ctx.roundRect(-nw * .6, -nw * .5, nw * 1.1, nw, [nw * .2, nw * .5, nw * .5, nw * .2]); ctx.fill(); ctx.fillStyle = 'rgba(255,250,244,.75)'; ctx.fillRect(-nw * .3, -nw * .3, nw * .5, nw * .14); ctx.strokeStyle = 'rgba(160,100,80,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-nw * .6, -nw * .5); ctx.lineTo(-nw * .6, nw * .5); ctx.stroke(); ctx.restore();
  };
  P.reach3 = cv => {
    const { ctx, w, h } = P.setup(cv, 360, 340); const r = P.rng(34);
    const arm = new Path2D(); arm.moveTo(w * 1.08, h * .04); arm.quadraticCurveTo(w * .78, h * .28, w * .53, h * .56); arm.lineTo(w * .36, h * .67); arm.quadraticCurveTo(w * .38, h * .36, w * .6, h * .1); arm.lineTo(w * .72, -h * .1); arm.closePath();
    const bs = new Path2D(); bs.moveTo(w * .5, h * .5); bs.quadraticCurveTo(w * .54, h * .64, w * .44, h * .74); bs.quadraticCurveTo(w * .3, h * .82, w * .2, h * .74); bs.quadraticCurveTo(w * .24, h * .6, w * .38, h * .56); bs.closePath();
    const ag = ctx.createLinearGradient(w * .8, h * .3, w * .62, h * .12); ag.addColorStop(0, '#8A5842'); ag.addColorStop(.45, '#E2B494'); ag.addColorStop(1, '#F2CCAE'); ctx.fillStyle = ag; ctx.fill(arm);
    [[[w * .36, h * .66], [w * .28, h * .76], [w * .21, h * .82], [w * .17, h * .86]], [[w * .42, h * .7], [w * .34, h * .8], [w * .27, h * .86], [w * .23, h * .9]]].forEach((f, i) => segF(ctx, f, [26 - i * 2, 23 - i * 2, 20 - i * 2], 1));
    [[w * .47, h * .7], [w * .42, h * .78]].forEach(([x, y], i) => { ctx.fillStyle = i ? '#B98468' : '#C99278'; ctx.beginPath(); ctx.ellipse(x, y, 13, 10, -.6, 0, 7); ctx.fill(); });
    const bg = ctx.createLinearGradient(w * .2, h * .56, w * .5, h * .78); bg.addColorStop(0, '#F2CCAE'); bg.addColorStop(.55, '#E2B494'); bg.addColorStop(1, '#A87058'); ctx.fillStyle = bg; ctx.fill(bs);
    ctx.fillStyle = 'rgba(255,236,214,.6)'; [[.35, .66], [.4, .7], [.45, .72]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(w * x, h * y, 6, 4, -.6, 0, 7); ctx.fill(); });
    ctx.strokeStyle = 'rgba(150,96,74,.45)'; ctx.lineWidth = 1.5; [[.46, .56, .36, .66], [.5, .6, .41, .7]].forEach(([a, b, c2, d]) => { ctx.beginPath(); ctx.moveTo(w * a, h * b); ctx.lineTo(w * c2, h * d); ctx.stroke(); });
    ctx.save(); ctx.clip(arm); const sh = ctx.createLinearGradient(w * .5, h * .5, w * .95, -h * .05); sh.addColorStop(0, 'rgba(18,12,14,0)'); sh.addColorStop(.45, 'rgba(18,12,14,.25)'); sh.addColorStop(.8, 'rgba(18,12,14,.85)'); sh.addColorStop(1, 'rgba(18,12,14,1)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h); ctx.restore();
    P.overpaint(ctx, w, h, { len: [5, 16], wid: [2, 5], a: [.3, .55], ang: () => -0.9, area: 90, jit: 10 }, r);
  };
  P.thumb3 = cv => { const { ctx, w, h } = P.setup(cv, 360, 340); segF(ctx, [[w * .4, h * .74], [w * .3, h * .82], [w * .2, h * .87], [w * .13, h * .885]], [30, 25, 22], -1); };
})();
