# Backlog

KJA backlog:

# Brainstorming

- KJA fix e2e test

- KJA document the lead investigation mechanics: intel accumulation, difficulty, decay, rolling for success.
  Clarify that decays grows super-linearly to disincentivize piling all agents into one lead, and thus
  introducing a trade-off. Read more in OneNote for MLS4 intel page.

- KJA Allow State column filtering:
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

- Debug tab that shows when game was reset with ctrl click. Has options like:
  - Add 100_000 money
  - Reset panic to 0
  - Suppress all factions to 10_000%
  - Make all leads  available

- Charts for stats over time, at the bottom of the screen.
  - Panic
  - Each faction threat level, suppression, panic increase
  - Money
  - Cumulative missions completed successfully, failed, expired
  - Hardest mission completed by total enemy skill
  - Agents, and what they do: contracting, investigating leads, on missions, etc.
  - Agent skill: min, average, median (top 50%, 50th percentile), top 10% (90th percentile), max

- For combat reports, add dedicated data grid with columns:
  - round,
  - attacker & effective skill & % of initial,
  - defender & effective skill & % of initial,
  - roll & result & threshold & diff to threshold
  - damage inflicted (if any) & % of weapon range & min & max
  - hit points remaining & percentage of total & total

- Add "Details" button to completed missions that show the combat log

- Make each repeatable lead be investigated only once at a time.
  - Make even allow one lead per faction at a time.

- Interrogating captured enemies should provide bonus towards various lead investigations.
  - Intel lump sum.
  - What if there is currently no eligible lead investigation?
    - Maybe decrease lead difficulty by some amount?

- Add AI player that can play the game for me

- Add Capabilities / Stats screen that show player capabilities like:
  - Max agent capacity (living quarters)
  - Display agent weapon damage and add an ability to upgrade
  - Max agents can be sent on one mission
  - HP Recovery rate
  - Exhaustion recovery rate

- Training activity for agents

- Add new mechanic: procurement / investments / upgrades
  - Allow to spend money on upgrades
  - Examples of upgrades:
    - More agent capacity (living quarters)
    - Better agent weapons (upgraded for all)
    - More agent hit points (upgraded for all)
    - Faster HP recovery rate
    - Faster exhaustion recovery rate
    - Faster training

- Funding increase every X turns based on score

- Win criteria - defeat all enemy factions
  - Raiding each HQ should unlock new lead
  - Unlocking all HQ raids leads should unlock the final "game victory" lead
  - Researching that lead should win the game.

- Add more factions

# Game mechanics

# Domain model

- maybe just abandon agentsView and use plain functions instead.

- instead of the idiom `"leadInvestigationCounts[lead.id] ?? 0"` and `getLeadById(leadId)`
  there should be LeadsView akin to AgentsView, that has functions withId and isInvestigated()
  - create `LeadsView` class in collections/views
    - Implement methods:
      - `withId(id: string): Lead`
      - `isInvestigated(id: string): boolean`
      - `getInvestigationCount(id: string): number`
    - Replace idioms like `leadInvestigationCounts[lead.id] ?? 0` with LeadsView methods
    - Replace `getLeadById(leadId)` calls with LeadsView
    - Update selectors to use LeadsView
- hierarchize the game state per the comments and use more fine-grained selectors.
  `export type GameState = {`
  - Log (turn counter, action tracking)
  - Situation (panic, faction threats, active missions, deployed missions)
  - Assets (money, intel, agents)
  - Archive (events, mission results)
- migrate MissionSiteUtils to MissionSitesView
- all cases of usage of `assertDefined` should be allowed only inside domain model collections like AgentsView.
  Because all other places should not return undefined, so no need to use it.
  In case of finding single item, it will basically become dotnet .Single()

# Docs

- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

# Tests

- Address all 🚧 TODOS, except "not implemented yet", in [about_test_suite.md](../design/about_test_suite.md)
- In tests, need a helper that does both `expect(X).toDefined()` and `assertDefined(X)`

# UI improvements

- Apply skill, exhaustion and HP styling with colorful bar from: https://mui.com/x/react-data-grid/style/#styling-rows

# UI ideas

- for mission evaluation, idea for a table: columns are combat rounds, and rows are units. Each cell tells what
  interesting happened to that unit in that round.
  E.g. Both damage inflicted and taken. Also units terminated and when terminated itself.
  Cell background gradient may denote % of original effective skill.

# Performance Optimization

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
