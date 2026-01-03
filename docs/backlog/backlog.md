# Backlog

KJA backlog:

# Prompt

Improve battle log:

- Remove "Status" column. Instead, once the battle is over, at the bottom of the table there should be message
  with a summary. In the same place that is used to display retreat explanation.
  The message should start with a chip like "Won" or "Retreated", in appropriate color, and then the text message.
- Rename "Ratio" to "CR ratio" and make it compare combat ratings, not sill. This means retreat logic should
  also look at CR, not skill.

# Current milestone

- Compute ratio (for retreat) as combat rating, not skill. See onenote MLS6 for more details.

- Because of AI "exactly one desired" invariant checks, it doesn't play well with debug.
  - BUT FIRST fix the bug where undoing a turn and then asking AI to play the turn causes assertion failure.

- Also often 1 faction is ignored, as the mission is too easy and AI just goes for harder missions
  - Make the AI cycle over different factions for available missions. Like on turn 1 try first Red Dawn, then on turn 2 Exalt, and so on and loop back.
     Only if in given turn no mission for priority 1 faction can be deployed, try priority 2 faction, and so on.
     Observe that faction that is priority 2 on turn X will be priority 1 on turn X+1 and so on.

- AI assigns only 1 agent to non-repeatable leads.

- Add pagination to agents data grid

- When persisting undoable state, persist player actions only for the current turn,
  - For all the previous turns, persist only the final state of the turn (which also includes the turn start report)
- Better turn reset controls, working well with the new undo/persistence setup.

- Does the `<Strict> mode` continue double rendering even for vite preview>
  - Note: removing this doesn't speed up tests.

- Add more AI tests:
- e.g. "delegate 20 turns to do nothing intellect" that verifies game is lost
- "aggressive AI" that tries to win the game as fast as possible, assuming cheats are on, so it always wins all rolls.
  So it beelines the investigations needed and always sends few agents on a mission, just enough so they kill all enemies
  before the exhaustion causes them to lose so much effective skill that commander orders retreat.

- Fixup charts, see below

# Dev ergonomics

Make sure that my ps1 profile doesn't output stuff when used by agent, but outputs when used by me.

# Game mechanics ideas

- At the game beginning each faction rolls hidden "growth factor" e.g. from 0.5 to 1.5 which compresses
  how quickly they go through activity levels.
  So e.g. when faction rolls the growth between range 60-90, and it rolls 70, then:
  - if growth factor is 60%, then (70-60) * 0.6 = 6, so it actually rolled 70-6 = 64.
  - if growth factor is 140%, then (90-70) *0.4 = 20*0.4 = 8, so it actually rolled 70+8 = 78.
  - So growth factor of 50%  narrows effective roll from 60-90 to 60-75 and
       growth factor of 150% narrows effective roll from 60-90 to 75-90.
// NOTE: this should be opposite: growth factor of 50% should slow-down, not speed up

# Ideas

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
- Use charts color palettes? https://mui.com/x/react-charts/styling/#color-palette

# Performance Optimizations

- See notes on basicIntellect.test.ts performance
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

# Charts

## Charts prompt

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

## Charts todos

- Fixup charts, see https://github.com/konrad-jamrozik/game/blob/2f0dad472a40acd738f49971acdb063080a4fe66/web/src/components/GameStatsLineChart.tsx#L67
- Charts for stats over time, at the bottom of the screen.
  - Panic
  - Each faction threat level, suppression, panic increase
  - Money
  - Cumulative missions completed successfully, failed, expired
  - Hardest mission completed by total enemy skill
  - Agents, and what they do: contracting, investigating leads, on missions, etc.
  - Agent skill: min, average, median (top 50%, 50th percentile), top 10% (90th percentile), max
