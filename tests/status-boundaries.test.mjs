import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (relative) => readFileSync(resolve(root, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

test("status projects the manifest lifecycle without becoming another authority", () => {
  const manifest = readJson("spec/v1/manifest.json");
  const status = read("docs/STATUS.md");
  assert.match(status, /protocol-definition repository/i);
  assert.match(status, new RegExp(escapeRegExp(manifest.wireId), "u"));
  assert.match(status, new RegExp(escapeRegExp(manifest.lifecycle), "u"));
  assert.match(status, new RegExp(escapeRegExp(manifest.definitionStatus), "u"));
  assert.match(status, /tracked definition graph/i);
  assert.match(status, /docs\/references\/.*ignored local research/is);
  assert.match(status, /cannot advance or block a LicoArc definition/i);
});

test("public projections mirror current manifest state and keep the definition-only boundary", () => {
  const manifest = readJson("spec/v1/manifest.json");
  const english = read("README.md");
  const chinese = read("README.zh-CN.md");
  const product = read("PRODUCT.md");
  const lifecycle = read("docs/DECISION-LIFECYCLE.md");
  for (const text of [english, product, lifecycle]) assert.match(text, /definition|protocol meaning/i);
  for (const projection of [english, chinese]) {
    assert.match(projection, new RegExp(escapeRegExp(manifest.wireId), "u"));
    assert.match(projection, new RegExp(escapeRegExp(manifest.lifecycle), "u"));
    assert.match(projection, new RegExp(escapeRegExp(manifest.definitionStatus), "u"));
  }
  assert.match(chinese, /下游所有者/);
});
