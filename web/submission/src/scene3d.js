/* The hero figure.
 *
 * Thirty devices arranged as a helix and stacked cumulatively, so the length of
 * the coil IS the site load. A translucent disc is the cap. When demand exceeds
 * it the coil pushes through the disc and runs hot.
 *
 * The coil compresses about its own centre rather than collapsing toward its
 * base: the whole stack is offset by half the total, so shedding load reads as
 * a spring being squeezed rather than a bar shrinking. The cap disc is offset
 * by exactly the same amount, so "top of coil above the disc" still means
 * "over cap" — the measurement is unchanged, only the framing.
 *
 * It is the logo — one wire, coiled — drawn out of live numbers.
 */
(() => {
  "use strict";

  const host = document.getElementById("stage3d");
  if (!host || typeof THREE === "undefined") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SCENES = JSON.parse(document.getElementById("scene-data").textContent);
  const N_GW = 5;
  const PER_GW = 6;
  const N = N_GW * PER_GW;
  const SHARE = [0.3, 0.24, 0.18, 0.12, 0.09, 0.07];

  const TURNS = 2.6;
  const RADIUS = 2.05;
  const Y_PER_KW = 1.05;
  const CENTRE_Y = 2.4;      // the coil squeezes about this height
  const RESERVE_KW = 0.34;

  const COLD = new THREE.Color("#4a5568");
  const WARM = new THREE.Color("#ff9f45");
  const HOT = new THREE.Color("#ff5a5a");
  const SIGNAL = new THREE.Color("#7cc4ff");
  const STALE = new THREE.Color("#ffc46b");

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const draw = (v) => (v === null ? RESERVE_KW : v);

  /* ------------------------------------------------------------- scaffold */

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08070a, 0.048);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.07));
  const key = new THREE.PointLight(0xffb45c, 4.5, 40);
  key.position.set(-6, 9, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0x7cc4ff, 1.8, 40);
  rim.position.set(8, 3, -6);
  scene.add(rim);

  const floor = new THREE.GridHelper(30, 30, 0x2a2433, 0x161320);
  floor.position.y = -0.02;
  scene.add(floor);

  /* ------------------------------------------------------------ the dust */
  // Depth cue. Without it the coil floats in an empty void and reads as flat.

  {
    const n = 340, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 16, a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 13 - 1;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({
      color: 0xffb45c, size: 0.045, transparent: true, opacity: 0.32,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));
  }

  /* ------------------------------------------------------------ the coil */

  const tubeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2e1c0e"), emissive: WARM.clone(), emissiveIntensity: 0.55,
    roughness: 1, metalness: 0,
  });
  // A larger, additive shell standing in for a bloom pass — cheap, and it keeps
  // the whole thing to one render target.
  const glowMat = new THREE.MeshBasicMaterial({
    color: WARM.clone(), transparent: true, opacity: 0.045,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
  });
  let tube = null, glow = null;

  const nodeGeo = new THREE.SphereGeometry(0.098, 16, 12);
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({
      color: new THREE.Color("#3a2415"), emissive: WARM.clone(), emissiveIntensity: 0.95,
      roughness: 1, metalness: 0,
    }));
    nodes.push(m);
    scene.add(m);
  }

  /* -------------------------------------------------------- cap and flow */

  // unit geometry, scaled each frame to the coil's radius where the cap cuts it
  const capDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1, 64),
    new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.045,
      side: THREE.DoubleSide, depthWrite: false })
  );
  capDisc.rotation.x = -Math.PI / 2;
  scene.add(capDisc);

  const capRing = new THREE.Mesh(
    new THREE.RingGeometry(0.986, 1, 96),
    new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.55,
      side: THREE.DoubleSide, depthWrite: false })
  );
  capRing.rotation.x = -Math.PI / 2;
  scene.add(capRing);

  // Power moving through the filament. Each particle rides the polyline; speed
  // tracks load, so a curtailed site visibly slows down.
  const P_COUNT = 70;
  const pPos = new Float32Array(P_COUNT * 3);
  const pCol = new Float32Array(P_COUNT * 3);
  const pAt = new Float32Array(P_COUNT);
  for (let i = 0; i < P_COUNT; i++) pAt[i] = Math.random() * (N - 1);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  const flow = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.115, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(flow);

  /* -------------------------------------------------------------- geometry */

  const angle = (i) => (i / (N - 1)) * TURNS * Math.PI * 2;

  function points(perDevice) {
    let total = 0;
    for (let i = 0; i < N; i++) total += perDevice[i];
    // half the stack below the pivot, half above: it squeezes inward
    const base = CENTRE_Y - (total * Y_PER_KW) / 2;

    const out = [];
    let cumulative = 0;
    for (let i = 0; i < N; i++) {
      cumulative += perDevice[i];
      const a = angle(i);
      const r = RADIUS * (1 - 0.12 * (i / (N - 1)));
      out.push(new THREE.Vector3(Math.cos(a) * r, base + cumulative * Y_PER_KW, Math.sin(a) * r));
    }
    out.base = base;
    out.total = total;
    return out;
  }

  function rebuild(pts) {
    for (const m of [tube, glow]) if (m) { scene.remove(m); m.geometry.dispose(); }
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(pts[0].x, pts.base, pts[0].z), ...pts,
    ]);
    tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 130, 0.075, 8, false), tubeMat);
    glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.28, 8, false), glowMat);
    glow.renderOrder = -1;   // behind the wire, not on top of it
    scene.add(tube, glow);
  }

  /* ----------------------------------------------------------------- state */

  const target = new Array(N).fill(0);
  const shown = new Array(N).fill(0);
  const staleGw = new Array(N_GW).fill(false);
  let targetCap = 5, shownCap = 5, over = 0, live = null;
  let capR = RADIUS + 0.62;

  function readScenes(p) {
    const t = p * SCENES.length;
    const i = Math.min(Math.floor(t), SCENES.length - 1);
    const next = Math.min(i + 1, SCENES.length - 1);
    const k = ease(clamp((t - i - 0.45) / 0.55));

    const a = SCENES[i], b = SCENES[next];
    for (let g = 0; g < N_GW; g++) {
      const av = a.homes[g], bv = b.homes[g];
      const home = lerp(draw(av), draw(bv), k);
      staleGw[g] = ((k > 0.5 ? bv : av) === null);
      for (let d = 0; d < PER_GW; d++) target[g * PER_GW + d] = home * SHARE[d];
    }
    targetCap = lerp(a.cap, b.cap, k);
  }

  function draw3d() {
    let delta = Math.abs(shownCap - targetCap);
    shownCap += (targetCap - shownCap) * 0.09;
    for (let i = 0; i < N; i++) {
      delta = Math.max(delta, Math.abs(shown[i] - target[i]));
      shown[i] += (target[i] - shown[i]) * 0.09;
    }

    const pts = points(shown);
    live = pts;
    if (delta > 0.0006 || !tube) rebuild(pts);

    // the disc is offset by the same half-stack, so the comparison is unchanged
    const capY = pts.base + shownCap * Y_PER_KW;
    capDisc.position.y = capY;
    capRing.position.y = capY;

    // Find where the cap actually cuts the stack, and size the disc to the
    // coil's radius there. A fixed ring floats; this one reads as a level.
    let cum = 0, cut = N - 1;
    for (let i = 0; i < N; i++) { cum += shown[i]; if (cum >= shownCap) { cut = i; break; } }
    capR += ((RADIUS * (1 - 0.12 * (cut / (N - 1))) + 0.62) - capR) * 0.12;
    capDisc.scale.setScalar(capR);
    capRing.scale.setScalar(capR);

    over = clamp((pts.total - shownCap) / shownCap);
    tubeMat.color.copy(COLD).lerp(WARM, 0.45).lerp(HOT, over * 0.7);
    tubeMat.emissive.copy(WARM).lerp(HOT, over);
    tubeMat.emissiveIntensity = 0.5 + over * 0.45;
    glowMat.color.copy(WARM).lerp(HOT, over);
    glowMat.opacity = 0.035 + over * 0.075;

    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      n.position.copy(pts[i]);
      const above = pts[i].y > capY;
      const gwStale = staleGw[Math.floor(i / PER_GW)];
      const c = gwStale ? STALE : above ? HOT : WARM;
      n.material.color.copy(c);
      n.material.emissive.copy(c);
      n.material.emissiveIntensity = gwStale ? 0.6 : above ? 1.6 : 0.95;
      n.scale.setScalar(gwStale ? 0.7 : above ? 1.25 : 1);
    }

    key.color.copy(WARM).lerp(HOT, over);
    key.intensity = 4 + over * 5;
  }

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

  function drawFlow(dt) {
    if (!live) return;
    const capY = live.base + shownCap * Y_PER_KW;
    // scarce power flows slower; an overloaded site races
    const speed = (1.4 + over * 5.5) * dt;

    for (let i = 0; i < P_COUNT; i++) {
      pAt[i] = (pAt[i] + speed) % (N - 1);
      const j = Math.floor(pAt[i]);
      tmpA.copy(live[j]).lerp(tmpB.copy(live[j + 1] ?? live[j]), pAt[i] - j);
      pPos[i * 3] = tmpA.x; pPos[i * 3 + 1] = tmpA.y; pPos[i * 3 + 2] = tmpA.z;

      const c = staleGw[Math.floor(j / PER_GW)] ? STALE : tmpA.y > capY ? HOT : WARM;
      pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
  }

  /* ------------------------------------------------------------------ loop */

  const journey = document.querySelector(".journey");
  const stage = document.querySelector(".stage");

  function progress() {
    if (!journey || !stage) return 0;
    const span = journey.offsetHeight - stage.offsetHeight;
    return clamp((scrollY - journey.offsetTop) / (span || 1));
  }

  const FIT_H = 8.2;   // world height the framing should accommodate
  let dist = 12;

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const vFov = (camera.fov * Math.PI) / 180;
    let d = FIT_H / 2 / Math.tan(vFov / 2);
    // a canvas narrower than it is tall crops horizontally, so back off further
    if (camera.aspect < 1) d /= camera.aspect;
    dist = d * 1.2;
  }

  let raf = 0, last = 0;
  function frame(ms) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((ms - last) / 1000, 0.05) || 0.016;
    last = ms;

    const p = progress();
    readScenes(p);
    draw3d();
    drawFlow(dt);

    // the cap ring breathes, faster and harder when the site is over
    const pulse = 1 + Math.sin(ms * (0.0018 + over * 0.004)) * (0.006 + over * 0.02);
    capRing.scale.setScalar(capR * pulse);
    capRing.material.opacity = 0.45 + over * 0.3 + Math.sin(ms * 0.0021) * 0.06;

    const exit = ease(clamp((p - 0.84) / 0.16));
    renderer.domElement.style.opacity = (1 - exit * 0.92).toFixed(3);

    const a = ms * 0.00006 + p * 1.4;
    const d = dist + exit * 3;
    const aimY = CENTRE_Y - 0.4 - exit * 1.2;
    camera.position.set(Math.cos(a) * d, aimY + 1.9 + p * 1.1 + exit * 4.5, Math.sin(a) * d);
    camera.lookAt(0, aimY, 0);

    renderer.render(scene, camera);
  }

  addEventListener("resize", resize, { passive: true });
  resize();
  readScenes(0);
  shownCap = targetCap;
  for (let i = 0; i < N; i++) shown[i] = target[i];
  draw3d();
  raf = requestAnimationFrame(frame);

  // Nothing renders while the hero is off-screen. A WebGL loop running behind
  // fourteen sections of prose is just heat.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 }).observe(stage || host);
  }

  host.dataset.ready = "true";
  document.documentElement.classList.add("has-3d");
})();
