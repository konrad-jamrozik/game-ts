# About VS Code

# Initial setup

- `.vscode/extensions.json`: Recommended extensions for the workspace.
- `.vscode/settings.json`: Workspace settings, such as editor configurations and file associations.
- `launch.json`: Debugging configurations.
- `tasks.json`: Task runner configurations.
  
MCP and other AI tools:

- `.vscode/mcp.json`: Model Context Protocol (MCP) server configurations for Copilots.
- `github/copilot-instructions.json`: Custom instructions for GitHub Copilot.
- `.github/instructions/*.instructions.md`: Domain-specific custom instructions for GitHub Copilot.

Reference:

- Overall:
  https://code.visualstudio.com/docs/copilot/overview
- Custom instructions:
  https://code.visualstudio.com/docs/copilot/copilot-customization
- MCP:
  https://code.visualstudio.com/docs/copilot/overview#_extend-chat-with-tools  
  https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot

# Clearing VS Code cache

First, close all VS Code instances.

``` powershell
cd "$env:AppData\Code"
rm -Recurse -Force .\Cache\
rm -Recurse -Force .\CachedData\
```

# Tips & tricks

- VS Code treats some JSON files as JSON with comments (`jsonc`) via the `files.associations` setting:
  https://code.visualstudio.com/docs/languages/json#_json-with-comments

# Troubleshooting

## Markdown `Open Preview to the Side` fails with `Error loading webview:`

If the command `Markdown: Open Preview to the Side` from the `bierner.markdown-preview-github-styles` extension
fails with the following error:

``` text
Error loading webview: Error: Could not register service worker: InvalidStateError: Failed to register a ServiceWorker: The document is in an invalid state.
```

then clear VS Code cache [as described in docs/setup/about_vscode.md](about_vscode.md#clearing-vs-code-cache).

## Markdown "Open Preview to the Side" is formatted badly

Ensure these extensions are not installed and restart VS Code:

``` text
docsmsft.docs-markdown
docsmsft.docs-preview
```
