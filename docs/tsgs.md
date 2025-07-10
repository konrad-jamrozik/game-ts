# Markdown `Open Preview to the Side` fails with `Error loading webview:`

If the command `Markdown: Open Preview to the Side` from the `bierner.markdown-preview-github-styles` extension
fails with the following error:

``` text
Error loading webview: Error: Could not register service worker: InvalidStateError: Failed to register a ServiceWorker: The document is in an invalid state.
```

then clear VS Code cache [as described in docs/about_vscode.md](about_vscode.md#clearing-vs-code-cache).

# Markdown "Open Preview to the Side" is formatted badly

Ensure these extensions are not installed and restart VS Code:

``` text
docsmsft.docs-markdown
docsmsft.docs-preview
```
