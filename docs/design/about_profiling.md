# Profiling Guide

- [Profiling Guide](#profiling-guide)
- [How to Profile](#how-to-profile)
  - [Reading the Flamegraph](#reading-the-flamegraph)
- [How to Make Functions Profilable](#how-to-make-functions-profilable)
  - [What Shows Names vs `(anonymous)`](#what-shows-names-vs-anonymous)
  - [Instead of Arrow Functions, Use Named Function Expressions](#instead-of-arrow-functions-use-named-function-expressions)
  - [Instead of Inline Object Methods, Define Functions First](#instead-of-inline-object-methods-define-functions-first)
  - [Common Patterns That Hide Function Names](#common-patterns-that-hide-function-names)
  - [Quick Reference](#quick-reference)
- [Possible Alternative Approaches](#possible-alternative-approaches)
  - [Vitest Browser Mode](#vitest-browser-mode)
- [Rejected Approaches](#rejected-approaches)
  - [Profiling Vitest Tests with Browser DevTools](#profiling-vitest-tests-with-browser-devtools)
  - [Standalone HTML Test Runner](#standalone-html-test-runner)
- [Profiling Learnings](#profiling-learnings)
- [Appendix: Profiler Class](#appendix-profiler-class)

# How to Profile

The profiling script (`web/scripts/profileAi.ts`) runs the AI player for 200 turns without Vitest overhead, enabling accurate CPU profiling.

1. **Run the profiling script**:

   ```powershell
   cd web
   npx tsx --cpu-prof scripts/profileAi.ts
   # With more precise profiling interval
   npx tsx --cpu-prof --cpu-prof-interval=100 scripts/profileAi.ts
   ```

   This creates `.cpuprofile` files in the `web` folder (e.g., `CPU.20251231.014747.3076.0.001.cpuprofile`).

2. **Load the profile in Chrome DevTools**:
   - Open Chrome and navigate to any page (even `about:blank`)
   - Open DevTools (F12 or Ctrl+Shift+I)
   - Go to the **Performance** tab
   - Click the **↑ Upload** button (or drag-drop the `.cpuprofile` file)

3. **Analyze** using the Bottom-Up, Call Tree, or Flame Chart views.

## Reading the Flamegraph

In Chrome DevTools Performance tab after loading a `.cpuprofile`:

1. **Bottom-Up view**: Shows which functions took the most total time (start here!)
2. **Call Tree view**: Shows the call hierarchy with time breakdown
3. **Flame Chart**: Visual representation where:
   - X-axis = time
   - Y-axis = call stack depth
   - Width of bar = time spent in that function

**What to look for:**

- Wide bars at the bottom indicate expensive leaf functions
- Tall stacks indicate deep call hierarchies
- Repeated patterns indicate loops or recursive calls

**Tip**: Use the **Filter** box to search for specific function names.

**Note on "self time" (dark matter)**: You may see significant "self time" on a function that appears to do very little work directly.
For example, a loop function that just calls child functions might show 15-20% self time.
This is **profiler sampling artifact**, not actual inefficiency. The V8 profiler works by periodically sampling
"what function is currently executing?" This "dark matter" self-time comes from:

- **For-loop control overhead** (increment, compare, jump instructions)
- **Function call setup/teardown** between child function calls  
- **GC pauses** attributed to whatever function is "current"
- **Small inlined functions** whose time gets attributed to the caller

You can verify this by adding explicit `performance.now()` timing around suspected operations. If manual timing shows the operations take only milliseconds but the profiler shows seconds of self-time, it's dark matter - not actionable overhead.

# How to Make Functions Profilable

V8's CPU profiler captures function names based on the function's `.name` property. Not all JavaScript functions have meaningful names in the profiler output.

## What Shows Names vs `(anonymous)`

| Pattern                                | Profiler Shows | Why                                    |
| -------------------------------------- | -------------- | -------------------------------------- |
| `function myFunc() {}`                 | `myFunc`       | Named function declaration             |
| `const myFunc = function myFunc() {}`  | `myFunc`       | Named function expression              |
| `const myFunc = () => {}`              | `(anonymous)`  | Arrow functions have no name           |
| `{ myMethod() {} }`                    | `(anonymous)`  | Object literal methods are anonymous   |
| `{ myMethod: () => {} }`               | `(anonymous)`  | Arrow function in object literal       |

## Instead of Arrow Functions, Use Named Function Expressions

Arrow functions cannot have names. If you need a function to appear in flamegraphs:

```typescript
// ❌ BAD - Shows as (anonymous)
const processData = (data: Data) => {
  // ...
}

// ✅ GOOD - Shows as "processData"
const processData = function processData(data: Data) {
  // ...
}

// ✅ ALSO GOOD - Function declaration
function processData(data: Data) {
  // ...
}
```

## Instead of Inline Object Methods, Define Functions First

Methods defined inline in object literals are anonymous:

```typescript
// ❌ BAD - myMethod shows as (anonymous)
const api = {
  myMethod(params: Params): Result {
    // ...
  },
}

// ✅ GOOD - Shows as "myMethod"
function myMethod(params: Params): Result {
  // ...
}

const api = {
  myMethod,
}
```

## Common Patterns That Hide Function Names

1. **Object literal methods** - Methods defined inline are anonymous. Fix: Define each method as a named function first.

2. **Higher-order functions with inline callbacks** - Reducers or handlers defined inline are anonymous. Fix: Define as named functions, then reference them.

3. **Arrow functions assigned to variables** - `const fn = () => {}` creates an anonymous function. Fix: Use `const fn = function fn() {}`.

## Quick Reference

To make a function visible in flamegraphs:

1. Use `function name() {}` declarations when possible
2. For const assignments, use `const name = function name() {}`
3. For object methods, define the function separately first

# Possible Alternative Approaches

## Vitest Browser Mode

Vitest can run tests directly in a browser context:

1. Install: `npm install -D @vitest/browser playwright`
2. Configure `vitest.config.ts` with `browser: { enabled: true, name: 'chromium', provider: 'playwright' }`
3. Run: `npx vitest --browser test/ai/basicIntellect.test.ts`
4. Profile using DevTools Performance tab in the opened browser

# Rejected Approaches

## Profiling Vitest Tests with Browser DevTools

If you try to profile Vitest tests using browser DevTools (via `vitest --ui`), you will NOT see your JavaScript functions in the flamegraph. **Vitest runs tests in Web Workers**, not on the main thread. The main thread only handles the UI, so you'll see browser rendering activities instead of your actual test code.

## Standalone HTML Test Runner

Creating an HTML page to run tests on the main thread adds complexity without benefits over the `tsx --cpu-prof` approach. The standalone script is simpler and produces the same quality profiles.

# Profiling Learnings

- Be wary of the "dark matter" self-time. See [Reading the Flamegraph](#reading-the-flamegraph) for more details.
- `dispatch` is expensive. E.g.  `dispatch(addAgentsToInvestigation(params))` took 98.22 ms for 1601 agents,
  while the underlying `addAgentsToInvestigationReducer` took only about 10.8 ms across 7 invocations, so 1.5 ms on average.
  - This is 11% of total, so overhead of dispatch is 9.1x.
  - This is probably because the `gameState` is large with 1601 agents, and `dispatch` must update the game state.
- But turing off default middleware speeds it up approx 2.5x. E.g. for 1571 agents the `dispatch(addAgentsToInvestigation(params))` took `38.09 ms`
  out of which `addAgentsToInvestigationReducer` was 14.7 ms across 5 invocations, so 7 ms on average.
  - This is 38.5% of total, so overhead of dispatch is 2.6x.
  - https://redux-toolkit.js.org/api/getDefaultMiddleware#customizing-the-included-middleware
  - ```typescript
      _store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          immutableCheck: false,
          serializableCheck: false,
          actionCreatorCheck: false,
        }).prepend(eventsMiddleware()),
      ...(maybePersistedState ? { preloadedState: maybePersistedState } : {}),
    })
    ```
  - This manifests as:
    ``` text
      SerializableStateInvariantMiddleware took 34ms, which is more than the warning threshold of 32ms.
      If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://      redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
      It is disabled in production builds, so you don't need to worry about that.
    ```

# Appendix: Profiler Class

The `Profiler` class (`web/src/lib/primitives/profiler.ts`) is a lightweight alternative for collecting per-turn call counts and timing statistics. Use it when you need:

- **Function call counts** per turn
- **Simplified CSV stats** (total, count, avg, max per function per turn)
- **Per-turn breakdown** to identify which turns are slow

**Prefer Chrome DevTools flamegraphs** for most profiling. The Profiler class is useful when you want to count how many times a function is called or track timing trends across turns.

**Usage:**
- Wrap appropriate functions with `profiler.wrap('functionName', functionName)`
- Run the `profileAi.ts` script as described above.
- Review & import to Excel the output .csv file.
