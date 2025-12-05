import { describe, expect, test } from 'vitest'
import { evaluateAttack } from '../../src/lib/game_utils/turn_advancement/evaluateAttack'
import { agFix } from '../fixtures/agentFixture'
import { enFix } from '../fixtures/enemyFixture'
import { effectiveSkill } from '../../src/lib/ruleset/skillRuleset'
import { toF6, toF } from '../../src/lib/primitives/fixed6'

describe(evaluateAttack, () => {
  // KJA fix this logic so it doesn't throws div by zero error
  test('throws division by zero error when attacker has 105+ exhaustion resulting in 0 effective skill', () => {
    // Create an attacker with exhaustion 105, which results in 0 effective skill
    // effective_skill = skill * (1 - (exhaustion - 5) / 100)
    // effective_skill = 100 * (1 - (105 - 5) / 100) = 100 * (1 - 1) = 100 * 0 = 0
    const attacker = agFix.new({
      exhaustion: 105,
    })
    const defender = enFix.new()

    // Verify that the attacker indeed has 0 effective skill
    const attackerEffectiveSkill = toF(effectiveSkill(attacker))
    expect(attackerEffectiveSkill).toBe(0)

    // Create attackerStats as required for agent attackers
    const attackerStats = {
      id: attacker.id,
      initialEffectiveSkill: effectiveSkill(attacker),
      skillGained: toF6(0),
    }

    // Expect evaluateAttack to throw a division by zero error
    // This happens in rollContest when it calls div(defenderValue, attackerValue)
    // with attackerValue = 0
    // Act
    evaluateAttack(attacker, attackerStats, defender, undefined, 'test_attack')
  })
})
