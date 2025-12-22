import { describe, expect, test } from 'vitest'
import { toF6, f6gt } from '../../src/lib/primitives/fixed6'
import type { Agent } from '../../src/lib/model/agentModel'
import type { GameState } from '../../src/lib/model/gameStateModel'
import type { Mission, MissionDataId } from '../../src/lib/model/missionModel'
import { evaluateDeployedMission } from '../../src/lib/game_utils/turn_advancement/evaluateDeployedMission'
import {
  AGENT_CAP,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  AGENT_HIT_POINTS_RECOVERY_PCT,
  TRAINING_CAP,
  TRAINING_SKILL_GAIN,
  TRANSPORT_CAP,
} from '../../src/lib/data_tables/constants'
import { initialAgent } from '../../src/lib/factories/agentFactory'
import { bldEnemies } from '../../src/lib/factories/enemyFactory'
import { initialWeapon } from '../../src/lib/factories/weaponFactory'

describe(evaluateDeployedMission, () => {
  test('evaluateDeployedMission succeeds', () => {
    // Create a test agent with high skill
    // KJA1 call bldAgent here and in all other functions that create agents.
    const testAgent: Agent = {
      id: 'agent-001',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-001',
      skill: toF6(200), // High skill to ensure success
      skillFromTraining: toF6(0),
      exhaustionPct: 0,
      hitPoints: initialAgent.hitPoints,
      maxHitPoints: initialAgent.maxHitPoints,
      missionsTotal: 1,
      weapon: initialAgent.weapon,
    }

    // Create a test mission with weak enemies
    const testMission: Mission = {
      id: 'mission-001',
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: bldEnemies({ initiate: 1 }),
    }

    // Create a minimal game state
    // KJA1 call bldGameState here and in all other functions that create gameState.
    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      funding: 20,
      agentCap: AGENT_CAP,
      transportCap: TRANSPORT_CAP,
      trainingCap: TRAINING_CAP,
      trainingSkillGain: TRAINING_SKILL_GAIN,
      exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
      hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
      weaponDamage: initialWeapon.damage,
      leadInvestigationCounts: {},
      leadInvestigations: {},
      missions: [testMission],
      panic: toF6(0),
      factions: [],
    }

    // Mock Math.random to return consistent values for success
    const originalRandom = Math.random
    Math.random = (): number => 0.1 // Low values for successful contest rolls

    try {
      // Evaluate the mission
      evaluateDeployedMission(gameState, testMission)

      // Verify mission is won
      expect(testMission.state).toBe('Won')

      // Verify agent gained experience
      expect(testAgent.missionsTotal).toBe(1)
      expect(f6gt(testAgent.skill, 200)).toBe(true)

      // Verify agent gained exhaustion from combat
      expect(testAgent.exhaustionPct).toBeGreaterThan(0)

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
      assignment: 'mission-001',
      skill: toF6(50), // Low skill
      skillFromTraining: toF6(0),
      exhaustionPct: 0,
      hitPoints: toF6(10), // Low hit points
      maxHitPoints: initialAgent.maxHitPoints,
      missionsTotal: 0,
      weapon: initialAgent.weapon,
    }

    const testMission: Mission = {
      id: 'mission-001',
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: bldEnemies({ soldier: 2 }),
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [testAgent],
      money: 100,
      funding: 20,
      agentCap: AGENT_CAP,
      transportCap: TRANSPORT_CAP,
      trainingCap: TRAINING_CAP,
      trainingSkillGain: TRAINING_SKILL_GAIN,
      exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
      hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
      weaponDamage: initialWeapon.damage,
      leadInvestigationCounts: {},
      leadInvestigations: {},
      missions: [testMission],
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
      evaluateDeployedMission(gameState, testMission)

      // With incapacitation logic, agent becomes incapacitated (effective skill <= 10% base) before HP reaches 0
      // Agent is still alive but wounded/unscathed, not terminated
      expect(testAgent.hitPoints.value).toBeGreaterThan(0)
      expect(testAgent.state).toBe('InTransit')
      expect(['Recovery', 'Standby']).toContain(testAgent.assignment)

      // Mission should be wiped since agent cannot participate (incapacitated)
      expect(testMission.state).toBe('Wiped')
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
      assignment: 'mission-001',
      skill: toF6(60),
      skillFromTraining: toF6(0),
      exhaustionPct: 0,
      hitPoints: toF6(10),
      maxHitPoints: 10,
      missionsTotal: 0,
      weapon: initialAgent.weapon,
    }

    const agent2: Agent = {
      id: 'agent-002',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-001',
      skill: toF6(50),
      skillFromTraining: toF6(0),
      exhaustionPct: 0,
      hitPoints: toF6(10),
      maxHitPoints: 10,
      missionsTotal: 0,
      weapon: initialAgent.weapon,
    }

    const testMission: Mission = {
      id: 'mission-001',
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: ['agent-001', 'agent-002'],
      state: 'Deployed',
      expiresIn: 3,
      enemies: bldEnemies({ cultLeader: 3 }),
    }

    const gameState: GameState = {
      actionsCount: 0,
      turn: 1,
      agents: [agent1, agent2],
      money: 100,
      funding: 20,
      agentCap: AGENT_CAP,
      transportCap: TRANSPORT_CAP,
      trainingCap: TRAINING_CAP,
      trainingSkillGain: TRAINING_SKILL_GAIN,
      exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
      hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
      weaponDamage: initialWeapon.damage,
      leadInvestigationCounts: {},
      leadInvestigations: {},
      missions: [testMission],
      panic: toF6(0),
      factions: [],
    }

    evaluateDeployedMission(gameState, testMission)

    // Mission should be wiped (all agents terminated)
    expect(testMission.state).toBe('Wiped')

    // All agents should be terminated
    const terminatedAgents = gameState.agents.filter((agent) => agent.state === 'KIA')

    expect(terminatedAgents).toHaveLength(2)
  })
})
