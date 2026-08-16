import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (relative) => readFileSync(resolve(root, relative), "utf8");

test("status reports partial definition and source integrity only", () => {
  const status = read("docs/STATUS.md");
  assert.match(status, /protocol-definition repository/i);
  assert.match(status, /Candidate.*PARTIAL/is);
  assert.match(status, /zero active Profiles or wire schemas/i);
  assert.match(status, /tracked definition graph/i);
  assert.match(status, /docs\/references\/.*ignored local research/is);
  assert.match(status, /cannot advance or block a LicoArc definition/i);
  assert.match(status, /not executable, session-eligible, publication-eligible/is);
});

test("public projections keep the same definition-only boundary", () => {
  const english = read("README.md");
  const chinese = read("README.zh-CN.md");
  const product = read("PRODUCT.md");
  const lifecycle = read("docs/DECISION-LIFECYCLE.md");
  for (const text of [english, product, lifecycle]) assert.match(text, /definition|protocol meaning/i);
  assert.match(english, /PARTIAL/);
  assert.match(chinese, /PARTIAL/);
  assert.match(chinese, /下游所有者/);
});
