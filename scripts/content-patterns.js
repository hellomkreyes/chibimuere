/*
 * These are the patterns content-plugin.js uses to find the content hooks in
 * the HTML and the {{…}} placeholders in templates. Changing one changes the
 * built HTML.
 */

/**
 * Matches the opening of the page's `<body>` tag and reads its
 * `data-content-page` attribute, which says which section of content.json
 * the page uses.
 *
 * Captures the page name.
 *
 * Example: `<body id="top" data-content-page="home">`
 */
export const PAGE_PATTERN = /<body\b[^>]*\bdata-content-page="([^"]+)"/;

/**
 * Matches an element carrying a `data-copy="…"` attribute, along with
 * everything between its opening and closing tags.
 *
 * Captures the opening tag, the tag name, the content key, the fallback
 * text between the tags, and the closing tag.
 *
 * Known limit: it stops at the first closing tag of the same name, so it's
 * only for elements with no nested element of the same tag.
 *
 * Example: `<p class="tag" data-copy="hero.eyebrow">a tiny vessel of big ideas</p>`
 */
export const COPY_PATTERN =
  /(<([a-z][a-z0-9]*)\b[^>]*?\sdata-copy="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi;

/**
 * Matches a whole opening tag that carries a `data-copy-attr="…"`
 * attribute, whose value lists one or more `attr={{template}}` pairs
 * separated by `;`.
 *
 * Captures the pair list.
 *
 * Example: `<meta property="og:title" data-copy-attr="content={{meta.title}}" content="chibi muere" />`
 */
export const ATTR_PATTERN = /<[a-z][a-z0-9]*\b[^>]*?\sdata-copy-attr="([^"]+)"[^>]*>/gi;

/**
 * Matches a whole `<template>` element carrying a `data-copy-list="…"`
 * attribute, along with the markup inside it that gets repeated once per
 * array item.
 *
 * Captures the list key and the template markup.
 *
 * Example: `<template data-copy-list="bio.menu"><span>{{value}}</span></template>`
 */
export const LIST_PATTERN = /<template\b[^>]*\bdata-copy-list="([^"]+)"[^>]*>([\s\S]*?)<\/template>/gi;

/**
 * Matches a `<script>` element carrying a `data-copy-json="…"` attribute,
 * along with its (normally empty) contents, so that contents can be
 * replaced with a JSON value.
 *
 * Captures the opening tag, the JSON key, and the closing tag.
 *
 * Example: `<script type="application/json" id="ui-copy" data-copy-json="site.ui"></script>`
 */
export const JSON_PATTERN = /(<script\b[^>]*\bdata-copy-json="([^"]+)"[^>]*>)[\s\S]*?(<\/script>)/gi;

/**
 * Matches a `{{#key}}…{{/key}}` or `{{^key}}…{{/key}}` block in a
 * template, which shows or hides the text inside depending on whether the
 * key's value is set.
 *
 * Captures which kind it is (`#` for "shown when set", `^` for "shown when
 * not set"), the key, and the text between the opening and closing markers.
 *
 * Example: `{{#link}}<a>{{title}}</a>{{/link}}`
 */
export const SECTION_PATTERN = /{{([#^])([\w.]+)}}([\s\S]*?){{\/\2}}/g;

/**
 * Matches a `{{key}}` placeholder in a template, to be replaced with the
 * key's value (or `{{@num}}`, the item's position).
 *
 * Captures the key.
 *
 * Example: `{{@num}}`
 */
export const VAR_PATTERN = /{{([@\w.]+)}}/g;

/**
 * Matches the `data-copy-attr="…"` hook, including the space before it,
 * so the plugin can strip the hook from the tag once the attributes it
 * lists have been set.
 *
 * Example: ` data-copy-attr="content={{meta.title}}"` in `<meta property="og:title" data-copy-attr="content={{meta.title}}" content="chibi muere" />`
 */
export const STRIP_COPY_ATTR_PATTERN = /\sdata-copy-attr="[^"]*"/;

/**
 * Builds a pattern for one attribute name, finding an existing
 * `name="…"` on a tag so its value can be replaced.
 *
 * Captures the part up to and including the opening quote, and the
 * closing quote, so the value between them can be swapped out.
 *
 * Example: `attrValuePattern("content")` matches ` content="Old description"`
 */
export const attrValuePattern = (attr) => new RegExp(`(\\s${attr}=")[^"]*(")`);

/**
 * Matches the end of a tag (`>` or `/>`, with any whitespace before it),
 * where a new attribute gets inserted.
 *
 * Example: ` />` at the end of `<meta content="x" />`
 */
export const TAG_END_PATTERN = /\s*\/?>$/;
