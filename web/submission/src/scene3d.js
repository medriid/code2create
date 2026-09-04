/* The hero figure.
 *
 * Thirty devices, arranged as a helix and stacked cumulatively: each node sits
 * at the running total of every device below it, so the top of the coil IS the
 * site load. A translucent disc is the cap. When demand exceeds it the coil
 * pushes through the disc and runs hot.
 *
 * It is the logo — one wire, coiled — drawn out of live numbers, and it is the
 * same measurement the 2D fallback makes. Nothing here is decoration.
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
  // How each household's draw splits across its six devices. Fixed, so a change
  // in the coil is always a change in the numbers, never in the arrangement.
  const SHARE = [0.3, 0.24, 0.18, 0.12, 0.09, 0.07];

  const TURNS = 2.6;
  const RADIUS = 2.05;
  const Y_PER_KW = 0.92;     // world units per kW of cumulative load
  const RESERVE_KW = 0.34;   // held for a household we can no longer hear

  const COLD = new THREE.Color("#4a5568");
  const WARM = new THREE.Color("#ff9f45");
  const HOT = new THREE.Color("#ff5a5a");
  const SIGNAL = new THREE.Color("#7cc4ff");
  const STALE = new THREE.Color("#ffc46b");

  /* ------------------------------------------------------------- scaffold */

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08070a, 0.055);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.16));
  const key = new THREE.PointLight(0xffb45c, 9, 40);
  key.position.set(-6, 9, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0x7cc4ff, 7, 40);
  rim.position.set(8, 3, -6);
  scene.add(rim);

  const floor = new THREE.GridHelper(26, 26, 0x2a2433, 0x18141f);
  floor.position.y = -0.02;
  scene.add(floor);

  /* ------------------------------------------------------------------ coil */

  const tubeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2e1c0e"), emissive: WARM.clone(), emissiveIntensity: 0.55,
    roughness: 1, metalness: 0,
  });
  let tube = null;

  const nodeGeo = new THREE.SphereGeometry(0.098, 16, 12);
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const m = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({
      color: new THREE.Color("#3a2415"), emissive: WARM.clone(), emissiveIntensity: 0.9,
      roughness: 1, metalness: 0,
    }));
    nodes.push(m);
    scene.add(m);
  }

  /* ------------------------------------------------------------- cap plane */

  const capDisc = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 64),
    new THREE.MeshBasicMaterial({
      color: SIGNAL, transparent: true, opacity: 0.045,
      side: THREE.DoubleSide, depthWrite: false,
    })
  );
  capDisc.rotation.x = -Math.PI / 2;
  scene.add(capDisc);

  const capRing = new THREE.Mesh(
    new THREE.RingGeometry(3.36, 3.42, 96),
    new THREE.MeshBasicMaterial({
      color: SIGNAL, transparent: true, opacity: 0.55,
      side: THREE.DoubleSide, depthWrite: false,
    })
  );
  capRing.rotation.x = -Math.PI / 2;
  scene.add(capRing);

  /* -------------------------------------------------------------- geometry */

  // Angle and radius are fixed per device; only height ever moves.
  const angle = (i) => (i / (N - 1)) * TURNS * Math.PI * 2;

  function points(perDevice) {
    const out = [];
    let cumulative = 0;
    for (let i = 0; i < N; i++) {
      cumulative += perDevice[i];
      const a = angle(i);
      // radius eases inward as the coil climbs, so the top reads as a point
      const r = RADIUS * (1 - 0.12 * (i / (N - 1)));
      out.push(new THREE.Vector3(Math.cos(a) * r, cumulative * Y_PER_KW, Math.sin(a) * r));
    }
    return out;
  }

  function rebuild(pts) {
    if (tube) { scene.remove(tube); tube.geometry.dispose(); }
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(pts[0].x, 0, pts[0].z), ...pts]);
    tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 130, 0.075, 8, false), tubeMat);
    scene.add(tube);
  }

  /* ----------------------------------------------------------------- state */

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const draw = (v) => (v === null ? RESERVE_KW : v);

  const target = new Array(N).fill(0);
  const shown = new Array(N).fill(0);
  const staleGw = new Array(N_GW).fill(false);
  let targetCap = 5;
  let shownCap = 5;

  function readScenes(p) {
    const t = p * SCENES.length;
    const i = Math.min(Math.floor(t), SCENES.length - 1);
    const next = Math.min(i + 1, SCENES.length - 1);
    const k = ease(clamp((t - i - 0.45) / 0.55));

    const a = SCENES[i], b = SCENES[next];
    const cap = lerp(a.cap, b.cap, k);

    for (let g = 0; g < N_GW; g++) {
      const av = a.homes[g], bv = b.homes[g];
      const home = lerp(draw(av), draw(bv), k);
      staleGw[g] = ((k > 0.5 ? bv : av) === null);
      for (let d = 0; d < PER_GW; d++) target[g * PER_GW + d] = home * SHARE[d];
    }

    targetCap = cap;
  }

  function draw3d() {
    // chase, don't snap
    let delta = Math.abs(shownCap - targetCap);
    shownCap += (targetCap - shownCap) * 0.09;
    let total = 0;
    for (let i = 0; i < N; i++) {
      delta = Math.max(delta, Math.abs(shown[i] - target[i]));
      shown[i] += (target[i] - shown[i]) * 0.09;
      total += shown[i];
    }

    const pts = points(shown);
    if (delta > 0.0006 || !tube) rebuild(pts);

    const cap = shownCap;
    const capY = cap * Y_PER_KW;
    capDisc.position.y = capY;
    capRing.position.y = capY;

    // The coil runs hot when the site is over its limit.
    const over = clamp((total - cap) / cap);
    tubeMat.color.copy(COLD).lerp(WARM, 0.45).lerp(HOT, over * 0.7);
    tubeMat.emissive.copy(WARM).lerp(HOT, over);
    tubeMat.emissiveIntensity = 0.24 + over * 0.4;

    for (let i2 = 0; i2 < N; i2++) {
      const n = nodes[i2];
      n.position.copy(pts[i2]);
      const above = pts[i2].y > capY;
      const gwStale = staleGw[Math.floor(i2 / PER_GW)];
      const c = gwStale ? STALE : above ? HOT : WARM;
      n.material.color.copy(c);
      n.material.emissive.copy(c);
      n.material.emissiveIntensity = gwStale ? 0.5 : above ? 1.5 : 0.85;
      n.scale.setScalar(gwStale ? 0.7 : above ? 1.25 : 1);
    }

    key.color.copy(WARM).lerp(HOT, over);
    key.intensity = 8 + over * 9;
  }

  /* ------------------------------------------------------------------ loop */

  const journey = document.querySelector(".journey");
  const stage = document.querySelector(".stage");

  function progress() {
    if (!journey || !stage) return 0;
    const span = journey.offsetHeight - stage.offsetHeight;
    return clamp((scrollY - journey.offsetTop) / (span || 1));
  }

  let dist = 8.4;

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // A tall narrow viewport crops horizontally, so the coil has to move away.
    // The copy also stacks below the figure there, so stop biasing it sideways.
    dist = camera.aspect < 1.05 ? 13 : 8.4;
  }

  let raf = 0;
  function frame(ms) {
    raf = requestAnimationFrame(frame);

    const p = progress();
    readScenes(p);
    draw3d();

    // slow orbit, plus a gentle rise as the story descends
    const exit = ease(clamp((p - 0.84) / 0.16));
    renderer.domElement.style.opacity = (1 - exit * 0.92).toFixed(3);

    const a = ms * 0.00006 + p * 1.4;
    // rise and pull back through the hand-off, so the coil recedes downward
    // height is now relative to what we are looking at, so the framing holds
    const height = 2.6 + p * 1.6 + exit * 4.5;
    const d = dist + exit * 3;
    const aimY = 1.75 + p * 0.45 - exit * 1.2;
    camera.position.set(Math.cos(a) * d, aimY + height, Math.sin(a) * d);
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

  // Stop rendering entirely when the hero is off-screen. A WebGL loop running
  // behind fourteen sections of prose is just heat.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(frame);
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 }).observe(stage || host);
  }

  host.dataset.ready = "true";
  document.documentElement.classList.add("has-3d");
})();
