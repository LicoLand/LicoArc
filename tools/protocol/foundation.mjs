import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertRestrictedJsonValue,
  canonicalizeRestrictedJson,
  canonicalizeRestrictedJsonBytes,
  parseRestrictedJson,
  RestrictedJsonError
} from "./canonical-json.mjs";
import {
  decodeDeterministicCbor,
  encodeDeterministicCbor,
  DeterministicCborError
} from "./deterministic-cbor.mjs";
import {
  assertClosedJsonSchema,
  assertValidAgainstClosedSchema,
  validateClosedSchema,
  SchemaError
} from "./schema.mjs";

export const FOUNDATION_SOURCE_MANIFEST = "spec/v1/foundation/source-manifest.json";
export const FOUNDATION_ROOTS = Object.freeze([
  "conformance/v1/foundation",
  "spec/v1/foundation",
  "spec/v1/schemas"
]);
export const FOUNDATION_REGISTRY_PATHS = Object.freeze({
  bounds: "spec/v1/foundation/bounds.json",
  identifiers: "spec/v1/foundation/identifiers.json",
  lifecycle: "spec/v1/foundation/lifecycle.json",
  labels: "spec/v1/foundation/labels.json",
  representation: "spec/v1/foundation/representation.json",
  registry: "spec/v1/foundation/registry.json",
  sourceManifest: FOUNDATION_SOURCE_MANIFEST
});

const DEFAULT_REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BOUNDS_SCHEMA_PATH = "spec/v1/schemas/foundation-bounds.schema.json";
const SCHEMA_PATHS = Object.freeze({
  common: "spec/schemas/catalog-common.schema.json",
  bounds: BOUNDS_SCHEMA_PATH,
  identifiers: "spec/v1/schemas/foundation-identifiers.schema.json",
  lifecycle: "spec/v1/schemas/foundation-lifecycle.schema.json",
  labels: "spec/v1/schemas/foundation-labels.schema.json",
  representation: "spec/v1/schemas/foundation-representation.schema.json",
  registry: "spec/v1/schemas/foundation-registry.schema.json",
  sourceManifest: "spec/v1/schemas/source-manifest.schema.json",
  protocolLineManifest: "spec/v1/schemas/protocol-line-manifest.schema.json",
  runtimeRecord: "spec/v1/schemas/runtime-record.schema.json",
  governanceArtifact: "spec/v1/schemas/governance-artifact.schema.json"
});

export class FoundationError extends TypeError {
  constructor(message, details = undefined) {
    super(message);
    this.name = "FoundationError";
    if (details !== undefined) this.details = details;
  }
}

/** Load and verify every machine-readable foundation source. */
export async function loadFoundationContext(repositoryRoot = DEFAULT_REPOSITORY_ROOT) {
  const root = path.resolve(repositoryRoot);
  const unrestricted = { maxBytes: 1_048_576, maxDepth: 32, maxArrayItems: 512, maxObjectMembers: 256, maxStringBytes: 16_384 };
  const rawBounds = await readJsonAt(root, FOUNDATION_REGISTRY_PATHS.bounds, unrestricted);
  const limits = limitsFromBounds(rawBounds);
  const schemas = {};
  for (const [name, relativePath] of Object.entries(SCHEMA_PATHS)) {
    schemas[name] = await readJsonAt(root, relativePath, {
      maxBytes: rawBounds.bounds.MAX_GOVERNANCE_BYTES,
      maxDepth: rawBounds.bounds.MAX_NESTING_DEPTH,
      maxArrayItems: rawBounds.bounds.MAX_ARRAY_ITEMS,
      maxObjectMembers: rawBounds.bounds.MAX_OBJECT_MEMBERS,
      maxStringBytes: rawBounds.bounds.MAX_TEXT_BYTES
    });
    assertClosedJsonSchema(schemas[name]);
  }
  const bounds = rawBounds;
  assertValidAgainstClosedSchema(bounds, schemas.bounds);
  const documents = {};
  for (const [name, relativePath] of Object.entries(FOUNDATION_REGISTRY_PATHS)) {
    documents[name] = name === "bounds" ? bounds : await readJsonAt(root, relativePath, limits.governance);
  }
  for (const [name, schemaName] of Object.entries({
    bounds: "bounds",
    identifiers: "identifiers",
    lifecycle: "lifecycle",
    labels: "labels",
    representation: "representation",
    registry: "registry",
    sourceManifest: "sourceManifest"
  })) {
    assertValidAgainstClosedSchema(documents[name], schemas[schemaName]);
  }
  assertFoundationRegistries(documents, limits);
  const sourceClosure = await assertFoundationSourceClosure(root, documents.sourceManifest, limits);
  return Object.freeze({
    root,
    bounds,
    limits,
    registries: Object.freeze(documents),
    schemas: Object.freeze(schemas),
    sourceClosure
  });
}

export function limitsFromBounds(boundsDocument) {
  if (!boundsDocument || !boundsDocument.bounds) throw new FoundationError("bounds registry is missing");
  const bounds = boundsDocument.bounds;
  const names = [
    "MAX_SOURCE_FILES", "MAX_SOURCE_BYTES", "MAX_MANIFEST_BYTES", "MAX_GOVERNANCE_BYTES",
    "MAX_RUNTIME_RECORD_BYTES", "MAX_RAW_BYTES", "MAX_TEXT_BYTES", "MAX_IDENTIFIER_BYTES",
    "MAX_ARRAY_ITEMS", "MAX_MAP_ENTRIES", "MAX_OBJECT_MEMBERS", "MAX_NESTING_DEPTH", "MAX_INTEGER"
  ];
  for (const name of names) {
    if (!Number.isSafeInteger(bounds[name]) || bounds[name] <= 0) throw new FoundationError(`bound ${name} is not a positive safe integer`);
  }
  return Object.freeze({
    governance: Object.freeze({
      maxBytes: bounds.MAX_GOVERNANCE_BYTES,
      maxDepth: bounds.MAX_NESTING_DEPTH,
      maxArrayItems: bounds.MAX_ARRAY_ITEMS,
      maxObjectMembers: bounds.MAX_OBJECT_MEMBERS,
      maxStringBytes: bounds.MAX_TEXT_BYTES
    }),
    manifest: Object.freeze({
      maxBytes: bounds.MAX_MANIFEST_BYTES,
      maxDepth: bounds.MAX_NESTING_DEPTH,
      maxArrayItems: bounds.MAX_ARRAY_ITEMS,
      maxObjectMembers: bounds.MAX_OBJECT_MEMBERS,
      maxStringBytes: bounds.MAX_TEXT_BYTES
    }),
    runtime: Object.freeze({
      maxBytes: bounds.MAX_RUNTIME_RECORD_BYTES,
      maxDepth: bounds.MAX_NESTING_DEPTH,
      maxArrayItems: bounds.MAX_ARRAY_ITEMS,
      maxMapEntries: bounds.MAX_MAP_ENTRIES,
      maxRawBytes: bounds.MAX_RAW_BYTES,
      maxTextBytes: bounds.MAX_TEXT_BYTES,
      maxInteger: bounds.MAX_INTEGER
    }),
    source: Object.freeze({
      maxFiles: bounds.MAX_SOURCE_FILES,
      maxBytes: bounds.MAX_SOURCE_BYTES
    })
  });
}

export async function parseGovernanceDocument(input, schema, contextOrLimits = {}) {
  const limits = contextOrLimits.limits?.governance ?? contextOrLimits.governance ?? contextOrLimits;
  const value = parseRestrictedJson(input, limits);
  assertValidAgainstClosedSchema(value, schema);
  return value;
}

export function canonicalizeGovernanceDocument(value, contextOrLimits = {}) {
  const limits = contextOrLimits.limits?.governance ?? contextOrLimits.governance ?? contextOrLimits;
  return canonicalizeRestrictedJson(value, limits);
}

export function validateProtocolLineManifest(value, context) {
  const schema = context?.schemas?.protocolLineManifest;
  const common = context?.schemas?.common;
  if (!schema || !common) {
    throw new FoundationError("protocol-line manifest and shared catalog schemas are required");
  }
  const errors = validateClosedSchema(value, schema, { schemas: [common] });
  if (errors.length > 0) return errors;
  if (!Array.isArray(value.capabilities) ||
      !Array.isArray(value.sourceClosure?.roots) ||
      !Array.isArray(value.sourceClosure?.additionalSources)) {
    return ["manifest source closure is required"];
  }
  if (!isSortedUnique(value.capabilities.map(({ capabilityId }) => capabilityId))) {
    return ["manifest capabilities must be sorted and unique"];
  }
  if (new Set(value.sourceClosure.additionalSources).size !==
      value.sourceClosure.additionalSources.length) {
    return ["additional source paths must be unique"];
  }
  return [];
}

export function assertValidProtocolLineManifest(value, context) {
  const errors = validateProtocolLineManifest(value, context);
  if (errors.length > 0) throw new FoundationError(`Protocol Line manifest is invalid: ${errors.join("; ")}`, errors);
  return value;
}

export function decodeFoundationRuntimeRecord(input, context) {
  if (!context?.registries?.labels) throw new FoundationError("foundation context is required");
  let value;
  try {
    value = decodeDeterministicCbor(input, context.limits.runtime);
  } catch (error) {
    if (error instanceof DeterministicCborError) throw error;
    throw new FoundationError("runtime record could not be decoded", { cause: error });
  }
  if (value === null || typeof value !== "object" || Array.isArray(value) || value instanceof Uint8Array) {
    throw new FoundationError("runtime record must be a CBOR map");
  }
  const labelDefinitions = new Map(context.registries.labels.labels.map(({ label, name, required }) => [String(label), { name, required }]));
  for (const key of Object.keys(value)) {
    if (!labelDefinitions.has(key)) throw new FoundationError(`runtime record contains an unknown label ${key}`);
  }
  for (const [label, definition] of labelDefinitions) {
    if (definition.required && !(label in value)) throw new FoundationError(`runtime record is missing required label ${label}`);
  }
  if (!(typeof value["0"] === "number" && Number.isSafeInteger(value["0"]) && value["0"] >= 0)) {
    throw new FoundationError("runtime record label 0 must be an unsigned integer");
  }
  if ("1" in value && !(value["1"] instanceof Uint8Array)) throw new FoundationError("runtime record label 1 must be raw bytes");
  if ("2" in value && !(typeof value["2"] === "number" && Number.isSafeInteger(value["2"]) && value["2"] >= 0)) {
    throw new FoundationError("runtime record label 2 must be an unsigned integer");
  }
  return value;
}

export function encodeFoundationRuntimeRecord(record, context) {
  if (!context?.registries?.labels) throw new FoundationError("foundation context is required");
  if (record === null || typeof record !== "object" || Array.isArray(record) || record instanceof Uint8Array) throw new FoundationError("runtime record must be a map");
  const labelDefinitions = new Map(context.registries.labels.labels.map(({ label, name, required }) => [String(label), { name, required }]));
  for (const key of Object.keys(record)) if (!labelDefinitions.has(key)) throw new FoundationError(`runtime record contains an unknown label ${key}`);
  for (const [label, definition] of labelDefinitions) if (definition.required && !(label in record)) throw new FoundationError(`runtime record is missing required label ${label}`);
  if (!(typeof record["0"] === "number" && Number.isSafeInteger(record["0"]) && record["0"] >= 0)) throw new FoundationError("runtime record label 0 must be an unsigned integer");
  if ("1" in record && !(record["1"] instanceof Uint8Array)) throw new FoundationError("runtime record label 1 must be raw bytes");
  if ("2" in record && !(typeof record["2"] === "number" && Number.isSafeInteger(record["2"]) && record["2"] >= 0)) throw new FoundationError("runtime record label 2 must be an unsigned integer");
  return encodeDeterministicCbor(record, context.limits.runtime);
}

export async function assertFoundationSourceClosure(repositoryRoot, manifest, limits) {
  const root = path.resolve(repositoryRoot);
  const manifestPath = FOUNDATION_SOURCE_MANIFEST;
  const declared = manifest.sources;
  if (!arraysEqual(manifest.sourceRoots ?? [], FOUNDATION_ROOTS)) {
    throw new FoundationError("foundation source roots do not match the closed registry");
  }
  if (!isSortedUnique(declared)) throw new FoundationError("foundation source paths must be sorted and unique");
  if (declared.length > limits.source.maxFiles) throw new FoundationError("foundation source count exceeds the bound");
  for (const sourcePath of declared) assertSafeRelativePath(sourcePath);
  const actual = (await Promise.all(FOUNDATION_ROOTS.map((sourceRoot) => collectRegularFiles(root, sourceRoot)))).flat().sort();
  const filteredActual = actual.filter((sourcePath) => sourcePath !== manifestPath);
  if (!arraysEqual(filteredActual, declared)) throw new FoundationError("foundation source manifest does not close over its authority roots", { declared, actual: filteredActual });
  return Object.freeze({ manifestPath, declared: Object.freeze([...declared]), actual: Object.freeze(filteredActual) });
}

export async function generateFoundationBundle({ repositoryRoot = DEFAULT_REPOSITORY_ROOT, manifestPath = FOUNDATION_SOURCE_MANIFEST } = {}) {
  const root = path.resolve(repositoryRoot);
  const manifest = await readJsonAt(root, manifestPath, { maxBytes: 65_536, maxDepth: 32, maxArrayItems: 512, maxObjectMembers: 256, maxStringBytes: 16_384 });
  const context = await loadFoundationContext(root);
  if (manifestPath !== FOUNDATION_SOURCE_MANIFEST) throw new FoundationError("foundation generation is pinned to the foundation source manifest");
  assertValidAgainstClosedSchema(manifest, context.schemas.sourceManifest);
  await assertFoundationSourceClosure(root, manifest, context.limits);
  const sources = [];
  for (const sourcePath of manifest.sources) {
    const bytes = await readFile(path.join(root, ...sourcePath.split("/")));
    if (bytes.byteLength > context.limits.source.maxBytes) throw new FoundationError(`source exceeds the bound: ${sourcePath}`);
    const extension = path.posix.extname(sourcePath);
    let representation;
    let canonicalBytes = bytes;
    if (extension === ".json") {
      const value = parseRestrictedJson(bytes, context.limits.governance);
      canonicalBytes = canonicalizeRestrictedJsonBytes(value, context.limits.governance);
      representation = "restricted-jcs";
    } else if (extension === ".cddl") {
      representation = "closed-cddl";
      assertUtf8LineSource(bytes, sourcePath);
    } else {
      throw new FoundationError(`foundation source extension is not admitted: ${sourcePath}`);
    }
    sources.push({
      path: sourcePath,
      representation,
      bytes: canonicalBytes.byteLength,
      digest: sha256(canonicalBytes)
    });
  }
  const body = {
    artifactVersion: manifest.artifactVersion,
    manifestVersion: manifest.manifestVersion,
    lifecycle: manifest.lifecycle,
    digestAlgorithm: manifest.digestAlgorithm,
    representation: manifest.representation,
    sources
  };
  const canonical = canonicalizeRestrictedJson(body, context.limits.governance);
  const digest = sha256(new TextEncoder().encode(canonical));
  const bytes = new TextEncoder().encode(`${canonical}\n`);
  return Object.freeze({ body: Object.freeze(body), digest, canonical, bytes, context });
}

export async function writeFoundationBundle(outputPath, options = {}) {
  const bundle = await generateFoundationBundle(options);
  const root = path.resolve(options.repositoryRoot ?? DEFAULT_REPOSITORY_ROOT);
  const target = path.isAbsolute(outputPath) ? outputPath : path.join(root, ...outputPath.split("/"));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bundle.bytes);
  return bundle;
}

export async function readJsonAt(root, relativePath, limits) {
  const source = await readFile(path.join(root, ...relativePath.split("/")));
  try {
    return parseRestrictedJson(source, limits);
  } catch (error) {
    if (error instanceof RestrictedJsonError) throw new FoundationError(`invalid governance JSON at ${relativePath}`, { cause: error });
    throw error;
  }
}

function assertFoundationRegistries(documents, limits) {
  const { identifiers, lifecycle, labels, registry, representation } = documents;
  const identifiersByValue = new Set();
  const identifiersByName = new Set();
  for (const identifier of identifiers.identifiers) {
    if (identifiersByValue.has(identifier.value) || identifiersByName.has(identifier.name)) throw new FoundationError("foundation identifiers must be unique");
    identifiersByValue.add(identifier.value);
    identifiersByName.add(identifier.name);
    if (identifier.wire !== false) throw new FoundationError("foundation identifiers cannot become runtime wire values");
  }
  const states = new Set(lifecycle.states.map(({ id }) => id));
  if (!states.has("Candidate") || !states.has("Published")) throw new FoundationError("foundation lifecycle is incomplete");
  const expectedTransitions = new Set(["Draft->Candidate", "Candidate->Candidate", "Candidate->Published"]);
  const actualTransitions = new Set();
  for (const transition of lifecycle.transitions) {
    if (!states.has(transition.from) || !states.has(transition.to)) throw new FoundationError("foundation lifecycle transition references an unknown state");
    const edge = `${transition.from}->${transition.to}`;
    if (!expectedTransitions.has(edge) || actualTransitions.has(edge)) throw new FoundationError(`foundation lifecycle transition is not admitted: ${edge}`);
    actualTransitions.add(edge);
  }
  if (actualTransitions.size !== expectedTransitions.size) throw new FoundationError("foundation lifecycle transition set is incomplete");
  const stateById = new Map(lifecycle.states.map((state) => [state.id, state]));
  if (stateById.get("Published")?.mutable !== false || lifecycle.definitionStatusRegistry !== "spec/protocol-lines.json") {
    throw new FoundationError("published content must be immutable");
  }
  const labelsByValue = new Set();
  const labelsByName = new Set();
  for (const label of labels.labels) {
    if (!Number.isSafeInteger(label.label) || label.label < 0 || labelsByValue.has(label.label) || labelsByName.has(label.name)) throw new FoundationError("foundation runtime labels must be unique unsigned integers");
    labelsByValue.add(label.label);
    labelsByName.add(label.name);
  }
  if (!labels.labels.some(({ label, required }) => label === 0 && required === true)) throw new FoundationError("foundation runtime label 0 must be required");
  if (representation.composition.translation !== "forbidden" || representation.composition.substitution !== "forbidden") throw new FoundationError("source representations cannot be translated or substituted");
  if (registry.parserPolicy.failClosed !== true || registry.sourceClosure.undeclaredFiles !== "reject") throw new FoundationError("foundation parser and source closure must fail closed");
  limitsFromBounds(documents.bounds);
}

async function collectRegularFiles(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, ...relativeDirectory.split("/"));
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  const files = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = path.join(root, ...relativePath.split("/"));
    const stat = await lstat(absolutePath);
    if (stat.isSymbolicLink() || entry.isSymbolicLink()) throw new FoundationError(`foundation source path cannot be a symlink: ${relativePath}`);
    if (entry.isDirectory()) files.push(...await collectRegularFiles(root, relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new FoundationError(`foundation source path must be a regular file: ${relativePath}`);
  }
  return files;
}

function assertUtf8LineSource(bytes, sourcePath) {
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch (error) { throw new FoundationError(`CDDL source is not UTF-8: ${sourcePath}`, { cause: error }); }
  if (text.includes("\r") || text.includes("\u0000")) throw new FoundationError(`CDDL source must use UTF-8 LF text: ${sourcePath}`);
  if (!text.endsWith("\n")) throw new FoundationError(`CDDL source must end with LF: ${sourcePath}`);
}

function assertSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\\") || path.posix.isAbsolute(value) || path.posix.normalize(value) !== value || value.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new FoundationError(`unsafe foundation source path: ${value}`);
  }
  if (!FOUNDATION_ROOTS.some((root) => value.startsWith(`${root}/`))) throw new FoundationError(`foundation source path is outside declared roots: ${value}`);
}

function isSortedUnique(values) {
  return values.every((value, index) => index === 0 || values[index - 1] < value);
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
