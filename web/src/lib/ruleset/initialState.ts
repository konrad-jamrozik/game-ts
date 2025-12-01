import { toF6 } from '../utils/fixed6Utils'
import { factions } from '../collections/factions'
import type { Agent } from '../model/model'
import type { GameState } from '../model/gameStateModel'
import { validateAgentInvariants } from '../model_utils/validateAgentInvariants'
import { makeDebugInitialOverrides } from './debugInitialState'
import {
  AGENT_CAP,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_WEAPON_DAMAGE,
  AGENT_HIT_POINTS_RECOVERY_PCT,
  TRAINING_CAP,
  TRAINING_SKILL_GAIN,
  TRANSPORT_CAP,
} from './constants'
import { newWeapon } from '../domain_utils/weaponUtils'

const initialState: GameState = makeInitialState()

export default initialState

export function makeInitialState(options?: { debug?: boolean }): GameState {
  const useDebug = options?.debug === true

  const normalGameState: GameState = {
    // Session
    turn: 1,
    actionsCount: 0,
    // Situation
    panic: toF6(0),
    factions,
    // Assets
    money: 500,
    intel: 0,
    funding: 20,
    agentCap: AGENT_CAP,
    transportCap: TRANSPORT_CAP,
    trainingCap: TRAINING_CAP,
    trainingSkillGain: TRAINING_SKILL_GAIN,
    exhaustionRecovery: AGENT_EXHAUSTION_RECOVERY_PER_TURN,
    hitPointsRecoveryPct: AGENT_HIT_POINTS_RECOVERY_PCT,
    currentTurnTotalHireCost: 0,
    agents: buildInitialAgents(),
    // Leads
    leadInvestigationCounts: {},
    leadInvestigations: {},
    // Mission sites
    missionSites: [],
    // Turn start report
    turnStartReport: undefined,
  }

  let gameState: GameState = normalGameState
  if (useDebug) {
    const debugOverrides = makeDebugInitialOverrides()
    gameState = { ...gameState, ...debugOverrides }
  }

  gameState.agents.forEach((agent) => validateAgentInvariants(agent, gameState))

  return gameState
}

function buildInitialAgents(): Agent[] {
  let agentCounter = 0
  function nextId(): string {
    const id = agentCounter.toString().padStart(3, '0')
    agentCounter += 1
    return id
  }

  const agents: Agent[] = []
  for (let index = 0; index < 4; index += 1) {
    const agentId = `agent-${nextId()}`
    agents.push({
      id: agentId,
      turnHired: 1,
      state: 'Available',
      assignment: 'Standby',
      skill: AGENT_INITIAL_SKILL,
      exhaustion: AGENT_INITIAL_EXHAUSTION,
      hitPoints: AGENT_INITIAL_HIT_POINTS,
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsTotal: 0,
      skillFromTraining: toF6(0),
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    })
  }

  return agents
}
