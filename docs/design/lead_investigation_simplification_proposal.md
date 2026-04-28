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

$$
D_{\text{actual}} = D_{\text{visible}} \cdot \operatorname{random}(1.0, 1.5)
$$

The player sees the listed visible difficulty, not the actual difficulty. This means a Difficulty 5 lead has a visible 5-point target, but the actual success threshold may be anywhere from 5 to 7.5 progress points.

## Per-Turn Formula

### 1. Calculate team power

Keep the current agent stacking shape, but express it in player-facing turn units:

$$
P_{\text{skill}} = \sum \frac{\text{agentSkill}}{100}
$$

$$
P_{\text{team}} = P_{\text{skill}} \cdot \frac{\text{agentCount}^{0.8}}{\text{agentCount}}
$$

Examples:

| Team | Team Power | Meaning |
| --- | ---: | --- |
| 1 agent, Skill 100 | 1.00 | Baseline |
| 1 agent, Skill 50 | 0.50 | Half speed |
| 1 agent, Skill 200 | 2.00 | Double speed |
| 2 agents, Skill 100 each | 1.74 | Faster than one, worse than two separate agents |
| 3 agents, Skill 100 each | 2.41 | Faster again, but each extra agent adds less |

This keeps diminishing returns, but the player can still reason from the baseline:

$$
\text{visibleTargetTurns} \approx \frac{D_{\text{visible}}}{P_{\text{team}}}
$$

### 2. Add progress

$$
\Delta\text{progress} = P_{\text{team}}
$$

$$
\text{progress}_{\text{new}} = \text{progress}_{\text{old}} + \Delta\text{progress}
$$

For a **Difficulty 5** lead with one **Skill 100** agent:

$$
\Delta\text{progress} = 1
$$

That is the core intuition.

### 3. Roll completion chance

Use a cumulative probability curve, not a direct per-turn linear chance.

$$
\rho = \min\left(1, \frac{\text{progress}}{D_{\text{actual}}}\right)
$$

$$
C = \rho^3
$$

Here, $\rho$ is the progress ratio. The exponent should be greater than 1. I would start with `3`:

- $\rho^2$ is moderately curved.
- $\rho^3$ starts quite slow and rises sharply near the end.
- $\rho^4$ is very slow early and may feel too inert.

The actual per-turn success chance should be the increase in cumulative chance since the previous turn, conditional on not having succeeded yet:

$$
\rho_{\text{previous}} = \min\left(1, \frac{\text{previousProgress}}{D_{\text{actual}}}\right)
$$

$$
\rho_{\text{current}} = \min\left(1, \frac{\text{currentProgress}}{D_{\text{actual}}}\right)
$$

$$
C_{\text{previous}} = \rho_{\text{previous}}^3
$$

$$
C_{\text{current}} = \rho_{\text{current}}^3
$$

$$
P_{\text{turn}} =
\frac{C_{\text{current}} - C_{\text{previous}}}{1 - C_{\text{previous}}}
$$

This formula matters because it guarantees that total cumulative success probability at progress ratio $\rho$ is exactly $\rho^3$.

The intuition:

- $C_{\text{previous}}$ is the total chance that the investigation would already have succeeded before this turn.
- $C_{\text{current}}$ is the total chance that the investigation should have succeeded by the end of this turn.
- $C_{\text{current}} - C_{\text{previous}}$ is the new success chance added by this turn.
- $1 - C_{\text{previous}}$ is the unresolved probability space still available, because the turn only happens in timelines where the investigation has not already succeeded.

So the per-turn roll asks:

$$
P_{\text{turn}} =
\frac{\text{new success chance added this turn}}{\text{chance the investigation was still unresolved}}
$$

For example, if cumulative success rises from 20% to 44%, this turn adds 24 percentage points of total success chance. But only the unresolved 80% of cases are still rolling, so the turn success chance is:

$$
\frac{44\% - 20\%}{100\% - 20\%} = 30\%
$$

After that roll, the total cumulative success chance is exactly 44%:

$$
20\% + (80\% \cdot 30\%) = 44\%
$$

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

$$
\text{progress}_{\text{new}} =
\text{progress}_{\text{old}} \cdot
\frac{\text{remainingTeamSkill}}{\text{previousTeamSkill}}
$$

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

$$
\rho_{\text{estimated}} = \min\left(1, \frac{\text{progress}}{D_{\text{visible}}}\right)
$$

$$
C_{\text{estimated}} = \rho_{\text{estimated}}^3
$$

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
