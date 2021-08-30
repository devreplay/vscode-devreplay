# DevReplay for Visual Studio Code

A Visual Studio Code extension with that will suggest source code fix based on your regular expressions.

* [Other Editors Support (Language Server)](https://www.npmjs.com/package/devreplay-server)
* [Atom (Progress)](https://atom.io/packages/atom-devreplay)
* [Command Line version](https://www.npmjs.com/package/devreplay)
* [GitHub Application](https://github.com/marketplace/dev-replay)

![howtouse](img/usage.gif)

## Quick start

0. Install this extension!
1. Create your own programming pattern(`.devreplay.json`) on the root like bellow

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
    "isRegex": true
  }
]
```

or You can chose the your programming language and framework.

```json
[
    "python"
]
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

the display messages can be custimized by editing `severity`, `author` and `message` like here
![howtouse](img/DevReplayReplay.gif)

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
        "severity": "Info",
        "author": "Yuki",
        "message": "Value exchanging can be one line"
    },
]
```

## Supported Language

* C/CPP
* Java
* Python
* JavsScript
* TypeScript
* Plain Text

## Contributing

Please check [CONTRIBUTING.md](https://github.com/devreplay/vscode-devreplay/blob/master/CONTRIBUTING.md)

## Acknowledgements

DevReplay is supported by 2019 Exploratory IT Human Resources Project [The MITOU Program](https://www.ipa.go.jp/jinzai/mitou/portal_index.html).
