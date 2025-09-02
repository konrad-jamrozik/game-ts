# Turn advancement report prompt

Write for me a detailed implementation plan, in `turn_report_implementation_plan.md` file, that you will follow to
implement the "turn advancement report" feature.
If you have any questions, include them in your plan, I will answer them.

Below follows description of the feature to implement.

# Feature description: "Turn advancement report"

# React UI component implementation

There will be a dedicated "Turn Advancement Report" component, that will render the data inside `TurnReport` object.

Once a player advances turn, a React UI component "Turn Advancement Report" renders the report of what happened in the turn.

The react UI component implementing the display shall be the TreeView, see https://mui.com/x/react-tree-view/

The items list in the left should have following entries:

- Assets
  - Money
  - Intel
- Panic
- Factions
  - Faction 1
    - Threat level
    - Threat increase
    - Suppression
  - Faction 2
    - ...
  - Faction 3
    - ...
- Mission sites
  - Mission site 1
    - Agents
    - Enemies
    - Combat rounds
  - Mission site 2
    - ...
  - Mission site 3
    - ...

## Details of what will be displayed in the report entries

The log must include following information:

In `Assets` entry:

- How player assets have changed: money and intel. It must show it in form of `previous -> current (+diff)` entry.
  E.g. `Money: 150 -> 200 (+50)`.

In expanded `Assets` entries, e.g. `Assets / Money`:

- These entries should be expandable to show the details of exact computation.
  Basically to provide insight how the function `updatePlayerAssets` executed, e.g. how much money was earned from contracting.

In `Panic` entry:

- How panic has changed. It must show it in form of `previous -> current (+diff)` entry.
- This entry can be also expanded, to show the details originating from `updatePanic` function.

In `Factions` entry:

- How each faction has changed, if it was already discovered. It must show it in form of `previous -> current (+diff)`
  entry for each of their statistics: `threatLevel`, `threatIncrease`, `suppression`.

In expanded `Factions / Faction X` entries:

- Each of the entries can be also expanded, to show the details originating from `updateFactions` function, for each faction.

- Note that when displaying expanded details for each of these entries, also the information from mission site rewards
  must be shown. E.g. the panic reduction from `Successful` mission sites, or money earned, also from `Successful`
  mission sites.

In `Mission sites` entry:

- Summary of mission sites results, including:
  - If successful or failed.
  - In case of failed missions, if retreat was ordered or altogether terminated.
  - In case of successful missions, list of all rewards.
  - How many agents were wounded or terminated
  - How many enemies were terminated.

In each `Mission sites / Mission site X / Agents` entry:

- Details of what happened to each agent deployed to the mission site.
  - How many hit points they lost and how much exhaustion they gained, and how long they will need to recover.
  - How many skill points they gained, with breakdown for what: successful/failed attacks and defenses,
    and from mission survival.
  - What they did each round: details of attacks and defenses. Full information, including:
    - Who was the target/attacker
    - What was the roll and threshold
    - And so on. Basically what is currently logged to console for given agent in `evaluateCombatRound` and `showRoundStatus`
      functions.
  
In each `Mission sites / Mission site X / Enemies` entry:

- Same details as for agents, but for enemies.

In each `Mission sites / Mission site X / Combat rounds` entry:

- Details of each combat round. A tabular summary showing what each agent and enemy did in each round.
- Each row is an actor: agent or enemy.
- Each column is a round.
- Each cell has color-coded information what % of initial effective skill the actor has left at the start of the round.
- If actor is terminated, the cell mentions that.

# Backend / Report implementation structure

Each function from which you will be pulling information for the log must return a report object, that will have it.
For sure at least the following functions will return the following report objects:
- `evaluateTurn` will return `TurnReport`
- `evaluateDeployedMissionSite` will return `DeployedMissionSiteReport`
- `evaluateBattle` will return `BattleReport`
- `evaluateCombatRound` will return `CombatRoundReport`
- `evaluateAttack` will return `AttackReport`
- `updateFactions` will return `FactionReport` for each faction
- `updatePanic` will return `PanicReport`

These reports will be then composed into owning reports to return the `TurnReport` from `evaluateTurn` function that
has the report will all the data needed to render the full log from turn advancement.

For example, a part of `TurnReport` will be a collection of `DeployedMissionSiteReport`s, which in turn each has a `BattleReport`,
which has a collection of `CombatRoundReport`s, which in turn each has a collection of `AttackReport`s.
This collection of `AttackReport`s will be used to render the expanded details for each of the entries in the log.

Similarly, `TurnReport` will have a collection of `FactionReport`s, which will be used to render the expanded details
for each of the entries in the log.

# Events middleware implementation changes

The `postMissionCompletedEvent` function will be deleted from `eventsMiddleware.ts` file, because now instead the
function `evaluateTurn` will return the `TurnReport` object, which will have all the data needed to render the full log
from turn advancement, including results from mission sites.

# How to split the implementation plan

Split the implementation plan into following milestones. Each milestone should be in turn implemented in 3 phases:

## Implementation Phases for each milestone

Phase 1: The backend logic that produces appropriate report object which, among others,
Phase 2: A set of unit tests that verify the report is produced correctly.
         These tests will be in already existing files:
         `evaluateBattle.test.ts`, `evaluateDeployedMissionSite.test.ts`, `evaluateTurn.test.ts` etc.
Phase 3: appropriate logic in the tree view react UI component to display the report.

## Implementation milestones

### Milestone 1: Display basic turn stats

In this milestone everything need to display the following in the tree view react UI component:

- Assets
  - Money
  - Intel

should be implemented, following the three-phase approach.

### Milestone 2: Display factions stats

In this milestone everything need to display the following in the tree view react UI component:

- Panic
- Factions
  - Faction 1
    - Threat level
    - Threat increase
    - Suppression
  - Faction 2
    - ...
  - Faction 3
    - ...

should be implemented, following the three-phase approach.

### Milestone 3: Display basic mission site stats

In this milestone everything need to display the following in the tree view react UI component:

- Mission sites
  - Mission site 1
  - Mission site 2
  - Mission site 3

should be implemented, following the three-phase approach.

### Milestone 4: Display detailed mission site stats

In this milestone everything need to display the following in the tree view react UI component:

- Mission sites
  - Mission site 1
    - Agents
    - Enemies
    - Combat rounds
  - Mission site 2
    - ...
  - Mission site 3
    - ...

should be implemented, following the three-phase approach.
