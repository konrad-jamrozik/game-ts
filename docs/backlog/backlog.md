# Backlog

KJA backlog:

# Next

## AI

Smarter AI player that finishes game in less turns, even without cheating.
See prompt.md

- Keep less money and ready agents around once some agent threshold is reached.

- Because of AI "exactly one desired" invariant checks, it doesn't play well with debug.
  - BUT FIRST fix the bug where undoing a turn and then asking AI to play the turn causes assertion failure.
  - Actually looks like manual human actions in general can throw AI off, not just undoing.
    Probably because busting "actual" state. But I might have fixed it, not sure.
  - Well OK I reproed it getting "Error: AI bug: Expected exactly one desired cap/upgrade to be exactly 1 above actual, but found none."

- Also often 1 faction is ignored, as the mission is too easy and AI just goes for harder missions
  - Make the AI cycle over different factions for available missions. Like on turn 1 try first Red Dawn, then on turn 2 Exalt, and so on and loop back.
     Only if in given turn no mission for priority 1 faction can be deployed, try priority 2 faction, and so on.
     Observe that faction that is priority 2 on turn X will be priority 1 on turn X+1 and so on.

- Add more AI tests:
- e.g. "delegate 20 turns to do nothing intellect" that verifies game is lost
- "aggressive AI" that tries to win the game as fast as possible, assuming cheats are on, so it always wins all rolls.
  So it beelines the investigations needed and always sends few agents on a mission, just enough so they kill all enemies
  before the exhaustion causes them to lose so much effective skill that commander orders retreat.

# Next - minor

- Keep track of agents initial CR in mission log

- In missions header, first show success, then fail, then expired

- Ensure that charts show data from last game state in given turn. This is relevant for the last 3 turns, that may
  have intermediate states due to player actions.

- Consider adding "Exhausted" state when exhaustion >= 100%. Assignment is "Recovery", so same as state "Recovering".

## Charts

Problem:
- Current turn display mode charts are often useless. Need pie chart.
- Factions chart should show suppression as bars.
- Fix colors in factions chart.
- The enemies killed chart should also count incapacitated enemies.

## MUI

- Add pagination to agents data grid, and to other grids too.

## Perf

- Does the `<Strict> mode` continue double rendering even for vite preview?
  - Note: removing this doesn't speed up tests. Confirmed.

# Later

## Domain model refactoring

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

## Docs

- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

## Tests

- Address all 🚧 TODOS, except "not implemented yet", in [about_test_suite.md](../design/about_test_suite.md)
- In tests, need a helper that does both `expect(X).toDefined()` and `assertDefined(X)`

## UI improvements

- Use this for rich tree view? https://mui.com/blog/mui-x-v8/#new-customization-hook
- Use charts color palettes? https://mui.com/x/react-charts/styling/#color-palette

## Performance Optimizations

- See notes on basicIntellect.test.ts performance

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

## Dev exp

- Add ESLint server MCP: https://eslint.org/docs/latest/use/mcp

## Maybe, future

- See `prompts.md`, `ideas.md`, `long_term_backlog.md`, and `.cursor/plans` for more ideas.

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
