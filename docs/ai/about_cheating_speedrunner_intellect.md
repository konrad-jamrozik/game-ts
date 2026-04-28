# About cheating speedrunner intellect

The cheating speedrunner intellect is a specialized AI player strategy for the
test harness state created by `setupCheatingGameState()`.

It assumes:

- the game starts with 100,000 money;
- lead investigation rolls are fixed to the highest possible roll;
- agent attacks always hit;
- enemy attacks always miss.

Outside that setup, this intellect is intentionally unsafe and will perform
worse than `basicIntellect`.

# Strategy

The strategy is built around two consequences of the cheating setup:

- Any active lead investigation with more than 0 accumulated intel succeeds on
  the next turn, regardless of lead difficulty.
- Combat rating is irrelevant because cheating makes every battle winnable.

Each turn, the intellect:

1. Recalls agents whose assignment exhaustion is above the configured limit.
2. Buys only `Agent cap` and `Transport cap` upgrades, then hires to the target
   roster size.
3. Deploys to every active mission it can staff, prioritizing level 6 HQ
   defensive missions and then earliest-expiring missions.
4. Starts one-agent investigations on all needed available leads.
5. Assigns only enough spare agents to contracting to keep projected cash flow
   non-negative.

# Important differences from basic intellect

The cheating speedrunner intellect does not:

- check mission combat rating before deploying;
- check whether a repeatable lead's resulting mission would be deployable;
- buy stat upgrades, training upgrades, or recovery upgrades;
- assign agents to training;
- maintain a large contracting surplus;
- repeat already-completed repeatable leads.

# Tuning constants

The current constants are defined in
`web/src/ai/intellects/cheatingSpeedrunner/constants.ts`:

- `TARGET_AGENT_COUNT = 150`
- `TARGET_TRANSPORT_CAP = 150`
- `MAX_ENEMIES_PER_AGENT = 3`
- `MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT = 30`
- `MONEY_SAFETY_FLOOR_TURNS = 3`

# Verification

The regression test is `web/test/ai/cheatingSpeedrunner.test.ts`. It uses
`setupCheatingGameState()` and expects the intellect registered as
`cheating-speedrunner` to win within 80 turns.
