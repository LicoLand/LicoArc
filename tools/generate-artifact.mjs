import { createHash } from "node:crypto";
import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  assertClosedJsonSchema,
  assertValidAgainstClosedSchema,
  assertValidProtocolCatalogs,
  assertValidProtocolLineManifest,
  assertValidSecurityAccounting,
  loadFoundationContext,
  parseRestrictedJson
} from "./protocol/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = "spec/v1/manifest.json";
const conformanceManifestPath = "conformance/v1/manifest.json";
const artifactPath = "artifacts/v1/licoarc.bundle.json";
const catalogPaths = {
  protocolLines: "spec/protocol-lines.json",
  protectionProfiles: "spec/protection-profiles.json"
};
const catalogSchemaPaths = {
  protocolLines: "spec/schemas/protocol-lines.schema.json",
  protectionProfiles: "spec/schemas/protection-profiles.schema.json"
};
const securityPaths = {
  claims: "spec/v1/security/claims.json",
  adversaries: "spec/v1/security/adversary-model.json",
  bindings: "spec/v1/security/formal-bindings.json",
  registry: "spec/v1/security/registry.json"
};
const securitySchemaPaths = {
  claims: "spec/schemas/security-claims.schema.json",
  adversaries: "spec/schemas/security-adversary-model.schema.json",
  bindings: "spec/schemas/security-formal-bindings.schema.json",
  registry: "spec/schemas/security-registry.schema.json"
};

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
  throw new TypeError("expected no arguments or --check");
}
const checkOnly = args[0] === "--check";

const context = await loadFoundationContext(root);
const limits = context.limits.governance;
const manifest = await readJson(manifestPath);
assertValidProtocolLineManifest(manifest, context);

const conformanceSchema = await readJson("spec/schemas/conformance-manifest.schema.json");
assertClosedJsonSchema(conformanceSchema);
const conformance = await readJson(conformanceManifestPath);
assertValidAgainstClosedSchema(conformance, conformanceSchema);

const catalogs = await readObjectPaths(catalogPaths);
const catalogSchemas = await readObjectPaths(catalogSchemaPaths);
assertValidProtocolCatalogs(catalogs.protocolLines, catalogs.protectionProfiles, catalogSchemas);

const security = await readObjectPaths(securityPaths);
const securitySchemas = await readObjectPaths(securitySchemaPaths);
assertValidSecurityAccounting({ ...security, schemas: securitySchemas });

const protectionRegistry = await readJson("spec/v1/protection/registry.json");
assertComposition(manifest, conformance, catalogs, protectionRegistry);

const componentClosures = [];
for (const capability of manifest.capabilities) {
  componentClosures.push({ entry: capability, ...await resolveComponent(capability, capability.capabilityId) });
}
for (const definition of manifest.openDefinitions) {
  componentClosures.push({ entry: definition, ...await resolveComponent(definition, definition.definitionId) });
}

const expected = new Set([
  manifestPath,
  conformanceManifestPath,
  ...manifest.sourceClosure.additionalSources
]);
for (const { paths } of componentClosures) for (const sourcePath of paths) expected.add(sourcePath);
const expectedPaths = [...expected].sort();
assertSortedUnique(expectedPaths, "aggregate source paths");

const actualPaths = (await Promise.all(manifest.sourceClosure.roots.map(collectRegularFiles)))
  .flat()
  .concat(manifest.sourceClosure.additionalSources.filter((sourcePath) =>
    !manifest.sourceClosure.roots.some((sourceRoot) => isWithin(sourcePath, sourceRoot))))
  .sort();
assertSortedUnique(actualPaths, "discovered aggregate source paths");
assertEqualArrays(actualPaths, expectedPaths, "aggregate manifest does not close over its declared sources");

const sources = {};
for (const sourcePath of expectedPaths) sources[sourcePath] = await readNormativeSource(sourcePath);

const digestMismatches = [];
for (const { entry, label, paths } of componentClosures) {
  const actualDigest = componentDigest(paths, sources);
  if (entry.sourceDigest !== actualDigest) digestMismatches.push(`${label}=${actualDigest}`);
}
if (digestMismatches.length > 0) {
  throw new Error(`component source digest mismatch: ${digestMismatches.join(", ")}`);
}

for (const corpus of conformance.capabilityCorpora) {
  const closure = componentClosures.find(({ entry }) => entry.capabilityId === corpus.capabilityId);
  if (!closure?.paths.includes(corpus.manifestPath)) {
    throw new Error(`capability corpus is outside its source closure: ${corpus.capabilityId}`);
  }
}
for (const corpus of conformance.definitionCorpora) {
  const closure = componentClosures.find(({ entry }) => entry.definitionId === corpus.definitionId);
  if (!closure?.paths.includes(corpus.manifestPath)) {
    throw new Error(`definition corpus is outside its source closure: ${corpus.definitionId}`);
  }
}

const body = {
  artifactVersion: "licoarc.bundle.v2",
  wireId: manifest.wireId,
  generation: manifest.generation,
  lifecycle: manifest.lifecycle,
  definitionStatus: manifest.definitionStatus,
  sessionEligible: manifest.sessionEligible,
  publicationEligible: manifest.publicationEligible,
  digestAlgorithm: "sha256",
  sources
};
const canonical = `${canonicalJson(body)}\n`;
const artifact = `${JSON.stringify({
  ...body,
  digest: sha256(Buffer.from(canonical, "utf8"))
}, null, 2)}\n`;
const output = fromRelative(artifactPath);

if (checkOnly) {
  const current = await readFile(output, "utf8").catch((error) => {
    if (error?.code === "ENOENT") return "";
    throw error;
  });
  if (current !== artifact) throw new Error("licoarc.bundle.v2 artifact is missing or stale");
} else {
  await writeFile(output, artifact);
}

function assertComposition(manifestValue, conformanceValue, catalogValues, protectionValue) {
  const line = catalogValues.protocolLines.lines.find(({ wireId, generation }) =>
    wireId === manifestValue.wireId && generation === manifestValue.generation);
  if (!line || line.lifecycle !== manifestValue.lifecycle ||
      line.definitionStatus !== manifestValue.definitionStatus ||
      line.sessionEligible !== manifestValue.sessionEligible ||
      line.publicationEligible !== manifestValue.publicationEligible) {
    throw new Error("Protocol Line manifest status does not match its catalog record");
  }

  const capabilityIds = manifestValue.capabilities.map(({ capabilityId }) => capabilityId);
  assertSortedUnique(capabilityIds, "manifest capability identities");
  assertEqualArrays(capabilityIds, line.definedCapabilities,
    "manifest capability membership does not match the Protocol Line catalog");
  const missing = line.mandatoryCapabilities.filter((capabilityId) =>
    !line.definedCapabilities.includes(capabilityId));
  assertEqualArrays(manifestValue.missingMandatoryCapabilities, missing,
    "missing mandatory capability set does not match the Protocol Line catalog");
  assertEqualArrays(manifestValue.blockers, line.blockers,
    "manifest blockers do not match the Protocol Line catalog");

  for (const capability of manifestValue.capabilities) {
    const expectedVersion = Number(capability.capabilityId.match(/\.v([1-9][0-9]*)$/u)?.[1]);
    if (capability.version !== expectedVersion) throw new Error("capability version does not match its identifier");
    const direct = capability.sourceManifestPath === null;
    if (direct !== (capability.sourceRoots.length > 0 && capability.sourcePaths.length > 0) ||
        (!direct && (capability.sourceRoots.length > 0 || capability.sourcePaths.length > 0))) {
      throw new Error("capability source identity must use exactly one closure form");
    }
  }

  const definitionIds = manifestValue.openDefinitions.map(({ definitionId }) => definitionId);
  assertSortedUnique(definitionIds, "open definition identities");
  assertEqualArrays(definitionIds, ["pairwise-protection", "security-accounting"],
    "open definition set is not closed");
  assertSortedUnique(manifestValue.blockers, "manifest blockers");
  assertSortedUnique(manifestValue.sourceClosure.additionalSources, "additional source paths");

  const conformanceCapabilities = conformanceValue.capabilityCorpora.map(({ capabilityId }) => capabilityId);
  assertSortedUnique(conformanceCapabilities, "conformance capability identities");
  assertEqualArrays(conformanceCapabilities, capabilityIds,
    "conformance capability membership does not match the Protocol Line manifest");
  assertEqualArrays(conformanceValue.definitionCorpora.map(({ definitionId }) => definitionId),
    ["security-accounting"], "definition corpus set is not closed");
  if (conformanceValue.absentCorpora.length !== 1 ||
      conformanceValue.absentCorpora[0].definitionId !== "pairwise-protection") {
    throw new Error("open Pairwise Protection must have exactly one absence record");
  }

  if (protectionValue.definitionStatus !== "PARTIAL" ||
      protectionValue.sessionEligible !== false ||
      protectionValue.activeProfiles.length !== 0 ||
      protectionValue.wireSchemas.length !== 0 ||
      protectionValue.runtimeGrammar !== null ||
      protectionValue.conformanceCorpus !== null ||
      catalogValues.protectionProfiles.activeProfiles.length !== 0 ||
      line.protectionProfileIds.length !== 0) {
    throw new Error("open Pairwise Protection was incorrectly made active");
  }
}

async function resolveComponent(entry, label) {
  if (entry.sourceManifestPath === null) {
    assertSortedUnique(entry.sourceRoots, `${label} source roots`);
    assertSortedUnique(entry.sourcePaths, `${label} source paths`);
    const actual = (await Promise.all(entry.sourceRoots.map(collectRegularFiles))).flat().sort();
    assertSortedUnique(actual, `${label} discovered sources`);
    assertEqualArrays(actual, entry.sourcePaths, `${label} direct source closure is stale`);
    return { label, paths: [...entry.sourcePaths] };
  }

  const sourceManifest = await readJson(entry.sourceManifestPath);
  const sources = sourceManifest.sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error(`${label} source manifest has no declared sources`);
  }
  assertSortedUnique(sources, `${label} source paths`);
  const additionalSources = sourceManifest.additionalSources ?? [];
  assertSortedUnique(additionalSources, `${label} additional source paths`);
  if (sourceManifest.undeclaredFiles !== undefined && sourceManifest.undeclaredFiles !== "reject") {
    throw new Error(`${label} source manifest must reject undeclared files`);
  }
  if (sourceManifest.symlinks !== undefined && sourceManifest.symlinks !== "reject") {
    throw new Error(`${label} source manifest must reject symbolic links`);
  }
  if (entry.definitionStatus === "PARTIAL" && sourceManifest.definitionStatus !== "PARTIAL") {
    throw new Error(`${label} source manifest does not preserve partial status`);
  }

  if (sourceManifest.sourceRoots !== undefined) {
    assertSortedUnique(sourceManifest.sourceRoots, `${label} source roots`);
    if (sources.some((sourcePath) =>
      !sourceManifest.sourceRoots.some((sourceRoot) => isWithin(sourcePath, sourceRoot)))) {
      throw new Error(`${label} source path is outside its declared roots`);
    }
    const actual = (await Promise.all(sourceManifest.sourceRoots.map(collectRegularFiles)))
      .flat()
      .filter((sourcePath) => sourcePath !== entry.sourceManifestPath)
      .sort();
    assertSortedUnique(actual, `${label} discovered sources`);
    assertEqualArrays(actual, sources, `${label} source manifest does not close over its roots`);
  }

  const paths = [...new Set([entry.sourceManifestPath, ...sources, ...additionalSources])].sort();
  assertSortedUnique(paths, `${label} component closure`);
  return { label, paths };
}

async function readObjectPaths(paths) {
  return Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([name, sourcePath]) =>
    [name, await readJson(sourcePath)])));
}

async function readJson(relativePath) {
  assertSafeRelativePath(relativePath);
  return parseRestrictedJson(await readFile(fromRelative(relativePath)), limits);
}

async function readNormativeSource(sourcePath) {
  assertSafeRelativePath(sourcePath);
  const bytes = await readFile(fromRelative(sourcePath));
  if (sourcePath.endsWith(".json")) return sortJson(parseRestrictedJson(bytes, limits));
  if (sourcePath.endsWith(".cddl")) return decodeCddl(bytes, sourcePath);
  throw new TypeError(`unsupported normative source type: ${sourcePath}`);
}

async function collectRegularFiles(relativeDirectory) {
  assertSafeRelativePath(relativeDirectory);
  const entries = await readdir(fromRelative(relativeDirectory), { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name, "en"));
  const files = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const stat = await lstat(fromRelative(relativePath));
    if (stat.isSymbolicLink()) throw new TypeError("normative sources must not be symbolic links");
    if (entry.isDirectory()) files.push(...await collectRegularFiles(relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new TypeError("normative sources must be regular files");
  }
  return files;
}

function fromRelative(relativePath) {
  assertSafeRelativePath(relativePath);
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("path escapes repository");
  return resolved;
}

function assertSafeRelativePath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0 ||
      path.posix.isAbsolute(relativePath) || relativePath.includes("\\") ||
      path.posix.normalize(relativePath) !== relativePath ||
      relativePath.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new TypeError("normative source path must be a safe repository-relative path");
  }
}

function isWithin(sourcePath, sourceRoot) {
  return sourcePath === sourceRoot || sourcePath.startsWith(`${sourceRoot}/`);
}

function decodeCddl(bytes, sourcePath) {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new TypeError(`CDDL source is not valid UTF-8: ${sourcePath}`);
  }
  if (!text.endsWith("\n") || text.includes("\r") || text.includes("\u0000") ||
      text.startsWith("\ufeff")) {
    throw new TypeError(`CDDL source is not canonical UTF-8 text: ${sourcePath}`);
  }
  return text;
}

function componentDigest(paths, sources) {
  const content = paths.map((sourcePath) => ({ path: sourcePath, source: sources[sourcePath] }));
  return sha256(Buffer.from(canonicalJson(content), "utf8"));
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function assertSortedUnique(values, label) {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new TypeError(`${label} must be strings`);
  }
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] >= values[index]) throw new Error(`${label} must be sorted and unique`);
  }
}

function assertEqualArrays(actual, expected, message) {
  if (actual.length !== expected.length ||
      actual.some((value, index) => value !== expected[index])) throw new Error(message);
}
