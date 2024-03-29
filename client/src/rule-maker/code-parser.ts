import * as Path from 'path';
import * as Parser from 'web-tree-sitter';

import { diffChars, diffLines, Change as DiffChange } from 'diff';

export interface Position {
    row: number;
    column: number
}
export interface Token {
    type: string;
    text: string;
    range: {
        start: Position,
        end: Position
    };
}

export type Change = {
    before: string[];
    after: string[]; 
}

export type ChangeTokens = {
    before: Token[],
    after: Token[]
}

/**
 * Tokenize source code to splitted string
 * @param content source code content
 * @param langName language names
 * @returns Token text list
 */
export async function tokenize(content: string, langName: string): Promise<Token[]> {
	const parser = await makeParser(langName);
	if (parser === undefined) {
		return [];
	}

	const tree = parser.parse(content);
	const cursor = tree.walk();

	const tokens: Token[] = [];
	for (;;) {
		if (cursor.gotoFirstChild()) {
			while (cursor.nodeType !== 'string' && cursor.gotoFirstChild()) {
				continue;
			}
			tokens.push(getToken(cursor));
		}
		for (;;) {
			if (cursor.gotoNextSibling()) {
				if (cursor.nodeType === 'string' || cursor.currentNode().childCount === 0) {
					tokens.push(getToken(cursor));
				} else {
					break;
				}
			} else if (cursor.gotoParent()){
				while (!cursor.gotoNextSibling()) {
					if (!cursor.gotoParent()) {
						return tokens;
					}
				}
                
				if (cursor.nodeType === 'string' || cursor.currentNode().childCount === 0) {
					tokens.push(getToken(cursor));
				} else {
					break;
				}
                
			} else {
				return tokens;
			}
		}
	}
}

function getToken(cursor: Parser.TreeCursor): Token {
	return {
		type: cursor.nodeType,
		text: cursor.nodeText,
		range: {
			start: cursor.startPosition,
			end: cursor.endPosition
		}
	};
}

/**
 * Make the code diff from two code contents
 * @param before Prechanged source code
 * @param after Changed source code
 * @param langName Target programming language name
 */
export async function strDiff2treeDiff(before: string, after: string, langName: string): Promise<Change | undefined> {

	const parser = await makeParser(langName);
	
	if (parser === undefined) {
		return;
	}

	const beforeTree = parser.parse(before);
	const before2afterTree = editTree(before, after, beforeTree);
	const afterTree = parser.parse(after, before2afterTree);
	const changedRanges = before2afterTree.getChangedRanges(afterTree);
	const afterRange = {
		start: Math.min(...changedRanges.map(change => {
			return change.startIndex;
		})),
		end: Math.max(...changedRanges.map(change => {
			return change.endIndex;
		}))
	};

	const afterTree2 = parser.parse(after);
	const after2beforeTree = editTree(after, before, afterTree2);
	const beforeTree2 = parser.parse(before, after2beforeTree);
	const changedRanges2 = after2beforeTree.getChangedRanges(beforeTree2);
	const beforeRange = {
		start: Math.min(...changedRanges2.map(change => {
			return change.startIndex;
		})),
		end: Math.max(...changedRanges2.map(change => {
			return change.endIndex;
		}))
	};

	const afterChunk = after.slice(afterRange.start, afterRange.end);
	const beforeChunk = before.slice(beforeRange.start, beforeRange.end);

	return {
		before:  beforeChunk.split('\n'),
		after: afterChunk.split('\n')
	};
}


export async function makeParser(langName: string): Promise<any> {
	const language = langName2Parser(langName);
	const wasmPath = Path.join(`${__dirname}/../../wasms/tree-sitter-${language}.wasm`);

	await Parser.init();
	const lang = await Parser.Language.load(wasmPath);
	const parser = new Parser();
	parser.setLanguage(lang);

	return parser;
}

/**
 * Editing abstracted syntax tree based on code changes
 * @param before Prechanged source code
 * @param after Changed source code
 * @param tree Target tree
 */
function editTree(before: string, after: string, tree: Parser.Tree) {
	let changes: DiffChange[] = [];
	if (before.split('\n').length > 1 || before.split('\n').length) {
		changes = diffChars(before, after);
	} else {
		changes = diffLines(before, after);
	}
	let oldIndex = 0;
	for (const change of changes) {
		if (change.count === undefined){
			continue;
		}
		if (change.added) {
			tree.edit({
				startIndex: oldIndex,
				oldEndIndex: oldIndex,
				newEndIndex: oldIndex + change.count,
				startPosition: {row: 0, column: 0 },
				oldEndPosition: {row: 0, column: oldIndex },
				newEndPosition: {row: 0, column: oldIndex + change.count },
			});
			oldIndex += change.count;
		} else if (change.removed) {
			tree.edit({
				startIndex: oldIndex,
				oldEndIndex: oldIndex + change.count,
				newEndIndex: oldIndex,
				startPosition: {row: 0, column: 0 },
				oldEndPosition: {row: 0, column: oldIndex + change.count },
				newEndPosition: {row: 0, column: oldIndex },
			});
		} else{
			oldIndex += change.count;
		}
	}
	return tree;
}

/**
 * Choose the parser from language names
 * @param langName programming language name or scope
 */
function langName2Parser(langName: string) {
	const lowerLang = langName.toLowerCase();
	switch (lowerLang) {
		case 'c':
			return 'c';
		case 'source.c':
			return 'c';
		case 'cpp':
			return 'cpp';
		case 'source.cpp':
			return 'cpp';
		case 'go':
			return 'go';
		case 'source.go':
			return 'go';
		case 'java':
			return 'java';
		case 'source.java':
			return 'java';
		case 'javascript':
			return 'javascript';
		case 'source.js':
			return 'javascript';
		case 'python':
			return 'python';
		case 'source.python':
			return 'python';
		case 'ruby':
			return 'ruby';
		case 'source.ruby':
			return 'ruby';
		case 'rust':
			return 'rust';
		case 'source.rust':
			return 'rust';
		case 'typescript':
			return 'typescript';
		case 'source.ts':
			return 'typescript';
		default:
			throw new Error(`Language "${langName}" is unavailable`);
	}
}