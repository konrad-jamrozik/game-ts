# Turn Advancement Report - Implementation Plan

## Overview

This document outlines the detailed implementation plan for the "Turn Advancement Report" feature, which will provide a
comprehensive, interactive view of all events that occur during turn advancement in the game.

## Architecture Summary

The implementation follows a three-layer architecture:

1. **Backend Layer**: Functions return structured report objects containing all relevant data
2. **Data Model Layer**: TypeScript interfaces defining the report structure hierarchy
3. **UI Layer**: React component using MUI TreeView to display the hierarchical report data

## Key Design Decisions

Based on project requirements, the following design decisions have been made:

1. **Testing Infrastructure**: Tests are located in `web/test/unit/` directory. New test files will follow the
   existing pattern (e.g., `web/test/unit/evaluateTurn.test.ts`).

2. **Event System Integration**:
   - Remove `postMissionCompletedEvent` functionality and `addMissionCompletedEvent` from `eventsSlice.ts`
   - TurnReport will integrate via the existing `advanceTurn` event matcher in `eventsMiddleware.ts`
   - The `advanceTurn` action will return the TurnReport object included in the event
   - Event log entries "Turn X started" will be clickable to open the turn report modal

3. **Console Logging**: Existing combat console.log statements will be retained for debugging purposes.

4. **Report Persistence**: TurnReports will be persisted in the `eventsSlice`. The `advanceTurn` matcher
   in `eventsMiddleware.ts` will trigger an `addTurnAdvancementEvent` reducer to store reports.

5. **UI Display**: Turn Reports will open as a modal dialog when clicking on "Turn X started" entries in the event log.

## Data Model Design

### Core Report Types

```typescript
// Base report type
type BaseReport = {
  timestamp: number;
  turn: number;
}

// Main turn report
type TurnReport = BaseReport & {
  assets: AssetsReport;
  panic: PanicReport;
  factions: FactionReport[];
  missionSites: DeployedMissionSiteReport[];
}

// Asset tracking
type AssetsReport = {
  money: ValueChange;
  intel: ValueChange;
  moneyDetails: MoneyBreakdown;
  intelDetails: IntelBreakdown;
}

type ValueChange = {
  previous: number;
  current: number;
  delta: number;
}

type MoneyBreakdown = {
  agentUpkeep: number;
  contractingEarnings: number;
  fundingIncome: number;
  hireCosts: number;
  missionRewards: number;
}

type IntelBreakdown = {
  espionageGathered: number;
  missionRewards: number;
}

// Panic tracking
type PanicReport = {
  change: ValueChange;
  breakdown: PanicBreakdown;
}

type PanicBreakdown = {
  factionContributions: Array<{
    factionId: string;
    factionName: string;
    contribution: number;
  }>;
  missionReductions: Array<{
    missionSiteId: string;
    missionTitle: string;
    reduction: number;
  }>;
}

// Faction tracking
type FactionReport = {
  factionId: string;
  factionName: string;
  isDiscovered: boolean;
  threatLevel: ValueChange;
  threatIncrease: ValueChange;
  suppression: ValueChange;
  details: FactionDetails;
}

type FactionDetails = {
  baseIncrease: number;
  missionImpacts: Array<{
    missionSiteId: string;
    missionTitle: string;
    threatReduction?: number;
    suppressionAdded?: number;
  }>;
  suppressionDecay: number;
}

// Mission site tracking
type DeployedMissionSiteReport = {
  missionSiteId: string;
  missionTitle: string;
  result: 'successful' | 'failed' | 'retreated';
  rewards?: MissionRewards;
  battle?: BattleReport;
  agentReports: AgentMissionReport[];
  enemyReports: EnemyMissionReport[];
}

// Battle tracking
type BattleReport = {
  rounds: number;
  totalRounds: number;
  retreated: boolean;
  agentCasualties: number;
  enemyCasualties: number;
  combatRounds: CombatRoundReport[];
}

type CombatRoundReport = {
  roundNumber: number;
  attacks: AttackReport[];
  roundSummary: RoundSummary;
}

type AttackReport = {
  attackerId: string;
  attackerName: string;
  attackerType: 'agent' | 'enemy';
  targetId: string;
  targetName: string;
  targetType: 'agent' | 'enemy';
  roll: number;
  threshold: number;
  success: boolean;
  damage: number;
  exhaustion: number;
  skillGained: number;
}

type RoundSummary = {
  actors: Array<{
    id: string;
    name: string;
    type: 'agent' | 'enemy';
    effectiveSkillPercent: number;
    hitPointsPercent: number;
    isTerminated: boolean;
  }>;
}

// Agent mission performance
type AgentMissionReport = {
  agentId: string;
  agentName: string;
  startingHitPoints: number;
  endingHitPoints: number;
  hitPointsLost: number;
  exhaustionGained: number;
  recoveryTime: number;
  skillPointsGained: number;
  skillBreakdown: {
    fromAttacks: number;
    fromDefenses: number;
    fromSurvival: number;
  };
  combatActions: AttackReport[];
}

// Enemy mission performance
type EnemyMissionReport = {
  enemyId: string;
  enemyName: string;
  enemyType: string;
  startingHitPoints: number;
  endingHitPoints: number;
  hitPointsLost: number;
  wasTerminated: boolean;
  combatActions: AttackReport[];
}
```

## Implementation Milestones

### Milestone 1: Display Basic Turn Stats

**Objective**: Implement asset tracking and display in TreeView

#### Phase 1.1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateTurn.ts`
- Modify `updatePlayerAssets` to return `AssetsReport`
- Track detailed breakdown of money changes
- Track detailed breakdown of intel changes
- Update `evaluateTurn` to build and return initial `TurnReport`

#### Phase 1.2: Unit Tests

- **File**: `web/test/unit/evaluateTurn.test.ts`
- Test asset report generation with various scenarios
- Test money breakdown calculations
- Test intel breakdown calculations
- Verify report structure correctness

#### Phase 1.3: UI Component

- **File**: `web/src/components/TurnReport/TurnReportTree.tsx` (new)
- Create basic TreeView structure
- Implement Assets node with Money and Intel sub-nodes
- Display change values in "previous → current (±delta)" format
- Add expandable details for calculation breakdowns

### Milestone 2: Display Factions Stats

**Objective**: Implement panic and faction tracking

#### Phase 2.1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateTurn.ts`
- Modify `updatePanic` to return `PanicReport`
- Modify `updateFactions` to return `FactionReport[]`
- Track panic contributions by faction
- Track mission impacts on factions
- Include suppression decay calculations

#### Phase 2.2: Unit Tests

- **File**: `web/test/unit/evaluateTurn.test.ts`
- Test panic report generation
- Test faction report generation
- Test suppression decay calculations
- Test mission reward application to factions

#### Phase 2.3: UI Component

- **File**: `web/src/components/TurnReport/TurnReportTree.tsx`
- Add Panic node with expandable breakdown
- Add Factions node with sub-nodes for each discovered faction
- Display faction stats with change indicators
- Show detailed mission impacts when expanded

### Milestone 3: Display Basic Mission Site Stats

**Objective**: Implement mission site result tracking

#### Phase 3.1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateDeployedMissionSite.ts`
- Create and return `DeployedMissionSiteReport`
- Track mission success/failure/retreat status
- Include mission rewards in report
- Calculate agent and enemy casualties

#### Phase 3.2: Unit Tests

- **File**: `web/test/unit/evaluateDeployedMissionSite.test.ts` (new)
- Test mission site report generation
- Test different mission outcomes
- Test reward tracking
- Test casualty counting

#### Phase 3.3: UI Component

- **File**: `web/src/components/TurnReport/TurnReportTree.tsx`
- Add Mission Sites node
- Create sub-nodes for each deployed mission
- Display success/failure status with appropriate icons
- Show rewards for successful missions
- Display casualty summary

### Milestone 4: Display Detailed Mission Site Stats

**Objective**: Implement detailed combat tracking

#### Phase 4.1: Backend Logic

- **Files**:
  - `web/src/lib/turn_advancement/evaluateBattle.ts`
  - `web/src/lib/turn_advancement/evaluateAttack.ts`
- Modify `evaluateBattle` to return enhanced `BattleReport`
- Create `CombatRoundReport` for each round
- Modify `evaluateAttack` to return `AttackReport`
- Track agent and enemy performance metrics
- Build `AgentMissionReport` and `EnemyMissionReport`

#### Phase 4.2: Unit Tests

- **File**: `web/test/unit/evaluateBattle.test.ts` (new)
- Test battle report generation
- Test combat round tracking
- Test attack report details
- Test agent/enemy performance tracking
- Test skill point calculations

#### Phase 4.3: UI Component

- **Files**:
  - `web/src/components/TurnReport/TurnReportTree.tsx`
  - `web/src/components/TurnReport/CombatRoundGrid.tsx` (new)
- Add Agents sub-node under each mission site
- Display detailed agent performance metrics
- Show round-by-round combat actions
- Add Enemies sub-node with enemy details
- Create Combat Rounds sub-node with tabular view
- Implement color-coded skill/HP percentage display

## Implementation Details

### Backend Modifications

1. **Function Return Types**: Each evaluating function will be modified to return both its side effects
   (state mutations) and a report object.

2. **Report Composition**: Reports will be composed hierarchically, with child reports embedded in parent reports.

3. **Backward Compatibility**: During transition, maintain existing functionality while adding report generation.

### UI Component Structure

The UI will follow a split-panel design with TreeView navigation and scrollable details:

```typescript
// Modal with split panel layout
<TurnReportModal>
  <SplitPanel>
    {/* Left Panel: TreeView Navigation (all nodes collapsed by default) */}
    <TurnReportTree report={turnReport} defaultExpanded={[]}>
      <TreeItem nodeId="assets" label="Assets">
        <TreeItem nodeId="assets-money" label={MoneyDisplay} />
        <TreeItem nodeId="assets-intel" label={IntelDisplay} />
      </TreeItem>
      
      <TreeItem nodeId="panic" label={PanicDisplay}>
        {/* Expandable panic breakdown */}
      </TreeItem>
      
      <TreeItem nodeId="factions" label="Factions">
        {factions.map(faction => (
          <TreeItem key={faction.id} nodeId={`faction-${faction.id}`}>
            {/* Faction details */}
          </TreeItem>
        ))}
      </TreeItem>
      
      <TreeItem nodeId="missions" label="Mission Sites">
        {missionSites.map(site => (
          <TreeItem key={site.id} nodeId={`mission-${site.id}`}>
            <TreeItem nodeId={`mission-${site.id}-agents`} label="Agents">
              {/* Agent details */}
            </TreeItem>
            <TreeItem nodeId={`mission-${site.id}-enemies`} label="Enemies">
              {/* Enemy details */}
            </TreeItem>
            <TreeItem nodeId={`mission-${site.id}-rounds`} label="Combat Rounds">
              <CombatRoundGrid rounds={site.battle.combatRounds} />
            </TreeItem>
          </TreeItem>
        ))}
      </TreeItem>
    </TurnReportTree>
    
    {/* Right Panel: Scrollable Details View */}
    <DetailsPanel>
      {/* All report sections rendered in continuous scrollable view */}
      <AssetsDetails data={report.assets} />
      <PanicDetails data={report.panic} />
      <FactionsDetails data={report.factions} />
      <MissionSitesDetails data={report.missionSites} />
    </DetailsPanel>
  </SplitPanel>
</TurnReportModal>
```

### State Management

1. **Redux Integration**:
   - Store TurnReport in `eventsSlice` via `addTurnAdvancementEvent` reducer
   - Reports persist across turns for historical viewing
   - Access reports through event log entries

2. **Event System Integration**:
   - Remove `postMissionCompletedEvent` and `addMissionCompletedEvent`
   - Use turn report as single source of truth for turn events
   - Integrate with existing `advanceTurn` event matcher

### Testing Strategy

1. **Unit Tests**:
   - Test each report generation function independently
   - Verify report structure matches interfaces
   - Test edge cases (no missions, no agents, etc.)

2. **Integration Tests**:
   - Test full turn evaluation with report generation
   - Verify report composition and nesting
   - Test UI component with sample reports

## Migration Plan

1. **Phase 1**: Implement report generation alongside existing functionality
2. **Phase 2**: Add UI component and integrate with events system
3. **Phase 3**: Remove deprecated event posting (`postMissionCompletedEvent`)
4. **Phase 4**: Optimize and refine based on user feedback

## Performance Considerations

1. **Report Size**: Monitor report object size, especially for long battles
2. **UI Rendering**: Use React.memo for TreeItem components to prevent unnecessary re-renders
3. **Memory Management**: Handled automatically by existing `UNDO_LIMIT` in `store.ts`

## Future Enhancements

1. **Report Export**: Allow exporting turn reports as JSON or formatted text
2. **Report Comparison**: Compare reports between turns
3. **Report Filtering**: Filter report to show only specific types of information
4. **Report Search**: Search within report for specific agents, enemies, or events
5. **Visual Analytics**: Add charts for damage distribution, skill gains, etc.

## UI Design Specifications

1. **TreeView Layout**: The modal will use a split-panel design similar to GitHub's PR review interface:
   - Left panel: TreeView navigation with all nodes collapsed by default
   - Right panel: Scrollable details view showing all collapsible blocks in continuous manner
   - Reference implementation: MUI TreeView GitHub Example (https://mui.com/x/react-tree-view/)

2. **Report Persistence**: Reports are automatically managed by the existing `UNDO_LIMIT` in `store.ts`,
   ensuring memory usage stays within acceptable bounds.

3. **Performance Optimizations**:
   - No real-time updates during turn evaluation (report generated only after completion)
   - No accessibility features required in initial implementation
   - No mobile responsiveness required in initial implementation

4. **Future Export Functionality**: Report export features are deferred to future enhancements.

## Success Criteria

1. All turn advancement information is captured in structured reports
2. No loss of information compared to current console logging
3. UI provides intuitive drill-down into turn details
4. Performance impact is negligible (< 100ms added to turn evaluation)
5. Code is well-tested with > 80% coverage for new functions
6. UI follows GitHub-style split panel design for optimal usability

## Timeline Estimate

- **Milestone 1**: 2-3 days
- **Milestone 2**: 2-3 days  
- **Milestone 3**: 2-3 days
- **Milestone 4**: 3-4 days
- **Testing & Polish**: 2-3 days

**Total**: ~12-16 days of development effort

## Notes

This implementation plan is designed to be iterative and testable at each milestone. Each milestone delivers visible
value and can be demonstrated independently. The modular approach allows for adjustments based on feedback without
major refactoring.

# Prompt: Implementation plan update

> Apply the "Prompt: Implementation plan update" prompt from @docs/backlog/turn_report_implementation_plan.md

Review the @docs\backlog\turn_report_implementation_plan.md. Find all "Answer" and "TODO" entries, if any.
They are given by me.
Incorporate them into this document and delete the Answers and TODOs.
When making your edits, ensure the line width never crosses 120 line characters, and that there are no markdown lint
warnings on he file.
Keep all the "Prompt:*" sections.

# Prompt: Implement milestone 1

> Apply the "Prompt: Implement milestone 1" prompt from @docs/backlog/turn_report_implementation_plan.md

Implement milestone 1 phases 1.1, 1.2 and 1.3 of the @docs/backlog/turn_report_implementation_plan.md.

Once done, ensure that `npm run check` from the `web/` directory passes without errors or warnings.
