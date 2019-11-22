import { fixFromFile, fixWithPattern, lint } from "devreplay";
import * as fs from "fs";
import { CodeAction, CodeActionContext, CodeActionKind, CodeActionProvider,
         commands, Diagnostic, ExtensionContext, languages,
         Range, TextDocument, window, WorkspaceEdit } from "vscode";

import { subscribeToDocumentChanges } from "./diagnostics";
import { getDevReplayPath } from "./util";

export class DevReplayActionProvider implements CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        CodeActionKind.QuickFix,
    ];

    public provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext) {
        return context.diagnostics
                      .filter((diag) => diag.source === "devreplay")
                      .map((diag) => this.createFix(document, diag));
    }

    private createFix(document: TextDocument, diag: Diagnostic) {
        const fixAction = new CodeAction(diag.message, CodeActionKind.QuickFix);
        fixAction.diagnostics = [diag];

        const ruleFile = getDevReplayPath();

        const fileContent = document.getText();
        const fileName = document.fileName;
        const results = lint(fileName, fileContent, ruleFile);

        const targetRule = results[Number(diag.code)];

        const target = document.getText(diag.range);

        fixAction.edit = new WorkspaceEdit();
        fixAction.edit.replace(document.uri, diag.range, fixWithPattern(target, targetRule.pattern));

        return fixAction;
    }
}

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand("devreplay.fix", fix),
    );
    const devreplayDiagnostics = languages.createDiagnosticCollection("devreplay");
    context.subscriptions.push(devreplayDiagnostics);

    subscribeToDocumentChanges(context, devreplayDiagnostics);

    context.subscriptions.push(
        languages.registerCodeActionsProvider(["python", "java", "javascript",
                                               "ruby", "cpp", "c", "typescript"],
                                              new DevReplayActionProvider(), {
            providedCodeActionKinds: DevReplayActionProvider.providedCodeActionKinds,
        }));
}

function fix() {
    const currentDocument = window.activeTextEditor;
    if (currentDocument === undefined) {
        return;
    }
    const fileName = currentDocument.document.fileName;
    const ruleFile: string | undefined = getDevReplayPath();

    const newContent = fixFromFile(fileName, ruleFile);
    if (newContent !== "") {
        fs.writeFileSync(fileName, newContent);
    }
}
