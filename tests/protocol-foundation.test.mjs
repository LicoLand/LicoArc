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
const conformanceManifest = JSON.parse(await readFile(path.join(repositoryRoot,
  "conformance/v1/foundation/manifest.json"), "utf8"));

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
  assert.equal(conformanceManifest.$schema,
    "https://licoarc.com/spec/schemas/conformance-corpus-manifest.schema.json");
  assert.equal(conformanceManifest.manifestVersion, "licoarc.conformance-corpus-manifest.v1");
  assert.equal(Number.isSafeInteger(conformanceManifest.caseCount) &&
    conformanceManifest.caseCount > 0, true);
  assert.deepEqual(conformanceManifest.operationIds,
    [...conformanceManifest.operationIds].sort());
  assert.deepEqual(conformanceManifest.envelopePaths,
    [...conformanceManifest.envelopePaths].sort());
  assert.equal(conformanceManifest.envelopePaths.every((sourcePath) =>
    sourcePath.startsWith("conformance/v1/foundation/") && sourcePath.endsWith(".json")), true);
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

test("restricted JCS public inputs are deterministic", () => {
  const source = "{\"z\":0,\"a\":1,\"nested\":{\"b\":true,\"a\":null}}";
  const value = parseRestrictedJson(source, context.limits.governance);
  const canonical = "{\"a\":1,\"nested\":{\"a\":null,\"b\":true},\"z\":0}";
  assert.equal(canonicalizeRestrictedJson(value, context.limits.governance), canonical);
  assert.equal(canonicalizeRestrictedJson(value, context.limits.governance),
    canonicalizeRestrictedJson(structuredClone(value), context.limits.governance));
  assert.equal(canonicalizeRestrictedJson(
    parseRestrictedJson("{\"emoji\":\"😀\",\"number\":1e-6}", context.limits.governance),
    context.limits.governance), "{\"emoji\":\"😀\",\"number\":0.000001}");
});

test("restricted JCS rejects duplicate names, trailing data, malformed UTF-8, and bounds", () => {
  assert.throws(() => parseRestrictedJson("{\"a\":1,\"a\":2}", context.limits.governance), /duplicate member/u);
  assert.throws(() => parseRestrictedJson("{\"a\":1} false", context.limits.governance), /trailing/u);
  assert.throws(() => parseRestrictedJson(String.raw`{"x":"\ud800"}`, context.limits.governance), /surrogate/);
  assert.throws(() => parseRestrictedJson(new Uint8Array([0xff]), context.limits.governance), /UTF-8/);
  assert.throws(() => parseRestrictedJson(JSON.stringify({ x: "x".repeat(context.bounds.bounds.MAX_TEXT_BYTES + 1) }), context.limits.governance), /bound/);
});

test("deterministic CBOR public inputs have exact bytes", () => {
  for (const [value, expectedHex] of [
    [{ 0: 1, 1: Uint8Array.from([1, 2, 3]), 2: 7 }, "a3000101430102030207"],
    [{ 0: 0, 1: new Uint8Array() }, "a200000140"]
  ]) {
    const encoded = encodeFoundationRuntimeRecord(value, context);
    assert.equal(Buffer.from(encoded).toString("hex"), expectedHex);
    assert.deepEqual(normalizeRuntimeValue(decodeFoundationRuntimeRecord(encoded, context)),
      normalizeRuntimeValue(value));
    assert.deepEqual(decodeDeterministicCbor(encoded, context.limits.runtime),
      decodeDeterministicCbor(encoded, context.limits.runtime));
  }
});

test("deterministic CBOR rejects malformed, non-canonical, unknown, and over-bound forms", () => {
  for (const hex of [
    "a200010002", "a1001801", "bf0001ff", "a1000100", "a200010302",
    "a12001", "a1001b0020000000000000"
  ]) assert.throws(() => decodeFoundationRuntimeRecord(Buffer.from(hex, "hex"), context));
  const overBound = { 0: 1, 1: new Uint8Array(context.bounds.bounds.MAX_RAW_BYTES + 1) };
  assert.throws(() => encodeFoundationRuntimeRecord(overBound, context), /bound/);
  assert.throws(() => encodeFoundationRuntimeRecord({ 0: 1, 3: 2 }, context), /unknown label/);
  assert.throws(() => encodeFoundationRuntimeRecord({ 0: 1, 1: "text" }, context), /raw bytes/);
});

test("Protocol Line manifest is the only composition boundary", async () => {
  const manifest = JSON.parse(await readFile(path.join(repositoryRoot,
    "spec/v1/manifest.json"), "utf8"));
  assert.deepEqual(validateProtocolLineManifest(manifest, context), []);
  assert.doesNotThrow(() => assertValidProtocolLineManifest(manifest, context));
  assert.notDeepEqual(validateProtocolLineManifest({
    ...manifest,
    capabilities: [...manifest.capabilities].reverse()
  }, context), []);
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

function normalizeRuntimeValue(value) {
  if (value instanceof Uint8Array) return `bytes:${Buffer.from(value).toString("hex")}`;
  if (Array.isArray(value)) return value.map(normalizeRuntimeValue);
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizeRuntimeValue(child)]));
  return value;
}
