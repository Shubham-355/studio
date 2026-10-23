/* v17: apple-scene sky: clean horizon band (no blobs), sun sits low on the horizon, narrow broken sun path. v16: eye (form, brow edge, soft crease, natural lashes, black pupil, limbal ring, one soft highlight) and the apple-scene sea (clean horizon). Load after eye12.js, blink14.js, worlds8.js, worlds9.js */
(function init() {
  const P = window.Painter; if (!P || !P._e6 || !P.eye12 || !P.apple9Sky || !P.sea8) { setTimeout(init, 20); return; } if (P.paint16) return; P.paint16 = true;
  const { skinAt, texture, hair, field, bz, bzPath, soft, hi, blob, lowB, rng, lerp, cl } = P._e6, rgba = P.rgba, TAU = Math.PI * 2;
  const n1 = (x, s) => .5 + .25 * Math.sin(x * 1.7 + s) + .15 * Math.sin(x * 4.3 + s * 2.1) + .1 * Math.sin(x * 9.1 + s * 3.7);
  const seg = (p, t0, t1, dy = 0) => { const q = new Path2D(); for (let i = 0; i <= 6; i++) { const pt = bz(p, lerp(t0, t1, i / 6)); i ? q.lineTo(pt[0], pt[1] + dy) : q.moveTo(pt[0], pt[1] + dy); } return q; };

  /* brow: only its lower edge shows at the top of the tear */
  const browE = (E, t) => E.cy - E.eh * (1.66 + .24 * Math.sin(Math.min(1, t * 1.2) * Math.PI * .9) - Math.max(0, t - .78) * .9);
  const browX = (E, t) => E.cx + E.ew * lerp(-.6, .86, t);
  const brow16 = (ctx, E, r, q) => {
    for (let i = 0; i <= 36; i++) { const t = i / 36; blob(ctx, browX(E, t), browE(E, t) + E.eh * .3, E.ew * .1, E.eh * .28, 0, [110, 60, 48], .065); }
    for (let i = 0; i <= 44; i++) { const t = i / 44; blob(ctx, browX(E, t), browE(E, t) - E.eh * .46, E.ew * .08, E.eh * .44, 0, [86, 54, 40], .13); blob(ctx, browX(E, t), browE(E, t) - E.eh * .1, E.ew * .05, E.eh * .13, 0, [98, 64, 46], .09); }
    for (let i = 0; i < 1500; i++) {
      const t = r(), d = Math.pow(r(), .55), inner = cl(1 - t / .18, 0, 1), x = browX(E, t) + (r() - .5) * 4 * q, y = browE(E, t) - d * E.eh * .95 + (r() - .5) * 2 * q;
      const a0 = lerp(lerp(-1.05, -.5, d), -1.45, inner) + (r() - .5) * .3, a1 = a0 + .22 + (r() - .5) * .2, c = r() < .6 ? [46, 30, 22] : r() < .7 ? [78, 52, 38] : [120, 88, 66];
      hair(ctx, x, y, a0, a1, E.eh * (.16 + r() * .22), (.9 + r() * 1.1) * q, c, (.45 + r() * .4) * (d < .12 ? .8 : 1), [110, 80, 60]);
    }
    for (let i = 0; i < 40; i++) { const t = .05 + r() * .9, x = browX(E, t), y = browE(E, t) + r() * E.eh * .08, a0 = lerp(-1.1, -.55, t) + (r() - .5) * .4; hair(ctx, x, y, a0, a0 + .25, E.eh * (.1 + r() * .12), (.7 + r() * .5) * q, [52, 34, 26], .5 + r() * .25, [120, 88, 66]); }
  };

  P.face6 = (cv, w, h, o) => {
    const E = P.eyeGeom(w, h), q = E.eh / 100, { ctx, K } = hi(cv, w, h, cl(2600 / w, 1.5, 3)), r = rng(11), L = E.up[0], R = E.up[3], LB = lowB(E), rx = w / 2.7, ry = h / 2.7;
    const uc = o && o.noUp ? (() => { const d = document.createElement('canvas'); d.width = d.height = 1; return d.getContext('2d'); })() : ctx;
    field(ctx, w, h, (x, y) => skinAt((x - E.cx) / E.ew, (y - E.cy) / E.eh), 3);
    /* form: warmer and lighter around the eye, darker and cooler toward the paper */
    blob(ctx, E.cx, E.cy - E.eh * .1, E.ew * .8, E.eh * 1.75, 0, [246, 206, 176], .2);
    ctx.save(); ctx.translate(w / 2, h / 2 + ry * .04); ctx.scale(rx, ry);
    const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); vg.addColorStop(0, 'rgba(66,48,66,0)'); vg.addColorStop(.55, 'rgba(66,48,66,0)'); vg.addColorStop(.8, 'rgba(66,48,66,.15)'); vg.addColorStop(1, 'rgba(56,40,58,.38)');
    ctx.fillStyle = vg; ctx.fillRect(-2, -2, 4, 4); ctx.restore();
    const around = (x, y) => Math.atan2((y - E.cy) * 2.4, x - E.cx) + Math.PI / 2;
    texture(ctx, r, { K, n: 5000, len: [16 * q, 44 * q], wid: [5 * q, 12 * q], a: [.25, .5], jit: 12, ang: around, angJ: 1.1, tint: [[14, 2, -8], [-12, -4, 8], [0, 0, 0], [8, 6, 2], [-6, 2, 4]] });
    texture(ctx, r, { K, n: 8000, len: [8 * q, 24 * q], wid: [2.5 * q, 6 * q], a: [.3, .55], jit: 14, ang: around, angJ: 1.0, tint: [[12, 0, -6], [-12, -6, 6], [0, 0, 0]] });
    texture(ctx, r, { K, n: 9000, len: [3 * q, 9 * q], wid: [1 * q, 2.4 * q], a: [.2, .4], jit: 18, ang: around, angJ: .9 });
    for (let i = 0; i < 3200; i++) { const d = r() < .72; ctx.fillStyle = d ? `rgba(116,66,52,${(.05 + r() * .07).toFixed(3)})` : `rgba(252,226,204,${(.04 + r() * .06).toFixed(3)})`; ctx.beginPath(); ctx.arc(r() * w, r() * h, (.4 + r() * .7) * q, 0, TAU); ctx.fill(); }
    blob(ctx, E.cx - E.ew * .08, E.cy - E.eh * 1.02, E.ew * .2, E.eh * .13, 0, [255, 230, 208], .2, .1);
    blob(ctx, E.cx + E.ew * .1, E.cy + E.eh * 2.1, E.ew * .5, E.eh * .5, 0, [252, 222, 196], .18, .1);
    brow16(ctx, E, r, q);
    /* lid crease: soft, uneven, deeper toward the outer corner */
    const CR = [[E.cx - E.ew * .5, E.cy - E.eh * .3], [E.cx - E.ew * .24, E.cy - E.eh * 1.72], [E.cx + E.ew * .3, E.cy - E.eh * 1.68], [E.cx + E.ew * .6, E.cy - E.eh * .42]], NS = 40;
    ctx.lineCap = 'butt';
    for (let i = 0; i < NS; i++) { const t0 = i / NS, t1 = (i + 1) / NS, tm = (t0 + t1) / 2, f = (.35 + .95 * Math.pow(tm, 1.4)) * (.75 + .5 * n1(tm * 7, 2)) * Math.min(1, tm * 9, (1 - tm) * 14), dy = (n1(tm * 5, 7) - .5) * 4 * q;
      const p = seg(CR, t0, t1, dy); [[16 * q, .035], [8 * q, .06], [3.6 * q, .1], [1.4 * q, .17]].forEach(([lw, a]) => { ctx.strokeStyle = rgba([100, 54, 42], a * f); ctx.lineWidth = lw * (.8 + .3 * f); ctx.stroke(p); });
      const hp = seg(CR, t0, t1, dy + 4.5 * q); ctx.strokeStyle = rgba([246, 208, 180], .07 * f); ctx.lineWidth = 6 * q; ctx.stroke(hp); }
    for (let i = 0; i < 16; i++) { const t0 = .55 + i * .025, f = Math.sin((i + .5) / 16 * Math.PI); ctx.strokeStyle = rgba([110, 62, 50], .07 * f); ctx.lineWidth = 1.6 * q; ctx.stroke(seg(CR, t0, t0 + .025, -E.eh * (.1 + .03 * n1(t0 * 9, 3)))); }
    ctx.lineCap = 'round';
    /* two or three soft curved creases at the outer corner */
    const oc = [R[0] - E.ew * .04, R[1] + E.eh * .1];
    for (let k = 0; k < 3; k++) { const rad = E.ew * (.1 + .045 * k), p = new Path2D(); p.arc(oc[0], oc[1], rad, -.5 + k * .1, .38 + k * .12);
      soft(ctx, p, [[3.5 * q, .025], [1.3 * q, .04 - k * .008]], [120, 72, 58]); ctx.save(); ctx.translate(1.8 * q, 1 * q); soft(ctx, p, [[1.6 * q, .045]], [250, 216, 192]); ctx.restore(); }
    for (let i = 0; i < 3; i++) { const p = new Path2D(); for (let j = 0; j <= 24; j++) { const pt = bz(LB, lerp(.04 + i * .03, .62 - i * .08, j / 24)); j ? p.lineTo(pt[0], pt[1] + E.eh * (.34 + i * .17)) : p.moveTo(pt[0], pt[1] + E.eh * (.34 + i * .17)); } soft(ctx, p, [[2.4 * q, .035], [.9 * q, .07]], [126, 80, 70]); }
    for (let t = .04; t < .97; t += .045) { const p = bz(LB, t); blob(ctx, p[0], p[1] + E.eh * .3, E.ew * .09, E.eh * .22, 0, [108, 70, 70], .07); }
    soft(ctx, bzPath(LB, 3.2 * q), [[8 * q, .22], [4.5 * q, .3]], [222, 158, 144]);
    soft(ctx, bzPath(LB, 7.5 * q), [[2 * q, .3]], [108, 64, 54]);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill(new Path2D(E.path)); ctx.restore();
    ctx.save(); ctx.clip(new Path2D(E.path));
    blob(ctx, L[0] + E.ew * .095, L[1] + E.eh * .02, E.ew * .04, E.eh * .44, 0, [206, 146, 136], .34, .2);
    blob(ctx, L[0] + E.ew * .045, L[1] + E.eh * .03, E.ew * .07, E.eh * .34, 0, [204, 140, 128], .6, .15);
    blob(ctx, L[0] + E.ew * .045, L[1] + E.eh * .07, E.ew * .042, E.eh * .18, 0, [222, 154, 142], .55, .25);
    blob(ctx, L[0] + E.ew * .065, L[1] - E.eh * .03, E.ew * .008, E.eh * .025, 0, [255, 248, 242], .7, .3);
    ctx.restore();
    soft(ctx, bzPath(LB, 1.4 * q), [[1.5 * q, .42]], [255, 242, 236]);
    soft(ctx, bzPath(LB, -1.6 * q), [[1.8 * q, .2]], [255, 250, 246]);
    soft(uc, bzPath(E.up, -1.5 * q), [[10 * q, .14], [5 * q, .32], [2.4 * q, .7]], [54, 32, 26]);
    /* lower lashes: short, sparse, irregular */
    let t = .05; while (t < .9) { t += (.035 + r() * .07); if (t > .9) break; if (r() < .18) continue;
      const p = bz(LB, t), outer = 1 - t, a0 = lerp(2.1, .95, outer) + (r() - .5) * .35;
      hair(ctx, p[0] + (r() - .5) * 2 * q, p[1] + 5.5 * q, a0, a0 + (outer > .5 ? -.25 : .2) + (r() - .5) * .2, E.ew * (.008 + .028 * outer) * (.5 + r() * .9), (.8 + r() * .5) * q, [50, 32, 26], .55 + r() * .3, [98, 72, 58]); }
    /* warmth, colour variation and faint pores outside the opening */
    const r2 = rng(23); ctx.save(); const m = new Path2D(); m.rect(0, 0, w, h); m.addPath(new Path2D(E.path)); ctx.clip(m, 'evenodd');
    blob(ctx, E.cx - E.ew * .02, E.cy - E.eh * .62, E.ew * .62, E.eh * .62, 0, [212, 124, 100], .09);
    blob(ctx, E.cx + E.ew * .02, E.cy + E.eh * .78, E.ew * .56, E.eh * .42, 0, [204, 118, 98], .07);
    for (let i = 0; i < 60; i++) blob(ctx, r2() * w, r2() * h, E.ew * (.05 + r2() * .12), E.eh * (.1 + r2() * .3), r2() * 3, r2() < .5 ? [232, 176, 146] : [176, 112, 100], .04);
    for (let i = 0; i < 3400; i++) { ctx.fillStyle = `rgba(104,60,46,${(.04 + r2() * .07).toFixed(3)})`; ctx.beginPath(); ctx.arc(r2() * w, r2() * h, (.3 + r2() * .45) * q, 0, TAU); ctx.fill(); }
    ctx.restore();
    return E;
  };

  /* white of the eye: less pink overall */
  const sf0 = P.skinField6;
  P.skinField6 = (cv, W, H, E, ox, oy) => { sf0(cv, W, H, E, ox, oy); const ctx = cv.getContext('2d'); ctx.save(); ctx.translate(ox, oy); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fill(new Path2D(E.path)); ctx.restore(); };
  const eb0 = P.eyeball6;
  P.eyeball6 = (cv, w, h) => { const E = eb0(cv, w, h), ctx = cv.getContext('2d'); ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,.28)'; ctx.fillRect(0, 0, w, h); ctx.restore(); return E; };

  /* fixed shading on the eyeball: grey under the lid and at the corners, a hint of warmth at the inner corner */
  P.eyeShade6 = (cv, w, h) => {
    const E = P.eyeGeom(w, h), { ctx } = hi(cv, w, h, 2.5, false), q = E.eh / 100, L = E.up[0], R = E.up[3], LB = lowB(E);
    ctx.save(); ctx.translate(E.cx + E.ew * .03, E.cy + E.eh * .1); ctx.scale(E.ew * .5, E.eh * 1.02);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(110,106,114,0)'); g.addColorStop(.5, 'rgba(110,106,114,0)'); g.addColorStop(.78, 'rgba(106,100,110,.24)'); g.addColorStop(1, 'rgba(82,74,86,.55)');
    ctx.fillStyle = g; ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    ctx.save(); ctx.clip(new Path2D(E.path));
    blob(ctx, L[0] + E.ew * .16, L[1] + E.eh * .04, E.ew * .14, E.eh * .6, 0, [124, 122, 134], .26);
    blob(ctx, R[0] - E.ew * .13, R[1] + E.eh * .1, E.ew * .13, E.eh * .56, 0, [120, 118, 132], .24);
    blob(ctx, L[0] + E.ew * .065, L[1] + E.eh * .04, E.ew * .06, E.eh * .3, 0, [214, 150, 138], .24);
    for (let k = 0; k < 16; k++) soft(ctx, bzPath(E.up, E.eh * (.02 + k * .028)), [[E.eh * .09, .075 * Math.pow(1 - k / 16, 1.3)]], [84, 86, 102]);
    for (let k = 0; k < 6; k++) soft(ctx, bzPath(LB, -E.eh * k * .02), [[E.eh * .05, .04 * (1 - k / 6)]], [110, 98, 104]);
    blob(ctx, E.cx, E.cy + E.eh * .1, E.ew * .36, E.eh * .7, 0, [240, 216, 194], .05);
    soft(ctx, bzPath(LB, -2.6 * q), [[3.2 * q, .12]], [222, 172, 162]);
    soft(ctx, bzPath(LB, -1.1 * q), [[1.3 * q, .6], [.6 * q, .8]], [255, 252, 248]);
    ctx.restore();
  };

  /* iris: a clear dark limbal ring at the outer edge */
  const ir0 = P.iris6;
  P.iris6 = (cv, ir, big) => {
    ir0(cv, ir, big); const ctx = cv.getContext('2d'), S = ir * 2.3, c = S / 2;
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, ir * 1.04, 0, TAU); ctx.clip();
    const g = ctx.createRadialGradient(c, c, ir * .8, c, c, ir * 1.03); g.addColorStop(0, 'rgba(8,14,22,0)'); g.addColorStop(.55, 'rgba(8,14,22,.26)'); g.addColorStop(.85, 'rgba(6,10,16,.72)'); g.addColorStop(.95, 'rgba(6,10,16,.5)'); g.addColorStop(1, 'rgba(6,10,16,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S); ctx.restore();
  };

  /* cornea: one soft oval highlight upper-left over iris and pupil, a faint sky reflection curving across the top third */
  P.eyeGlint6 = (cv, w, h, ir) => {
    const E = P.eyeGeom(w, h), K = Math.min(cl(3000 / w, 2, 4), 4096 / w, 4096 / h);
    cv.width = Math.max(2, Math.round(w * K)); cv.height = Math.max(2, Math.round(h * K)); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const ctx = cv.getContext('2d'); ctx.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0); ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.clip(new Path2D(E.path));
    const arcY = x => E.cy - E.eh * .2 + Math.pow((x - E.cx) / (E.ew * .5), 2) * E.eh * .42, band = new Path2D();
    band.moveTo(E.cx - E.ew * .6, E.cy - E.eh * 1.3); band.lineTo(E.cx + E.ew * .6, E.cy - E.eh * 1.3);
    for (let i = 30; i >= 0; i--) { const x = E.cx + (i / 30 - .5) * 1.2 * E.ew; band.lineTo(x, arcY(x)); } band.closePath();
    ctx.clip(band);
    const sky = ctx.createLinearGradient(0, E.cy - E.eh * .9, 0, E.cy - E.eh * .12); sky.addColorStop(0, 'rgba(128,170,226,.42)'); sky.addColorStop(.6, 'rgba(140,180,230,.18)'); sky.addColorStop(1, 'rgba(140,180,230,0)');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-out'; const hz = ctx.createLinearGradient(E.cx - E.ew * .5, 0, E.cx + E.ew * .5, 0);
    hz.addColorStop(0, 'rgba(0,0,0,.95)'); hz.addColorStop(.3, 'rgba(0,0,0,0)'); hz.addColorStop(.72, 'rgba(0,0,0,0)'); hz.addColorStop(1, 'rgba(0,0,0,.95)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, w, h);
    ctx.restore();
    const hx = E.cx - ir * .34, hy = E.cy - ir * .36;
    ctx.save(); ctx.filter = `blur(${Math.max(.3, ir * .035).toFixed(2)}px)`;
    blob(ctx, hx, hy, ir * .34, ir * .28, -.5, [255, 255, 255], .2);
    blob(ctx, hx, hy, ir * .18, ir * .14, -.5, [255, 254, 250], .92, .5);
    ctx.restore();
  };

  /* apple scene sea: strokes kept below the horizon, one clean slightly soft horizon line */
  const clp = (x, a, b) => Math.max(a, Math.min(b, x));
  P.apple9Sky = (cv, G) => {
    const { W, H, Yh, Hp, sunX, n } = G, k = n ? .9 : .7, f = y => clp(y / Hp, 0, 1);
    const stops = [[0, '#3E78C4'], [f(Yh - H * .62), '#5A8BCB'], [f(Yh - H * .42), '#8FB0D6'], [f(Yh - H * .26), '#C9CBD2'], [f(Yh - H * .14), '#EBCDB2'], [f(Yh - H * .05), '#F4BF8C'], [f(Yh) - .0006, '#F6B474'], [f(Yh), '#33627F'], [1, '#24506C']];
    let strip = null, strip2 = null;
    return P.sky(cv, {
      seed: 81, w: W, h: Hp, k, stops, clouds: 0,
      after: (ctx, w, h, r) => {
        const s = w / W, yh = Yh * s, H2 = H * s;
        ctx.fillStyle = P.linear(ctx, [[0, 'rgba(250,214,170,0)'], [1, 'rgba(250,206,150,.5)']], 0, yh - H2 * .26, 0, yh); ctx.fillRect(0, yh - H2 * .26, w, H2 * .26);
        { const m = ctx.getTransform(), cvs = ctx.canvas, y1 = Math.round(yh * m.d + m.f), y0 = Math.max(0, Math.round((yh - 30 * s) * m.d + m.f)), hh = Math.max(1, y1 - y0), sc = document.createElement('canvas'); sc.width = cvs.width; sc.height = hh;
          const sx = sc.getContext('2d'); sx.drawImage(cvs, 0, y0, cvs.width, hh, 0, 0, cvs.width, hh); sx.globalCompositeOperation = 'destination-in'; const fg = sx.createLinearGradient(0, 0, 0, hh); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(.3, 'rgba(0,0,0,1)'); fg.addColorStop(1, 'rgba(0,0,0,1)'); sx.fillStyle = fg; sx.fillRect(0, 0, cvs.width, hh); strip = { sc, y0 }; }
        ctx.save(); ctx.beginPath(); ctx.rect(0, yh + 2.5 * s, w, h); ctx.clip();
        P.sea(ctx, w, yh, h, { far: '#3D6C8B', near: '#21496A', mid: '#4C7E9E', foam: '#BFD3DC' }, r);
        const sg = ctx.createLinearGradient(0, yh, 0, yh + H2 * .02); sg.addColorStop(0, 'rgba(61,108,139,1)'); sg.addColorStop(1, 'rgba(61,108,139,0)'); ctx.fillStyle = sg; ctx.fillRect(0, yh, w, H2 * .02);
        for (let i = 0; i < 320; i++) { const y = yh + H2 * .012 + Math.pow(r(), 1.5) * (h - yh), tt = (y - yh) / (h - yh || 1);
          P.stroke(ctx, r() * w, y, (r() - .5) * .03, (24 + tt * 180 * r()) * s, (1 + tt * 5) * s, r() < .55 ? [28, 64, 92] : [104, 146, 172], .22 + r() * .3, (r() - .5) * .08); }
        ctx.restore();
        ctx.fillStyle = '#3D6C8B'; ctx.fillRect(0, yh, w, 2.5 * s);
        { const m = ctx.getTransform(), cvs = ctx.canvas, y0 = Math.round(yh * m.d + m.f), hh = Math.max(1, Math.round(12 * s * m.d)), sc = document.createElement('canvas'); sc.width = cvs.width; sc.height = hh;
          const sx = sc.getContext('2d'); sx.drawImage(cvs, 0, y0, cvs.width, hh, 0, 0, cvs.width, hh); sx.globalCompositeOperation = 'destination-in'; const fg = sx.createLinearGradient(0, 0, 0, hh); fg.addColorStop(0, 'rgba(0,0,0,1)'); fg.addColorStop(.5, 'rgba(0,0,0,1)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = fg; sx.fillRect(0, 0, cvs.width, hh); strip2 = { sc, y0 }; }
      },
      post: (ctx, w, h, r) => {
        const s = w / W, yh = Yh * s, H2 = H * s, sx = sunX * s, sy = yh - H2 * .03, sr = H2 * .032;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); if (strip) ctx.drawImage(strip.sc, 0, strip.y0); if (strip2) ctx.drawImage(strip2.sc, 0, strip2.y0); ctx.restore();
        let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, H2 * .42); g.addColorStop(0, 'rgba(255,230,180,.6)'); g.addColorStop(.35, 'rgba(255,214,160,.22)'); g.addColorStop(1, 'rgba(255,214,160,0)');
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, yh); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(0, 0, w, yh);
        g = ctx.createRadialGradient(sx, sy, sr * .1, sx, sy, sr * 1.18); g.addColorStop(0, '#FFF8EA'); g.addColorStop(.72, '#FFE7BE'); g.addColorStop(.86, 'rgba(255,220,160,.7)'); g.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, sr * 1.18, 0, 7); ctx.fill(); ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(0, yh + 2.5 * s, w, h); ctx.clip();
        for (let i = 0; i < 260; i++) { const y = yh + H2 * .006 + Math.pow(r(), 1.4) * (h - yh) * .85, tt = (y - yh) / (h - yh || 1), sp = sr * .7 + tt * H2 * .09, x = sx + (r() - .5) * 2 * sp * Math.pow(r(), .7);
          P.stroke(ctx, x, y, (r() - .5) * .03, (2 + tt * 14 * r()) * s, (.5 + tt * 1.4) * s, [255, 226 + r() * 26 | 0, 176 + r() * 50 | 0], (.25 + r() * .45) * (1 - tt * .6), 0); }
        ctx.restore();
        const hl = ctx.createLinearGradient(0, yh - 1.4 * s, 0, yh + 1.8 * s); hl.addColorStop(0, 'rgba(24,52,74,0)'); hl.addColorStop(.45, 'rgba(24,52,74,.5)'); hl.addColorStop(1, 'rgba(24,52,74,0)');
        ctx.fillStyle = hl; ctx.fillRect(0, yh - 1.4 * s, w, 3.2 * s);
      },
    });
  };
  /* live sea strip: swells and glitter start a few px under the horizon so the line itself stays clean */
  P.sea8 = (ctx, w, h, sunX, now, K) => {
    ctx.clearRect(0, 0, w, h); ctx.lineCap = 'round'; const y0 = 6 * K;
    for (let i = 0; i < 14; i++) { const sp = .004 + (i % 5) * .002, y = (y0 + i / 14 * (h - y0 - 2)), x = ((i * 0.37 + now * sp) % 1.4 - .2) * w, L = (40 + i * 9) * K;
      ctx.strokeStyle = `rgba(${i % 2 ? '30,62,90' : '150,184,204'},${((.18 + .1 * Math.sin(now * .4 + i)) * Math.min(1, .35 + i / 6)).toFixed(3)})`; ctx.lineWidth = (1 + i / 14 * 2.5) * K; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + L / 2, y - 1.2 * K, x + L, y); ctx.stroke(); }
    for (let i = 0; i < 46; i++) { const a = (i * 0.6180339) % 1, b = (i * 0.4142135) % 1, y = y0 + Math.pow(b, 1.2) * (h - y0 - 2), tt = y / h, x = sunX + (a - .5) * 2 * (6 * K + tt * w * .045);
      const tw = Math.pow(Math.max(0, Math.sin(now * (1.3 + a * 1.7) + i * 2.3)), 3); if (tw < .05) continue;
      ctx.strokeStyle = `rgba(255,${238 + (b * 17 | 0)},${200 + (a * 50 | 0)},${(tw * .85).toFixed(3)})`; ctx.lineWidth = (.8 + tt * 2) * K; ctx.beginPath(); ctx.moveTo(x - (2 + tt * 8) * K, y); ctx.lineTo(x + (2 + tt * 8) * K, y); ctx.stroke(); }
  };
})();

/* upper lashes for the live lid (main thread only): varied length, curve and spacing, denser and longer toward the outer corner, some crossing */
(function init2() {
  const P = window.Painter; if (!P || !P._e6 || !P.blink14) { if (typeof document !== 'undefined' && document.body !== undefined && !self.importScripts) setTimeout(init2, 20); return; } if (P.lash16) return; P.lash16 = true;
  const { rng, lerp, cl } = P._e6;
  P.lashes14 = E => {
    const r = rng(77), q = E.eh / 100, out = [], col = () => r() < .5 ? [24, 15, 11] : [40, 26, 20], up = -Math.PI / 2;
    let t = .03;
    while (true) { t += (.01 + r() * .03) / lerp(1, 2.8, Math.pow(t, 1.3)); if (t > .97) break;
      const ba = lerp(-2.05, -.25, t) + (r() - .5) * .3, cA = ba + (up - ba) * (.5 + r() * .5) - (t > .6 ? .25 * r() : 0) + (r() - .5) * .12, ln = E.ew * (.028 + .13 * Math.pow(t, 1.25)) * (.6 + r() * .75);
      out.push({ t: cl(t, 0, 1), a0: ba, a1: cA, len: ln, wd: (1.3 + r() * 1.1) * q * (.8 + .4 * t), al: .7 + r() * .28, c: col() });
      if (r() < .25 + .45 * t) { const b2 = ba + (r() - .5) * .55; out.push({ t: cl(t + (r() - .5) * .012, 0, 1), a0: b2, a1: b2 + (up - b2) * (.35 + r() * .6) + (r() - .5) * .3, len: ln * (.65 + r() * .45), wd: (1 + r() * .8) * q, al: .6 + r() * .3, c: col() }); }
    }
    for (let i = 0; i < 14; i++) { const tt = .05 + r() * .9, ba = lerp(-2.0, -.2, tt) + (r() - .5) * .4; out.push({ t: tt, a0: ba, a1: ba + (up - ba) * (.3 + r() * .5), len: E.ew * (.015 + .04 * tt) * (.6 + r() * .7), wd: .9 * q, al: .5 + r() * .3, c: col() }); }
    return out;
  };
})();

/* v17 room: same painting, but brushwork stays inside each plane (no dark floor strokes climbing the wall) */
(function initRoom() {
  const P = self.Painter || (typeof window !== 'undefined' && window.Painter); if (!P || !P.room || !P.overpaint || !P.setup) { setTimeout(initRoom, 20); return; } if (P.room17) return; P.room17 = true;
  const lerp = (a, b, t) => a + (b - a) * t, sz = cv => ({ w: cv.offsetWidth || 2, h: cv.offsetHeight || 2 });
  const blob = (ctx, x, y, rx, ry, c, blur) => { ctx.save(); if (blur) ctx.filter = `blur(${blur}px)`; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); ctx.restore(); };
  const inside = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  P.room = (cv, o) => {
    const k = .6, s = sz(cv); const { ctx, w, h } = P.setup(cv, s.w * k, s.h * k); const r = P.rng(81); P._k = k;
    const [bx0, by0, bx1, by1] = [o.b[0] * w, o.b[1] * h, o.b[2] * w, o.b[3] * h], [wx0, wy0, wx1, wy1] = [o.win[0] * w, o.win[1] * h, o.win[2] * w, o.win[3] * h];
    const path = pts => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
    const poly = (pts, fill) => { ctx.fillStyle = fill; path(pts); ctx.fill(); };
    const ceil = [[0, 0], [w, 0], [bx1, by0], [bx0, by0]], left = [[0, 0], [bx0, by0], [bx0, by1], [0, h]], right = [[w, 0], [bx1, by0], [bx1, by1], [w, h]], back = [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], floor = [[0, h], [bx0, by1], [bx1, by1], [w, h]];
    poly(ceil, P.linear(ctx, [[0, '#CFC1AA'], [1, '#DDD1BD']], 0, 0, 0, by0));
    poly(left, P.linear(ctx, [[0, '#CDBFA8'], [1, '#DED3C0']], 0, 0, bx0, 0));
    poly(right, P.linear(ctx, [[0, '#BBAA92'], [1, '#D2C5AF']], w, 0, bx1, 0));
    poly(back, P.linear(ctx, [[0, '#E6DCCB'], [.6, '#E9DCCB'], [1, '#D8C4B4']], 0, by0, 0, by1));
    poly(floor, P.linear(ctx, [[0, '#4E3424'], [1, '#6E4B34']], 0, by1, 0, h));
    const vx = (bx0 + bx1) / 2, vy = (by0 + by1) / 2;
    ctx.strokeStyle = 'rgba(40,24,16,.55)'; ctx.lineWidth = 2 * k; for (let i = 0; i <= 16; i++) { const x = lerp(bx0, bx1, i / 16); ctx.beginPath(); ctx.moveTo(x, by1); ctx.lineTo(vx + (x - vx) * ((h - vy) / (by1 - vy)), h); ctx.stroke(); }
    ctx.fillStyle = '#1B2440'; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const fx = (x, y) => [vx + (x - vx) * ((h - vy) / (y - vy)), h];
    const a = fx(wx0 - w * .02, by1 + 1), b = fx(wx1 + w * .03, by1 + 1);
    poly([[wx0, by1], [wx1, by1], [b[0] - w * .1, h * .92], [a[0] - w * .14, h * .92]], 'rgba(201,140,131,.38)');
    poly([[wx0, wy1], [wx1, wy1], [wx1 - (wx1 - wx0) * .05, by1], [wx0 - (wx1 - wx0) * .1, by1]], 'rgba(201,140,131,.18)');
    ctx.restore();
    blob(ctx, bx0, (by0 + by1) / 2, w * .02, (by1 - by0) * .6, 'rgba(90,70,50,.18)', 20 * k);
    blob(ctx, bx1, (by0 + by1) / 2, w * .02, (by1 - by0) * .6, 'rgba(90,70,50,.22)', 20 * k);
    ctx.fillStyle = 'rgba(40,24,16,.35)'; ctx.fillRect(bx0, by1 - 8 * k, bx1 - bx0, 8 * k);
    const win = [[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], inW = (x, y) => x > wx0 && x < wx1 && y > wy0 && y < wy1;
    const each = opt => [ceil, left, right, back, floor, win].forEach(pl => { ctx.save(); path(pl); if (pl === back) { ctx.rect(wx1, wy0, wx0 - wx1, wy1 - wy0); ctx.clip('evenodd'); } else ctx.clip(); P.overpaint(ctx, w, h, Object.assign({}, opt, { mask: (x, y) => inside(pl, x, y) && (pl === win || pl !== back || !inW(x, y)) }), r); ctx.restore(); });
    each({ len: [14, 42], wid: [5, 13], a: [.3, .6], ang: (x, y) => y > by1 ? Math.atan2(y - vy, x - vx) : (r() - .5) * .3 + Math.PI / 2, area: 330, jit: 7 });
    each({ len: [5, 16], wid: [2, 5], a: [.25, .5], ang: () => r() * 3, area: 900, jit: 11 });
  };
})();

export {};
