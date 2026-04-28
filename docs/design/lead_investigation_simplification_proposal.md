# Lead Investigation Simplification Proposal

## Goal

Make lead **Difficulty** intuitive without losing the current feel of investigation work:

- **Unpredictability:** the player should not know the exact completion turn.
- **Diminishing returns:** extra agents should help, but stacking agents should not scale linearly.
- **Investigation recency:** removing agents should still lose progress, because some knowledge is carried by the assigned team.

The main simplification is:

> **Difficulty means baseline turns for one Skill 100 agent.**

So if a lead has **Difficulty 5**, a player can read that as:

> A single Skill 100 agent will make about 1 progress point per turn against a 5-point visible target, but the investigation may run somewhat longer because the true completion threshold is hidden.

## Recommended Model

Replace the current hidden "Intel required for 100%" model with investigation progress points.

Each active investigation stores:

```ts
progress: number
actualDifficulty: number // hidden, generated when the investigation starts
```

Each lead keeps:

```ts
difficulty: number // visible progress denominator and baseline Skill 100 turn count
```

When an investigation starts:

```text
actualDifficulty = difficulty * random(1.0, 1.5)
```

The player sees the listed `difficulty`, not `actualDifficulty`. This means a Difficulty 5 lead has a visible 5-point target, but the actual success threshold may be anywhere from 5 to 7.5 progress points.

## Per-Turn Formula

### 1. Calculate team power

Keep the current agent stacking shape, but express it in player-facing turn units:

```text
skillPower = sum(agentSkill / 100)
teamPower = skillPower * (agentCount ^ 0.8 / agentCount)
```

Examples:

| Team | Team Power | Meaning |
| --- | ---: | --- |
| 1 agent, Skill 100 | 1.00 | Baseline |
| 1 agent, Skill 50 | 0.50 | Half speed |
| 1 agent, Skill 200 | 2.00 | Double speed |
| 2 agents, Skill 100 each | 1.74 | Faster than one, worse than two separate agents |
| 3 agents, Skill 100 each | 2.41 | Faster again, but each extra agent adds less |

This keeps diminishing returns, but the player can still reason from the baseline:

```text
visible target turns ~= difficulty / teamPower
```

### 2. Add progress

```text
progressGain = teamPower
progress = progress + progressGain
```

For a **Difficulty 5** lead with one **Skill 100** agent:

```text
progressGain = 1 progress point per turn
```

That is the core intuition.

### 3. Roll completion chance

Use a cumulative probability curve, not a direct per-turn linear chance.

```text
x = min(1, progress / actualDifficulty)
cumulativeSuccessChance = x ^ 3
```

The exponent should be greater than 1. I would start with `3`:

- `x ^ 2` is moderately curved.
- `x ^ 3` starts quite slow and rises sharply near the end.
- `x ^ 4` is very slow early and may feel too inert.

The actual per-turn success chance should be the increase in cumulative chance since the previous turn, conditional on not having succeeded yet:

```text
previousX = min(1, previousProgress / actualDifficulty)
currentX = min(1, currentProgress / actualDifficulty)

previousCumulative = previousX ^ 3
currentCumulative = currentX ^ 3

turnSuccessChance = (currentCumulative - previousCumulative) / (1 - previousCumulative)
```

This formula matters because it guarantees that total cumulative success probability at progress ratio `x` is exactly `x ^ 3`.

For **Difficulty 10** with one **Skill 100** agent, assuming actual difficulty also happens to be 10:

| Turn | Progress | Cumulative Chance | Success Chance This Turn |
| ---: | ---: | ---: | ---: |
| 1 | 1/10 | 0.1% | 0.1% |
| 2 | 2/10 | 0.8% | 0.7% |
| 3 | 3/10 | 2.7% | 1.9% |
| 4 | 4/10 | 6.4% | 3.8% |
| 5 | 5/10 | 12.5% | 6.5% |
| 6 | 6/10 | 21.6% | 10.4% |
| 7 | 7/10 | 34.3% | 16.2% |
| 8 | 8/10 | 51.2% | 25.7% |
| 9 | 9/10 | 72.9% | 44.5% |
| 10 | 10/10 | 100.0% | 100.0% |

This is still unpredictable, but the range is easy to understand:

- It might finish early.
- It becomes much more likely near the visible Difficulty.
- It can run longer than the visible Difficulty because the actual hidden threshold may be up to 150%.
- It becomes guaranteed when progress reaches the hidden actual difficulty.

If the hidden actual difficulty for that same Difficulty 10 lead is 15, the same one-agent investigation is guaranteed at 15 progress instead of 10.

## Investigation Recency

Keep the existing proportional progress loss when agents are removed:

```text
newProgress = oldProgress * remainingTeamSkill / previousTeamSkill
```

Example:

- Progress is 8 out of 10.
- Two agents were assigned: Skill 150 and Skill 50.
- The Skill 150 agent is removed.
- Remaining skill is 50 out of previous 200.
- New progress is `8 * 50 / 200 = 2`.

This preserves the current intuition:

> The most skilled agents carry the most current context.

Adding agents should not reduce progress. Removing agents should reduce progress immediately.

## Why This Is Simpler

The current model makes Difficulty mean:

> Intel needed for a 100% one-turn success chance.

That is mathematically clear, but hard to reason about because the player must mentally combine:

- hidden Intel units,
- the `Difficulty * 100` multiplier,
- resistance from accumulated Intel,
- random completion rolls,
- agent stacking,
- progress loss when agents leave.

The proposed model makes Difficulty mean:

> How many turns this takes for one normal competent agent.

That maps directly to player planning.

## Suggested UI Wording

In the leads grid:

```text
Difficulty: 5 turns
```

In a tooltip:

```text
A Skill 100 agent makes about 1 progress per turn. The visible target is 5, but the true completion threshold may be up to 50% higher.
```

In active investigations:

```text
Lead: Deep state
Agents: 2
Est. progress: 1.74/10
Proj.: 3.48/10 (+1.74, eff. 87%)
Success %: ~1%
```

Here, `eff. 87%` means two Skill 100 agents are producing 1.74 progress instead of 2.00 because of team diminishing returns.

The displayed success percentage can be an estimate using visible difficulty:

```text
estimatedX = min(1, progress / difficulty)
estimatedCumulativeSuccessChance = estimatedX ^ 3
```

The real roll should use hidden `actualDifficulty`, so the displayed chance can be labeled approximate.

## Migration Notes

The implementation can remain close to the current system:

- Replace `accumulatedIntel` with `progress`, or reinterpret it during migration as progress points.
- Add hidden `actualDifficulty` to active investigations and initialize it from `difficulty * random(1.0, 1.5)`.
- Replace `getLeadSuccessChance(accumulatedIntel, difficulty)` with `getLeadTurnSuccessChance(previousProgress, currentProgress, actualDifficulty)`.
- Replace `getLeadIntelFromAgents(agents, currentIntel, difficulty)` with `getLeadProgressFromAgents(agents)`.
- Keep `getLeadIntelLoss(...)` conceptually, but rename it to progress loss.
- Keep exhaustion and mandatory withdrawal unchanged.

Lead difficulty values would need rebalance because current values are not turn counts. A rough first-pass mapping could be:

| Current Role | Current Difficulty Examples | Proposed Difficulty Range |
| --- | ---: | ---: |
| Intro leads | 1-2 | 2-4 turns |
| Small faction leads | 5-10 | 5-8 turns |
| Midgame location leads | 20-40 | 8-15 turns |
| Major faction leads | 60-100 | 15-25 turns |
| Endgame leads | 150-200 | 25-40 turns |

The exact values should be tuned against the intended campaign length, but the player-facing meaning should stay stable:

> Difficulty is the number of turns a Skill 100 agent should expect to spend.
