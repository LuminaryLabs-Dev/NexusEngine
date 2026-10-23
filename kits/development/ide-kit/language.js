import ts from '@typescript/typescript6';
/** Optional TypeScript language provider. Portable Authoring only exchanges records. */
export function createTypeScriptProvider() {
    return async function language(request, files) {
        if (!['javascript', 'typescript'].includes(files.find(f => f.id === request.id)?.language))
            return { unsupported: 'language-provider-unavailable' };
        const sources = new Map(files.map(f => ['/workspace/' + f.path, f]));
        const options = { allowJs: true, checkJs: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext };
        const service = ts.createLanguageService({ getCompilationSettings: () => options, getScriptFileNames: () => [...sources.keys()], getScriptVersion: name => String(sources.get(name)?.revision ?? 0), getScriptSnapshot: name => { const text = sources.get(name)?.text ?? ts.sys.readFile(name); return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text); }, getCurrentDirectory: () => '/workspace', getDefaultLibFileName: o => ts.getDefaultLibFilePath(o), fileExists: name => sources.has(name) || ts.sys.fileExists(name), readFile: name => sources.get(name)?.text ?? ts.sys.readFile(name), readDirectory: ts.sys.readDirectory });
        const file = files.find(f => f.id === request.id), name = '/workspace/' + file.path, pos = request.position ?? 0;
        try {
            if (request.kind === 'diagnostics')
                return { diagnostics: [...service.getSyntacticDiagnostics(name), ...service.getSemanticDiagnostics(name)].map(d => ({ severity: d.category === ts.DiagnosticCategory.Error ? 'error' : 'warning', message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), code: String(d.code), start: d.start ?? 0, end: (d.start ?? 0) + (d.length ?? 0), path: file.path })) };
            if (request.kind === 'completion')
                return { items: service.getCompletionsAtPosition(name, pos, {})?.entries.map(x => ({ label: x.name, kind: x.kind })) ?? [] };
            if (request.kind === 'hover')
                return { text: ts.displayPartsToString(service.getQuickInfoAtPosition(name, pos)?.displayParts) };
            if (request.kind === 'symbols')
                return { items: service.getNavigationBarItems(name).map(x => ({ label: x.text, kind: x.kind })) };
            if (request.kind === 'format')
                return { edits: [{ id: file.id, expectedRevision: file.revision, edits: service.getFormattingEditsForDocument(name, { indentSize: 2, tabSize: 2, convertTabsToSpaces: true, newLineCharacter: file.lineEnding === 'crlf' ? '\r\n' : '\n' }).map(e => ({ start: e.span.start, end: e.span.start + e.span.length, text: e.newText })) }] };
            if (request.kind === 'definition' || request.kind === 'references') {
                const found = request.kind === 'definition' ? service.getDefinitionAtPosition(name, pos) : service.getReferencesAtPosition(name, pos);
                return { items: (found ?? []).map(x => ({ path: x.fileName.replace(/^\/workspace\//, ''), start: x.textSpan.start, end: x.textSpan.start + x.textSpan.length })) };
            }
            return { unsupported: 'provider-operation-unavailable' };
        }
        finally {
            service.dispose();
        }
    };
}
