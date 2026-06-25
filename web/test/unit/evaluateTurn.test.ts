import { describe, expect, test } from 'vitest'
import evaluateTurn from '../../src/lib/game_utils/turn_advancement/evaluateTurn'
import { bldGameState } from '../../src/lib/factories/gameStateFactory'
import { bldAgent } from '../../src/lib/factories/agentFactory'
import { isGameLost } from '../../src/lib/game_utils/gameStateChecks'
import type { Agent } from '../../src/lib/model/agentModel'
import type { GameState } from '../../src/lib/model/gameStateModel'
import type { AgentId } from '../../src/lib/model/modelIds'

describe(evaluateTurn, () => {
  test('happy path', () => {
    expect.hasAssertions()

    const state = bldMinimalGameState({ money: 100 })
    const turnBefore = state.turn

    evaluateTurn(state)

    expect(state.turn).toBe(turnBefore + 1)
    expect(state.money).toBeGreaterThanOrEqual(0)
    expect(isGameLost(state)).toBe(false)
  })

  test('player lost', () => {
    expect.hasAssertions()

    // With no money and no funding, agent upkeep drives the balance negative,
    // which triggers the game-lost condition after the turn is evaluated.
    const state = bldMinimalGameState({ money: 0, funding: 0 })

    evaluateTurn(state)

    expect(state.money).toBeLessThan(0)
    expect(isGameLost(state)).toBe(true)
  })
})

function bldMinimalGameState(overrides: Partial<GameState>): GameState {
  // Build fresh agents so the state is fully mutable. evaluateTurn mutates state
  // in place (it normally runs inside an Immer draft), and the default factory
  // agents/factions are shared references that get frozen by other tests.
  const agentIds: AgentId[] = ['agent-001', 'agent-002', 'agent-003']
  const agents: Agent[] = agentIds.map((id) => bldAgent({ id, state: 'Available', assignment: 'Standby' }))
  return bldGameState({ agents, factions: [], ...overrides })
}
