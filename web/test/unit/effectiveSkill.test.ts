import { describe, expect, test } from 'vitest'
import type { Agent } from '../../src/lib/model/agentModel'
import { agFix } from '../fixtures/agentFixture'
import { effectiveSkill } from '../../src/lib/ruleset/skillRuleset'
import { toF6 } from '../../src/lib/primitives/fixed6'

describe(effectiveSkill, () => {
  // prettier-ignore
  test.each<[string, Agent, number]>([
    ['no exhaustion, no hit points lost', agFix.default(), 100],  // effective_skill = 100 * (1 - 0/30) * (1 - 0/100) = 100 * 1 * 1 = 100

    ['exhaustion only', agFix.bld({
      skill: toF6(116),
      exhaustionPct: 20,
    }), 98.6],  // effective_skill = 116 * (1 - 0/30) * (1 - 15/100) = 116 * 1 * 0.85 = 98.6

    ['hit points lost only', agFix.wounded(7), 76.666_667],  // hit points lost = 30 - 23 = 7; effective_skill = 100 * (1 - 7/30) * (1 - 0/100) = 100 * 0.76666... * 1 = 76.666...

    ['exhaustion and hit points lost', agFix.bld({
      skill: toF6(150),
      exhaustionPct: 20,
      hitPoints: toF6(23),
      maxHitPoints: 30,
    }), 97.75],  // hit points lost = 30 - 23 = 7; effective_skill = 150 * (1 - 7/30) * (1 - 15/100) = 150 * 0.76666... * 0.85 = 97.75

    ['high exhaustion', agFix.exhausted(85), 20],  // effective_skill = 100 * (1 - 0/30) * (1 - 80/100) = 100 * 1 * 0.2 = 20

    ['100% exhaustion', agFix.exhausted(100), 5],  // exhaustion capped at 100, subtract 5 = 95 effective; effective_skill = 100 * (1 - 0/30) * (1 - 95/100) = 100 * 1 * 0.05 = 5

    ['105% exhaustion', agFix.exhausted(105), 5],  // exhaustion capped at 100, subtract 5 = 95 effective; effective_skill = 100 * (1 - 0/30) * (1 - 95/100) = 100 * 1 * 0.05 = 5

    ['exhaustion above 100 capped at 100', agFix.exhausted(150), 5],  // exhaustion capped at 100, subtract 5 = 95 effective; effective_skill = 100 * (1 - 0/30) * (1 - 95/100) = 100 * 1 * 0.05 = 5

    ['zero hit points', agFix.bld({
      hitPoints: toF6(0),
      maxHitPoints: 30,
    }), 0],  // hit points lost = 30 - 0 = 30; effective_skill = 100 * (1 - 30/30) * (1 - 0/100) = 100 * 0 * 1 = 0
  ])('%s', (_testName, agent, expected) => {
    const expectedF6 = toF6(expected)
    const result = effectiveSkill(agent)
    expect(result).toStrictEqual(expectedF6)
  })
})
