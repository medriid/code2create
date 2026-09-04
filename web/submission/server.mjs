// Zero-dependency static server. No npm install, no network, no build tooling —
// which matters when the venue wifi is a rumour and the laptop is not yours.
import { createServer } from "node:http";
import { readFile, stat, watch } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { spawn } from "node:child_process";

const HERE = new URL(".", import.meta.url).pathname;
const ROOT = resolve(HERE, "dist");
const PORT = Number(process.env.PORT) || 5173;
const WATCH = process.argv.includes("--watch");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const rebuild = () =>
  new Promise((done) => {
    const p = spawn(process.execPath, [resolve(HERE, "build.mjs")], { stdio: "inherit" });
    p.on("close", done);
  });

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    // normalize() then a prefix check: no request may escape dist/
    let path = join(ROOT, normalize(decodeURIComponent(url.pathname)));
    if (!path.startsWith(ROOT)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    const info = await stat(path).catch(() => null);
    if (info?.isDirectory()) path = join(path, "index.html");

    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(path)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("not found");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} is already in use.`);
    console.error(`  Either something else is serving, or a previous run is still alive.`);
    console.error(`  Try:  PORT=${PORT + 1} npm start\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`\n  FILAMENT OS · submission site`);
  console.log(`  http://localhost:${PORT}\n`);
});

if (WATCH) {
  console.log("  watching src/ and content.mjs\n");
  for (const target of [resolve(HERE, "src"), resolve(HERE, "content.mjs")]) {
    (async () => {
      for await (const _ of watch(target, { recursive: true })) await rebuild();
    })().catch(() => {});
  }
}
