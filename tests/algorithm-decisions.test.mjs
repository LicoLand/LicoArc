import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, "docs/algorithm-decisions");
const expected = new Map([
  ["baseline-pairwise-protection-suite.md", ["RETIRED", "NOT-SPECIFIED"]],
  ["core-v1-double-ratchet.md", ["OPEN", "PARTIAL"]],
  ["core-v1-hybrid-ake.md", ["OPEN", "PARTIAL"]],
  ["group-state-evolution.md", ["DECIDED", "SPECIFIED"]],
  [["high", "assurance", "pairwise", "protection", "suite.md"].join("-"), ["RETIRED", "NOT-SPECIFIED"]],
  ["protected-size-bucket-schedule.md", ["REJECTED", "NOT-SPECIFIED"]],
  ["protocol-line-selection.md", ["DECIDED", "SPECIFIED"]],
  ["transferable-evidence-checkpoint.md", ["DECIDED", "SPECIFIED"]]
]);

test("algorithm inventory reports honest independent states", async () => {
  const names = (await readdir(directory)).filter((name) =>
    name.endsWith(".md") && !["README.md", "TEMPLATE.md"].includes(name));
  assert.deepEqual(new Set(names), new Set(expected.keys()));
  for (const [name, [decision, definition]] of expected) {
    const record = await readFile(resolve(directory, name), "utf8");
    assert.ok(record.includes(`| Decision status | \`${decision}\` |`));
    assert.ok(record.includes(`| Definition status | \`${definition}\` |`));
    assert.match(record, /^## Definition evidence$/m);
  }
});

test("protection successors remain open without deciding prekey consumption", async () => {
  const [ake, ratchet, registry] = await Promise.all([
    readFile(resolve(directory, "core-v1-hybrid-ake.md"), "utf8"),
    readFile(resolve(directory, "core-v1-double-ratchet.md"), "utf8"),
    readFile(resolve(root, "spec/v1/protection/registry.json"), "utf8").then(JSON.parse)
  ]);
  assert.match(ake, /one-time-prekey consumption rule remains open/i);
  assert.match(ratchet, /epoch plus direction and counter is not a Double Ratchet/i);
  assert.deepEqual(registry.activeProfiles, []);
  assert.equal(registry.sessionEligible, false);
});

test("algorithm inventory is definition-only", async () => {
  const inventory = await readFile(resolve(directory, "README.md"), "utf8");
  assert.match(inventory, /Decision status \| Definition \| Record/);
});
