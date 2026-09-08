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

test("Candidate artifact binds the exact lifecycle-generic definition and source closure", () => {
  assert.deepEqual(Object.keys(artifact).sort(), [
    "artifactVersion", "definitionStatus", "digest", "digestAlgorithm",
    "generation", "lifecycle", "publicationEligible", "sessionEligible",
    "sources", "wireId"
  ]);
  assert.equal(artifact.artifactVersion, "licoarc.bundle.v1");
  assert.equal(artifact.wireId, "licoarc.protocol-line.v1");
  assert.ok(["PARTIAL", "COMPLETE"].includes(artifact.definitionStatus));
  assert.equal(artifact.publicationEligible, false);
  assert.equal(manifest.definitionStatus, artifact.definitionStatus);
  assert.equal(conformance.definitionStatus, artifact.definitionStatus);
  assert.equal(manifest.sessionEligible, artifact.sessionEligible);
  assert.equal(manifest.publicationEligible, artifact.publicationEligible);
  if (artifact.definitionStatus === "COMPLETE") {
    assert.equal(artifact.sessionEligible, true);
    assert.deepEqual(conformance.absentCorpora, []);
  } else {
    assert.equal(artifact.sessionEligible, false);
    assert.ok(conformance.absentCorpora.length > 0);
  }
  assert.ok(Object.hasOwn(artifact.sources, "spec/protocol-lines.json"));
  assert.ok(Object.hasOwn(artifact.sources, "spec/v1/security/claims.json"));
  assert.ok(Object.hasOwn(artifact.sources, "spec/v1/protection/algorithms.json"));
  assert.equal(protection.definitionStatus, artifact.definitionStatus);
  assert.equal(protection.sessionEligible, artifact.sessionEligible);
  assert.ok(protection.wireSchemas.length > 0);
  assert.equal(protection.conformanceCorpus, "conformance/v1/protection/manifest.json");

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
