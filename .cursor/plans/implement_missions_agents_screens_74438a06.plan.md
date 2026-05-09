---
name: implement missions agents screens
overview: Implement the Missions and Agents UI specs with a shared agent readiness predicate, dedicated screens, and compact command-center summaries. The work should be staged so shared rules land first, Missions and Agents screens can be built in parallel, and command-center integration happens in one final pass to avoid conflicts.
todos:
  - id: shared-readiness
    content: Create shared Ready/Exhausted/Away/Recovering agent predicates and update validation/counts to use them, including deployable InTraining agents.
    status: completed
  - id: missions-screen
    content: Build the dedicated Missions screen, mission-specific agent picker, deploy actions, tests, and spec wording update.
    status: completed
  - id: agents-screen
    content: Build the dedicated Agents screen, roster-management actions, full roster grid integration, and tests.
    status: completed
  - id: command-center-integration
    content: Wire navigation, App branches, command-center grid/action removal, Situation Report summaries, and mission details return behavior.
    status: completed
  - id: verify
    content: Run qcheck and fix introduced diagnostics or failing tests.
    status: completed
isProject: false
---

# Implement Missions And Agents Screens

## Key Decision

Use the Leads `Ready` predicate as the single player-facing task readiness predicate for Leads, Missions, Agents title counts, and summaries:

- assignment is `Standby` or `Training`
- state is not `InTransit`
- exhaustion is less than 30%

This means an agent in `InTraining` state with `Training` assignment is Ready and can be deployed to a mission. The deploy validator should stop using `validateAvailableAgents` and instead validate the shared Ready predicate plus mission state and transport capacity.

Also update the Missions spec wording in [docs/ui/ui_missions_screen.md](docs/ui/ui_missions_screen.md), because it still says deployment requires `Available` and exhaustion below 100.

## Phase 1: Shared Foundation

Do this as one serial step before parallel work, because both screens depend on it.

- Add shared readiness/filter helpers in a low-level file importable by both components and validation, preferably [web/src/lib/model_utils/agentUtils.ts](web/src/lib/model_utils/agentUtils.ts) or a sibling `agentReadinessUtils.ts`.
- Centralize:
  - `isReadyAgentForTask(agent)` using the Leads `Ready` predicate.
  - `isExhaustedAgentForTask(agent)` using the Leads `Exhausted` predicate.
  - `isAwayAgentForTask(agent)` and `isRecoveringAgentForTask(agent)` if useful for filters and summaries.
  - the 30% threshold as a named constant.
- Refactor [web/src/components/Leads/AgentsDataGridForLeads.tsx](web/src/components/Leads/AgentsDataGridForLeads.tsx) and [web/src/components/AgentsDataGrid/agentCounts.ts](web/src/components/AgentsDataGrid/agentCounts.ts) to use the shared helpers instead of local duplicate predicates.
- Update [web/src/lib/model_utils/validatePlayerActions.ts](web/src/lib/model_utils/validatePlayerActions.ts):
  - Lead investigation validation uses the shared Ready predicate.
  - Mission deployment validation uses the shared Ready predicate, so `InTraining` + `Training` agents can deploy.
  - Keep mission `Active` validation and transport-cap validation unchanged.
- Add or update focused validation tests for deploy with an `InTraining` + `Training` Ready agent and for non-ready cases.

## Phase 2A: Missions Screen Work

This can run in parallel with Phase 2B after Phase 1.

- Create a dedicated Missions screen under `web/src/components/Missions/`, likely:
  - `MissionsScreen.tsx`
  - `MissionDeploymentActions.tsx`
  - `AgentsDataGridForMissions.tsx`
- Reuse existing [web/src/components/MissionsDataGrid/MissionsDataGrid.tsx](web/src/components/MissionsDataGrid/MissionsDataGrid.tsx), [web/src/components/MissionsDataGrid/getMissionsColumns.tsx](web/src/components/MissionsDataGrid/getMissionsColumns.tsx), and existing mission selection state.
- Build `AgentsDataGridForMissions` from the Leads agent-grid pattern:
  - same Ready/Away/Exhausted/Recovering filter behavior and counts
  - only Ready rows selectable
  - columns tailored to deployment: ID, State, Assignment, CR, Skill, HP, Exhaustion, Unavailable
  - use the shared readiness helpers from Phase 1
- Move deploy UI out of [web/src/components/GameControls/PlayerActions.tsx](web/src/components/GameControls/PlayerActions.tsx) into `MissionDeploymentActions.tsx`.
- Implement button labels from [docs/ui/ui_missions_screen.md](docs/ui/ui_missions_screen.md): `Select a mission`, `Select any ready agent`, `Select an active mission`, and `Deploy {agentCount} on {missionTarget}`.
- Update the Missions spec discrepancy in [docs/ui/ui_missions_screen.md](docs/ui/ui_missions_screen.md) so deployment eligibility matches the shared Ready predicate, including `InTraining` + `Training` agents.
- Add focused component tests for deploying Ready agents, including a Ready training agent.

## Phase 2B: Agents Screen Work

This can run in parallel with Phase 2A after Phase 1.

- Create a dedicated Agents screen under `web/src/components/Agents/`, likely:
  - `AgentsScreen.tsx`
  - `AgentManagementActions.tsx`
- Reuse [web/src/components/AgentsDataGrid/AgentsDataGrid.tsx](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx) as the full roster grid.
- Move roster-management actions out of [web/src/components/GameControls/PlayerActions.tsx](web/src/components/GameControls/PlayerActions.tsx): hire, sack, recall, assign to contracting, assign to training.
- Keep Buy Upgrade behavior in the command center, either by leaving a smaller command-center actions component or extracting an `UpgradeActions` component.
- Ensure `AgentsDataGrid` title and `Agents summary` counts use the shared Ready/Exhausted definitions from Phase 1.
- Add focused component tests for agent screen action button states and at least one roster-management success path.

## Phase 3: Command-Center Integration

Do this as one serial pass after both screens are built, because these files would otherwise be conflict-prone.

- Extend [web/src/redux/slices/selectionSlice.ts](web/src/redux/slices/selectionSlice.ts):
  - add `viewMissions` and `viewAgents`
  - add setters/clearers
  - make screen setters clear other screen flags and `viewMissionDetailsId` so full-screen states do not overlap
  - include new flags in `clearAllSelection`
- Update [web/src/components/App.tsx](web/src/components/App.tsx):
  - add branches for `MissionsScreen` and `AgentsScreen`
  - remove `MissionsDataGrid` and `AgentsDataGrid` imports if no longer used by the command center
  - remove the middle command-center `Grid`/`Stack` whose only children are `MissionsDataGrid` and `AgentsDataGrid`
  - keep the other command-center columns intact: event/debug, game controls, assets/capacities/upgrades/situation report/turn report
  - keep `MissionDetailsScreen` as its own full-screen branch
- Update [web/src/components/GameControls/GameControls.tsx](web/src/components/GameControls/GameControls.tsx):
  - add `Missions` and `Agents` navigation buttons
  - place `Missions` to the left of `Leads`, and `Agents` to the left of `Leads` as specified; if all three share a row, use `Agents`, `Missions`, `Leads`, `Charts` in a stable order or split rows if width requires it
- Replace [web/src/components/GameControls/PlayerActions.tsx](web/src/components/GameControls/PlayerActions.tsx) on the command center with a much smaller command-center action surface:
  - remove mission deployment from the command center because it is owned by `MissionsScreen`
  - remove hire/sack/recall/contracting/training from the command center because they are owned by `AgentsScreen`
  - remove lead investigation from the command center because it is already owned by `LeadsScreen`
  - keep `Buy upgrade` on the command center, preferably by extracting `UpgradeActions.tsx` or by narrowing `PlayerActions.tsx` to upgrade-only behavior
  - keep command-center alert handling for upgrade validation errors
- Update [web/src/components/SituationReportCard.tsx](web/src/components/SituationReportCard.tsx):
  - keep Leads summary
  - add Missions summary rows: `Mission sites`, `Expiring soon`, `Deployed missions`
  - add Agents summary rows: `Ready agents`, `Exhausted agents`, `Recovering agents`, `Away agents`
  - compute Ready/Exhausted using the shared helpers from Phase 1
- Ensure Mission Details back/Escape behavior returns to the command center. The least invasive option is to have `setViewMissionDetails` clear other full-screen view flags.

### Removing Existing Command-Center Views Safely

Current command-center Missions and Agents functionality is split across three places:

- [web/src/components/App.tsx](web/src/components/App.tsx) renders `MissionsDataGrid` and `AgentsDataGrid`.
- [web/src/components/GameControls/PlayerActions.tsx](web/src/components/GameControls/PlayerActions.tsx) contains actions that operate on selected missions, agents, leads, and upgrades.
- [web/src/redux/slices/selectionSlice.ts](web/src/redux/slices/selectionSlice.ts) stores shared selections and filter state used by the command center and dedicated screens.

The removal should therefore be a move, not a delete:

- Move mission deployment UI from `PlayerActions` to `MissionDeploymentActions`.
- Move roster-management UI from `PlayerActions` to `AgentManagementActions`.
- Keep the existing Redux actions, validators, reducers, event logging, and selection state unless a rename is required for clarity.
- Keep `selectedMissionId` and `agents` as shared selection state, because the dedicated Missions screen still needs one selected mission and many selected agents.
- Keep `MissionsDataGrid` and `AgentsDataGrid` components, but mount them only inside their dedicated screens.
- After the move, the command center should expose:
  - navigation buttons to dedicated screens
  - compact Situation Report summaries
  - upgrade purchasing, because upgrades are not moved by these specs

This prevents behavior loss while removing the large operational grids from the command center.

### Functionality Retention Checklist

Before considering the implementation complete, verify that every existing command-center capability still exists on a dedicated screen or remains intentionally on the command center.

Missions functionality retained on `MissionsScreen`:

- Active/deployed mission list with archived view and counts.
- Single active mission selection.
- Mission details button and mission details screen.
- Deploy selected agents to selected mission.
- Transport-cap validation and error message.
- Mission state transition from `Active` to `Deployed`.
- Assigned agents get mission assignment, `OnMission` state, and `missionsTotal` increment.
- Agent and mission selections clear after deployment.
- `Next turn`, `Back to command center`, and `Escape` behavior.

Agents functionality retained on `AgentsScreen`:

- Full current roster view.
- Available, recovering, stats, and terminated views.
- Terminated agents remain inspectable.
- Career/stat columns remain available.
- Multi-agent selection.
- Selected-agent combat rating display.
- Hire agent.
- Sack selected available agents.
- Assign selected available agents to contracting.
- Assign selected available agents to training, including training-cap validation.
- Recall selected contracting, investigating, and training agents.
- Existing roster action validation messages.
- `Next turn`, `Back to command center`, and `Escape` behavior.

Command-center functionality intentionally retained:

- Game controls: next turn, expand/collapse all, reset controls, screen navigation.
- Upgrade purchasing.
- Assets, capacities, upgrades, Situation Report, Turn Report, event/debug panels.
- Leads and Charts navigation.
- Compact Leads, Missions, and Agents summaries in Situation Report.

## Phase 4: Verification

- Run `qcheck` from `web/` after implementation.
- Use IDE lints on changed files and fix introduced diagnostics.
- If tests fail because existing component tests assumed command-center placement of grids/actions, update those tests to use the new dedicated screens rather than weakening assertions.

## Parallelization Strategy

Use three build phases:

1. Shared foundation: one worker only. This avoids duplicated predicates and prevents Missions/Agents workers from editing the same validation/count files differently.
2. Parallel screen workers:
   - Missions worker owns `web/src/components/Missions/`, mission deployment action tests, and mission spec wording.
   - Agents worker owns `web/src/components/Agents/`, roster action tests, and agent-grid/count wiring that does not conflict with Missions files.
3. Integration worker: one worker owns `App.tsx`, `GameControls.tsx`, `selectionSlice.ts`, and `SituationReportCard.tsx` so navigation and summary changes do not conflict.

This preserves code reuse by making readiness/count logic shared before screen work begins, while keeping the broad UI work parallel after the common rule is in place.
