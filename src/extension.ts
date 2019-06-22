import { Position, Range, window, ExtensionContext, commands, languages, DiagnosticSeverity, Diagnostic,Uri,workspace } from "vscode";
import { lint } from "devreplay";

const diagnostics = languages.createDiagnosticCollection("DevAvatar");
const config = workspace.getConfiguration("devavatar");

export function activate(context: ExtensionContext) {
	let disposable = commands.registerCommand('devavatar.run', lintFile);

	context.subscriptions.push(disposable);
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

export function deactivate() {}
