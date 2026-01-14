# Ideas

# Inventory management: weapons & armor

- Make it possible to assign and reassign weapons & armor to agents.
- Defeating enemies allows the player to reuse their weapons & armor.
  - Armor must be either repaired or obtained from interrogated enemy.
- Weapons from enemies can be also sold.

- Player can buy weapons and armor.
- What is available for purchase depends on which leads player investigated.
- Appropriate leads, allowing purchasing of better weapons and armor, become
  available as player makes more progress in offensive missions and interrogations against
  enemy factions.
- This replaces the "weapon upgrade" mechanic.

# Hit points upgrades

Instead of hit points upgrades, allow the agents to gain hit points as follows:

- Suffering hit points loss
- Intense training regime: in addition to skill, slowly increases hit points over time, but exhaustion grows faster.
- Combat drugs: temporary boost to hit points per missions, but results in major exhaustion after it.
- Enhancements, like "Red Dawn conditioning" that remove the agent for some time and make unavailable.

# More advanced exhaustion / stamina mechanics

Instead of each agent having the same exhaustion mechanics of it going up to 100%, make it dependent
on the agent's stamina.

- Can be also upgraded with training.

# HP recovery upgrade -> Medical wing

Each medical wing may be able to recover set hit points per turn, spread across
recovering agents, with some limit per agent. Hence if there are not enough medical wings,
some agents may not be able to recover as fast.

Medical wing upgrades may become available after appropriate leads are investigated.

# Exhaustion recovery upgrade -> Rest & Recuperation wing (R&R wing)

Operate similar to medical wings, with similar "soft cap" and maybe upgrades
to speed recovery.

# Facilities

Instead of agent / training / transport caps, the player builds facilities in their base:

- Living quarters
- Training facility
- Deployment facility

And instead of hp / exhaustion recovery upgrades, the player builds:

- Medical wing
- R&R Wing (Rest & Recuperation)

To help with intercepting enemy missions and maybe provide bonus to leads:

- Intelligence center

There may be also defensive facilities:

- Security station
- Automated defenses module

Each facility has associated build time, maintenance cost per turn, and gives set benefit.

# Notes Agent toughness

Right now agent becomes incapacitated when their effective skill falls below 10% of their base skill.
This is good and bad.
Good, because they won't be killed.
Bad, because they no longer participate in combat.

Overall this works as intended. Agents with many hit points will have larger range of hit points
where they are incapacitated but not killed, hence making them more likely to survive.

# Faction growth factor

At the game beginning each faction rolls hidden "growth factor" e.g. from 0.5 to 1.5 which compresses
how quickly they go through activity levels.
So e.g. when faction rolls the growth between range 60-90, and it rolls 70, then:
- if growth factor is 60%, then (70-60) * 0.6 = 6, so it actually rolled 70-6 = 64.
- if growth factor is 140%, then (90-70) *0.4 = 20*0.4 = 8, so it actually rolled 70+8 = 78.
- So growth factor of 50%  narrows effective roll from 60-90 to 60-75 and
    growth factor of 150% narrows effective roll from 60-90 to 75-90.
// NOTE: this should be opposite: growth factor of 50% should slow-down, not speed up

# Reason to send agents to difficult missions - partial reward

Very difficult missions that pose a dilemma to the player and force them to incur significant agent losses:
- These missions would result in massive penalties if they are not attended to by the player.
- But the player should struggle to muster enough agents to win with overwhelming force.
- So either the mission is just at the right difficulty where the player may or may not win (difficult to achieve)
- OR the mission gives credit for partial success. This way player is incentivized to not let the mission just expire:
  instead, they deploy agents, suffer heavy losses, but achieve some objectives, drastically reducing the penalties.
- This should be general theme: much better to deploy agents, incur losses, and throw a wrench in enemy plans,
  than to let the enemy to deploy missions unabated.
- Key mechanic: instead having all enemies at the start at the mission, more of them may spawn each round,
  and possibly it may continue until specific round is reached or until player requests retreat.
- Mission idea: evacuation. The more rounds player agents spend on the mission, the more civilians successfully evacuated.
- Mission idea: hold until reinforcements arrive.

# Make mission difficulty less predictable

- The exact enemy count on mission should not be always the same, it should very.
- The player should only have general assessment of how many enemies to expect, and maybe historical data.

# Mission expiration time

Note: here we assume 1 turn = 1 day = 24 hours.

- Defensive missions always expire in 1-2 turns, unless discovered earlier (see next point)
  - Such missions may be deployable only on the last turn. So if the expiration counter goes to 1 turn,
    it should say 'active'.
- When a defensive mission is rolled, the turn it will become active is set.
  - By default, when player doesn't do anything, they will discover the mission either just before it happens
    so they must deploy agents in the same turn the player discovered the mission, or they will get max 1 turn heads up.
  - However, by appropriate actions player can discover the mission earlier.
    - e.g. building intelligence center and assigning agents to it to monitor given faction.
    - e.g. interrogating highly ranked faction member may give temporary heads up about the mission.
    - Such bonuses may also help with the difficulty of the mission.
- Offensive missions should have longers expiration times.
  - In these cases expiration means intel is outdated and has to be redone.
  - e.g. enemy is not going to move the HQ, but if the intel is 30 turns old, new intel of HQ defenses must be gathered.
  - e.g. safehouse in turn may be way more mobile and as such may have faster expiration time, which outright denotes
    the safehouse relocating.
