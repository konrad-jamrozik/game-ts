---
name: Replace tsc with tsgo
overview: Install @typescript/native-preview and replace tsc commands with tsgo. As of December 2025, tsgo now supports --build mode and project references, making this a straightforward replacement.
todos:
  - id: install-tsgo
    content: Install @typescript/native-preview as a dev dependency in web/package.json
    status: pending
  - id: update-tsc-script
    content: Update the 'tsc' script in web/package.json to use 'tsgo --build' instead of 'tsc --build'
    status: pending
    dependencies:
      - install-tsgo
  - id: update-build-script
    content: Update the 'build' script in web/package.json to use 'npm run tsc' instead of calling 'tsc --build' directly
    status: pending
    dependencies:
      - update-tsc-script
---

# Replace tsc with tsgo

## Overview

Replace the TypeScript compiler (`tsc`) with the native TypeScript compiler (`tsgo`) from `@typescript/native-preview`. As of December 2025, `tsgo` now supports `--build` mode, project references, and `--incremental`, making this a straightforward drop-in replacement with significant performance improvements (up to 10x faster).

## Current State

The project currently uses:

- `tsc --build` in `web/package.json` scripts to type-check using project references
- TypeScript project references: `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`
- Both referenced projects have `"composite": true` enabled

## Changes Required

### 1. Install @typescript/native-preview

Add `@typescript/native-preview` as a dev dependency in [web/package.json](web/package.json).

### 2. Update npm scripts in package.json

Replace `tsc --build` with `tsgo --build` (or `tsgo -b`):

- **Current `tsc` script**: `"tsc": "tsc --build"`
- **New `tsc` script**: `"tsc": "tsgo --build"` (or `"tsc": "tsgo -b"`)
- **Current `build` script**: `"build": "tsc --build && vite build"` (calls `tsc` directly)
- **New `build` script**: `"build": "npm run tsc && vite build"` (uses the updated `tsc` script)

The `qcheck` script already uses `npm run tsc`, so it will automatically use the updated script.**Note**: According to the [December 2025 blog post](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/), `tsgo` now fully supports `--build` mode, project references, and `--incremental`, so this is a direct replacement with no workarounds needed.

### 3. Update CI/CD workflow (if needed)

The [.github/workflows/web_gh_pages_CICD.yml](.github/workflows/web_gh_pages_CICD.yml) workflow runs `npm run build`, which will automatically use the updated scripts. No changes needed.

## Limitations and Considerations

According to the [December 2025 blog post](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/):**Now Supported:**

- `--build` mode is fully supported
- Project references are fully supported
- `--incremental` is fully supported
- Type-checking is very nearly complete (only 74 known incomplete cases out of ~6,000 error-producing test cases)

**Still Missing (but not relevant for this project):**

- Declaration emit (`--declaration`) is not supported (not used in this project since `noEmit: true`)
- Some downlevel emit targets are limited (not relevant since `noEmit: true`)

**Performance Benefits:**

- Up to 10x faster than TypeScript 5.9/6.0
- Parallel builds for multiple projects
- Faster incremental builds

## Testing

After implementation:

1. Run `npm run tsc` to verify type-checking works
2. Run `npm run build` to ensure the full build process works
3. Run `npm run qcheck` to verify the complete check suite works