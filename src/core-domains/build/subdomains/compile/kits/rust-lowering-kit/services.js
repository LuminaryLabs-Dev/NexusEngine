import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { contentIntegrity, stableJson } from "../../../../contracts.js";

function rustString(value) {
  return JSON.stringify(String(value));
}

function rustIdentifier(value) {
  const normalized = String(value).replace(/[^A-Za-z0-9_]/g, "_");
  const identifier = /^[A-Za-z_]/.test(normalized) ? normalized : `n_${normalized}`;
  const reserved = new Set([
    "Self", "abstract", "as", "async", "await", "become", "box", "break", "const", "continue",
    "crate", "do", "dyn", "else", "enum", "extern", "false", "final", "fn", "for", "gen", "if",
    "impl", "in", "let", "loop", "macro", "match", "mod", "move", "mut", "override", "priv", "pub",
    "ref", "return", "self", "static", "struct", "super", "trait", "true", "try", "type", "typeof",
    "union", "unsafe", "unsized", "use", "virtual", "where", "while", "yield"
  ]);
  return reserved.has(identifier) ? `n_${identifier}` : identifier;
}

function rustExpression(expression, parameters) {
  if (expression.kind === "number") {
    if (!Number.isFinite(expression.value)) throw new TypeError("Native numeric literals must be finite.");
    return Number.isInteger(expression.value) ? `${expression.value}.0_f64` : `${expression.value}_f64`;
  }
  if (expression.kind === "parameter") {
    const symbol = parameters.get(expression.name);
    if (!symbol) throw new TypeError(`Native IR references an undeclared parameter: ${expression.name}.`);
    return symbol;
  }
  if (expression.kind === "unary") return `(${expression.operator}${rustExpression(expression.value, parameters)})`;
  if (expression.kind === "binary") {
    return `(${rustExpression(expression.left, parameters)} ${expression.operator} ${rustExpression(expression.right, parameters)})`;
  }
  throw new TypeError(`Unsupported native IR expression: ${expression.kind}.`);
}

function loweredFunctions(executionIr) {
  return executionIr.operations.flatMap((operation) => (operation.nativeFunctions ?? []).map((definition) => {
    const identity = `${operation.modulePath}\0${definition.name}`;
    const suffix = contentIntegrity(identity).slice("sha256:".length, "sha256:".length + 12);
    const symbol = `${rustIdentifier(`nexus_${operation.modulePath}_${definition.name}`)}_${suffix}`;
    const parameterSymbols = new Map(definition.parameters.map((name, index) => [name, `nexus_arg_${index}_${rustIdentifier(name)}`]));
    const parameters = definition.parameters.map((name) => `${parameterSymbols.get(name)}: f64`).join(", ");
    return Object.freeze({
      modulePath: operation.modulePath,
      name: definition.name,
      symbol,
      parameters: definition.parameters,
      source: `#[no_mangle]\npub extern "C" fn ${symbol}(${parameters}) -> f64 {\n    ${rustExpression(definition.expression, parameterSymbols)}\n}`
    });
  })).sort((left, right) => `${left.modulePath}:${left.name}`.localeCompare(`${right.modulePath}:${right.name}`));
}

export function createRustLoweringService() {
  function lower(executionIr, classification) {
    const functions = loweredFunctions(executionIr);
    const functionModules = new Set(functions.map((record) => record.modulePath));
    const nativeModules = classification.modules.filter((module) => ["native", "native-adapter"].includes(module.mode));
    const unsupported = classification.modules.filter((module) => module.mode === "unsupported"
      || (["native", "native-adapter"].includes(module.mode) && !functionModules.has(module.modulePath)));
    const operations = executionIr.operations.map((operation) => ({
      id: operation.id,
      modulePath: operation.modulePath,
      capabilities: operation.capabilities
    }));
    const source = `pub const NEXUS_BUILD_ABI_VERSION: u32 = 1;\n\n#[derive(Debug, Clone, Copy)]\npub struct NexusOperation { pub id: &'static str, pub module: &'static str }\n\npub static OPERATIONS: &[NexusOperation] = &[\n${operations.map((operation) => `    NexusOperation { id: ${rustString(operation.id)}, module: ${rustString(operation.modulePath)} },`).join("\n")}\n];\n\n#[no_mangle]\npub extern "C" fn nexus_validate_package() -> u32 { NEXUS_BUILD_ABI_VERSION }\n\n${functions.map((record) => record.source).join("\n\n")}\n`;
    const payload = {
      schema: "nexusengine.rust-lowering/1",
      sourceExecutionIrHash: executionIr.contentHash,
      semanticParity: nativeModules.length > 0 && unsupported.length === 0,
      unsupportedModules: unsupported.map((module) => module.modulePath),
      semanticProofs: Object.freeze(nativeModules.map((module) => Object.freeze({
        modulePath: module.modulePath,
        sourceAstHash: module.sourceAstHash,
        status: functionModules.has(module.modulePath) ? "compiler-validated" : "unsupported"
      }))),
      exports: Object.freeze(functions.map(({ source: _source, ...record }) => record)),
      sourceIntegrity: contentIntegrity(source)
    };
    return Object.freeze({ ...payload, source, contentHash: contentIntegrity(stableJson(payload)) });
  }

  async function write(stage, result) {
    const sourceRoot = path.join(stage, "generated-runtime", "src");
    await mkdir(sourceRoot, { recursive: true });
    await writeFile(path.join(stage, "generated-runtime", "Cargo.toml"), `[package]\nname = "nexus_generated_runtime"\nversion = "0.0.4"\nedition = "2021"\n\n[lib]\ncrate-type = ["cdylib", "rlib", "staticlib"]\npath = "src/lib.rs"\n`);
    await writeFile(path.join(stage, "generated-runtime", "Cargo.lock"), `# This file is automatically @generated by Cargo.\n# It is not intended for manual editing.\nversion = 4\n\n[[package]]\nname = "nexus_generated_runtime"\nversion = "0.0.4"\n`);
    await writeFile(path.join(sourceRoot, "lib.rs"), result.source);
    await writeFile(path.join(stage, "generated-runtime", "exports.json"), `${JSON.stringify(result.exports, null, 2)}\n`);
    return path.join(stage, "generated-runtime");
  }

  return Object.freeze({ lower, write });
}

export default createRustLoweringService;
