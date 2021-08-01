import { join } from 'path';
import * as fs from 'fs';
import { window, workspace } from 'vscode';
import { Rule } from 'devreplay';

import { makeRulesFromDiff } from './rule-maker/makeRules';
import { getFileSource } from './extensionmap';
import { getDiff } from './diffprovider';

export async function addChange() {
	const config = workspace.getConfiguration('devreplay');
	let ruleSize = config.get<number>('rule.size');
	if (ruleSize === undefined) {
		ruleSize = 1;
	}
	const activeTextEditor = window.activeTextEditor;
	if (activeTextEditor === undefined) {
		return;
	}
	const targetFile = activeTextEditor.document.uri.fsPath;
	const source = getFileSource(targetFile);
	const diff = await getDiff(targetFile);
	const workspaceFolder = workspace.getWorkspaceFolder(activeTextEditor.document.uri);
	if (workspaceFolder === undefined) {
		return;
	}

	const rules = await makeRulesFromDiff(diff, source);

	writePattern(workspaceFolder.uri.fsPath, rules);
}


export function writePattern(rootPath: string, rules: Rule[]) {
	const outPatterns = readCurrentPattern(rootPath).concat(rules);
	const patternStr = JSON.stringify(outPatterns, undefined, 2);
	const filePath = getDevReplayPath(rootPath);
	try {
		fs.writeFileSync(filePath, patternStr);
	} catch(err) {
		window.showErrorMessage(err.name);
	}
}


function readCurrentPattern(rootPath: string): Rule[] {
	const devreplayPath = getDevReplayPath(rootPath);
	if (devreplayPath === undefined) { return []; }
	let fileContents = undefined;
	try{
		fileContents = tryReadFile(devreplayPath);
	} catch {
		return [];
	}
	if (fileContents === undefined) {
		return [];
	}
	return JSON.parse(fileContents) as Rule[];
}


function getDevReplayPath(rootPath: string) {
	return join(rootPath, 'devreplay.json');
}

export function tryReadFile(filename: string) {
	if (!fs.existsSync(filename)) {
		throw new Error(`Unable to open file: ${filename}`);
	}
	const buffer = Buffer.allocUnsafe(256);
	const fd = fs.openSync(filename, 'r');
	try {
		fs.readSync(fd, buffer, 0, 256, 0);
		if (buffer.readInt8(0) === 0x47 && buffer.readInt8(188) === 0x47) {
			console.log(`${filename}: ignoring MPEG transport stream\n`);

			return undefined;
		}
	} finally {
		fs.closeSync(fd);
	}

	return fs.readFileSync(filename, 'utf8');
}
