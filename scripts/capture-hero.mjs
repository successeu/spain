#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 4173;
const ROOT = resolve(process.cwd());
const TARGET_PATH = "/public/index.html";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function safePathFromUrl(urlPath) {
  const rawPath = urlPath.split("?")[0];
  const normalized = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const target = normalized === "/" ? TARGET_PATH : normalized;
  const full = resolve(ROOT, `.${target}`);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const fullPath = safePathFromUrl(req.url || "/");
      if (!fullPath || !existsSync(fullPath)) {
        res.statusCode = 404;
        res.end("Not Found");
        return;
      }

      const data = await readFile(fullPath);
      const ext = extname(fullPath).toLowerCase();
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      res.end(data);
    } catch {
      res.statusCode = 500;
      res.end("Server error");
    }
  });

  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(PORT, HOST, () => resolveServer(server));
  });
}

async function run() {
  mkdirSync(join(ROOT, "artifacts"), { recursive: true });

  const server = await startStaticServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1512, height: 892 } });

  try {
    const url = `http://${HOST}:${PORT}${TARGET_PATH}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.screenshot({ path: "artifacts/hero-desktop.png", fullPage: false });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await page.screenshot({ path: "artifacts/hero-mobile.png", fullPage: false });

    console.log("Saved screenshots:");
    console.log("- artifacts/hero-desktop.png");
    console.log("- artifacts/hero-mobile.png");
  } finally {
    await browser.close();
    await new Promise((resolveClose, rejectClose) => {
      server.close((err) => (err ? rejectClose(err) : resolveClose()));
    });
  }
}

run().catch((error) => {
  console.error("capture-hero failed:", error?.message || error);
  process.exit(1);
});
