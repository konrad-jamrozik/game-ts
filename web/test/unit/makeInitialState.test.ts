import { describe, expect, test } from 'vitest'
import { agsV } from '../../src/lib/model/agents/AgentsView'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'
import { getContractingIncome, getMoneyNewBalance } from '../../src/lib/model/ruleset/moneyRuleset'

describe(makeInitialState, () => {
  describe(getContractingIncome, () => {
    test('should throw error when agent effective skill results in fractional income', () => {
      // Create a game state with debug mode enabled
      const gameState = makeInitialState({ debug: true })

      // Find agents on contracting assignment
      const agentsView = agsV(gameState.agents)
      const contractingAgents = agentsView.onContractingAssignment()

      // Verify we have contracting agents
      expect(contractingAgents.length).toBeGreaterThan(0)

      // The error occurs when getContractingIncome is called because:
      // - An agent has an effective skill (e.g., 110) that results in fractional income
      // - effectiveSkill = 110, AGENT_CONTRACTING_INCOME = 15
      // - income = (110 / 100) * 15 = 1.1 * 15 = 16.5 (not an integer!)
      // - f6addToInt(0, 16.5) tries to convert 16.5 to an integer, which fails

      expect(getContractingIncome(contractingAgents)).toBe(16.5)
    })
  })

  describe(getMoneyNewBalance, () => {
    test('should throw error when calculating money balance with debug state', () => {
      // Create a game state with debug mode enabled
      const gameState = makeInitialState({ debug: true })

      // The error occurs when AssetsDataGrid calls getMoneyNewBalance
      // which internally calls getContractingIncome, which fails when
      // agent effective skill results in fractional income

      expect(getMoneyNewBalance(gameState)).toBe(16.5)
    })
  })
})
