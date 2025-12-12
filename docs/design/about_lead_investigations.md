# About Agent Lead Investigation System

This document details the mechanics governing how agents investigate leads, balancing agent
efficiency, accumulated knowledge, and an element of unpredictability.

## 1. Core Principles

The investigation system is based on the concept of **Probability Pressure**. Agents contribute
"Intel" to a lead, which does not act as a traditional progress bar, but rather as a **Success
Probability Multiplier**.

* **Unpredictability:** Success is determined by a random check against the accumulated Intel each
    turn. This ensures the exact completion date is never predictable.
* **Diminishing Returns:** Agents suffer reduced efficiency when working together, and when a lead is already
    heavily investigated.
* **Investigation Recency:** The system actively penalizes the removal of agents to ensure accumulated knowledge
    remains current and to prevent the "parking" of an investigation.

## 2. Calculating Intel Gain per Turn

The Intel a team of agents contributes in a single turn is governed by three factors: the **Base
Input**, the **Efficiency Multiplier**, and the **Resistance**.

### Constants

| Constant | Meaning | Value |
| :--- | :--- | :--- |
| **Intel per agent** | Base Intel gained per turn per normalized skill point | **10** |
| **Difficulty multiplier** | Scales the stored lead difficulty into “Intel required for 100%” | **100** |
| **Scaling exponent** | Controls diminishing returns from adding more agents \(used in \(\text{Count}^{0.8}\)\) | **0.8** |
| **Resistance exponent** | Controls how quickly resistance ramps up | **0.5** |

### A. Base Agent Input

This step calculates the maximum theoretical Intel your team could gather, factoring in their
skill and the diminished returns from working together.

$$\text{BaseAgentInput} = \left( \sum \frac{\text{AgentSkill}}{100} \right) \times \frac{\text{Count}^{0.8}}{\text{Count}}
 \times 10$$

| Variable | Description | Default Value/Example |
| :--- | :--- | :--- |
| $\sum \frac{\text{AgentSkill}}{100}$ | Sum of all agents' skill scores, normalized to 100. | 3 agents of Skill 100: $3$ |
| $\text{Count}^{0.8}$ | **Efficiency Multiplier:** Agent count to 0.8 power. Creates **diminishing returns** for larger teams. | $3^{0.8} \approx 2.408$ |
| $\text{Count}$ | Agent count (used to normalize the skill sum into an average). | $3$ |
| 10 | $\text{Intel per agent}$ (The base rate of Intel gained per normalized skill point). | 10 |
| **Example Base Input** | | $3 \times \frac{2.408}{3} \times 10 = \mathbf{24.08}$ |

### B. Resistance (Diminishing Returns on Knowledge)

The more Intel ($\mathbf{I_{current}}$) is already accumulated, the harder it is to find new
information. This is calculated using the concept of a **Search Space**.

First define an **effective difficulty** (scaled by the **Difficulty multiplier**):

$$\text{EffectiveDifficulty} = \text{Difficulty} \times 100$$

Then compute the fraction of the search space already explored and apply the **Resistance exponent**:

$$\text{Resistance} = \left(\frac{I_{current}}{\text{EffectiveDifficulty}}\right)^{0.5}$$

$$\text{EfficiencyFactor} = 1 - \text{Resistance}$$

* When $I_{current}$ is low (e.g., 0), the Resistance is $0.0$ (0% resistance), and the Efficiency Factor is $1.0$
  (100% efficiency).
* When $I_{current}$ is high (e.g., 900 out of 1000 EffectiveDifficulty), the Resistance is $\sqrt{0.9} \approx 0.949$
  (94.9% resistance), and the Efficiency Factor is $1 - 0.949 \approx 0.051$ (5.1% efficiency).

### C. Final Intel Gain and Accumulation

The final Intel gained this turn is the Base Input multiplied by the Efficiency Factor (which is $1 - \text{Resistance}$).

$$\text{Gain} = \text{BaseAgentInput} \times \text{EfficiencyFactor} = \text{BaseAgentInput} \times (1 - \text{Resistance})$$
$$\mathbf{I_{new}} = I_{current} + \text{Gain}$$

---

## 3. Investigation Success and Probability

At the end of the turn, the accumulated Intel is compared against the Lead Difficulty ($D$) to
determine the probability of success.

### A. Probability of Success

The probability ($P$) is a simple ratio of the accumulated Intel to the Lead Difficulty.

Using the same effective difficulty definition as above:

$$\text{EffectiveDifficulty} = \text{Difficulty} \times 100$$

$$P(\text{Success}) = \frac{I_{current}}{\text{EffectiveDifficulty}}$$

**Success Check:** A random number between 0.0 and 1.0 is generated. If the random number is less
than $P(\text{Success})$, the investigation is complete.

### B. The Meaning of Difficulty (D)

The **Lead Difficulty ($D$)** represents the amount of Intel required for a **100% chance** of success in a single turn.

With a **Difficulty multiplier** of 100:

* If $D = 5$, you need $5 \times 100 = 500$ Intel accumulated to have a $500/500 = 100\%$ chance of success.
* If $D = 10$, you need $10 \times 100 = 1000$ Intel accumulated to have a $1000/1000 = 100\%$ chance of success.

---

## 4. Agent Loss and Proportional Recalibration

To ensure accumulated knowledge remains current and to prevent the exploitation of "parked" leads, the system
employs an **Immediate Proportional Recalibration** (or Proportional Loss) mechanic.

When one or more agents are removed from an investigation, the accumulated Intel is immediately reduced
proportional to the loss of the team's total investigation skill. This models the loss of institutional memory
and data becoming stale.

$$\mathbf{I_{new}} = I_{old} \times \frac{\sum \text{Skill}_{new}}{\sum \text{Skill}_{old}}$$

| Variable | Description |
| :--- | :--- |
| $\mathbf{I_{new}}$ | Intel remaining after recalibration. |
| $\mathbf{I_{old}}$ | Intel accumulated before agent removal. |
| $\sum \text{Skill}_{new}$ | Sum of the skill of agents **remaining** on the investigation. |
| $\sum \text{Skill}_{old}$ | Sum of the skill of agents **previously** on the investigation. |

**Example:** A lead has 700 Intel and is being worked by two agents: Agent Alpha (Skill 150) and Agent Bravo
(Skill 50). Total Skill: 200.
* **Action:** Agent Alpha (Skill 150) is removed.
* **Recalculation:** $700 \times \frac{50}{200} = \mathbf{175 \text{ Intel}}$ remaining.

---

## 5. Agent Exhaustion and Mandatory Rotation

Agents are unable to sustain intensive investigative work indefinitely. This introduces a natural time limit
on how long a single team can remain dedicated to a lead.

**The Mechanic:**
* **Exhaustion Accumulation:** Each agent accumulates 1 **Exhaustion Point** per turn they spend on an investigation.
* **Mandatory Withdrawal:** Once an agent's accumulated Exhaustion reaches 100, the agent is automatically
    withdrawn from the investigation at the start of the next turn.

**Impact:**
The mandatory withdrawal of an exhausted agent triggers the **Proportional Recalibration** (Section 4),
resulting in an immediate loss of accumulated Intel. This mechanic incentivizes the player to:
1. Finish leads within approximately 100 turns, or
2. Proactively rotate agents out before they hit 100 Exhaustion, ensuring fresh agents maintain momentum
   and prevent sudden, avoidable loss of Intel.

---

## 6. Key Player Intuitions

| Concept | Player Feedback/Intuition |
| :--- |:--- |
| **P(Success)** | **The higher this number, the faster the lead will be resolved.** This is the primary number to watch. |
| **Count$^{0.8}$** | **The more agents, the faster the work, but each *additional* agent provides less benefit.** Going from 1 to 2 is a big gain; going from 10 to 11 is a small gain. |
| **Resistance** | **As Intel accumulates, resistance increases, making further progress harder.** The investigation naturally "drags" at the end, ensuring unpredictability. `Resistance = (Intel / EffectiveDifficulty)^0.5`. |
| **Proportional Loss** | **The most skilled agents carry the most knowledge.** Removing a highly skilled agent causes a greater loss of accumulated Intel than removing a rookie. |
| **Exhaustion** | **Don't let agents exhaust themselves on a long lead.** You must plan to finish a lead or swap agents before the 100-turn limit forces a costly loss of intel. |
