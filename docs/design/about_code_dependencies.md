# About code dependencies

This document explains what are the code dependencies rules, i.e. rules about
which files can `import` which symbols from other files.

# Assumptions made in this document

> [!IMPORTANT]
> Assume that current directory for this document purposes is `web/`

# General import rules

- No import cycles are allowed.
- Any code in this codebase can import external code, unless explicitly stated otherwise.
- By default, code in files being directly in any given directory `dir`:
  - Can import `external code`, referenced in `package.json`.
  - Can import any other code from the same directory and all its subdirectories.
  - Cannot import any code from other directories than itself.
- However, each subdirectory may have more restrictive rules applied to it than the default rules.
- The rules for deeper directory take precedence over the rules for shallower directories.

# Import rules for the test directory

Code in `test/` directory can import code in `src/` directory, following the import rules
of the `src/` directory. This means that:

- If `src/foo` can depend on `src/bar`, then `test` for `foo` can import both `src/foo` and `src/bar`.
- If `src/foo` can not depend on `src/qux`, then `test` for `foo` can not import `src/qux`.

# Directory import rules

We define the notation `foo -> bar` as denoting a rule that means that code in `foo/` can import code from `bar/`,
as well as any other code that `bar/` can import.

This is in addition to the general import rules listed above.

Directory import rules for dirs in `app/` dir:

``` text
app              -> components
components       -> lib
lib/collections  -> lib/model
lib/model        -> lib/domain_utils
lib/domain_utils -> lib/ruleset
lib/ruleset      -> lib/utils
lib/utils        -> lib/primitives
```
