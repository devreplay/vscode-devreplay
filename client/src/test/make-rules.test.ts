import { makeRules } from '../rule-maker/makeRules';
import { fixWithRules } from 'devreplay';
import * as assert from 'assert';

test('Test rule maker', async () => {
	const before = 'for (let i = 0;i < arr.length;i++) foo( arr[i] )';
	const after = 'for (const value of arr)) { foo(value) }';
    
	const beforeRegex = 'for\\s*\\(let\\s*i\\s*=\\s*0;i\\s*<\\s*(?<arr>\\w+)\\.length;i\\+\\+\\)\\s*(?<foo>\\w+)\\(\\s*\\k<arr>\\[i\\]\\s*\\)';
	const afterRegex = 'for (const value of $1)) { $2(value) }';
    
	const rule = await makeRules(before, after, 'javascript');
	if (rule === undefined) {
		throw new Error('Rule can not be generated');
	}
	assert.strictEqual(rule.before, beforeRegex);
	assert.strictEqual(rule.after, afterRegex);
	assert.strictEqual(fixWithRules(before, [rule]), after);
});

test('Test rule maker2', async () => {
	const before = 'for (let i = 0;i < arr.length;i++) foo( arr[i] )';
	const after = 'for (let i = 0;i < arr.length;i++) { foo(arr[i]) }';
	const beforeRegex = '(?<foo>\\w+)\\(\\s*(?<arr>\\w+)\\[(?<i>\\w+)\\]\\s*\\)';
	const afterRegex = '{ $1($2[$3]) }';
    
	const rule = await makeRules(before, after, 'javascript');
	if (rule === undefined) {
		throw new Error('Rule can not be generated');
	}
	assert.strictEqual(rule.before, beforeRegex);
	assert.strictEqual(rule.after, afterRegex);
	assert.strictEqual(fixWithRules(before, [rule]), after);
});

test('Test rule maker3', async () => {
	const before = 'for (let i = 0; i < arr.length;i++) { foo(arr[i]) }';
	const after = 'for (let i = 0; i < arr.length;i++) { foo(arr2) }';
	const beforeRegex = 'arr[i]';
	const afterRegex = 'arr2';
    
	const rule = await makeRules(before, after, 'javascript');
	if (rule === undefined) {
		throw new Error('Rule can not be generated');
	}
	assert.strictEqual(rule.before, beforeRegex);
	assert.strictEqual(rule.after, afterRegex);
	assert.strictEqual(fixWithRules(before, [rule]), after);
});

test('Test rule maker4', async () => {
	const before = 'if (t%2 == 0) {';
	const after = 'if (t%2==0&&t!=2) {';
	const beforeRegex = '(?<t>\\w+)%2\\s*==\\s*0';
	const afterRegex = '$1%2==0&&$1!=2';
    
	const rule = await makeRules(before, after, 'javascript');
	if (rule === undefined) {
		throw new Error('Rule can not be generated');
	}
	assert.strictEqual(rule.before, beforeRegex);
	assert.strictEqual(rule.after, afterRegex);
	assert.strictEqual(fixWithRules(before, [rule]), after);
});

test('Test Multiple tokens', async () => {
	const before = [
		'tmp = b',
		'b = a',
		'a = tmp'
	].join('\n');
	const after = 'a, b = b, a';
	const beforeRegex = [
	    'tmp\\s*=\\s*(?<b>\\w+)', 
	    '\\k<b>\\s*=\\s*(?<a>\\w+)',
	    '\\k<a>\\s*=\\s*tmp'];
	const afterRegex = '$1, $2 = $2, $1';
	const rule = await makeRules(before, after, 'javascript');
	if (rule === undefined) {
		throw new Error('Rule can not be generated');
	}
	// assert.strictEqual(rule.before, beforeRegex);
	assert.strictEqual(rule.after, afterRegex);
	assert.strictEqual(fixWithRules(before, [rule]), after);
});