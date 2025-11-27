import { describe, expect, test } from 'vitest'
import { evaluateBattle, type BattleReport } from '../../src/lib/turn_advancement/evaluateBattle'
import { st } from '../fixtures/stateFixture'
import { agsV } from '../../src/lib/model/agents/AgentsView'
import { agFix } from '../fixtures/agentFixture'
import { enFix } from '../fixtures/enemyFixture'
import { rand } from '../../src/lib/utils/rand'
import {
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  RETREAT_THRESHOLD,
} from '../../src/lib/model/ruleset/constants'
import { f2add, f2asFloat, toF2 } from '../../src/lib/model/fixed2'

describe(evaluateBattle, () => {
  test('1 agent defeats 1 enemy in 1 attack', () => {
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

  test('1 enemy defeats 1 agent in 1 attack', () => {
    rand.set('agent_attack_roll', 0)
    rand.set('enemy_attack_roll', 1)
    const agent = agFix.new()
    const enemy = enFix.withSuperWeapon()

    const report = evaluateBattle(agsV([agent]), [enemy]) // Act

    expectReportToBe(report)({
      rounds: 1,
      agentCasualties: 1,
      enemyCasualties: 0,
      retreated: false,
      agentSkillUpdates: {
        [agent.id]: f2add(AGENT_FAILED_ATTACK_SKILL_REWARD, AGENT_FAILED_DEFENSE_SKILL_REWARD),
      },
    })
  })

  test('1 enemy causes 1 agent to retreat', () => {
    rand.set('enemy_attack_roll', 1)
    rand.set('agent_attack_roll', 0)
    const agent = agFix.new()
    const enemy = enFix.withWeakWeapon()

    const report = evaluateBattle(agsV([agent]), [enemy]) // Act

    const expectedRounds = Math.ceil((AGENT_INITIAL_HIT_POINTS * RETREAT_THRESHOLD) / enemy.weapon.damage)
    const skillGainPerRound = f2add(AGENT_FAILED_ATTACK_SKILL_REWARD, AGENT_FAILED_DEFENSE_SKILL_REWARD)
    const expectedSkillUpdate = toF2(f2asFloat(skillGainPerRound) * expectedRounds)
    expectReportToBe(report)({
      rounds: expectedRounds,
      agentCasualties: 1,
      enemyCasualties: 0,
      retreated: true,
      agentSkillUpdates: { [agent.id]: expectedSkillUpdate },
    })
  })
})

/**
 * Creates a function to assert that a BattleReport matches the expected values.
 *
 * @param actual The actual BattleReport from evaluateBattle
 * @returns A function that takes expected values and performs all assertions
 */
function expectReportToBe(actual: BattleReport): (expected: Partial<BattleReport>) => void {
  return (expected: Partial<BattleReport>): void => {
    expect(actual.rounds).toBe(expected.rounds)
    expect(actual.agentCasualties).toBe(expected.agentCasualties)
    expect(actual.enemyCasualties).toBe(expected.enemyCasualties)
    expect(actual.retreated).toBe(expected.retreated)
    expect(actual.agentSkillUpdates).toStrictEqual(expected.agentSkillUpdates)
  }
}
