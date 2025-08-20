# Stats

This document enumerates some game stats.

# Weapons tats

All weapon damage is +- 50%, rounded outside / to expand the damage range.

For a example:

- A 7 damage weapon has damage range of 3-11.
- A 10 damage weapon has damage range of 5-15.

# Baseline agent stats

Newly hired agent has:

- 30 hit points
- 100 skill
- 10 damage weapon, meaning it has a damage range of 5-15

# Enemy units

| Cult unit      | Officer | Alias   | Skill | HP | Damage        |
|----------------|:-------:|---------|:-----:|:--:|:-------------:|
| Initiate       |         | In Init |    40 | 20 |   8 (  4-12 ) |
| Operative      |         | Op Oper |    60 | 20 |  10 (  5-15 ) |
| Handler        |     yes | Hn Hndl |    70 | 20 |  10 (  5-15 ) |
| Soldier        |         | Sl Sldr |   100 | 30 |  14 (  7-21 ) |
| Lieutenant     |     yes | Lt Ltnt |   120 | 30 |  14 (  7-21 ) |
| Elite          |         | El Elit |   200 | 40 |  20 ( 10-30 ) |
| Commander      |     yes | Cm Cmdr |   250 | 40 |  20 ( 10-30 ) |
| High Commander |     yes | HC HCmd |   400 | 50 |  30 ( 15-45 ) |

# Missions

The table below shows some of the details of missions.

`Enemies` - What enemies are present on the mission.
`Money` - Money reward.
`Intel` - Intel reward.
`PanicR` - Panic reduction. 100 = 1%.
`ThreatR` - Threat reduction of given faction. 100 = 1%.
`Suppr` - Suppression of given faction. 100 = 1%.

| Mission                      | Troops                   | Officers               | Money | Intel | PanicR | ThreatR | Suppr |
|------------------------------|--------------------------|------------------------|:-----:|:-----:|:------:|:-------:|:-----:|
| Apprehend cult member        | 2 In,  1 Op              |                        |     0 |    10 |      5 |       1 |    10 |
| Raid cult safehouse          | 4 In,  3 Op              | 1 Hn                   |   120 |    40 |     20 |       5 |    40 |
| Raid cult outpost            | 4 In,  6 Op,  4 Sl       | 2 Hn, 1 Lt             |   150 |    50 |     40 |      20 |    50 |
| Raid cult base of operations |       10 Op, 10 Sl, 2 El | 4 Hn, 2 Lt, 1 Cm       |   200 |    60 |     30 |       7 |    60 |
| Raid cult HQ                 |              20 Sl, 6 El |       4 Lt, 2 Cm, 1 HC |   250 |    70 |     35 |       8 |    70 |

# Python interactive

``` python
import math
d=7;(math.floor(0.5*d), math.ceil(1.5*d))
a=100;d=60;(1/(1+(d/a)**2), 1/(1+(a/d)**2))
```
