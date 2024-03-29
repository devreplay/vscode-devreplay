# DevReplay for Visual Studio Code

Suggest source code fix based on your regular expressions.

![howtouse](https://raw.githubusercontent.com/devreplay/vscode-devreplay/master/img/rulemake.gif)

## Quick start

0. Install this extension!
1. Create your own programming pattern(`.devreplay.json`) on the root like bellow

```json
{
  "before": [
    "(?<tmp>.+)\\s*=\\s*(?<a>.+)",
    "\\k<a>\\s*=\\s*(?<b>.+)",
    "\\k<b>\\s*=\\s*\\k<tmp>"
  ],
  "after": [
    "$2, $3 = $3, $2"
  ],
  "isRegex": true
}
```

or You can chose the your programming language and framework.

```json
"python"
```

Following languages and Frameworks are supported.

| Languages  | Frameworks      |
|------------|-----------------|
| C          | Android         |
| CPP        | Angular         |
| Cobol      | chainer2pytouch |
| Dart       | Rails           |
| Java       | React           |
| JavaScript | TensorFlow      |
| PHP        |                 |
| Python     |                 |
| Ruby       |                 |
| TypeScript |                 |
| VS Code    |                 |
| Vue        |                 |

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

the problem display can be custimized by editing `severity` like following.
![howtouse](https://raw.githubusercontent.com/devreplay/vscode-devreplay/master/img/severity.gif)

```json
[
  {
    "before": [
      "(?<tmp>.+)\\s*=\\s*(?<a>.+)",
      "\\k<a>\\s*=\\s*(?<b>.+)",
      "\\k<b>\\s*=\\s*\\k<tmp>"
    ],
    "after": [
      "$2, $3 = $3, $2"
    ],
    "isRegex": true,
    "severity": "error",
    "author": "Yuki",
    "message": "Value exchanging can be one line"
  },
]
```

## Configs

* `devreplay.add.save`: Add rules when a file is saved (default: false)
* `devreplay.rule.size`: Size of max change lines when making rules (default: 1)

## Other Implementation

* [Language Server](https://www.npmjs.com/package/devreplay-server)
* [NPM package](https://www.npmjs.com/package/devreplay)
* [GitHub Actions](https://github.com/devreplay/devreplay#github-actions)

## Contributing

Please check [CONTRIBUTING.md](https://github.com/devreplay/vscode-devreplay/blob/master/CONTRIBUTING.md)

## TODO

* [ ] Add support for other programming languages
* [ ] Add support for other frameworks
* [ ] Add support for regular expression generator using [Regexp preview](https://marketplace.visualstudio.com/items?itemName=LouisWT.regexp-preview)

## Acknowledgements

DevReplay is supported by 2019 Exploratory IT Human Resources Project [The MITOU Program](https://www.ipa.go.jp/jinzai/mitou/portal_index.html).
