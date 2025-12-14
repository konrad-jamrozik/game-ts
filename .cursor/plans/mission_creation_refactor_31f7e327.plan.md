---
name: Mission Creation Refactor
overview: Consolidate duplicated mission site creation, enemy spec generation, and mission ID generation logic into reusable factory functions, addressing KJA todo comments.
todos:
  - id: create-factory
    content: Create missionSiteFactory.ts with createMissionSite() function
    status: completed
  - id: consolidate-enemy-spec
    content: Consolidate enemy spec generation into single enemyCountsToSpec() function
    status: completed
    dependencies:
      - create-factory
  - id: export-mission-id
    content: Export generateMissionId() from missions.ts
    status: completed
    dependencies:
      - consolidate-enemy-spec
  - id: refactor-consumers
    content: Update all 3 consumers to use the new factory and exported functions
    status: completed
    dependencies:
      - export-mission-id
  - id: cleanup-remove-dups
    content: Remove duplicate defensiveMissionRowToEnemySpec from evaluateTurn.ts
    status: completed
    dependencies:
      - refactor-consumers
---

# Refactor Mission and Mission Site Creation Code

## Identified Duplication

### 1. Mission Site Creation (3 locations with nearly identical code)

| Location | Function | Purpose |

|----------|----------|---------|

| [`updateLeadInvestigations.ts`](web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts) | `createMissionSitesForLead()` | Creates offensive mission sites from completed leads |

| [`evaluateTurn.ts`](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts) | `spawnDefensiveMissionSite()` | Creates defensive mission sites from faction operations |

| [`debugReducers.ts`](web/src/redux/reducers/debugReducers.ts) | `spawnMissionSites()` | Creates mission sites for debugging |

All three share:

- Same ID generation: `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`
- Same `MissionSite` structure initialization
- Same push to `state.missionSites`

### 2. Enemy Spec String Generation (3 locations, 2 nearly identical)

- [`missions.ts:18-71`](web/src/lib/collections/missions.ts) - `offensiveMissionRowToEnemySpec()`
- [`missions.ts:132-167`](web/src/lib/collections/missions.ts) - `defensiveMissionRowToEnemySpec()`
- [`evaluateTurn.ts:551-588`](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts) - `defensiveMissionRowToEnemySpec()` (duplicate!)

### 3. Mission ID Generation (2 locations)

- [`missions.ts:85-88`](web/src/lib/collections/missions.ts) - `generateMissionId()`
- [`evaluateTurn.ts:643-646`](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts) - inline generation

---

## Proposed Refactoring

### Step 1: Create unified mission site factory

Create a new file `web/src/lib/game_utils/missionSiteFactory.ts` with:

```typescript
type CreateMissionSiteParams = {
  state: GameState
  missionId: string
  expiresIn: number | 'never'
  enemyUnitsSpec: string
  operationLevel?: number
}

export function createMissionSite(params: CreateMissionSiteParams): MissionSite
```

This consolidates:

- Mission site ID generation (with state.missionSites.length)
- Enemy instantiation via `newEnemiesFromSpec()`
- Adding to `state.missionSites`

### Step 2: Consolidate enemy spec generation

In [`missions.ts`](web/src/lib/collections/missions.ts), create a single generic function:

```typescript
type EnemyCounts = {
  initiate: number; operative: number; soldier: number;
  elite: number; handler: number; lieutenant: number;
  commander: number; highCommander: number; cultLeader: number
}

export function enemyCountsToSpec(counts: EnemyCounts): string
```

Then:

- Refactor `offensiveMissionRowToEnemySpec()` and `defensiveMissionRowToEnemySpec()` to use it
- Delete duplicate `defensiveMissionRowToEnemySpec()` from `evaluateTurn.ts`
- Address KJA comment: `// KJA probably should simplify the "enemy spec string" approach`

### Step 3: Export and reuse `generateMissionId()`

Export `generateMissionId()` from `missions.ts` and use it in `evaluateTurn.ts` instead of inline generation.

### Step 4: Update consumers

- Refactor `createMissionSitesForLead()` in `updateLeadInvestigations.ts` to use factory
- Refactor `spawnDefensiveMissionSite()` in `evaluateTurn.ts` to use factory + exported functions
- Refactor `spawnMissionSites()` in `debugReducers.ts` to use factory

---

## Optional / Deferred Changes (per other KJA comments)

These are noted in your KJA comments but may warrant separate tasks:

1. **Rename `Mission` to `MissionSiteTemplate`** and **`title` to `name`** - broader refactoring
2. **Key-value type for mission stats tables** - `// KJA need key-value type...`
3. **Move activity level config** - `// KJA move it to activityLevelStatsTable.ts`
4. **Clean up eslint/oxlint disable comments** - after the spec generation is simplified

---

## Files to Modify

1. **Create**: [`web/src/lib/game_utils/missionSiteFactory.ts`](web/src/lib/game_utils/missionSiteFactory.ts) (new)
2. **Modify**: [`web/src/lib/collections/missions.ts`](web/src/lib/collections/missions.ts)
3. **Modify**: [`web/src/lib/game_utils/turn_advancement/evaluateTurn.ts`](web/src/lib/game_utils/turn_advancement/evaluateTurn.ts)
4. **Modify**: [`web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts`](web/src/lib/game_utils/turn_advancement/updateLeadInvestigations.ts)
5. **Modify**: [`web/src/redux/reducers/debugReducers.ts`](web/src/redux/reducers/debugReducers.ts)