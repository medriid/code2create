// Renders dist/index.html from content.mjs. Everything is inlined, so the page
// opens from a USB stick with no server and no network — which is the same
// reason the product runs on a LAN.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { meta, scenes, sections as S } from "./content.mjs";

const HERE = dirname(new URL(import.meta.url).pathname);
const BRAND = resolve(HERE, "../../assets/brand");
const OUT = resolve(HERE, "dist");

const read = (p) => readFile(p, "utf8");

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

// keys bold, numbers/placeholders tinted — enough structure to read at a glance
const hlJson = (code) =>
  esc(code)
    .replace(/&quot;([a-z_]+)&quot;(?=\s*:)/g, "<b>&quot;$1&quot;</b>")
    .replace(/:\s(-?\d+(?:\.\d+)?)/g, ": <i>$1</i>");

const hlTopic = (code) => esc(code).replace(/\{([a-z_]+)\}/g, "<i>{$1}</i>");

const li = (items) => items.map((x) => `<li>${esc(x)}</li>`).join("");
const paras = (items) => items.map((x) => `<p>${esc(x)}</p>`).join("");

/* Adds the stagger index used by the reveal transitions. */
const stagger = (items, fn) => items.map((x, i) => fn(x, i)).join("");

const head = (s, cls = "head reveal") => `
  <div class="${cls}">
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2>${esc(s.title)}</h2>
    ${s.lede ? `<p class="lede">${esc(s.lede)}</p>` : ""}
  </div>`;

/* ------------------------------------------------------------------ hero */

function hero(logoStacked, mark) {
  const sceneCopy = scenes
    .map(
      (s, i) => `
      <article class="scene" data-active="${i === 0}">
        <p class="scene__kicker">${esc(s.kicker)}</p>
        <h2 class="scene__title">${esc(s.title)}</h2>
        <p class="scene__body">${esc(s.body)}</p>
      </article>`
    )
    .join("");

  const ids = ["home-a", "home-b", "home-c", "home-d", "home-e"];
  const segs = ids.map(() => `<div class="seg" style="--w:.19"></div>`).join("");
  const rows = ids
    .map(
      (id) => `
      <div class="gw" data-stale="false">
        <span class="gw__id">${id}</span>
        <span class="gw__track"><span class="gw__fill" style="--w:.7"></span></span>
        <span class="gw__kw">0.00 kW</span>
        <span class="gw__st">ok</span>
      </div>`
    )
    .join("");

  return `
<div class="journey">
  <div class="stage">
    <div class="stage__glow" aria-hidden="true"></div>

    <div class="titlecard" aria-hidden="true">
      <div class="titlecard__inner">
        ${logoStacked}
        <p>${esc(meta.tagline)}</p>
        <p class="sub">${esc(meta.standfirst)}</p>
      </div>
    </div>

    <div class="wrap stage__head">
      <div class="stage__brand">${mark}<span class="stage__name">Filament OS</span></div>
      <div class="stage__event">${esc(meta.event)}<br>${esc(meta.venue)}</div>
    </div>

    <div class="wrap stage__body">
      <div class="scenes">${sceneCopy}</div>

      <div class="chart" data-status="ok">
        <div class="chart__top">
          <span>Site load · five gateways</span>
          <span class="chart__status">nominal</span>
        </div>
        <div class="meterwrap">
          <div class="meter">${segs}<div class="capline" data-kw="5.00"></div></div>
          <div class="scaleline"><span>0</span><span>${5.4} kW</span></div>
        </div>
        <div class="gws">${rows}</div>
        <p class="chart__note">&nbsp;</p>
      </div>
    </div>

    <div class="wrap stage__foot">
      <div class="ticks">${scenes.map((_, i) => `<span class="tick" data-on="${i === 0}"></span>`).join("")}</div>
      <div class="hint">scroll <span>↓</span></div>
    </div>
  </div>
</div>
<script id="scene-data" type="application/json">${JSON.stringify(
    scenes.map(({ cap, homes, status, note }) => ({ cap, homes, status, note }))
  )}</script>`;
}

/* -------------------------------------------------------------- sections */

const body = () => `
<section id="problem"><div class="wrap">
  ${head(S.problem)}
  <div class="reveal" style="--i:1">${paras(S.problem.body)}</div>
</div></section>

<section id="what"><div class="wrap">
  ${head(S.solution)}
  <div class="planes">
    ${stagger(S.planes, (p, i) => `
      <div class="plane reveal" data-tone="${p.tone}" style="--i:${i}">
        <b>${esc(p.t)}</b><span>${esc(p.d)}</span>
      </div>`)}
  </div>
</div></section>

<section id="boundary"><div class="wrap">
  ${head(S.boundary)}
  <div class="reveal" style="--i:1">${paras(S.boundary.body)}</div>
  <div class="rule open-x reveal" style="--i:2"></div>
  <p class="reveal" style="--i:2"><strong>It proves five things and claims nothing else:</strong></p>
  <ul class="list reveal" data-tone="yes" style="--i:3">${li(S.boundary.proves)}</ul>
  <div class="aside reveal" style="--i:4"><p>${esc(S.boundary.close)}</p></div>
</div></section>

<section id="features"><div class="wrap">
  ${head(S.features)}
  <div class="cols">
    ${stagger(S.features.items, (f, i) => `
      <article class="card reveal" style="--i:${i}">
        <span class="card__n">${esc(f.n)}</span>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.body)}</p>
        <p class="card__key">${esc(f.key)}</p>
      </article>`)}
  </div>
</div></section>

<section id="loop"><div class="wrap">
  ${head(S.loop)}
  <div class="steps">
    ${stagger(S.loop.steps, (s, i) => `
      <div class="step reveal" style="--i:${i}">
        <span class="step__n">${esc(s.n)}</span>
        <span class="step__t">${esc(s.t)}</span>
        <span class="step__d">${esc(s.d)}</span>
      </div>`)}
  </div>
  <div class="aside reveal"><p>${esc(S.loop.aside)}</p></div>
</div></section>

<section id="protocol"><div class="wrap">
  ${head(S.protocol)}
  <div class="reveal"><p class="codelabel">Topics</p><pre>${hlTopic(S.protocol.topics)}</pre></div>
  <div class="codegrid" style="margin-top:22px">
    <div class="reveal" style="--i:1"><p class="codelabel">Telemetry</p><pre>${hlJson(S.protocol.telemetry)}</pre></div>
    <div class="reveal" style="--i:2"><p class="codelabel">Command</p><pre>${hlJson(S.protocol.command)}</pre></div>
  </div>
  <ul class="list reveal" style="--i:3;margin-top:30px">${li(S.protocol.notes)}</ul>
</div></section>

<section id="planner"><div class="wrap">
  ${head(S.planner)}
  <div class="codegrid">
    <div class="reveal"><p class="codelabel">Objective</p><pre>${esc(S.planner.objective)}</pre></div>
    <div class="reveal" style="--i:1">
      <p class="codelabel">Subject to</p>
      <ul class="list">${li(S.planner.constraints)}</ul>
    </div>
  </div>
  <div class="aside reveal" style="--i:2"><p>${esc(S.planner.fallback)}</p></div>
</div></section>

<section id="stack"><div class="wrap">
  ${head(S.stack)}
  <table class="table reveal">
    <thead><tr><th>Layer</th><th>Choice</th><th>Fallback if it fails</th></tr></thead>
    <tbody>${S.stack.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
</div></section>

<section id="standards"><div class="wrap">
  ${head(S.standards)}
  <div class="cols">
    ${stagger(S.standards.items, (x, i) => `
      <article class="card reveal" style="--i:${i}">
        <h3>${esc(x.t)}<span class="badge" data-tone="${x.tone}">${esc(x.badge)}</span></h3>
        <p>${esc(x.d)}</p>
      </article>`)}
  </div>
  <div class="aside reveal" style="--i:3"><p>${esc(S.standards.close)}</p></div>
</div></section>

<section id="acceptance"><div class="wrap">
  ${head(S.acceptance)}
  <ol class="ol reveal">${li(S.acceptance.items)}</ol>
</div></section>

<section id="metrics"><div class="wrap">
  ${head(S.metrics)}
  <table class="table reveal">
    <thead><tr><th>Metric</th><th>Definition</th></tr></thead>
    <tbody>${S.metrics.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
  <div class="aside reveal" style="--i:1"><p>${esc(S.metrics.caveat)}</p></div>
</div></section>

<section id="team"><div class="wrap">
  ${head(S.team)}
  ${stagger(S.team.members, (m, i) => `
    <div class="member reveal" style="--i:${Math.min(i, 3)}">
      <span class="member__n">${esc(m.n)}</span>
      <div>
        <h3>${esc(m.role)}</h3>
        <p>${esc(m.owns)}</p>
        <p class="member__out">${esc(m.out)}</p>
        <p class="member__when">${esc(m.when)}</p>
      </div>
    </div>`)}
  <div class="rule open-x reveal"></div>
  <p class="eyebrow reveal">Dependency discipline</p>
  <ul class="list reveal" style="--i:1">${li(S.team.discipline)}</ul>
</div></section>

<section id="timeline"><div class="wrap">
  ${head(S.timeline)}
  ${stagger(S.timeline.windows, (w, i) => `
    <div class="win reveal" style="--i:${Math.min(i, 3)}">
      <span class="win__h">${esc(w.h)} h</span>
      <div>
        <p class="win__o">${esc(w.o)}</p>
        <p class="win__d">${esc(w.d)}</p>
        <p class="win__no">${esc(w.no)}</p>
      </div>
    </div>`)}
</div></section>

<section id="demo"><div class="wrap">
  ${head(S.demo)}
  ${stagger(S.demo.beats, (b, i) => `
    <div class="beat reveal" style="--i:${Math.min(i, 3)}">
      <span class="beat__t">${esc(b.t)}</span>
      <span class="beat__h">${esc(b.h)}</span>
      <span class="beat__d">${esc(b.d)}</span>
    </div>`)}
</div></section>

<section id="failure"><div class="wrap">
  ${head(S.failure)}
  <table class="table reveal">
    <thead><tr><th>Failure</th><th>Live fallback</th><th>Stored fallback</th></tr></thead>
    <tbody>${S.failure.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
  <div class="aside reveal" style="--i:1"><p>${esc(S.failure.close)}</p></div>
</div></section>

<section id="rules"><div class="wrap">
  ${head(S.rules)}
  <div class="reveal">${paras(S.rules.body)}</div>
  <div class="split" style="margin-top:34px">
    <div class="reveal" style="--i:1">
      <h3 style="color:var(--ok)">Preparation may produce</h3>
      <ul class="list" data-tone="yes">${li(S.rules.allowed)}</ul>
    </div>
    <div class="reveal" style="--i:2">
      <h3 style="color:var(--bad)">It may not produce</h3>
      <ul class="list" data-tone="no">${li(S.rules.forbidden)}</ul>
    </div>
  </div>
  <div class="aside reveal" style="--i:3"><p>${esc(S.rules.close)}</p></div>
</div></section>
`;

/* ----------------------------------------------------------------- build */

const [logoStacked, mark, logo, favicon, css, js] = await Promise.all([
  read(`${BRAND}/logo-stacked.svg`),
  read(`${BRAND}/mark.svg`),
  read(`${BRAND}/logo.svg`),
  read(`${BRAND}/favicon.svg`),
  read(resolve(HERE, "src/styles.css")),
  read(resolve(HERE, "src/scroll.js")),
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>${css}</style>
</head>
<body>
<main>
${hero(strip(logoStacked), strip(mark))}
${body()}
</main>
<footer><div class="wrap foot">
  <div>${strip(logo)}</div>
  <div class="foot__meta">
    ${esc(meta.event)}<br>
    ${esc(meta.venue)}<br>
    Preparation repository · implementation begins at the starting gun
  </div>
</div></footer>
<script>${js}</script>
</body>
</html>
`;

await mkdir(`${OUT}/assets/brand`, { recursive: true });
await writeFile(`${OUT}/index.html`, html);
for (const f of ["logo.svg", "logo-stacked.svg", "mark.svg", "favicon.svg", "mark-mono.svg"]) {
  await copyFile(`${BRAND}/${f}`, `${OUT}/assets/brand/${f}`);
}

console.log(`  dist/index.html  ${(html.length / 1024).toFixed(1)} kB`);
