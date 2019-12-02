"use strict";

import { code2String, fixWithPattern, ILintOut, IPattern, lint, makeSeverity } from "devreplay";
import {
    CodeAction,
    CodeActionKind,
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    InitializeParams,
    Range,
    TextDocumentEdit,
    TextDocuments,
    TextDocumentSyncKind,
    TextEdit,
    WorkspaceEdit,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";

namespace CommandIDs {
    export const fix = "devreplay.fix";
}
// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection();
connection.console.info(`DevReplay server running in node ${process.version}`);

// Create a simple text document manager. The text document manager
// Supports full document sync only
const documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// For open, change and close text document events
documents.listen(connection);
let workspaceFolder: string | undefined;

connection.onInitialize((params: InitializeParams) => {
    const workspaceFolders = params.workspaceFolders;
    workspaceFolder = workspaceFolders !== null ? workspaceFolders[0].uri : undefined;

    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: TextDocumentSyncKind.Incremental,
            },
            codeActionProvider: {
                codeActionKinds: [CodeActionKind.QuickFix],
            },
            executeCommandProvider: {
                commands: [CommandIDs.fix],
            },
        },
    };
});

/**
 * Analyzes the text document for problems.
 * @param doc text document to analyze
 * @param devreplayDiagnostics diagnostic collection
 */
function validate(doc: TextDocument) {
    const diagnostics: Diagnostic[] = [];
    const results = lintFile(doc);
    for (let i = 0; i < results.length; i += 1) {
        diagnostics.push(makeDiagnostic(results[i], i));
    }
    connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}

function makeDiagnostic(result: ILintOut, ruleCode: number): Diagnostic {
    const range: Range = {start: {line: result.position.start - 1, character: 0},
                          end: {line: result.position.end - 1, character: Number.MAX_SAFE_INTEGER}};
    const message = code2String(result.pattern);
    const severity = convertSeverity(makeSeverity(result.pattern.severity));

    return {
        range,
        severity,
        code: ruleCode,
        message,
        source: "devreplay",
    };
}

documents.onDidOpen((event) => {
    validate(event.document);
});

documents.onDidChangeContent((change) => {
    validate(change.document);
});

connection.onCodeAction((params) => {
    if (workspaceFolder === undefined) {
        return [];
    }
    const diagnostics = params.context.diagnostics.filter((diag) => diag.source === "devreplay");
    if (diagnostics.length === 0) {
        return [];
    }
    const textDocument = documents.get(params.textDocument.uri);
    if (textDocument === undefined) {
        return [];
    }
    const ruleFile = URI.parse(`${workspaceFolder}/devreplay.json`).fsPath;
    const codeActions: CodeAction[] = [];
    const results = lint(textDocument.uri, textDocument.getText(), ruleFile);
    diagnostics.forEach((diag) => {
        const targetRule = results[Number(diag.code)];
        const title = "Fix by devreplay";
        const fixAction = CodeAction.create(title,
                                            createEditByPattern(textDocument, diag.range, targetRule.pattern),
                                            CodeActionKind.QuickFix);
        fixAction.diagnostics = [diag];
        codeActions.push(fixAction);
    });

    return codeActions;
});

function createEditByPattern(document: TextDocument, range: Range, pattern: IPattern): WorkspaceEdit {
    const edits = [TextEdit.replace(range, fixWithPattern(document.getText(range), pattern))];

    return { documentChanges: [TextDocumentEdit.create({uri: document.uri, version: document.version}, edits)] };
}

function lintFile(doc: TextDocument) {
    if (workspaceFolder === undefined) {
        return [];
    }
    const ruleFile = URI.parse(`${workspaceFolder}/devreplay.json`).fsPath;
    const fileContent = doc.getText();
    const fileName = URI.parse(doc.uri).fsPath;
    if (fileName.endsWith(ruleFile) || fileName.endsWith(".git")) {
        return [];
    }

    return lint(fileName, fileContent, ruleFile);
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

// Listen on the connection
connection.listen();
