import { describe, expect, test } from 'vitest'
import { evaluateBattle, type BattleReport } from '../../src/lib/turn_advancement/evaluateBattle'
import { st } from '../fixtures/stateFixture'
import { agsV } from '../../src/lib/model/agents/AgentsView'

describe(evaluateBattle, () => {
  test('evaluateBattle -> no enemies', () => {
    const agentId = 'agent-001'
    const agents = agsV([st.newAgent(agentId)])

    const report = evaluateBattle(agents, []) // Act

    expectReportToBe(report)({
      rounds: 1, // KJA should be 0 rounds
      agentCasualties: 0,
      enemyCasualties: 0,
      retreated: false,
      agentSkillUpdates: { [agentId]: 0 },
    })
  })

  test('evaluateBattle -> player wins in 1 round', () => {
    const agents = st.newAgents({ count: 5, skill: 500 })
    const agentIds = agents.map((agent) => agent.id)
    const agentsView = agsV(agents)
    const enemy = st.newEnemyInitiate()

    const report = evaluateBattle(agentsView, [enemy]) // Act

    // KJA make this test have 1 player unit with super-weapon that kills enemy in one attack
    // also force random roll to always roll 100.
    // Then have a separate test where after 1st round enemy beats agent to 10% health
    // which causes retreat.
    // Have another skill where severely agent grinds out 110% exhausted enemy in 3 rounds.
    // Note: enemy with 0 effective skill should not attack.
    const entries = Object.fromEntries(agentIds.map((id) => [id, expect.any(Number)]))
    expectReportToBe(report)({
      rounds: 2, // KJA should be 1 round
      agentCasualties: 0,
      enemyCasualties: 1,
      retreated: false,
      agentSkillUpdates: entries,
    })
  })

  test.todo('evaluateBattle -> happy path: player won')

  test.todo('evaluateBattle -> happy path: player lost')
})

/**
 * Creates a function to assert that a BattleReport matches the expected values.
 *
 * @param actual The actual BattleReport from evaluateBattle
 * @returns A function that takes expected values and performs all assertions
 */
function expectReportToBe(actual: BattleReport): (expected: Partial<BattleReport>) => void {
  return (expected: Partial<BattleReport>): void => {
    if (expected.rounds !== undefined) {
      expect(actual.rounds).toBe(expected.rounds)
    }
    if (expected.agentCasualties !== undefined) {
      expect(actual.agentCasualties).toBe(expected.agentCasualties)
    }
    if (expected.enemyCasualties !== undefined) {
      expect(actual.enemyCasualties).toBe(expected.enemyCasualties)
    }
    if (expected.retreated !== undefined) {
      expect(actual.retreated).toBe(expected.retreated)
    }
    if (expected.agentSkillUpdates !== undefined) {
      expect(actual.agentSkillUpdates).toStrictEqual(expected.agentSkillUpdates)
    }
  }
}
