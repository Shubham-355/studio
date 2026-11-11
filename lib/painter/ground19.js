/* v19 beach ground: sea, swash, foam, wet and dry sand in ONE world-space shader, animated (two overlapping 7.2 s waves, breaking lines, ripples, caustics). Was v18: ONE world-space plane rendered per frame for the live camera (one draw call, one shader).
   Sea, foam line, wet and dry sand all come from the same shoreline function S.Xs / S.Xwet used by the painted plates,
   so colours match worlds6 colAt; detail is procedural in world metres and filtered by screen derivatives (no shimmer). */
(function () {
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes;uniform float uDpr,uT,uSky;uniform vec4 uC1,uC2,uS,uB;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return .55*vn(p)+.3*vn(p*2.03+7.1)+.15*vn(p*4.1+3.7);}
float cellD(vec2 p){vec2 i=floor(p),f=fract(p);float d=9.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(h21(i+g),h21(i+g+19.7));d=min(d,length(g+o-f));}return d;}
vec3 c3(float r,float g,float b){return vec3(r,g,b)/255.;}
float sat(float x){return clamp(x,0.,1.);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
  float u=gl_FragCoord.x/uDpr,v=uRes.y-gl_FragCoord.y/uDpr;
  float f=uC2.x,a=(u-uC2.y)/f,b=-(v-uC2.z)/f,cs=cos(uC1.w),sn=sin(uC1.w),dy=b*cs-sn;
  if(dy>-1e-4){ if(uSky<.5){gl_FragColor=vec4(0.);return;}
    float e=clamp((b*sn+cs)>0.?atan(dy,b*sn+cs):1.5,0.,1.5);
    vec3 s=mix(c3(218.,232.,236.),c3(182.,211.,232.),smoothstep(0.,.12,e));s=mix(s,c3(120.,172.,223.),smoothstep(.12,.5,e));gl_FragColor=vec4(s,1.);return;}
  float t=-uC1.y/dy,X=uC1.x+t*a,Z=uC1.z+t*(b*sn+cs),T=uT;
  float aX=fwidth(X)+1e-5,aZ=fwidth(Z)+1e-5,px=max(aX,aZ);
  float Zb=uS.z;
  /* mean waterline: the old straight shore, moved a little seaward, with bays and points at irregular spacing */
  float bay=.16*sin(Z*.55+1.3)+.09*sin(Z*1.37+.4)+.05*sin(Z*3.1+2.)+.06*(vn(vec2(Z*1.7,4.))-.5);
  float U=X-(uS.x+.1*(Z-Zb)-.3+bay);
  /* ---- swash: two overlapping waves on a 7.2 s cycle, oblique so they arrive at different moments along the shore ---- */
  float E=-.14,wetM=0.,foam=0.,sheet=0.,surf=0.,surfD=0.;
  for(int k=0;k<2;k++){ float fk=float(k);
    float ph=T/7.2+fk*.5+Z*.03+.05*sin(Z*.37+fk*2.),cyc=floor(ph),fr=fract(ph);
    float rmax=.26+.18*vn(vec2(Z*.45+cyc*3.7+fk*11.,fk*5.))+.04*sin(Z*1.7+cyc);
    float up=fr<.42?1.-pow(1.-fr/.42,2.2):1.-smoothstep(.42,1.,fr);
    float sc=(.014*sin(Z*27.+fk*3.+cyc*1.7)+.012*(vn(vec2(Z*16.,cyc+fk*4.))-.5))*up;
    float fp=-.14+up*rmax+sc, dU=fp-U;
    E=max(E,fp);
    float back=fr<.42?1.:mix(1.,.3,smoothstep(.42,.85,fr));
    if(dU>0.){ float band=1.-smoothstep(0.,.035+.035*up,dU); float trail=(1.-smoothstep(.0,.16,dU))*.45*smoothstep(.42,.6,fr);
      foam=max(foam,(band+trail*vn(vec2(Z*9.,U*30.+fk)))*back*smoothstep(0.,.06,up)); sheet=max(sheet,1.-smoothstep(.0,.25,dU)); }
    float reach=-.14+rmax*(fr<.42?up:1.);
    if(U<reach&&dU<=0.){ float fU=.42+.58*sat(1.-(U+.14)/rmax); wetM=max(wetM,exp(-max(0.,fr-fU)*7.2/.85)); }
    /* the breaking line a little way out: a short white crest rolling in, dissolving into this wave's swash */
    if(fr>.4){ float s2=smoothstep(.4,1.,fr),Uc=mix(-2.4-.4*fk,-.2,s2),st=sin(3.14159*s2)*smoothstep(.36,.62,vn(vec2(Z*.42+fk*9.+cyc*2.3,1.)));
      float w=.05+.04*s2; surf=max(surf,exp(-pow((U-Uc)/w,2.))*st); surfD=max(surfD,exp(-pow((U-Uc+w*2.2)/(w*1.6),2.))*st); }
  }
  float edgeS=E+.006*(vn(vec2(Z*40.,T*.3))-.5);
  float waterK=1.-smoothstep(edgeS-px*1.2,edgeS+px*1.2,U);
  /* ---- sand: one surface, wet to dry ---- */
  vec3 dry=c3(217.,195.,160.),wet=c3(185.,160.,128.),skyR=c3(190.,210.,226.);
  float wB=1.-smoothstep(.22,.5+.12*vn(vec2(Z*1.3,2.))+.03*sin(T*.873+Z*.2),U);
  float wetness=max(wB*.9,max(wetM,waterK));
  vec3 sand=mix(dry,wet,wetness);
  float nz=sin(X*2.1+Z*1.3)*.5+sin(X*5.3-Z*3.7+1.3)*.3+sin(X*11.7+Z*9.1)*.2; sand*=1.+nz*.025;
  /* wind ripples parallel to the waterline, lit from the sun side; fine grain only where it resolves */
  float Rr=U-.6,kk=floor(Rr/.075),fq=fract(Rr/.075+.014*sin(Z*.9+kk*.45)/.075+.008*sin(Z*2.6+kk*1.3)/.075);
  float brk=smoothstep(.16,.28,abs(sin(Z*.8+kk*2.3)+.5*sin(Z*2.1+kk))),aa=1.-smoothstep(.25,.7,aX/.075),ra=smoothstep(.5,.9,U)*brk*aa*(1.-wetness);
  sand=mix(sand,c3(246.,232.,206.),smoothstep(.0,.08,fq)*(1.-smoothstep(.12,.22,fq))*.22*ra);
  sand=mix(sand,c3(150.,138.,122.),smoothstep(.2,.28,fq)*(1.-smoothstep(.34,.44,fq))*.15*ra);
  float gd=1.-smoothstep(.3,.8,px*45.),g2=1.-smoothstep(.3,.8,px*160.),g3=1.-smoothstep(.3,.8,px*420.);
  sand+=(vn(vec2(X,Z)*45.)-.5)*.05*gd+(fb(vec2(X*4.,Z*4.))-.5)*.03+(vn(vec2(X,Z)*160.)-.5)*.06*g2+(vn(vec2(X,Z)*420.+3.1)-.5)*.05*g3;
  /* wet sand: darker, a little glossy, reflecting sky; the fresh wet mark left by each wave shines most */
  sand=mix(sand,skyR,(.1*wB+.22*wetM)*(.6+.4*vn(vec2(X*6.,Z*6.)))*(1.-waterK));
  sand+=vec3(.05,.045,.035)*wetM*smoothstep(.55,.85,vn(vec2(X*22.,Z*22.)+T*.1))*(1.-waterK);
  /* the board, slightly sunk: a tight dark contact, then a small ridge of pushed sand lit on the sun side */
  { vec2 bc=(uB.xy+uB.zw)*.5,bh=(uB.zw-uB.xy)*.5,dq=abs(vec2(X,Z)-bc)-bh; float sd=length(max(dq,0.))+min(max(dq.x,dq.y),0.);
    vec2 nr=normalize(sign(vec2(X,Z)-bc)*max(dq,vec2(0.))+1e-5); float lit=dot(nr,-normalize(vec2(.45,-1.35)));
    float rg=exp(-pow((sd-.05)/.032,2.))*(1.+.4*(vn(vec2(X*20.,Z*20.))-.5));
    sand*=1.+rg*(.07*lit-.035); sand*=1.-.28*(1.-smoothstep(0.,.022,sd));
    vec2 dq2=abs(vec2(X,Z)-bc-vec2(.03,-.08))-bh; float sd2=length(max(dq2,0.))+min(max(dq2.x,dq2.y),0.); sand*=1.-.16*(1.-smoothstep(-.02,.14,sd2)); }
  /* ---- the sea: one depth gradient from clear shallows to deep teal ---- */
  float th=max(E-U,0.);
  vec3 shal=c3(204.,230.,216.),turq=c3(96.,196.,190.),teal=c3(50.,146.,168.),deep=c3(30.,88.,138.);
  vec3 wc=mix(shal,turq,smoothstep(.0,.7,th)); wc=mix(wc,teal,smoothstep(.5,2.4,th)); wc=mix(wc,deep,smoothstep(2.,8.,th));
  wc=mix(wc,c3(74.,128.,178.),clamp((Z-14.)/50.,0.,1.)*.6);
  /* soft painted ripples in two scales and directions, drifting; small sun glints on them */
  vec2 P=vec2(X,Z),q1=rot(.6)*(P*vec2(3.6,1.9))+vec2(T*.07,-T*.045),q2=rot(-.9)*(P*vec2(8.4,4.6))+vec2(-T*.1,T*.065);
  float w2=vn(q2*.5),r1=fb(q1+.7*vec2(w2,vn(q2*.5+3.))),r2=vn(q2+r1*1.3);
  float rf=1.-smoothstep(.02,.09,px),rf2=1.-smoothstep(.008,.03,px);
  wc*=1.+((r1-.5)*.1*rf+(r2-.5)*.06*rf2)*smoothstep(.05,.6,th);
  /* sun glints: sparse, soft, clustered where the ripples face the sun, never a repeated mark */
  float gl=smoothstep(.9,.98,vn(q2*1.3+r1*2.6+T*.05))*smoothstep(.55,.8,fb(P*.6+vec2(T*.02,0.)))*rf2;
  wc=mix(wc,c3(250.,248.,236.),gl*.2*smoothstep(.3,1.4,th));
  /* see the sand through the shallows, with soft moving light patterns on it */
  float ca=1.-abs(vn(P*9.+vec2(T*.32,T*.18))-vn(rot(.7)*P*9.6-vec2(T*.27,T*.21)))*2.4; ca=smoothstep(.5,1.,ca)*(1.-smoothstep(.006,.025,px));
  vec3 under=wet*(.94+.12*ca*(1.-smoothstep(.05,1.,th)));
  float clear=1.-smoothstep(0.,.95,th);
  vec3 water=mix(wc,under*mix(vec3(1.),shal/max(dry,vec3(.01)),.18),clear*.82);
  water=mix(water,skyR,sheet*.12);
  /* breaking line: darker face seaward, white crest */
  water*=1.-.1*surfD;
  float lace=smoothstep(.3,.62,vn(P*vec2(30.,30.)+vec2(T*.04,0.)))*.55+.45;
  float holes=mix(1.,smoothstep(.08,.24,cellD(P*58.+vec2(0.,T*.05))),1.-smoothstep(.003,.012,px));
  vec3 foamC=c3(250.,250.,246.);
  water=mix(water,foamC,sat(surf*lace*holes)*.85);
  vec3 col=mix(sand,water,waterK);
  /* swash foam: thin lacy sheet with holes and a scalloped front */
  col=mix(col,foamC,sat(foam*lace*holes)*.9*sat(waterK*1.4));
  col=mix(col,c3(218.,232.,236.),clamp((1.-exp(-t/48.))*.92,0.,1.));
  gl_FragColor=vec4(col,1.);
}`;
  window.Ground19 = cv => {
    let gl = null; try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: /[?&]dbg/.test(location.search) }); } catch (e) {}
    if (!gl || !gl.getExtension('OES_standard_derivatives')) return { ok: false };
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    let pg; try { pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg); if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) throw new Error('link'); } catch (e) { console.warn('ground19: ' + e.message); return { ok: false }; }
    const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(pg); const lp = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uDpr', 'uT', 'uSky', 'uC1', 'uC2', 'uS', 'uB'].forEach(k => U[k] = gl.getUniformLocation(pg, k));
    return { ok: true,
      draw(o) { const c = o.cam, S = o.S; if (cv.width !== o.bw || cv.height !== o.bh) { cv.width = o.bw; cv.height = o.bh; }
        gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, o.w, o.h); gl.uniform1f(U.uDpr, cv.width / o.w); gl.uniform1f(U.uT, o.now % 1000); gl.uniform1f(U.uSky, o.sky ? 1 : 0);
        gl.uniform4f(U.uC1, c.x, c.y, c.z, c.ph); gl.uniform4f(U.uC2, c.f, c.cx, c.cy, 0); gl.uniform4f(U.uS, S.Xs(S.Zb), S.Xb, S.Zb, 0);
        { const B = S.board || [[0, 0]], xs = B.map(p => p[0]), zs = B.map(p => p[1]); gl.uniform4f(U.uB, Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)); }
        gl.drawArrays(gl.TRIANGLES, 0, 3); },
      dispose() { const e = gl.getExtension('WEBGL_lose_context'); e && e.loseContext(); } };
  };
})();

export {};
