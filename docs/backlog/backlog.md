# Backlog

KJA backlog:

# Current milestone

## Current Game mechanics

## Current UI refinement

- Improve event log display

- Improve the combat log display
  - Get rid of `(100%)` and instead apply skill, exhaustion and HP styling with colorful bar from: https://mui.com/x/react-data-grid/style/#styling-rows

- Show exhaustion % and HP % in combat log, as separate columns

- Narrow exhaustion column in Agents data grid

- Replace "Terminated" with "KIA".
  - Note that then "Sacked" will no longer count as "Terminated" and it cannot count as "KIA"ed.

# Next milestone

## Next Game mechanics

- Delete accumulated intel concept

- Switch away from `Threat level` to `Activity level` system and associated `Faction operations` documented in [about_defensive_missions.md](../design/about_defensive_missions.md)
- Implement the faction operations system as documented
  - Implement the panic increase penalty
  - Implement the funding decrease penalty
- Update suppression system as documented
- Delete threat level and increase concepts

# P0 Game mechanics

# P1 Game mechanics

- Add AI player that can play the game for me

# P0 UI refinement

# P1 UI refinement

- Add stats to agents data grid
  - Combat stats (Killed / Damage Inflicted / Damage Taken)
    - Column names: "Kills", "Damage", "Wounds"
  - Skill: Total / from missions / from training
    - Colum name: "Skill (Mis/Trn)"

# P2 UI refinement

- Charts for stats over time, at the bottom of the screen.
  - Panic
  - Each faction threat level, suppression, panic increase
  - Money
  - Cumulative missions completed successfully, failed, expired
  - Hardest mission completed by total enemy skill
  - Agents, and what they do: contracting, investigating leads, on missions, etc.
  - Agent skill: min, average, median (top 50%, 50th percentile), top 10% (90th percentile), max

# P0 Game content

# Domain model refactoring

- instead of the idiom `"leadInvestigationCounts[lead.id] ?? 0"` and `getLeadById(leadId)`
  do it the same way as `agentUtils`
  - `withId(id: string): Lead`
  - `isInvestigated(id: string): boolean`
  - `getInvestigationCount(id: string): number`
  - Replace idioms like `leadInvestigationCounts[lead.id] ?? 0`
  - Replace `getLeadById(leadId)` calls
  - Update selectors
- hierarchize the game state per the comments and use more fine-grained selectors.
  `export type GameState = {`
  - Log (turn counter, action tracking)
  - Situation (panic, faction threats, active missions, deployed missions)
  - Assets (money, intel, agents)
  - Archive (events, mission results)
- all cases of usage of `assertDefined` should be allowed only inside domain model collections.
  Because all other places should not return undefined, so no need to use it.
  In case of finding single item, it will basically become dotnet .Single()

# Docs

- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

# Tests

- Address all 🚧 TODOS, except "not implemented yet", in [about_test_suite.md](../design/about_test_suite.md)
- In tests, need a helper that does both `expect(X).toDefined()` and `assertDefined(X)`

# UI improvements

# Performance Optimizations

- performance clue from dev console:
  // eventsMiddleware.ts:49 ImmutableStateInvariantMiddleware took 68ms, which is more than the warning threshold of 32ms.
  // If your state or actions are very large, you may want to disable the middleware as it might cause too much
  of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
  // It is disabled in production builds, so you don't need to worry about that.
  - Analyze state size and complexity
  - Configure middleware threshold or disable for large operations
  - Add conditional middleware configuration  
- on npm run build
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ✓ built in 6.66s
    - Analyze bundle with `npm run build --analyze`
    - Focus on optimizing bundle with tree shaking
    - Configure manual chunks in Vite config for better caching
    - Accept larger initial bundle size (load everything at once)
    - No dynamic imports or lazy loading needed

# Dev exp

- Add ESLint server MCP: https://eslint.org/docs/latest/use/mcp

# Maybe, future

- See `prompts.md` and `.cursor/plans` for more ideas.

- Allow State column filtering:
  Per LLM, how to make MUI use enum for filtering:
  > In MUI, when I have column menu for filtering, can I make it so that it allows me to pick from multiple predefined
  > values? An enumeration
  >
  > "Solution: Use singleSelect Type with valueOptions"
  ``` typescript
  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: ['Active', 'Inactive', 'Pending', 'Completed'],
      width: 150,
    },  
  ```
