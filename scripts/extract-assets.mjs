/**
 * Extracts base64-encoded assets from HTML/CSS fragments into real files.
 *
 * What it does:
 *   1. layout/head.html  → collects ALL <style> blocks, extracts base64 from
 *                          CSS, writes combined CSS → public/boxen.css,
 *                          removes inline <style> blocks, adds single <link>.
 *                          Also strips the SingleFile CSP meta that would
 *                          block loading external stylesheets.
 *   2. HTML sections & partials → extracts src="data:image/…;base64,…"
 *                                 → public/images/
 *
 * CSS url() patterns handled:
 *   - url("data:mime;base64,DATA")   — double-quoted
 *   - url('data:mime;base64,DATA')   — single-quoted
 *   - url(data:mime;base64,DATA)     — unquoted (fonts)
 *   - url(data:mime;charset=…;base64,\ DATA) — with charset + backslash-continuation
 *
 * Run: node scripts/extract-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src/content/boxen");
const PUBLIC_IMAGES = path.join(ROOT, "public/images");
const PUBLIC_FONTS = path.join(ROOT, "public/fonts");
const BASE = "/boxing-prototype";

fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
fs.mkdirSync(PUBLIC_FONTS, { recursive: true });

const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "font/woff2": "woff2",
  "font/woff": "woff",
  "font/ttf": "ttf",
  "font/otf": "otf",
  "application/font-woff": "woff",
  "application/font-woff2": "woff2",
  "application/x-font-woff": "woff",
};

function fileExt(mime) {
  return MIME_EXT[mime] ?? mime.split("/").pop().replace(/\+.*/, "");
}

function isFont(mime) {
  return (
    mime.startsWith("font/") ||
    mime.startsWith("application/font") ||
    mime.startsWith("application/x-font")
  );
}

const counters = {};
function uniqueName(prefix, mime) {
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  return `${prefix}-${String(counters[prefix]).padStart(2, "0")}.${fileExt(mime)}`;
}

/** Decode and save a base64 asset; return its public path. */
function saveAsset(rawB64, mime, prefix) {
  // Strip CSS line-continuation chars and whitespace from base64 data
  const b64 = rawB64.replace(/[^A-Za-z0-9+/=]/g, "");
  if (!b64) return null;

  const filename = uniqueName(prefix, mime);
  const destDir = isFont(mime) ? PUBLIC_FONTS : PUBLIC_IMAGES;
  fs.writeFileSync(path.join(destDir, filename), Buffer.from(b64, "base64"));
  const kb = Math.round(Buffer.byteLength(b64, "base64") / 1024);
  const dir = isFont(mime) ? "fonts" : "images";
  console.log(`    ${filename} (${kb} KB)`);
  return `${BASE}/${dir}/${filename}`;
}

/**
 * Replace every url("data:…"), url('data:…'), and url(data:…) pattern
 * in the given CSS string, saving assets to disk.
 */
function extractCssAssets(css, imgPrefix, fontPrefix) {
  // ── Double-quoted ─────────────────────────────────────────────────────────
  css = css.replace(
    /url\("data:([^;,"]+)(?:;[^,"]+)?;base64,([^"]+)"\)/g,
    (_m, mime, b64) => {
      const p = saveAsset(b64, mime, isFont(mime) ? fontPrefix : imgPrefix);
      return p ? `url("${p}")` : _m;
    }
  );

  // ── Single-quoted ─────────────────────────────────────────────────────────
  css = css.replace(
    /url\('data:([^;,']+)(?:;[^,']+)?;base64,([^']+)'\)/g,
    (_m, mime, b64) => {
      const p = saveAsset(b64, mime, isFont(mime) ? fontPrefix : imgPrefix);
      return p ? `url('${p}')` : _m;
    }
  );

  // ── Unquoted (fonts use this; base64 data may not contain ')') ────────────
  // Handles optional charset param and optional backslash-space continuation.
  css = css.replace(
    /url\(data:([^;,)]+)(?:;[^,)]+)?;base64,\\? ?([^)]+)\)/g,
    (_m, mime, b64) => {
      const p = saveAsset(b64, mime, isFont(mime) ? fontPrefix : imgPrefix);
      return p ? `url("${p}")` : _m;
    }
  );

  return css;
}

// ── head.html ─────────────────────────────────────────────────────────────────

function processHead() {
  const headPath = path.join(CONTENT_DIR, "layout/head.html");
  let html = fs.readFileSync(headPath, "utf-8");

  // Remove SingleFile CSP meta — blocks loading external stylesheets
  html = html.replace(/<meta http-equiv=content-security-policy[^>]*>/gi, "");

  // Collect CSS from ALL <style> blocks
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  const cssChunks = [];
  let m;
  while ((m = styleRe.exec(html)) !== null) {
    cssChunks.push(m[1]);
  }

  if (!cssChunks.length) {
    console.error("⚠  No <style> blocks found in head.html");
    return;
  }

  console.log(`Found ${cssChunks.length} <style> blocks in head.html`);
  let allCss = cssChunks.join("\n");

  console.log("Extracting CSS assets…");
  allCss = extractCssAssets(allCss, "bg", "font");

  fs.writeFileSync(path.join(ROOT, "public/boxen.css"), allCss);
  console.log(`  → public/boxen.css (${Math.round(allCss.length / 1024)} KB)\n`);

  // Remove all <style> blocks; insert single <link> before </head>
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  html = html.replace("</head>", `<link rel="stylesheet" href="${BASE}/boxen.css">\n</head>`);

  fs.writeFileSync(headPath, html);
  console.log("Updated layout/head.html\n");
}

// ── HTML section / partial files ──────────────────────────────────────────────

function processHtmlDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith(".html")) continue;
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, "utf-8");
    const orig = html;
    const prefix = file.replace(".html", "");

    // src="data:image/…;base64,…" in <img> tags
    html = html.replace(/src="data:([^;]+);base64,([^"]+)"/g, (_m, mime, b64) => {
      const p = saveAsset(b64, mime, prefix);
      return p ? `src="${p}"` : _m;
    });

    if (html !== orig) {
      fs.writeFileSync(filePath, html);
      console.log(`  Updated ${path.relative(CONTENT_DIR, dir)}/${file}`);
    }
  }
}

processHead();
console.log("Extracting images from HTML sections…");
processHtmlDir(path.join(CONTENT_DIR, "sections"));
processHtmlDir(path.join(CONTENT_DIR, "partials"));
processHtmlDir(path.join(CONTENT_DIR, "navigation"));
console.log("\nDone.");
