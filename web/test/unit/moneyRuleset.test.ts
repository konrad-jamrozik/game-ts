import { describe, expect, test } from 'vitest'
import { getContractingIncome } from '../../src/lib/ruleset/moneyRuleset'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { agFix } from '../fixtures/agentFixture'
import { st } from '../fixtures/stateFixture'

describe(getContractingIncome, () => {
  test('should handle agent with effective skill that results in fractional income', () => {
    // Create an agent with skill 110
    const agent = agFix.new({
      skill: toF6(110),
      state: 'OnAssignment',
      assignment: 'Contracting',
    })

    st.arrangeGameState({ agents: [agent] })

    // With skill 110 and AGENT_CONTRACTING_INCOME = 30:
    // coefficient = 1 + (110 - 100)/500 = 1 + 0.02 = 1.02
    // income = 1.02 * 30 = 30.6
    // Flooring strips the fractional part, so result is 30
    expect(getContractingIncome(st.gameState)).toBe(30)
  })

  test('should floor fractional income from total', () => {
    // This flooring strips any fractional income from the total, which is the desired behavior
    // Create 3 agents each with skill 120 that produces 31.2 income per agent
    // coefficient = 1 + (120 - 100)/500 = 1 + 0.04 = 1.04
    // Each agent produces: 1.04 * 30 = 31.2 income
    // Total: 3 * 31.2 = 93.6
    // Flooring strips the fractional part, so result is 93
    const agents = Array.from({ length: 3 }, () =>
      agFix.new({
        skill: toF6(120),
        state: 'OnAssignment',
        assignment: 'Contracting',
      }),
    )

    st.arrangeGameState({ agents })

    const income = getContractingIncome(st.gameState)
    expect(income).toBe(93) // Floored from 93.6 (3 * 31.2)
    expect(Number.isInteger(income)).toBe(true) // Always returns an integer
  })
})
