/**
 * "Black hole" — Ponte's official WebGL piece for the 404 page (ponte-black-hole.html,
 * Animations / Shaders in the brand folder). Shaders are the designer's, verbatim;
 * this module ports the runtime (particles, lens render target, cursor mass, click
 * flash, reduced-motion slow-down) to a canvas that fills its container, with the
 * "Ponte" preset and portal layout baked in and the tuning panel removed.
 */

const FS = `
precision highp float;
uniform vec2 uRes,uCenter,uMouse;
uniform float uTime,uRh,uLens,uTilt,uSpin,uBright,uGlint,uFlash,uMass,uRout,uDop,uDpr,uGlow,uSway,uPulse,uWave,uRoll,uCore,uFront,uHaze,uEdge;
uniform vec3 uColA,uColB,uColC;
uniform sampler2D uTex;
const float D=26.;
const float RIN=3.;
const float BSH=2.598;

float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}

vec3 ramp(float t){
  vec3 g=uColA*2.4;
  vec3 c=mix(vec3(0.),g,smoothstep(0.,.3,t));
  c=mix(c,uColB,smoothstep(.2,1.,t));
  c=mix(c,uColC,smoothstep(.85,2.,t));
  return c+uColC*max(t-1.6,0.)*.25;
}
float prof(float rd){
  return smoothstep(RIN*.92,RIN*1.15,rd)*pow(RIN/max(rd,1.),1.05)*(1.-smoothstep(uRout*.55,uRout,rd));
}
float fbm5(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.07+vec2(3.1,7.7);a*=.5;}return v;}
// gas, not rings: long filaments along the flow, bent by a slowly drifting warp, over soft cloudy density
float diskE(vec3 hp,float rd,vec3 d){
  float a=atan(hp.z,hp.x);
  float ang=a+uTime*uSpin*2.4/pow(rd,1.5);
  vec2 c2=vec2(cos(ang),sin(ang));
  float tf=uTime*(.06+.12*uWave);
  vec2 wq=c2*1.6+vec2(rd*.55,-rd*.35);
  float w1=fbm(wq+vec2(tf,-tf*.7));
  float w2=fbm(wq*1.7+vec2(-tf*.8,tf)+w1*1.3);
  float r2=rd+(w1-.5)*1.6*uWave+(w2-.5)*.7;
  float fil=fbm5(vec2(r2*5.2,0.)+c2*.55);
  fil=smoothstep(.18,.9,fil);
  float hair=noise(vec2(r2*38.,0.)+c2*.35);
  float cloud=fbm(c2*2.4+vec2(rd*.9,rd*.4)+w2*1.6);
  float dens=smoothstep(.15,.85,cloud);
  vec3 vd=normalize(vec3(-hp.z,0.,hp.x));
  float cosA=dot(vd,-d);
  float v=uDop*.6*sqrt(RIN/rd);
  float beam=pow(max(1.+v*cosA,.05),3.);
  float body=(.35+.65*dens)*(.55+.55*fil)*(.93+.14*hair);
  return prof(rd)*body*beam*1.35;
}
void main(){
  vec2 fc=gl_FragCoord.xy;
  float cr0=cos(uRoll),sr0=sin(uRoll);
  mat2 rot=mat2(cr0,-sr0,sr0,cr0);   // screen -> disk frame (rolls the whole scene)
  vec2 p=rot*((fc-uCenter)/uRh);
  vec2 pm=rot*((fc-uMouse)/uRh); float dm=dot(pm,pm);
  p-=uMass*pm/(dm+.12);
  float pr=length(p);

  float br=1.+uPulse*(.5*sin(uTime*.7)+.5*sin(uTime*.31+1.7))*.5;
  float inc=radians(uTilt+uSway*sin(uTime*.23)+uSway*.35*sin(uTime*.61+2.));
  vec3 cam=vec3(0.,sin(inc),-cos(inc))*D;
  vec3 fwd=normalize(-cam);
  vec3 right=vec3(1.,0.,0.);
  vec3 up=cross(fwd,right);
  float k=BSH/D;
  vec3 pos=cam;
  vec3 vel=normalize(fwd+(p.x*right+p.y*up)*k);
  vec3 cr=cross(pos,vel);float h2=dot(cr,cr);
  float I=0.,G=0.,T=1.,nc=0.;bool cap=false;
  if(pr<12.){
    for(int i=0;i<230;i++){
      float r=length(pos);
      if(r<1.){cap=true;break;}
      if(r>D+16.&&dot(pos,vel)>0.)break;
      float dt=max(.03,.085*r*r/(r+3.));
      vec3 nv=vel-1.5*h2*pos/pow(r,5.)*dt;
      vec3 np=pos+nv*dt;
      if(pos.y*np.y<0.){
        float f=pos.y/(pos.y-np.y);
        vec3 hp=mix(pos,np,f);
        float rd=length(hp.xz);
        if(!(nc<.5&&hp.z<0.)){
          I+=T*diskE(hp,rd,normalize(nv))*(.85+.15*br);
          T*=1.-.55*prof(rd);
        }
        nc+=1.;
      }
      float rh=length(pos.xz);
      G+=T*dt*uGlow*br*(.035*exp(-abs(pos.y)*1.6)*prof(rh)*smoothstep(-1.,2.,pos.z)+.05*exp(-pow((r-1.5)*2.5,2.)));
      vel=nv;pos=np;
    }
  }
  // background plane just behind the hole
  vec3 col=vec3(.006,.008,.008);float objA=0.;
  if(!cap){
    vec2 q=p;
    float vf=dot(vel,fwd);
    if(pr<12.&&vf>.05){
      float Ls=uLens;
      float t=(Ls-dot(pos,fwd))/vf;
      vec3 hit=pos+vel*t;
      q=vec2(dot(hit,right),dot(hit,up))/(BSH*(D+Ls)/D);
      q=mix(q,p,smoothstep(4.5,9.,pr));
    }
    vec2 qpx=uCenter+(q*rot)*uRh;
    vec2 tuv=qpx/uRes;
    if(tuv.x>0.&&tuv.x<1.&&tuv.y>0.&&tuv.y<1.){vec4 tx=texture2D(uTex,tuv);col=col*(1.-tx.a)+tx.rgb;objA=0.;}
    col*=T;
  } else col*=0.;

  G+=uGlow*br*(.2*exp(-pr*.7)+uHaze*(.035*exp(-pr*.3)+.08*exp(-abs(p.y)*4.-abs(p.x)*.35)));
  if(cap)G*=.75;
  G+=uGlow*br*.13*exp(-pr*pr*.9);
  I+=G;
  float coreM=1.-smoothstep(uEdge-.07,uEdge,pr);   // 1 inside the shadow, 0 at the photon ring
  // front of the disk: a razor line through the shadow, as in film renders
  {
    float ly=p.y+.03;
    float rdl=max(abs(p.x)*BSH,RIN*1.1);
    float pl=prof(rdl)*pow(max(1.+uDop*.6*sqrt(RIN/rdl)*clamp(-p.x*1.5,-1.,1.),.05),3.);
    float fl=fbm5(vec2(rdl*3.+uTime*uSpin*.9,.5)+vec2(0.,ly*6.));
    float fm=mix(1.,uFront,1.-smoothstep(.7,1.08,pr));
    I+=fm*pl*(1.5*exp(-pow(ly/.018,2.))+.35*exp(-abs(ly)/.07)+.12*exp(-abs(ly)/.35)*uGlow)*(.75+.5*fl)*br;
  }
  I*=1.-.65*objA;
  col+=ramp(I*uBright);
  col*=1.-uCore*coreM;

  if(uGlint>0.){
    vec2 gp=p-vec2(cos(2.25),sin(2.25))*1.03;
    float L=length(gp);
    float rays=exp(-abs(gp.y)*70.)*exp(-abs(gp.x)*3.)+exp(-abs(gp.x)*70.)*exp(-abs(gp.y)*3.);
    float core=.01/(L*L+.01);
    col+=uColC*(rays*.8+core*.3)*(.75+.25*sin(uTime*1.3))*uGlint;
  }
  col+=mix(uColB,uColC,.6)*uFlash*(1.4*exp(-pow((pr-1.1)/.35,2.))+.3*exp(-pr*.5));
  col+=(hash(fc+fract(uTime))-.5)*.004;
  gl_FragColor=vec4(col,1.);
}`;
const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
const PVS = `
attribute vec3 aP;attribute vec2 aA;
uniform vec3 uRight,uUp,uFwd,uCam;uniform vec2 uC,uR;uniform float uF,uSize,uDpr,uRoll;
varying float vA,vS,vH;
void main(){
  vec3 rel=aP-uCam;float z=dot(rel,uFwd);
  vec2 s0=vec2(dot(rel,uRight),dot(rel,uUp))/z*uF;
  float c=cos(uRoll),sn=sin(uRoll);
  vec2 s=vec2(c*s0.x-sn*s0.y,sn*s0.x+c*s0.y)+uC;
  gl_Position=vec4(s/uR*2.-1.,0.,1.);
  vA=aA.x;vH=aA.y;vS=dot(aP,uFwd);
  gl_PointSize=uSize*uDpr*(1.+aA.y*1.2)*(26./z);
}`;
const PFS = `
precision highp float;
uniform vec3 uColD,uColC;uniform float uSide,uCore,uHole;uniform vec2 uC;
varying float vA,vS,vH;
void main(){
  if(uSide>.5){if(vS>0.)discard;}else{if(vS<=0.)discard;}
  float d=length(gl_PointCoord-.5);
  float a=smoothstep(.5,.0,d);a*=a;
  vec3 c=mix(uColD,uColC,vH);
  if(uSide>.5)a*=1.-uCore*(1.-smoothstep(.5*uHole,1.05*uHole,length(gl_FragCoord.xy-uC)));
  gl_FragColor=vec4(c,a*vA);
}`;

/** DEF from the tool = the "Ponte" preset. */
const DEF = {
  horizon: 1.45, lens: 16, tilt: 4.5, disk: 5.05, spin: 2.12, doppler: 1.0, bright: 1.4, glow: 1.5,
  sway: 0, pulse: 1.2, wave: 0.8, dust: 320, dsize: 1.0, dspeed: 1.0, mass: 0.05,
  portal: true, roll: 28, core: 0.96, front: 0, haze: 0.4, edge: 0.985,
  colA: "#173B2F", colB: "#E8EE81", colC: "#F7FBE6", colD: "#D8FDF1", glint: false,
};
export type BlackHoleParams = typeof DEF;

export type BlackHoleHandle = { setPlaying(p: boolean): void; destroy(): void };

const hx = (c: string) => [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255];
const norm = (v: number[]) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((x) => x / l); };
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const ss = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

type Part = { r: number; th: number; y: number; inc: number; k: number; tw: number; ph: number; born: number };

export function mountBlackHole(
  cv: HTMLCanvasElement,
  opts: { params?: Partial<BlackHoleParams>; reduce?: boolean } = {},
): BlackHoleHandle | null {
  const P = { ...DEF, ...(opts.params ?? {}) };
  const reduce = !!opts.reduce;
  const ctx = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!ctx) return null;
  const gl: WebGLRenderingContext = ctx;

  const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) ?? "shader"); return o; };
  const program = (vs: string, fs: string) => { const p = gl.createProgram()!; gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); return p; };
  const prog = program(VS, FS);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, "a");
  const U: Record<string, WebGLUniformLocation | null> = {};
  ["uRes", "uCenter", "uMouse", "uTime", "uRh", "uLens", "uTilt", "uSpin", "uBright", "uGlint", "uSway", "uPulse", "uWave", "uFlash", "uMass", "uRout", "uDop", "uDpr", "uGlow", "uColA", "uColB", "uColC", "uTex", "uRoll", "uCore", "uFront", "uHaze", "uEdge"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  /* ---------- dust particles ---------- */
  const pprog = program(PVS, PFS);
  const PU: Record<string, WebGLUniformLocation | null> = {};
  ["uRight", "uUp", "uFwd", "uCam", "uC", "uR", "uF", "uSize", "uDpr", "uColD", "uColC", "uSide", "uRoll", "uCore", "uHole"].forEach((n) => (PU[n] = gl.getUniformLocation(pprog, n)));
  const paP = gl.getAttribLocation(pprog, "aP"), paA = gl.getAttribLocation(pprog, "aA");
  const pbuf = gl.createBuffer();
  const MAXP = 800; const pdata = new Float32Array(MAXP * 5);
  const parts: Part[] = [];
  function spawnP(p: Part, initial: boolean) {
    p.r = initial ? 3 + Math.pow(Math.random(), 0.7) * 38 : rnd(30, 42);
    p.th = rnd(0, Math.PI * 2);
    p.y = rnd(-1, 1) * rnd(0.5, 1) * Math.min(14, p.r * 0.45);
    p.inc = rnd(-0.25, 0.25); p.k = rnd(0.6, 1.4); p.tw = rnd(0.6, 2.4); p.ph = rnd(0, 6.28); p.born = initial ? 2 : 0;
  }
  for (let i = 0; i < MAXP; i++) { const p = { r: 0, th: 0, y: 0, inc: 0, k: 0, tw: 0, ph: 0, born: 0 }; spawnP(p, true); parts.push(p); }
  let pcount = 0;
  function updateParts(dt: number, T: number) {
    pcount = Math.min(MAXP, Math.round(P.dust));
    for (let i = 0; i < pcount; i++) {
      const p = parts[i];
      p.born += dt;
      const x = Math.max(p.r - 1.4, 0);
      p.r -= 0.35 * P.dspeed * p.k * (0.25 + 4 / Math.max(p.r, 1.5)) * (x / (x + 0.6)) * dt;
      p.th += 2.6 * P.dspeed * p.k / Math.pow(Math.max(p.r, 1.3), 1.5) * dt;
      p.y *= Math.exp(-dt * P.dspeed * 0.9 / Math.max(p.r, 1.5) * 2.5);
      const heat = 1 - ss(2.5, 9, p.r);
      const tw = 0.55 + 0.45 * Math.sin(T * p.tw + p.ph);
      const a = ss(0, 1.5, p.born) * ss(1.5, 3, p.r) * tw * (0.55 + 0.45 * heat);
      const c = Math.cos(p.th), s = Math.sin(p.th);
      pdata[i * 5] = c * p.r; pdata[i * 5 + 1] = p.y + Math.sin(p.inc) * s * p.r; pdata[i * 5 + 2] = s * p.r;
      pdata[i * 5 + 3] = a; pdata[i * 5 + 4] = heat;
      if (p.r < 1.6) spawnP(p, false);
    }
  }
  function drawParts(side: number, cam: number[], fwd: number[], right: number[], up: number[]) {
    if (!pcount) return;
    gl.useProgram(pprog);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.bufferData(gl.ARRAY_BUFFER, pdata.subarray(0, pcount * 5), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(paP); gl.vertexAttribPointer(paP, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(paA); gl.vertexAttribPointer(paA, 2, gl.FLOAT, false, 20, 12);
    gl.uniform3fv(PU.uRight, right); gl.uniform3fv(PU.uUp, up); gl.uniform3fv(PU.uFwd, fwd); gl.uniform3fv(PU.uCam, cam);
    gl.uniform2f(PU.uC, cx * dpr, (H - cy) * dpr); gl.uniform2f(PU.uR, cv.width, cv.height);
    gl.uniform1f(PU.uF, 26 / 2.598 * RH * dpr); gl.uniform1f(PU.uSize, 2.8 * P.dsize); gl.uniform1f(PU.uDpr, dpr);
    gl.uniform3fv(PU.uColD, hx(P.colD)); gl.uniform3fv(PU.uColC, hx(P.colC)); gl.uniform1f(PU.uSide, side);
    gl.uniform1f(PU.uRoll, P.roll * Math.PI / 180); gl.uniform1f(PU.uCore, P.portal ? P.core : 0); gl.uniform1f(PU.uHole, RH * dpr);
    gl.drawArrays(gl.POINTS, 0, pcount);
    gl.disableVertexAttribArray(paA);
  }

  /* ---------- render target for what sits behind the hole ---------- */
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const fbo = gl.createFramebuffer();

  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, RH = 0;
  function layout() {
    W = cv.clientWidth; H = cv.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.25);
    if (W * H * dpr * dpr > 2.2e6) dpr = Math.sqrt(2.2e6 / (W * H));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cv.width, cv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const wide = W >= 820;
    if (P.portal) { cx = W * 0.5; cy = H * 0.5; RH = Math.min(H * 0.255, W * 0.4) * P.horizon; }
    else { cx = W * 0.5; cy = wide ? H * 0.71 : H * 0.72; RH = Math.min(W, H) * (wide ? 0.085 : 0.1) * P.horizon; }
    cv.style.setProperty("--hole", RH * 2 + "px");
  }

  /* ---------- input (relative to the canvas) ---------- */
  let mx = -9999, my = -9999, massNow = 0, massTarget = 0, flash = 0;
  const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; massTarget = e.pointerType === "mouse" ? 1 : 0; };
  const onLeave = () => { massTarget = 0; };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest("a,button,input")) return;
    const r = cv.getBoundingClientRect();
    if (Math.hypot(e.clientX - r.left - cx, e.clientY - r.top - cy) < RH * 1.6) flash = 1;
  };
  window.addEventListener("pointermove", onMove);
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("pointerdown", onDown);

  /* ---------- loop ---------- */
  let last = performance.now(), T = 0, raf = 0, playing = false;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const ts = reduce ? 0.25 : 1;
    T += dt * ts;
    massNow += (massTarget - massNow) * Math.min(1, dt * 4);
    flash *= Math.exp(-dt * 2.2);
    updateParts(dt * ts, T);
    const inc = (P.tilt + P.sway * Math.sin(T * 0.23) + P.sway * 0.35 * Math.sin(T * 0.61 + 2)) * Math.PI / 180;
    const cam = [0, Math.sin(inc) * 26, -Math.cos(inc) * 26];
    const fwd = norm(cam.map((v) => -v)), right = [1, 0, 0], up = cross(fwd, right);
    // 1: particles behind the hole -> lens texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, cv.width, cv.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    drawParts(0, cam, fwd, right, up);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height);
    // 2: black hole
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.uTex, 0);
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform2f(U.uCenter, cx * dpr, (H - cy) * dpr); gl.uniform2f(U.uMouse, mx * dpr, (H - my) * dpr);
    gl.uniform1f(U.uTime, T); gl.uniform1f(U.uRh, RH * dpr); gl.uniform1f(U.uDpr, dpr);
    gl.uniform1f(U.uLens, P.lens); gl.uniform1f(U.uTilt, P.tilt); gl.uniform1f(U.uSpin, P.spin);
    gl.uniform1f(U.uBright, P.bright); gl.uniform1f(U.uGlint, P.glint ? 1 : 0); gl.uniform1f(U.uSway, P.sway); gl.uniform1f(U.uPulse, P.pulse); gl.uniform1f(U.uWave, P.wave);
    gl.uniform1f(U.uFlash, flash); gl.uniform1f(U.uMass, P.mass * massNow); gl.uniform1f(U.uRout, 3 * P.disk); gl.uniform1f(U.uGlow, P.glow); gl.uniform1f(U.uDop, P.doppler);
    gl.uniform3fv(U.uColA, hx(P.colA)); gl.uniform3fv(U.uColB, hx(P.colB)); gl.uniform3fv(U.uColC, hx(P.colC));
    gl.uniform1f(U.uRoll, P.roll * Math.PI / 180); gl.uniform1f(U.uCore, P.portal ? P.core : 0); gl.uniform1f(U.uFront, P.portal ? P.front : 1); gl.uniform1f(U.uHaze, P.portal ? P.haze : 1); gl.uniform1f(U.uEdge, P.edge);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 3: particles in front of the hole
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawParts(1, cam, fwd, right, up);
    gl.disable(gl.BLEND); gl.disableVertexAttribArray(paP);
    raf = requestAnimationFrame(frame);
  }
  const ro = new ResizeObserver(layout);
  ro.observe(cv);
  layout();

  return {
    setPlaying(p) {
      if (p === playing) return;
      playing = p;
      if (p) { last = performance.now(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
    },
  };
}
