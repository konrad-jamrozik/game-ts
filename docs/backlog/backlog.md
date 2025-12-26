# Backlog

KJA backlog:

# Current milestone

## Current Game mechanics

## Current UI refinement

- Add color bars to assets and capab

- display in capab Exhaustion recov. with %

- Fixup charts, see https://github.com/konrad-jamrozik/game/blob/2f0dad472a40acd738f49971acdb063080a4fe66/web/src/components/GameStatsLineChart.tsx#L67

- Test and refine the new activity level
  - Stylize with color bars
  - Get rid of "projected" column
- Turn report:
  - "Turns at level: should not be displayed

# Next milestone

## Next Game mechanics

## Next UI refinement

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

# Ideas

- At the game beginning each faction rolls hidden "growth factor" e.g. from 0.5 to 1.5 which compresses
  how quickly they go through activity levels.

- Add some mechanism that influences how long missions sites will last until expiration.
  Conceptually it denotes how early player learned about them. Maybe:
  - Have some kind of "Threat detection" repeatable lead that when completed, gives turn-limited benefits of form:
    - Increased expiration time of missions
    - More precise insight when will the next offensive operation happen and what it will be.
  - Or "Reveal operation" lead just tells you about current op.
  - Note that conceptually "expires in" should elongate BEFORE, not AFTER. What does it mean?
    If on turn 10 faction planned a mission for turn 18, then that mission site should still expire by turn 20.
    If player wants to have "expires in" longer, they must discover the mission site earlier.
    But then this is stupid in this sense that early detection doesn't mean the mission has started yet.
    So need a new concept of "mission didn't start but we know when it will happen".
    Expirations probably must remain very strict.
  - Maybe agents could also gather intel against specific faction, and that intel will decay. So the more
    intel gathered at any given turn, the more player knows the factions whereabouts.
  - Interrogating could give similar benefits

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

- Use this for rich tree view? https://mui.com/blog/mui-x-v8/#new-customization-hook

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

# DONE in MLS-5

- Delete the intel espionage gathering. I.e. ensure that agents can no longer be assigned to espionage / intel gathering missions.
  Delete all related code symbols: reducer, model, all of that.
  Do not touch lead investigation accumulated intel concept or related symbols needed for it. This stays in the code.

- Switch away from `Threat level` to `Activity level` system and associated `Faction operations` documented in [about_faction_activity_level.md](../design/about_faction_activity_level.md)
- Implement the faction operations system as documented
  - Implement the panic increase penalty
  - Implement the funding decrease penalty
- Update suppression system as documented
- Delete threat level and threat increase concepts

The agents data grid "Skill" column color bar shows grey bar to denote 100% of agent skill. Apply the same for the Skill column in the combat log.

Create "Charts" button in Game Controls, under the "Expand all" and "Collapse all" buttons. Center the button.
The button will open a new screen, similar as the mission details screen. It will also have "Back to Command Center" button,
in the center top.
Below it there will be series of MUI line charts (use MUI MCP to learn about them). Each chart will be plotting various values, over all the available game states,
starting from the first available, to the current one. So on the X axis it will be turn number of given state.
Now I will tell you what will be plotted on these charts, from left to right:
- Chart 1: Assets
  - Agent count, Funding, Money
- Chart 2: Agent skill
  - Min, average, median and top 10% (90th percentile), and sum total of the following:
    - Agent max effective skill
  - Sum total of the following:
    - Agent current effective skill
- Chart 3: Agent readiness
  - avg per agent, and max over all agents, of the following:
    - Max hit points, current hit points
    - Exhaustion
    - Recovery turns
- Chart 4: Missions
  - Total missions ever:
    - spawned
    - expired
    - completed successfully
    - retreated
    - resulting in wipe
- Chart 5: Battle stats
  - Total (over missions, so e.g. each mission deployment counts as one)
    - Agents deployed on missions
    - Agents KIAed during missions
    - Agents wounded during missions
    - Agents unscathed from missions
    - Enemies KIAed during missions
- Chart 5: Situation report
  - Panic level

- Display exhaustion as %. I.e. the current exhaustion of 67 should be displayed at 67%. Still store it as integer, rename to "exhaustionPct".
