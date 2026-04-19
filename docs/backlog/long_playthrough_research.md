# Prompt

When I run basic intellect AI player test, it takes it 210 turns to win the game even though the AI is cheating. I think this is way too long. I would expect the game can be won in much less turns, especially when cheating. Can you research this topic and write down your findings below, in `Research output` section?

Some questions to answer:

- what are the minimal critical actions player must do to win the game?
- how fast the game can be won when cheating, in theory
- why it takes 200+ turns for AI to win the game when cheating
  - if this is not easy to answer, what tool or info you would need to get an answer
- how the basic intellect AI player could be improved to win the game in less turns when cheating?

# Research output

## Win condition recap

The game is won when `leadInvestigationCounts['lead-peace-on-earth'] > 0` — i.e., the
Peace on Earth investigation (D=200) has been successfully completed.
Peace on Earth requires all three `lead-{facId}-terminate-cult` leads to be completed first.

## What are the minimal critical actions a player must do to win?

### 1. Complete `lead-criminal-orgs` (D=1, non-repeatable)

This is the shared root of all three faction chains. No prerequisites.

### 2. For each of the 3 factions, complete an 8-step locate→raid→interrogate chain

Each faction has an identical linear progression structure:

| Step | Lead | D | Type | Then |
|------|------|---|------|------|
| 1 | Locate member | 2 | repeatable | → Apprehend member mission |
| 2 | Interrogate member | 2 | non-repeatable | (unlocks safehouse) |
| 3 | Locate safehouse | 10 | repeatable | → Raid safehouse mission |
| 4 | Interrogate handler | 2 | non-repeatable | (unlocks outpost) |
| 5 | Locate outpost | 20 | repeatable | → Raid outpost mission |
| 6 | Interrogate soldier | 4 | non-repeatable | (unlocks training facility) |
| 7 | Locate training facility | 30 | repeatable | → Raid training facility mission |
| 8 | Interrogate lieutenant | 6 | non-repeatable | (unlocks logistics hub) |
| 9 | Locate logistics hub | 40 | repeatable | → Raid logistics hub mission |
| 10 | Interrogate commander | 10 | non-repeatable | (unlocks command center) |
| 11 | Locate command center | 60 | repeatable | → Raid command center mission |
| 12 | Analyze command structure | 15 | non-repeatable | (unlocks stronghold) |
| 13 | Locate regional stronghold | 80 | repeatable | → Raid stronghold mission |
| 14 | Interrogate high commander | 20 | non-repeatable | (unlocks HQ) |
| 15 | Locate HQ | 100 | repeatable | → Raid HQ mission |
| 16 | Interrogate cult leader | 30 | non-repeatable | (unlocks terminate) |
| 17 | Terminate cult | 150 | non-repeatable | Faction terminated |

Per faction: **17 investigations** and **8 offensive missions** that must be won.

### 3. Complete `lead-peace-on-earth` (D=200, non-repeatable)

After all 3 factions are terminated.

### Total minimal actions

- 1 + (17 × 3) + 1 = **53 investigations**
- 8 × 3 = **24 offensive missions**
- Plus agent hiring, upgrades, contracting, and handling defensive missions to prevent losing.

## How fast can the game be won when cheating, in theory?

### Cheating mechanics

`setupCheatingGameState()` provides:
- **100,000 starting money** (instead of 500)
- **`rand.set('lead-investigation', 1)`**: The investigation success roll is maximized.
  Because `rand.set(label, 1)` stores `0.999...` (< 1.0), which produces the max
  quantized roll of 10000/10000 = 1.0 in Fixed6. Since success requires `roll > failureProbability`,
  any investigation with > 0 accumulated intel will succeed on the roll.
- **`rand.set('agent_attack_roll', 1)`**: Agent attacks always hit.
- **`rand.set('enemy_attack_roll', 0)`**: Enemy attacks always miss. Agents take no damage.

### Key implication: every investigation completes in exactly 2 turns

1. **Turn T**: Agents assigned to investigation. During `advanceTurn` step 7, the success roll
   happens BEFORE intel is added. With 0 accumulated intel → 0% chance → fail.
   Then intel is gained from agents (≥ 10 intel with 1 agent at skill 100).
2. **Turn T+1**: Success roll uses accumulated intel > 0 → probability > 0 → max roll succeeds.
   Investigation completes.

This holds for ALL difficulties, including D=200 (Peace on Earth), because even
10 intel out of 20,000 target gives a tiny positive probability that the max roll beats.

### Turn-by-turn critical path for one faction

Each "locate → raid → interrogate" cycle:
- **Turn T**: Start locate investigation (assign agents).
- **Turn T+1**: Investigation succeeds. Offensive mission spawned. Agents → StartingTransit → InTransit.
- **Turn T+2**: Deploy (different) agents to mission. Mission won (cheating). Next interrogate lead available.
- **Turn T+3**: Start interrogate investigation.
- **Turn T+4**: Investigation succeeds. Next locate lead available.

**= 5 turns per cycle.** There are 8 such cycles per faction (member through HQ).

Then `terminate-cult` (non-repeatable, no mission afterward): 2 turns.

**Per faction: 8 × 5 + 2 = 42 turns.**

### Theoretical minimum with full parallelism

If all 3 factions are progressed in parallel (using separate agent pools), the critical path is:
- 2 turns: `lead-criminal-orgs`
- 42 turns: longest faction chain (all are equal length)
- 2 turns: `lead-peace-on-earth`
- **= 46 turns total**

### Theoretical minimum with serial factions (current AI approach)

- 2 turns: `lead-criminal-orgs`
- 42 × 3 = 126 turns: three factions sequentially
- 2 turns: `lead-peace-on-earth`
- **= 130 turns total**

## Why does the AI take 210+ turns when cheating?

The serial theoretical minimum is ~130 turns, so the AI wastes **~80 extra turns**.
The causes are, roughly ordered by expected impact:

### 1. Stalling on combat feasibility checks for repeatable leads (major)

When selecting a repeatable lead to investigate, the AI calls `canDeployMissionWithCurrentResources()`
to check whether the *resulting mission* would be deployable. If the AI's agents don't have enough
combined combat rating (× 1.2 multiplier) to match the mission's enemy combat rating,
**the AI returns `undefined` and starts NO investigation that turn**.

Late-game missions have enormous enemy counts (e.g., Raid HQ: 60 soldiers, 30 elites, 12 lieutenants,
6 commanders, 2 high commanders, 1 cult leader = 111 enemies). Even with many agents and upgrades,
the AI may need several turns of hiring and upgrading before it considers the lead investable.

**With cheating, combat always succeeds**, so this check is unnecessarily restrictive and causes
multi-turn stalls at each difficulty tier transition.

### 2. Sequential faction progression (major)

The AI processes one faction chain at a time because:
- It investigates **one repeatable lead at a time** (piling all investigation agents onto it).
- Non-repeatable leads are picked randomly, but they interleave within the same faction's chain.
- The `getFactionPriorityOrder` function that would enable faction cycling is a **stub that throws**.

With sequential processing, the faction work alone takes ~126 turns minimum (3 × 42).

### 3. Low investigation agent allocation (moderate)

The target agent count for investigations is `1 + floor(totalAgents/10)`. With 30 agents,
only 4 are allocated to investigations. With cheating, even 1 agent suffices (2-turn completion
regardless of difficulty). But the low allocation means the AI doesn't attempt to parallelize
across factions even when there's spare capacity.

### 4. Defensive mission overhead (moderate)

Red Dawn starts at activity level 1 (Faint) and escalates over time. As the game progresses,
all factions spawn defensive missions. The AI prioritizes deploying to these missions
(step 3 of `manageAgents`, before investigations), consuming agents and transport capacity.

Since combat always succeeds with cheating, these missions are always won, but they still
consume agent-turns and transport slots.

### 5. Excessive contracting assignment (minor)

The AI targets contracting income at 120% of upkeep. With 100K starting money, this is
unnecessary for many turns, but agents get assigned to contracting (step 4 in `manageAgents`,
before investigations), reducing the pool available for investigations and missions.

### 6. Transit delays (minor, structural)

After each investigation completion: agents spend 1 turn in StartingTransit → InTransit → Available.
After each mission completion: agents spend 1 turn in InTransit → Available.
These are baked into the 42-turn-per-faction calculation and cannot be avoided within
the current game mechanics.

## How could the basic intellect AI be improved to win faster when cheating?

### High-impact improvements

1. **Remove combat feasibility gate on repeatable lead selection**: When selecting a repeatable
   lead to investigate, skip the `canDeployMissionWithCurrentResources` check (or at least relax it
   significantly). The investigation takes 2 turns; the AI can use that time to hire/upgrade.
   With cheating, combat is guaranteed to succeed regardless. This alone could save 20-40 turns
   by eliminating stalls at tier transitions.

2. **Implement parallel faction progression**: Use a faction cycling mechanism (the currently
   stubbed `getFactionPriorityOrder`) to investigate leads across all 3 factions simultaneously.
   With enough agents, this could reduce faction work from ~126 turns to ~42 turns — saving
   ~84 turns and bringing total close to the 46-turn theoretical minimum.

3. **Increase investigation parallelism**: Allow more than one repeatable lead investigation
   at a time. With parallel faction progression, the AI would need 3+ concurrent investigation
   slots (one per faction). The `targetAgentCount` formula could be made more aggressive.

### Medium-impact improvements

4. **Reduce contracting priority when cash-rich**: With 100K money, skip the contracting
   coverage target entirely for the first 50+ turns. Route those agents to investigations
   and mission deployment instead.

5. **Pre-invest in agents and upgrades faster**: On turn 1 with 100K money, aggressively buy
   Agent cap, Transport cap, and stat upgrades to ensure later missions are immediately deployable.
   The current round-robin stat upgrade approach is slow to build combat power for late-game missions.

### Diagnostic tools that would help further analysis

- **Turn-by-turn logging** of which lead is being investigated each turn, whether `selectLeadToInvestigate`
  returned `undefined` (and why), and how many turns are "idle" (no active investigation).
- **Tracking stall turns**: Count turns where the AI wanted to start an investigation but couldn't
  find a feasible one. This would quantify the combat-feasibility-gate impact precisely.
- **Faction progress dashboard**: Show how far each faction is in its chain at each turn to
  visualize the serial-vs-parallel behavior.
