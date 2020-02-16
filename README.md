# DevReplay for Visual Studio Code

A Visual Studio Code extension with that will suggest source code fix based on your own rule file.

* [Other Editors Support (Language Server)](https://www.npmjs.com/package/devreplay-server)
* [Atom (Progress)](https://atom.io/packages/atom-devreplay)
* [Command Line version](https://www.npmjs.com/package/devreplay)
* [GitHub Application](https://github.com/marketplace/dev-replay)
* [Auto pattern generator](https://github.com/devreplay/review_pattern_gen)

![howtouse](img/sample.gif)

## Quick start

0. Install this extension!
1. Create your own programming pattern(`devreplay.json`) on the root like bellow

```json
[
    {
        "condition": [
            "tmp = $1",
            "$1 = $2",
            "$2 = tmp"
        ],
        "consequent": [
            "$1, $2 = $2, $1"
        ]
    },
]
```
or
```json
[
    {
        "extends": ["python"]
    }
]
```
or
Use [Review Pattern Generator](https://github.com/Ikuyadeu/review_pattern_gen) that generate your rule file automatically

If you write the following code,
```python
tmp = a
a = b
b = tmp
```
it will be
```python
a, b = b, a
```


## Supported Language

* CPP
* Dart
* Go
* Java
* JavsScript
* PHP
* Python
* R
* Ruby
* TypeScript
* Plain Text


## Thanks

This package is made based on
* [vscode-tslint](https://github.com/microsoft/vscode-tslint)
* [vscode-eslint](https://github.com/microsoft/vscode-eslint)

DevReplay is supported by 2019 Exploratory IT Human Resources Project <a href="https://www.ipa.go.jp/jinzai/mitou/portal_index.html">The MITOU Program</a>, Support Center for Advanced Telecommunications (SCAT) Technology Research, Foundation, JSPS KAKENHI Grant Numbers JP18H03222, JP17H00731, JP15H02683, and JP18KT0013.