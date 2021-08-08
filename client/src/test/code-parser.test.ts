// Frequently failed due to the illegal invocation
// Link: https://github.com/tree-sitter/node-tree-sitter/issues/53
import { strDiff2treeDiff, Change, tokenize, makeParser } from '../rule-maker/code-parser';
import * as assert from 'assert';

test('Test parser', async () => {
	const parser = await makeParser('JavaScript');
	if (parser === undefined) {
		return;
	}
	const sourceCode = '\'hello\''; 

	const tree = parser.parse(sourceCode);

	assert.strictEqual(tree.rootNode.text, sourceCode);
});

test('Test parser2', async () => {
	const parser = await makeParser('JavaScript');
	if (parser === undefined) {
		return;
	}
	const sourceCode = '0'; 

	const tree = parser.parse(sourceCode);
	assert.strictEqual(tree.rootNode.toString(), '(program (expression_statement (number)))');

	assert.strictEqual(tree.rootNode.text, sourceCode);
});

test('Test rule maker', () => {
	const before = 'for (let i = 0;i < arr.length;i++) foo(arr[i])';
	const after = 'for (let i = 0;i < arr.length;i++) { foo(arr[i]) }';
	const beforeRegex = 'for \\(let (?<i>.+) = 0;\\k<i> < (?<arr>.+).length;\\k<i>\\+\\+\\) (.*)\\(\\k<arr>\\[\\k<i>\\]\\)';
	const afterRegex = 'for (let $1 = 0;$1 < $2.length;i++) { $3($2[$1]) }';
    
	assert.notStrictEqual(before, after);
	assert.notStrictEqual(afterRegex, beforeRegex);
});


test('Test tokenizer', async () => {
	const sourceCode = 'a * b + c / d';        
	const expectedTokens: string[] = sourceCode.split(' ');
	const tokens = await tokenize(sourceCode, 'JavaScript');
	assert.deepStrictEqual(tokens.map(x => x.text), expectedTokens);
});

test('Test tokenizer2', async () => {
	const sourceCode = 'abc+cde';        
	const expectedTokens: string[] = ['abc', '+', 'cde'];
	const tokens = await tokenize(sourceCode, 'JavaScript');
	assert.deepStrictEqual(tokens.map(x => x.text), expectedTokens);
});


test('Test javascript if statement', async () => {
	const sourceCode = 'if (a == 0)';        
	const newSourceCode = 'if (a == 0 && b == 1)';
	const expectedChange: Change = {
		before: ['a == 0'],
		after: ['a == 0 && b == 1']
	};
	assert.deepStrictEqual(await strDiff2treeDiff(sourceCode, newSourceCode, 'JavaScript'), expectedChange);
});


test('Test java plus statement', async () => { 
	const sourceCode = 'abcdefg + hij';        
	const newSourceCode = 'abc + defg + hij';
	const expectedChange = {
		before: ['abcdefg'],
		after: ['abc + defg']
	};

	assert.deepStrictEqual(await strDiff2treeDiff(sourceCode, newSourceCode, 'Java'), expectedChange);
});

test('Test javascript tokens', async () => {
	const sourceCode = 'print(\'hello\')'; 
	const expectedTokens: string[] = ['print', '(', '\'hello\'', ')'];
	const expectedTypes: string[] = ['identifier', '(', 'string', ')'];

	const tokens = await tokenize(sourceCode, 'JavaScript');

	assert.deepStrictEqual(tokens.map(x => x.text), expectedTokens);
	assert.deepStrictEqual(tokens.map(x => x.type), expectedTypes);

});

test('Test javascript tokens2', async () => {
	const sourceCode = 'var a = abc+0+\'hello\'+0'; 
	const expectedTokens: string[] = ['var', 'a', '=', 'abc', '+', '0', '+', '\'hello\'', '+', '0'];
	const expectedTypes: string[] = ['var', 'identifier', '=', 'identifier', '+', 'number', '+', 'string', '+', 'number'];

	const tokens = await tokenize(sourceCode, 'JavaScript');

	assert.deepStrictEqual(tokens.map(x => x.text), expectedTokens);
	assert.deepStrictEqual(tokens.map(x => x.type), expectedTypes); 
});


test('Test Python exchange statement', async () => {
	const sourceCode = [
		'tmp = b',
		'b = a',
		'a = tmp'
	].join('\n');
	const expectedTokens = [
		'tmp', '=', 'b',
		'b', '=', 'a',
		'a', '=', 'tmp'];
	const tokens = await tokenize(sourceCode, 'Python');
	assert.deepStrictEqual(tokens.map(x => x.text), expectedTokens);
});

test('Test Python exchange statement2', async () => { 
	const sourceCode = [
		'tmp = b',
		'b = a',
		'a = tmp'
	].join('\n');
	const newSourceCode = 'a, b = b, a';
	const expectedChange = {
		before: [
			'tmp = b',
			'b = a',
			'a = tmp'
		],
		after: ['a, b = b, a']
	};
	const result = await strDiff2treeDiff(sourceCode, newSourceCode, 'Python');

	assert.deepStrictEqual(result, expectedChange);
});