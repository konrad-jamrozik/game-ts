---
name: Enhanced Agent Counts
overview: Add detailed agent counts to the Agents DataGrid header showing ready, exhausted, KIA, and sacked agents with left and right alignment.
todos:
  - id: make-title-flexible
    content: Update DataGridCard and ExpandableCard to accept React.ReactNode for title
    status: pending
  - id: create-count-utils
    content: Create agentCounts.ts with count calculation logic
    status: pending
  - id: create-title-component
    content: Create AgentsDataGridTitle.tsx component with split layout
    status: pending
  - id: integrate-agents-grid
    content: Update AgentsDataGrid to use new title with counts
    status: pending
  - id: verify-implementation
    content: Run qcheck to verify changes
    status: pending
---

# Enhanced Agent Counts in DataGridCard

## Changes Required

### 1. Make DataGridCard Accept Custom Title Content

Modify [`web/src/components/Common/DataGridCard.tsx`](web/src/components/Common/DataGridCard.tsx):

- Change `title` prop from `string` to `React.ReactNode` to accept custom JSX
- Pass the title prop directly to `ExpandableCard` (it already supports `React.ReactNode`)

### 2. Update ExpandableCard to Support Flexible Title Layout

Modify [`web/src/components/Common/ExpandableCard.tsx`](web/src/components/Common/ExpandableCard.tsx):

- Change `title` prop type from `string` to `React.ReactNode`
- Update CardHeader to support complex title layouts with left/right alignment
- Use MUI Box or Stack with `justifyContent: 'space-between'` for split layout

### 3. Create Agent Count Calculation Utility

Create new file `web/src/components/AgentsDataGrid/agentCounts.ts`:

- Define helper function to calculate agent counts:
- **A (All active)**: non-terminated agents (use existing `notTerminated` from agentUtils)
- **R (Ready)**: agents where `(state === 'Available' OR (state === 'InTraining' AND assignment === 'Training'))` AND `exhaustionPct <= 5%`
- **E (Exhausted)**: same state conditions as ready, but `exhaustionPct > 5%`
- **KIA**: agents with `state === 'KIA'`
- **S (Sacked)**: agents with `state === 'Sacked'`
- Return a structured object with these counts
- Use `toF6(5)` to create the 5% threshold constant for comparison with `f6le`

### 4. Create Agent Title Component

Create new file `web/src/components/AgentsDataGrid/AgentsDataGridTitle.tsx`:

- Accept the calculated counts as props
- Render two sections:
- **Left**: "A: {count} / R: {count} / E: {count}"
- **Right**: "KIA: {count} / S: {count}"
- Use MUI Box with `display: 'flex'`, `justifyContent: 'space-between'`, `width: '100%'`
- Style with appropriate spacing and typography

### 5. Update AgentsDataGrid

Modify [`web/src/components/AgentsDataGrid/AgentsDataGrid.tsx`](web/src/components/AgentsDataGrid/AgentsDataGrid.tsx):

- Import the count calculation utility and title component
- Calculate agent counts from `gameState.agents`
- Create the custom title component with counts
- Pass the title component to `DataGridCard` instead of the string "Agents"

## Implementation Notes