/* v18 beach ground: ONE world-space plane rendered per frame for the live camera (one draw call, one shader).
   Sea, foam line, wet and dry sand all come from the same shoreline function S.Xs / S.Xwet used by the painted plates,
   so colours match worlds6 colAt; detail is procedural in world metres and filtered by screen derivatives (no shimmer). */
(function () {
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes;uniform float uDpr,uT,uSky;uniform vec4 uC1,uC2,uS;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return .55*vn(p)+.3*vn(p*2.03+7.1)+.15*vn(p*4.1+3.7);}
vec3 c3(float r,float g,float b){return vec3(r,g,b)/255.;}
void main(){
  float u=gl_FragCoord.x/uDpr,v=uRes.y-gl_FragCoord.y/uDpr;
  float f=uC2.x,a=(u-uC2.y)/f,b=-(v-uC2.z)/f,cs=cos(uC1.w),sn=sin(uC1.w),dy=b*cs-sn;
  if(dy>-1e-4){ if(uSky<.5){gl_FragColor=vec4(0.);return;}
    float e=clamp((b*sn+cs)>0.?atan(dy,b*sn+cs):1.5,0.,1.5);
    vec3 s=mix(c3(218.,232.,236.),c3(182.,211.,232.),smoothstep(0.,.12,e));s=mix(s,c3(120.,172.,223.),smoothstep(.12,.5,e));gl_FragColor=vec4(s,1.);return;}
  float t=-uC1.y/dy,X=uC1.x+t*a,Z=uC1.z+t*(b*sn+cs);
  float XsB=uS.x,Xb=uS.y,Zb=uS.z,xs=XsB+.1*(Z-Zb);
  float b0=xs+.45,env=exp(-pow((Z-Zb)/1.7,4.)),lobe=Xb+1.08+.12*sin(Z*2.3),xw=b0+env*max(0.,lobe-b0);
  float d=xs-X,U=X-xs;vec3 col;
  vec3 turq=c3(92.,198.,188.),teal=c3(52.,152.,172.),deep=c3(40.,104.,160.),far=c3(74.,128.,178.),wetD=c3(146.,124.,96.),wetL=c3(194.,172.,134.),dry=c3(238.,218.,180.),dryS=c3(222.,198.,158.),haze=c3(218.,232.,236.);
  float aU=fwidth(U)+1e-5,aZ=fwidth(Z)+1e-5;
  if(d>0.){
    float q=clamp(d/3.2,0.,1.);col=q<.35?mix(turq,teal,q/.35):mix(teal,deep,(q-.35)/.65);col=mix(col,far,clamp((Z-14.)/50.,0.,1.)*.7);
    /* wave strokes: long along the shore, drifting toward it */
    vec2 w=vec2((U+uT*.035)*6.5,Z*1.15);float fd=1.-smoothstep(.3,.9,max(aU*6.5,aZ*1.15));
    float s1=fb(w),s2=vn(vec2((U+uT*.05)*16.,Z*2.6+3.));
    col+=(s1-.5)*.075*fd;col=mix(col,c3(236.,246.,244.),smoothstep(.72,.92,s2)*.32*fd*(1.-q*.6));
    col=mix(col,col*.93,(fb(vec2(X,Z)*.7)-.5)*.6);
  }else if(X<xw){
    float e=clamp((X-xs)/max(.05,xw-xs),0.,1.);col=mix(wetD,wetL,pow(e,.6));
    float fd=1.-smoothstep(.3,.9,max(aU,aZ)*14.);
    col=mix(col,c3(200.,214.,228.),.16*(1.-e)*(.6+.4*vn(vec2(U*9.,Z*1.6))));
    col+=(vn(vec2(U*30.,Z*6.))-.5)*.05*fd;
  }else{
    float e=clamp((X-xw)/.35,0.,1.);float ed=(vn(vec2(Z*3.,1.7))-.5)*.12;e=clamp(e+ed,0.,1.);
    col=mix(wetL,dry,pow(e,.5));float nz=sin(X*2.1+Z*1.3)*.5+sin(X*5.3-Z*3.7+1.3)*.3+sin(X*11.7+Z*9.1)*.2;col=mix(col,dryS,clamp(.25+nz*.25,0.,1.));
    /* ripples parallel to the waterline, 7.5cm spacing, lit crest toward the sun */
    float R=U-.5,k=floor(R/.075),fr=fract(R/.075+.014*sin(Z*.9+k*.45)/.075+.008*sin(Z*2.6+k*1.3)/.075);
    float brk=smoothstep(.16,.28,abs(sin(Z*.8+k*2.3)+.5*sin(Z*2.1+k)));
    float aa=1.-smoothstep(.25,.7,aU/.075),ra=smoothstep(xw+.08,xw+.4,X)*brk*aa;
    col=mix(col,c3(250.,238.,214.),smoothstep(.0,.08,fr)*(1.-smoothstep(.12,.22,fr))*.2*ra);
    col=mix(col,c3(150.,140.,128.),smoothstep(.2,.28,fr)*(1.-smoothstep(.34,.44,fr))*.14*ra);
    float gd=1.-smoothstep(.3,.8,max(aU,aZ)*45.);col+=(vn(vec2(X,Z)*45.)-.5)*.06*gd;col+=(fb(vec2(X*4.,Z*4.))-.5)*.035;
  }
  col=mix(col,haze,clamp((1.-exp(-t/48.))*.92,0.,1.));
  gl_FragColor=vec4(col,1.);
}`;
  window.Ground18 = cv => {
    let gl = null; try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false }); } catch (e) {}
    if (!gl || !gl.getExtension('OES_standard_derivatives')) return { ok: false };
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    let pg; try { pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg); if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) throw new Error('link'); } catch (e) { console.warn('ground18: ' + e.message); return { ok: false }; }
    const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(pg); const lp = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uDpr', 'uT', 'uSky', 'uC1', 'uC2', 'uS'].forEach(k => U[k] = gl.getUniformLocation(pg, k));
    return { ok: true,
      draw(o) { const c = o.cam, S = o.S; if (cv.width !== o.bw || cv.height !== o.bh) { cv.width = o.bw; cv.height = o.bh; }
        gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, o.w, o.h); gl.uniform1f(U.uDpr, cv.width / o.w); gl.uniform1f(U.uT, o.now % 1000); gl.uniform1f(U.uSky, o.sky ? 1 : 0);
        gl.uniform4f(U.uC1, c.x, c.y, c.z, c.ph); gl.uniform4f(U.uC2, c.f, c.cx, c.cy, 0); gl.uniform4f(U.uS, S.Xs(S.Zb), S.Xb, S.Zb, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3); },
      dispose() { const e = gl.getExtension('WEBGL_lose_context'); e && e.loseContext(); } };
  };
})();

export {};
