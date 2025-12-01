import { describe, expect, test } from 'vitest'
import { PlayerActions } from '../../src/components/PlayerActions'
import { st } from '../fixtures/stateFixture'
import { ui } from '../fixtures/uiFixture'
import { getMoneyNewBalance } from '../../src/lib/ruleset/moneyRuleset'
import { AGENT_HIRE_COST } from '../../src/lib/ruleset/constants'

describe(PlayerActions, () => {
  const agentId = 'agent-1'

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
    expect(getMoneyNewBalance(st.gameState)).toBe(0)
    st.expectAgentCount(4)
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.hireAgent() // Act

    ui.expectPlayerActionsAlert('Insufficient funds')
    st.expectAgentCount(4) // Expect unchanged
  })

  test("click 'sack agents' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.newAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(0)
    ui.renderPlayerActions()

    await ui.sackAgents() // Act

    st.expectAgentCount(1)
    st.expectTerminatedAgentCount(1)
    st.expectAgentState(agentId, 'Terminated')
    st.expectAgentAssignment(agentId, 'Sacked')
  })

  test("click 'sack agents' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.newAgentInContracting(agentId)] })
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
    st.arrangeGameState({ agents: [st.newAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()

    await ui.assignToContracting() // Act

    st.expectAgentState(agentId, 'InTransit')
    st.expectAgentAssignment(agentId, 'Contracting')
  })

  test("click 'assign agents to contracting' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.newAgentInEspionage(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.assignToContracting() // Act

    ui.expectPlayerActionsAlert('This action can be done only on available agents!')
    st.expectAgentAssignment(agentId, 'Espionage') // Expect unchanged
  })

  test("click 'assign agents to espionage' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.newAgentInStandby(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()

    await ui.assignToEspionage() // Act

    st.expectAgentState(agentId, 'InTransit')
    st.expectAgentAssignment(agentId, 'Espionage')
  })

  test("click 'assign agents to espionage' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.newAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.assignToEspionage() // Act

    ui.expectPlayerActionsAlert('This action can be done only on available agents!')
    st.expectAgentAssignment(agentId, 'Contracting') // Expect unchanged
  })

  test("click 'recall agents' button -> happy path", async () => {
    st.arrangeGameState({ agents: [st.newAgentInContracting(agentId)] })
    st.arrangeSelection({ agents: [agentId] })
    ui.renderPlayerActions()

    await ui.recallAgents() // Act

    st.expectAgentAssignment(agentId, 'Standby')
    st.expectAgentState(agentId, 'InTransit')
  })

  test("click 'recall agents' button -> alert: agents in invalid states", async () => {
    st.arrangeGameState({ agents: [st.newAgentInStandby(agentId)] })
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
      agents: [st.newAgent('agent-000', 'Standby')],
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

  test("click 'deploy agents to active mission site' button -> happy path", async () => {
    const missionSiteId = 'mission-site-1'
    st.arrangeGameState({
      agents: [st.newAgentInStandby(agentId)],
      missionSites: [st.newMissionSite(missionSiteId)],
    })
    st.arrangeSelection({ agents: [agentId], missionSite: missionSiteId })
    ui.renderPlayerActions()

    await ui.deployAgents() // Act

    st.expectAgentsDeployed([agentId], missionSiteId)
  })

  test("click 'deploy agents to active mission site' button -> alert: agents in invalid states", async () => {
    const missionSiteId = 'mission-site-1'
    st.arrangeGameState({
      agents: [st.newAgentInContracting(agentId)],
      missionSites: [st.newMissionSite(missionSiteId)],
    })
    st.arrangeSelection({ agents: [agentId], missionSite: missionSiteId })
    ui.renderPlayerActions()
    ui.expectPlayerActionsAlert({ hidden: true })

    await ui.deployAgents() // Act

    ui.expectPlayerActionsAlert('This action can be done only on available agents!')
    st.expectAgentsOnAssignment([agentId], 'Contracting') // Expect unchanged
  })
})
