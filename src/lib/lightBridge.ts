/**
 * "Light Bridge" — Ponte's official WebGL backdrop (ponte-light-bridge-green.html,
 * Animations / Shaders in the brand folder). The fragment shader is the designer's,
 * verbatim; this module only wires it to a canvas and drives the uniforms.
 *
 * Used as the "video frame" fill behind the hero, the trust section and the final CTA.
 */

export const LIGHT_BRIDGE_FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg, uFiber, uLine, uWing, uHalo;
uniform float uStem, uSplit, uBend, uCurve, uFlare, uLow;
uniform float uFill, uSpread, uRise, uDensity, uContrast;
uniform float uCore, uLineW, uLineFade;
uniform float uSide, uWingS, uWingW, uWingFade, uWingStraight, uWingA;
uniform float uGlow, uBottom;
uniform float uPulse, uPulseLen, uSpeed, uRiseT, uRiseDur;
uniform float uExpo, uVig, uGrain, uZoom, uOffY, uFlipX, uFlipY;

float h11(float n){ return fract(sin(n*127.1)*43758.5453); }
float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
float n11(float x){ float i=floor(x), f=fract(x); float u=f*f*(3.0-2.0*f); return mix(h11(i), h11(i+1.0), u); }
// picked colour -> light amount, so intensity 1 shows exactly the picked colour
vec3 lin(vec3 c){ return -log(1.0 - min(c, vec3(0.985))); }

// pulse travelling up a strand: u = 0 at the head, grows along the tail
float cometU(float t, float id, float rate){
  return 1.0 - fract(t*0.9 - uTime*rate + h11(id)*13.7);
}
// soft head and a tail that dissolves (gaussian), no hard ends on either side
float cometShape(float u, float len){
  float k = smoothstep(0.0, 0.35*len, u);
  return k*k * exp(-pow(max(u - 0.3*len, 0.0)/len, 2.0));
}
float cometB(float u, float len, float id){
  // add the tails of the previous cycles so a long pulse never ends in a hard cut
  return (cometShape(u, len) + cometShape(u + 1.0, len) + cometShape(u + 2.0, len)) * step(0.35, h11(id*3.1+1.7));
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  if(uFlipX > 0.5) fc.x = uRes.x - fc.x;
  if(uFlipY > 0.5) fc.y = uRes.y - fc.y;
  vec2 p = fc / uRes;
  // world units: 1 = frame height at zoom 1; zoom > 1 enlarges the bridge and crops it
  float unit = uRes.y*uZoom;
  vec2 q = vec2((fc.x - 0.5*uRes.x)/unit, fc.y/unit + uOffY);
  float halfW = 0.5*uRes.x/unit;
  float y = q.y - uBend;

  // bridge profile: narrow stem above the bend, flares out below it
  float E, dE;
  if (y > 0.0) { E = exp(-y/uCurve); dE = -E/uCurve; }
  else {
    float a = -y/uCurve, b = -y/0.3;
    E = 1.0 + a + uLow*b*b*b;
    dE = -1.0/uCurve - 3.0*uLow*b*b/0.3;
  }
  float P = uStem*(1.0 + uFlare*E);
  float dP = uStem*uFlare*dE;
  float s = q.x / P;                         // strand coordinate: core lines at |s| = 1
  float gl = length(vec2(1.0/P, -q.x*dP/(P*P)));
  float as = abs(s);

  float t = q.y - abs(q.x)*0.8;             // coordinate along the flow
  float up = max(y, 0.0);
  float bottom = smoothstep(0.04, uBottom, q.y);
  float fillLow = smoothstep(0.03, uBottom, q.y);

  // one-shot reveal: the bridge rises out of the dark, then stays lit
  float reveal = 1.0, head = 0.0;
  float c = clamp(uRiseT/uRiseDur, 0.0, 1.0);
  if (c < 1.0) {
    // pointed front: the stem shoots up first, the sides follow; soft glowing edge
    float tr = q.y + abs(q.x)*0.9;
    float R = mix(uOffY, uOffY + 1.0/uZoom + 0.9*halfW + 0.3, smoothstep(0.0, 1.0, c));
    reveal = smoothstep(R, R - 0.28, tr);
    head = exp(-pow((tr - R + 0.06)/0.09, 2.0)) * smoothstep(0.0, 0.08, c) * (1.0 - smoothstep(0.75, 1.0, c));
  }

  // fibres: soft light filling the stem and the fan below it
  float d = s*uDensity + 2.6;
  float n = n11(d)*0.55 + n11(d*2.13+5.0)*0.3 + n11(d*4.7+11.0)*0.15;
  n *= 0.8 + 0.2*n11(d*0.5 + uTime*0.15*uSpeed);
  // below the bend the fibres become straight rays from the foot of the stem
  float fanK = smoothstep(0.3, 1.8, E);
  // apex where the straight lines below the bend meet, so rays, lines and wings share it
  float apexY = uBend + uCurve*(1.0 + 1.0/max(uFlare, 0.01));
  float ang = atan(q.x, max(apexY - q.y, 0.002));
  float ra = ang*uDensity*1.5 + 3.7;
  float rn = n11(ra)*0.65 + n11(ra*2.3+7.0)*0.35;
  rn *= 0.8 + 0.2*n11(ra*0.5 - uTime*0.12*uSpeed);
  float fib = mix(1.0, mix(n*1.6, rn*rn*3.6, fanK), uContrast*mix(0.2, 1.0, fanK));  // smooth stem, streaky fan
  float fillEnv = 1.0/(1.0 + pow(as/(uSpread*(1.0 + 0.8*smoothstep(1.5, 4.0, E))), 4.0));
  float fill = fib*fillEnv*exp(-pow(up/uRise, 1.4))*fillLow;
  fill *= 1.0 - 0.3*exp(-pow(as/0.4, 2.0))*smoothstep(0.4, 1.6, E);   // darker spine in the fan

  // twin core lines, each split into two hairlines, width in screen space
  float lw = uLineW*0.001*(1.0 + 0.25*min(E, 6.0));
  float d1 = abs(as - (1.0 - uSplit))/gl, d2 = abs(as - (1.0 + uSplit))/gl;
  float dc = abs(as - 1.0)/gl;
  float core = exp(-d1*d1/(lw*lw)) + exp(-d2*d2/(lw*lw)) + 0.25*exp(-dc/(lw*1.5 + 0.5*uSplit*uStem));
  core *= exp(-up*uLineFade) * (1.0 + 0.9*exp(-pow(y/0.09, 2.0))) * bottom*bottom;

  // wings: the outer bundle that turns towards the edges and fades upward into haze
  float wo = as - uWingS;
  float wb = exp(-pow(wo/(wo > 0.0 ? uWingW*2.2 : uWingW), 2.0));
  float wingC = wb*(0.7 + 0.3*n11(d*0.35+3.0))*exp(-up*uWingFade);
  // straight wing: a ray towards the foot of the stem, fading out before it reaches the apex
  float rDist = length(q - vec2(0.0, apexY));
  float aw = uWingW*0.13;
  float wingR = exp(-pow((abs(ang) - uWingA)/aw, 2.0)) * smoothstep(0.04, 0.22, rDist)
              * step(q.y, apexY) * (0.7 + 0.3*n11(ang*35.0 + 3.0));
  float wing = mix(wingC, wingR, uWingStraight) * bottom;

  // travelling pulses on fibres and core lines
  float idS = floor(d*0.5) + (s < 0.0 ? 500.0 : 0.0);
  float idR = floor(ra*0.8) + 900.0;
  // soft side edges per strand so pulses never show as blocks
  float wS = sin(3.14159*fract(d*0.5)), wR = sin(3.14159*fract(ra*0.8));
  float pul = mix(cometB(cometU(t, idS, uSpeed*0.25), uPulseLen, idS)*wS,
                  cometB(cometU(t, idR, uSpeed*0.25), uPulseLen, idR)*wR, fanK) * fill * n;
  // core pulse: measured along the line's own axis, tapering to a point at the head
  float cid = s < 0.0 ? 7.0 : 19.0;
  float cu = cometU(q.y - P*0.8, cid, uSpeed*0.33);
  float corePul = 0.0;
  for (int k = 0; k < 3; k++) {          // current pulse plus the tails of the previous cycles
    float uk = cu + float(k);
    float cw = lw*(0.6 + 4.0*smoothstep(0.0, uPulseLen*1.6, uk));   // widens and blurs towards the tail
    corePul += cometShape(uk, uPulseLen*1.4) * exp(-dc*dc/(cw*cw)) * sqrt(lw*1.5/cw);
  }
  corePul *= step(0.35, h11(cid*3.1+1.7)) * bottom;

  // atmospheric halo around the bend
  vec2 hq = (q - vec2(0.0, uBend+0.08)) * vec2(3.2, 2.6);
  float atm = (0.6*exp(-dot(hq, hq)*2.0) + 0.9*exp(-pow((y-0.06)/0.09, 2.0))*exp(-abs(q.x)*2.2)) * bottom;

  vec3 light = lin(uFiber)*(uFill*fill + uPulse*pul + 1.5*head*fillEnv)
             + lin(uLine)*(uCore*core + uPulse*1.5*corePul)
             + lin(uWing)*(uSide*wing)
             + lin(uHalo)*(uGlow*atm);
  light *= reveal * uExpo;
  vec3 col = uBg + (1.0 - uBg)*(1.0 - exp(-light));

  float vig = 1.0 - uVig*0.6*dot(p-0.5, p-0.5)*2.2;
  col *= vig;
  col += (h21(gl_FragCoord.xy + fract(uTime)*91.0) - 0.5) * uGrain;
  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a,0.0,1.0); }";

/** Designer defaults (PARAMS in the tool) with the "Hero" preset applied. */
export const LIGHT_BRIDGE_HERO: Record<string, number | string> = {
  // motion
  uSpeed: 1,
  uPulse: 0.6,
  uPulseLen: 0.3,
  uRiseDur: 6,
  // frame
  uZoom: 1,
  uOffY: 0,
  // shape
  uStem: 0.0215,
  uSplit: 0.19,
  uBend: 0.26,
  uCurve: 0.04,
  uFlare: 1.8,
  uLow: 0,
  uBottom: 0.3,
  // light
  uCore: 0.8,
  uLineW: 2.4,
  uLineFade: 0.1,
  uFill: 0.85,
  uSpread: 1.3,
  uRise: 0.4,
  uDensity: 11,
  uContrast: 1,
  uSide: 1.6,
  uWingS: 3.3,
  uWingW: 0.45,
  uWingFade: 16,
  uWingStraight: 0,
  uWingA: 1.3,
  uGlow: 0.8,
  // finish
  uExpo: 0.36,
  uVig: 0.3,
  uGrain: 0.02,
  uFlipX: 0,
  uFlipY: 0,
  // colours ("Hero" preset)
  uBg: "#050807",
  uFiber: "#9AA34E",
  uLine: "#E8EE81",
  uWing: "#C9D46A",
  uHalo: "#173B2F",
};

export type LightBridgeOptions = {
  /** Uniform overrides on top of the Hero preset. */
  params?: Record<string, number | string>;
  /** Play the one-shot "rise" reveal when mounted (default: already lit). `"armed"` keeps
   *  the bridge dark until `rise()` is called on the handle. */
  reveal?: boolean | "armed";
  /** Render one still frame (prefers-reduced-motion). */
  still?: boolean;
  /** Cap on devicePixelRatio (default 1.5). */
  maxDpr?: number;
  onReady?: () => void;
};

export type LightBridgeHandle = {
  /** Pause/resume the render loop (offscreen / hidden tab). */
  setPlaying(playing: boolean): void;
  /** Start the rise reveal now (for `reveal: "armed"`). */
  rise(): void;
  destroy(): void;
};

const hex3 = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/** Mounts the shader on `canvas`. Returns null when WebGL is unavailable. */
export function mountLightBridge(canvas: HTMLCanvasElement, opts: LightBridgeOptions = {}): LightBridgeHandle | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, LIGHT_BRIDGE_FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const L = (k: string) => gl.getUniformLocation(prog, k);
  const params = { ...LIGHT_BRIDGE_HERO, ...(opts.params ?? {}) };
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") gl.uniform3fv(L(k), hex3(v));
    else gl.uniform1f(L(k), v);
  }
  const uRes = L("uRes");
  const uTime = L("uTime");
  const uRiseT = L("uRiseT");

  const maxDpr = opts.maxDpr ?? 1.5;
  let w = 0;
  let h = 0;
  const fit = () => {
    let d = Math.min(window.devicePixelRatio || 1, maxDpr);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    // pixel budget: the shader is per-fragment work, so cap the backing store (~1.8 MP)
    if (cw * ch * d * d > 1.8e6) d = Math.sqrt(1.8e6 / (cw * ch));
    const nw = Math.max(1, Math.round(cw * d));
    const nh = Math.max(1, Math.round(ch * d));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
    if (!playing) draw();
  };

  // Time runs only while playing, so pausing offscreen never jumps the flow.
  let time = opts.still ? 6.5 : 0;
  // reveal=true: rise from t=0; "armed": stay dark (riseT ≪ 0) until rise(); false: already lit
  let riseStart = opts.reveal === "armed" ? 1e4 : opts.reveal ? 0 : -1e4;
  if (opts.still) riseStart = -1e4;
  let playing = false;
  let raf = 0;
  let last = 0;
  let ready = false;

  const draw = () => {
    gl.uniform1f(uTime, time);
    gl.uniform1f(uRiseT, time - riseStart);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!ready) {
      ready = true;
      opts.onReady?.();
    }
  };
  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    draw();
    raf = requestAnimationFrame(loop);
  };

  const ro = new ResizeObserver(fit);
  ro.observe(canvas);
  fit();
  draw();

  const setPlaying = (p: boolean) => {
    if (opts.still) return;
    if (p === playing) return;
    playing = p;
    if (p) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(raf);
    }
  };

  return {
    setPlaying,
    rise() {
      if (riseStart === 1e4) {
        riseStart = time;
        if (!playing) draw();
      }
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
    },
  };
}
