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

    // With skill 110 and AGENT_CONTRACTING_INCOME = 15:
    // coefficient = 1 + (110 - 100)/500 = 1 + 0.02 = 1.02
    // income = 1.02 * 15 = 15.3
    // Flooring strips the fractional part, so result is 15
    expect(getContractingIncome(st.gameState)).toBe(15)
  })

  test('should floor fractional income from total', () => {
    // This flooring strips any fractional income from the total, which is the desired behavior
    // Create 5 agents each with skill 120 that produces 15.6 income per agent
    // coefficient = 1 + (120 - 100)/500 = 1 + 0.04 = 1.04
    // Each agent produces: 1.04 * 15 = 15.6 income
    // Total: 5 * 15.6 = 78.0
    // The fractional parts (0.6 each) sum to 3.0 (5 * 0.6)
    // So the income is 78.0, floored to 78
    const agents = Array.from({ length: 5 }, () =>
      agFix.new({
        skill: toF6(120),
        state: 'OnAssignment',
        assignment: 'Contracting',
      }),
    )

    st.arrangeGameState({ agents })

    const income = getContractingIncome(st.gameState)
    expect(income).toBe(78) // Floored from 78.0 (5 * 15.6)
    expect(Number.isInteger(income)).toBe(true) // Always returns an integer
  })
})
