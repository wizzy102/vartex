// Tiny static server for local development: npm run dev  ->  http://localhost:5173
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 5173;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".json": "application/json", ".md": "text/plain; charset=utf-8" };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = resolve(ROOT, "." + (path.endsWith("/") ? path + "index.html" : path));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" }).end(body);
  } catch { res.writeHead(404).end("not found"); }
}).listen(PORT, () => console.log(`VARTEX running at http://localhost:${PORT}`));
