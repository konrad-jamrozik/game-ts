import { factions } from '../collections/factions'
import type { Agent, GameState } from '../model/model'

const initialAssets: Pick<
  GameState,
  'agents' | 'money' | 'intel' | 'funding' | 'investigatedLeadIds' | 'leadInvestigationCounts'
> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeadIds: [],
  leadInvestigationCounts: {},
}

export const debugInitialAssets = {
  ...initialAssets,
  intel: 500,
  investigatedLeadIds: ['lead-red-dawn-profile'],
  leadInvestigationCounts: { 'lead-red-dawn-profile': 1 },
}

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true
  const assets = useDebug ? debugInitialAssets : initialAssets
  const stateBase: GameState = {
    turn: 1,
    actionsCount: 0,
    nextAgentId: 0,
    nextMissionSiteId: 0,
    hireCost: 50,
    panic: 0,
    factions,
    missionSites: [],
    ...assets,
  }

  if (!useDebug) {
    return stateBase
  }

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const debugAgents: Agent[] = [
    {
      id: 'agent-000',
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
    },
    {
      id: 'agent-001',
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
    },
    {
      id: 'agent-002',
      turnHired: 1,
      state: 'InTransit',
      assignment: 'Standby',
      skill: 80,
      exhaustion: 20,
      hitPoints: 28,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 1,
    },
    {
      id: 'agent-003',
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
    },
    {
      id: 'agent-004',
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
    },
    {
      id: 'agent-005',
      turnHired: 1,
      state: 'OnAssignment',
      assignment: 'Espionage',
      skill: 120,
      exhaustion: 12,
      hitPoints: 29,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 1,
    },
    {
      id: 'agent-006',
      turnHired: 1,
      state: 'Recovering',
      assignment: 'Recovery',
      skill: 100,
      exhaustion: 8,
      hitPoints: 20,
      maxHitPoints: 30,
      recoveryTurns: 3,
      hitPointsLostBeforeRecovery: 10,
      missionsSurvived: 2,
    },
    {
      id: 'agent-007',
      turnHired: 1,
      state: 'OnMission',
      assignment: 'mission-site-000',
      skill: 95,
      exhaustion: 15,
      hitPoints: 24,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    },
    {
      id: 'agent-008',
      turnHired: 1,
      state: 'Terminated',
      assignment: 'Standby',
      skill: 70,
      exhaustion: 0,
      hitPoints: 0,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    },
    {
      id: 'agent-009',
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: 30,
      exhaustion: 25,
      hitPoints: 18,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    },
  ]

  stateBase.agents = debugAgents
  stateBase.nextAgentId = debugAgents.length
  return stateBase
}

const initialState: GameState = makeInitialState()

export default initialState
