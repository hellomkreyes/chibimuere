import { test } from "node:test";
import assert from "node:assert/strict";
import { injectContent } from "./content-plugin.js";

const page = (body) => `<body data-content-page="home">${body}</body>`;
const run = (body, home, site = {}) => {
  const warnings = [];
  const html = injectContent(page(body), { home, site }, (msg) => warnings.push(msg));
  return { html: html.replace(/^<body[^>]*>|<\/body>$/g, ""), warnings };
};

test("data-copy-if keeps the element and strips the hook when the key has content", () => {
  const { html } = run('<section id="artsy" class="x" data-copy-if="artsy.pictures"><h2>Artsy</h2></section>', {
    artsy: { pictures: [{ file: "a.png" }] },
  });
  assert.equal(html, '<section id="artsy" class="x"><h2>Artsy</h2></section>');
});

test("data-copy-if drops the element and its nav link when the key is empty", () => {
  const empties = [undefined, null, "", false, [], {}, [{ show: false }]];
  for (const pictures of empties) {
    const { html } = run(
      '<nav><a href="#artsy" data-copy-if="artsy.pictures">Artsy</a><a href="#contact">Contact</a></nav>' +
        '<section id="artsy" data-copy-if="artsy.pictures"><p>placeholder</p></section>',
      { artsy: { pictures } }
    );
    assert.equal(html, '<nav><a href="#contact">Contact</a></nav>', `pictures = ${JSON.stringify(pictures)}`);
  }
});

test("data-copy-if reads site keys", () => {
  assert.equal(run('<div data-copy-if="site.cookie">🍪</div>', {}, { cookie: { peek: "hi" } }).html, "<div>🍪</div>");
  assert.equal(run('<div data-copy-if="site.cookie">🍪</div>', {}, {}).html, "");
});

test("hooks inside a dropped element don't warn about missing keys", () => {
  const { html, warnings } = run(
    '<section data-copy-if="rotation.people"><h2 data-copy="rotation.title">x</h2><template data-copy-list="rotation.people"><b>{{name}}</b></template></section>',
    {}
  );
  assert.equal(html, "");
  assert.deepEqual(warnings, []);
});

test("other hooks still render inside a kept element", () => {
  const { html } = run(
    '<section data-copy-if="rotation.people"><h2 data-copy="rotation.title">x</h2><template data-copy-list="rotation.people"><b>{{name}}</b></template></section>',
    { rotation: { title: "Rotation", people: [{ name: "A" }, { name: "B", show: false }] } }
  );
  assert.equal(html, '<section><h2 data-copy="rotation.title">Rotation</h2><b>A</b></section>');
});

test("data-copy-if keeps the element when any of its keys has content", () => {
  const body = '<section data-copy-if="artsy.pictures artsy.webring">x</section>';
  assert.equal(run(body, { artsy: { pictures: [], webring: [{ name: "w" }] } }).html, "<section>x</section>");
  assert.equal(run(body, { artsy: { pictures: [], webring: [] } }).html, "");
});

test("page:key reads another page's section, for nav links on other pages", () => {
  const html = injectContent(
    '<body data-content-page="resume"><a href="index.html#artsy" data-copy-if="home:artsy.pictures">Artsy</a></body>',
    { home: { artsy: { pictures: [{ file: "a.png" }] } }, resume: {} }
  );
  assert.equal(html, '<body data-content-page="resume"><a href="index.html#artsy">Artsy</a></body>');
  assert.equal(
    injectContent('<body data-content-page="resume"><a data-copy-if="home:artsy.pictures">Artsy</a></body>', { home: {}, resume: {} }),
    '<body data-content-page="resume"></body>'
  );
});
