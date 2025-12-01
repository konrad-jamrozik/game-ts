# About code dependencies

This document explains what are the code dependencies rules, i.e. rules about
which files can `import` which symbols from other files.

# Assumptions made in this document

> [!IMPORTANT]
> - Assume that current directory for this document purposes is `web/`
> - Assume that `external code` is code referenced in `package.json`.

# Import rules

- No import cycles are allowed.
- Any code in this codebase can import external code, unless explicitly stated otherwise.
- By default, code in any given directory `dir` can import any other code from the same directory and all its subdirectories.
  This may be overridden for more specific rules for its subdirectories.
- Code in following directories cannot import code from any other directories than itself:
  - `src/`
  - `src/lib/`
  - `src/lib/primitives/`
- Code in `src/app/` can also import code from `src/components/` and `src/lib/`.
- Code in `src/components/` can also import code from `src/lib/`.
- Code in `src/lib/model/` can also import code from `src/lib/domain_utils/`, `src/lib/utils/`, and `src/lib/primitives/`.
- Code in `src/lib/domain_utils/` can also import code from `src/lib/utils/` and `src/lib/primitives/`.
- Code in `src/lib/utils/` can also import code from `src/lib/primitives/`.
