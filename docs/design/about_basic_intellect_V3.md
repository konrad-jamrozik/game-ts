
# Basic AI player intellect V3

On a high level, the basic AI player intellect V3 strives to answer following questions,
and decide based on the answers:

- What to spend money on, if at all?
  - How many agents to hire?
  - Which capabilities to upgrade?

- What to do with agents?
  - How many and which agents to assign to:
    - Contracting?
    - Training?
    - Lead investigations?
      - Which leads?
  - How many and which agents to deploy on a mission?
    - Which missions?

## Overall goals

The player strives to maintain the goal listed below. Not all of them can be always
achieved at the same time, and as such the player must prioritize.

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
-
