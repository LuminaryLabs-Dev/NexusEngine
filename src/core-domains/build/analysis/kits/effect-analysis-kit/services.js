import ts from "@typescript/typescript6";

const GLOBAL_EFFECTS = Object.freeze({
  document: "browser:document",
  window: "browser:window",
  navigator: "browser:navigator",
  localStorage: "browser:storage",
  indexedDB: "browser:storage",
  fetch: "network:fetch",
  WebSocket: "network:websocket",
  process: "node:process",
  Buffer: "node:buffer",
  Deno: "host:deno",
  Bun: "host:bun"
});

const FORBIDDEN_CALLS = new Set(["eval", "Function"]);

function isReferenceIdentifier(node) {
  const parent = node.parent;
  if (!parent) return true;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;
  if (ts.isVariableDeclaration(parent) && parent.name === node) return false;
  if (ts.isParameter(parent) && parent.name === node) return false;
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isNamespaceImport(parent)) return false;
  return true;
}

export function createEffectAnalysisService() {
  function analyze(parsed) {
    const effects = new Set();
    const unsupported = [];

    function visit(node) {
      if (ts.isIdentifier(node) && isReferenceIdentifier(node) && GLOBAL_EFFECTS[node.text]) {
        effects.add(GLOBAL_EFFECTS[node.text]);
      }
      if (ts.isCallExpression(node)) {
        if (ts.isIdentifier(node.expression) && FORBIDDEN_CALLS.has(node.expression.text)) {
          unsupported.push({ code: "ambient-code-evaluation", expression: node.expression.text, position: node.pos });
        }
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const argument = node.arguments[0];
          if (!argument || !ts.isStringLiteralLike(argument)) {
            unsupported.push({ code: "dynamic-import-nonliteral", position: node.pos });
          }
        }
      }
      if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "Function") {
        unsupported.push({ code: "ambient-code-evaluation", expression: "Function", position: node.pos });
      }
      ts.forEachChild(node, visit);
    }

    visit(parsed.sourceFile);
    return Object.freeze({
      path: parsed.record.path,
      effects: Object.freeze([...effects].sort()),
      unsupported: Object.freeze(unsupported.sort((left, right) => left.position - right.position))
    });
  }

  return Object.freeze({ analyze });
}

export default createEffectAnalysisService;
