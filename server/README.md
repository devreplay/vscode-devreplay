# DevReplay Language Server

## Editor Support

* [x] Visual Studio Code
* [ ] Atom
* [ ] Sublime Text
* [ ] Vim/NeoVim
* [ ] Emacs

### Visual Studio Code

DevReplay for VS Code is available [here]((https://marketplace.visualstudio.com/items?itemName=Ikuyadeu.devreplay))

<!-- ### Atom

### Sublime Text

### vim and neovim
Use [coc-tslint-plugin](https://github.com/neoclide/coc-tslint-plugin) as extension of [coc.nvim](https://github.com/neoclide/coc.nvim).

Run command in your vim after coc.nvim installed:

```
:CocInstall coc-tsserver coc-tslint-plugin
```

Run command `:CocConfig` to open configuration file.
```vim
let g:LanguageClient_serverCommands = {
    \ 'r': ['R', '--slave', '-e', 'languageserver::run()'],
    \ }
```

or use [coc-r-lsp](https://github.com/neoclide/coc-r-lsp) with [coc.nvim](https://github.com/neoclide/coc.nvim)


### Emacs
```elisp
(lsp-register-client
    (make-lsp-client :new-connection
        (lsp-stdio-connection '("R" "--slave" "-e" "languageserver::run()"))
        :major-modes '(ess-r-mode inferior-ess-r-mode)
        :server-id 'lsp-R))
``` -->