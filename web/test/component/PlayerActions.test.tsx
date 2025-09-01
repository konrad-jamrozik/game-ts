/* eslint-disable vitest/expect-expect */
// Note: This file uses helper functions in componentFixture.tsx that contain the actual expect() calls

import { describe, expect, test } from 'vitest'
import { PlayerActions } from '../../src/components/PlayerActions'
import { fix } from './componentFixture'
import { getMoneyNewBalance } from '../../src/lib/model/ruleset/ruleset'

describe(PlayerActions, () => {
  const agentId = 'agent-1' as const

  test("click 'hire agent' button -> happy path", async () => {
    expect(fix.agentsView).toHaveLength(0)
    fix.renderPlayerActions()

    await fix.hireAgent() // Act

    expect(fix.agentsView).toHaveLength(1)
  })

  /**
   * When projected new balance before hiring the agents is 0 or less,
   * the agent cannot be hired.
   *
   */
  test("click 'hire agent' button -> alert: insufficient funds", async () => {
    fix.setMoneyAndFunding(0)
    expect(getMoneyNewBalance(fix.gameState)).toBe(0)
    expect(fix.agentsView).toHaveLength(0)
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.hireAgent() // Act

    expect(fix.agentsView).toHaveLength(0)
    fix.expectPlayerActionsAlert('Insufficient funds')
  })

  // sackAgents tests
  test("click 'sack agents' button -> happy path", async () => {
    const availableAgent = fix.newAgentInStandby(agentId)
    fix.setAgentsInState([availableAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()

    await fix.sackAgents() // Act

    fix.expectAgentCount(1) // Agent is not removed from array, just terminated
    fix.expectAgentState(agentId, 'Terminated')
    fix.expectAgentAssignment(agentId, 'Sacked')
  })

  test("click 'sack agents' button -> alert: agents in invalid states", async () => {
    const onAssignmentAgent = fix.newAgentInContracting(agentId)
    fix.setAgentsInState([onAssignmentAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.sackAgents() // Act

    fix.expectAgentCount(1)
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })

  // assignAgentsToContracting tests
  test("click 'assign agents to contracting' button -> happy path", async () => {
    const availableAgent = fix.newAgentInStandby(agentId)
    fix.setAgentsInState([availableAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()

    await fix.assignToContracting() // Act

    // Agent goes to InTransit state with Contracting assignment
    fix.expectAgentCount(1)
    fix.expectAgentState(agentId, 'InTransit')
    fix.expectAgentAssignment(agentId, 'Contracting')
  })

  test("click 'assign agents to contracting' button -> alert: agents in invalid states", async () => {
    const onAssignmentAgent = fix.newAgentInEspionage(agentId)
    fix.setAgentsInState([onAssignmentAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.assignToContracting() // Act

    fix.expectAgentCount(1)
    fix.expectAgentAssignment(agentId, 'Espionage') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })

  // assignAgentsToEspionage tests
  test("click 'assign agents to espionage' button -> happy path", async () => {
    const availableAgent = fix.newAgentInStandby(agentId)
    fix.setAgentsInState([availableAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    await fix.assignToEspionage() // Act

    // Agent goes to InTransit state with Espionage assignment
    fix.expectAgentCount(1)
    fix.expectAgentState(agentId, 'InTransit')
    fix.expectAgentAssignment(agentId, 'Espionage')
  })

  test("click 'assign agents to espionage' button -> alert: agents in invalid states", async () => {
    const onAssignmentAgent = fix.newAgentInContracting(agentId)
    fix.setAgentsInState([onAssignmentAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.assignToEspionage() // Act

    fix.expectAgentCount(1)
    fix.expectAgentAssignment(agentId, 'Contracting') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })

  // recallAgents tests
  test("click 'recall agents' button -> happy path", async () => {
    const onAssignmentAgent = fix.newAgentInContracting(agentId)
    fix.setAgentsInState([onAssignmentAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    await fix.recallAgents() // Act

    // Agent goes to InTransit state with Standby assignment
    fix.expectAgentCount(1)
    fix.expectAgentState(agentId, 'InTransit')
    fix.expectAgentAssignment(agentId, 'Standby')
  })

  test("click 'recall agents' button -> alert: agents in invalid states", async () => {
    const availableAgent = fix.newAgentInStandby(agentId)
    fix.setAgentsInState([availableAgent])
    fix.arrangeSelection({ agents: [agentId] })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.recallAgents() // Act

    fix.expectAgentCount(1)
    fix.expectAgentState(agentId, 'Available') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on OnAssignment agents!')
  })

  // investigateLead tests
  test("click 'investigate lead' button -> happy path", async () => {
    const leadId = 'lead-criminal-orgs'
    const leadIntelCost = 10
    fix.setIntel(20)
    fix.arrangeSelection({ lead: leadId })

    fix.renderPlayerActions()
    await fix.investigateLead() // Act

    fix.expectIntelAmount(20 - leadIntelCost)
    fix.expectLeadInvestigated(leadId, 1)
  })

  test("click 'investigate lead' button -> alert: insufficient intel", async () => {
    const leadId = 'lead-criminal-orgs'
    fix.arrangeGameState({
      intel: 5, // Less than required to investigate lead-criminal-orgs, which costs 10
    })
    fix.arrangeSelection({ lead: leadId })
    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.investigateLead() // Act

    fix.expectPlayerActionsAlert('Not enough intel')
    fix.expectIntelAmount(5) // Expect unchanged
    fix.expectLeadNotInvestigated(leadId)
  })

  // deployAgentsToMission tests
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
