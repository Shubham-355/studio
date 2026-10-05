/* Procedural oil-paint plates. window.Painter */
(function () {
  if (window.Painter) return;
  const P = {};
  P.rng = seed => { let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixC = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  P.hex = hex; P.rgba = rgba;

  P.setup = (cv, w, h) => {
    const r = cv.getBoundingClientRect();
    w = Math.max(2, Math.round(w || r.width)); h = Math.max(2, Math.round(h || r.height));
    cv.width = w; cv.height = h;
    return { ctx: cv.getContext('2d', { willReadFrequently: true }), w, h };
  };
  P.linear = (ctx, stops, x0, y0, x1, y1) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([t, c]) => g.addColorStop(t, c)); return g; };

  P.stroke = (ctx, x, y, ang, len, wid, c, a, bend) => {
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
    const x2 = x + dx * len, y2 = y + dy * len, cx = (x + x2) / 2 + nx * bend * len, cy = (y + y2) / 2 + ny * bend * len;
    ctx.lineCap = 'round'; ctx.strokeStyle = rgba(c, a); ctx.lineWidth = wid;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
    if (wid >= 4) {
      const o = wid * 0.28; ctx.lineWidth = Math.max(0.8, wid * 0.16);
      ctx.strokeStyle = rgba([c[0] + 20, c[1] + 19, c[2] + 16], a * 0.45);
      ctx.beginPath(); ctx.moveTo(x + nx * o, y + ny * o); ctx.quadraticCurveTo(cx + nx * o, cy + ny * o, x2 + nx * o, y2 + ny * o); ctx.stroke();
      ctx.strokeStyle = rgba([c[0] - 18, c[1] - 18, c[2] - 14], a * 0.35);
      ctx.beginPath(); ctx.moveTo(x - nx * o, y - ny * o); ctx.quadraticCurveTo(cx - nx * o, cy - ny * o, x2 - nx * o, y2 - ny * o); ctx.stroke();
    }
  };

  P.overpaint = (ctx, w, h, o, r) => {
    const img = ctx.getImageData(0, 0, w, h).data;
    const n = Math.round((o.density || 1) * w * h / (o.area || 300));
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = r() * h, idx = ((y | 0) * w + (x | 0)) * 4;
      if (img[idx + 3] < 200) continue;
      if (o.mask && !o.mask(x, y)) continue;
      const j = o.jit ?? 8;
      const c = [img[idx] + (r() - .5) * j, img[idx + 1] + (r() - .5) * j, img[idx + 2] + (r() - .5) * j];
      const ang = (o.ang ? o.ang(x, y) : 0) + (r() - .5) * (o.angJ ?? 0.35);
      const s = o.scale ? o.scale(x, y) : 1;
      const len = lerp(o.len[0], o.len[1], r()) * s, wid = lerp(o.wid[0], o.wid[1], r()) * s;
      P.stroke(ctx, x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2, ang, len, wid, c, lerp(o.a[0], o.a[1], r()), (r() - .5) * (o.bend ?? .25));
    }
  };
  const flow = (x, y, k = 1) => Math.sin(x * .006 * k + y * .003 * k) * .5 + Math.sin(y * .011 * k - x * .002) * .3;
  const finish = (ctx, w, h, r, big = 1) => {
    const fl = (x, y) => flow(x / big, y / big);
    P.overpaint(ctx, w, h, { len: [18 * big, 60 * big], wid: [6 * big, 15 * big], a: [.35, .7], ang: (x, y) => fl(x, y) * .6, area: 380 * big * big, jit: 7 }, r);
    P.overpaint(ctx, w, h, { len: [6 * big, 20 * big], wid: [2 * big, 5 * big], a: [.3, .6], ang: (x, y) => flow(x / big, y / big, 2), area: 900 * big * big, jit: 12 }, r);
  };

  P.clouds = (ctx, list, o, r) => {
    list.forEach(cl => {
      const k = 6 + (r() * 5 | 0), puffs = [];
      for (let i = 0; i < k; i++) { const t = i / (k - 1) - .5; puffs.push({ x: cl.x + t * cl.s * 2.2 + (r() - .5) * cl.s * .3, y: cl.y - Math.cos(t * Math.PI) * cl.s * .45 * (0.6 + r() * .6), r: cl.s * (0.35 + r() * .35) * (1 - Math.abs(t) * .55) }); }
      const pad = cl.s * 1.6, ox = cl.x - pad, oy = cl.y - pad, sz = Math.ceil(pad * 2);
      const oc = document.createElement('canvas'); oc.width = oc.height = Math.max(4, sz); const c2 = oc.getContext('2d');
      c2.translate(-ox, -oy);
      c2.fillStyle = o.base || o.shadow; c2.globalAlpha = .6; c2.beginPath(); c2.ellipse(cl.x, cl.y + cl.s * .16, cl.s * 1.15, cl.s * .17, 0, 0, 7); c2.fill(); c2.globalAlpha = 1;
      puffs.forEach(p => { const g = c2.createRadialGradient(p.x - p.r * .35, p.y - p.r * .45, p.r * .1, p.x, p.y, p.r); g.addColorStop(0, o.light); g.addColorStop(.55, o.mid || o.light); g.addColorStop(1, o.shadow); c2.fillStyle = g; c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, 7); c2.fill(); });
      ctx.save(); ctx.filter = `blur(${Math.max(1.5, cl.s * .04).toFixed(1)}px)`; ctx.drawImage(oc, ox, oy); ctx.restore();
    });
  };
  const randClouds = (w, h, n, y0, y1, s0, s1, r, x0 = -.05, x1 = 1.05) => Array.from({ length: n }, () => ({ x: lerp(x0, x1, r()) * w, y: lerp(y0, y1, r()) * h, s: lerp(s0, s1, r()) * Math.min(w, 1600) }));

  P.sky = (cv, o) => {
    const k = o.k ?? .6, br = cv.getBoundingClientRect(); P._k = k;
    const { ctx, w, h } = P.setup(cv, (o.w || br.width) * k, (o.h || br.height) * k); const r = P.rng(o.seed || 7);
    ctx.fillStyle = P.linear(ctx, o.stops, 0, 0, 0, h); ctx.fillRect(0, 0, w, h);
    if (o.clouds) P.clouds(ctx, randClouds(w, h, o.clouds, o.cy0 ?? .05, o.cy1 ?? .6, o.cs0 ?? .05, o.cs1 ?? .12, r, o.cx0, o.cx1), { light: o.light || '#F6F1E7', mid: o.mid || '#F1E3D3', shadow: o.shadow || '#E7C9B0', base: o.base }, r);
    if (o.after) o.after(ctx, w, h, r);
    finish(ctx, w, h, r, (o.big || 1) * k);
    if (o.post) o.post(ctx, w, h, r);
    return { ctx, w, h };
  };

  P.sea = (ctx, w, y0, y1, o, r) => {
    ctx.fillStyle = P.linear(ctx, [[0, o.far], [1, o.near]], 0, y0, 0, y1); ctx.fillRect(0, y0, w, y1 - y0);
    const n = w * (y1 - y0) / 70;
    const K = P._k || 1;
    for (let i = 0; i < n; i++) { const x = r() * w, y = lerp(y0, y1, r()), t = (y - y0) / (y1 - y0 || 1); P.stroke(ctx, x, y, (r() - .5) * .08, (4 + t * 34 * r()) * K, (1 + t * 3.5) * K, hex(r() < .22 ? o.foam : o.mid), .25 + r() * .45, 0); }
  };
  P.board = (ctx, w, h, o) => {
    const hy = o.hy, vx = o.vx ?? w / 2, f = o.f ?? h * .9, cam = 1;
    const pr = (X, Z) => [vx + f * X / Z, hy + f * cam / Z];
    const cols = o.cols || 20, z0 = o.z0 || .8, rows = o.rows || 12, t = o.tile || .5;
    for (let j = 0; j < rows; j++) for (let i = -cols / 2; i < cols / 2; i++) {
      const Za = z0 + j * t, Zb = z0 + (j + 1) * t, a = pr(i * t, Za), b = pr((i + 1) * t, Za), c = pr((i + 1) * t, Zb), d = pr(i * t, Zb);
      let col = ((i + j) & 1) ? hex(o.brick || '#8C4A32') : hex(o.cream || '#E9DDC3');
      col = mixC(col, hex(o.haze || '#B9CBD8'), Math.min(1, j / rows) * .3);
      ctx.fillStyle = rgba(col, 1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    }
    return pr(0, z0 + rows * t)[1];
  };

  /* scene plates */
  P.boardScene = (cv, o) => P.sky(cv, {
    seed: o.seed, w: o.w, h: o.h, stops: o.stops || [[0, '#5F93D3'], [.45, '#A7C4E6'], [.62, '#D9E4EC'], [1, '#D9E4EC']],
    clouds: o.clouds ?? 6, cy0: .12, cy1: (o.hy ?? .56) - .1, cs0: .04, cs1: .1,
    after: (ctx, w, h, r) => {
      const hy = h * (o.hy ?? .56);
      P.sea(ctx, w, hy, h, { far: '#27606C', near: '#3B8290', mid: '#5FA2AA', foam: '#EEF1EC' }, r);
      ctx.fillStyle = 'rgba(243,238,228,.55)'; ctx.fillRect(0, hy - 1, w, 2);
      P.board(ctx, w, h, { hy, vx: w * (o.vx ?? .5), f: h * (o.f ?? .55), z0: o.z0 ?? .9, rows: o.rows ?? 14, tile: o.tile ?? .42, cols: 40 });
    },
  });

  P.eyeGeom = (w, h) => {
    const cx = w * .5, cy = h * .56, ew = w * .44, eh = h * .2, L = [cx - ew / 2, cy], R = [cx + ew / 2, cy - eh * .12];
    const up = [L, [cx - ew * .2, cy - eh * 1.15], [cx + ew * .28, cy - eh * 1.1], R];
    const upper = `M${L[0]} ${L[1]} C${up[1][0]} ${up[1][1]} ${up[2][0]} ${up[2][1]} ${R[0]} ${R[1]}`;
    const path = upper + ` C${cx + ew * .22} ${cy + eh * .8} ${cx - ew * .25} ${cy + eh * .75} ${L[0]} ${L[1]} Z`;
    return { cx, cy, ew, eh, up, upper, path };
  };
  const bez = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
  const skin = (ctx, w, h, E) => {
    const g = ctx.createRadialGradient(w * .42, h * .38, 10, w * .5, h * .5, Math.max(w, h) * .75);
    g.addColorStop(0, '#F2D3B6'); g.addColorStop(.5, '#DDAE8F'); g.addColorStop(1, '#8A5842');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.filter = 'blur(20px)'; ctx.fillStyle = 'rgba(125,72,56,.5)'; ctx.beginPath(); ctx.ellipse(E.cx, E.cy - E.eh * .25, E.ew * .78, E.eh * 1.4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(250,226,204,.55)'; ctx.beginPath(); ctx.ellipse(E.cx + E.ew * .1, E.cy + E.eh * 1.6, E.ew * .7, E.eh * .6, 0, 0, 7); ctx.fill(); ctx.restore();
  };
  P.face = (cv, w, h) => {
    const { ctx } = P.setup(cv, w, h); const r = P.rng(11), E = P.eyeGeom(w, h);
    skin(ctx, w, h, E);
    for (let i = 0; i < 320; i++) { const t = r(); const x = lerp(E.cx - E.ew * .8, E.cx + E.ew * .82, t); const y = E.cy - E.eh * 2 - Math.sin(t * Math.PI) * E.eh * .6 + (r() - .5) * E.eh * .4; P.stroke(ctx, x, y, -.35 + t * .55 + (r() - .5) * .3, 10 + r() * 18, 1.5 + r() * 2.5, hex(r() < .5 ? '#4A2E22' : '#6B4331'), .5 + r() * .4, (r() - .5) * .3); }
    ctx.strokeStyle = 'rgba(112,60,44,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(E.cx - E.ew * .52, E.cy - E.eh * .2); ctx.bezierCurveTo(E.cx - E.ew * .25, E.cy - E.eh * 1.6, E.cx + E.ew * .3, E.cy - E.eh * 1.55, E.cx + E.ew * .56, E.cy - E.eh * .35); ctx.stroke();
    const around = (x, y) => Math.atan2(y - E.cy, x - E.cx) + Math.PI / 2;
    P.overpaint(ctx, w, h, { len: [10, 34], wid: [4, 10], a: [.4, .75], ang: around, area: 240, jit: 9 }, r);
    P.overpaint(ctx, w, h, { len: [4, 12], wid: [1.5, 3], a: [.3, .6], ang: around, area: 650, jit: 14 }, r);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fill(new Path2D(E.path)); ctx.restore();
    ctx.strokeStyle = 'rgba(64,30,24,.85)'; ctx.lineWidth = 5; ctx.stroke(new Path2D(E.upper));
    for (let t = 0.04; t < .98; t += .028) { const p = bez(E.up, t); const a = -Math.PI / 2 + (t - .45) * 1.4; P.stroke(ctx, p[0], p[1], a, 9 + Math.sin(t * Math.PI) * 10, 1.6, [30, 20, 18], .85, (t - .5) * .5); }
    return E;
  };
  P.eyeball = (cv, w, h) => {
    const { ctx } = P.setup(cv, w, h); const r = P.rng(5), E = P.eyeGeom(w, h);
    const g = ctx.createRadialGradient(E.cx, E.cy, E.eh * .3, E.cx, E.cy, E.ew * .6); g.addColorStop(0, '#F6F1E8'); g.addColorStop(.7, '#E4D8CC'); g.addColorStop(1, '#B89A8E');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const ir = E.eh * .72;
    for (let i = 0; i < 900; i++) { const a = r() * Math.PI * 2, d = ir * (.3 + r() * .7); const c = hex(['#2F6F7A', '#3E78C4', '#1F4A5A', '#6C8F7A', '#8A6A3A'][(r() * 5) | 0]); P.stroke(ctx, E.cx + Math.cos(a) * ir * .3, E.cy + Math.sin(a) * ir * .3, a, d * .75, 1.4 + r() * 2.2, c, .55 + r() * .4, (r() - .5) * .1); }
    ctx.strokeStyle = 'rgba(16,24,30,.9)'; ctx.lineWidth = ir * .14; ctx.beginPath(); ctx.arc(E.cx, E.cy, ir, 0, 7); ctx.stroke();
    ctx.fillStyle = '#0E1014'; ctx.beginPath(); ctx.arc(E.cx, E.cy, ir * .4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,253,246,.95)'; ctx.beginPath(); ctx.ellipse(E.cx - ir * .35, E.cy - ir * .38, ir * .16, ir * .11, -.5, 0, 7); ctx.fill();
    P.overpaint(ctx, w, h, { len: [3, 9], wid: [1, 2.5], a: [.25, .5], ang: (x, y) => Math.atan2(y - E.cy, x - E.cx), area: 500, jit: 10 }, r);
    return E;
  };
  P.lid = (cv, w, h) => {
    const { ctx } = P.setup(cv, w, h); const r = P.rng(9), E = P.eyeGeom(w, h);
    const yb = E.cy + E.eh * .78;
    ctx.fillStyle = P.linear(ctx, [[0, '#DDAE8F'], [1, '#C98F72']], 0, 0, 0, yb); ctx.fillRect(0, 0, w, yb);
    P.overpaint(ctx, w, h, { len: [8, 24], wid: [3, 8], a: [.4, .7], ang: () => 0.1, area: 260, jit: 10 }, r);
    ctx.strokeStyle = 'rgba(64,30,24,.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(E.cx - E.ew * .5, yb - 4); ctx.quadraticCurveTo(E.cx, yb + 8, E.cx + E.ew * .5, yb - 8); ctx.stroke();
    for (let t = .05; t < .96; t += .03) { const x = lerp(E.cx - E.ew * .48, E.cx + E.ew * .48, t); P.stroke(ctx, x, yb + Math.sin(t * Math.PI) * 5, Math.PI / 2 + (t - .5) * .8, 10, 1.5, [30, 20, 18], .85, .2); }
  };

  const finger = (ctx, x, y0, y1, wd, r) => {
    ctx.save(); ctx.filter = 'blur(6px)'; ctx.fillStyle = 'rgba(20,30,60,.35)'; ctx.beginPath(); ctx.ellipse(x + 6, y1 + 6, wd * .55, 9, 0, 0, 7); ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(x - wd / 2, 0, x + wd / 2, 0); g.addColorStop(0, '#A8755C'); g.addColorStop(.45, '#EBC6A6'); g.addColorStop(1, '#B98468');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - wd / 2, y0, wd, y1 - y0, [wd * .3, wd * .3, wd * .5, wd * .5]); ctx.fill();
    ctx.strokeStyle = 'rgba(120,70,52,.55)'; ctx.lineWidth = 2;
    [.42, .7].forEach(k => { const y = lerp(y0, y1, k); ctx.beginPath(); ctx.moveTo(x - wd * .32, y); ctx.quadraticCurveTo(x, y + 4, x + wd * .32, y - 1); ctx.stroke(); });
    ctx.fillStyle = '#F0D6C8'; ctx.beginPath(); ctx.roundRect(x - wd * .3, y1 - wd * .72, wd * .6, wd * .6, wd * .28); ctx.fill();
    ctx.fillStyle = 'rgba(255,250,244,.7)'; ctx.fillRect(x - wd * .15, y1 - wd * .62, wd * .1, wd * .3);
  };
  P.hand = (cv) => {
    const { ctx, w, h } = P.setup(cv, 280, 180); const r = P.rng(21);
    [[46, 128, 34], [98, 146, 37], [152, 142, 36], [204, 120, 32]].forEach(([x, t, wd]) => finger(ctx, x, -20, t, wd, r));
    P.overpaint(ctx, w, h, { len: [6, 18], wid: [2, 6], a: [.35, .65], ang: () => Math.PI / 2, area: 120, jit: 12 }, r);
  };
  P.reach = (cv) => {
    const { ctx, w, h } = P.setup(cv, 340, 260); const r = P.rng(33);
    const g = ctx.createLinearGradient(w, 0, w * .4, h * .6); g.addColorStop(0, '#8A5842'); g.addColorStop(1, '#E4B999');
    ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineWidth = 74; ctx.beginPath(); ctx.moveTo(w + 30, -20); ctx.quadraticCurveTo(w * .7, h * .3, w * .45, h * .52); ctx.stroke();
    ctx.fillStyle = '#E2B494'; ctx.beginPath(); ctx.ellipse(w * .4, h * .58, 58, 44, -.6, 0, 7); ctx.fill();
    [[.22, .66, -.9], [.26, .76, -1.1], [.33, .82, -1.3]].forEach(([fx, fy, a]) => { ctx.save(); ctx.translate(w * fx + 30, h * fy - 10); ctx.rotate(a); const gg = ctx.createLinearGradient(0, -14, 0, 14); gg.addColorStop(0, '#B8836A'); gg.addColorStop(.5, '#EFCBAC'); gg.addColorStop(1, '#B07A60'); ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(-64, -14, 70, 28, 14); ctx.fill(); ctx.restore(); });
    P.overpaint(ctx, w, h, { len: [8, 22], wid: [3, 8], a: [.35, .65], ang: () => -0.8, area: 160, jit: 12 }, r);
  };
  P.thumb = (cv) => {
    const { ctx, w, h } = P.setup(cv, 90, 60); const r = P.rng(4);
    ctx.save(); ctx.filter = 'blur(4px)'; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(40, 40, 30, 10, -.3, 0, 7); ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(0, 10, 0, 44); g.addColorStop(0, '#EFCBAC'); g.addColorStop(1, '#B07A60');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(8, 12, 80, 30, 15); ctx.fill();
    ctx.fillStyle = '#F2D9CB'; ctx.beginPath(); ctx.roundRect(12, 16, 22, 20, 9); ctx.fill();
    P.overpaint(ctx, w, h, { len: [4, 10], wid: [2, 4], a: [.3, .6], ang: () => 0, area: 60, jit: 10 }, r);
  };

  P.night = (cv, o = {}) => P.sky(cv, {
    seed: 41, stops: [[0, '#0C1224'], [.6, '#16223E'], [1, '#22304F']], clouds: 5, cy0: .55, cy1: .95, light: '#3A4666', mid: '#2A3554', shadow: '#1A2440', base: '#141C33',
    post: (ctx, w, h, r) => {
      const K = P._k || 1, n = Math.round(w * h / (9000 * K * K));
      for (let i = 0; i < n; i++) {
        const x = r() * w, y = r() * h * .85, s = (r() < .12 ? 2.4 : 1) * K;
        P.stroke(ctx, x + 1.5, y + 1.5, r() * 3, (3 + r() * 6) * s, (2.5 + r() * 3) * s, [5, 8, 20], .35, .2);
        P.stroke(ctx, x, y, r() * 3, (3 + r() * 6) * s, (2.5 + r() * 3) * s, [246, 242, 232], .95, .2);
        if (s > 1) { P.stroke(ctx, x - 8, y, 0, 16, 1.5, [246, 242, 232], .8, 0); P.stroke(ctx, x, y - 8, Math.PI / 2, 16, 1.5, [246, 242, 232], .8, 0); }
      }
    },
  });
  P.moon = (cv) => {
    const { ctx, w, h } = P.setup(cv); const r = P.rng(8);
    const R = Math.min(w, h) * .42, cx = w / 2, cy = h / 2;
    const g = ctx.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R); g.addColorStop(0, '#FBF3DE'); g.addColorStop(1, '#E3CFA6');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    P.overpaint(ctx, w, h, { len: [5, 14], wid: [2, 5], a: [.4, .7], ang: (x, y) => Math.atan2(y - cy, x - cx) + 1.6, area: 60, jit: 12 }, r);
    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(cx + R * .45, cy - R * .2, R * .9, 0, 7); ctx.fill();
  };

  P.mini = (cv, kind) => {
    const r = P.rng(kind.length * 13);
    if (kind === 'land') return P.sky(cv, { seed: 3, stops: [[0, '#7FAEE0'], [1, '#F3E1C4']], clouds: 2, cy0: .1, cy1: .3, cs0: .1, cs1: .16, after: (ctx, w, h) => {
      ctx.fillStyle = '#F7E3B0'; ctx.beginPath(); ctx.arc(w * .72, h * .28, w * .08, 0, 7); ctx.fill();
      [['#6E8F5A', .62, .9], ['#4F7A55', .72, 1.1], ['#B99A5A', .84, 1.3]].forEach(([c, y, s]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(w * (.3 + r() * .4), h * (y + .25), w * s * .6, h * .3, 0, 0, 7); ctx.fill(); });
    } });
    if (kind === 'sea') return P.sky(cv, { seed: 4, stops: [[0, '#9CC0E6'], [.35, '#D7E4EE'], [.36, '#2F6F7A'], [1, '#3F8894']], after: (ctx, w, h, rr) => P.sea(ctx, w, h * .36, h, { far: '#27606C', near: '#3F8894', mid: '#6FAFB5', foam: '#F3EEE4' }, rr) });
    if (kind === 'sky') return P.sky(cv, { seed: 5, stops: [[0, '#4F86CC'], [1, '#B9D0EA']], clouds: 3, cy0: .3, cy1: .9, cs0: .12, cs1: .2 });
    if (kind === 'city') return P.sky(cv, { seed: 6, stops: [[0, '#3E5E9A'], [.7, '#E7B48E'], [1, '#F3E1C9']], clouds: 3, cy0: .6, cy1: 1, cs0: .14, cs1: .22 });
  };

  P.painting = (cv, v) => {
    const r0 = P.rng(50 + v);
    const skies = [[[0, '#3D6FB6'], [.6, '#C7D6E6'], [1, '#EBD8C0']], [[0, '#2C4E86'], [.55, '#8FA9CF'], [1, '#E6C6A6']], [[0, '#5D8FCF'], [1, '#E3E9EE']], [[0, '#1E2A4E'], [.6, '#5C5A7E'], [1, '#D89A76']]];
    return P.sky(cv, {
      seed: 60 + v, k: .8, stops: skies[v], clouds: v === 3 ? 2 : 5, cy0: .08, cy1: .45, cs0: .05, cs1: .1,
      after: (ctx, w, h, r) => {
        const hy = h * .64;
        P.sea(ctx, w, hy, h, { far: '#27606C', near: '#3B8290', mid: '#5FA2AA', foam: '#EEF1EC' }, r);
        ctx.fillStyle = P.linear(ctx, [[0, '#E3CFA6'], [1, '#C9A77A']], 0, h * .8, 0, h); ctx.fillRect(0, h * .8, w, h * .2);
        const sh = (x, y, len, hgt) => { ctx.fillStyle = 'rgba(40,30,30,.35)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + hgt * .2); ctx.lineTo(x + len, y + hgt * .2 + 8); ctx.lineTo(x, y + 8); ctx.fill(); };
        if (v === 0) { const x = w * .38, y = h * .86, aw = w * .2, ah = h * .5; sh(x, y, w * .45, 20); ctx.fillStyle = P.linear(ctx, [[0, '#F1E6D2'], [1, '#B9A585']], x, 0, x + aw, 0); ctx.fillRect(x, y - ah, aw, ah); ctx.beginPath(); ctx.arc(x + aw / 2, y - ah, aw / 2, Math.PI, 0); ctx.fill(); ctx.fillStyle = P.linear(ctx, [[0, '#7FA6D8'], [1, '#E9E2D6']], 0, y - ah, 0, y); ctx.fillRect(x + aw * .28, y - ah * .75, aw * .44, ah * .75); ctx.beginPath(); ctx.arc(x + aw / 2, y - ah * .75, aw * .22, Math.PI, 0); ctx.fill(); }
        if (v === 1) { const cx = w * .5, cy = h * .36, s = w * .16; ctx.fillStyle = P.linear(ctx, [[0, '#A89A86'], [1, '#5E5244']], 0, cy - s * .3, 0, cy + s); ctx.beginPath(); ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s * 1.1, cy - s * .05); ctx.lineTo(cx + s * .5, cy + s * .7); ctx.lineTo(cx + s * .1, cy + s * 1.05); ctx.lineTo(cx - s * .6, cy + s * .5); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#E9DDC3'; ctx.fillRect(cx - s * .25, cy - s * .45, s * .4, s * .45); ctx.fillStyle = '#8C4A32'; ctx.beginPath(); ctx.moveTo(cx - s * .3, cy - s * .45); ctx.lineTo(cx - s * .05, cy - s * .7); ctx.lineTo(cx + s * .2, cy - s * .45); ctx.fill(); ctx.fillStyle = 'rgba(20,40,50,.3)'; ctx.beginPath(); ctx.ellipse(cx + s * .2, h * .74, s * .8, 8, 0, 0, 7); ctx.fill(); }
        if (v === 2) { const cx = w * .5, by = h * .88, jw = w * .26, jh = h * .5; sh(cx + jw / 2, by, w * .3, 14); ctx.save(); ctx.beginPath(); ctx.moveTo(cx - jw / 2, by); ctx.lineTo(cx - jw / 2, by - jh * .7); ctx.quadraticCurveTo(cx - jw / 2, by - jh, cx, by - jh); ctx.quadraticCurveTo(cx + jw / 2, by - jh, cx + jw / 2, by - jh * .7); ctx.lineTo(cx + jw / 2, by); ctx.closePath(); ctx.clip(); P.sea(ctx, w, by - jh * .45, by, { far: '#2F6F7A', near: '#1F4F5A', mid: '#6FAFB5', foam: '#F3EEE4' }, r); ctx.restore(); ctx.strokeStyle = 'rgba(246,242,232,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - jw / 2, by); ctx.lineTo(cx - jw / 2, by - jh * .7); ctx.quadraticCurveTo(cx - jw / 2, by - jh, cx, by - jh); ctx.quadraticCurveTo(cx + jw / 2, by - jh, cx + jw / 2, by - jh * .7); ctx.lineTo(cx + jw / 2, by); ctx.stroke(); }
        if (v === 3) { for (let i = 0; i < 7; i++) { const x = w * (.2 + i * .08), y = h * (.9 - i * .085); ctx.fillStyle = P.linear(ctx, [[0, '#F1E6D2'], [1, '#B9A585']], 0, y, 0, y + 14); ctx.fillRect(x, y, w * .1, 14); } ctx.fillStyle = '#F3E6C8'; ctx.beginPath(); ctx.arc(w * .82, h * .22, w * .07, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = '#1E2A4E'; ctx.beginPath(); ctx.arc(w * .85, h * .2, w * .065, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
      },
    });
  };

  /* tears */
  P.ragged = (cx, cy, rx, ry, seed, n = 120, amp = .07) => {
    const r = P.rng(seed), pts = []; let d = 0;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; d = d * .72 + (r() - .5) * amp * 1.5; const sp = r() < .07 ? (r() - .3) * amp * 2.4 : 0; const k = 1 + d + sp + (r() - .5) * amp * .45; pts.push([Math.cos(a) * k, Math.sin(a) * k]); }
    const off = pts.map(() => 3 + r() * 11);
    return { pts, off, at: (cx2, cy2, rx2, ry2, grow = 0) => pts.map(([x, y], i) => { const l = Math.hypot(x * rx2, y * ry2) || 1; return [cx2 + x * rx2 + (x * rx2 / l) * off[i] * grow, cy2 + y * ry2 + (y * ry2 / l) * off[i] * grow]; }) };
  };
  P.toPath = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
  P.tornTop = (seed, depth = 28, n = 90) => {
    const r = P.rng(seed); let y = depth / 2; const top = [], rim = [];
    for (let i = 0; i <= n; i++) { y = Math.max(2, Math.min(depth - 2, y + (r() - .5) * depth * .5)); const x = (i / n * 100).toFixed(2); top.push([x, y]); rim.push([x, y + 3 + r() * 8]); }
    return { clip: 'polygon(' + top.map(([x, y]) => `${x}% ${y.toFixed(1)}px`).join(',') + ',100% 100%,0% 100%)', rim: 'polygon(' + top.map(([x, y]) => `${x}% ${(y - 1).toFixed(1)}px`).join(',') + ',' + rim.reverse().map(([x, y]) => `${x}% ${y.toFixed(1)}px`).join(',') + ')' };
  };
  P.tornLine = (seed, n = 60, amp = 14) => { const r = P.rng(seed); let x = 0; return Array.from({ length: n + 1 }, (_, i) => { x = Math.max(-amp, Math.min(amp, x + (r() - .5) * amp)); return [x, i / n * 100]; }); };

  window.Painter = P;
})();
