/**
 * One-time splitter: reads src/content/boxen.html and writes modular partials.
 * Run: node scripts/split-boxen-content.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/content/boxen");
const SOURCE = path.resolve("src/content/boxen.source.html");

const SECTIONS = [
  { file: "01-hero.html", start: 188, end: 236, title: "Hero — Welcome slideshow" },
  { file: "02-intro.html", start: 237, end: 293, title: "Intro — Brand statement" },
  { file: "03-fighting-spirit.html", start: 294, end: 436, title: "Features — Fighting spirit" },
  { file: "04-programs.html", start: 437, end: 605, title: "Programs — Get fit while having fun" },
  { file: "05-pricing.html", start: 606, end: 754, title: "Pricing — Training plans" },
  { file: "06-benefits.html", start: 755, end: 886, title: "Benefits — Stay fit and strong" },
  { file: "07-coaches.html", start: 887, end: 1040, title: "Coaches — Meet our team" },
  { file: "08-news.html", start: 1041, end: 1223, title: "News — Good news about Boxen" },
  { file: "09-blog.html", start: 1224, end: 1341, title: "Blog — Articles about boxing" },
  { file: "10-contact.html", start: 1342, end: 1425, title: "Contact — Further info" },
  { file: "11-cta.html", start: 1426, end: 1470, title: "CTA — Final call to action" },
];

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function readLines(filePath) {
  return fs.readFileSync(filePath, "utf8").split("\n");
}

function sliceLines(lines, start, end) {
  return lines.slice(start - 1, end).join("\n");
}

function tagName(line) {
  const match = line.trim().match(/^<\/?([a-zA-Z0-9:-]+)/);
  return match?.[1]?.toLowerCase() ?? null;
}

function isOpeningTag(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("<") || trimmed.startsWith("<!") || trimmed.startsWith("<!--")) {
    return false;
  }
  if (trimmed.startsWith("</")) return false;
  if (trimmed.endsWith("/>")) return false;
  if (trimmed.includes("</")) return false;

  const name = tagName(trimmed);
  if (!name || VOID_TAGS.has(name)) return false;
  return true;
}

function isClosingTag(line) {
  return line.trim().startsWith("</");
}

/** Indent line-based HTML without touching inline base64 payloads. */
function formatHtml(html) {
  const lines = html.split("\n");
  let depth = 0;
  const formatted = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (isClosingTag(line)) {
      depth = Math.max(0, depth - 1);
    }

    formatted.push(`${"  ".repeat(depth)}${line}`);

    if (isOpeningTag(line)) {
      depth += 1;
    }
  }

  return `${formatted.join("\n")}\n`;
}

function writePart(relativePath, html) {
  const filePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, formatHtml(html));
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }

  const lines = readLines(SOURCE);

  writePart("layout/head.html", sliceLines(lines, 1, 96));
  writePart("layout/body-open.html", sliceLines(lines, 97, 98));
  writePart("layout/main-open.html", sliceLines(lines, 187, 187));
  writePart("layout/main-close.html", sliceLines(lines, 1471, 1471));
  writePart("layout/body-close.html", sliceLines(lines, 1652, 1656));

  writePart("partials/header-before-nav.html", sliceLines(lines, 99, 124));
  writePart("navigation/header-menu.html", sliceLines(lines, 125, 136));
  writePart("partials/header-after-nav.html", sliceLines(lines, 137, 186));

  for (const section of SECTIONS) {
    writePart(`sections/${section.file}`, sliceLines(lines, section.start, section.end));
  }

  writePart("partials/footer-before-nav.html", sliceLines(lines, 1473, 1580));
  writePart("navigation/footer-menu.html", sliceLines(lines, 1581, 1588));
  writePart("partials/footer-after-nav.html", sliceLines(lines, 1589, 1651));

  console.log(`Wrote modular content to ${ROOT}`);
}

main();
