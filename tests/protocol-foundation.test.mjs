import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  FOUNDATION_SOURCE_MANIFEST,
  assertClosedJsonSchema,
  assertFoundationSourceClosure,
  assertValidAgainstClosedSchema,
  assertValidProtocolLineManifest,
  canonicalizeRestrictedJson,
  decodeDeterministicCbor,
  decodeFoundationRuntimeRecord,
  encodeDeterministicCbor,
  encodeFoundationRuntimeRecord,
  generateFoundationBundle,
  loadFoundationContext,
  parseRestrictedJson,
  validateClosedSchema,
  validateProtocolLineManifest
} from "../tools/protocol/index.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = await loadFoundationContext(repositoryRoot);
const validCases = JSON.parse(await readFile(path.join(repositoryRoot, "conformance/v1/foundation/valid.json"), "utf8"));
const invalidCases = JSON.parse(await readFile(path.join(repositoryRoot, "conformance/v1/foundation/invalid.json"), "utf8"));

test("foundation source closure is explicit, sorted, and independent", async () => {
  assert.equal(context.registries.sourceManifest.manifestVersion, "licoarc.foundation-source-manifest.v1");
  assert.deepEqual(context.registries.sourceManifest.sourceRoots, [
    "conformance/v1/foundation",
    "spec/v1/foundation",
    "spec/v1/schemas"
  ]);
  assert.deepEqual(context.sourceClosure.declared, [...context.sourceClosure.declared].sort());
  assert.equal(new Set(context.sourceClosure.declared).size, context.sourceClosure.declared.length);
  assert.ok(context.sourceClosure.declared.includes("spec/v1/foundation/runtime.cddl"));
  assert.ok(context.sourceClosure.declared.every((sourcePath) => !path.isAbsolute(sourcePath)));
  assert.equal(FOUNDATION_SOURCE_MANIFEST, "spec/v1/foundation/source-manifest.json");
});

test("all foundation JSON schemas are closed and validate their sources", async () => {
  for (const [name, schema] of Object.entries(context.schemas)) {
    assert.doesNotThrow(() => assertClosedJsonSchema(schema), name);
  }
  for (const [name, document] of Object.entries(context.registries)) {
    if (name === "sourceManifest") assert.deepEqual(validateClosedSchema(document, context.schemas.sourceManifest), []);
    else assert.deepEqual(validateClosedSchema(document, context.schemas[name]), [], name);
  }
  assert.ok(context.registries.representation.composition.translation === "forbidden");
  assert.ok(context.registries.representation.composition.substitution === "forbidden");
});

test("restricted JCS positive corpus is deterministic", () => {
  for (const fixture of validCases.filter(({ kind }) => kind === "governance-json")) {
    const value = parseRestrictedJson(fixture.input, context.limits.governance);
    assert.equal(canonicalizeRestrictedJson(value, context.limits.governance), fixture.canonical, fixture.id);
    assert.equal(canonicalizeRestrictedJson(value, context.limits.governance), canonicalizeRestrictedJson(structuredClone(value), context.limits.governance));
  }
});

test("restricted JCS rejects duplicate names, trailing data, malformed UTF-8, and bounds", () => {
  for (const fixture of invalidCases.filter(({ kind }) => kind === "governance-json")) {
    assert.throws(() => parseRestrictedJson(fixture.input, context.limits.governance), fixture.id);
  }
  assert.throws(() => parseRestrictedJson(String.raw`{"x":"\ud800"}`, context.limits.governance), /surrogate/);
  assert.throws(() => parseRestrictedJson(new Uint8Array([0xff]), context.limits.governance), /UTF-8/);
  assert.throws(() => parseRestrictedJson(JSON.stringify({ x: "x".repeat(context.bounds.bounds.MAX_TEXT_BYTES + 1) }), context.limits.governance), /bound/);
});

test("deterministic CBOR positive corpus has exact bytes", () => {
  for (const fixture of validCases.filter(({ kind }) => kind === "runtime-cbor")) {
    const value = decodeFixtureValue(fixture.value);
    const encoded = encodeFoundationRuntimeRecord(value, context);
    assert.equal(Buffer.from(encoded).toString("hex"), fixture.hex, fixture.id);
    assert.deepEqual(normalizeRuntimeValue(decodeFoundationRuntimeRecord(encoded, context)), normalizeRuntimeValue(value), fixture.id);
    assert.deepEqual(decodeDeterministicCbor(encoded, context.limits.runtime), decodeDeterministicCbor(encoded, context.limits.runtime));
  }
});

test("deterministic CBOR rejects malformed, non-canonical, unknown, and over-bound forms", () => {
  for (const fixture of invalidCases.filter(({ kind }) => kind === "runtime-cbor")) {
    assert.throws(() => decodeFoundationRuntimeRecord(Buffer.from(fixture.hex, "hex"), context), fixture.id);
  }
  const overBound = { 0: 1, 1: new Uint8Array(context.bounds.bounds.MAX_RAW_BYTES + 1) };
  assert.throws(() => encodeFoundationRuntimeRecord(overBound, context), /bound/);
  assert.throws(() => encodeFoundationRuntimeRecord({ 0: 1, 3: 2 }, context), /unknown label/);
  assert.throws(() => encodeFoundationRuntimeRecord({ 0: 1, 1: "text" }, context), /raw bytes/);
});

test("Protocol Line manifest is the only composition boundary", () => {
  const manifest = {
    manifestVersion: "licoarc.protocol-line-manifest.v1",
    wireId: "licoarc.foundation.v1",
    lifecycle: "Candidate",
    minimumSafe: { protocolLineVersion: 1, capabilityVersions: [] },
    capabilities: [],
    governanceSources: ["spec/v1/foundation/bounds.json"],
    runtimeSources: ["spec/v1/foundation/runtime.cddl"],
    boundsRegistry: "spec/v1/foundation/bounds.json",
    handshakeBinding: "manifest-capabilities-identities-and-declarations",
    sessionLock: true,
    translationPolicy: "forbidden"
  };
  assert.deepEqual(validateProtocolLineManifest(manifest, context), []);
  assert.doesNotThrow(() => assertValidProtocolLineManifest(manifest, context));
  assert.deepEqual(validateProtocolLineManifest({ ...manifest, runtimeSources: [...manifest.governanceSources] }, context), ["governance and runtime source families must be disjoint"]);
  assert.notDeepEqual(validateProtocolLineManifest({ ...manifest, unknown: true }, context), []);
});

test("generation emits stable content identity without environment metadata", async () => {
  const first = await generateFoundationBundle({ repositoryRoot });
  const second = await generateFoundationBundle({ repositoryRoot });
  assert.equal(first.digest, second.digest);
  assert.deepEqual(first.bytes, second.bytes);
  assert.deepEqual(Object.keys(first.body).sort(), ["artifactVersion", "digestAlgorithm", "lifecycle", "manifestVersion", "representation", "sources"]);
  assert.doesNotMatch(first.canonical, /generatedAt|hostname|username|process\.cwd|node_modules/u);
  assert.ok(first.body.sources.every(({ path: sourcePath }) => !path.isAbsolute(sourcePath)));
});

test("undeclared foundation files fail closed", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "licoarc-foundation-"));
  try {
    for (const sourceRoot of ["spec/v1/foundation", "spec/v1/schemas", "conformance/v1/foundation"]) {
      await cp(path.join(repositoryRoot, sourceRoot), path.join(temporaryRoot, sourceRoot), { recursive: true });
    }
    const manifest = structuredClone(context.registries.sourceManifest);
    await writeFile(path.join(temporaryRoot, "spec/v1/foundation/undeclared.json"), "{}\n");
    await assert.rejects(() => assertFoundationSourceClosure(temporaryRoot, manifest, context.limits), /does not close/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

function decodeFixtureValue(value) {
  if (Array.isArray(value)) return value.map(decodeFixtureValue);
  if (value !== null && typeof value === "object") {
    const result = {};
    for (const [key, child] of Object.entries(value)) result[key] = decodeFixtureValue(child);
    return result;
  }
  if (typeof value === "string" && value.startsWith("base64:")) return Uint8Array.from(Buffer.from(value.slice(7), "base64"));
  return value;
}

function normalizeRuntimeValue(value) {
  if (value instanceof Uint8Array) return `bytes:${Buffer.from(value).toString("hex")}`;
  if (Array.isArray(value)) return value.map(normalizeRuntimeValue);
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizeRuntimeValue(child)]));
  return value;
}
