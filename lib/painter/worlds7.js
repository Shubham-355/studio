/* worlds7: painted arcade (stone arches, checker floor, light pools), founders + heads at 2x, large thoughts */
(function () {
  const P = window.Painter; if (!P || P.arcade7) return;
  const hex = P.hex, rgba = P.rgba, lerp = (a, b, t) => a + (b - a) * t;
  const lg = (ctx, st, x0, y0, x1, y1) => P.linear(ctx, st, x0, y0, x1, y1);
  const pc = c => c[0] === '#' ? hex(c) : c.match(/[\d.]+/g).slice(0, 3).map(Number);
  const mixL = (c, k) => { const a = pc(c); return rgba(k > 0 ? a.map(x => x + (255 - x) * k) : a.map(x => x * (1 + k)), 1); };
  const path = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
  const smooth = (ctx, pts) => { ctx.beginPath(); const n = pts.length; ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2); for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); } ctx.closePath(); };
  const fine = (ctx, W, H, r, o) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); P.overpaint(ctx, W, H, Object.assign({ len: [5, 14], wid: [1.5, 3.5], a: [.14, .3], ang: () => 0, area: 70, jit: 10, angJ: .5 }, o), r); ctx.restore(); };
  const softLine = (ctx, pts, wd, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.filter = `blur(${(wd * .45).toFixed(1)}px)`; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore(); };

  /* ---------- arcade plate ---------- */
  P.arcade7 = (cv, o) => {
    const CW = cv.offsetWidth, CH = cv.offsetHeight, W = CW / 1.16, H = CH / 1.16, k = Math.min(1.5, devicePixelRatio || 1);
    cv.width = Math.round(CW * k); cv.height = Math.round(CH * k); const ctx = cv.getContext('2d', { willReadFrequently: true }), r = P.rng(707);
    const T = [k, 0, 0, k, .08 * W * k, .08 * H * k]; ctx.setTransform(...T);
    const hy = H * o.hy, F = H * o.F, cx = W / 2, XW = o.xw, TH = .5, WH = 2.5, SPR = 1.45, BAY = 2.1, PIL = .55;
    const pj = (X, Y, z) => [cx + X * F / z, hy + (1 - Y) * F / z];
    const L = -.1 * W, R = 1.1 * W, Tp = -.1 * H, B = 1.1 * H;
    // sky
    ctx.fillStyle = lg(ctx, [[0, '#9C5446'], [.3, '#C9744E'], [.7, '#E39A62'], [1, '#F1C188']], 0, Tp, 0, hy); ctx.fillRect(L, Tp, R - L, hy - Tp + 2);
    const sg = ctx.createRadialGradient(W * .12, hy - H * .06, 0, W * .12, hy - H * .06, W * .5); sg.addColorStop(0, 'rgba(255,236,196,.9)'); sg.addColorStop(.12, 'rgba(255,214,160,.45)'); sg.addColorStop(1, 'rgba(255,214,160,0)'); ctx.fillStyle = sg; ctx.fillRect(L, Tp, R - L, hy - Tp);
    ctx.save(); ctx.scale(1, .5); P.clouds(ctx, [{ x: W * .2, y: H * .2, s: W * .08 }, { x: W * .3, y: H * .26, s: W * .05 }, { x: W * .62, y: H * .12, s: W * .06 }, { x: W * .86, y: H * .32, s: W * .07 }, { x: W * .45, y: H * .42, s: W * .04 }], { light: '#F8DDB4', mid: '#EDB888', shadow: '#B26A58', base: '#A45E52' }, r); ctx.restore();
    // distant dunes
    for (let j = 0; j < 4; j++) { const y0 = hy - H * (.035 - j * .01), A = H * (.025 - j * .004); ctx.fillStyle = ['#D69A6E', '#DCA472', '#E2AE78', '#E6B67E'][j]; ctx.beginPath(); ctx.moveTo(L, hy + 2); for (let x = L; x <= R; x += 8) ctx.lineTo(x, y0 - A * (.5 + .5 * Math.sin(x * .004 * (j + 1) + j * 1.7)) * (.6 + .4 * Math.sin(x * .0011 + j))); ctx.lineTo(R, hy + 2); ctx.closePath(); ctx.fill(); }
    // floor: stone checker, 1 unit tiles
    const Z0 = .35, Z1 = 90;
    ctx.fillStyle = lg(ctx, [[0, '#E2B47C'], [1, '#CC925C']], 0, hy, 0, B); ctx.fillRect(L, hy, R - L, B - hy);
    const zs = []; for (let z = 1; z < Z1; z++) zs.push(z);
    for (let i = 0; i < zs.length - 1 + 1; i++) {
      const za = Math.max(Z0, i === 0 ? Z0 : zs[i - 1]), zb = zs[i]; if (za >= zb) continue;
      for (let X = -Math.ceil(XW); X < Math.ceil(XW); X++) {
        const xa = Math.max(-XW, X), xb = Math.min(XW, X + 1); if (xb <= xa) continue;
        const dark = ((X + zb) & 1) === 0, fade = Math.min(1, zb / 40);
        const base = dark ? hex('#A4523A') : hex('#ECD7B2'), haze = hex('#E9B47C'), c = base.map((v, q) => lerp(v, haze[q], fade * .8));
        const p = [pj(xa, 0, za), pj(xb, 0, za), pj(xb, 0, zb), pj(xa, 0, zb)];
        path(ctx, p); ctx.fillStyle = rgba(c, 1); ctx.fill();
        if (zb < 14) { const g = 1 / zb; ctx.strokeStyle = `rgba(90,52,36,${(.35 * Math.min(1, g * 3)).toFixed(2)})`; ctx.lineWidth = Math.max(.6, 2.4 * g); ctx.stroke();
          const tr = P.rng(X * 97 + zb * 13);
          if (zb < 8) for (let q = 0; q < 3; q++) { const u = tr(), w2 = tr(), a = pj(lerp(xa, xb, u), 0, lerp(za, zb, w2)); ctx.fillStyle = dark ? 'rgba(70,30,24,.25)' : 'rgba(120,90,60,.18)'; ctx.beginPath(); ctx.ellipse(a[0], a[1], 9 * g * (1 + tr()), 3 * g, 0, 0, 7); ctx.fill(); }
          const a0 = pj(xa, 0, za), a1 = pj(xb, 0, za); ctx.strokeStyle = `rgba(255,240,214,${(.25 * Math.min(1, g * 3)).toFixed(2)})`; ctx.lineWidth = Math.max(.5, 1.2 * g); ctx.beginPath(); ctx.moveTo(a0[0], a0[1] - 1.5 * g); ctx.lineTo(a1[0], a1[1] - 1.5 * g); ctx.stroke(); }
      }
    }
    // drifted sand along the walls
    for (const s of [-1, 1]) { ctx.fillStyle = 'rgba(226,176,118,.75)'; ctx.beginPath(); const pts = []; for (let z = Z0; z < 60; z *= 1.08) pts.push(pj(s * (XW - .28 - .1 * Math.sin(z * 1.3)), 0, z)); const out = []; for (let z = Z0; z < 60; z *= 1.08) out.push(pj(s * XW, 0, z)); [...pts, ...out.reverse()].forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.filter = 'blur(3px)'; ctx.fill(); ctx.filter = 'none'; }
    // light: sun low on the left, through the left arches -> floor is in the wall's shadow except arch-shaped pools
    const sun = [1, -.62, -.34], sh = document.createElement('canvas'); sh.width = cv.width; sh.height = cv.height; const sx = sh.getContext('2d'); sx.setTransform(...T);
    const hit = (Y, z) => { const t = Y / -sun[1]; return [-XW + sun[0] * t, z + sun[2] * t]; };
    sx.fillStyle = '#000'; const shPts = []; for (let z = Z0; z < 80; z *= 1.05) shPts.push(pj(-XW, 0, z)); const tops = []; for (let z = Z0; z < 80; z *= 1.05) { const h2 = hit(WH, z); tops.push(pj(Math.min(XW, h2[0]), 0, Math.max(Z0, h2[1]))); }
    sx.beginPath(); [...shPts, ...tops.reverse()].forEach((p, i) => i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1])); sx.closePath(); sx.fill();
    sx.globalCompositeOperation = 'destination-out'; sx.filter = 'blur(2px)';
    const arch = (z0, n = 14) => { const a = z0 + PIL, b = z0 + BAY, m = (a + b) / 2, rr = (b - a) / 2, pts = [[a, 0]]; for (let i = 0; i <= n; i++) { const th = Math.PI - i / n * Math.PI; pts.push([m + Math.cos(th) * rr, SPR + Math.sin(th) * rr * 1.05]); } pts.push([b, 0]); return pts; };
    for (let z0 = -2; z0 < 60; z0 += BAY) { const pts = arch(z0).map(([z, Y]) => { const q = hit(Math.max(.001, Y), z); return pj(Math.min(XW, q[0]), 0, Math.max(Z0, q[1])); }); sx.beginPath(); pts.forEach((p, i) => i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1])); sx.closePath(); sx.fill(); }
    sx.globalCompositeOperation = 'source-over'; sx.filter = 'none';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .5; ctx.globalCompositeOperation = 'multiply';
    const tint = document.createElement('canvas'); tint.width = sh.width; tint.height = sh.height; const tx = tint.getContext('2d'); tx.drawImage(sh, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = '#5A3446'; tx.fillRect(0, 0, tint.width, tint.height);
    ctx.drawImage(tint, 0, 0); ctx.restore();
    // walls: back to front, both sides
    const bays = []; for (let z0 = 58; z0 >= -2.2; z0 -= BAY) bays.push(z0);
    const stone = (s, face, z) => { const fade = Math.min(1, z / 45), base = hex(s < 0 ? (face ? '#7A3E36' : '#C97C4E') : (face ? '#E7A26A' : '#B5603E')), hz = hex('#E3A472'); return rgba(base.map((v, q) => lerp(v, hz[q], fade * .75)), 1); };
    for (const s of [-1, 1]) {
      const Xi = s * XW, Xo = s * (XW + TH);
      // outer silhouette top band (cornice) runs the whole length
      for (const z0 of bays) {
        const zA = Math.max(Z0, z0), zB = z0 + BAY; if (zB <= Z0) continue;
        const ap = arch(z0, 18).map(([z, Y]) => [Math.max(Z0, z), Y]);
        // inner face with opening
        ctx.beginPath(); const q = [pj(Xi, 0, zA), pj(Xi, WH, zA), pj(Xi, WH, zB), pj(Xi, 0, zB)]; q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
        const opIn = ap.map(([z, Y]) => pj(Xi, Y, z)); opIn.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
        const mid = (zA + zB) / 2, ga = pj(Xi, WH, mid), gb = pj(Xi, 0, mid);
        ctx.fillStyle = lg(ctx, [[0, stone(s, 1, mid)], [1, mixL(stone(s, 1, mid), s < 0 ? -.18 : -.08)]], ga[0], ga[1], gb[0], gb[1]); ctx.fill('evenodd');
        // reveal (wall thickness) seen through the opening: far jamb + soffit
        const opOut = ap.map(([z, Y]) => pj(Xo, Y, z));
        ctx.save(); path(ctx, opIn); ctx.clip();
        ctx.beginPath(); opIn.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let i = opOut.length - 1; i >= 0; i--) ctx.lineTo(opOut[i][0], opOut[i][1]); ctx.closePath();
        ctx.fillStyle = s < 0 ? stone(s, 0, mid) : mixL(stone(s, 0, mid), -.25); ctx.fill();
        // soffit shading
        const so = pj(Xi, WH * .95, mid); ctx.fillStyle = s < 0 ? 'rgba(255,214,160,.18)' : 'rgba(60,24,30,.22)'; ctx.beginPath(); ctx.ellipse(so[0], so[1], Math.abs(opIn[opIn.length - 1][0] - opIn[0][0]) * .6, Math.abs(opIn[0][1] - opIn[(opIn.length / 2) | 0][1]) * .25, 0, 0, 7); ctx.fill();
        ctx.restore();
        // lit edge on the arch (inner face, facing the sun on the right wall; rim on the left)
        ctx.save(); ctx.strokeStyle = s < 0 ? 'rgba(255,214,160,.55)' : 'rgba(255,236,200,.6)'; ctx.lineWidth = Math.max(.8, 5 / mid); ctx.beginPath(); opIn.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
        // light pools on the right wall's inner face from the left openings (sun through arches)
        if (s > 0 && mid < 50) { ctx.save(); path(ctx, q); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(150,80,90,.28)'; ctx.fillRect(L, Tp, R - L, B - Tp); ctx.restore(); }
        // stone courses + chips near camera
        if (mid < 16) { const g = 1 / mid; ctx.save(); ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); opIn.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip('evenodd');
          ctx.strokeStyle = `rgba(70,30,26,${(.3 * Math.min(1, g * 4)).toFixed(2)})`; ctx.lineWidth = Math.max(.6, 2 * g);
          for (let Y = .32; Y < WH; Y += .32) { const a = pj(Xi, Y, zA), b = pj(Xi, Y, zB); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); const off = ((Y / .32) | 0) % 2 ? .35 : .9; for (let z = zA + off; z < zB; z += 1.1) { const c0 = pj(Xi, Y, z), c1 = pj(Xi, Y - .32, z); ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.lineTo(c1[0], c1[1]); ctx.stroke(); } }
          const cr = P.rng(Math.round(z0 * 31) + (s > 0 ? 9 : 0)); for (let c = 0; c < 10; c++) { const p = pj(Xi, cr() * WH, lerp(zA, zB, cr())); ctx.fillStyle = cr() < .5 ? 'rgba(60,24,20,.22)' : 'rgba(255,226,186,.18)'; ctx.beginPath(); ctx.ellipse(p[0], p[1], (6 + cr() * 10) * g * 3, (2 + cr() * 4) * g * 3, cr(), 0, 7); ctx.fill(); }
          ctx.restore(); }
      }
      // cornice
      ctx.beginPath(); for (let z = Z0; z < 62; z *= 1.06) { const p = pj(Xi, WH + .12, z); z === Z0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); } for (let z = 62; z > Z0; z /= 1.06) { const p = pj(Xi, WH, z); ctx.lineTo(p[0], p[1]); } ctx.closePath(); ctx.fillStyle = s < 0 ? '#B0644A' : '#F2BC86'; ctx.fill();
      ctx.beginPath(); for (let z = Z0; z < 62; z *= 1.06) { const p = pj(Xi, WH + .12, z); z === Z0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]); } for (let z = 62; z > Z0; z /= 1.06) { const p = pj(Xo, WH + .12, z); ctx.lineTo(p[0], p[1]); } ctx.closePath(); ctx.fillStyle = s < 0 ? '#E7A672' : '#C27A54'; ctx.fill();
    }
    // atmosphere toward the vanishing point
    const vg = ctx.createRadialGradient(cx, hy, 0, cx, hy, W * .22); vg.addColorStop(0, 'rgba(244,196,140,.55)'); vg.addColorStop(1, 'rgba(244,196,140,0)'); ctx.fillStyle = vg; ctx.fillRect(L, Tp, R - L, B - Tp);
    const fl = (x, y) => Math.sin(x * .004 + y * .002) * .4 + Math.sin(y * .009 - x * .0015) * .25;
    fine(ctx, cv.width, cv.height, r, { area: 260 * k * k, len: [8 * k, 22 * k], wid: [3 * k, 7 * k], a: [.16, .3], ang: fl, jit: 6, angJ: .3 });
    fine(ctx, cv.width, cv.height, r, { area: 110 * k * k, len: [5 * k, 15 * k], wid: [1.6 * k, 3.6 * k], a: [.16, .32], ang: (x, y) => fl(x, y) * 2, jit: 12 });
  };

  /* ---------- founders at 2x ---------- */
  const skinC = ['#C99A7A', '#8A5E48', '#E2B898', '#B07A5A'];
  const coatC = ['#2A2C33', '#4A3A36', '#26335A', '#3E4A44'];
  P.founder7 = (cv, v) => {
    const K = 2; cv.width = 300 * K; cv.height = 400 * K; const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.setTransform(K, 0, 0, K, 0, 0);
    const r = P.rng(300 + v), sit = v === 1 || v === 3, coat = coatC[v], lite = mixL(coat, .32), dark = mixL(coat, -.45), sk = skinC[v], trou = mixL(coat, -.15);
    const hz = (x0, x1) => lg(ctx, [[0, lite], [.3, coat], [.75, dark], [1, mixL(coat, -.25)]], x0, 0, x1, 0);
    const hand = (x, y, a, sc = 1) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(sc, sc); ctx.fillStyle = lg(ctx, [[0, mixL(sk, .18)], [1, mixL(sk, -.35)]], -7, 0, 7, 0); smooth(ctx, [[-6, -2], [6, -3], [8, 6], [7, 14], [3, 18], [-2, 17], [-6, 12], [-7, 4]]); ctx.fill(); ctx.strokeStyle = rgba(hex(mixL(sk, -.45).match(/\d+/g) ? '#6A4434' : '#6A4434'), .35); ctx.lineWidth = .7; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-3 + i * 3, 10); ctx.lineTo(-3 + i * 3.2, 16.5); ctx.stroke(); } ctx.restore(); };
    const shoe = (x, y, dir) => { ctx.fillStyle = lg(ctx, [[0, '#3A3634'], [1, '#121214']], 0, y - 6, 0, y + 6); smooth(ctx, [[x - 10 * dir, y - 6], [x + 6 * dir, y - 7], [x + 20 * dir, y - 1], [x + 22 * dir, y + 5], [x - 11 * dir, y + 6]]); ctx.fill(); ctx.fillStyle = 'rgba(255,236,210,.35)'; ctx.beginPath(); ctx.ellipse(x + 10 * dir, y - 3, 5, 1.6, -.2 * dir, 0, 7); ctx.fill(); };
    if (!sit) {
      ctx.fillStyle = 'rgba(40,24,30,.5)'; ctx.filter = 'blur(3px)'; ctx.beginPath(); ctx.ellipse(150, 392, 58, 7, 0, 0, 7); ctx.fill(); ctx.filter = 'none';
      // trousers
      [[124, 148, 0], [152, 176, 1]].forEach(([a, b, i]) => { ctx.fillStyle = lg(ctx, [[0, i ? mixL(trou, -.15) : mixL(trou, .2)], [.5, trou], [1, mixL(trou, -.4)]], a, 0, b, 0); path(ctx, [[a, 286], [b, 286], [b - 2 + i * 2, 384], [a + 2 + i * 2, 384]]); ctx.fill(); softLine(ctx, [[(a + b) / 2 - 1, 292], [(a + b) / 2 + 1, 380]], 1.6, i ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.14)'); softLine(ctx, [[a + 3, 364], [b - 3, 368]], 2, 'rgba(0,0,0,.18)'); });
      shoe(134, 388, -1); shoe(166, 388, 1);
      // coat body
      ctx.fillStyle = hz(92, 208); smooth(ctx, [[150, 0], [122, 4], [100, 14], [92, 30], [96, 120], [100, 220], [98, 300], [124, 306], [150, 304], [176, 306], [202, 300], [200, 220], [204, 120], [208, 30], [200, 14], [178, 4]]); ctx.fill();
      // shirt + tie
      ctx.fillStyle = v === 2 ? '#E9DDC3' : '#F3EEE4'; path(ctx, [[138, 0], [162, 0], [154, 64], [150, 72], [146, 64]]); ctx.fill();
      ctx.fillStyle = v === 0 ? '#A8242A' : v === 2 ? '#7A2A2E' : '#2E2B2C'; path(ctx, [[147, 6], [153, 6], [155, 14], [154, 62], [150, 68], [146, 62], [145, 14]]); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; path(ctx, [[150, 14], [155, 14], [154, 62], [150, 68]]); ctx.fill();
      // lapels
      ctx.fillStyle = mixL(coat, .2); path(ctx, [[138, 0], [122, 8], [126, 40], [146, 96], [147, 66]]); ctx.fill();
      ctx.fillStyle = mixL(coat, -.3); path(ctx, [[162, 0], [178, 8], [174, 40], [154, 96], [153, 66]]); ctx.fill();
      softLine(ctx, [[124, 10], [128, 42], [146, 96]], 1.4, 'rgba(255,240,220,.22)');
      // closure, buttons, pockets, folds
      softLine(ctx, [[150, 98], [151, 300]], 1.6, 'rgba(0,0,0,.45)');
      [130, 170, 210].forEach(y => { ctx.fillStyle = '#16161A'; ctx.beginPath(); ctx.arc(154, y, 2.6, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(153.2, y - .9, .9, 0, 7); ctx.fill(); });
      [[110, 214, 136], [164, 214, 190]].forEach(([a, y, b]) => { ctx.fillStyle = 'rgba(0,0,0,.22)'; path(ctx, [[a, y], [b, y - 1], [b, y + 5], [a, y + 6]]); ctx.fill(); softLine(ctx, [[a, y - .5], [b, y - 1.5]], 1, 'rgba(255,240,220,.2)'); });
      softLine(ctx, [[118, 120], [122, 200], [120, 296]], 3, 'rgba(0,0,0,.18)'); softLine(ctx, [[184, 120], [180, 210], [184, 296]], 3, 'rgba(0,0,0,.28)');
      softLine(ctx, [[102, 300], [124, 306], [150, 303], [176, 306], [200, 300]], 2.4, 'rgba(0,0,0,.35)');
      // sleeves with elbow folds and cuffs
      ctx.fillStyle = lg(ctx, [[0, mixL(coat, .4)], [.5, mixL(coat, .1)], [1, coat]], 82, 0, 110, 0); smooth(ctx, [[100, 16], [88, 26], [80, 70], [78, 130], [80, 196], [84, 216], [102, 216], [106, 196], [108, 130], [110, 60], [108, 26]]); ctx.fill();
      ctx.fillStyle = lg(ctx, [[0, coat], [.6, dark], [1, mixL(coat, -.55)]], 192, 0, 222, 0); smooth(ctx, [[200, 16], [212, 26], [220, 70], [222, 130], [220, 196], [216, 216], [198, 216], [194, 196], [192, 130], [190, 60], [192, 26]]); ctx.fill();
      softLine(ctx, [[86, 128], [96, 132], [104, 126]], 1.6, 'rgba(0,0,0,.3)'); softLine(ctx, [[84, 150], [98, 146]], 1.4, 'rgba(255,240,220,.18)'); softLine(ctx, [[196, 128], [206, 133], [216, 128]], 1.6, 'rgba(0,0,0,.4)');
      softLine(ctx, [[96, 40], [92, 120]], 2.2, 'rgba(255,240,220,.18)');
      ctx.fillStyle = v === 2 ? '#E9DDC3' : '#F3EEE4'; path(ctx, [[85, 212], [101, 212], [101, 218], [85, 218]]); ctx.fill(); path(ctx, [[199, 212], [215, 212], [215, 218], [199, 218]]); ctx.fill();
      hand(93, 218, .05); hand(207, 218, -.05, .98);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.filter = 'blur(2px)'; ctx.beginPath(); ctx.ellipse(207, 232, 6, 10, 0, 0, 7); ctx.fill(); ctx.filter = 'none';
      // neck
      ctx.fillStyle = lg(ctx, [[0, mixL(sk, .05)], [1, mixL(sk, -.4)]], 138, 0, 162, 0); path(ctx, [[139, -6], [161, -6], [160, 6], [140, 6]]); ctx.fill();
    } else {
      // chair (bentwood, three-quarter)
      ctx.fillStyle = 'rgba(40,24,30,.45)'; ctx.filter = 'blur(3px)'; ctx.beginPath(); ctx.ellipse(160, 392, 74, 8, 0, 0, 7); ctx.fill(); ctx.filter = 'none';
      const wood = lg(ctx, [[0, '#9A6A46'], [.5, '#6E4A30'], [1, '#3E2818']], 0, 0, 10, 0);
      ctx.strokeStyle = '#4A3020'; ctx.lineCap = 'round'; ctx.lineWidth = 6; [[86, 248, 82, 390], [196, 258, 200, 390], [118, 262, 122, 380], [176, 252, 172, 372]].forEach(([a, b, c, d], i) => { ctx.strokeStyle = i > 1 ? '#3A2416' : '#5A3A26'; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); ctx.strokeStyle = 'rgba(255,220,180,.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a - 1.5, b); ctx.lineTo(c - 1.5, d); ctx.stroke(); ctx.lineWidth = 6; });
      ctx.strokeStyle = '#5A3A26'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(140, 330, 52, 8, 0, 0, Math.PI); ctx.stroke();
      ctx.lineWidth = 7; ctx.strokeStyle = '#6E4A30'; ctx.beginPath(); ctx.moveTo(88, 250); ctx.quadraticCurveTo(76, 160, 92, 96); ctx.stroke(); ctx.strokeStyle = 'rgba(255,220,180,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(85, 250); ctx.quadraticCurveTo(73, 160, 89, 96); ctx.stroke();
      ctx.fillStyle = wood; smooth(ctx, [[80, 244], [190, 246], [206, 256], [94, 262]]); ctx.fill(); ctx.fillStyle = lg(ctx, [[0, '#A87850'], [1, '#6E4A30']], 0, 244, 0, 262); smooth(ctx, [[80, 242], [190, 244], [206, 254], [92, 258]]); ctx.fill();
      // lower legs + shoes
      [[188, 204, 0], [172, 188, 1]].forEach(([a, b, i]) => { ctx.fillStyle = lg(ctx, [[0, mixL(trou, i ? -.1 : .18)], [1, mixL(trou, -.45)]], a, 0, b, 0); path(ctx, [[a - 4, 246], [b + 4, 246], [b + 2, 382], [a + 2, 382]]); ctx.fill(); softLine(ctx, [[(a + b) / 2, 262], [(a + b) / 2 + 1, 376]], 1.4, 'rgba(255,255,255,.12)'); });
      shoe(196, 386, 1); shoe(181, 388, 1);
      // thighs
      ctx.fillStyle = lg(ctx, [[0, mixL(trou, .25)], [1, mixL(trou, -.35)]], 0, 220, 0, 258); smooth(ctx, [[108, 222], [180, 224], [206, 232], [210, 252], [196, 260], [112, 258], [100, 242]]); ctx.fill();
      softLine(ctx, [[130, 230], [196, 236]], 1.6, 'rgba(255,255,255,.15)'); softLine(ctx, [[150, 254], [176, 248], [196, 256]], 2, 'rgba(0,0,0,.28)');
      // torso (coat), slight forward lean
      ctx.fillStyle = hz(104, 182); smooth(ctx, [[146, 84], [122, 92], [108, 108], [104, 160], [104, 236], [118, 252], [170, 250], [182, 236], [182, 160], [180, 108], [170, 92]]); ctx.fill();
      ctx.fillStyle = v === 3 ? '#E9DDC3' : '#F3EEE4'; path(ctx, [[138, 86], [156, 86], [150, 132], [146, 136], [142, 132]]); ctx.fill();
      ctx.fillStyle = v === 3 ? '#2F6F7A' : '#5A2A2C'; path(ctx, [[144, 90], [149, 90], [151, 130], [146, 136], [142, 130]]); ctx.fill();
      ctx.fillStyle = mixL(coat, .2); path(ctx, [[138, 86], [126, 94], [128, 120], [144, 148], [142, 126]]); ctx.fill(); ctx.fillStyle = mixL(coat, -.3); path(ctx, [[156, 86], [168, 94], [164, 120], [148, 148], [151, 126]]); ctx.fill();
      softLine(ctx, [[146, 150], [148, 246]], 1.4, 'rgba(0,0,0,.4)'); softLine(ctx, [[112, 230], [146, 240], [178, 232]], 2.6, 'rgba(0,0,0,.3)'); softLine(ctx, [[118, 196], [140, 206], [166, 200]], 2, 'rgba(0,0,0,.2)');
      // near arm: upper arm down, forearm forward to the knee
      ctx.fillStyle = lg(ctx, [[0, mixL(coat, .3)], [1, dark]], 150, 0, 196, 0); smooth(ctx, [[160, 96], [180, 104], [186, 150], [190, 186], [206, 210], [214, 226], [204, 236], [184, 220], [168, 196], [160, 150], [154, 110]]); ctx.fill();
      softLine(ctx, [[172, 186], [186, 196]], 1.8, 'rgba(0,0,0,.35)'); softLine(ctx, [[166, 118], [170, 170]], 2, 'rgba(255,240,220,.16)');
      ctx.fillStyle = v === 3 ? '#E9DDC3' : '#F3EEE4'; path(ctx, [[204, 224], [214, 218], [218, 224], [208, 231]]); ctx.fill();
      hand(214, 230, -1.1, .95);
      ctx.fillStyle = lg(ctx, [[0, mixL(sk, .05)], [1, mixL(sk, -.4)]], 138, 0, 158, 0); path(ctx, [[138, 64], [158, 64], [157, 90], [139, 90]]); ctx.fill();
    }
    fine(ctx, cv.width, cv.height, r, { area: 40, len: [5, 12], wid: [1.4, 3], a: [.14, .3], ang: () => Math.PI / 2 + (r() - .5) * .3 });
  };
  P.head7 = (cv, v) => {
    const K = 2; cv.width = 90 * K; cv.height = 110 * K; const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.setTransform(K, 0, 0, K, 0, 0);
    const r = P.rng(400 + v), sk = skinC[v], hair = ['#1E1A18', '#5A3A26', '#2A2420', '#8A8A88'][v];
    // neck
    ctx.fillStyle = lg(ctx, [[0, mixL(sk, 0)], [1, mixL(sk, -.45)]], 32, 0, 58, 0); path(ctx, [[34, 80], [56, 80], [56, 112], [34, 112]]); ctx.fill();
    if (v === 0 || v === 3) {
      // back of head, turned away; bowler hat
      ctx.fillStyle = lg(ctx, [[0, mixL(sk, .2)], [.5, sk], [1, mixL(sk, -.45)]], 14, 0, 76, 0); smooth(ctx, [[45, 30], [70, 38], [76, 62], [70, 84], [56, 94], [36, 94], [20, 84], [14, 62], [20, 38]]); ctx.fill();
      ctx.fillStyle = mixL(sk, -.12); smooth(ctx, [[12, 56], [17, 52], [19, 64], [16, 72], [11, 68]]); ctx.fill(); ctx.fillStyle = 'rgba(80,40,30,.3)'; ctx.beginPath(); ctx.ellipse(15, 62, 1.8, 5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = lg(ctx, [[0, mixL(hair, .25)], [1, hair]], 0, 40, 0, 92); smooth(ctx, [[20, 44], [45, 38], [70, 44], [74, 70], [66, 88], [45, 92], [24, 88], [16, 70]]); ctx.fill();
      ctx.strokeStyle = rgba(hex(v === 3 ? '#B8B8B4' : '#3A302A'), .5); ctx.lineWidth = .8; for (let i = 0; i < 18; i++) { const x = 22 + i * 2.8; ctx.beginPath(); ctx.moveTo(x, 46); ctx.quadraticCurveTo(x + (r() - .5) * 6, 70, x + (r() - .5) * 4, 88); ctx.stroke(); }
      ctx.fillStyle = lg(ctx, [[0, '#4A4C54'], [.4, '#26282E'], [1, '#101114']], 6, 0, 84, 0); ctx.beginPath(); ctx.ellipse(45, 42, 40, 7.5, 0, 0, 7); ctx.fill();
      smooth(ctx, [[20, 42], [22, 22], [34, 10], [56, 10], [68, 22], [70, 42]]); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,220,.22)'; ctx.beginPath(); ctx.ellipse(32, 20, 7, 4, -.6, 0, 7); ctx.fill(); ctx.fillStyle = '#1A1210'; path(ctx, [[21, 36], [69, 36], [70, 41], [20, 41]]); ctx.fill();
    } else {
      // three-quarter, face turned away into shadow
      ctx.fillStyle = lg(ctx, [[0, mixL(sk, .28)], [.32, sk], [.6, mixL(sk, -.5)], [1, mixL(sk, -.7)]], 14, 0, 78, 0); smooth(ctx, [[42, 22], [66, 30], [74, 56], [70, 80], [60, 94], [46, 98], [34, 92], [24, 78], [18, 56], [24, 32]]); ctx.fill();
      ctx.fillStyle = 'rgba(30,18,16,.35)'; ctx.beginPath(); ctx.ellipse(58, 56, 12, 5, -.1, 0, 7); ctx.fill();
      ctx.fillStyle = mixL(sk, -.55); smooth(ctx, [[66, 58], [76, 64], [72, 72], [66, 70]]); ctx.fill();
      ctx.fillStyle = mixL(sk, -.1); smooth(ctx, [[24, 56], [29, 52], [31, 66], [27, 72], [22, 66]]); ctx.fill();
      ctx.fillStyle = lg(ctx, [[0, mixL(hair, .3)], [1, hair]], 0, 14, 0, 90); smooth(ctx, [[18, 46], [22, 22], [44, 12], [68, 20], [76, 40], [70, 46], [56, 30], [36, 32], [30, 50], [26, 80], [30, 98], [18, 92], [14, 70]]); ctx.fill();
      ctx.strokeStyle = rgba(hex(mixL(hair, .35).match(/\d+/g) ? '#8A6A50' : '#8A6A50'), .35); ctx.lineWidth = .7; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(24 + i * 3, 18 + (i % 3)); ctx.quadraticCurveTo(20 + i * 2, 50, 20 + i * .8, 86); ctx.stroke(); }
    }
    fine(ctx, cv.width, cv.height, r, { area: 24, len: [3, 8], wid: [1, 2.2], a: [.12, .26], ang: () => Math.PI / 2 });
  };
  P.thought7 = (cv, kind) => {
    const K = 3, os = P.setup; cv.width = 56 * K; cv.height = 56 * K; const ctx = cv.getContext('2d'); ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.save(); ctx.fillStyle = 'rgba(60,30,30,.25)'; ctx.filter = 'blur(2px)'; ctx.beginPath(); ctx.ellipse(30, 50, 16, 3, 0, 0, 7); ctx.fill(); ctx.restore();
    P.setup = () => ({ ctx, w: 56, h: 56 }); try { P.thought(cv, kind); } finally { P.setup = os; }
    ctx.globalCompositeOperation = 'source-atop'; const g = ctx.createLinearGradient(8, 6, 48, 50); g.addColorStop(0, 'rgba(255,240,214,.35)'); g.addColorStop(.5, 'rgba(255,240,214,0)'); g.addColorStop(1, 'rgba(40,20,20,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 56, 56); ctx.globalCompositeOperation = 'source-over';
  };
})();

export {};
