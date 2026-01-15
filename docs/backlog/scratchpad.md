# Scratchpad

I am wondering of different assignment approach.

At the beginning of the turn, the AI first takes a stock of existing agent assignments.

It answers question:

- How much more income per turn I need to keep the desired money reserve?
- How much combat rating I need to cover the active missions?
  - Can I achieve it within my transport capacity?
  - Which missions to prioritize?
- Should I start new lead investigations? How to prioritize?
  - Should I add agents to existing investigations?
- Which agents assign to training?
  - Need to take into account the training capacity and their skill.
- What to buy? Which agents, caps, upgrades?

Once the questions are answered, and as such desired known, the next step is for the AI
player to see to what degrees they can be fulfilled with current agents.

Note: the desires may be weighted differently, as they are achieved by assigning agents, as they are limited resource.

``` typescript
export function manageAgents(api: PlayTurnAPI): void {
  unassignExhaustedAgents(api)
  assignToContractingWithPriority(api)
  deployToMissions(api)
  assignToContracting(api)
  assignToLeadInvestigation(api)
  assignToTraining(api)
  assignLeftoverToContracting(api)
}
```

# ChatGPT

Per ChatGPT I may want:

https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/69689d38-c7b4-8331-a41c-a3243daf758e

1) Start with a decision architecture that does not require a single global weighting

If you try to pick one static weight vector (income=0.2, missions=0.5, etc.) you will spend a lot of time tuning and still get pathological behavior in edge cases. Instead, separate:

A. Hard constraints (must-not-violate)
- Never go below bankruptcy / minimum operating cash
- Do not assign exhausted agents beyond acceptable thresholds.

B. A small set of “always dominant” emergency priorities
Define state-based modes:
- Crisis: active mission failure risk high, reserve projected to go negative, or retaliation imminent → missions/income dominate.
- Stabilization: reserve safe, mission coverage adequate → investigations/training dominate.
- Growth: reserve high and threats low → training + purchases + long-horizon leads dominate.

This is a gating / policy layer; inside each mode you can still score things.

(...)

Two-stage works well in games

Cover obligations: find a feasible assignment that meets mission minimums and reserve constraints.

Spend the slack: allocate remaining agents/money to highest marginal long-term value.
