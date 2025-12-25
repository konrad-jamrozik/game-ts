---
name: Add dependency-cruiser with codified rules
overview: Install dependency-cruiser, create a configuration file that codifies all dependency rules from about_code_dependencies.md, add a script to package.json, and include it in the check command.
todos:
  - id: install-depcruise
    content: Add dependency-cruiser as dev dependency to web/package.json
    status: completed
  - id: create-config
    content: Create web/.dependency-cruiser.js configuration file with all rules from about_code_dependencies.md
    status: completed
  - id: add-script
    content: Add 'depcruise' script to web/package.json
    status: completed
  - id: update-check
    content: Add depcruise command to 'check' script in web/package.json
    status: completed
---

# Add dependency-cruiser with codified dependency rules

## Overview

This plan adds dependency-cruiser to validate code dependencies according to the rules defined in `docs/design/about_code_dependencies.md`. The tool will be configured to enforce all import rules and integrated into the project's validation workflow.

## Implementation Steps

### 1. Install dependency-cruiser

Add `dependency-cruiser` as a dev dependency in `web/package.json`.

### 2. Create dependency-cruiser configuration

Create `web/.dependency-cruiser.js` (or `.dependency-cruiser.json`) that codifies all rules from `docs/design/about_code_dependencies.md`:

#### 2.1 General Rules

- **No circular dependencies**: Use dependency-cruiser's built-in circular dependency detection
- **External dependency restrictions**:
- `web/src/lib/**` cannot import `react` or `@mui/*`
- Only `web/src/redux/**` can import `@reduxjs/*`

#### 2.2 Directory Import Rules

Translate the mermaid diagrams into dependency-cruiser rules:**Main src/ directory rules:**

- `web/src/main.tsx` can import from `components/App.tsx`, `components/styling/theme.tsx`, `components/Error`, `redux/store.ts`
- `components/styling/theme.tsx` can import from `components/styling`
- `components/App.tsx` and `components/Error` can import from `components/*`
- `components/*` can import from `redux/hooks.ts`, `redux/selectors`, `components/styling/theme.tsx`, `lib/game_utils`
- `components/styling` can import from `lib/model`
- `redux/store.ts` can import from `redux/eventsMiddleware.ts`
- `redux/eventsMiddleware.ts` can import from `redux/slices`
- `redux/slices` can import from `redux/reducers`
- `redux/reducers` can import from `lib/game_utils`
- `redux/hooks.ts` and `redux/selectors` can import from `redux/store.ts`
- `lib/game_utils` can import from `lib/factories`
- `lib/factories` can import from `lib/ruleset`
- `lib/ruleset` can import from `lib/model_utils`
- `lib/model_utils` can import from `lib/data_tables`
- `lib/data_tables` can import from `lib/model`
- `lib/model` can import from `lib/primitives`

**Redux directory rules:**

- `components/*` can import from `redux/hooks.ts` and `redux/selectors`
- `redux/store.ts` can import from `redux/rootReducer.ts`, `redux/eventsMiddleware.ts`, `redux/persist.ts`
- `redux/persist.ts` can import from `redux/rootReducer.ts`
- `redux/eventsMiddleware.ts` can import from `redux/rootReducer.ts`, `redux/reducer_utils`
- `redux/rootReducer.ts` can import from `redux/slices`, `redux/reducer_utils`
- `redux/slices` can import from `redux/reducers`
- `redux/reducers` can import from `redux/reducer_utils`, `lib/game_utils`
- `redux/reducer_utils` can import from `lib/model`
- `redux/slices` can import from `lib/game_utils`
- `redux/hooks.ts` can import from `redux/store.ts`, `redux/rootReducer.ts`
- `redux/selectors` can import from `redux/rootReducer.ts`

**Primitives directory rules:**

- `lib/primitives/assertPrimitives.ts` can import from `lib/primitives/mathPrimitives.ts`
- `lib/primitives/fixed6.ts` can import from `lib/primitives/assertPrimitives.ts`, `lib/primitives/mathPrimitives.ts`, `lib/primitives/formatPrimitives.ts`
- `lib/primitives/formatPrimitives.ts` can import from `lib/primitives/mathPrimitives.ts`
- `lib/primitives/rand.ts` can import from `lib/primitives/assertPrimitives.ts`
- `lib/primitives/stringPrimitives.ts` can import from `lib/primitives/assertPrimitives.ts`
- `lib/primitives/rolls.ts` can import from `lib/primitives/assertPrimitives.ts`, `lib/primitives/fixed6.ts`, `lib/primitives/formatPrimitives.ts`, `lib/primitives/mathPrimitives.ts`, `lib/primitives/rand.ts`

#### 2.3 Test Directory Rules

- `web/test/**` can import from `web/src/**` following the same rules as `web/src/**`

### 3. Add npm script

Add a `depcruise` script to `web/package.json`:

```json
"depcruise": "depcruise src test --config .dependency-cruiser.js"
```



### 4. Update check script

Modify the `check` script in `web/package.json` to include the dependency-cruiser validation:

```json
"check": "npm run format && npm run oxlint && npm run eslint:cached && npm run depcruise && npm run build && npm run test:all"
```



## Files to Modify

- `web/package.json`: Add dependency and scripts
- `web/.dependency-cruiser.js`: New configuration file (or `.dependency-cruiser.json`)

## Notes

- The configuration will use dependency-cruiser's `forbidden` rules to enforce restrictions
- Path patterns will use regex to match directory structures