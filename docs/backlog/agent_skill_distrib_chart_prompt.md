# Agent Skill Distribution Banding (Deciles)

The agent skill distribution chart should display **skill bands corresponding to ranked deciles**, using **tie-aware, discrete grouping** (no interpolation).

---

## Conceptual behavior

1. **Top 10% band**
   - Identify the top 10% most skilled agents.
   - Compute the **minimum and maximum skill values** among those agents.
   - Display this as a single band, e.g. `[800, 1200]`.

2. **Subsequent bands**
   - Remove agents already assigned to higher bands.
   - From the remaining agents, take the next 10% most skilled.
   - Compute their skill range.
   - Display the band as **half-open**, e.g. `[550, 800)` (upper bound equals the lower bound of the previous band).
   - Repeat for lower deciles.

3. **Empty bands are allowed**
   - If no agents remain for a given decile, the band is empty and should not be displayed.

---

## Extreme case example

If there is:
- **1 agent with skill 600**
- **20 agents with skill 100**

Then:
- **Top 10% band** contains only the skill-600 agent.
- **Next bands (10–20%, 20–30%, …)** all collapse into the same tie group at skill 100.
- All lower bands are effectively empty.

This behavior is intentional and correct.

---

## Banding rules (authoritative)

Let `n` be the total number of agents.

1. **Target band size**
`k = max(1, ceil(n * 0.10))`

2. **Top band**
- Select the top `k` agents by skill.

1. **Tie rule (critical)**
- If the cutoff splits agents with identical skill values, **include the entire tie group in the higher band**.

---

### Interpretation of “p90”

For this chart, **do not compute p90 using interpolation** (e.g. linear or Type-7 methods).

Instead:
- **p90 is the nearest-rank cutoff value** used to determine the top band.
- Example:
- Skills: `[100, 100, 100, 100, 100, 100, 100, 600]`
- `p90 = 600`
- Top 10% band contains the single agent with skill 600.

Percentiles are used **only as rank thresholds**, not as synthetic numeric values.

---

### Recommended implementation approach

1. Sort agents by **descending skill**.
2. Compute `k = max(1, ceil(n / 10))`.
3. Iterate through the sorted list in chunks of size `k`.
4. When a chunk boundary cuts through equal-skill agents, **expand the chunk to include all ties**.
5. Assign each chunk to successive decile labels:
- Top 10%, Next 10%, etc.
1. If tie expansion causes a decile to absorb multiple theoretical bands, **skip the unused labels**.

This ensures stable, intuitive banding that behaves correctly with ties and small sample sizes.

# Documentation

Add in docs about_agent_skill_distribution_chart.md with the details how the semantics of the charts
are to be interpreted. I.e. how the percentile bands are computed, ties solved, etc.
