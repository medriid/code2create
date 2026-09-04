import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const HERE = dirname(new URL(import.meta.url).pathname);
const at = (f) => resolve(HERE, f);
const load = (f) => readFileSync(at(f), "utf8").replace(/ width="[\d.]+" height="[\d.]+"/, "");
const [mark, logo, stacked, mono, fav] = ["mark.svg","logo.svg","logo-stacked.svg","mark-mono.svg","favicon.svg"].map(load);
const logoDark = (()=>{try{return load("logo-ink.svg")}catch{return logo}})();
writeFileSync(at("preview.html"), `<!doctype html><meta charset=utf-8>
<style>
 body{margin:0;background:#0b0a0d;color:#e8e4de;font:13px/1.5 ui-sans-serif,system-ui;padding:24px}
 .row{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:22px}
 figure{margin:0;background:#0d0b10;border:1px solid #23212a;border-radius:16px;padding:18px;
        display:flex;flex-direction:column;align-items:center;gap:12px}
 figure.light{background:#f6f4f0;border-color:#e0ddd6;color:#3a3630}
 figcaption{opacity:.5;font-size:11px;letter-spacing:.04em}
 svg{width:100%;height:auto;display:block}
</style>
<figure><div style="width:640px">${logo}</div><figcaption>horizontal lockup</figcaption></figure>
<div class=row>
  <figure class=light><div style="width:420px">${logoDark}</div><figcaption>on light</figcaption></figure>
  <figure><div style="width:230px">${stacked}</div><figcaption>stacked</figcaption></figure>
</div>
<div class=row>
  <figure><div style="width:180px">${mark}</div><figcaption>mark</figcaption></figure>
  <figure><div style="width:64px">${mark}</div><figcaption>64</figcaption></figure>
  <figure><div style="width:32px">${mark}</div><figcaption>32</figcaption></figure>
  <figure><div style="width:64px">${fav}</div><figcaption>favicon 64</figcaption></figure>
  <figure><div style="width:32px">${fav}</div><figcaption>32</figcaption></figure>
  <figure><div style="width:16px">${fav}</div><figcaption>16</figcaption></figure>
  <figure style="color:#e8e4de"><div style="width:110px">${mono}</div><figcaption>mono</figcaption></figure>
  <figure class=light style="color:#26221c"><div style="width:110px">${mono}</div><figcaption>mono ink</figcaption></figure>
</div>`);
