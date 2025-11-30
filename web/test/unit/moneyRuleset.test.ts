import { describe, expect, test } from 'vitest'
import { getContractingIncome } from '../../src/lib/model/ruleset/moneyRuleset'
import { agsV } from '../../src/lib/model/agents/AgentsView'
import { toF6 } from '../../src/lib/model/fixed6'
import { agFix } from '../fixtures/agentFixture'

describe(getContractingIncome, () => {
  test('should handle agent with effective skill that results in fractional income', () => {
    // Create an agent with skill 110
    const agent = agFix.new({
      skill: toF6(110),
      state: 'OnAssignment',
      assignment: 'Contracting',
    })

    const agentsView = agsV([agent])
    const contractingAgents = agentsView.onContractingAssignment()

    expect(getContractingIncome(contractingAgents)).toBe(16.5)
  })
})
