# Contributing

## Install

1. Install npm and Node.js
1. Install Visual Studio Code

```sh
git clone --recursive https://github.com/devreplay/vscode-devreplay.git
cd vscode-devreplay
npm install # install required packages for vscode-devreplay
code . # run VS Code
```

## Test

* In VS Code: 'File' -> 'Open Folder...' and select 'vscode-devreplay' (the directory with your edits)
* Press `F5`
* A new VS Code window should open, with '[Extension Development Host]' in the title bar. This is running your modified version of vscode-devreplay

## Lint

We use [eslint](https://eslint.org/) for linting our sources. You can run eslint across the sources by calling yarn eslint from a terminal or command prompt.

To lint the source as you make changes, you can install the [eslint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

## Pull Request

* Fork it (via GitHub) in your account
* Add your project URL

```sh
git remote add mine https://github.com/yourname/vscode-R.git
```

* Create your feature branch

```sh
git checkout -b my-new-feature
```

* Commit your changes

```sh
git commit -am 'Add some feature'
```

* Push to the branch

```sh
git push mine my-new-feature
```

* Create new Pull Request (via GitHub)
