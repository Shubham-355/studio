/* White dress glove + charcoal coat sleeve, layered SVG. Local coords: origin = pinch point, 1 unit = 1px at scale 1.
   build(prefix, {f:[dx,dy] forearm dir (wrist -> elbow), Le: elbow distance, card: [[x,y]x4]}) -> {back, thumb, front}
   flap(outPoly, E, c, R) -> curled paper lip over the sleeve where it crosses the tear edge */
(function () {
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const nrm = a => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }, f1 = v => (+v).toFixed(1), pt = p => f1(p[0]) + ' ' + f1(p[1]);
  const LD = nrm([-.6, -.8]);
  const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
  function samp(P, W, k) {
    const n = P.length, out = [];
    for (let i = 0; i < n - 1; i++) { const a = P[Math.max(i - 1, 0)], b = P[i], c = P[i + 1], d = P[Math.min(i + 2, n - 1)];
      for (let s = 0; s < k; s++) { const t = s / k; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t), W[i] + (W[i + 1] - W[i]) * t]); } }
    out.push([P[n - 1][0], P[n - 1][1], W[n - 1]]); return out;
  }
  function sampClosed(P, k) {
    const n = P.length, out = [];
    for (let i = 0; i < n; i++) { const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n], d = P[(i + 2) % n];
      for (let s = 0; s < k; s++) { const t = s / k; out.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]); } }
    return 'M' + out.map(pt).join('L') + 'Z';
  }
  function tube(P, W, o = {}) {
    const S = samp(P, W, o.k || 8), ws = o.ws || 1, sh = o.sh || 0, L = [], R = [];
    for (let i = 0; i < S.length; i++) { const a = S[Math.max(i - 1, 0)], b = S[Math.min(i + 1, S.length - 1)], t = nrm([b[0] - a[0], b[1] - a[1]]), n = [-t[1], t[0]], hw = S[i][2] / 2, c = [S[i][0] + n[0] * hw * sh, S[i][1] + n[1] * hw * sh], w = hw * ws;
      L.push([c[0] + n[0] * w, c[1] + n[1] * w]); R.push([c[0] - n[0] * w, c[1] - n[1] * w]); }
    const r1 = S[S.length - 1][2] / 2 * ws, r0 = S[0][2] / 2 * ws, e = R[R.length - 1], s0 = L[0];
    let d = 'M' + L.map(pt).join('L') + `A${f1(r1)} ${f1(r1)} 0 0 0 ${pt(e)}L` + R.slice().reverse().map(pt).join('L');
    d += o.cap0 ? `A${f1(o.cap0)} ${f1(r0)} 0 0 0 ${pt(s0)}Z` : `A${f1(r0)} ${f1(r0)} 0 0 0 ${pt(s0)}Z`;
    return d;
  }
  const litSign = P => { const t = nrm(sub(P[P.length - 1], P[0])), n = [-t[1], t[0]]; return n[0] * LD[0] + n[1] * LD[1] > 0 ? 1 : -1; };
  function crease(p, q, w, s, tipward) {
    const t = nrm(sub(q, p)), n = [-t[1], t[0]], a = add(p, mul(n, s * w * .44)), b = add(add(p, mul(n, s * w * .02)), mul(t, 1.2)), m = add(mul(add(a, b), .5), mul(t, tipward ? 2.2 : -2.2));
    const a2 = add(a, mul(t, -1.3)), b2 = add(b, mul(t, -1.3)), m2 = add(m, mul(t, -1.3));
    return `<path d="M${pt(a2)}Q${pt(m2)} ${pt(b2)}" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="1" stroke-linecap="round"/><path d="M${pt(a)}Q${pt(m)} ${pt(b)}" fill="none" stroke="#ADA69B" stroke-width="1" stroke-linecap="round"/>`;
  }

  function build(p, o) {
    const f = nrm(o.f), fa = Math.atan2(f[1], f[0]) * 180 / Math.PI, Le = Math.max(80, o.Le || 200);
    const u = [-.342, .94], v = [.94, .342];
    const Ki = [18, -50], Km = [3, -55.5], Kr = [-11.1, -60.6], Kl = [-24.3, -65.4], Wc = [15.3, -108.5], Wt = add(Wc, mul(v, 21)), Wl = add(Wc, mul(v, -21));
    const defs = `<defs>
<filter id="${p}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>
<filter id="${p}b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.7"/></filter>
<filter id="${p}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.8"/></filter>
<filter id="${p}b5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4.5"/></filter>
<linearGradient id="${p}pg" gradientUnits="userSpaceOnUse" x1="${f1(Wc[0] - 30 * v[0] - 20 * u[0])}" y1="${f1(Wc[1] - 30 * v[1] - 20 * u[1])}" x2="${f1(Wc[0] + 28 * v[0] + 30 * u[0])}" y2="${f1(Wc[1] + 28 * v[1] + 30 * u[1])}"><stop offset="0" stop-color="#FCFAF5"/><stop offset=".5" stop-color="#F2EEE6"/><stop offset="1" stop-color="#D2CDC4"/></linearGradient>
<linearGradient id="${p}cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F1F1EE"/><stop offset="1" stop-color="#B7B8BC"/></linearGradient>
<linearGradient id="${p}sw" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${f1(Le * 1.1)}" y2="0"><stop offset="0" stop-color="#A3735C" stop-opacity=".22"/><stop offset="1" stop-color="#C08A66" stop-opacity=".62"/></linearGradient>
<pattern id="${p}wl" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="3.2" height="1.1" fill="#FFFFFF" fill-opacity=".035"/><rect y="1.6" width="3.2" height=".7" fill="#000000" fill-opacity=".09"/></pattern>
</defs>`;
    const gTube = (id, P, W, joints, curl) => {
      const d = tube(P, W), s = litSign(P), sh = tube(P, W, { sh: -s * .55, ws: .55 }), hi = tube(P, W, { sh: s * .52, ws: .28 });
      let ex = ''; (joints || []).forEach(j => { ex += crease(P[j], P[j + 1] || P[j], W[j], s, true); });
      if (curl) ex = `<path d="${tube(P.slice(curl), W.slice(curl))}" fill="#BDB7AD" opacity=".55" filter="url(#${p}b3)"/>` + ex;
      return `<clipPath id="${p}${id}"><path d="${d}"/></clipPath><path d="${d}" fill="#F2EEE6"/><g clip-path="url(#${p}${id})"><path d="${sh}" fill="#C9C4BB" filter="url(#${p}b3)"/><path d="${hi}" fill="#FFFFFD" opacity=".85" filter="url(#${p}b2)"/>${ex}</g><path d="${d}" fill="none" stroke="#9A9388" stroke-opacity=".62" stroke-width=".9"/>`;
    };
    const IDX = [Ki, [8.3, -25.9], [5.1, -8.2], [-.1, -.8]], IDW = [16, 14.6, 13.2, 11.6];
    const MID = [Km, [-6.9, -37], [-5.4, -25.1], [-2.2, -21.3]], RNG = [Kr, [-23.8, -46.5], [-25.1, -35.6], [-23, -31.6]], LIT = [Kl, [-37.9, -56.9], [-41.4, -48.6], [-40.6, -44.7]];
    const TH = [add(Wt, add(mul(u, 22), mul(v, 3))), [33, -55], [25.5, -30], [14, -3]], THW = [18.5, 16.8, 15, 13];
    const thumb = gTube('th', TH, THW, [1, 2]);
    const fingers = gTube('fl', LIT, [12.6, 11.4, 10.2, 9.2], [1], 1) + gTube('fr', RNG, [14.4, 13, 11.6, 10.4], [1], 1) + gTube('fm', MID, [15.4, 14, 12.4, 11], [1], 1) + gTube('fi', IDX, IDW, [1, 2]);
    const gw = tube([add(Wc, mul(f, -4)), add(Wc, mul(f, 8)), add(Wc, mul(f, 18))], [42, 41, 40]);
    const gnf = [-f[1], f[0]], fold = (k, a, b) => { const c = add(Wc, mul(f, k)), A = add(c, mul(gnf, a)), B = add(c, mul(gnf, b)), M = add(mul(add(A, B), .5), mul(f, -2.6)); return `<path d="M${pt(A)}Q${pt(M)} ${pt(B)}" fill="none" stroke="#B4AEA4" stroke-width="1.2" stroke-linecap="round"/><path d="M${pt(add(A, mul(f, -1.4)))}Q${pt(add(M, mul(f, -1.4)))} ${pt(add(B, mul(f, -1.4)))}" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width=".9" stroke-linecap="round"/>`; };
    const gaunt = `<clipPath id="${p}gw"><path d="${gw}"/></clipPath><path d="${gw}" fill="#ECE8E0"/><g clip-path="url(#${p}gw)"><path d="${gw}" fill="none" stroke="#C3BDB3" stroke-width="8" filter="url(#${p}b3)"/>${fold(4, 17, -12)}${fold(9.5, -6, -17)}</g><path d="${gw}" fill="none" stroke="#9A9388" stroke-opacity=".55" stroke-width=".9"/>`;
    const PALM = [Wl, [-23, -92], [-33, -66], [-26.4, -59.8], [-13.1, -55], [.9, -49.9], [16, -44.4], [25.5, -47.3], [32, -72], Wt, [24, -111], [6, -114]];
    const pd = sampClosed(PALM, 8);
    const kn = [Ki, Km, Kr, Kl].map((K, i) => { const c = add(K, mul(u, 3.5 - i * .3)); return `<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${5.5 - i * .5}" ry="3.6" transform="rotate(${f1(Math.atan2(v[1], v[0]) * 180 / Math.PI)} ${f1(c[0])} ${f1(c[1])})" fill="#FFFFFF" opacity=".8" filter="url(#${p}b2)"/>`; }).join('');
    const gaps = [[10.5, -52.8], [-4, -58], [-17.7, -63]].map(g => `<circle cx="${f1(g[0] - 3 * u[0])}" cy="${f1(g[1] - 3 * u[1])}" r="3.6" fill="#B8B2A8" opacity=".55" filter="url(#${p}b2)"/>`).join('');
    const st = [[[17.3, -92.9], [14.6, -64.1]], [[10.1, -95.5], [.1, -69.3]], [[3.2, -97.9], [-13.6, -74.3]]].map(([a, b]) => { const m = add(mul(add(a, b), .5), mul(v, 1.4)), o2 = mul(v, -1.1);
      return `<path d="M${pt(add(a, o2))}Q${pt(add(m, o2))} ${pt(add(b, o2))}" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width=".9" stroke-linecap="round"/><path d="M${pt(a)}Q${pt(m)} ${pt(b)}" fill="none" stroke="#B1AB9F" stroke-width=".9" stroke-linecap="round"/>`; }).join('');
    const palm = `<clipPath id="${p}pm"><path d="${pd}"/></clipPath><path d="${pd}" fill="url(#${p}pg)"/><g clip-path="url(#${p}pm)"><path d="${pd}" fill="none" stroke="#C4BEB4" stroke-width="9" filter="url(#${p}b3)"/>${gaps}${kn}${st}<path d="M${pt(add(Wt, mul(u, 6)))}Q${pt([34, -86])} ${pt([32, -75])}" fill="none" stroke="#BDB7AD" stroke-width="4" filter="url(#${p}b2)"/></g><path d="${pd}" fill="none" stroke="#9A9388" stroke-opacity=".5" stroke-width=".9"/>`;
    // sleeve, in its own frame: x along forearm from the cuff toward the elbow, -y = moonlit top
    const S0 = add(Wc, mul(f, 12)), ba = -25 * Math.PI / 180, up = (d) => [Le + Math.cos(ba) * d, Math.sin(ba) * d];
    const SP = [[6, 0], [Le * .5, 1.2], [Le, 0], up(260), up(1500)], SW = [50, 57, 62, 64, 66];
    const sd = tube(SP, SW, { cap0: 7, k: 10 }), creaseS = (x0, y0, x1, y1, x2, y2) => `<path d="M${f1(x0)} ${f1(y0)}Q${f1(x1)} ${f1(y1)} ${f1(x2)} ${f1(y2)}" fill="none" stroke="#7E88A6" stroke-opacity=".38" stroke-width="1.4" stroke-linecap="round" transform="translate(-2.2 0)"/><path d="M${f1(x0)} ${f1(y0)}Q${f1(x1)} ${f1(y1)} ${f1(x2)} ${f1(y2)}" fill="none" stroke="#161518" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round" filter="url(#${p}b1)"/>`;
    const sleeve = `<g transform="translate(${pt(S0)}) rotate(${f1(fa)})"><clipPath id="${p}sl"><path d="${sd}"/></clipPath><path d="${sd}" fill="#2B2A2E"/><g clip-path="url(#${p}sl)">
<path d="${sd}" fill="url(#${p}wl)"/>
<path d="${tube(SP, SW, { sh: -.3, ws: .5, k: 10 })}" fill="#3A3A43" opacity=".7" filter="url(#${p}b5)"/>
<path d="${tube(SP, SW, { sh: -.66, ws: .26, k: 10 })}" fill="#7A86A6" opacity=".7" filter="url(#${p}b5)"/>
<path d="${tube(SP, SW, { sh: .64, ws: .3, k: 10 })}" fill="url(#${p}sw)" filter="url(#${p}b5)"/>
<path d="M30 -9Q${f1(Le * .5)} -12 ${f1(Le - 40)} -8" fill="none" stroke="#141316" stroke-opacity=".6" stroke-width="3" filter="url(#${p}b2)"/>
${creaseS(17, -24, 25, -8, 19, 10)}${creaseS(33, 27, 28, 12, 37, -2)}${creaseS(Le - 36, -29, Le - 28, -16, Le - 22, -4)}${creaseS(Le - 16, -31, Le - 10, -18, Le - 6, -6)}${creaseS(Le + 6, -32, Le + 10, -20, Le + 16, -10)}${creaseS(Le - 4, 30, Le - 12, 20, Le - 8, 10)}
</g><path d="${sd}" fill="none" stroke="#111013" stroke-opacity=".6" stroke-width=".8"/>
<ellipse cx="7" cy="0" rx="6.5" ry="24.5" fill="#111013"/><path d="M7 -24.5A6.5 24.5 0 0 0 7 24.5" fill="none" stroke="#8A93AE" stroke-opacity=".5" stroke-width="1.2"/>
<path d="M7 -21L-6 -21A4.5 21 0 0 0 -6 21L7 21Z" fill="url(#${p}cf)"/><path d="M-6 -21A4.5 21 0 0 0 -6 21" fill="none" stroke="#FFFFFF" stroke-width="1.1"/><path d="M7 -21L-6 -21A4.5 21 0 0 0 -6 21L7 21" fill="none" stroke="#8E8A86" stroke-opacity=".75" stroke-width=".8"/><path d="M-6 -21A4.5 21 0 0 0 -6 21" fill="none" stroke="#6E6A66" stroke-opacity=".45" stroke-width="2.2" transform="translate(-2.2 0)" filter="url(#${p}b1)"/>
</g>`;
    let shadow = '';
    if (o.card) { const cd = 'M' + o.card.map(pt).join('L') + 'Z';
      shadow = `<clipPath id="${p}cd"><path d="${cd}"/></clipPath><g clip-path="url(#${p}cd)"><path d="${tube(IDX, IDW)}" transform="translate(3.5 5.5)" fill="#1C1424" opacity=".42" filter="url(#${p}b3)"/><path d="${tube(TH.slice(2), THW.slice(2))}" transform="translate(-2 4)" fill="#1C1424" opacity=".22" filter="url(#${p}b3)"/></g>`; }
    const hand = fingers + gaunt + palm;
    return { back: defs + thumb + hand + sleeve, thumb: defs + thumb, front: defs + shadow + hand + sleeve };
  }

  function flap(out, E, c, R, seed) {
    let bi = 0, bd = 1e9; out.forEach((p, i) => { const d = Math.hypot(p[0] - E[0], p[1] - E[1]); if (d < bd) { bd = d; bi = i; } });
    const n = out.length, idx = [bi]; for (let j = 1; j < n / 4; j++) { const p = out[(bi - j + n) % n]; if (Math.hypot(p[0] - E[0], p[1] - E[1]) > R) break; idx.unshift((bi - j + n) % n); }
    for (let j = 1; j < n / 4; j++) { const p = out[(bi + j) % n]; if (Math.hypot(p[0] - E[0], p[1] - E[1]) > R) break; idx.push((bi + j) % n); }
    if (idx.length < 3) return '';
    let r = seed || 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    const inner = idx.map(i => out[i]), outer = inner.map((p, j) => { const t = j / (inner.length - 1), no = nrm(sub(p, c)), l = (4 + 9 * Math.sin(Math.PI * t)) * (.75 + .5 * rnd()); return add(p, mul(no, l)); });
    const poly = 'M' + inner.map(pt).join('L') + 'L' + outer.slice().reverse().map(pt).join('L') + 'Z', no = nrm(sub(E, c));
    const lip = 'M' + outer.map(pt).join('L');
    return `<defs><filter id="flb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter><linearGradient id="flg" gradientUnits="userSpaceOnUse" x1="${f1(E[0] - no[0] * 2)}" y1="${f1(E[1] - no[1] * 2)}" x2="${f1(E[0] + no[0] * 11)}" y2="${f1(E[1] + no[1] * 11)}"><stop offset="0" stop-color="#D3C9B8"/><stop offset=".6" stop-color="#EEE8DC"/><stop offset="1" stop-color="#FAF6EE"/></linearGradient></defs>
<path d="${poly}" transform="translate(2.5 4)" fill="#05060C" opacity=".55" filter="url(#flb)"/><path d="${poly}" fill="url(#flg)"/><path d="${lip}" fill="none" stroke="#FFFFFF" stroke-opacity=".8" stroke-width=".8"/><path d="${lip}" fill="none" stroke="#A89C88" stroke-opacity=".5" stroke-width=".6" transform="translate(.6 1)"/>`;
  }
  window.Glove = { build, flap };
})();

export {};
