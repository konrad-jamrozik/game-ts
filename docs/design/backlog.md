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
- See if agent "assignment" string can be somehow typed to things like "typeof MissionSiteID | typeof ActivityId"
  where "ActivityId" is "Contracting" | "Espionage"
  and MissionSiteId is string of form mission-site-(some-id)
  and then in code we can check: "if assignment type is really typeof MissionSiteID", then dereference appropriate
  MissionSite value
