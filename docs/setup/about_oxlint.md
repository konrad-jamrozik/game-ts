# Oxlint setup

https://oxc.rs/docs/guide/usage/linter.html

Installed with:

``` bash
npm install --save-dev oxlint
npm install --save-dev eslint-plugin-oxlint
npm install --save-dev tsgolint
npm install --save-dev oxlint-tsgolint
```

Then added `.oxlintrc.json` by migrating with:

```powershell
npx @oxlint/migrate --type-aware
```

Then added `oxlint.configs['flat/all']` to the ESLint config.

# oxlint caveats

## Fix for unicorn/filename-case

https://oxc.rs/docs/guide/usage/linter/rules/unicorn/filename-case.html

After config migration this did not work:

``` json
        "unicorn/filename-case": [
          "error",
          {
            "cases": {
              "camelCase": true,
              "pascalCase": true
            },
           "ignore": ["vite-env.d.ts", "^AI.*"]
          }
        ],
```

I had to change it to (removed array from `ignore` property):

``` json
        "unicorn/filename-case": [
          "error",
          {
            "cases": {
              "camelCase": true,
              "pascalCase": true
            },
            "ignore": "vite-env.d.ts"
          }
        ],
```

## Fix for no-confusing-void-expression

Disabled it as the oxc rule:

https://oxc.rs/docs/guide/usage/linter/rules/typescript/no-confusing-void-expression.html

Does not support the advanced options, triggering false positives:

https://typescript-eslint.io/rules/no-confusing-void-expression/

## Partial fix for busted TypeAware linting

`oxclint --type-aware` just crashes with no output and nonzero exit code when run from terminal.

I discovered I need to install `npm install --save-dev oxlint-tsgolint` which I learned
after installing `oxc` vscode extension and looking into its Output logs - it told me this is missing.

However, the extension still doesn't seem to be able to find it, because it is in `web/node_modules` and not `node_modules`.
ESLint extension config allows specifying workspace dir, but apparently this doesn't work for the extension.

## Fix for default-case

type-aware oxlint correctly identifies when `switch` doesn't need `default` case.
But I managed to make oxlint be type-aware only with `npm run oxlint`, not with VS Code extension.

Hence I had to disable `default-case` rule both for ESLint and oxlint.
