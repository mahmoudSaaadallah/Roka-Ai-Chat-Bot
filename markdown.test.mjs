import assert from "node:assert/strict";
import test from "node:test";

import { renderMarkdown } from "./markdown.mjs";

test("escapes raw HTML before rendering", () => {
  const rendered = renderMarkdown('<script>alert("xss")</script>');
  assert.doesNotMatch(rendered, /<script>/);
  assert.match(rendered, /&lt;script&gt;/);
});

test("renders emphasis and inline code", () => {
  const rendered = renderMarkdown("Use **bold**, *italics*, and `const value = 1`.");
  assert.match(rendered, /<strong>bold<\/strong>/);
  assert.match(rendered, /<em>italics<\/em>/);
  assert.match(rendered, /<code>const value = 1<\/code>/);
});

test("renders fenced code with a language label", () => {
  const rendered = renderMarkdown("```js\nconst answer = 42;\n```");
  assert.match(rendered, />JavaScript<\/span>/);
  assert.match(rendered, /class="language-js"/);
  assert.match(rendered, /data-copy-code/);
});

test("allows safe links and rejects script URLs", () => {
  const safe = renderMarkdown("[OpenAI](https://openai.com)");
  const unsafe = renderMarkdown("[Nope](javascript:alert(1))");
  assert.match(safe, /href="https:\/\/openai.com"/);
  assert.doesNotMatch(unsafe, /href=/);
});

test("renders lists and task items", () => {
  const rendered = renderMarkdown("- first\n- [x] shipped\n- [ ] pending");
  assert.match(rendered, /^<ul>/);
  assert.match(rendered, /checked/);
  assert.match(rendered, /Not completed/);
});

test("renders aligned tables inside a responsive wrapper", () => {
  const rendered = renderMarkdown("Name | Score\n--- | ---:\nRoka | 10");
  assert.match(rendered, /class="table-wrap"/);
  assert.match(rendered, /<th style="text-align:right">Score<\/th>/);
  assert.match(rendered, /<td style="text-align:right">10<\/td>/);
});
