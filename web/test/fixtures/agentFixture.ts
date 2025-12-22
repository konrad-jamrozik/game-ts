import type { Agent, AgentId } from '../../src/lib/model/agentModel'
import { bldAgent } from '../../src/lib/factories/agentFactory'
import { toF6 } from '../../src/lib/primitives/fixed6'
import { wpnFix } from './weaponFixture'

export const agFix = (() => {
  let agentIdCounter = 0

  const agentFixture = {
    resetIdCounter(): void {
      agentIdCounter = 0
    },

    default(): Agent {
      agentIdCounter += 1
      return bldAgent({
        id: `agent-${agentIdCounter}` as AgentId,
        state: 'InTransit',
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
