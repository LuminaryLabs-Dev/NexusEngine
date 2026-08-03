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

const NATIVE_BINARY_OPERATORS = new Map([
  [ts.SyntaxKind.PlusToken, "+"],
  [ts.SyntaxKind.MinusToken, "-"],
  [ts.SyntaxKind.AsteriskToken, "*"],
  [ts.SyntaxKind.SlashToken, "/"],
  [ts.SyntaxKind.PercentToken, "%"]
]);

function sourceLocation(sourceFile, node) {
  const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return Object.freeze({ line: location.line + 1, column: location.character + 1 });
}

function nativeExpression(node, parameters) {
  if (ts.isParenthesizedExpression(node)) return nativeExpression(node.expression, parameters);
  if (ts.isNumericLiteral(node)) return Object.freeze({ kind: "number", value: Number(node.text) });
  if (ts.isIdentifier(node) && parameters.has(node.text)) {
    return Object.freeze({ kind: "parameter", name: node.text });
  }
  if (ts.isPrefixUnaryExpression(node) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken].includes(node.operator)) {
    return Object.freeze({
      kind: "unary",
      operator: node.operator === ts.SyntaxKind.MinusToken ? "-" : "+",
      value: nativeExpression(node.operand, parameters)
    });
  }
  if (ts.isBinaryExpression(node) && NATIVE_BINARY_OPERATORS.has(node.operatorToken.kind)) {
    return Object.freeze({
      kind: "binary",
      operator: NATIVE_BINARY_OPERATORS.get(node.operatorToken.kind),
      left: nativeExpression(node.left, parameters),
      right: nativeExpression(node.right, parameters)
    });
  }
  throw new TypeError(`Unsupported native expression kind: ${ts.SyntaxKind[node.kind] ?? node.kind}.`);
}

function nativeSurface(sourceFile, mode) {
  if (mode !== "native") return Object.freeze({ functions: Object.freeze([]), diagnostics: Object.freeze([]) });
  const functions = [];
  const diagnostics = [];
  const addDiagnostic = (code, statement, message) => diagnostics.push(Object.freeze({
    code,
    category: "error",
    message,
    ...sourceLocation(sourceFile, statement)
  }));

  for (const statement of sourceFile.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) ?? [] : [];
    const exported = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isVariableStatement(statement)) {
      const declarations = statement.declarationList.declarations;
      const onlyMode = declarations.length === 1
        && ts.isIdentifier(declarations[0].name)
        && declarations[0].name.text === "nexusBuildMode";
      if (!exported || !onlyMode) addDiagnostic("native-top-level-variable", statement, "Native modules only allow the exported nexusBuildMode variable.");
      continue;
    }
    if (!ts.isFunctionDeclaration(statement) || !exported || !statement.name || !statement.body) {
      addDiagnostic("native-top-level-statement", statement, "Native modules only allow exported numeric function declarations.");
      continue;
    }
    if (statement.asteriskToken || modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)) {
      addDiagnostic("native-function-control-flow", statement, `Native function ${statement.name.text} cannot be async or a generator.`);
      continue;
    }
    const parameters = [];
    let invalidParameter = false;
    for (const parameter of statement.parameters) {
      if (!ts.isIdentifier(parameter.name) || parameter.dotDotDotToken || parameter.initializer || parameter.questionToken) {
        invalidParameter = true;
        break;
      }
      const type = parameter.type?.getText(sourceFile);
      if (type && type !== "number") {
        invalidParameter = true;
        break;
      }
      parameters.push(parameter.name.text);
    }
    if (invalidParameter || new Set(parameters).size !== parameters.length) {
      addDiagnostic("native-function-parameter", statement, `Native function ${statement.name.text} requires unique numeric parameters without defaults.`);
      continue;
    }
    const body = statement.body.statements;
    if (body.length !== 1 || !ts.isReturnStatement(body[0]) || !body[0].expression) {
      addDiagnostic("native-function-body", statement, `Native function ${statement.name.text} requires one numeric return expression.`);
      continue;
    }
    try {
      functions.push(Object.freeze({
        name: statement.name.text,
        parameters: Object.freeze(parameters),
        expression: nativeExpression(body[0].expression, new Set(parameters)),
        ...sourceLocation(sourceFile, statement)
      }));
    } catch (error) {
      addDiagnostic("native-function-expression", statement, `${statement.name.text}: ${error.message}`);
    }
  }
  return Object.freeze({
    functions: Object.freeze(functions.sort((left, right) => left.name.localeCompare(right.name))),
    diagnostics: Object.freeze(diagnostics)
  });
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
    const buildMode = explicitBuildMode(sourceFile);
    const native = nativeSurface(sourceFile, buildMode);
    const record = Object.freeze({
      path: file.path,
      language: [".ts", ".tsx", ".mts", ".cts"].includes(extension) ? "typescript" : "javascript",
      scriptKind: ts.ScriptKind[sourceFile.scriptKind] ?? String(sourceFile.scriptKind),
      statementCount: sourceFile.statements.length,
      exportedNames: Object.freeze(exportedNames(sourceFile)),
      explicitBuildMode: buildMode,
      nativeFunctions: native.functions,
      nativeDiagnostics: native.diagnostics,
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
