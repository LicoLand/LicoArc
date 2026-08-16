import process from "node:process";
import { generateFoundationBundle, writeFoundationBundle } from "./foundation.mjs";

const args = process.argv.slice(2);
if (args.length > 2 || (args.length === 1 && args[0] !== "--check" && !args[0].startsWith("--write="))) {
  throw new TypeError("expected no arguments, --check, or --write=<repository-relative-path>");
}

const writeArgument = args.find((argument) => argument.startsWith("--write="));
const check = args.includes("--check");
const outputPath = writeArgument?.slice("--write=".length);
if (check && outputPath) throw new TypeError("--check and --write cannot be combined");

const bundle = outputPath
  ? await writeFoundationBundle(outputPath)
  : await generateFoundationBundle();

if (check) {
  process.stdout.write(`${bundle.digest}\n`);
} else if (!outputPath) {
  process.stdout.write(`${bundle.canonical}\n`);
}
