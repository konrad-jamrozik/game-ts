# About code dependencies

- [About code dependencies](#about-code-dependencies)
- [General import rules](#general-import-rules)
- [Import rules for the test directory](#import-rules-for-the-test-directory)
- [Directory import rules](#directory-import-rules)
  - [Redux directory import rules](#redux-directory-import-rules)
  - [Primitives directory import rules](#primitives-directory-import-rules)
- [See also](#see-also)

This document explains what are the code dependencies rules, i.e. rules about
which files can `import` which symbols from other files.

# General import rules

- No import cycles are allowed.
- Any code in this codebase can import external code, unless explicitly stated otherwise.
- The code in `web/src/lib/` can not depend on `react` nor `@mui` external code.
- Only code in `web/src/redux/` can depend on `@reduxjs` external code.
- By default, code in files being directly in any given directory `dir`:
  - Can import `external code`, referenced in `package.json`.
  - Can import any other code from the same directory and all its subdirectories.
  - Cannot import any code from other directories than itself, unless state otherwise by other rules.
- Defaults can be overridden by more rules for specific directories.

# Import rules for the test directory

Code in `web/test/` directory can import code in `web/src/` directory, following the import rules
of the `web/src/` directory. This means that:

- If `web/src/foo` can depend on `web/src/bar`, then `test` for `foo` can import both `web/src/foo` and `web/src/bar`.
- If `web/src/foo` can not depend on `web/src/qux`, then `test` for `foo` can not import `web/src/qux`.

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
    IndexH[web/index.html] --> MainTs[web/src/main.tsx]

    subgraph "web/src/components"
        CompApp[comp/App.tsx]
        CompTheme[comp/styling/theme.tsx]
        CompErr[comp/Error]
        Comp__[comp/*]
        CompSt[comp/styling]
    end

    subgraph "web/src/redux"
        RdxHook[rdx/hooks.ts]
        RdxStore[rdx/store.ts]
        RdxSel[rdx/selectors]
        RdxMid[rdx/eventsMiddleware.ts]
        RdxSli[rdx/slices]
        RdxRed[rdx/reducers]
    end

    subgraph "web/src/lib"
        LibGam[lib/game_utils]
        LibFac[lib/factories]
        LibRul[lib/ruleset]
        LibDataTUtils[lib/data_table_utils]
        LibDataT[lib/data_tables]
        LibMUt[lib/model_utils]
        LibMod[lib/model]
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
    RdxStore --> RdxMid
    RdxMid --> RdxSli
    RdxSli --> RdxRed
    RdxRed --> LibGam
    RdxHook --> RdxStore
    RdxSel --> RdxStore
    LibGam --> LibFac
    LibFac --> LibRul
    LibRul --> LibDataTUtils
    LibDataTUtils --> LibDataT
    LibDataT --> LibMUt
    LibMUt --> LibMod
    LibMod --> LibPri
```

## Redux directory import rules

Detailed dependency rules within the `web/src/redux/` directory:

```mermaid
graph TD
    subgraph "web/src/components"
        Comp[comp/*]
    end

    subgraph "web/src/redux"
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

    subgraph "web/src/lib"
        LibGam[lib/game_utils]
        LibMod[lib/model]
    end

    Comp --> RdxHook
    Comp --> RdxSel
    RdxStore --> RdxRedu
    RdxStore --> RdxEvt
    RdxStore --> RdxPers
    RdxPers --> RdxRedu
    RdxEvt --> RdxRedu
    RdxEvt --> RdxRedUtils
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
```

## Primitives directory import rules

Detailed dependency rules within the `web/src/lib/primitives/` directory:

```mermaid
graph LR
    subgraph "web/src/lib/primitives"
        MathPrim[prim/mathPrimitives.ts]
        AssertPrim[prim/assertPrimitives.ts]
        Fixed6Prim[prim/fixed6.ts]
        FormatPrim[prim/formatPrimitives.ts]
        RandPrim[prim/rand.ts]
        StringPrim[prim/stringPrimitives.ts]
        RollsPrim[prim/rolls.ts]
    end

    AssertPrim --> MathPrim
    Fixed6Prim --> AssertPrim
    Fixed6Prim --> MathPrim
    Fixed6Prim --> FormatPrim
    FormatPrim --> MathPrim
    RandPrim --> AssertPrim
    StringPrim --> AssertPrim
    RollsPrim --> AssertPrim
    RollsPrim --> Fixed6Prim
    RollsPrim --> FormatPrim
    RollsPrim --> MathPrim
    RollsPrim --> RandPrim
```

# See also

- [About top-level app initialization](about_top_level_app_init.md)
- [About game state initialization](about_game_state_init.md)

// KJA1 question: do data_tables need to depend on model? Why?
