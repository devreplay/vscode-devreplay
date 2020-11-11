'use strict';
import { Pattern, makePatterns, makeDiffObj } from 'devreplay';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { ExtensionContext, window, workspace, commands } from 'vscode';
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient';

import { getDiff } from './diffprovider';

export function activate(context: ExtensionContext): void {
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
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
        diagnosticCollectionName: 'devreplay',
        revealOutputChannelOn: RevealOutputChannelOn.Never,
    };

    let client: LanguageClient;
    try {
        client = new LanguageClient('DevReplay Server', serverOptions, clientOptions);
    } catch (err) {
        window.showErrorMessage('The extension couldn\'t be started. See the output channel for details.');

        return;
    }
    client.registerProposedFeatures();

    workspace.onWillSaveTextDocument((event) => {
        const config = workspace.getConfiguration('devreplay');
        const isExecutable = config.get<boolean>('exec.save');
        if (isExecutable) {
            addChange();
        }
    });

    const disposable = commands.registerCommand('devreplay.add', addChange);

    context.subscriptions.push(
        client.start(),
        disposable
    );
}

async function addChange() {
    const targetFile = window.activeTextEditor.document.uri.fsPath;
    const diff = await getDiff(targetFile);
    const patterns = [];
    const source = getFileSource(targetFile.toString());

    const chunks = makeDiffObj(diff).filter(chunk => {return chunk.type === 'changed';});
    for (const out of chunks.filter(chunk => {return chunk.type === 'changed';})) {
        const pattern = await makePatterns(out.deleted.join('\n'),
                                            out.added.join('\n'), source);
        if (pattern !== undefined) {
            patterns.push(pattern);
        }
    }

    writePattern(patterns);
}

function writePattern(patterns: any[]) {
    const outPatterns = readCurrentPattern().concat(patterns);
    const patternStr = JSON.stringify(outPatterns, undefined, 2);
    const filePath = getDevReplayPath();
    try {
        fs.writeFileSync(filePath, patternStr);
    } catch(err) {
        window.showErrorMessage(err.name);
    }
}


function readCurrentPattern(): Pattern[] {
    const devreplayPath = getDevReplayPath();
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
    return JSON.parse(fileContents) as Pattern[];
}



function getDevReplayPath() {
    if (workspace.workspaceFolders === undefined) { return undefined; }
    const root = workspace.workspaceFolders[0].uri.path;
    return join(root, 'devreplay.json');
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


interface IGrammarPath {
    [key: string]: string[];
}

export const grammarPaths: IGrammarPath = {
    'source.c': ['.c'],
    'source.cpp': ['.cpp'],
    'source.csharp': ['.cs'],
    'source.go': ['.go'],
    'source.html': ['.html'],
    'source.java': ['.java'],
    'source.js': ['.js'],
    'source.perl': ['.perl'],
    'source.perl.6': ['.perl6'],
    'source.php': ['.php'],
    'source.python': ['.py'],
    'source.r': ['.r'],
    'source.ruby': ['.ruby'],
    'source.rust': ['.rs'],
    'source.swift': ['.swift'],
    'source.ts': ['.ts']
};

export function getFileSource(path: string) {
    for (const grammarPath in grammarPaths) {
        for (const extension of grammarPaths[grammarPath]) {
            if (path.endsWith(extension)){
                return grammarPath;
            }
        }
    }
    return undefined;
}