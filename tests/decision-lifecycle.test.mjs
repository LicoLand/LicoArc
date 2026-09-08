import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

async function markdownFiles(path) {
  return (await readdir(new URL(path, root)))
    .filter((name) => name.endsWith(".md") &&
      name !== "README.md" && name !== "TEMPLATE.md")
    .sort();
}

test("decision lifecycle has exactly two definition tracks", async () => {
  const lifecycle = await read("docs/DECISION-LIFECYCLE.md");

  assert.match(lifecycle, /^## Two independent decision tracks$/m);
  assert.match(lifecycle, /Algorithm Decision/);
  assert.match(lifecycle, /Message Field Decision/);
  assert.match(lifecycle, /Decision status reports approval only/);
  assert.match(lifecycle, /Definition status is independent of approval/);
  assert.match(lifecycle, /never become LicoArc completion evidence/);
});

test("field decisions expose approval and definition state only", async () => {
  const [files, registry, manifest] = await Promise.all([
    markdownFiles("docs/field-decisions/fields/"),
    read("spec/FIELD-REGISTRY.md"),
    read("spec/v1/manifest.json").then(JSON.parse)
  ]);
  assert.ok(files.length > 0);
  const activeSection = registry
    .split("## Active fields\n", 2)[1]
    .split("## Excluded, replaced, and profile-owned values\n", 1)[0];
  const activeRecords = new Set([...activeSection.matchAll(
    /\(\.\.\/docs\/field-decisions\/fields\/([a-z0-9-]+\.md)\)/gu
  )].map((match) => match[1]));

  for (const file of files) {
    const record = await read(`docs/field-decisions/fields/${file}`);
    assert.match(record, /\| Decision track \| `MESSAGE-FIELD` \|/);
    assert.match(record, /\| Decision status \| `(?:OPEN|READY|DECIDED|REJECTED|RETIRED)` \|/);
    assert.match(record, /\| Definition status \| `(?:NOT-SPECIFIED|PARTIAL|SPECIFIED)` \|/);
    assert.match(record, /^## Definition evidence$/m);
    const decisionStatus = record.match(/\| Decision status \| `([^`]+)` \|/u)[1];
    const definitionStatus = record.match(/\| Definition status \| `([^`]+)` \|/u)[1];
    if (["REJECTED", "RETIRED"].includes(decisionStatus)) {
      assert.equal(definitionStatus, "NOT-SPECIFIED", file);
    }
    if (definitionStatus === "SPECIFIED") {
      assert.equal(decisionStatus, "DECIDED", file);
    }
    if (manifest.definitionStatus === "COMPLETE" && activeRecords.has(file)) {
      assert.equal(decisionStatus, "DECIDED", file);
      assert.equal(definitionStatus, "SPECIFIED", file);
    }
  }
});

test("algorithm decisions expose implementation-neutral definition state", async () => {
  const files = await markdownFiles("docs/algorithm-decisions/");
  assert.ok(files.length > 0);

  for (const file of files) {
    const record = await read(`docs/algorithm-decisions/${file}`);
    assert.match(record, /\| Decision track \| `ALGORITHM` \|/);
    assert.match(record, /\| Decision status \| `(?:OPEN|READY|DECIDED|REJECTED|RETIRED)` \|/);
    assert.match(record, /\| Definition status \| `(?:NOT-SPECIFIED|PARTIAL|SPECIFIED)` \|/);
  }
});

test("canonical field registry remains the sole field authority", async () => {
  const [registry, index, lifecycle] = await Promise.all([
    read("spec/FIELD-REGISTRY.md"),
    read("docs/field-decisions/README.md"),
    read("docs/DECISION-LIFECYCLE.md"),
  ]);

  assert.match(registry, /^# LicoArc Canonical Field Registry/m);
  assert.match(index, /Canonical Field Registry/);
  assert.match(lifecycle, /A Message Field Decision\s+cannot authorize an\s+algorithm/);
});

test("repository status is definition-only", async () => {
  const status = await read("docs/STATUS.md");

  assert.deepEqual(
    [...status.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
    ["Definition authority", "Tracked source closure", "Ownership boundary"]
  );
  assert.match(status, /cannot\s+advance or block a LicoArc\s+definition/i);
});
