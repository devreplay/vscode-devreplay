import { ILintOut, IPattern, lint, lintAndFix } from "devreplay";
import * as fs from "fs";
import * as path from "path";
import { commands, Diagnostic, DiagnosticSeverity, ExtensionContext, languages,
        Position, Range, TextDocumentWillSaveEvent, Uri, window, workspace } from "vscode";

const diagnostics = languages.createDiagnosticCollection("devreplay");
const config = workspace.getConfiguration("devreplay");

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand("devreplay.run", lintFile),
        commands.registerCommand("devreplay.fix", fix),
        workspace.onWillSaveTextDocument(willSaveTextDocument),
    );
}

async function willSaveTextDocument(e: TextDocumentWillSaveEvent) {
    const replayOnSave = config.get("replayOnSave") as boolean;
    const ruleFile: string | undefined = await getRuleFilePath(config.get("ruleFile"));
    if (replayOnSave) {
        const results = await lint(e.document.fileName, e.document.getText(), ruleFile);
        updateDiagsByResults(results);
    }
}

async function lintFile() {
    const currentDocument = window.activeTextEditor;
    if (currentDocument === undefined) {
        return;
    }
    const fileContent = currentDocument.document.getText();
    const fileName = currentDocument.document.fileName;
    const ruleFile: string | undefined = await getRuleFilePath(config.get("ruleFile"));

    const results = await lint(fileName, fileContent, ruleFile);
    updateDiagsByResults(results);
}

function updateDiagsByResults(results: ILintOut[]) {
    diagnostics.clear();
    const diagsCollection: {[key: string]: Diagnostic[]} = {};
    for (const result of results) {
        const range = new Range(new Position(result.position.start - 1, 0),
                                new Position(result.position.end - 1, Number.MAX_SAFE_INTEGER));
        const message = code2String(result.pattern);
        const severity = makeSeverity(result.pattern.severity);
        const diag = new Diagnostic(range, message, severity);
        if (!(diagsCollection.hasOwnProperty(result.position.fileName))) {
            diagsCollection[result.position.fileName] = [];
        }
        diagsCollection[result.position.fileName].push(diag);
        diagnostics.set(Uri.file(result.position.fileName),
                        diagsCollection[result.position.fileName]);
    }
}

function makeSeverity(severity?: string) {
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

export function code2String(pattern: IPattern) {
    if (pattern.description !== undefined) {
        return pattern.description;
    }

    return `${pattern.condition.join("")} should be ${pattern.consequent.join("")}`;
}

async function fix() {
    const currentDocument = window.activeTextEditor;
    if (currentDocument === undefined) {
        return;
    }
    const fileName = currentDocument.document.fileName;
    const ruleFile: string | undefined = await getRuleFilePath(config.get("ruleFile"));

    const newContent = await lintAndFix(fileName, ruleFile);
    if (newContent !== "") {
        fs.writeFileSync(fileName, newContent);
    }
}

async function getRuleFilePath(ruleFile: string | undefined) {
    const folders = workspace.workspaceFolders;
    if (folders === undefined) {
        return undefined;
    }
    const folderPath = folders[0].uri.path;
    if (ruleFile !== undefined && fs.existsSync(ruleFile)) {
        return ruleFile;
    }
    if (ruleFile !== undefined && fs.existsSync(`${folderPath}/${ruleFile}`)) {
        return `${folderPath}/${ruleFile}`;
    }
    if (fs.existsSync(`${folderPath}/devreplay.json`)) {
        return `${folderPath}/devreplay.json`;
    }

    return undefined;
}

/*async function createDefaultRule() {
    let folders = workspace.workspaceFolders;
    let folder: WorkspaceFolder | undefined = undefined;
    if (!folders) {
        window.showErrorMessage('A Devreplay file can only be generated if VS Code is opened on a folder.');
        return;
    }
    if (folders.length === 1) {
        folder = folders[0];
    } else {
        const options: WorkspaceFolderPickOptions = {
            placeHolder: "Select the folder for generating the 'devreplay.json' file"
        };
        folder = await window.showWorkspaceFolderPick(options);
        if (!folder) {
            return;
        }
    }
    const folderPath = folder.uri.fsPath;
    const devreplayRuleFile = path.join(folderPath, 'devreplay.json');

    if (fs.existsSync(devreplayRuleFile)) {
        window.showInformationMessage('A TSLint configuration file already exists.');
        let document = await workspace.openTextDocument(devreplayRuleFile);
        window.showTextDocument(document);
    } else {
        const devreplayCmd = await findDevreplay(folderPath);
        const cmd = `${devreplayCmd} --init`;
        const p = exec(cmd, { cwd: folderPath, env: process.env });
        p.on('exit', async (code: number, _signal: string) => {
            if (code === 0) {
                let document = await workspace.openTextDocument(devreplayRuleFile);
                window.showTextDocument(document);
            } else {
            }
        });
    }
}*/

async function exists(file: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.access(file, (err) => {
            if (err !== null) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function findDevreplay(rootPath: string): Promise<string> {
    const platform = process.platform;
    if (platform === "win32" && await exists(path.join(rootPath, "node_modules", ".bin", "devreplay.cmd"))) {
        return path.join(".", "node_modules", ".bin", "devreplay.cmd");
    }
    if ((platform === "linux" || platform === "darwin") &&
         await exists(path.join(rootPath, "node_modules", ".bin", "devreplay"))) {
        return path.join(".", "node_modules", ".bin", "devreplay");
    }

    return "devreplay";
}
