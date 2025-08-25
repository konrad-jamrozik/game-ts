# Backlog

KJA backlog:

- Execute the `implementation_plan.md`
- Address all outstanding TODOs: search for `KJA` in the codebase

## Naming

- introduce terminology of "turn evaluation" and "mission site evaluation". Replace existing terminology as appropriate.
  E.g. `advanceTurnImpl` -> `evalTurn`. or `evaluateDeployedMissionSite` -> `evalMission`.
w docs.

## Features

- Implement lead expiration logic, or remove the property

## Domain model

- instead of the idiom `"leadInvestigationCounts[lead.id] ?? 0"` and `getLeadById(leadId)`
  there should be LeadsView akin to AgentsView, that has functions withId and isInvestigated()
- hierarchize the game state per the comments and use more fine-grained selectors.
  `export type GameState = {`
- migrate MissionSiteUtils to MissionSitesView
- all cases of usage of `assertDefined should be allowed only inside domain model collections like AgentsView.
  Because all other places should not return undefined, so no need to use it.
  In case of finding single item, it will basically become dotnet .Single()

## Docs

- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

## Tests

- Refactor the E2E test. Introduce supporting abstractions.
- Remove redundant tests to speed up test suite: do it by first updating about_test_suites.md and then deriving code.

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

## UI ideas

- for mission evaluation, idea for a table: columns are combat rounds, and rows are units. Each cell tells what
  interesting happened to that unit in that round.
  E.g. Both damage inflicted and taken. Also units terminated and when terminated itself.
  Cell background gradient may denote % of original effective skill.
