# About defensive missions

This document explains how player defensive missions work.

Each enemy faction has a chance to conduct an offensive operation,
resulting in a spawning of a defensive mission site for the player.

🚧 WIP 🚧

- The panic increases only when enemy actions successfully complete their offensive operations.
- Every turn each enemy faction rolls what offensive operation it will conduct from a pool
  of possible operations.
- One possible option is "no operation" meaning the enemy faction does nothing.
- What options are available in the pool of offensive operations, and with what probability,
  depends on the threat level of the enemy faction.
- The higher the threat level, the higher the probabilities of the more difficult operations,
  and the lower the probability that no operation will be conducted.
- Having said that, there are safeguards / biases in place, to prevent extreme outcomes like:
  - Too many offensive operations spawned in a row, turn after turn.
  - Too many turns passed without any offensive operation.
  - Given offensive operation type happened two or more times in a row.
- When enemy faction conducts an offensive operation, it immediately spawns a mission site for the player,
  even if the player did not complete a lead yet that reveals the enemy faction's profile.

Activity level:

- Influences the offensive operations pool roll each turn.

Level:

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
- Faction can be suppressed, temporarily reducing their effective activity level, but not
  the baseline activity level.
- Different factions activity level increases at a different pace.
