import { describe, expect, test } from 'vitest'
import type { Agent, GameState, MissionSite } from '../src/model/model'
import { updateDeployedMissionSite } from '../src/model/updateDeployedMissionSite'
import { AGENT_INITIAL_HIT_POINTS, AGENT_INITIAL_SKILL } from '../src/ruleset/constants'

describe('deployedMissionSiteUpdate', () => {
  test('update a deployed mission site with successful objective completion', () => {
    // Create a test agent with high skill
    const testAgent: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: 150, // High skill to ensure success
      exhaustion: 0,
      hitPoints: AGENT_INITIAL_HIT_POINTS,
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    }

    // Create a test mission site with just one objective to ensure success
    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn',
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      objectives: [
        { id: 'locate-target', difficulty: 20, fulfilled: false },
        // Only one objective so a single agent can complete the mission
      ],
    }

    // Create a minimal game state
    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      intel: 50,
      funding: 20,
      hireCost: 0,
      nextAgentId: 2,
      nextMissionSiteId: 2,
      investigatedLeadIds: [],
      leadInvestigationCounts: {},
      missionSites: [testMissionSite],
      panic: 0,
      factions: [],
    }

    // Mock Math.random to return consistent values
    const originalRandom = Math.random
    Math.random = (): number => 0.95 // Return high values to ensure successful rolls

    try {
      // Update the mission site
      updateDeployedMissionSite(gameState, testMissionSite)

      // Verify mission site is successful
      expect(testMissionSite.state).toBe('Successful')

      // Verify at least one objective was fulfilled (with high skill and good rolls, should succeed)
      const fulfilledObjectives = testMissionSite.objectives.filter((objective) => objective.fulfilled)

      expect(fulfilledObjectives.length).toBeGreaterThan(0)

      // Verify agent gained experience
      expect(testAgent.missionsSurvived).toBe(1)
      expect(testAgent.skill).toBeGreaterThan(AGENT_INITIAL_SKILL)

      // Verify agent gained exhaustion
      expect(testAgent.exhaustion).toBeGreaterThan(0)
    } finally {
      // Restore Math.random
      Math.random = originalRandom
    }
  })

  test('handle agent termination correctly', () => {
    // Create a test agent with low skill and hit points
    const testAgent: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: 50, // Low skill
      exhaustion: 0,
      hitPoints: 1, // Very low hit points
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    }

    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn',
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      objectives: [{ id: 'locate-target', difficulty: 20, fulfilled: false }],
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      intel: 50,
      funding: 20,
      hireCost: 0,
      nextAgentId: 2,
      nextMissionSiteId: 2,
      investigatedLeadIds: [],
      leadInvestigationCounts: {},
      missionSites: [testMissionSite],
      panic: 0,
      factions: [],
    }

    // Mock Math.random to return low values for hit points roll
    const originalRandom = Math.random
    let callCount = 0
    Math.random = (): number => {
      callCount += 1
      return callCount === 1 ? 0.5 : 0.01 // Moderate roll for objective, very low for hit points
    }

    try {
      updateDeployedMissionSite(gameState, testMissionSite)

      // Verify agent was terminated (hit points should be 0)
      expect(testAgent.hitPoints).toBe(0)
      expect(testAgent.state).toBe('Terminated')
      expect(testAgent.assignment).toBe('Terminated')
    } finally {
      Math.random = originalRandom
    }
  })
})
