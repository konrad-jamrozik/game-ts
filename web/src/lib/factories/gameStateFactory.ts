/* eslint-disable unicorn/prefer-single-call */
import { toF6 } from '../primitives/fixed6'
import { bldFactions } from './factionFactory'
import type { GameState } from '../model/gameStateModel'
import { validateAgentInvariants } from '../model_utils/validateAgentInvariants'
import {
  AGENT_CAP,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  AGENT_HIT_POINTS_RECOVERY_PCT,
  TRAINING_CAP,
  TRAINING_SKILL_GAIN,
  TRANSPORT_CAP,
} from '../data_tables/constants'
import { bldAgent, initialAgent } from './agentFactory'
import type { Agent, AgentId } from '../model/agentModel'
import type { MissionId, MissionDataId } from '../model/missionModel'
import type { LeadId, LeadInvestigationId } from '../model/leadModel'
import { bldEnemies } from './enemyFactory'
import { getMissionDataById } from '../data_tables/dataTables'
import { assertDefined } from '../primitives/assertPrimitives'
import { initialWeapon } from './weaponFactory'

// KJA1 review / dedup gameStateFactory logic
// Notably, do not pass default values overriding init prototypes.
/**
 * Creates the initial game state
 * @param options - Options for creating the initial state
 * @param options.debug - If true, creates a debug state with diverse agents and missions
 */
export function bldInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  const normalGameState: GameState = {
    // Session
    turn: 1,
    actionsCount: 0,
    // Situation
    panic: toF6(0),
    factions: bldFactions(),
    // Assets
    money: 500,
    funding: 20,
    agentCap: AGENT_CAP,
    transportCap: TRANSPORT_CAP,
    trainingCap: TRAINING_CAP,
    trainingSkillGain: TRAINING_SKILL_GAIN,
    exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
    hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
    weaponDamage: initialWeapon.damage,
    agents: bldInitialAgents(),
    // Leads
    leadInvestigationCounts: {},
    leadInvestigations: {},
    // Missions
    missions: [],
    // Turn start report
    turnStartReport: undefined,
  }

  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = bldDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
    gameState = overwriteWithDebugOverrides(gameState)
  }

  gameState.agents.forEach((agent) => validateAgentInvariants(agent, gameState))

  return gameState
}

function bldInitialAgents(): GameState['agents'] {
  const agents: GameState['agents'] = []

  for (let index = 0; index < 4; index += 1) {
    agents.push(
      bldAgent({
        agentCount: index,
        weapon: initialAgent.weapon,
        state: 'Available',
        assignment: 'Standby',
      }),
    )
  }

  return agents
}

function bldDebugAgents(
  missionId: MissionId,
  deepStateInvestigationId: LeadInvestigationId,
): { agents: Agent[]; onMissionAgentIds: AgentId[]; deepStateInvestigationAgentIds: AgentId[] } {
  const onMissionAgentIds: AgentId[] = []
  const agents: Agent[] = []

  // Create agents using factory function
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(60),
      exhaustionPct: 0,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(140),
      exhaustionPct: 10,
      missionsTotal: 3,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(100),
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(80),
      exhaustionPct: 20,
      hitPoints: toF6(28),
      missionsTotal: 1,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'InTransit',
      assignment: 'Contracting',
      skill: toF6(90),
      missionsTotal: 2,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'OnAssignment',
      assignment: 'Contracting',
      skill: toF6(110),
      exhaustionPct: 5,
      missionsTotal: 4,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustionPct: 8,
      hitPoints: toF6(10),
      missionsTotal: 2,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustionPct: 120,
      hitPoints: toF6(1),
      missionsTotal: 1,
    }),
  )
  const agent9 = bldAgent({
    agentCount: agents.length,
    state: 'OnMission',
    assignment: missionId,
    skill: toF6(95),
    exhaustionPct: 15,
    missionsTotal: 1,
  })
  agents.push(agent9)
  onMissionAgentIds.push(agent9.id)
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'Sacked',
      assignment: 'Sacked',
      skill: toF6(70),
      turnTerminated: 1,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(30),
      exhaustionPct: 25,
      hitPoints: toF6(18),
    }),
  )
  const agent12 = bldAgent({
    agentCount: agents.length,
    state: 'OnMission',
    assignment: missionId,
    skill: toF6(85),
    exhaustionPct: 7,
    missionsTotal: 1,
  })
  agents.push(agent12)
  onMissionAgentIds.push(agent12.id)
  // 2 agents in training
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'InTraining',
      assignment: 'Training',
      skill: toF6(75),
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'InTraining',
      assignment: 'Training',
      skill: toF6(90),
      exhaustionPct: 3,
      missionsTotal: 1,
    }),
  )
  // 2 agents investigating the deep state lead
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(105),
      exhaustionPct: 5,
      missionsTotal: 2,
    }),
  )
  agents.push(
    bldAgent({
      agentCount: agents.length,
      state: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(115),
      exhaustionPct: 8,
      missionsTotal: 3,
    }),
  )

  const deepStateInvestigationAgentIds: AgentId[] = []
  for (const agent of agents) {
    if (agent.assignment === deepStateInvestigationId) {
      deepStateInvestigationAgentIds.push(agent.id)
    }
  }

  return { agents, onMissionAgentIds, deepStateInvestigationAgentIds }
}

/**
 * Return only the overrides that should replace values in the normal initial state
 */
function bldDebugInitialOverrides(): Partial<GameState> {
  const stateBase: Partial<GameState> = {
    money: 1000,
    trainingCap: 4,
    leadInvestigationCounts: {
      'lead-red-dawn-profile': 1,
      'lead-exalt-profile': 1,
      'lead-black-lotus-profile': 1,
    },
  }

  const missionId: MissionId = 'mission-000'
  const deepStateInvestigationId: LeadInvestigationId = 'investigation-000'

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const {
    agents: debugAgents,
    onMissionAgentIds,
    deepStateInvestigationAgentIds,
  } = bldDebugAgents(missionId, deepStateInvestigationId)

  stateBase.agents = debugAgents
  const missionData = getMissionDataById('missiondata-apprehend-red-dawn-member' as MissionDataId)
  // KJA3 use the factory instead, bldMission. But avoid having to have tempState just for next ID.
  stateBase.missions = [
    {
      id: missionId,
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: onMissionAgentIds,
      state: 'Deployed',
      expiresIn: missionData.expiresIn,
      enemies: bldEnemies(missionData),
    },
    {
      id: 'mission-001' as MissionId,
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: [],
      state: 'Active',
      expiresIn: missionData.expiresIn,
      enemies: bldEnemies(missionData),
    },
  ]

  // Create lead investigation for deep state lead
  stateBase.leadInvestigations = {
    [deepStateInvestigationId]: {
      id: deepStateInvestigationId,
      leadId: 'lead-deep-state' as LeadId,
      accumulatedIntel: 0,
      agentIds: deepStateInvestigationAgentIds,
      startTurn: 1,
      state: 'Active',
    },
  }

  return stateBase
}

function overwriteWithDebugOverrides(gameState: GameState): GameState {
  // Modify Red Dawn faction so next operation happens in 3 turns
  assertDefined(gameState.factions)
  const redDawnFaction = gameState.factions.find((faction) => faction.id === 'faction-red-dawn')
  if (redDawnFaction) {
    redDawnFaction.turnsUntilNextOperation = 3
  }
  return gameState
}
