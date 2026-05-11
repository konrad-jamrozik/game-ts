import { describe, test } from 'vitest'
import type { AgentId } from '../../src/lib/model/modelIds'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { agFix } from '../fixtures/agentFixture'
import { st } from '../fixtures/stateFixture'
import { ui } from '../fixtures/uiFixture'

describe('MissionDeploymentActions', () => {
  const agentId = 'agent-1' as AgentId
  const missionId = 'mission-1'
  const readinessError =
    'Deploy requires ready agents: Standby or Training assignment, not in transit, exhaustion below 30%.'

  test("click 'deploy agents to active mission' button -> happy path", async () => {
    st.arrangeGameState({
      agents: [st.bldAgentInStandby(agentId)],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderMissionDeploymentActions()

    await ui.deployAgents()

    st.expectAgentsDeployed([agentId], missionId)
  })

  test("click 'deploy agents to active mission' button -> happy path with ready training agent", async () => {
    st.arrangeGameState({
      agents: [st.bldAgent(agentId, 'Training')],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderMissionDeploymentActions()

    await ui.deployAgents()

    st.expectAgentsDeployed([agentId], missionId)
  })

  test("click 'deploy agents to active mission' button -> alert: contracting agent is not ready", async () => {
    st.arrangeGameState({
      agents: [st.bldAgentInContracting(agentId)],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderMissionDeploymentActions()
    ui.expectMissionDeploymentAlert({ hidden: true })

    await ui.deployAgents()

    ui.expectMissionDeploymentAlert(readinessError)
    st.expectAgentsOnAssignment([agentId], 'Contracting')
  })

  test("click 'deploy agents to active mission' button -> alert: in-transit agent is not ready", async () => {
    st.arrangeGameState({
      agents: [agFix.bld({ id: agentId, state: 'InTransit', assignment: 'Standby', exhaustionPct: toF6(0) })],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderMissionDeploymentActions()
    ui.expectMissionDeploymentAlert({ hidden: true })

    await ui.deployAgents()

    ui.expectMissionDeploymentAlert(readinessError)
    st.expectAgentState(agentId, 'InTransit')
    st.expectAgentAssignment(agentId, 'Standby')
  })

  test("click 'deploy agents to active mission' button -> alert: exhausted agent is not ready", async () => {
    st.arrangeGameState({
      agents: [agFix.bld({ id: agentId, state: 'Available', assignment: 'Standby', exhaustionPct: toF6(30) })],
      missions: [st.bldMission(missionId)],
    })
    st.arrangeSelection({ agents: [agentId], mission: missionId })
    ui.renderMissionDeploymentActions()
    ui.expectMissionDeploymentAlert({ hidden: true })

    await ui.deployAgents()

    ui.expectMissionDeploymentAlert(readinessError)
    st.expectAgentState(agentId, 'Available')
    st.expectAgentAssignment(agentId, 'Standby')
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
    ui.renderMissionDeploymentActions()
    ui.expectMissionDeploymentAlert({ hidden: true })

    await ui.deployAgents()

    ui.expectMissionDeploymentAlert('Cannot deploy 2 agents. Only 1 transport slots available.')
    availableAgentIds.forEach((availableAgentId) => {
      st.expectAgentState(availableAgentId, 'Available')
      st.expectAgentAssignment(availableAgentId, 'Standby')
    })
    st.expectAgentsOnMission(newMissionId, [])
  })
})
