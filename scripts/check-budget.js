/*
 * First-visit budget: each built page plus the CSS and JS it loads up front
 * (stylesheets, the module entry and its modulepreloads) must stay at or under
 * 50 KB gzipped. Fonts and images are excluded, and so are lazy chunks such as
 * section modules and GSAP, which load only when a section is near.
 *
 * It also warns (without failing) when a page's HTML alone passes 14 KB
 * gzipped: about what a server can send in the first round trip of a new
 * connection, so under it the whole document arrives at once.
 *
 *   npm run build && npm run budget
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "dist";
const BUDGET = 50 * 1024;
const HTML_WARN = 14 * 1024;
const ASSET_PATTERN = /<(?:link[^>]*\brel="(?:stylesheet|modulepreload)"[^>]*\bhref|script[^>]*\bsrc)="\/?([^"]+\.(?:css|js))"/g;

const gz = (file) => gzipSync(readFileSync(join(DIST, file))).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

let failed = false;
for (const page of readdirSync(DIST).filter((file) => file.endsWith(".html"))) {
  const html = readFileSync(join(DIST, page), "utf8");
  const assets = [...new Set([...html.matchAll(ASSET_PATTERN)].map((match) => match[1]))];
  const sizes = [[page, gz(page)], ...assets.map((asset) => [asset, gz(asset)])];
  const total = sizes.reduce((sum, [, size]) => sum + size, 0);
  const over = total > BUDGET;
  failed ||= over;
  console.log(`${over ? "✗" : "✓"} ${page}: ${kb(total)} of ${kb(BUDGET)}`);
  for (const [file, size] of sizes) console.log(`    ${kb(size).padStart(8)}  ${file}`);
  if (sizes[0][1] > HTML_WARN) {
    console.log(`    ! the HTML alone is over ${kb(HTML_WARN)}, so it needs more than one round trip`);
  }
}

if (failed) {
  console.error("\nOver the first-visit budget. Lazy-load what isn't needed for the first paint.");
  process.exit(1);
}
