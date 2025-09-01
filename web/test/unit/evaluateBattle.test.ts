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
      rounds: 1,
      agentCasualties: 0,
      enemyCasualties: 0,
      retreated: false,
      agentSkillUpdates: {},
    })
  })

  test('evaluateBattle -> player won', () => {
    const agentId = 'agent-001'
    const agents = agsV([st.newAgent(agentId)])

    const report = evaluateBattle(agents, []) // Act

    expectReportToBe(report)({
      rounds: 1,
      agentCasualties: 0,
      enemyCasualties: 0,
      retreated: false,
      agentSkillUpdates: {},
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
