# Backlog

KJA backlog:

# Next

## UI

- make event log entries two line to display everything
- clicking on completed mission should take directly to mission details, not just missions view
- upgrade turn report
  - spread it out horizontally, unfold by default
- clicking on money or projection should go to turn report, unfold money sections
- collapse/expand in main screen should not influence sub-screens, including turn report
- need to display extra crucial info on sub-screens, like money available in agents, upgrades
  - also wider "Capacity" column in upgrades.
- fix agents grid header, now the counts are on next line
- "stats" and "terminated" should not need to have such abbreviated columns
- Operations should also show "contracting" agents and "in training"
  - First indented under Away, 2nd indented under ready
- clicking panic should take to turn report
- Narrow down operations
  - Situation report turns should not display stuff like `7 (suppr. 30)`. Just sum it up,
    like `7+30`, narrow column
  - Expiring soon -> expiring, narrow column
  - Count -> `#`, narrow column
  - Value -> `#`, narrow column
  - Investigations -> Invstg., narrow column
  - Agent/Transport/Training Cap -> drop `Cap`, narrow column
- Narrow down game controls
- Event log upgrades and styling
  - "Advanced to turn" should display in blue or violet color
  - "Expiring soon" should display in orange color
  - Successful mission should display in green color
    - The 2-line view should say "Spoils available"
    - Clicking on it should open appropriate section in turn report
  - Failed mission should display in red color
  - Investigation completed should display in green color
  - Investigation abandoned should display in red color
  - New one-time lead available should display in blue color
  - New repeatable lead available should display in blue color
  - New mission site available should display in blue color
  - New upgrade available should display in blue color
- Stylize Event log header as Card header, just no folding behavior and no body.
  - OR stylize cards more flatly! Same background color, just an outline

- Bug: non-player-action events do not grey out in event log. E.g. I clicked "spawn missions",
  then I clicked "Undo", and the missions still show in white.
- `Debug: add capabilities` -> `Debug: upgrade capacities.
- Bug: once I clicked on previous turn report in event view, it continued to be shown in turn report
  button from game controls. But it should show the latest one.
- Next operation in situation report is double-row high when no rows show up. Weird.
- Bug: reset game -> delegate to basic AI -> click again -> nothing happens. In spite of `auto-advance` checkbox being checked. Re-checking solved. Busted state? By default shows as checked, but doesn't work?

## New investigations

- Merge the pending changes to investigations
  - Based on docs/design/about_lead_investigations.md
- Improve display, use the same color bar for progress as for agents skill
  - Do not show `.0` in denominator

## Bugs

Bug: when I click 'revert turn' and then 'redo' to go forward again, the event log doesn't show turn was advanced again.

## AI

Smarter AI player that finishes game in less turns, even without cheating.
For details see, in chronological order:
- basic_intellect_upgrade_prompt.md
- long_playthrough_research.md
- cursor plan "ai_intellect_implementation_guide_0d127b2e.plan.md"
- cursor plan "cheating_speedrunner_intellect_7be109f1.plan.md"

- Keep less money and ready agents around once some agent threshold is reached.

- When selecting leads to investigate, often 1 faction is ignored, as the mission is too easy and AI just goes for harder missions
  - Make the AI cycle over different factions for available missions. Like on turn 1 try first Red Dawn, then on turn 2 Exalt, and so on and loop back.
     Only if in given turn no mission for priority 1 faction can be deployed, try priority 2 faction, and so on.
     Observe that faction that is priority 2 on turn X will be priority 1 on turn X+1 and so on.
  - Have separate prioritization for one-time and repeatable leads. So e.g. AI player may say that at given turn for one-time lead
    faction priority 1 is Red Down, while for repeatable lead faction priority 1 is Exalt.
  - Note this means that the one-time lead will no longer be chosen at random.
  - See Cursor plans: ai_faction_cycling_for_leads_1a8f75f3.plan.md and tdd_faction_cycling_tests.plan.md for details.

- Add more AI tests:
- e.g. "delegate 20 turns to do nothing intellect" that verifies game is lost
- "aggressive AI" that tries to win the game as fast as possible, assuming cheats are on, so it always wins all rolls.
  So it beelines the investigations needed and always sends few agents on a mission, just enough so they kill all enemies
  before the exhaustion causes them to lose so much effective skill that commander orders retreat.

- Observation: increasing AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER from 4 to 20 makes the basicIntellect.test sometimes
  finish in 155 turns instead of ~190-210.

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
