import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("replacement artifact generation is byte-identical and checkable", async () => {
  const fixture = await createFixture();
  try {
    await runGenerator(fixture);
    const first = await readFile(path.join(fixture, "artifacts/v1/licoarc.bundle.json"));
    await runGenerator(fixture);
    assert.deepEqual(await readFile(path.join(fixture, "artifacts/v1/licoarc.bundle.json")), first);
    await runGenerator(fixture, ["--check"]);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test("partial Candidate status rejects completion, mixed line, fallback and source drift", async () => {
  const mutations = [
    async (fixture) => mutateJson(fixture, "spec/v1/manifest.json", (value) => { value.definitionStatus = "COMPLETE"; }),
    async (fixture) => mutateJson(fixture, "spec/v1/manifest.json", (value) => { value.sessionEligible = true; }),
    async (fixture) => mutateJson(fixture, "spec/v1/manifest.json", (value) => { value.wireId = "licoarc.mixed-line.v1"; }),
    async (fixture) => mutateJson(fixture, "spec/v1/manifest.json", (value) => { value.translationPolicy = "fallback"; }),
    async (fixture) => mutateJson(fixture, "spec/v1/manifest.json", (value) => { value.missingMandatoryCapabilities = []; }),
    async (fixture) => mutateJson(fixture, "conformance/v1/manifest.json", (value) => {
      value.definitionCorpora.push({
        definitionId: "pairwise-protection",
        manifestPath: "conformance/v1/protection/manifest.json"
      });
    }),
    async (fixture) => mutateJson(fixture, "spec/protocol-lines.json", (value) => {
      value.selection.implementationFallback = true;
    }),
    async (fixture) => mutateJson(fixture, "spec/v1/security/source-manifest.json", (value) => {
      value.sourceRoots = ["spec/v1/security"];
    }),
    async (fixture) => writeFile(path.join(fixture, "spec/v1/undeclared.json"), "{}\n")
  ];
  for (const mutate of mutations) {
    const fixture = await createFixture();
    try {
      await mutate(fixture);
      await assert.rejects(() => runGenerator(fixture));
    } finally { await rm(fixture, { recursive: true, force: true }); }
  }
});

test("generator rejects ambiguous JSON and non-canonical CDDL source bytes", async () => {
  const mutations = [
    async (fixture) => writeFile(path.join(fixture, "spec/v1/messaging/bounds.json"),
      "{\"x\":1,\"x\":2}\n"),
    async (fixture) => writeFile(path.join(fixture, "spec/v1/messaging/bounds.json"),
      `{\"x\":\"\\u${"d800"}\"}\n`),
    async (fixture) => {
      const sourcePath = path.join(fixture, "spec/v1/messaging/runtime.cddl");
      const source = await readFile(sourcePath, "utf8");
      await writeFile(sourcePath, source.replace(/\n$/u, ""));
    },
    async (fixture) => {
      const sourcePath = path.join(fixture, "spec/v1/messaging/runtime.cddl");
      const source = await readFile(sourcePath);
      await writeFile(sourcePath, Buffer.concat([source, Buffer.from([0])]));
    }
  ];
  for (const mutate of mutations) {
    const fixture = await createFixture();
    try {
      await mutate(fixture);
      await assert.rejects(() => runGenerator(fixture));
    } finally { await rm(fixture, { recursive: true, force: true }); }
  }
});

async function createFixture() {
  const fixture = await mkdtemp(path.join(tmpdir(), "licoarc-candidate-"));
  for (const directory of ["spec", "conformance", "artifacts", "tools"]) {
    await cp(path.join(repositoryRoot, directory), path.join(fixture, directory), { recursive: true });
  }
  return fixture;
}

async function runGenerator(fixture, args = []) {
  return execFileAsync(process.execPath, ["tools/generate-artifact.mjs", ...args], { cwd: fixture });
}

async function mutateJson(fixture, relativePath, mutate) {
  const file = path.join(fixture, relativePath);
  const value = JSON.parse(await readFile(file, "utf8"));
  mutate(value);
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
