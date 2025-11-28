# About panic

This document explains how panic is computed and how it relates to faction threat levels and suppression.

Refer to [Definitions](#definitions) for definitions of terms used in this document.

# Panic overview

Panic is a game-wide metric that represents the overall planet population panic.

If panic reaches 100%, the game is lost.

Panic increases each turn based on all factions' threat levels and suppression values,
and can be reduced by successful mission rewards.

Panic is stored as an accumulated value where `10,000` represents `100%` panic.
When displayed to the player, panic is shown as a percentage with 2 decimal places.

# Panic increase

Each turn, panic increases based on the contributions from all factions.
The panic increase from each faction is calculated using the following formula:

``` text
panic_increase = max(0, threat_level - suppression)
```

This means:
- If a faction's `threat_level` is greater than its `suppression`, the faction contributes
  `threat_level - suppression` to panic increase.
- If a faction's `suppression` is greater than or equal to its `threat_level`, the faction
  contributes `0` to panic increase (suppression fully neutralizes the threat).

The total panic increase for a turn is the sum of panic increases from all factions:

``` text
total_panic_increase = sum(panic_increase for each faction)
```

Then panic is increased by the total panic increase:

``` text
panic = panic + total_panic_increase
```

After panic is increased, it can be reduced in the same turn by successful mission rewards.
See [Panic reduction](#panic-reduction) for details.

# Threat level

Each faction has a `threat_level` that represents how dangerous that faction is.
Threat level increases each turn by a fixed amount called `threat_increase`.

## Threat level increase

Each turn, each faction's threat level increases by its `threat_increase` value:

``` text
threat_level = threat_level + threat_increase
```

The `threat_increase` is a constant value per faction and does not change unless modified by mission rewards.

Note: Threat level increase is not adjusted by suppression.
Suppression only affects panic calculation, not the threat level increase itself.

## Threat level reduction

Threat level can be reduced by successful mission rewards.
When a mission site is successfully completed and provides faction rewards with `threat_reduction`,
the faction's threat level is reduced:

``` text
threat_level = max(0, threat_level - threat_reduction)
```

Threat level cannot go below 0.

# Suppression

Each faction has a `suppression` value that represents how effectively the player has suppressed
that faction's activities. Suppression reduces the panic increase caused by a faction's threat level.

## Suppression effect on panic

Suppression reduces panic increase through the panic increase formula:

``` text
panic_increase = max(0, threat_level - suppression)
```

If suppression equals or exceeds threat level, the faction contributes no panic increase for that turn.

## Suppression increase

Suppression can be increased by successful mission rewards.
When a mission site is successfully completed and provides faction rewards with `suppression`,
the faction's suppression is increased:

``` text
suppression = suppression + suppression_reward
```

## Suppression decay

Suppression decays each turn by a fixed percentage.
The decay is applied after panic calculation and threat level increase,
but before mission rewards are applied.

The suppression decay formula is:

``` text
suppression = floor(suppression * (1 - SUPPRESSION_DECAY))
```

Where `SUPPRESSION_DECAY` is `0.1`, meaning suppression decays by 10% each turn.

For example:
- If suppression is `100`, after decay it becomes `floor(100 * 0.9) = 90`.
- If suppression is `50`, after decay it becomes `floor(50 * 0.9) = 45`.
- If suppression is `1`, after decay it becomes `floor(1 * 0.9) = 0`.

# Panic reduction

Panic can be reduced by successful mission rewards.
When a mission site is successfully completed and provides `panic_reduction`, panic is reduced:

``` text
panic = max(0, panic - panic_reduction)
```

Panic cannot go below 0.

# Turn advancement order

During turn advancement, panic and faction values are updated in the following order:

1. **Calculate panic increase**: Panic is increased based on current threat levels and suppression values of all factions.
2. **Increase threat levels**: Each faction's threat level is increased by its `threat_increase`.
3. **Apply suppression decay**: Each faction's suppression decays by 10%.
4. **Apply mission rewards**: For each successful mission site:
   - Apply panic reduction (if any).
   - Apply faction rewards (threat reduction and suppression increase) to the appropriate factions.

This order ensures that:
- Panic calculation uses the threat levels and suppression values from before the turn's changes.
- Threat level increases happen before suppression decay, so decay affects the suppression value
  that will be used in the next turn's panic calculation.
- Mission rewards are applied last, so they affect the values that will be used in the next turn.

# Examples

## Example 1: Basic panic increase

A faction has:
- `threat_level = 100`
- `suppression = 0`
- `threat_increase = 5`

At turn advancement:
- Panic increases by `max(0, 100 - 0) = 100`.
- Threat level increases to `100 + 5 = 105`.
- Suppression remains `0` (no decay from 0).

## Example 2: Suppression reducing panic

A faction has:
- `threat_level = 100`
- `suppression = 80`
- `threat_increase = 5`

At turn advancement:
- Panic increases by `max(0, 100 - 80) = 20`.
- Threat level increases to `100 + 5 = 105`.
- Suppression decays to `floor(80 * 0.9) = 72`.

## Example 3: Suppression fully neutralizing threat

A faction has:
- `threat_level = 50`
- `suppression = 60`
- `threat_increase = 5`

At turn advancement:
- Panic increases by `max(0, 50 - 60) = 0` (suppression fully neutralizes the threat).
- Threat level increases to `50 + 5 = 55`.
- Suppression decays to `floor(60 * 0.9) = 54`.

## Example 4: Mission rewards

A faction has:
- `threat_level = 100`
- `suppression = 20`
- `threat_increase = 5`

A successful mission provides:
- `panic_reduction = 50`
- Faction reward: `threat_reduction = 10`, `suppression = 30`

At turn advancement:
- Panic increases by `max(0, 100 - 20) = 80`, so panic becomes `panic + 80`.
- Panic is then reduced by `50`, so panic becomes `max(0, panic + 80 - 50) = panic + 30`.
- Threat level increases to `100 + 5 = 105`.
- Threat level is then reduced by `10`, so threat level becomes `max(0, 105 - 10) = 95`.
- Suppression decays to `floor(20 * 0.9) = 18`.
- Suppression is then increased by `30`, so suppression becomes `18 + 30 = 48`.

# Implementation details

The file [about_turn_advancement.md](about_turn_advancement.md) describes, among other things,
in which order panic and faction updates are implemented during turn advancement.

The panic increase calculation is implemented in `calculatePanicIncrease` function in
`web/src/lib/utils/factionUtils.ts`.

# Definitions

**Panic**: A game-wide metric representing the overall threat level facing the player.
Stored as an accumulated value where `10,000` represents `100%` panic.

**Threat level**: A faction attribute representing how dangerous that faction is. Increases each turn by `threat_increase`.

**Threat increase**: A constant value per faction that determines how much the faction's threat level increases each turn.

**Suppression**: A faction attribute representing how effectively the player has suppressed
that faction's activities. Reduces panic increase and decays by 10% each turn.

**Suppression decay**: The process by which suppression decreases by 10% each turn,
ensuring that suppression must be maintained through successful missions.
