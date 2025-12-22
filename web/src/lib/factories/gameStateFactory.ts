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
import { bldMission } from './missionFactory'
import { initialWeapon } from './weaponFactory'
import { getFactionById } from '../model_utils/factionUtils'

// KJA1 review / dedup gameStateFactory logic
// Notably, do not pass default values overriding init prototypes.

/**
 * Prototype game state with all default values.
 * Used as a reference for initial game state properties.
 */
export const initialGameState: GameState = {
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

type CreateGameStateParams = Partial<GameState>
/**
 * Creates a new game state object.
 * Returns the created game state. Starts with initialGameState and applies optional overrides.
 */
export function bldGameState(gameStateOverrides: CreateGameStateParams = {}): GameState {
  // Start with initialGameState and override with provided values
  const gameState: GameState = {
    ...initialGameState,
    ...gameStateOverrides,
  }

  gameState.agents.forEach((agent) => validateAgentInvariants(agent, gameState))
  return gameState
}

/**
 * Creates the initial game state
 * @param options - Options for creating the initial state
 * @param options.debug - If true, creates a debug state with diverse agents and missions
 */
export function bldInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  if (useDebug) {
    const debugOverrides = bldDebugInitialOverrides()

    return bldGameState(debugOverrides)
  }

  return bldGameState()
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

/**
 * Return only the overrides that should replace values in the normal initial state
 */
function bldDebugInitialOverrides(): Partial<GameState> {
  const gameStateOverrides: Partial<GameState> & { factions: GameState['factions'] } = {
    money: 1000,
    trainingCap: 4,
    leadInvestigationCounts: {
      'lead-red-dawn-profile': 1,
      'lead-exalt-profile': 1,
      'lead-black-lotus-profile': 1,
    },
    factions: structuredClone(initialGameState.factions),
  }

  // Speed up when next Red Dawn operation happens
  const redDawnFaction = getFactionById(gameStateOverrides, 'faction-red-dawn')
  redDawnFaction.turnsUntilNextOperation = 3

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const missionId: MissionId = 'mission-000'
  const deepStateInvestigationId: LeadInvestigationId = 'investigation-000'
  const { debugAgents, onMissionAgentIds, deepStateInvestigationAgentIds } = bldDebugAgents(
    missionId,
    deepStateInvestigationId,
  )
  gameStateOverrides.agents = debugAgents

  gameStateOverrides.missions = [
    bldMission({
      id: missionId,
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: onMissionAgentIds,
      state: 'Deployed',
    }),
    bldMission({
      id: 'mission-001' as MissionId,
      missionDataId: 'missiondata-apprehend-red-dawn-member' as MissionDataId,
      agentIds: [],
      state: 'Active',
    }),
  ]

  // Create lead investigation for deep state lead
  gameStateOverrides.leadInvestigations = {
    [deepStateInvestigationId]: {
      id: deepStateInvestigationId,
      leadId: 'lead-deep-state' as LeadId,
      accumulatedIntel: 0,
      agentIds: deepStateInvestigationAgentIds,
      startTurn: 1,
      state: 'Active',
    },
  }

  return gameStateOverrides
}

function bldDebugAgents(
  missionId: MissionId,
  deepStateInvestigationId: LeadInvestigationId,
): { debugAgents: Agent[]; onMissionAgentIds: AgentId[]; deepStateInvestigationAgentIds: AgentId[] } {
  const onMissionAgentIds: AgentId[] = []
  const agents: Agent[] = []

  type BaseCreateAgentParams = Partial<Omit<Agent, 'id'>>

  const agentConfigs: BaseCreateAgentParams[] = [
    {
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(60),
      exhaustionPct: 0,
    },
    {
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(140),
      exhaustionPct: 10,
      missionsTotal: 3,
    },
    {
      state: 'Available',
      assignment: 'Standby',
      skill: toF6(100),
    },
    {
      state: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(80),
      exhaustionPct: 20,
      hitPoints: toF6(28),
      missionsTotal: 1,
    },
    {
      state: 'InTransit',
      assignment: 'Contracting',
      skill: toF6(90),
      missionsTotal: 2,
    },
    {
      state: 'OnAssignment',
      assignment: 'Contracting',
      skill: toF6(110),
      exhaustionPct: 5,
      missionsTotal: 4,
    },
    {
      state: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustionPct: 8,
      hitPoints: toF6(10),
      missionsTotal: 2,
    },
    {
      state: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustionPct: 120,
      hitPoints: toF6(1),
      missionsTotal: 1,
    },
    {
      state: 'OnMission',
      assignment: missionId,
      skill: toF6(95),
      exhaustionPct: 15,
      missionsTotal: 1,
    },
    {
      state: 'Sacked',
      assignment: 'Sacked',
      skill: toF6(70),
      turnTerminated: 1,
    },
    {
      state: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(30),
      exhaustionPct: 25,
      hitPoints: toF6(18),
    },
    {
      state: 'OnMission',
      assignment: missionId,
      skill: toF6(85),
      exhaustionPct: 7,
      missionsTotal: 1,
    },
    {
      state: 'InTraining',
      assignment: 'Training',
      skill: toF6(75),
    },
    {
      state: 'InTraining',
      assignment: 'Training',
      skill: toF6(90),
      exhaustionPct: 3,
      missionsTotal: 1,
    },
    {
      state: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(105),
      exhaustionPct: 5,
      missionsTotal: 2,
    },
    {
      state: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(115),
      exhaustionPct: 8,
      missionsTotal: 3,
    },
  ]

  for (const config of agentConfigs) {
    const agent = bldAgent({
      ...config,
      agentCount: agents.length,
    })
    agents.push(agent)

    if (agent.assignment === missionId) {
      onMissionAgentIds.push(agent.id)
    }
  }

  const deepStateInvestigationAgentIds: AgentId[] = []
  for (const agent of agents) {
    if (agent.assignment === deepStateInvestigationId) {
      deepStateInvestigationAgentIds.push(agent.id)
    }
  }

  return { debugAgents: agents, onMissionAgentIds, deepStateInvestigationAgentIds }
}
