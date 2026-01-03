---
name: Agent Skill Decile Banding
overview: Refactor the agent skill distribution chart to use tie-aware, discrete decile banding instead of interpolated percentiles, and add documentation explaining the chart semantics.
todos:
  - id: add-compute-decile-bands
    content: Add `computeDecileBands` function to `mathPrimitives.ts` implementing tie-aware rank-based banding
    status: completed
  - id: add-unit-tests
    content: Add comprehensive unit tests for `computeDecileBands` in `mathPrimitives.test.ts`
    status: completed
  - id: refactor-chart-component
    content: Refactor `bldAgentSkillDistributionRow` in `AgentSkillDistributionChart.tsx` to use new banding logic
    status: completed
  - id: create-documentation
    content: Create `docs/design/about_agent_skill_distribution_chart.md` documenting chart semantics
    status: completed
  - id: verify-changes
    content: Run `qcheck` to verify all changes are correct
    status: completed
---

# Agent Skill Distribution Decile Banding

## Problem Statement

The current `AgentSkillDistributionChart.tsx` uses `quantileSorted()` which computes percentiles using linear interpolation. The specification requires **tie-aware, rank-based discrete grouping** where:

- Top 10% band contains the top 10% most skilled agents by rank
- Ties are always kept together in the higher band
- Empty bands are skipped when tie expansion absorbs multiple theoretical bands

## Key Files to Modify

- [`web/src/lib/primitives/mathPrimitives.ts`](web/src/lib/primitives/mathPrimitives.ts) - Add new `computeDecileBands` function
- [`web/src/components/Charts/AgentSkillDistributionChart.tsx`](web/src/components/Charts/AgentSkillDistributionChart.tsx) - Refactor to use new banding logic
- [`web/test/unit/mathPrimitives.test.ts`](web/test/unit/mathPrimitives.test.ts) - Add tests for `computeDecileBands`

## File to Create

- `docs/design/about_agent_skill_distribution_chart.md` - Documentation explaining chart semantics

## Algorithm Design

```typescript
type DecileBand = {
  label: string        // e.g., "Top 10%", "10-20%"
  minSkill: number     // Minimum skill in this band
  maxSkill: number     // Maximum skill in this band
  count: number        // Number of agents in this band
}

function computeDecileBands(skills: number[]): DecileBand[]
```

**Algorithm steps:**

1. Sort agents by **descending skill**
2. Compute target band size: `k = max(1, ceil(n / 10))`
3. Iterate through sorted list, assigning agents to bands
4. At each chunk boundary, if agents have the same skill as the boundary agent, **expand the chunk** to include all ties
5. Skip band labels that get absorbed by tie expansion

**Example from spec:** 1 agent with skill 600, 20 agents with skill 100

- Top 10% band: [600, 600], 1 agent
- Next bands (10-20%, 20-30%, ...): All collapse at skill 100
- Result: 2 non-empty bands displayed

## Chart Data Structure Changes

The current row structure stores stacked height differences (`p0to10`, `p10to20`, etc.). The new structure will:

- Store the actual min/max skill boundaries per band
- Compute stacked values from the band boundaries
- Handle empty bands gracefully (zero height in stack)

## Testing Strategy

Add tests in `mathPrimitives.test.ts` for `computeDecileBands`:

- Normal distribution (10+ agents with varied skills)
- Extreme tie case (1 outlier + many identical values)
- Small samples (fewer than 10 agents)
- All agents same skill
- Empty input
