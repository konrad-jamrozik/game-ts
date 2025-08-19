# About game progress

This document explains the progress a player must make to win the game.

Principally the progress is done by investigating leads to spawn mission sites.
These mission sites, when completed successfully, lead to more leads, which lead to more mission sites, etc.

For each enemy faction there is a final mission site that when completed successfully, destroys the faction.

The game is won when all enemy factions are destroyed.

# Lead and mission table

The table below shows leads and missions player must complete to defeat given faction.

| Item                          | Type    | Depends on                  |
|-------------------------------|---------|-----------------------------|
| Criminal organizations        | Lead    | Nothing                     |
| Apprehend cult member         | Mission | Criminal organizations      |
| Interrogate cult member       | Lead    | Apprehend cult member       |
| Raid cult safehouse           | Mission | Interrogate cult member     |
| Interrogate cult handler      | Lead    | Raid cult safehouse         |
| Raid cult outpost             | Mission | Interrogate cult handler    |
| Interrogate cult lieutenant   | Lead    | Raid cult outpost           |
| Raid cult base of operations  | Mission | Interrogate cult lieutenant |
| Interrogate cult commander    | Lead    | Raid cult base of operations|
| Raid cult HQ                  | Mission | Interrogate cult commander  |
| Interrogate cult leader       | Lead    | Raid cult HQ                |

The table below shows some of the details of missions.

`Difficulty` - Total difficulty of the mission (sum of objectives).
`Objectives` - Difficulty of the mission objectives, separated by slashes.
`Money` - Money reward.
`Intel` - Intel reward.
`PanicR` - Panic reduction. 100 = 1%.
`ThreatR` - Threat reduction of given faction. 100 = 1%.
`Suppr` - Suppression of given faction. 100 = 1%.

| Mission                      | Difficulty | Objectives      | Money | Intel | PanicR | ThreatR | Suppr |
|------------------------------|:----------:|:---------------:|:-----:|:-----:|:------:|:-------:|:-----:|
| Apprehend cult member        |     30     | 20 / 30         |   0   |  10   |   5    |    1    |  10   |
| Raid cult safehouse          |     50     | 20 / 30 / 50    | 120   |  40   |  20    |    5    |  40   |
| Raid cult outpost            |     70     | 30 / 50 / 70    | 150   |  50   |  40    |   20    |  50   |
| Raid cult base of operations |     90     | 50 / 70 / 90    | 200   |  60   |  30    |    7    |  60   |
| Raid cult HQ                 |    120     | 70 / 90 / 110   | 250   |  70   |  35    |    8    |  70   |

# KJA LATER idea for mission evaluations: enemy units

All weapon damage is +- 50%, rounded outside / to expand the damage range.

Agent weapon damage: 10 (5-15)
Agent skill: 100
Agent hit points: 30

| Enemy unit          | Skill | HP | Damage        |
|---------------------|:-----:|:--:|:-------------:|
| Cult initiate       |  40   | 20 | 8 (4-12)      |
| Cult operative      |  60   | 20 | 10 (5-15)     |
| Cult handler        |  70   | 20 | 10 (5-15)     |
| Cult soldier        | 100   | 30 | 14 (7-21)     |
| Cult lieutenant     | 120   | 30 | 14 (7-21)     |
| Cult elite          | 200   | 40 | 20 (10-30)    |
| Cult commander      | 250   | 40 | 20 (10-30)    |
| Cult high commander | 400   | 50 | 30 (15-45)    |

Python interactive:

``` python
import math
d=7;(math.floor(0.5*d), math.ceil(1.5*d))
a=100;d=60;(1/(1+(d/a)**2), 1/(1+(a/d)**2))
```
