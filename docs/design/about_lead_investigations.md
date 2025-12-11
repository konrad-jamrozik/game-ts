# About Agent Lead Investigation System

This document details the mechanics governing how agents investigate leads, balancing agent efficiency, accumulated knowledge, and an element of unpredictability.

## 1. Core Principles

The investigation system is based on the concept of **Probability Pressure**. Agents contribute "Intel" to a lead, which does not act as a traditional progress bar, but rather as a **Success Probability Multiplier**.

* **Unpredictability:** Success is determined by a random check against the accumulated Intel each turn. This ensures the exact completion date is never predictable.
* **Diminishing Returns:** Agents suffer reduced efficiency when working together, and when a lead is already heavily investigated.
* **Decay Prevention:** Instead of passive decay, the system actively penalizes the removal of agents, preventing the "parking" of an investigation.

## 2. Calculating Intel Gain per Turn

The Intel a team of agents contributes in a single turn is governed by three factors: the **Base Input**, the **Efficiency Multiplier**, and the **Logistic Resistance**.

### A. Base Agent Input

This step calculates the maximum theoretical Intel your team could gather, factoring in their skill and the diminished returns from working together.

$$\text{BaseAgentInput} = \left( \sum \frac{\text{AgentSkill}}{100} \right) \times \text{Count}^{0.8} \times 5$$

| Variable | Description | Default Value/Example |
| :--- | :--- | :--- |
| $\sum \frac{\text{AgentSkill}}{100}$ | Sum of all agents' skill scores, normalized to 100. | 3 agents of Skill 100: $3$ |
| $\text{Count}^{0.8}$ | **Efficiency Multiplier:** The count of agents currently investigating, raised to the power of 0.8. This creates **diminishing returns** for larger teams. | $3^{0.8} \approx 2.408$ |
| 5 | $\text{Intel per agent}$ (The base rate of Intel gained per normalized skill point). | 5 |
| **Example Base Input** | | $3 \times 2.408 \times 5 = \mathbf{36.12}$ |

### B. Logistic Resistance (Diminishing Returns on Knowledge)

The more Intel ($\mathbf{I_{current}}$) is already accumulated, the harder it is to find new information. This is calculated using the concept of a **Search Space**.

$$\text{Resistance} = 1 - \left( \frac{I_{current}}{\text{Difficulty}} \right)$$

* When $I_{current}$ is low (e.g., 0), the Resistance is $1.0$ (100% efficiency).
* When $I_{current}$ is high (e.g., 900 out of 1000 Difficulty), the Resistance is $0.1$ (10% efficiency).

### C. Final Intel Gain and Accumulation

The final Intel gained this turn is the Base Input multiplied by the Resistance.

$$\text{Gain} = \text{BaseAgentInput} \times \text{Resistance}$$
$$\mathbf{I_{new}} = I_{current} + \text{Gain}$$

---

## 3. Investigation Success and Probability

At the end of the turn, the accumulated Intel is compared against the Lead Difficulty ($D$) to determine the probability of success.

### A. Probability of Success

The probability ($P$) is a simple ratio of the accumulated Intel to the Lead Difficulty.

$$P(\text{Success}) = \frac{I_{current}}{\text{Difficulty}}$$

**Success Check:** A random number between 0.0 and 1.0 is generated. If the random number is less than $P(\text{Success})$, the investigation is complete.

### B. The Meaning of Difficulty (D)

The **Lead Difficulty ($D$)** represents the amount of Intel required for a **100% chance** of success in a single turn.

* If $D = 200$, you need 200 Intel accumulated to have a $200/200 = 100\%$ chance of success.
* If $D = 1000$, you need 1000 Intel to have a $1000/1000 = 100\%$ chance of success.

---

## 4. Anti-Parking Mechanic (Proportional Loss)

To prevent players from using a small team to maintain the large progress gained by a previous large team, the system employs an **Immediate Proportional Loss** mechanism.

When one or more agents are removed from an investigation, the accumulated Intel is immediately reduced proportional to the loss of manpower.

$$\mathbf{I_{new}} = I_{old} \times \frac{\text{Count}_{new}}{\text{Count}_{old}}$$

| Scenario | Start State | Action | Intel After Loss | Intuition |
| :--- | :--- | :--- | :--- | :--- |
| **A** | 700 Intel, 7 Agents | 3 Agents removed (4 remain) | $700 \times \frac{4}{7} = \mathbf{400 \text{ Intel}}$ | "We lost the agents who knew 3/7 of the data, so that part of the investigation is now stale/lost." |
| **B** | 500 Intel, 5 Agents | 4 Agents removed (1 remains) | $500 \times \frac{1}{5} = \mathbf{100 \text{ Intel}}$ | The remaining agent can only salvage 1/5 of the previous work. |

This forces the player to keep a strong commitment to a lead to maintain a high chance of success.

---

## 5. Key Player Intuitions

| Concept | Player Feedback/Intuition |
| :--- | :--- |
| **P(Success)** | **The higher this number, the faster the lead will be resolved.** This is the primary number to watch. |
| **Count$^{0.8}$** | **The more agents, the faster the work, but each *additional* agent provides less benefit.** Going from 1 to 2 is a big gain; going from 10 to 11 is a small gain. |
| **Logistic Resistance** | **It's easy to get 50% success chance, but very hard to push past 90%.** The investigation naturally "drags" at the end, ensuring unpredictability. |
| **Proportional Loss** | **Never remove agents from a high-intel lead unless you absolutely have to.** The loss of Intel is immediate and severe. |
