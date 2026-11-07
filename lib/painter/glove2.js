/* Painted arm v2: charcoal wool sleeve out of the sky inside the tear, white shirt cuff, white cotton glove pinching the letter.
   Local coords: origin = pinch point, 1 unit = 1px at scale 1. Wrist centre WC sits above the pinch.
   build(prefix, {f: wrist->far dir, Le: wrist->far length, card: [[x,y]x4], R: tear radius (local)}) -> {back, thumb, front}
   curve(o) -> sampled sleeve centreline (local) for crossing tests
   edge(outPoly, E, c, R, seed) -> torn-paper fibres, thickness and soft shadow laid over the sleeve where it leaves the tear (world coords) */
(function () {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const nrm = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }, f1 = v => (+v).toFixed(1), pt = p => f1(p[0]) + ' ' + f1(p[1]);
  const LD = nrm([-.6, -.8]), WC = [40, -102.5];
  const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
  function samp(P, W, k) {
    const n = P.length, out = [];
    for (let i = 0; i < n - 1; i++) { const a = P[Math.max(i - 1, 0)], b = P[i], c = P[i + 1], d = P[Math.min(i + 2, n - 1)];
      for (let s = 0; s < k; s++) { const t = s / k; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t), W[i] + (W[i + 1] - W[i]) * t]); } }
    out.push([P[n - 1][0], P[n - 1][1], W[n - 1]]); return out;
  }
  function closed(P, k) {
    const n = P.length, out = [];
    for (let i = 0; i < n; i++) { const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n], d = P[(i + 2) % n];
      for (let s = 0; s < k; s++) { const t = s / k; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]); } }
    return 'M' + out.map(pt).join('L') + 'Z';
  }
  // tapered soft tube; sh shifts the centre across the width (-1..1), ws scales the width
  function tube(P, W, o = {}) {
    const S = samp(P, W, o.k || 8), ws = o.ws || 1, sh = o.sh || 0, L = [], R = [];
    for (let i = 0; i < S.length; i++) { const a = S[Math.max(i - 1, 0)], b = S[Math.min(i + 1, S.length - 1)], t = nrm([b[0] - a[0], b[1] - a[1]]), n = [-t[1], t[0]], hw = S[i][2] / 2, c = [S[i][0] + n[0] * hw * sh, S[i][1] + n[1] * hw * sh], w = hw * ws;
      L.push([c[0] + n[0] * w, c[1] + n[1] * w]); R.push([c[0] - n[0] * w, c[1] - n[1] * w]); }
    const r1 = S[S.length - 1][2] / 2 * ws, r0 = S[0][2] / 2 * ws;
    return 'M' + L.map(pt).join('L') + `A${f1(r1)} ${f1(r1)} 0 0 0 ${pt(R[R.length - 1])}L` + R.slice().reverse().map(pt).join('L') + `A${f1(o.cap0 || r0)} ${f1(r0)} 0 0 0 ${pt(L[0])}Z`;
  }
  const litSign = P => { const t = nrm(sub(P[P.length - 1], P[0])), n = [-t[1], t[0]]; return n[0] * LD[0] + n[1] * LD[1] > 0 ? 1 : -1; };

  function curve(o) {
    const f = nrm(o.f), Le = Math.max(80, o.Le || 200), S0 = add(WC, mul(f, 9));
    let n0 = [-f[1], f[0]]; if (n0[1] < 0) n0 = mul(n0, -1);
    const F = add(S0, mul(f, Le * 1.04)), C = add(add(S0, mul(f, Le * .5)), mul(n0, Le * .12)), P = [], T = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16, u = 1 - t; P.push([u * u * S0[0] + 2 * u * t * C[0] + t * t * F[0], u * u * S0[1] + 2 * u * t * C[1] + t * t * F[1]]); T.push(t); }
    return { P, T, S0, F, C, n0, f, Le };
  }
  const widthAt = t => 58 + 6 * Math.exp(-Math.pow((t - .08) / .05, 2)) - 18 * Math.pow(t, 1.3);

  function build(p, o) {
    const cv = curve(o), { P, T, S0, F, n0, f } = cv, W = T.map(widthAt), s = litSign(P), fa = Math.atan2(f[1], f[0]) * 180 / Math.PI, R = o.R || 160;
    const h = nrm(mul(WC, -1)), r = [-h[1], h[0]].map(v => -v); // h: wrist -> fingertips, r: toward the thumb (viewer's right)
    const rr = r[0] > 0 ? r : mul(r, -1), H = (a, b) => add(add(WC, mul(h, a)), mul(rr, b));
    const at = t => { const i = Math.min(15, Math.floor(t * 16)), u = t * 16 - i, a = P[i], b = P[i + 1]; return [add(a, mul(sub(b, a), u)), nrm(sub(b, a))]; };
    const xs = P.map(q => q[0]).concat([-60, 60]), ys = P.map(q => q[1]).concat([-140, 40]);
    const bx = [Math.min(...xs) - R * .6, Math.min(...ys) - R * .6, Math.max(...xs) + R * .6, Math.max(...ys) + R * .6];
    const defs = `<defs>
<filter id="${p}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".8"/></filter>
<filter id="${p}b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.8"/></filter>
<filter id="${p}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="${p}b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="${p}b12" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="${p}oil" filterUnits="userSpaceOnUse" x="${f1(bx[0])}" y="${f1(bx[1])}" width="${f1(bx[2] - bx[0])}" height="${f1(bx[3] - bx[1])}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency=".9 .35" numOctaves="2" seed="3" result="g0"/><feColorMatrix in="g0" type="saturate" values="0" result="g"/>
<feComposite in="d" in2="g" operator="arithmetic" k2="1" k3=".16" k4="-.08" result="t"/><feComposite in="t" in2="d" operator="in"/></filter>
<pattern id="${p}wl" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(${f1(fa + 52)})"><rect width="3" height="1" fill="#FFFFFF" fill-opacity=".03"/><rect y="1.6" width="3" height=".8" fill="#000000" fill-opacity=".1"/></pattern>
<linearGradient id="${p}fd" gradientUnits="userSpaceOnUse" x1="${f1(S0[0])}" y1="${f1(S0[1])}" x2="${f1(F[0])}" y2="${f1(F[1])}"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".48" stop-color="#FFFFFF"/><stop offset=".9" stop-color="#000000"/></linearGradient>
<mask id="${p}fm" maskUnits="userSpaceOnUse" x="${f1(bx[0])}" y="${f1(bx[1])}" width="${f1(bx[2] - bx[0])}" height="${f1(bx[3] - bx[1])}"><rect x="${f1(bx[0])}" y="${f1(bx[1])}" width="${f1(bx[2] - bx[0])}" height="${f1(bx[3] - bx[1])}" fill="url(#${p}fd)"/></mask>
<linearGradient id="${p}hz" gradientUnits="userSpaceOnUse" x1="${f1(S0[0])}" y1="${f1(S0[1])}" x2="${f1(F[0])}" y2="${f1(F[1])}"><stop offset=".25" stop-color="#8FB2E0" stop-opacity="0"/><stop offset=".6" stop-color="#8DB0DE" stop-opacity=".55"/><stop offset=".74" stop-color="#8AAEDC" stop-opacity="1"/></linearGradient>
<linearGradient id="${p}ol" gradientUnits="userSpaceOnUse" x1="${f1(S0[0])}" y1="${f1(S0[1])}" x2="${f1(F[0])}" y2="${f1(F[1])}"><stop offset=".3" stop-color="#0E0D10" stop-opacity=".45"/><stop offset=".7" stop-color="#0E0D10" stop-opacity="0"/></linearGradient>
<radialGradient id="${p}gl" gradientUnits="userSpaceOnUse" cx="${f1(H(30, -16)[0])}" cy="${f1(H(30, -16)[1])}" r="62"><stop offset="0" stop-color="#FFFFFC"/><stop offset=".55" stop-color="#F2EEE6"/><stop offset="1" stop-color="#D6D1C8"/></radialGradient>
<linearGradient id="${p}cf" gradientUnits="userSpaceOnUse" x1="0" y1="-22" x2="0" y2="22"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".45" stop-color="#F3F2EE"/><stop offset="1" stop-color="#B9BAC0"/></linearGradient>
</defs>`;
    // sleeve
    const sd = tube(P, W, { cap0: 9, k: 6 }), sl = (o2) => tube(P, W, Object.assign({ k: 6 }, o2));
    const crease = (t, side, len, curl, dark) => { const [c, tg] = at(t), nn = [-tg[1], tg[0]], hw = widthAt(t) / 2, e = add(c, mul(nn, side * hw * .98)), m = add(add(c, mul(nn, side * hw * (1 - len * .5))), mul(tg, curl)), q = add(c, mul(nn, side * hw * (1 - len)));
      const d = `M${pt(e)}Q${pt(m)} ${pt(q)}`, d2 = `M${pt(add(e, mul(tg, 2.4)))}Q${pt(add(m, mul(tg, 2.4)))} ${pt(add(q, mul(tg, 2.4)))}`;
      return `<path d="${d}" fill="none" stroke="#0F0E11" stroke-opacity="${dark || .75}" stroke-width="3" stroke-linecap="round" filter="url(#${p}b2)"/><path d="${d2}" fill="none" stroke="#56566A" stroke-opacity=".45" stroke-width="2" stroke-linecap="round" filter="url(#${p}b1)"/>`; };
    const nb = (() => { const [c, tg] = at(.5); const nn = [-tg[1], tg[0]]; return nn[0] * n0[0] + nn[1] * n0[1] > 0 ? -1 : 1; })(); // concave (inner) side of the elbow
    const folds = crease(.42, nb, .5, -3) + crease(.49, nb, .62, -3.5) + crease(.56, nb, .44, -3) + crease(.47, -nb, .2, 2, .45)
      + crease(.05, s, .28, 2) + crease(.1, s, .22, 2, .6) + crease(.07, -s, .3, -2) + crease(.13, -s, .2, -2, .55);
    const sleeve = (back) => `<clipPath id="${p}sl${back ? 'k' : ''}"><path d="${sd}"/></clipPath><g clip-path="url(#${p}sl${back ? 'k' : ''})">
<path d="${sd}" fill="#2B2A2E"/><path d="${sd}" fill="url(#${p}wl)"/>
<path d="${sl({ sh: -s * .62, ws: .48 })}" fill="#17161A" opacity=".75" filter="url(#${p}b6)"/>
<path d="${sl({ sh: s * .42, ws: .42 })}" fill="#38373F" opacity=".6" filter="url(#${p}b6)"/>
<path d="${sl({ sh: s * .8, ws: .16 })}" fill="#7C87A4" opacity=".42" filter="url(#${p}b6)"/>
${back ? `<path d="${sl({ sh: -s * .8, ws: .2 })}" fill="#EFD2B0" opacity=".28" filter="url(#${p}b3)"/>` : ''}
${folds}
${back ? `<rect x="${f1(bx[0])}" y="${f1(bx[1])}" width="${f1(bx[2] - bx[0])}" height="${f1(bx[3] - bx[1])}" fill="url(#${p}hz)"/>` : ''}
</g><path d="${sd}" fill="none" stroke="${back ? `url(#${p}ol)` : '#0E0D10'}" stroke-opacity="${back ? 1 : .45}" stroke-width=".8"/>`;
    // shirt cuff with a button, between sleeve and glove
    const cuff = `<g transform="translate(${pt(S0)}) rotate(${f1(fa)})"><path d="M2 -22L-11 -22A3.5 22 0 0 0 -11 22L2 22Z" fill="url(#${p}cf)"/><path d="M-11 -22A3.5 22 0 0 0 -11 22" fill="none" stroke="#FFFFFF" stroke-width="1"/><path d="M-11 -22A3.5 22 0 0 0 -11 22" fill="none" stroke="#6A6872" stroke-opacity=".5" stroke-width="2.4" transform="translate(-2 0)" filter="url(#${p}b1)"/><path d="M2 -22L-11 -22M2 22L-11 22" stroke="#8E8C92" stroke-opacity=".5" stroke-width=".8"/>
<circle cx="-5" cy="13" r="2.7" fill="#ECE9E2" stroke="#9C98A0" stroke-width=".7"/><circle cx="-5.8" cy="12.6" r=".55" fill="#8A8690"/><circle cx="-4.2" cy="13.4" r=".55" fill="#8A8690"/>
<rect x="-1" y="-22" width="4" height="44" fill="#141317" opacity=".55" filter="url(#${p}b1)"/></g>`;
    // glove
    const fin = (id, Pts, Wd, joints) => {
      const d = tube(Pts, Wd, { k: 8 }), sg = litSign(Pts) * (rr[0] > 0 ? 1 : 1);
      const jn = joints.map(j => { const [a, b] = [Pts[j], Pts[Math.min(j + 1, Pts.length - 1)]], tg = nrm(sub(b, a)), nn = [-tg[1], tg[0]], w = Wd[j] / 2, A = add(a, mul(nn, w * .7)), B = add(a, mul(nn, -w * .7)), M = add(a, mul(tg, 2));
        return `<path d="M${pt(A)}Q${pt(M)} ${pt(B)}" fill="none" stroke="#C9C4BB" stroke-width="2.2" stroke-linecap="round" opacity=".7" filter="url(#${p}b1)"/>`; }).join('');
      return `<clipPath id="${p}${id}"><path d="${d}"/></clipPath><path d="${d}" fill="#F2EEE6"/><g clip-path="url(#${p}${id})"><path d="${tube(Pts, Wd, { sh: -sg * .6, ws: .55 })}" fill="#C9C4BB" filter="url(#${p}b3)"/><path d="${tube(Pts, Wd, { sh: sg * .5, ws: .3 })}" fill="#FFFFFD" opacity=".9" filter="url(#${p}b2)"/>${jn}</g><path d="${d}" fill="none" stroke="#A39D92" stroke-opacity=".38" stroke-width=".8"/>`;
    };
    const IDX = [H(56, 16), H(76, 18), H(97, 14.5), H(114, 7)], IDW = [15.5, 14, 12.6, 11.2];
    const MID = [H(60, 4), H(75, 1.5), H(84, -5.5), H(84, -14)], MDW = [15.2, 13.8, 12.4, 11];
    const RNG = [H(57, -8), H(70, -12), H(77, -19), H(76, -27)], RGW = [14.2, 13, 11.8, 10.6];
    const LIT = [H(52, -19), H(62, -24.5), H(67, -31.5), H(65, -38.5)], LTW = [12.6, 11.6, 10.6, 9.6];
    const TH = [H(26, 24), H(48, 35), H(80, 31), H(109, 13)], THW = [19, 17, 14.6, 12.6];
    const nP = (() => { const q = [-f[1], f[0]]; return (q[0] * rr[0] + q[1] * rr[1]) < 0 ? q : mul(q, -1); })(); // sleeve perp toward the little-finger side
    const cA = add(add(S0, mul(f, -9)), mul(nP, 19)), cB = add(add(S0, mul(f, -9)), mul(nP, -19));
    const PALM = [cA, H(12, -23), H(34, -26.5), H(50, -24), H(59, -12), H(62, 2), H(59, 17), H(47, 26), H(28, 27), H(12, 23), cB];
    const pd = closed(PALM, 8);
    const stitch = [[H(16, -12), H(50, -15), H(33, -12.5)], [H(16, -1), H(54, 1), H(35, .5)], [H(16, 10), H(51, 14), H(34, 12.5)]].map(([a, b, m]) =>
      `<path d="M${pt(add(a, [-.8, -.8]))}Q${pt(add(m, [-.8, -.8]))} ${pt(add(b, [-.8, -.8]))}" fill="none" stroke="#FFFFFF" stroke-opacity=".85" stroke-width=".8" stroke-dasharray="2.2 1.6" stroke-linecap="round"/><path d="M${pt(a)}Q${pt(m)} ${pt(b)}" fill="none" stroke="#B3ADA3" stroke-width=".85" stroke-dasharray="2.2 1.6" stroke-linecap="round"/>`).join('');
    const wfold = (() => { const A = H(9, -18), B = H(9, 17), M = H(13, 0); return `<path d="M${pt(A)}Q${pt(M)} ${pt(B)}" fill="none" stroke="#C9C4BB" stroke-width="3" stroke-linecap="round" opacity=".9" filter="url(#${p}b1)"/><path d="M${pt(add(A, mul(h, 2.6)))}Q${pt(add(M, mul(h, 2.6)))} ${pt(add(B, mul(h, 2.6)))}" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`; })();
    const knuck = [H(57, 16), H(60, 4), H(57, -8), H(52, -19)].map((K, i) => `<ellipse cx="${f1(K[0])}" cy="${f1(K[1])}" rx="5.5" ry="3.6" fill="#FFFFFF" opacity="${(.75 - i * .1).toFixed(2)}" filter="url(#${p}b2)"/>`).join('');
    const gaps = [H(58, 10), H(58, -2), H(54, -13.5)].map(g => `<circle cx="${f1(g[0])}" cy="${f1(g[1])}" r="3.4" fill="#BDB7AD" opacity=".6" filter="url(#${p}b2)"/>`).join('');
    const palm = `<clipPath id="${p}pm"><path d="${pd}"/></clipPath><path d="${pd}" fill="url(#${p}gl)"/><g clip-path="url(#${p}pm)"><path d="${pd}" fill="none" stroke="#C9C4BB" stroke-width="10" filter="url(#${p}b3)"/>${gaps}${knuck}${stitch}${wfold}<path d="M${pt(H(20, 26))}Q${pt(H(40, 30))} ${pt(H(56, 22))}" fill="none" stroke="#BDB7AD" stroke-width="5" filter="url(#${p}b2)"/></g>`;
    const fingers = fin('fl', LIT, LTW, [1, 2]) + fin('fr', RNG, RGW, [1, 2]) + fin('fm', MID, MDW, [1, 2]);
    const index = fin('fi', IDX, IDW, [1, 2]), thumb = fin('th', TH, THW, [1, 2]);
    let shadow = '';
    if (o.card) { const cd = 'M' + o.card.map(pt).join('L') + 'Z';
      shadow = `<clipPath id="${p}cd"><path d="${cd}"/></clipPath><g clip-path="url(#${p}cd)"><path d="${tube(IDX, IDW)}" transform="translate(3 6)" fill="#1C1424" opacity=".4" filter="url(#${p}b3)"/><path d="${tube(MID, MDW)}" transform="translate(3 7)" fill="#1C1424" opacity=".22" filter="url(#${p}b3)"/><path d="${tube(TH.slice(2), THW.slice(2))}" transform="translate(-2 4)" fill="#1C1424" opacity=".18" filter="url(#${p}b3)"/></g>`; }
    // far end dissolves into a little cloud bank deep in the day sky
    const rs = (() => { let z = 29; return () => (z = (z * 16807) % 2147483647) / 2147483647; })(), puffs = [];
    for (let i = 0; i < 11; i++) { const a = rs() * Math.PI * 2, d = R * (.04 + rs() * .2), c = add(F, add(mul(f, -R * .1), [Math.cos(a) * d * 1.3, Math.sin(a) * d * .45])), rx = R * (.08 + rs() * .1);
      puffs.push(`<ellipse cx="${f1(c[0])}" cy="${f1(c[1] + rx * .18)}" rx="${f1(rx)}" ry="${f1(rx * .62)}" fill="#AFC2DC" opacity=".55" filter="url(#${p}b6)"/><ellipse cx="${f1(c[0] - rx * .08)}" cy="${f1(c[1])}" rx="${f1(rx * .9)}" ry="${f1(rx * .55)}" fill="#FBFCFF" opacity=".92" filter="url(#${p}b6)"/>`); }
    const cloud = `<ellipse cx="${f1(F[0])}" cy="${f1(F[1])}" rx="${f1(R * .36)}" ry="${f1(R * .16)}" fill="#C9DAF0" opacity=".6" filter="url(#${p}b12)"/>` + puffs.join('');
    const hand = fingers + palm + index;
    return {
      back: defs + `<g filter="url(#${p}oil)">${sleeve(true)}${cloud}${thumb}${hand}${cuff}</g>`,
      thumb: defs + `<g filter="url(#${p}oil)">${thumb}</g>`,
      front: defs + shadow + `<g filter="url(#${p}oil)">${sleeve(false)}${hand}${cuff}</g>`,
    };
  }

  function edge(out, E, c, R, seed) {
    let bi = 0, bd = 1e9; out.forEach((q, i) => { const d = Math.hypot(q[0] - E[0], q[1] - E[1]); if (d < bd) { bd = d; bi = i; } });
    const n = out.length, idx = [bi]; for (let j = 1; j < n / 4; j++) { const q = out[(bi - j + n) % n]; if (Math.hypot(q[0] - E[0], q[1] - E[1]) > R) break; idx.unshift((bi - j + n) % n); }
    for (let j = 1; j < n / 4; j++) { const q = out[(bi + j) % n]; if (Math.hypot(q[0] - E[0], q[1] - E[1]) > R) break; idx.push((bi + j) % n); }
    if (idx.length < 3) return '';
    let z = seed || 7; const rnd = () => (z = (z * 16807) % 2147483647) / 2147483647;
    const pts = idx.map(i => out[i]), line = 'M' + pts.map(pt).join('L');
    const sh = 'M' + pts.map(q => { const no = nrm(sub(q, c)); return pt(add(q, add(mul(no, 3.5), [1, 3]))); }).join('L');
    let fib = '';
    for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 3; k++) { const a = pts[i], b = pts[i + 1], u = rnd(), q = add(a, mul(sub(b, a), u)), no = nrm(sub(q, c)), tg = nrm(sub(b, a)), l = 1.5 + rnd() * 4.5, w = (rnd() - .5) * 2.4, e = add(add(q, mul(no, l)), mul(tg, w));
      fib += `<path d="M${pt(add(q, mul(no, -.6)))}Q${pt(add(add(q, mul(no, l * .5)), mul(tg, w * .2 + (rnd() - .5))))} ${pt(e)}" fill="none" stroke="#F3ECDF" stroke-opacity="${(.6 + rnd() * .4).toFixed(2)}" stroke-width="${(.5 + rnd() * .6).toFixed(2)}" stroke-linecap="round"/>`; }
    const t0 = pts[0], t1 = pts[pts.length - 1];
    return `<defs><filter id="edb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter><linearGradient id="edf" gradientUnits="userSpaceOnUse" x1="${f1(t0[0])}" y1="${f1(t0[1])}" x2="${f1(t1[0])}" y2="${f1(t1[1])}"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset=".2" stop-color="#FFFFFF"/><stop offset=".8" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient><mask id="edm" maskUnits="userSpaceOnUse" x="-9999" y="-9999" width="19998" height="19998"><rect x="-9999" y="-9999" width="19998" height="19998" fill="url(#edf)"/></mask></defs>
<g mask="url(#edm)"><path d="${sh}" fill="none" stroke="#04050B" stroke-opacity=".6" stroke-width="7" stroke-linecap="round" filter="url(#edb)"/><path d="${line}" fill="none" stroke="#D8CDB8" stroke-width="3.2" stroke-linejoin="round"/><path d="${line}" fill="none" stroke="#F6F1E6" stroke-width="1.4" stroke-linejoin="round" transform="translate(-.5 -.6)"/>${fib}</g>`;
  }
  window.Glove = { build, curve, edge, flap: edge };
})();

export {};
