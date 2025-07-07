# About repository setup

- [About repository setup](#about-repository-setup)
- [Basic setup from scratch](#basic-setup-from-scratch)
  - [License setup](#license-setup)
  - [README setup](#readme-setup)
  - [Markdown files in docs folder](#markdown-files-in-docs-folder)
  - [Web project setup](#web-project-setup)
  - [GitHub CI/CD configuration](#github-cicd-configuration)
  - [Cheatsheets](#cheatsheets)

# Basic setup from scratch

Here is how I set up this repository and dev env from scratch:

1. Installed VS Code on my local OS.
2. Created the repository via GitHub web UI.
3. Cloned the repository locally.
4. Added the basics, and documentation of how the basics were set up:
    ```text
    LICENSE
    README.md
    .gitignore
    .vscode/extensions.json
    .vscode/settings.json
    docs/about_setup_repo.md
    docs/about_vscode.md
    docs/about_misc_tools.md
    docs/about_setup_web.md
    .markdownlint.json
    ```

## License setup

Added `LICENSE` file to have http://creativecommons.org/licenses/by-nc/4.0/.
I chose it by analyzing existing licenses, originally inspired by XCF license,
which is the same.

Then I had to ensure markdownlint is not reporting issues with it -
refer to doc on markdownlint to see how I did it.

See [README setup](#readme-setup) for the license image / badge / button / shield.

## README setup

Added `README.md` with the usual information. The license image / badge / button / shield can be found e.g. at:

- https://github.com/santisoler/cc-licenses/blob/main/README.md#cc-attribution-noncommercial-40-international

Ran `Markdown All in One: Create Table of Contents` action to generate table of contents.
This command comes from the `Markdown All in One` extension, which is recommended in the `.vscode/extensions.json` file.

## Markdown files in docs folder

I wrote various documentation files in the `docs` folder when setting up the repository for the first time.

## Web project setup

I set up the React + TypeScript + Vite web project as described in the [about_setup_web.md](about_setup_web.md) document.

## GitHub CI/CD configuration

🚧TODO🚧 - planning to use GitHub pages per [this chat](https://chatgpt.com/share/686b7522-18b4-8011-93cf-47e77e1ad535).

## Cheatsheets

- https://www.typescriptlang.org/cheatsheets/
- https://github.com/typescript-cheatsheets/react#reacttypescript-cheatsheets
