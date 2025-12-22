import { describe, expect, test } from 'vitest'
import { toF6, f6gt } from '../../src/lib/primitives/fixed6'
import type { MissionDataId, Mission } from '../../src/lib/model/missionModel'
import { evaluateDeployedMission } from '../../src/lib/game_utils/turn_advancement/evaluateDeployedMission'
import { bldAgent } from '../../src/lib/factories/agentFactory'
import { bldMission } from '../../src/lib/factories/missionFactory'
import { bldGameState } from '../../src/lib/factories/gameStateFactory'
import type { Agent } from '../../src/lib/model/agentModel'
import type { GameState } from '../../src/lib/model/gameStateModel'
import { rand } from '../../src/lib/primitives/rand'

describe(evaluateDeployedMission, () => {
  test('evaluateDeployedMission succeeds', () => {
    // Create a test agent with high skill
    const agent1 = bldAgent({
      id: 'agent-001',
      state: 'OnMission',
      assignment: 'mission-001',
      skill: toF6(200), // High skill to ensure success
      skillFromTraining: toF6(0),
      missionsTotal: 1,
    })

    // Create a test mission with weak enemies
    const mission1 = bldMission({
      id: 'mission-001',
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemyCounts: { initiate: 1 },
    })

    // Create a minimal game state
    const gameState = bldMinimalGameState([agent1], [mission1])

    // Override random labels: agent attacks always succeed, enemy attacks always fail
    rand.set('agent_attack_roll', 1)
    rand.set('enemy_attack_roll', 0)

    // Evaluate the mission
    evaluateDeployedMission(gameState, mission1)

    // Verify mission is won
    expect(mission1.state).toBe('Won')

    // Verify agent gained experience
    expect(agent1.missionsTotal).toBe(1)
    expect(f6gt(agent1.skill, 200)).toBe(true)

    // Verify agent gained exhaustion from combat
    expect(agent1.exhaustionPct).toBeGreaterThan(0)

    // Verify agent survived
    expect(agent1.state).toBe('InTransit')
    expect(agent1.assignment).toBe('Standby')
  })

  test('agent KIA', () => {
    // Create a test agent with low skill and hit points
    const agent1 = bldAgent({
      id: 'agent-001',
      state: 'OnMission',
      assignment: 'mission-001',
      skill: toF6(50), // Low skill
      skillFromTraining: toF6(0),
      maxHitPoints: 8, // Low hit points, so that max damage from 1 initiate kills the agent outright.
    })

    const mission1 = bldMission({
      id: 'mission-001',
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: ['agent-001'],
      state: 'Deployed',
      expiresIn: 3,
      enemyCounts: { initiate: 1 },
    })

    const gameState = bldMinimalGameState([agent1], [mission1])

    // Override random labels: agent attacks always fail, enemy attacks always succeed
    rand.set('agent_attack_roll', 0)
    rand.set('enemy_attack_roll', 1)

    evaluateDeployedMission(gameState, mission1)

    // With agent attacks always failing and enemy attacks always succeeding,
    // the agent will be terminated (HP reaches 0)
    expect(agent1.hitPoints.value).toBeLessThanOrEqual(0)
    expect(agent1.state).toBe('KIA')

    // Mission should be wiped since agent is terminated
    expect(mission1.state).toBe('Wiped')
  })

  test('failure: all agents terminated', () => {
    // Create agents with low skill and HP to ensure they get terminated
    const agent1 = bldAgent({
      id: 'agent-001',
      state: 'OnMission',
      assignment: 'mission-001',
      skill: toF6(60),
      skillFromTraining: toF6(0),
      hitPoints: toF6(10),
      maxHitPoints: 10,
    })

    const agent2 = bldAgent({
      id: 'agent-002',
      state: 'OnMission',
      assignment: 'mission-001',
      skill: toF6(50),
      skillFromTraining: toF6(0),
      hitPoints: toF6(10),
      maxHitPoints: 10,
    })

    const mission1 = bldMission({
      id: 'mission-001',
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: ['agent-001', 'agent-002'],
      state: 'Deployed',
      expiresIn: 3,
      enemyCounts: { cultLeader: 3 },
    })

    const gameState = bldMinimalGameState([agent1, agent2], [mission1])

    evaluateDeployedMission(gameState, mission1)

    // Mission should be wiped (all agents terminated)
    expect(mission1.state).toBe('Wiped')

    // All agents should be terminated
    const terminatedAgents = gameState.agents.filter((agent) => agent.state === 'KIA')

    expect(terminatedAgents).toHaveLength(2)
  })
})

function bldMinimalGameState(agents: Agent[], missions: Mission[]): GameState {
  return bldGameState({
    agents,
    money: 100,
    missions,
    factions: [],
  })
}
