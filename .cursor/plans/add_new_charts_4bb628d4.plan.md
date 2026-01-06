---
name: Add New Charts
overview: Delete two obsolete charts (Battle stats, Situation report), add 7 new charts with enhanced data tracking, and implement turn range filtering via radio buttons. This requires model changes to track enemy types, incapacitation, and investigation completion times.
todos:
  - id: model-attacklog
    content: Add enemyType field to AttackLog in turnReportModel.ts
    status: completed
  - id: model-battlestats
    content: Add agentsIncapacitated to BattleStats in turnReportModel.ts
    status: completed
  - id: model-leadreport
    content: Add completionTurn to LeadInvestigationReport in turnReportModel.ts
    status: completed
  - id: impl-attacklog
    content: Update evaluateAttack.ts to populate enemyType
    status: completed
  - id: impl-battlestats
    content: Update evaluateBattle.ts to track incapacitated agents
    status: completed
    dependencies:
      - model-battlestats
  - id: impl-leadreport
    content: Update updateLeadInvestigations.ts to set completionTurn
    status: completed
    dependencies:
      - model-leadreport
  - id: delete-charts
    content: Remove Battle stats and Situation report charts from ChartsScreen.tsx
    status: completed
  - id: turn-filter
    content: Add turn range radio buttons (All/Last 100/Current) to ChartsScreen
    status: completed
  - id: chart-upgrades
    content: Create UpgradesChart.tsx (biaxial line chart)
    status: completed
  - id: chart-outcomes
    content: Create AgentOutcomesChart.tsx (line chart)
    status: completed
    dependencies:
      - impl-battlestats
  - id: chart-enemies
    content: Create EnemiesKilledChart.tsx (stacked area)
    status: completed
    dependencies:
      - impl-attacklog
  - id: chart-damage
    content: Create DamageByEnemyChart.tsx (stacked area)
    status: completed
    dependencies:
      - impl-attacklog
  - id: chart-panic
    content: Create PanicChart.tsx (stacked area)
    status: completed
  - id: chart-leads
    content: Create LeadsChart.tsx (line chart)
    status: completed
    dependencies:
      - impl-leadreport
  - id: chart-factions
    content: Create FactionsChart.tsx (line chart)
    status: completed
  - id: integrate-charts
    content: Update ChartsScreen.tsx and chartsSelectors.ts with all new charts
    status: completed
    dependencies:
      - chart-upgrades
      - chart-outcomes
      - chart-enemies
      - chart-damage
      - chart-panic
      - chart-leads
      - chart-factions
---

# Add New Charts to ChartsScreen

## Phase 1: Model Changes

### 1.1 Add `enemyType` to AttackLog

In [`web/src/lib/model/turnReportModel.ts`](web/src/lib/model/turnReportModel.ts), add `enemyType: EnemyType` field to `AttackLog` type.

Update [`web/src/lib/game_utils/turn_advancement/evaluateAttack.ts`](web/src/lib/game_utils/turn_advancement/evaluateAttack.ts) to populate `enemyType` from the enemy actor.

### 1.2 Add `agentsIncapacitated` to BattleStats

In [`web/src/lib/model/turnReportModel.ts`](web/src/lib/model/turnReportModel.ts), add `agentsIncapacitated: number` to `BattleStats`.

Update [`web/src/lib/game_utils/turn_advancement/evaluateBattle.ts`](web/src/lib/game_utils/turn_advancement/evaluateBattle.ts) to track agents who became incapacitated using `isIncapacitated()`.

### 1.3 Add `completionTurn` to LeadInvestigationReport

In [`web/src/lib/model/turnReportModel.ts`](web/src/lib/model/turnReportModel.ts), add `completionTurn?: number` to `LeadInvestigationReport`.

Update [`web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts`](web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts) to set `completionTurn` when investigation completes.

---

## Phase 2: Delete Obsolete Charts

In [`web/src/components/Charts/ChartsScreen.tsx`](web/src/components/Charts/ChartsScreen.tsx):

- Remove "Battle stats (total over missions)" ChartsPanel (lines 103-132)
- Remove "Situation report" ChartsPanel (lines 134-163)

In [`web/src/redux/selectors/chartsSelectors.ts`](web/src/redux/selectors/chartsSelectors.ts):

- Remove `BattleStatsDatasetRow` type and `battleStats` from `ChartsDatasets`
- Remove `SituationReportDatasetRow` type and `situationReport` from `ChartsDatasets`
- Remove related accumulation logic

---

## Phase 3: Add Turn Range Filter

Add radio button group in [`web/src/components/Charts/ChartsScreen.tsx`](web/src/components/Charts/ChartsScreen.tsx) beside "Back to command center" button with options:

- All turns
- Last 100 turns  
- Current turn

Store selection in Redux selection slice and apply filtering in selectors.

---

## Phase 4: New Chart Files

Each chart file follows the convention in existing charts (e.g., [`AgentSkillChart.tsx`](web/src/components/Charts/AgentSkillChart.tsx)):

- Export main chart component
- Define dataset row type
- Define `getColor()` function for colors
- Define `bldXxxRow()` and `buildXxxDataset()` functions

### 4.1 UpgradesChart.tsx (Biaxial line chart)

- **Left Y axis**: Hit points (red), Weapon damage (orange)
- **Right Y axis**: Training skill gain (dark green), Exhaustion recovery % (yellow), HP recovery % (dark red)
- Data from `GameState`: `agentMaxHitPoints`, `weaponDamage`, `trainingSkillGain`, `exhaustionRecovery`, `hitPointsRecoveryPct`

### 4.2 AgentOutcomesChart.tsx (Line chart)

Cumulative counts from turn reports:

- Unscathed (green)
- Wounded (yellow)
- Incapacitated (orange) - *new field*
- KIA (red)
- Sacked (grey) - from `terminatedAgents` with state `Sacked`

### 4.3 EnemiesKilledChart.tsx (Stacked area line chart)

Cumulative enemies killed by type using `enemyType` from attack logs:

- Initiate, Operative, Handler, Soldier, Lieutenant, Elite, Commander, HighCommander, CultLeader
- Color gradient: green → yellow → orange → red → purple → blue

### 4.4 DamageByEnemyChart.tsx (Stacked area line chart)

Cumulative damage dealt by enemy type to player agents. Derive from attack logs where `attackerType === 'Enemy'` using the new `enemyType` field. Same color scheme as EnemiesKilledChart.

### 4.5 PanicChart.tsx (Stacked area line chart)

Panic stacked by faction source from `PanicBreakdown.factionOperationPenalties`. Total panic is sum of all stacked areas.

### 4.6 LeadsChart.tsx (Line chart)

- Cumulative non-repeatable leads successfully investigated
- Cumulative investigations completed of repeatable leads
- Max time to complete an investigation (last 20 turns) using new `completionTurn` field

### 4.7 FactionsChart.tsx (Line chart)

Per faction:

- Suppression turns (from `faction.suppressionTurns`)
- Cumulative player defensive missions (`mission.operationLevel !== undefined`)
- Cumulative player offensive missions (`mission.operationLevel === undefined`)

---

## Phase 5: Update ChartsScreen

In [`web/src/components/Charts/ChartsScreen.tsx`](web/src/components/Charts/ChartsScreen.tsx):

- Import all 7 new chart components
- Add ChartsPanels for each new chart
- Update `selectChartsDatasets` in [`chartsSelectors.ts`](web/src/redux/selectors/chartsSelectors.ts) to build datasets for new charts

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `turnReportModel.ts` | Add `enemyType` to AttackLog, `agentsIncapacitated` to BattleStats, `completionTurn` to LeadInvestigationReport |
| `evaluateAttack.ts` | Populate `enemyType` field |
| `evaluateBattle.ts` | Track `agentsIncapacitated` |
| `updateLeadInvestigations.ts` | Set `completionTurn` |
| `ChartsScreen.tsx` | Remove 2 charts, add 7 new charts, add turn filter radio buttons |
| `chartsSelectors.ts` | Remove old datasets, add new dataset builders |
| `selectionSlice.ts` | Add turn range filter state |
| 7 new chart files | New components following existing patterns |
