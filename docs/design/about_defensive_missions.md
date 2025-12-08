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

There is one special rule which is: no given `operation type` from given `operation level` can be randomized twice in a row,
unless given `operation level` has only one `operation type` in it. Then yes, it can be randomized any amount
of times in a row.

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

Generally speaking, the activity changes level as follows:

- Activity level steadily increases over time - see table below.
- When a player wins any kind of mission against the faction, whether defensive or offensive,
  this suppresses the faction for some turns depending on the mission reward. See section on suppression for details.
- Nothing else influences activity level progression.

Typical activity level progression:

| Faction  | Progression                 | Turns | Cumulative |
| -------- | --------------------------- | ----- | ---------- |
| Red Dawn | Dormant     -> Faint        |     0 |          0 |
| Red Dawn | Faint       -> Emerging     | 60-90 |      60-90 |
| Red Dawn | Emerging    -> Active       | 60-90 |    120-180 |
| Red Dawn | Active      -> Expanding    | 60-90 |    180-270 |
| Red Dawn | Expanding   -> Escalating   | 60-90 |    240-360 |
| Red Dawn | Escalating  -> War          | 60-90 |    300-450 |
| Red Dawn | War         -> Total war    | 60-90 |    360-540 |

## Progression display

It is shown to the player as "number_of_turns/minimal_possible_threshold",
so e.g. 13/60 means the faction was at this activity level for 13 turns,
at at least 60 turns are needed for increase. But it may actually be more,
e.g. 78, so player may see e.g. 75/60. It must be explained in ufopaedia
that the increase may be 60 up to +50% turns.

# Faction suppression

One of the possible mission rewards is faction suppression.
It manifests by delaying the next faction operation roll by a set number of turns,
randomized from a range, depending on the mission reward.

# Faction operation roll probabilities

Map from activity level to probabilities of faction operations:

| Activity level | Freq.      |    1  |    2 |    3 |    4 |    5 |    6 |
| -------------- | ---------- | ----- | ---- | ---- | ---- | ---- | ---- |
| Dormant        |          - |     - |    - |    - |    - |    - |    - |
| Faint          | 15-25 (20) |  80 % | 20 % |    - |    - |    - |    - |
| Emerging       | 13-23 (18) |  60 % | 30 % | 10 % |    - |    - |    - |
| Active         | 11-21 (16) |  40 % | 40 % | 15 % |  5 % |    - |    - |
| Expanding      | 10-20 (15) |  30 % | 30 % | 30 % | 10 % |    - |    - |
| Escalating     |  9-19 (14) |  20 % | 25 % | 35 % | 15 % |  5 % |    - |
| War            |  8-18 (13) |  15 % | 20 % | 30 % | 20 % | 10 % |  5 % |
| Total war      |  7-17 (12) |  10 % | 15 % | 25 % | 25 % | 15 % | 10 % |

Legend:
`Freq.` - Frequency of the activity level in turns. Min to max.
`Faction operation levels`:
`1`: soft operations.
`2`: violent but small-scale.
`3`: strategic threats.
`4`: regional destabilization.
`5`: global conflict.
`6`: existential.
