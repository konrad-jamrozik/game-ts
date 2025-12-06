import type { Agent } from '../model/agentModel'
import type { MissionSiteId, LeadInvestigationId } from '../model/model'
import type { GameState } from '../model/gameStateModel'
import { toF6 } from '../primitives/fixed6'
import { newWeapon } from './weaponRuleset'
import { newEnemiesFromSpec } from './enemyRuleset'
import { getMissionById } from '../collections/missions'
import { AGENT_INITIAL_WEAPON_DAMAGE } from './constants'

// eslint-disable-next-line max-lines-per-function
function buildDebugAgents(
  missionSiteId: MissionSiteId,
  deepStateInvestigationId: LeadInvestigationId,
): { agents: Agent[]; onMissionAgentIds: string[]; deepStateInvestigationAgentIds: string[] } {
  let agentCounter = 0
  function nextId(): string {
    const id = agentCounter.toString().padStart(3, '0')
    agentCounter += 1
    return id
  }

  const onMissionAgentIds: string[] = []
  function makeAgent(agent: Omit<Agent, 'id' | 'weapon' | 'skillFromTraining'>): Agent {
    const id = `agent-${nextId()}`
    const built: Agent = {
      id,
      skillFromTraining: toF6(0),
      ...agent,
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE), // Add default weapon to all agents
    }
    if (built.state === 'OnMission' && built.assignment.startsWith('mission-site-')) {
      onMissionAgentIds.push(built.id)
    }
    return built
  }

  const agents: Agent[] = [
    makeAgent({
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(60),
      exhaustion: 0,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(140),
      exhaustion: 10,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 3,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(100),
      exhaustion: 0,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(80),
      exhaustion: 20,
      hitPoints: toF6(28),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(2),
      missionsTotal: 1,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Contracting',
      skill: toF6(90),
      exhaustion: 0,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 2,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnAssignment',
      assignment: 'Contracting',
      skill: toF6(110),
      exhaustion: 5,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 4,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnAssignment',
      assignment: 'Espionage',
      skill: toF6(120),
      exhaustion: 12,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 1,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustion: 8,
      hitPoints: toF6(10),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(20),
      missionsTotal: 2,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnMission',
      assignment: missionSiteId,
      skill: toF6(95),
      exhaustion: 15,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 1,
    }),
    makeAgent({
      turnHired: 1,
      turnTerminated: 1,
      state: 'Terminated',
      assignment: 'Sacked',
      skill: toF6(70),
      exhaustion: 0,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(30),
      exhaustion: 25,
      hitPoints: toF6(18),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(12),
      missionsTotal: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnMission',
      assignment: missionSiteId,
      skill: toF6(85),
      exhaustion: 7,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 1,
    }),
    // 2 agents in training
    makeAgent({
      turnHired: 1,
      state: 'InTraining',
      assignment: 'Training',
      skill: toF6(75),
      exhaustion: 0,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTraining',
      assignment: 'Training',
      skill: toF6(90),
      exhaustion: 3,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 1,
    }),
    // 2 agents investigating the deep state lead
    makeAgent({
      turnHired: 1,
      state: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(105),
      exhaustion: 5,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 2,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(115),
      exhaustion: 8,
      hitPoints: toF6(30),
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 3,
    }),
  ]

  const deepStateInvestigationAgentIds: string[] = []
  for (const agent of agents) {
    if (agent.assignment === deepStateInvestigationId) {
      deepStateInvestigationAgentIds.push(agent.id)
    }
  }

  return { agents, onMissionAgentIds, deepStateInvestigationAgentIds }
}

// Return only the overrides that should replace values in the normal initial state
export function makeDebugInitialOverrides(): Partial<GameState> {
  const stateBase: Partial<GameState> = {
    money: 1000,
    intel: 500,
    trainingCap: 4,
    leadInvestigationCounts: {
      'lead-red-dawn-profile': 1,
    },
  }

  const missionSiteId: MissionSiteId = 'mission-site-000'
  const deepStateInvestigationId: LeadInvestigationId = 'investigation-000'

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const {
    agents: debugAgents,
    onMissionAgentIds,
    deepStateInvestigationAgentIds,
  } = buildDebugAgents(missionSiteId, deepStateInvestigationId)

  stateBase.agents = debugAgents
  const mission = getMissionById('mission-apprehend-red-dawn')
  stateBase.missionSites = [
    {
      id: missionSiteId,
      missionId: 'mission-apprehend-red-dawn',
      agentIds: onMissionAgentIds,
      state: 'Deployed',
      expiresIn: mission.expiresIn,
      enemies: newEnemiesFromSpec(mission.enemyUnitsSpec),
    },
    {
      id: 'mission-site-001' as MissionSiteId,
      missionId: 'mission-apprehend-red-dawn',
      agentIds: [],
      state: 'Active',
      expiresIn: mission.expiresIn,
      enemies: newEnemiesFromSpec(mission.enemyUnitsSpec),
    },
  ]

  // Create lead investigation for deep state lead
  stateBase.leadInvestigations = {
    [deepStateInvestigationId]: {
      id: deepStateInvestigationId,
      leadId: 'lead-deep-state',
      accumulatedIntel: 0,
      agentIds: deepStateInvestigationAgentIds,
      startTurn: 1,
      state: 'Active',
    },
  }

  return stateBase
}
