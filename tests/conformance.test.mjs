import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceManifestPath = "spec/v1/manifest.json";
const conformanceManifestPath = "conformance/v1/manifest.json";
const artifactPath = "artifacts/v1/licoarc.bundle.json";

const sourceManifest = await readJson(sourceManifestPath);
const conformanceManifest = await readJson(conformanceManifestPath);
const artifact = await readJson(artifactPath);
const capabilityIds = conformanceManifest.capabilities.map(({ capabilityId }) =>
  capabilityId
);

test("Candidate artifact closes the manifest, conformance, and source registries", async () => {
  assert.deepEqual(Object.keys(artifact).sort(), [
    "artifactVersion",
    "digest",
    "digestAlgorithm",
    "lifecycle",
    "sources",
    "wireId"
  ]);
  assert.equal(artifact.artifactVersion, "licoarc.bundle.v1");
  assert.equal(artifact.wireId, "licoarc.protocol-line.v1");
  assert.equal(artifact.lifecycle, "Candidate");
  assert.equal(artifact.digestAlgorithm, "sha256");
  assert.equal(sourceManifest.wireId, artifact.wireId);
  assert.equal(sourceManifest.lifecycle, artifact.lifecycle);
  assert.equal(conformanceManifest.wireId, artifact.wireId);
  assert.equal(conformanceManifest.lifecycle, artifact.lifecycle);
  assert.deepEqual(capabilityIds, [...capabilityIds].sort());
  assert.equal(new Set(capabilityIds).size, capabilityIds.length);
  assert.equal(capabilityIds.length, 9);
  assert.ok(capabilityIds.every((capabilityId) =>
    /^licoarc\.[a-z0-9-]+\.v1$/u.test(capabilityId)
  ));

  const expectedSources = [
    sourceManifestPath,
    ...sourceManifest.governanceSources,
    ...sourceManifest.runtimeSources
  ].sort();
  assert.deepEqual(Object.keys(artifact.sources), expectedSources);
  assert.deepEqual(
    expectedSources,
    [conformanceManifestPath, sourceManifestPath,
      ...conformanceManifest.sourcePaths].sort()
  );
  assert.ok(expectedSources.every((sourcePath) =>
    !sourcePath.includes("/relay/")
  ));
  assert.deepEqual(
    conformanceManifest.positiveCorpusPaths,
    conformanceManifest.capabilities.map(({ positiveCorpusPath }) =>
      positiveCorpusPath
    ).sort()
  );
  assert.deepEqual(
    conformanceManifest.negativeCorpusPaths,
    conformanceManifest.capabilities.map(({ negativeCorpusPath }) =>
      negativeCorpusPath
    ).sort()
  );

  const artifactBody = {
    artifactVersion: artifact.artifactVersion,
    wireId: artifact.wireId,
    lifecycle: artifact.lifecycle,
    digestAlgorithm: artifact.digestAlgorithm,
    sources: artifact.sources
  };
  assert.equal(artifact.digest, sha256(`${canonicalizeJson(artifactBody)}\n`));

  const manifestCapabilityById = new Map(sourceManifest.capabilities.map(
    (capability) => [capability.capabilityId, capability]
  ));
  const rawDigestByPath = Object.fromEntries(await Promise.all(
    conformanceManifest.sourcePaths.map(async (sourcePath) => [
      sourcePath,
      sha256(await readFile(path.join(repositoryRoot, sourcePath)))
    ])
  ));
  assert.deepEqual(conformanceManifest.sourceDigests, rawDigestByPath);

  for (const capability of conformanceManifest.capabilities) {
    const manifestCapability = manifestCapabilityById.get(capability.capabilityId);
    assert.ok(manifestCapability);
    assert.equal(capability.version, 1);
    assert.equal(capability.lifecycle, "Candidate");
    assertSortedUnique(capability.sourcePaths);
    assert.deepEqual(Object.keys(capability.sourceDigests).sort(),
      capability.sourcePaths);
    for (const sourcePath of capability.sourcePaths) {
      assert.equal(capability.sourceDigests[sourcePath], rawDigestByPath[sourcePath]);
    }
    const capabilityDigest = sha256(
      `${canonicalizeJson(capability.sourceDigests)}\n`
    );
    assert.equal(capability.sourceDigest, capabilityDigest);
    assert.equal(manifestCapability.sourceDigest, capabilityDigest);
    assert.ok(capability.sourcePaths.includes(capability.registryPath));
    assert.ok(capability.sourcePaths.includes(capability.positiveCorpusPath));
    assert.ok(capability.sourcePaths.includes(capability.negativeCorpusPath));
    for (const field of [
      "policyPaths",
      "schemaPaths",
      "requirementPaths",
      "vectorPaths"
    ]) {
      assertSortedUnique(capability[field]);
      assert.ok(capability[field].every((sourcePath) =>
        capability.sourcePaths.includes(sourcePath)
      ));
    }
    assert.deepEqual(capability.vectorPaths, [
      capability.positiveCorpusPath,
      capability.negativeCorpusPath
    ].sort());

    const registry = artifact.sources[capability.registryPath];
    assert.equal(registry.lifecycle, "Candidate");
    const positive = artifact.sources[capability.positiveCorpusPath];
    const negative = artifact.sources[capability.negativeCorpusPath];
    assert.ok(Array.isArray(positive));
    assert.ok(Array.isArray(negative));
    assertUniqueCaseIds(positive);
    assertUniqueCaseIds(negative);
    const positiveIds = positive.map(({ id }) => id);
    const negativeIds = negative.map(({ id }) => id);
    assert.equal(
      new Set([...positiveIds, ...negativeIds]).size,
      positiveIds.length + negativeIds.length
    );
    const corpusManifest = artifact.sources[capability.conformanceManifestPath];
    assert.equal(corpusManifest.lifecycle, "Candidate");
    const declaredNegativeIds = Array.isArray(corpusManifest.negativeCaseIds)
      ? corpusManifest.negativeCaseIds
      : corpusManifest.caseIds.filter((id) => id.includes(".reject."));
    const declaredPositiveIds = Array.isArray(corpusManifest.negativeCaseIds)
      ? corpusManifest.caseIds
      : corpusManifest.caseIds.filter((id) => !id.includes(".reject."));
    assert.deepEqual([...declaredPositiveIds].sort(), [...positiveIds].sort());
    assert.deepEqual([...declaredNegativeIds].sort(), [...negativeIds].sort());
  }
});

test("source values preserve deterministic CDDL and JSON representation", () => {
  for (const [sourcePath, source] of Object.entries(artifact.sources)) {
    if (sourcePath.endsWith(".cddl")) {
      assert.equal(typeof source, "string");
      assert.match(source, /\n$/u);
      assert.doesNotMatch(source, /\r|\u0000/u);
    } else {
      assert.notEqual(source, undefined);
    }
  }
});

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), "utf8"));
}

function assertSortedUnique(values) {
  assert.ok(Array.isArray(values));
  assert.deepEqual(values, [...values].sort());
  assert.equal(new Set(values).size, values.length);
}

function assertUniqueCaseIds(cases) {
  assert.ok(cases.every((case_) => typeof case_.id === "string"));
  assert.equal(new Set(cases.map(({ id }) => id)).size, cases.length);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalizeJson(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(",")}]`;
  }
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`
  ).join(",")}}`;
}
