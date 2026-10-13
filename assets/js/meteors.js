/* meteors.js — shooting stars across every page.
   Every ten right answers anywhere on the site (levels, quiz, test, dictation, typing),
   a star falls: drawn like a dry-brush ink stroke, on twos (twelve drawings a second),
   never a glowing light trail. Plain WebGL, no library; it only draws while a star is falling.
   Pages announce a right answer with  document.dispatchEvent(new CustomEvent('fl:correct')). */
(function () {
  const FL = window.FL;
  const EVERY = 10;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let gl, prog, cv, U = {};
  function setup() {
    cv = document.createElement('canvas');
    cv.className = 'meteor-sky';
    cv.setAttribute('aria-hidden', 'true');
    gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) return false;
    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
    const fs = `precision mediump float;
      uniform vec2 uRes; uniform vec2 uA; uniform vec2 uB; uniform float uFrame; uniform float uFade;
      float hash(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        vec2 p = gl_FragCoord.xy;
        vec2 ab = uB - uA; float L = length(ab);
        float k = clamp(dot(p - uA, ab) / max(L * L, 0.001), 0.0, 1.0);   // 0 at the tail, 1 at the head
        vec2 q = uA + ab * k;
        // the brush gets wider toward the head, with a slight wobble
        float wob = (hash(floor(k * 18.0) + uFrame * 7.0) - 0.5) * 1.2;
        float w = mix(0.6, 4.5, k * k) + wob;
        float d = distance(p, q);
        // dry brush: the stroke breaks up toward the tail, differently every drawing
        float dry = step(0.55 - k * 0.6, hash(floor(k * 46.0) * 3.1 + floor(d) * 1.7 + uFrame));
        float body = (1.0 - smoothstep(w - 0.8, w + 0.4, d)) * dry;
        float ink = smoothstep(w - 1.6, w - 0.4, d) * (1.0 - smoothstep(w + 0.2, w + 1.4, d)) * dry * smoothstep(0.35, 1.0, k);
        // the head: a small inked star-dot
        float hd = distance(p, uB);
        float head = 1.0 - smoothstep(4.5, 5.6, hd);
        float ring = smoothstep(3.6, 4.6, hd) * (1.0 - smoothstep(5.2, 6.4, hd));
        vec3 paper = vec3(0.965, 0.89, 0.64), inkc = vec3(0.17, 0.14, 0.21);
        float edge = max(ink, ring);
        float a = max(max(body * 0.85, head), edge * 0.9) * uFade;
        vec3 col = mix(paper, inkc, clamp(edge * 1.2, 0.0, 1.0));
        gl_FragColor = vec4(col, a);
      }`;
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uRes', 'uA', 'uB', 'uFrame', 'uFade'].forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    document.body.append(cv);
    return true;
  }

  let busy = false;
  FL.meteor = () => {
    if (busy || reduced()) return;
    if (!gl && !setup()) return;
    busy = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (cv.width = window.innerWidth * dpr), H = (cv.height = window.innerHeight * dpr);
    gl.viewport(0, 0, W, H);
    // from the upper right toward the lower left, across the sky above the horizon
    const x0 = W * (0.55 + Math.random() * 0.4), y0 = H * (0.75 + Math.random() * 0.2);
    const len = W * (0.22 + Math.random() * 0.12), ang = Math.PI + 0.35 + Math.random() * 0.3;
    const frames = 12, tail = 0.45;
    let f = 1;
    const draw = () => {
      const k = f / frames;
      const head = Math.min(1, k * 1.25), back = Math.max(0, k * 1.25 - tail);
      const hx = x0 + Math.cos(ang) * len * head, hy = y0 + Math.sin(ang) * len * head;
      const tx = x0 + Math.cos(ang) * len * back, ty = y0 + Math.sin(ang) * len * back;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uA, tx, ty);
      gl.uniform2f(U.uB, hx, hy);
      gl.uniform1f(U.uFrame, f);
      gl.uniform1f(U.uFade, k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (++f <= frames) setTimeout(draw, 1000 / 12); // on twos
      else { gl.clear(gl.COLOR_BUFFER_BIT); busy = false; }
    };
    draw();
  };

  document.addEventListener('fl:correct', () => {
    const n = (FL.store.get('meteor:n', 0) || 0) + 1;
    FL.store.set('meteor:n', n);
    if (n % EVERY === 0) FL.meteor();
  });
  FL.correct = () => document.dispatchEvent(new CustomEvent('fl:correct'));
})();
