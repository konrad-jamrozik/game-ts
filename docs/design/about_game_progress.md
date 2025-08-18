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
ag=100;en=30;(en/(ag+en), ag/(ag+en))
```

Idea: Ditch the idea of mission difficulty and objectives and instead have enemy units, with stats:

- Offensive skill, which is the no-damage threshold against which agents are rolling to avoid taking damage.
  So 30 offensive skill means an agent with skill 100 needs to roll at least 30 to take no damage.
- Defensive skill, which is the no-damage threshold against which the enemy unit is rolling to avoid taking damage.
  So 30 defensive skill means an agent with skill 100 must roll at least 31 to deal any damage.
- Hit points. As hit points are depleted, the skill drops in proportion, same as for agents.

Idea:

After few rounds of combat, player can decide if to keep or going or withdraw.
Before player decision is researched and implementing, this should be done automatically,
depending on if next round has reasonable chance of success, and/or enough agents are still in action.
E.g. after going through all player agents once, withdraw if 50% of more agents are KIA or lost more than 20%
of original (i.e. at mission start) effective skill.
If not withdrawing, go through all player agents again. Repeat.

Each 1on1 agent-enemy round should increase exhaustion, and thus also impacting effective skill.

Idea: symmetric logic agent - enemy unit.

Ideally, the logic should be symmetric, so that if agent has skill 100, and enemy unit has skill 100,
then it means they are both evenly matched.

E.g. agent skill 100 vs enemy defensive skill 80 means that agent has 100/180 55.5% chance of damaging enemy.
And if enemy has 30 defensive skill, then agent has 100/130 76.9% chance of damaging enemy.

Basically:

Agent attacks enemy, effective skill formula: Agent / (Agent + Enemy)
Enemy attacks agent, effective skill formula: Enemy / (Agent + Enemy)

Now what about damage?

Similar as hit points, need to introduce weapons. Weapons simply have damage range, rolled uniformly from.

E.g. agents can start with weapons with damage 10-30.
