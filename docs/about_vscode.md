# About VS Code

## Initial setup

- `.vscode/extensions.json`: Recommended extensions for the workspace.
- `.vscode/settings.json`: Workspace settings, such as editor configurations and file associations.

🚧 TODO:

- `launch.json`: Debugging configurations.
- `tasks.json`: Task runner configurations.
  
🚧 TODO: MCP and other AI tools:

- https://code.visualstudio.com/docs/copilot/overview
- https://code.visualstudio.com/docs/copilot/overview#_extend-chat-with-tools
- https://code.visualstudio.com/docs/copilot/copilot-customization
- https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot

## Clearing VS Code cache

First, close all VS Code instances.

``` powershell
cd "$env:AppData\Code"
rm -Recurse -Force .\Cache\
rm -Recurse -Force .\CachedData\
```

## Tips & tricks

- VS Code treats some JSON files as JSON with comments via the `files.associations` setting:
  https://code.visualstudio.com/docs/languages/json#_json-with-comments
