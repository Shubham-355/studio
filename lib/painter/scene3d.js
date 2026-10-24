/* v17: apple turned so the bite faces the camera (upper front-left), backlit from a low sun, satin painted skin, cream scooped bite with soft thin-flesh portal. v16: real apple shape, painted skin, deeper bite, painted tile floor with stone step at the sea. v15: door end wall (gable, analytic shadows, door light). v10: three.js painterly scenes (one sand palette, file-raked squares) (8x8 sand board, Magritte apple). window.Scene3D.mount(el, kind, getState) */
(function () {
  let TP = null;
  const load = () => TP || (TP = import('three'));
  const VS = `varying vec3 vW; varying vec3 vN; varying vec3 vO;
void main(){ vO = position; mat4 mm = modelMatrix;
#ifdef USE_INSTANCING
 mm = modelMatrix * instanceMatrix;
#endif
 vec4 w = mm * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(mm) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
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
 if(uNs>1.3&&uNs<1.5&&N.y>.6){ float wq=vn(vec3(vW.xz*2.2,4.))*2.6; float rp=sin(vW.x*44.+wq*.35); float sh2=smoothstep(-.6,1.,rp); l=clamp(l-.06+sh2*.1+(vn(vec3(vW.xz*70.,1.))-.5)*.07,0.,1.); }
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
    print: { c: '#C7B08D', s: '#A39480', l: '#E3CFAB', h: '#EEDDBE', rim: '#D9C3A0' },
    drysand: { c: '#D9C3A0', s: '#ADA08E', l: '#EAD6B3', h: '#F6E9D0', rim: '#E2E6EA' },
    border: { c: '#D9C3A0', s: '#ADA08E', l: '#EAD6B3', h: '#F6E9D0', rim: '#E2E6EA' },
    ridge: { c: '#D9C3A0', s: '#ADA08E', l: '#EAD6B3', h: '#F6E9D0', rim: '#E2E6EA' },
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

  const WVS = `varying vec3 vW; void main(){ mat4 mm = modelMatrix;
#ifdef USE_INSTANCING
 mm = modelMatrix * instanceMatrix;
#endif
 vec4 w = mm * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
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
  const BSC = `float bsc(vec3 v){ vec3 n=normalize(v); float an=atan(n.y,n.x); float aw=an+.32*sin(an*2.+.5)+.18*sin(an*3.+1.7);
 return (.042*abs(sin(aw*6.))*(.6+.4*sin(an*2.+1.1))+.018*abs(sin(aw*13.+.9))*(.5+.5*sin(an*3.+.4))+.007*sin(an*29.+1.3))*(1.-smoothstep(.3,.75,-n.z)); }`;
  const BU = `uniform vec3 uBc[2]; uniform vec3 uBt[2]; uniform vec3 uBb[2]; uniform vec3 uBd[2]; uniform vec3 uBe[2]; uniform float uBk[2]; uniform float uI;`;
  const WVS8 = BU + `
uniform vec3 uPa;
varying vec3 vW; varying vec3 vN; varying vec3 vO; varying vec3 vNl;
` + BSC + `
void main(){ bool s=uI>.5; vec3 c=s?uBc[1]:uBc[0]; vec3 t=s?uBt[1]:uBt[0]; vec3 b=s?uBb[1]:uBb[0]; vec3 d=s?uBd[1]:uBd[0]; vec3 e=s?uBe[1]:uBe[0]; float k=max(s?uBk[1]:uBk[0],.001);
 vec3 n=normalize(position); float R=k*(1.+bsc(n)); vec3 lp=c+(t*n.x*e.x+b*n.y*e.y+d*n.z*e.z)*R; vO=lp; vNl=n;
 vec3 nn=normalize(t*n.x/e.x+b*n.y/e.y+d*n.z/e.z); vec4 w=modelMatrix*vec4(lp,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normalize(-nn*.55+uPa*.45)); gl_Position=projectionMatrix*viewMatrix*w; }`;
  const AFS8 = BU + `
uniform vec3 uLd,uPc,uPa; uniform float uT,uKind,uPort,uSand;
varying vec3 vW; varying vec3 vN; varying vec3 vO; varying vec3 vNl;
` + NZ8 + BSC + `
float bsd(vec3 p,vec3 c,vec3 t,vec3 b,vec3 d,vec3 e,float k){ if(k<.001) return 9.; vec3 q=p-c; vec3 v=vec3(dot(q,t)/e.x,dot(q,b)/e.y,dot(q,d)/e.z); return (length(v)-k*(1.+bsc(v)))*min(e.x,e.y); }
float BD0(vec3 p){ return bsd(p,uBc[0],uBt[0],uBb[0],uBd[0],uBe[0],uBk[0]); }
float BD1(vec3 p){ return bsd(p,uBc[1],uBt[1],uBb[1],uBd[1],uBe[1],uBk[1]); }
float prof(vec3 p){ float ph=atan(p.z,p.x); float kk=1.+.025*sin(ph+.4)+.012*sin(2.*ph+1.3); float yy=clamp(p.y/.96,-1.,1.); return sqrt(max(0.,1.-yy*yy))*(1.+.1*yy)*kk*(1.+.03*sin(ph-1.)*(.5+.5*yy)); }
vec3 flesh(vec3 p,vec3 N,vec3 L,vec3 V){
 float fib=vn(p*vec3(30.,80.,30.))*.6+vn(p*130.)*.4;
 vec3 c=vec3(.953,.918,.839)*vec3(.99,1.,.965)*(.95+.1*fib); c*=.96+.06*vn(p*vec3(240.,50.,240.));
 c*=vec3(1.,.985,.955)*(.88+.18*max(dot(N,normalize(vec3(-.3,.8,.6))),0.)+.07*max(dot(N,L),0.));
 vec3 Hh=normalize(L+V); float sp=pow(max(dot(N,Hh),0.),26.)+pow(max(dot(N,V),0.),60.)*.5; float wet=smoothstep(.45,.85,vn(p*vec3(14.,40.,14.)+2.));
 c=mix(c,vec3(1.,1.,.97),smoothstep(.1,.45,sp*(.3+wet))*.45);
 return c;
}
void main(){
 vec3 V=normalize(cameraPosition-vW); vec3 L=normalize(uLd); vec3 p=vO;
 if(uKind>.5&&uKind<1.5){
   float rim=prof(p)*.995-length(p.xz); if(rim<0.) discard;
   if((uI<.5?BD1(p):BD0(p))<-.006) discard;
   vec3 n=normalize(vNl); float dep=-n.z; vec3 pv=p-uPc; float lat=length(pv-uPa*dot(pv,uPa)); float an1=atan(dot(pv,cross(uPa,vec3(0.,1.,0.))),pv.y);
   lat+=(vn(vec3(an1*2.5,uPort*3.,1.))-.5)*uPort*.35+(vn(vec3(an1*9.,2.,uPort))-.5)*.02;
   if(lat<uPort-.005){ gl_FragColor=vec4(0.); return; }
   vec3 N=normalize(vN);
   vec3 c=flesh(p,N,L,V);
   float fr1=vn(vec3(an1*34.,lat*7.,3.))*.6+vn(vec3(an1*80.,lat*16.,5.))*.4; c*=.95+.1*fr1;
   float ctr=1.-smoothstep(uPort,uPort+.1,lat); c=mix(c,c*vec3(.9,.91,.8),ctr*.4);
   c=mix(c,c*vec3(.96,.95,.9),smoothstep(-.1,.95,dep)*.5);
   c=mix(c,vec3(.90,.86,.66),(1.-smoothstep(0.,.03,rim))*.18); c=mix(c,vec3(.50,.07,.08),1.-smoothstep(.0,.0035,rim));
   c*=1.-.1*(1.-smoothstep(0.,.05,rim)); c=min(c*1.07,vec3(1.));
   float pa=smoothstep(uPort-.005,uPort+.05,lat);
   gl_FragColor=vec4(mix(c,vec3(.824,.761,.639),uSand)*pa,pa); return; }
 vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; float ndl=dot(N,L); vec3 Hh=normalize(L+V); float nv=max(dot(N,V),0.);
 float lam=clamp(ndl*.55+.45+(vn(p*9.)-.5)*.1,0.,1.);
 if(uKind<.5){
   float e0=BD0(p), e1=BD1(p); if(e0<0.||e1<0.) discard; float ed=min(e0,e1);
   if(!gl_FrontFacing){ if(uPort>.5){ gl_FragColor=vec4(0.); return; } gl_FragColor=vec4(mix(flesh(p,N,L,V),vec3(.824,.761,.639),uSand),1.); return; }
   float ph=atan(p.z,p.x); float rr=length(p.xz);
   float wv=vn(p*2.3)*1.8+vn(p*5.1)*.6;
   float sA=vn(vec3(ph*8.+wv,p.y*1.1,1.)), sB=vn(vec3(ph*21.+wv*1.6,p.y*1.8,4.)), sC=vn(vec3(ph*44.+wv*2.,p.y*2.6,7.));
   float top=smoothstep(-.5,.85,p.y)*(.55+.45*vn(vec3(ph*3.,1.,2.)));
   float wl=clamp(ndl*.5+.5,0.,1.); float sky=max(N.y,0.), bnc=max(-N.y,0.);
   float lev=clamp(wl*.62+sky*.12+bnc*.06+.33+(vn(p*7.)-.5)*.04,0.,1.);
   vec3 crim=vec3(.431,.071,.086);
   vec3 col=mix(crim,vec3(.66,.10,.10),smoothstep(.2,.55,lev)); col=mix(col,vec3(.86,.25,.12),smoothstep(.6,.95,lev));
   float yl=smoothstep(.56,.82,sA)*.65+smoothstep(.6,.86,sB)*.45; float dk=smoothstep(.58,.84,1.-sA)*.55+smoothstep(.62,.88,sC)*.35;
   col=mix(col,vec3(.93,.56,.20)*mix(.55,1.,smoothstep(.2,.8,lev)),clamp(yl,0.,1.)*top*.5);
   col=mix(col,crim*mix(1.,1.25,lev),clamp(dk,0.,1.)*top*.32);
   vec3 Nh=normalize(vec3(N.x,0.,N.z)+vec3(1e-4)); vec3 Lh=normalize(vec3(L.x,0.,L.z)); float sun=smoothstep(-.1,.75,dot(Nh,Lh));
   col=mix(col,vec3(.92,.50,.16),sun*.42*smoothstep(.3,.8,lev)*(.55+.45*sB));
   vec3 ce=cell(vec2(ph*40.,p.y*58.)+3.1); col=mix(col,vec3(.97,.87,.64),(1.-smoothstep(.03,.065,ce.y))*step(.72,ce.x)*(.25+.3*lev));
   float dip=(1.-smoothstep(.04,.34,rr))*smoothstep(.42,.7,p.y); col=mix(col,vec3(.62,.42,.14),dip*.3); col*=1.-.34*dip;
   float fr=pow(1.-nv,2.6);
   vec3 Lr=normalize(vec3(-1.,.25,-.35)); float rimK=pow(1.-nv,2.2)*smoothstep(-.1,.7,dot(N,Lr)); col+=vec3(1.,.60,.26)*rimK*.75*(.75+.25*sB);
   col=mix(col,vec3(.60,.68,.84),smoothstep(.3,.95,N.y)*(.12+.1*fr)*(1.-dip));
   col+=vec3(.42,.24,.13)*smoothstep(.05,.8,bnc)*(1.-wl)*.55;
   vec3 Hs=normalize(normalize(vec3(-.55,.75,.45))+V); float sat=pow(max(dot(N,Hs),0.),5.); col+=vec3(.14,.06,.04)*sat*.4;
   float hz=pow(max(dot(N,Hs),0.),14.); float bs=vn(vec3(ph*9.+p.y*5.,p.y*2.2+ph*1.5,11.))*.7+vn(vec3(ph*23.,p.y*7.,13.))*.3;
   col=mix(col,vec3(.98,.78,.68),smoothstep(.28,.85,hz*(.35+1.1*bs))*.34);
   col=max(col,crim*.98);
   if(ed<.012){ float ln=1.-smoothstep(.0012,.0035,ed); float cu=smoothstep(.003,.005,ed)*(1.-smoothstep(.006,.012,ed)); col=mix(col,col*1.16+vec3(.03,.01,0.),cu*.5); col=mix(col,vec3(.40,.05,.06),ln*.7); }
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
 vec3 L=normalize(uLd); vec2 P=vW.xz; vec2 g=P+.5; vec2 fw=fwidth(g)+1e-4; float fwm=max(fw.x,fw.y);
 vec2 id=floor(g); vec2 de=.5-abs(fract(g)-.5);
 vec2 sg=sign(sin(3.14159265*g)); vec2 q=sg*clamp(de/fw,0.,1.); float chk=.5+.5*q.x*q.y;
 float tv=1.-smoothstep(.16,.45,fwm); chk=mix(.5,chk,tv);
 float h=h2(id), h1=h2(id+7.1);
 vec3 A=vec3(.541,.314,.224)*(.92+.14*h); vec3 B=vec3(.867,.82,.725)*(.95+.08*h1);
 vec3 col=mix(A,B,chk);
 float bt=vn(vec3(P.x*3.5+h*9.,P.y*22.,h*10.))*.55+vn(vec3(P*vec2(17.,40.),h*3.))*.45; col*=1.+(bt-.5)*.11*tv;
 col*=1.+(vn(vec3(P*1.7,h*5.))-.5)*.06*tv;
 vec3 cr=cell(P*2.6+id*3.7); float crk=(1.-smoothstep(0.,.012+fwm*2.,cr.z-cr.y))*step(.74,h1)*smoothstep(.45,.7,vn(vec3(P*3.,h*11.)));
 col=mix(col,col*.7,crk*tv*.6);
 vec3 ce=cell(P*6.); float ed=min(de.x,de.y); float chip=(1.-smoothstep(.05,.09,ce.y))*step(.82,ce.x)*(1.-smoothstep(.012,.08,ed));
 col=mix(col,col*.7+vec3(.06,.05,.04),chip*tv*.85);
 float gw=.011; float gx=1.-smoothstep(gw-fw.x*.6,gw+fw.x*.6,de.x), gz=1.-smoothstep(gw-fw.y*.6,gw+fw.y*.6,de.y); float gr=max(gx,gz);
 col=mix(col,vec3(.42,.34,.28),gr*mix(.25,.8,tv));
 float zs=vW.z; col*=1.-.38*(1.-smoothstep(0.,.18+fw.y,zs+14.9));
 float sh=0.; float ao=1.;
 for(int i=0;i<6;i++){ vec4 s=uSph[i]; if(s.w<=0.) continue; vec3 wv=s.xyz-vW; float tt=dot(wv,L); float dxz=length(vW.xz-s.xz); ao*=1.-.45*exp(-dxz*dxz/(s.w*s.w*.3));
   if(tt>0.){ float dd=length(wv-L*tt); float pen=.03+tt*.09; sh=max(sh,(1.-smoothstep(s.w-pen,s.w+pen,dd))*(1.-smoothstep(10.,18.,tt))); } }
 { float dxz=length(vW.xz-uSph[0].xz); ao*=1.-.6*exp(-dxz*dxz/.07); }
 col*=ao; col=mix(col,col*vec3(.42,.38,.52),sh*.85);
 vec3 Vd=normalize(vW-cameraPosition); vec3 Rd=reflect(Vd,vec3(0.,1.,0.));
 float fres=pow(1.-max(-Vd.y,0.),5.);
 col=mix(col,vec3(.72,.80,.92),fres*.12*tv);
 col+=vec3(1.,.82,.58)*pow(max(dot(Rd,L),0.),30.)*.2*(1.-gr*.6);
 vec3 oc=vW-uSph[0].xyz; float b=dot(oc,Rd); float cc=dot(oc,oc)-uSph[0].w*uSph[0].w; float disc=b*b-cc;
 if(disc>0.){ float th=-b-sqrt(disc); if(th>0.){ float brk=smoothstep(.25,.7,vn(vec3(vW.x*14.,vW.z*1.4,3.)))*.6+.4*vn(vec3(vW.x*38.,vW.z*3.,6.)); float sof=smoothstep(0.,uSph[0].w*uSph[0].w*.35,disc); col=mix(col,vec3(.50,.10,.09),clamp(exp(-th*1.5)*sof*(.4+.6*brk)*.75,0.,.5)); } }
 float dist=length(vW-cameraPosition); col=mix(col,vec3(.90,.79,.67),clamp(smoothstep(6.,26.,dist)*.5+(1.-tv)*.4,0.,.85));
 gl_FragColor=vec4(col,1.);
}`;
  const CVS8 = `varying vec3 vW; varying vec3 vN; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`;
  const CFS8 = `uniform vec3 uLd; uniform float uT; varying vec3 vW; varying vec3 vN;
` + NZ8 + `
void main(){ vec3 N=normalize(vN), L=normalize(uLd); vec2 fw=fwidth(vW.xy)+1e-4;
 float n=vn(vW*vec3(2.,9.,2.))*.5+vn(vW*vec3(9.,26.,9.))*.5;
 vec3 col=vec3(.82,.74,.64)*(.88+.18*n)*mix(.7,1.1,clamp(dot(N,L)*.5+.55,0.,1.));
 float jx=abs(fract(vW.x/1.7+.31)-.5)*1.7; col*=1.-.32*(1.-smoothstep(0.,.012+fw.x*1.2,.85-jx));
 if(N.z>.5){ float y=vW.y; float wl=smoothstep(.15+.04*vn(vec3(vW.x*3.,1.,uT*.1)),.2,y); col=mix(col,vec3(.36,.33,.32)*(.9+.2*n),wl*.75);
   col+=vec3(.55,.62,.72)*wl*pow(vn(vec3(vW.x*6.,y*40.,2.)),3.)*.4;
   col=mix(col,vec3(1.,.93,.80),(1.-smoothstep(0.,.006+fw.y*1.5,.24-y))*.75);
   col*=1.-.35*(1.-smoothstep(0.,.03+fw.y,y)); }
 else if(N.y>.5){ col=mix(col,vec3(.40,.37,.36),.55); }
 float dist=length(vW-cameraPosition); col=mix(col,vec3(.90,.79,.67),smoothstep(8.,30.,dist)*.3);
 gl_FragColor=vec4(col,1.); }`;
  const LFS8 = `uniform float uT; varying vec3 vW;
` + NZ8 + `
void main(){ float x=vW.x, y=vW.y-.24;
 float hg=.03+.04*vn(vec3(x*1.3-uT*.25,uT*.15,1.))+.025*vn(vec3(x*4.+uT*.6,2.,uT*.3));
 float a=1.-smoothstep(hg-.006,hg+.004,y); if(a<.01) discard;
 float crest=smoothstep(hg-.022,hg-.002,y)*smoothstep(.5,.78,vn(vec3(x*2.5-uT*.4,uT*.2,4.)));
 vec3 c=mix(vec3(.19,.37,.49),vec3(.30,.50,.60),clamp(y/max(hg,.001),0.,1.)); c=mix(c,vec3(.93,.95,.95),crest*.85);
 c=mix(c,vec3(.90,.79,.67),.2);
 gl_FragColor=vec4(c,a); }`;
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
      const pts = []; for (let i = 0; i <= 96; i++) { const th = -Math.PI / 2 + Math.PI * i / 96, s = Math.sin(th); const x = Math.cos(th) * (1 + .1 * s); let y = s * .96; if (y > 0) y -= .23 * Math.exp(-x * x / .028); else y += .06 * Math.exp(-x * x / .018); pts.push(new T.Vector2(Math.max(x, .0005), y)); }
      const NP = pts.length, SEG = 160, ag = new T.LatheGeometry(pts, SEG), pa = ag.attributes.position; let minY = 0;
      for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i), y0 = pa.getY(i), ph = Math.atan2(z, x), yy = Math.max(-1, Math.min(1, y0 / .96));
        const wB = smooth(-.55, -.95, yy) * smooth(.04, .34, Math.hypot(x, z)), lobe = .5 + .5 * Math.cos(5 * ph + .3);
        const kk = (1 + .025 * Math.sin(ph + .4) + .012 * Math.sin(2 * ph + 1.3)) * (1 + .03 * Math.sin(ph - 1) * (.5 + .5 * yy)) * (1 + .016 * (lobe - .5) * wB);
        const y = y0 - .014 * lobe * wB; pa.setX(i, x * kk); pa.setZ(i, z * kk); pa.setY(i, y); minY = Math.min(minY, y); }
      ag.computeVertexNormals(); { const na = ag.attributes.normal; for (let j = 0; j < NP; j++) { const b = SEG * NP + j, v = new T.Vector3(na.getX(j) + na.getX(b), na.getY(j) + na.getY(b), na.getZ(j) + na.getZ(b)).normalize(); na.setXYZ(j, v.x, v.y, v.z); na.setXYZ(b, v.x, v.y, v.z); } na.needsUpdate = true; }
      const g = new T.Group(), S = 1.3; g.scale.setScalar(S); g.position.y = -minY * S + .004; g.rotation.y = -.25;
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
      fm.uniforms.uSph.value[0].set(0, g.position.y + .01, 0, 1.27);
      const curb = new T.Mesh(new T.BoxGeometry(90, .24, .45), new T.ShaderMaterial({ vertexShader: CVS8, fragmentShader: CFS8, extensions: { derivatives: true }, uniforms: { uLd: { value: LD }, uT: shared.uT } })); curb.position.set(0, .12, -15.125); scene.add(curb);
      const lap = new T.Mesh(new T.PlaneGeometry(90, .2), new T.ShaderMaterial({ vertexShader: FVS8, fragmentShader: LFS8, transparent: true, depthWrite: false, uniforms: { uT: shared.uT } })); lap.position.set(0, .29, -15.42); scene.add(lap);
      const surf = d => { let s = 1; for (let k = 0; k < 6; k++) { const y = s * d.y / .96, R = Math.sqrt(Math.max(0, 1 - y * y)) * (1 + .1 * y); s = R / Math.max(.05, Math.hypot(d.x, d.z)); } return s; };
      let w = 1, h = 1, built = false, bset = false, ax = new T.Vector3(), Dl = new T.Vector3();
      const tmp = new T.Vector3(), Dw = new T.Vector3(), C1 = new T.Vector3(), ctr = new T.Vector3(0, 1.24, 0), up = new T.Vector3(0, 1, 0), q0 = new T.Quaternion(), q1 = new T.Quaternion(), m4 = new T.Matrix4(), eu = new T.Euler();
      const setBites = C => {
        g.updateMatrixWorld(); const cl = g.worldToLocal(C.clone()).sub(new T.Vector3(0, 0, 0)).normalize();
        const rt = new T.Vector3().crossVectors(up, cl).normalize(), d0 = cl.clone().addScaledVector(rt, -.8).addScaledVector(up, .55).normalize(); ax.copy(d0);
        const E = [new T.Vector3(.30, .2, .3), new T.Vector3(.27, .19, .28)]; Dl.set(0, 0, 0);
        [-.13, .15].forEach((o, i) => { const t0 = new T.Vector3().crossVectors(up, d0).normalize(), d = d0.clone().addScaledVector(t0, o).normalize(), t = new T.Vector3().crossVectors(up, d).normalize(), b = new T.Vector3().crossVectors(d, t), c = d.clone().multiplyScalar(surf(d) + .07);
          shared.uBc.value[i].copy(c); shared.uBt.value[i].copy(t); shared.uBb.value[i].copy(b); shared.uBd.value[i].copy(d); shared.uBe.value[i].copy(E[i]); Dl.add(c.clone().addScaledVector(d, -E[i].z * .92).multiplyScalar(.5)); }); shared.uPc.value.copy(Dl); shared.uPa.value.copy(ax);
      };
      return {
        resize(W, H) { w = W; h = H; },
        update(t, st) {
          shared.uT.value = t; const c = st.cam; if (!c) return; if (c.ld) LD.set(c.ld[0], c.ld[1], c.ld[2]).normalize();
          if (!built && st.peb) { built = true; let si = 1; st.peb.forEach(p => { const k = p.kind || 'peb', m = new T.Mesh(k === 'scallop' ? shellGeo(T) : k === 'spiral' ? spiralGeo(T) : new T.SphereGeometry(1, 24, 16), am(k === 'scallop' ? 6 : k === 'spiral' ? 7 : 5, { side: k === 'peb' ? T.FrontSide : T.DoubleSide }));
            if (k === 'scallop') { m.scale.setScalar(p.r); if (p.flip) { m.rotation.set(Math.PI - .42, p.rot || 0, .1); m.position.set(p.x, p.r * .3, p.z); } else { m.rotation.y = p.rot || 0; m.position.set(p.x, .004, p.z); } }
            else if (k === 'spiral') { m.scale.setScalar(p.r); m.rotation.set(0, p.rot || 0, Math.PI / 2 - .25); m.position.set(p.x, p.r * .26, p.z); }
            else { m.scale.set(p.r, p.r * .58, p.r * .82); m.position.set(p.x, p.r * .5, p.z); m.rotation.y = p.rot || 0; }
            scene.add(m); if (si < 6 && !p.noShadow) fm.uniforms.uSph.value[si++].set(p.x, k === 'peb' ? p.r * .45 : p.r * .18, p.z, p.r * (k === 'peb' ? .8 : .75)); }); }
          C1.set(c.C[0], c.C[1], c.C[2]); if (!bset) { bset = true; setBites(C1); }
          const bk = st.bk || [0, 0]; shared.uBk.value[0] = bk[0] > .001 ? .45 + .55 * bk[0] : 0; shared.uBk.value[1] = bk[1] > .001 ? .45 + .55 * bk[1] : 0;
          const b = Math.max(bk[0], bk[1]); g.rotation.y = -.25 + Math.sin(t * .22) * .05 * (1 - Math.min(1, b * 8));
          shared.uPort.value = st.port ?? .1; shared.uSand.value = st.sand || 0;
          const e = st.dolly || 0;
          cam.fov = c.fov; cam.near = e > .01 ? .02 : .1; cam.far = 200; cam.aspect = w / h; cam.setViewOffset(w, h, -c.shift, 0, w, h); cam.updateProjectionMatrix();
          g.updateMatrixWorld(); Dw.copy(Dl); g.localToWorld(Dw); const axW = ax.clone().transformDirection(g.matrixWorld);
          const d0 = C1.distanceTo(Dw), dist = d0 * Math.pow(.1 / d0, e), al = smooth(0, .75, e), dir = tmp.copy(C1).sub(Dw).normalize().lerp(axW, al).normalize();
          cam.position.copy(Dw).addScaledVector(dir, dist);
          q0.setFromEuler(eu.set(c.pitch, c.yaw || 0, 0, 'YXZ')); m4.lookAt(cam.position, Dw, up); q1.setFromRotationMatrix(m4); cam.quaternion.copy(q0).slerp(q1, smooth(0, .65, e));
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
      /* instanced: 32 water squares, 32 beds, 32 sand tiles, 18 ridges -> 4 draw calls (were 114) */
      const D = new T.Object3D(), put = (im, i) => { D.updateMatrix(); im.setMatrixAt(i, D.matrix); };
      const wI = new T.InstancedMesh(wp, wm, 32), bI = new T.InstancedMesh(new T.BoxGeometry(1, .04, 1), bedM, 32), tI = new T.InstancedMesh(sb, sand, 32); let nw = 0, nt = 0;
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const x = i - 3.5, z = 3.5 - j; D.scale.set(1, 1, 1);
        if ((i + j) % 2 === 0) { D.rotation.set(-Math.PI / 2, 0, 0); D.position.set(x, -.03, z); put(wI, nw); D.rotation.set(0, 0, 0); D.position.set(x, -.26, z); put(bI, nw); nw++; }
        else { D.rotation.set(0, 0, 0); D.position.set(x, -.04, z); put(tI, nt++); } }
      wI.renderOrder = 1; [wI, bI, tI].forEach(m => { m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); scene.add(m); });
      const cy = new T.CylinderGeometry(.05, .06, 1, 8), rI = new T.InstancedMesh(cy, rid, 18);
      for (let k = 0; k <= 8; k++) { D.scale.set(1, 8.05, 1); D.rotation.set(Math.PI / 2, 0, 0); D.position.set(k - 4, .035, 0); put(rI, k * 2); D.rotation.set(0, 0, Math.PI / 2); D.position.set(0, .035, k - 4); put(rI, k * 2 + 1); }
      rI.castShadow = true; rI.instanceMatrix.needsUpdate = true; rI.computeBoundingSphere(); scene.add(rI);
      const bdm = K.mat('border', { ns: 1.6 }); [[8.9, .45, 0, 4.225], [8.9, .45, 0, -4.225], [.45, 8, -4.225, 0], [.45, 8, 4.225, 0]].forEach(([bw, bd, bx, bz]) => { const b = new T.Mesh(new T.BoxGeometry(bw, .14, bd), bdm); b.position.set(bx, -.035, bz); b.receiveShadow = true; scene.add(b); });
      { const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const x = cv.getContext('2d'), s = 1024 / 8.9, P = (X, Z) => [(X + 4.45) * s, (Z + 4.45) * s];
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'italic 500 ' + Math.round(s * .3) + 'px Cormorant, Georgia, serif';
        const put = (t, X, Z) => { const [a, b] = P(X, Z); x.fillStyle = 'rgba(255,244,222,.45)'; x.fillText(t, a, b + 1.5); x.fillStyle = 'rgba(92,66,42,.6)'; x.fillText(t, a, b); };
        'abcdefgh'.split('').forEach((c, i) => put(c, i - 3.5, 4.225)); for (let r = 1; r <= 8; r++) put(String(r), -4.225, 4.5 - r);
        const lab = new T.Mesh(new T.PlaneGeometry(8.9, 8.9), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false })); lab.rotation.x = -Math.PI / 2; lab.position.y = .05; lab.renderOrder = 2; scene.add(lab); }
      const S = .95, pawn = K.pawn(), n0 = K.qm.length, queen = K.queen(), qm = K.qm.slice(n0); pawn.scale.setScalar(S); queen.scale.setScalar(0); scene.add(pawn, queen);
      const proxy = K.queen(new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false })); proxy.traverse(o => { if (o.isMesh) o.castShadow = true; }); proxy.visible = false; scene.add(proxy);
      let R2 = null, r2d = false, curL = 0, def = null, sz = null; const rs = new T.Vector2();
      const mm = K.mat('ivory', { alpha: .5, double: true, tint: '#4F8FC8', tintK: .35 }); const mp = K.pawn(mm), mq = K.queen(mm); [mp, mq].forEach(o => { o.renderOrder = 2; o.traverse(c => c.renderOrder = 2); scene.add(o); });
      const RK = [2, 4, 5, 6, 7, 8], prints = [2.5, .5, -1.5].flatMap(z => [-1, 1].map(sd => { const m = new T.Mesh(new T.SphereGeometry(1, 10, 6), pm); m.scale.set(.07, .007, .11); m.position.set(.5 + sd * .1, .042, z + sd * .08); m.userData.z = z; m.visible = false; scene.add(m); return m; }));
      K.ground.position.y = .045; K.ground.material.depthWrite = false; K.ground.renderOrder = 3; K.ground.material.opacity = .32; K.ground.material.color.set('#5C5866'); light.shadow.camera.layers.enableAll();
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
          if (st.qel && !R2) { R2 = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: !!window.__dbg3d }); K.R2 = R2; R2.outputColorSpace = T.LinearSRGBColorSpace; R2.setPixelRatio(K.R.getPixelRatio()); Object.assign(R2.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' }); st.qel.appendChild(R2.domElement); if (sz) R2.setSize(sz[0], sz[1], false); }
          mir(pawn, mp); mir(queen, mq);
          cam.updateMatrixWorld(); v.set(pawn.position.x, .5, pawn.position.z).project(cam); st.sx = (v.x + 1) / 2; st.sy = (1 - v.y) / 2;
        },
        render() { cam.layers.set(0); K.R.render(scene, cam); if (R2) { if (curL === 1) { cam.layers.set(1); R2.render(scene, cam); cam.layers.set(0); r2d = true; } else if (r2d) { R2.clear(); r2d = false; } } },
        dispose() { K.R2 = null; if (R2) { R2.dispose(); try { R2.forceContextLoss(); } catch (e) {} R2.domElement.remove(); R2 = null; } },
      };
    },
    arcade8(T, scene, cam, light, K) {
      K.ground.visible = false; light.castShadow = false;
      const s0 = (K.gs && K.gs()) || {}, XW = s0.xw || 2.6, ZE = s0.ze ?? -3.05, TH = .5, WH = 2.5, SPR = 1.45, BAY = 2.1, PIL = .55, ZB = ZE - .25, DZ = s0.dz ?? 27;
      let zl = ZB; const sh = new T.Shape(); sh.moveTo(ZB, 0);
      for (let z0 = ZB; z0 + BAY + PIL <= DZ; z0 += BAY) { const a = z0 + PIL, b = z0 + BAY, mz = (a + b) / 2, r = (b - a) / 2; sh.lineTo(a, 0); sh.lineTo(a, SPR); for (let i = 1; i < 18; i++) { const th = Math.PI - Math.PI * i / 18; sh.lineTo(mz + Math.cos(th) * r, SPR + Math.sin(th) * r * 1.05); } sh.lineTo(b, SPR); sh.lineTo(b, 0); zl = b; }
      const ZEND = DZ; sh.lineTo(ZEND, 0); sh.lineTo(ZEND, WH); sh.lineTo(ZB, WH); sh.closePath();
      const GL = NZ8 + `const float XW=${XW.toFixed(3)},WH=2.5,SPR=1.45,BAY=2.1,PIL=.55,ZB=${ZB.toFixed(3)},ZEND=${ZEND.toFixed(3)},DZ=${DZ.toFixed(3)},TH=${TH.toFixed(3)},BT=.25,HW=.47,HH=1.92,FD=.15,FW=.22,FT=.3;
vec3 LS(){ return normalize(vec3(1.,.62,.34)); }
float openSD(float z,float Y){ float l=mod(z-ZB,BAY); float m=(PIL+BAY)*.5, r=(BAY-PIL)*.5; if(Y<SPR) return abs(l-m)-r; return length(vec2(l-m,(Y-SPR)/1.05))-r; }
float backVis(vec3 p){ float dz=DZ-p.z; if(dz<=0.) return 1.; float Y=p.y+dz*1.8235, X=p.x+dz*2.941; float pen=.04+.02*dz; return max(smoothstep(WH+.14-pen,WH+.14+pen,Y), smoothstep(XW+TH-pen,XW+TH+pen,abs(X))); }
float sideVis(vec3 p){ if(p.x>XW-.01) return 1.; float t=XW-p.x; float Y=p.y+.62*t, zw=p.z+.34*t; if(zw<ZB||zw>ZEND) return 1.; float pen=.02+.012*t; float o=1.-smoothstep(-pen,pen,openSD(zw,Y)); return max(o,smoothstep(WH+.1,WH+.2,Y)); }
float sunVis(vec3 p){ return min(sideVis(p),backVis(p)); }
uniform vec4 uDo;
const float ZL=DZ+.1, FF=DZ-FD-.035, ZF=DZ+BT;
vec3 LB(){ return normalize(vec3(1.,.62,-.34)); }
float doorLit(vec3 P){ if(uDo.y<=0.) return 0.; vec3 S=vec3(0.,uDo.z,DZ+2.6), D=S-P;
 vec3 A=P+D*((FF-P.z)/D.z), B=P+D*((ZF-P.z)/D.z);
 float m=min(min(HW-abs(A.x),HH-A.y),min(HW-abs(B.x),HH-B.y)); m=min(m,A.y-.07);
 float lit=smoothstep(-.004,.004,m);
 float c=cos(uDo.x), s=sin(uDo.x); vec3 Hn=vec3(HW,0.,ZL), d=vec3(-c,0.,s), n=vec3(-s,0.,-c);
 float dn=dot(D,n); if(abs(dn)>1e-5){ float sl=dot(Hn-P,n)/dn; if(sl>0.&&sl<1.){ vec3 Q=P+D*sl; float u=dot(Q-Hn,d); float lm=min(min(u,2.*HW-u),min(Q.y-.07,HH-Q.y)); lit*=1.-smoothstep(-.004,.004,lm); } }
 return lit*uDo.y; }
float bSide(vec3 p){ vec3 L=LB(); if(p.x>=XW) return 1.; float s=(XW-p.x)/L.x; float Y=p.y+L.y*s, zw=p.z+L.z*s; float pen=.012+.03*s;
 float o=zw<ZB?1.:1.-smoothstep(-pen,pen,openSD(zw,Y)); return max(o,smoothstep(WH+.14-pen,WH+.14+pen,Y)); }
float sRect(vec2 q,vec4 r,float D){ vec2 k=vec2(1.,.62)/.34; vec2 lo=(r.xy-q)/k, hi=(r.zw-q)/k; float a=max(max(lo.x,lo.y),0.), b=min(min(hi.x,hi.y),D); float e=.002+.03*a; return smoothstep(-e,e,b-a); }
float fShadow(vec3 p){ vec2 q=p.xy; float B2=XW+TH; float s=sRect(q,vec4(HW,0.,HW+FW,HH+FT),FD+.035);
 s=max(s,sRect(q,vec4(-HW-FW,0.,-HW,HH+FT),FD+.035)); s=max(s,sRect(q,vec4(-HW-FW,HH,HW+FW,HH+FT),FD));
 s=max(s,sRect(q,vec4(-HW-FW-.06,HH+FT,HW+FW+.06,HH+FT+.07),FD+.05));
 s=max(s,sRect(q,vec4(-B2-.06,WH,B2+.06,WH+.14),.14)); s=max(s,sRect(q,vec4(-B2,WH-.13,B2,WH-.07),.08)); return s; }
float tunnelVis(vec3 p){ vec3 L=LB(); float sf=(FF-p.z)/L.z; float xf=p.x+L.x*sf, yf=p.y+L.y*sf; float e=.004+.02*sf; float v=smoothstep(-e,e,min(HW-xf,HH-yf)); if(p.z>ZL) v*=uDo.w; return v; }
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
 { vec3 P3=vec3(P.x,0.,P.y); float s0=DZ-FD-.32; if(uDo.y>0.&&P3.z<s0){ float dl=doorLit(P3), dd=s0-P3.z, fall=1./(1.+dd*dd*.09);
   col=mix(col,col*vec3(1.75,1.6,1.34)+vec3(.12,.1,.07),clamp(dl*fall,0.,1.)*.92);
   col+=vec3(.34,.27,.18)*uDo.y*exp(-dd*dd/.1-P3.x*P3.x/.45); } }
 float dist=length(vW-uEye); col=mix(col,vec3(.914,.706,.486),clamp(smoothstep(8.,75.,dist)*.8+(1.-fa)*.12,0.,.85));
 gl_FragColor=vec4(col,1.);
}`;
      const WAF = `uniform float uT; uniform vec3 uEye; varying vec3 vW; varying vec3 vN; varying vec3 vO;
` + GL + `
void main(){ vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; float lam=max(dot(N,LS()),0.); float v=sunVis(vW+N*.03); float lt=lam*v;
#ifdef BACK
 { vec3 L2=LB(); float lb=max(dot(N,L2),0.); vec3 p=vW+N*.003; float vis=bSide(p);
   if(N.z<-.6 && p.z>DZ-.03) vis*=1.-fShadow(p);
   if(abs(p.x)<HW+.004 && p.z>FF-.004 && p.y<HH+.004) vis*=tunnelVis(p);
   lt=clamp(vis*(.16+1.25*lb)+.05+.04*vW.x/(XW+TH),0.,1.15); }
#endif
 vec3 sh=vec3(.478,.243,.212), li=vec3(.906,.635,.416);
 float b1=vn(vec3(vW.z*2.2,vW.y*9.,vW.x*2.))*.6+vn(vec3(vW.z*6.,vW.y*22.,vW.x*5.))*.4;
 vec3 col=mix(sh,li,smoothstep(.05,.75,lt+(b1-.5)*.12));
 col+=vec3(.16,.08,.04)*(1.-lt)*clamp(.6-N.y*.6,0.,1.)*.7;
 col=mix(col,col*vec3(1.05,.92,.86),smoothstep(.6,1.,-N.y));
#ifdef BACK
 bool TUN=abs(vW.x)<HW+.01&&vW.y<HH+.01;
#else
 bool TUN=false;
#endif
 if(abs(N.x)>.6&&!TUN){ vec2 fw2=fwidth(vW.yz)+1e-4; float yy=vW.y/.32; float row=floor(yy); float zz=vW.z/1.1+mod(row,2.)*.5;
   float my=min(fract(yy),1.-fract(yy))*.32, mz=min(fract(zz),1.-fract(zz))*1.1; float fa=1.-smoothstep(.01,.06,max(fw2.x,fw2.y));
   col*=1.-.16*fa*(1.-smoothstep(0.,.012+fw2.x,min(my,mz))); }
#ifdef BACK
 else if(N.z<-.6 && vW.z>DZ-.02){ vec2 fw3=fwidth(vW.xy)+1e-4; float fa=1.-smoothstep(.01,.06,max(fw3.x,fw3.y));
   float yy=vW.y/.32, row=floor(yy), fy=fract(yy); float len=.78+.5*h2(vec2(row,3.7)); float xs=vW.x/len+h2(vec2(row,9.1))*5.; float k=floor(xs), f=fract(xs);
   float j0=(h2(vec2(row,k))-.5)*.36, j1=(h2(vec2(row,k+1.))-.5)*.36; float id=k, l=f-j0, r=1.+j1-f;
   if(l<0.){ id=k-1.; r=-l; l=1.; } else if(r<0.){ id=k+1.; l=-r; r=1.; }
   float jd=min(min(l,r)*len,min(fy,1.-fy)*.32), bh=h2(vec2(row*7.1,id+.5));
   col*=.89+.19*bh; col=mix(col,col*vec3(1.05,.96,.88),step(.72,fract(bh*13.))*.6);
   col*=.93+.12*vn(vec3(vW.xy*vec2(4.,6.),bh*9.));
   vec3 ce=cell(vW.xy*8.+bh*20.); float chip=(1.-smoothstep(.07,.13,ce.y))*step(.72,ce.x)*(1.-smoothstep(0.,.045,jd));
   col=mix(col,col*.68+vec3(.03,.02,.01),chip*fa*.85);
   col*=1.-.26*fa*(1.-smoothstep(0.,.008+fw3.x,jd)); }
 else if(N.z<-.6 && vW.y>.075){ float e=max(abs(vW.x)-HW,vW.y-HH); vec2 fw3=fwidth(vW.xy)+1e-4; float aw=.003+fw3.x;
   if(e>0. && e<FW+.01 && vW.y<HH+FT+.005){ float gr=max(max(1.-smoothstep(0.,aw,abs(e-.022)),1.-smoothstep(0.,aw,abs(e-.058))),1.-smoothstep(0.,aw,abs(e-.098)));
     float fl=1.-smoothstep(0.,aw*2.,abs(e-.04)); col*=1.-.32*gr; col=mix(col,col*1.12+.03,fl*.6*clamp(lt,0.,1.));
     if(abs(vW.x)>HW+.09){ float fj=fract(vW.y/.64); col*=1.-.18*(1.-smoothstep(0.,aw,min(fj,1.-fj)*.64)); } } }
#endif
 col*=.93+.14*b1;
#ifdef BACK
 if(N.y<.6) col*=mix(.7,1.,smoothstep(0.,.65,vW.y+(vn(vec3(vW.x*3.,2.,vW.z))-.5)*.3));
 if(N.y>.6 && vW.y<.08 && vW.z<FF){ float wr=exp(-vW.x*vW.x/.09); col=mix(col,col*1.1+.02,wr*.5); col*=1.-.22*(1.-smoothstep(0.,.03,vW.z-(DZ-FD-.32)))*vn(vec3(vW.x*30.,1.,1.)); col=mix(col,col*vec3(1.7,1.55,1.3)+.1,doorLit(vW)*.85); }
 { float inT=step(abs(vW.x),HW+.006)*step(vW.y,HH+.006)*step(FF-.006,vW.z); vec3 rl=vec3(.66,.53,.36);
   col+=rl*uDo.y*inT*(.18+.82*smoothstep(FF,ZF,vW.z))*(.6+.4*max(N.y,0.));
   if(N.z<-.6 && vW.z<DZ-.05){ float e=max(abs(vW.x)-HW,vW.y-HH); if(e>0.&&vW.y<HH+FT) col+=rl*uDo.y*.5*exp(-e/.03); } }
#endif
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
 float dn=1.-smoothstep(-.002,.004,e-.014*vn(vec3(atan(d.z,d.x)*7.,1.,1.))); col=mix(col,vec3(.86,.62,.43),dn*.7);
 col=mix(col,vec3(.914,.706,.486),1.-smoothstep(-.004,.003,e));
 col*=.975+.05*vn(d*60.+6.);
 gl_FragColor=vec4(col,1.); }`;
      const U = { uDo: { value: new T.Vector4() }, uT: { value: 0 }, uEye: { value: new T.Vector3(0, 1, ZE) }, uF: { value: Array.from({ length: 4 }, () => new T.Vector4()) } };
      const sky = new T.Mesh(new T.SphereGeometry(1500, 48, 24), new T.ShaderMaterial({ vertexShader: WVS, fragmentShader: SKF, side: T.BackSide, depthWrite: false, uniforms: U })); sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky);
      /* the site's one cloud, as camera-facing cards in three depths outside the arches */
      const CL = [], red3 = matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { const Pn = window.Painter; if (Pn && Pn.cloud10) { const R0 = Pn.rng(57), tex = [];
        for (let i = 0; i < 4; i++) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d'); Pn.cloud10(x, 256, 150, 90 + i * 7, R0, Pn.cloudPal10.warm); Pn.grain10(x, 512, 256, R0, 1.2); const tx = new T.CanvasTexture(cv); tx.minFilter = T.LinearFilter; tx.generateMipmaps = false; tex.push(tx); }
        [[0, 1000, 6, 150, 18, 2], [1, 440, 4, 120, 80, 3.5], [2, 190, 2, 72, 52, 5]].forEach(([li, d, n, sc, yy, sp]) => { for (let i = 0; i < n; i++) {
          const s = new T.Sprite(new T.SpriteMaterial({ map: tex[(i + li) % 4], transparent: true, depthWrite: false, fog: false, alphaTest: .02 })), a = (i / Math.max(1, n - 1) - .5) * (li === 2 ? 1.1 : .95) + (R0() - .5) * .12, dd = d * (.9 + R0() * .2), k = .8 + R0() * .4;
          s.position.set(Math.sin(a) * dd, yy * (.8 + R0() * .5), ZE + Math.cos(a) * dd); s.scale.set(sc * k, sc * k * .5, 1); scene.add(s); CL.push({ s, x0: s.position.x, A: 36 * dd / 1000, sp: sp * dd / 1000, ph: R0() * 6.28 }); } }); } } catch (e) { console.warn('clouds3d: ' + e.message); }
      const floor = new T.Mesh(new T.PlaneGeometry(2400, 2400), new T.ShaderMaterial({ vertexShader: FVS8, fragmentShader: FLF, extensions: { derivatives: true }, uniforms: U })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
      const wm = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: WAF, extensions: { derivatives: true }, side: T.DoubleSide, uniforms: U });
      const wg = new T.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false, curveSegments: 1 });
      [[XW + TH, 1], [-XW, -1]].forEach(([x, sd]) => { const m = new T.Mesh(wg, wm); m.rotation.y = -Math.PI / 2; m.position.x = x; scene.add(m);
        const c = new T.Mesh(new T.BoxGeometry(TH + .12, .14, ZEND - ZB + .1), wm); c.position.set(sd * (XW + TH / 2), WH + .07, (ZB + ZEND) / 2); scene.add(c); });
      /* back wall in the arches' stone, with a doorway: 40cm jambs (frame + wall), step and threshold */
      const wmB = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: '#define BACK\n' + WAF, extensions: { derivatives: true }, side: T.DoubleSide, uniforms: U });
      const BW = 2 * (XW + TH), BT = .25, HW = .47, HH = 1.92, FD = .15, FW = .22, FT = .3;
      const box = (x0, x1, y0, y1, z0, z1, m = wmB) => { const b = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); scene.add(b); return b; };
      box(-BW / 2, -HW, 0, WH, DZ, DZ + BT); box(HW, BW / 2, 0, WH, DZ, DZ + BT); box(-HW, HW, HH, WH, DZ, DZ + BT);
      box(-HW - FW, -HW, 0, HH, DZ - FD, DZ); box(HW, HW + FW, 0, HH, DZ - FD, DZ); box(-HW - FW, HW + FW, HH, HH + FT, DZ - FD, DZ);
      const SW = HW + FW + .06; box(-SW, SW, 0, .07, DZ - FD - .32, DZ - FD); box(-HW, HW, 0, .07, DZ - FD, DZ + BT);
      box(-BW / 2 - .06, BW / 2 + .06, WH, WH + .14, DZ - .14, DZ + BT);
      box(-BW / 2, BW / 2, WH - .13, WH - .07, DZ - .08, DZ);
      const MO = .09; box(HW, HW + MO, 0, HH + MO, DZ - FD - .035, DZ - FD); box(-HW - MO, -HW, 0, HH + MO, DZ - FD - .035, DZ - FD); box(-HW - MO, HW + MO, HH, HH + MO, DZ - FD - .035, DZ - FD);
      box(-HW - FW - .06, HW + FW + .06, HH + FT, HH + FT + .07, DZ - FD - .05, DZ);
      { const GW = Math.min(1.7, BW / 2 - .35), GH = .55, GY = WH + .14, gs = new T.Shape(); gs.moveTo(-GW, GY); gs.lineTo(GW, GY); gs.lineTo(0, GY + GH); gs.closePath();
        const gm = new T.Mesh(new T.ExtrudeGeometry(gs, { depth: BT, bevelEnabled: false }), wmB); gm.position.z = DZ; scene.add(gm);
        const a = Math.atan2(GH, GW), Lr = Math.hypot(GW, GH) + .12; [-1, 1].forEach(sd => { const rc = new T.Mesh(new T.BoxGeometry(Lr, .1, .2), wmB); rc.position.set(sd * GW / 2, GY + GH / 2 + .03, DZ + .02); rc.rotation.z = -sd * a; scene.add(rc); }); }
      let w = 1, h = 1;
      return {
        resize(W, H) { w = W; h = H; },
        /* portal: while the hall is only seen through the crown arch, draw just the arch's screen rect (the CSS clip hides the rest) */
        render() { const sc = (K.gs && K.gs() || {}).sc; if (sc && sc[2] > sc[0] && sc[3] > sc[1]) { K.R.setScissorTest(true); K.R.setScissor(sc[0], h - sc[3], sc[2] - sc[0], sc[3] - sc[1]); K.R.render(scene, cam); K.R.setScissorTest(false); } else K.R.render(scene, cam); },
        update(t, st) {
          U.uT.value = t; const c = st.cam; if (!c) return;
          cam.position.set(c.C[0], c.C[1], c.C[2]); cam.lookAt(c.L[0], c.L[1], c.L[2]); cam.fov = c.fov; cam.aspect = w / h; cam.near = .03; cam.far = 4000; cam.setViewOffset(w, h, 0, -c.oy * h, w, h); cam.updateProjectionMatrix();
          sky.position.copy(cam.position); U.uEye.value.set(0, 1, Math.max(c.C[2], ZE - 1));
          if (!red3) { const now = performance.now() / 1000; CL.forEach(q => { q.s.position.x = q.x0 + q.A * Math.sin(now * q.sp / q.A + q.ph); }); }
          { const dr = st.door || [0, 0, 0]; U.uDo.value.set(dr[0], dr[1], 3.6 - .75 * dr[1], dr[2]); }
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
      const q = K.queen(); q.scale.setScalar(1.5); scene.add(q); light.position.set(4, 3.4, 3); K.ground.visible = false;
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
    const PR0 = Math.min(devicePixelRatio || 1, 1.25); let qk = Q.k;
    R.outputColorSpace = T.LinearSRGBColorSpace; R.setPixelRatio(PR0 * qk);
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
    const frame = () => { const t = (performance.now() - t0) / 1000; const st = getState() || {}; if (st.active === false) return;
      if (qk !== Q.k) { qk = Q.k; R.setPixelRatio(PR0 * qk); if (K.R2) K.R2.setPixelRatio(PR0 * qk); size(); }
      mats.forEach(m => m.uniforms.uT.value = t); b.update(st.frozen ? 0 : t, st); b.render ? b.render() : R.render(scene, cam); };
    const loop = () => { if (!alive) return; const s = getState() || {}; if (!s.ext) frame(); requestAnimationFrame(loop); };
    el.__frame = frame; el.__size = size; loop();
    return { dispose() { alive = false; el.__frame = null; el.__size = null; ro.disconnect(); b.dispose && b.dispose(); R.dispose(); try { R.forceContextLoss(); } catch (e) {} cv.remove(); } };
  }
  /* adaptive resolution: 100% -> 90% -> 80% of the capped pixel ratio when frames stay over budget ~1s; back up with headroom */
  const Q = { k: 1, acc: 0, n: 0, hi: 0, lo: 0, steps: [1, .9, .8],
    report(dt, budget) { if (!(dt > 0) || dt > 250) return; Q.acc += dt; Q.n++; if (Q.acc < 1000) return; const avg = Q.acc / Q.n; Q.acc = 0; Q.n = 0; const i = Q.steps.indexOf(Q.k);
      if (avg > budget * 1.15) { Q.lo = 0; if (++Q.hi >= 1 && i < Q.steps.length - 1) { Q.k = Q.steps[i + 1]; Q.hi = 0; } }
      else if (avg < budget * .8) { Q.hi = 0; if (++Q.lo >= 3 && i > 0) { Q.k = Q.steps[i - 1]; Q.lo = 0; } } else { Q.hi = 0; Q.lo = 0; } } };
  window.Scene3D = { mount, load, quality: Q };
})();

export {};
