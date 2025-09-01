import type { Agent } from '../model/model'
import {
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_WEAPON_DAMAGE,
} from '../model/ruleset/constants'
import { createWeapon as newWeapon } from '../utils/weaponUtils'

/**
 * Creates a new hired agent with the standard initial values used in the hiring process.
 */

export function newHiredAgent(id: string, turnHired: number): Agent {
  return {
    id,
    turnHired,
    state: 'InTransit',
    assignment: 'Standby',
    skill: AGENT_INITIAL_SKILL,
    exhaustion: AGENT_INITIAL_EXHAUSTION,
    hitPoints: AGENT_INITIAL_HIT_POINTS,
    maxHitPoints: AGENT_INITIAL_HIT_POINTS,
    recoveryTurns: 0,
    hitPointsLostBeforeRecovery: 0,
    missionsSurvived: 0,
    weapon: newWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
  }
}
