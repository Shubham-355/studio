/* Painted eye, hand and torn-paper edge for the v5 hero. Extends window.Painter. */
(function () {
  const P = window.Painter; if (!P || P.eye6) return; P.eye6 = true;
  P.eyeGeom = (w, h) => {
    const cx = w * .5, cy = h * .56, ew = w * .44, eh = h * .2, L = [cx - ew / 2, cy], R = [cx + ew / 2, cy - eh * .12];
    const up = [L, [cx - ew * .2, cy - eh * .98], [cx + ew * .28, cy - eh * .94], R];
    const upper = `M${L[0]} ${L[1]} C${up[1][0]} ${up[1][1]} ${up[2][0]} ${up[2][1]} ${R[0]} ${R[1]}`;
    const path = upper + ` C${cx + ew * .22} ${cy + eh * .86} ${cx - ew * .25} ${cy + eh * .82} ${L[0]} ${L[1]} Z`;
    return { cx, cy, ew, eh, up, upper, path };
  };
  const rgba = P.rgba, rng = P.rng, TAU = Math.PI * 2;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a, b) => Math.max(a, Math.min(b, x));
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const G = (u, v, cu, cv, su, sv) => Math.exp(-((u - cu) ** 2 / (2 * su * su) + (v - cv) ** 2 / (2 * sv * sv)));
  const hash = (i, j, s) => { const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return x - Math.floor(x); };
  const vn = (x, y, s) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hash(i, j, s), hash(i + 1, j, s), u), lerp(hash(i, j + 1, s), hash(i + 1, j + 1, s), u), v); };
  const fbm = (x, y, s) => vn(x, y, s) * .55 + vn(x * 2.1, y * 2.1, s + 1) * .3 + vn(x * 4.3, y * 4.3, s + 2) * .15;

  const hi = (cv, w, h, K, rf = true) => {
    K = Math.min(K, 4096 / w, 4096 / h);
    cv.width = Math.max(2, Math.round(w * K)); cv.height = Math.max(2, Math.round(h * K));
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const ctx = cv.getContext('2d', rf ? { willReadFrequently: true } : undefined);
    ctx.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0); ctx.clearRect(0, 0, w, h);
    return { ctx, K: cv.width / w };
  };
  const blob = (ctx, x, y, rx, ry, rot, c, a, hard = 0) => {
    if (!(rx > 0 && ry > 0)) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(hard, rgba(c, a)); g.addColorStop(hard + (1 - hard) * .5, rgba(c, a * .42)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
  };
  const hair = (ctx, x, y, a0, a1, len, w0, c, a, c2) => {
    const N = 10, Lp = [], Rp = []; let px = x, py = y, ang = a0; const st = len / N;
    for (let i = 0; i <= N; i++) {
      const t = i / N, w = w0 * Math.pow(1 - t, .8) * .5 + .05, nx = -Math.sin(ang), ny = Math.cos(ang);
      Lp.push([px + nx * w, py + ny * w]); Rp.push([px - nx * w, py - ny * w]);
      ang = a0 + (a1 - a0) * Math.pow((i + 1) / N, 1.5); px += Math.cos(ang) * st; py += Math.sin(ang) * st;
    }
    const g = ctx.createLinearGradient(x, y, px, py); g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c2 || c, a * .5));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(Lp[0][0], Lp[0][1]); Lp.forEach(p => ctx.lineTo(p[0], p[1]));
    for (let i = Rp.length - 1; i >= 0; i--) ctx.lineTo(Rp[i][0], Rp[i][1]); ctx.closePath(); ctx.fill();
  };
  const texture = (ctx, r, o) => {
    const cv = ctx.canvas, W = cv.width, H = cv.height, K = o.K, img = ctx.getImageData(0, 0, W, H).data;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineCap = 'round';
    for (let i = 0; i < o.n; i++) {
      const x = r() * W, y = r() * H, idx = ((y | 0) * W + (x | 0)) * 4; if (img[idx + 3] < 230) continue;
      const l = (r() - .5) * o.jit, tn = o.tint ? o.tint[(r() * o.tint.length) | 0] : [0, 0, 0], c = [img[idx] + l + tn[0] + (r() - .5) * o.jit * .4, img[idx + 1] + l + tn[1] + (r() - .5) * o.jit * .3, img[idx + 2] + l + tn[2] + (r() - .5) * o.jit * .3];
      const ang = o.ang(x / K, y / K) + (r() - .5) * (o.angJ ?? .4), len = lerp(o.len[0], o.len[1], r()) * K, wid = lerp(o.wid[0], o.wid[1], r()) * K;
      const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2, b = (r() - .5) * .5;
      ctx.strokeStyle = rgba(c, lerp(o.a[0], o.a[1], r())); ctx.lineWidth = wid;
      ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.quadraticCurveTo(x - dy * b, y + dx * b, x + dx, y + dy); ctx.stroke();
    }
    ctx.restore();
  };
  const field = (ctx, w, h, fn, step) => {
    const cw = Math.ceil(w / step) + 1, ch = Math.ceil(h / step) + 1, oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
    const c2 = oc.getContext('2d'), id = c2.createImageData(cw, ch), d = id.data;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const c = fn(i * step, j * step), k = (j * cw + i) * 4; d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255; }
    c2.putImageData(id, 0, 0); ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(oc, 0, 0, cw * step, ch * step); ctx.restore();
  };
  const bz = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
  const bzPath = (p, dy = 0, dx = 0) => { const q = new Path2D(); q.moveTo(p[0][0] + dx, p[0][1] + dy); q.bezierCurveTo(p[1][0] + dx, p[1][1] + dy, p[2][0] + dx, p[2][1] + dy, p[3][0] + dx, p[3][1] + dy); return q; };
  const subPath = (p, t0, t1, dy = 0) => { const q = new Path2D(); for (let i = 0; i <= 24; i++) { const pt = bz(p, lerp(t0, t1, i / 24)); i ? q.lineTo(pt[0], pt[1] + dy) : q.moveTo(pt[0], pt[1] + dy); } return q; };
  const soft = (ctx, path, layers, c) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; layers.forEach(([w, a]) => { ctx.strokeStyle = rgba(c, a); ctx.lineWidth = w; ctx.stroke(path); }); };
  const lowB = E => [E.up[3], [E.cx + E.ew * .22, E.cy + E.eh * .86], [E.cx - E.ew * .25, E.cy + E.eh * .82], E.up[0]];

  /* skin colour field, u/v normalised to eye width/height; inner corner (nose) on the left */
  const skinAt = (u, v) => {
    let c = [214, 160, 128];
    c = mix(c, [238, 198, 168], G(u, v, .15, -2.5, 1.1, .7) * .75);
    c = mix(c, [242, 204, 174], G(u, v, .3, 2.8, 1.0, 1.0) * .85);
    c = mix(c, [228, 186, 156], G(u, v, 0, -5, 2.5, 1.8) * .6);
    c = mix(c, [158, 96, 74], G(u, v, -.02, -1.25, .64, .3) * .62);
    c = mix(c, [226, 170, 138], G(u, v, .05, -.92, .46, .18) * .55);
    c = mix(c, [148, 104, 104], G(u, v, -.72, -.15, .2, 1.0) * .55);
    c = mix(c, [168, 122, 116], G(u, v, 0, 1.28, .62, .3) * .42);
    c = mix(c, [196, 116, 94], G(u, v, .66, .1, .25, .7) * .32);
    c = mix(c, [128, 80, 64], G(u, v, -1.35, .6, .35, 2.2) * .5);
    c = mix(c, [110, 68, 54], cl((Math.hypot(u * .75, (v - .4) * .38) - 1.5) * .45, 0, .7));
    const m = fbm(u * 5 + 9, v * 2.2 + 9, 3) - .5, m2 = fbm(u * 12 + 3, v * 5 + 3, 9) - .5;
    const Y = c[0] * .3 + c[1] * .55 + c[2] * .15; c = mix(c, [Y, Y, Y], .16);
    return [c[0] + m * 24 + m2 * 10, c[1] + m * 17 + m2 * 8, c[2] + m * 12 + m2 * 8];
  };
  const browY = (E, t) => E.cy - E.eh * (1.8 + Math.sin(Math.min(1, t * 1.2) * Math.PI * .92) * .28 - Math.max(0, t - .8) * 1.1);
  const brow = (ctx, E, ox, oy, r, n, q) => {
    for (let i = 0; i <= 24; i++) { const t = i / 24; blob(ctx, ox + E.cx + E.ew * lerp(-.62, .8, t), oy + browY(E, t) - E.eh * .32, E.ew * .11, E.eh * .42, 0, [96, 62, 44], .13); }
    for (let i = 0; i < n; i++) {
      const t = Math.pow(r(), 1.1), th = E.eh * lerp(.95, .45, t), rr = Math.pow(r(), 1.4);
      const x = ox + E.cx + E.ew * lerp(-.62, .8, t) + (r() - .5) * 6 * q, y = oy + browY(E, t) - rr * th + r() * 3 * q;
      const inner = cl(1 - t / .2, 0, 1), a0 = lerp(lerp(-.8, .12, rr), -1.4, inner) + (r() - .5) * .3, a1 = a0 + .32 + (r() - .5) * .2;
      const col = r() < .6 ? [50, 32, 24] : r() < .7 ? [84, 58, 42] : [126, 92, 68];
      hair(ctx, x, y, a0, a1, E.eh * (.16 + r() * .2) * (1 - t * .3), (1.1 + r() * 1.1) * q, col, .5 + r() * .42, [112, 82, 62]);
    }
  };

  P.skinField6 = (cv, W, H, E, ox, oy) => {
    const { ctx, K } = hi(cv, W, H, .42), r = rng(12), q = E.eh / 100;
    field(ctx, W, H, (x, y) => skinAt((x - ox - E.cx) / E.ew, (y - oy - E.cy) / E.eh), 10);
    const ex = ox + E.cx, ey = oy + E.cy, around = (x, y) => Math.atan2((y - ey) * 2.4, x - ex) + Math.PI / 2;
    texture(ctx, r, { K, n: 4200, len: [18 * q, 60 * q], wid: [7 * q, 18 * q], a: [.22, .45], jit: 9, ang: around, angJ: .5 });
    brow(ctx, E, ox, oy, r, 900, q * 1.6);
    ctx.save(); ctx.translate(ox, oy); ctx.globalCompositeOperation = 'destination-out'; ctx.fill(new Path2D(E.path)); ctx.restore();
  };

  P.face6 = (cv, w, h) => {
    const E = P.eyeGeom(w, h), q = E.eh / 100, { ctx, K } = hi(cv, w, h, cl(2600 / w, 1.5, 3)), r = rng(11), L = E.up[0], R = E.up[3], LB = lowB(E);
    field(ctx, w, h, (x, y) => skinAt((x - E.cx) / E.ew, (y - E.cy) / E.eh), 3);
    const around = (x, y) => Math.atan2((y - E.cy) * 2.4, x - E.cx) + Math.PI / 2;
    texture(ctx, r, { K, n: 5000, len: [16 * q, 44 * q], wid: [5 * q, 12 * q], a: [.25, .5], jit: 12, ang: around, angJ: 1.1, tint: [[14, 2, -8], [-12, -4, 8], [0, 0, 0], [8, 6, 2], [-6, 2, 4]] });
    texture(ctx, r, { K, n: 8000, len: [8 * q, 24 * q], wid: [2.5 * q, 6 * q], a: [.3, .55], jit: 14, ang: around, angJ: 1.0, tint: [[12, 0, -6], [-12, -6, 6], [0, 0, 0]] });
    texture(ctx, r, { K, n: 9000, len: [3 * q, 9 * q], wid: [1 * q, 2.4 * q], a: [.2, .4], jit: 18, ang: around, angJ: .9 });
    for (let i = 0; i < 3200; i++) { const d = r() < .72; ctx.fillStyle = d ? `rgba(116,66,52,${.06 + r() * .08})` : `rgba(252,226,204,${.05 + r() * .07})`; ctx.beginPath(); ctx.arc(r() * w, r() * h, (.5 + r() * .8) * q, 0, TAU); ctx.fill(); }
    blob(ctx, E.cx - E.ew * .08, E.cy - E.eh * 1.02, E.ew * .2, E.eh * .13, 0, [255, 230, 208], .2, .1);
    blob(ctx, E.cx + E.ew * .1, E.cy + E.eh * 2.1, E.ew * .5, E.eh * .5, 0, [252, 222, 196], .18, .1);
    const crease = new Path2D(); crease.moveTo(E.cx - E.ew * .5, E.cy - E.eh * .3);
    crease.bezierCurveTo(E.cx - E.ew * .24, E.cy - E.eh * 1.72, E.cx + E.ew * .3, E.cy - E.eh * 1.68, E.cx + E.ew * .6, E.cy - E.eh * .42);
    soft(ctx, crease, [[18 * q, .05], [9 * q, .08], [4 * q, .13], [1.5 * q, .22]], [100, 54, 42]);
    ctx.save(); ctx.translate(0, 4 * q); soft(ctx, crease, [[7 * q, .08], [2.4 * q, .1]], [246, 208, 180]); ctx.restore();
    ctx.save(); ctx.translate(E.ew * .03, -E.eh * .3); soft(ctx, crease, [[1.1 * q, .09]], [110, 62, 50]); ctx.restore();
    for (let i = 0; i < 7; i++) {
      const a = -.6 + i * .2 + (r() - .5) * .1, d0 = E.ew * (.05 + r() * .05), l = E.ew * (.1 + r() * .14), x0 = R[0] + Math.cos(a) * d0, y0 = R[1] + E.eh * .12 + Math.sin(a) * d0;
      const p = new Path2D(); p.moveTo(x0, y0); p.quadraticCurveTo(x0 + Math.cos(a) * l * .5, y0 + Math.sin(a) * l * .5 + l * .08, x0 + Math.cos(a + .18) * l, y0 + Math.sin(a + .18) * l);
      soft(ctx, p, [[4 * q, .04], [1.2 * q, .09]], [126, 74, 58]); ctx.save(); ctx.translate(0, 2 * q); soft(ctx, p, [[1.6 * q, .08]], [250, 216, 192]); ctx.restore();
    }
    for (let i = 0; i < 3; i++) soft(ctx, subPath(LB, .04 + i * .03, .62 - i * .08, E.eh * (.34 + i * .17)), [[2.4 * q, .04], [.9 * q, .09]], [126, 80, 70]);
    for (let t = .04; t < .97; t += .045) { const p = bz(LB, t); blob(ctx, p[0], p[1] + E.eh * .3, E.ew * .09, E.eh * .22, 0, [108, 70, 70], .075); }
    brow(ctx, E, 0, 0, r, 1800, q);
    soft(ctx, bzPath(LB, 3.2 * q), [[8 * q, .22], [4.5 * q, .32]], [224, 156, 142]);
    soft(ctx, bzPath(LB, 7.5 * q), [[2 * q, .32]], [108, 64, 54]);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fill(new Path2D(E.path)); ctx.restore();
    ctx.save(); ctx.clip(new Path2D(E.path));
    blob(ctx, L[0] + E.ew * .105, L[1] + E.eh * .02, E.ew * .045, E.eh * .5, 0, [206, 138, 130], .45, .2);
    blob(ctx, L[0] + E.ew * .05, L[1] + E.eh * .03, E.ew * .085, E.eh * .38, 0, [204, 134, 124], .75, .15);
    blob(ctx, L[0] + E.ew * .05, L[1] + E.eh * .07, E.ew * .05, E.eh * .2, 0, [228, 150, 140], .7, .25);
    blob(ctx, L[0] + E.ew * .07, L[1] - E.eh * .03, E.ew * .008, E.eh * .025, 0, [255, 248, 242], .7, .3);
    blob(ctx, R[0] - E.ew * .02, R[1] + E.eh * .06, E.ew * .05, E.eh * .3, 0, [150, 88, 84], .45, .2);
    ctx.restore();
    soft(ctx, bzPath(LB, 1.4 * q), [[1.5 * q, .42]], [255, 242, 236]);
    soft(ctx, bzPath(LB, -1.6 * q), [[1.8 * q, .2]], [255, 250, 246]);
    soft(ctx, bzPath(E.up, -1.5 * q), [[10 * q, .14], [5 * q, .32], [2.4 * q, .7]], [54, 32, 26]);
    soft(ctx, bzPath(E.up, 3 * q), [[1.4 * q, .14]], [250, 218, 204]);
    const lash = (t, a0, a1, len, wd, al) => { const p = bz(E.up, cl(t, 0, 1)); hair(ctx, p[0], p[1] - q * .5, a0, a1, len, wd, r() < .5 ? [26, 16, 12] : [44, 28, 22], al, [92, 68, 52]); };
    for (let c = 0; c < 24; c++) {
      const tc = .06 + .9 * Math.pow(c / 23, .8) + (r() - .5) * .02, ba = lerp(-2.0, -.2, tc) + (r() - .5) * .16, cA = ba + (-Math.PI / 2 - ba) * .85 - (tc > .6 ? .2 : 0);
      const ln = E.ew * (.04 + .1 * Math.pow(tc, 1.1)) * (.7 + r() * .6), k = 2 + (r() * 3 | 0) + (tc > .6 ? 1 : 0);
      for (let j = 0; j < k; j++) lash(tc + (r() - .5) * .018, ba + (r() - .5) * .18, cA + (r() - .5) * .05, ln * (.75 + r() * .35), (1.5 + r() * .8) * q, .7 + r() * .25);
    }
    for (let i = 0; i < 20; i++) { const t = .05 + r() * .9, ba = lerp(-2.0, -.2, t) + (r() - .5) * .4; lash(t, ba, ba + (-Math.PI / 2 - ba) * (.3 + r() * .5), E.ew * (.02 + .05 * t) * (.6 + r() * .7), 1.1 * q, .55 + r() * .3); }
    for (let i = 0; i < 30; i++) {
      const t = Math.pow(r(), 1.4) * .86 + .04, p = bz(LB, t), outer = 1 - t, a0 = lerp(2.1, .9, outer) + (r() - .5) * .25;
      hair(ctx, p[0], p[1] + 6 * q, a0, a0 + (outer > .5 ? -.25 : .2), E.ew * (.012 + .035 * outer) * (.6 + r() * .8), (1 + r() * .5) * q, [50, 32, 26], .75, [98, 72, 58]);
    }
    return E;
  };

  P.eyeball6 = (cv, w, h) => {
    const E = P.eyeGeom(w, h), q = E.eh / 100, { ctx, K } = hi(cv, w, h, cl(2400 / w, 1.5, 3)), r = rng(5);
    const g = ctx.createRadialGradient(E.cx, E.cy, E.eh * .5, E.cx, E.cy, E.ew * .62);
    g.addColorStop(0, '#F3ECE1'); g.addColorStop(.45, '#EEE4D7'); g.addColorStop(.75, '#E0D0C3'); g.addColorStop(1, '#C8AEA4');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 44; i++) blob(ctx, E.cx + (r() - .5) * E.ew * 1.3, E.cy + (r() - .5) * E.eh * 1.6, E.ew * (.05 + r() * .1), E.eh * (.1 + r() * .2), r() * 3, r() < .5 ? [236, 214, 188] : [230, 198, 196], .2);
    ctx.lineCap = 'round';
    const vein = (x, y, ang, len, w0, depth) => {
      let px = x, py = y; const N = 22;
      for (let i = 0; i < N; i++) {
        const t = i / N; ang += (r() - .5) * .7; const st = len / N, nx = px + Math.cos(ang) * st, ny = py + Math.sin(ang) * st;
        if (Math.hypot(nx - E.cx, ny - E.cy) < E.eh * .94) break;
        ctx.strokeStyle = rgba([172, 56, 58], .42 * (1 - t) + .04); ctx.lineWidth = Math.max(.22, w0 * (1 - t * .8)) * q;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke(); px = nx; py = ny;
        if (depth < 1 && r() < .1) vein(px, py, ang + (r() < .5 ? .6 : -.6), len * .45 * (1 - t), w0 * .6, depth + 1);
      }
    };
    for (let i = 0; i < 38; i++) { const side = r() < .6 ? -1 : 1; vein(E.cx + side * E.ew * (.5 + r() * .18), E.cy + (r() - .5) * E.eh * 1.2, (side < 0 ? 0 : Math.PI) + (r() - .5) * .9, E.ew * (.1 + r() * .18), .7 + r() * .9, 0); }
    texture(ctx, r, { K, n: 2600, len: [6 * q, 18 * q], wid: [2 * q, 5 * q], a: [.06, .16], jit: 6, ang: (x, y) => Math.atan2(y - E.cy, x - E.cx) + Math.PI / 2 });
    return E;
  };

  P.iris6 = (cv, ir, big) => {
    const S = ir * 2.3, c = S / 2, { ctx } = hi(cv, S, S, (big || 3200) / S, false), r = rng(7);
    const pol = (rad, a) => [c + Math.cos(a) * rad, c + Math.sin(a) * rad];
    const g = ctx.createRadialGradient(c, c, 0, c, c, ir * 1.1);
    [[0, '#0A0B0D'], [.34, '#1C1612'], [.4, '#5E4220'], [.46, '#B07F34'], [.5, '#9C8A4C'], [.6, '#638672'], [.72, '#4E7A8E'], [.84, '#43678A'], [.92, '#304A64'], [.98, '#27394D']].forEach(([t, col]) => g.addColorStop(t / 1.1, col));
    g.addColorStop(1.02 / 1.1, 'rgba(50,62,76,.55)'); g.addColorStop(1, 'rgba(90,100,108,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.lineCap = 'round';
    const fiber = (n, wMin, wMax, aMin, aMax) => {
      for (let i = 0; i < n; i++) {
        const a = r() * TAU, r0 = ir * (.36 + r() * .16), r1 = ir * (.62 + r() * .36), ph = r() * 7, amp = .012 + r() * .032, fr = 6 + r() * 10, light = r() < .55;
        const p0 = pol(r0, a), p1 = pol(r1, a), gr = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]), al = lerp(aMin, aMax, r());
        if (light) { gr.addColorStop(0, rgba([222, 176, 98], al)); gr.addColorStop(.45, rgba([176, 190, 150], al)); gr.addColorStop(1, rgba([150, 184, 198], al * .8)); }
        else { gr.addColorStop(0, rgba([72, 46, 22], al)); gr.addColorStop(.5, rgba([36, 62, 64], al)); gr.addColorStop(1, rgba([24, 40, 56], al)); }
        ctx.strokeStyle = gr; ctx.lineWidth = ir * lerp(wMin, wMax, r()); ctx.beginPath();
        for (let k = 0; k <= 14; k++) { const t = k / 14, p = pol(lerp(r0, r1, t), a + Math.sin(t * fr + ph) * amp); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
        ctx.stroke();
      }
    };
    fiber(2600, .006, .016, .16, .4); fiber(2200, .003, .007, .2, .45);
    const ring = (base, amps, w, col, a) => { ctx.strokeStyle = rgba(col, a); ctx.lineWidth = w; ctx.beginPath(); for (let k = 0; k <= 180; k++) { const an = k / 180 * TAU; let rad = base; amps.forEach(([m, f, p]) => rad += m * Math.sin(f * an + p)); const p = pol(ir * rad, an); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); };
    for (let i = 0; i < 90; i++) { const a = r() * TAU, p = pol(ir * (.4 + r() * .14), a); blob(ctx, p[0], p[1], ir * (.05 + r() * .06), ir * (.02 + r() * .02), a, r() < .6 ? [196, 140, 60] : [150, 100, 40], .22, .1); }
    ring(.53, [[.045, 7, 1], [.02, 17, 2]], ir * .06, [186, 142, 76], .16);
    ring(.53, [[.045, 7, 1], [.02, 17, 2]], ir * .022, [226, 190, 124], .2);
    for (let i = 0; i < 70; i++) { const a = r() * TAU, r0 = ir * (.58 + r() * .1), r1 = ir * (.8 + r() * .14), p0 = pol(r0, a), p1 = pol(r1, a + (r() - .5) * .05); ctx.strokeStyle = rgba([16, 30, 42], .2 + r() * .2); ctx.lineWidth = ir * (.015 + r() * .02); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); }
    ring(.8, [[.012, 11, 3]], ir * .01, [20, 34, 44], .14); ring(.88, [[.01, 13, 5]], ir * .01, [20, 34, 44], .12);
    for (let i = 0; i < 28; i++) { const a = r() * TAU, rad = ir * (.56 + r() * .26), p = pol(rad, a); blob(ctx, p[0], p[1], ir * (.04 + r() * .04), ir * (.016 + r() * .012), a, [18, 30, 40], .42, .3); const p2 = pol(rad, a + .03); blob(ctx, p2[0], p2[1], ir * .03, ir * .01, a, [160, 190, 196], .18, .2); }
    for (let i = 0; i < 30; i++) { const p = pol(ir * (.44 + r() * .42), r() * TAU); blob(ctx, p[0], p[1], ir * (.01 + r() * .02), ir * (.01 + r() * .02), 0, r() < .6 ? [58, 38, 22] : [206, 144, 62], .6, .35); }
    ctx.strokeStyle = 'rgba(22,34,48,.34)'; ctx.lineWidth = ir * .14; ctx.beginPath(); ctx.arc(c, c, ir * .95, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,30,42,.34)'; ctx.lineWidth = ir * .07; ctx.beginPath(); ctx.arc(c, c, ir * .995, 0, TAU); ctx.stroke();
    const d = ctx.createRadialGradient(c, c + ir * .25, 0, c, c + ir * .25, ir * 1.1); d.addColorStop(0, 'rgba(10,18,26,0)'); d.addColorStop(.62, 'rgba(10,18,26,0)'); d.addColorStop(1, 'rgba(10,18,26,.38)');
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, ir * 1.02, 0, TAU); ctx.clip(); ctx.fillStyle = d; ctx.fillRect(0, 0, S, S); ctx.restore();
    blob(ctx, c + ir * .3, c + ir * .4, ir * .36, ir * .24, .5, [238, 198, 120], .2);
    blob(ctx, c - ir * .3, c - ir * .3, ir * .5, ir * .4, 0, [255, 255, 255], .05);
  };

  /* fixed layer: spherical shading, lid shadow, wet corners */
  P.eyeShade6 = (cv, w, h) => {
    const E = P.eyeGeom(w, h), { ctx } = hi(cv, w, h, 2.5, false), L = E.up[0], R = E.up[3], LB = lowB(E);
    ctx.save(); ctx.translate(E.cx + E.ew * .03, E.cy + E.eh * .1); ctx.scale(E.ew * .5, E.eh * 1.02);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(120,86,84,0)'); g.addColorStop(.5, 'rgba(120,86,84,0)'); g.addColorStop(.78, 'rgba(116,80,80,.3)'); g.addColorStop(1, 'rgba(92,58,60,.62)');
    ctx.fillStyle = g; ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    blob(ctx, L[0] + E.ew * .1, L[1] + E.eh * .05, E.ew * .16, E.eh * .75, 0, [214, 128, 118], .32, .1);
    blob(ctx, R[0] - E.ew * .07, R[1] + E.eh * .1, E.ew * .14, E.eh * .6, 0, [206, 124, 116], .26, .1);
    for (let k = 0; k < 18; k++) soft(ctx, bzPath(E.up, E.eh * k * .028), [[E.eh * .07, .05 * (1 - k / 18)]], [60, 70, 96]);
    for (let k = 0; k < 8; k++) soft(ctx, bzPath(LB, -E.eh * k * .018), [[E.eh * .05, .045 * (1 - k / 8)]], [120, 84, 84]);
    blob(ctx, E.cx - E.ew * .3, E.cy - E.eh * .05, E.ew * .1, E.eh * .28, 0, [255, 252, 246], .12);
    blob(ctx, E.cx + E.ew * .28, E.cy + E.eh * .1, E.ew * .08, E.eh * .2, 0, [255, 252, 246], .07);
  };
  /* fixed layer: window highlight + sky reflection (stays with the light) */
  P.eyeGlint6 = (cv, w, h, ir) => {
    const E = P.eyeGeom(w, h), { ctx } = hi(cv, w, h, cl(3000 / w, 2, 4), false), r = rng(14);
    ctx.save(); ctx.beginPath(); ctx.arc(E.cx, E.cy, ir * .97, 0, TAU); ctx.clip();
    const oy = E.cy - ir * .95, band = new Path2D(); band.arc(E.cx, oy, ir * 1.62, 0, TAU); band.arc(E.cx, oy, ir * 1.44, 0, TAU);
    const bg = ctx.createLinearGradient(E.cx - ir, 0, E.cx + ir, 0); bg.addColorStop(0, 'rgba(170,200,236,0)'); bg.addColorStop(.35, 'rgba(176,204,238,.3)'); bg.addColorStop(.7, 'rgba(190,212,240,.24)'); bg.addColorStop(1, 'rgba(170,200,236,0)');
    ctx.fillStyle = bg; ctx.fill(band, 'evenodd');
    for (let i = 0; i < 6; i++) { const a = Math.PI / 2 + (i - 2.5) * .11, rr = ir * (1.52 + (r() - .5) * .06); blob(ctx, E.cx + Math.cos(a) * rr, oy + Math.sin(a) * rr, ir * (.07 + r() * .06), ir * .035, a - Math.PI / 2, [250, 248, 244], .38, .2); }
    ctx.restore();
    const R0 = ir * .43, A0 = -2.35, A1 = -1.2, am = (A0 + A1) / 2;
    for (let k = 0; k <= 26; k++) { const a = lerp(A0, A1, k / 26), e = Math.sin(k / 26 * Math.PI); blob(ctx, E.cx + Math.cos(a) * R0, E.cy + Math.sin(a) * R0, ir * (.1 + .05 * e), ir * (.05 + .04 * e), a + Math.PI / 2, [255, 253, 248], .1 + .12 * e); }
    for (let k = 0; k <= 16; k++) { const a = lerp(A0 + .25, A1 - .2, k / 16), e = Math.sin(k / 16 * Math.PI); blob(ctx, E.cx + Math.cos(a) * R0, E.cy + Math.sin(a) * R0, ir * (.05 + .03 * e), ir * (.025 + .02 * e), a + Math.PI / 2, [255, 255, 252], .18 + .2 * e, .2); }
    blob(ctx, E.cx + Math.cos(am - .12) * R0, E.cy + Math.sin(am - .12) * R0, ir * .045, ir * .032, am + Math.PI / 2, [255, 255, 255], .95, .45);
    if (0) {
    const hx = E.cx - ir * .3, hy = E.cy - ir * .36, hw = ir * .36, hh = ir * .31;
    blob(ctx, hx, hy, hw * 1.3, hh * 1.3, -.15, [255, 255, 255], .16);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-.15); ctx.transform(1, 0, -.08, 1, 0, 0);
    const gap = hw * .1, pw = (hw - gap) / 2, ph = (hh - gap) / 2;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => {
      const x0 = -hw / 2 + i * (pw + gap), y0 = -hh / 2 + j * (ph + gap);
      ctx.fillStyle = 'rgba(255,253,249,.5)'; ctx.beginPath(); ctx.roundRect(x0 - pw * .07, y0 - ph * .07, pw * 1.14, ph * 1.14, pw * .32); ctx.fill();
      ctx.fillStyle = 'rgba(255,254,251,.95)'; ctx.beginPath(); ctx.roundRect(x0, y0, pw, ph, pw * .22); ctx.fill();
      for (let k = 0; k < 5; k++) P.stroke(ctx, x0 + pw * (.15 + r() * .5), y0 + ph * (.2 + r() * .6), (r() - .5) * .6, pw * (.25 + r() * .3), pw * .12, [255, 255, 255], .45, .2);
    });
    ctx.restore(); }
    blob(ctx, E.cx + ir * .44, E.cy + ir * .3, ir * .04, ir * .03, 0, [255, 255, 255], .45, .4);
  };

  P.lid6 = (cv, w, h) => {
    const E = P.eyeGeom(w, h), q = E.eh / 100, { ctx, K } = hi(cv, w, h, 2), r = rng(9), L = E.up[0], R = E.up[3];
    const ED = [[L[0] - E.ew * .06, L[1] + E.eh * .02], [E.cx - E.ew * .25, E.cy + E.eh * .92], [E.cx + E.ew * .22, E.cy + E.eh * .95], [R[0] + E.ew * .06, R[1] + E.eh * .02]];
    const shape = new Path2D(); shape.moveTo(0, 0); shape.lineTo(w, 0); shape.lineTo(w, ED[3][1]); shape.lineTo(ED[3][0], ED[3][1]);
    shape.bezierCurveTo(ED[2][0], ED[2][1], ED[1][0], ED[1][1], ED[0][0], ED[0][1]); shape.lineTo(0, ED[0][1]); shape.closePath();
    ctx.save(); ctx.clip(shape);
    field(ctx, w, h, (x, y) => { const u = (x - E.cx) / E.ew, v = (y - E.cy) / E.eh; return mix(skinAt(u, v - .9), [232, 182, 152], G(u, v, -.05, .2, .45, .55) * .6); }, 4);
    ctx.restore();
    texture(ctx, r, { K, n: 3200, len: [6 * q, 18 * q], wid: [2 * q, 5 * q], a: [.25, .45], jit: 9, ang: () => 0, angJ: .4 });
    ctx.save(); ctx.translate(0, E.eh * .12); soft(ctx, bzPath(ED), [[E.eh * .5, .1], [E.eh * .25, .14]], [60, 40, 40]); ctx.restore();
    soft(ctx, bzPath(ED, -4.5 * q), [[2 * q, .35]], [214, 150, 130]);
    soft(ctx, bzPath(ED, -1 * q), [[6 * q, .5], [3 * q, .9]], [42, 24, 20]);
    for (let c = 0; c < 30; c++) {
      const tc = .04 + .92 * c / 29, a0 = lerp(2.0, .8, tc), a1 = a0 + (tc < .5 ? .3 : -.3), ln = E.ew * (.06 + .06 * tc);
      for (let j = 0; j < 3; j++) { const p = bz(ED, cl(tc + (r() - .5) * .014, 0, 1)); hair(ctx, p[0], p[1], a0 + (r() - .5) * .14, a1, ln * (.8 + r() * .3), 2 * q, [28, 17, 13], .9, [80, 58, 44]); }
    }
  };

  /* hand: shadow layer + four fingers, local frame: paper edge on y=60, +y points out over the sky paper */
  const FING = [{ x: 76, a: .13, tip: 110, w: 39 }, { x: 117, a: .04, tip: 122, w: 43 }, { x: 159, a: -.04, tip: 119, w: 42 }, { x: 198, a: -.12, tip: 104, w: 35 }];
  P.FING6 = FING;
  const fingerPath = F => {
    const tl = F.tip - 60, rt = F.w * .46, yb = tl - rt;
    const hw = y => F.w * (.47 + .05 * Math.exp(-(((y - 3) / 10) ** 2)) - .05 * cl((y - 12) / Math.max(1, tl - 12), 0, 1));
    const ys = []; for (let y = -70; y < yb; y += 3) ys.push(y); ys.push(yb);
    const p = new Path2D(); p.moveTo(-hw(-70), -70); ys.forEach(y => p.lineTo(-hw(y), y));
    p.ellipse(0, yb, hw(yb), rt, 0, Math.PI, 0, true); for (let i = ys.length - 1; i >= 0; i--) p.lineTo(hw(ys[i]), ys[i]); p.closePath();
    return p;
  };
  P.hand6 = (cv, f) => {
    const { ctx, K } = hi(cv, 280, 180, 4), r = rng(21 + (f === 's' ? 9 : +f));
    if (f === 's') {
      blob(ctx, 140, 44, 112, 20, 0, [30, 14, 10], .42, .1);
      FING.forEach(F => { const tl = F.tip - 60; ctx.save(); ctx.translate(F.x, 60); ctx.rotate(F.a);
        blob(ctx, 8, tl * .55 + 5, F.w * .66, tl * .62, 0, [14, 26, 62], .24);
        blob(ctx, 5, tl - 1, F.w * .52, F.w * .34, 0, [10, 20, 50], .46, .25);
        blob(ctx, 3, 5, F.w * .62, 6, 0, [10, 20, 50], .3, .2); ctx.restore(); });
      return;
    }
    const F = FING[+f]; if (!F) return; const tl = F.tip - 60, w = F.w, path = fingerPath(F);
    ctx.translate(F.x, 60); ctx.rotate(F.a);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    [[0, '#7A4838'], [.12, '#AE7358'], [.34, '#E8BA98'], [.5, '#DDA888'], [.74, '#B47A5E'], [.9, '#8C5442'], [1, '#9A624C']].forEach(([t, c]) => g.addColorStop(t, c));
    ctx.fillStyle = g; ctx.fill(path);
    ctx.save(); ctx.clip(path);
    blob(ctx, -w * .08, 3, w * .36, 10, 0, [252, 220, 192], .5, .2);
    blob(ctx, -w * .12, tl * .6, w * .22, tl * .3, 0, [246, 206, 176], .25);
    blob(ctx, w * .38, tl * .45, w * .13, tl * .55, 0, [232, 146, 108], .24);
    blob(ctx, 0, tl - w * .32, w * .46, w * .42, 0, [222, 130, 112], .36);
    ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) { const y = -4 + k * 3.6 + (r() - .5), s = w * (.2 + r() * .1); ctx.strokeStyle = 'rgba(126,76,58,.38)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(-s, y); ctx.quadraticCurveTo(0, y + 2.6, s, y - .6); ctx.stroke(); ctx.strokeStyle = 'rgba(252,224,200,.32)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(-s * .9, y + 1.2); ctx.quadraticCurveTo(0, y + 3.6, s * .9, y + .6); ctx.stroke(); }
    const yd = 16 + (tl - 16) * .18; for (let k = 0; k < 2; k++) { ctx.strokeStyle = 'rgba(130,80,62,.26)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(-w * .26, yd + k * 2.4); ctx.quadraticCurveTo(0, yd + k * 2.4 + 1.8, w * .26, yd + k * 2.4 - .4); ctx.stroke(); }
    const nw = w * .6, ny0 = tl - w * .95, ny1 = tl - w * .1;
    ctx.fillStyle = 'rgba(150,92,76,.35)'; ctx.beginPath(); ctx.roundRect(-nw / 2 - 1.2, ny0 - 1.2, nw + 2.4, ny1 - ny0 + 2, [nw * .38, nw * .38, nw * .5, nw * .5]); ctx.fill();
    const ng = ctx.createLinearGradient(0, ny0, 0, ny1); ng.addColorStop(0, '#EEC9BA'); ng.addColorStop(.6, '#E2B2A2'); ng.addColorStop(.9, '#EBC6B4'); ng.addColorStop(1, '#F6E6DA');
    ctx.fillStyle = ng; ctx.beginPath(); ctx.roundRect(-nw / 2, ny0, nw, ny1 - ny0, [nw * .36, nw * .36, nw * .5, nw * .5]); ctx.fill();
    blob(ctx, 0, ny0 + w * .1, nw * .34, w * .1, 0, [250, 238, 230], .75, .35);
    ctx.strokeStyle = 'rgba(168,108,90,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(0, ny0 + nw * .36, nw * .47, nw * .36, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    blob(ctx, -nw * .18, (ny0 + ny1) / 2, nw * .08, (ny1 - ny0) * .34, 0, [255, 252, 248], .6, .3);
    blob(ctx, nw * .3, (ny0 + ny1) / 2, nw * .12, (ny1 - ny0) * .4, 0, [170, 104, 90], .25);
    const fade = ctx.createLinearGradient(0, -58, 0, 4); fade.addColorStop(0, 'rgba(30,16,11,.9)'); fade.addColorStop(.6, 'rgba(44,24,16,.35)'); fade.addColorStop(1, 'rgba(44,24,16,0)');
    ctx.fillStyle = fade; ctx.fillRect(-w, -80, w * 2, 90);
    ctx.restore();
    texture(ctx, r, { K, n: 1400, len: [2, 6], wid: [.8, 2], a: [.2, .4], jit: 12, ang: () => Math.PI / 2 + F.a, angJ: .5 });
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; const cut = ctx.createLinearGradient(0, -34, 0, -6); cut.addColorStop(0, 'rgba(0,0,0,1)'); cut.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = cut; ctx.fillRect(-w * 2, -120, w * 4, 114); ctx.restore();
  };

  /* torn paper: multi-scale edge with long rips + nibbles, fibres and curls */
  P.ragged6 = (seed, n = 300) => {
    const r = rng(seed), H = [];
    for (let k = 2; k < 9; k++) H.push({ k, a: (r() - .5) * .05 / Math.sqrt(k - 1), p: r() * TAU });
    const rips = []; for (let i = 0; i < 7; i++) { let c = r(); if (c > .32 && c < .47) c += .16; rips.push({ c, w: .012 + r() * .035, a: (r() < .55 ? 1 : -1) * (.05 + r() * .09) }); }
    const pts = [], off = [], fib = []; let d = 0, nib = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n, a = t * TAU; let k = 1;
      H.forEach(h => k += h.a * Math.sin(h.k * a + h.p));
      rips.forEach(rp => { let dd = Math.abs(t - rp.c); dd = Math.min(dd, 1 - dd); const x = dd / rp.w; if (x < 1) k += rp.a * Math.pow(1 - x, 1.6); });
      d = d * .55 + (r() - .5) * .016; k += d;
      if (nib > 0) { nib--; k -= .012; } else if (r() < .04) nib = 1 + (r() * 3 | 0);
      pts.push([Math.cos(a) * k, Math.sin(a) * k]);
      off.push(2.5 + (.5 + .5 * Math.sin(a * 3 + 1.3) * Math.sin(a * 5 + .4)) * 9 + r() * 2.5);
      fib.push(Array.from({ length: 1 + (r() * 3 | 0) }, () => ({ t: r(), l: 1 + r() * 4.5, a: (r() - .5) * 1.4, b: (r() - .5) * 2 })));
    }
    const off2 = off.map((_, i) => (off[(i - 1 + n) % n] + off[i] * 2 + off[(i + 1) % n]) / 4);
    rips.forEach(rp => { const i0 = Math.round(rp.c * n); for (let j = -6; j <= 6; j++) off2[((i0 + j) % n + n) % n] += 5 * (1 - Math.abs(j) / 7); });
    const curls = [.13, .6, .83].map(c => ({ i: Math.round((c + (r() - .5) * .06) * n), m: 5 + (r() * 5 | 0), h: 1.3 + r() * .9 }));
    return { pts, off: off2, fib, curls, at: (cx2, cy2, rx2, ry2, grow = 0) => pts.map(([x, y], i) => { const l = Math.hypot(x * rx2, y * ry2) || 1; return [cx2 + x * rx2 + (x * rx2 / l) * off2[i] * grow, cy2 + y * ry2 + (y * ry2 / l) * off2[i] * grow]; }) };
  };
  const fiberTex = () => {
    const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d'), r = rng(77);
    x.fillStyle = '#F3EEE4'; x.fillRect(0, 0, 192, 192);
    for (let i = 0; i < 900; i++) { const px = r() * 192, py = r() * 192, a = r() * TAU, l = 3 + r() * 14; x.strokeStyle = r() < .5 ? `rgba(190,178,160,${.12 + r() * .2})` : `rgba(255,253,248,${.3 + r() * .4})`; x.lineWidth = .4 + r() * .8; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .5) * l / 2, py + Math.sin(a + .5) * l / 2, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    return c;
  };
  P.tearRim6 = (ctx, inn, out, T, cx, cy, dpr) => {
    const cv = ctx.canvas, n = inn.length; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!T.pat) T.pat = ctx.createPattern(fiberTex(), 'repeat');
    const ring = new Path2D(P.toPath(out) + ' ' + P.toPath(inn));
    ctx.fillStyle = '#F4EFE6'; ctx.fill(ring, 'evenodd'); ctx.fillStyle = T.pat; ctx.fill(ring, 'evenodd');
    ctx.strokeStyle = 'rgba(96,120,160,.3)'; ctx.lineWidth = 1; ctx.stroke(new Path2D(P.toPath(out)));
    ctx.strokeStyle = 'rgba(200,188,170,.45)'; ctx.lineWidth = .8; ctx.stroke(new Path2D(P.toPath(inn)));
    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(250,247,240,.85)'; ctx.lineWidth = .6; ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p = inn[i], q = inn[(i + 1) % n];
      T.fib[i].forEach(f => { const x = lerp(p[0], q[0], f.t), y = lerp(p[1], q[1], f.t), dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx) + f.a; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * f.l * .5 - Math.sin(a) * f.b, y + Math.sin(a) * f.l * .5 + Math.cos(a) * f.b, x + Math.cos(a) * f.l, y + Math.sin(a) * f.l); });
    }
    ctx.stroke();
    T.curls.forEach(cu => {
      const base = [], lift = [];
      for (let j = 0; j <= cu.m; j++) { const k = (cu.i + j) % n, p = inn[k], s = Math.sin(j / cu.m * Math.PI), dx = cx - p[0], dy = cy - p[1], l = Math.hypot(dx, dy) || 1, hh = T.off[k] * cu.h * s; base.push(p); lift.push([p[0] + dx / l * hh, p[1] + dy / l * hh]); }
      const bm = base[cu.m >> 1], lm = lift[cu.m >> 1], gr = ctx.createLinearGradient(bm[0], bm[1], lm[0], lm[1]); gr.addColorStop(0, '#D8CEBE'); gr.addColorStop(1, '#FBF8F1');
      ctx.fillStyle = gr; ctx.beginPath(); base.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let j = lift.length - 1; j >= 0; j--) ctx.lineTo(lift[j][0], lift[j][1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160,148,132,.55)'; ctx.lineWidth = .8; ctx.beginPath(); base.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    });
  };
})();
