# DevReplay Language Server

### Installing

```
npm install -g devreplay-server
```


### Running the Language server

```
devreplay-server --studio
```



## Editor Extension Support

* [x] Visual Studio Code
* [ ] Atom
* [ ] Sublime Text
* [ ] Vim/NeoVim
* [ ] Emacs

### Visual Studio Code

DevReplay for VS Code is available [here]((https://marketplace.visualstudio.com/items?itemName=Ikuyadeu.devreplay))


### Atom IDE

* [Progress](https://github.com/Ikuyadeu/devreplay-atom)

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

### vim and neovim

1. Install `devreplay-server`
2. Install [LanguageClient-neovim](https://github.com/autozimu/LanguageClient-neovim/blob/next/INSTALL.md)
3. Add the following to neovim's configuration (the case if you want to use for python and javascript)

```vim
let g:LanguageClient_serverCommands = {
    \ 'python': ['devreplay-server', '--stdio'],
    \ 'javascript': ['devreplay-server', '--stdio'],
    \ }
```

### Emacs

[lsp-mode](https://github.com/emacs-lsp/lsp-mode) (untested)
