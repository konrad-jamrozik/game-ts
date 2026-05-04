---
name: Lead Mechanism Migration
overview: Migrate lead investigations from accumulated Intel/resistance to progress points, hidden actual difficulty, cumulative probability, and success chance ranges. Keep the old lead investigation design only as a legacy doc with a warning that points to the new design document.
todos:
  - id: legacy-doc
    content: Move old lead investigation doc to `docs/legacy/` and add legacy warning that points to the new design doc.
    status: pending
  - id: model-ruleset
    content: Replace Intel/resistance model with progress, actual difficulty, team power, cumulative chance, and turn chance helpers.
    status: pending
  - id: turn-flow
    content: Update investigation turn advancement and agent removal to use progress mechanics and proportional progress loss.
    status: pending
  - id: ui-range
    content: Update lead investigation UI to display progress, projection, efficiency, and rounded success chance ranges.
    status: pending
  - id: rebalance-tests
    content: Rebalance lead difficulty values, update tests, and verify with `qcheck`.
    status: pending
isProject: false
---

# Lead Investigation Migration Plan

## Scope

Migrate the game to the lead investigation mechanism now documented in [docs/design/about_lead_investigations.md](docs/design/about_lead_investigations.md). The old Intel/resistance design should remain only as legacy documentation with a short warning intro that points to the current doc.

## Documentation Changes

- Keep the old Intel/resistance design in `docs/legacy/about_lead_investigations_legacy.md`.
- Add a warning at the top of the moved file only, for example: this is legacy documentation for the old Intel/resistance system; use [docs/design/about_lead_investigations.md](docs/design/about_lead_investigations.md) for the current design.
- Do not otherwise rewrite the old lead doc.
- Optionally update any references from code comments or tests that still point to `docs/design/about_lead_investigations.md` so they point either to the legacy doc or to the new design, depending on whether the referenced behavior is old or new.

## Data Model

Update [web/src/lib/model/leadModel.ts](web/src/lib/model/leadModel.ts):

- Replace `accumulatedIntel` with `progress` on `LeadInvestigation`.
- Add hidden `actualDifficulty` to `LeadInvestigation`.
- Keep `difficulty` on `Lead` as visible difficulty and baseline Skill 100 turn count.

Update [web/src/lib/factories/leadInvestigationFactory.ts](web/src/lib/factories/leadInvestigationFactory.ts):

- Initialize `progress: 0`.
- Require or compute `actualDifficulty` when an investigation is created.
- Prefer computing `actualDifficulty` in the reducer that knows the lead difficulty, rather than inside the factory with hidden global lookup.

Update [web/src/redux/reducers/leadReducers.ts](web/src/redux/reducers/leadReducers.ts):

- In `startLeadInvestigation`, fetch the lead and set `actualDifficulty = lead.difficulty * (1 + rand.get('lead-actual-difficulty') * 0.5)`.
- Use a new rand label such as `lead-actual-difficulty` so tests can make the hidden difficulty deterministic.

## Ruleset Changes

Refactor [web/src/lib/ruleset/leadRuleset.ts](web/src/lib/ruleset/leadRuleset.ts):

- Remove old Intel concepts from the public API:
  - `getLeadSuccessChance(accumulatedIntel, difficulty)`
  - `getLeadResistance(accumulatedIntel, difficulty)`
  - `getLeadIntelFromAgents(agents, currentIntel, difficulty)`
  - `getLeadInvestigationIntelFromSkillSum(agents)`
- Add new functions:
  - `getLeadTeamPower(agents)` using the existing `LEAD_SCALING_EXPONENT` behavior.
  - `getLeadProgressFromAgents(agents)` returning team power per turn.
  - `getLeadCumulativeSuccessChance(progress, actualDifficulty)` using `min(1, progress / actualDifficulty) ** 3`.
  - `getLeadTurnSuccessChance(previousProgress, currentProgress, actualDifficulty)` using `(currentCumulative - previousCumulative) / (1 - previousCumulative)`, with an explicit 100% result when previous cumulative is already 1.
  - `getLeadProgressLoss(progress, oldSkillSum, newSkillSum)` preserving the current proportional loss behavior.
  - `getLeadTurnSuccessChanceRange(previousProgress, currentProgress, visibleDifficulty)` returning lower and upper turn chances for `actualDifficulty = visibleDifficulty * 1.5` and `actualDifficulty = visibleDifficulty`.
- Remove unused constants from [web/src/lib/data_tables/constants.ts](web/src/lib/data_tables/constants.ts): `AGENT_LEAD_INVESTIGATION_INTEL`, `LEAD_DIFFICULTY_MULTIPLIER`, and `LEAD_RESISTANCE_EXPONENT`. Keep `LEAD_SCALING_EXPONENT`.

## Turn Advancement

Update [web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts](web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts):

- Process an active investigation by capturing `previousProgress` before adding progress.
- Add progress from assigned agents.
- Roll against `getLeadTurnSuccessChance(previousProgress, currentProgress, investigation.actualDifficulty)`.
- Keep exhaustion, forced withdrawal, completion, mission creation, and faction termination behavior unchanged.
- Update `LeadInvestigationReport` in [web/src/lib/model/turnReportModel.ts](web/src/lib/model/turnReportModel.ts) from Intel-specific fields to progress-specific fields, for example `progress`, `progressGain`, and `successChance`.

## Agent Removal And Recency

Update [web/src/redux/reducers/agentReducers.ts](web/src/redux/reducers/agentReducers.ts):

- Replace `getLeadIntelLoss(...)` usage with `getLeadProgressLoss(...)`.
- Apply the same proportional recalibration to `investigation.progress`.
- Keep abandoning investigations when all agents are removed.

## UI Migration

Update [web/src/components/LeadInvestigationsDataGrid/LeadInvestigationsDataGrid.tsx](web/src/components/LeadInvestigationsDataGrid/LeadInvestigationsDataGrid.tsx):

- Build rows using `progress`, projected progress, progress gain, team efficiency, and success chance range.
- Remove resistance display because resistance no longer exists.
- Compute success chance range from visible difficulty using the range helper, not from hidden `actualDifficulty`, so the UI does not reveal the hidden threshold.

Update [web/src/components/LeadInvestigationsDataGrid/getLeadInvestigationsColumns.tsx](web/src/components/LeadInvestigationsDataGrid/getLeadInvestigationsColumns.tsx):

- Rename `Intel` to `Progress`.
- Rename `Proj. intel` to `Proj.` or `Projected Progress`.
- Replace single `Succ %` with a range such as `~5% - ~26%`, using lower rounded down and upper rounded up.
- Remove the `Resistance` column.

Update [web/src/components/Common/columnWidths.ts](web/src/components/Common/columnWidths.ts):

- Replace Intel/resistance/projected-intel width keys with progress/projection/success-range keys as needed.

## Lead Difficulty Rebalance

Update [web/src/lib/data_tables/leadsDataTable.ts](web/src/lib/data_tables/leadsDataTable.ts):

- Change the comment for `Difficulty` to describe baseline Skill 100 turns and visible progress denominator.
- Rebalance existing difficulty values from old Intel scale to new turn-count scale. Use the proposal’s rough mapping as a first pass:
  - Intro leads: `2-4`
  - Small faction leads: `5-8`
  - Midgame location leads: `8-15`
  - Major faction leads: `15-25`
  - Endgame leads: `25-40`
- After implementation, tune values based on the AI speedrunner and long-playthrough behavior.

## Tests

Update or replace current lead ruleset tests:

- [web/test/unit/leadRuleset.test.ts](web/test/unit/leadRuleset.test.ts): cover team power, progress gain, cumulative success chance, turn success chance, and success chance ranges.
- [web/test/unit/getLeadIntelLoss.test.ts](web/test/unit/getLeadIntelLoss.test.ts): rename/rework to progress loss.
- [web/test/unit/getLeadIntelDecay.test.ts](web/test/unit/getLeadIntelDecay.test.ts): remove or rename if it is a duplicate stale test.
- Add reducer or turn-advancement coverage for deterministic `actualDifficulty` using `rand.set('lead-actual-difficulty', ...)` and deterministic investigation rolls using `rand.set('lead-investigation', ...)`.
- Update [web/test/ai/cheatingSpeedrunner.test.ts](web/test/ai/cheatingSpeedrunner.test.ts) expectations if the rebalance changes win timing.

## Verification

- Use IDE lints after edits.
- Run `qcheck` after the substantive migration.
- Do not run `npx`, `tsc`, `build`, or the full test suite directly.

## Implementation Order

1. Move the legacy doc and add the warning intro.
2. Change the model and factory/reducer creation path for `progress` and `actualDifficulty`.
3. Refactor the ruleset and unit tests around progress, cumulative chance, and turn chance.
4. Update turn advancement and agent removal.
5. Update UI rows/columns and formatting.
6. Rebalance lead difficulties.
7. Run `qcheck` and fix issues surfaced by types, lint, and tests.
