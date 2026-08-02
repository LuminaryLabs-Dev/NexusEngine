import { access } from "node:fs/promises";
import path from "node:path";
import ts from "@typescript/typescript6";

import { contentIntegrity, posixPath, stableJson } from "../../../../contracts.js";

const RESOLUTION_SUFFIXES = Object.freeze([
  "", ".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".jsx", ".tsx", ".json",
  "/index.js", "/index.mjs", "/index.ts", "/index.tsx"
]);

function collectSpecifiers(sourceFile) {
  const records = [];
  function add(specifier, kind, position) {
    records.push({ specifier, kind, position });
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) {
        add(node.moduleSpecifier.text, ts.isImportDeclaration(node) ? "import" : "export", node.pos);
      }
    } else if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteralLike(node.arguments[0])) {
        add(node.arguments[0].text, "dynamic-import", node.pos);
      } else if (ts.isIdentifier(node.expression) && node.expression.text === "require" && ts.isStringLiteralLike(node.arguments[0])) {
        add(node.arguments[0].text, "require", node.pos);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return records.sort((left, right) => left.position - right.position);
}

function packageName(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

async function resolveRelative(projectRoot, fromPath, specifier) {
  const base = path.resolve(projectRoot, path.dirname(fromPath), specifier);
  for (const suffix of RESOLUTION_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    try {
      await access(candidate);
      return posixPath(path.relative(projectRoot, candidate));
    } catch {}
  }
  return null;
}

export function createModuleGraphService() {
  async function create(projectSource, parsedModules) {
    const byPath = new Map(parsedModules.map((parsed) => [parsed.record.path, parsed]));
    const modules = [];
    const externalPackages = new Set();
    const missing = [];

    for (const [modulePath, parsed] of [...byPath].sort(([left], [right]) => left.localeCompare(right))) {
      const imports = [];
      for (const record of collectSpecifiers(parsed.sourceFile)) {
        if (record.specifier.startsWith(".") || record.specifier.startsWith("/")) {
          const resolved = await resolveRelative(projectSource.root, modulePath, record.specifier);
          imports.push({ ...record, resolved, external: false });
          if (!resolved) missing.push({ from: modulePath, specifier: record.specifier });
        } else {
          const packageId = packageName(record.specifier);
          externalPackages.add(packageId);
          imports.push({ ...record, resolved: null, external: true, package: packageId });
        }
      }
      modules.push(Object.freeze({ path: modulePath, imports: Object.freeze(imports) }));
    }

    const identity = { modules, externalPackages: [...externalPackages].sort(), missing };
    return Object.freeze({
      modules: Object.freeze(modules),
      externalPackages: Object.freeze(identity.externalPackages),
      missing: Object.freeze(missing),
      contentHash: contentIntegrity(stableJson(identity))
    });
  }

  return Object.freeze({ create });
}

export default createModuleGraphService;
