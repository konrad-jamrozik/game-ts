# About Agent Lead Investigation System

This document describes the current lead investigation system: what the player sees, how assigned
agents produce progress, how progress can be lost, and how the game computes each turn's success
chance.

# 1. Gameplay Basics

## Lead

A **lead** is an investigation target. Completing a lead investigation can unlock new leads, reveal
missions, or advance the game's progression tree.

Every lead has following stored properties:

- `difficulty`: the visible progress target and baseline turn count for one Skill 100 agent.
- `repeatable`: whether the lead can be investigated more than once.
- `dependsOn`: prerequisites that decide when the lead becomes available.

## Repeatable Lead

A **repeatable lead** can have multiple completed investigations, but only one active investigation
for that lead can exist at a time. Repeatable leads usually represent recurring ways to find
missions, such as locating faction members or bases.

A non-repeatable lead can have only one completed investigation. Non-repeatable leads usually
represent progression steps, such as interrogating a captured target or resolving an endgame
objective.

## Lead Investigation Stored Properties

A **lead investigation** has following stored properties:

```ts
id: LeadInvestigationId
leadId: LeadId
progress: number
actualDifficulty: number // hidden integer, generated when the investigation starts
agentIds: AgentId[]
startTurn: number
state: LeadInvestigationState
```

The player sees visible lead difficulty and investigation progress. The player does not see
`actualDifficulty`.

## Completing a Lead Investigation

To complete a lead investigation, the player assigns agents to it. Assigned agents produce
**progress per turn**, which is added to the investigation's stored `progress`.

The investigation has a hidden `actualDifficulty`, measured in progress points. Once `progress`
reaches `actualDifficulty`, the investigation is guaranteed to complete.

The UI shows investigation progress using visible lead difficulty as the denominator. This visible
difficulty is the lower bound for actual difficulty; actual difficulty can be up to 150% higher.

Progress per turn starts from effective agent skill: every 100 effective skill produces 1
**progress by agent**. Progress by agent is then adjusted by **progress efficiency**.
With equally skilled Skill 100 agents, this means `agentCount` agents produce about
`agentCount ^ 0.8` progress per turn instead of scaling linearly.

At the end of each turn, the investigation rolls for completion. The chance starts low and grows
cubically as progress becomes a larger percentage of actual difficulty.

## Progress Loss on Agent Unassignment

Removing agents from an investigation immediately reduces progress in proportion to the effective
skill removed from the assigned agents.

This represents loss of current context: the most skilled agents carry the most current investigative
knowledge, so removing a highly skilled agent causes a larger progress loss than removing a rookie.

Adding agents does not reduce progress. Removing agents does.

## Success Chance Range Each Turn

At the end of each turn, an active investigation rolls for completion. The UI should show a success
chance range because the player does not know actual difficulty.

- The lower bound assumes actual difficulty is as high as possible.
- The upper bound assumes actual difficulty is equal to visible difficulty.

The range should usually increase as progress increases.

# 2. Formula Reference

This section gives the core formulas in dependency order.

## Constants

| Constant | Meaning | Value |
| :--- | :--- | :--- |
| **Scaling exponent** | Controls diminishing returns from adding more agents, used in $\text{Count}^{0.8}$ | **0.8** |
| **Minimum actual difficulty multiplier** | Actual difficulty is never lower than visible difficulty | **1.0** |
| **Maximum actual difficulty multiplier** | Actual difficulty can be up to 50% higher than visible difficulty | **1.5** |
| **Cumulative chance exponent** | Controls how slowly success starts and how sharply it rises near completion | **3** |

## Visible Difficulty

Visible difficulty is an integer stored on the lead:

$$
D_{\text{visible}}
$$

It is the progress denominator shown to the player and the baseline turn count for one Skill 100
agent.

## Actual Difficulty

Actual difficulty is generated once, when the investigation starts:

$$
D_{\text{actual}} =
\left\lfloor D_{\text{visible}} \cdot \operatorname{random}(1.0, 1.5) \right\rfloor
$$

Actual difficulty is hidden from the player. It is an integer, never lower than visible difficulty,
and never higher than 150% of visible difficulty.

## Effective Skill

The lead investigation system uses each assigned agent's effective skill. Effective skill is
dictated by hit points and exhaustion. See [about_agents.md](about_agents.md#effective-skill).

## Progress by Agent

Progress by agent normalizes effective skill around 100:

$$
P_{\text{byAgent}} = \sum \frac{\text{effectiveSkill}}{100}
$$

## Progress Efficiency Formula

Progress efficiency applies diminishing returns based on assigned agent count:

$$
P_{\text{eff}} = \frac{\text{agentCount}^{0.8}}{\text{agentCount}}
$$

This keeps the first agent highly valuable while making each additional stacked agent less efficient
than the previous one.

## Progress per Turn Formula

Progress per turn is progress by agent multiplied by progress efficiency:

$$
\Delta\text{progress} = P_{\text{byAgent}} \cdot P_{\text{eff}}
$$

Then add it to current progress:

$$
\text{progress}_{\text{new}} = \text{progress}_{\text{old}} + \Delta\text{progress}
$$

## Progress Loss

When agents are removed, progress is recalibrated against the effective skill of the remaining
agents:

$$
\text{progress}_{\text{new}} =
\text{progress}_{\text{old}} \cdot
\frac{\text{remainingAgentSkill}}{\text{previousAgentSkill}}
$$

For example:

- Progress is 8 out of 10.
- Two agents were assigned: Skill 150 and Skill 50.
- The Skill 150 agent is removed.
- Remaining skill is 50 out of previous 200.
- New progress is `8 * 50 / 200 = 2`.

## Progress Ratio

Progress ratio compares current progress against actual difficulty:

$$
\rho = \min\left(1, \frac{\text{progress}}{D_{\text{actual}}}\right)
$$

## Cumulative Success Chance

Cumulative success chance is:

$$
P_c = \rho^3
$$

The exponent makes early success possible but unlikely, then raises success chance sharply near the
end.

## Turn Advancement Success Chance

The turn advancement success chance is the success chance rolled when advancing the turn. It is the
increase in cumulative chance since the previous turn, conditional on the investigation not having
succeeded already:

When advancing from turn $N$ to turn $N+1$:

- `previous` means the investigation state before adding this turn's progress per turn, at the start
  of turn advancement from turn $N$.
- `current` means the investigation state after adding this turn's progress per turn, still during
  the same turn advancement into turn $N+1$.

$$
\rho_{\text{previous}} = \min\left(1, \frac{\text{previousProgress}}{D_{\text{actual}}}\right)
$$

$$
\rho_{\text{current}} = \min\left(1, \frac{\text{currentProgress}}{D_{\text{actual}}}\right)
$$

$$
P_{c,\text{previous}} = \rho_{\text{previous}}^3
$$

$$
P_{c,\text{current}} = \rho_{\text{current}}^3
$$

$$
P_{\text{tadv}} =
\frac{P_{c,\text{current}} - P_{c,\text{previous}}}{1 - P_{c,\text{previous}}}
$$

## Success Chance Range

The UI should compute the turn advancement success chance twice:

$$
D_{\text{actualMax}} = \left\lfloor 1.5 \cdot D_{\text{visible}} \right\rfloor
$$

$$
D_{\text{actualMin}} = D_{\text{visible}}
$$

Then:

$$
P_{\text{lower}} =
P_{\text{tadv}}\left(D_{\text{actualMax}}\right)
$$

$$
P_{\text{upper}} =
P_{\text{tadv}}\left(D_{\text{actualMin}}\right)
$$

Display the lower bound rounded down and the upper bound rounded up:

```text
Success %: floor(P_lower) - ceil(P_upper)
```

# 3. Suggested UI Wording

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
progress efficiency.

# 4. Key Player Intuitions

| Concept | Player Feedback/Intuition |
| :--- | :--- |
| **Difficulty** | **Difficulty is the visible progress target and baseline turn count.** A Difficulty 10 lead takes about 10 turns for one Skill 100 agent, though actual difficulty may make it run up to 50% longer. |
| **Progress** | **Progress shows how much investigative work has been done.** For an unresolved investigation, progress is effectively capped by actual difficulty: once progress reaches actual difficulty, completion is guaranteed. Actual difficulty is an integer between 100% and 150% of visible difficulty, rounded down. |
| **Success % Range** | **The higher this range, the sooner the lead is likely to resolve.** The lower bound assumes actual difficulty is high; the upper bound assumes it is equal to visible difficulty. |
| **Progress per Turn** | **The more agents, the faster the work, but each additional agent provides less benefit.** Going from 1 to 2 agents is a big gain; going from 10 to 11 is a small gain. |
| **Actual Difficulty** | **The exact completion turn is unpredictable.** The investigation can finish early from a success roll, but it is guaranteed once progress reaches actual difficulty. |
| **Proportional Loss** | **The most skilled agents carry the most current context.** Removing a highly skilled agent causes a greater loss of progress than removing a rookie. |
| **Exhaustion** | **Do not let agents exhaust themselves on a long lead.** The player should finish the lead or rotate agents before exhaustion forces removals that cause progress loss. |

# 5. Advanced Probability Intuition

The formulas above are enough to implement the system. This section explains why the turn
advancement success chance formula is written in conditional form.

The system uses a cumulative probability curve, not a direct per-turn linear chance. This formula
matters because it guarantees that total cumulative success probability at progress ratio $\rho$ is
exactly $\rho^3$.

The intuition:

- $P_{c,\text{previous}}$ is the total chance that the investigation would already have succeeded
  before this turn.
- $P_{c,\text{current}}$ is the total chance that the investigation should have succeeded by the end
  of this turn.
- $P_{c,\text{current}} - P_{c,\text{previous}}$ is the new success chance added by this turn.
- $1 - P_{c,\text{previous}}$ is the unresolved probability space still available, because the turn
  only happens in timelines where the investigation has not already succeeded.

So the roll made during turn advancement asks:

$$
P_{\text{tadv}} =
\frac{\text{new success chance added this turn}}{\text{chance the investigation was still unresolved}}
$$

For example, if cumulative success rises from 20% to 44%, this turn adds 24 percentage points of
total success chance. But only the unresolved 80% of cases are still rolling, so the turn
advancement success chance is:

$$
\frac{44\% - 20\%}{100\% - 20\%} = 30\%
$$

After that roll, the total cumulative success chance is exactly 44%:

$$
20\% + (80\% \cdot 30\%) = 44\%
$$

# 6. Difficulty 10 Example

For **Difficulty 10** with one **Skill 100** agent:

Row `0` is the starting state before any turn advancement. Each later row represents the state after
that row's turn advancement. For example, row `2` means the investigation advanced from turn 1 to
turn 2, progress increased from `1/10` to `2/10`, and $P_{\text{tadv}}$ is the success chance rolled during
that turn advancement.

| Turn | Progress | $P_c$ @ D10 | $P_{\text{tadv}}$ @ D10 | $P_c$ @ D15 | $P_{\text{tadv}}$ @ D15 |
| ---: | -------: | -------: | -------: | -------: | -------: |
| 0 | 0/10 | 0.0% | 0.0% | 0.0% | 0.0% |
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

- $P_c$ = accumulated success chance after the advancement that produced this row's progress value.
- $P_{\text{tadv}}$ = turn advancement success chance, the chance rolled during the advancement that produced
  this row's progress value.
- `D10` = actual difficulty is 10.
- `D15` = actual difficulty is 15.

This is still unpredictable, but the range is easy to understand:

- It might finish early.
- It becomes much more likely near the visible Difficulty.
- It can run longer than the visible Difficulty because actual difficulty may be up to 150%.
- It becomes guaranteed when progress reaches actual difficulty.

For example, in this table, turn 8 has a turn advancement success chance between 5.6% and 25.7%, so
the UI should show about `~5% - ~26%`. Turn 11 has a range from 13.9% to 100%, so it should show
about `~13% - 100%`. Turn 14 has a range from 46.4% to 100%, so it should show about
`~46% - 100%`.

If actual difficulty for that same Difficulty 10 lead is 15, the same one-agent investigation is
guaranteed at 15 progress instead of 10.

# 7. Design Rationale

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
- The conditional `P_tadv` formula keeps the cumulative curve mathematically honest across repeated
  turn advancement rolls.
- Progress efficiency keeps the useful shape of the old agent stacking formula, but expresses it in
  progress per turn instead of hidden Intel.
- Proportional loss preserves investigation recency and prevents parked investigations from being
  costless.

# 8. Implementation Notes

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

# Concept definitions

## Concepts visible in UI

- **`Lead`:** An investigation target that can have `lead investigation` records started for it.

- **`Repeatable lead`:** A `lead` that can be investigated repeatably, but only once at a time.

- **`Lead investigation`:** A state object representing one active or past investigation of a `lead`.

- **`Lead visible difficulty`:** The `lead`'s shown difficulty value. It is the `progress`
  denominator shown in the UI. It establishes the lower bound of `lead investigation actual difficulty`.

- **`Effective skill`:** See `about_agents.md`.

- **`Progress`:** The `lead investigation`'s accumulated work toward
  `lead investigation actual difficulty`. When `Advance turn` is clicked, the computed
  `turn advancement progress` is added to the `progress` value.

- **`Progress efficiency`:** The diminishing returns factor for stacked agents:
  `agentCount ^ 0.8 / agentCount`.

- **`Turn advancement progress`:** The `progress` added to `progress` when `Advance turn` is clicked:
  `progressByAgent * progressEfficiency`, where `progressByAgent = sum(effectiveSkill) / 100` and
  `progressEfficiency = agentCount ^ 0.8 / agentCount`.

- **`Turn advancement success chance range`:** The UI's lower-to-upper estimate of the next turn's completion chance,
  computed from the possible `lead investigation actual difficulty` range.

## Advanced concepts, hidden from the UI

- **`Progress by agent`:** `Effective skill` normalized by dividing by 100. For example, 130
  `effective skill` is 1.3 `progress by agent`.

- **`Progress loss`:** The immediate reduction to `progress` when agents are unassigned from a
  `lead investigation`.

- **`Lead investigation actual difficulty`:** The hidden integer `progress` target for a specific
  `lead investigation`. It is generated when the investigation starts and is between 100% and 150%
  of `lead visible difficulty`, rounded down.

- **`Turn advancement success chance`:** The chance that an unresolved `lead investigation` completes
  during this turn advancement. It is the conditional roll chance needed to move from the previous
  `accumulated success chance` to the current `accumulated success chance`.

- **`Accumulated success chance`:** The target total chance that a `lead investigation` should
  already have completed at or before a given `progress` value:
  `min(1, progress / actualDifficulty) ^ 3`. It is not a per-turn chance. The
  `turn advancement success chance` is derived from the difference between previous and current
  `accumulated success chance`, conditional on the `lead investigation` still being unresolved.

# Formula reference

| Definition | Formula | Remarks |
| --- | --- | --- |
| $D_v$ - lead visible difficulty | Given by the lead. | Visible difficulty is shown in the UI and establishes the lower bound of actual difficulty. |
| $S_{\text{eff}}$ - effective skill | See [about_agents.md](about_agents.md#effective-skill). | Effective skill is dictated by hit points and exhaustion. |
| $P_{\text{agent}}$ - progress by agent | $P_{\text{agent}} = \sum \frac{S_{\text{eff}}}{100}$ | Every 100 effective skill contributes 1 progress by agent. |
| $P_{\text{eff}}$ - progress efficiency | $P_{\text{eff}} = \frac{\text{agentCount}^{0.8}}{\text{agentCount}}$ | More agents help, but each additional agent adds less. |
| $\Delta p$ - turn advancement progress | $\Delta p = P_{\text{agent}} \cdot P_{\text{eff}}$ | When advancing from turn $n$ to turn $n+1$, $P_{\text{agent}}$ and $P_{\text{eff}}$ are computed from the turn $n$ state. |
| $p_{n+1}$ - progress after turn advancement | $p_{n+1} = p_n + \Delta p$ | Advancing from turn $n$ to turn $n+1$ adds $\Delta p$. |
| $D_a$ - lead investigation actual difficulty | $D_a = \left\lfloor D_v \cdot \operatorname{random}(1.0, 1.5) \right\rfloor$ | Actual difficulty is hidden, integer, and between 100% and 150% of visible difficulty. |
| $\rho$ - progress ratio | $\rho(p, D_a) = \min\left(1, \frac{p}{D_a}\right)$ | Progress ratio is measured against actual difficulty, not visible difficulty, and is capped at 100%. |
| $P_c$ - accumulated success chance | $P_c(p, D_a) = \rho(p, D_a)^3$ | Accumulated success chance is progress ratio of actual difficulty, cubed. |
| $P_{\text{tadv}}$ - turn advancement success chance | $P_{\text{tadv}}(p_n, p_{n+1}, D_a) = \frac{P_c(p_{n+1}, D_a) - P_c(p_n, D_a)}{1 - P_c(p_n, D_a)}$ | When advancing from turn $n$ to turn $n+1$, the roll happens only in timelines where the investigation has not already succeeded. |
| $p_{\text{new}}$ - progress after agent unassignment | $p_{\text{new}} = p_{\text{old}} \cdot \frac{S_{\text{remaining}}}{S_{\text{previous}}}$ | Removing agents loses progress in proportion to removed effective skill. |

# Excel formulas reference

To reproduce the Difficulty 10 example table in Excel, use these inputs:

| Cell | Meaning | Example |
| --- | --- | ---: |
| `B1` | Visible difficulty | `10` |
| `B2` | Progress per turn | `1` |
| `B3` | Minimum actual difficulty | `=B1` |
| `B4` | Maximum actual difficulty, rounded down | `=FLOOR(B1*1.5,1)` |

Then create this table starting on row 7:

| Column | Header | Formula for row 7 |
| --- | --- | --- |
| `A` | `Turn` | `=1` |
| `B` | `ProgressValue` | `=A7*$B$2` |
| `C` | `Progress` | `=IF(RC[-1]=INT(RC[-1]),TEXT(RC[-1],"0"),TEXT(RC[-1],"0.#"))&"/"&IF(R1C2=INT(R1C2),TEXT(R1C2,"0"),TEXT(R1C2,"0.#"))` |
| `D` | `$P_c$ @ Dmin` | `=MIN(1,(B7/$B$3)^3)` |
| `E` | `$P_{\text{tadv}}$ @ Dmin` | `=IF(ROW()=ROW($A$7),D7,IF(D6>=1,1,(D7-D6)/(1-D6)))` |
| `F` | `$P_c$ @ Dmax` | `=MIN(1,(B7/$B$4)^3)` |
| `G` | `$P_{\text{tadv}}$ @ Dmax` | `=IF(ROW()=ROW($A$7),F7,IF(F6>=1,1,(F7-F6)/(1-F6)))` |
| `H` | `Success Range` | `="~"&TEXT(FLOOR(G7*100,1),"0")&"% - ~"&TEXT(CEILING(E7*100,1),"0")&"%"` |

For row 8 and below:

- `A8`: `=A7+1`
- Copy columns `B:H` down from row 7.
- Format `D:G` as percentages.
- Hide `B` if you only want to display the player-facing progress label from `C`.

In this setup:

- `$P_c$ @ Dmin` and `$P_{\text{tadv}}$ @ Dmin` are the high-end success chances, because actual difficulty is as low
  as possible.
- `$P_c$ @ Dmax` and `$P_{\text{tadv}}$ @ Dmax` are the low-end success chances, because actual difficulty is as high
  as possible after rounding down.
- `Success Range` rounds the lower turn chance down and the upper turn chance up.
