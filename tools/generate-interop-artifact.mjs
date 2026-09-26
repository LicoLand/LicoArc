import { readFile, writeFile, mkdir, readdir, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseRestrictedJson, assertClosedJsonSchema } from "./protocol/index.mjs";
import { canonical, semanticBindingId, sha256 } from "./interop/v1.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceManifestPath = "spec/interop/v1/source-manifest.json";
const outputPath = "artifacts/v1/nostr-interop.bundle.json";
const limits = { maxBytes: 4_194_304, maxDepth: 32, maxArrayItems: 4096,
  maxObjectMembers: 1024, maxStringBytes: 1_048_576 };
const assert = (condition, text) => { if (!condition) throw new Error(text); };
const json = async (name) => parseRestrictedJson(await readFile(path.join(root, name)), limits);
async function walk(directory) {
  const result = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    const stat = await lstat(path.join(root, relative));
    assert(!stat.isSymbolicLink(), `symlink in binding closure: ${relative}`);
    if (stat.isDirectory()) result.push(...await walk(relative));
    else { assert(stat.isFile(), `not a regular source: ${relative}`); result.push(relative); }
  }
  return result.sort();
}
export async function buildBindingArtifact() {
  const closure = await json(sourceManifestPath);
  assert(canonical(Object.keys(closure).sort()) === canonical(["sourceRoots", "sources", "version"]), "unexpected closure members");
  assert(closure.version === "licoarc.nostr-source-manifest.v1", "wrong binding source manifest");
  assert(canonical(closure.sourceRoots) === canonical(["conformance/interop/v1", "spec/interop/v1"]), "wrong binding roots");
  const actual = (await Promise.all(closure.sourceRoots.map(walk))).flat().sort();
  assert(canonical(actual) === canonical(closure.sources), "binding source manifest does not close its exact roots");
  const sources = {};
  for (const name of closure.sources) {
    assert(!name.includes("..") && !path.isAbsolute(name), "unsafe source path");
    const bytes = await readFile(path.join(root, name));
    if (name.endsWith(".json")) sources[name] = parseRestrictedJson(bytes, limits);
    else {
      assert(name.endsWith(".md"), "unsupported binding source type");
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      assert(text.endsWith("\n") && !/[\r\u0000\ufeff]/.test(text), "noncanonical source text");
      sources[name] = text;
    }
    if (name.endsWith(".schema.json")) assertClosedJsonSchema(sources[name]);
  }
  const manifest = sources["spec/interop/v1/manifest.json"];
  const native = await json("spec/v1/manifest.json");
  const cap = manifest.paths["licoarc-enhanced"];
  assert(manifest.generation === 1 && native.generation === 1, "V1 must remain Generation 1");
  assert(cap.nativeProtocolLineId === native.protocolLineId, "native line reference drift");
  assert(cap.nativeManifest === "spec/v1/manifest.json", "native source reference drift");
  assert(/^[0-9a-f]{40}$/.test(manifest.upstream.commit), "NIPs must be revision-pinned");
  assert(manifest.routing.automaticDowngrade === false && manifest.routing.compatibilityCopy === false, "unsafe routing policy");
  assert(manifest.paths["nostr-dm"].requiresLicoArc === false && cap.requiresLicoUp === false, "closed-product dependency");
  assert(manifest.upstream.unassignedExtensionKind === cap.innerRumorKind, "kind registry conflict");
  assert(manifest.bounds.MAX_FRAGMENT_BYTES === manifest.carrier.chunkBytes &&
    manifest.bounds.MAX_OBJECT_BYTES === manifest.bounds.MAX_FRAGMENTS * manifest.carrier.chunkBytes, "fragment bounds conflict");
  const semantic = closure.sources.filter((name) => name.startsWith("spec/interop/v1/") && name !== sourceManifestPath);
  assert(canonical(manifest.semanticSources) === canonical(semantic), "semantic sources must cover all binding semantics");
  const corpus = sources["conformance/interop/v1/cases.json"];
  const corpusManifest = sources["conformance/interop/v1/manifest.json"];
  assert(corpus.version === "licoarc.nostr-cases.v1" && Array.isArray(corpus.cases), "invalid corpus");
  assert(corpusManifest.casesPath === "conformance/interop/v1/cases.json" &&
    corpusManifest.version === "licoarc.nostr-conformance.v1", "invalid corpus manifest");
  const ids = corpus.cases.map((c) => c.id);
  assert(ids.length > 0 && new Set(ids).size === ids.length, "empty/duplicate corpus cases");
  assert(canonical([...ids].sort()) === canonical(corpusManifest.caseIds), "corpus case join mismatch");
  assert(corpusManifest.nativeCryptoExecution === false && corpusManifest.realClientExecution === false, "invalid evidence scope");
  for (const c of corpus.cases) {
    assert(canonical(Object.keys(c).sort()) === canonical(["expected", "id", "input", "operation", "requirement"]), "invalid case members");
    assert(corpusManifest.requirements[c.requirement]?.includes(c.id), `unmapped case ${c.id}`);
  }
  for (const [requirement, mapped] of Object.entries(corpusManifest.requirements)) {
    assert(mapped.length > 0 && new Set(mapped).size === mapped.length, "empty/duplicate requirement mapping");
    for (const id of mapped) assert(corpus.cases.some((c) => c.id === id && c.requirement === requirement), "dangling requirement mapping");
  }
  const body = { artifactVersion: "licoarc.nostr-interop.bundle.v1", generation: 1,
    bindingId: semanticBindingId(sources), sources };
  return { ...body, digest: sha256(Buffer.from(canonical(body) + "\n", "utf8")) };
}
async function main() {
  const args = process.argv.slice(2);
  assert(args.length === 0 || (args.length === 1 && args[0] === "--check"), "expected no arguments or --check");
  const bytes = JSON.stringify(await buildBindingArtifact(), null, 2) + "\n";
  const output = path.join(root, outputPath);
  if (args[0] === "--check") assert(await readFile(output, "utf8") === bytes, "Nostr binding artifact is stale");
  else { await mkdir(path.dirname(output), { recursive: true }); await writeFile(output, bytes); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
