/* v12: one cloud for the whole site: soft round cumulus cards, white crowns, #9FB0C8 undersides, canvas grain. Load after worlds9.js */
(function init() {
  const P = window.Painter; if (!P || !P.cloud9 || !P.setup) { setTimeout(init, 20); return; } if (P.cloud10) return;
  const lerp = (a, b, t) => a + (b - a) * t, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), rgba = P.rgba;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  const PAL = {
    day: { lit: [255, 253, 248], mid: [239, 238, 238], sh: [190, 199, 216], base: [159, 176, 200] },
    warm: { lit: [255, 246, 234], mid: [245, 234, 226], sh: [196, 198, 212], base: [164, 176, 198], tint: [250, 214, 178] },
    night: { lit: [160, 174, 206], mid: [60, 74, 106], sh: [42, 54, 84], base: [30, 40, 66], side: .34 },
  };
  P.cloudPal10 = PAL;

  /* the tilt cloud (cloud9) + a side-light term (moonlight) + an optional warm tint toward the base (horizon) */
  P.cloud10 = (ctx, x, y, s, r, o = {}) => {
    const lit = o.lit || PAL.day.lit, md = o.mid || PAL.day.mid, sh = o.sh || PAL.day.sh, base = o.base || PAL.day.base, sk = o.side ?? .1, tint = o.tint;
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
      let col = mix(lit, md, ss(.1, .55, v + side * sk)); col = mix(col, sh, ss(.5, .95, v + rim * .12 - .04 + Math.max(0, side) * (sk - .1))); col = mix(col, base, ss(.86, 1, v) * .65);
      if (tint) col = mix(col, tint, ss(.55, 1, v) * .22);
      dabs.push({ px, py, d: s * (.12 + r() * .16) * (1 - rim * .4), col, v, a: .45 + r() * .3 });
    }
    dabs.sort((a, b) => b.v - a.v);
    dabs.forEach(d => { const g = c.createRadialGradient(d.px, d.py, 0, d.px, d.py, d.d); g.addColorStop(0, rgba(d.col, d.a)); g.addColorStop(.6, rgba(d.col, d.a * .7)); g.addColorStop(1, rgba(d.col, 0)); c.fillStyle = g; c.beginPath(); c.arc(d.px, d.py, d.d, 0, 6.283); c.fill(); });
    ctx.save(); ctx.filter = `blur(${Math.max(1, s * .034 + (o.blur || 0)).toFixed(1)}px)`; ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(oc, bx0, by0); ctx.restore();
  };
  /* canvas grain, only on painted pixels */
  P.grain10 = (ctx, w, h, r, k = 1) => {
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; const n = Math.round(w * h / 70);
    for (let i = 0; i < n; i++) { const lt = r() < .5; ctx.fillStyle = lt ? 'rgba(255,255,255,.07)' : 'rgba(40,52,80,.06)'; ctx.fillRect(r() * w, r() * h, (1 + r()) * k, (1 + r()) * k); }
    ctx.restore();
  };
  /* one layer of cloud cards: L = { w, h, k, list: [[x, y, s]...] (fractions of the layer), col, seed } */
  P.deck10 = (cv, L) => {
    const { ctx, w, h } = P.setup(cv, L.w * L.k, L.h * L.k); ctx.clearRect(0, 0, w, h); const r = P.rng(L.seed ?? 91);
    L.list.forEach(([x, y, s]) => P.cloud10(ctx, x * w, y * h, s * w, r, L.col || PAL.day));
    P.grain10(ctx, w, h, r, Math.max(1, L.k * 1.6));
  };
  /* every remaining painted-in cloud (beach plate, props) draws the same cloud; skies that moved to cards set _noCl */
  P.clouds = (ctx, list, o, r) => {
    if (P._noCl) return;
    const hx = String(o && o.light || '#FFFFFF'), v = parseInt(hx.slice(1, 3), 16) * .3 + parseInt(hx.slice(3, 5), 16) * .59 + parseInt(hx.slice(5, 7), 16) * .11;
    const pal = v < 120 ? PAL.night : PAL.day;
    list.forEach(c => P.cloud10(ctx, c.x, c.y, c.s * .95, r, pal));
  };
  /* v13: varied cumulus: mass / tall / heap / flat / wisp, tilted bases, mirrored; every call draws a different shape */
  const KIND = { mass: [9, 13, 2.6, .62, .4, .75, 3], tall: [5, 7, 1.5, .9, .38, .7, 2], heap: [5, 8, 2.0, .45, .34, .62, 1], flat: [10, 15, 2.8, .2, .3, .52, 0] };
  P.cloud11 = (ctx, x, y, s, r, o = {}, kind = 'heap', tilt = 0, flip = 1) => {
    const lit = o.lit || PAL.day.lit, md = o.mid || PAL.day.mid, sh = o.sh || PAL.day.sh, base = o.base || PAL.day.base, sk = o.side ?? .1, tint = o.tint;
    if (kind === 'wisp') {
      const oc = document.createElement('canvas'), L = s * (2.6 + r() * 1.6), T = s * .5; oc.width = Math.ceil(L * 1.3 + 24); oc.height = Math.ceil(T * 2 + 24); const c = oc.getContext('2d'), cx = oc.width / 2, cy = oc.height / 2, bend = (r() - .5) * .5, n = 22 + (r() * 14 | 0);
      for (let i = 0; i < n; i++) { const t = r() - .5, px = cx + t * L * flip, py = cy + bend * t * t * T * 4 + (r() - .5) * T * .35, w = s * (.22 + r() * .3) * (1 - Math.abs(t) * 1.1), hh = w * (.28 + r() * .2); if (w <= 0) continue;
        const col = mix(lit, md, r() * .6); c.save(); c.translate(px, py); c.scale(1, hh / w); const g = c.createRadialGradient(0, 0, 0, 0, 0, w); g.addColorStop(0, rgba(col, .26 + r() * .16)); g.addColorStop(1, rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, w, 0, 6.283); c.fill(); c.restore(); }
      ctx.save(); ctx.filter = `blur(${Math.max(1, s * .05 + (o.blur || 0)).toFixed(1)}px)`; ctx.globalAlpha = o.alpha ?? .9; ctx.drawImage(oc, x - cx, y - cy); ctx.restore(); return;
    }
    const [k0, k1, sp, amp, r0, r1, tw] = KIND[kind] || KIND.heap, k = k0 + (r() * (k1 - k0 + 1) | 0), puffs = [];
    for (let i = 0; i < k; i++) { const t = i / (k - 1) - .5; puffs.push({ x: x + flip * (t * s * sp + (r() - .5) * s * .3), y: y - Math.cos(t * Math.PI) * s * amp * (.6 + r() * .6) + (r() - .5) * s * .14, r: s * (r0 + r() * (r1 - r0)) * (1 - Math.abs(t) * .5) }); }
    const nt = tw ? tw - 1 + (r() * 2 | 0) : (r() < .3 ? 1 : 0);
    for (let i = 0; i < nt; i++) { const px = x + flip * (r() - .45) * s * sp * .5; puffs.push({ x: px, y: y - s * amp * (.75 + r() * .4), r: s * (r0 + r() * (r1 - r0)) * .8 }); }
    const bY = px => y + s * .2 + tilt * (px - x);
    const top = Math.min(...puffs.map(p => p.y - p.r)), bx0 = Math.min(...puffs.map(p => p.x - p.r)) - 14, bx1 = Math.max(...puffs.map(p => p.x + p.r)) + 14;
    const by1 = Math.max(bY(bx0), bY(bx1)) + 14, by0 = top - 14, hh = Math.max(1, y + s * .2 - top);
    const oc = document.createElement('canvas'); oc.width = Math.max(4, Math.ceil(bx1 - bx0)); oc.height = Math.max(4, Math.ceil(by1 - by0)); const c = oc.getContext('2d'); c.translate(-bx0, -by0);
    c.fillStyle = rgba(base, .45); c.beginPath(); c.ellipse(x, bY(x) - s * .07, (bx1 - bx0) * .42, s * .1, Math.atan(tilt), 0, 7); c.fill();
    const W2 = puffs.map(p => p.r * p.r), tot = W2.reduce((a, b) => a + b, 0), N = Math.round(cl(1.6 * tot / (s * s * .0144), 110, 440)), dabs = [];
    for (let i = 0; i < N; i++) {
      let q = r() * tot, p = puffs[0]; for (let j = 0; j < puffs.length; j++) { q -= W2[j]; if (q <= 0) { p = puffs[j]; break; } }
      const a = r() * 6.283, rr = Math.sqrt(r()) * p.r * .92, px = p.x + Math.cos(a) * rr, py = Math.min(bY(p.x + Math.cos(a) * rr) - s * .05, p.y + Math.sin(a) * rr);
      const v = cl((py - top) / hh), side = (px - p.x) / p.r, rim = rr / p.r;
      let col = mix(lit, md, ss(.1, .55, v + side * sk)); col = mix(col, sh, ss(.5, .95, v + rim * .12 - .04 + Math.max(0, side) * (sk - .1))); col = mix(col, base, ss(.86, 1, v) * .65);
      if (tint) col = mix(col, tint, ss(.55, 1, v) * .22);
      dabs.push({ px, py, d: s * (.12 + r() * .16) * (1 - rim * .4), col, v, a: .45 + r() * .3 });
    }
    dabs.sort((a, b) => b.v - a.v);
    dabs.forEach(d => { const g = c.createRadialGradient(d.px, d.py, 0, d.px, d.py, d.d); g.addColorStop(0, rgba(d.col, d.a)); g.addColorStop(.6, rgba(d.col, d.a * .7)); g.addColorStop(1, rgba(d.col, 0)); c.fillStyle = g; c.beginPath(); c.arc(d.px, d.py, d.d, 0, 6.283); c.fill(); });
    ctx.save(); ctx.filter = `blur(${Math.max(1.4, s * (kind === 'flat' ? .055 : .03) + (o.blur || 0)).toFixed(1)}px)`; ctx.globalAlpha = o.alpha ?? 1; ctx.drawImage(oc, bx0, by0); ctx.restore();
  };
  /* L = { w, h, k, seed, col, list: [[x, y, s, kind, tilt, flip], ...] } in CSS px of the layer */
  P.deck11 = (cv, L) => {
    const { ctx, w, h } = P.setup(cv, L.w * L.k, L.h * L.k), K = w / L.w; ctx.clearRect(0, 0, w, h);
    L.list.forEach((c, i) => P.cloud11(ctx, c[0] * K, c[1] * K, c[2] * K, P.rng((L.seed || 1) * 31 + i * 17), L.col || PAL.day, c[3], c[4] || 0, c[5] || 1));
    P.grain10(ctx, w, h, P.rng(L.seed || 3), Math.max(1, K * 1.6));
  };
  const quiet = fn => function () { P._noCl = 1; try { return fn.apply(this, arguments); } finally { P._noCl = 0; } };
  if (P.nightSea) P.nightSea = quiet(P.nightSea);
})();

export {};
