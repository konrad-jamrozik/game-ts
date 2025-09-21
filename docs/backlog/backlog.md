# Backlog

KJA backlog:

- Execute the `turn_report_implementation_plan.md`
  - Will also need to add "Agents" to the report, that will include info like:
  - Agents finished recovery
  - Agents wounded
  - Agents terminated
  - Agents training gains
  - Agents finished transit
- Execute the `misc_implementation_plan.md`
- Address all outstanding TODOs: search for `KJA` in the codebase

- Implement lead expiration logic, or remove the property

## Domain model

- instead of the idiom `"leadInvestigationCounts[lead.id] ?? 0"` and `getLeadById(leadId)`
  there should be LeadsView akin to AgentsView, that has functions withId and isInvestigated()
- hierarchize the game state per the comments and use more fine-grained selectors.
  `export type GameState = {`
- migrate MissionSiteUtils to MissionSitesView
- all cases of usage of `assertDefined` should be allowed only inside domain model collections like AgentsView.
  Because all other places should not return undefined, so no need to use it.
  In case of finding single item, it will basically become dotnet .Single()

## Docs

- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

## Tests

- Address all 🚧 TODOS, except "not implemented yet", in [about_test_suite.md](../design/about_test_suite.md)
- In tests, need a helper that does both `expect(X).toDefined()` and `assertDefined(X)`

## Performance

- performance clue from dev console:
  // eventsMiddleware.ts:49 ImmutableStateInvariantMiddleware took 68ms, which is more than the warning threshold of 32ms.
  // If your state or actions are very large, you may want to disable the middleware as it might cause too much
  of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
  // It is disabled in production builds, so you don't need to worry about that.
- on npm run build
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ✓ built in 6.66s

## UI improvements

- Apply skill, exhaustion and HP styling with colorful bar from: https://mui.com/x/react-data-grid/style/#styling-rows
- Use Chips for Balance Sheet data grid, same as TurnsDisplay Report

## UI ideas

- for mission evaluation, idea for a table: columns are combat rounds, and rows are units. Each cell tells what
  interesting happened to that unit in that round.
  E.g. Both damage inflicted and taken. Also units terminated and when terminated itself.
  Cell background gradient may denote % of original effective skill.
