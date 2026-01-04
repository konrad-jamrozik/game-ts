---
name: Split OnAssignment State
overview: "Split the \"OnAssignment\" agent state into two distinct states: \"Contracting\" (for agents doing contract work) and \"Investigating\" (for agents assigned to lead investigations). This requires updating the type definition, palette colors, filtering utilities, validation logic, turn advancement logic, and display components."
todos:
  - id: update-type
    content: Update AgentState type in agentModel.ts to replace OnAssignment with Contracting | Investigating
    status: completed
  - id: update-palette
    content: Update palette.tsx - replace agentStateOnAssignment with agentStateContracting and agentStateInvestigating
    status: completed
  - id: update-model-palette
    content: Update modelPaletteUtils.ts to map new states to new palette colors
    status: completed
  - id: update-agent-utils
    content: Update agentUtils.ts - filtering functions for new states
    status: completed
  - id: update-validate-agents
    content: Update validateAgents.ts error message
    status: completed
  - id: update-validate-invariants
    content: Update validateAgentInvariants.ts to check for Investigating state
    status: completed
  - id: update-turn-advancement
    content: Update updateAgents.ts to set correct new states on arrival
    status: completed
  - id: update-ai-logic
    content: Update manageAgents.ts AI logic for new states
    status: completed
  - id: update-chart
    content: Update AgentStatusDistributionChart.tsx for new states and colors
    status: completed
  - id: update-debug-factory
    content: Update debugGameStateFactory.ts test data
    status: completed
  - id: verify-qcheck
    content: Run qcheck to verify all changes compile and pass linting
    status: completed
---

# Split Agent State "OnAssignment" into "Contracting" and "Investigating"

## Summary

Replace the generic `OnAssignment` state with two specific states:

- `Contracting` - agents earning money through contract work
- `Investigating` - agents assigned to lead investigations

## Files to Modify

### 1. Type Definition

[web/src/lib/model/agentModel.ts](web/src/lib/model/agentModel.ts)

- Replace `'OnAssignment'` with `'Contracting' | 'Investigating'` in the `AgentState` union type

### 2. Palette and Styling

[web/src/components/styling/palette.tsx](web/src/components/styling/palette.tsx)

- Remove `agentStateOnAssignment` palette color
- Add `agentStateContracting` (keep amber[700] for money-related work)
- Add `agentStateInvestigating` (use teal[600] for research/investigation theme)
- Update TypeScript module declarations for Palette, PaletteOptions, and ChipPropsColorOverrides

[web/src/components/styling/modelPaletteUtils.ts](web/src/components/styling/modelPaletteUtils.ts)

- Update `getModelPalette()` to map `Contracting` -> `agentStateContracting` and `Investigating` -> `agentStateInvestigating`
- Remove the `OnAssignment` mapping

### 3. Agent Utility Functions

[web/src/lib/model_utils/agentUtils.ts](web/src/lib/model_utils/agentUtils.ts)

- Update `onAssignment()` to filter for both `'Contracting'` and `'Investigating'` states (or deprecate)
- Update `onContractingAssignment()` to check `agent.state === 'Contracting'`
- Add `onInvestigating()` function to filter for `agent.state === 'Investigating'`
- Update `recallable()` to check for `'Contracting' | 'Investigating'`
- Update `notOnAssignment()` to check for both new states
- Update `onAssignmentWithAssignmentId()` to check for `'Investigating'` state

### 4. Validation Logic

[web/src/lib/model_utils/validateAgents.ts](web/src/lib/model_utils/validateAgents.ts)

- Update error message in `validateOnAssignmentAgents()` to mention "Contracting, Investigating, or InTraining agents"

[web/src/lib/model_utils/validateAgentInvariants.ts](web/src/lib/model_utils/validateAgentInvariants.ts)

- Update `validateInvestigationAssignment()` to check for `agent.state === 'Investigating'` instead of `'OnAssignment'`

### 5. Turn Advancement Logic

[web/src/lib/game_utils/turn_advancement/updateAgents.ts](web/src/lib/game_utils/turn_advancement/updateAgents.ts)

- Update `updateInTransitAgents()`:
- When agent arrives at Contracting assignment: set `agent.state = 'Contracting'`
- When agent arrives at investigation: set `agent.state = 'Investigating'`

### 6. AI Logic

[web/src/ai/intellects/basic/manageAgents.ts](web/src/ai/intellects/basic/manageAgents.ts)

- Update `unassignExhaustedAgents()` to filter for `'Contracting' | 'Investigating'` instead of `'OnAssignment'`

### 7. Charts and Display

[web/src/components/Charts/AgentStatusDistributionChart.tsx](web/src/components/Charts/AgentStatusDistributionChart.tsx)

- Update `bldAgentStatusDistributionRow()` to check for `state === 'Contracting'` and `state === 'Investigating'`
- Update chart series colors to use `agentStateContracting` and `agentStateInvestigating`

### 8. Test Data Factory

[web/src/lib/factories/debugGameStateFactory.ts](web/src/lib/factories/debugGameStateFactory.ts)

- Update agent rows to use `'Contracting'` state for contracting agents
- Update agent rows to use `'Investigating'` state for DEEP_STATE investigation agents

## Color Scheme

| State | Palette Key | Color |
|-------|-------------|-------|
| Contracting | `agentStateContracting` | amber[700] (same as old OnAssignment) |
| Investigating | `agentStateInvestigating` | teal[600] (new distinct color) |
