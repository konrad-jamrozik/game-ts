import type { Agent } from '../../src/lib/model/model'
import { newHiredAgent } from '../../src/lib/slices/reducers/agentReducers'

export const agFix = (() => {
  let agentIdCounter = 0

  const agentFixture = {
    resetIdCounter(): void {
      agentIdCounter = 0
    },

    default(): Agent {
      agentIdCounter += 1
      return newHiredAgent(`agent-${agentIdCounter}`, 1)
    },

    new(overrides?: Partial<Agent>): Agent {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    exhausted(exhaustion = 50): Agent {
      return this.new({
        exhaustion,
      })
    },

    wounded(hitPointsLost = 10): Agent {
      const maxHitPoints = 30
      return this.new({
        hitPoints: Math.max(0, maxHitPoints - hitPointsLost),
        maxHitPoints,
      })
    },
  }

  return agentFixture
})()
