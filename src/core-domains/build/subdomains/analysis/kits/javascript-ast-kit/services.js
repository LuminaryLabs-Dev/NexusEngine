import path from "node:path";
import ts from "@typescript/typescript6";

import { contentIntegrity } from "../../../../contracts.js";

const SCRIPT_KINDS = new Map([
  [".js", ts.ScriptKind.JS],
  [".jsx", ts.ScriptKind.JSX],
  [".mjs", ts.ScriptKind.JS],
  [".cjs", ts.ScriptKind.JS],
  [".ts", ts.ScriptKind.TS],
  [".mts", ts.ScriptKind.TS],
  [".cts", ts.ScriptKind.TS],
  [".tsx", ts.ScriptKind.TSX]
]);

function diagnosticRecord(diagnostic, sourceFile) {
  const start = Number(diagnostic.start ?? 0);
  const location = sourceFile?.getLineAndCharacterOfPosition(start);
  return Object.freeze({
    code: Number(diagnostic.code),
    category: ts.DiagnosticCategory[diagnostic.category]?.toLowerCase() ?? "unknown",
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    line: location ? location.line + 1 : null,
    column: location ? location.character + 1 : null
  });
}

function exportedNames(sourceFile) {
  const names = [];
  for (const statement of sourceFile.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) ?? [] : [];
    if (!modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (statement.name?.text) names.push(statement.name.text);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
      }
    }
  }
  return [...new Set(names)].sort();
}

function explicitBuildMode(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) ?? [] : [];
    if (!modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "nexusBuildMode") continue;
      if (declaration.initializer && ts.isStringLiteral(declaration.initializer)) {
        return declaration.initializer.text;
      }
    }
  }
  return null;
}

export function createJavascriptAstService() {
  function parse(file) {
    const text = file.bytes.toString("utf8");
    const extension = path.extname(file.path).toLowerCase();
    const sourceFile = ts.createSourceFile(
      file.path,
      text,
      ts.ScriptTarget.ESNext,
      true,
      SCRIPT_KINDS.get(extension) ?? ts.ScriptKind.Unknown
    );
    const diagnostics = sourceFile.parseDiagnostics.map((diagnostic) => diagnosticRecord(diagnostic, sourceFile));
    const record = Object.freeze({
      path: file.path,
      language: [".ts", ".tsx", ".mts", ".cts"].includes(extension) ? "typescript" : "javascript",
      scriptKind: ts.ScriptKind[sourceFile.scriptKind] ?? String(sourceFile.scriptKind),
      statementCount: sourceFile.statements.length,
      exportedNames: Object.freeze(exportedNames(sourceFile)),
      explicitBuildMode: explicitBuildMode(sourceFile),
      diagnostics: Object.freeze(diagnostics),
      astHash: contentIntegrity(JSON.stringify({
        path: file.path,
        kinds: sourceFile.statements.map((statement) => statement.kind),
        text
      }))
    });
    return Object.freeze({ sourceFile, record });
  }

  return Object.freeze({ parse, ts });
}

export default createJavascriptAstService;
