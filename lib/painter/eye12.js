/* v13 eye: rounder eyeball shading, wet lower line, richer iris, window + sky reflection on the cornea, warmer lids and pores. Load after eye6.js */
(function init() {
  const P = window.Painter; if (!P || !P.eye6 || !P.eyeGeom || !P.rgba) { setTimeout(init, 20); return; } if (P.eye12) return; P.eye12 = true;
  const rgba = P.rgba, rng = P.rng, TAU = Math.PI * 2, cl = (x, a, b) => Math.max(a, Math.min(b, x));
  const blob = (ctx, x, y, rx, ry, rot, c, a, hard = 0) => {
    if (!(rx > 0 && ry > 0)) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, rgba(c, a)); g.addColorStop(hard, rgba(c, a)); g.addColorStop(hard + (1 - hard) * .5, rgba(c, a * .42)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill(); ctx.restore();
  };
  const bzPath = (p, dy = 0) => { const q = new Path2D(); q.moveTo(p[0][0], p[0][1] + dy); q.bezierCurveTo(p[1][0], p[1][1] + dy, p[2][0], p[2][1] + dy, p[3][0], p[3][1] + dy); return q; };
  const soft = (ctx, path, layers, c) => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; layers.forEach(([w, a]) => { ctx.strokeStyle = rgba(c, a); ctx.lineWidth = w; ctx.stroke(path); }); };
  const lowB = E => [E.up[3], [E.cx + E.ew * .22, E.cy + E.eh * .86], [E.cx - E.ew * .25, E.cy + E.eh * .82], E.up[0]];
  const ctxOf = cv => cv.getContext('2d');

  /* skin: warmth around the lids, faint pores and colour variation (outside the eye opening) */
  const face0 = P.face6;
  P.face6 = (cv, w, h) => {
    const E = face0(cv, w, h), ctx = ctxOf(cv), q = E.eh / 100, r = rng(23);
    ctx.save(); const m = new Path2D(); m.rect(0, 0, w, h); m.addPath(new Path2D(E.path)); ctx.clip(m, 'evenodd');
    blob(ctx, E.cx - E.ew * .02, E.cy - E.eh * .62, E.ew * .62, E.eh * .62, 0, [212, 124, 100], .1);
    blob(ctx, E.cx + E.ew * .02, E.cy + E.eh * .78, E.ew * .56, E.eh * .42, 0, [204, 118, 98], .08);
    for (let i = 0; i < 46; i++) blob(ctx, r() * w, r() * h, E.ew * (.06 + r() * .12), E.eh * (.1 + r() * .3), r() * 3, r() < .5 ? [232, 176, 146] : [186, 118, 98], .035);
    for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(104,60,46,${(.05 + r() * .07).toFixed(3)})`; ctx.beginPath(); ctx.arc(r() * w, r() * h, (.3 + r() * .45) * q, 0, TAU); ctx.fill(); }
    ctx.restore();
    return E;
  };

  /* eyeball: grey at the corners and under the upper lid, faint warmth, a wet line on the lower lid */
  const shade0 = P.eyeShade6;
  P.eyeShade6 = (cv, w, h) => {
    shade0(cv, w, h); const E = P.eyeGeom(w, h), ctx = ctxOf(cv), q = E.eh / 100, L = E.up[0], R = E.up[3], LB = lowB(E);
    ctx.save(); ctx.clip(new Path2D(E.path));
    blob(ctx, E.cx, E.cy + E.eh * .1, E.ew * .36, E.eh * .7, 0, [240, 204, 172], .07);
    blob(ctx, L[0] + E.ew * .18, L[1] + E.eh * .04, E.ew * .13, E.eh * .62, 0, [128, 128, 142], .2);
    blob(ctx, R[0] - E.ew * .14, R[1] + E.eh * .1, E.ew * .12, E.eh * .56, 0, [124, 124, 140], .17);
    for (let k = 0; k < 12; k++) soft(ctx, bzPath(E.up, E.eh * (.04 + k * .03)), [[E.eh * .1, .045 * (1 - k / 12)]], [92, 96, 116]);
    soft(ctx, bzPath(LB, -2.6 * q), [[3.2 * q, .14]], [226, 164, 156]);
    soft(ctx, bzPath(LB, -1.1 * q), [[1.3 * q, .62], [.6 * q, .8]], [255, 252, 248]);
    ctx.restore();
  };

  /* iris: extra fine fibres, green and amber flecks, a lighter collarette and a darker limbal ring */
  const iris0 = P.iris6;
  P.iris6 = (cv, ir, big) => {
    iris0(cv, ir, big); const ctx = ctxOf(cv), S = ir * 2.3, c = S / 2, r = rng(17), pol = (rad, a) => [c + Math.cos(a) * rad, c + Math.sin(a) * rad];
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, ir, 0, TAU); ctx.clip(); ctx.lineCap = 'round';
    for (let i = 0; i < 900; i++) { const a = r() * TAU, p0 = pol(ir * (.44 + r() * .08), a), p1 = pol(ir * (.7 + r() * .26), a + (r() - .5) * .04); ctx.strokeStyle = r() < .5 ? `rgba(214,206,176,${(.06 + r() * .1).toFixed(3)})` : `rgba(20,32,44,${(.06 + r() * .1).toFixed(3)})`; ctx.lineWidth = ir * (.003 + r() * .004); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke(); }
    for (let i = 0; i < 70; i++) { const a = r() * TAU, p = pol(ir * (.46 + r() * .4), a), g = r() < .55; blob(ctx, p[0], p[1], ir * (.02 + r() * .035), ir * (.012 + r() * .02), a, g ? [116, 150, 92] : [210, 150, 62], .28 + r() * .2, .2); }
    ctx.strokeStyle = 'rgba(214,198,150,.24)'; ctx.lineWidth = ir * .05; ctx.beginPath(); ctx.arc(c, c, ir * .47, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(14,22,34,.32)'; ctx.lineWidth = ir * .09; ctx.beginPath(); ctx.arc(c, c, ir * .97, 0, TAU); ctx.stroke();
    ctx.restore();
  };

  /* cornea: a soft window highlight and the blurred blue sky with clouds across the upper eye (fixed with the light) */
  P.eyeGlint6 = (cv, w, h, ir) => {
    const E = P.eyeGeom(w, h), K = Math.min(cl(3000 / w, 2, 4), 4096 / w, 4096 / h), r = rng(14);
    cv.width = Math.max(2, Math.round(w * K)); cv.height = Math.max(2, Math.round(h * K)); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const ctx = cv.getContext('2d'); ctx.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.clip(new Path2D(E.path));
    const sky = ctx.createLinearGradient(0, E.cy - E.eh, 0, E.cy + E.eh * .1); sky.addColorStop(0, 'rgba(132,172,226,.3)'); sky.addColorStop(.55, 'rgba(150,186,232,.14)'); sky.addColorStop(1, 'rgba(150,186,232,0)');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const arcY = x => E.cy - E.eh * .52 + Math.pow((x - E.cx) / (E.ew * .5), 2) * E.eh * .38;
    [[-.36, .1, .07], [-.16, .07, .05], [.1, .12, .08], [.3, .06, .045], [.42, .08, .05]].forEach(([u, sx, sy]) => { const x = E.cx + u * E.ew, y = arcY(x), d = 2 * u / .5 * .38 * E.eh / (E.ew * .5); blob(ctx, x, y, E.ew * sx, E.eh * sy * 2.2, Math.atan(d) * .8, [250, 250, 248], .2 + r() * .08); });
    const hz = new Path2D(); for (let i = 0; i <= 30; i++) { const x = E.cx + (i / 30 - .5) * E.ew, y = arcY(x) + E.eh * .26; i ? hz.lineTo(x, y) : hz.moveTo(x, y); } soft(ctx, hz, [[E.eh * .08, .06]], [250, 230, 210]);
    ctx.restore();
    const hx = E.cx - ir * .34, hy = E.cy - ir * .36, hw = ir * .34, hh = ir * .3;
    blob(ctx, hx, hy, hw * 1.25, hh * 1.25, -.15, [255, 255, 255], .14);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-.15); ctx.transform(1, .06, -.1, 1, 0, 0); ctx.filter = `blur(${(ir * .012).toFixed(2)}px)`;
    const gap = hw * .1, pw = (hw - gap) / 2, ph = (hh - gap) / 2, rr = (x, y, a, b, k) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, a, b, k); else ctx.rect(x, y, a, b); ctx.fill(); };
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => { const x0 = -hw / 2 + i * (pw + gap), y0 = -hh / 2 + j * (ph + gap), f = 1 - (i + j) * .12;
      ctx.fillStyle = `rgba(255,253,249,${(.34 * f).toFixed(3)})`; rr(x0 - pw * .08, y0 - ph * .08, pw * 1.16, ph * 1.16, pw * .32);
      ctx.fillStyle = `rgba(255,254,251,${(.82 * f).toFixed(3)})`; rr(x0, y0, pw, ph, pw * .24); });
    ctx.restore();
    blob(ctx, E.cx + ir * .44, E.cy + ir * .3, ir * .04, ir * .03, 0, [255, 255, 255], .45, .4);
  };
})();

export {};
