/* v14 blink: the upper lid is a fold of skin whose edge slides down the eyeball, lashes riding on it. Drawn live on the main thread. Load after eye6.js / eye12.js */
(function init() {
  const P = window.Painter; if (!P || !P._e6 || !P.eyeGeom) { setTimeout(init, 20); return; } if (P.blink14) return; P.blink14 = true;
  const { skinAt, texture, hair, field, bz, soft, blob, lowB, rng, mix, lerp, cl } = P._e6, TAU = Math.PI * 2;
  const bzP = (p, dy = 0) => { const q = new Path2D(); q.moveTo(p[0][0], p[0][1] + dy); q.bezierCurveTo(p[1][0], p[1][1] + dy, p[2][0], p[2][1] + dy, p[3][0], p[3][1] + dy); return q; };
  const closedEdge = E => [E.up[0], [E.cx - E.ew * .2, E.cy + E.eh * .88], [E.cx + E.ew * .26, E.cy + E.eh * .84], E.up[3]];
  P.lidEdge14 = (E, c) => { const C = closedEdge(E); return E.up.map((p, i) => [lerp(p[0], C[i][0], c), lerp(p[1], C[i][1], c)]); };

  /* lid skin: the same colour field and strokes as the surrounding face, so the closed lid reads as continuous skin */
  P.lidTex14 = (w, h) => {
    const E = P.eyeGeom(w, h), q = E.eh / 100, cv = document.createElement('canvas'), K = Math.min(2, 2400 / w);
    cv.width = Math.round(w * K); cv.height = Math.round(h * K); const ctx = cv.getContext('2d', { willReadFrequently: true }); ctx.setTransform(K, 0, 0, K, 0, 0);
    const r = rng(41), around = (x, y) => Math.atan2((y - E.cy) * 2.4, x - E.cx) + Math.PI / 2;
    field(ctx, w, h, (x, y) => { const u = (x - E.cx) / E.ew, v = (y - E.cy) / E.eh; return mix(skinAt(u, v), [196, 132, 108], cl(1 - Math.abs(v) * 1.2, 0, 1) * .12); }, 3);
    texture(ctx, r, { K, n: 2600, len: [16 * q, 44 * q], wid: [5 * q, 12 * q], a: [.25, .5], jit: 12, ang: around, angJ: 1.1, tint: [[14, 2, -8], [-12, -4, 8], [0, 0, 0], [8, 6, 2]] });
    texture(ctx, r, { K, n: 4200, len: [8 * q, 24 * q], wid: [2.5 * q, 6 * q], a: [.3, .55], jit: 14, ang: around, angJ: 1.0 });
    texture(ctx, r, { K, n: 4200, len: [3 * q, 9 * q], wid: [1 * q, 2.4 * q], a: [.2, .4], jit: 18, ang: around, angJ: .9 });
    blob(ctx, E.cx - E.ew * .02, E.cy - E.eh * .62, E.ew * .62, E.eh * .62, 0, [212, 124, 100], .1);
    blob(ctx, E.cx + E.ew * .02, E.cy + E.eh * .78, E.ew * .56, E.eh * .42, 0, [204, 118, 98], .08);
    for (let i = 0; i < 2200; i++) { const d = r() < .72; ctx.fillStyle = d ? `rgba(110,62,48,${(.05 + r() * .07).toFixed(3)})` : `rgba(252,226,204,${(.04 + r() * .06).toFixed(3)})`; ctx.beginPath(); ctx.arc(E.cx + (r() - .5) * E.ew * 1.3, E.cy + (r() - .5) * E.eh * 2.4, (.3 + r() * .6) * q, 0, TAU); ctx.fill(); }
    return cv;
  };

  /* lash set (same distribution as the painted ones), stored relative to the lid edge */
  P.lashes14 = E => {
    const r = rng(77), q = E.eh / 100, out = [], col = () => r() < .5 ? [26, 16, 12] : [44, 28, 22];
    for (let c = 0; c < 24; c++) {
      const tc = .06 + .9 * Math.pow(c / 23, .8) + (r() - .5) * .02, ba = lerp(-2.0, -.2, tc) + (r() - .5) * .16, cA = ba + (-Math.PI / 2 - ba) * .85 - (tc > .6 ? .2 : 0);
      const ln = E.ew * (.04 + .1 * Math.pow(tc, 1.1)) * (.7 + r() * .6), k = 2 + (r() * 3 | 0) + (tc > .6 ? 1 : 0);
      for (let j = 0; j < k; j++) out.push({ t: cl(tc + (r() - .5) * .018, 0, 1), a0: ba + (r() - .5) * .18, a1: cA + (r() - .5) * .05, len: ln * (.75 + r() * .35), wd: (1.5 + r() * .8) * q, al: .7 + r() * .25, c: col() });
    }
    for (let i = 0; i < 20; i++) { const t = .05 + r() * .9, ba = lerp(-2.0, -.2, t) + (r() - .5) * .4; out.push({ t, a0: ba, a1: ba + (-Math.PI / 2 - ba) * (.3 + r() * .5), len: E.ew * (.02 + .05 * t) * (.6 + r() * .7), wd: 1.1 * q, al: .55 + r() * .3, c: col() }); }
    return out;
  };

  /* c: 0 open .. 1 closed; lift: lower-lid rise in px */
  P.lidDraw14 = (ctx, w, h, E, c, tex, lashes, lift) => {
    const q = E.eh / 100, L = E.up[0], R = E.up[3], ed = P.lidEdge14(E, c), eye = new Path2D(E.path), LB = lowB(E);
    ctx.clearRect(0, 0, w, h);
    if (c > .002 && tex) {
      const above = new Path2D(); above.moveTo(L[0], L[1]); above.bezierCurveTo(ed[1][0], ed[1][1], ed[2][0], ed[2][1], R[0], R[1]); above.lineTo(w, R[1]); above.lineTo(w, -1); above.lineTo(-1, -1); above.lineTo(-1, L[1]); above.closePath();
      const below = new Path2D(); below.moveTo(L[0], L[1]); below.bezierCurveTo(ed[1][0], ed[1][1], ed[2][0], ed[2][1], R[0], R[1]); below.lineTo(w, R[1]); below.lineTo(w, h + 1); below.lineTo(-1, h + 1); below.lineTo(-1, L[1]); below.closePath();
      /* the lid's shadow on the eyeball just under its edge */
      ctx.save(); ctx.clip(eye); ctx.clip(below); soft(ctx, bzP(ed, E.eh * .1), [[E.eh * .42, .1 * c], [E.eh * .2, .14 * c]], [62, 30, 26]); ctx.restore();
      ctx.save(); ctx.clip(eye); ctx.clip(above);
      ctx.drawImage(tex, 0, 0, w, h);
      const m = bz(ed, .5);
      blob(ctx, E.cx - E.ew * .04, (E.up[1][1] + m[1]) * .5, E.ew * .34, E.eh * .5, 0, [246, 210, 182], .1 * c);
      blob(ctx, L[0] + E.ew * .06, L[1], E.ew * .16, E.eh * .7, 0, [120, 72, 60], .1 * c);
      blob(ctx, R[0] - E.ew * .06, R[1], E.ew * .16, E.eh * .7, 0, [120, 72, 60], .1 * c);
      soft(ctx, bzP(E.up, E.eh * .2 * c), [[E.eh * .16, .07 * c], [E.eh * .06, .1 * c]], [112, 64, 52]);
      soft(ctx, bzP(ed, -E.eh * .1), [[E.eh * .36, .16], [E.eh * .16, .18]], [150, 90, 72]);
      ctx.restore();
    }
    if (lift > .05 && tex) {
      const band = new Path2D(); band.moveTo(LB[0][0], LB[0][1] - lift); band.bezierCurveTo(LB[1][0], LB[1][1] - lift, LB[2][0], LB[2][1] - lift, LB[3][0], LB[3][1] - lift); band.lineTo(-1, LB[3][1]); band.lineTo(-1, h + 1); band.lineTo(w + 1, h + 1); band.lineTo(w + 1, LB[0][1]); band.closePath();
      ctx.save(); ctx.clip(eye); ctx.clip(band); ctx.drawImage(tex, 0, 0, w, h); ctx.restore();
      ctx.save(); ctx.clip(eye); soft(ctx, bzP(LB, 1.4 * q - lift), [[1.5 * q, .42]], [255, 242, 236]); ctx.restore();
    }
    soft(ctx, bzP(ed, -1.5 * q), [[10 * q, .14], [5 * q, .32], [2.4 * q, .7]], [54, 32, 26]);
    if (c < .9) soft(ctx, bzP(ed, 3 * q), [[1.4 * q, .14 * (1 - c)]], [250, 218, 204]);
    const k = .82 * c, rf = a => Math.atan2(Math.sin(a) * (1 - 2 * k), Math.cos(a));
    for (const s of lashes) { const p = bz(ed, s.t); hair(ctx, p[0], p[1] - q * .5, rf(s.a0), rf(s.a1), s.len * (1 - .12 * c), s.wd, s.c, s.al, [92, 68, 52]); }
  };
})();

export {};
