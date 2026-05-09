# Lead investigations UI (Leads screen)

This document describes the UI design for agent lead investigations: the leads screen layout, navigation,
data grids, toolbars, and empty or disabled states.

- [Lead investigations UI (Leads screen)](#lead-investigations-ui-leads-screen)
- [Screen layout](#screen-layout)
- [Navigating between command center screen and leads screen](#navigating-between-command-center-screen-and-leads-screen)
- [Investigating a lead](#investigating-a-lead)
- [Leads data grid](#leads-data-grid)
  - [Leads data grid title](#leads-data-grid-title)
  - [Leads data grid toolbar](#leads-data-grid-toolbar)
  - [Leads data grid column details](#leads-data-grid-column-details)
- [Agents data grid for leads](#agents-data-grid-for-leads)
  - [Agents data grid title](#agents-data-grid-title)
  - [Agents data grid toolbar](#agents-data-grid-toolbar)
- [Leads summary](#leads-summary)
- [Completed Investigations](#completed-investigations)
- [Empty And Disabled States](#empty-and-disabled-states)

## Screen layout

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
    - `Leads` button, to the left of the `Charts` button
  - Inside the `Situation report` panel:
    - `Leads summary` data grid

## Navigating between command center screen and leads screen

The player can click on the `Leads` button in the `Game controls` panel.
It is placed to the left of the `Charts` button.

Clicking the `"Back to command center" button` in the `Leads screen` takes the player back to the command center.

## Investigating a lead

Once player selects one lead in `Leads data grid` and at least one available agent in `Agents data grid for leads`,
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
| Type      | Lead type.                             | `Repeatable`                        |
| Investig. | Investigation status.                  | `Active, #3`                        |
| ID        | Investigation ID.                      | `042`                               |
| Agents    | Number of agents assigned to the lead. | `2`                                 |
| Progress  | Progress on the lead                   | `8.0/10`                            |
| Projected | Projected progress on the lead         | `+1.74`                             |
| Eff.      | Investigation efficiency.              | `87%`                               |
| Success % | Success chance range.                  | `~16% ± 10%`                        |

### Leads data grid title

Rendered as:

```text
Leads: {all}
```

`{all}` is the total count of leads that are not archived.

### Leads data grid toolbar

The toolbar of the data grid has following filters, where always exactly 1 filter must be selected:

- `Active ({active})` (selected by default)
- `Inactive ({inactive})`
- `Archived ({archived})`

`{active}` and `{inactive}` count discovered leads in those states (see [About Lead Discovery](../about_lead_discovery.md)).

`{archived}` counts how many rows are shown when this filter is selected.

When `Archived` is selected, rows are shown for each of:

- `Archived lead investigation`: a lead investigation that is either `Done` or `Abandoned`.
- `Archived lead`: a lead that is itself archived, but whose archival is not already represented by a corresponding archived lead investigation.

Count `Archived lead` rows when the lead is archived and there is no corresponding archived lead investigation for that archived lead. For example, if a faction is terminated and a lead becomes obsolete without any `Done` or `Abandoned` investigation causing that archival, the archived lead contributes one `Archived` row.

If `Active` is selected, only active leads are shown, as defined in [About Lead Discovery](../about_lead_discovery.md).
If `Inactive` is selected, only inactive leads are shown, as defined in [About Lead Discovery](../about_lead_discovery.md).
If `Archived` is selected, only archived lead investigation rows and archived lead rows are shown.

If the user unselects `Inactive` or `Archived`, then `Active` is selected automatically.
If `Active` is selected, user cannot unselect it.

### Leads data grid column details

No more than one `Checkbox` can be selected at a time, and only rows with active leads can be selected.

Possible values of `Type` are: `One-time` or `Repeat.`.

Possible values of `Investigation` include: `None`, `Inactive`, `Active`, `Active #N`, `Done T #N`, `Abandoned`, or `Obsolete`
(archived rows shown when **Archived** filter is selected; see toolbar section above).

`Active` applies only for leads that are not repeatable.

`Active #N` applies only for leads that are repeatable. First investigation is `#1`, second is `#2`, etc.

`Done T #N` applies to **Archived** rows that come from a successful investigation:

- For a one-time lead, the row shows `Done T #N` when the lead appears there because it became **Archived** after that success ([About Lead Discovery](../about_lead_discovery.md)).
- For a repeatable lead, each completed investigation has its own **Archived** row with `Done T #N`.

`T #` is the turn number at which the investigation was completed. To be exact, if investigation completed when advancing
from turn `K` to `K+1`, then `#N` corresponds to `#K+1`.

`#N` is padded to width 3, so e.g. `Done T   7` or `Done T 623`.

`Abandoned` applies to **Archived** rows that come from an abandoned investigation.

`Obsolete` applies to **Archived** rows that come from an archived lead without a corresponding archived lead investigation. The `Obsolete` chip uses the same gray color as other gray chips.

#### Investigation columns

`ID`, `Agents`, `Progress`, `Projected`, `Efficiency`, `Success %` are all empty if investigation is `None`.

For `Obsolete` rows, `ID`, `Agents`, `Progress`, `Projected`, and `Efficiency` are empty because there is no corresponding lead investigation record.

`ID` is the ID of the investigation, just the number (including leading zeros).

`Success %` is the `turn advancement success chance range`. The range exists only because the exact
`actualDifficulty` is hidden from the player:

- The lower bound assumes actual difficulty is as high as possible.
- The upper bound assumes actual difficulty is equal to visible difficulty.
- `Mid` is the midpoint between lower and upper `turn advancement success chance`.
- `Err` is half the distance between lower and upper `turn advancement success chance`.

When `Archived` is selected, archived rows use `Success %` chips `Done`, `Abandoned`, or `Obsolete`
instead of a success-chance range. `Obsolete` uses the "neutral" chip color.

## Agents data grid for leads

This grid has rows with following columns:

| Column     | Description                   | Example        |
| ---------- | ----------------------------- | -------------- |
| Checkbox   | Mult-row selection checkbox   | N/A            |
| ID         | The id of the agent.          | `agent-000`    |
| State      | The state of the agent        | `Available`    |
| Assignment | The assignment of the agent   | `Standby`      |
| Skill      | The skill of the agent        | `85/100 (85%)` |
| Exhaustion | The exhaustion of the agent   | `20.0%`        |

### Agents data grid title

Rendered on a single line, left aligned:

```text
Agents: {allActive}
```

`{allActive}` is the count of alive agents (excluding `KIA` and `Sacked`).

The filter-specific counts are displayed next to the toolbar filters instead of in the title.

### Agents data grid toolbar

The toolbar of the data grid has following filters, where any number (0 to all) can be selected:

- `Ready ({ready})` (selected by default)
- `Away ({away})`
- `Exhausted ({exhausted})`
- `Recovering ({recovering})`

`Ready`, `Away`, `Exhausted`, and `Recovering` use the same predicates as the corresponding toolbar filters on this grid.

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

### Agents data grid column details

When an agent is on investigation, the `Assignment` columns says `Investigating`,
and `Assignment` column says `invst-NNN` where `NNN` is the investigation ID. It is the same number that shows in the
`ID` column of the leads data grid.

## Leads summary

KJA leads TODO write this section

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

For gameplay rules (progress, success chance, difficulty), see [About Agent Lead Investigation System](../design/about_lead_investigations.md).
