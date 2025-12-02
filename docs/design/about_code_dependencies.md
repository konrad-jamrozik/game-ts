# About code dependencies

This document explains what are the code dependencies rules, i.e. rules about
which files can `import` which symbols from other files.

# Assumptions made in this document

> [!IMPORTANT]
> Assume that current directory for this document purposes is `web/`

# General import rules

- No import cycles are allowed.
- Any code in this codebase can import external code, unless explicitly stated otherwise.
- The code in `src/lib/` can not depend on `react` nor `@mui` external code.
- Only code in `src/redux/` can depend on `@reduxjs` external code.
- By default, code in files being directly in any given directory `dir`:
  - Can import `external code`, referenced in `package.json`.
  - Can import any other code from the same directory and all its subdirectories.
  - Cannot import any code from other directories than itself, unless state otherwise by other rules.
- Defaults can be overridden by more rules for specific directories.

# Import rules for the test directory

Code in `test/` directory can import code in `src/` directory, following the import rules
of the `src/` directory. This means that:

- If `src/foo` can depend on `src/bar`, then `test` for `foo` can import both `src/foo` and `src/bar`.
- If `src/foo` can not depend on `src/qux`, then `test` for `foo` can not import `src/qux`.

# Directory import rules

The diagram below defines the directory import rules for the codebase.

An entry `Foo --> Bar` means that directory or file `Foo` can depend on directory or file `Bar`
and on all directories or files on which `Bar` can depend, recursively.

As such:
- The first listed directory can depend on all other listed directories.
- The last listed directory can not depend on any other listed directories.

Directory import rules for dirs in `src/` dir:

```mermaid
graph TD
    IndexH[index.html] --> MainTs[main.tsx]

    subgraph components
        CompApp[comp/App.tsx]
        CompTheme[comp/styling/theme.tsx]
        CompErr[comp/Error]
        Comp__[comp/*]
        CompSt[comp/styling]
    end

    subgraph redux
        RdxStore[rdx/store.ts]
        RdxPers[rdx/persist.ts]
        RdxRedu[rdx/rootReducer.ts]
        RdxEvt[rdx/eventsMiddleware.ts]
        RdxRed[rdx/reducers]
        RdxRedUtils[rdx/reducer_utils]
        RdxSli[rdx/slices]
        RdxHook[rdx/hooks.ts]
        RdxSel[rdx/selectors]
    end

    subgraph lib
        LibGam[lib/game_utils]
        LibRul[lib/ruleset]
        LibMUt[lib/model_utils]
        LibCol[lib/collections]
        LibMod[lib/model]
        LibUti[lib/utils]
        LibPri[lib/primitives]
    end

    MainTs --> CompApp
    MainTs --> CompTheme
    MainTs --> CompErr
    MainTs --> RdxStore
    CompTheme --> CompSt
    CompApp --> Comp__
    CompErr --> Comp__
    Comp__ --> RdxHook
    Comp__ --> RdxSel
    Comp__ --> CompTheme
    Comp__ --> LibGam
    CompSt --> LibMod
    RdxStore --> RdxRedu
    RdxStore --> RdxEvt
    RdxStore --> RdxPers
    RdxPers --> RdxRedu
    RdxEvt --> RdxRedu
    RdxEvt --> RdxRed
    RdxEvt --> RdxRedUtils
    RdxRedu --> RdxRed
    RdxRedu --> RdxSli
    RdxRedu --> RdxRedUtils
    RdxSli --> RdxRed
    RdxRed --> RdxRedUtils
    RdxRed --> LibGam
    RdxRedUtils --> LibMod
    RdxSli --> LibGam
    RdxHook --> RdxStore
    RdxHook --> RdxRedu
    RdxSel --> RdxRedu
    LibGam --> LibRul
    LibRul --> LibMUt
    LibMUt --> LibCol
    LibCol --> LibMod
    LibMod --> LibUti
    LibUti --> LibPri
```

# See also

- [About top-level app initialization](about_top_level_app_init.md)
