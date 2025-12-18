import { describe, expect, test } from 'vitest'
import { PlayerActions } from '../../src/components/GameControls/PlayerActions'
import { st } from '../fixtures/stateFixture'
import { ui } from '../fixtures/uiFixture'
import { AGENT_HIRE_COST } from '../../src/lib/dataTables/constants'
import { agFix } from '../fixtures/agentFixture'

import type { AgentId } from '../../src/lib/model/agentModel'

describe(PlayerActions, () => {
  const agentId = 'agent-1' as AgentId

  test("click 'hire agent' button -> happy path", async () => {
    const initialMoney = 100
    st.arrangeGameState({ money: initialMoney })
    st.expectAgentCount(4)
    ui.renderPlayerActions()

    await ui.hireAgent() // Act

    st.expectAgentCount(5)
    st.expectTerminatedAgentCount(0)
    // Verify money is immediately deducted
    expect(st.gameState.money).toBe(initialMoney - AGENT_HIRE_COST)
  })

  test("click 'hire agent' button -> alert: insufficient funds", async () => {
    st.arrangeGameState({ money: 0 })
    expect(st.gameState.money).toBe(0)
    st.expectAgentCount(4)
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.hireAgent() // Act

    ui.expectPlayerActionsAlert('Insufficient funds')
    st.expectAgentCount(4) // Expect unchanged
  })

  test("click 'sack agents' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0)
    ui.renderPlayerActions()

    await ui.sackAgents() // Act

    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0) // Sacked agents are not KIA
    st.expectAgentState(agentId, 'Sacked')
    st.expectAgentAssignment(agentId, 'Sacked')
  })

  test("click 'sack agents' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0)
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.sackAgents() // Act

    ui.expectPlayerActionsAlert('This action can be done only on available agents!')
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0) // Expect unchanged
  })

  test("click 'assign agents to contracting' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()

    await ui.assignToContracting() // Act

    st.expectAgentState(agentId, 'InTransit')
    st.expectAgentAssignment(agentId, 'Contracting')
  })

  test("click 'assign agents to contracting' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.assignToContracting() // Act

    ui.expectPlayerActionsAlert('This action can be done only on available agents!')
    st.expectAgentAssignment(agentId, 'Contracting') // Expect unchanged
  })

  test("click 'recall agents' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()

    await ui.recallAgents() // Act

    st.expectAgentAssignment(agentId, 'Standby')
    st.expectAgentState(agentId, 'InTransit')
  })

  test("click 'recall agents' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.bldAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.recallAgents() // Act

    ui.expectPlayerActionsAlert('This action can be done only on OnAssignment or InTraining agents!')
    st.expectAgentState(agentId, 'Available') // Expect unchanged
  })

  test("click 'investigate lead' button -> happy path", async () => {
    const leadId = 'lead-criminal-orgs'
    st.arrangeGameState({
      agents: [st.bldAgent('agent-000', 'Standby')],
    })
    st.arrangeSelection({ lead: leadId, agents: ['agent-000'] })

    ui.renderPlayerActions()
    await ui.investigateLead() // Act

    st.expectLeadInvestigationCreated(leadId)
  })

  test("'investigate lead' button is disabled when no agents selected", () => {
    const leadId = 'lead-criminal-orgs'
    st.arrangeGameState({})
    st.arrangeSelection({ lead: leadId })
    ui.renderPlayerActions()

    // Act: consider clicking the "Investigate lead" button and realize it is disabled.
    ui.expectInvestigateLeadButtonDisabled()

    st.expectLeadNotInvestigated(leadId)
  })

  test("click 'deploy agents to active mission' button -> happy path", async () => {
    const missionId = 'mission-1'
    st.arrangeGameState({
      agents: [st.bldAgentInStandby(agentId)],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderPlayerActions()

    await ui.deployAgents() // Act

    st.expectAgentsDeployed([agentId], missionId)
  })

  test("click 'deploy agents to active mission' button -> alert: agents in invalid states", async () => {
    const missionId = 'mission-1'
    st.arrangeGameState({
      agents: [st.bldAgentInContracting(agentId)],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.deployAgents() // Act

    ui.expectPlayerActionsAlert('This action can be done only on available agents!')
    st.expectAgentsOnAssignment([agentId], 'Contracting') // Expect unchanged
  })

  test("click 'deploy agents to active mission' button -> alert: transport cap exceeded by deployed missions", async () => {
    const deployedMissionId = 'mission-1'
    const newMissionId = 'mission-2'
    const deployedAgents = (['agent-100', 'agent-101', 'agent-102', 'agent-103', 'agent-104'] as AgentId[]).map((id) =>
      agFix.bld({ id, state: 'OnMission', assignment: deployedMissionId }),
    )
    const availableAgentIds = ['agent-200', 'agent-201'] as AgentId[]
    const availableAgents = availableAgentIds.map((id) => st.bldAgentInStandby(id))
    st.arrangeGameState({
      agents: [...deployedAgents, ...availableAgents],
      missions: [
        {
          ...st.bldMission(deployedMissionId),
          state: 'Deployed',
          agentIds: deployedAgents.map((agent) => agent.id),
        },
        st.bldMission(newMissionId),
      ],
    })
    st.arrangeSelection({ agents: availableAgentIds, mission: newMissionId })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.deployAgents() // Act

    ui.expectPlayerActionsAlert('Cannot deploy 2 agents. Only 1 transport slots available.')
    availableAgentIds.forEach((availableAgentId) => {
      st.expectAgentState(availableAgentId, 'Available')
      st.expectAgentAssignment(availableAgentId, 'Standby')
    })
    st.expectAgentsOnMission(newMissionId, [])
  })
})
