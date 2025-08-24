import { describe, expect, test } from 'vitest'
import type { Agent, GameState, MissionSite } from '../src/lib/model/model'
import { updateDeployedMissionSite } from '../src/lib/turn_advancement/updateDeployedMissionSite'
import { AGENT_INITIAL_HIT_POINTS, AGENT_INITIAL_WEAPON_DAMAGE } from '../src/lib/model/ruleset/constants'
import { createWeapon } from '../src/lib/utils/weaponUtils'
import { createEnemiesFromSpec } from '../src/lib/utils/enemyUtils'

describe('deployedMissionSiteUpdate', () => {
  test('update a deployed mission site with successful combat', () => {
    // Create a test agent with high skill
    const testAgent: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: 200, // High skill to ensure success
      exhaustion: 0,
      hitPoints: AGENT_INITIAL_HIT_POINTS,
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      weapon: createWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    // Create a test mission site with weak enemies
    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn',
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: createEnemiesFromSpec('1 Initiate'), // Single weak enemy
    }

    // Create a minimal game state
    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      intel: 50,
      funding: 20,
      currentTurnTotalHireCost: 0,
      leadInvestigationCounts: {},
      missionSites: [testMissionSite],
      panic: 0,
      factions: [],
    }

    // Mock Math.random to return consistent values for success
    const originalRandom = Math.random
    Math.random = (): number => 0.1 // Low values for successful contest rolls

    try {
      // Update the mission site
      updateDeployedMissionSite(gameState, testMissionSite)

      // Verify mission site is successful
      expect(testMissionSite.state).toBe('Successful')

      // Verify agent gained experience
      expect(testAgent.missionsSurvived).toBe(1)
      expect(testAgent.skill).toBeGreaterThan(200)

      // Verify agent gained exhaustion from combat
      expect(testAgent.exhaustion).toBeGreaterThan(0)

      // Verify agent survived
      expect(testAgent.state).toBe('InTransit')
      expect(testAgent.assignment).toBe('Standby')
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
      hitPoints: 10, // Low hit points
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      weapon: createWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn',
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: createEnemiesFromSpec('2 Soldier'), // Strong enemies
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      intel: 50,
      funding: 20,
      currentTurnTotalHireCost: 0,
      leadInvestigationCounts: {},
      missionSites: [testMissionSite],
      panic: 0,
      factions: [],
    }

    // Mock Math.random to ensure agent loses combat
    const originalRandom = Math.random
    let callCount = 0
    Math.random = (): number => {
      callCount += 1
      // Agent fails attacks, enemies succeed
      // eslint-disable-next-line unicorn/prefer-ternary
      if (callCount % 2 === 1) {
        return 0.9 // High value = agent fails contest rolls
        // eslint-disable-next-line no-else-return
      } else {
        return 0.8 // High damage rolls for enemies
      }
    }

    try {
      updateDeployedMissionSite(gameState, testMissionSite)

      // Verify agent was terminated
      expect(testAgent.hitPoints).toBe(0)
      expect(testAgent.state).toBe('Terminated')
      expect(testAgent.assignment).toBe('KIA')

      // Mission should fail since agent was terminated
      expect(testMissionSite.state).toBe('Failed')
    } finally {
      Math.random = originalRandom
    }
  })

  test('handle mission failure with all agents terminated', () => {
    // Create agents with low skill and HP to ensure they get terminated
    const agent1: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: 60,
      exhaustion: 0,
      hitPoints: 20,
      maxHitPoints: 20,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      weapon: createWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    const agent2: Agent = {
      id: 'agent-002',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: 50,
      exhaustion: 0,
      hitPoints: 15,
      maxHitPoints: 15,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      weapon: createWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn',
      agentIds: ['agent-001', 'agent-002'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: createEnemiesFromSpec('3 Soldier, 2 Elite'), // Strong enemies
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [agent1, agent2],
      money: 100,
      intel: 50,
      funding: 20,
      currentTurnTotalHireCost: 0,
      leadInvestigationCounts: {},
      missionSites: [testMissionSite],
      panic: 0,
      factions: [],
    }

    updateDeployedMissionSite(gameState, testMissionSite)

    // Mission should fail
    expect(testMissionSite.state).toBe('Failed')

    // All agents should be terminated
    const terminatedAgents = gameState.agents.filter((agent) => agent.state === 'Terminated')

    expect(terminatedAgents).toHaveLength(2)
  })
})
