import type { Agent } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { toF6 } from '../../lib/primitives/fixed6'
import {
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_WEAPON_DAMAGE,
} from '../../lib/ruleset/constants'
import { newWeapon } from '../../lib/ruleset/weaponRuleset'
import { asPlayerAction } from '../reducer_utils/asPlayerAction'
import { formatAgentId } from '../reducer_utils/agentIdUtils'

export const debugSetPanicToZero = asPlayerAction((state: GameState) => {
  state.panic = toF6(0)
})

export const debugSetAllFactionsSuppressionTo1000Percent = asPlayerAction((state: GameState) => {
  // 1000% = 100,000 basis points
  for (const faction of state.factions) {
    faction.suppression = toF6(10) // 1000% = 10.0
  }
})

export const debugAddMoney = asPlayerAction((state: GameState) => {
  state.money += 10_000
})

export const debugSpawn10Agents = asPlayerAction((state: GameState) => {
  const nextAgentNumericId = state.agents.length

  for (let index = 0; index < 10; index += 1) {
    const agentNumericId = nextAgentNumericId + index
    const agentId = formatAgentId(agentNumericId)
    // Skills: 120, 140, 160, 180, 200, 220, 240, 260, 280, 300 (incrementing by 20)
    const skill = toF6(120 + index * 20)

    const newAgent: Agent = {
      id: agentId,
      turnHired: state.turn,
      state: 'Available',
      assignment: 'Standby',
      skill,
      exhaustion: AGENT_INITIAL_EXHAUSTION,
      hitPoints: toF6(AGENT_INITIAL_HIT_POINTS),
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      hitPointsLostBeforeRecovery: toF6(0),
      missionsTotal: 0,
      skillFromTraining: toF6(0),
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    state.agents.push(newAgent)
  }
})
