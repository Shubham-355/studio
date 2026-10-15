/* v8: tilt sky + Magritte apple plate, 8x8 board config. Load after worlds6.js */
(function init() {
  const P = window.Painter; if (!P || !P.beach6cfg || !P.sky || !P.cam6) { setTimeout(init, 20); return; } if (P.apple8Sky) return;
  const orig = P.beach6cfg;
  P.beach6cfg = (W, H, n) => {
    const S = orig(W, H, n), q = S.q, Xb = S.Xb, Zb = S.Zb, m = W / H < 1;
    const p3 = m ? [26, 8.5, .3, 44] : [18.5, 9.4, 0, 30];
    S.camO = { x: Xb, y: p3[0] * q, z: Zb - p3[1] * q, ph: Math.atan2(p3[0], p3[1] - p3[2]), f: H / 2 / Math.tan(p3[3] * Math.PI / 360), cx: W / 2, cy: H / 2 };
    const XsB = Xb - 1.12 - .26; S.Xs = Z => XsB + .1 * (Z - Zb);
    S.Xwet = Z => { const b = S.Xs(Z) + .45, env = Math.exp(-Math.pow((Z - Zb) / 2.1, 4)), lobe = Xb + 1.3 + .12 * Math.sin(Z * 2.3); return b + env * Math.max(0, lobe - b); };
    S.Zend = Zb - 3.05; S.poseE = Object.assign({}, S.poseE, { z: S.Zend - .45 });
    S.sun = [.45, -1.35];
    S.rest = { X: Xb + .9 * q, Z: Zb - 5.0 * q };
    S.board = [[-4.45, -4.45], [4.45, -4.45], [4.45, 4.45], [-4.45, 4.45]].map(([x, z]) => [Xb + x * q, Zb - z * q]);
    return S;
  };

  P.beach6Ground = (cv, S, which) => {
    const W = S.W, H = S.H, k = S.n ? 1.6 : 1.05, { ctx, w, h } = P.setup(cv, W * 1.2 * k, H * k), r = P.rng(71 + which);
    ctx.clearRect(0, 0, w, h); const c0 = which ? S.poseE : S.pose0, c = Object.assign({}, c0, { f: c0.f * k, cx: (c0.cx + .1 * W) * k, cy: c0.cy * k });
    P.ground6(ctx, c, w, c.cy, h, S, r, k, { feat: !which });
  };

  /* tall plate: hero-blue at the seam, warming to peach and gold at the horizon, sea below */
  P.apple8Sky = (cv, G) => {
    const { W, H, Yh, Hp, sunX, n } = G, k = n ? .9 : .7, f = y => Math.max(0, Math.min(1, y / Hp));
    const stops = [[0, '#3E78C4'], [f(Yh - H * .72), '#5D8ECC'], [f(Yh - H * .5), '#9FBCDB'], [f(Yh - H * .27), '#D7D4D2'], [f(Yh - H * .13), '#EFCDAE'], [f(Yh - H * .04), '#F4BD88'], [f(Yh) - .0006, '#F6B474'], [f(Yh), '#33627F'], [1, '#24506C']];
    return P.sky(cv, {
      seed: 81, w: W, h: Hp, k, stops, clouds: n ? 3 : 5, cy0: .05, cy1: Math.max(.08, (Yh - H * .7) / Hp), cs0: .035, cs1: .07, light: '#F4F1EC', mid: '#E4E2E2', shadow: '#B4C3D8',
      after: (ctx, w, h, r) => {
        const s = w / W, yh = Yh * s, H2 = H * s;
        ctx.fillStyle = P.linear(ctx, [[0, 'rgba(250,214,170,0)'], [1, 'rgba(250,206,150,.55)']], 0, yh - H2 * .22, 0, yh); ctx.fillRect(0, yh - H2 * .22, w, H2 * .22);
        P.sea(ctx, w, yh, h, { far: '#3D6C8B', near: '#21496A', mid: '#4C7E9E', foam: '#BFD3DC' }, r);
        for (let i = 0; i < 320; i++) { const y = yh + Math.pow(r(), 1.5) * (h - yh), tt = (y - yh) / (h - yh || 1);
          P.stroke(ctx, r() * w, y, (r() - .5) * .03, (24 + tt * 180 * r()) * s, (1 + tt * 5) * s, r() < .55 ? [28, 64, 92] : [104, 146, 172], .22 + r() * .3, (r() - .5) * .08); }
      },
      post: (ctx, w, h, r) => {
        const s = w / W, yh = Yh * s, H2 = H * s, sx = sunX * s, sy = yh - H2 * .062, sr = H2 * .034;
        let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H2 * .42); g.addColorStop(0, 'rgba(255,230,180,.6)'); g.addColorStop(.35, 'rgba(255,214,160,.22)'); g.addColorStop(1, 'rgba(255,214,160,0)');
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, yh); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, yh);
        g = ctx.createRadialGradient(sx, sy, sr * .1, sx, sy, sr * 1.18); g.addColorStop(0, '#FFF8EA'); g.addColorStop(.72, '#FFE7BE'); g.addColorStop(.86, 'rgba(255,220,160,.7)'); g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.18, 0, 7); ctx.fill();
        for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, rr = sr * (.2 + r() * .7); P.stroke(ctx, sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, a + Math.PI / 2, sr * (.2 + r() * .4), sr * .12, [255, 244, 222], .35, .2); }
        ctx.restore();
        for (let i = 0; i < 520; i++) { const y = yh + Math.pow(r(), 1.25) * (h - yh) * .85, tt = (y - yh) / (h - yh || 1), sp = H2 * .018 + tt * H2 * .5, x = sx + (r() - .5) * 2 * sp * (.25 + r() * .75);
          P.stroke(ctx, x, y, (r() - .5) * .04, (2 + tt * 18 * r()) * s, (.6 + tt * 2.2) * s, [255, 226 + r() * 26 | 0, 176 + r() * 50 | 0], .3 + r() * .5, 0); }
        ctx.fillStyle = 'rgba(24,52,74,.6)'; ctx.fillRect(0, yh - .6 * s, w, Math.max(1, 1.3 * s));
      },
    });
  };

  P.apple8Clouds = (cv, G) => {
    const k = .6, { ctx, w, h } = P.setup(cv, G.W * 1.3 * k, G.H * .42 * k); ctx.clearRect(0, 0, w, h);
    const r = P.rng(83), m = Math.min(w, 1600 * k);
    const L = G.n ? [[.2, .4, .075], [.66, .62, .05], [.95, .32, .06]] : [[.1, .46, .045], [.36, .26, .034], [.56, .64, .05], [.8, .38, .042], [1.02, .56, .03]];
    P.clouds(ctx, L.map(([x, y, s]) => ({ x: x * w, y: y * h, s: s * m })), { light: '#FBF4EA', mid: '#F2DDC9', shadow: '#D6B2A2', base: '#CDA898' }, r);
    P.overpaint(ctx, w, h, { len: [10 * k, 34 * k], wid: [3 * k, 7 * k], a: [.3, .55], area: 220 * k * k, jit: 8, angJ: .25 }, r);
  };

  /* per frame: sun glitter and slow swells on the visible sea strip */
  P.sea8 = (ctx, w, h, sunX, now, K) => {
    ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const sp = .004 + (i % 5) * .002, y = (2 + i / 14 * (h - 4)), x = ((i * 0.37 + now * sp) % 1.4 - .2) * w, L = (40 + i * 9) * K;
      ctx.strokeStyle = `rgba(${i % 2 ? '30,62,90' : '150,184,204'},${(.18 + .1 * Math.sin(now * .4 + i)).toFixed(3)})`; ctx.lineWidth = (1 + i / 14 * 2.5) * K; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L / 2, y - 1.5 * K, x + L, y); ctx.stroke(); }
    for (let i = 0; i < 46; i++) { const a = (i * 0.6180339) % 1, b = (i * 0.4142135) % 1, y = 2 + Math.pow(b, 1.2) * (h - 4), tt = y / h, x = sunX + (a - .5) * 2 * (6 * K + tt * w * .09);
      const tw = Math.pow(Math.max(0, Math.sin(now * (1.3 + a * 1.7) + i * 2.3)), 3); if (tw < .05) continue;
      ctx.strokeStyle = `rgba(255,${238 + (b * 17 | 0)},${200 + (a * 50 | 0)},${(tw * .85).toFixed(3)})`; ctx.lineWidth = (.8 + tt * 2) * K; ctx.beginPath(); ctx.moveTo(x - (2 + tt * 8) * K, y); ctx.lineTo(x + (2 + tt * 8) * K, y); ctx.stroke(); }
  };
})();

export {};
