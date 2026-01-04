import { toF6 } from '../primitives/fixed6'
import type { GameState } from '../model/gameStateModel'
import { bldAgent } from './agentFactory'
import type { Agent } from '../model/agentModel'
import type { AgentId, LeadId, LeadInvestigationId, MissionDataId, MissionId } from '../model/modelIds'
import { bldMission } from './missionFactory'
import { getFactionById } from '../model_utils/factionUtils'
import { bldLeadInvestigation } from './leadInvestigationFactory'

/**
 * Return only the overrides that should replace values in the normal initial state
 */
export function bldDebugGameStateOverrides(initialGameState: GameState): Partial<GameState> {
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
  redDawnFaction.turnsAtCurrentLevel = 40

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const missionId: MissionId = 'mission-000'
  const deepStateInvestigationId: LeadInvestigationId = 'investigation-000'
  const { aliveAgents, terminatedAgents, totalAgentsHired, onMissionAgentIds, deepStateInvestigationAgentIds } =
    bldDebugAgents(missionId, deepStateInvestigationId)
  gameStateOverrides.agents = aliveAgents
  gameStateOverrides.terminatedAgents = terminatedAgents
  gameStateOverrides.totalAgentsHired = totalAgentsHired

  gameStateOverrides.missions = bldDebugMissions(missionId, onMissionAgentIds)

  gameStateOverrides.leadInvestigations = bldDebugLeadInvestigations(
    deepStateInvestigationId,
    deepStateInvestigationAgentIds,
  )

  return gameStateOverrides
}

type DebugAgentsResult = {
  aliveAgents: Agent[]
  terminatedAgents: Agent[]
  totalAgentsHired: number
  onMissionAgentIds: AgentId[]
  deepStateInvestigationAgentIds: AgentId[]
}

function bldDebugAgents(missionId: MissionId, deepStateInvestigationId: LeadInvestigationId): DebugAgentsResult {
  const onMissionAgentIds: AgentId[] = []
  const allAgents: Agent[] = []

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
      ['Contracting',      'Contracting',   110,   5,      '',     4,        ''],
      ['Recovering',       'Recovery',      100,   8,      10,     2,        ''],
      ['Recovering',       'Recovery',      100,   120,    1,      1,        ''],
      ['OnMission',        'MISSION',       95,    15,     '',     1,        ''],
      ['Sacked',           'Sacked',        70,    '',     '',     '',        1],
      ['InTransit',        'Recovery',      30,    25,     18,     '',       ''],
      ['OnMission',        'MISSION',       85,    7,      '',     1,        ''],
      ['InTraining',       'Training',      75,    '',     '',     '',       ''],
      ['InTraining',       'Training',      90,    3,      '',     1,        ''],
      ['Investigating',    'DEEP_STATE',    105,   5,      '',     2,        ''],
      ['KIA',              'KIA',           300,   '',      0,     '',       ''],
      ['Investigating',    'DEEP_STATE',    115,   8,      '',     3,        ''],
      ['OnMission',        'MISSION',       200,   0,      '',     5,        ''],
      
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
      agentCount: allAgents.length,
      state,
      assignment,
      skill: toF6(skill),
    }

    if (exhaustionPct !== '') {
      agentParams.exhaustionPct = toF6(exhaustionPct)
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
    allAgents.push(agent)

    if (agent.assignment === missionId) {
      onMissionAgentIds.push(agent.id)
    }
  }

  const deepStateInvestigationAgentIds: AgentId[] = []
  for (const agent of allAgents) {
    if (agent.assignment === deepStateInvestigationId) {
      deepStateInvestigationAgentIds.push(agent.id)
    }
  }

  // Separate alive agents from terminated agents
  const aliveAgents = allAgents.filter((a) => a.state !== 'KIA' && a.state !== 'Sacked')
  const terminatedAgents = allAgents.filter((a) => a.state === 'KIA' || a.state === 'Sacked')

  return {
    aliveAgents,
    terminatedAgents,
    totalAgentsHired: allAgents.length,
    onMissionAgentIds,
    deepStateInvestigationAgentIds,
  }
}

function bldDebugMissions(missionId: MissionId, onMissionAgentIds: AgentId[]): GameState['missions'] {
  return [
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
}

function bldDebugLeadInvestigations(
  deepStateInvestigationId: LeadInvestigationId,
  deepStateInvestigationAgentIds: AgentId[],
): GameState['leadInvestigations'] {
  return {
    [deepStateInvestigationId]: bldLeadInvestigation({
      id: deepStateInvestigationId,
      leadId: 'lead-deep-state' as LeadId,
      agentIds: deepStateInvestigationAgentIds,
    }),
  }
}
