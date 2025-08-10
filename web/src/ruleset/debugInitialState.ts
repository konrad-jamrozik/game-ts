import type { Agent, GameState } from '../model/model'

// Return only the overrides that should replace values in the normal initial state
export function makeDebugInitialOverrides(): Partial<GameState> {
  const stateBase: Partial<GameState> = {
    agents: [],
    money: 500,
    intel: 500,
    funding: 20,
    investigatedLeadIds: ['lead-red-dawn-profile'],
    leadInvestigationCounts: { 'lead-red-dawn-profile': 1 },
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
      assignment: 'Recovery',
      skill: 80,
      exhaustion: 20,
      hitPoints: 28,
      maxHitPoints: 30,
      recoveryTurns: 4,
      hitPointsLostBeforeRecovery: 2,
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
      hitPoints: 30,
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
      hitPoints: 28,
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
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
    },
    {
      id: 'agent-008',
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
    },
    {
      id: 'agent-009',
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
    },
  ]

  stateBase.agents = debugAgents
  // Ensure there is a mission site referenced by any OnMission agent
  const missionSiteExists = (stateBase.missionSites ?? []).some((missionSite) => missionSite.id === 'mission-site-000')
  if (!missionSiteExists) {
    stateBase.missionSites = [
      ...(stateBase.missionSites ?? []),
      {
        id: 'mission-site-000',
        missionId: 'mission-apprehend-red-dawn',
        agentIds: ['agent-007'],
        state: 'Deployed',
        expiresIn: 3,
        objectives: [
          { id: 'locate-target', difficulty: 20, fulfilled: false },
          { id: 'apprehend-target', difficulty: 30, fulfilled: false },
        ],
      },
    ]
  }

  return stateBase
}
