/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */
import { code2String, lint, makeSeverity } from "devreplay";
import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, ExtensionContext,
         Position, Range, TextDocument, window, workspace } from "vscode";

import { getDevReplayPath } from "./util";

/**
 * Analyzes the text document for problems.
 * @param doc text document to analyze
 * @param devreplayDiagnostics diagnostic collection
 */
function refreshDiagnostics(doc: TextDocument, devreplayDiagnostics: DiagnosticCollection) {
    const diagnostics: Diagnostic[] = [];
    const results = lintFile(doc);
    for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        const range = new Range(new Position(result.position.start - 1, 0),
                                new Position(result.position.end - 1, Number.MAX_SAFE_INTEGER));
        const message = code2String(result.pattern);
        const severity = convertSeverity(makeSeverity(result.pattern.severity));
        const diag = new Diagnostic(range, message, severity);
        diag.source = "devreplay";
        diag.code = i;

        diagnostics.push(diag);
    }
    devreplayDiagnostics.set(doc.uri, diagnostics);

}

export function subscribeToDocumentChanges(context: ExtensionContext,
                                           devreplayDiagnostics: DiagnosticCollection) {
    if (window.activeTextEditor !== undefined) {
        refreshDiagnostics(window.activeTextEditor.document, devreplayDiagnostics);
    }
    context.subscriptions.push(
        window.onDidChangeActiveTextEditor((editor) => {
            if (editor !== undefined) {
                refreshDiagnostics(editor.document, devreplayDiagnostics);
            }
        }),
    );

    context.subscriptions.push(
        workspace.onDidChangeTextDocument((e) => { refreshDiagnostics(e.document, devreplayDiagnostics); }),
    );

    context.subscriptions.push(
        workspace.onDidCloseTextDocument((doc) => { devreplayDiagnostics.delete(doc.uri); }),
    );

}

function lintFile(doc: TextDocument) {
    const fileContent = doc.getText();
    const fileName = doc.fileName;
    const ruleFile = getDevReplayPath();
    if (ruleFile !== undefined && fileName.endsWith(ruleFile)) {
        return [];
    }
    const results = lint(fileName, fileContent, ruleFile);

    return results;
}

function convertSeverity(severity: string) {
    switch (severity) {
        case "E":
            return DiagnosticSeverity.Error;
        case "W":
            return DiagnosticSeverity.Warning;
        case "I":
            return DiagnosticSeverity.Information;
        case "H":
                return DiagnosticSeverity.Hint;
        default:
            return DiagnosticSeverity.Warning;
    }
}
