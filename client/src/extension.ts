'use strict';
import { join } from 'path';

import { ExtensionContext, window, commands, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import { addChange } from './addChange';

let client: LanguageClient;

export function activate(context: ExtensionContext): void {
	const serverModule = context.asAbsolutePath(join('server', 'out', 'server.js'));
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'], cwd: process.cwd() };
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc, options: { cwd: process.cwd() } },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions,
		},
	};
	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{
				scheme: 'file',
				language: 'plaintext',
			},
			{
				scheme: 'file',
				language: 'markdown',
			},
			{
				scheme: 'file',
				language: 'python',
			},
			{
				scheme: 'file',
				language: 'php',
			},
			{
				scheme: 'file',
				language: 'ruby',
			},
			{
				scheme: 'file',
				language: 'r',
			},
			{
				scheme: 'file',
				language: 'java',
			},
			{
				scheme: 'file',
				language: 'javascript',
			},
			{
				scheme: 'file',
				language: 'typescript',
			},
			{
				scheme: 'file',
				language: 'cpp',
			},
			{
				scheme: 'file',
				language: 'c',
			},
			{
				scheme: 'file',
				language: 'cobol',
			},
			{
				scheme: 'file',
				language: 'dart',
			},
			{
				scheme: 'file',
				language: 'go',
			},
			{
				scheme: 'file',
				language: 'ruby',
			},
			{
				scheme: 'file',
				language: 'rust',
			},
			{
				scheme: 'file',
				language: 'csharp',
			},
			{
				scheme: 'file',
				language: 'kotlin',
			}
		],
		synchronize: {
			// configurationSection: 'devreplay',
			fileEvents: [
				workspace.createFileSystemWatcher('**/.devreplay.json')
			]
		},
		diagnosticCollectionName: 'devreplay',
		revealOutputChannelOn: RevealOutputChannelOn.Never,
		progressOnInitialization: true
	};

	try {
		client = new LanguageClient('DevReplay Server', serverOptions, clientOptions);
	} catch (err) {
		window.showErrorMessage('The extension couldn\'t be started. See the output channel for details.');

		return;
	}

	// const config = workspace.getConfiguration('devreplay');

	const registeredCommand = commands.registerCommand('devreplay.add', () => { addChange(); } );
	// workspace.onWillSaveTextDocument((_event) => {
	//     const isExecutable = config.get<boolean>('exec.save');
	//     if (isExecutable) {
	//         addChange();
	//     }
	// });

	client.start().catch((error) => client.error(`Starting the server failed.`, error, 'force'));
}

export async function deactivate() {
	if (client) {
		await client.stop();
	}
}