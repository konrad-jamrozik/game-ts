---
name: Split Assets Card into Three Separate Cards
overview: ""
todos:
  - id: create-capacities-datagrid
    content: Create CapacitiesDataGrid.tsx with Agent cap, Transport cap, and Training cap rows
    status: completed
  - id: create-upgrades-datagrid
    content: Create UpgradesDataGrid.tsx with Training skill gain, Exhaustion recovery %, Hit points recovery %, and Weapon damage rows
    status: completed
  - id: create-assets-card
    content: Create AssetsCard.tsx component wrapping AssetsDataGrid
    status: completed
  - id: create-capacities-card
    content: Create CapacitiesCard.tsx component wrapping CapacitiesDataGrid
    status: completed
    dependencies:
      - create-capacities-datagrid
  - id: create-upgrades-card
    content: Create UpgradesCard.tsx component wrapping UpgradesDataGrid
    status: completed
    dependencies:
      - create-upgrades-datagrid
  - id: update-app
    content: Update App.tsx to use the three separate cards instead of AssetsAndCapabCard
    status: completed
    dependencies:
      - create-assets-card
      - create-capacities-card
      - create-upgrades-card
  - id: cleanup-old-files
    content: Delete AssetsAndCapabCard.tsx and CapabilitiesDataGrid.tsx
    status: completed
    dependencies:
      - update-app
---

# Split Assets Card into Three Separate Cards

Split the current "Assets" card (which contains both AssetsDataGrid and CapabilitiesDataGrid) into three separate cards: Assets, Capacities, and Upgrades.

## Changes Required

### 1. Create CapacitiesDataGrid Component

- Create `web/src/components/Assets/CapacitiesDataGrid.tsx`
- Extract capacity rows (Agent cap, Transport cap, Training cap) from `CapabilitiesDataGrid.tsx`
- Reuse the same column structure from `getCapabilitiesColumns.tsx`
- Maintain the same selection logic for upgrades

### 2. Create UpgradesDataGrid Component

- Create `web/src/components/Assets/UpgradesDataGrid.tsx`
- Extract upgrade rows (Training skill gain, Exhaustion recovery %, Hit points recovery %, Weapon damage) from `CapabilitiesDataGrid.tsx`
- Reuse the same column structure from `getCapabilitiesColumns.tsx`
- Maintain the same selection logic for upgrades

### 3. Create Three Card Components

- Create `web/src/components/Assets/AssetsCard.tsx` - wraps AssetsDataGrid in ExpandableCard
- Create `web/src/components/Assets/CapacitiesCard.tsx` - wraps CapacitiesDataGrid in ExpandableCard
- Create `web/src/components/Assets/UpgradesCard.tsx` - wraps UpgradesDataGrid in ExpandableCard
- All cards should use `RIGHT_COLUMN_CARD_WIDTH` and `defaultExpanded={true}`

### 4. Update App.tsx

- Replace `AssetsAndCapabCard` import with imports for the three new cards
- Replace the single `<AssetsAndCapabCard />` with three separate card components in the same Stack

### 5. Clean Up (Optional)

- Delete `web/src/components/Assets/AssetsAndCapabCard.tsx` (no longer used)
- Delete `web/src/components/Assets/CapabilitiesDataGrid.tsx` (replaced by CapacitiesDataGrid and UpgradesDataGrid)

## Implementation Details

- CapacitiesDataGrid will contain rows with ids 4, 5, 6 (Agent cap, Transport cap, Training cap)
- UpgradesDataGrid will contain rows with ids 7, 8, 9, 10 (Training skill gain, Exhaustion recovery, Hit points recovery %, Weapon damage)