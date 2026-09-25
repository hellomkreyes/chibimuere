import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PAGE_PATTERN = /<body\b[^>]*\bdata-content-page="([^"]+)"/;
// Matches <tag ... data-copy="key" ...>fallback</tag>. Safe for this markup
// because no data-copy element contains a nested element of the same tag.
const COPY_PATTERN =
  /(<([a-z][a-z0-9]*)\b[^>]*?\sdata-copy="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi;

function getValue(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source);
}

export function injectContent(html, content, warn = console.warn) {
  const page = html.match(PAGE_PATTERN)?.[1];
  if (!page) return html;
  const pageContent = content[page];
  if (!pageContent) {
    warn(`[content] No "${page}" section in content.json`);
    return html;
  }
  return html.replace(COPY_PATTERN, (match, open, _tag, key, _fallback, close) => {
    const value = getValue(pageContent, key);
    if (typeof value !== "string") {
      warn(`[content] Missing "${page}.${key}", keeping the HTML fallback`);
      return match;
    }
    return `${open}${value}${close}`;
  });
}

/**
 * Bakes copy from content.json into elements marked with data-copy at build
 * time (and on every dev-server request), so there's no runtime fetch and no
 * flash of fallback text.
 */
export function contentPlugin(file = "src/content.json") {
  const contentPath = resolve(file);
  return {
    name: "chibi-content",
    configureServer(server) {
      server.watcher.add(contentPath);
      server.watcher.on("change", (changed) => {
        if (resolve(changed) === contentPath) server.ws.send({ type: "full-reload" });
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const content = JSON.parse(readFileSync(contentPath, "utf8"));
        return injectContent(html, content, (msg) => this?.warn ? this.warn(msg) : console.warn(msg));
      },
    },
  };
}
