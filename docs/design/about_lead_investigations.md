# About Agent Lead Investigation System

This document describes the current lead investigation system: how leads are represented, how assigned
agents produce progress, how progress can be lost, and how the game computes each turn's success
chance.

- [About Agent Lead Investigation System](#about-agent-lead-investigation-system)
- [1. Gameplay Basics](#1-gameplay-basics)
  - [Lead](#lead)
  - [Repeatable Lead](#repeatable-lead)
  - [Lead Investigation Stored Properties](#lead-investigation-stored-properties)
  - [Completing a Lead Investigation](#completing-a-lead-investigation)
    - [Success chance each turn](#success-chance-each-turn)
  - [Progress Loss on Agent Unassignment](#progress-loss-on-agent-unassignment)
- [2. Key Player Intuitions](#2-key-player-intuitions)
- [3. Lead Investigation Example](#3-lead-investigation-example)
- [4. UI Design](#4-ui-design)
  - [Leads List](#leads-list)
  - [Active Investigations](#active-investigations)
  - [Assigned Agent Status](#assigned-agent-status)
  - [Completed Investigations](#completed-investigations)
  - [Empty And Disabled States](#empty-and-disabled-states)
- [5. Concept definitions](#5-concept-definitions)
  - [Player-facing concepts](#player-facing-concepts)
  - [Advanced concepts](#advanced-concepts)
- [6. Formula reference](#6-formula-reference)
  - [Constants](#constants)
- [7. Intuition behind $P\_{\\text{tadv}}$ - Turn Advancement Success Chance](#7-intuition-behind-p_texttadv---turn-advancement-success-chance)
- [8. Excel formulas reference](#8-excel-formulas-reference)

# 1. Gameplay Basics

## Lead

A **lead** is an investigation target. Completing a lead investigation can unlock new leads, reveal
missions, or advance the game's progression tree.

Every lead has following stored properties:

- `difficulty`: the visible progress target and baseline turn count for one effective skill 100 agent.
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

Lead difficulty and investigation progress are player-facing values. `actualDifficulty` is hidden.

## Completing a Lead Investigation

To complete a `lead investigation`, the player assigns agents to it. Newly assigned agents first
enter **In transit**: they have been routed to the lead but are not yet on station.

During **turn advancement**, assigned agents that are **In transit** become
**Investigating**. Assigned agents that are **Investigating** during turn advancement produce
`turn advancement progress`. That progress is added to the investigation's stored `progress`.

`Progress` is compared against `lead visible difficulty`. That visible difficulty is the lower bound
of `lead investigation actual difficulty`; the actual difficulty is hidden and may be up to 50%
higher (integer, rounded down). Once `progress` reaches actual difficulty, the investigation is
guaranteed to complete.

`Turn advancement progress` is based on `effective skill`. Every 100 effective skill contributes 1
`progress by agent`, and `progress efficiency` applies the diminishing returns from assigning
multiple agents.

### Success chance each turn

After turn advancement progress is added, the game rolls `turn advancement success chance`. This
creates a slight chance each turn to complete the investigation early. Because `accumulated success chance`
is cubed, that chance grows slowly at first, then rapidly approaches 100% as `progress` nears actual difficulty.
See [Lead Investigation Example](#3-lead-investigation-example).

## Progress Loss on Agent Unassignment

Removing agents from an investigation immediately reduces progress in proportion to the effective
skill removed from the assigned agents.

This represents loss of current context: the most skilled agents carry the most current investigative
knowledge, so removing a highly skilled agent causes a larger progress loss than removing a rookie.

Adding agents does not reduce progress. Removing agents does.

# 2. Key Player Intuitions

| Concept               | Player Intuition                                                                                                                                                                                                                                                                                                       |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Difficulty**        | **Difficulty is the visible progress target and baseline turn count.** A Difficulty 10 lead takes about 10 turns for one effective skill 100 agent, though actual difficulty may make it run up to 50% longer.                                                                                                         |
| **Progress**          | **Progress represents how much investigative work has been done.** For an unresolved investigation, progress is effectively capped by actual difficulty: once progress reaches actual difficulty, completion is guaranteed. Actual difficulty is an integer between 100% and 150% of visible difficulty, rounded down. |
| **Success Chance**    | **The higher the completion chance, the sooner the lead is likely to resolve.** Progress makes completion increasingly likely until it becomes guaranteed.                                                                                                                                                             |
| **Progress per Turn** | **The more agents, the faster the work, but each additional agent provides less benefit.** Going from 1 to 2 agents is a big gain; going from 10 to 11 is a small gain.                                                                                                                                                |
| **Actual Difficulty** | **The exact completion turn is unpredictable.** The investigation can finish early from a success roll, but it is guaranteed once progress reaches actual difficulty.                                                                                                                                                  |
| **Proportional Loss** | **The most skilled agents carry the most current context.** Removing a highly skilled agent causes a greater loss of progress than removing a rookie.                                                                                                                                                                  |
| **Exhaustion**        | **Do not let agents exhaust themselves on a long lead.** The player finishes the lead or rotates agents before exhaustion forces removals that cause progress loss.                                                                                                                                                    |

# 3. Lead Investigation Example

For **Difficulty 10** with one **effective skill 100** agent:

Row `0` is the starting state before any turn advancement. Each later row represents the state after
that row's turn advancement. For example, row `2` means the investigation advanced from turn 1 to
turn 2, progress increased from `1/10` to `2/10`, and $P_{\text{tadv}}$ is the success chance rolled during
that turn advancement.

| Turn | Progress | $P_c$ @ D15 | $P_{\text{tadv}}$ @ D15 | $P_c$ @ D10 | $P_{\text{tadv}}$ @ D10 | Mid ± Err  |
| ---: | -------: | ----------: | ----------------------: | ----------: | ----------------------: | :--------- |
|    0 |     0/10 |        0.0% |                    0.0% |        0.0% |                    0.0% | ~0% ± 0%   |
|    1 |     1/10 |        0.0% |                    0.0% |        0.1% |                    0.1% | ~0% ± 0%   |
|    2 |     2/10 |        0.2% |                    0.2% |        0.8% |                    0.7% | ~0% ± 0%   |
|    3 |     3/10 |        0.8% |                    0.6% |        2.7% |                    1.9% | ~1% ± 1%   |
|    4 |     4/10 |        1.9% |                    1.1% |        6.4% |                    3.8% | ~2% ± 1%   |
|    5 |     5/10 |        3.7% |                    1.8% |       12.5% |                    6.5% | ~4% ± 2%   |
|    6 |     6/10 |        6.4% |                    2.8% |       21.6% |                   10.4% | ~7% ± 4%   |
|    7 |     7/10 |       10.2% |                    4.0% |       34.3% |                   16.2% | ~10% ± 6%  |
|    8 |     8/10 |       15.2% |                    5.6% |       51.2% |                   25.7% | ~16% ± 10% |
|    9 |     9/10 |       21.6% |                    7.6% |       72.9% |                   44.5% | ~26% ± 18% |
|   10 |    10/10 |       29.6% |                   10.2% |      100.0% |                  100.0% | ~55% ± 45% |
|   11 |    11/10 |       39.4% |                   13.9% |      100.0% |                  100.0% | ~57% ± 43% |
|   12 |    12/10 |       51.2% |                   19.4% |      100.0% |                  100.0% | ~60% ± 40% |
|   13 |    13/10 |       65.1% |                   28.5% |      100.0% |                  100.0% | ~64% ± 36% |
|   14 |    14/10 |       81.3% |                   46.4% |      100.0% |                  100.0% | ~73% ± 27% |
|   15 |    15/10 |      100.0% |                  100.0% |      100.0% |                  100.0% | ~100% ± 0% |

Legend:

- $P_c$ = accumulated success chance after the advancement that produced this row's progress value.
- $P_{\text{tadv}}$ = turn advancement success chance, the chance rolled during the advancement that produced
  this row's progress value.
- `D15` = actual difficulty is 15.
- `D10` = actual difficulty is 10.
- `Mid ± Err` = midpoint and half-width of the possible $P_{\text{tadv}}$ range.

This is unpredictable, but the pattern is easy to understand:

- It might finish early.
- It becomes much more likely near the visible Difficulty.
- It can run longer than the visible Difficulty because actual difficulty may be up to 150%.
- It becomes guaranteed when progress reaches actual difficulty.

For example, if actual difficulty is 15, turn 8 has a 5.6% `turn advancement success chance`. If
actual difficulty is 10, turn 8 has a 25.7% `turn advancement success chance`.

If actual difficulty for that same Difficulty 10 lead is 15, the same one-agent investigation is
guaranteed at 15 progress instead of 10.

# 4. UI Design

The lead investigations UI is composed of following UI components

- `Leads screen`
  - 1st row
    - `Leads data grid`
  - 2nd row, left column
    - Buttons from top to bottom
      - `"Investigate lead" button`
      - `Next turn`
      - `"Back to command center" button`
    - All buttons must be always of fixed width, taking into account the widest width of the `"Investigate lead" button`
  - 2nd row, right column
    - `Agents data grid for leads`

- Additions to the `Command center screen`:
  - Inside the `Game controls` panel:
    - `Leads` button, to the right of the `Charts` button
  - Inside the `Situation report` panel:
    - `Leads summary` data grid

## Navigating between command center screen and leads screen

The player can click on the `Leads` button in the `Game controls` panel.
It is placed to the left of the `Charts` button.

Clicking the `"Back to command center" button` in the `Leads screen` takes the player back to the command center.

## Investigating a lead

Once player selects one lead in `Current leads data grid` and at least one available agent in `Agents data grid for leads`,
then the `"Investigate lead" button` becomes enabled. Clicking it will start the investigation with the selected lead and agents.

If the lead is already being investigated, then the button instead says `Add agents to investigation`. Clicking it will
assign the agents to the lead.

If zero leads are selected, the button becomes disabled saying `Select a lead`.

If a lead is selected but no agents are selected, the button becomes disabled saying `Select any ready agent`.

Note we assume at most one lead can be selected at a time, and only active lead can be selected.

## Leads data grid

This grid has rows with following columns:

| Column    | Description                            | Example                             |
| --------- | -------------------------------------- | ----------------------------------- |
| Checkbox  | Mult-row selection checkbox            | N/A                                 |
| Lead      | The name of the lead.                  | `Locate Red Dawn training facility` |
| Diff.     | The difficulty of the lead.            | `10`                                |
| Rpt.      | Whether the lead is repeatable.        | `Yes`                               |
| Investig. | Investigation status.                  | `Active, #3`                        |
| Agents    | Number of agents assigned to the lead. | `2`                                 |
| Progress  | Progress on the lead                   | `8.0/10`                            |
| Projected | Projected progress on the lead         | `+1.74`                             |
| Eff.      | Investigation efficiency.              | `87%`                               |
| Success % | Success chance range.                  | `~16% ± 10%`                        |

### Leads data grid toolbar

The toolbar of the data grid has following filters, where always exactly 1 filter must be selected:

- `Active` (selected by default)
- `Inactive`
- `Archived`

If `Active` is selected, only active leads are shown, as defined in [About Lead Discovery](../about_lead_discovery.md).
If `Inactive` is selected, only inactive leads are shown, as defined in [About Lead Discovery](../about_lead_discovery.md).
If `Archived` is selected, only archived leads are shown, as defined in [About Lead Discovery](../about_lead_discovery.md).

If the users unselects `Inactive` or `Archived`, then `Active` is selected automatically.
If `Active` is selected, user cannot unselect it.

### Leads data grid column details

No more than one `Checkbox` can be selected at a time, and only rows with active leads can be selected.

Possible values of `Rpt.` are: `Yes` or `No`.

Possible values of `Investigation` are: `None`, `Inactive`, `Active` or `Active #N`

`Active` applies only for leads that are not repeatable.

`Active #N` applies only for leads that are repeatable. First investigation is `#1`, second is `#2`, etc.

`Agents`, `Progress`, `Projected`, `Efficiency`, `Success %` are all empty if investigation is `None` or `Blocked`.

`Success %` is the `turn advancement success chance range`. The range exists only because the exact
`actualDifficulty` is hidden from the player:

- The lower bound assumes actual difficulty is as high as possible.
- The upper bound assumes actual difficulty is equal to visible difficulty.
- `Mid` is the midpoint between lower and upper `turn advancement success chance`.
- `Err` is half the distance between lower and upper `turn advancement success chance`.

## Agents data grid for leads

This grid has rows with following columns:

| Column     | Description                 | Example        |
| ---------- | --------------------------- | -------------- |
| Checkbox   | Mult-row selection checkbox | N/A            |
| ID         | The id of the agent.        | `agent-000`    |
| State      | The state of the agent      | `Available`    |
| Assignment | The assignment of the agent | `Standby`      |
| Skill      | The skill of the agent      | `85/100 (85%)` |
| Exhaustion | The exhaustion of the agent | `20.0%`        |

The toolbar of the data grid has following filters, where any number (0 to all) can be selected:

- `Ready` (selected by default)
- `Away`
- `Exhausted`
- `Recovering`

- Always at least one filter must be selected.
- If `Ready` is selected, following agents are shown:
  - with assignment `Standby` or `Training`
  - and NOT `InTransit`,
  - and whose exhaustion is less than 30%.
- If `Away` is selected, agents in state `InTransit` or `Contracting` or `Investigating` or `OnMission` are shown.
  However, this excludes agents with assignment `Recovery`.
- If `Exhausted` is selected, following agents are shown:
  - with assignment `Standby` or `Training`
  - and NOT `InTransit`,
  - and whose exhaustion is 30% or more.
- If `Recovering` is selected, agents in state `Recovering` are shown.

If no filters is selected, no rows will be displayed, and the data grid should display "Please select at least one filter above".

## Leads summary

KJA leads TODO write this section

## Completed Investigations

KJA leads TODO adapt this section

Completed investigations appear in the same lead investigations data grid when the `done` filter is
active. Abandoned investigations appear there when the `abandoned` filter is active.

```text
Investigation  Ag #  Succ %  Progress  Proj.
```

## Empty And Disabled States

KJA leads TODO adapt this section

When no lead is available, the empty state explains the gameplay cause instead of showing an empty
list alone.

```text
No leads available. Complete missions or interrogate captives to uncover new leads.
```

When a lead cannot start because another active investigation already exists for that lead, the
disabled state names the blocking investigation.

```text
Already investigating this lead.
```

# 5. Concept definitions

## Player-facing concepts

- **`Lead`:** An investigation target that can have `lead investigation` records started for it.

- **`Repeatable lead`:** A `lead` that can be investigated repeatably, but only once at a time.

- **`Lead investigation`:** A state object representing one active or past investigation of a `lead`.

- **`Lead visible difficulty`:** The `lead`'s player-facing difficulty value. It is the `progress`
  denominator and establishes the lower bound of `lead investigation actual difficulty`.

- **`Effective skill`:** See `about_agents.md`.

- **`Progress`:** The `lead investigation`'s accumulated work toward
  `lead investigation actual difficulty`. When `Advance turn` is clicked, the computed
  `turn advancement progress` is added to the `progress` value.

- **`Progress efficiency`:** The diminishing returns factor for stacked agents:
  `agentCount ^ 0.8 / agentCount`.

- **`Turn advancement progress`:** The `progress` added to `progress` when `Advance turn` is clicked.
  It is produced by assigned agents that are **Investigating** during turn advancement:
  `progressByAgent * progressEfficiency`, where `progressByAgent = sum(effectiveSkill) / 100` and
  `progressEfficiency = agentCount ^ 0.8 / agentCount`.

## Advanced concepts

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

- **`Accumulated success chance`:** The target total chance that a `lead investigation` has already
  completed at or before a given `progress` value:
  `min(1, progress / actualDifficulty) ^ 3`. It is not a per-turn chance. The
  `turn advancement success chance` is derived from the difference between previous and current
  `accumulated success chance`, conditional on the `lead investigation` still being unresolved.

# 6. Formula reference

<!-- markdownlint-disable MD051 -->
<!-- Why? False positive on [intuition](#9-intuition-behind----turn-advancement-success-chance) -->

| Definition                                           | Formula                                                                                            | Remarks                                                                                                                                                                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| $D_v$ - lead visible difficulty                      | Given by the lead.                                                                                 | Visible difficulty establishes the lower bound of actual difficulty.                                                                                                                                       |
| $S_{\text{eff}}$ - effective skill                   | See [about_agents.md](about_agents.md#effective-skill).                                            | Effective skill is dictated by hit points and exhaustion.                                                                                                                                                  |
| $P_{\text{agent}}$ - progress by agent               | $P_{\text{agent}} = \sum \frac{S_{\text{eff}}}{100}$                                               | Every 100 effective skill contributes 1 progress by agent.                                                                                                                                                 |
| $P_{\text{eff}}$ - progress efficiency               | $P_{\text{eff}} = \frac{\text{agentCount}^{0.8}}{\text{agentCount}}$                               | More agents help, but each additional agent adds less.                                                                                                                                                     |
| $\Delta p$ - turn advancement progress               | $\Delta p = P_{\text{agent}} \cdot P_{\text{eff}}$                                                 | When advancing from turn $n$ to turn $n+1$, $P_{\text{agent}}$ and $P_{\text{eff}}$ are computed from assigned agents that are **Investigating** during turn advancement.                                  |
| $p_{n+1}$ - progress after turn advancement          | $p_{n+1} = p_n + \Delta p$                                                                         | Advancing from turn $n$ to turn $n+1$ adds $\Delta p$.                                                                                                                                                     |
| $D_a$ - lead investigation actual difficulty         | $D_a = \left\lfloor D_v \cdot \operatorname{random}(1.0, 1.5) \right\rfloor$                       | Actual difficulty is hidden, integer, and between 100% and 150% of visible difficulty.                                                                                                                     |
| $\rho$ - progress ratio                              | $\rho(p, D_a) = \min\left(1, \frac{p}{D_a}\right)$                                                 | Progress ratio is measured against actual difficulty, not visible difficulty, and is capped at 100%.                                                                                                       |
| $P_c$ - accumulated success chance                   | $P_c(p, D_a) = \rho(p, D_a)^3$                                                                     | Accumulated success chance is progress ratio of actual difficulty, cubed.                                                                                                                                  |
| $P_{\text{tadv}}$ - turn advancement success chance  | $P_{\text{tadv}}(p_n, p_{n+1}, D_a) = \frac{P_c(p_{n+1}, D_a) - P_c(p_n, D_a)}{1 - P_c(p_n, D_a)}$ | When advancing from turn $n$ to turn $n+1$, the roll happens only in timelines where the investigation has not already succeeded. See [intuition](#9-intuition-behind----turn-advancement-success-chance). |
| $p_{\text{new}}$ - progress after agent unassignment | $p_{\text{new}} = p_{\text{old}} \cdot \frac{S_{\text{remaining}}}{S_{\text{previous}}}$           | Removing agents loses progress in proportion to removed effective skill.                                                                                                                                   |

<!-- markdownlint-enable MD051 -->

## Constants

The table above uses inline following constants:

| Constant                                 | Value   | Used in                                      | Remarks                                                                        |
| :--------------------------------------- | :------ | :------------------------------------------- | :----------------------------------------------------------------------------- |
| **Scaling exponent**                     | **0.8** | $P_{\text{eff}}$ - progress efficiency       | Controls diminishing returns from assigning multiple agents.                   |
| **Minimum actual difficulty multiplier** | **1.0** | $D_a$ - lead investigation actual difficulty | Actual difficulty is never lower than visible difficulty.                      |
| **Maximum actual difficulty multiplier** | **1.5** | $D_a$ - lead investigation actual difficulty | Actual difficulty can be up to 50% higher than visible difficulty.             |
| **Cumulative chance exponent**           | **3**   | $P_c$ - accumulated success chance           | Makes early success possible but unlikely, then rises sharply near completion. |

# 7. Intuition behind $P_{\text{tadv}}$ - Turn Advancement Success Chance

The formula reference above is enough to implement the system. This section explains why
$P_{\text{tadv}}$ is written in conditional form.

The system uses a cumulative probability curve, not a direct per-turn linear chance. The
$P_{\text{tadv}}$ formula makes repeated turn advancement rolls match the cumulative probability
curve exactly.

When advancing from turn $n$ to turn $n+1$:

- $P_c(p_n, D_a)$ is the total chance that the investigation would already have succeeded before
  adding progress for this turn advancement.
- $P_c(p_{n+1}, D_a)$ is the total chance that the investigation has succeeded after adding
  progress for this turn advancement.
- $P_c(p_{n+1}, D_a) - P_c(p_n, D_a)$ is the new success chance added by this turn advancement.
- $1 - P_c(p_n, D_a)$ is the unresolved probability space still available, because the roll only
  happens in timelines where the investigation has not already succeeded.

So the roll made during turn advancement asks:

$$
P_{\text{tadv}} =
\frac{\text{new success chance added by this turn advancement}}{\text{chance the investigation was still unresolved}}
$$

For example, if accumulated success chance rises from 20% to 44%, this turn advancement adds 24
percentage points of total success chance. But only the unresolved 80% of cases are still rolling,
so the turn advancement success chance is:

$$
\frac{44\% - 20\%}{100\% - 20\%} = 30\%
$$

After that roll, the accumulated success chance is exactly 44%:

$$
20\% + (80\% \cdot 30\%) = 44\%
$$

# 8. Excel formulas reference

To reproduce the Difficulty 10 example table in Excel, use these inputs:

| Cell | Meaning                                 |            Example |
| ---- | --------------------------------------- | -----------------: |
| `B1` | Visible difficulty                      |               `10` |
| `B2` | Progress per turn                       |                `1` |
| `B3` | Minimum actual difficulty               |              `=B1` |
| `B4` | Maximum actual difficulty, rounded down | `=FLOOR(B1*1.5,1)` |

Then create this table starting on row 7:

| Column | Header                     | Formula for row 7                                                                                                    |
| ------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `A`    | `Turn`                     | `=0`                                                                                                                 |
| `B`    | `ProgressValue`            | `=A7*$B$2`                                                                                                           |
| `C`    | `Progress`                 | `=IF(RC[-1]=INT(RC[-1]),TEXT(RC[-1],"0"),TEXT(RC[-1],"0.#"))&"/"&IF(R1C2=INT(R1C2),TEXT(R1C2,"0"),TEXT(R1C2,"0.#"))` |
| `D`    | `$P_c$ @ Dmax`             | `=MIN(1,(B7/$B$4)^3)`                                                                                                |
| `E`    | `$P_{\text{tadv}}$ @ Dmax` | `=IF(ROW()=ROW($A$7),0,IF(D6>=1,1,(D7-D6)/(1-D6)))`                                                                  |
| `F`    | `$P_c$ @ Dmin`             | `=MIN(1,(B7/$B$3)^3)`                                                                                                |
| `G`    | `$P_{\text{tadv}}$ @ Dmin` | `=IF(ROW()=ROW($A$7),0,IF(F6>=1,1,(F7-F6)/(1-F6)))`                                                                  |

For row 8 and below:

- `A8`: `=A7+1`
- Copy columns `B:G` down from row 7.
- Format `D:G` as percentages.
- Column `C` is the compact progress label derived from the calculation columns.

In this setup:

- `$P_c$ @ Dmax` and `$P_{\text{tadv}}$ @ Dmax` are the low-end success chances, because actual difficulty is as high
  as possible after rounding down.
- `$P_c$ @ Dmin` and `$P_{\text{tadv}}$ @ Dmin` are the high-end success chances, because actual difficulty is as low
  as possible.
