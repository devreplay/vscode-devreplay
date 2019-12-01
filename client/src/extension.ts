"use strict";

import * as path from "path";
import { ExtensionContext, window as Window } from "vscode";
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from "vscode-languageclient";

export function activate(context: ExtensionContext): void {
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc, options: { cwd: process.cwd() } },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ["--nolazy", "--inspect=6011"], cwd: process.cwd() }},
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "python" }],
        diagnosticCollectionName: "sample",
        revealOutputChannelOn: RevealOutputChannelOn.Never,
        // progressOnInitialization: true,
        // middleware: {
        //     executeCommand: async (command, args, next) => {
        //         const selected = await Window.showQuickPick(["Visual Studio", "Visual Studio Code"]);
        //         if (selected === undefined) {
        //             return next(command, args);
        //         }
        //         args = args.slice(0);
        //         args.push(selected);

        //         return next(command, args);
        //     },
        // },
    };

    let client: LanguageClient;
    try {
        client = new LanguageClient("DevReplay Server", serverOptions, clientOptions);
    } catch (err) {
        Window.showErrorMessage("The extension couldn't be started. See the output channel for details.");

        return;
    }
    client.registerProposedFeatures();

    context.subscriptions.push(
        client.start(),
    );
}
