# DevReplay Language Server

## Editor Support

* [x] Visual Studio Code
* [ ] Atom
* [ ] Sublime Text
* [x] Vim/NeoVim
* [ ] Emacs

### Install

```
npm install -g devreplay-server
```

### Visual Studio Code

DevReplay for VS Code is available [here]((https://marketplace.visualstudio.com/items?itemName=Ikuyadeu.devreplay))

### vim and neovim

1. Install `devreplay-server`
2. Install [LanguageClient-neovim](https://github.com/autozimu/LanguageClient-neovim/blob/next/INSTALL.md)
3. Add the following to neovim's configuration (the case if you want to use for python and javascript)

```vim
let g:LanguageClient_serverCommands = {
    \ 'python': ['devreplay-server', '--studio'],
    \ 'javascript': ['devreplay-server', '--studio'],
    \ }
```

### Atom IDE

* TODO

### Sublime Text

[LSP](https://github.com/tomv564/LSP) (untested)

```json
"devreplaysvr": {
    "command": [
        "devreplay-server",
        "--studio",
    ],
    "enabled": true,
    "languageId": "python"
}
```

### Emacs

[lsp-mode](https://github.com/emacs-lsp/lsp-mode) (untested)
