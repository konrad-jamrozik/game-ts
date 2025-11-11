import type { Agent, GameState, MissionSiteId } from '../model'
import { newWeapon } from '../../utils/weaponUtils'
import { newEnemiesFromSpec } from '../../utils/enemyUtils'
import { getMissionById } from '../../collections/missions'
import { AGENT_INITIAL_WEAPON_DAMAGE } from './constants'

function buildDebugAgents(missionSiteId: MissionSiteId): { agents: Agent[]; onMissionAgentIds: string[] } {
  let agentCounter = 0
  function nextId(): string {
    const id = agentCounter.toString().padStart(3, '0')
    agentCounter += 1
    return id
  }

  const onMissionAgentIds: string[] = []
  function makeAgent(agent: Omit<Agent, 'id' | 'weapon'>): Agent {
    const id = `agent-${nextId()}`
    const built: Agent = {
      id,
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
      skill: 60,
      exhaustion: 0,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: 140,
      exhaustion: 10,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 3,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: 100,
      exhaustion: 0,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Recovery',
      skill: 80,
      exhaustion: 20,
      hitPoints: 28,
      maxHitPoints: 30,
      recoveryTurns: 4,
      hitPointsLostBeforeRecovery: 2,
      missionsSurvived: 1,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Contracting',
      skill: 90,
      exhaustion: 0,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 2,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnAssignment',
      assignment: 'Contracting',
      skill: 110,
      exhaustion: 5,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 4,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnAssignment',
      assignment: 'Espionage',
      skill: 120,
      exhaustion: 12,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 1,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Recovering',
      assignment: 'Recovery',
      skill: 100,
      exhaustion: 8,
      hitPoints: 28,
      maxHitPoints: 30,
      recoveryTurns: 3,
      hitPointsLostBeforeRecovery: 10,
      missionsSurvived: 2,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnMission',
      assignment: missionSiteId,
      skill: 95,
      exhaustion: 15,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'Terminated',
      assignment: 'KIA',
      skill: 70,
      exhaustion: 0,
      hitPoints: 0,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Recovery',
      skill: 30,
      exhaustion: 25,
      hitPoints: 18,
      maxHitPoints: 30,
      recoveryTurns: 20,
      hitPointsLostBeforeRecovery: 12,
      missionsSurvived: 0,
    }),
    makeAgent({
      turnHired: 1,
      state: 'OnMission',
      assignment: missionSiteId,
      skill: 85,
      exhaustion: 7,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 1,
    }),
  ]

  return { agents, onMissionAgentIds }
}

// Return only the overrides that should replace values in the normal initial state
export function makeDebugInitialOverrides(): Partial<GameState> {
  const stateBase: Partial<GameState> = {
    agents: [],
    money: 1000,
    intel: 500,
    funding: 20,
    leadInvestigationCounts: {},
  }

  const missionSiteId: MissionSiteId = 'mission-site-000'

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const { agents: debugAgents, onMissionAgentIds } = buildDebugAgents(missionSiteId)

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

  return stateBase
}
