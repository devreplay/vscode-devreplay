import { workspace, extensions } from 'vscode';
import { GitExtension, API } from '../typings/git'; 

export function getGitAPI(): API | undefined {
    const gitExtension = extensions.getExtension<GitExtension>('vscode.git');
    if (gitExtension) {
        return gitExtension.exports.getAPI(1);
    }
    return;
}

export function getRepo() {
    const git = getGitAPI();
    if (!git) {
        throw new Error('vscode.git is no enabled');
    }
    // get root path
    const { rootPath } = workspace;
    if (!rootPath) {
        throw new Error('Please open a folder.');
    }

    const [repo] = git.repositories
    .filter(function (repo) {
      return rootPath.startsWith(repo.rootUri.fsPath);
    })
    .sort(function (prev, next) {
      return next.rootUri.fsPath.length - prev.rootUri.fsPath.length;
    });
    if (!repo) {
        throw new Error(`repo not found in path: ${rootPath}`);
    }
    return repo;
}

export function getDiff(filePath: string) {
    const repo = getRepo();
    return repo.diffWithHEAD(filePath);
}

// export async function getDiff() {
//     const repo = getRepo();
//     const changedFiles = await repo.diffWithHEAD().then(changes => {
//         return changes.filter(change =>{
//             return change.status === Status.MODIFIED; 
//         })
//         .map(change => { return change.uri.fsPath; });
//     });

//     const diffs: string[] = [];

//     for (const path of changedFiles) {
//         diffs.push(await repo.diffWithHEAD(path));
//     }
//     return {diffs, changedFiles};
// }