# Vitest Projects Implementation Plan

## Overview

This plan outlines the implementation for splitting the test suite into two Vitest projects and handling slow tests based on the `RUN_ALL_TESTS` environment variable.

## Goals

1. **Split tests into two projects:**
   - **Pure TypeScript tests** (`.test.ts` files) - No React, no jsdom environment needed
   - **React component tests** (`.test.tsx` files) - Requires React rendering and jsdom environment

2. **Handle slow tests:**
   - Mark certain tests as "slow" (e.g., all tests in `App.test.tsx`)
   - Exclude slow tests by default
   - Include slow tests when `RUN_ALL_TESTS` environment variable is set

## Implementation Steps

### Step 1: Update Root Vitest Configuration

Update `web/vitest.config.ts` to use Vitest projects:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        name: 'unit',
        test: {
          include: ['test/**/*.test.ts'],
          exclude: ['test/**/*.test.tsx'],
          environment: 'node',
          globals: true,
          setupFiles: './test/setupTests.ts',
          testTimeout: 30_000,
        },
      },
      {
        name: 'react',
        extends: true, // Inherit plugins from root config
        test: {
          include: ['test/**/*.test.tsx'],
          environment: 'jsdom',
          globals: true,
          setupFiles: './test/setupTests.ts',
          testTimeout: 30_000,
          server: {
            deps: {
              inline: ['@mui/x-data-grid'],
            },
          },
        },
      },
    ],
  },
  plugins: [react()], // Move plugins to root level
})
```

### Step 2: Create a Slow Test Helper

Create a utility to conditionally skip tests based on the `RUN_ALL_TESTS` environment variable:

```typescript
// web/test/testUtils.ts
import { test, describe } from 'vitest'

export const slowTest = process.env.RUN_ALL_TESTS ? test : test.skip
export const slowDescribe = process.env.RUN_ALL_TESTS ? describe : describe.skip
```

### Step 3: Update Test Files

#### Mark Slow Tests

Update `App.test.tsx` to use the slow test helpers:

```typescript
import { slowDescribe, slowTest } from './testUtils'

slowDescribe(App, () => {
  slowTest("When 'hire agents' button is pressed, agents counter is incremented from 0 to 1", async () => {
    // existing test implementation
  })

  slowTest("When 'advance turn' button is clicked, the turn advances", async () => {
    // existing test implementation
  })

  slowTest("Given an in-progress game state, when the 'restart game' button is clicked, the game state is reset", async () => {
    // existing test implementation
  })
})
```

#### Keep Fast Tests as Regular Tests

Tests in files like `AgentView.test.ts`, `EventLog.test.tsx`, etc., remain unchanged and run by default.

### Step 4: Update Package.json Scripts

Add specific scripts for different test scenarios:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --project unit",
    "test:react": "vitest --project react",
    "test:all": "RUN_ALL_TESTS=true vitest",
    "test:coverage": "vitest --coverage",
    "test:coverage:all": "RUN_ALL_TESTS=true vitest --coverage"
  }
}
```

### Step 5: Update CI/CD Configuration

Update the GitHub Actions workflow to run all tests including slow ones:

```yaml
- name: Run tests
  run: npm run test:all
  working-directory: web
```

## Benefits

1. **Improved Performance**: Pure TypeScript tests run faster without jsdom overhead
2. **Better Organization**: Clear separation between unit tests and component tests
3. **Flexible Execution**: Can run specific test types or all tests as needed
4. **CI/CD Compatibility**: Ensures all tests run in CI while allowing developers to skip slow tests locally

## Migration Checklist

- [ ] Update `vitest.config.ts` with projects configuration
- [ ] Create `testUtils.ts` with slow test helpers
- [ ] Update `App.test.tsx` to use `slowTest` and `slowDescribe`
- [ ] Update `package.json` with new test scripts
- [ ] Update GitHub Actions workflow to use `test:all`
- [ ] Test all configurations:
  - [ ] `npm run test` (default, skips slow tests)
  - [ ] `npm run test:unit` (only .ts tests)
  - [ ] `npm run test:react` (only .tsx tests)
  - [ ] `npm run test:all` (all tests including slow)
- [ ] Update developer documentation about the new test structure

## Notes

- The `extends: true` option in the react project ensures it inherits the `plugins: [react()]` from the root config
- Both projects share the same `setupFiles` to maintain consistency
- The `inline: ['@mui/x-data-grid']` configuration is only needed for the React tests
- PowerShell users on Windows should use `$env:RUN_ALL_TESTS="true"; npm run test` to set the environment variable
