---
name: Fix circular dependencies by moving Row types
overview: Move all `*Row` type definitions from component files to their corresponding `get*Columns.tsx` utility files to break circular dependencies. This follows the pattern where column files import row types from components, and components import column functions, creating cycles.
todos:
  - id: move-situation-report-row
    content: Move SituationReportRow type from SituationReportCard.tsx to getSituationReportColumns.tsx and update imports
    status: completed
  - id: move-mission-row
    content: Move MissionRow type from MissionsDataGrid.tsx to getMissionsColumns.tsx and update imports
    status: completed
  - id: move-lead-row
    content: Move LeadRow type from LeadsDataGrid.tsx to getLeadsColumns.tsx and update imports
    status: completed
  - id: move-lead-investigation-row
    content: Move LeadInvestigationRow type from LeadInvestigationsDataGrid.tsx to getLeadInvestigationsColumns.tsx and update all imports
    status: completed
  - id: move-upgrade-row
    content: Move UpgradeRow type from CapabilitiesDataGrid.tsx to getCapabilitiesColumns.tsx and update imports
    status: completed
  - id: move-asset-row
    content: Move AssetRow type from AssetsDataGrid.tsx to getAssetsColumns.tsx and update imports
    status: completed
  - id: move-agent-row
    content: Move AgentRow type from AgentsDataGrid.tsx to getAgentsColumns.tsx and update all imports
    status: completed
  - id: verify-fixes
    content: Run qcheck to verify all circular dependencies are resolved
    status: completed
---

# Fix Circular Dependencies by Moving Row Types

## Problem

Multiple circular dependencies exist where:

- Column utility files (`get*Columns.tsx`) import `*Row` types from component files
- Component files import column functions from utility files
- This creates import cycles that violate dependency rules

## Solution

Move all `*Row` type definitions from component files to their corresponding `get*Columns.tsx` utility files. This breaks the cycles because:

- Column files define the types they need
- Component files import both the types and column functions from column files
- No circular dependency remains

## Changes Required

### 1. SituationReport

- **Move** `SituationReportRow` type from `web/src/components/SituationReportCard.tsx` (lines 16-23) to `web/src/components/SituationReport/getSituationReportColumns.tsx`
- **Update** `SituationReportCard.tsx` to import `SituationReportRow` from `getSituationReportColumns.tsx`
- **Update** `getSituationReportColumns.tsx` to export the type and remove the import

### 2. Missions

- **Move** `MissionRow` type from `web/src/components/MissionsDataGrid/MissionsDataGrid.tsx` (lines 25-29) to `web/src/components/MissionsDataGrid/getMissionsColumns.tsx`
- **Update** `MissionsDataGrid.tsx` to import `MissionRow` from `getMissionsColumns.tsx`
- **Update** `getMissionsColumns.tsx` to export the type and remove the import

### 3. Leads

- **Move** `LeadRow` type from `web/src/components/LeadsDataGrid/LeadsDataGrid.tsx` (lines 17-28) to `web/src/components/LeadsDataGrid/getLeadsColumns.tsx`
- **Update** `LeadsDataGrid.tsx` to import `LeadRow` from `getLeadsColumns.tsx`
- **Update** `getLeadsColumns.tsx` to export the type and remove the import

### 4. LeadInvestigations

- **Move** `LeadInvestigationRow` type from `web/src/components/LeadInvestigationsDataGrid/LeadInvestigationsDataGrid.tsx` (lines 31-45) to `web/src/components/LeadInvestigationsDataGrid/getLeadInvestigationsColumns.tsx`
- **Update** `LeadInvestigationsDataGrid.tsx` to import `LeadInvestigationRow` from `getLeadInvestigationsColumns.tsx`
- **Update** `LeadInvestigationsDataGridUtils.ts` to import `LeadInvestigationRow` from `getLeadInvestigationsColumns.tsx` instead of `LeadInvestigationsDataGrid.tsx`
- **Update** `getLeadInvestigationsColumns.tsx` to export the type and remove the import

### 5. Capabilities

- **Move** `UpgradeRow` type from `web/src/components/Assets/CapabilitiesDataGrid.tsx` (lines 12-26) to `web/src/components/Assets/getCapabilitiesColumns.tsx`
- **Update** `CapabilitiesDataGrid.tsx` to import `UpgradeRow` from `getCapabilitiesColumns.tsx`
- **Update** `getCapabilitiesColumns.tsx` to export the type and remove the import

### 6. Assets

- **Move** `AssetRow` type from `web/src/components/Assets/AssetsDataGrid.tsx` (lines 8-15) to `web/src/components/Assets/getAssetsColumns.tsx`
- **Update** `AssetsDataGrid.tsx` to import `AssetRow` from `getAssetsColumns.tsx`
- **Update** `getAssetsColumns.tsx` to export the type and remove the import

### 7. Agents

- **Move** `AgentRow` type from `web/src/components/AgentsDataGrid/AgentsDataGrid.tsx` (lines 15-19) to `web/src/components/AgentsDataGrid/getAgentsColumns.tsx`
- **Update** `AgentsDataGrid.tsx` to import `AgentRow` from `getAgentsColumns.tsx`
- **Update** `AgentsDataGridUtils.ts` to import `AgentRow` from `getAgentsColumns.tsx` instead of `AgentsDataGrid.tsx`
- **Update** `getAgentsColumns.tsx` to export the type and remove the import

## Verification

After making these changes, run `qcheck` to verify:

- All circular dependency errors are resolved
- TypeScript compilation succeeds