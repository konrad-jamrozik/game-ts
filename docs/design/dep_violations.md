# Dependency Violations

This document lists violations of the dependency constraints defined in `about_code_dependencies.md`.

## Violations

### lib/selectors importing from app

**File**: `web/src/lib/selectors/selectors.ts`

**Violation**: Imports `RootState` from `../../app/store`

**Rule violated**: The special rule states `lib/selectors --> lib/model`, meaning `lib/selectors` can only import from `lib/model` and directories below it in the hierarchy. The `app` directory is not below `lib/model` in the dependency hierarchy, so this import violates the constraint.

**Line**: Line 2
```typescript
import type { RootState } from '../../redux/store'
```

**Fix**: `RootState` should be moved to a location that `lib/selectors` can access (e.g., `lib/model` or a shared types location), or the selector should be refactored to not depend on `RootState`.
