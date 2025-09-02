# Turn Advancement Report - Implementation Plan

- [Turn Advancement Report - Implementation Plan](#turn-advancement-report---implementation-plan)
  - [Overview](#overview)
  - [Architecture Summary](#architecture-summary)
  - [Key Design Decisions](#key-design-decisions)
  - [Data Model Design](#data-model-design)
    - [Core Report Types](#core-report-types)
  - [Implementation Work Plan](#implementation-work-plan)
    - [✅ Milestone 1: Display Basic Turn Stats](#-milestone-1-display-basic-turn-stats)
      - [✅ Phase 1.1: Backend Logic](#-phase-11-backend-logic)
      - [✅ Phase 1.2: UI Component](#-phase-12-ui-component)
    - [Milestone 2: Display Factions Stats](#milestone-2-display-factions-stats)
      - [Phase 2.1: Backend Logic](#phase-21-backend-logic)
      - [Phase 2.2: UI Component](#phase-22-ui-component)
    - [Milestone 3: Display Basic Mission Site Stats](#milestone-3-display-basic-mission-site-stats)
      - [Phase 3.1: Backend Logic](#phase-31-backend-logic)
      - [Phase 3.2: UI Component](#phase-32-ui-component)
    - [Milestone 4: Display Detailed Mission Site Stats](#milestone-4-display-detailed-mission-site-stats)
      - [Phase 4.1: Backend Logic](#phase-41-backend-logic)
      - [Phase 4.2: UI Component](#phase-42-ui-component)
  - [Implementation Details](#implementation-details)
    - [Backend Modifications](#backend-modifications)
    - [UI Component Structure](#ui-component-structure)
    - [State Management](#state-management)
    - [Testing Strategy](#testing-strategy)
  - [Migration Plan](#migration-plan)
  - [Performance Considerations](#performance-considerations)
  - [Future Enhancements](#future-enhancements)
  - [UI Design Specifications](#ui-design-specifications)
  - [Success Criteria](#success-criteria)
  - [Timeline Estimate](#timeline-estimate)
  - [Notes](#notes)
- [Prompt: Update the plan](#prompt-update-the-plan)
- [Prompt: Implement the plan](#prompt-implement-the-plan)

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

4. **Report Persistence**: TurnReports are persisted automatically via the game state's undo/redo system.
   The `advanceTurn` matcher in `eventsMiddleware.ts` will trigger an `addTurnAdvancementEvent` to record the occurrence
   of turn advancement without duplicating data.

5. **Turn Reports in GameState**: Complete TurnReports are stored in `GameState.turnStartReport`

6. **UI Display**: Turn Reports will open as a modal dialog when clicking on "Turn X started" entries in the event log.

## Data Model Design

### Core Report Types

For implemented report types, refer to [web/src/lib/model/reportModel.ts](/web/src/lib/model/reportModel.ts)

Pending extensions:

```typescript

// Panic tracking
type PanicReport = {
  change: ValueChange;
  breakdown: PanicBreakdown;
}

type PanicBreakdown = {
  factionContributions: {
    factionId: string;
    factionName: string;
    contribution: number;
  }[];
  missionReductions: {
    missionSiteId: string;
    missionTitle: string;
    reduction: number;
  }[];
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
  missionImpacts: {
    missionSiteId: string;
    missionTitle: string;
    threatReduction?: number;
    suppressionAdded?: number;
  }[];
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
  actors: {
    id: string;
    name: string;
    type: 'agent' | 'enemy';
    effectiveSkillPercent: number;
    hitPointsPercent: number;
    isTerminated: boolean;
  }[];
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

## Implementation Work Plan

### ✅ Milestone 1: Display Basic Turn Stats

**Objective**: Implement asset tracking and display in model TreeView stub and hook it up.

#### ✅ Phase 1.1: Backend Logic

- ✅ **File**: `web/src/lib/turn_advancement/evaluateTurn.ts`
- ✅ Modify `updatePlayerAssets` to return `AssetsReport`
- ✅ Track detailed breakdown of money changes
- ✅ Track detailed breakdown of intel changes
- ✅ Update `evaluateTurn` to build and return initial `TurnReport`
- ✅ **File**: `web/src/app/eventsMiddleware.ts`
- ✅ Update the `advanceTurn` event matcher to capture the TurnReport from `turnStartReport` and trigger `addTurnAdvancementEvent`
- ✅ **File**: `web/src/lib/slices/eventsSlice.ts`
- ✅ Add `addTurnAdvancementEvent` reducer to record turn advancement events without duplicating report data

#### ✅ Phase 1.2: UI Component

- ✅ **File**: `web/src/components/TurnReport/TurnReportTree.tsx` (modified)
- ✅ Create split-panel layout with left tree navigation and right collapsible details
- ✅ Implement simplified Assets node with Money and Intel sub-nodes (no stats in tree)
- ✅ Display change values in "previous → current (±delta)" format in right panel accordions
- ✅ Add expandable Accordion details for calculation breakdowns
- ✅ **File**: `web/src/components/TurnReport/TurnReportModal.tsx` (new)
- ✅ Create modal dialog wrapper using MUI Dialog components
- ✅ **File**: `web/src/components/TurnReport/useTurnReportHistory.tsx` (new)
- ✅ Create hook to access historical turn reports from undo system
- ✅ **File**: `web/src/components/EventLog.tsx` (modified)
- ✅ Make TurnAdvancement events clickable to open turn report modal
- ✅ Integrate TurnReportModal with event log interactions

### Milestone 2: Display Factions Stats

**Objective**: Implement panic and faction tracking

#### Phase 2.1: Backend Logic

- **File**: `web/src/lib/turn_advancement/evaluateTurn.ts`
- Modify `updatePanic` to return `PanicReport`
- Modify `updateFactions` to return `FactionReport[]`
- Track panic contributions by faction
- Track mission impacts on factions
- Include suppression decay calculations

#### Phase 2.2: UI Component

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

#### Phase 3.2: UI Component

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

#### Phase 4.2: UI Component

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

3. **TurnReport Storage**: The complete `TurnReport` is stored in `GameState.turnStartReport`.

4. **Backward Compatibility**: During transition, maintain existing functionality while adding report generation.

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
   - TurnReports are automatically persisted via the game state's undo/redo system
   - Complete `TurnReport` is temporarily stored in `GameState.turnStartReport` during turn advancement
   - Events record when turn advancement occurred without duplicating report data
   - Access complete reports from game state history when displaying UI

2. **Event System Integration**:
   - Remove `postMissionCompletedEvent` and `addMissionCompletedEvent`
   - Use turn report as single source of truth for turn events
   - `addTurnAdvancementEvent` creates lightweight markers in event log
   - Integrate with existing `advanceTurn` event matcher

### Testing Strategy

The only changes to existing test files that can be made while implementing this plan are to fix existing tests to pass.

Specifically, the tests can be updated to fix typing errors, like bad signature.

Following is forbidden:
- Adding any expectations to existing tests.
- Adding any new tests.
- Implementing any test stubs.

## Migration Plan

1. **Step 1**: Implement report generation alongside existing functionality
2. **Step 2**: Add UI component and integrate with events system
3. **Step 3**: Remove deprecated event posting (`postMissionCompletedEvent`)
4. **Step 4**: Optimize and refine based on user feedback

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

# Prompt: Update the plan

> Apply the "Prompt: Update the plan" prompt from @docs/backlog/turn_report_implementation_plan.md

Review the @docs\backlog\turn_report_implementation_plan.md. Find all "Answer" and "TODO" entries, if any.
They are given by me.
Incorporate them into this document and delete the Answers and TODOs.
When making your edits, ensure the line width never crosses 120 line characters, and that there are no markdown lint
warnings on he file.
Keep all the "Prompt:*" sections.

# Prompt: Implement the plan

> Apply the "Prompt: Implement the plan" prompt from @docs/backlog/turn_report_implementation_plan.md

Implement milestone 1 phase 1.2 of the @docs/backlog/turn_report_implementation_plan.md.

Remember to:
- Leverage the mui-mcp MCP server to help you with MUI questions.
- Follow the "Testing Strategy" outlined in this plan.
- Once done with code changes, ensure that `npm run check` from the `web/` directory passes without errors or warnings.
  - However, ignore and do not address any eslint warnings about too many lines in a function, file, or anywhere else.
- Edit this document by prefixing with "✅" sections that you have completed.
