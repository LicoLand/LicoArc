import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, "docs/algorithm-decisions");
const decided = new Set([
  "baseline-pairwise-protection-suite.md",
  "high-assurance-pairwise-protection-suite.md",
  "transferable-evidence-checkpoint.md",
  "group-state-evolution.md",
]);

test("algorithm decisions expose approval and definition state only", async () => {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".md") && !["README.md", "TEMPLATE.md"].includes(name));
  assert.deepEqual(new Set(names), new Set([...decided, "protected-size-bucket-schedule.md"]));
  for (const name of names) {
    const record = await readFile(resolve(directory, name), "utf8");
    assert.match(record, /\| Decision status \|/);
    assert.match(record, /\| Definition status \|/);
    assert.match(record, /## Definition evidence/);
    if (decided.has(name)) {
      assert.match(record, /\| Decision status \| `DECIDED` \|/);
      assert.match(record, /\| Definition status \| `SPECIFIED` \|/);
      assert.match(record, /Algorithm Prototype|Prototype/);
      assert.match(record, /Source-derived conformance material/);
    }
  }
});

test("algorithm inventory is definition-only", async () => {
  const inventory = await readFile(resolve(directory, "README.md"), "utf8");
  assert.match(inventory, /Decision status \| Definition \| Record/);
});

test("resource contract contains normative protocol bounds", async () => {
  const resource = JSON.parse(await readFile(resolve(root, "spec/v1/protection/resource-contract.json"), "utf8"));
  assert.equal(resource.scope, "normative-resource-and-wire-bounds");
  assert.ok(resource.profiles.baseline.MAX_HANDSHAKE_WIRE_BYTES > 0);
  assert.ok(resource.profiles["high-assurance"].MAX_HANDSHAKE_WIRE_BYTES > 0);
});
