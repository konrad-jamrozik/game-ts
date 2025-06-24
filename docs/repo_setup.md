# Table of Contents

- [Table of Contents](#table-of-contents)
- [How the repository was set up](#how-the-repository-was-set-up)
- [Basic setup](#basic-setup)
  - [License setup](#license-setup)
  - [README setup](#readme-setup)
  - [Markdown files in docs folder](#markdown-files-in-docs-folder)
  - [GitHub CI/CD configuration](#github-cicd-configuration)
- [Reference](#reference)
  - [Cheatsheets](#cheatsheets)

# How the repository was set up

# Basic setup

1. Installed VS Code on my local OS.
2. Created the repository via GitHub web UI.
3. Cloned the repository locally.
4. Added the basics:
    ```text
    LICENSE
    .vscode/extensions.json
    .vscode/settings.json
    docs/about_vscode.md
    docs/repo_setup.md
    .markdownlint.json
    README.md
    .gitignore
    ```

## License setup

Added `LICENSE` file to have http://creativecommons.org/licenses/by-nc/4.0/.
I chose it by analyzing existing licenses, originally inspired by XCF license,
which is the same.

Then I had to ensure markdownlint is not reporting issues with it -
refer to doc on markdownlint to see how I did it.

## README setup

Added `README.md` with the usual information.

## Markdown files in docs folder

I wrote various documentation files in the `docs` folder when setting up the repository for the first time.

Most notably, ran `Markdown All in One: Create Table of Contents` action to generate table of contents.
This command comes from the `Markdown All in One` extension, which is recommended in the `.vscode/extensions.json` file.

## GitHub CI/CD configuration

🚧TODO🚧

# Reference

- https://chatgpt.com/c/684e85cf-dc74-8011-ae8b-18e5d8a16be4
- https://github.com/konrad-jamrozik/game/blob/main/docs/web_frontend_setup.md
- https://github.com/konrad-jamrozik/game-python/blob/main/web/README.md
- https://github.com/konrad-jamrozik/game-python/blob/main/web/README_web.md

## Cheatsheets

- https://www.typescriptlang.org/cheatsheets/
- https://github.com/typescript-cheatsheets/react#reacttypescript-cheatsheets
