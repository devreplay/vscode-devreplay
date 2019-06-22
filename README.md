# Devavatar for Visual Studio Code

A Visual Studio Code extension with support devreplay thas will suggest source code fix based on rule file.
It is from [devreplay](https://github.com/Ikuyadeu/devreplay)
GitHub bot version is [here](https://github.com/apps/dev-avatar)

## Quick start

1. Create your own programming style(`./rule.json`) on the root like bellow
```json
[
 {
    "code": [
     "* == --> ==="
    ]
 }
]
```
This mean if your code has `==`, it should be `===`
2. Edit a your vscode `config.json`s' `devavatar.ruleFile` to `rule.json`
3. Run by `F1` + `Run DevAvatar`

* (Option) [Review Pattern Generator](https://github.com/Ikuyadeu/review_pattern_gen) can generate your rule automatically

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `devavatar.ruleFile`: Programming style rule File for this extension

## Supported Language

* TypeScript

## Thanks

This package is made based on
* [vscode-python](https://github.com/Microsoft/vscode-python/blob/master/src/client/language/tokenizer.ts)
* [vscode-textmate](https://github.com/microsoft/vscode-textmate)

We would like to thank the Support Center for Advanced Telecommunications (SCAT) Technology Research, Foundation.
This system was supported by JSPS KAKENHI Grant Numbers JP18H03222, JP17H00731, JP15H02683, and JP18KT0013.
