<!-- bd663904-23d7-42be-9e4a-eb02dc9f927a b7b1779a-491a-4e59-9631-36a0ab132002 -->
# Add Missions TreeItem to SituationReport in TurnReportDisplay

## Overview

Add a Missions TreeItem node under SituationReport in TurnReportDisplay that shows detailed information for each mission evaluated during the turn. Each mission will display outcome, rounds, rewards (if successful), and comprehensive battle statistics.

## Implementation Plan

### Phase 1: Extend Turn Report Model

**File**: `web/src/lib/model/turnReportModel.ts`

- Add `MissionReport` type with:
- `missionSiteId: string`
- `missionTitle: string`
- `faction: string` (name of the enemy faction this mission was against)
- `outcome: 'Successful' | 'Retreated' | 'All agents lost'`
- `rounds: number` (total rounds in battle)
- `rewards?: MissionRewards`
- `battleStats: BattleStats`
- Add `BattleStats` type tracking:
- Agent counts (deployed, unscathed, wounded, terminated)
- Enemy counts (total, unscathed, wounded, terminated)
- Skill totals (agent skill at battle start, enemy skill at battle start, total agent skill gain)
- Damage statistics (total damage inflicted, total damage taken, percentages)
- Average agent exhaustion gain
- Add `missions: MissionReport[]` to `TurnReport` type

### Phase 2: Extend Battle Evaluation to Track Statistics

**File**: `web/src/lib/turn_advancement/evaluateBattle.ts`

- Extend `BattleReport` type to include:
- `initialAgentEffectiveSkill: number`
- `initialAgentHitPoints: number`
- `initialEnemySkill: number`
- `initialEnemyHitPoints: number`
- `totalDamageInflicted: number` (damage dealt by agents to enemies)
- `totalDamageTaken: number` (damage dealt by enemies to agents)
- `totalAgentExhaustionGain: number`
- Modify `evaluateBattle` to track damage during combat rounds
- Calculate and return all required statistics
- Note: `rounds` is already tracked in `BattleReport`, so it will be available

### Phase 3: Extend Mission Evaluation to Capture Reports

**File**: `web/src/lib/turn_advancement/evaluateDeployedMissionSite.ts`

- Modify return type to include `battleReport: BattleReport`
- Capture agent states before battle (for initial counts)
- Determine mission outcome: 'Successful' | 'Retreated' | 'All agents lost'
- Return complete mission data including battle report with rounds

**File**: `web/src/lib/turn_advancement/evaluateTurn.ts`

- Modify `evaluateDeployedMissionSites` to:
- Capture mission reports with all required data
- Build `MissionReport[]` array
- Return mission reports along with aggregated data
- Add mission reports to `TurnReport` in `evaluateTurn`

### Phase 4: Create Mission Formatting Functions

**File**: `web/src/components/TurnReport/formatMissions.ts` (new)

- Create `formatMissions` function that takes `MissionReport[]` and returns tree structure
- Create `formatMissionReport` for individual mission with:
- Outcome node
- Rounds node (total rounds)
- Rewards node (if successful) with expandable children:
- Money
- Intel
- Funding
- Panic reduction
- Faction threat reduction (per faction)
- Faction suppression (per faction)
- Battle stats node with expandable children:
- Agents deployed
- Agents unscathed
- Agents wounded
- Agents terminated
- Enemies total
- Enemies unscathed
- Enemies wounded
- Enemies terminated
- Total agent skill at battle start
- Total enemy skill at battle start
- Total damage inflicted (with percentage of enemy HP)
- Total damage taken (with percentage of agent HP)
- Total agent skill gain (with percentage of initial skill)
- Average agent exhaustion gain

### Phase 5: Integrate Missions into SituationReport Display

**File**: `web/src/components/TurnReport/formatSituationReport.ts`

- Add `missions?: MissionReport[]` parameter to `formatSituationReport`
- Add Missions node as third item in returned array (after Panic, Factions)
- Call `formatMissions` to generate missions tree structure

**File**: `web/src/components/TurnReport/TurnReportDisplay.tsx`

- Pass `report.missions` to `formatSituationReport` call
- Add 'missions-summary' to `situationReportDefaultExpandedItems` if desired

## Key Implementation Details

- Mission outcome determination:
- 'Successful': all enemies neutralized
- 'Retreated': battleReport.retreated === true
- 'All agents lost': all agents terminated (agentCasualties === deployedAgents.length)
- Percentage calculations:
- Damage inflicted % = (totalDamageInflicted / initialEnemyHitPoints) * 100
- Damage taken % = (totalDamageTaken / initialAgentHitPoints) * 100
- Skill gain % = (totalAgentSkillGain / initialAgentEffectiveSkill) * 100
- Faction rewards display: assume single faction (the one the mission is against), display threat reduction and suppression from `rewards.factionRewards` array
- Use existing `TreeItemLabelWithChip` component for displaying values with chips
- Follow existing formatting patterns from `formatAssets` and `formatSituationReport`

## Files to Modify

1. `web/src/lib/model/turnReportModel.ts` - Add mission report types
2. `web/src/lib/turn_advancement/evaluateBattle.ts` - Track detailed battle statistics
3. `web/src/lib/turn_advancement/evaluateDeployedMissionSite.ts` - Return battle report
4. `web/src/lib/turn_advancement/evaluateTurn.ts` - Build and include mission reports
5. `web/src/components/TurnReport/formatMissions.ts` - New file for mission formatting
6. `web/src/components/TurnReport/formatSituationReport.ts` - Add missions parameter and node
7. `web/src/components/TurnReport/TurnReportDisplay.tsx` - Pass missions data