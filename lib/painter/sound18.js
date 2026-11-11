/* Homepage v17 sound design. One AudioContext, everything generated with Web Audio.
   Every sound has a named slot in HPSound.files; set a URL (e.g. HPSound.files['beach-surf'] = 'beach-surf.mp3')
   to replace the synthesized version. Files load only after sound is turned on, for the current and next scene. */
(function () {
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lin = (a, b, x) => cl((x - a) / (b - a)),
    sm = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); }, mx = (a, b, k) => a + (b - a) * k,
    bump = (a, b, c, d, x) => sm(a, b, x) * (1 - sm(c, d, x)), R = Math.random;
  const MASTER = .35, FADE_IN = 1.5, FADE_OUT = .8;
  const FILES = {
    'hero-wind': null, 'apple-sea': null, 'apple-breeze': null, 'beach-surf': null, 'queen-hum': null, 'desert-wind': null,
    'room-tone': null, 'night-sea': null, 'thought-paper': null, 'thought-water': null,
    'blink-brush': null, 'sea-lap': null, 'pawn-tap': null, 'queen-bell': null, 'gull': null,
    'footstep-tile': null, 'thought-clock': null, 'thought-gear': null, 'room-clock': null, 'night-bell': null,
    'paper-rustle': null, 'ui-hover': null, 'ui-click': null, 'ui-confirm': null,
  };
  const SCENES = [
    { a: 0, b: 2.0, slots: ['hero-wind', 'blink-brush', 'gull'] },
    { a: 2.0, b: 4.41, slots: ['apple-sea', 'apple-breeze', 'sea-lap'] },
    { a: 12.4, b: 16.6, slots: ['beach-surf', 'gull', 'pawn-tap', 'queen-bell'] },
    { a: 16.6, b: 18.2, slots: ['queen-hum'] },
    { a: 18.2, b: 22.3, slots: ['desert-wind', 'footstep-tile', 'thought-clock', 'thought-paper', 'thought-water', 'thought-gear'] },
    { a: 22.3, b: 24.6, slots: ['room-tone', 'room-clock'] },
    { a: 24.6, b: 99, slots: ['night-sea', 'night-bell', 'paper-rustle'] },
  ];
  const PAWN = [0, 1, 2, 3, 4].map(k => 14.25 + 2.3 * (k + 1) * .172);
  const EVENTS = PAWN.map((t, k) => ({ t, n: 'pawn-tap', k })).concat([{ t: 16.4, n: 'queen-bell' }, { t: 26.26, n: 'paper-rustle', v: .7 }, { t: 26.42, n: 'paper-rustle', v: .9 }, { t: 26.57, n: 'paper-rustle', v: 1 }]);
  const CPTS = [[18.2, -2], [19.35, 3.4], [20.05, 8.4], [20.75, 13.4], [21.45, 18.4], [22.9, 26.8]], CZ = [6, 11, 16, 21];
  const camZ = t => { const P = CPTS, n = P.length; if (t <= P[0][0]) return P[0][1]; if (t >= P[n - 1][0]) return P[n - 1][1]; const d = [], m = [0]; for (let k = 0; k < n - 1; k++) d.push((P[k + 1][1] - P[k][1]) / (P[k + 1][0] - P[k][0])); for (let k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : 2 / (1 / d[k - 1] + 1 / d[k]); m[n - 1] = 0; let j = 0; while (t > P[j + 1][0]) j++; const hh = P[j + 1][0] - P[j][0], u = (t - P[j][0]) / hh, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * P[j][1] + (u3 - 2 * u2 + u) * hh * m[j] + (-2 * u3 + 3 * u2) * P[j + 1][1] + (u3 - u2) * hh * m[j + 1]; };
  /* music bed: one key (D), slow evolving voicings per scene, resolving to a held D major chord at the footer */
  const VF = [73.42, 110, 146.83, 185, 196, 220, 246.94, 329.63];
  const PADK = [[0, [0, .5, .7, 0, 0, .8, 0, .6]], [2.2, [.3, .5, .9, .7, 0, .8, 0, .2]], [12.4, [.3, .6, .8, .3, 0, .8, .6, .2]], [16.6, [.4, .6, .8, 0, .6, .5, .7, 0]],
    [18.4, [.5, .6, .7, 0, .7, .4, .7, 0]], [22.6, [.6, .5, .8, .6, 0, .6, 0, 0]], [24.6, [.6, .7, .5, 0, 0, .4, .5, .4]], [28.0, [.7, .7, .8, .7, 0, .7, 0, 0]]];
  const padW = t => { let i = 0; while (i < PADK.length - 1 && t >= PADK[i + 1][0]) i++; if (i === PADK.length - 1) return PADK[i][1]; const a = PADK[i], b = PADK[i + 1], k = sm(a[0], b[0], t); return a[1].map((v, j) => mx(v, b[1][j], k)); };
  const gust = n => cl(.62 + .38 * (Math.sin(n * .21) * .5 + Math.sin(n * .077 + 1) * .35 + Math.sin(n * .53 + 2) * .15), .15, 1);
  const wave = (n, P) => { const x = ((n / P + .06 * Math.sin(n * .13)) % 1 + 1) % 1; return x < .28 ? sm(0, .28, x) : 1 - sm(.28, 1, x); };

  class HPSound {
    static get files() { return FILES; }
    constructor(o) {
      this.o = o; this.on = false; this.buf = {}; this.loading = {}; this.cache = new Map(); this.evT = {};
      this._vis = () => this.visibility(); document.addEventListener('visibilitychange', this._vis);
      const sel = 'a,button,[role="button"]';
      this._over = e => { if (!this.on || !matchMedia('(pointer: fine)').matches) return; const el = e.target.closest && e.target.closest(sel); if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return; this.uiTick(0); };
      this._click = e => { if (!this.on) return; const el = e.target.closest && e.target.closest(sel); if (!el || el.getAttribute('aria-label') === 'Ambient sound') return; if (/start a company/i.test(el.textContent || '')) this.confirm(); else this.uiTick(1); };
      document.addEventListener('pointerover', this._over, true); document.addEventListener('click', this._click, true);
    }
    ensure() {
      if (this.ac) return true; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      const ac = this.ac = new AC(); this.white = this.noise(0); this.brown = this.noise(1);
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -22; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = .02; comp.release.value = .3;
      this.master = ac.createGain(); this.master.gain.value = 0; this.an = ac.createAnalyser(); this.an.fftSize = 512; this.anBuf = new Float32Array(512);
      this.mix = ac.createGain(); this.mix.connect(comp).connect(this.master); this.master.connect(ac.destination); this.master.connect(this.an);
      const bus = v => { const g = ac.createGain(); g.gain.value = v; g.connect(this.mix); return g; };
      this.amb = bus(1); this.fx = bus(1); this.padBus = bus(.5);
      this.verb = ac.createConvolver(); this.verb.buffer = this.ir(1.8); this.verbIn = ac.createGain(); this.verbIn.connect(this.verb).connect(this.amb);
      this.L = {
        'hero-wind': this.layer('white', 'bandpass', 2400, .9), 'apple-sea': this.layer('brown', 'lowpass', 800, .4),
        'apple-breeze': this.layer('white', 'bandpass', 650, .5), 'beach-surf': this.layer('brown', 'lowpass', 2000, .3),
        'surf-fizz': this.layer('white', 'bandpass', 4200, .7), 'desert-wind': this.layer('white', 'bandpass', 380, .7, .5),
        'room-tone': this.layer('brown', 'lowpass', 170, .3), 'night-sea': this.layer('brown', 'lowpass', 480, .3),
        'thought-paper': this.layer('white', 'highpass', 3200, .5), 'thought-water': this.layer('brown', 'lowpass', 520, .6),
      };
      /* queen hum */
      const hf = ac.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 320; this.humG = ac.createGain(); this.humG.gain.value = 0; hf.connect(this.humG).connect(this.amb);
      [[73.42, 1], [146.83, .3], [110, .18]].forEach(([f, v]) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = v; o.connect(g).connect(hf); o.start(); });
      /* room hum */
      const ro = ac.createOscillator(); ro.frequency.value = 58; this.roomHum = ac.createGain(); this.roomHum.gain.value = 0; ro.connect(this.roomHum).connect(this.amb); ro.start();
      /* door creak: stick-slip sawtooth through a wooden resonance */
      this.crO = ac.createOscillator(); this.crO.type = 'sawtooth'; this.crO.frequency.value = 55; const cf = ac.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 520; cf.Q.value = 6;
      const cf2 = ac.createBiquadFilter(); cf2.type = 'lowpass'; cf2.frequency.value = 1400; this.crG = ac.createGain(); this.crG.gain.value = 0;
      this.crO.connect(cf).connect(cf2).connect(this.crG); this.crG.connect(this.fx); this.crG.connect(this.verbIn); this.crO.start();
      /* pad */
      this.padF = ac.createBiquadFilter(); this.padF.type = 'lowpass'; this.padF.frequency.value = 900; this.padF.Q.value = .3; this.padDuck = ac.createGain(); this.padF.connect(this.padDuck).connect(this.padBus);
      this.V = VF.map((f, i) => {
        const g = ac.createGain(); g.gain.value = 0; const p = ac.createStereoPanner(); p.pan.value = ((i % 3) - 1) * .35;
        [['sine', 0, 1], ['triangle', 5, .3]].forEach(([ty, dc, v]) => { const o = ac.createOscillator(), og = ac.createGain(); o.type = ty; o.frequency.value = f; o.detune.value = dc + (R() - .5) * 4; og.gain.value = v; o.connect(og).connect(g); o.start(); });
        g.connect(p).connect(this.padF); return g;
      });
      this.thoughtPan = ['thought-paper', 'thought-water'].map(k => this.L[k]);
      return true;
    }
    noise(brown) {
      const ac = this.ac, len = ac.sampleRate * 6, b = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let l = 0; for (let i = 0; i < len; i++) { const w = R() * 2 - 1; if (brown) { l = (l + .02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w; } }
      return b;
    }
    ir(sec) {
      const ac = this.ac, len = Math.round(ac.sampleRate * sec), b = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let l = 0; for (let i = 0; i < len; i++) { l = l * .6 + (R() * 2 - 1) * .4; d[i] = l * Math.pow(1 - i / len, 3) * (i < ac.sampleRate * .012 ? 0 : 1); } }
      return b;
    }
    layer(kind, type, f, Q, send) {
      const ac = this.ac, src = ac.createBufferSource(); src.buffer = this[kind]; src.loop = true;
      const filt = ac.createBiquadFilter(); filt.type = type; filt.frequency.value = f; filt.Q.value = Q;
      const g = ac.createGain(); g.gain.value = 0; const p = ac.createStereoPanner();
      src.connect(filt).connect(g).connect(p).connect(this.amb);
      if (send) { const s = ac.createGain(); s.gain.value = send; g.connect(s).connect(this.verbIn); }
      src.start(0, R() * 5); return { src, filt, g, p };
    }
    set(param, v, tau = .12) { const c = this.cache.get(param); if (c != null && Math.abs(c - v) < 1e-4) return; this.cache.set(param, v); param.setTargetAtTime(v, this.ac.currentTime, tau); }
    ramp(v, d) { const g = this.master.gain, n = this.ac.currentTime; g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(v, n + d); }
    duck(depth, hold) { const g = this.padDuck.gain, n = this.ac.currentTime; g.cancelScheduledValues(n); g.setTargetAtTime(1 - depth, n, .05); g.setTargetAtTime(1, n + hold, .7); }

    setOn(on) {
      if (on && !this.ensure()) return false;
      this.on = on; try { sessionStorage.setItem('hpSound', on ? '1' : '0'); } catch (e) {}
      clearTimeout(this._st);
      if (on) { this.ac.resume(); this._pt = null; this._si = null; this.ramp(MASTER, FADE_IN); this.start(); }
      else if (this.ac) { this.ramp(0, FADE_OUT); this._st = setTimeout(() => { if (!this.on) { this.stop(); this.ac.suspend(); this.resetBars(); } }, FADE_OUT * 1000 + 150); }
      return true;
    }
    start() { if (this._raf) return; const loop = () => { this._raf = requestAnimationFrame(loop); const p = performance.now(); if (p - (this._lf || 0) < 32) return; this._lf = p; this.tick(); }; loop(); }
    stop() { cancelAnimationFrame(this._raf); this._raf = 0; }
    resetBars() { (this.o.bars() || []).forEach(b => { b.style.transform = 'scaleY(.3)'; }); }
    visibility() {
      if (!this.ac || !this.on) return; clearTimeout(this._st);
      if (document.hidden) { this.ramp(0, .3); this._st = setTimeout(() => { if (document.hidden) this.ac.suspend(); }, 350); }
      else this.ac.resume().then(() => { this._pt = null; this.ramp(MASTER, FADE_IN); });
    }
    dispose() { this.stop(); clearTimeout(this._st); document.removeEventListener('visibilitychange', this._vis); document.removeEventListener('pointerover', this._over, true); document.removeEventListener('click', this._click, true); this.ac && this.ac.close(); }

    /* files: current + next scene only */
    loadNear(t) {
      let i = SCENES.findIndex(s => t >= s.a && t < s.b); if (i < 0) i = t < 12.4 ? 1 : 0;
      [SCENES[i], SCENES[i + 1]].forEach(s => s && s.slots.forEach(n => {
        const url = FILES[n]; if (!url || this.buf[n] || this.loading[n]) return; this.loading[n] = 1;
        fetch(url).then(r => r.arrayBuffer()).then(a => this.ac.decodeAudioData(a)).then(b => {
          this.buf[n] = b; const L = this.L[n]; if (!L) return;
          const s2 = this.ac.createBufferSource(); s2.buffer = b; s2.loop = true; s2.connect(L.g); s2.start(); L.src.stop(); L.filt.disconnect(); L.src = s2;
        }).catch(() => { this.loading[n] = 0; });
      }));
    }
    file(n, gain, pan = 0, dest) { const b = this.buf[n]; if (!b) return false; const ac = this.ac, s = ac.createBufferSource(), g = ac.createGain(), p = ac.createStereoPanner(); s.buffer = b; g.gain.value = gain; p.pan.value = pan; s.connect(g).connect(p).connect(dest || this.fx); s.start(); return true; }

    tick() {
      const ac = this.ac; if (!ac || ac.state !== 'running') return;
      const n = ac.currentTime, t = this.o.getT(), red = this.o.reduced(), dt = cl(n - (this._ln || n - .033), .001, .2); this._ln = n;
      if (n - (this._ld || -9) > 1) { this._ld = n; this.loadNear(t); }
      const L = this.L, G = gust(n);
      /* hero wind thins and lowers with the tilt; calm sea rises from below */
      const wind = (1 - .78 * sm(1.0, 2.4, t)) * (1 - sm(2.4, 3.3, t));
      this.set(L['hero-wind'].g.gain, .07 * wind * G); this.set(L['hero-wind'].filt.frequency, mx(2600, 800, sm(.6, 2.2, t)) * (.85 + .15 * G), .3);
      const sea = sm(.8, 2.1, t) * (1 - sm(4.0, 4.45, t));
      this.set(L['apple-sea'].g.gain, .5 * sea * (.5 + .5 * wave(n, 6.5)), .2);
      this.set(L['apple-sea'].filt.frequency, mx(mx(800, 260, sm(3.25, 3.9, t)), 1800, sm(3.95, 4.4, t)), .1);
      this.set(L['apple-breeze'].g.gain, .045 * bump(1.6, 2.4, 3.3, 3.9, t) * G, .3);
      if (sea > .3 && t < 3.3 && n > (this._lapN || 0)) { this._lapN = n + 1.4 + R() * 2.2; this.lap(sea); }
      /* beach surf: closer and brighter; muffles into the crown */
      const surf = sm(3.95, 4.4, t) * (1 - sm(17.2, 18.3, t)), sw = wave(n, 8);
      this.set(L['beach-surf'].g.gain, .62 * surf * (.3 + .7 * sw), .15); this.set(L['beach-surf'].filt.frequency, mx(2000, 280, sm(16.7, 17.8, t)), .15);
      this.set(L['surf-fizz'].g.gain, .022 * surf * (1 - sm(16.7, 17.4, t)) * sm(.5, .9, sw), .1);
      this.set(this.humG.gain, .06 * bump(16.95, 17.9, 18.5, 19.6, t), .25);
      /* desert arcade */
      const desert = bump(17.9, 18.6, 22.0, 22.9, t);
      this.set(L['desert-wind'].g.gain, .11 * desert * G, .3); this.set(L['desert-wind'].filt.frequency, 340 + 120 * G, .4);
      /* room, with the headline breathing in near silence */
      const breathe = 1 - .55 * bump(22.95, 23.3, 23.9, 24.2, t), room = bump(21.9, 22.7, 24.2, 25.0, t);
      this.set(L['room-tone'].g.gain, .2 * room * breathe, .3); this.set(this.roomHum.gain, .004 * room * breathe, .3);
      const foot = sm(27.6, 28.4, t), night = Math.max(.14 * bump(22.5, 23.2, 24.1, 24.4, t), sm(24.2, 25.1, t) * (1 - .45 * foot));
      this.set(L['night-sea'].g.gain, .55 * night * (.35 + .65 * wave(n, mx(9, 13, foot))) * (t < 24.2 ? breathe : 1), .25);
      this.set(L['night-sea'].filt.frequency, t < 24.2 ? 300 : 480, .5);
      /* door creak follows the swing */
      const sw2 = sm(21.5, 22.3, t), vel = this._dsw == null ? 0 : Math.abs(sw2 - this._dsw) / dt; this._dsw = sw2;
      this.set(this.crG.gain, red ? 0 : .09 * cl(vel * .9) * (sw2 > 0 && sw2 < 1 ? 1 : 0), .06);
      this.set(this.crO.frequency, 46 + 26 * sw2 + R() * 9, .03);
      /* founders' thoughts, panned to their side, drifting toward the door as we pass */
      const z = camZ(t), inHall = t > 18.2 && t < 22.9, sides = (this.o.sides && this.o.sides()) || [-.55, .55, -.55, .55];
      const lv = CZ.map(c => { const dz = c - z; return inHall ? (1 - sm(3.2, 6.5, dz)) * sm(-2.6, -.4, dz) : 0; }), pan = CZ.map((c, i) => sides[i] * mx(.15, 1, sm(-2.4, .6, c - z)));
      this.set(L['thought-paper'].g.gain, .05 * lv[1] * (.35 + .65 * R()), .03); this.set(L['thought-paper'].p.pan, pan[1], .2);
      this.set(L['thought-water'].g.gain, .14 * lv[2] * (.3 + .7 * wave(n, 2.3)), .1); this.set(L['thought-water'].p.pan, pan[2], .2);
      if (lv[0] > .03 && n > (this._ck0 || 0)) { this._ck0 = n + .5; this.tickSnd('thought-clock', .05 * lv[0], pan[0], 3400); }
      if (lv[3] > .03 && n > (this._ck3 || 0)) { this._ck3 = n + .75; this.tickSnd('thought-gear', .05 * lv[3], pan[3], 1300); }
      if (room > .2 && n > (this._ckR || 0)) { this._ckR = n + 1; this.tickSnd('room-clock', .012 * room * breathe, .45, 2900); }
      /* footsteps: one per stride of camera travel, so they slow and stop with the scroll */
      if (inHall && t > 18.25 && !red) { const si = Math.floor(z / 1.1); if (this._si != null && si !== this._si && Math.abs(si - this._si) <= 2) this.step(); this._si = si; } else this._si = null;
      /* gulls, bells */
      if (wind > .45 && R() < dt / 11) this.gull(1);
      if (t >= 12.4 && t < 16.6 && R() < dt / (t < 14.1 ? 4 : 7)) this.gull(0);
      if (night > .5 && R() < dt / 16) this.bell(587.33, .022, (R() - .5) * 1.2, 3.2, 1);
      /* pad */
      const W = padW(t), res = foot;
      this.V.forEach((g, i) => this.set(g.gain, .045 * W[i] * (1 - .35 * (1 - res) * (.5 + .5 * Math.sin(n * .045 * (1 + i * .13) + i * 2.1))) * breathe, .8));
      /* events on crossing, either direction */
      const pt = this._pt; this._pt = t;
      if (pt != null && pt !== t) {
        let d = Math.abs(t - pt); if (Math.min(pt, t) <= 4.41 && Math.max(pt, t) >= 12.39) d -= 8;
        if (d < (red ? 4 : 2.5)) { const lo = Math.min(pt, t), hi = Math.max(pt, t); EVENTS.forEach((e, i) => { if (e.t > lo && e.t <= hi && !(red && e.fast) && n - (this.evT[i] || -9) > .3) { this.evT[i] = n; this.fire(e); } }); }
      }
      /* button bars follow the output */
      const bars = this.o.bars(); if (bars.length) {
        this.an.getFloatTimeDomainData(this.anBuf); let s = 0; for (let i = 0; i < this.anBuf.length; i++) s += this.anBuf[i] * this.anBuf[i];
        this._lvl = mx(this._lvl || 0, Math.sqrt(s / this.anBuf.length), .2); const k = cl(this._lvl * 10), ps = performance.now() / 1000;
        bars.forEach((b, i) => { b.style.transform = `scaleY(${(.3 + .7 * cl(k * (.55 + .45 * Math.sin(ps * (1.6 + i * .5) + i * 1.9)))).toFixed(3)})`; });
      }
    }
    fire(e) {
      if (e.n === 'pawn-tap') this.tap(e.k);
      else if (e.n === 'queen-bell') { if (!this.file('queen-bell', .5)) this.bell(293.66, .1, 0, 2.2); this.duck(.4, 1.8); } else if (e.n === 'paper-rustle') this.paper(e.v);
    }

    /* ---- synth voices ---- */
    burst(kind, type, f, Q, peak, a, d, pan = 0, at = 0, dests) {
      const ac = this.ac, t0 = ac.currentTime + at, s = ac.createBufferSource(); s.buffer = this[kind];
      const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = Q; const g = ac.createGain(), p = ac.createStereoPanner(); p.pan.value = pan;
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t0 + a); g.gain.exponentialRampToValueAtTime(.0001, t0 + a + d);
      s.connect(fl).connect(g).connect(p); (dests || [this.fx]).forEach(x => p.connect(x)); s.start(t0, R() * 5); s.stop(t0 + a + d + .05); return g;
    }
    tone(f, peak, a, d, pan = 0, at = 0, type = 'sine', f2, dests) {
      const ac = this.ac, t0 = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner(); o.type = type; o.frequency.setValueAtTime(f, t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + a + d * .6); p.pan.value = pan;
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t0 + a); g.gain.exponentialRampToValueAtTime(.0001, t0 + a + d);
      o.connect(g).connect(p); (dests || [this.fx]).forEach(x => p.connect(x)); o.start(t0); o.stop(t0 + a + d + .05);
    }
    blink() { if (!this.on || !this.ac || this.o.reduced()) return; if (!this.file('blink-brush', .05)) this.burst('white', 'bandpass', 3200, .4, .01, .06, .12); }
    lap(v) { if (!this.file('sea-lap', .3 * v, (R() - .5) * .5, this.amb)) this.burst('brown', 'lowpass', 500, .6, .09 * v, .12, .5, (R() - .5) * .5, 0, [this.amb]); }
    tap(k) { const f = 360 * Math.pow(2, k * 2 / 12); if (!this.file('pawn-tap', .5)) { this.tone(f, .15, .004, .16); this.tone(f * 2.71, .035, .003, .06); this.burst('white', 'bandpass', 2200, 1, .05, .002, .02); } this.duck(.15, .3); }
    bell(f, peak, pan, d, far) {
      if (far && this.file('night-bell', peak * 5, pan, this.amb)) return;
      [[1, 1, 1], [2, .35, .7], [3.01, .12, .45], [4.2, .05, .3]].forEach(([m, v, dk]) => this.tone(f * m, peak * v, .02, d * dk, pan, 0, 'sine', null, far ? [this.amb, this.verbIn] : [this.fx]));
    }
    paper(v = 1) { if (!this.on || !this.ac) return; if (this.file('paper-rustle', .4 * v)) return; for (let i = 0; i < 8; i++) this.burst('white', 'highpass', 1800 + R() * 1400, .7, (.03 + R() * .05) * v, .01, .04 + R() * .04, (R() - .5) * .3, i * .04 + R() * .02); this.duck(.15, .6); }
    tickSnd(n, v, pan, f) { if (!this.file(n, v * 6, pan)) this.burst('white', 'bandpass', f, 4, v, .001, .025, pan, 0, [this.fx, this.verbIn]); }
    step() { if (this.file('footstep-tile', .3, (R() - .5) * .16)) return; const p = (this._sp = -(this._sp || .08)); this.burst('white', 'bandpass', 1400, 1.1, .04, .002, .04, p, 0, [this.fx, this.verbIn]); this.tone(95, .06, .004, .07, p, 0, 'sine', 60); }
    gull(far) {
      if (this.file('gull', far ? .06 : .2, (R() - .5) * 1.4, this.amb)) return;
      const pan = (R() - .5) * 1.4, v = far ? .005 : .018;
      [0, .32].forEach((at, i) => this.tone(1500 - i * 120, v, .03, .26, pan, at + R() * .05, 'triangle', 900, [this.amb]));
    }
    uiTick(full) { if (!this.ac || this.ac.state !== 'running') return; if (this.file(full ? 'ui-click' : 'ui-hover', full ? .2 : .1)) return; this.tone(2100, full ? .028 : .012, .002, full ? .05 : .025); if (full) this.tone(1050, .02, .002, .06); }
    confirm() { if (!this.ac || this.ac.state !== 'running') return; if (this.file('ui-confirm', .4)) return; [293.66, 440, 587.33].forEach((f, i) => this.tone(f, .05, .02, .9, 0, i * .05)); this.duck(.3, 1); }
  }
  window.HPSound = HPSound;
})();

export {};
