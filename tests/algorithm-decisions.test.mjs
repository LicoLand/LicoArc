import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, "docs/algorithm-decisions");

test("algorithm inventory and records report the same independent lifecycle states", async () => {
  const inventoryText = await readFile(resolve(directory, "README.md"), "utf8");
  const inventory = parseInventory(inventoryText);
  const names = (await readdir(directory)).filter((name) =>
    name.endsWith(".md") && !["README.md", "TEMPLATE.md"].includes(name)).sort();
  assert.deepEqual(names, [...inventory.values()].map(({ record }) => record).sort());

  for (const [decisionId, entry] of inventory) {
    const record = await readFile(resolve(directory, entry.record), "utf8");
    assert.ok(record.includes(`| Decision ID | \`${decisionId}\` |`));
    assert.ok(record.includes(`| Decision status | \`${entry.decisionStatus}\` |`));
    assert.ok(record.includes(`| Definition status | \`${entry.definitionStatus}\` |`));
    assert.match(record, /^## Definition evidence$/m);
    if (["RETIRED", "REJECTED"].includes(entry.decisionStatus)) {
      assert.equal(entry.definitionStatus, "NOT-SPECIFIED", decisionId);
    }
    if (entry.definitionStatus === "SPECIFIED") {
      assert.equal(entry.decisionStatus, "DECIDED", decisionId);
    }
  }
});

test("Core protection decisions bind the exact semantic construction before final admission", async () => {
  const [ake, ratchet, profile, lineCatalog] = await Promise.all([
    readFile(resolve(directory, "core-v1-hybrid-ake.md"), "utf8"),
    readFile(resolve(directory, "core-v1-double-ratchet.md"), "utf8"),
    readFile(resolve(root, "spec/v1/protection/profile.json"), "utf8").then(JSON.parse),
    readFile(resolve(root, "spec/protocol-lines.json"), "utf8").then(JSON.parse)
  ]);
  for (const record of [ake, ratchet]) assert.match(record, /\| Decision status \| `DECIDED` \|/);
  assert.match(ake, /paired-one-time/);
  assert.match(ake, /atomically compare-and-commits the session/);
  assert.match(ake, /No component fallback/);
  assert.match(ratchet, /classic X25519 Double Ratchet/);
  assert.match(ratchet, /bounded hash map for O\(1\)/);
  assert.match(ratchet, /ongoing post-quantum post-compromise recovery.*explicit nonclaim/is);
  assert.equal(profile.semanticSourceStatus, "COMPLETE");

  const activeLine = lineCatalog.lines.find(({ wireId, generation }) =>
    wireId === "licoarc.protocol-line.v1" && generation === 1);
  const expectedDefinition = activeLine.definitionStatus === "COMPLETE" ? "SPECIFIED" : "PARTIAL";
  for (const record of [ake, ratchet]) {
    assert.ok(record.includes(`| Definition status | \`${expectedDefinition}\` |`));
  }
});

test("algorithm workspace remains definition-only", async () => {
  const inventory = await readFile(resolve(directory, "README.md"), "utf8");
  assert.match(inventory, /Decision status \| Definition \| Record/);
  assert.match(inventory, /downstream owners/);
  assert.doesNotMatch(inventory, /provider output.*define/i);
});

test("Group state evolution freezes the exact machine bounds and exhaustion semantics", async () => {
  const [decision, bounds, registry] = await Promise.all([
    readFile(resolve(directory, "group-state-evolution.md"), "utf8"),
    readFile(resolve(root, "spec/v1/group/bounds.json"), "utf8").then(JSON.parse),
    readFile(resolve(root, "spec/v1/group/registry.json"), "utf8").then(JSON.parse)
  ]);
  assert.equal(bounds.bounds.MAX_GROUP_EPOCH, Number.MAX_SAFE_INTEGER);
  assert.equal(bounds.bounds.MAX_GROUP_OPERATION_BYTES, 2512);
  assert.equal(bounds.bounds.MAX_GROUP_MESSAGE_CONTROL_BYTES, 60);
  assert.equal(bounds.bounds.MAX_GROUP_AGGREGATE_BYTES, 3913);
  assert.equal(bounds.bounds.MAX_GROUP_EPOCH_TOMBSTONES, 1024);
  assert.match(decision, /tombstone\s+capacity exhaustion/u);
  assert.doesNotMatch(decision, /tombstone\s+expiry/iu);
  assert.equal(registry.resourceAccounting.rejectedOrDuplicateInput,
    "no-budget-consumption-and-no-state-mutation");
  assert.equal(registry.resourceAccounting.retryReset, "forbidden");
});

function parseInventory(text) {
  const entries = new Map();
  const row = /^\| `(ALG-[^`]+)` \| .* \| `(OPEN|READY|DECIDED|REJECTED|RETIRED)` \| `(NOT-SPECIFIED|PARTIAL|SPECIFIED)` \| \[([^\]]+\.md)\]\([^)]*\) \|$/gmu;
  for (const match of text.matchAll(row)) {
    entries.set(match[1], {
      decisionStatus: match[2],
      definitionStatus: match[3],
      record: match[4]
    });
  }
  assert.ok(entries.size > 0, "algorithm inventory rows");
  return entries;
}
