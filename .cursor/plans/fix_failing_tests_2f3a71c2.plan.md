---
name: Fix failing tests
overview: "Fix all 8 failing tests from the test:all run: mostly stale test expectations after recent UI/ruleset refactors, plus one AI source bug. The difficulty-0 data fix and actual-difficulty uniform-roll fix are already done."
todos:
  - id: actual-difficulty-formula
    content: "leadRuleset.ts: make getActualLeadDifficulty a uniform integer roll over [D_v, floor(D_v*1.5)] so 150% is reachable"
    status: completed
  - id: lead-ruleset-test
    content: "leadRuleset.test.ts: update getActualLeadDifficulty parametrized cases for the uniform rollIntIncToInc formula"
    status: completed
  - id: eventlog-header-test
    content: "EventLog.test.tsx: drop the columnheader 'Undo' assertion (header is now empty)"
    status: completed
  - id: gamecontrols-test
    content: "GameControls.test.tsx: disambiguate duplicate 'Next turn' buttons via getAllByRole + first match"
    status: completed
  - id: worldevents-test
    content: "eventLogWorldEvents.test.ts: add 'New one-time lead available: Criminal organizations' to expected array"
    status: completed
  - id: cheating-speedrunner-src
    content: "cheatingSpeedrunner/agentAllocation.ts: selectReadyAgents exhaustion filter < 100 -> < MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT"
    status: pending
  - id: verify-basic-intellect
    content: Verify basicIntellect passes with the difficulty-8 data fix
    status: pending
  - id: rework-e2e
    content: Rework App e2e test to navigate to each screen (Leads/Missions/Agents) before grid interactions/verifications; adapt deploy flow
    status: pending
  - id: verify
    content: Run qcheck, then npm run test:all to confirm all 8 tests pass
    status: pending
isProject: false
---

## Fix failing tests

8 tests fail. Most are stale test expectations after recent refactors (world events, drilldown navigation, AI-player card moved into Game Controls). One remaining source bug is AI deploy readiness; difficulty-0 and actual-difficulty uniform roll are already fixed.

### Already fixed

- `[web/src/lib/data_tables/leadsDataTable.ts](web/src/lib/data_tables/leadsDataTable.ts)` (#7): `lead-{facId}-interrogate-leader` difficulty is now `8` (was `0`), so it no longer trips `assertAboveZero` in `getActualLeadDifficulty`. Just verify basicIntellect passes on re-run.

- **Actual lead difficulty can't reach 150% (#2):** `[web/src/lib/ruleset/leadRuleset.ts](web/src/lib/ruleset/leadRuleset.ts)` `getActualLeadDifficulty` now uses `rollIntIncToInc(visibleDifficulty, Math.floor(visibleDifficulty * 1.5), 'lead-actual-difficulty')` for a uniform integer roll over the inclusive range `[D_v, floor(D_v*1.5)]`, so 150% is reachable. `[web/test/unit/leadRuleset.test.ts](web/test/unit/leadRuleset.test.ts)` parametrized cases updated accordingly (six-bucket coverage for `D=10`). `leadInvestigationReducer.test.ts` already expected `15` and passes unchanged. Optional follow-up: update the spec formula in `[docs/design/about_lead_investigations.md](docs/design/about_lead_investigations.md)` (row 248) to describe the uniform inclusive-integer distribution.

### Test-only fixes

- `[web/test/component/EventLog.test.tsx](web/test/component/EventLog.test.tsx)` (#3): the time-travel column now uses `headerName: ''` (see `[web/src/components/EventLog.tsx](web/src/components/EventLog.tsx)` line 113), so there is no `columnheader` named "Undo". Remove the `getByRole('columnheader', { name: 'Undo' })` assertion (line 37); keep the Event/T#/A# header assertions.

- `[web/test/component/GameControls.test.tsx](web/test/component/GameControls.test.tsx)` (#4, #5): `<GameControls>` now embeds `<AIPlayerSection>`, which renders its own "Next turn" button, so `getByRole('button', { name: /next turn/iu })` finds two. Replace those calls (lines 35 and 55) with a first-match lookup, mirroring `getNextTurnButton()` in the e2e test (Game Controls renders before the AI Player card):

```ts
const [nextTurnButton] = screen.getAllByRole('button', { name: /next turn/iu })
assertDefined(nextTurnButton)
await userEvent.click(nextTurnButton)
```

- `[web/test/unit/eventLogWorldEvents.test.ts](web/test/unit/eventLogWorldEvents.test.ts)` (#1): an abandoned `lead-criminal-orgs` investigation makes that lead available again, so `getWorldEventLogMessages` now also emits `"New one-time lead available: Criminal organizations"` (expected behavior, per your decision). Update the `toStrictEqual` (lines 65-68) to include it in order:

```ts
['Investigation completed: Deep state',
 'Investigation abandoned: Criminal organizations',
 'New one-time lead available: Criminal organizations']
```

### Source fix

- `[web/src/ai/intellects/cheatingSpeedrunner/agentAllocation.ts](web/src/ai/intellects/cheatingSpeedrunner/agentAllocation.ts)` (#8): `selectReadyAgents` filters exhaustion `< 100`, but `validateDeployAgents` requires `< 30` (`LEADS_PANEL_READY_MAX_EXHAUSTION_PCT`), so the AI deploys agents the validator rejects. Change line 29 filter to `toF(agent.exhaustionPct) < MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT` (already imported). This also fixes `countReadyAgents`/mission selection consistency.

### Larger rework: App e2e test (#6)

`[web/test/e2e/App.test.tsx](web/test/e2e/App.test.tsx)` assumes leads/missions/agents grids are all on one screen, but the default view in `[web/src/components/App.tsx](web/src/components/App.tsx)` now renders only `GameControls + OperationsCard + EventLog`; each grid lives behind a view flag (`viewLeads`/`viewMissions`/`viewAgents`). The grid-row helpers in `[web/test/utils/testComponentUtils.ts](web/test/utils/testComponentUtils.ts)` rely on `screen.getAllByRole('row')`, which only works when that grid is mounted.

Rework approach (keep the same 12-step scenario):
- Navigate to the relevant screen before each grid interaction/verification by dispatching the matching action (`setViewLeads`/`setViewMissions`/`setViewAgents`) from `selectionSlice`, or by clicking the corresponding nav button in Game Controls. The Turn label stays in Game Controls and remains visible everywhere.
- step1: verify "Criminal organizations" after switching to the Leads screen; verify agents after switching to the Agents screen.
- step3/step7 (select agents), step4 (select lead), step6 (select mission): switch to that screen first, then call the existing `selectAgents`/`selectLead`/`selectMission` helpers.
- step8 (Deploy): adapt to the current deploy flow, which now goes through `[web/src/components/Missions/MissionDeploymentActions.tsx](web/src/components/Missions/MissionDeploymentActions.tsx)`; confirm the "Deploy" button/selectors still match on the Missions screen.
- Expect to iterate: run just this test file and adjust navigation/selectors until green.

### Verification

- Run `qcheck` (per AGENTS.md) after edits for type/lint.
- Re-run `npm run test:all` to confirm all 8 are green (the test fixes can only be confirmed by running the suite).
