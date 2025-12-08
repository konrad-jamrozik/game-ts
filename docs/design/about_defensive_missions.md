# About defensive missions

This document explains how player defensive missions work.

🚧 WIP 🚧

# Faction operations overview

At set turns each enemy faction conducts an `faction operation roll`
that results in a `defensive mission site` spawning for the player.

If the player doesn't launch a mission on the mission site before it expires,
or fails the mission, they will suffer a `panic increase` and other penalties.

When exactly the `faction operation roll` happens and what `faction operation`
it exactly results in both depend on current faction `activity level`.

# Faction operation roll

The `faction operation roll` happens the more frequently the higher the faction's `activity level`.
Specifically, each `activity level` has a turn range within which next roll will happen.

Similarly, the `faction operation` is randomized from a pool of possible `faction operation levels`
and then, from withing all possible `operation types` within given `faction operation level`.

Having said that, there are safeguards / biases in place, to prevent extreme outcomes like:
- Too many offensive operations spawned in a row, turn after turn.
- Too many turns passed without any offensive operation.
- Given offensive operation type happened two or more times in a row.

# Faction operations and player defensive missions

When enemy faction conducts an offensive operation, it immediately spawns a mission site for the player,
even if the player did not complete a lead yet that reveals the enemy faction's profile.

# Panic increase

The panic increases only when enemy actions successfully complete their offensive operations.

# Activity levels

``` text
0   - Dormant / Defeated
0.X - Faint
1.X - Emerging
2.X - Active
3.X - Expanding
4.X - Escalating
5.X - War
6   - Total war
```

# Activity level progression

Each faction has different activity level profile:

- When it stops being dormant for the first time
- How quickly its activity level increases

Having said that

# Faction operation roll probabilities

Map from activity level to probabilities of faction operations:

| Activity level | Freq. |    1  |    2 |    3 |    4 |    5 |
| -------------- | ----- | ----- | ---- | ---- | ---- | ---- |
| Dormant        | 0     |   0 % |  0 % |  0 % |  0 % |  0 % |
| Faint          | 15-30 | 100 % |  0 % |  0 % |  0 % |  0 % |
| Emerging       | 10-25 |  83 % | 17 % |  0 % |  0 % |  0 % |
| Active         | 8-20  |  67 % | 22 % | 11 % |  0 % |  0 % |
| Expanding      | 6-15  |  50 % | 25 % | 17 % |  8 % |  0 % |
| Escalating     | 4-10  |  40 % | 27 % | 20 % | 11 % |  3 % |
| War            | 3-8   |  28 % | 28 % | 22 % | 17 % |  6 % |
| Total war      | 2-6   |  20 % | 25 % | 25 % | 20 % | 10 % |

Legend:
- `Freq.` - Frequency of the activity level in turns. Min to max.
- `1` - `faction operation` level 1, soft operations.
- `2` - `faction operation` level 2, violent but small-scale.
- `3` - `faction operation` level 3, strategic threats.
- `4` - `faction operation` level 4, regional destabilization.
- `5` - `faction operation` level 5, existential.
