import type { Agent, GameState } from '../model/model'

function buildDebugAgents(missionSiteId: string): { agents: Agent[]; onMissionAgentIds: string[] } {
  let agentCounter = 0
  function nextId(): string {
    const id = agentCounter.toString().padStart(3, '0')
    agentCounter += 1
    return id
  }

  const onMissionAgentIds: string[] = []
  function makeAgent(agent: Omit<Agent, 'id'>): Agent {
    const id = `agent-${nextId()}`
    const built: Agent = { id, ...agent }
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
    money: 500,
    intel: 500,
    funding: 20,
    leadInvestigationCounts: { 'lead-red-dawn-profile': 1 },
  }

  const missionSiteId = 'mission-site-000'

  // Enrich debug state with a diverse set of agents covering different states/assignments/attributes
  const { agents: debugAgents, onMissionAgentIds } = buildDebugAgents(missionSiteId)

  stateBase.agents = debugAgents
  stateBase.missionSites = [
    {
      id: missionSiteId,
      missionId: 'mission-apprehend-red-dawn',
      agentIds: onMissionAgentIds,
      state: 'Deployed',
      expiresIn: 3,
      objectives: [
        { id: 'locate-target', fulfilled: false },
        { id: 'apprehend-target', fulfilled: false },
      ],
    },
    {
      id: 'mission-site-001',
      missionId: 'mission-apprehend-red-dawn',
      agentIds: onMissionAgentIds,
      state: 'Active',
      expiresIn: 3,
      objectives: [
        { id: 'locate-target', fulfilled: false },
        { id: 'apprehend-target', fulfilled: false },
      ],
    },
  ]

  return stateBase
}
