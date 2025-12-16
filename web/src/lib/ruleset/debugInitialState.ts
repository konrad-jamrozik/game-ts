/* eslint-disable unicorn/prefer-single-call */
/* eslint-disable unicorn/no-immediate-mutation */
import type { Agent, AgentId } from '../model/agentModel'
import type { MissionId, MissionDefId } from '../model/missionModel'
import type { LeadId, LeadInvestigationId } from '../model/leadModel'
import type { GameState } from '../model/gameStateModel'
import { toF6 } from '../primitives/fixed6'
import { bldEnemies } from './enemyRuleset'
import { getMissionDefById } from '../collections/missions'
import { AGENT_INITIAL_WEAPON_DAMAGE } from './constants'
import { assertDefined } from '../primitives/assertPrimitives'
import { bldAgentWithoutState } from '../game_utils/agentFactory'

function bldDebugAgents(
  missionId: MissionId,
  deepStateInvestigationId: LeadInvestigationId,
): { agents: Agent[]; onMissionAgentIds: AgentId[]; deepStateInvestigationAgentIds: AgentId[] } {
  let agentCounter = 0
  function nextId(): string {
    const id = agentCounter.toString().padStart(3, '0')
    agentCounter += 1
    return id
  }

  const onMissionAgentIds: AgentId[] = []
  const agents: Agent[] = []

  // Create agents using factory function
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'Available',
      assignment: 'Standby',
      skill: toF6(60),
      exhaustionPct: 0,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'Available',
      assignment: 'Standby',
      skill: toF6(140),
      exhaustionPct: 10,
      missionsTotal: 3,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'Available',
      assignment: 'Standby',
      skill: toF6(100),
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(80),
      exhaustionPct: 20,
      hitPoints: toF6(28),
      hitPointsLostBeforeRecovery: toF6(2),
      missionsTotal: 1,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'InTransit',
      assignment: 'Contracting',
      skill: toF6(90),
      missionsTotal: 2,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'OnAssignment',
      assignment: 'Contracting',
      skill: toF6(110),
      exhaustionPct: 5,
      missionsTotal: 4,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustionPct: 8,
      hitPoints: toF6(10),
      hitPointsLostBeforeRecovery: toF6(20),
      missionsTotal: 2,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'Recovering',
      assignment: 'Recovery',
      skill: toF6(100),
      exhaustionPct: 120,
      hitPoints: toF6(1),
      hitPointsLostBeforeRecovery: toF6(29),
      missionsTotal: 1,
    }),
  )
  const agent9 = bldAgentWithoutState({
    id: `agent-${nextId()}`,
    turnHired: 1,
    weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
    agentState: 'OnMission',
    assignment: missionId,
    skill: toF6(95),
    exhaustionPct: 15,
    missionsTotal: 1,
  })
  agents.push(agent9)
  onMissionAgentIds.push(agent9.id)
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'Sacked',
      assignment: 'Sacked',
      skill: toF6(70),
      turnTerminated: 1,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'InTransit',
      assignment: 'Recovery',
      skill: toF6(30),
      exhaustionPct: 25,
      hitPoints: toF6(18),
      hitPointsLostBeforeRecovery: toF6(12),
    }),
  )
  const agent12 = bldAgentWithoutState({
    id: `agent-${nextId()}`,
    turnHired: 1,
    weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
    agentState: 'OnMission',
    assignment: missionId,
    skill: toF6(85),
    exhaustionPct: 7,
    missionsTotal: 1,
  })
  agents.push(agent12)
  onMissionAgentIds.push(agent12.id)
  // 2 agents in training
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'InTraining',
      assignment: 'Training',
      skill: toF6(75),
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'InTraining',
      assignment: 'Training',
      skill: toF6(90),
      exhaustionPct: 3,
      missionsTotal: 1,
    }),
  )
  // 2 agents investigating the deep state lead
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'OnAssignment',
      assignment: deepStateInvestigationId,
      skill: toF6(105),
      exhaustionPct: 5,
      missionsTotal: 2,
    }),
  )
  agents.push(
    bldAgentWithoutState({
      id: `agent-${nextId()}`,
      turnHired: 1,
      weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
      agentState: 'OnAssignment',
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

// Return only the overrides that should replace values in the normal initial state
export function bldDebugInitialOverrides(): Partial<GameState> {
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
  const missionDef = getMissionDefById('missiondef-apprehend-red-dawn-member' as MissionDefId)
  // KJA3 use the factory instead, bldMission. But avoid having to have tempState just for next ID.
  stateBase.missions = [
    {
      id: missionId,
      missionDefId: 'missiondef-apprehend-red-dawn-member' as MissionDefId,
      agentIds: onMissionAgentIds,
      state: 'Deployed',
      expiresIn: missionDef.expiresIn,
      enemies: bldEnemies(missionDef.enemyCounts),
    },
    {
      id: 'mission-001' as MissionId,
      missionDefId: 'missiondef-apprehend-red-dawn-member' as MissionDefId,
      agentIds: [],
      state: 'Active',
      expiresIn: missionDef.expiresIn,
      enemies: bldEnemies(missionDef.enemyCounts),
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

export function overwriteWithDebugOverrides(gameState: GameState): GameState {
  // Modify Red Dawn faction so next operation happens in 3 turns
  assertDefined(gameState.factions)
  const redDawnFaction = gameState.factions.find((faction) => faction.id === 'faction-red-dawn')
  if (redDawnFaction) {
    redDawnFaction.turnsUntilNextOperation = 3
  }
  return gameState
}
