import { describe, expect, test } from 'vitest'
import { PlayerActions } from '../../src/components/PlayerActions'
import { fix } from './componentFixture'
import { getMoneyNewBalance } from '../../src/lib/model/ruleset/ruleset'
import { getLeadById } from '../../src/lib/collections/leads'

describe(PlayerActions, () => {
  const agentId = 'agent-1' as const

  test("click 'hire agent' button -> happy path", async () => {
    fix.expectAgentCount(0)
    fix.renderPlayerActions()

    await fix.hireAgent() // Act

    fix.expectAgentCount(1)
    fix.expectTerminatedAgentCount(0)
  })

  test("click 'hire agent' button -> alert: insufficient funds", async () => {
    fix.arrangeGameState({ money: 0, funding: 0 })
    expect(getMoneyNewBalance(fix.gameState)).toBe(0)
    fix.expectAgentCount(0)
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.hireAgent() // Act

    fix.expectPlayerActionsAlert('Insufficient funds')
    fix.expectAgentCount(0)
  })

  test("click 'sack agents' button -> happy path", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInStandby(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.expectAgentCount(1)
    fix.expectTerminatedAgentCount(0)
    fix.renderPlayerActions()

    await fix.sackAgents() // Act

    fix.expectAgentCount(1)
    fix.expectTerminatedAgentCount(1)
    fix.expectAgentState(agentId, 'Terminated')
    fix.expectAgentAssignment(agentId, 'Sacked')
  })

  test("click 'sack agents' button -> alert: agents in invalid states", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInContracting(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.expectAgentCount(1)
    fix.expectTerminatedAgentCount(0)
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.sackAgents() // Act

    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
    fix.expectAgentCount(1)
    fix.expectTerminatedAgentCount(0)
  })

  test("click 'assign agents to contracting' button -> happy path", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInStandby(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()

    await fix.assignToContracting() // Act

    fix.expectAgentState(agentId, 'InTransit')
    fix.expectAgentAssignment(agentId, 'Contracting')
  })

  test("click 'assign agents to contracting' button -> alert: agents in invalid states", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInEspionage(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.assignToContracting() // Act

    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
    fix.expectAgentAssignment(agentId, 'Espionage') // Expect unchanged
  })

  test("click 'assign agents to espionage' button -> happy path", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInStandby(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()

    await fix.assignToEspionage() // Act

    fix.expectAgentState(agentId, 'InTransit')
    fix.expectAgentAssignment(agentId, 'Espionage')
  })

  test("click 'assign agents to espionage' button -> alert: agents in invalid states", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInContracting(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.assignToEspionage() // Act

    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
    fix.expectAgentAssignment(agentId, 'Contracting') // Expect unchanged
  })

  test("click 'recall agents' button -> happy path", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInContracting(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()

    await fix.recallAgents() // Act

    fix.expectAgentAssignment(agentId, 'Standby')
    fix.expectAgentState(agentId, 'InTransit')
  })

  test("click 'recall agents' button -> alert: agents in invalid states", async () => {
    fix.arrangeGameState({ agents: [fix.newAgentInStandby(agentId)] })
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.recallAgents() // Act

    fix.expectPlayerActionsAlert('This action can be done only on OnAssignment agents!')
    fix.expectAgentState(agentId, 'Available') // Expect unchanged
  })

  test("click 'investigate lead' button -> happy path", async () => {
    const leadId = 'lead-criminal-orgs'
    const leadIntelCost = getLeadById(leadId).intelCost
    fix.arrangeGameState({
      intel: leadIntelCost,
    })
    fix.arrangeSelection({ lead: leadId })

    fix.renderPlayerActions()
    await fix.investigateLead() // Act

    fix.expectLeadInvestigatedOnce(leadId)
    fix.expectIntelAmount(10 - leadIntelCost)
  })

  test("click 'investigate lead' button -> alert: insufficient intel", async () => {
    const leadId = 'lead-criminal-orgs'
    const leadIntelCost = getLeadById(leadId).intelCost
    fix.arrangeGameState({
      intel: leadIntelCost - 1,
    })
    fix.arrangeSelection({ lead: leadId })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.investigateLead() // Act

    fix.expectPlayerActionsAlert('Not enough intel')
    fix.expectLeadNotInvestigated(leadId)
    fix.expectIntelAmount(leadIntelCost - 1) // Expect unchanged
  })

  test("click 'deploy agents to active mission site' button -> happy path", async () => {
    const missionSiteId = 'mission-site-1' as const
    fix.arrangeGameState({
      agents: [fix.newAgentInStandby(agentId)],
      missionSites: [fix.newMissionSite(missionSiteId)],
    })
    fix.arrangeSelection({ agents: [agentId], missionSite: missionSiteId })
    fix.renderPlayerActions()

    await fix.deployAgents() // Act

    fix.expectAgentsDeployed([agentId], missionSiteId)
  })

  test("click 'deploy agents to active mission site' button -> alert: agents in invalid states", async () => {
    const missionSiteId = 'mission-site-1' as const
    fix.arrangeGameState({
      agents: [fix.newAgentInContracting(agentId)],
      missionSites: [fix.newMissionSite(missionSiteId)],
    })
    fix.arrangeSelection({ agents: [agentId], missionSite: missionSiteId })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.deployAgents() // Act

    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
    fix.expectAgentsOnAssignment([agentId], 'Contracting') // Expect unchanged
  })
})
