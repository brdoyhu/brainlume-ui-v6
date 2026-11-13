/* Gradient Waves shader adapted from React Bits by David Haz (2026).
 * https://github.com/DavidHDev/react-bits/tree/main/src/content/Backgrounds/GradientWaves
 * MIT + Commons Clause; see assets/vendor/react-bits/LICENSE.md.
 * Brainlume: non-React lifecycle, no pointer effects, bounded mobile rendering.
 */
(()=>{
const ROOT = 'gradient-waves-container';
const CANVAS = 'gradient-waves-canvas';

const MAX_SWELLS = 4;
const SWELL_SECONDS = 3.2;
const SWELL_GAIN = 2.8;
const SWELL_WIDTH = 8;
const INTRO_SECONDS = 2.6;
const CAMERA_HEIGHT = 30;
const QUALITY = { low: 56, medium: 84, high: 120 };

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uClock;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uHeight;
uniform float uTilt;
uniform float uZoom;
uniform vec2 uLook;
uniform float uFogDepth;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform vec3 uHorizon;
uniform vec3 uWave;
uniform vec3 uCrest;
uniform vec3 uBackground;
uniform float uOpaque;
uniform float uLight;
uniform vec3 uSun;
uniform float uRelief;
uniform float uSheen;
uniform float uSteps;
uniform float uStride;
uniform vec3 uIntro;
uniform vec3 uSwells[${MAX_SWELLS}];
uniform float uSwellWidth;
out vec4 outColor;

const float FAR = 4000.0;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 surface(vec2 xy) {
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(uTime / 0.130, uTime / 0.810, uTime / 0.200, uTime / 0.710);
  float a = xy.x + tc.x;
  float swellPhase = (xy.y + a) / 20.0 + tc.y;
  float bend = uSwell * cos(swellPhase) / 20.0;
  float mx = a + uSwell * sin(swellPhase);
  float crossPhase = xy.x / 23.0 + tc.w;
  float my = xy.y - tc.z + uTurbulence * cos(crossPhase);
  float twist = -uTurbulence * sin(crossPhase) / 23.0;
  float cx = cos(mx * freq.x);
  float cy = cos(my * freq.y);
  float rise = 1.0;
  if (uIntro.z > 0.0) rise = mix(1.0, smoothstep(uIntro.y * 0.45, uIntro.y * 1.6, xy.x), uIntro.z);
  float amp = uAmplitude * rise;
  float h = (sin(mx * freq.x) + sin(my * freq.y)) * amp + uHeight;
  float dx = amp * (freq.x * cx * (1.0 + bend) + freq.y * cy * twist);
  float dy = amp * (freq.x * cx * bend + freq.y * cy);
  for (int k = 0; k < ${MAX_SWELLS}; k++) {
    vec3 sw = uSwells[k];
    if (sw.z <= 0.0) continue;
    float u = (xy.x - sw.x) / uSwellWidth;
    float v = (xy.y - sw.y) / (uSwellWidth * 3.5);
    float bump = sw.z * exp(-u * u - v * v);
    h += bump;
    dx += bump * (-2.0 * u / uSwellWidth);
    dy += bump * (-2.0 * v / (uSwellWidth * 3.5));
  }
  return vec3(h, dx, dy);
}

float march(vec3 origin, vec3 dir) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float gap = origin.z + dist * dir.z - surface(origin.xy + dist * dir.xy).x;
    if (abs(gap) < 0.002 * dist + 0.01) break;
    dist += uStride * gap;
    if (!(abs(dist) < FAR)) return FAR;
  }
  return dist;
}

void main() {
  float c;
  float s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, ${CAMERA_HEIGHT.toFixed(1)});
  vec2 uv = gl_FragCoord.xy / uResolution - 0.5;
  uv.x *= uResolution.x / uResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot);
  s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  dir = mat3(nuv.x, -nuv.y, 0.0, nuv.y, nuv.x, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt + uLook.y);
  s = sin(uTilt + uLook.y);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
  c = cos(uLook.x);
  s = sin(uLook.x);
  dir = mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0) * dir;

  float dist = march(cam, dir);
  vec3 pos = cam + dist * dir;
  vec3 field = surface(pos.xy);
  vec3 view = -dir;

  float crest = clamp((field.x - uHeight) / max(2.0 * uAmplitude, 0.001) * 0.5 + 0.5, 0.0, 1.0);
  vec3 body = mix(uWave, uCrest, smoothstep(0.45, 1.0, crest) * 0.5);
  vec3 normal = normalize(vec3(-field.yz * (1.0 + 1.5 * uRelief), 1.0));
  float diffuse = clamp(dot(normal, uSun) * 0.5 + 0.5, 0.0, 1.0);
  float lightness = mix(1.0, diffuse * diffuse * (3.0 - 2.0 * diffuse), uRelief);
  float sheen = pow(clamp(dot(normal, normalize(uSun + view)), 0.0, 1.0), 14.0) * uSheen * (0.4 + 0.6 * uRelief);
  float rim = pow(1.0 - clamp(dot(normal, view), 0.0, 1.0), 3.0);

  vec3 col;
  float alpha;
  float haze = 1.0 - exp(-dist / (uFogDepth * 5.0));
  float fade = 1.0 - smoothstep(0.35, 1.0, haze);
  if (uLight < 0.5) {
    vec3 lit = mix(uHorizon * 0.18, body, lightness) + uCrest * sheen;
    lit = mix(lit, uHorizon, rim * 0.15 * uRelief);
    col = mix(lit, uHorizon, smoothstep(0.0, 1.0, haze)) * 0.85 * uBrightness;
    alpha = fade;
  } else {
    vec3 hue = mix(uHorizon, body, 0.35 + 0.65 * lightness);
    float density = mix(0.16, 0.9, 1.0 - lightness);
    density *= 1.0 - clamp(sheen, 0.0, 1.0) * 0.85;
    density *= 1.0 - 0.5 * smoothstep(0.0, 1.0, haze);
    col = hue;
    alpha = fade * clamp(density * uBrightness, 0.0, 1.0);
  }

  float reveal = uIntro.x;
  col = clamp(col, 0.0, 1.0);
  float grain = (hash(gl_FragCoord.xy + fract(uClock) * 64.0) - 0.5) * uGrain;
  alpha = clamp(alpha * (1.0 + grain), 0.0, 1.0) * reveal * uOpacity;
  if (uOpaque > 0.5) {
    outColor = vec4(mix(uBackground, col, alpha), 1.0);
  } else {
    outColor = vec4(col * alpha, alpha);
  }
}`;

let active=null;
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function create(host){
 const canvas=document.createElement('canvas');canvas.className=CANVAS;canvas.setAttribute('aria-hidden','true');host.append(canvas);
 let gl;try{gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'})}catch{}
 if(!gl){canvas.remove();host.dataset.renderer='fallback';return {host,cleanup(){}}}
 const compile=(type,text)=>{const sh=gl.createShader(type);if(!sh)return null;gl.shaderSource(sh,text);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){gl.deleteShader(sh);return null}return sh};
 const vertex=compile(gl.VERTEX_SHADER,VERTEX),fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT);
 const program=gl.createProgram();if(!vertex||!fragment||!program){if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);if(program)gl.deleteProgram(program);canvas.remove();host.dataset.renderer='fallback';return {host,cleanup(){}}}
 gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.bindAttribLocation(program,0,'aPosition');gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);canvas.remove();host.dataset.renderer='fallback';return {host,cleanup(){}}}
 const buffer=gl.createBuffer(),vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.useProgram(program);
 const names=['uResolution','uTime','uClock','uAmplitude','uWaveScale','uWaveRatio','uSwell','uTurbulence','uHeight','uTilt','uZoom','uLook','uFogDepth','uBrightness','uOpacity','uGrain','uHorizon','uWave','uCrest','uBackground','uOpaque','uLight','uSun','uRelief','uSheen','uSteps','uStride','uIntro','uSwells','uSwellWidth'];
 const u=Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const light=document.documentElement.dataset.theme!=='dark'&&!host.hasAttribute('data-photo-backdrop');
 const settings={waveColor:light?'#8F78BA':'#8C80E8',amplitude:2.2,swell:30,lightAngle:120,speed:.22};
 const palette=light?{horizon:'#C8B8EA',crest:'#FFF9FF',background:'#F0ECFA'}:{horizon:'#283A70',crest:'#D6C8FF',background:'#152440'};
 let raf=0,time=0,last=0,lastDraw=0,visible=true,destroyed=false,lost=false;
 const f=(name,value)=>gl.uniform1f(u[name],value);
 function draw(){
  if(destroyed||lost||!host.isConnected)return;
  // One device pixel per CSS pixel, 56 ray steps: bounded work on mobile and galleries.
  const width=Math.max(1,Math.round(host.clientWidth)),height=Math.max(1,Math.round(host.clientHeight));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  gl.viewport(0,0,width,height);gl.useProgram(program);gl.bindVertexArray(vao);gl.uniform2f(u.uResolution,width,height);
  f('uTime',time);f('uClock',0);f('uAmplitude',settings.amplitude);f('uWaveScale',.6);f('uWaveRatio',.9);f('uSwell',settings.swell);f('uTurbulence',20);f('uHeight',5.5);f('uTilt',64*Math.PI/180);f('uZoom',1);gl.uniform2f(u.uLook,0,0);f('uFogDepth',15);f('uBrightness',light?.85:1.25);f('uOpacity',.9);f('uGrain',.025);
  gl.uniform3fv(u.uHorizon,rgb(palette.horizon));gl.uniform3fv(u.uWave,rgb(settings.waveColor));gl.uniform3fv(u.uCrest,rgb(palette.crest));gl.uniform3fv(u.uBackground,rgb(palette.background));f('uOpaque',1);f('uLight',light?1:0);
  const angle=settings.lightAngle*Math.PI/180;gl.uniform3f(u.uSun,Math.cos(.52)*Math.cos(angle),Math.cos(.52)*Math.sin(angle),Math.sin(.52));f('uRelief',.8);f('uSheen',.28);f('uSteps',56);
  const slope=settings.amplitude*((.6/7)*(1+Math.abs(settings.swell)/20)+((.6*.9)/3)*(1+20/23));f('uStride',.9/Math.max(1,slope/1.5));gl.uniform3f(u.uIntro,1,3,0);gl.uniform3fv(u.uSwells,new Float32Array(MAX_SWELLS*3));f('uSwellWidth',SWELL_WIDTH);gl.drawArrays(gl.TRIANGLES,0,3);
  host.dataset.renderer='webgl2';host.dataset.motion=reduced.matches?'static':'animated';
 }
 function tick(now){raf=0;if(destroyed||lost||!visible||document.hidden||reduced.matches)return;if(!last)last=now;if(now-lastDraw>=1000/24){time+=Math.min((now-last)/1000,.1)*settings.speed;last=now;lastDraw=now;draw()}raf=requestAnimationFrame(tick)}
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
 function wake(){if(destroyed||lost)return;stop();if(!visible||document.hidden)return;draw();if(!reduced.matches)raf=requestAnimationFrame(tick)}
 const size=new ResizeObserver(wake);size.observe(host);
 const intersection=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);wake()});intersection.observe(host);
 const onLost=e=>{e.preventDefault();lost=true;stop();host.dataset.renderer='fallback';canvas.style.display='none'};
 canvas.addEventListener('webglcontextlost',onLost);document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);wake();
 return {host,cleanup(){destroyed=true;stop();size.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',wake);reduced.removeEventListener('change',wake);canvas.removeEventListener('webglcontextlost',onLost);if(!lost){gl.deleteBuffer(buffer);gl.deleteVertexArray(vao);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}canvas.remove()}};
}
window.BLGradientWaves={sync(){const host=document.querySelector('[data-gradient-waves]');if(active?.host===host)return;active?.cleanup();active=host?create(host):null}};
})();
