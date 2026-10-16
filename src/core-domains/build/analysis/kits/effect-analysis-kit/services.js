import ts from "@typescript/typescript6";
import { isBuiltin } from 'node:module';

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
    // Resolve lexical bindings before classifying ambient APIs. An authoring
    // document variable is not the browser's global document object.
    const source=parsed.sourceFile;
    const host={getSourceFile:name=>name===source.fileName?source:undefined,getDefaultLibFileName:()=>'',writeFile:()=>{},getCurrentDirectory:()=>'',getDirectories:()=>[],fileExists:name=>name===source.fileName,readFile:()=>undefined,getCanonicalFileName:name=>name,useCaseSensitiveFileNames:()=>true,getNewLine:()=> '\n'};
    const checker=ts.createProgram([source.fileName],{allowJs:true,noLib:true,noResolve:true,types:[]},host).getTypeChecker();
    const isAmbient=node=>!(ts.isShorthandPropertyAssignment(node.parent)?checker.getShorthandAssignmentValueSymbol(node.parent):checker.getSymbolAtLocation(node));

    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier) && isBuiltin(node.moduleSpecifier.text)) effects.add(`node:${node.moduleSpecifier.text.replace(/^node:/,'')}`);
      if (ts.isIdentifier(node) && isReferenceIdentifier(node) && GLOBAL_EFFECTS[node.text] && isAmbient(node)) {
        effects.add(GLOBAL_EFFECTS[node.text]);
      }
      if (ts.isCallExpression(node)) {
        if((node.expression.kind===ts.SyntaxKind.ImportKeyword||(ts.isIdentifier(node.expression)&&node.expression.text==='require'))&&node.arguments[0]&&ts.isStringLiteralLike(node.arguments[0])&&isBuiltin(node.arguments[0].text))effects.add(`node:${node.arguments[0].text.replace(/^node:/,'')}`);
        if (ts.isIdentifier(node.expression) && node.expression.text === 'require' && (!node.arguments[0] || !ts.isStringLiteralLike(node.arguments[0]))) unsupported.push({code:'dynamic-require-nonliteral',position:node.pos});
        if (ts.isIdentifier(node.expression) && FORBIDDEN_CALLS.has(node.expression.text) && isAmbient(node.expression)) {
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
