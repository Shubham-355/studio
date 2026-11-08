/* Gloved fingertips (thumb + first two fingers, knuckles forward) gripping the letter's top edge, painted SVG.
   Card-local coords (CSS px of the card element, before its transform). The hand reaches in from the upper right; everything
   behind the knuckles sits behind the torn paper edge (clipped by the caller).
   geom(W, H) -> key points; build(prefix, W, H) -> {thumb, front}; edge(out, idxs, c) -> fibres + thickness + soft shadow over the crossing */
(function () {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const nrm = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }, f1 = v => (+v).toFixed(1), pt = p => f1(p[0]) + ' ' + f1(p[1]);
  const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
  function samp(P, W, k) {
    const n = P.length, out = [];
    for (let i = 0; i < n - 1; i++) { const a = P[Math.max(i - 1, 0)], b = P[i], c = P[i + 1], d = P[Math.min(i + 2, n - 1)];
      for (let s = 0; s < k; s++) { const t = s / k; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t), W[i] + (W[i + 1] - W[i]) * t]); } }
    out.push([P[n - 1][0], P[n - 1][1], W[n - 1]]); return out;
  }
  function tube(P, W, o = {}) {
    const S = samp(P, W, o.k || 8), ws = o.ws || 1, sh = o.sh || 0, L = [], R = [];
    for (let i = 0; i < S.length; i++) { const a = S[Math.max(i - 1, 0)], b = S[Math.min(i + 1, S.length - 1)], t = nrm([b[0] - a[0], b[1] - a[1]]), n = [-t[1], t[0]], hw = S[i][2] / 2, c = [S[i][0] + n[0] * hw * sh, S[i][1] + n[1] * hw * sh], w = hw * ws;
      L.push([c[0] + n[0] * w, c[1] + n[1] * w]); R.push([c[0] - n[0] * w, c[1] - n[1] * w]); }
    const r1 = S[S.length - 1][2] / 2 * ws, r0 = S[0][2] / 2 * ws;
    return 'M' + L.map(pt).join('L') + `A${f1(r1)} ${f1(r1)} 0 0 0 ${pt(R[R.length - 1])}L` + R.slice().reverse().map(pt).join('L') + `A${f1(r0)} ${f1(r0)} 0 0 0 ${pt(L[0])}Z`;
  }
  const DIR = nrm([-.8, .6]), NUP = [DIR[1], -DIR[0]]; // DIR: knuckle -> tip (down-left); NUP: across the finger, toward the upper left

  function geom(W, H) {
    const TI = [Math.round(W * .36), 9], LI = 128, KI = sub(TI, mul(DIR, LI));
    const TM = add(add(TI, mul(NUP, 25)), mul(DIR, 9)), LM = 138, KM = sub(TM, mul(DIR, LM));
    const KT = add(KI, [20, 40]), TT = add(TI, [10, 5]);
    const fin = (K, T, L, bend) => { const B = sub(K, mul(DIR, 90)); return [B, K, add(add(K, mul(DIR, L * .52)), mul(NUP, bend)), add(add(K, mul(DIR, L * .8)), mul(NUP, bend * .5)), T]; };
    const IDX = fin(KI, TI, LI, 2.5), MID = fin(KM, TM, LM, 2.5);
    const TH = [add(KT, [38, 34]), KT, add(KT, [-34, 4]), add(TI, [42, -3]), TT];
    return { W, H, TI, TM, TT, KI, KM, KT, IDX, MID, TH, IW: [33, 32, 29, 26.5, 23.5], MW: [32, 31, 28.5, 26, 23], TW: [37, 35, 32, 29, 26],
      hull: [[0, 0], [W, 0], [W, H], [0, H], TI, TM, TT, KI, KM, KT, add(TI, mul(NUP, -14)), add(TM, mul(NUP, 14))] };
  }

  function build(p, W, H) {
    const G = geom(W, H), x0 = -60, y0 = -260, x1 = W + 260, y1 = H + 60;
    const defs = `<defs>
<filter id="${p}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".9"/></filter>
<filter id="${p}b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="${p}b4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="${p}oil" filterUnits="userSpaceOnUse" x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency=".85 .3" numOctaves="2" seed="5" result="g0"/><feColorMatrix in="g0" type="saturate" values="0" result="g"/>
<feComposite in="d" in2="g" operator="arithmetic" k2="1" k3=".14" k4="-.07" result="t"/><feComposite in="t" in2="d" operator="in"/></filter>
<linearGradient id="${p}wm" gradientUnits="userSpaceOnUse" x1="${f1(G.KI[0] + 30)}" y1="${f1(G.KI[1] - 22)}" x2="${f1(G.TI[0])}" y2="${f1(G.TI[1])}"><stop offset="0" stop-color="#F6D7AE" stop-opacity=".85"/><stop offset=".55" stop-color="#F4DEC0" stop-opacity=".35"/><stop offset="1" stop-color="#F4DEC0" stop-opacity="0"/></linearGradient>
</defs>`;
    const finger = (id, P, Wd, joints) => {
      const d = tube(P, Wd, { k: 8 });
      // NUP side faces the moon (cool front edge); the opposite, tear-facing side takes warm daylight on the back of the finger
      const cool = tube(P, Wd, { sh: .74, ws: .2 }), core = tube(P, Wd, { sh: -.12, ws: .34 }), warm = tube(P, Wd, { sh: -.62, ws: .34 }), lit = tube(P, Wd, { sh: .32, ws: .3 });
      const jn = joints.map(([j, deep]) => { const a = P[j], tg = nrm(sub(P[Math.min(j + 1, P.length - 1)], P[Math.max(j - 1, 0)])), nn = [-tg[1], tg[0]], w = Wd[j] / 2, A = add(a, mul(nn, w * .78)), B = add(a, mul(nn, -w * .62)), M = add(a, mul(tg, deep ? 3.4 : 2.4));
        const A2 = add(A, mul(tg, -2.2)), B2 = add(B, mul(tg, -2.2)), M2 = add(M, mul(tg, -2.2));
        return `<path d="M${pt(A)}Q${pt(M)} ${pt(B)}" fill="none" stroke="#C9C4BB" stroke-width="${deep ? 2.6 : 2}" stroke-linecap="round" opacity=".8" filter="url(#${p}b1)"/><path d="M${pt(A2)}Q${pt(M2)} ${pt(B2)}" fill="none" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>`; }).join('');
      return `<clipPath id="${p}${id}"><path d="${d}"/></clipPath><path d="${d}" fill="#F2EEE6"/><g clip-path="url(#${p}${id})">
<path d="${core}" fill="#C9C4BB" opacity=".55" filter="url(#${p}b4)"/><path d="${lit}" fill="#FFFFFD" opacity=".7" filter="url(#${p}b2)"/>
<path d="${warm}" fill="url(#${p}wm)" filter="url(#${p}b2)"/><path d="${cool}" fill="#CBD5EA" opacity=".85" filter="url(#${p}b1)"/>${jn}</g>
<path d="${d}" fill="none" stroke="#9D978D" stroke-opacity=".42" stroke-width=".9"/>`;
    };
    const idx = finger('fi', G.IDX, G.IW, [[1, 1], [2, 0], [3, 0]]), mid = finger('fm', G.MID, G.MW, [[1, 1], [2, 0], [3, 0]]), th = finger('ft', G.TH, G.TW, [[1, 1], [2, 0]]);
    const hand = (() => { const pts = [G.IDX[0], G.MID[0], add(G.MID[0], [60, -30]), add(G.TH[0], [60, 10]), G.TH[0]]; return `<path d="M${pts.map(pt).join('L')}Z" fill="#E9E5DC"/>`; })();
    const cd = `M0 0H${W}V${H}H0Z`;
    const shadow = `<clipPath id="${p}cd"><path d="${cd}"/></clipPath><g clip-path="url(#${p}cd)"><path d="${tube(G.IDX, G.IW)}" transform="translate(4 7)" fill="#1C1424" opacity=".34" filter="url(#${p}b4)"/><path d="${tube(G.MID, G.MW)}" transform="translate(4 8)" fill="#1C1424" opacity=".22" filter="url(#${p}b4)"/></g>`;
    return { thumb: defs + `<g filter="url(#${p}oil)">${hand}${th}</g>`, front: defs + shadow + `<g filter="url(#${p}oil)">${mid}${idx}</g>`, geom: G };
  }

  function edge(out, idxs, c, seed) {
    if (!idxs.length) return ''; const n = out.length, runs = []; let cur = [idxs[0]];
    for (let i = 1; i < idxs.length; i++) { if (idxs[i] - idxs[i - 1] <= 2) cur.push(idxs[i]); else { runs.push(cur); cur = [idxs[i]]; } } runs.push(cur);
    if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][runs[runs.length - 1].length - 1] >= n - 2) { const last = runs.pop(); runs[0] = last.concat(runs[0]); }
    let z = seed || 7; const rnd = () => (z = (z * 16807) % 2147483647) / 2147483647;
    let s = `<defs><filter id="edb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter></defs>`;
    runs.forEach(run => { if (run.length < 2) return; const pts = run.map(i => out[i]), line = 'M' + pts.map(pt).join('L');
      const sh = 'M' + pts.map(q => { const no = nrm(sub(q, c)); return pt(add(q, add(mul(no, 4), [1, 3]))); }).join('L');
      let fib = ''; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 3; k++) { const a = pts[i], b = pts[i + 1], q = add(a, mul(sub(b, a), rnd())), no = nrm(sub(q, c)), tg = nrm(sub(b, a)), l = 1.5 + rnd() * 4.5, w = (rnd() - .5) * 2.4, e = add(add(q, mul(no, l)), mul(tg, w));
        fib += `<path d="M${pt(add(q, mul(no, -.6)))}Q${pt(add(add(q, mul(no, l * .5)), mul(tg, w * .2 + (rnd() - .5))))} ${pt(e)}" fill="none" stroke="#F3ECDF" stroke-opacity="${(.6 + rnd() * .4).toFixed(2)}" stroke-width="${(.5 + rnd() * .6).toFixed(2)}" stroke-linecap="round"/>`; }
      s += `<path d="${sh}" fill="none" stroke="#04050B" stroke-opacity=".55" stroke-width="8" stroke-linecap="round" filter="url(#edb)"/><path d="${line}" fill="none" stroke="#D8CDB8" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/><path d="${line}" fill="none" stroke="#F6F1E6" stroke-width="1.4" stroke-linejoin="round" transform="translate(-.5 -.6)"/>${fib}`; });
    return s;
  }
  window.Tips = { geom, build, edge };
})();

export {};
