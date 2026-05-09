# Agent management UI (Agents screen)

This document describes the UI design for agent roster management: the agents screen layout, navigation,
roster actions, data grid views, toolbar filters, and empty or disabled states.

- [Agent management UI (Agents screen)](#agent-management-ui-agents-screen)
- [Agents Screen layout](#agents-screen-layout)
- [Navigating between command center screen and agents screen](#navigating-between-command-center-screen-and-agents-screen)
- [Managing agents](#managing-agents)
- [Agents data grid](#agents-data-grid)
  - [Agents data grid title](#agents-data-grid-title)
  - [Agents data grid filters toolbar](#agents-data-grid-filters-toolbar)
  - [Agents data grid column details](#agents-data-grid-column-details)
    - [Default roster columns](#default-roster-columns)
    - [Recovery columns](#recovery-columns)
    - [Stats columns](#stats-columns)
    - [Terminated columns](#terminated-columns)
- [Action button states](#action-button-states)
- [Agents summary in situation report panel](#agents-summary-in-situation-report-panel)
- [See also](#see-also)

# Agents Screen layout

The agents screen is composed of following UI components

- `Agents screen`
  - 1st row
    - `Agents data grid`
  - 2nd row, left column
    - Buttons from top to bottom
      - `"Hire Agent" button`
      - `"Sack agents" button`
      - `"Recall agents" button`
      - `"Assign agents to contracting" button`
      - `"Assign agents to training" button`
      - `Next turn`
      - `"Back to command center" button`
    - All buttons must be always of fixed width, taking into account the widest width of the roster-management buttons

- Additions to the `Command center screen`:
  - Inside the `Game controls` panel:
    - `Agents` button, to the left of the `Leads` button
  - Inside the `Situation report` panel:
    - `Agents summary` data grid

The `Command center screen` should no longer render the full `Agents data grid`.
The command center keeps only the compact `Agents summary` in the `Situation report` panel and the `Agents` navigation button in the `Game controls` panel.

# Navigating between command center screen and agents screen

The player can click on the `Agents` button in the `Game controls` panel.
It is placed to the left of the `Leads` button.

Clicking the `"Back to command center" button` in the `Agents screen` takes the player back to the command center.

Pressing `Escape` while on the `Agents screen` should also take the player back to the command center, matching the behavior of the `Leads screen` and `Charts screen`.

# Managing agents

The `Agents screen` owns the full roster-management actions:

- `Hire Agent`
- `Sack {agent count}`
- `Recall {agent count}`
- `Assign {agent count} to contracting`
- `Assign {agent count} to training`

The `Agents screen` does not own mission deployment or lead investigation:

- Deploying agents on missions belongs on the `Missions screen`.
- Investigating leads belongs on the `Leads screen`.

Hiring an agent creates a new agent in `InTransit` state with `Standby` assignment. The action costs `AGENT_HIRE_COST`.
If the player does not have enough money, the action shows `Insufficient funds`.
If the roster is at `agentCap`, the action shows `Cannot hire more than {agentCap} agents (agent cap reached)`.

Sacking agents is allowed only for selected agents in `Available` state.
Successful sacking changes each selected agent to `Sacked` state and `Sacked` assignment, records `turnTerminated`, moves the agent to the terminated roster, and clears the agent selection.

Assigning agents to contracting is allowed only for selected agents in `Available` state with exhaustion below 100.
Successful assignment changes each selected agent to `InTransit` state with `Contracting` assignment and clears the agent selection.

Assigning agents to training is allowed only for selected agents in `Available` state with exhaustion below 100, and only when enough `trainingCap` slots are available.
Successful assignment changes each selected agent to `InTraining` state with `Training` assignment and clears the agent selection.

Recalling agents is allowed only for selected agents in `Contracting` state, `Investigating` state, or `InTraining` state with `Training` assignment.
Successful recall changes each selected agent's assignment to `Standby` and clears the agent selection.
Recalled training agents become `Available` immediately.
Recalled contracting and investigating agents become `InTransit`.
When recalling an investigating agent from a lead investigation, the investigation loses progress according to the lead-investigation progress-loss rules, and the investigation becomes `Abandoned` if no agents remain assigned.

# Agents data grid

This grid has rows for all current agents plus terminated agents when shown by the selected view.

The default roster view has rows with following columns:

| Column     | Description                   | Example        |
| ---------- | ----------------------------- | -------------- |
| Checkbox   | Multi-row selection checkbox  | N/A            |
| ID         | The id of the agent.          | `agent-000`    |
| State      | The state of the agent.       | `Available`    |
| Assignment | The assignment of the agent.  | `Standby`      |
| Skill      | The effective and base skill. | `85/100 (85%)` |
| Exh.       | The exhaustion of the agent.  | `20%`          |

## Agents data grid title

Rendered as two parts on a single line:

```text
Agents: All {allActive} | Rdy {ready} | Exh {exhausted} | Rcv {recovering}
KIA {kia} | Sck {sacked}
```

`{allActive}` is the count of agents that are not `KIA` and not `Sacked`.

`{ready}` uses the same definition as `Ready` on the `Agents data grid for leads`: agents with assignment
`Standby` or `Training`, not in `InTransit` state, and with exhaustion less than 30%.

`{exhausted}` uses the same definition as `Exhausted` on the `Agents data grid for leads`: agents with assignment
`Standby` or `Training`, not in `InTransit` state, and with exhaustion 30% or more.

`{recovering}` counts agents in `Recovering` state.

`{kia}` counts agents in `KIA` state.

`{sacked}` counts agents in `Sacked` state.

## Agents data grid filters toolbar

The toolbar of the data grid has following views, where at most 1 view can be selected:

- `available`
- `recovering`
- `stats`
- `terminated`

If no view is selected, the default roster view is shown.

If `available` is selected, only agents in `Available` or `InTraining` state are shown.

If `recovering` is selected, only agents with `Recovery` assignment are shown.

If `stats` is selected, all rows from the default roster view are shown, but the visible columns change to career-stat columns.

If `terminated` is selected, only agents in `KIA` or `Sacked` state are shown.

Selecting any one of these views clears the other views.
Unselecting the selected view returns to the default roster view.

The default roster view shows all non-terminated agents.
It also shows agents terminated during the most recent turn advancement, so newly terminated agents remain visible immediately after the turn report is generated.

If one or more agents are selected and their combined combat rating is greater than 0, the toolbar displays:

```text
Combat rating: {selectedAgentsCombatRating}
```

The `Agents screen` is the place to inspect terminated agents and career stats.
Agent sub-grids on `Missions screen` and `Leads screen` should stay task-specific and should not expose the full terminated or stats views by default.

If the selected view results in no rows being displayed, then the data grid should display "No agents found using selected filters".

## Agents data grid column details

Agent row selection supports multiple selected rows.
The current roster-management buttons validate the selected agents when clicked.

### Default roster columns

The default roster view shows:

| Column       | Description                                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ID`         | The id of the agent, formatted for display.                                                                                                                                                      |
| `State`      | The current state of the agent, shown as a chip. Possible values include `Available`, `InTransit`, `Recovering`, `Contracting`, `Investigating`, `OnMission`, `InTraining`, `KIA`, and `Sacked`. |
| `Assignment` | The current assignment of the agent. Lead investigation assignments are shortened from `investigation-NNN` to `invst-NNN`.                                                                       |
| `Skill`      | Effective skill over base skill, with a percentage. Effective skill accounts for hit point loss and exhaustion.                                                                                  |
| `Exh.`       | Agent exhaustion percentage.                                                                                                                                                                     |

### Recovery columns

The `recovering` view shows:

| Column     | Description                                            | Example      |
| ---------- | ------------------------------------------------------ | ------------ |
| `ID`       | The id of the agent, formatted for display.            | `agent-000`  |
| `State`    | The current state of the agent.                        | `Recovering` |
| `Recovery` | Remaining recovery turns, or `-` when no turns remain. | `3 turns`    |
| `Exh.`     | Agent exhaustion percentage.                           | `20%`        |
| `HP`       | Current hit points over maximum hit points.            | `23/30`      |
| `Skill`    | Base skill as an integer.                              | `100`        |

### Stats columns

The `stats` view shows:

| Column    | Description                                                                                                                                        | Example     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `ID`      | The id of the agent, formatted for display.                                                                                                        | `agent-000` |
| `Skill`   | Base skill as an integer.                                                                                                                          | `120`       |
| `Exp.`    | Skill gained outside training, computed as `skill - skillFromTraining`.                                                                            | `15`        |
| `Trn.`    | Skill gained from training.                                                                                                                        | `5`         |
| `HP`      | Maximum hit points.                                                                                                                                | `30`        |
| `Mis #`   | Total missions the agent has been on, including the mission where they died if applicable.                                                         | `4`         |
| `Service` | Turns served. Active agents show `turnHired-currentTurn (totalTurnsServed)`. Terminated agents show `turnHired-turnTerminated (totalTurnsServed)`. | `3-9 (7)`   |
| `KIA`     | Enemy kills credited to the agent.                                                                                                                 | `2`         |
| `DInfl`   | Total damage inflicted by the agent.                                                                                                               | `37`        |
| `DRecv`   | Total damage received by the agent.                                                                                                                | `12`        |

### Terminated columns

The `terminated` view shows:

| Column       | Description                                                                                | Example     |
| ------------ | ------------------------------------------------------------------------------------------ | ----------- |
| `ID`         | The id of the agent, formatted for display.                                                | `agent-000` |
| `Skill`      | Base skill as an integer.                                                                  | `120`       |
| `HP`         | Maximum hit points.                                                                        | `30`        |
| `Service`    | Turns served as `turnHired-turnTerminated (totalTurnsServed)`.                             | `3-9 (7)`   |
| `Mis #`      | Total missions the agent has been on, including the mission where they died if applicable. | `4`         |
| `Mis`        | The mission where the agent was killed, or `Sacked` for sacked agents.                     | `raid-hq`   |
| `By`         | The enemy that killed the agent, or `-` when not applicable.                               | `cultist`   |
| `Terminated` | The turn when the agent was terminated.                                                    | `9`         |

# Action button states

`Hire Agent` is enabled by default. If the action cannot be completed, clicking it shows the validation error:

- `Insufficient funds`
- `Cannot hire more than {agentCap} agents (agent cap reached)`

`Sack {agent count}` is disabled when zero current agents are selected.
If clicked with an invalid selection, it shows `This action can be done only on available agents!`.

`Recall {agent count}` is disabled when zero current agents are selected.
If clicked with an invalid selection, it shows `This action can be done only on Contracting, Investigating, or InTraining agents!`.

`Assign {agent count} to contracting` is disabled when zero current agents are selected.
If clicked with an invalid selection, it shows one of:

- `This action can be done only on available agents!`
- `Agents with exhaustion of 100 or more cannot be assigned!`

`Assign {agent count} to training` is disabled when zero current agents are selected.
If clicked with an invalid selection, it shows one of:

- `This action can be done only on available agents!`
- `Agents with exhaustion of 100 or more cannot be assigned!`
- `Cannot assign {agent count} agents to training. Only {availableTrainingCap} training slots available.`

Selection-based roster actions ignore selected IDs that are not in the current active roster.
This means terminated agents can be inspected on the `Agents screen`, but they are not valid targets for roster-management actions.

# Agents summary in situation report panel

The `Agents summary` appears in the `Situation report` panel on the command center screen.

It is rendered as a compact data grid with following columns:

| Column | Example        |
| ------ | -------------- |
| Item   | `Ready agents` |
| Count  | `3`            |

It has following rows:

| Item                | Count                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------ |
| `Ready agents`      | Number of ready agents, using the same count as `Rdy` in the `Agents data grid` title      |
| `Exhausted agents`  | Number of exhausted agents, using the same count as `Exh` in the `Agents data grid` title  |
| `Recovering agents` | Number of recovering agents, using the same count as `Rcv` in the `Agents data grid` title |
| `Away agents`       | Number of active agents that are not ready, exhausted, or recovering                       |

`Ready agents` and `Exhausted agents` use the same definitions as the `Ready` and `Exhausted` filters on the
`Agents data grid for leads`.

`Away agents` is computed as:

```text
{allActive} - {ready} - {exhausted} - {recovering}
```

This includes agents in transit, contracting, investigating, on mission, and any other non-terminated agents that are not counted as ready, exhausted, or recovering.

# See also

- [About Agents](../design/about_agents.md)
- [About Deployed Mission Sites](../design/about_deployed_mission_site.md)
- [About Lead Investigations](../design/about_lead_investigations.md)
