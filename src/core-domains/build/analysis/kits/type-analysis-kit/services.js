import path from "node:path";
import ts from "@typescript/typescript6";

function diagnosticRecord(diagnostic, projectRoot) {
  const sourceFile = diagnostic.file;
  const location = sourceFile && diagnostic.start != null
    ? sourceFile.getLineAndCharacterOfPosition(diagnostic.start)
    : null;
  return Object.freeze({
    code: Number(diagnostic.code),
    category: ts.DiagnosticCategory[diagnostic.category]?.toLowerCase() ?? "unknown",
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    path: sourceFile ? path.relative(projectRoot, sourceFile.fileName).split(path.sep).join("/") : null,
    line: location ? location.line + 1 : null,
    column: location ? location.character + 1 : null
  });
}

export function createTypeAnalysisService() {
  function analyze(projectSource) {
    const rootNames = projectSource.sourceFiles.map((file) => file.absolutePath);
    const options = {
      allowJs: true,
      checkJs: false,
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      noEmit: true,
      noLib: false,
      skipLibCheck: true,
      strict: false,
      target: ts.ScriptTarget.ES2022
    };
    const program = ts.createProgram({ rootNames, options });
    const diagnostics = [
      ...program.getConfigFileParsingDiagnostics(),
      ...program.getSyntacticDiagnostics(),
      ...program.getOptionsDiagnostics(),
      ...program.getSemanticDiagnostics().filter((diagnostic) => {
        const extension = diagnostic.file ? path.extname(diagnostic.file.fileName).toLowerCase() : "";
        return [".ts", ".tsx", ".mts", ".cts"].includes(extension);
      })
    ].map((diagnostic) => diagnosticRecord(diagnostic, projectSource.root));
    diagnostics.sort((left, right) => `${left.path}:${left.line}:${left.column}:${left.code}`.localeCompare(`${right.path}:${right.line}:${right.column}:${right.code}`));
    return Object.freeze({
      compiler: Object.freeze({ package: "@typescript/typescript6", version: ts.version }),
      checkedFiles: rootNames.length,
      diagnostics: Object.freeze(diagnostics),
      ok: diagnostics.every((diagnostic) => diagnostic.category !== "error")
    });
  }

  return Object.freeze({ analyze });
}

export default createTypeAnalysisService;
