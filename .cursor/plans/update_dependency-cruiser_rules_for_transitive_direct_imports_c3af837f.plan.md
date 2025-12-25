---
name: Update dependency-cruiser rules for transitive direct imports
overview: Review and update all dependency-cruiser rules to allow direct imports of transitive dependencies, as clarified in about_code_dependencies.md. Each rule needs to be updated to allow not just immediate dependencies, but all transitive dependencies recursively.
todos:
  - id: analyze-transitive-deps
    content: Build complete transitive dependency sets for each file/directory from the mermaid diagrams
    status: completed
  - id: update-main-tsx-rule
    content: Update main.tsx rule to allow all transitive dependencies
    status: completed
  - id: update-store-ts-rule
    content: Update store.ts rule to allow all transitive dependencies (slices, reducers, reducer_utils, lib/game_utils, lib/model)
    status: completed
  - id: update-components-rules
    content: Update all components/* rules to allow transitive dependencies
    status: completed
  - id: update-redux-rules
    content: Update all redux/* rules to allow transitive dependencies
    status: completed
  - id: update-lib-rules
    content: Update all lib/* rules to allow transitive dependencies
    status: completed
  - id: update-primitives-rules
    content: Update primitives rules to allow transitive dependencies
    status: completed
  - id: verify-rules
    content: Verify all rules are correct and don't conflict
    status: completed
---

# Update dependency-cruiser rules for transitive direct imports

## Problem

The current dependency-cruiser rules are too restrictive. According to `about_code_dependencies.md`, when `Foo --> Bar`, it means `Foo` can **directly depend on** anything that `Bar` can depend on, recursively. The current rules only allow immediate dependencies, not transitive ones.

## Analysis Required

For each file/directory in the dependency graph, compute all transitive dependencies:

1. **main.tsx** can directly import:

- App.tsx, theme.tsx, Error, store.ts (explicit)
- All transitive dependencies of those (components/*, hooks.ts, selectors, lib/game_utils, lib/model, etc.)

2. **store.ts** can directly import:

- rootReducer.ts, eventsMiddleware.ts, persist.ts (explicit)
- All transitive: slices, reducers, reducer_utils, lib/game_utils, lib/model

3. **components/App.tsx** can directly import:

- components/*, hooks.ts, selectors, theme.tsx, lib/game_utils (explicit)
- All transitive: store.ts, rootReducer.ts, slices, reducers, reducer_utils, lib/model, lib/factories, etc.

4. **components/* (general)** can directly import:

- hooks.ts, selectors, theme.tsx, lib/game_utils, components/* (explicit)
- All transitive: store.ts, rootReducer.ts, slices, reducers, reducer_utils, lib/model, etc.

5. **lib/game_utils** can directly import:

- lib/factories (explicit)
- All transitive: lib/ruleset, lib/model_utils, lib/data_tables, lib/model, lib/primitives

6. Similar analysis needed for all other files/directories.

## Implementation

1. Build complete transitive dependency sets for each file/directory
2. Update each `forbidden` rule to allow all transitive dependencies
3. Ensure rules don't conflict with each other
4. Test that the rules correctly enforce the dependency graph

## Files to Modify