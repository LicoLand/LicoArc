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
const generatorRelativePath = "tools/generate-artifact.mjs";

test("replacement artifact generation is byte-identical and checkable", async () => {
  const fixture = await createFixture();
  try {
    await runGenerator(fixture);
    const first = await readFile(path.join(fixture, "artifacts/v1/licoarc.bundle.json"));
    await runGenerator(fixture);
    const second = await readFile(path.join(fixture, "artifacts/v1/licoarc.bundle.json"));
    assert.deepEqual(second, first);
    await runGenerator(fixture, ["--check"]);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("closed Candidate inputs reject omission, mutation, extra, mixed, fallback, and downgrade drift", async () => {
  const mutations = [
    {
      name: "omission",
      mutate: async (fixture) => {
        const manifest = await readJson(fixture, "spec/v1/manifest.json");
        manifest.governanceSources.pop();
        await writeJson(fixture, "spec/v1/manifest.json", manifest);
      }
    },
    {
      name: "mutation",
      mutate: async (fixture) => {
        const sourcePath = path.join(fixture, "spec/v1/foundation/bounds.json");
        const source = await readFile(sourcePath, "utf8");
        await writeFile(sourcePath, `${source}\n`);
      }
    },
    {
      name: "extra",
      mutate: async (fixture) => {
        await writeFile(path.join(fixture, "spec/v1/undeclared.json"), "{}\n");
      }
    },
    {
      name: "mixed",
      mutate: async (fixture) => {
        const manifest = await readJson(fixture, "spec/v1/manifest.json");
        manifest.wireId = "licoarc.mixed-line.v1";
        await writeJson(fixture, "spec/v1/manifest.json", manifest);
      }
    },
    {
      name: "fallback",
      mutate: async (fixture) => {
        const manifest = await readJson(fixture, "spec/v1/manifest.json");
        manifest.translationPolicy = "fallback";
        await writeJson(fixture, "spec/v1/manifest.json", manifest);
      }
    },
    {
      name: "downgrade",
      mutate: async (fixture) => {
        const manifest = await readJson(fixture, "spec/v1/manifest.json");
        manifest.minimumSafe.protocolLineVersion = 0;
        await writeJson(fixture, "spec/v1/manifest.json", manifest);
      }
    }
  ];

  for (const mutation of mutations) {
    const fixture = await createFixture();
    try {
      await runGenerator(fixture);
      await mutation.mutate(fixture);
      await assert.rejects(() => runGenerator(fixture), mutation.name);
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  }
});

async function createFixture() {
  const fixture = await mkdtemp(path.join(tmpdir(), "licoarc-candidate-"));
  for (const directory of ["spec", "conformance", "artifacts", "tools"]) {
    await cp(path.join(repositoryRoot, directory), path.join(fixture, directory), {
      recursive: true
    });
  }
  return fixture;
}

async function runGenerator(fixture, args = []) {
  return execFileAsync(process.execPath, [generatorRelativePath, ...args], {
    cwd: fixture,
    maxBuffer: 1024 * 1024
  });
}

async function readJson(fixture, relativePath) {
  return JSON.parse(await readFile(path.join(fixture, relativePath), "utf8"));
}

async function writeJson(fixture, relativePath, value) {
  await writeFile(
    path.join(fixture, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );
}
