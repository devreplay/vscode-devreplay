"use strict";

import { code2String, ILintOut, lint, makeSeverity } from "devreplay";
import {
    CodeAction,
    CodeActionKind,
    Command,
    createConnection,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationNotification,
    InitializeParams,
    Position,
    Range,
    TextDocumentEdit,
    TextDocuments,
    TextDocumentSyncKind,
    TextEdit,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";

namespace CommandIds {
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

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
// Let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;
    module.exports.root = params.rootPath;

    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    // HasDiagnosticRelatedInformationCapability = !!(
    //     Capabilities.textDocument &&
    //     Capabilities.textDocument.publishDiagnostics &&
    //     Capabilities.textDocument.publishDiagnostics.relatedInformation
    // );

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
                commands: [CommandIds.fix],
            },
        },
    };
});

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log("Workspace folder change event received.");
        });
    }
});

interface DevreplaySettings {
    ruleFile: string;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// But could happen with other clients.
const defaultSettings: DevreplaySettings = { ruleFile: "devreplay.json" };
let globalSettings: DevreplaySettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<DevreplaySettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = ((
            (change.settings.devreplay || defaultSettings)
        ) as DevreplaySettings);
    }

    // Revalidate all open text documents
    documents.all().forEach(validate);
});

function getDocumentSettings(resource: string): Thenable<DevreplaySettings> {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (result === undefined) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: "devreplay",
        });
        documentSettings.set(resource, result);
    }

    return result;
}

/**
 * Analyzes the text document for problems.
 * @param doc text document to analyze
 * @param devreplayDiagnostics diagnostic collection
 */
async function validate(doc: TextDocument) {
    const settings = await getDocumentSettings(doc.uri);
    console.log(settings);
    const diagnostics: Diagnostic[] = [];
    const results = lintFile(doc);
    for (let i = 0; i < results.length; i += 1) {
        diagnostics.push(makeDiagnostic(results[i], i));
        // RecordCodeAction(doc, results[i])
        // CodeAction.create(
        //     Title: code2String(results[i].pattern),

        //     Kind:
        // );
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

// Interface Problem {
//     Failure: ILintOut;
//     Fixable: boolean;
// }

// Const codeActions: Map<string, Map<string, ILintOut>> = new Map<string, Map<string, ILintOut>>();
// Function recordCodeAction(document: TextDocument, problem: ILintOut) {
//     Const command = command.crea
//     Const uri = document.uri;
// 	Let edits: Map<string, ILintOut> | undefined = codeActions.get(uri);
// 	If (edits === undefined) {
// 		Edits = new Map<string, ILintOut>();
// 		CodeActions.set(uri, edits);
// 	}
//     Edits.set(code2String(problem.pattern),
//     { label: `Fix this problem`,
//         DocumentVersion: document.version,
//         RuleId: problem.ruleId, edit: problem.fix, line: problem.line });
// }

documents.onDidOpen((event) => {
    validate(event.document);
});

// Only keep settings for open documents
documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
});

documents.onDidChangeContent((event) => {
    validate(event.document);
});

connection.onCodeAction((params) => {
	const textDocument = documents.get(params.textDocument.uri);
	if (textDocument === undefined) {
		return undefined;
	}
	const title = "With User Input";

	return [CodeAction.create(title, Command.create(title, CommandIds.fix, textDocument.uri), CodeActionKind.QuickFix)];
});

connection.onExecuteCommand(async (params) => {
	if (params.command !== CommandIds.fix || params.arguments ===  undefined) {
		return;
	}

	const textDocument = documents.get(params.arguments[0]);
	if (textDocument === undefined) {
		return;
	}
	const newText = typeof params.arguments[1] === "string" ? params.arguments[1] : "Eclipse";
	connection.workspace.applyEdit({
		documentChanges: [
			TextDocumentEdit.create({ uri: textDocument.uri, version: textDocument.version }, [
				TextEdit.insert(Position.create(0, 0), newText),
			]),
		],
	});
});

function lintFile(doc: TextDocument) {
    const ruleFile = "./devreplay.json";
    const fileContent = doc.getText();
    const fileName = URI.parse(doc.uri).fsPath;
    if (ruleFile !== undefined && fileName.endsWith(ruleFile) || fileName.endsWith(".git")) {
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

/*
connection.onDidOpenTextDocument((params) => {
    // A text document got opened in VSCode.
    // params.textDocument.uri uniquely identifies the document. For documents store on disk this is a file URI.
    // params.textDocument.text the initial full content of the document.
    connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
    // The content of a text document did change in VSCode.
    // params.textDocument.uri uniquely identifies the document.
    // params.contentChanges describe the content changes to the document.
    connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
    // A text document got closed in VSCode.
    // params.textDocument.uri uniquely identifies the document.
    connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();
