import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createBuildDomain } from "../index.js";

const fixture = path.resolve("src/core-domains/build/tests/fixtures/native-project");
const stateRoot = await mkdtemp(path.join(tmpdir(), "nexusengine-native-lowering-"));
const build = createBuildDomain({ stateRoot });
const inspection = await build.inspect(fixture);
assert.equal(inspection.irValidation.ok, true);
assert.equal(inspection.classification.mode, "native");
assert.equal(inspection.rustLowering.semanticParity, true);
assert.deepEqual(inspection.rustLowering.unsupportedModules, []);

const lowering = build.services.rustLowering.lower(inspection.executionIr, inspection.classification);
const generated = await build.services.rustLowering.write(stateRoot, lowering);
const add = lowering.exports.find((record) => record.name === "add");
const scaledOffset = lowering.exports.find((record) => record.name === "scaledOffset");
const identifierCollision = lowering.exports.find((record) => record.name === "identifierCollision");
assert.ok(add);
assert.ok(scaledOffset);
assert.ok(identifierCollision);
await mkdir(path.join(generated, "src"), { recursive: true });
await writeFile(path.join(generated, "src", "main.rs"), `fn main() {
    let add = nexus_generated_runtime::${add.symbol}(20.0, 22.0);
    let scaled = nexus_generated_runtime::${scaledOffset.symbol}(10.0, 4.0);
    let identifiers = nexus_generated_runtime::${identifierCollision.symbol}(20.0, 22.0);
    println!("{add},{scaled},{identifiers}");
}
`);
const compiled = await build.services.processExecution.run("cargo", ["run", "--quiet", "--locked"], { cwd: generated });
assert.equal(compiled.ok, true, compiled.stderr || compiled.error);
assert.equal(compiled.stdout.trim(), "42,42,42");

const unsupportedRoot = path.join(stateRoot, "unsupported-project");
await mkdir(path.join(unsupportedRoot, "src"), { recursive: true });
await writeFile(path.join(unsupportedRoot, "package.json"), JSON.stringify({
  name: "unsupported-native-fixture",
  version: "1.0.0",
  type: "module",
  module: "src/index.js"
}));
await writeFile(path.join(unsupportedRoot, "src", "index.js"), `export const nexusBuildMode = "native";
export function wave(value) { return Math.sin(value); }
`);
const unsupported = await build.inspect(unsupportedRoot);
assert.equal(unsupported.classification.mode, "unsupported");
assert.equal(unsupported.irValidation.ok, false);
assert.equal(unsupported.rustLowering.semanticParity, false);

console.log("Build native lowering: supported numeric Kit IR compiles with Rust parity and unsupported syntax fails closed");
