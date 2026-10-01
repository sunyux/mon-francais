/* planet.js — each topic is a little world (un petit monde), drawn in ink and watercolor.
   ES module (needs the "three" import map). Exposes FL.Planet once loaded:

   FL.Planet.single(el, world, opts)   one planet floating above a book page
   FL.Planet.universe(el, worlds, opts) the night sky of the home page

   A world is data (see topics/index.js):
   { id, fr, zh, en, ground, shade, props: [[type, lat, lon, scale?], …] } */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const FL = window.FL;
const DEG = Math.PI / 180;
const INK = new THREE.Color('#2b2436');
const UP = new THREE.Vector3(0, 1, 0);

/* ---------- ink & watercolor materials ---------- */
const NOISE = `
  float hash(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }`;

const LIGHT = new THREE.Vector3(-0.55, 0.75, 0.6).normalize();
const matCache = new Map();
// a wash: uneven pigment, darker where it pools at the rim, paper grain on top
function wash(color, shadow, scale = 2.6) {
  const key = `${color}|${shadow}|${scale}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uShadow: { value: new THREE.Color(shadow) },
      uLight: { value: LIGHT },
      uScale: { value: scale },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vVN; varying vec3 vP;
      void main(){
        vN = normalize(mat3(modelMatrix) * normal);
        vVN = normalize(normalMatrix * normal);
        vP = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: NOISE + `
      uniform vec3 uColor; uniform vec3 uShadow; uniform vec3 uLight; uniform float uScale;
      varying vec3 vN; varying vec3 vVN; varying vec3 vP;
      void main(){
        float l = dot(normalize(vN), uLight) * 0.5 + 0.5;
        float n = fbm(vP * uScale);
        float w = smoothstep(0.22, 0.78, l + (n - 0.5) * 0.5);
        vec3 col = mix(uShadow, uColor, w);
        float rim = 1.0 - abs(normalize(vVN).z);
        col = mix(col, uShadow * 0.82, smoothstep(0.5, 1.0, rim) * 0.5);
        col *= 0.94 + 0.06 * noise(vP * 46.0);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  matCache.set(key, m);
  return m;
}
// ink outline: the back faces, pushed out along the normal
const hullCache = new Map();
function hullMat(t) {
  if (hullCache.has(t)) return hullCache.get(t);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uT: { value: t }, uInk: { value: INK } },
    vertexShader: `uniform float uT; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * uT, 1.0); }`,
    fragmentShader: `uniform vec3 uInk;
      void main(){
        gl_FragColor = vec4(uInk, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  hullCache.set(t, m);
  return m;
}
function inked(geo, color, shadow, t = 0.012, scale) {
  const mesh = new THREE.Mesh(geo, wash(color, shadow, scale));
  mesh.add(new THREE.Mesh(geo, hullMat(t)));
  return mesh;
}
function glow(color = '#ffd27a', size = 0.22) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, color); grad.addColorStop(0.35, color + '88'); grad.addColorStop(1, color + '00');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  s.scale.setScalar(size);
  return s;
}

/* ---------- the clock face, drawn live on a canvas ---------- */
const clockFaces = new Set();
function clockFace(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const face = { c, tex, last: -1 };
  clockFaces.add(face);
  drawClock(face, true);
  return tex;
}
function drawClock(face, force) {
  const now = new Date();
  const s = now.getSeconds();
  if (!force && s === face.last) return;
  face.last = s;
  const g = face.c.getContext('2d'), R = face.c.width / 2;
  g.clearRect(0, 0, R * 2, R * 2);
  g.fillStyle = '#f7efdc'; g.beginPath(); g.arc(R, R, R * 0.96, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2b2436'; g.lineWidth = R * 0.05; g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    g.lineWidth = R * (i % 3 ? 0.03 : 0.06);
    g.beginPath(); g.moveTo(R + Math.sin(a) * R * 0.72, R - Math.cos(a) * R * 0.72); g.lineTo(R + Math.sin(a) * R * 0.86, R - Math.cos(a) * R * 0.86); g.stroke();
  }
  const hand = (ang, len, w, col) => {
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
    g.beginPath(); g.moveTo(R, R); g.lineTo(R + Math.sin(ang) * len, R - Math.cos(ang) * len); g.stroke();
  };
  const h = now.getHours() % 12, m = now.getMinutes();
  hand((h + m / 60) * Math.PI / 6, R * 0.45, R * 0.09, '#2b2436');
  hand((m + s / 60) * Math.PI / 30, R * 0.7, R * 0.055, '#2b2436');
  hand(s * Math.PI / 30, R * 0.78, R * 0.02, '#b04a3c');
  g.fillStyle = '#b04a3c'; g.beginPath(); g.arc(R, R, R * 0.05, 0, Math.PI * 2); g.fill();
  face.tex.needsUpdate = true;
}

/* ---------- props: each one stands on +Y from its base ---------- */
const PROPS = {
  clocktower() {
    const t = new THREE.Group();
    const body = inked(new THREE.CylinderGeometry(0.1, 0.13, 0.64, 14), '#ecd9b0', '#a88a5c');
    body.position.y = 0.32; t.add(body);
    const roof = inked(new THREE.ConeGeometry(0.17, 0.24, 14), '#c8594b', '#7e3431');
    roof.position.y = 0.76; t.add(roof);
    const tex = clockFace();
    [1, -1].forEach(side => {
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.085, 32), new THREE.MeshBasicMaterial({ map: tex }));
      d.position.set(0, 0.52, 0.117 * side);
      if (side < 0) d.rotation.y = Math.PI;
      t.add(d);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.008, 6, 32), new THREE.MeshBasicMaterial({ color: INK }));
      ring.position.copy(d.position);
      t.add(ring);
    });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.1), new THREE.MeshBasicMaterial({ color: '#3a2e44' }));
    door.position.set(0, 0.05, 0.128); t.add(door);
    t.userData.say = 'time';
    return t;
  },
  keeper() {
    const k = new THREE.Group();
    const coat = inked(new THREE.ConeGeometry(0.075, 0.23, 14), '#5b7fb5', '#2f4a78');
    coat.position.y = 0.115; k.add(coat);
    const head = inked(new THREE.SphereGeometry(0.045, 16, 12), '#f3dcc0', '#c9a384');
    head.position.y = 0.27; k.add(head);
    const brim = inked(new THREE.CylinderGeometry(0.062, 0.062, 0.008, 16), '#3a3350', '#1e1a2b', 0.006);
    brim.position.y = 0.3; k.add(brim);
    const hat = inked(new THREE.CylinderGeometry(0.036, 0.04, 0.08, 14), '#3a3350', '#1e1a2b', 0.006);
    hat.position.y = 0.344; k.add(hat);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd98a' }));
    lantern.position.set(0.085, 0.1, 0.02); k.add(lantern);
    const l = glow('#ffcf70', 0.2); l.position.copy(lantern.position); k.add(l);
    k.userData.say = 'keeper';
    return k;
  },
  lamp() {
    const g = new THREE.Group();
    const pole = inked(new THREE.CylinderGeometry(0.011, 0.016, 0.36, 8), '#4a4058', '#2b2436', 0.005);
    pole.position.y = 0.18; g.add(pole);
    const cage = inked(new THREE.CylinderGeometry(0.035, 0.025, 0.06, 6), '#4a4058', '#2b2436', 0.005);
    cage.position.y = 0.39; g.add(cage);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe3a0' }));
    flame.position.y = 0.39; g.add(flame);
    const l = glow('#ffcf70', 0.34); l.position.y = 0.39; g.add(l);
    return g;
  },
  grass() {
    const g = new THREE.Group();
    [[-0.03, 0.05, 0], [0.02, 0.07, 0.3], [0.05, 0.045, -0.3]].forEach(([x, h, r]) => {
      const b = inked(new THREE.ConeGeometry(0.012, h, 5), '#8fae7a', '#4f6f47', 0.004);
      b.position.set(x, h / 2, 0); b.rotation.z = r; g.add(b);
    });
    return g;
  },
  flower() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4), new THREE.MeshBasicMaterial({ color: '#4f6f47' }));
    stem.position.y = 0.04; g.add(stem);
    const bloom = inked(new THREE.SphereGeometry(0.02, 10, 8), '#e9a3a0', '#b0605e', 0.005);
    bloom.position.y = 0.09; g.add(bloom);
    return g;
  },
  house() {
    const h = new THREE.Group();
    const walls = inked(new THREE.BoxGeometry(0.2, 0.16, 0.18), '#f0e2c4', '#b39a6e');
    walls.position.y = 0.08; h.add(walls);
    const roof = inked(new THREE.ConeGeometry(0.17, 0.14, 4), '#c8594b', '#7e3431');
    roof.position.y = 0.23; roof.rotation.y = Math.PI / 4; h.add(roof);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshBasicMaterial({ color: '#ffd98a' }));
    win.position.set(0, 0.09, 0.091); h.add(win);
    return h;
  },
  tree() {
    const t = new THREE.Group();
    const trunk = inked(new THREE.CylinderGeometry(0.018, 0.028, 0.18, 8), '#8a6a4a', '#4f3a28', 0.006);
    trunk.position.y = 0.09; t.add(trunk);
    const crown = inked(new THREE.IcosahedronGeometry(0.12, 1), '#8fae7a', '#4f6f47');
    crown.position.y = 0.25; t.add(crown);
    [[0.07, 0.25, 0.06], [-0.05, 0.3, 0.07], [0.02, 0.2, 0.1]].forEach(p => {
      const f = inked(new THREE.SphereGeometry(0.022, 8, 6), '#d9594b', '#8a3330', 0.004);
      f.position.set(...p); t.add(f);
    });
    return t;
  },
  steps() {
    const s = new THREE.Group();
    const cols = [['#e9c46a', '#a88532'], ['#8fb3d9', '#4f7299'], ['#e9a3a0', '#b0605e']];
    for (let i = 0; i < 5; i++) {
      const [c, d] = cols[i % 3];
      const b = inked(new THREE.BoxGeometry(0.09, 0.07 * (i + 1), 0.09), c, d, 0.006);
      b.position.set(-0.18 + i * 0.09, 0.035 * (i + 1), 0); s.add(b);
    }
    return s;
  },
  telescope() {
    const g = new THREE.Group();
    [0, 2.1, 4.2].forEach(a => {
      const leg = inked(new THREE.CylinderGeometry(0.008, 0.01, 0.26, 6), '#8a6a4a', '#4f3a28', 0.004);
      leg.position.set(Math.cos(a) * 0.05, 0.12, Math.sin(a) * 0.05);
      leg.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
      g.add(leg);
    });
    const tube = inked(new THREE.CylinderGeometry(0.032, 0.05, 0.34, 14), '#e3c77e', '#9a7a3a');
    tube.position.set(0.04, 0.3, 0); tube.rotation.z = -0.9; g.add(tube);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), new THREE.MeshBasicMaterial({ color: '#cfe0f5' }));
    lens.position.set(0.18, 0.4, 0); lens.rotation.y = Math.PI / 2; lens.rotation.x = 0.9; g.add(lens);
    g.userData.say = 'live';
    return g;
  },
  desk() {
    const g = new THREE.Group();
    const top = inked(new THREE.BoxGeometry(0.2, 0.02, 0.12), '#a8825a', '#6a4f33', 0.006);
    top.position.y = 0.12; g.add(top);
    [[-0.085, -0.045], [0.085, -0.045], [-0.085, 0.045], [0.085, 0.045]].forEach(([x, z]) => {
      const leg = inked(new THREE.BoxGeometry(0.014, 0.12, 0.014), '#a8825a', '#6a4f33', 0.004);
      leg.position.set(x, 0.06, z); g.add(leg);
    });
    [-1, 1].forEach(s => {
      const page = inked(new THREE.BoxGeometry(0.075, 0.006, 0.09), '#fbf6ea', '#d8ccb2', 0.004);
      page.position.set(s * 0.04, 0.136, 0); page.rotation.z = s * -0.12; g.add(page);
    });
    const ink = inked(new THREE.CylinderGeometry(0.012, 0.014, 0.025, 8), '#2b2436', '#14111c', 0.004);
    ink.position.set(0.08, 0.142, 0.035); g.add(ink);
    g.userData.say = 'live';
    return g;
  },
  counter() {
    const k = new THREE.Group();
    const coat = inked(new THREE.ConeGeometry(0.075, 0.24, 14), '#6f9a86', '#3f6150');
    coat.position.y = 0.12; k.add(coat);
    const head = inked(new THREE.SphereGeometry(0.045, 16, 12), '#f3dcc0', '#c9a384');
    head.position.y = 0.28; k.add(head);
    const hair = inked(new THREE.SphereGeometry(0.047, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), '#5a3d2b', '#2f1f15', 0.005);
    hair.position.y = 0.29; k.add(hair);
    const beret = inked(new THREE.CylinderGeometry(0.06, 0.055, 0.02, 16), '#b5503f', '#7a3229', 0.005);
    beret.position.set(0.01, 0.33, 0); beret.rotation.z = -0.25; k.add(beret);
    const book = inked(new THREE.BoxGeometry(0.05, 0.065, 0.012), '#3e5a8a', '#24365a', 0.004);
    book.position.set(0.07, 0.15, 0.03); book.rotation.y = -0.4; k.add(book);
    k.userData.say = 'keeper';
    return k;
  },
  starfloat() {
    const g = new THREE.Group();
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.26, 4), new THREE.MeshBasicMaterial({ color: '#8a7f9a' }));
    stalk.position.y = 0.13; g.add(stalk);
    const star = inked(new THREE.OctahedronGeometry(0.035, 0), '#f6e3a3', '#c9a24a', 0.005);
    star.position.y = 0.28; star.rotation.y = 0.6; g.add(star);
    const l = glow('#ffe8a8', 0.2); l.position.y = 0.28; g.add(l);
    g.userData.say = 'live';
    return g;
  },
  sign() {
    const g = new THREE.Group();
    const post = inked(new THREE.CylinderGeometry(0.01, 0.012, 0.26, 6), '#8a6a4a', '#4f3a28', 0.005);
    post.position.y = 0.13; g.add(post);
    [[0.22, 0.25], [0.16, -0.3]].forEach(([y, r]) => {
      const b = inked(new THREE.BoxGeometry(0.14, 0.035, 0.01), '#f0e2c4', '#b39a6e', 0.005);
      b.position.set(0.04, y, 0); b.rotation.y = r; g.add(b);
    });
    return g;
  },
};

/* ---------- a world ---------- */
function noiseSphere(r, detail) {
  // shared vertices, so the wash shades smoothly instead of in facets
  let geo = new THREE.IcosahedronGeometry(r, detail);
  geo.deleteAttribute('normal'); geo.deleteAttribute('uv');
  geo = mergeVertices(geo);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 5.1) * Math.cos(v.y * 4.3) * Math.sin(v.z * 3.7);
    v.multiplyScalar(1 + n * 0.018);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
function buildWorld(world, detail = 5) {
  const planet = new THREE.Group();
  const ball = inked(noiseSphere(1, detail), world.ground, world.shade, 0.022, 1.6);
  ball.userData.ball = true;
  planet.add(ball);
  (world.props || []).forEach(([type, lat, lon, s = 1]) => {
    if (!PROPS[type]) return;
    const obj = PROPS[type]();
    const phi = (90 - lat) * DEG, th = lon * DEG;
    const n = new THREE.Vector3(Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th));
    obj.position.copy(n).multiplyScalar(0.985);
    obj.quaternion.setFromUnitVectors(UP, n);
    obj.scale.setScalar(s);
    planet.add(obj);
  });
  planet.rotation.x = 0.28;
  return planet;
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch (e) { return false; }
}
function makeRenderer(el) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.setClearColor(0x000000, 0);
  r.domElement.className = 'planet-canvas';
  el.appendChild(r.domElement);
  return r;
}
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- one planet above a page ---------- */
function single(el, world, { onPick } = {}) {
  if (!hasWebGL()) return null;
  const renderer = makeRenderer(el);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.35, 6.2);
  camera.lookAt(0, 0.25, 0);
  const planet = buildWorld(world);
  planet.position.y = 0.05;
  scene.add(planet);

  const size = () => {
    const w = el.clientWidth || 300, h = el.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // back the camera off until the whole world (planet + tower ≈ 1.8 tall, 1.45 wide) fits either way
    const tan = Math.tan((camera.fov / 2) * DEG);
    const d = Math.max(1.85 / tan, 1.5 / (tan * camera.aspect));
    camera.position.set(0, 0.35, d);
    camera.lookAt(0, 0.25, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(size).observe(el);
  size();

  // drag to turn the little world; it keeps drifting on its own
  let vel = 0.18, dragging = false, lastX = 0, lastT = 0, spinX = 0;
  const cv = renderer.domElement;
  cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; cv.setPointerCapture(e.pointerId); lastT = performance.now(); });
  cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    planet.rotation.y += dx * 0.01;
    const now = performance.now(); vel = (dx * 0.01) / Math.max(1, now - lastT) * 1000; lastT = now;
    spinX = e.movementY ? THREE.MathUtils.clamp(spinX + e.movementY * 0.003, -0.25, 0.4) : spinX;
  });
  const up = () => { dragging = false; };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);

  // click a prop (clock tower, keeper) to hear it
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let downAt = 0;
  cv.addEventListener('pointerdown', () => { downAt = performance.now(); });
  cv.addEventListener('click', e => {
    if (performance.now() - downAt > 250 || !onPick) return;
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(planet, true)[0];
    let o = hit && hit.object;
    while (o && !o.userData.say && o !== planet) o = o.parent;
    onPick(o && o.userData.say ? o.userData.say : hit ? 'planet' : null);
  });

  let raf = 0, t0 = performance.now();
  const loop = now => {
    raf = 0;
    if (!el.isConnected) return; // the page was turned away; resume() restarts
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    if (!dragging) { vel += (0.18 - vel) * dt * 1.5; planet.rotation.y += vel * dt; }
    planet.rotation.x += (0.28 + spinX - planet.rotation.x) * dt * 3;
    planet.position.y = 0.05 + Math.sin(now / 1400) * 0.03;
    clockFaces.forEach(f => drawClock(f));
    renderer.render(scene, camera);
    if (!reduced()) raf = requestAnimationFrame(loop);
  };
  const resume = () => { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(loop); } };
  resume();
  el.classList.add('has-planet');
  return { resume };
}

/* ---------- the home sky: every topic is a little world ---------- */
function universe(el, worlds, { onOpen, labelsEl } = {}) {
  if (!hasWebGL()) return null;
  const renderer = makeRenderer(el);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  // hand-scattered stars
  const starGeo = new THREE.BufferGeometry();
  const pts = [];
  for (let i = 0; i < 260; i++) pts.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 24, -6 - Math.random() * 10);
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const starTex = glow('#fff1c8', 1).material.map;
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.22, map: starTex, transparent: true, depthWrite: false, opacity: 0.9 }));
  scene.add(stars);

  // the worlds sit on a gentle arc; the first (ready) one is the largest
  const items = worlds.map((w, i) => {
    const planet = buildWorld(w, w.ready ? 5 : 3);
    // the first world is the large one in the middle; other open worlds are a little bigger than the 'bientôt' ones
    const s = i === 0 ? 1.55 : w.ready ? 0.92 : 0.62 + (i % 2) * 0.12;
    planet.scale.setScalar(s);
    scene.add(planet);
    planet.userData.s = s;
    return { w, planet, s0: s, get s() { return planet.userData.s; }, base: new THREE.Vector3(), phase: i * 1.7, hover: 0 };
  });
  function layout() {
    const wide = camera.aspect > 1.1;
    // visible half-width at the planets' depth, so positions scale with the window
    const halfW = Math.tan((camera.fov / 2) * DEG) * camera.position.z * camera.aspect;
    items.forEach((it, i) => {
      // the ready world sits right of centre, clear of the intro text; the others line up further right
      if (i === 0) it.base.set(wide ? halfW * 0.12 : 0, wide ? -0.7 : -0.6, 0);
      else {
        const k = i - 1, n = items.length - 1;
        it.base.set(
          wide ? halfW * (0.56 + (k % 2) * 0.24) : -halfW * 0.72 + k * ((halfW * 1.44) / Math.max(1, n - 1)),
          wide ? 2.4 - k * 1.45 : -3.9,
          0);
      }
      // on a narrow screen the small worlds shrink to fit one row
      it.planet.userData.s = !wide && i > 0 ? 0.42 : it.s0;
      it.planet.position.copy(it.base);
    });
  }
  const size = () => {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.8 ? 19 : 14;
    camera.updateProjectionMatrix();
    layout();
  };
  new ResizeObserver(size).observe(el);
  size();

  // HTML labels follow their planets (they are also the keyboard/screen-reader way in)
  const labels = labelsEl ? [...labelsEl.querySelectorAll('[data-world]')] : [];
  const v = new THREE.Vector3();
  function placeLabels() {
    items.forEach(it => {
      const lab = labels.find(l => l.dataset.world === it.w.id);
      if (!lab) return;
      v.copy(it.planet.position); v.y -= it.s * 1.12;
      v.project(camera);
      // keep the caption on screen, even for worlds near the edge
      const W = el.clientWidth, half = (lab.offsetWidth || 0) / 2 + 8;
      const x = Math.min(W - half, Math.max(half, (v.x * 0.5 + 0.5) * W));
      lab.style.transform = `translate(-50%, 0) translate(${x}px, ${(-v.y * 0.5 + 0.5) * el.clientHeight}px)`;
    });
  }

  // hover and click via raycasting against the planets
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(-9, -9);
  let hovered = null, flying = null;
  const pick = e => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(items.map(i => i.planet), true)[0];
    if (!hit) return null;
    return items.find(it => { let o = hit.object; while (o) { if (o === it.planet) return true; o = o.parent; } return false; });
  };
  const setHover = it => {
    if (hovered === it) return;
    hovered = it;
    renderer.domElement.style.cursor = it ? 'pointer' : '';
    labels.forEach(l => l.classList.toggle('near', !!it && l.dataset.world === it.w.id));
  };
  renderer.domElement.addEventListener('pointermove', e => setHover(pick(e)));
  renderer.domElement.addEventListener('pointerleave', () => setHover(null));
  renderer.domElement.addEventListener('click', e => { const it = pick(e); if (it) open(it.w.id); });
  let mx = 0, my = 0;
  window.addEventListener('pointermove', e => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; }, { passive: true });

  // opening a ready world: the camera drifts toward it, then the book opens
  function open(id) {
    const it = items.find(x => x.w.id === id);
    if (!it) return;
    if (!it.w.ready) {
      const lab = labels.find(l => l.dataset.world === id);
      if (lab) { lab.classList.remove('nudge'); void lab.offsetWidth; lab.classList.add('nudge'); }
      return;
    }
    if (flying) return;
    flying = { it, t: 0, from: camera.position.clone() };
    if (reduced()) onOpen && onOpen(it.w);
  }

  let t0 = performance.now();
  const loop = now => {
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    const tt = now / 1000;
    items.forEach(it => {
      it.hover += ((hovered === it ? 1 : 0) - it.hover) * dt * 6;
      it.planet.rotation.y += dt * (it.w.ready ? 0.16 : 0.1) * (1 + it.hover * 1.5);
      it.planet.position.y = it.base.y + Math.sin(tt * 0.6 + it.phase) * 0.08;
      it.planet.scale.setScalar(it.s * (1 + it.hover * 0.05));
    });
    stars.material.opacity = 0.75 + Math.sin(tt * 1.3) * 0.15;
    if (flying) {
      flying.t = Math.min(1, flying.t + dt * 0.9);
      const e = flying.t * flying.t * (3 - 2 * flying.t);
      const target = flying.it.planet.position.clone().add(new THREE.Vector3(0, 0.1, flying.it.s * 3.2));
      camera.position.lerpVectors(flying.from, target, e);
      camera.lookAt(flying.it.planet.position.x * e, flying.it.planet.position.y * e, 0);
      el.style.setProperty('--fade', e);
      if (flying.t >= 1 && onOpen) { const w = flying.it.w; flying = null; onOpen(w); }
    } else {
      camera.position.x += (mx * 0.8 - camera.position.x) * dt * 2;
      camera.position.y += (-my * 0.5 - camera.position.y) * dt * 2;
      camera.lookAt(0, 0, 0);
    }
    clockFaces.forEach(f => drawClock(f));
    renderer.render(scene, camera);
    placeLabels();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  el.classList.add('has-planet');
  return { open };
}

FL.Planet = { single, universe };
(FL._planetWaiters || []).splice(0).forEach(fn => fn(FL.Planet));
