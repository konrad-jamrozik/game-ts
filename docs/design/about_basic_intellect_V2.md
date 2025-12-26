
# Basic AI player intellect V2

The basic AI player intellect V2 follows following rules for itself:

# Money management

If, given money projections, would run out of money in three turns, then unconditionally
do not spend money on anything. You must make this check after each purchase in given turn.

If there is not enough money, aim to increase income by assigning more agents to
contracting. This may require from you to unassign agents from training first.

If there is enough money available:
- Hire new agents
- If cannot hire because the agent cap is too low, increase the agent cap
- Send available agents to training
- If cannot send agents to training because training cap is too low, increase training cap
- If need to buy transport cap (see section on mission deployment below) then increase transport cap.

# Monthly income

Aim to have always enough agents assigned to contracting so that the income from it covers
100% to 120% of all ongoing expenditures. This excludes one time costs like hiring agents
or buying a capability upgrade, but includes agent upkeep costs.
Do not take into account in your computations the income from funding.

# Agent assignment

When assigning agents to anything (contracting, training, missions), prioritize assigning agents that have
the least amount of exhaustion.

Unassign agents from any assignment if their exhaustion reaches 30% or more.

# Mission deployment

When deploying agents on missions, ensure their total threat assessment is at least as
high as the estimated mission threat assessment.

If you cannot do it primarily because you don't have enough transport capacity,
then buy more transport capacity.
