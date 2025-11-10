# Backlog

KJA backlog:

# Game mechanics

- Figure out how to handle intel & mission expiration better
  - Problem: no incentive to investigate lead early, because that starts mission expiration counter
  - Problem: silly kind of zero-cost leads, especially when repeatable.

- Reduce micromanagement of agents:
  - When sending on contracting or espionage gathering mission, it should be fixed length.
    Player can make the mission longer, thus blocking the agent for longer, but earning more.

- Win criteria - defeat all enemy factions
  - Implement how to defeat a faction:
  - Raid HQ and win

- When rolling for lead investigation success, and failing, keep track of "prob. of no success" which will
  say was the probability that you have failed so many times in a row. E.g. if success is 50%,
  and you failed 3 times in a row, the probability for that is 12.5%.
  Or if making 1% rolls, then at 100 failed attempts it is 36.6%.
  Basically it is a measure of unlucky you are. The lower the percentage, the more unlucky.

## Domain model

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

## Docs

- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs

## Tests

- Address all 🚧 TODOS, except "not implemented yet", in [about_test_suite.md](../design/about_test_suite.md)
- In tests, need a helper that does both `expect(X).toDefined()` and `assertDefined(X)`

## UI improvements

- Apply skill, exhaustion and HP styling with colorful bar from: https://mui.com/x/react-data-grid/style/#styling-rows
- Use Chips for Balance Sheet data grid, same as TurnsDisplay Report

## UI ideas

- for mission evaluation, idea for a table: columns are combat rounds, and rows are units. Each cell tells what
  interesting happened to that unit in that round.
  E.g. Both damage inflicted and taken. Also units terminated and when terminated itself.
  Cell background gradient may denote % of original effective skill.

## Performance Optimization

- replace applicable eslint rules with https://oxc.rs/docs/guide/usage/linter.html
  - need to add it to package.json, CI/CD
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
