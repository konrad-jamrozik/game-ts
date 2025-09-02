import { describe, expect, test } from 'vitest'
import { evaluateBattle, type BattleReport } from '../../src/lib/turn_advancement/evaluateBattle'
import { st } from '../fixtures/stateFixture'
import { agsV } from '../../src/lib/model/agents/AgentsView'
import { agFix } from '../fixtures/agentFixture'
import { rand } from '../../src/lib/utils/rand'
import { AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD } from '../../src/lib/model/ruleset/constants'

describe(evaluateBattle, () => {
  test('1 agent defeat 1 enemy in 1 round', () => {
    rand.set('agent_attack_roll', 1)
    const agent = agFix.withSuperWeapon()
    const enemy = st.newEnemyInitiate()

    const report = evaluateBattle(agsV([agent]), [enemy]) // Act

    expectReportToBe(report)({
      rounds: 1,
      agentCasualties: 0,
      enemyCasualties: 1,
      retreated: false,
      agentSkillUpdates: { [agent.id]: AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD },
    })
  })

  test.todo('happy path: player won')

  test.todo('happy path: player lost')
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
