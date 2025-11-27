import type { Agent, GameState } from '../../model/model'
import { bps } from '../../model/bps'
import { toF2 } from '../../model/fixed2'
import {
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_WEAPON_DAMAGE,
} from '../../model/ruleset/constants'
import { newWeapon } from '../../utils/weaponUtils'
import { asPlayerAction } from './asPlayerAction'

export const debugSetPanicToZero = asPlayerAction((state: GameState) => {
  state.panic = bps(0)
})

export const debugSetAllFactionsSuppressionTo1000Percent = asPlayerAction((state: GameState) => {
  // 1000% = 100,000 basis points
  for (const faction of state.factions) {
    faction.suppression = bps(100_000)
  }
})

export const debugAddMoney = asPlayerAction((state: GameState) => {
  state.money += 10_000
})

export const debugSpawn10Agents = asPlayerAction((state: GameState) => {
  const nextAgentNumericId = state.agents.length

  for (let index = 0; index < 10; index += 1) {
    const agentNumericId = nextAgentNumericId + index
    // KJA dedup agent ID with agent reducers
    const agentId = `agent-${agentNumericId.toString().padStart(3, '0')}`
    // Skills: 120, 140, 160, 180, 200, 220, 240, 260, 280, 300 (incrementing by 20)
    const skill = toF2(120 + index * 20)

    const newAgent: Agent = {
      id: agentId,
      turnHired: state.turn,
      state: 'Available',
      assignment: 'Standby',
      skill,
      exhaustion: AGENT_INITIAL_EXHAUSTION,
      hitPoints: AGENT_INITIAL_HIT_POINTS,
      maxHitPoints: AGENT_INITIAL_HIT_POINTS,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsTotal: 0,
      skillFromTraining: toF2(0),
      weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }

    state.agents.push(newAgent)
  }
})
