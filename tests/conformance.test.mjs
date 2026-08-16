import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const readJson = (path) => readFile(resolve(root, path), "utf8").then(JSON.parse);
const [manifest, conformance, artifact, protection] = await Promise.all([
  readJson("spec/v1/manifest.json"),
  readJson("conformance/v1/manifest.json"),
  readJson("artifacts/v1/licoarc.bundle.json"),
  readJson("spec/v1/protection/registry.json")
]);

test("partial Candidate artifact binds exact status and source closure", () => {
  assert.deepEqual(Object.keys(artifact).sort(), [
    "artifactVersion", "definitionStatus", "digest", "digestAlgorithm",
    "generation", "lifecycle", "publicationEligible", "sessionEligible",
    "sources", "wireId"
  ]);
  assert.equal(artifact.artifactVersion, "licoarc.bundle.v2");
  assert.equal(artifact.wireId, "licoarc.protocol-line.v1");
  assert.equal(artifact.definitionStatus, "PARTIAL");
  assert.equal(artifact.sessionEligible, false);
  assert.equal(artifact.publicationEligible, false);
  assert.equal(manifest.definitionStatus, artifact.definitionStatus);
  assert.equal(conformance.definitionStatus, artifact.definitionStatus);
  assert.deepEqual(conformance.absentCorpora, [{
    definitionId: "pairwise-protection",
    reason: "open-definition-has-no-active-wire"
  }]);
  assert.ok(Object.hasOwn(artifact.sources, "spec/protocol-lines.json"));
  assert.ok(Object.hasOwn(artifact.sources, "spec/v1/security/claims.json"));
  assert.equal(protection.definitionStatus, "PARTIAL");
  assert.equal(protection.sessionEligible, false);
  assert.deepEqual(protection.wireSchemas, []);
  assert.equal(protection.conformanceCorpus, null);

  const body = Object.fromEntries(Object.entries(artifact).filter(([key]) => key !== "digest"));
  assert.equal(artifact.digest, sha256(`${canonical(body)}\n`));
});

test("source values preserve deterministic JSON and CDDL representation", () => {
  for (const [sourcePath, source] of Object.entries(artifact.sources)) {
    if (sourcePath.endsWith(".cddl")) {
      assert.equal(typeof source, "string");
      assert.match(source, /\n$/u);
      assert.doesNotMatch(source, /\r|\u0000/u);
    } else assert.notEqual(source, undefined);
  }
});

function canonical(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
