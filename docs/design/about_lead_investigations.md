# About Agent Lead Investigation System

This document describes the current lead investigation system: what the player sees, how assigned
agents produce progress, how progress can be lost, and how the game computes each turn's success
chance.

## 1. Gameplay Basics

### Lead

A **lead** is an investigation target. Completing a lead can unlock new leads, reveal missions, or
advance the game's progression tree.

Every lead has:

- `difficulty`: the visible progress target and baseline turn count for one Skill 100 agent.
- `repeatable`: whether the lead can be investigated more than once.
- `dependsOn`: prerequisites that decide when the lead becomes available.

### Repeatable Lead

A **repeatable lead** can be completed multiple times, but only one active investigation for that
lead can exist at a time. Repeatable leads usually represent recurring ways to find missions, such as
locating faction members or bases.

A non-repeatable lead can be completed only once. Non-repeatable leads usually represent progression
steps, such as interrogating a captured target or resolving an endgame objective.

### Lead Investigation

A **lead investigation** is an active attempt to complete a lead. It stores:

```ts
progress: number
actualDifficulty: number // hidden integer, generated when the investigation starts
agentIds: AgentId[]
```

The player sees visible lead difficulty and investigation progress. The player does not see
`actualDifficulty`.

### Lead Difficulty

**Lead difficulty** is the visible progress target and the baseline number of turns a Skill 100
agent should expect to spend.

For example, a Difficulty 5 lead means:

> One Skill 100 agent makes about 1 progress per turn against a visible target of 5.

When an investigation starts, the game generates an integer **actual difficulty** from visible
difficulty. Actual difficulty is hidden, and it is between 100% and 150% of visible difficulty,
rounded down. The investigation is guaranteed to complete once progress reaches actual difficulty.

### Agent Assignment

Agents assigned to an active investigation contribute progress every turn. More assigned agents
produce more progress, but the team has diminishing returns: two Skill 100 agents are better than
one, but worse than one agent with Skill 200.

What matters for progress is **effective skill**, not raw skill. Effective skill starts from the
agent's skill, then applies penalties such as exhaustion and hit point loss. Agents assigned to an
investigation gain exhaustion each turn, so their future effective skill and progress gain can
decline over time.

### Lead Investigation Progress

**Progress** is how much investigative work has been completed on the active investigation.

Progress generally increases each turn by **progress gain**, the single per-turn amount produced by
the assigned team. For an unresolved investigation, progress is effectively capped by actual
difficulty: once progress reaches actual difficulty, completion is guaranteed.

### Per-Turn Progress Gain

Progress gain is the per-turn amount added to investigation progress.

It is computed from the assigned agents' effective skills. Each 100 effective skill contributes 1
normalized skill power before team-size diminishing returns. For example, one agent with 100
effective skill contributes 1 normalized skill power; one agent with 50 effective skill contributes
0.5 normalized skill power.

The team's normalized skill power is then reduced by the team-size diminishing returns factor. The
result is the investigation's progress gain for that turn.

### Progress Gain Efficiency

Progress gain efficiency depends on:

- **Agent skill:** higher skill produces more normalized skill power.
- **Agent exhaustion:** exhaustion reduces effective skill after the no-impact exhaustion threshold.
- **Agent hit points:** damage reduces effective skill.
- **Number of assigned agents:** larger teams get diminishing returns from the agent-count exponent.

For example:

| Team | Team Power | Meaning |
| --- | ---: | --- |
| 1 agent, Skill 100 | 1.00 | Baseline |
| 1 agent, Skill 50 | 0.50 | Half speed |
| 1 agent, Skill 200 | 2.00 | Double speed |
| 2 agents, Skill 100 each | 1.74 | Faster than one, less than double speed |
| 3 agents, Skill 100 each | 2.41 | Faster again, but each extra agent adds less |

### Progress Loss on Agent Unassignment

Removing agents from an investigation immediately reduces progress in proportion to the effective
skill removed from the team.

This represents loss of current context: the most skilled agents carry the most current investigative
knowledge, so removing a highly skilled agent causes a larger progress loss than removing a rookie.

Adding agents does not reduce progress. Removing agents does.

### Success Chance Range Each Turn

At the end of each turn, an active investigation rolls for completion. The UI should show a success
chance range because the player does not know actual difficulty.

- The lower bound assumes actual difficulty is as high as possible.
- The upper bound assumes actual difficulty is equal to visible difficulty.

The range should usually increase as progress increases. The investigation can finish early from a
success roll, but it is guaranteed once progress reaches actual difficulty.

## 2. Formula Reference

This section gives the core formulas in dependency order.

### Constants

| Constant | Meaning | Value |
| :--- | :--- | :--- |
| **Scaling exponent** | Controls diminishing returns from adding more agents, used in $\text{Count}^{0.8}$ | **0.8** |
| **Minimum actual difficulty multiplier** | Actual difficulty is never lower than visible difficulty | **1.0** |
| **Maximum actual difficulty multiplier** | Actual difficulty can be up to 50% higher than visible difficulty | **1.5** |
| **Cumulative chance exponent** | Controls how slowly success starts and how sharply it rises near completion | **3** |

### Visible Difficulty

Visible difficulty is an integer stored on the lead:

$$
D_{\text{visible}}
$$

It is the progress denominator shown to the player and the baseline turn count for one Skill 100
agent.

### Actual Difficulty

Actual difficulty is generated once, when the investigation starts:

$$
D_{\text{actual}} =
\left\lfloor D_{\text{visible}} \cdot \operatorname{random}(1.0, 1.5) \right\rfloor
$$

Actual difficulty is hidden from the player. It is an integer, never lower than visible difficulty,
and never higher than 150% of visible difficulty.

### Effective Skill

The lead investigation system uses each assigned agent's effective skill. Effective skill starts
from the agent's base skill, then applies hit point and exhaustion penalties:

$$
\text{effectiveSkill} =
\text{skill} \cdot \text{hitPointsMult} \cdot \text{exhaustionMult}
$$

Hit point multiplier:

$$
\text{hitPointsMult} =
1 - \frac{\text{maxHitPoints} - \text{hitPoints}}{\text{maxHitPoints}}
$$

Exhaustion multiplier:

$$
\text{exhaustionMult} =
1 - \frac{\max(0, \min(100, \text{exhaustionPct}) - \text{NO\_IMPACT\_EXHAUSTION})}{100}
$$

### Skill Power

Skill power normalizes effective skill around 100:

$$
P_{\text{skill}} = \sum \frac{\text{effectiveSkill}}{100}
$$

### Team Power

Team power applies diminishing returns based on assigned agent count:

$$
P_{\text{team}} = P_{\text{skill}} \cdot \frac{\text{agentCount}^{0.8}}{\text{agentCount}}
$$

This keeps the first agent highly valuable while making each additional stacked agent less efficient
than the previous one.

### Progress Gain

Progress gain is equal to team power:

$$
\Delta\text{progress} = P_{\text{team}}
$$

Then add it to current progress:

$$
\text{progress}_{\text{new}} = \text{progress}_{\text{old}} + \Delta\text{progress}
$$

### Progress Loss

When agents are removed, progress is recalibrated against the remaining team's effective skill:

$$
\text{progress}_{\text{new}} =
\text{progress}_{\text{old}} \cdot
\frac{\text{remainingTeamSkill}}{\text{previousTeamSkill}}
$$

For example:

- Progress is 8 out of 10.
- Two agents were assigned: Skill 150 and Skill 50.
- The Skill 150 agent is removed.
- Remaining skill is 50 out of previous 200.
- New progress is `8 * 50 / 200 = 2`.

### Progress Ratio

Progress ratio compares current progress against actual difficulty:

$$
\rho = \min\left(1, \frac{\text{progress}}{D_{\text{actual}}}\right)
$$

### Cumulative Success Chance

Cumulative success chance is:

$$
C = \rho^3
$$

The exponent makes early success possible but unlikely, then raises success chance sharply near the
end.

### Turn Success Chance

The turn success chance is the increase in cumulative chance since the previous turn, conditional on
the investigation not having succeeded already:

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

### Success Chance Range

The UI should compute the turn success chance twice:

$$
D_{\text{actualMax}} = \left\lfloor 1.5 \cdot D_{\text{visible}} \right\rfloor
$$

$$
D_{\text{actualMin}} = D_{\text{visible}}
$$

Then:

$$
P_{\text{lower}} =
P_{\text{turn}}\left(D_{\text{actualMax}}\right)
$$

$$
P_{\text{upper}} =
P_{\text{turn}}\left(D_{\text{actualMin}}\right)
$$

Display the lower bound rounded down and the upper bound rounded up:

```text
Success %: floor(P_lower) - ceil(P_upper)
```

## 3. Suggested UI Wording

In the leads grid:

```text
Difficulty: 5 turns
```

In a tooltip:

```text
A Skill 100 agent makes about 1 progress per turn. The visible target is 5, but actual difficulty may be up to 50% higher.
```

In active investigations:

```text
Lead: Deep state
Agents: 2
Est. progress: 1.74/10
Proj.: 3.48/10 (+1.74, eff. 87%)
Success %: ~0% - ~1%
```

Here, `eff. 87%` means two Skill 100 agents are producing 1.74 progress instead of 2.00 because of
team diminishing returns.

## 4. Key Player Intuitions

| Concept | Player Feedback/Intuition |
| :--- | :--- |
| **Difficulty** | **Difficulty is the visible progress target and baseline turn count.** A Difficulty 10 lead takes about 10 turns for one Skill 100 agent, though actual difficulty may make it run up to 50% longer. |
| **Progress** | **Progress shows how much investigative work has been done.** For an unresolved investigation, progress is effectively capped by actual difficulty: once progress reaches actual difficulty, completion is guaranteed. Actual difficulty is an integer between 100% and 150% of visible difficulty, rounded down. |
| **Success % Range** | **The higher this range, the sooner the lead is likely to resolve.** The lower bound assumes actual difficulty is high; the upper bound assumes it is equal to visible difficulty. |
| **Team Power** | **The more agents, the faster the work, but each additional agent provides less benefit.** Going from 1 to 2 agents is a big gain; going from 10 to 11 is a small gain. |
| **Actual Difficulty** | **The exact completion turn is unpredictable.** The investigation can finish early from a success roll, but it is guaranteed once progress reaches actual difficulty. |
| **Proportional Loss** | **The most skilled agents carry the most current context.** Removing a highly skilled agent causes a greater loss of progress than removing a rookie. |
| **Exhaustion** | **Do not let agents exhaust themselves on a long lead.** The player should finish the lead or rotate agents before exhaustion forces removals that cause progress loss. |

## 5. Advanced Probability Intuition

The formulas above are enough to implement the system. This section explains why the turn success
chance formula is written in conditional form.

The system uses a cumulative probability curve, not a direct per-turn linear chance. This formula
matters because it guarantees that total cumulative success probability at progress ratio $\rho$ is
exactly $\rho^3$.

The intuition:

- $C_{\text{previous}}$ is the total chance that the investigation would already have succeeded
  before this turn.
- $C_{\text{current}}$ is the total chance that the investigation should have succeeded by the end
  of this turn.
- $C_{\text{current}} - C_{\text{previous}}$ is the new success chance added by this turn.
- $1 - C_{\text{previous}}$ is the unresolved probability space still available, because the turn
  only happens in timelines where the investigation has not already succeeded.

So the per-turn roll asks:

$$
P_{\text{turn}} =
\frac{\text{new success chance added this turn}}{\text{chance the investigation was still unresolved}}
$$

For example, if cumulative success rises from 20% to 44%, this turn adds 24 percentage points of
total success chance. But only the unresolved 80% of cases are still rolling, so the turn success
chance is:

$$
\frac{44\% - 20\%}{100\% - 20\%} = 30\%
$$

After that roll, the total cumulative success chance is exactly 44%:

$$
20\% + (80\% \cdot 30\%) = 44\%
$$

## 6. Difficulty 10 Example

For **Difficulty 10** with one **Skill 100** agent:

| Turn | Progress | CC @ T10 | TC @ T10 | CC @ T15 | TC @ T15 |
| ---: | -------: | -------: | -------: | -------: | -------: |
| 1 | 1/10 | 0.1% | 0.1% | 0.0% | 0.0% |
| 2 | 2/10 | 0.8% | 0.7% | 0.2% | 0.2% |
| 3 | 3/10 | 2.7% | 1.9% | 0.8% | 0.6% |
| 4 | 4/10 | 6.4% | 3.8% | 1.9% | 1.1% |
| 5 | 5/10 | 12.5% | 6.5% | 3.7% | 1.8% |
| 6 | 6/10 | 21.6% | 10.4% | 6.4% | 2.8% |
| 7 | 7/10 | 34.3% | 16.2% | 10.2% | 4.0% |
| 8 | 8/10 | 51.2% | 25.7% | 15.2% | 5.6% |
| 9 | 9/10 | 72.9% | 44.5% | 21.6% | 7.6% |
| 10 | 10/10 | 100.0% | 100.0% | 29.6% | 10.2% |
| 11 | 11/10 | 100.0% | 100.0% | 39.4% | 13.9% |
| 12 | 12/10 | 100.0% | 100.0% | 51.2% | 19.4% |
| 13 | 13/10 | 100.0% | 100.0% | 65.1% | 28.5% |
| 14 | 14/10 | 100.0% | 100.0% | 81.3% | 46.4% |
| 15 | 15/10 | 100.0% | 100.0% | 100.0% | 100.0% |

Legend:

- `CC` = cumulative chance that the investigation has succeeded by this turn.
- `TC` = turn chance, the chance that the investigation succeeds on this turn if it has not already
  succeeded.
- `T10` = actual difficulty is 10.
- `T15` = actual difficulty is 15.

This is still unpredictable, but the range is easy to understand:

- It might finish early.
- It becomes much more likely near the visible Difficulty.
- It can run longer than the visible Difficulty because actual difficulty may be up to 150%.
- It becomes guaranteed when progress reaches actual difficulty.

For example, in this table, turn 8 has a turn success chance between 5.6% and 25.7%, so the UI
should show about `~5% - ~26%`. Turn 11 has a range from 13.9% to 100%, so it should show about
`~13% - 100%`. Turn 14 has a range from 46.4% to 100%, so it should show about `~46% - 100%`.

If actual difficulty for that same Difficulty 10 lead is 15, the same one-agent investigation is
guaranteed at 15 progress instead of 10.

## 7. Design Rationale

The previous model made Difficulty mean:

> Intel needed for a 100% one-turn success chance.

That was mathematically clear, but hard to reason about because the player had to mentally combine:

- hidden Intel units,
- the `Difficulty * 100` multiplier,
- resistance from accumulated Intel,
- random completion rolls,
- agent stacking,
- progress loss when agents leave.

The current model makes Difficulty mean:

> How many turns this takes for one normal competent agent.

That maps directly to player planning while retaining the desired feel:

- Actual difficulty preserves uncertainty without making the visible number meaningless.
- The cumulative probability curve allows early success while still guaranteeing completion at
  actual difficulty.
- The conditional `P_turn` formula keeps the cumulative curve mathematically honest across repeated
  turn rolls.
- Team power keeps the useful shape of the old agent stacking formula, but expresses it in progress
  points instead of hidden Intel.
- Proportional loss preserves investigation recency and prevents parked investigations from being
  costless.

## 8. Implementation Notes

The implementation follows these model concepts:

- Leads store integer `difficulty`.
- Active investigations store `progress` and hidden integer `actualDifficulty`.
- `actualDifficulty` is initialized from `floor(difficulty * random(1.0, 1.5))`.
- Turn advancement uses `getLeadTurnSuccessChance(previousProgress, currentProgress, actualDifficulty)`.
- Agent progress uses `getLeadProgressFromAgents(agents)`.
- Removing agents applies proportional progress loss.
- Exhaustion and mandatory withdrawal remain unchanged.

Lead difficulty values should be tuned against the intended campaign length, but the player-facing
meaning should stay stable:

> Difficulty is the number of turns a Skill 100 agent should expect to spend.

## Appendix: Excel Formulas

To reproduce the Difficulty 10 example table in Excel, use these inputs:

| Cell | Meaning | Example |
| --- | --- | ---: |
| `B1` | Visible difficulty | `10` |
| `B2` | Team power per turn | `1` |
| `B3` | Minimum actual difficulty | `=B1` |
| `B4` | Maximum actual difficulty | `=FLOOR(B1*1.5,1)` |

Then create this table starting on row 7:

| Column | Header | Formula for row 7 |
| --- | --- | --- |
| `A` | `Turn` | `=1` |
| `B` | `ProgressValue` | `=A7*$B$2` |
| `C` | `Progress` | `=IF(RC[-1]=INT(RC[-1]),TEXT(RC[-1],"0"),TEXT(RC[-1],"0.##"))&"/"&IF(R1C2=INT(R1C2),TEXT(R1C2,"0"),TEXT(R1C2,"0.##"))` |
| `D` | `CC @ Tmin` | `=MIN(1,(B7/$B$3)^3)` |
| `E` | `TC @ Tmin` | `=IF(ROW()=ROW($A$7),D7,IF(D6>=1,1,(D7-D6)/(1-D6)))` |
| `F` | `CC @ Tmax` | `=MIN(1,(B7/$B$4)^3)` |
| `G` | `TC @ Tmax` | `=IF(ROW()=ROW($A$7),F7,IF(F6>=1,1,(F7-F6)/(1-F6)))` |
| `H` | `Success Range` | `="~"&TEXT(FLOOR(G7*100,1),"0")&"% - ~"&TEXT(CEILING(E7*100,1),"0")&"%"` |

For row 8 and below:

- `A8`: `=A7+1`
- Copy columns `B:H` down from row 7.
- Format `D:G` as percentages.
- Hide `B` if you only want to display the player-facing progress label from `C`.

In this setup:

- `CC @ Tmin` and `TC @ Tmin` are the high-end success chances, because actual difficulty is as low
  as possible.
- `CC @ Tmax` and `TC @ Tmax` are the low-end success chances, because actual difficulty is as high
  as possible.
- `Success Range` rounds the lower turn chance down and the upper turn chance up.
