
# Basic AI player intellect V3

# Key decisions

On a high level, the basic AI player intellect V3 strives to answer following questions,
and decide based on the answers:

- What to spend money on, if at all?
  - How many agents to hire?
  - Which capacities to upgrade?
  - Which agent capabilities to upgrade?

- What to do with agents?
  - How many and which agents to assign to:
    - Contracting?
    - Training?
    - Lead investigations?
      - Which leads to investigate?
  - How many and which agents to deploy on a mission?
    - Which missions to deploy to?
    - When to deploy? (missions expire)
    - Which agents and how many to deploy?

# Goals

The player aims to make the key decision described above by following a set of goals, listed below.
Not all of the goals can be always achieved at the same time, and as such the player must prioritize,
which is elaborated in further sections.

- Ensure that income from agent contracting covers between 100% and 120% per-turn costs.
  - Notably, this doesn't take into account any money coming from funding, nor it takes
    into account discrete expenses like hiring agents or buying capability upgrade.
- Ensure that agents have no exhaustion, or as little exhaustion as possible, when being
  assigned or deployed.
- Ensure that when deploying agents on a mission, the sum total of agent threat assessment
  is at least as high as the enemy threat assessment.
  - Ensure there is enough transport capacity to deploy at least one such mission per turn
- Ensure there is at least one lead always being investigated, by 1 agent.
- Ensure there is at least enough money available so that the player won't run out of money
  within next 3 turns.
- Ensure any remaining agents are not idling; all ready agents should be in training.
  - As such, ensure there is enough training capacity available.
- Ensure the player can face the ever-increasing frequency and threat level of defensive missions,
  plus that it can make progress and win offensive missions:
  - Ensure there is enough agents available in total.
  - Ensure the capabilities improving agent effectiveness are adequately upgraded.
    - This includes: training skill gain, exhaustion recovery %, hit points recovery %, weapon base damage.

# Algorithm

The player follows the following algorithm when deciding what to do in given turn.
It effectively codifies how the player prioritizes the goals described above:

TODO

## Hiring

## Assignment to contracting

## Assignment to training

## Lead investigation

## Mission deployment

## Capacity upgrade

## Agent effectiveness capability upgrade

# Future work

- Smarter selection of which capabilities to upgrade.
- Smarter selection of which agents to assign to what, based on their skill level.
  (higher skill means better threat level for mission deployment but also better efficiency
  in assignments).
- Smarter selection of which leads to investigate and how many.
  - Specifically, decision on if to investigate leads that spawn offensive missions.
- Smarter assignment of agents to lead investigations, to make good forward progress.
