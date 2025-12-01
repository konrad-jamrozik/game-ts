import { describe, expect, test } from 'vitest'
import { getContractingIncomeV2 } from '../../src/lib/ruleset/moneyRuleset'
import { toF6 } from '../../src/lib/utils/fixed6Utils'
import { agFix } from '../fixtures/agentFixture'
import { st } from '../fixtures/stateFixture'

describe(getContractingIncomeV2, () => {
  test('should handle agent with effective skill that results in fractional income', () => {
    // Create an agent with skill 110
    const agent = agFix.new({
      skill: toF6(110),
      state: 'OnAssignment',
      assignment: 'Contracting',
    })

    st.arrangeGameState({ agents: [agent] })

    // With skill 110 and AGENT_CONTRACTING_INCOME = 15:
    // income = (110 / 100) * 15 = 1.1 * 15 = 16.5
    // Flooring strips the fractional part, so result is 16
    expect(getContractingIncomeV2(st.gameState)).toBe(16)
  })

  test('should floor fractional income from total', () => {
    // This flooring strips any fractional income from the total, which is the desired behavior
    // Create 5 agents each with skill that produces 1.23 income per agent
    // To get 1.23 income: (skill / 100) * 15 = 1.23, so skill = 8.2
    // Each agent produces: (8.2 / 100) * 15 = 1.23 income
    // Total: 5 * 1.23 = 6.15
    // The fractional parts (0.23 each) sum to 1.15 (5 * 0.23)
    // So the income is 6.15, floored to 6
    const agents = Array.from({ length: 5 }, () =>
      agFix.new({
        skill: toF6(8.2),
        state: 'OnAssignment',
        assignment: 'Contracting',
      }),
    )

    st.arrangeGameState({ agents })

    const income = getContractingIncomeV2(st.gameState)
    expect(income).toBe(6) // Floored from 6.15 (5 * 1.23)
    expect(Number.isInteger(income)).toBe(true) // Always returns an integer
  })
})
