import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertClosedJsonSchema,
  assertRestrictedJsonValue,
  canonicalizeRestrictedJson,
  parseRestrictedJson,
  validateClosedSchema
} from "../protocol/index.mjs";
import {
  CONFORMANCE_OPERATIONS,
  CONFORMANCE_OPERATION_IDS,
  ConformanceOperationError
} from "./operations.mjs";

export const CONFORMANCE_SCHEMA_PATHS = Object.freeze({
  case: "spec/schemas/conformance-case.schema.json",
  envelope: "spec/schemas/conformance-envelope.schema.json",
  manifest: "spec/schemas/conformance-corpus-manifest.schema.json"
});

const DEFAULT_REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_SEED = "LICOARC/CONFORMANCE-ORDER/V1";
const JSON_LIMITS = Object.freeze({
  maxBytes: 4_194_304,
  maxDepth: 32,
  maxArrayItems: 4_096,
  maxObjectMembers: 512,
  maxStringBytes: 1_048_576
});
const FORBIDDEN_NESTED_NAMES = new Set([
  "alias", "aliasid", "caseid", "expected", "extends", "fixture", "fixtureid",
  "mutation", "mutations", "template", "templateid"
]);
const PRIVATE_MATERIAL_NAMES = new Set([
  "decapsulationkey", "privatekey", "privatekeybytes", "privatekeyhex", "privatekeymaterial",
  "privatekeys", "secretkey", "secretkeybytes", "secretkeyhex", "secretkeys", "signingprivatekey"
]);

export class ConformanceEngineError extends TypeError {
  constructor(code, message = code, details = undefined) {
    super(message);
    this.name = "ConformanceEngineError";
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export async function discoverConformanceCases({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  manifestPaths = undefined
} = {}) {
  const root = path.resolve(repositoryRoot);
  const schemas = await loadSchemas(root);
  const selectedManifests = manifestPaths === undefined
    ? await discoverManifestPaths(root)
    : canonicalPaths(manifestPaths, "manifest-paths");
  if (selectedManifests.length === 0) throw new ConformanceEngineError("no-conformance-manifests");

  const cases = [];
  const corpusIds = new Set();
  for (const manifestPath of selectedManifests) {
    assertSafeRelativePath(manifestPath);
    const manifest = await readRestrictedJson(root, manifestPath);
    assertSchemaValue(manifest, schemas.manifest, [schemas.case, schemas.envelope]);
    if (corpusIds.has(manifest.corpusId)) throw new ConformanceEngineError("duplicate-corpus-id");
    corpusIds.add(manifest.corpusId);
    assertSortedUnique(manifest.operationIds, "manifest-operation-ids");
    assertSortedUnique(manifest.envelopePaths, "manifest-envelope-paths");
    await assertEnvelopeClosure(root, manifestPath, manifest.envelopePaths);

    const corpusCases = [];
    for (const envelopePath of manifest.envelopePaths) {
      assertSafeRelativePath(envelopePath);
      if (path.posix.dirname(envelopePath) !== path.posix.dirname(manifestPath)) {
        throw new ConformanceEngineError("envelope-outside-corpus-directory");
      }
      const envelope = await readRestrictedJson(root, envelopePath);
      assertSchemaValue(envelope, schemas.envelope, [schemas.case]);
      if (envelope.corpusId !== manifest.corpusId) throw new ConformanceEngineError("envelope-corpus-id-mismatch");
      corpusCases.push(...envelope.cases);
    }
    if (corpusCases.length !== manifest.caseCount) throw new ConformanceEngineError("manifest-case-count-mismatch");
    preflightConformanceCases(corpusCases, { requiredOperationIds: manifest.operationIds });
    cases.push(...corpusCases);
  }
  const prepared = preflightConformanceCases(cases);
  await validateSourceContexts(root, prepared);
  return prepared;
}

export function preflightConformanceCases(cases, { requiredOperationIds = undefined } = {}) {
  if (!Array.isArray(cases) || cases.length === 0 || cases.length > 4_096) {
    throw new ConformanceEngineError("invalid-case-set");
  }
  const ids = new Set();
  const executionFingerprints = new Set();
  const operationIds = new Set();
  const prepared = cases.map((sourceCase) => {
    const case_ = cloneJson(sourceCase);
    assertCaseShape(case_);
    if (ids.has(case_.id)) throw new ConformanceEngineError("duplicate-case-id");
    ids.add(case_.id);
    const operationId = case_.target.operationId;
    if (!(operationId in CONFORMANCE_OPERATIONS)) throw new ConformanceEngineError("unknown-operation-id");
    operationIds.add(operationId);
    assertNoImplicitOrPrivateInput(case_.context, "$.context");
    assertNoImplicitOrPrivateInput(case_.input, "$.input");
    if ("result" in case_.expected) {
      assertNoImplicitOrPrivateInput(case_.expected.result, "$.expected.result");
    }
    assertContextClosure(case_.context);
    const executionFingerprint = canonicalize({
      target: case_.target,
      context: case_.context,
      input: case_.input
    });
    if (executionFingerprints.has(executionFingerprint)) {
      throw new ConformanceEngineError("duplicate-case-execution");
    }
    executionFingerprints.add(executionFingerprint);
    return deepFreeze(case_);
  });
  const actualOperationIds = [...operationIds].sort();
  if (requiredOperationIds !== undefined) {
    assertSortedUnique(requiredOperationIds, "required-operation-ids");
    if (!arraysEqual(actualOperationIds, requiredOperationIds)) {
      throw new ConformanceEngineError("operation-coverage-mismatch");
    }
  }
  return Object.freeze(prepared);
}

export async function runConformanceCases(cases, { seed = DEFAULT_SEED } = {}) {
  if (typeof seed !== "string" || seed.length === 0 || Buffer.byteLength(seed, "utf8") > 256) {
    throw new ConformanceEngineError("invalid-order-seed");
  }
  const prepared = preflightConformanceCases(cases);
  const semanticInputs = prepared.map((case_) => canonicalize({
    target: case_.target,
    context: case_.context,
    input: case_.input
  })).sort();
  const corpusDigest = sha256(canonicalize(semanticInputs));
  const primarySeedDigest = sha256(`${DEFAULT_SEED}\0primary\0${seed}\0${corpusDigest}`);
  const alternateSeedDigest = sha256(`${DEFAULT_SEED}\0alternate\0${seed}\0${corpusDigest}`);
  const primaryOrder = permutation(prepared.length, primarySeedDigest);
  const alternateOrder = distinctPermutation(primaryOrder,
    permutation(prepared.length, alternateSeedDigest));

  const primary = await executeOrder(prepared, primaryOrder);
  const alternate = await executeOrder(prepared, alternateOrder);
  for (let index = 0; index < prepared.length; index += 1) {
    if (!jsonEqual(primary[index], alternate[index])) {
      throw new ConformanceEngineError("order-dependent-operation-result", undefined, {
        operationId: prepared[index].target.operationId
      });
    }
  }

  const results = prepared.map((case_, index) => {
    const matched = jsonEqual(primary[index], case_.expected);
    return deepFreeze({
      id: case_.id,
      operationId: case_.target.operationId,
      status: matched ? "passed" : "failed",
      actual: cloneJson(primary[index])
    });
  });
  return deepFreeze({
    status: results.every(({ status }) => status === "passed") ? "passed" : "failed",
    caseCount: prepared.length,
    operationIds: [...new Set(prepared.map(({ target }) => target.operationId))].sort(),
    primarySeedDigest,
    alternateSeedDigest,
    results
  });
}

export async function runConformanceRepository({
  repositoryRoot = DEFAULT_REPOSITORY_ROOT,
  manifestPaths = undefined,
  seed = DEFAULT_SEED
} = {}) {
  const cases = await discoverConformanceCases({ repositoryRoot, manifestPaths });
  return runConformanceCases(cases, { seed });
}

async function executeOrder(cases, order) {
  const outcomes = new Array(cases.length);
  for (const index of order) {
    const case_ = cases[index];
    const operationId = case_.target.operationId;
    const executor = CONFORMANCE_OPERATIONS[operationId];
    const argument = deepFreeze(cloneJson({ context: case_.context, input: case_.input }));
    const before = canonicalize(argument);
    try {
      const result = await executor(argument);
      assertRestrictedJsonValue(result, JSON_LIMITS);
      outcomes[index] = deepFreeze({ result: cloneJson(result) });
    } catch (error) {
      if (!(error instanceof ConformanceOperationError) || typeof error.code !== "string") {
        throw new ConformanceEngineError("untyped-operation-failure", undefined, { operationId });
      }
      outcomes[index] = deepFreeze({ error: { code: error.code } });
    }
    if (canonicalize(argument) !== before) throw new ConformanceEngineError("operation-mutated-input");
  }
  if (outcomes.some((outcome) => outcome === undefined)) throw new ConformanceEngineError("case-skipped");
  return outcomes;
}

async function loadSchemas(root) {
  const entries = await Promise.all(Object.entries(CONFORMANCE_SCHEMA_PATHS).map(async ([name, relativePath]) => {
    const schema = await readRestrictedJson(root, relativePath);
    assertClosedJsonSchema(schema);
    return [name, schema];
  }));
  return Object.freeze(Object.fromEntries(entries));
}

async function discoverManifestPaths(root) {
  const manifests = [];
  const conformanceRoot = resolveInside(root, "conformance/v1");
  const entries = await readdir(conformanceRoot, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new ConformanceEngineError("conformance-symlink-forbidden");
    if (!entry.isDirectory()) continue;
    const directory = `conformance/v1/${entry.name}`;
    const files = await collectJsonFiles(root, directory);
    if (files.length === 0) continue;
    const manifestPath = `${directory}/manifest.json`;
    if (!files.includes(manifestPath)) throw new ConformanceEngineError("corpus-manifest-missing");
    const document = await readRestrictedJson(root, manifestPath);
    if (document?.$schema !== "https://licoarc.com/spec/schemas/conformance-corpus-manifest.schema.json") {
      throw new ConformanceEngineError("corpus-manifest-schema-mismatch");
    }
    manifests.push(manifestPath);
  }
  return manifests.sort();
}

async function assertEnvelopeClosure(root, manifestPath, envelopePaths) {
  const directory = path.posix.dirname(manifestPath);
  const discovered = (await collectJsonFiles(root, directory))
    .filter((relativePath) => relativePath !== manifestPath)
    .sort();
  if (!arraysEqual(discovered, envelopePaths)) throw new ConformanceEngineError("corpus-envelope-closure-mismatch");
}

async function validateSourceContexts(root, cases) {
  const digestCache = new Map();
  const valueCache = new Map();
  for (const case_ of cases) {
    const bindings = new Map();
    for (const binding of case_.context.sourceBindings) {
      if (bindings.has(binding.sourcePath)) throw new ConformanceEngineError("duplicate-source-binding");
      bindings.set(binding.sourcePath, binding.sha256);
      const actual = await digestSource(root, binding.sourcePath, digestCache);
      if (actual !== binding.sha256) throw new ConformanceEngineError("source-binding-digest-mismatch");
    }
    for (const document of [...case_.context.catalogs, ...case_.context.publicMaterial]) {
      if (!bindings.has(document.sourcePath)) throw new ConformanceEngineError("unbound-context-document");
      const sourceValue = await readSourceValue(root, document.sourcePath, valueCache);
      if (!jsonEqual(sourceValue, document.value)) throw new ConformanceEngineError("context-source-value-mismatch");
    }
  }
}

async function digestSource(root, relativePath, cache) {
  assertSafeRelativePath(relativePath);
  if (cache.has(relativePath)) return cache.get(relativePath);
  const absolute = resolveInside(root, relativePath);
  const metadata = await lstat(absolute);
  if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size > JSON_LIMITS.maxBytes) {
    throw new ConformanceEngineError("invalid-bound-source");
  }
  const digest = sha256(await readFile(absolute));
  cache.set(relativePath, digest);
  return digest;
}

async function readSourceValue(root, relativePath, cache) {
  if (cache.has(relativePath)) return cache.get(relativePath);
  const bytes = await readFile(resolveInside(root, relativePath));
  const value = relativePath.endsWith(".json") ? parseRestrictedJson(bytes, JSON_LIMITS) : new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  cache.set(relativePath, value);
  return value;
}

function assertCaseShape(case_) {
  if (!isPlainObject(case_) || case_.$schema !== "https://licoarc.com/spec/schemas/conformance-case.schema.json" ||
      case_.caseVersion !== "licoarc.conformance-case.v1" || typeof case_.id !== "string" ||
      !/^[a-z0-9][a-z0-9.-]{0,191}$/u.test(case_.id) || !isPlainObject(case_.target) ||
      Object.keys(case_.target).length !== 1 || typeof case_.target.operationId !== "string" ||
      !/^licoarc[.][a-z0-9-]+(?:[.][a-z0-9-]+)*[.]v[1-9][0-9]*$/u.test(case_.target.operationId) ||
      !isPlainObject(case_.context) || !("input" in case_) || !isPlainObject(case_.expected) ||
      !arraysEqual(Object.keys(case_).sort(), ["$schema", "caseVersion", "context", "expected", "id", "input", "target"])) {
    throw new ConformanceEngineError("invalid-case-envelope");
  }
  const expectedKeys = Object.keys(case_.expected);
  if (expectedKeys.length !== 1 || (expectedKeys[0] !== "result" && expectedKeys[0] !== "error")) {
    throw new ConformanceEngineError("invalid-compare-only-expected");
  }
  if (expectedKeys[0] === "error" && (!isPlainObject(case_.expected.error) ||
      !arraysEqual(Object.keys(case_.expected.error), ["code"]) ||
      !/^[a-z][a-z0-9-]{0,127}$/u.test(case_.expected.error.code))) {
    throw new ConformanceEngineError("invalid-typed-expected-error");
  }
  assertRestrictedJsonValue(case_, JSON_LIMITS);
}

function assertContextClosure(context) {
  const expectedKeys = ["catalogs", "clock", "publicMaterial", "sourceBindings", "state", "storage", "transport"];
  if (!arraysEqual(Object.keys(context).sort(), expectedKeys) ||
      !Array.isArray(context.sourceBindings) || context.sourceBindings.length === 0 ||
      !Array.isArray(context.catalogs) || !Array.isArray(context.publicMaterial) ||
      !isPlainObject(context.clock) || !isPlainObject(context.state) ||
      !isPlainObject(context.transport) || !isPlainObject(context.storage)) {
    throw new ConformanceEngineError("incomplete-public-context");
  }
  if (context.sourceBindings.some((binding) => !isPlainObject(binding) ||
      !arraysEqual(Object.keys(binding).sort(), ["sha256", "sourcePath"]) ||
      typeof binding.sourcePath !== "string" || !/^[0-9a-f]{64}$/u.test(binding.sha256) ||
      !isSafeRelativePath(binding.sourcePath))) {
    throw new ConformanceEngineError("invalid-source-binding");
  }
  const paths = context.sourceBindings.map(({ sourcePath }) => sourcePath);
  assertSortedUnique(paths, "source-bindings");
  for (const documents of [context.catalogs, context.publicMaterial]) {
    const names = [];
    for (const document of documents) {
      if (!isPlainObject(document) || !arraysEqual(Object.keys(document).sort(), ["name", "sourcePath", "value"]) ||
          typeof document.name !== "string" || !/^[a-z][a-z0-9-]{0,127}$/u.test(document.name) ||
          typeof document.sourcePath !== "string" || !isSafeRelativePath(document.sourcePath)) {
        throw new ConformanceEngineError("invalid-context-document");
      }
      names.push(document.name);
    }
    assertSortedUnique(names, "context-document-names");
  }
}

function assertNoImplicitOrPrivateInput(value, valuePath) {
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertNoImplicitOrPrivateInput(child, `${valuePath}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replaceAll(/[^a-z0-9]/gu, "");
    if (PRIVATE_MATERIAL_NAMES.has(normalized) && isSerializedPrivateMaterial(child)) {
      throw new ConformanceEngineError("private-key-material-forbidden");
    }
    if (FORBIDDEN_NESTED_NAMES.has(normalized)) throw new ConformanceEngineError("implicit-case-alias-forbidden");
    assertNoImplicitOrPrivateInput(child, `${valuePath}.${key}`);
  }
}

function isSerializedPrivateMaterial(value) {
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return isPlainObject(value) && Object.keys(value).length > 0;
}

function assertSchemaValue(value, schema, schemas) {
  const errors = validateClosedSchema(value, schema, { schemas });
  if (errors.length > 0) throw new ConformanceEngineError("conformance-schema-rejection", undefined, errors);
}

async function readRestrictedJson(root, relativePath) {
  assertSafeRelativePath(relativePath);
  const absolute = resolveInside(root, relativePath);
  const metadata = await lstat(absolute);
  if (!metadata.isFile() || metadata.isSymbolicLink()) throw new ConformanceEngineError("non-regular-conformance-source");
  return parseRestrictedJson(await readFile(absolute), JSON_LIMITS);
}

async function collectJsonFiles(root, relativeDirectory) {
  assertSafeRelativePath(relativeDirectory);
  const absoluteDirectory = resolveInside(root, relativeDirectory);
  const output = [];
  async function visit(absolute, relative) {
    const entries = await readdir(absolute, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) throw new ConformanceEngineError("conformance-symlink-forbidden");
      const childAbsolute = path.join(absolute, entry.name);
      const childRelative = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await visit(childAbsolute, childRelative);
      else if (entry.isFile() && entry.name.endsWith(".json")) output.push(childRelative);
      else if (!entry.isFile()) throw new ConformanceEngineError("non-regular-conformance-entry");
    }
  }
  await visit(absoluteDirectory, relativeDirectory);
  return output;
}

function canonicalPaths(values, label) {
  if (!Array.isArray(values)) throw new ConformanceEngineError(`invalid-${label}`);
  const result = [...values].sort();
  assertSortedUnique(result, label);
  return result;
}

function assertSortedUnique(values, label) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new ConformanceEngineError(`invalid-${label}`);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) throw new ConformanceEngineError(`noncanonical-${label}`);
  }
}

function assertSafeRelativePath(relativePath) {
  if (!isSafeRelativePath(relativePath)) {
    throw new ConformanceEngineError("unsafe-repository-relative-path");
  }
}

function isSafeRelativePath(relativePath) {
  return typeof relativePath === "string" && relativePath.length > 0 && relativePath.length <= 256 &&
    !path.posix.isAbsolute(relativePath) && !relativePath.includes("\\") &&
    !relativePath.split("/").some((part) => part === "" || part === "." || part === "..");
}

function resolveInside(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) throw new ConformanceEngineError("path-escapes-repository");
  return absolute;
}

function permutation(length, seedDigest) {
  const order = Array.from({ length }, (_, index) => index);
  let counter = 0;
  let pool = Buffer.alloc(0);
  function uint32() {
    if (pool.length < 4) {
      const counterBytes = Buffer.alloc(8);
      counterBytes.writeBigUInt64BE(BigInt(counter));
      counter += 1;
      pool = Buffer.concat([pool, createHash("sha256").update(Buffer.from(seedDigest, "hex")).update(counterBytes).digest()]);
    }
    const value = pool.readUInt32BE(0);
    pool = pool.subarray(4);
    return value;
  }
  for (let index = order.length - 1; index > 0; index -= 1) {
    const range = index + 1;
    const limit = Math.floor(0x1_0000_0000 / range) * range;
    let value;
    do value = uint32(); while (value >= limit);
    const selected = value % range;
    [order[index], order[selected]] = [order[selected], order[index]];
  }
  return order;
}

function distinctPermutation(primary, alternate) {
  if (primary.length > 1 && arraysEqual(primary, alternate)) {
    const result = [...alternate];
    [result[0], result[1]] = [result[1], result[0]];
    return result;
  }
  return alternate;
}

function canonicalize(value) {
  return canonicalizeRestrictedJson(value, JSON_LIMITS);
}

function cloneJson(value) {
  return parseRestrictedJson(canonicalize(value), JSON_LIMITS);
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function jsonEqual(left, right) {
  return canonicalize(left) === canonicalize(right);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export { CONFORMANCE_OPERATIONS, CONFORMANCE_OPERATION_IDS };
