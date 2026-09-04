// Renders dist/index.html. Everything is inlined except Three.js, which is
// vendored alongside, so the page opens off a USB stick with no network — the
// same reason the product runs on a LAN.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { meta, scenes, sections as S } from "./content.mjs";

const HERE = dirname(new URL(import.meta.url).pathname);
const BRAND = resolve(HERE, "../../assets/brand");
const OUT = resolve(HERE, "dist");
const read = (p) => readFile(p, "utf8");

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Headlines are split into words at build time so each can be given its own
   delay. Doing it here rather than in JS means no flash of unsplit text. */
const words = (s) =>
  esc(s).split(" ").map((w, i) => `<i style="--wi:${i}">${w}</i>`).join(" ");

const hlJson = (code) =>
  esc(code)
    .replace(/&quot;([a-z_]+)&quot;(?=\s*:)/g, "<b>&quot;$1&quot;</b>")
    .replace(/:\s(-?\d+(?:\.\d+)?)/g, ": <i>$1</i>");
const hlTopic = (code) => esc(code).replace(/\{([a-z_]+)\}/g, "<i>{$1}</i>");

const li = (items) => items.map((x) => `<li>${esc(x)}</li>`).join("");
const paras = (items) => items.map((x) => `<p>${esc(x)}</p>`).join("");
const map = (items, fn) => items.map(fn).join("");
const rows = (rs) => map(rs, (r) => `<tr>${map(r, (c) => `<td>${esc(c)}</td>`)}</tr>`);

const head = (s, extra = "") => `
  <div class="head" style="margin-bottom:clamp(40px,6vh,72px)">
    <p class="eyebrow rv">${esc(s.eyebrow)}</p>
    <h2 class="w">${words(s.title)}</h2>
    ${s.lede ? `<p class="lede rv" style="--i:1">${esc(s.lede)}</p>` : ""}
    ${extra}
  </div>`;

const quote = (n) => `
<section class="quote hair">
  <div class="wrap">
    <blockquote class="w">${words(S.quotes[n].t)}</blockquote>
    <cite class="rv" style="--i:2">${esc(S.quotes[n].cite)}</cite>
  </div>
</section>`;

/* ------------------------------------------------------------------ hero */

function hero(logoWide, mark) {
  const ids = ["home-a", "home-b", "home-c", "home-d", "home-e"];
  return `
<div class="journey">
  <div class="stage">
    <div id="stage3d" aria-hidden="true"></div>

    <div class="titlecard">
      <div class="wrap">
        <div class="titlecard__inner">
          <h1 class="titlecard__name rv">${logoWide}<span class="vh">${esc(meta.name)}</span></h1>
          <div class="titlecard__rule open-x" style="--i:1"></div>
          <p class="titlecard__say rv" style="--i:2">${esc(meta.tagline)}</p>
          <p class="titlecard__spec rv" style="--i:3">${esc(meta.standfirst)}</p>
        </div>
      </div>
      <p class="titlecard__meta rv" style="--i:4">${esc(meta.event)} &nbsp;·&nbsp; ${esc(meta.venue)}</p>
    </div>

    <div class="wrap stage__head">
      <div class="stage__brand">${mark}<span class="stage__name">Filament OS</span></div>
      <div class="stage__event">${esc(meta.event)}<br>${esc(meta.venue)}</div>
    </div>

    <div class="wrap stage__body">
      <div class="stage__left">
      <div class="scenes">
        ${map(scenes, (s, i) => `
        <article class="scene" data-active="${i === 0}">
          <p class="scene__kicker">${esc(s.kicker)}</p>
          <h2 class="scene__title">${esc(s.title)}</h2>
          <p class="scene__body">${esc(s.body)}</p>
        </article>`)}
      </div>

      <div class="chart" data-status="ok">
        <div class="chart__top">
          <span class="chart__label">Site load · five gateways</span>
          <span class="pill chart__status">nominal</span>
        </div>

        <div class="readout">
          <div class="readout__big"><span class="readout__total">4.60</span><u>kW drawn</u></div>
          <div class="readout__cap">available<b class="readout__capkw">5.00</b></div>
        </div>

        <div class="meterwrap">
          <div class="meter">${map(ids, () => `<div class="seg" style="--w:.19"></div>`)}<div class="capline" data-kw="5.00"></div></div>
          <div class="scaleline"><span>0</span><span>5.4 kW</span></div>
        </div>

        <div class="gws">
          ${map(ids, (id) => `
          <div class="gw" data-stale="false">
            <span class="gw__id">${id}</span>
            <span class="gw__track"><span class="gw__fill" style="--w:.7"></span></span>
            <span class="gw__kw">0.00</span><span class="gw__st">ok</span>
          </div>`)}
        </div>
        <p class="chart__note">&nbsp;</p>
      </div>
      </div>

      <div class="stage__gap" aria-hidden="true"></div>
    </div>

    <div class="wrap stage__foot">
      <div class="ticks">${map(scenes, (_, i) => `<span class="tick" data-on="${i === 0}"></span>`)}</div>
      <div class="hint">scroll <span>↓</span></div>
    </div>
  </div>
</div>
<script id="scene-data" type="application/json">${JSON.stringify(
    scenes.map(({ cap, homes, status, note }) => ({ cap, homes, status, note })))}</script>`;
}

/* -------------------------------------------------------------- sections */

const body = () => `
<section class="hair" style="padding:0">
  <div class="stats">
    ${map(S.stats, (s, i) => `
    <div class="stat rv" style="--i:${i}">
      <div class="stat__n"><span data-count="${s.n}"${s.from !== undefined ? ` data-from="${s.from}"` : ""}${s.decimals ? ` data-decimals="${s.decimals}"` : ""}>0</span><span>${esc(s.suffix)}</span></div>
      <div class="stat__l">${esc(s.label)}</div>
      <p class="stat__note">${esc(s.note)}</p>
    </div>`)}
  </div>
</section>

<section id="problem"><div class="wrap wrap--narrow">
  ${head(S.problem)}
  <div class="rv" style="--i:2">${paras(S.problem.body)}</div>
</div></section>

${quote(0)}

<section id="what" class="hair"><div class="wrap">
  ${head(S.solution)}
  <div class="planes">
    ${map(S.planes, (p, i) => `
    <div class="plane rv-left" data-tone="${p.tone}" style="--i:${i}"><b>${esc(p.t)}</b><span>${esc(p.d)}</span></div>`)}
  </div>
</div></section>

<section id="boundary" class="panel"><div class="wrap">
  <p class="eyebrow rv">${esc(S.boundary.eyebrow)}</p>
  <h2 class="panel__big w">${words(S.boundary.title)}</h2>
  <p class="lede rv" style="--i:1">${esc(S.boundary.lede)}</p>
  <div class="rv" style="--i:2" style="margin-top:30px">${paras(S.boundary.body)}</div>
  <div class="proves">
    ${map(S.boundary.proves, (p, i) => `
    <div class="prove rv-scale" style="--i:${i}"><b>proves ${String(i + 1).padStart(2, "0")}</b>${esc(p)}</div>`)}
  </div>
  <div class="aside rv" style="--i:3"><p>${esc(S.boundary.close)}</p></div>
</div></section>

<section id="features"><div class="wrap">
  ${head(S.features)}
  <div class="feats">
    ${map(S.features.items, (f, i) => `
    <article class="feat rv" style="--i:${i % 3}">
      <span class="feat__n">${esc(f.n)}</span>
      <h3>${esc(f.title)}</h3>
      <p>${esc(f.body)}</p>
      <p class="feat__key">${esc(f.key)}</p>
    </article>`)}
  </div>
</div></section>

${quote(1)}

<section id="loop" class="hair"><div class="wrap">
  <div class="sticky2">
    <div class="sticky2__label">
      <p class="eyebrow rv">${esc(S.loop.eyebrow)}</p>
      <h2 class="w">${words(S.loop.title)}</h2>
      <p class="lede rv" style="--i:1">${esc(S.loop.lede)}</p>
      <div class="aside rv" style="--i:2"><p>${esc(S.loop.aside)}</p></div>
    </div>
    <div class="steps">
      ${map(S.loop.steps, (s, i) => `
      <div class="step rv-left" style="--i:${Math.min(i, 4)}">
        <span class="step__n">0${esc(s.n)}</span>
        <div><div class="step__t">${esc(s.t)}</div><div class="step__d">${esc(s.d)}</div></div>
      </div>`)}
    </div>
  </div>
</div></section>

<div class="marquee" aria-hidden="true">
  <div class="marquee__track">${map([...S.marquee, ...S.marquee], (m) => `<span>${esc(m)}</span>`)}</div>
</div>

<section id="protocol"><div class="wrap">
  ${head(S.protocol)}
  <div class="rv"><p class="codelabel">Topics</p><pre>${hlTopic(S.protocol.topics)}</pre></div>
  <div class="codegrid" style="margin-top:22px">
    <div class="rv" style="--i:1"><p class="codelabel">Telemetry</p><pre>${hlJson(S.protocol.telemetry)}</pre></div>
    <div class="rv" style="--i:2"><p class="codelabel">Command</p><pre>${hlJson(S.protocol.command)}</pre></div>
  </div>
  <ul class="list rv" style="--i:3;margin-top:32px">${li(S.protocol.notes)}</ul>
</div></section>

<section id="planner" class="hair"><div class="wrap">
  ${head(S.planner)}
  <p class="objective rv">
    <b>maximize</b> delivered utility<br>
    <s>−</s> missed-deadline penalty<br>
    <s>−</s> switching penalty<br>
    <s>−</s> household curtailment-debt penalty
  </p>
  <div class="rule open-x rv" style="--i:1"></div>
  <p class="codelabel rv" style="--i:1">Subject to</p>
  <ul class="list rv" style="--i:2">${li(S.planner.constraints)}</ul>
  <div class="aside rv" style="--i:3"><p>${esc(S.planner.fallback)}</p></div>
</div></section>

${quote(2)}

<section id="stack" class="hair"><div class="wrap">
  ${head(S.stack)}
  <table class="table rv">
    <thead><tr><th>Layer</th><th>Choice</th><th>Fallback if it fails</th></tr></thead>
    <tbody>${rows(S.stack.rows)}</tbody>
  </table>
</div></section>

<section id="standards"><div class="wrap">
  ${head(S.standards)}
  <div class="feats">
    ${map(S.standards.items, (x, i) => `
    <article class="feat rv" style="--i:${i}">
      <h3>${esc(x.t)}<span class="badge" data-tone="${x.tone}">${esc(x.badge)}</span></h3>
      <p>${esc(x.d)}</p>
    </article>`)}
  </div>
  <div class="aside rv" style="--i:3"><p>${esc(S.standards.close)}</p></div>
</div></section>

<section id="acceptance" class="hair"><div class="wrap">
  ${head(S.acceptance)}
  <ol class="crit">${map(S.acceptance.items, (x, i) => `<li class="rv-scale" style="--i:${i % 3}"><span>${esc(x)}</span></li>`)}</ol>
</div></section>

<section id="metrics"><div class="wrap">
  ${head(S.metrics)}
  <table class="table rv">
    <thead><tr><th>Metric</th><th>Definition</th></tr></thead>
    <tbody>${rows(S.metrics.rows)}</tbody>
  </table>
  <div class="aside rv" style="--i:1"><p>${esc(S.metrics.caveat)}</p></div>
</div></section>

<section id="team" class="hair"><div class="wrap">
  ${head(S.team)}
  ${map(S.team.members, (m, i) => `
  <div class="member rv-left" style="--i:${Math.min(i, 3)}">
    <span class="member__n">${esc(m.n)}</span>
    <div>
      <h3>${esc(m.role)}</h3>
      <p>${esc(m.owns)}</p>
      <p class="member__out">${esc(m.out)}</p>
      <p class="member__when">${esc(m.when)}</p>
    </div>
  </div>`)}
  <div class="rule open-x rv"></div>
  <p class="eyebrow rv">Dependency discipline</p>
  <ul class="list rv" style="--i:1">${li(S.team.discipline)}</ul>
</div></section>

<div class="rail" id="timeline">
  <div class="rail__stage">
    <div class="wrap">
      <p class="eyebrow rv">${esc(S.timeline.eyebrow)}</p>
      <h2 class="w">${words(S.timeline.title)}</h2>
      <p class="lede rv" style="--i:1">${esc(S.timeline.lede)}</p>
    </div>
    <div class="rail__track">
      ${map(S.timeline.windows, (w) => `
      <article class="win">
        <div class="win__h">${esc(w.h)}<small> h</small></div>
        <p class="win__o">${esc(w.o)}</p>
        <p class="win__d">${esc(w.d)}</p>
        <p class="win__no">${esc(w.no)}</p>
      </article>`)}
    </div>
    <div class="railbar"><i></i></div>
  </div>
</div>

<section id="demo" class="hair"><div class="wrap">
  ${head(S.demo)}
  ${map(S.demo.beats, (b, i) => `
  <div class="beat rv" style="--i:${Math.min(i, 4)}">
    <span class="beat__t">${esc(b.t)}</span><span class="beat__h">${esc(b.h)}</span><span class="beat__d">${esc(b.d)}</span>
  </div>`)}
</div></section>

<section id="failure"><div class="wrap">
  ${head(S.failure)}
  <table class="table rv">
    <thead><tr><th>Failure</th><th>Live fallback</th><th>Stored fallback</th></tr></thead>
    <tbody>${rows(S.failure.rows)}</tbody>
  </table>
  <div class="aside rv" style="--i:1"><p>${esc(S.failure.close)}</p></div>
</div></section>

${quote(3)}

<section id="rules" class="hair"><div class="wrap">
  ${head(S.rules)}
  <div class="rv">${paras(S.rules.body)}</div>
  <div class="split" style="margin-top:38px">
    <div class="rv" style="--i:1"><h3 style="color:var(--ok)">Preparation may produce</h3>
      <ul class="list" data-tone="yes">${li(S.rules.allowed)}</ul></div>
    <div class="rv" style="--i:2"><h3 style="color:var(--bad)">It may not produce</h3>
      <ul class="list" data-tone="no">${li(S.rules.forbidden)}</ul></div>
  </div>
  <div class="aside rv" style="--i:3"><p>${esc(S.rules.close)}</p></div>
</div></section>`;

/* ----------------------------------------------------------------- build */

const [logoStacked, mark, logo, favicon, css, scroll, scene3d] = await Promise.all([
  read(`${BRAND}/logo-stacked.svg`), read(`${BRAND}/mark.svg`), read(`${BRAND}/logo.svg`),
  read(`${BRAND}/favicon.svg`),
  read(resolve(HERE, "src/styles.css")),
  read(resolve(HERE, "src/scroll.js")),
  read(resolve(HERE, "src/scene3d.js")),
]);

const strip = (svg) => svg.replace(/ width="[\d.]+" height="[\d.]+"/, "");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.name)} — ${esc(meta.tagline)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta name="color-scheme" content="dark">
<meta property="og:title" content="${esc(meta.name)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(favicon).toString("base64")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>${css}</style>
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<div class="cursorglow" aria-hidden="true"></div>
<main>
${hero(strip(logo), strip(mark))}
${body()}
</main>
<footer><div class="wrap foot">
  <div>${strip(logo)}</div>
  <div class="foot__meta">
    ${esc(meta.event)}<br>${esc(meta.venue)}<br>
    Preparation repository · implementation begins at the starting gun
  </div>
</div></footer>
<script src="three.min.js"></script>
<script>${scene3d}</script>
<script>${scroll}</script>
</body>
</html>
`;

await mkdir(`${OUT}/assets/brand`, { recursive: true });
await writeFile(`${OUT}/index.html`, html);
await copyFile(resolve(HERE, "vendor/three.min.js"), `${OUT}/three.min.js`);
for (const f of ["logo.svg", "logo-stacked.svg", "mark.svg", "favicon.svg", "mark-mono.svg"]) {
  await copyFile(`${BRAND}/${f}`, `${OUT}/assets/brand/${f}`);
}

console.log(`  dist/index.html   ${(html.length / 1024).toFixed(1)} kB`);
console.log(`  dist/three.min.js  vendored`);
