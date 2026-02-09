# About basic AI intellect purchasing logic

This document specifies how basic AI intellect decides what to purchase in a given turn.

# Next buy priority (legacy, to replace with vNext)

Implemented in: `computeNextBuyPriority()`, `findNextDesiredUpgrade()`, `ensureDesiredGoalExists()`

When deciding what to buy, the player first computes the `next buy priority` item to buy,
and buys it if they can afford it. If they cannot, they stop buying anything
else in given turn. Instead, they will re-evaluate the next buy priority in the next turn.
If the same priority still remain top, then either player buys it or the process repeats.

The `next buy priority` is computed as follows:

Priority order (first matching condition determines what to buy):
1. If agent count is below desired count AND below agent cap: hire an agent
2. Otherwise, find the first upgrade where actual is below desired (via `findNextDesiredUpgrade()`), checking in this order:
   - Agent cap upgrades
   - Transport cap upgrades
   - Training cap upgrades
   - Weapon damage upgrades
   - Training skill gain upgrades
   - Exhaustion recovery upgrades
   - Hit points recovery upgrades
   - Hit points upgrades
3. If all desired goals are met (no upgrade found where desired > actual), establish a new desired goal
   by increasing one desired value by one (via `ensureDesiredGoalExists()`), then repeat from step 1

## How desired values are determined (legacy, to replace with vNext)

Initial desired values (via `createInitialAiState()`):
- Desired agent count starts at initial agent count plus one (ensuring there's an immediate hiring goal)
- All desired upgrade counts start at zero

Subsequent desired values are increased one at a time, only when all current desired goals are met.
When this happens, exactly one desired value is increased by one (via `decideSomeDesiredCount()`), following this priority:
1. Increase desired transport cap upgrades if current transport capacity is below 50% of desired agent count
2. Else increase desired training cap upgrades if current training capacity is below 60% of desired agent count
3. Else increase desired agent count (via `decideDesiredAgentCount()`) or agent cap upgrades if at cap,
   if the count is still within budget relative to total purchased upgrades
4. Else increase desired stat upgrades in round-robin order (via `decideStatUpgrade()`) based on total stat upgrades purchased so far

This incremental approach ensures the player balances hiring agents, expanding capacities, and upgrading
capabilities in response to what has actually been purchased, rather than following a predetermined schedule.

# Purchasing vNext

In the `spendMoney()` function the player decides what to buy in a loop, be repeatedly computing the next buy priority
(via `computeNextBuyPriority()`) and buying it until they can no longer afford it.

The `computeNextBuyPriority()` chooses what to by looking at actual (i.e. values in current game and AI state) counts.

The relevant counts considered are:

- Agent count
- Cap upgrade counts (number of cap upgrades bought/to buy):
  - Agent cap upgrades count
  - Transport cap upgrades count
  - Training cap upgrades count
- Stat upgrade counts (number of stat upgrades bought/to buy):
  - Weapon damage upgrades count
  - Training skill gain upgrades count
  - Exhaustion recovery upgrades count
  - Hit points recovery upgrades count
  - Hit points upgrades count

The exact algorithm for next buy priority is as follows:

- Count the total amount of purchased stat upgrades
- Count the total amount of alive agents
- If the total alive agents is less than 8 (the `AGENT_COUNT_BASE`)
  plus 4 (the `AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER`) per each bought stat upgrade,
  but no more than `MAX_DESIRED_AGENT_COUNT` of 1000,
  then desire a new agent, unless it would go above current agent cap; in such case, desire an agent cap increase.
- Otherwise (i.e. when there are enough total alive agents), if current transport capacity is less than 25% (`TRANSPORT_CAP_RATIO`)
  of the alive agents, desire a transport cap increase.
- Otherwise (i.e. when there is enough transport capacity), if current training capacity is less than 30% (`TRAINING_CAP_RATIO`)
  of the alive agents, desire a training cap increase.
- Otherwise (i.e. when there is enough training capacity), desire a stat upgrade, according to `chooseStatUpgrade()`.

Here `chooseStatUpgrade()` chooses a stat upgrade in round-robin fashion, but subject to maximum state upgrade count cap.
Specifically, `chooseStatUpgrade()` will choose the next stat upgrade as follows, looping over the list in order:
- Hit points upgrade,
- Weapon damage upgrade, unless `MAX_DESIRED_WEAPON_DAMAGE` of 80 was reached.
- Training skill gain upgrade
- Exhaustion recovery upgrade, unless `MAX_DESIRED_EXHAUSTION_RECOVERY_PCT` of 50 was reached.
- Hit points recovery upgrade, unless `MAX_DESIRED_HIT_POINTS_RECOVERY_PCT` of 50 was reached.

# Test spec for vNext

The vNext spec is covered by `web/test/ai/spendMoney.test.ts` unit test file which has following tests:

`Correctly spends 1_000 money in initial game state` - tests that the AI correctly spends 1_000 money in the initial game state.
The test is arranged by overriding the money to be `1_000` in the otherwise default initial game state.
The test asserts correctness by verifying correct amount of agents hired and upgrades purchased, both stat upgrades and cap upgrades.
