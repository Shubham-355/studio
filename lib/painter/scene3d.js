/* three.js painterly scenes. window.Scene3D.mount(el, kind, getState) */
(function () {
  let TP = null;
  const load = () => TP || (TP = import('three'));
  const VS = `varying vec3 vW; varying vec3 vN; varying vec3 vO;
void main(){ vO = position; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
  const FS = `uniform vec3 uC,uS,uL,uH,uRim,uLd,uSeaA,uSeaB,uFlesh,uTint; uniform float uT,uBite,uOcean,uNs,uA,uTintK,uPortal; uniform vec4 uB[3]; uniform float uBk[3];
uniform sampler2D uTex; uniform vec2 uRes,uP0,uPs,uQ0,uQs;
varying vec3 vW; varying vec3 vN; varying vec3 vO;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
 float edge=10.;
 if(uBite>0.001){ float tn=(vn(vO*22.)-.5)*.07; for(int i=0;i<3;i++){ float k=uBk[i]; if(k>.001) edge=min(edge, distance(vO,uB[i].xyz)-uB[i].w*k+tn*k);} if(edge<0.) discard; }
 vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N;
 vec3 V=normalize(cameraPosition-vW); vec3 L=normalize(uLd);
 vec3 q=vO*uNs; float n1=vn(q*vec3(8.,34.,8.)); float n2=vn(q*16.+3.7); float n=n1*.55+n2*.45;
 if(!gl_FrontFacing && uPortal>.5){
   vec2 cu=gl_FragCoord.xy/uRes; cu.y=1.-cu.y; vec2 uv=(uP0+cu*uPs-uQ0)/uQs; uv=clamp(uv,0.,1.);
   vec3 c=texture2D(uTex,vec2(uv.x,1.-uv.y)).rgb; gl_FragColor=vec4(c,1.); return; }
 if(!gl_FrontFacing && uOcean>.5){
   float wv=sin(vO.x*9.+uT*1.3+sin(vO.z*7.+uT*.8)*1.4)*.5+.5;
   float crest=smoothstep(.62,.95,wv+(n-.5)*.45);
   float d=clamp(vO.y*.8+.5+(n-.5)*.25,0.,1.);
   vec3 c=mix(uSeaA,uSeaB,d); c=mix(c,vec3(.96,.94,.9),crest*.6);
   gl_FragColor=vec4(c,1.); return; }
 float ndl=dot(N,L); float l=clamp(ndl*.5+.5+(n-.5)*.3,0.,1.);
 vec3 c=mix(uS,uC,smoothstep(.12,.52,l)); c=mix(c,uL,smoothstep(.6,.92,l));
 vec3 H=normalize(L+V); float s=pow(max(dot(N,H),0.),32.); s=smoothstep(.3,.55,s+(n2-.5)*.3); c=mix(c,uH,s*.8);
 float rim=pow(1.-max(dot(N,V),0.),2.4); c=mix(c,uRim,rim*.35);
 if(uBite>0.001 && edge<.06){ c=mix(uFlesh*.82,uFlesh,n); c=mix(c,vec3(.72,.55,.36),smoothstep(.035,.06,edge)*.7); float wet=smoothstep(.55,.9,vn(vO*60.)); c=mix(c,vec3(1.,.99,.95),wet*.35*(1.-smoothstep(.0,.03,edge))); }
 c=mix(c,uTint,uTintK);
 gl_FragColor=vec4(c,uA);
}`;
  const C = {
    apple: { c: '#A8242A', s: '#4A0E13', l: '#CF4A3A', h: '#F6E6D2', rim: '#E7C9B0' },
    ivory: { c: '#E9DDC3', s: '#8E7C63', l: '#F7F1E5', h: '#FFFFFF', rim: '#8FB0D8' },
    cream: { c: '#E9DDC3', s: '#A89478', l: '#F4EDDD', h: '#FFF8EC', rim: '#C9D6E0' },
    brick: { c: '#8C4A32', s: '#3E1C12', l: '#B0654A', h: '#E7C9B0', rim: '#C9D6E0' },
    base: { c: '#5A2E20', s: '#24110A', l: '#7A4632', h: '#C99A7A', rim: '#8FB0D8' },
    dove: { c: '#EEE8DC', s: '#A99D8E', l: '#FBF8F2', h: '#FFFFFF', rim: '#9FBCE0' },
    stone: { c: '#D9CDB8', s: '#857660', l: '#EFE7D8', h: '#FFF8EC', rim: '#8FB0D8' },
    stem: { c: '#5A3A22', s: '#24160C', l: '#8A6040', h: '#E7C9B0', rim: '#E7C9B0' },
    leaf: { c: '#2F6F7A', s: '#123A40', l: '#5E9C8E', h: '#E7F0E0', rim: '#E7C9B0' },
    wetsand: { c: '#D6BF96', s: '#9C835E', l: '#EBDDBE', h: '#FFF8EC', rim: '#C9D6E0' },
    tide: { c: '#4F98AE', s: '#1F5A66', l: '#8CC4D6', h: '#F3F7F4', rim: '#CFE3E8' },
    print: { c: '#A88B63', s: '#7A6040', l: '#B99E77', h: '#C9AE84', rim: '#B99E77' },
    drysand: { c: '#E6D3AE', s: '#A88B63', l: '#F6EBD3', h: '#FFF8EC', rim: '#DDEEF0' },
    ridge: { c: '#DCC59A', s: '#96784F', l: '#F2E3C2', h: '#FFF6E4', rim: '#DDEEF0' },
  };
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function kit(T, mats) {
    const mat = (k, o = {}) => {
      const c = C[k]; const m = new T.ShaderMaterial({
        vertexShader: VS, fragmentShader: FS, side: o.double ? T.DoubleSide : T.FrontSide, transparent: !!o.alpha, depthWrite: !o.alpha,
        uniforms: {
          uC: { value: new T.Color(c.c) }, uS: { value: new T.Color(c.s) }, uL: { value: new T.Color(c.l) }, uH: { value: new T.Color(c.h) }, uRim: { value: new T.Color(c.rim) },
          uLd: { value: new T.Vector3(-1, .7, .5).normalize() }, uT: { value: 0 }, uBite: { value: 0 }, uOcean: { value: o.ocean ? 1 : 0 }, uNs: { value: o.ns || 1 },
          uA: { value: o.alpha || 1 }, uTint: { value: new T.Color(o.tint || '#000000') }, uTintK: { value: o.tintK || 0 }, uPortal: { value: 0 }, uTex: { value: null }, uRes: { value: new T.Vector2(1, 1) }, uP0: { value: new T.Vector2() }, uPs: { value: new T.Vector2(1, 1) }, uQ0: { value: new T.Vector2() }, uQs: { value: new T.Vector2(1, 1) },
          uB: { value: [new T.Vector4(), new T.Vector4(), new T.Vector4()] }, uBk: { value: [0, 0, 0] }, uSeaA: { value: new T.Color('#1F4F5A') }, uSeaB: { value: new T.Color('#5AA3AE') }, uFlesh: { value: new T.Color('#F1E4C8') },
        },
      }); mats.push(m); return m;
    };
    const lathe = (pts, k) => { const g = new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(Math.max(x, .0005), y)), 64); const m = new T.Mesh(g, mat(k)); m.castShadow = true; return m; };
    const pawn = (mk) => {
      const g = new T.Group(); const L2 = mk ? (pts) => { const gg = new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(Math.max(x, .0005), y)), 48); return new T.Mesh(gg, mk); } : null;
      if (mk) { g.add(L2([[0, 0], [.52, 0], [.54, .05], [.52, .1], [.44, .13], [.46, .18], [.4, .22], [.3, .26], [.24, .36], [.19, .55], [.16, .72], [.26, .76], [.28, .8], [.24, .84], [.14, .86], [0, .86]])); const hh = new T.Mesh(new T.SphereGeometry(.25, 24, 16), mk); hh.position.y = 1.06; g.add(hh); return g; }
      g.add(lathe([[0, 0], [.52, 0], [.54, .05], [.52, .1], [.44, .13], [.46, .18], [.4, .22], [.3, .26], [.24, .36], [.19, .55], [.16, .72], [.26, .76], [.28, .8], [.24, .84], [.14, .86], [0, .86]], 'ivory'));
      const h = new T.Mesh(new T.SphereGeometry(.25, 32, 20), mat('ivory')); h.position.y = 1.06; h.castShadow = true; g.add(h); return g;
    };
    const queen = (mk) => {
      const g = new T.Group(); const QP = [[0, 0], [.58, 0], [.6, .06], [.56, .11], [.46, .14], [.48, .2], [.4, .25], [.3, .3], [.22, .5], [.18, .8], [.16, 1.1], [.24, 1.16], [.28, 1.2], [.22, 1.24], [.28, 1.36], [.34, 1.52], [.26, 1.55], [0, 1.5]];
      if (mk) { g.add(new T.Mesh(new T.LatheGeometry(QP.map(([x, y]) => new T.Vector2(Math.max(x, .0005), y)), 48), mk)); const tt = new T.Mesh(new T.SphereGeometry(.1, 16, 12), mk); tt.position.y = 1.68; g.add(tt); return g; }
      g.add(lathe(QP, 'ivory'));
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; const s = new T.Mesh(new T.SphereGeometry(.055, 12, 8), mat('ivory')); s.position.set(Math.cos(a) * .3, 1.57, Math.sin(a) * .3); g.add(s); }
      const t = new T.Mesh(new T.SphereGeometry(.1, 16, 12), mat('ivory')); t.position.y = 1.68; t.castShadow = true; g.add(t); return g;
    };
    const tri = (v) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g; };
    const dove = () => {
      const g = new T.Group(), m = mat('dove', { double: true });
      const body = new T.Mesh(new T.SphereGeometry(1, 16, 10), m); body.scale.set(.11, .12, .3); g.add(body);
      const head = new T.Mesh(new T.SphereGeometry(.075, 12, 8), m); head.position.set(0, .06, .3); g.add(head);
      const wr = new T.Mesh(tri([0, 0, .12, 0, 0, -.1, .5, 0, -.04]), m), wl = new T.Mesh(tri([0, 0, .12, -.5, 0, -.04, 0, 0, -.1]), m);
      const tail = new T.Mesh(tri([0, 0, -.22, .13, 0, -.5, -.13, 0, -.5]), m);
      g.add(wr, wl, tail); g.userData = { wr, wl }; return g;
    };
    return { mat, lathe, pawn, queen, dove };
  }

  const WVS = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const WFS = `uniform float uT; uniform vec3 uSky,uSkyB,uCloud; varying vec3 vW;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){ vec3 V=normalize(cameraPosition-vW); vec2 p=vW.xz;
 float r=vn(vec3(p*7.,uT*.7))*.5+vn(vec3(p*13.+2.,uT*1.1))*.5; vec2 q=p+vec2(r-.5)*.08;
 float n=vn(vec3(q*1.2+vec2(uT*.04,0.),.5));
 float cl=smoothstep(.5,.78,vn(vec3(q*.7+vec2(uT*.05,.3),1.7))*.7+vn(vec3(q*2.3,3.1))*.3);
 vec3 c=mix(uSkyB,uSky,clamp(.35+n*.6,0.,1.)); c=mix(c,uCloud,cl*.85);
 c*=.9+.2*r;
 float fres=pow(1.-max(V.y,0.),2.5); c=mix(c,vec3(1.),fres*.35);
 vec2 g=abs(fract(vW.xz+.5)-.5); float e=max(g.x,g.y); c=mix(c,vec3(1.,.98,.9),smoothstep(.40,.48,e)*.6);
 c=mix(c,vec3(.82,.72,.52),smoothstep(.44,.5,e)*.5);
 c+=step(.93,vn(vec3(p*28.,uT*2.4)))*.35;
 gl_FragColor=vec4(c,.86); }`;
  const BUILD = {
    apple5(T, scene, cam, light, K) {
      const pts = []; for (let i = 0; i <= 56; i++) { const th = -Math.PI / 2 + Math.PI * i / 56; const x = Math.cos(th) * (1 + .1 * Math.sin(th)); let y = Math.sin(th) * .86; y -= .2 * Math.exp(-(x * x) / .02) * Math.sign(y); pts.push(new T.Vector2(Math.max(x, .0005), y)); }
      const m = K.mat('apple', { double: true, ocean: true });
      const apple = new T.Mesh(new T.LatheGeometry(pts, 96), m); apple.castShadow = true;
      const g = new T.Group(); g.add(apple); const S = 1.3; g.scale.setScalar(S); g.position.y = .66 * S;
      const stem = new T.Mesh(new T.CylinderGeometry(.028, .05, .42, 10, 4), K.mat('stem')); stem.position.set(.03, .84, 0); stem.rotation.z = -.25; stem.castShadow = true; g.add(stem);
      const lp = [], li = [], NU = 16, NV = 6, LL = .52;
      for (let a = 0; a <= NU; a++) { const u = a / NU, hw = .15 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.05)), .75) * (1 - u * .15); for (let b = 0; b <= NV; b++) { const v = b / NV * 2 - 1; lp.push(u * LL, -.22 * u * u + .035 * (1 - Math.abs(v)) + .02 * Math.sin(u * 9) * v, v * hw); } }
      for (let a = 0; a < NU; a++) for (let b = 0; b < NV; b++) { const i0 = a * (NV + 1) + b, i1 = i0 + NV + 1; li.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1); }
      const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(lp, 3)); lg.setIndex(li); lg.computeVertexNormals();
      const leaf = new T.Mesh(lg, K.mat('leaf', { double: true })); leaf.position.set(.07, 1.0, .02); leaf.rotation.set(.35, .5, .42); leaf.castShadow = true; g.add(leaf);
      scene.add(g);
      const d = new T.Vector3(1, 0, 1.05).normalize();
      [[d.clone().multiplyScalar(1.5).add(new T.Vector3(0, .36, 0)), .64], [d.clone().multiplyScalar(1.58), .7], [d.clone().multiplyScalar(1.5).add(new T.Vector3(0, -.36, 0)), .64]].forEach(([p, r], i) => m.uniforms.uB.value[i].set(p.x, p.y, p.z, r));
      const origin = new T.Vector3(), rs = new T.Vector2(); let tex = null, ver = -1;
      light.position.set(-7, 1.5, 2.6); light.shadow.mapSize.set(1024, 1024); K.ground.material.opacity = .42;
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 42 : 30; cam.position.set(a < 1 ? .4 : .2, 1.6, a < 1 ? 8.4 : 7.2); cam.lookAt(a < 1 ? .4 : .5, 1, 0); cam.updateProjectionMatrix(); },
        update(t, st) {
          const b = st.bite || 0; m.uniforms.uBite.value = b; const bk = st.bk || [b, b, b]; for (let i = 0; i < 3; i++) m.uniforms.uBk.value[i] = bk[i];
          g.rotation.y = -.25 + Math.sin(t * .22) * .1 * (1 - b);
          if (st.tex && st.texV !== ver) { ver = st.texV; tex && tex.dispose(); tex = new T.CanvasTexture(st.tex); tex.minFilter = T.LinearFilter; tex.generateMipmaps = false; m.uniforms.uTex.value = tex; m.uniforms.uPortal.value = 1; }
          const P = st.portal; if (P) { m.uniforms.uP0.value.set(P[0], P[1]); m.uniforms.uPs.value.set(P[2], P[3]); m.uniforms.uQ0.value.set(P[4], P[5]); m.uniforms.uQs.value.set(P[6], P[7]); }
          K.R.getDrawingBufferSize(rs); m.uniforms.uRes.value.copy(rs);
          g.updateMatrixWorld(); origin.copy(d).multiplyScalar(1.0); g.localToWorld(origin); cam.updateMatrixWorld(); const v = origin.clone().project(cam); st.bx = (v.x + 1) / 2; st.by = (1 - v.y) / 2;
        },
        dispose() { tex && tex.dispose(); },
      };
    },
    sandboard(T, scene, cam, light, K) {
      const sand = K.mat('drysand', { ns: 1.4 }), rid = K.mat('ridge', { ns: 2 }), pm = K.mat('print');
      const wm = new T.ShaderMaterial({ vertexShader: WVS, fragmentShader: WFS, transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uSky: { value: new T.Color('#8CC0E4') }, uSkyB: { value: new T.Color('#4F8FC8') }, uCloud: { value: new T.Color('#F6F3EC') } } });
      const sb = new T.BoxGeometry(.93, .16, .93), wp = new T.PlaneGeometry(1, 1);
      for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) { const x = i - 3, z = 2 - j; if ((i + j) % 2) { const w = new T.Mesh(wp, wm); w.rotation.x = -Math.PI / 2; w.position.set(x, -.03, z); w.renderOrder = 1; scene.add(w); const bed = new T.Mesh(new T.BoxGeometry(1, .04, 1), K.mat('print')); bed.position.set(x, -.26, z); scene.add(bed); } else { const t = new T.Mesh(sb, sand); t.position.set(x, -.04, z); scene.add(t); } }
      const cy = new T.CylinderGeometry(.05, .06, 1, 8);
      for (let k = 0; k <= 7; k++) { const r = new T.Mesh(cy, rid); r.scale.y = 5.1; r.rotation.x = Math.PI / 2; r.position.set(k - 3.5, .035, 0); r.castShadow = true; scene.add(r); }
      for (let k = 0; k <= 5; k++) { const r = new T.Mesh(cy, rid); r.scale.y = 7.1; r.rotation.z = Math.PI / 2; r.position.set(0, .035, k - 2.5); r.castShadow = true; scene.add(r); }
      const S = .95, pawn = K.pawn(), queen = K.queen(); pawn.scale.setScalar(S); queen.scale.setScalar(0); scene.add(pawn, queen);
      const mm = K.mat('ivory', { alpha: .5, double: true, tint: '#4F8FC8', tintK: .35 }); const mp = K.pawn(mm), mq = K.queen(mm); [mp, mq].forEach(o => { o.renderOrder = 2; o.traverse(c => c.renderOrder = 2); scene.add(o); });
      const prints = Array.from({ length: 8 }, (_, k) => { const m = new T.Mesh(new T.SphereGeometry(1, 10, 6), pm); m.scale.set(.07, .012, .11); m.position.set(k % 2 ? .16 : -.16, .05, 2 - .5 - k * .5); m.visible = false; scene.add(m); return m; });
      K.ground.position.y = .045; K.ground.material.depthWrite = false; K.ground.renderOrder = 3; K.ground.material.opacity = .38;
      light.position.set(-4, 7, 4); const v = new T.Vector3(), W0 = -.03;
      const mir = (src, dst, sy) => { dst.position.set(src.position.x, 2 * W0 - src.position.y, src.position.z); dst.scale.set(src.scale.x, -src.scale.y, src.scale.z); dst.rotation.y = src.rotation.y; dst.visible = src.visible && src.scale.y > .01; };
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 44 : 30; cam.position.set(0, a < 1 ? 12.5 : 9.4, a < 1 ? 4.6 : 3.6); cam.lookAt(0, 0, a < 1 ? .2 : -.1); cam.updateProjectionMatrix(); },
        update(t, st) {
          wm.uniforms.uT.value = t;
          const p = st.p || 0, f = Math.min(1, p / .86) * 4, s = Math.min(3, Math.floor(f)), fr = f >= 4 ? 1 : f - s, e = smooth(.25, .75, fr);
          pawn.position.set(0, .04 + Math.sin(e * Math.PI) * .45, 2 - s - e);
          prints.forEach(m => m.visible = pawn.position.z < m.position.z - .2);
          const m = smooth(.9, .97, p);
          const pk = st.pk ?? 1; pawn.scale.set(S * (1 - m * .4) * pk, S * (1 - m) * pk, S * (1 - m * .4) * pk); pawn.visible = m < .99 && pk > .01;
          queen.position.set(0, .04, -2); queen.scale.setScalar(S * m); queen.rotation.y = (1 - m) * 2.4 + t * .1;
          mir(pawn, mp); mir(queen, mq);
          cam.updateMatrixWorld(); v.set(0, .5, pawn.position.z).project(cam); st.sx = (v.x + 1) / 2; st.sy = (1 - v.y) / 2;
        },
      };
    },
    apple(T, scene, cam, light, K) {
      const pts = []; for (let i = 0; i <= 56; i++) { const th = -Math.PI / 2 + Math.PI * i / 56; const x = Math.cos(th) * (1 + .1 * Math.sin(th)); let y = Math.sin(th) * .86; y -= .2 * Math.exp(-(x * x) / .02) * Math.sign(y); pts.push(new T.Vector2(Math.max(x, .0005), y)); }
      const m = K.mat('apple', { double: true, ocean: true });
      const apple = new T.Mesh(new T.LatheGeometry(pts, 80), m); apple.castShadow = true;
      const g = new T.Group(); g.add(apple); const S = 1.3; g.scale.setScalar(S); g.position.y = .66 * S;
      const stem = new T.Mesh(new T.CylinderGeometry(.03, .05, .42, 8), K.mat('stem')); stem.position.set(.03, .84, 0); stem.rotation.z = -.25; stem.castShadow = true; g.add(stem);
      const leaf = new T.Mesh(new T.SphereGeometry(1, 16, 10), K.mat('leaf')); leaf.scale.set(.34, .03, .14); leaf.position.set(.28, .96, .02); leaf.rotation.set(.2, .4, -.45); leaf.castShadow = true; g.add(leaf);
      scene.add(g);
      const d = new T.Vector3(1, 0, 1.05).normalize();
      [[d.clone().multiplyScalar(1.5).add(new T.Vector3(0, .36, 0)), .64], [d.clone().multiplyScalar(1.58), .7], [d.clone().multiplyScalar(1.5).add(new T.Vector3(0, -.36, 0)), .64]].forEach(([p, r], i) => m.uniforms.uB.value[i].set(p.x, p.y, p.z, r));
      const doves = Array.from({ length: 7 }, (_, k) => { const dv = K.dove(); dv.userData.dir = new T.Vector3(.7 + Math.random() * .8, .25 + Math.random() * .5, .1 + Math.random() * .9).normalize(); dv.userData.ph = k / 7; scene.add(dv); return dv; });
      const origin = new T.Vector3(), prev = new T.Vector3();
      light.position.set(-6, 2.6, 3);
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 42 : 30; cam.position.set(a < 1 ? .4 : .2, 1.6, a < 1 ? 8.4 : 7.2); cam.lookAt(a < 1 ? .4 : .5, 1, 0); cam.updateProjectionMatrix(); },
        update(t, st) {
          const b = st.bite || 0; m.uniforms.uBite.value = b; const bk = st.bk || [b, b, b]; for (let i = 0; i < 3; i++) m.uniforms.uBk.value[i] = bk[i];
          g.rotation.y = -.25 + Math.sin(t * .22) * .12;
          g.updateMatrixWorld(); origin.copy(d).multiplyScalar(1.0); g.localToWorld(origin); { cam.updateMatrixWorld(); const v = origin.clone().project(cam); st.bx = (v.x + 1) / 2; st.by = (1 - v.y) / 2; }
          doves.forEach((dv, k) => {
            const life = (t * .16 + dv.userData.ph) % 1, on = smooth(.55, .8, b);
            const sc = on * Math.min(1, life * 5) * (1 - smooth(.8, 1, life)) * .9;
            dv.visible = sc > .01; if (!dv.visible) return;
            prev.copy(dv.position);
            dv.position.copy(origin).addScaledVector(dv.userData.dir, life * 7).add(new T.Vector3(0, life * life * 2.2, 0));
            dv.scale.setScalar(sc); dv.lookAt(dv.position.clone().add(dv.userData.dir));
            const f = Math.sin(t * 9 + k * 1.7) * .75; dv.userData.wr.rotation.z = f; dv.userData.wl.rotation.z = -f;
          });
        },
      };
    },
    pawn(T, scene, cam, light, K) {
      const p = K.pawn(); p.scale.setScalar(1.3); scene.add(p);
      light.position.set(-6, 2, 2);
      return {
        resize(w, h) { cam.fov = 26; cam.position.set(0, 1.5, 7.2); cam.lookAt(.9, .75, 0); cam.updateProjectionMatrix(); },
        update(t) { p.rotation.y = Math.sin(t * .3) * .3; },
      };
    },
    board(T, scene, cam, light, K) {
      const cream = K.mat('cream', { ns: 2 }), brick = K.mat('brick', { ns: 2 });
      const base = new T.Mesh(new T.BoxGeometry(5.5, .16, 5.5), K.mat('base')); base.position.y = -.08; base.receiveShadow = true; base.castShadow = true; scene.add(base);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const t = new T.Mesh(new T.BoxGeometry(1, .1, 1), (i + j) % 2 ? brick : cream); t.position.set(i - 2, .05, j - 2); t.castShadow = true; scene.add(t); }
      const pawn = K.pawn(), queen = K.queen(); pawn.scale.setScalar(.72); queen.scale.setScalar(0); scene.add(pawn, queen);
      light.position.set(-5, 6, 3);
      return {
        resize(w, h) { const a = w / h; cam.fov = 30; cam.position.set(0, a < 1 ? 13 : 9, a < 1 ? 8 : 6); cam.lookAt(0, 0, -.2); cam.updateProjectionMatrix(); },
        update(t, st) {
          const p = st.p || 0, f = Math.min(1, p / .86) * 4, s = Math.min(3, Math.floor(f)), fr = f >= 4 ? 1 : f - s, e = smooth(.25, .75, fr);
          pawn.position.set(0, .1 + Math.sin(e * Math.PI) * .45, 2 - s - e);
          const m = smooth(.88, .97, p);
          pawn.scale.set(.72 * (1 - m * .4), .72 * (1 - m), .72 * (1 - m * .4)); pawn.visible = m < .99;
          queen.position.set(0, .1, -2); queen.scale.setScalar(.72 * m); queen.rotation.y = (1 - m) * 2.4 + t * .1;
        },
      };
    },
    beach(T, scene, cam, light, K) {
      const sand = K.mat('wetsand', { ns: 1.5 }), tide = K.mat('tide', { ns: 1.5 }), pm = K.mat('print');
      for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) { const dk = (i + j) % 2; const t = new T.Mesh(new T.BoxGeometry(.97, dk ? .02 : .05, .97), dk ? tide : sand); t.position.set(i - 3, dk ? -.01 : 0, 2 - j); t.receiveShadow = true; scene.add(t); }
      const pawn = K.pawn(), queen = K.queen(); pawn.scale.setScalar(.6); queen.scale.setScalar(0); scene.add(pawn, queen);
      const prints = Array.from({ length: 8 }, (_, k) => { const m = new T.Mesh(new T.SphereGeometry(1, 10, 6), pm); m.scale.set(.07, .012, .11); m.position.set(k % 2 ? .16 : -.16, .03, 2 - .5 - k * .5); m.visible = false; scene.add(m); return m; });
      light.position.set(-4, 7, 4); const v = new T.Vector3();
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 44 : 30; cam.position.set(0, a < 1 ? 13 : 10.5, a < 1 ? 4.4 : 3.8); cam.lookAt(0, 0, a < 1 ? .2 : -.1); cam.updateProjectionMatrix(); },
        update(t, st) {
          const p = st.p || 0, f = Math.min(1, p / .86) * 4, s = Math.min(3, Math.floor(f)), fr = f >= 4 ? 1 : f - s, e = smooth(.25, .75, fr);
          pawn.position.set(0, .03 + Math.sin(e * Math.PI) * .4, 2 - s - e);
          prints.forEach(m => m.visible = pawn.position.z < m.position.z - .2);
          const m = smooth(.9, .97, p);
          pawn.scale.set(.6 * (1 - m * .4), .6 * (1 - m), .6 * (1 - m * .4)); pawn.visible = m < .99;
          queen.position.set(0, .03, -2); queen.scale.setScalar(.6 * m); queen.rotation.y = (1 - m) * 2.4 + t * .1;
          cam.updateMatrixWorld(); v.set(0, .45, pawn.position.z).project(cam); st.sx = (v.x + 1) / 2; st.sy = (1 - v.y) / 2;
        },
      };
    },
    roomqueen(T, scene, cam, light, K) {
      const q = K.queen(); q.scale.setScalar(1.5); scene.add(q); light.position.set(4, 3.4, 3);
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 38 : 30; cam.position.set(0, 1.4, a < 1 ? 6.8 : 6.2); cam.lookAt(0, 1.32, 0); cam.updateProjectionMatrix(); },
        update(t) { q.rotation.y = t * .12; },
      };
    },
    queen(T, scene, cam, light, K) {
      const plinth = new T.Mesh(new T.BoxGeometry(1.5, 1.7, 1.5), K.mat('stone', { ns: .6 })); plinth.position.y = .85; plinth.castShadow = true; plinth.receiveShadow = true; scene.add(plinth);
      const cap = new T.Mesh(new T.BoxGeometry(1.7, .12, 1.7), K.mat('stone', { ns: .6 })); cap.position.y = 1.76; cap.castShadow = true; scene.add(cap);
      const q = K.queen(); q.position.y = 1.82; q.scale.setScalar(1.05); scene.add(q);
      light.position.set(-5, 3.2, 3);
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 34 : 28; cam.position.set(0, 2.6, 8.6); cam.lookAt(0, 1.75, 0); cam.updateProjectionMatrix(); },
        update(t) { q.rotation.y = t * .25; },
      };
    },
  };

  async function mount(el, kind, getState) {
    const T = await load(); T.ColorManagement.enabled = false;
    const R = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    R.outputColorSpace = T.LinearSRGBColorSpace; R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 100), mats = [];
    const light = new T.DirectionalLight(0xffffff, 1); light.castShadow = true; light.shadow.mapSize.set(512, 512);
    Object.assign(light.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .5, far: 40 }); light.shadow.bias = -.0015; scene.add(light);
    const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: .34, color: 0x1B1D24 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const K = kit(T, mats); K.R = R; K.ground = ground; const b = BUILD[kind](T, scene, cam, light, K);
    const ld = light.position.clone().normalize(); mats.forEach(m => m.uniforms.uLd.value.copy(ld));
    const cv = R.domElement; Object.assign(cv.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' }); el.appendChild(cv);
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; b.resize && b.resize(w, h); cam.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(size); ro.observe(el);
    let alive = true; const t0 = performance.now();
    const loop = () => { if (!alive) return; const t = (performance.now() - t0) / 1000; const st = getState() || {}; if (st.active === false) { requestAnimationFrame(loop); return; } mats.forEach(m => m.uniforms.uT.value = t); b.update(st.frozen ? 0 : t, st); R.render(scene, cam); requestAnimationFrame(loop); };
    loop();
    return { dispose() { alive = false; ro.disconnect(); b.dispose && b.dispose(); R.dispose(); try { R.forceContextLoss(); } catch (e) {} cv.remove(); } };
  }
  window.Scene3D = { mount, load };
})();

export {};
