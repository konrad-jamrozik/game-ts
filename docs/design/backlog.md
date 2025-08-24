# Backlog

KJA backlog:

- Address all outstanding TODOS: search for `KJA` in the codebase
- introduce terminology of "turn evaluation" and "mission site evaluation". Replace existing terminology as appropriate.
  E.g. `advanceTurnImpl` -> `evalTurn`. or `updateDeployedMissionSite` -> `evalMission`.
- Add a reference doc listing critical code components, like `evalTurn`
- Update the AI instructions to reference the new docs.
- Implement lead expiration logic, or remove the property
- for mission evaluation, idea for a table: columns are combat rounds, and rows are units. Each cell tells what
  interesting happened to that unit in that round.
  E.g. Both damage inflicted and taken. Also units terminated and when terminated itself.
  Cell background gradient may denote % of original effective skill.
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
