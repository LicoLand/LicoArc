import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundles = [
  {
    artifactVersion: "fabrigent.bundle.v1",
    output: "artifacts/fabrigent-v1.json",
    sourcePaths: [
      "contracts/v1/relay-envelope.schema.json",
      "policies/v1/relay-governance.json",
      "conformance/v1/valid.json",
      "conformance/v1/invalid.json"
    ],
    bindMetadata: false
  },
  {
    artifactVersion: "fabrigent.bundle.v2",
    output: "artifacts/fabrigent-v2.json",
    sourcePaths: [
      "contracts/v2/relay-envelope.schema.json",
      "policies/v2/relay-governance.json",
      "conformance/v2/valid.json",
      "conformance/v2/invalid.json"
    ],
    bindMetadata: true
  }
];

for (const bundle of bundles) {
  const sources = Object.fromEntries(
    await Promise.all(bundle.sourcePaths.map(async (relativePath) => [
      relativePath,
      JSON.parse(await readFile(path.join(root, relativePath), "utf8"))
    ]))
  );
  const body = {
    artifactVersion: bundle.artifactVersion,
    digestAlgorithm: "sha256",
    sources
  };
  const canonical = bundle.bindMetadata
    ? `${JSON.stringify(body)}\n`
    : `${JSON.stringify(sources)}\n`;
  const digest = createHash("sha256").update(canonical).digest("hex");
  const artifactValue = bundle.bindMetadata
    ? { ...body, digest }
    : {
        artifactVersion: body.artifactVersion,
        digestAlgorithm: body.digestAlgorithm,
        digest,
        sources
      };
  const artifact = `${JSON.stringify(artifactValue, null, 2)}\n`;
  const output = path.join(root, bundle.output);

  if (process.argv.includes("--check")) {
    const current = await readFile(output, "utf8").catch(() => "");
    if (current !== artifact) {
      throw new Error(`${bundle.artifactVersion} artifact is missing or stale`);
    }
  } else {
    await writeFile(output, artifact);
  }
}
