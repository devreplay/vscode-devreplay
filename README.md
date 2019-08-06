# DevReplay for Visual Studio Code

A Visual Studio Code extension with support devreplay thas will suggest source code fix based on rule file.
It is from [devreplay](https://www.npmjs.com/package/devreplay)
GitHub bot version is [here](https://github.com/apps/dev-avatar)

## Quick start

1. Create your own programming style(`./devreplay.json`) on the root like bellow
```json
[
    {
        "condition": [
            "for $0 in xrange($1.$2):"
        ],
        "consequent": [
            "import six",
            "for $0 in six.moves.range($1.$2):"
        ],
    }
]
```
This mean if your code has `xrange`, it should be `six.moves.range`

And create your code like this.
```python
for a in xrange(array.x):
    pass
```

2. Edit a your vscode settings' `devreplay.ruleFile` to `devreplay.json`
3. Run by `F1` + `Run DevReplay` or `F1` + `Fix by DevReplay`

It will be change
```python
import six
for a in six.moves.range(array.x):
    pass
```

* (Option) [Review Pattern Generator](https://github.com/Ikuyadeu/review_pattern_gen) can generate your rule automatically

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `devreplay.ruleFile`: Programming style rule File for this extension

## Supported Language

* TypeScript
* JavaScript
* Ruby
* Java

## Thanks

This package is made based on
* [vscode-tslint](https://github.com/microsoft/vscode-tslint)

We would like to thank the Support Center for Advanced Telecommunications (SCAT) Technology Research, Foundation.
This system was supported by JSPS KAKENHI Grant Numbers JP18H03222, JP17H00731, JP15H02683, and JP18KT0013.
