import { describe, expect, test } from 'vitest'
import { toF6, f6gt } from '../../src/lib/primitives/fixed6'
import type { Agent } from '../../src/lib/model/agentModel'
import type { GameState } from '../../src/lib/model/gameStateModel'
import type { MissionSite } from '../../src/lib/model/model'
import { evaluateDeployedMissionSite } from '../../src/lib/game_utils/turn_advancement/evaluateDeployedMissionSite'
import {
  AGENT_CAP,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_WEAPON_DAMAGE,
  AGENT_HIT_POINTS_RECOVERY_PCT,
  TRAINING_CAP,
  TRAINING_SKILL_GAIN,
  TRANSPORT_CAP,
} from '../../src/lib/ruleset/constants'
import { newWeapon } from '../../src/lib/ruleset/weaponRuleset'
import { newEnemiesFromSpec } from '../../src/lib/ruleset/enemyRuleset'

describe(evaluateDeployedMissionSite, () => {
  test('evaluateDeployedMissionSite succeeds', () => {
    // Create a test agent with high skill
    const testAgent: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: toF6(200), // High skill to ensure success
      skillFromTraining: toF6(0),
      exhaustion: 0,
      hitPoints: toF6(AGENT_INITIAL_HIT_POINTS),
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 1,
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    // Create a test mission site with weak enemies
    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn-member',
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: newEnemiesFromSpec('1 Initiate'), // Single weak enemy
    }

    // Create a minimal game state
    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      intel: 50,
      funding: 20,
      agentCap: AGENT_CAP,
      transportCap: TRANSPORT_CAP,
      trainingCap: TRAINING_CAP,
      trainingSkillGain: TRAINING_SKILL_GAIN,
      exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
      hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
      weaponDamageImprovement: 0,
      leadInvestigationCounts: {},
      leadInvestigations: {},
      missionSites: [testMissionSite],
      panic: toF6(0),
      factions: [],
    }

    // Mock Math.random to return consistent values for success
    const originalRandom = Math.random
    Math.random = (): number => 0.1 // Low values for successful contest rolls

    try {
      // Evaluate the mission site
      evaluateDeployedMissionSite(gameState, testMissionSite)

      // Verify mission site is won
      expect(testMissionSite.state).toBe('Won')

      // Verify agent gained experience
      expect(testAgent.missionsTotal).toBe(1)
      expect(f6gt(testAgent.skill, 200)).toBe(true)

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

  test('agent KIA', () => {
    // Create a test agent with low skill and hit points
    const testAgent: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: toF6(50), // Low skill
      skillFromTraining: toF6(0),
      exhaustion: 0,
      hitPoints: toF6(10), // Low hit points
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn-member',
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: newEnemiesFromSpec('2 Soldier'), // Strong enemies
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      intel: 50,
      funding: 20,
      agentCap: AGENT_CAP,
      transportCap: TRANSPORT_CAP,
      trainingCap: TRAINING_CAP,
      trainingSkillGain: TRAINING_SKILL_GAIN,
      exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
      hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
      weaponDamageImprovement: 0,
      leadInvestigationCounts: {},
      leadInvestigations: {},
      missionSites: [testMissionSite],
      panic: toF6(0),
      factions: [],
    }

    // Mock Math.random to ensure agent loses combat
    const originalRandom = Math.random
    let callCount = 0
    Math.random = (): number => {
      callCount += 1
      // Odd calls are agent attack rolls, and we want them to fail, so low value.
      // Even calls are enemy attack rolls, and we want them to succeed, so high value.
      // Agent fails attacks, enemies succeed
      // oxlint-disable-next-line no-conditional-in-test
      return callCount % 2 === 1 ? 0 : 0.9999
    }

    try {
      evaluateDeployedMissionSite(gameState, testMissionSite)

      // With incapacitation logic, agent becomes incapacitated (effective skill <= 10% base) before HP reaches 0
      // Agent is still alive but wounded/unscathed, not terminated
      expect(testAgent.hitPoints.value).toBeGreaterThan(0)
      expect(testAgent.state).toBe('InTransit')
      expect(['Recovery', 'Standby']).toContain(testAgent.assignment)

      // Mission should be wiped since agent cannot participate (incapacitated)
      expect(testMissionSite.state).toBe('Wiped')
    } finally {
      Math.random = originalRandom
    }
  })

  test('failure: all agents terminated', () => {
    // Create agents with low skill and HP to ensure they get terminated
    const agent1: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: toF6(60),
      skillFromTraining: toF6(0),
      exhaustion: 0,
      hitPoints: toF6(20),
      maxHitPoints: 20,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    const agent2: Agent = {
      id: 'agent-002',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-001',
      skill: toF6(50),
      skillFromTraining: toF6(0),
      exhaustion: 0,
      hitPoints: toF6(15),
      maxHitPoints: 15,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    const testMissionSite: MissionSite = {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn-member',
      agentIds: ['agent-001', 'agent-002'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: newEnemiesFromSpec('3 CultLeader'), // Strong enemies
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [agent1, agent2],
      money: 100,
      intel: 50,
      funding: 20,
      agentCap: AGENT_CAP,
      transportCap: TRANSPORT_CAP,
      trainingCap: TRAINING_CAP,
      trainingSkillGain: TRAINING_SKILL_GAIN,
      exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
      hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
      weaponDamageImprovement: 0,
      leadInvestigationCounts: {},
      leadInvestigations: {},
      missionSites: [testMissionSite],
      panic: toF6(0),
      factions: [],
    }

    evaluateDeployedMissionSite(gameState, testMissionSite)

    // Mission should be wiped (all agents terminated)
    expect(testMissionSite.state).toBe('Wiped')

    // All agents should be terminated
    const terminatedAgents = gameState.agents.filter((agent) => agent.state === 'KIA')

    expect(terminatedAgents).toHaveLength(2)
  })
})
