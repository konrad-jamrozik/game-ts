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

`validateGameStateInvariants()` is called **twice** per turn advancement - once at the start and once at the end of `evaluateTurn()`. This iterates through all agents and leads.

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

## Debugging Techniques

### Adding Granular Timing

Add `performance.now()` measurements around suspected bottlenecks:

```typescript
// Example: In evaluateTurn.ts
function evaluateTurn(state: GameState): TurnReport {
  const timings: Record<string, number> = {}
  
  let t0 = performance.now()
  validateGameStateInvariants(state)
  timings['validation1'] = performance.now() - t0
  
  // ... other code ...
  
  t0 = performance.now()
  const { rewards, missionReports } = evaluateDeployedMissions(state)
  timings['evaluateDeployedMissions'] = performance.now() - t0
  
  console.table(timings)
  return turnReport
}
```

### Battle-Specific Timing

```typescript
// In evaluateBattle.ts
do {
  const roundStart = performance.now()
  // ... round evaluation ...
  console.log(
    `Round ${roundIdx}: ${(performance.now() - roundStart).toFixed(1)}ms, ` +
    `agents: ${activeAgents.length}, enemies: ${activeEnemies.length}`
  )
} while (!battleEnded)
```

## Profiling with Browser DevTools (Flamegraphs)

Browser DevTools provide powerful profiling capabilities including flamegraph visualization. Here's how to use them with Vitest tests:

### Option 1: Using Vitest Browser Mode

Vitest supports running tests directly in a browser. This gives you access to browser DevTools.

1. **Install browser provider** (if not already installed):

   ```bash
   npm install -D @vitest/browser playwright
   ```

2. **Configure Vitest for browser mode** in `vitest.config.ts`:

   ```typescript
   import { defineConfig } from 'vitest/config'

   export default defineConfig({
     test: {
       // Use browser mode for profiling
       browser: {
         enabled: true,
         name: 'chromium', // or 'firefox', 'webkit'
         provider: 'playwright',
         headless: false, // Set to false to see the browser
       },
     },
   })
   ```

3. **Run a specific test**:

   ```bash
   npx vitest --browser test/ai/basicIntellect.test.ts
   ```

4. **Profile in the browser**:
   - The browser window will open with Vitest UI
   - Open DevTools (F12 or Ctrl+Shift+I)
   - Go to the **Performance** tab
   - Click **Record** (or Ctrl+E)
   - Click the button to run your test in Vitest UI
   - Click **Stop** after the test completes
   - Analyze the flamegraph

### Option 2: Using Vitest UI with Instrumented Code

If browser mode setup is complex, you can run Vitest UI and manually profile:

1. **Run Vitest UI**:

   ```bash
   npx vitest --ui
   ```

2. **Open the UI URL** in Chrome (usually `http://localhost:51204/__vitest__/`)

3. **Open Chrome DevTools** → **Performance** tab

4. **Start recording**, then run your test from the Vitest UI

5. **Stop recording** and analyze the flamegraph

### Option 3: Create a Standalone HTML Test Runner

Create a minimal HTML page that runs the performance-critical code:

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

### Reading the Flamegraph

In Chrome DevTools Performance tab:

1. **Bottom-Up view**: Shows which functions took the most total time
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

### Option 4: Node.js CPU Profiling

For command-line profiling without a browser:

```bash
# Generate a CPU profile
node --cpu-prof --cpu-prof-dir=./profiles npx vitest run test/ai/basicIntellect.test.ts

# This creates a .cpuprofile file that can be loaded in Chrome DevTools
```

Load the `.cpuprofile` file:

1. Open Chrome DevTools (even on a blank page)
2. Go to **Performance** tab
3. Click **Load profile** (or drag-drop the file)
4. Analyze the flamegraph

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
