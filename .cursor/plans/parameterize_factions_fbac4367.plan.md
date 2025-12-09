---
name: Parameterize Factions
overview: Refactor missions and leads to use templates parameterized by faction ID, then generate concrete instances for Red Dawn, Exalt, and Black Lotus factions. All faction-specific chains will branch from the shared 'lead-criminal-orgs' entry point.
todos:
  - id: faction-defs
    content: Add faction definitions map and new factions to factions.ts
    status: pending
  - id: lead-templates
    content: Refactor leads.ts to use templates with faction placeholders
    status: pending
  - id: mission-templates
    content: Refactor missions.ts to use templates with faction placeholders
    status: pending
  - id: update-refs
    content: Update hardcoded faction-specific IDs in debug/test files
    status: pending
---

# Parameterize Missions and Leads Over Factions

## Design

Introduce a template-based approach where `MissionTemplate` and `LeadTemplate` types contain placeholders (`{factionId}`, `{factionName}`) that get expanded at module initialization for each faction. The exported `missions` and `leads` arrays will contain all concrete instances.

**Factions to support:**

- `faction-red-dawn` - "Red Dawn" (existing)
- `faction-exalt` - "Exalt" (new)
- `faction-black-lotus` - "Black Lotus" (new)

## Key Files to Modify

### 1. [web/src/lib/collections/missions.ts](web/src/lib/collections/missions.ts)

- Define `MissionTemplate` type with placeholder fields
- Create `missionTemplates` array with faction-agnostic definitions
- Add `generateMissionsForFaction()` function to expand templates
- Generate `missions` array at module load by expanding templates for all factions
- Update `getMissionById()` to work with expanded missions

### 2. [web/src/lib/collections/leads.ts](web/src/lib/collections/leads.ts)

- Define `LeadTemplate` type with placeholder fields
- Separate faction-agnostic leads (e.g., `lead-criminal-orgs`, `lead-deep-state`) from faction-specific templates
- Create `leadTemplates` array for faction-parameterized leads
- Add `generateLeadsForFaction()` function to expand templates
- Generate `leads` array by combining static leads + expanded faction-specific leads

### 3. [web/src/lib/collections/factions.ts](web/src/lib/collections/factions.ts)

- Add Exalt and Black Lotus faction definitions (same stats as Red Dawn)
- Add a `factionDefinitions` lookup map with `{id, name, shortId}` for template expansion
- Update `discoveryPrerequisite` to use parameterized lead IDs

### 4. [web/src/lib/model/model.ts](web/src/lib/model/model.ts)

- `FactionId` type already includes `'faction-exalt' | 'faction-black-lotus'` - no changes needed

### 5. Update References to Faction-Specific IDs

- [web/src/lib/ruleset/debugInitialState.ts](web/src/lib/ruleset/debugInitialState.ts) - Update hardcoded `'mission-apprehend-red-dawn'` and `'lead-red-dawn-profile'`
- [web/src/redux/reducers/debugReducers.ts](web/src/redux/reducers/debugReducers.ts) - Update `'lead-red-dawn-profile'` reference
- [web/test/fixtures/stateFixture.ts](web/test/fixtures/stateFixture.ts) - Update `'mission-apprehend-red-dawn'` reference

## Template Expansion Example

**Lead Template:**

```typescript
{
  id: 'lead-{factionId}-location',
  title: 'Locate {factionName} member',
  dependsOn: ['lead-criminal-orgs'],
  // ...
}
```

**Expanded for Red Dawn:**

```typescript
{
  id: 'lead-red-dawn-location',
  title: 'Locate Red Dawn member',
  dependsOn: ['lead-criminal-orgs'],
  // ...
}
```

**Expanded for Exalt:**

```typescript
{
  id: 'lead-exalt-location',
  title: 'Locate Exalt member',
  dependsOn: ['lead-criminal-orgs'],
  // ...
}
```

## ID Naming Convention

- Leads: `lead-{shortFactionId}-*` (e.g., `lead-red-dawn-location`, `lead-exalt-location`, `lead-black-lotus-location`)
- Missions: `mission-*-{shortFactionId}` (e.g., `mission-apprehend-red-dawn`, `mission-apprehend-exalt`)