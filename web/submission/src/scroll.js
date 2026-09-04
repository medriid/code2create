/* FILAMENT OS — scroll behaviour.
 *
 * Two independent systems:
 *   1. a pinned hero whose numbers are scrubbed by scroll position, so the
 *      first screen performs the demand-response demo instead of describing it;
 *   2. reveal-on-enter for everything below it.
 *
 * No dependencies, no layout thrash: reads happen in one rAF pass, writes are
 * CSS custom properties and data attributes.
 */
(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------ reveal on enter */

  const targets = document.querySelectorAll(".reveal, .open-y, .open-x");

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      // threshold stays near zero: an element taller than the viewport can never
      // reach a large fraction of *itself*, and several tables are exactly that.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------- the pinned hero */

  const journey = document.querySelector(".journey");
  const stage = document.querySelector(".stage");
  if (!journey || !stage || reduced) return;

  const SCENES = JSON.parse(document.getElementById("scene-data").textContent);
  const N = SCENES.length;
  const SCALE = 5.4; // kW of full meter width
  const RESERVE = 0.34; // kW held back for a gateway we can no longer hear

  const chart = document.querySelector(".chart");
  const capline = document.querySelector(".capline");
  const note = document.querySelector(".chart__note");
  const titlecard = document.querySelector(".titlecard");
  const segs = [...document.querySelectorAll(".seg")];
  const gws = [...document.querySelectorAll(".gw")];
  const sceneEls = [...document.querySelectorAll(".scene")];
  const ticks = [...document.querySelectorAll(".tick")];

  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  // slow in, slow out — the "opening" feel, applied to the scrub as well
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // A null draw means the gateway went silent. It is not zero: the coordinator
  // holds a conservative reserve for it, which is the point of the whole scene.
  const draw = (v) => (v === null ? RESERVE : v);

  let active = -1;
  let queued = false;

  function paint() {
    queued = false;

    const top = journey.offsetTop;
    const span = journey.offsetHeight - stage.offsetHeight;
    const p = clamp((window.scrollY - top) / (span || 1));

    // title card lifts away over the first slice of the journey
    titlecard.style.setProperty("--title-o", String(clamp(1 - p / 0.075)));

    // each scene holds, then transitions into the next
    const t = p * N;
    const i = Math.min(Math.floor(t), N - 1);
    const next = Math.min(i + 1, N - 1);
    const local = t - i;
    const k = ease(clamp((local - 0.55) / 0.45));

    const a = SCENES[i];
    const b = SCENES[next];
    const shown = k > 0.5 ? b : a;

    const cap = lerp(a.cap, b.cap, k);
    let total = 0;

    for (let j = 0; j < segs.length; j++) {
      const av = a.homes[j];
      const bv = b.homes[j];
      const v = lerp(draw(av), draw(bv), k);
      const stale = (k > 0.5 ? bv : av) === null;
      total += v;

      segs[j].style.setProperty("--w", (v / SCALE).toFixed(4));
      segs[j].dataset.stale = String(stale);

      const gw = gws[j];
      gw.dataset.stale = String(stale);
      gw.querySelector(".gw__fill").style.setProperty("--w", (v / 1.4).toFixed(4));
      gw.querySelector(".gw__kw").textContent = v.toFixed(2) + " kW";
      gw.querySelector(".gw__st").textContent = stale
        ? "stale"
        : shown.status === "over"
        ? "over"
        : shown.status === "planning"
        ? "offer"
        : "ok";
    }

    capline.style.setProperty("--cap", (cap / SCALE).toFixed(4));
    capline.dataset.kw = cap.toFixed(2);

    chart.dataset.status = shown.status;
    note.textContent = shown.note;

    // the ambient glow tracks how far over the limit we are
    const over = clamp((total - cap) / cap);
    stage.style.setProperty("--heat", over.toFixed(3));

    if (i !== active) {
      active = i;
      sceneEls.forEach((el, n) => (el.dataset.active = String(n === i)));
      ticks.forEach((el, n) => (el.dataset.on = String(n <= i)));
    }
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
