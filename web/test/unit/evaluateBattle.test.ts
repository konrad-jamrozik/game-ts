import { describe, expect, test } from 'vitest'
import { evaluateBattle, type BattleReport } from '../../src/lib/turn_advancement/evaluateBattle'
import { st } from '../utils/stateFixture'
import { agsV } from '../../src/lib/model/agents/AgentsView'

describe(evaluateBattle, () => {
  test.todo('evaluateBattle -> happy path: player won')

  test.todo('evaluateBattle -> happy path: player lost')

  test('evaluateBattle -> no enemies', () => {
    const agentId = 'agent-001'
    const agents = agsV([st.newAgentInStandby(agentId)])

    const report: BattleReport = evaluateBattle(agents, []) // Act

    expect(report.rounds).toBe(1)
    expect(report.agentsCasualties).toBe(0)
    expect(report.enemiesCasualties).toBe(0)
    expect(report.retreated).toBe(false)
    expect(report.agentSkillUpdates).toStrictEqual({})
  })
})
