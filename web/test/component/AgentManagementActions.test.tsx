import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AGENT_HIRE_COST } from '../../src/lib/data_tables/constants'
import type { AgentId } from '../../src/lib/model/modelIds'
import { st } from '../fixtures/stateFixture'
import { ui } from '../fixtures/uiFixture'

describe('AgentManagementActions', () => {
  const agentId = 'agent-1' as AgentId

  test('selected-agent action buttons are disabled when no agents are selected', () => {
    st.arrangeGameState({})
    ui.renderAgentManagementActions()

    expect(screen.getByRole('button', { name: /hire agent/iu })).toBeEnabled()
    expect(screen.getByRole('button', { name: /sack 0 agents/iu })).toBeDisabled()
    expect(screen.getByRole('button', { name: /recall 0 agents/iu })).toBeDisabled()
    expect(screen.getByRole('button', { name: /assign 0 agents to contracting/iu })).toBeDisabled()
    expect(screen.getByRole('button', { name: /assign 0 agents to training/iu })).toBeDisabled()
  })

  test("click 'hire agent' button -> happy path", async () => {
    const initialMoney = 100
    st.arrangeGameState({ money: initialMoney })
    st.expectAgentCount(4)
    ui.renderAgentManagementActions()

    await ui.hireAgent()

    st.expectAgentCount(5)
    st.expectTerminatedAgentCount(0)
    expect(st.gameState.money).toBe(initialMoney - AGENT_HIRE_COST)
  })

  test("click 'hire agent' button -> alert: insufficient funds", async () => {
    st.arrangeGameState({ money: 0 })
    expect(st.gameState.money).toBe(0)
    st.expectAgentCount(4)
    ui.renderAgentManagementActions()
    ui.expectAgentManagementAlert({ hidden: true })

    await ui.hireAgent()

    ui.expectAgentManagementAlert('Insufficient funds')
    st.expectAgentCount(4)
  })

  test("click 'sack agents' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0)
    ui.renderAgentManagementActions()

    await ui.sackAgents()

    st.expectAgentCount(0)
    st.expectTerminatedAgentCount(1)
    st.expectAgentState(agentId, 'Sacked')
    st.expectAgentAssignment(agentId, 'Sacked')
  })

  test("click 'sack agents' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0)
    ui.renderAgentManagementActions()
    ui.expectAgentManagementAlert({ hidden: true })

    await ui.sackAgents()

    ui.expectAgentManagementAlert('This action can be done only on available agents!')
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0)
  })

  test("click 'assign agents to contracting' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderAgentManagementActions()

    await ui.assignToContracting()

    st.expectAgentState(agentId, 'InTransit')
    st.expectAgentAssignment(agentId, 'Contracting')
  })

  test("click 'assign agents to contracting' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderAgentManagementActions()
    ui.expectAgentManagementAlert({ hidden: true })

    await ui.assignToContracting()

    ui.expectAgentManagementAlert('This action can be done only on available agents!')
    st.expectAgentAssignment(agentId, 'Contracting')
  })

  test("click 'recall agents' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderAgentManagementActions()

    await ui.recallAgents()

    st.expectAgentAssignment(agentId, 'Standby')
    st.expectAgentState(agentId, 'InTransit')
  })

  test("click 'recall agents' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderAgentManagementActions()
    ui.expectAgentManagementAlert({ hidden: true })

    await ui.recallAgents()

    ui.expectAgentManagementAlert('This action can be done only on Contracting, Investigating, or InTraining agents!')
    st.expectAgentState(agentId, 'Available')
  })
})
