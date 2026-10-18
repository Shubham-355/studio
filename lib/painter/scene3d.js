/* v8: three.js painterly scenes (8x8 sand board, Magritte apple). window.Scene3D.mount(el, kind, getState) */
(function () {
  let TP = null;
  const load = () => TP || (TP = import('three'));
  const VS = `varying vec3 vW; varying vec3 vN; varying vec3 vO;
void main(){ vO = position; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
  const FS = `uniform vec3 uC,uS,uL,uH,uRim,uLd,uSeaA,uSeaB,uFlesh,uTint; uniform float uT,uBite,uOcean,uNs,uA,uTintK,uPortal; uniform vec4 uB[3]; uniform float uBk[3]; uniform float uQ,uWarm,uOpen,uOpenP,uThru,uSlide; uniform vec4 uHole; uniform vec3 uQc,uQn;
uniform sampler2D uTex; uniform vec2 uRes,uP0,uPs,uQ0,uQs; uniform vec3 uSc[3];
varying vec3 vW; varying vec3 vN; varying vec3 vO;
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 cell(vec2 p){vec2 i=floor(p),f=fract(p);float d1=9.,d2=9.,id=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(h2(i+g),h2(i+g+19.7));vec2 r=g+o-f;r.x*=.4;float d=dot(r,r);if(d<d1){d2=d1;d1=d;id=h2(i+g+3.1);}else if(d<d2)d2=d;}return vec3(id,sqrt(d1),sqrt(d2));}
float archSD(float px,float py,float g){float w=.016*g,h=.035*g,y=py-1.335;if(y>h-w)return length(vec2(px,y-(h-w)))-w;return max(abs(px)-w,-(y+h));}
void main(){
 float edge=10.;
 float dF=10.,dS=10.,da=0.;
 if(uQ>1.5){ float an=atan(vO.z,vO.x); float rr=max(length(vO.xz),.2); da=mod(an-1.5707963+3.1415927,6.2831853)-3.1415927;
   dF=archSD(da*rr,vO.y,uOpen); float am=mod(da+.2617994,.5235988)-.2617994; if(abs(da)>.2617994) dS=archSD(am*rr,vO.y,1.);
   if(min(dF,dS)<0.) discard; }
 if(uQ>.5 && !gl_FrontFacing){
   if(uThru>.5){ vec2 fc=gl_FragCoord.xy/uRes; if(length((fc-uHole.xy)/max(uHole.zw,vec2(.0001)))<1.) discard; }
   float ni=vn(vO*40.+uT*.05);
   gl_FragColor=vec4(mix(vec3(.84,.72,.60),vec3(.95,.76,.55),uWarm)*(.88+.16*ni),1.); return; }
 if(uBite>0.001){ float tn=(vn(vO*22.)-.5)*.07; for(int i=0;i<3;i++){ float k=uBk[i]; if(k>.001) edge=min(edge, distance(vO,uB[i].xyz)-uB[i].w*k+tn*k);} if(edge<0.) discard; }
 vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N;
 vec3 V=normalize(cameraPosition-vW); vec3 L=normalize(uLd);
 vec3 q=vO*uNs; float n1=vn(q*vec3(8.,34.,8.)); float n2=vn(q*16.+3.7); float n=n1*.55+n2*.45;
 if(!gl_FrontFacing && uPortal>.5){
   vec2 cu=gl_FragCoord.xy/uRes; cu.y=1.-cu.y; vec2 uv=(uP0+cu*uPs-uQ0)/uQs; uv=clamp(uv,0.,1.);
   vec3 c=texture2D(uTex,vec2(uv.x,1.-uv.y)).rgb;
   float w=9.; vec2 ctr=vec2(0.); for(int i=0;i<3;i++){ if(uSc[i].z>1.){ float di=distance(gl_FragCoord.xy,uSc[i].xy)/uSc[i].z; if(di<w){ w=di; ctr=uSc[i].xy; } } }
   if(w<8.){ vec2 dv=gl_FragCoord.xy-ctr; float an=atan(dv.y,dv.x); float tooth=sin(an*13.)*.022+sin(an*29.+1.3)*.012;
     float wall=smoothstep(.56,.6,w+(vn(vec3(an*6.,w*9.,1.))-.5)*.05);
     if(wall>0.){ float fib=vn(vec3(an*38.,w*3.,2.))*.6+vn(vec3(an*90.,w*7.,5.))*.4; float dep=smoothstep(.58,1.,w);
       vec3 f=mix(uFlesh*.58,uFlesh*1.02,dep*.75+fib*.25); f=mix(f,vec3(.74,.56,.36),smoothstep(.86,1.,w+tooth)*.55*(.6+fib*.4));
       float sh=step(.93,vn(vec3(an*70.,w*40.,9.))); f=mix(f,vec3(1.,.99,.95),sh*.45*dep); f*=.82+.18*smoothstep(.0,.9,sin(an+.9)*.5+.5);
       c=mix(c,f,wall); } }
   gl_FragColor=vec4(c,1.); return; }
 if(!gl_FrontFacing && uOcean>.5){
   float wv=sin(vO.x*9.+uT*1.3+sin(vO.z*7.+uT*.8)*1.4)*.5+.5;
   float crest=smoothstep(.62,.95,wv+(n-.5)*.45);
   float d=clamp(vO.y*.8+.5+(n-.5)*.25,0.,1.);
   vec3 c=mix(uSeaA,uSeaB,d); c=mix(c,vec3(.96,.94,.9),crest*.6);
   gl_FragColor=vec4(c,1.); return; }
 float ndl=dot(N,L); float l=clamp(ndl*.5+.5+(n-.5)*.3,0.,1.);
 if(uQ>.5){
   if(uThru>.5 && dot(vW-uQc,uQn)<0.){ vec2 fc=gl_FragCoord.xy/uRes; if(length((fc-uHole.xy)/max(uHole.zw,vec2(.0001)))<1.) discard; }
   float qa=atan(vO.z,vO.x), qr=max(length(vO.xz),.12); vec2 sp=vec2(qa*qr,vO.y);
   float wob=vn(vec3(sp*vec2(9.,14.),1.3));
   vec2 P1=vec2(sp.x*30.,sp.y*95.+wob*2.4);
   float s1=vn(vec3(P1.x*.35,P1.y,2.1)), s2=vn(vec3(P1.x*1.1,P1.y*2.3+s1*1.5,4.7)), s3=vn(vec3(P1.x*3.,P1.y*5.,8.3));
   float bri=s1*.55+s2*.3+s3*.15;
   float lq=clamp(l+(s1-.5)*.12+(s2-.5)*.07,0.,1.);
   vec3 pc=mix(uS,uC,smoothstep(.1,.6,lq)); pc=mix(pc,uL,smoothstep(.55,.92,lq));
   pc*=.97+.05*s3;
   vec3 Hh=normalize(L+V); float sp2=pow(max(dot(N,Hh),0.),40.); sp2=smoothstep(.25,.6,sp2+(bri-.5)*.35); pc=mix(pc,uH,sp2*.85);
   float shn=exp(-pow((da+.75-uSlide*1.5)*3.,2.)); pc=mix(pc,vec3(1.,.99,.96),shn*.3*smoothstep(.2,.8,lq)*step(1.5,uQ));
   pc=mix(pc,uRim,pow(1.-max(dot(N,V),0.),2.4)*.3);
   if(uQ>1.5 && vO.y<.34){ float wet=1.-smoothstep(.03,.32,vO.y); float a2=atan(vO.z,vO.x); vec3 bl=mix(vec3(.30,.55,.78),vec3(.58,.78,.9),vn(vec3(a2*3.,vO.y*14.,uT*.25))); float stk=smoothstep(.3,.8,vn(vec3(a2*8.,vO.y*4.,uT*.15))); pc=mix(pc,bl*(.8+.35*lq),wet*(.22+.38*stk)); }
   float ewF=.0045*sqrt(max(uOpen,1.)), jm=max(1.-smoothstep(0.,ewF,dF),1.-smoothstep(0.,.0045,dS));
   if(jm>0.){ vec3 sto=mix(vec3(.435,.231,.196),vec3(.68,.42,.31),step(da,0.)); vec3 pj=pc*vec3(.7,.66,.62); pc=mix(pc,mix(pj,sto,uOpenP*step(dF,dS)),jm); }
   if(uWarm>0.){ vec2 su=gl_FragCoord.xy/uRes-.5; float ed=clamp(max(abs(su.x),abs(su.y))*2.,0.,1.);
     float thr=.62*(1.-ed)+.38*s1, k=smoothstep(thr-.06,thr+.04,uWarm*1.12), lum=dot(pc,vec3(.3,.59,.11));
     vec3 tw=mix(vec3(.945,.863,.753),vec3(.851,.667,.471),smoothstep(.2,.85,uWarm-(1.-ed)*.2+(s2-.5)*.2));
     pc=mix(pc,tw*clamp(lum/.86,.84,1.08),k*(1.-jm*uOpenP)); }
   pc=mix(pc,uTint,uTintK);
   gl_FragColor=vec4(pc,uA); return; }
 if(uNs>1.3&&uNs<1.5&&N.y>.6){ float wq=vn(vec3(vW.xz*2.2,4.))*2.6; float rp=sin((vW.z*.9+vW.x*.35)*30.+wq); float sh2=smoothstep(-.2,.9,rp)-smoothstep(.9,1.,rp)*.6; l=clamp(l-.16+sh2*.26+(vn(vec3(vW.xz*40.,1.))-.5)*.08,0.,1.); }
 vec3 c=mix(uS,uC,smoothstep(.12,.52,l)); c=mix(c,uL,smoothstep(.6,.92,l));
 vec3 H=normalize(L+V); float s=pow(max(dot(N,H),0.),32.); s=smoothstep(.3,.55,s+(n2-.5)*.3); c=mix(c,uH,s*.8);
 float rim=pow(1.-max(dot(N,V),0.),2.4); c=mix(c,uRim,rim*.35);
 if(uBite>0.001 && edge<.06){ c=mix(uFlesh*.82,uFlesh,n); c=mix(c,vec3(.72,.55,.36),smoothstep(.035,.06,edge)*.7); float wet=smoothstep(.55,.9,vn(vO*60.)); c=mix(c,vec3(1.,.99,.95),wet*.35*(1.-smoothstep(.0,.03,edge))); }
 c=mix(c,uTint,uTintK);
 gl_FragColor=vec4(c,uA);
}`;
  const C = {
    apple: { c: '#A8242A', s: '#4A0E13', l: '#CF4A3A', h: '#F6E6D2', rim: '#E7C9B0' },
    porcelain: { c: '#F3EDE3', s: '#D6C4AC', l: '#FCF9F3', h: '#FFFFFF', rim: '#F4E6D2' },
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
    border: { c: '#C4A77C', s: '#806446', l: '#D9C196', h: '#F2E3C2', rim: '#DDEEF0' },
    ridge: { c: '#DCC59A', s: '#96784F', l: '#F2E3C2', h: '#FFF6E4', rim: '#DDEEF0' },
  };
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function kit(T, mats) {
    const qm = [];
    const mat = (k, o = {}) => {
      const c = C[k]; const m = new T.ShaderMaterial({
        vertexShader: VS, fragmentShader: FS, side: o.double ? T.DoubleSide : T.FrontSide, transparent: !!o.alpha, depthWrite: !o.alpha,
        uniforms: {
          uC: { value: new T.Color(c.c) }, uS: { value: new T.Color(c.s) }, uL: { value: new T.Color(c.l) }, uH: { value: new T.Color(c.h) }, uRim: { value: new T.Color(c.rim) },
          uLd: { value: new T.Vector3(-1, .7, .5).normalize() }, uT: { value: 0 }, uQ: { value: 0 }, uWarm: { value: 0 }, uOpen: { value: 1 }, uOpenP: { value: 0 }, uThru: { value: 0 }, uSlide: { value: 0 }, uHole: { value: new T.Vector4() }, uQc: { value: new T.Vector3() }, uQn: { value: new T.Vector3(0, 0, 1) }, uBite: { value: 0 }, uOcean: { value: o.ocean ? 1 : 0 }, uNs: { value: o.ns || 1 },
          uA: { value: o.alpha || 1 }, uTint: { value: new T.Color(o.tint || '#000000') }, uTintK: { value: o.tintK || 0 }, uPortal: { value: 0 }, uTex: { value: null }, uSc: { value: [new T.Vector3(), new T.Vector3(), new T.Vector3()] }, uRes: { value: new T.Vector2(1, 1) }, uP0: { value: new T.Vector2() }, uPs: { value: new T.Vector2(1, 1) }, uQ0: { value: new T.Vector2() }, uQs: { value: new T.Vector2(1, 1) },
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
    const QP = [[0, 0], [.56, 0], [.58, .05], [.54, .1], [.44, .13], [.46, .18], [.36, .23], [.26, .3], [.19, .48], [.145, .75], [.135, .95], [.15, 1.05], [.2, 1.1], [.27, 1.13], [.28, 1.155], [.22, 1.18], [.22, 1.24], [.28, 1.36], [.34, 1.52], [.3, 1.535], [.24, 1.55], [.16, 1.6], [.08, 1.635], [0, 1.645]];
    const QI = [[.2024, 1.18], [.2024, 1.24], [.2576, 1.36], [.3128, 1.52]];
    const LG = (pts, n) => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(Math.max(x, .0005), y)), n);
    const crown = (g, m, deco) => { const cg = new T.ConeGeometry(.026, .09, 10), bg = new T.SphereGeometry(.03, 14, 10);
      for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * Math.PI * 2 + Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
        const cn = new T.Mesh(cg, m); cn.position.set(c * .305, 1.575, sn * .305); const b = new T.Mesh(bg, m); b.position.set(c * .305, 1.645, sn * .305); g.add(cn, b); if (deco) deco.push(cn, b); }
      const tb = new T.Mesh(new T.SphereGeometry(.065, 20, 14), m); tb.position.y = 1.7; g.add(tb); if (deco) deco.push(tb); };
    const queen = (mk) => {
      const g = new T.Group();
      if (mk) { g.add(new T.Mesh(LG(QP, 48), mk)); crown(g, mk); return g; }
      const lm = mat('porcelain', { double: true }); lm.uniforms.uQ.value = 2; const bm = mat('porcelain'); bm.uniforms.uQ.value = 1; qm.push(lm, bm);
      const body = new T.Mesh(LG(QP, 128), lm); body.castShadow = true; g.add(body); g.add(new T.Mesh(LG(QI, 128), lm));
      const deco = []; crown(g, bm, deco); deco.forEach(o => o.castShadow = true);
      const jm = new T.ShaderMaterial({ vertexShader: JVS, fragmentShader: JFS, side: T.DoubleSide, uniforms: { uOpen: { value: 1 }, uWarm: { value: 0 } } });
      const jg = new T.BufferGeometry(), P = [], I = [], N = 140; for (let i = 0; i <= N; i++) P.push(i / N, 0, 0, i / N, 1, 0); for (let i = 0; i < N; i++) { const a = i * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      jg.setAttribute('position', new T.Float32BufferAttribute(P, 3)); jg.setIndex(I); const jamb = new T.Mesh(jg, jm); jamb.frustumCulled = false; g.add(jamb);
      g.userData = { deco, jm }; return g;
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
    return { mat, lathe, pawn, queen, dove, qm };
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
 vec3 sky=mix(uSkyB,uSky,clamp(.35+n*.6,0.,1.)); sky=mix(sky,uCloud,cl*.85);
 float rp=sin((q.y*.9+q.x*.35)*24.+vn(vec3(q*2.,6.))*3.); vec3 bed=mix(vec3(.62,.52,.38),vec3(.78,.67,.5),smoothstep(-.3,.9,rp));
 float ca=vn(vec3(q*6.,uT*.5)); ca=pow(1.-abs(ca*2.-1.),6.); bed+=vec3(1.,.97,.86)*ca*.22; bed=mix(bed,vec3(.24,.56,.64),.46);
 float fres=.34+.55*pow(1.-max(V.y,0.),3.); vec3 c=mix(bed,sky,fres); c*=.94+.12*r;
 vec2 g=abs(fract(vW.xz)-.5); float e=max(g.x,g.y); c=mix(c,vec3(.96,.95,.9),smoothstep(.35,.41,e)*(1.-smoothstep(.41,.44,e))*.35);
 c=mix(c,vec3(.40,.34,.25),smoothstep(.41,.5,e)*.62);
 c+=smoothstep(.86,.98,vn(vec3(p*9.,uT*.9)))*smoothstep(.6,.9,cl+.3)*.18;
 gl_FragColor=vec4(c,.92); }`;

  /* ---------- v8 apple: Magritte still life, real floor, bite that opens onto the beach ---------- */
  const NZ8 = "float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat vn(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.-2.*f);\nreturn mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}\nfloat h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nvec3 cell(vec2 p){vec2 i=floor(p),f=fract(p);float d1=9.,d2=9.,id=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(h2(i+g),h2(i+g+19.7));vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;id=h2(i+g+3.1);}else if(d<d2)d2=d;}return vec3(id,sqrt(d1),sqrt(d2));}\n";
  const JVS = `uniform float uOpen; varying float vS; varying float vK; varying vec3 vP;
float QRf(float y){ return y<=1.24?.22:(y>=1.52?.34:(y<1.36?mix(.22,.28,(y-1.24)/.12):mix(.28,.34,(y-1.36)/.16))); }
void main(){ float g=uOpen, w=.016*g, h=.035*g, s=position.x, k=position.y;
 float Ls=2.*w, Lr=2.*h-w, La=3.14159265*w, d=s*(Ls+2.*Lr+La); vec2 p;
 if(d<Ls) p=vec2(-w+d,-h); else if(d<Ls+Lr) p=vec2(w,-h+d-Ls); else if(d<Ls+Lr+La){ float a=(d-Ls-Lr)/w; p=vec2(w*cos(a),h-w+w*sin(a)); } else p=vec2(-w,h-w-(d-Ls-Lr-La));
 float y=1.335+p.y, rk=QRf(y)*mix(1.004,.916,k), an=1.5707963+p.x/rk;
 vec3 pos=vec3(rk*cos(an),y,rk*sin(an)); vS=s; vK=k; vP=pos; gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(pos,1.); }`;
  const JFS = `uniform float uWarm; varying float vS; varying float vK; varying vec3 vP;
` + NZ8 + `
void main(){ float n=vn(vec3(vS*140.,vK*5.,1.))*.6+vn(vec3(vS*380.,vK*12.,2.))*.4;
 vec3 por=mix(vec3(.95,.92,.87),vec3(.92,.80,.64),uWarm);
 vec3 sto=mix(vec3(.62,.38,.28),vec3(.80,.55,.40),n);
 vec3 c=mix(por,sto,smoothstep(.08,.3,vK)*(.85+.15*n));
 c*=mix(1.03,.88,smoothstep(.0,.05,vP.y-1.335));
 gl_FragColor=vec4(c,1.); }`;
  const AVS8 = `varying vec3 vW; varying vec3 vN; varying vec3 vO; varying vec3 vNl;
void main(){ vO = position; vNl = normal; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
  const BSC = `float bsc(vec3 v){ vec3 n=normalize(v); float an=atan(n.y,n.x); return (.045*abs(sin(an*7.))+.018*sin(an*19.+1.3)+.01*sin(an*31.))*(1.-smoothstep(.3,.75,-n.z)); }`;
  const BU = `uniform vec3 uBc[2]; uniform vec3 uBt[2]; uniform vec3 uBb[2]; uniform vec3 uBd[2]; uniform vec3 uBe[2]; uniform float uBk[2]; uniform float uI;`;
  const WVS8 = BU + `
varying vec3 vW; varying vec3 vN; varying vec3 vO; varying vec3 vNl;
` + BSC + `
void main(){ bool s=uI>.5; vec3 c=s?uBc[1]:uBc[0]; vec3 t=s?uBt[1]:uBt[0]; vec3 b=s?uBb[1]:uBb[0]; vec3 d=s?uBd[1]:uBd[0]; vec3 e=s?uBe[1]:uBe[0]; float k=max(s?uBk[1]:uBk[0],.001);
 vec3 n=normalize(position); float R=k*(1.+bsc(n)); vec3 lp=c+(t*n.x*e.x+b*n.y*e.y+d*n.z*e.z)*R; vO=lp; vNl=n;
 vec3 nn=normalize(t*n.x/e.x+b*n.y/e.y+d*n.z/e.z); vec4 w=modelMatrix*vec4(lp,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*(-nn)); gl_Position=projectionMatrix*viewMatrix*w; }`;
  const AFS8 = BU + `
uniform vec3 uLd,uPc,uPa; uniform float uT,uKind,uPort,uSand;
varying vec3 vW; varying vec3 vN; varying vec3 vO; varying vec3 vNl;
` + NZ8 + BSC + `
float bsd(vec3 p,vec3 c,vec3 t,vec3 b,vec3 d,vec3 e,float k){ if(k<.001) return 9.; vec3 q=p-c; vec3 v=vec3(dot(q,t)/e.x,dot(q,b)/e.y,dot(q,d)/e.z); return (length(v)-k*(1.+bsc(v)))*min(e.x,e.y); }
float BD0(vec3 p){ return bsd(p,uBc[0],uBt[0],uBb[0],uBd[0],uBe[0],uBk[0]); }
float BD1(vec3 p){ return bsd(p,uBc[1],uBt[1],uBb[1],uBd[1],uBe[1],uBk[1]); }
float prof(vec3 p){ float ph=atan(p.z,p.x); float kk=1.+.025*sin(ph+.4)+.012*sin(2.*ph+1.3); float yy=clamp(p.y/.96,-1.,1.); return sqrt(max(0.,1.-yy*yy))*(1.+.05*yy)*kk; }
vec3 flesh(vec3 p,vec3 N,vec3 L,vec3 V){
 float fib=vn(p*vec3(30.,80.,30.))*.6+vn(p*130.)*.4;
 vec3 c=vec3(.965,.912,.80)*(.84+.22*fib);
 c=mix(c*vec3(.80,.68,.54),c*1.04,clamp(smoothstep(-.6,.8,-N.y)*.8+.25*max(dot(N,L),0.),0.,1.));
 vec3 Hh=normalize(L+V); float sp=pow(max(dot(N,Hh),0.),26.)+pow(max(dot(N,V),0.),60.)*.5; float wet=smoothstep(.45,.85,vn(p*vec3(14.,40.,14.)+2.));
 c=mix(c,vec3(1.,.99,.96),smoothstep(.12,.5,sp*(.25+wet))*.38);
 return c;
}
void main(){
 vec3 V=normalize(cameraPosition-vW); vec3 L=normalize(uLd); vec3 p=vO;
 if(uKind>.5&&uKind<1.5){
   float rim=prof(p)*.995-length(p.xz); if(rim<0.) discard;
   if((uI<.5?BD1(p):BD0(p))<-.006) discard;
   vec3 n=normalize(vNl); float dep=-n.z; vec3 pv=p-uPc; float lat=length(pv-uPa*dot(pv,uPa)); float an1=atan(dot(pv,cross(uPa,vec3(0.,1.,0.))),pv.y);
   lat+=(vn(vec3(an1*2.5,uPort*3.,1.))-.5)*uPort*.35+(vn(vec3(an1*9.,2.,uPort))-.5)*.02;
   if(lat<uPort){ gl_FragColor=vec4(0.); return; }
   vec3 N=normalize(vN);
   vec3 c=flesh(p,N,L,V);
   float an0=atan(n.y,n.x); c*=.88+.2*vn(vec3(an0*60.,dep*5.,uI*7.))*vn(vec3(an0*23.,dep*2.,3.));
   c=mix(c*1.04,c*vec3(.88,.80,.68),smoothstep(-.1,.95,dep));
   c=mix(c,vec3(.80,.64,.42),(1.-smoothstep(0.,.045,rim))*.3);
   c*=1.-.14*(1.-smoothstep(0.,.07,lat-uPort));
   float an=atan(n.y,n.x); vec2 fp=uI<.5?vec2(2.2,.0):vec2(.7,.0);
   vec2 dd=vec2((an-fp.x)*2.2,rim/.02-.45); float fl=1.-smoothstep(.18,.26,length(dd*vec2(1.,.7)));
   c=mix(c,vec3(.62,.10,.10),fl*.9);
   gl_FragColor=vec4(mix(c,vec3(.824,.761,.639),uSand),1.); return; }
 vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; float ndl=dot(N,L); vec3 Hh=normalize(L+V); float nv=max(dot(N,V),0.);
 float lam=clamp(ndl*.55+.45+(vn(p*9.)-.5)*.1,0.,1.);
 if(uKind<.5){
   float e0=BD0(p), e1=BD1(p); if(e0<0.||e1<0.) discard; float ed=min(e0,e1);
   if(!gl_FrontFacing){ if(uPort>.5){ gl_FragColor=vec4(0.); return; } gl_FragColor=vec4(mix(flesh(p,N,L,V),vec3(.824,.761,.639),uSand),1.); return; }
   float ph=atan(p.z,p.x);
   float sf=vn(vec3(ph*11.,p.y*1.6,1.))*.5+vn(vec3(ph*23.+2.,p.y*2.4,3.))*.3+vn(vec3(ph*52.,p.y*3.5,5.))*.2;
   float bs=vn(vec3(ph*5.,p.y*3.,9.)); lam=clamp(lam+.06+(sf-.5)*.34+(bs-.5)*.16,0.,1.);
   vec3 col=mix(vec3(.478,.078,.094),vec3(.66,.10,.11),smoothstep(.12,.55,lam)); col=mix(col,vec3(.87,.31,.16),smoothstep(.55,.95,lam));
   float ys=smoothstep(.63,.9,vn(vec3(ph*38.,p.y*1.7,1.))); float ds=smoothstep(.6,.92,vn(vec3(ph*61.+4.,p.y*2.2,2.)));
   col=mix(col,vec3(.93,.60,.22),ys*.42*smoothstep(.2,.8,lam)); col=mix(col,vec3(.40,.05,.07),ds*.32);
   vec3 ce=cell(vec2(ph*34.,p.y*52.)+3.1); col=mix(col,vec3(.95,.83,.64),(1.-smoothstep(.035,.07,ce.y))*step(.62,ce.x)*.38*smoothstep(.15,.7,lam));
   col+=vec3(.34,.14,.07)*(1.-smoothstep(-.75,.05,N.y))*(1.-lam)*.9;
   float hs=pow(max(dot(N,Hh),0.),36.); float hm=smoothstep(.45,.7,vn(vec3(ph*30.,p.y*4.,7.))); col=mix(col,vec3(1.,.86,.70),smoothstep(.2,.55,hs*(.25+1.3*hm))*.32);
   float fr=pow(1.-nv,3.); col+=vec3(1.,.52,.22)*fr*smoothstep(-.2,.6,ndl)*.32;
   col=mix(col,vec3(.74,.72,.80),fr*.2*(1.-smoothstep(-.2,.6,ndl)));
   col=mix(col,vec3(.56,.60,.74),smoothstep(.55,1.,N.y)*.1);
   col=mix(col,vec3(.86,.76,.70),pow(1.-nv,7.)*.4);
   if(ed<.006){ col=mix(col,vec3(.74,.17,.14),(1.-smoothstep(.002,.006,ed))*.7); }
   gl_FragColor=vec4(col,1.); return; }
 vec3 col;
 if(uKind<2.5){
   float az=abs(p.z); float cv=1.-smoothstep(0.,.006,az); float sv=abs(fract(p.x*18.-az*13.)-.5); float vs=(1.-smoothstep(0.,.07,sv))*smoothstep(.008,.02,az)*(1.-smoothstep(.1,.14,az));
   col=mix(vec3(.07,.15,.05),vec3(.25,.38,.11),smoothstep(.15,.85,lam)); col=mix(col,vec3(.50,.58,.26),max(cv,vs*.5)*.6);
   if(!gl_FrontFacing) col=mix(col*.8,vec3(.30,.38,.28),.3);
   col+=vec3(.8,.5,.2)*pow(1.-nv,3.)*.18;
 } else if(uKind<3.5){ col=mix(vec3(.18,.10,.05),vec3(.46,.31,.17),smoothstep(.15,.85,lam)); col*=.85+.3*vn(vec3(p.x*90.,p.y*7.,p.z*90.)); }
 else if(uKind<4.5){ float rr=length(p.xz-vec2(.06,0.)); col=mix(vec3(.6,.46,.28),vec3(.82,.70,.50),lam); col*=.9+.1*sin(rr*420.); col=mix(col,vec3(.36,.24,.13),smoothstep(.016,.024,rr)); }
 else if(uKind<5.5){ col=mix(vec3(.34,.30,.29),vec3(.84,.78,.70),smoothstep(.12,.9,lam)); col*=.9+.2*vn(p*24.); float s=pow(max(dot(N,Hh),0.),30.); col=mix(col,vec3(1.,.95,.86),smoothstep(.3,.7,s)*.35); col+=vec3(.12,.06,.03)*(1.-smoothstep(-.6,.1,N.y)); }
 else if(uKind<6.5){
   if(gl_FrontFacing){ float an=atan(p.x,-p.z); float rib=.5+.5*cos(an*18.); col=mix(vec3(.66,.42,.34),vec3(.98,.86,.76),smoothstep(.12,.9,lam)); col*=.84+.16*rib; col=mix(col,vec3(.86,.50,.38),smoothstep(.55,1.,length(p.xz))*.35); }
   else { float ir=.5+.5*sin(nv*9.+p.x*18.+p.z*11.); col=mix(vec3(.97,.89,.90),vec3(.86,.92,.99),ir)*(.82+.25*lam); }
   float s=pow(max(dot(N,Hh),0.),40.); col=mix(col,vec3(1.,.98,.95),smoothstep(.25,.6,s)*.5);
 } else {
   float an=atan(p.z,p.x); float band=fract(an/6.2832+p.y*4.); col=mix(vec3(.62,.46,.34),vec3(.95,.88,.78),smoothstep(.12,.9,lam)); col=mix(col,vec3(.52,.32,.22),smoothstep(.55,.7,band)*(1.-smoothstep(.8,.95,band))*.6);
   float ap=(1.-smoothstep(.25,.4,abs(an-1.2)))*(1.-smoothstep(.35,.55,p.y)); float ir=.5+.5*sin(nv*8.+p.y*30.); col=mix(col,mix(vec3(.98,.86,.86),vec3(.88,.92,.99),ir),ap*.85);
   float s=pow(max(dot(N,Hh),0.),36.); col=mix(col,vec3(1.,.98,.95),smoothstep(.25,.6,s)*.45);
 }
 gl_FragColor=vec4(col,1.);
}`;
  const FVS8 = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  const FFS8 = `uniform vec3 uLd; uniform vec4 uSph[6]; uniform float uT; varying vec3 vW;
` + NZ8 + `
void main(){
 vec3 L=normalize(uLd); vec2 P=vW.xz; vec2 g=P+.5; vec2 fw=fwidth(g)+1e-4;
 vec2 id=floor(g); vec2 de=.5-abs(fract(g)-.5);
 vec2 sg=sign(sin(3.14159265*g)); vec2 q=sg*clamp(de/fw,0.,1.); float chk=.5+.5*q.x*q.y;
 float h=h2(id); float fa=1.-smoothstep(.03,.2,max(fw.x,fw.y));
 vec3 A=vec3(.541,.314,.224)*(.97+.06*h); vec3 B=vec3(.867,.82,.725)*(.98+.04*fract(h*7.3));
 vec3 col=mix(A,B,chk);
 float bt=vn(vec3(P*vec2(9.,5.),h*10.))*.5+vn(vec3(P*vec2(23.,31.),h*3.))*.5; col*=1.+(bt-.5)*.07*fa;
 col+=smoothstep(.66,.9,vn(vec3(P*2.3,h*5.)))*.035*fa;
 vec3 ce=cell(P*6.); float ed=min(de.x,de.y); float chip=(1.-smoothstep(.05,.09,ce.y))*step(.84,ce.x)*(1.-smoothstep(0.,.1,ed));
 col=mix(col,col*.72+vec3(.07,.05,.04),chip*fa*.85);
 col*=1.-.16*fa*(1.-smoothstep(0.,.02+fw.x+fw.y,ed));
 float zs=vW.z; float ws=1.-smoothstep(-15.3,-15.18,zs);
 col=mix(col,vec3(.55,.46,.37)*(.92+.12*vn(vec3(P*vec2(3.,18.),2.))),ws);
 col*=1.-(1.-smoothstep(0.,.04+fw.y,abs(zs+15.24)))*.35;
 float lap=-15.78+.07*sin(vW.x*.6+uT*.5)+.04*sin(vW.x*1.7-uT*.8);
 col=mix(col,vec3(.90,.92,.90),(1.-smoothstep(0.,.05+fw.y,abs(zs-lap)))*.55*ws);
 col=mix(col,vec3(.40,.50,.56),(1.-smoothstep(lap-.02,lap+.02,zs))*ws*.7);
 float sh=0.; float ao=1.;
 for(int i=0;i<6;i++){ vec4 s=uSph[i]; if(s.w<=0.) continue; vec3 wv=s.xyz-vW; float tt=dot(wv,L); float dxz=length(vW.xz-s.xz); ao*=1.-.45*exp(-dxz*dxz/(s.w*s.w*.3));
   if(tt>0.){ float dd=length(wv-L*tt); float pen=.03+tt*.09; sh=max(sh,(1.-smoothstep(s.w-pen,s.w+pen,dd))*(1.-smoothstep(10.,18.,tt))); } }
 col*=ao; col=mix(col,col*vec3(.42,.38,.52),sh*.85);
 vec3 Vd=normalize(vW-cameraPosition); vec3 Rd=reflect(Vd,vec3(0.,1.,0.));
 vec3 oc=vW-uSph[0].xyz; float b=dot(oc,Rd); float cc=dot(oc,oc)-uSph[0].w*uSph[0].w; float disc=b*b-cc;
 if(disc>0.){ float th=-b-sqrt(disc); if(th>0.){ float brk=smoothstep(.3,.75,vn(vec3(vW.x*16.,vW.z*1.2,3.)))*.7+.3*vn(vec3(vW.x*40.,vW.z*3.,6.)); col=mix(col,vec3(.34,.06,.07),clamp(exp(-th*1.7)*brk*.45,0.,.4)); } }
 float dist=length(vW-cameraPosition); col=mix(col,vec3(.90,.79,.67),clamp(smoothstep(5.,22.,dist)*.7+(1.-fa)*.25,0.,.85));
 gl_FragColor=vec4(col,1.);
}`;
  const shellGeo = T => { const P = [], I = [], NA = 30, NR = 10; for (let a = 0; a <= NA; a++) { const an = -1.25 + 2.5 * a / NA, rib = .05 * Math.pow(Math.abs(Math.cos(an * 9)), .5); for (let r = 0; r <= NR; r++) { const rr = r / NR; P.push(Math.sin(an) * rr, .24 * Math.sin(Math.PI * (rr * .85 + .15)) + rib * rr * (1 - rr) * 2, -Math.cos(an) * rr); } }
    for (let a = 0; a < NA; a++) for (let r = 0; r < NR; r++) { const i0 = a * (NR + 1) + r, i1 = i0 + NR + 1; I.push(i0, i0 + 1, i1, i1, i0 + 1, i1 + 1); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g; };
  const spiralGeo = T => { const pts = []; for (let i = 0; i <= 40; i++) { const y = i / 40; pts.push(new T.Vector2(.34 * Math.pow(Math.sin(Math.PI * Math.min(1, y * .95 + .05)), .7) * Math.pow(1 - y, .6) + .002, y)); }
    const g = new T.LatheGeometry(pts, 48), pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), k = 1 + .12 * Math.max(0, Math.sin(Math.atan2(z, x) + y * 26)); pa.setX(i, x * k); pa.setZ(i, z * k); }
    g.computeVertexNormals(); return g; };
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
          g.updateMatrixWorld(); cam.updateMatrixWorld(); st.bc = st.bc || [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
          for (let i = 0; i < 3; i++) { const B = m.uniforms.uB.value[i], k = bk[i], o = m.uniforms.uSc.value[i]; if (k < .01) { o.set(0, 0, 0); st.bc[i] = [0, 0, 0]; continue; }
            const c = new T.Vector3(B.x, B.y, B.z), D = c.length(), r = B.w * k, x = (D * D - r * r + 1) / (2 * D), rho = Math.sqrt(Math.max(0, 1 - x * x)) * 1.08;
            const p = c.clone().normalize().multiplyScalar(x); g.localToWorld(p); const up = new T.Vector3(0, 1, 0).applyQuaternion(cam.quaternion).multiplyScalar(rho * 1.3);
            const a = p.clone().project(cam), q = p.clone().add(up).project(cam), rr = Math.abs(q.y - a.y) / 2;
            o.set((a.x + 1) / 2 * rs.x, (a.y + 1) / 2 * rs.y, rr * rs.y); st.bc[i] = [(a.x + 1) / 2, (1 - a.y) / 2, rr]; } origin.copy(d).multiplyScalar(1.0); g.localToWorld(origin); cam.updateMatrixWorld(); const v = origin.clone().project(cam); st.bx = (v.x + 1) / 2; st.by = (1 - v.y) / 2;
        },
        dispose() { tex && tex.dispose(); },
      };
    },

    apple8(T, scene, cam, light, K) {
      K.ground.visible = false; light.castShadow = false;
      const LD = new T.Vector3(-1, .34, -.85).normalize(), V3 = () => new T.Vector3();
      const shared = { uLd: { value: LD }, uT: { value: 0 }, uPc: { value: new T.Vector3() }, uPa: { value: new T.Vector3(0, 0, 1) }, uPort: { value: .1 }, uSand: { value: 0 }, uBc: { value: [V3(), V3()] }, uBt: { value: [V3(), V3()] }, uBb: { value: [V3(), V3()] }, uBd: { value: [V3(), V3()] }, uBe: { value: [new T.Vector3(1, 1, 1), new T.Vector3(1, 1, 1)] }, uBk: { value: [0, 0] } };
      const am = (kind, o = {}) => new T.ShaderMaterial({ vertexShader: o.vs || AVS8, fragmentShader: AFS8, side: o.side ?? T.FrontSide, uniforms: Object.assign({}, shared, { uKind: { value: kind }, uI: { value: o.i || 0 } }) });
      const pts = []; for (let i = 0; i <= 72; i++) { const th = -Math.PI / 2 + Math.PI * i / 72, s = Math.sin(th); const x = Math.cos(th) * (1 + .05 * s); let y = s * .96; if (y > 0) y -= .16 * Math.exp(-x * x / .035); else y += .07 * Math.exp(-x * x / .02); pts.push(new T.Vector2(Math.max(x, .0005), y)); }
      const ag = new T.LatheGeometry(pts, 128), pa = ag.attributes.position;
      for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i), ph = Math.atan2(z, x), kk = 1 + .025 * Math.sin(ph + .4) + .012 * Math.sin(2 * ph + 1.3); pa.setX(i, x * kk); pa.setZ(i, z * kk); }
      const g = new T.Group(), S = 1.3; g.scale.setScalar(S); g.position.y = .955 * S; g.rotation.y = -.25;
      g.add(new T.Mesh(ag, am(0, { side: T.DoubleSide })));
      [0, 1].forEach(i => { const wl = new T.Mesh(new T.SphereGeometry(1, 72, 54), am(1, { vs: WVS8, side: T.BackSide, i })); wl.frustumCulled = false; g.add(wl); });
      const sg = new T.CylinderGeometry(.024, .036, .36, 12, 8), spp = sg.attributes.position;
      for (let i = 0; i < spp.count; i++) { const u = (spp.getY(i) + .18) / .36; spp.setX(i, spp.getX(i) + .06 * u * u); } sg.computeVertexNormals();
      const stem = new T.Mesh(sg, [am(3), am(4), am(3)]); stem.position.set(0, .93, 0); stem.rotation.z = -.12; g.add(stem);
      const lp = [], li = [], NU = 20, NV = 8, LL = .5;
      for (let a = 0; a <= NU; a++) { const u = a / NU, hw = .15 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.04)), .8) * (1 - u * .2); for (let b = 0; b <= NV; b++) { const v = b / NV * 2 - 1; lp.push(u * LL, -.16 * u * u + .03 * (1 - v * v) + .06 * u * u * v * v + .03 * Math.sin(u * 7) * v, v * hw); } }
      for (let a = 0; a < NU; a++) for (let b = 0; b < NV; b++) { const i0 = a * (NV + 1) + b, i1 = i0 + NV + 1; li.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1); }
      const lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(lp, 3)); lg.setIndex(li); lg.computeVertexNormals();
      const leaf = new T.Mesh(lg, am(2, { side: T.DoubleSide })); leaf.position.set(.03, .9, .02); leaf.rotation.set(.3, .6, .35); g.add(leaf);
      scene.add(g);
      const fm = new T.ShaderMaterial({ vertexShader: FVS8, fragmentShader: FFS8, extensions: { derivatives: true }, uniforms: { uLd: { value: LD }, uT: shared.uT, uSph: { value: Array.from({ length: 6 }, () => new T.Vector4()) } } });
      const floor = new T.Mesh(new T.PlaneGeometry(90, 26), fm); floor.rotation.x = -Math.PI / 2; floor.position.z = -3; scene.add(floor);
      fm.uniforms.uSph.value[0].set(0, 1.25, 0, 1.27);
      const surf = d => { let s = 1; for (let k = 0; k < 6; k++) { const y = s * d.y / .96, R = Math.sqrt(Math.max(0, 1 - y * y)) * (1 + .05 * y); s = R / Math.max(.05, Math.hypot(d.x, d.z)); } return s; };
      let w = 1, h = 1, built = false, bset = false, ax = new T.Vector3(), Dl = new T.Vector3();
      const tmp = new T.Vector3(), Dw = new T.Vector3(), C1 = new T.Vector3(), ctr = new T.Vector3(0, 1.24, 0), up = new T.Vector3(0, 1, 0), q0 = new T.Quaternion(), q1 = new T.Quaternion(), m4 = new T.Matrix4(), eu = new T.Euler();
      const setBites = C => {
        g.updateMatrixWorld(); const cl = g.worldToLocal(C.clone()).sub(new T.Vector3(0, 0, 0)).normalize();
        const rt = new T.Vector3().crossVectors(up, cl).normalize(), d0 = cl.clone().addScaledVector(rt, 1.0).addScaledVector(up, .78).normalize(); ax.copy(d0);
        const E = [new T.Vector3(.30, .2, .3), new T.Vector3(.27, .19, .28)]; Dl.set(0, 0, 0);
        [-.13, .15].forEach((o, i) => { const t0 = new T.Vector3().crossVectors(up, d0).normalize(), d = d0.clone().addScaledVector(t0, o).normalize(), t = new T.Vector3().crossVectors(up, d).normalize(), b = new T.Vector3().crossVectors(d, t), c = d.clone().multiplyScalar(surf(d) + .07);
          shared.uBc.value[i].copy(c); shared.uBt.value[i].copy(t); shared.uBb.value[i].copy(b); shared.uBd.value[i].copy(d); shared.uBe.value[i].copy(E[i]); Dl.add(c.clone().addScaledVector(d, -E[i].z * .92).multiplyScalar(.5)); }); shared.uPc.value.copy(Dl); shared.uPa.value.copy(ax);
      };
      return {
        resize(W, H) { w = W; h = H; },
        update(t, st) {
          shared.uT.value = t; const c = st.cam; if (!c) return;
          if (!built && st.peb) { built = true; let si = 1; st.peb.forEach(p => { const k = p.kind || 'peb', m = new T.Mesh(k === 'scallop' ? shellGeo(T) : k === 'spiral' ? spiralGeo(T) : new T.SphereGeometry(1, 24, 16), am(k === 'scallop' ? 6 : k === 'spiral' ? 7 : 5, { side: k === 'peb' ? T.FrontSide : T.DoubleSide }));
            if (k === 'scallop') { m.scale.setScalar(p.r); if (p.flip) { m.rotation.set(Math.PI, p.rot || 0, .12); m.position.set(p.x, p.r * .2, p.z); } else { m.rotation.y = p.rot || 0; m.position.set(p.x, .004, p.z); } }
            else if (k === 'spiral') { m.scale.setScalar(p.r); m.rotation.set(0, p.rot || 0, Math.PI / 2 - .25); m.position.set(p.x, p.r * .26, p.z); }
            else { m.scale.set(p.r, p.r * .58, p.r * .82); m.position.set(p.x, p.r * .5, p.z); m.rotation.y = p.rot || 0; }
            scene.add(m); if (si < 6 && !p.noShadow) fm.uniforms.uSph.value[si++].set(p.x, k === 'peb' ? p.r * .45 : p.r * .18, p.z, p.r * (k === 'peb' ? .8 : .5)); }); }
          C1.set(c.C[0], c.C[1], c.C[2]); if (!bset) { bset = true; setBites(C1); }
          const bk = st.bk || [0, 0]; shared.uBk.value[0] = bk[0] > .001 ? .45 + .55 * bk[0] : 0; shared.uBk.value[1] = bk[1] > .001 ? .45 + .55 * bk[1] : 0;
          const b = Math.max(bk[0], bk[1]); g.rotation.y = -.25 + Math.sin(t * .22) * .05 * (1 - Math.min(1, b * 8));
          shared.uPort.value = st.port ?? .1; shared.uSand.value = st.sand || 0;
          const e = st.dolly || 0;
          cam.fov = c.fov; cam.near = e > .01 ? .02 : .1; cam.far = 200; cam.aspect = w / h; cam.setViewOffset(w, h, -c.shift, 0, w, h); cam.updateProjectionMatrix();
          g.updateMatrixWorld(); Dw.copy(Dl); g.localToWorld(Dw); const axW = ax.clone().transformDirection(g.matrixWorld);
          const d0 = C1.distanceTo(Dw), dist = d0 * Math.pow(.1 / d0, e), al = smooth(0, .75, e), dir = tmp.copy(C1).sub(Dw).normalize().lerp(axW, al).normalize();
          cam.position.copy(Dw).addScaledVector(dir, dist);
          q0.setFromEuler(eu.set(c.pitch, 0, 0)); m4.lookAt(cam.position, Dw, up); q1.setFromRotationMatrix(m4); cam.quaternion.copy(q0).slerp(q1, smooth(0, .65, e));
          cam.updateMatrixWorld(); if (window.__dbg3d) { const fw = new T.Vector3(0, 0, -1).applyQuaternion(cam.quaternion); st._dbg = { cp: cam.position.toArray().map(v => +v.toFixed(3)), fw: fw.toArray().map(v => +v.toFixed(3)), toD: Dw.clone().sub(cam.position).normalize().toArray().map(v => +v.toFixed(3)), D: Dw.toArray().map(v => +v.toFixed(3)), ax: axW.toArray().map(v => +v.toFixed(3)) }; }
          const Fp = h / 2 / Math.tan(c.fov * Math.PI / 360);
          tmp.copy(Dw).project(cam); st.Ds = [(tmp.x + 1) / 2 * w, (1 - tmp.y) / 2 * h];
          const dz = -ctr.clone().applyMatrix4(cam.matrixWorldInverse).z; tmp.copy(ctr).project(cam);
          st.ac = dz > 1.45 ? [(tmp.x + 1) / 2 * w, (1 - tmp.y) / 2 * h, Fp * 1.22 / dz] : [w / 2, h / 2, 1e6];
          const pr = st.port ?? .1, dzp = -Dw.clone().applyMatrix4(cam.matrixWorldInverse).z;
          st.pm = dzp > .03 && pr < .9 ? [st.Ds[0], st.Ds[1], Fp * pr * 1.25 * S / dzp] : [w / 2, h / 2, 1e6];
          st.ready = true;
        },
      };
    },
    sandboard(T, scene, cam, light, K) {
      const sand = K.mat('drysand', { ns: 1.4 }), rid = K.mat('ridge', { ns: 2 }), pm = K.mat('print');
      const wm = new T.ShaderMaterial({ vertexShader: WVS, fragmentShader: WFS, transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uSky: { value: new T.Color('#8CC0E4') }, uSkyB: { value: new T.Color('#4F8FC8') }, uCloud: { value: new T.Color('#F6F3EC') } } });
      const sb = new T.BoxGeometry(.93, .16, .93), wp = new T.PlaneGeometry(1, 1), bedM = K.mat('print');
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const x = i - 3.5, z = 3.5 - j; if ((i + j) % 2 === 0) { const w = new T.Mesh(wp, wm); w.rotation.x = -Math.PI / 2; w.position.set(x, -.03, z); w.renderOrder = 1; scene.add(w); const bed = new T.Mesh(new T.BoxGeometry(1, .04, 1), bedM); bed.position.set(x, -.26, z); scene.add(bed); } else { const t = new T.Mesh(sb, sand); t.position.set(x, -.04, z); scene.add(t); } }
      const cy = new T.CylinderGeometry(.05, .06, 1, 8);
      for (let k = 0; k <= 8; k++) { const r = new T.Mesh(cy, rid); r.scale.y = 8.05; r.rotation.x = Math.PI / 2; r.position.set(k - 4, .035, 0); r.castShadow = true; scene.add(r); const r2 = new T.Mesh(cy, rid); r2.scale.y = 8.05; r2.rotation.z = Math.PI / 2; r2.position.set(0, .035, k - 4); r2.castShadow = true; scene.add(r2); }
      const bdm = K.mat('border', { ns: 1.6 }); [[8.9, .45, 0, 4.225], [8.9, .45, 0, -4.225], [.45, 8, -4.225, 0], [.45, 8, 4.225, 0]].forEach(([bw, bd, bx, bz]) => { const b = new T.Mesh(new T.BoxGeometry(bw, .14, bd), bdm); b.position.set(bx, 0, bz); b.receiveShadow = true; scene.add(b); });
      { const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const x = cv.getContext('2d'), s = 1024 / 8.9, P = (X, Z) => [(X + 4.45) * s, (Z + 4.45) * s];
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'italic 500 ' + Math.round(s * .3) + 'px Cormorant, Georgia, serif';
        const put = (t, X, Z) => { const [a, b] = P(X, Z); x.fillStyle = 'rgba(255,244,222,.45)'; x.fillText(t, a, b + 1.5); x.fillStyle = 'rgba(92,66,42,.6)'; x.fillText(t, a, b); };
        'abcdefgh'.split('').forEach((c, i) => put(c, i - 3.5, 4.225)); for (let r = 1; r <= 8; r++) put(String(r), -4.225, 4.5 - r);
        const lab = new T.Mesh(new T.PlaneGeometry(8.9, 8.9), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false })); lab.rotation.x = -Math.PI / 2; lab.position.y = .072; lab.renderOrder = 2; scene.add(lab); }
      const S = .95, pawn = K.pawn(), n0 = K.qm.length, queen = K.queen(), qm = K.qm.slice(n0); pawn.scale.setScalar(S); queen.scale.setScalar(0); scene.add(pawn, queen);
      const proxy = K.queen(new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false })); proxy.traverse(o => { if (o.isMesh) o.castShadow = true; }); proxy.visible = false; scene.add(proxy);
      let R2 = null, curL = 0, def = null, sz = null; const rs = new T.Vector2();
      const mm = K.mat('ivory', { alpha: .5, double: true, tint: '#4F8FC8', tintK: .35 }); const mp = K.pawn(mm), mq = K.queen(mm); [mp, mq].forEach(o => { o.renderOrder = 2; o.traverse(c => c.renderOrder = 2); scene.add(o); });
      const RK = [2, 4, 5, 6, 7, 8], prints = [2.5, .5, -1.5].flatMap(z => [-1, 1].map(sd => { const m = new T.Mesh(new T.SphereGeometry(1, 10, 6), pm); m.scale.set(.07, .012, .11); m.position.set(.5 + sd * .1, .045, z + sd * .08); m.userData.z = z; m.visible = false; scene.add(m); return m; }));
      K.ground.position.y = .045; K.ground.material.depthWrite = false; K.ground.renderOrder = 3; K.ground.material.opacity = .38; K.ground.material.color.set('#8A6A44'); light.shadow.camera.layers.enableAll();
      light.position.set(-4, 6, -5); const v = new T.Vector3(), W0 = -.03;
      const mir = (src, dst, sy) => { dst.position.set(src.position.x, 2 * W0 - src.position.y, src.position.z); dst.scale.set(src.scale.x, -src.scale.y, src.scale.z); dst.rotation.y = src.rotation.y; dst.visible = src.visible && src.scale.y > .01; };
      return {
        resize(w, h) { const a = w / h; cam.fov = a < 1 ? 44 : 30; cam.position.set(0, a < 1 ? 26 : 18.5, a < 1 ? 8.5 : 9.4); cam.lookAt(0, 0, a < 1 ? .3 : 0); cam.updateProjectionMatrix(); def = { p: cam.position.clone(), l: new T.Vector3(0, 0, a < 1 ? .3 : 0), fov: cam.fov }; sz = [w, h]; if (R2) R2.setSize(w, h, false); },
        update(t, st) {
          wm.uniforms.uT.value = t;
          const p = st.p || 0, f = Math.min(1, p / .86) * 5, s = Math.min(4, Math.floor(f)), fr = f >= 5 ? 1 : f - s, e = smooth(.25, .75, fr), z0 = 4.5 - RK[s], z1 = 4.5 - RK[s + 1];
          pawn.position.set(.5, .04 + Math.sin(e * Math.PI) * (s ? .45 : .62), z0 + (z1 - z0) * e);
          prints.forEach(m => m.visible = pawn.position.z < m.userData.z - .55);
          const m = smooth(.9, .97, p);
          const pk = st.pk ?? 1; pawn.scale.set(S * (1 - m * .4) * pk, S * (1 - m) * pk, S * (1 - m * .4) * pk); pawn.visible = m < .99 && pk > .01;
          queen.position.set(.5, .04, -3.5); queen.scale.setScalar(S * m); queen.rotation.y = st.qrot ?? ((1 - m) * 2.4 + t * .1);
          const q = st.q;
          if (q && q.cam) { cam.position.set(q.cam.C[0], q.cam.C[1], q.cam.C[2]); cam.lookAt(q.cam.L[0], q.cam.L[1], q.cam.L[2]); cam.near = q.near; cam.fov = q.fov; if (sz) cam.setViewOffset(sz[0], sz[1], 0, -q.oy * sz[1], sz[0], sz[1]); cam.updateProjectionMatrix(); }
          else if (def) { cam.position.copy(def.p); cam.lookAt(def.l); if (cam.near !== .1 || cam.fov !== def.fov || (cam.view && cam.view.enabled)) { cam.near = .1; cam.fov = def.fov; cam.clearViewOffset(); cam.updateProjectionMatrix(); } }
          { const qd = queen.userData; qd.deco.forEach(o => o.visible = !(q && q.pass)); qd.jm.uniforms.uOpen.value = q ? q.open : 1; qd.jm.uniforms.uWarm.value = q ? q.warm : 0; }
          K.R.getDrawingBufferSize(rs);
          qm.forEach(mt => { const U = mt.uniforms; U.uWarm.value = q ? q.warm : 0; U.uOpen.value = q ? q.open : 1; U.uOpenP.value = q ? q.openP : 0; U.uThru.value = q ? 1 : 0; U.uSlide.value = q ? q.slide : 0; U.uRes.value.copy(rs); U.uQc.value.set(queen.position.x, 0, queen.position.z); U.uQn.value.set(Math.sin(queen.rotation.y), 0, Math.cos(queen.rotation.y)); if (q && q.hole) U.uHole.value.set(q.hole[0], q.hole[1], q.hole[2], q.hole[3]); });
          const LY = q && q.split ? 1 : 0; if (LY !== curL) { curL = LY; queen.traverse(o => o.layers.set(LY)); }
          proxy.visible = LY === 1 && queen.visible; proxy.position.copy(queen.position); proxy.rotation.copy(queen.rotation); proxy.scale.copy(queen.scale);
          if (st.qel && !R2) { R2 = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R2.outputColorSpace = T.LinearSRGBColorSpace; R2.setPixelRatio(K.R.getPixelRatio()); Object.assign(R2.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' }); st.qel.appendChild(R2.domElement); if (sz) R2.setSize(sz[0], sz[1], false); }
          mir(pawn, mp); mir(queen, mq);
          cam.updateMatrixWorld(); v.set(pawn.position.x, .5, pawn.position.z).project(cam); st.sx = (v.x + 1) / 2; st.sy = (1 - v.y) / 2;
        },
        render() { cam.layers.set(0); K.R.render(scene, cam); if (R2) { cam.layers.set(1); R2.render(scene, cam); cam.layers.set(0); } },
        dispose() { if (R2) { R2.dispose(); try { R2.forceContextLoss(); } catch (e) {} R2.domElement.remove(); R2 = null; } },
      };
    },
    arcade8(T, scene, cam, light, K) {
      K.ground.visible = false; light.castShadow = false;
      const s0 = (K.gs && K.gs()) || {}, XW = s0.xw || 2.6, ZE = s0.ze ?? -3.05, TH = .5, WH = 2.5, SPR = 1.45, BAY = 2.1, PIL = .55, ZB = ZE - .25;
      let zl = ZB; const sh = new T.Shape(); sh.moveTo(ZB, 0);
      for (let z0 = ZB; z0 + BAY <= ZB + 66; z0 += BAY) { const a = z0 + PIL, b = z0 + BAY, mz = (a + b) / 2, r = (b - a) / 2; sh.lineTo(a, 0); sh.lineTo(a, SPR); for (let i = 1; i < 18; i++) { const th = Math.PI - Math.PI * i / 18; sh.lineTo(mz + Math.cos(th) * r, SPR + Math.sin(th) * r * 1.05); } sh.lineTo(b, SPR); sh.lineTo(b, 0); zl = b; }
      const ZEND = zl + PIL; sh.lineTo(ZEND, 0); sh.lineTo(ZEND, WH); sh.lineTo(ZB, WH); sh.closePath();
      const GL = NZ8 + `const float XW=${XW.toFixed(3)},WH=2.5,SPR=1.45,BAY=2.1,PIL=.55,ZB=${ZB.toFixed(3)},ZEND=${ZEND.toFixed(3)};
vec3 LS(){ return normalize(vec3(1.,.62,.34)); }
float openSD(float z,float Y){ float l=mod(z-ZB,BAY); float m=(PIL+BAY)*.5, r=(BAY-PIL)*.5; if(Y<SPR) return abs(l-m)-r; return length(vec2(l-m,(Y-SPR)/1.05))-r; }
float sunVis(vec3 p){ if(p.x>XW-.01) return 1.; float t=XW-p.x; float Y=p.y+.62*t, zw=p.z+.34*t; if(zw<ZB||zw>ZEND) return 1.; float pen=.02+.012*t; float o=1.-smoothstep(-pen,pen,openSD(zw,Y)); return max(o,smoothstep(WH+.1,WH+.2,Y)); }
`;
      const FLF = `uniform float uT; uniform vec3 uEye; uniform vec4 uF[4]; varying vec3 vW;
` + GL + `
void main(){
 vec2 P=vW.xz; float ax=abs(P.x); vec2 fw=fwidth(P)+1e-4; float fa=1.-smoothstep(.03,.22,max(fw.x,fw.y));
 vec2 g=P+.5; vec2 id=floor(g); vec2 de=.5-abs(fract(g)-.5); vec2 sg=sign(sin(3.14159265*g)); vec2 q=sg*clamp(de/fw,0.,1.); float chk=.5+.5*q.x*q.y;
 float h=h2(id);
 vec3 A=vec3(.620,.322,.227)*(.96+.08*h), B=vec3(.827,.749,.608)*(.97+.06*fract(h*7.3));
 vec3 col=mix(A,B,chk);
 float bt=vn(vec3(P*vec2(7.,3.),h*10.))*.5+vn(vec3(P*vec2(19.,27.),h*3.))*.5; col*=1.+(bt-.5)*.09*fa;
 vec3 ce=cell(P*5.); float ed=min(de.x,de.y); col=mix(col,col*.74+vec3(.06,.04,.03),(1.-smoothstep(.05,.09,ce.y))*step(.86,ce.x)*(1.-smoothstep(0.,.12,ed))*fa*.8);
 col*=1.-.2*fa*(1.-smoothstep(0.,.02+fw.x+fw.y,ed));
 float outA=smoothstep(XW+.45,XW+.7,ax);
 float rp=sin(P.y*3.1+P.x*1.3+vn(vec3(P*.6,3.))*4.); vec3 sand=mix(vec3(.85,.64,.43),vec3(.91,.73,.52),smoothstep(-.4,.9,rp))*(.95+.08*vn(vec3(P*.25,7.)));
 col=mix(col,sand,outA);
 float dr=(1.-smoothstep(.05,.4+.12*sin(P.y*1.7),XW-ax))*(1.-outA); col=mix(col,vec3(.87,.68,.47),dr*.6);
 float v=sunVis(vec3(P.x,0.,P.y)); col*=mix(vec3(.74,.62,.62),vec3(1.04,1.,.95),v);
 vec2 sd=normalize(vec2(-1.,-.34)), sn=vec2(-sd.y,sd.x);
 for(int i=0;i<4;i++){ vec4 f=uF[i]; if(f.w<=0.) continue; vec2 d=P-f.xz; float a=dot(d,sd), b=dot(d,sn);
   float cst=smoothstep(-.05,.2,a)*(1.-smoothstep(f.w*.45,f.w,a))*(1.-smoothstep(.16+a*.04,.34+a*.1,abs(b)));
   float cont=exp(-dot(d,d)/.09);
   col=mix(col,col*vec3(.58,.48,.56),clamp(cst*.75+cont*.5,0.,.85)); }
 col*=1.-.24*exp(-max(XW-ax,0.)*4.)*(1.-outA);
 float dist=length(vW-uEye); col=mix(col,vec3(.914,.706,.486),clamp(smoothstep(8.,75.,dist)*.8+(1.-fa)*.12,0.,.85));
 gl_FragColor=vec4(col,1.);
}`;
      const WAF = `uniform float uT; uniform vec3 uEye; varying vec3 vW; varying vec3 vN; varying vec3 vO;
` + GL + `
void main(){ vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; float lam=max(dot(N,LS()),0.); float v=sunVis(vW+N*.03); float lt=lam*v;
 vec3 sh=vec3(.478,.243,.212), li=vec3(.906,.635,.416);
 float b1=vn(vec3(vW.z*2.2,vW.y*9.,vW.x*2.))*.6+vn(vec3(vW.z*6.,vW.y*22.,vW.x*5.))*.4;
 vec3 col=mix(sh,li,smoothstep(.05,.75,lt+(b1-.5)*.12));
 col+=vec3(.16,.08,.04)*(1.-lt)*clamp(.6-N.y*.6,0.,1.)*.7;
 col=mix(col,col*vec3(1.05,.92,.86),smoothstep(.6,1.,-N.y));
 if(abs(N.x)>.6){ vec2 fw2=fwidth(vW.yz)+1e-4; float yy=vW.y/.32; float row=floor(yy); float zz=vW.z/1.1+mod(row,2.)*.5;
   float my=min(fract(yy),1.-fract(yy))*.32, mz=min(fract(zz),1.-fract(zz))*1.1; float fa=1.-smoothstep(.01,.06,max(fw2.x,fw2.y));
   col*=1.-.16*fa*(1.-smoothstep(0.,.012+fw2.x,min(my,mz))); }
 col*=.93+.14*b1;
 float dist=length(vW-uEye); col=mix(col,vec3(.890,.643,.447),clamp(smoothstep(6.,60.,dist)*.75,0.,.8));
 gl_FragColor=vec4(col,1.); }`;
      const SKF = `uniform float uT; varying vec3 vW;
` + NZ8 + `
void main(){ vec3 d=normalize(vW-cameraPosition); float e=d.y, u=max(e,0.);
 vec3 col=mix(vec3(.945,.757,.533),vec3(.890,.604,.384),smoothstep(0.,.12,u)); col=mix(col,vec3(.788,.455,.306),smoothstep(.1,.38,u)); col=mix(col,vec3(.612,.329,.275),smoothstep(.32,.85,u));
 float sg=max(dot(d,normalize(vec3(.9,.1,.42))),0.); col+=vec3(.5,.42,.3)*(pow(sg,5.)*.35+pow(sg,48.)*.6);
 vec2 cp=d.xz/(u+.1)*.9+vec2(uT*.004,uT*.0015);
 float cn=vn(vec3(cp*1.2,1.))*.55+vn(vec3(cp*2.7,2.))*.3+vn(vec3(cp*6.,3.))*.15; float cl=smoothstep(.56,.74,cn)*smoothstep(.01,.1,u);
 float cs=vn(vec3(cp*2.4+vec2(.25,0.),4.)); vec3 cc=mix(vec3(.698,.416,.345),vec3(.973,.867,.706),smoothstep(.3,.75,cs));
 col=mix(col,cc,cl*.85);
 float dn=1.-smoothstep(-.002,.004,e-.014*vn(vec3(atan(d.z,d.x)*7.,1.,1.))); col=mix(col,vec3(.86,.62,.43),dn*.7);
 col=mix(col,vec3(.914,.706,.486),1.-smoothstep(-.004,.003,e));
 col*=.975+.05*vn(d*60.+6.);
 gl_FragColor=vec4(col,1.); }`;
      const U = { uT: { value: 0 }, uEye: { value: new T.Vector3(0, 1, ZE) }, uF: { value: Array.from({ length: 4 }, () => new T.Vector4()) } };
      const sky = new T.Mesh(new T.SphereGeometry(1500, 48, 24), new T.ShaderMaterial({ vertexShader: WVS, fragmentShader: SKF, side: T.BackSide, depthWrite: false, uniforms: U })); sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky);
      const floor = new T.Mesh(new T.PlaneGeometry(2400, 2400), new T.ShaderMaterial({ vertexShader: FVS8, fragmentShader: FLF, extensions: { derivatives: true }, uniforms: U })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
      const wm = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: WAF, extensions: { derivatives: true }, side: T.DoubleSide, uniforms: U });
      const wg = new T.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false, curveSegments: 1 });
      [[XW + TH, 1], [-XW, -1]].forEach(([x, sd]) => { const m = new T.Mesh(wg, wm); m.rotation.y = -Math.PI / 2; m.position.x = x; scene.add(m);
        const c = new T.Mesh(new T.BoxGeometry(TH + .12, .14, ZEND - ZB + .1), wm); c.position.set(sd * (XW + TH / 2), WH + .07, (ZB + ZEND) / 2); scene.add(c); });
      let w = 1, h = 1;
      return {
        resize(W, H) { w = W; h = H; },
        update(t, st) {
          U.uT.value = t; const c = st.cam; if (!c) return;
          cam.position.set(c.C[0], c.C[1], c.C[2]); cam.lookAt(c.L[0], c.L[1], c.L[2]); cam.fov = c.fov; cam.aspect = w / h; cam.near = .03; cam.far = 4000; cam.setViewOffset(w, h, 0, -c.oy * h, w, h); cam.updateProjectionMatrix();
          sky.position.copy(cam.position); U.uEye.value.set(0, 1, Math.max(c.C[2], ZE - 1));
          (st.fs || []).forEach((f, i) => { if (i < 4) U.uF.value[i].set(f[0], 0, f[1], f[2]); });
          st.ready = true;
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
    const R = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: !!window.__dbg3d });
    R.outputColorSpace = T.LinearSRGBColorSpace; R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 100), mats = [];
    const light = new T.DirectionalLight(0xffffff, 1); light.castShadow = true; light.shadow.mapSize.set(512, 512);
    Object.assign(light.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .5, far: 40 }); light.shadow.bias = -.0015; scene.add(light);
    const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: .34, color: 0x1B1D24 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const K = kit(T, mats); K.R = R; K.ground = ground; K.gs = getState; const b = BUILD[kind](T, scene, cam, light, K);
    const ld = light.position.clone().normalize(); mats.forEach(m => m.uniforms.uLd.value.copy(ld));
    // Compile every shader up front without blocking the page (parallel compile where the GPU driver allows).
    if (R.compileAsync) { try { await R.compileAsync(scene, cam); } catch (e) {} }
    const cv = R.domElement; Object.assign(cv.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' }); el.appendChild(cv);
    const size = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; b.resize && b.resize(w, h); cam.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(size); ro.observe(el);
    let alive = true; const t0 = performance.now();
    const frame = () => { const t = (performance.now() - t0) / 1000; const st = getState() || {}; if (st.active === false) return; mats.forEach(m => m.uniforms.uT.value = t); b.update(st.frozen ? 0 : t, st); b.render ? b.render() : R.render(scene, cam); };
    const loop = () => { if (!alive) return; const s = getState() || {}; if (!s.ext) frame(); requestAnimationFrame(loop); };
    el.__frame = frame; loop();
    return { dispose() { alive = false; el.__frame = null; ro.disconnect(); b.dispose && b.dispose(); R.dispose(); try { R.forceContextLoss(); } catch (e) {} cv.remove(); } };
  }
  window.Scene3D = { mount, load };
})();

export {};
