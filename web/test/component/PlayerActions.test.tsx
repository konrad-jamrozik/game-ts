/* eslint-disable vitest/expect-expect */
// Note: This file uses helper functions in componentFixture.tsx that contain the actual expect() calls

import { describe, expect, test } from 'vitest'
import { PlayerActions } from '../../src/components/PlayerActions'
import { fix } from './componentFixture'
import { getMoneyNewBalance } from '../../src/lib/model/ruleset/ruleset'
import type { MissionSite } from '../../src/lib/model/model'
import { makeInitialState } from '../../src/lib/model/ruleset/initialState'

describe(PlayerActions, () => {
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
    const availableAgent = fix.newAgent('agent-1')
    fix.setAgentsInState([availableAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    await fix.sackAgents() // Act

    fix.expectAgentCount(1) // Agent is not removed from array, just terminated
    fix.expectAgentState('agent-1', 'Terminated')
    fix.expectAgentAssignment('agent-1', 'Sacked')
  })

  test("click 'sack agents' button -> alert: agents in invalid states", async () => {
    const onAssignmentAgent = fix.newOnAssignmentAgent('agent-1', 'Contracting')
    fix.setAgentsInState([onAssignmentAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.sackAgents() // Act

    fix.expectAgentCount(1)
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })

  // assignAgentsToContracting tests
  test("click 'assign agents to contracting' button -> happy path", async () => {
    const availableAgent = fix.newAgent('agent-1')
    fix.setAgentsInState([availableAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    await fix.assignToContracting() // Act

    // Agent goes to InTransit state with Contracting assignment
    fix.expectAgentCount(1)
    fix.expectAgentState('agent-1', 'InTransit')
    fix.expectAgentAssignment('agent-1', 'Contracting')
  })

  test("click 'assign agents to contracting' button -> alert: agents in invalid states", async () => {
    const onAssignmentAgent = fix.newOnAssignmentAgent('agent-1', 'Espionage')
    fix.setAgentsInState([onAssignmentAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.assignToContracting() // Act

    fix.expectAgentCount(1)
    fix.expectAgentAssignment('agent-1', 'Espionage') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })

  // assignAgentsToEspionage tests
  test("click 'assign agents to espionage' button -> happy path", async () => {
    const availableAgent = fix.newAgent('agent-1')
    fix.setAgentsInState([availableAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    await fix.assignToEspionage() // Act

    // Agent goes to InTransit state with Espionage assignment
    fix.expectAgentCount(1)
    fix.expectAgentState('agent-1', 'InTransit')
    fix.expectAgentAssignment('agent-1', 'Espionage')
  })

  test("click 'assign agents to espionage' button -> alert: agents in invalid states", async () => {
    const onAssignmentAgent = fix.newOnAssignmentAgent('agent-1', 'Contracting')
    fix.setAgentsInState([onAssignmentAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.assignToEspionage() // Act

    fix.expectAgentCount(1)
    fix.expectAgentAssignment('agent-1', 'Contracting') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })

  // recallAgents tests
  test("click 'recall agents' button -> happy path", async () => {
    const onAssignmentAgent = fix.newOnAssignmentAgent('agent-1', 'Contracting')
    fix.setAgentsInState([onAssignmentAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    await fix.recallAgents() // Act

    // Agent goes to InTransit state with Standby assignment
    fix.expectAgentCount(1)
    fix.expectAgentState('agent-1', 'InTransit')
    fix.expectAgentAssignment('agent-1', 'Standby')
  })

  test("click 'recall agents' button -> alert: agents in invalid states", async () => {
    const availableAgent = fix.newAgent('agent-1')
    fix.setAgentsInState([availableAgent])
    fix.selectAgents(['agent-1'])

    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.recallAgents() // Act

    fix.expectAgentCount(1)
    fix.expectAgentState('agent-1', 'Available') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on OnAssignment agents!')
  })

  // investigateLead tests
  test("click 'investigate lead' button -> happy path", async () => {
    const leadId = 'lead-criminal-orgs'
    const leadIntelCost = 10
    fix.setIntel(20)
    fix.selectLead(leadId)

    fix.renderPlayerActions()
    await fix.investigateLead() // Act

    fix.expectIntelAmount(20 - leadIntelCost)
    fix.expectLeadInvestigated(leadId, 1)
  })

  test("click 'investigate lead' button -> alert: insufficient intel", async () => {
    const leadId = 'lead-criminal-orgs'
    fix.setIntel(5) // Less than required (lead-criminal-orgs costs 10)
    fix.selectLead(leadId)

    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.investigateLead() // Act

    fix.expectIntelAmount(5) // Should remain unchanged
    fix.expectLeadInvestigated(leadId, 0) // Should not be investigated
    fix.expectPlayerActionsAlert('Not enough intel')
  })

  // deployAgentsToMission tests
  test("click 'deploy agents to active mission site' button -> happy path", async () => {
    const agentId = 'agent-1' as const
    const missionSiteId = 'mission-site-1' as const

    fix.buildAndSetInitialState({
      agents: [fix.newAgent(agentId)],
      missionSites: [fix.newMissionSite(missionSiteId)],
      intel: 100,
    })

    fix.selectAgents([agentId])
    fix.selectMissionSite(missionSiteId)

    fix.renderPlayerActions()
    await fix.deployAgents() // Act

    fix.expectAgentCount(1)
    fix.expectAgentsDeployed([agentId], missionSiteId)
  })

  test("click 'deploy agents to active mission site' button -> alert: agents in invalid states", async () => {
    const agentId = 'agent-1' as const
    const onAssignmentAgent = fix.newOnAssignmentAgent(agentId, 'Contracting')
    const missionSiteId = 'mission-site-1' as const

    const initialState = makeInitialState()
    initialState.agents = [onAssignmentAgent]
    initialState.intel = 100
    const missionSite: MissionSite = {
      id: missionSiteId,
      missionId: 'mission-apprehend-red-dawn',
      agentIds: [],
      state: 'Active',
      expiresIn: 3,
      enemies: [],
    }
    initialState.missionSites = [missionSite]
    fix.setInitialState(initialState)
    fix.selectAgents(['agent-1'])
    fix.selectMissionSite(missionSiteId)

    fix.renderPlayerActions()
    fix.expectPlayerActionsAlert({ hidden: true })

    await fix.deployAgents() // Act

    fix.expectAgentCount(1)
    fix.expectAgentState('agent-1', 'OnAssignment') // Should remain unchanged
    fix.expectAgentAssignment('agent-1', 'Contracting') // Should remain unchanged
    fix.expectPlayerActionsAlert('This action can be done only on available agents!')
  })
})
