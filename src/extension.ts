import { Position, Range, window, ExtensionContext, commands, languages, DiagnosticSeverity, Diagnostic,Uri,workspace,WorkspaceFolder,WorkspaceFolderPickOptions } from "vscode";
import { lint, lintAndFix } from "devreplay";
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

const diagnostics = languages.createDiagnosticCollection("devreplay");
const config = workspace.getConfiguration("devreplay");

export function activate(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand('devreplay.run', lintFile),
		commands.registerCommand('devreplay.fix', fix),
	);
}

async function lintFile() {
	diagnostics.clear();

	const currentDocument = window.activeTextEditor;
	if (currentDocument===undefined){
		return;
	}
	const fileContent = currentDocument.document.getText();

	const fileName = currentDocument.document.fileName;
	const diagsCollection: {[key: string]: Diagnostic[]} = {};
	const ruleFile:string|undefined = config.get("ruleFile");

	const results = await lint(fileName, fileContent, ruleFile);	

	for (const result of results) {
		const range = new Range(new Position(result.line - 1, 0),
								new Position(result.line - 1, Number.MAX_SAFE_INTEGER));
		const message = result.pattern.code.join(" ");
		const severity = DiagnosticSeverity.Information;
		const diag = new Diagnostic(range, message, severity);
		if (diagsCollection[result.fileName] === undefined) {
			diagsCollection[result.fileName] = [];
		}
		diagsCollection[result.fileName].push(diag);
		diagnostics.set(Uri.file(result.fileName),
		diagsCollection[result.fileName]);
	}
}

async function fix() {
	const currentDocument = window.activeTextEditor;
	if (currentDocument===undefined){
		return;
	}
	const fileContent = currentDocument.document.getText();
	const fileName = currentDocument.document.fileName;
	const ruleFile:string|undefined = config.get("ruleFile");

	const newContent = await lintAndFix(fileName, ruleFile);
	fs.writeFileSync(fileName, newContent);
}

async function createDefaultRule() {
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
				window.showErrorMessage('Could not run `devreplay` to generate a configuration file. Please verify that you have `tslint` and `typescript` installed.');
			}
		});
	}
}

function exists(file: string): Promise<boolean> {
	return new Promise<boolean>((resolve, _reject) => {
		fs.exists(file, (value) => {
			resolve(value);
		});
	});
}

async function findDevreplay(rootPath: string): Promise<string> {
	const platform = process.platform;
	if (platform === 'win32' && await exists(path.join(rootPath, 'node_modules', '.bin', 'devreplay.cmd'))) {
		return path.join('.', 'node_modules', '.bin', 'devreplay.cmd');
	} else if ((platform === 'linux' || platform === 'darwin') && await exists(path.join(rootPath, 'node_modules', '.bin', 'devreplay'))) {
		return path.join('.', 'node_modules', '.bin', 'devreplay');
	} else {
		return 'devreplay';
	}
}

export function deactivate() {}
