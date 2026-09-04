import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Outputs land beside this script, not wherever it happened to be invoked from.
const HERE = dirname(new URL(import.meta.url).pathname);

const r = (n) => Math.round(n * 100) / 100;

/* ---------------------------------------------------------------- the coil */

const COIL = {
  loops: 3, n0: [17, 46], n1: [44.5, 20.5],
  reach: 13.5, push: 6.2, leadIn: 11, nodeGap: 7, nodeR: 4.6, stroke: 4.0,
};

function coilPath(P) {
  const [ax, ay] = P.n0, [bx, by] = P.n1;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const px = uy, py = -ux;

  let d = `M ${r(ax - ux * P.leadIn)} ${r(ay - uy * P.leadIn)} L ${r(ax)} ${r(ay)}`;
  for (let i = 0; i < P.loops; i++) {
    const t0 = i / P.loops, t1 = (i + 1) / P.loops;
    const s = [ax + dx * t0, ay + dy * t0];
    const e = [ax + dx * t1, ay + dy * t1];
    const c1 = [s[0] + px * P.reach - ux * P.push, s[1] + py * P.reach - uy * P.push];
    const c2 = [e[0] + px * P.reach + ux * P.push, e[1] + py * P.reach + uy * P.push];
    d += ` C ${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(e[0])} ${r(e[1])}`;
  }
  const node = [bx + ux * P.nodeGap, by + uy * P.nodeGap];
  return { d: d + ` L ${r(node[0])} ${r(node[1])}`, node };
}

/* ----------------------------------------------------- the wire "FILAMENT" */
/* Every letter in FILAMENT is made only of straight segments, so the wordmark
   can be bent from the same wire as the mark: same weight, same round caps.  */

const H = 28; // cap height

const seg = (pts) => pts.map(([[x1,y1],[x2,y2]]) => `M ${r(x1)} ${r(y1)} L ${r(x2)} ${r(y2)}`).join(" ");

const GLYPHS = {
  F: { w: 17, path: (w) => seg([[[0,0],[0,H]], [[0,0],[w,0]], [[0,13],[w*0.78,13]]]) },
  I: { w: 0,  path: ()  => seg([[[0,0],[0,H]]]) },
  L: { w: 15, path: (w) => seg([[[0,0],[0,H]], [[0,H],[w,H]]]) },
  A: { w: 20, path: (w) => seg([[[0,H],[w/2,0]], [[w/2,0],[w,H]], [[w*0.339,19],[w*0.661,19]]]) },
  M: { w: 22, path: (w) => seg([[[0,H],[0,0]], [[0,0],[w/2,16.5]], [[w/2,16.5],[w,0]], [[w,0],[w,H]]]) },
  E: { w: 15, path: (w) => seg([[[0,0],[0,H]], [[0,0],[w,0]], [[0,13],[w*0.78,13]], [[0,H],[w,H]]]) },
  N: { w: 18, path: (w) => seg([[[0,H],[0,0]], [[0,0],[w,H]], [[w,H],[w,0]]]) },
  T: { w: 18, path: (w) => seg([[[0,0],[w,0]], [[w/2,0],[w/2,H]]]) },
  // A loop of the same wire.
  O: { w: 21, path: (w) => `M ${r(w/2)} 0 A ${r(w/2)} ${r(H/2)} 0 1 1 ${r(w/2)} ${H} A ${r(w/2)} ${r(H/2)} 0 1 1 ${r(w/2)} 0` },
  // Two tangent circles of the same radius, so the wire turns without a kink.
  S: { w: 14, path: (w) => { const q = H / 4;
        return `M ${r(w)} ${r(q)} A ${r(q)} ${r(q)} 0 1 0 ${r(w/2)} ${r(H/2)} A ${r(q)} ${r(q)} 0 1 1 0 ${r(H-q)}`; } },
  " ": { w: 12, path: () => "" },
};

function wordmark(word, tracking = 9.5) {
  let x = 0, out = [];
  for (const ch of word) {
    const g = GLYPHS[ch];
    const p = g.path(g.w);
    if (p) out.push(`<path transform="translate(${r(x)} 0)" d="${p}"/>`.replace(/^<path transform="translate\(0 0\)" /, "<path "));
    x += g.w + tracking;
  }
  return { parts: out.join(""), width: x - tracking };
}

/* ------------------------------------------------------------------ assets */

const { d: coilD, node } = coilPath(COIL);
const WORD = wordmark("FILAMENT OS");

const WIRE_STOPS = `
      <stop offset="0" stop-color="#4a5568"/>
      <stop offset=".38" stop-color="#8a7a6a"/>
      <stop offset=".72" stop-color="#ff9f45"/>
      <stop offset="1" stop-color="#ffd9a0"/>`;

const defs = (id, x1, y1, x2, y2, haloAt) => `  <defs>
    <linearGradient id="wire-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">${WIRE_STOPS}
    </linearGradient>
    <radialGradient id="halo-${id}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(${r(haloAt[0])} ${r(haloAt[1])}) scale(17)">
      <stop offset="0" stop-color="#ffb45c" stop-opacity=".55"/>
      <stop offset=".55" stop-color="#ff9f45" stop-opacity=".12"/>
      <stop offset="1" stop-color="#ff9f45" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

const markBody = (id, dx = 0, dy = 0) => `  <g transform="translate(${dx} ${dy})">
    <circle cx="${r(node[0])}" cy="${r(node[1])}" r="17" fill="url(#halo-${id})"/>
    <path d="${coilD}" fill="none" stroke="url(#wire-${id})" stroke-width="${COIL.stroke}"
      stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${r(node[0])}" cy="${r(node[1])}" r="${COIL.nodeR}" fill="#ffd9a0"/>
  </g>`;

const write = (name, body) => {
  writeFileSync(resolve(HERE, name), body.trimStart() + "\n");
  console.log("  " + name);
};

/* 1. mark ------------------------------------------------------------------ */
write("mark.svg", `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Filament">
  <title>Filament</title>
${defs("m", 8, 52, 56, 14, node)}
${markBody("m")}
</svg>`);

/* 2. horizontal lockup ----------------------------------------------------- */
for (const [file, id, ink] of [["logo.svg", "h", "#f2ede6"], ["logo-ink.svg", "hi", "#241f1a"]])
{
  const gap = 20, wordY = (64 - H) / 2, wordX = 64 + gap;
  const W = wordX + WORD.width + 3;
  write(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(W)} 64" width="${r(W)}" height="64" role="img" aria-label="Filament">
  <title>Filament</title>
${defs(id, 8, 52, 56, 14, node)}
${markBody(id)}
  <g transform="translate(${r(wordX)} ${r(wordY)})">
    <g fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${WORD.parts}</g>
  </g>
</svg>`);
}

/* 3. stacked lockup -------------------------------------------------------- */
for (const [file, id, ink] of [["logo-stacked.svg", "s", "#f2ede6"], ["logo-stacked-ink.svg", "si", "#241f1a"]])
{
  const gap = 22, W = Math.max(64, WORD.width) + 8;
  const markX = (W - 64) / 2, wordX = (W - WORD.width) / 2, wordY = 64 + gap;
  const Hh = wordY + H + 4;
  write(file, `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(W)} ${r(Hh)}" width="${r(W)}" height="${r(Hh)}" role="img" aria-label="Filament">
  <title>Filament</title>
${defs(id, 8, 52, 56, 14, node)}
${markBody(id, markX, 0)}
  <g transform="translate(${r(wordX)} ${r(wordY)})">
    <g fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${WORD.parts}</g>
  </g>
</svg>`);
}

/* 4. monochrome mark (print, stamps, single-ink) --------------------------- */
write("mark-mono.svg", `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Filament">
  <title>Filament</title>
  <path d="${coilD}" fill="none" stroke="currentColor" stroke-width="${COIL.stroke}"
    stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${r(node[0])}" cy="${r(node[1])}" r="${COIL.nodeR}" fill="currentColor"/>
</svg>`);

/* 5. favicon: two fatter loops so it survives 16px -------------------------- */
{
  const small = coilPath({ ...COIL, loops: 2, n0: [16, 45], n1: [43, 22], reach: 15,
                           push: 7, leadIn: 9, nodeGap: 7.5, nodeR: 6, stroke: 6.5 });
  write("favicon.svg", `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Filament">
  <title>Filament</title>
  <rect width="64" height="64" rx="14" fill="#0d0b10"/>
  <defs>
    <linearGradient id="fw" x1="10" y1="50" x2="54" y2="16" gradientUnits="userSpaceOnUse">${WIRE_STOPS}
    </linearGradient>
  </defs>
  <path d="${small.d}" fill="none" stroke="url(#fw)" stroke-width="6.5"
    stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${r(small.node[0])}" cy="${r(small.node[1])}" r="6" fill="#ffd9a0"/>
</svg>`);
}

console.log(`\nwordmark width ${r(WORD.width)}`);
