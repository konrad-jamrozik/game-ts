# About copilot

## Initial copilot setup

- Added [.github/instructions/mui.instructions.md](../.github/instructions/mui.instructions.md)
  base on [MUI MCP FAQ instructions].
- Added to [.vscode/mcp.json](../.vscode/mcp.json) `mui-mcp` based on [MUI MCP] docs.
- Added [.github/instructions/vitest.instructions.md](../.github/instructions/vitest.instructions.md)
  based on Copilot agent recommendation.
- Added [.github/instructions/copilot-instructions.md](../.github/instructions/copilot-instructions.md)
  by using VSCode June 2025 [copilot instructions wizard][Generate copilot instructions].
  Read about [copilot instructions].
- Added [context7 MCP] based on the [MCP gallery]. Also added relevant line to `copilot-instructions.md`.
  Note: One can also append to Agent chat `#context7`.

[context7 MCP]: https://context7.com/
[copilot instructions]: https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions
[Generate copilot instructions]: https://code.visualstudio.com/docs/copilot/copilot-customization#_generate-an-instructions-file-for-your-workspace
[MCP gallery]: https://code.visualstudio.com/mcp
[MUI MCP FAQ instructions]: https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-it-is-not-being-used-when-i-ask-questions
[MUI MCP]: https://mui.com/material-ui/getting-started/mcp

## Copilot features index

- [Custom instructions](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions)
  - [Global](https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file)
  - [Domain-specific](https://code.visualstudio.com/docs/copilot/copilot-customization#_use-instructionsmd-files)
- [Chat Modes](https://code.visualstudio.com/docs/copilot/chat/chat-modes)
  - Ask, Edit, Agent, Custom
- [Chat participants (@-mentions)](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_atmentions)
  - Workspace, VS Code, terminal
- [Context items (#-mentions)](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_hashmentions)
  - [Files and Directories](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_add-files-as-context)

  - See also: Tools.
- [Tools](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_reference-tools)
  - Built-in tools, see [list of built-in tools](#list-of-built-in-tools)
    - [codebase](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_perform-a-codebase-search)
    - [fetch, githubRepo](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_reference-web-content)
    - [changes, problems, testFailure](https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context#_prompt-examples)
  - [MCP servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
  - [Tool sets](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode?wt.md_id=AZ-MVP-5004796#_define-tool-sets)
  - [Tool approvals](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode?wt.md_id=AZ-MVP-5004796#_manage-tool-approvals)

# List of built-in tools

The only way I found to list the built-in tools is to do the following:

- Open Copilot Chat window.
- In bottom right, select the "Tools /Wrench and SCrewdriver" icon with tooltip of "Configure tools...".
- This will display the list of tools in the top-center search bar.
