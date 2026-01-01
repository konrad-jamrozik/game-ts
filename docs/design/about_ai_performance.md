# AI Turn Performance Analysis

This document analyzes performance bottlenecks in AI turn execution and provides guidance for debugging, profiling, and optimization.

## Performance Characteristics

The AI player turn execution (`delegateTurnToAIPlayer`) shows a **spike pattern** where most turns complete quickly (10-50ms), but certain turns spike to ~1000ms (1 second).

The spikes typically occur when:

1. **Battles are evaluated** - deployed missions with combat simulation
2. **Multiple missions are deployed** in a single turn
3. **Lead investigations complete** and spawn new missions
4. **Game state grows larger** (more agents, missions, etc.)

## Key Performance Bottlenecks

### 1. Battle Evaluation (`evaluateBattle.ts`)

The combat simulation is likely the biggest contributor to performance spikes:

- Runs multiple rounds until one side is eliminated or retreats
- Each round iterates through all agents and enemies
- Calls `effectiveSkill()` many times per round
- Creates attack logs for every single attack
- Complexity: O(rounds × (agents + enemies)²)

Location: `web/src/lib/game_utils/turn_advancement/evaluateBattle.ts`

### 2. Double Game State Validation

`validateGameStateInvariants()` is called **twice** per turn advancement - once at the start and once at the end of `evaluateTurn()`. This is by design, validating the game state at both the beginning and end of turn. This iterates through all agents and leads.

Location: `web/src/lib/game_utils/turn_advancement/evaluateTurn.ts` (lines 53 and 119)

### 3. AI Agent Selection - Repeated O(n) Operations

The AI repeatedly filters all agents when selecting the next best agent. Each call to `selectNextBestReadyAgent()`:

- Filters through all agents for availability
- Filters again for exhaustion thresholds
- Sorts by exhaustion level
- Creates new arrays on each iteration

Location: `web/src/ai/intellects/basic/agentSelection.ts`

### 4. Lead Investigation Selection

Creates **temporary missions** just to check if they would be deployable:

- For each repeatable lead, builds a temporary mission
- Runs full `canDeployMissionWithCurrentResources()` check
- This involves selecting agents and calculating combat ratings

Location: `web/src/ai/intellects/basic/leadInvestigation.ts`

### 5. Redux SerializableStateInvariantMiddleware

This is a development-only middleware that deep-checks state serialization. The test logs show it taking 34ms+ per action, exceeding the 32ms warning threshold.

## Profiling with Flamegraphs

### Standalone Script with tsx

This script is used in conjunction with the `Profiler` class (`web/src/lib/primitives/profiler.ts`) to profile JavaScript execution. It runs the AI directly without Vitest (which uses workers that complicate profiling).

1. **Run the profiling script**:

   ```powershell
   cd web
   npx tsx --cpu-prof scripts/profileAi.ts
   ```

   This creates **two** `.cpuprofile` files in the `web` folder, e.g.:
   - `CPU.20251231.014747.3076.0.001.cpuprofile`
   - `CPU.20251231.014747.3076.1.002.cpuprofile`

   Either file can be used for analysis (they capture the same execution).

2. **Load the profile in Chrome DevTools**:
   - Open Chrome and navigate to any page (even `about:blank`)
   - Open DevTools (F12 or Ctrl+Shift+I)
   - Go to the **Performance** tab
   - Click the **↑ Upload** button (or drag-drop one of the `.cpuprofile` files)

3. **Analyze the flamegraph**:
   - You'll see your actual function names: `evaluateTurn`, `evaluateBattle`, `effectiveSkill`, etc.
   - Use **Bottom-Up** view to see which functions took the most time
   - Use **Call Tree** view to see the call hierarchy
   - Use the **Filter** box to search for specific functions

**Note**: The script at `web/scripts/profileAi.ts` runs 200 turns by default. Edit `TURNS_TO_PLAY` to adjust.

### About the Profiling Script

The script `web/scripts/profileAi.ts` does the following:

1. Initializes the Redux store with no undo history (for speed)
2. Sets up initial game state with 100,000 money (to enable lots of hiring/upgrades)
3. Configures `rand` for deterministic success (investigations and combat always succeed)
4. Runs the AI player for N turns (default: 200)
5. Prints timing statistics

You can edit the script to adjust:
- `TURNS_TO_PLAY` - number of turns to simulate
- `money` - starting money amount
- `rand.set()` calls - to test different RNG scenarios

### Reading the Flamegraph

In Chrome DevTools Performance tab after loading a `.cpuprofile`:

1. **Bottom-Up view**: Shows which functions took the most total time (start here!)
2. **Call Tree view**: Shows the call hierarchy with time breakdown
3. **Flame Chart**: Visual representation where:
   - X-axis = time
   - Y-axis = call stack depth
   - Width of bar = time spent in that function
   - Look for wide bars (time-consuming functions)

**What to look for:**

- Wide bars at the bottom indicate expensive leaf functions
- Tall stacks indicate deep call hierarchies
- Repeated patterns indicate loops or recursive calls
- Look for functions like `evaluateBattle`, `effectiveSkill`, `selectNextBestReadyAgent`

**Tip**: Use the **Filter** box to search for specific function names like `evaluate` or `Battle`.

## Possible Alternative Approaches

### Vitest Browser Mode

Vitest can run tests directly in a browser context (not in a worker):

1. **Install browser provider**:

   ```bash
   npm install -D @vitest/browser playwright
   ```

2. **Configure Vitest for browser mode** in `vitest.config.ts`:

   ```typescript
   import { defineConfig } from 'vitest/config'

   export default defineConfig({
     test: {
       browser: {
         enabled: true,
         name: 'chromium',
         provider: 'playwright',
         headless: false,
       },
     },
   })
   ```

3. **Run the test**: `npx vitest --browser test/ai/basicIntellect.test.ts`

4. **Profile in the browser** using DevTools Performance tab.

## Rejected Approaches

### Profiling Vitest Tests with Browser DevTools

If you try to profile Vitest tests using browser DevTools (via `vitest --ui`), you will NOT see your JavaScript functions in the flamegraph. This is because **Vitest runs tests in Web Workers**, not on the main thread. The main thread only handles the UI, so you'll see browser rendering activities (Paint, Recalculate style, etc.) instead of your actual test code.

### Standalone HTML Test Runner

Create a minimal HTML page that runs the performance-critical code directly on the main thread:

1. **Create `web/test/perf/ai-perf-test.html`**:

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>AI Performance Test</title>
     <script type="module">
       // Import your test setup and run it
       import { runAIPerformanceTest } from './ai-perf-runner.ts'
       
       window.runTest = async () => {
         console.log('Starting performance test...')
         const results = await runAIPerformanceTest()
         console.log('Results:', results)
       }
     </script>
   </head>
   <body>
     <h1>AI Performance Test</h1>
     <button onclick="runTest()">Run Test</button>
     <p>Open DevTools → Performance tab → Record → Click button → Stop</p>
   </body>
   </html>
   ```

2. **Create the test runner `web/test/perf/ai-perf-runner.ts`**:

   ```typescript
   import { getStore, initStore } from '../../src/redux/store'
   import { reset } from '../../src/redux/slices/gameStateSlice'
   import { clearEvents } from '../../src/redux/slices/eventsSlice'
   import { bldInitialState } from '../../src/lib/factories/gameStateFactory'
   import { delegateTurnsToAIPlayer } from '../../src/ai/delegateTurnToAIPlayer'
   import { rand } from '../../src/lib/primitives/rand'

   export async function runAIPerformanceTest() {
     // Initialize store with no undo history for speed
     await initStore({ undoLimit: 0, enablePersistence: false })
     
     const store = getStore()
     const initialState = bldInitialState()
     const customState = { ...initialState, money: 100_000 }
     store.dispatch(reset({ customState }))
     store.dispatch(clearEvents())
     
     // Configure for deterministic success
     rand.set('lead-investigation', 1)
     rand.set('agent_attack_roll', 1)
     rand.set('enemy_attack_roll', 0)
     
     // Run the AI for N turns
     const startTime = performance.now()
     delegateTurnsToAIPlayer('basic', 50) // Adjust turn count as needed
     const endTime = performance.now()
     
     return {
       totalTime: endTime - startTime,
       turnsPlayed: 50,
       averagePerTurn: (endTime - startTime) / 50,
     }
   }
   ```

3. **Run with Vite dev server**:

   ```bash
   cd web
   npx vite --open test/perf/ai-perf-test.html
   ```

4. **Profile**:
   - Open DevTools → Performance tab
   - Click Record
   - Click "Run Test" button
   - Click Stop
   - Analyze flamegraph

## Optimization Suggestions

### Quick Wins

1. **Disable serializable middleware in tests**:

   ```typescript
   // In test store setup
   configureStore({
     middleware: (getDefaultMiddleware) => 
       getDefaultMiddleware({
         serializableCheck: false,
         immutableCheck: false,
       }).prepend(eventsMiddleware()),
   })
   ```

2. **Remove duplicate validation** - Keep only the validation at the end of `evaluateTurn()`

3. **Cache `effectiveSkill()` results** per round in battle evaluation

### Medium-Effort Optimizations

1. **Pre-filter available agents once** at the start of AI turn, pass the filtered list through instead of filtering all agents repeatedly

2. **Cache combat ratings** for missions that haven't changed

3. **Batch agent ID arrays** - Avoid creating new arrays with `.map()` in hot loops:

   ```typescript
   // Instead of:
   selectedAgents.map((a) => a.id)  // Creates new array each iteration
   
   // Use a Set for exclusions:
   const excludeIds = new Set<string>()
   // ... add to set as you go
   ```

### Architectural Changes

1. **Simplify battle logging** - The `attackLogs` and `roundLogs` arrays grow large; consider:
   - Sampling (log every Nth attack)
   - Summarizing per round instead of per attack
   - Making detailed logging optional

2. **Lazy evaluation** - Don't calculate values until they're needed

3. **Consider using a dedicated test store configuration** that skips expensive development-only checks

## Monitoring Performance Over Time

Add performance assertions to catch regressions:

```typescript
test('AI turn performance stays reasonable', () => {
  // ... setup ...
  
  const startTime = performance.now()
  delegateTurnsToAIPlayer('basic', 10)
  const elapsed = performance.now() - startTime
  
  // Fail if average turn takes more than 200ms
  expect(elapsed / 10).toBeLessThan(200)
})
```

## Related Files

- `web/src/ai/delegateTurnToAIPlayer.ts` - AI turn delegation entry point
- `web/src/ai/intellects/basic/` - Basic intellect AI implementation
- `web/src/lib/game_utils/turn_advancement/evaluateTurn.ts` - Turn advancement logic
- `web/src/lib/game_utils/turn_advancement/evaluateBattle.ts` - Battle simulation
- `web/src/redux/store.ts` - Redux store configuration
- `web/test/ai/basicIntellect.test.ts` - AI performance test
