# About basic AI intellect purchasing logic

This document specifies how basic AI intellect decides what to purchase in a given turn.

# Purchasing overall approach

The purchasing logic balances three concerns: growing the agent workforce, scaling infrastructure
(transport and training capacity) to support that workforce, and upgrading agent capabilities
(stats) to handle increasingly difficult missions.

The key insight is that agent hiring and stat upgrades are **interleaved**: the desired agent count
grows as a function of purchased stat upgrades (`AGENT_COUNT_BASE` + `AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER`
per stat upgrade). This means the AI alternates between phases of hiring agents and phases of
buying stat upgrades, with infrastructure upgrades (transport and training caps) interspersed
whenever capacity falls behind the agent count.

The AI always maintains a **minimum savings buffer** before spending (see "Money savings" in
`about_basic_intellect.md`), ensuring it won't run out of money within the next 5 turns even
under pessimistic income assumptions.

Within a single turn, the AI buys items one at a time in a loop, recomputing the next buy priority
after each purchase. This means a single turn can include a mix of agent hires, cap upgrades, and
stat upgrades, naturally adapting to whatever the current state demands.

# Purchasing algorithm

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

Note: `computeNextBuyPriority()` always returns a defined `BuyPriority` (never `undefined`) because the branches are exhaustive: the final fallback is `chooseStatUpgrade()` which always has at least "Hit points" and "Training skill gain" available (both uncapped).

Here `chooseStatUpgrade()` chooses a stat upgrade in round-robin fashion, but subject to maximum state upgrade count cap.
Specifically, `chooseStatUpgrade()` will choose the next stat upgrade as follows, looping over the list in order:
- Hit points upgrade,
- Weapon damage upgrade, unless `MAX_DESIRED_WEAPON_DAMAGE` of 80 was reached.
- Training skill gain upgrade
- Exhaustion recovery upgrade, unless `MAX_DESIRED_EXHAUSTION_RECOVERY_PCT` of 50 was reached.
- Hit points recovery upgrade, unless `MAX_DESIRED_HIT_POINTS_RECOVERY_PCT` of 50 was reached.

# Test spec

This spec is covered by `web/test/ai/spendMoney.test.ts` unit test file which has following tests:

`Correctly spends 1_000 money in initial game state` - tests that the AI correctly spends 1_000 money in the initial game state.
The test is arranged by overriding the money to be `1_000` in the otherwise default initial game state.
The test asserts correctness by verifying correct amount of agents hired and upgrades purchased, both stat upgrades and cap upgrades.
