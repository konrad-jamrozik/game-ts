---
name: Verify dependency-cruiser rules
overview: Compare the dependency-cruiser.js configuration against the rules in about_code_dependencies.md to identify any discrepancies or missing rules.
todos: []
---

# Verify dependency-cruiser.js

against about_code_dependencies.md

## Analysis Approach

I'll systematically compare the dependency-cruiser configuration with the rules defined in `about_code_dependencies.md` to identify:

1. **Missing rules** - Rules in the doc that aren't enforced in dependency-cruiser
2. **Incorrect rules** - Rules that don't match the documented behavior
3. **Overly restrictive rules** - Rules that forbid valid imports
4. **Missing transitive dependency handling** - Whether transitive dependencies are correctly allowed

## Key Areas to Verify

### 1. General Import Rules

- ✅ No circular dependencies (line 5-13) - **CORRECT**
- ✅ lib/ cannot import react or @mui (line 14-26) - **CORRECT**
- ✅ Only redux/ can import @reduxjs (line 27-39) - **CORRECT**

### 2. Component Import Rules

According to the mermaid diagram:

- `components/*` → `redux/hooks.ts`, `redux/selectors`, `components/styling/theme.tsx`, `lib/game_utils`

**ISSUE FOUND**: The `components-general-restrictions` rule (line 102-115) forbids ALL imports from `src/redux` and `src/lib`:

```javascript
pathNot: '^(src/components|src/redux|src/lib)'
```

This means components cannot import from `redux/hooks.ts` or `redux/selectors`, which contradicts the diagram. The rule should explicitly ALLOW these imports.

### 3. Redux Directory Rules

The diagram shows:

- `redux/store.ts` → `redux/rootReducer.ts`, `redux/eventsMiddleware.ts`, `redux/persist.ts`
- `redux/eventsMiddleware.ts` → `redux/rootReducer.ts`, `redux/reducer_utils`
- `redux/slices` → `redux/reducers`
- `redux/reducers` → `redux/reducer_utils`, `lib/game_utils`
- `redux/reducer_utils` → `lib/model`
- `redux/slices` → `lib/game_utils` (also shown in diagram)
- `redux/hooks.ts` → `redux/store.ts`, `redux/rootReducer.ts`
- `redux/selectors` → `redux/rootReducer.ts`

**POTENTIAL ISSUES**:

- The `redux-store-restrictions` rule (line 132-147) uses a complex `pathNot` that might be too restrictive
- Need to verify if `redux/slices` can import from `lib/game_utils` (shown in diagram but not clear in config)

### 4. Lib Directory Rules

The diagram shows a clear chain:

- `lib/game_utils` → `lib/factories` → `lib/ruleset` → `lib/model_utils` → `lib/data_tables` → `lib/model` → `lib/primitives`

The config appears to handle this correctly, but needs verification.

### 5. Primitives Directory Rules

The primitives rules in the config (line 366-464) need to be compared against the mermaid diagram in the doc.

## Next Steps

1. **Fix component import rules** - Allow `components/*` to import from `redux/hooks.ts` and `redux/selectors`
2. **Verify redux/slices → lib/game_utils** - Ensure this is allowed
3. **Check transitive dependencies** - Verify that transitive dependencies are correctly handled (dependency-cruiser may need explicit rules for transitive deps)
4. **Test the configuration** - Run dependency-cruiser to see if it correctly identifies violations

## Questions to Resolve

1. How does dependency-cruiser handle transitive dependencies? Does it automatically allow them, or do we need explicit rules?