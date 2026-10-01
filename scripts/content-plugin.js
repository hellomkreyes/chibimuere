import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PAGE_PATTERN,
  COPY_PATTERN,
  IF_PATTERN,
  ATTR_PATTERN,
  LIST_PATTERN,
  JSON_PATTERN,
  SECTION_PATTERN,
  VAR_PATTERN,
  STRIP_COPY_ATTR_PATTERN,
  attrValuePattern,
  TAG_END_PATTERN,
} from "./content-patterns.js";

/*
 * Every piece of site copy lives in src/content.json and is baked into the
 * HTML at build time (and on every dev-server request). The HTML keeps its own
 * text as a fallback, but content.json wins.
 *
 * Keys resolve against the page's section (<body data-content-page="home">
 * reads content.home), except keys starting with "site.", which read the
 * shared content.site section used by every page, and "page:key", which reads
 * another page's section (resume.html's nav uses "home:artsy.pictures").
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
 *   <section id="artsy" data-copy-if="artsy.pictures artsy.webring">…</section>
 *   <a href="#artsy" data-copy-if="artsy.pictures artsy.webring">…</a>
 *     → the whole element is dropped unless at least one of the
 *       space-separated keys has content (not unset, "", false, an empty
 *       object, or a list with no shown items), so a section and its nav link
 *       only ship once their content exists. Runs before the other hooks.
 *       Same nesting limit as data-copy.
 *
 * Templates: {{key}} inserts a value (item fields first, then page/site keys),
 * {{#key}}…{{/key}} renders only when the value is set, {{^key}}…{{/key}} only
 * when it isn't (sections can nest), and {{@num}} is the item's position as
 * 01, 02, ….
 */

function getValue(source, key) {
  return key.split(".").reduce((value, part) => value?.[part], source);
}

function hasContent(value) {
  if (value === undefined || value === null || value === "" || value === false) return false;
  if (Array.isArray(value)) return value.some((item) => item?.show !== false);
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

// Values are authored HTML (so <em>, <br> and entities pass through), but a
// straight quote would end an attribute early, so encode it everywhere.
const safe = (value) => String(value).replaceAll('"', "&quot;");

function render(template, lookup) {
  const isSet = (value) => value !== undefined && value !== null && value !== "" && value !== false;
  // Repeat until nothing changes, so a section can sit inside another one.
  let out = template;
  for (let prev; out !== prev; ) {
    prev = out;
    out = out.replace(SECTION_PATTERN, (_, kind, key, inner) =>
      isSet(lookup(key)) === (kind === "#") ? inner : ""
    );
  }
  return out
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
  const resolveKey = (key) => {
    if (key.startsWith("site.")) return getValue(content, key);
    const colon = key.indexOf(":");
    if (colon > 0) return getValue(content[key.slice(0, colon)], key.slice(colon + 1));
    return getValue(pageContent, key);
  };
  const missing = (key) =>
    warn(`[content] Missing "${key.startsWith("site.") ? key : key.includes(":") ? key.replace(":", ".") : `${page}.${key}`}", keeping the HTML fallback`);

  return html
    .replace(IF_PATTERN, (match, open, _tag, keys, rest) =>
      keys.trim().split(/\s+/).some((key) => hasContent(resolveKey(key))) ? `${open}${rest}` : ""
    )
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
      let out = tag.replace(STRIP_COPY_ATTR_PATTERN, "");
      for (const pair of spec.split(";")) {
        const eq = pair.indexOf("=");
        if (eq < 0) continue;
        const attr = pair.slice(0, eq).trim();
        const value = render(pair.slice(eq + 1).trim(), (key) => {
          const found = resolveKey(key);
          if (found === undefined) missing(key);
          return found;
        });
        const attrPattern = attrValuePattern(attr);
        out = attrPattern.test(out)
          ? out.replace(attrPattern, (_, start, end) => `${start}${value}${end}`)
          : out.replace(TAG_END_PATTERN, (end) => ` ${attr}="${value}"${end}`);
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
