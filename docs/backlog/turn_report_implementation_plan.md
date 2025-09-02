# Turn Advancement Report - Implementation Plan

## Overview

This document outlines the detailed implementation plan for the "Turn Advancement Report" feature, which will provide a
comprehensive, interactive view of all events that occur during turn advancement in the game.

## Architecture Summary

The implementation follows a three-layer architecture:

1. **Backend Layer**: Functions return structured report objects containing all relevant data
2. **Data Model Layer**: TypeScript interfaces defining the report structure hierarchy
3. **UI Layer**: React component using MUI TreeView to display the hierarchical report data

## Questions for Clarification

Before implementation begins, the following questions need answers:

1. **Test Framework**: The codebase doesn't appear to have existing test files. Should we:
   - Set up Vitest testing infrastructure with the first tests?
   - Create test files in a `__tests__` directory next to source files?
   - Use a different testing approach?

2. **Event Middleware**: The `eventsMiddleware.ts` currently posts events for missions. Should we:
   - Completely remove the `postMissionCompletedEvent` functionality?
   - Keep it for backwards compatibility during transition?
   - How should the new TurnReport integrate with the existing events system?

3. **Console Logging**: Currently, combat details are logged to console. Should we:
   - Remove console.log statements once the UI is implemented?
   - Keep them for debugging purposes?
   - Make console logging configurable?

4. **Report Persistence**: Should the TurnReport:
   - Be stored in Redux state for the current turn only?
   - Be persisted across multiple turns for historical viewing?
   - Have a maximum number of stored reports to manage memory?

5. **UI Integration**: Where should the Turn Report component be displayed:
   - As a modal/dialog that opens after turn advancement?
   - As a permanent panel in the UI?
   - As a tab in an existing component?

## Data Model Design

### Core Report Types

```typescript
// Base report interface
interface BaseReport {
  timestamp: number;
  turn: number;
}

// Main turn report
interface TurnReport extends BaseReport {
  assets: AssetsReport;
  panic: PanicReport;
  factions: FactionReport[];
  missionSites: DeployedMissionSiteReport[];
}

// Asset tracking
interface AssetsReport {
  money: AssetChange;
  intel: AssetChange;
  moneyDetails: MoneyBreakdown;
  intelDetails: IntelBreakdown;
}

interface AssetChange {
  previous: number;
  current: number;
  delta: number;
}

interface MoneyBreakdown {
  agentUpkeep: number;
  contractingEarnings: number;
  fundingIncome: number;
  hireCosts: number;
  missionRewards: number;
}

interface IntelBreakdown {
  espionageGathered: number;
  missionRewards: number;
}

// Panic tracking
interface PanicReport {
  change: AssetChange;
  breakdown: PanicBreakdown;
}

interface PanicBreakdown {
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
interface FactionReport {
  factionId: string;
  factionName: string;
  isDiscovered: boolean;
  threatLevel: AssetChange;
  threatIncrease: AssetChange;
  suppression: AssetChange;
  details: FactionDetails;
}

interface FactionDetails {
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
interface DeployedMissionSiteReport {
  missionSiteId: string;
  missionTitle: string;
  result: 'successful' | 'failed' | 'retreated';
  rewards?: MissionRewards;
  battle?: BattleReport;
  agentReports: AgentMissionReport[];
  enemyReports: EnemyMissionReport[];
}

// Battle tracking
interface BattleReport {
  rounds: number;
  totalRounds: number;
  retreated: boolean;
  agentCasualties: number;
  enemyCasualties: number;
  combatRounds: CombatRoundReport[];
}

interface CombatRoundReport {
  roundNumber: number;
  attacks: AttackReport[];
  roundSummary: RoundSummary;
}

interface AttackReport {
  attackerId: string;
  attackerName: string;
  attackerType: 'agent' | 'enemy';
  targetId: string;
  targetName: string;
  targetType: 'agent' | 'enemy';
  attackType: 'offensive' | 'defensive';
  roll: number;
  threshold: number;
  success: boolean;
  damage: number;
  exhaustion: number;
  skillGained: number;
}

interface RoundSummary {
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
interface AgentMissionReport {
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
interface EnemyMissionReport {
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

#### Phase 1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateTurn.ts`
- Modify `updatePlayerAssets` to return `AssetsReport`
- Track detailed breakdown of money changes
- Track detailed breakdown of intel changes
- Update `evaluateTurn` to build and return initial `TurnReport`

#### Phase 2: Unit Tests

- **File**: `web/src/lib/turn_advancement/__tests__/evaluateTurn.test.ts` (new)
- Test asset report generation with various scenarios
- Test money breakdown calculations
- Test intel breakdown calculations
- Verify report structure correctness

#### Phase 3: UI Component

- **File**: `web/src/components/TurnReport/TurnReportTree.tsx` (new)
- Create basic TreeView structure
- Implement Assets node with Money and Intel sub-nodes
- Display change values in "previous → current (±delta)" format
- Add expandable details for calculation breakdowns

### Milestone 2: Display Factions Stats

**Objective**: Implement panic and faction tracking

#### Phase 1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateTurn.ts`
- Modify `updatePanic` to return `PanicReport`
- Modify `updateFactions` to return `FactionReport[]`
- Track panic contributions by faction
- Track mission impacts on factions
- Include suppression decay calculations

#### Phase 2: Unit Tests

- **File**: `web/src/lib/turn_advancement/__tests__/evaluateTurn.test.ts`
- Test panic report generation
- Test faction report generation
- Test suppression decay calculations
- Test mission reward application to factions

#### Phase 3: UI Component

- **File**: `web/src/components/TurnReport/TurnReportTree.tsx`
- Add Panic node with expandable breakdown
- Add Factions node with sub-nodes for each discovered faction
- Display faction stats with change indicators
- Show detailed mission impacts when expanded

### Milestone 3: Display Basic Mission Site Stats

**Objective**: Implement mission site result tracking

#### Phase 1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateDeployedMissionSite.ts`
- Create and return `DeployedMissionSiteReport`
- Track mission success/failure/retreat status
- Include mission rewards in report
- Calculate agent and enemy casualties

#### Phase 2: Unit Tests

- **File**: `web/src/lib/turn_advancement/__tests__/evaluateDeployedMissionSite.test.ts` (new)
- Test mission site report generation
- Test different mission outcomes
- Test reward tracking
- Test casualty counting

#### Phase 3: UI Component

- **File**: `web/src/components/TurnReport/TurnReportTree.tsx`
- Add Mission Sites node
- Create sub-nodes for each deployed mission
- Display success/failure status with appropriate icons
- Show rewards for successful missions
- Display casualty summary

### Milestone 4: Display Detailed Mission Site Stats

**Objective**: Implement detailed combat tracking

#### Phase 1: Backend Logic

- **Files**:
  - `web/src/lib/turn_advancement/evaluateBattle.ts`
  - `web/src/lib/turn_advancement/evaluateAttack.ts`
- Modify `evaluateBattle` to return enhanced `BattleReport`
- Create `CombatRoundReport` for each round
- Modify `evaluateAttack` to return `AttackReport`
- Track agent and enemy performance metrics
- Build `AgentMissionReport` and `EnemyMissionReport`

#### Phase 2: Unit Tests

- **File**: `web/src/lib/turn_advancement/__tests__/evaluateBattle.test.ts` (new)
- Test battle report generation
- Test combat round tracking
- Test attack report details
- Test agent/enemy performance tracking
- Test skill point calculations

#### Phase 3: UI Component

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

1. **Function Return Types**: Each evaluating function will be modified to return both its side effects (state mutations) and a report object.

2. **Report Composition**: Reports will be composed hierarchically, with child reports embedded in parent reports.

3. **Backward Compatibility**: During transition, maintain existing functionality while adding report generation.

### UI Component Structure

```typescript
// Main component structure
<TurnReportTree report={turnReport}>
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
```

### State Management

1. **Redux Integration**:
   - Add `currentTurnReport?: TurnReport` to game state
   - Create action to store turn report after evaluation
   - Clear report when starting new turn

2. **Event System Integration**:
   - Phase out `postMissionCompletedEvent` gradually
   - Use turn report as single source of truth for turn events

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
2. **Phase 2**: Add UI component and integrate with game state
3. **Phase 3**: Remove console.log statements and deprecated event posting
4. **Phase 4**: Optimize and refine based on user feedback

## Performance Considerations

1. **Report Size**: Monitor report object size, especially for long battles
2. **UI Rendering**: Use React.memo for TreeItem components to prevent unnecessary re-renders
3. **Memory Management**: Consider limiting stored reports to last N turns

## Future Enhancements

1. **Report Export**: Allow exporting turn reports as JSON or formatted text
2. **Report Comparison**: Compare reports between turns
3. **Report Filtering**: Filter report to show only specific types of information
4. **Report Search**: Search within report for specific agents, enemies, or events
5. **Visual Analytics**: Add charts for damage distribution, skill gains, etc.

## Open Design Decisions

1. **Report Persistence Strategy**: How many turn reports to keep in memory/storage
2. **UI Placement**: Where to display the report in the main game interface
3. **Real-time Updates**: Whether to show report building during turn evaluation
4. **Accessibility**: Keyboard navigation and screen reader support for TreeView
5. **Mobile Responsiveness**: How to display complex tree on smaller screens

## Success Criteria

1. All turn advancement information is captured in structured reports
2. No loss of information compared to current console logging
3. UI provides intuitive drill-down into turn details
4. Performance impact is negligible (< 100ms added to turn evaluation)
5. Code is well-tested with > 80% coverage for new functions
6. Component is accessible and responsive

## Timeline Estimate

- **Milestone 1**: 2-3 days
- **Milestone 2**: 2-3 days  
- **Milestone 3**: 2-3 days
- **Milestone 4**: 3-4 days
- **Testing & Polish**: 2-3 days

**Total**: ~12-16 days of development effort

## Notes

This implementation plan is designed to be iterative and testable at each milestone. Each milestone delivers visible
value and can be demonstrated independently. The modular approach allows for adjustments based on feedback without major
refactoring.
