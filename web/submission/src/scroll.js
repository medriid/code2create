/* FILAMENT OS — interaction.
 *
 * Five independent systems, none of which touch layout:
 *   1. reveal on enter, in four flavours, with per-child stagger
 *   2. the pinned hero, scrubbed by scroll position (the 3D figure reads the
 *      same progress separately, in scene3d.js)
 *   3. the horizontal timeline rail, also scrubbed
 *   4. numbers that count up when you reach them
 *   5. read progress, and a cursor-tracked glow
 *
 * All writes are CSS custom properties, data attributes or transforms.
 */
(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ------------------------------------------------------------- 1. reveal */

  const REVEALS = ".rv, .rv-left, .rv-scale, .open-y, .open-x, .w, [data-count]";
  const targets = document.querySelectorAll(REVEALS);

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => {
      el.classList.add("in");
      if (el.dataset.count) el.textContent = el.dataset.count;
    });
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          if (e.target.dataset.count) countUp(e.target);
          io.unobserve(e.target);
        }
      },
      // threshold stays near zero: an element taller than the viewport can never
      // reach a large fraction of *itself*, and several tables are exactly that
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ----------------------------------------------------------- 4. count up */

  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    const from = parseFloat(el.dataset.from ?? "0");
    const dp = parseInt(el.dataset.decimals ?? "0", 10);
    const start = performance.now();
    const ms = 1300;

    (function step(now) {
      const t = clamp((now - start) / ms);
      el.textContent = lerp(from, to, ease(t)).toFixed(dp);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ------------------------------------------------------ 5. read progress */

  const bar = document.querySelector(".progress");
  const glow = document.querySelector(".cursorglow");

  if (glow && matchMedia("(pointer: fine)").matches && !reduced) {
    document.documentElement.classList.add("has-pointer");
    addEventListener("pointermove", (e) => {
      glow.style.setProperty("--mx", e.clientX + "px");
      glow.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  /* --------------------------------------------------------- 2. the hero */

  const journey = document.querySelector(".journey");
  const stage = document.querySelector(".stage");
  const railWrap = document.querySelector(".rail");
  const railStage = document.querySelector(".rail__stage");
  const railTrack = document.querySelector(".rail__track");
  const railBar = document.querySelector(".railbar");

  let heroPaint = () => {};

  if (journey && stage && !reduced) {
    const SCENES = JSON.parse(document.getElementById("scene-data").textContent);
    const N = SCENES.length;
    const SCALE = 5.4;
    const RESERVE = 0.34;

    const chart = document.querySelector(".chart");
    const capline = document.querySelector(".capline");
    const note = document.querySelector(".chart__note");
    const status = document.querySelector(".chart__status");
    const total = document.querySelector(".readout__total");
    const capkw = document.querySelector(".readout__capkw");
    const LABEL = { ok: "nominal", over: "overload", planning: "planning", degraded: "degraded" };
    const titlecard = document.querySelector(".titlecard");
    const segs = [...document.querySelectorAll(".seg")];
    const gws = [...document.querySelectorAll(".gw")];
    const sceneEls = [...document.querySelectorAll(".scene")];
    const ticks = [...document.querySelectorAll(".tick")];

    // A null draw is a household we can no longer hear. Not zero — the
    // coordinator holds a conservative reserve, and that is the whole point.
    const draw = (v) => (v === null ? RESERVE : v);
    let active = -1;

    heroPaint = () => {
      const span = journey.offsetHeight - stage.offsetHeight;
      const p = clamp((scrollY - journey.offsetTop) / (span || 1));

      titlecard.style.setProperty("--title-o", String(clamp(1 - p / 0.07)));
      // the last 16% of the journey lifts the hero out of the way
      stage.style.setProperty("--exit", ease(clamp((p - 0.84) / 0.16)).toFixed(4));

      const t = p * N;
      const i = Math.min(Math.floor(t), N - 1);
      const next = Math.min(i + 1, N - 1);
      const k = ease(clamp((t - i - 0.45) / 0.55));

      const a = SCENES[i], b = SCENES[next];
      const shown = k > 0.5 ? b : a;
      const cap = lerp(a.cap, b.cap, k);
      let drawn = 0;

      for (let j = 0; j < segs.length; j++) {
        const av = a.homes[j], bv = b.homes[j];
        const v = lerp(draw(av), draw(bv), k);
        const stale = (k > 0.5 ? bv : av) === null;
        drawn += v;

        segs[j].style.setProperty("--w", (v / SCALE).toFixed(4));
        segs[j].dataset.stale = String(stale);

        const gw = gws[j];
        gw.dataset.stale = String(stale);
        gw.querySelector(".gw__fill").style.setProperty("--w", (v / 1.4).toFixed(4));
        gw.querySelector(".gw__kw").textContent = v.toFixed(2);
        gw.querySelector(".gw__st").textContent = stale ? "stale"
          : shown.status === "over" ? "over"
          : shown.status === "planning" ? "offer" : "ok";
      }

      capline.style.setProperty("--cap", (cap / SCALE).toFixed(4));
      capline.dataset.kw = cap.toFixed(2);
      total.textContent = drawn.toFixed(2);
      capkw.textContent = cap.toFixed(2);
      chart.dataset.status = shown.status;
      status.textContent = LABEL[shown.status] ?? shown.status;
      note.textContent = shown.note;

      if (i !== active) {
        active = i;
        sceneEls.forEach((el, n) => (el.dataset.active = String(n === i)));
        ticks.forEach((el, n) => (el.dataset.on = String(n <= i)));
      }
    };
  }

  /* ----------------------------------------------------------- 3. the rail */

  let railPaint = () => {};

  if (railWrap && railStage && railTrack && !reduced) {
    railPaint = () => {
      const span = railWrap.offsetHeight - railStage.offsetHeight;
      const p = clamp((scrollY - railWrap.offsetTop) / (span || 1));
      // how far the track must travel for its last card to reach the right edge
      const travel = Math.max(0, railTrack.scrollWidth - innerWidth);
      railTrack.style.setProperty("--rail", (p * travel).toFixed(1));
      if (railBar) railBar.style.setProperty("--railp", p.toFixed(4));
    };
  }

  /* ------------------------------------------------------------- the loop */

  let queued = false;

  function paint() {
    queued = false;
    if (bar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty("--read", clamp(scrollY / (max || 1)).toFixed(4));
    }
    heroPaint();
    railPaint();
  }

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  paint();
})();
