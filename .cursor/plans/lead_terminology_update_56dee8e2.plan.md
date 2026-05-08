---
name: lead terminology update
overview: Document that Available leads are a subtype of Active leads, and rename the project terminology from “non-repeatable” to “One-time” across source and docs while preserving the existing `repeatable` data model field.
todos:
  - id: document-available-leads
    content: Update lead discovery docs to distinguish Active leads from Available leads.
    status: completed
  - id: rename-doc-terminology
    content: Replace non-repeatable terminology with One-time in non-historical docs.
    status: completed
  - id: rename-code-identifiers
    content: Rename source/test identifiers, constants, comments, and user-facing labels to oneTime / ONE_TIME / One-time.
    status: completed
  - id: verify
    content: Run qcheck and fix any issues introduced by the rename.
    status: completed
isProject: false
---

# Lead Terminology Update

## Scope

- Update [`docs/about_lead_discovery.md`](docs/about_lead_discovery.md) so `Active` no longer implies every active lead can immediately be investigated.
- Add an `Available Lead` subtype: **Available = Active and eligible to start an investigation**, because it has no active investigation and, for one-time leads, has not already been completed.
- Rename “non-repeatable” terminology to **One-time** in docs, comments, labels, tests, and internal identifiers.
- Exclude historical `.cursor/plans` files.
- Preserve the existing `Lead.repeatable` boolean field, since it is a stored model property and the request only targets the inverse terminology.

## Files To Update

- [`docs/about_lead_discovery.md`](docs/about_lead_discovery.md): define Active vs Available and replace “non-repeatable” with “one-time”.
- [`docs/design/about_lead_investigations.md`](docs/design/about_lead_investigations.md): rename the concept section and glossary wording to “One-time lead”.
- [`docs/ai/about_basic_intellect.md`](docs/ai/about_basic_intellect.md) and [`docs/ai/about_basic_intellect_lead_investigations.md`](docs/ai/about_basic_intellect_lead_investigations.md): update AI strategy terminology.
- [`docs/backlog/backlog.md`](docs/backlog/backlog.md) and [`docs/backlog/long_playthrough_research.md`](docs/backlog/long_playthrough_research.md): update prose references.
- [`web/src/lib/model_utils/leadUtils.ts`](web/src/lib/model_utils/leadUtils.ts): update comments around archive and availability rules.
- [`web/src/ai/intellects/basic/constants.ts`](web/src/ai/intellects/basic/constants.ts): rename `NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR` to `ONE_TIME_LEAD_DIFFICULTY_DIVISOR`.
- [`web/src/ai/intellects/basic/leadInvestigation.ts`](web/src/ai/intellects/basic/leadInvestigation.ts): rename local variables/comments such as `nonRepeatableLeads` and `minAgentsForNonRepeatable` to `oneTimeLeads` / `minAgentsForOneTime`.
- [`web/src/ai/intellects/cheatingSpeedrunner/leadInvestigation.ts`](web/src/ai/intellects/cheatingSpeedrunner/leadInvestigation.ts): rename priority helper identifiers from `NonRepeatable` to `OneTime`.
- [`web/src/components/Charts/LeadsChart.tsx`](web/src/components/Charts/LeadsChart.tsx): rename chart color/data keys and label from “Non-repeatable leads completed” to “One-time leads completed”.
- [`web/src/components/LeadsDataGrid/LeadsDataGrid.tsx`](web/src/components/LeadsDataGrid/LeadsDataGrid.tsx): update disabled-row comments.
- [`web/test/ai/factionCycling.test.ts`](web/test/ai/factionCycling.test.ts): rename test names and local variables.

## Implementation Notes

- Use `oneTime` for TypeScript identifiers and `ONE_TIME` for exported constants.
- Use **One-time** as the capitalized human-facing term, and `one-time` in sentence prose where not starting a label.
- Keep `repeatable` as-is in data tables, model types, and UI columns such as `Rpt.` / `repeatable`, because those describe the stored positive property.
- After editing, run `qcheck` and fix any type/lint failures from renamed identifiers.
