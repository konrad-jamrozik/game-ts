# About miscellaneous tools

# git and .gitignore configuration

- git config: I needed to have working GitHub profile and config. Not documenting here how I did it,
  but not a rocket science.
- `.gitignore`: I believe I used copilot to generate it for React.

# Markdownlint

Configured via `.markdownlint.jsonc` file in the root directory.
The comment within contains details about the configuration.

## Preventing markdownlint linting given file

To prevent Markdownlint from linting `LICENSE`:  
In VS Code workspace settings `files.associations` set it to "plaintext".

Other options I tried but didn't work:

1. [`markdownlint.lintWorkspace`][1]: Turns out it only works with the specific command,
   not with the background linting.

[1]: https://github.com/DavidAnson/vscode-markdownlint#markdownlintlintworkspaceglobs
