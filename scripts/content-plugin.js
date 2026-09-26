import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/*
 * Every piece of site copy lives in src/content.json and is baked into the
 * HTML at build time (and on every dev-server request). The HTML keeps its own
 * text as a fallback, but content.json wins.
 *
 * Keys resolve against the page's section (<body data-content-page="home">
 * reads content.home), except keys starting with "site.", which read the
 * shared content.site section used by every page.
 *
 *   <p data-copy="hero.lede">…</p>
 *     → the element's inner HTML. Only for elements with no nested element of
 *       the same tag (the pattern stops at the first matching closing tag).
 *
 *   <meta data-copy-attr="content={{meta.description}}">
 *     → sets attributes; "attr={{template}}" pairs separated by ";".
 *
 *   <template data-copy-list="portfolio.projects">…{{title}}…</template>
 *     → the template repeated once per array item (items with show: false are
 *       skipped), replacing the <template> element.
 *
 *   <script type="application/json" data-copy-json="site.ui"></script>
 *     → that value as JSON, for strings the scripts put on the page.
 *
 * Templates: {{key}} inserts a value (item fields first, then page/site keys),
 * {{#key}}…{{/key}} renders only when the value is set, {{^key}}…{{/key}} only
 * when it isn't, and {{@num}} is the item's position as 01, 02, ….
 */

const PAGE_PATTERN = /<body\b[^>]*\bdata-content-page="([^"]+)"/;
const COPY_PATTERN =
  /(<([a-z][a-z0-9]*)\b[^>]*?\sdata-copy="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi;
const ATTR_PATTERN = /<[a-z][a-z0-9]*\b[^>]*?\sdata-copy-attr="([^"]+)"[^>]*>/gi;
const LIST_PATTERN = /<template\b[^>]*\bdata-copy-list="([^"]+)"[^>]*>([\s\S]*?)<\/template>/gi;
const JSON_PATTERN = /(<script\b[^>]*\bdata-copy-json="([^"]+)"[^>]*>)[\s\S]*?(<\/script>)/gi;
const SECTION_PATTERN = /{{([#^])([\w.]+)}}([\s\S]*?){{\/\2}}/g;
const VAR_PATTERN = /{{([@\w.]+)}}/g;

function getValue(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source);
}

// Values are authored HTML (so <em>, <br> and entities pass through), but a
// straight quote would end an attribute early, so encode it everywhere.
const safe = (value) => String(value).replaceAll('"', "&quot;");

function render(template, lookup) {
  const isSet = (value) => value !== undefined && value !== null && value !== "" && value !== false;
  return template
    .replace(SECTION_PATTERN, (_, kind, key, inner) =>
      isSet(lookup(key)) === (kind === "#") ? inner : ""
    )
    .replace(VAR_PATTERN, (match, key) => {
      const value = lookup(key);
      return isSet(value) ? safe(value) : "";
    });
}

export function injectContent(html, content, warn = console.warn) {
  const page = html.match(PAGE_PATTERN)?.[1];
  if (!page) return html;
  const pageContent = content[page];
  if (!pageContent) {
    warn(`[content] No "${page}" section in content.json`);
    return html;
  }
  const resolveKey = (key) =>
    key.startsWith("site.") ? getValue(content, key) : getValue(pageContent, key);
  const missing = (key) => warn(`[content] Missing "${key.startsWith("site.") ? key : `${page}.${key}`}", keeping the HTML fallback`);

  return html
    .replace(LIST_PATTERN, (match, key, template) => {
      const items = resolveKey(key);
      if (!Array.isArray(items)) {
        missing(key);
        return "";
      }
      return items
        .filter((item) => item?.show !== false)
        .map((item, index) =>
          render(template, (field) => {
            if (field === "@num") return String(index + 1).padStart(2, "0");
            const own = typeof item === "object" ? getValue(item, field) : field === "value" ? item : undefined;
            return own !== undefined ? own : resolveKey(field);
          }).trim()
        )
        .join("\n");
    })
    .replace(ATTR_PATTERN, (tag, spec) => {
      let out = tag.replace(/\sdata-copy-attr="[^"]*"/, "");
      for (const pair of spec.split(";")) {
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        const attr = pair.slice(0, eq).trim();
        const value = render(pair.slice(eq + 1).trim(), (key) => {
          const found = resolveKey(key);
          if (found === undefined) missing(key);
          return found;
        });
        const attrPattern = new RegExp(`(\\s${attr}=")[^"]*(")`);
        out = attrPattern.test(out)
          ? out.replace(attrPattern, (_, start, end) => `${start}${value}${end}`)
          : out.replace(/\s*\/?>$/, (end) => ` ${attr}="${value}"${end}`);
      }
      return out;
    })
    .replace(COPY_PATTERN, (match, open, _tag, key, _fallback, close) => {
      const value = resolveKey(key);
      if (typeof value !== "string") {
        missing(key);
        return match;
      }
      return `${open}${value}${close}`;
    })
    .replace(JSON_PATTERN, (match, open, key, close) => {
      const value = resolveKey(key);
      if (value === undefined) {
        missing(key);
        return match;
      }
      return `${open}${JSON.stringify(value).replaceAll("</", "<\\/")}${close}`;
    });
}

/**
 * Bakes copy from content.json into the HTML at build time (and on every
 * dev-server request), so there's no runtime fetch and no flash of fallback
 * text.
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
