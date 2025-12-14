import type { Agent } from '../../src/lib/model/agentModel'
import { bldAgentWithoutState } from '../../src/lib/game_utils/agentFactory'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { wpnFix } from './weaponFixture'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../../src/lib/ruleset/constants'

export const agFix = (() => {
  let agentIdCounter = 0

  const agentFixture = {
    resetIdCounter(): void {
      agentIdCounter = 0
    },

    default(): Agent {
      agentIdCounter += 1
      return bldAgentWithoutState({
        id: `agent-${agentIdCounter}`,
        turnHired: 1,
        weaponDamage: AGENT_INITIAL_WEAPON_DAMAGE,
        agentState: 'InTransit',
        assignment: 'Standby',
      })
    },

    withSuperWeapon(): Agent {
      return this.bld({
        weapon: wpnFix.bld({ constDamage: 100 }),
      })
    },

    bld(overrides?: Partial<Agent>): Agent {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    exhausted(exhaustion = 50): Agent {
      return this.bld({
        exhaustionPct: exhaustion,
      })
    },

    wounded(hitPointsLost = 10): Agent {
      const maxHitPoints = 30
      return this.bld({
        hitPoints: toF6(Math.max(0, maxHitPoints - hitPointsLost)),
        maxHitPoints,
      })
    },
  }

  return agentFixture
})()
