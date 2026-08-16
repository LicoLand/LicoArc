import { createHash } from "node:crypto";
import {
  lstat,
  readFile,
  readdir,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceManifestPath = "spec/v1/manifest.json";
const conformanceManifestPath = "conformance/v1/manifest.json";
const artifactPath = "artifacts/v1/licoarc.bundle.json";
const authorityRoots = ["spec/v1", "conformance/v1"];
const expectedManifestVersion = "licoarc.protocol-line-manifest.v1";
const expectedConformanceManifestVersion = "licoarc.conformance-manifest.v1";
const expectedWireId = "licoarc.protocol-line.v1";
const expectedLifecycle = "Candidate";
const expectedArtifactVersion = "licoarc.bundle.v1";
const digestPattern = /^[0-9a-f]{64}$/u;
const capabilityIds = [
  "licoarc.federation-governance.v1",
  "licoarc.generic-messaging.v1",
  "licoarc.group-collaboration.v1",
  "licoarc.https-transport.v1",
  "licoarc.identity.v1",
  "licoarc.pairwise-protection.v1",
  "licoarc.protocol-foundation.v1",
  "licoarc.reliable-exchange.v1",
  "licoarc.transferable-evidence.v1"
];

const arguments_ = process.argv.slice(2);
if (arguments_.length > 1 ||
    (arguments_.length === 1 && arguments_[0] !== "--check")) {
  throw new TypeError("expected no arguments or --check");
}
const checkOnly = arguments_[0] === "--check";

const manifest = await readJson(sourceManifestPath);
const conformanceManifest = await readJson(conformanceManifestPath);
validateSourceManifest(manifest);
validateConformanceManifest(conformanceManifest);

const actualAuthorityFiles = (await Promise.all(
  authorityRoots.map((authorityRoot) => collectRegularFiles(authorityRoot))
)).flat().sort();
for (const sourcePath of actualAuthorityFiles) {
  if (!/\.(?:json|cddl)$/u.test(sourcePath)) {
    throw new TypeError("authority files must be JSON or CDDL");
  }
}

const declaredSourceFiles = [
  sourceManifestPath,
  ...manifest.governanceSources,
  ...manifest.runtimeSources
].sort();
assertEqualArrays(actualAuthorityFiles, declaredSourceFiles,
  "Protocol Line source closure");

const aggregateManifestFiles = new Set([
  sourceManifestPath,
  conformanceManifestPath
]);
const capabilitySourceFiles = actualAuthorityFiles.filter((sourcePath) =>
  !aggregateManifestFiles.has(sourcePath));
assertEqualArrays(
  capabilitySourceFiles,
  conformanceManifest.sourcePaths,
  "conformance source closure"
);

const sourceBytes = new Map();
const sourceValues = new Map();
for (const sourcePath of actualAuthorityFiles) {
  const bytes = await readFile(fromRelativePath(sourcePath));
  sourceBytes.set(sourcePath, bytes);
  if (sourcePath.endsWith(".json")) {
    sourceValues.set(sourcePath, sortJsonValue(JSON.parse(bytes.toString("utf8"))));
  } else {
    sourceValues.set(sourcePath, decodeUtf8Cddl(bytes, sourcePath));
  }
}

const digestByPath = Object.fromEntries(
  capabilitySourceFiles.map((sourcePath) => [
    sourcePath,
    sha256(sourceBytes.get(sourcePath))
  ])
);
assertDigestMap(conformanceManifest.sourceDigests, digestByPath,
  "conformance source digests");

const capabilityById = new Map(
  conformanceManifest.capabilities.map((capability) => [
    capability.capabilityId,
    capability
  ])
);
const manifestCapabilityById = new Map(
  manifest.capabilities.map((capability) => [
    capability.capabilityId,
    capability
  ])
);
for (const capabilityId of capabilityIds) {
  const capability = capabilityById.get(capabilityId);
  const manifestCapability = manifestCapabilityById.get(capabilityId);
  if (!capability || !manifestCapability) {
    throw new Error("Protocol Line capability set is incomplete");
  }
  validateCapability(capability, manifestCapability, digestByPath, sourceValues);
}
if (capabilityById.size !== capabilityIds.length ||
    manifestCapabilityById.size !== capabilityIds.length) {
  throw new Error("Protocol Line capability set contains an undeclared entry");
}

const expectedMinimumSafe = capabilityIds.map((capabilityId) => ({
  capabilityId,
  minimumVersion: 1
}));
if (!deepEqual(manifest.minimumSafe.capabilityVersions, expectedMinimumSafe)) {
  throw new Error("minimum-safe capability policy is not the closed Candidate set");
}

const sourcePaths = [sourceManifestPath, conformanceManifestPath,
  ...capabilitySourceFiles].sort();
const sources = Object.fromEntries(
  sourcePaths.map((sourcePath) => [sourcePath, sourceValues.get(sourcePath) ??
    sortJsonValue(JSON.parse((sourceBytes.get(sourcePath)).toString("utf8")))])
);
const body = {
  artifactVersion: expectedArtifactVersion,
  wireId: manifest.wireId,
  lifecycle: manifest.lifecycle,
  digestAlgorithm: "sha256",
  sources
};
const canonical = `${canonicalizeJson(body)}\n`;
const artifact = `${JSON.stringify({
  ...body,
  digest: sha256(Buffer.from(canonical, "utf8"))
}, null, 2)}\n`;
const output = fromRelativePath(artifactPath);

if (checkOnly) {
  const current = await readFile(output, "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  });
  if (current !== artifact) {
    throw new Error(`${expectedArtifactVersion} artifact is missing or stale`);
  }
} else {
  await writeFile(output, artifact);
}

function validateSourceManifest(value) {
  assertClosedObject(value, [
    "$schema",
    "manifestVersion",
    "wireId",
    "lifecycle",
    "minimumSafe",
    "capabilities",
    "governanceSources",
    "runtimeSources",
    "boundsRegistry",
    "handshakeBinding",
    "sessionLock",
    "translationPolicy"
  ], "source manifest");
  assertEqual(value.manifestVersion, expectedManifestVersion, "manifest version");
  assertEqual(value.wireId, expectedWireId, "Protocol Line identity");
  assertEqual(value.lifecycle, expectedLifecycle, "Protocol Line lifecycle");
  assertEqual(value.minimumSafe?.protocolLineVersion, 1,
    "minimum-safe Protocol Line version");
  if (value.$schema !== "https://json-schema.org/draft/2020-12/schema") {
    throw new TypeError("source manifest schema marker is not canonical");
  }
  if (value.boundsRegistry !== "spec/v1/foundation/bounds.json" ||
      value.handshakeBinding !==
        "manifest-capabilities-identities-and-declarations" ||
      value.sessionLock !== true || value.translationPolicy !== "forbidden") {
    throw new Error("Protocol Line foundation policy is not closed");
  }
  assertSortedUnique(value.governanceSources, "governance source paths");
  assertSortedUnique(value.runtimeSources, "runtime source paths");
  if (value.governanceSources.some((sourcePath) => !sourcePath.endsWith(".json"))) {
    throw new TypeError("governance sources must be JSON");
  }
  if (value.runtimeSources.some((sourcePath) => !sourcePath.endsWith(".cddl"))) {
    throw new TypeError("runtime sources must be CDDL");
  }
  assertSortedUnique(value.capabilities.map(({ capabilityId }) => capabilityId),
    "manifest capability identities");
  for (const capability of value.capabilities) {
    assertClosedObject(capability, ["capabilityId", "version", "sourceDigest"],
      "manifest capability");
    if (capability.version !== 1 || !digestPattern.test(capability.sourceDigest)) {
      throw new TypeError("manifest capability version or digest is invalid");
    }
  }
}

function validateConformanceManifest(value) {
  assertClosedObject(value, [
    "$schema",
    "manifestVersion",
    "wireId",
    "lifecycle",
    "capabilities",
    "sourcePaths",
    "sourceDigests",
    "positiveCorpusPaths",
    "negativeCorpusPaths"
  ], "conformance manifest");
  if (value.$schema !== "https://json-schema.org/draft/2020-12/schema" ||
      value.manifestVersion !== expectedConformanceManifestVersion ||
      value.wireId !== expectedWireId || value.lifecycle !== expectedLifecycle) {
    throw new TypeError("conformance manifest identity is not canonical");
  }
  assertSortedUnique(value.sourcePaths, "conformance source paths");
  assertSortedUnique(value.positiveCorpusPaths, "positive corpus paths");
  assertSortedUnique(value.negativeCorpusPaths, "negative corpus paths");
  assertSortedUnique(value.capabilities.map(({ capabilityId }) => capabilityId),
    "conformance capability identities");
  if (value.capabilities.length !== capabilityIds.length ||
      !deepEqual(value.capabilities.map(({ capabilityId }) => capabilityId), capabilityIds)) {
    throw new Error("conformance capability identities are not the closed set");
  }
  if (!isPlainObject(value.sourceDigests)) {
    throw new TypeError("conformance source digests must be an object");
  }
  for (const digest of Object.values(value.sourceDigests)) {
    if (!digestPattern.test(digest)) throw new TypeError("invalid source digest");
  }
}

function validateCapability(capability, manifestCapability, digestByPath, sourceValues) {
  assertClosedObject(capability, [
    "capabilityId",
    "version",
    "lifecycle",
    "registryPath",
    "sourceManifestPath",
    "conformanceManifestPath",
    "policyPaths",
    "schemaPaths",
    "requirementPaths",
    "vectorPaths",
    "positiveCorpusPath",
    "negativeCorpusPath",
    "sourcePaths",
    "sourceDigests",
    "sourceDigest"
  ], "conformance capability");
  if (capability.version !== 1 || capability.lifecycle !== expectedLifecycle ||
      capability.conformanceManifestPath !==
        `conformance/v1/${capabilityGroup(capability.capabilityId)}/manifest.json`) {
    throw new Error("capability lifecycle or conformance binding is invalid");
  }
  assertSortedUnique(capability.sourcePaths, "capability source paths");
  for (const sourcePath of capability.sourcePaths) {
    if (!Object.hasOwn(digestByPath, sourcePath)) {
      throw new Error("capability source is outside the closed source set");
    }
  }
  assertDigestMap(capability.sourceDigests,
    Object.fromEntries(capability.sourcePaths.map((sourcePath) => [
      sourcePath,
      digestByPath[sourcePath]
    ])), "capability source digests");
  const capabilityDigest = digestForSourceMap(capability.sourceDigests);
  if (capability.sourceDigest !== capabilityDigest ||
      manifestCapability.sourceDigest !== capabilityDigest) {
    throw new Error("capability digest binding is stale");
  }
  if (capability.registryPath === null ||
      !capability.sourcePaths.includes(capability.registryPath) ||
      !capability.sourcePaths.includes(capability.positiveCorpusPath) ||
      !capability.sourcePaths.includes(capability.negativeCorpusPath)) {
    throw new Error("capability registry or corpus binding is incomplete");
  }
  for (const field of ["policyPaths", "schemaPaths", "requirementPaths", "vectorPaths"]) {
    assertSortedUnique(capability[field], `${field} for ${capability.capabilityId}`);
    for (const sourcePath of capability[field]) {
      if (!capability.sourcePaths.includes(sourcePath)) {
        throw new Error(`${field} contains an undeclared source`);
      }
    }
  }
  if (!capability.vectorPaths.includes(capability.positiveCorpusPath) ||
      !capability.vectorPaths.includes(capability.negativeCorpusPath)) {
    throw new Error("capability vectors do not cover both corpora");
  }
  const registry = sourceValues.get(capability.registryPath);
  if (!isPlainObject(registry) || registry.lifecycle !== expectedLifecycle) {
    throw new Error("capability registry lifecycle is not Candidate");
  }
  const registryIdentities = new Set([
    capability.capabilityId,
    ...(capability.capabilityId === "licoarc.transferable-evidence.v1"
      ? ["licoarc.evidence.v1"] : []),
    ...(capability.capabilityId === "licoarc.reliable-exchange.v1"
      ? ["licoarc.reliable.v1"] : [])
  ]);
  if (capability.capabilityId !== "licoarc.protocol-foundation.v1" &&
      !registryIdentities.has(registry.capabilityId) &&
      !registryIdentities.has(registry.wireId)) {
    throw new Error("registry identity does not match capability identity");
  }
}

function capabilityGroup(capabilityId) {
  const groups = {
    "licoarc.federation-governance.v1": "governance",
    "licoarc.generic-messaging.v1": "messaging",
    "licoarc.group-collaboration.v1": "group",
    "licoarc.https-transport.v1": "transport",
    "licoarc.identity.v1": "identity",
    "licoarc.pairwise-protection.v1": "protection",
    "licoarc.protocol-foundation.v1": "foundation",
    "licoarc.reliable-exchange.v1": "reliable",
    "licoarc.transferable-evidence.v1": "evidence"
  };
  const group = groups[capabilityId];
  if (!group) throw new Error("unknown capability identity");
  return group;
}

async function collectRegularFiles(relativeDirectory) {
  const absoluteDirectory = fromRelativePath(relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  entries.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  const files = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const absolutePath = fromRelativePath(relativePath);
    const stat = await lstat(absolutePath);
    if (stat.isSymbolicLink() || entry.isSymbolicLink()) {
      throw new TypeError("authority files must not be symbolic links");
    }
    if (entry.isDirectory()) files.push(...await collectRegularFiles(relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new TypeError("authority files must be regular files");
  }
  return files;
}

async function readJson(relativePath) {
  const bytes = await readFile(fromRelativePath(relativePath));
  const source = bytes.toString("utf8");
  assertNoDuplicateJsonObjectKeys(source);
  return JSON.parse(source);
}

function fromRelativePath(relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function decodeUtf8Cddl(bytes, sourcePath) {
  const value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (!value.endsWith("\n") || value.includes("\r") || value.includes("\u0000")) {
    throw new TypeError(`invalid CDDL source: ${sourcePath}`);
  }
  return value;
}

function assertClosedObject(value, expectedKeys, name) {
  if (!isPlainObject(value)) throw new TypeError(`${name} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  assertEqualArrays(actual, expected, `${name} fields`);
}

function assertEqual(actual, expected, name) {
  if (actual !== expected) throw new TypeError(`${name} does not match the closed contract`);
}

function assertSortedUnique(values, name) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new TypeError(`${name} must be an array of strings`);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) {
      throw new TypeError(`${name} must be sorted and unique`);
    }
  }
}

function assertEqualArrays(actual, expected, name) {
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    throw new Error(`${name} does not close over the declared files`);
  }
}

function assertDigestMap(actual, expected, name) {
  if (!isPlainObject(actual) || !deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort())) {
    throw new Error(`${name} keys are not closed`);
  }
  for (const [sourcePath, digest] of Object.entries(expected)) {
    if (actual[sourcePath] !== digest) throw new Error(`${name} is stale`);
  }
}

function digestForSourceMap(sourceDigests) {
  return sha256(Buffer.from(`${canonicalizeJson(sourceDigests)}\n`, "utf8"));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sortJsonValue(value) {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJsonValue(value[key])]));
  }
  return value;
}

function canonicalizeJson(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("canonical JSON disallows non-finite numbers");
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    assertUnicodeScalarString(value);
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalizeJson).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => {
      assertUnicodeScalarString(key);
      return `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`;
    }).join(",")}}`;
  }
  throw new TypeError("canonical JSON supports only JSON values");
}

function assertUnicodeScalarString(value) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit < 0xdc00 || nextCodeUnit > 0xdfff) {
        throw new TypeError("canonical JSON strings must contain Unicode scalars");
      }
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new TypeError("canonical JSON strings must contain Unicode scalars");
    }
  }
}

function assertNoDuplicateJsonObjectKeys(source) {
  let cursor = 0;
  parseValue();
  skipWhitespace();
  if (cursor !== source.length) throw new SyntaxError("JSON source contains trailing content");

  function parseValue() {
    skipWhitespace();
    switch (source[cursor]) {
      case "{": parseObject(); break;
      case "[": parseArray(); break;
      case '"': parseString(false); break;
      case "t": cursor += 4; break;
      case "f": cursor += 5; break;
      case "n": cursor += 4; break;
      default:
        while (cursor < source.length && /[-+0-9.eE]/u.test(source[cursor])) cursor += 1;
    }
  }

  function parseObject() {
    cursor += 1;
    skipWhitespace();
    const keys = new Set();
    if (source[cursor] === "}") { cursor += 1; return; }
    while (cursor < source.length) {
      const key = parseString(true);
      if (keys.has(key)) throw new SyntaxError("JSON source contains duplicate object member");
      keys.add(key);
      skipWhitespace();
      if (source[cursor] !== ":") throw new SyntaxError("JSON object member is missing a colon");
      cursor += 1;
      parseValue();
      skipWhitespace();
      if (source[cursor] === "}") { cursor += 1; return; }
      if (source[cursor] !== ",") throw new SyntaxError("JSON object member is missing a comma");
      cursor += 1;
      skipWhitespace();
    }
    throw new SyntaxError("JSON object is unterminated");
  }

  function parseArray() {
    cursor += 1;
    skipWhitespace();
    if (source[cursor] === "]") { cursor += 1; return; }
    while (cursor < source.length) {
      parseValue();
      skipWhitespace();
      if (source[cursor] === "]") { cursor += 1; return; }
      if (source[cursor] !== ",") throw new SyntaxError("JSON array member is missing a comma");
      cursor += 1;
      skipWhitespace();
    }
    throw new SyntaxError("JSON array is unterminated");
  }

  function parseString(decode) {
    const start = cursor;
    cursor += 1;
    while (cursor < source.length) {
      if (source[cursor] === "\\") cursor += 2;
      else if (source[cursor] === '"') {
        cursor += 1;
        return decode ? JSON.parse(source.slice(start, cursor)) : undefined;
      } else cursor += 1;
    }
    throw new SyntaxError("JSON string is unterminated");
  }

  function skipWhitespace() {
    while (cursor < source.length && /[ \n\r\t]/u.test(source[cursor])) cursor += 1;
  }
}
