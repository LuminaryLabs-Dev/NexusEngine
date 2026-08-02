import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { contentIntegrity, stableJson } from "../../../../contracts.js";

function rustString(value) {
  return JSON.stringify(String(value));
}

export function createRustLoweringService(config = {}) {
  function lower(executionIr, classification) {
    const semanticProofs = config.semanticProofs ?? {};
    const unsupported = classification.modules.filter((module) => {
      if (module.mode !== "native") return true;
      const proof = semanticProofs[module.modulePath];
      return proof?.schema !== "nexusengine.cross-runtime-parity-proof/1"
        || proof.ok !== true
        || proof.status !== "passed"
        || proof.sourceAstHash !== module.sourceAstHash
        || !proof.referenceHash
        || proof.referenceHash !== proof.candidateHash;
    });
    const operations = executionIr.operations.map((operation) => ({
      id: operation.id,
      modulePath: operation.modulePath,
      capabilities: operation.capabilities
    }));
    const source = `#[derive(Debug, Clone, Copy)]\npub struct NexusOperation { pub id: &'static str, pub module: &'static str }\n\npub static OPERATIONS: &[NexusOperation] = &[\n${operations.map((operation) => `    NexusOperation { id: ${rustString(operation.id)}, module: ${rustString(operation.modulePath)} },`).join("\n")}\n];\n`;
    const payload = {
      schema: "nexusengine.rust-lowering/1",
      sourceExecutionIrHash: executionIr.contentHash,
      semanticParity: classification.modules.length > 0 && unsupported.length === 0,
      unsupportedModules: unsupported.map((module) => module.modulePath),
      semanticProofs: Object.freeze(classification.modules.map((module) => Object.freeze({
        modulePath: module.modulePath,
        sourceAstHash: module.sourceAstHash,
        status: semanticProofs[module.modulePath]?.status ?? "missing"
      }))),
      sourceIntegrity: contentIntegrity(source)
    };
    return Object.freeze({ ...payload, source, contentHash: contentIntegrity(stableJson(payload)) });
  }

  async function write(stage, result) {
    const sourceRoot = path.join(stage, "generated-runtime", "src");
    await mkdir(sourceRoot, { recursive: true });
    await writeFile(path.join(stage, "generated-runtime", "Cargo.toml"), `[package]\nname = "nexus_generated_runtime"\nversion = "0.0.4"\nedition = "2024"\n\n[lib]\npath = "src/lib.rs"\n`);
    await writeFile(path.join(sourceRoot, "lib.rs"), result.source);
    return path.join(stage, "generated-runtime");
  }

  return Object.freeze({ lower, write });
}

export default createRustLoweringService;
