# Mission deployments UI (Missions screen)

This document describes the UI design for mission deployments: the missions screen layout, navigation,
mission and agent data grids, toolbars, mission details, and empty or disabled states.

- [Mission deployments UI (Missions screen)](#mission-deployments-ui-missions-screen)
- [Missions Screen layout](#missions-screen-layout)
- [Navigating between command center screen and missions screen](#navigating-between-command-center-screen-and-missions-screen)
- [Deploying agents on a mission](#deploying-agents-on-a-mission)
- [Missions data grid](#missions-data-grid)
  - [Missions data grid title](#missions-data-grid-title)
  - [Missions data grid filters toolbar](#missions-data-grid-filters-toolbar)
  - [Missions data grid column details](#missions-data-grid-column-details)
- [Agents data grid for missions](#agents-data-grid-for-missions)
  - [Agents data grid title](#agents-data-grid-title)
  - [Agents data grid filters toolbar](#agents-data-grid-filters-toolbar)
  - [Agents data grid column details](#agents-data-grid-column-details)
- [Mission details](#mission-details)
- [Missions summary in situation report panel](#missions-summary-in-situation-report-panel)
- [See also](#see-also)

# Missions Screen layout

The missions screen is composed of following UI components

- `Missions screen`
  - 1st row
    - `Missions data grid`
  - 2nd row, left column
    - Buttons from top to bottom
      - `"Deploy agents" button`
      - `Next turn`
      - `"Back to command center" button`
    - All buttons must be always of fixed width, taking into account the widest width of the `"Deploy agents" button`
  - 2nd row, right column
    - `Agents data grid for missions`

- Additions to the `Command center screen`:
  - Inside the `Game controls` panel:
    - `Missions` button, to the left of the `Leads` button
  - Inside the `Situation report` panel:
    - `Missions summary` data grid
  - The command center screen should no longer render the full `Missions data grid` or the full `Agents data grid`.

# Navigating between command center screen and missions screen

The player can click on the `Missions` button in the `Game controls` panel.
It is placed to the left of the `Leads` button.

Clicking the `"Back to command center" button` in the `Missions screen` takes the player back to the command center.

Pressing `Escape` while on the `Missions screen` should also take the player back to the command center, matching the behavior of the `Leads screen` and `Charts screen`.

# Deploying agents on a mission

Once player selects one active mission in `Missions data grid` and at least one ready agent in
`Agents data grid for missions`, then the `"Deploy agents" button` becomes enabled. Clicking it will deploy
the selected agents to the selected mission.

The button label includes the number of selected agents and the selected mission target:

```text
Deploy {agentCount} on {missionTarget}
```

If zero missions are selected, the button becomes disabled saying `Select a mission`.

If a mission is selected but no agents are selected, the button becomes disabled saying `Select any ready agent`.

If a mission is selected but it is not in `Active` state, the button becomes disabled saying `Select an active mission`.

If selected agents exceed remaining transport capacity, the action reports `Cannot deploy {agentCount} agents. Only {remainingTransportCap} transport slots available.`

If deployment succeeds:

- The selected mission state changes from `Active` to `Deployed`.
- The mission's `agentIds` become the selected agent IDs.
- Each selected agent's `State` becomes `OnMission`.
- Each selected agent's `Assignment` becomes the mission ID.
- Each selected agent's `missionsTotal` increments by 1.
- The selected agents and selected mission are cleared.

Note we assume at most one mission can be selected at a time, and only active mission can be selected.

# Missions data grid

This grid has rows with following columns:

| Column     | Description                                     | Example                   |
| ---------- | ----------------------------------------------- | ------------------------- |
| Checkbox   | Single-row selection checkbox                   | N/A                       |
| Mission ID | The ID or display name of the mission.          | `Raid Red Dawn safehouse` |
| CR         | Mission combat rating / threat estimate.        | `2.4`                     |
| State      | The state of the mission.                       | `Active`                  |
| ExpIn      | Turns until active mission expiration.          | `4`                       |
| Turn       | Turn on which an archived mission concluded.    | `17`                      |
| Details    | Button that opens mission details for this row. | `Details`                 |

## Missions data grid title

Rendered as:

```text
Missions: Active {active}
Exp {expired} | Succ {successful} | Fail {failed}
```

`{active}` is the count of missions in `Active` or `Deployed` state.

`{expired}` is the count of missions in `Expired` state.

`{successful}` is the count of missions in `Won` state.

`{failed}` is the count of missions in `Wiped` or `Retreated` state.

## Missions data grid filters toolbar

The toolbar of the data grid has following filters, where always exactly 1 view is shown:

- `Active ({active})` (selected by default)
- `Archived ({archived})`

`{active}` counts missions in `Active` or `Deployed` state. Missions that concluded during the current turn
advancement are also shown in the active view for that turn report context, even though their state is already
archived.

`{archived}` counts missions in `Won`, `Wiped`, `Retreated`, or `Expired` state.

If `Active` is selected, active and deployed missions are shown.
If `Archived` is selected, only archived missions are shown.

If the user unselects `Archived`, then `Active` is selected automatically.
If `Active` is selected, user cannot unselect it.

If the selected filters result in no rows being displayed, then the data grid should display "No missions found using selected filters".

## Missions data grid column details

No more than one `Checkbox` can be selected at a time, and only rows with `Active` missions can be selected.

Possible values of `State` are: `Active`, `Deployed`, `Won`, `Retreated`, `Wiped`, or `Expired`.

`Active` means the mission is discovered but not engaged.

`Deployed` means agents are on the mission and combat will be evaluated during turn advancement.

`Won` means the mission completed successfully.

`Retreated` means agents withdrew from the mission before completion.

`Wiped` means all deployed agents were lost.

`Expired` means time ran out before deployment.

`CR` is the stored mission combat rating. It is calculated from all enemies on the mission and normalized against
the initial hired agent combat rating.

`ExpIn` is shown only for `Active` missions. It is rendered as:

- `Never`, when the mission never expires.
- A turn count with a color bar, when the mission expires after a finite number of turns.
- `-`, for non-active missions.

`Turn` is shown only when the archived view is selected. It is the mission's `concludedTurn`.

`Details` is always available and opens the mission details screen for the selected row.

# Agents data grid for missions

This grid is mission-specific and is not the full roster view. It focuses on deployment-relevant facts.

This grid has rows with following columns:

| Column      | Description                                    | Example        |
| ----------- | ---------------------------------------------- | -------------- |
| Checkbox    | Multi-row selection checkbox                   | N/A            |
| ID          | The id of the agent.                           | `agent-000`    |
| State       | The state of the agent.                        | `Available`    |
| Assignment  | The assignment of the agent.                   | `Standby`      |
| CR          | Agent combat rating contribution.              | `1.2`          |
| Skill       | Effective skill and baseline skill.            | `85/100 (85%)` |
| HP          | Current and maximum hit points.                | `30/30`        |
| Exhaustion  | The exhaustion of the agent.                   | `20.0%`        |
| Unavailable | Why the agent cannot be deployed on a mission. | `Recovering`   |

## Agents data grid title

Rendered on a single line, left aligned:

```text
Agents: {allActive}
```

`{allActive}` is the count of alive agents (excluding `KIA` and `Sacked`).

The filter-specific counts are displayed next to the toolbar filters instead of in the title.

## Agents data grid filters toolbar

The toolbar of the data grid has following filters, where any number (0 to all) can be selected:

- `Ready ({ready})` (selected by default)
- `Away ({away})`
- `Exhausted ({exhausted})`
- `Recovering ({recovering})`

`Ready`, `Away`, `Exhausted`, and `Recovering` use the same predicates as the corresponding toolbar filters on this grid.

- Always at least one filter must be selected.
- If `Ready` is selected, following agents are shown:
  - with assignment `Standby` or `Training`,
  - and NOT `InTransit`,
  - and whose exhaustion is less than 30%.
- If `Away` is selected, alive agents that are not ready, exhausted, or recovering are shown.
  This includes agents in transit, contracting, training, investigating, or already on a mission.
- If `Exhausted` is selected, following agents are shown:
  - with assignment `Standby` or `Training`,
  - and NOT `InTransit`,
  - and whose exhaustion is 30% or more.
- If `Recovering` is selected, agents with assignment `Recovery` or state `Recovering` are shown.

If no filters is selected, no rows will be displayed, and the data grid should display "Please select at least one filter above".

If the selected filters result in no rows being displayed, then the data grid should display "No agents found using selected filters".

## Agents data grid column details

Only `Ready` rows can be selected.

Mission deployment requires selected agents to be in `Available` state and to have exhaustion below 100%.
Agents in `Training` assignment are not deployable unless their current state is `Available`.

`CR` is the selected agent's combat rating contribution, normalized against the initial hired agent combat rating.

`Skill` shows effective skill, baseline skill, and the effective-skill percentage. Effective skill is reduced by
lost hit points and exhaustion.

`HP` shows current hit points over maximum hit points.

`Unavailable` is empty for `Ready` rows. For non-ready rows it explains the blocking reason, for example:

- `Away`
- `Exhausted`
- `Recovering`
- `In transit`
- `On mission`
- `Investigating`
- `Training`

# Mission details

The `Details` column remains reachable from the `Missions screen`.

Clicking `Details` opens the mission details screen for that mission. The mission details screen shows:

- Mission details card.
- Battle log card.
- Combat log card.

Clicking the `"Back to command center" button` on the mission details screen closes mission details and returns to the
command center.

Pressing `Escape` also closes mission details and returns to the command center.

# Missions summary in situation report panel

The `Missions summary` appears in the `Situation report` panel on the command center screen.

It is rendered as a compact data grid with following columns:

| Column | Example           |
| ------ | ----------------- |
| Item   | `Mission sites`   |
| Count  | `2`               |

It has following rows:

| Item                | Count                                   |
| ------------------- | --------------------------------------- |
| `Mission sites`     | Number of missions in `Active` state    |
| `Expiring soon`     | Number of active missions expiring soon |
| `Deployed missions` | Number of missions in `Deployed` state  |

`Mission sites` counts missions in `Active` state.

`Expiring soon` counts active missions with finite `expiresIn` value less than or equal to 3.
Missions with `expiresIn` equal to `never` do not count as expiring soon.

A `Deployed mission` is a mission in `Deployed` state.

# See also

- [About Deployed Mission Sites](../design/about_deployed_mission_site.md)
- [About Mission Threat Assessment](../design/about_mission_threat_assessment.md)
- [About Agents](../design/about_agents.md)
