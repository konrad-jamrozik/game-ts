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

  // prettier-ignore
  type AgentRow = readonly [
    state: Agent['state'],
    assignmentType: 'Standby' | 'Recovery' | 'Contracting' | 'Training' | 'Sacked' | 'KIA' | 'MISSION' | 'DEEP_STATE',
    skill: number,
    exhaustionPct: number | '',
    hitPoints: number | '',
    missionsTotal: number | '',
    turnTerminated: number | '',
  ]

  // prettier-ignore
  const agentRows: AgentRow[] = [
    // State,             Assignment,     Skill, ExhPct, HitPts, Missions, TurnTerm
    ['Available',        'Standby',       60,    0,      '',     '',       ''],
    ['Available',        'Standby',       140,   10,     '',     3,        ''],
    ['Available',        'Standby',       100,   '',     '',     '',       ''],
    ['InTransit',        'Recovery',      80,    20,     28,     1,        ''],
    ['InTransit',        'Contracting',   90,    '',     '',     2,        ''],
    ['OnAssignment',     'Contracting',   110,   5,      '',     4,        ''],
    ['Recovering',       'Recovery',      100,   8,      10,     2,        ''],
    ['Recovering',       'Recovery',      100,   120,    1,      1,        ''],
    ['OnMission',        'MISSION',       95,    15,     '',     1,        ''],
    ['Sacked',           'Sacked',        70,    '',     '',     '',        1],
    ['InTransit',        'Recovery',      30,    25,     18,     '',       ''],
    ['OnMission',        'MISSION',       85,    7,      '',     1,        ''],
    ['InTraining',       'Training',      75,    '',     '',     '',       ''],
    ['InTraining',       'Training',      90,    3,      '',     1,        ''],
    ['OnAssignment',     'DEEP_STATE',    105,   5,      '',     2,        ''],
    ['KIA',              'KIA',           300,   '',      0,     '',       ''],
    ['OnAssignment',     'DEEP_STATE',    115,   8,      '',     3,        ''],
    
  ]

  for (const row of agentRows) {
    const [state, assignmentType, skill, exhaustionPct, hitPoints, missionsTotal, turnTerminated] = row

    const assignment: Agent['assignment'] =
      assignmentType === 'MISSION'
        ? missionId
        : assignmentType === 'DEEP_STATE'
          ? deepStateInvestigationId
          : assignmentType

    const agentParams: Parameters<typeof bldAgent>[0] = {
      agentCount: agents.length,
      state,
      assignment,
      skill: toF6(skill),
    }

    if (exhaustionPct !== '') {
      agentParams.exhaustionPct = exhaustionPct
    }
    if (hitPoints !== '') {
      agentParams.hitPoints = toF6(hitPoints)
    }
    if (missionsTotal !== '') {
      agentParams.missionsTotal = missionsTotal
    }
    if (turnTerminated !== '') {
      agentParams.turnTerminated = turnTerminated
    }

    const agent = bldAgent(agentParams)
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
