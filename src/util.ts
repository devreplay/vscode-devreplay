"use strict";
import * as fs from "fs";
import { workspace } from "vscode";
export let config = workspace.getConfiguration("devreplay");

export function getDevReplayPath() {
    const ruleFile = config.get<string>("ruleFile");
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
