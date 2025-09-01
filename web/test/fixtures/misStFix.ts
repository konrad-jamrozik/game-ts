import type { MissionSite, MissionSiteState } from '../../src/lib/model/model'
import { enFix } from './enFix'

export const misStFix = (() => {
  let missionSiteIdCounter = 0

  return {
    resetIdCounter(): void {
      missionSiteIdCounter = 0
    },

    default(): MissionSite {
      missionSiteIdCounter += 1
      return {
        id: `mission-site-${missionSiteIdCounter}`,
        missionId: 'mission-1',
        agentIds: [],
        state: 'Active',
        expiresIn: 'never',
        enemies: enFix.squad(),
      }
    },

    new(overrides?: Partial<MissionSite>): MissionSite {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    withState(state: MissionSiteState): MissionSite {
      return this.new({ state })
    },

    active(): MissionSite {
      return this.withState('Active')
    },

    deployed(agentIds: string[] = ['agent-1', 'agent-2']): MissionSite {
      return this.new({
        state: 'Deployed',
        agentIds,
      })
    },

    successful(): MissionSite {
      return this.new({
        state: 'Successful',
        enemies: [], // All enemies defeated
      })
    },

    failed(): MissionSite {
      return this.new({
        state: 'Failed',
        agentIds: [], // All agents lost
      })
    },

    expired(): MissionSite {
      return this.new({
        state: 'Expired',
      })
    },

    withEnemies(enemyCount = 4): MissionSite {
      return this.new({
        enemies: enFix.many(enemyCount),
      })
    },

    withEliteEnemies(): MissionSite {
      return this.new({
        enemies: enFix.eliteSquad(),
      })
    },

    expiring(turnsLeft = 2): MissionSite {
      return this.new({
        expiresIn: turnsLeft,
      })
    },

    forMission(missionId: string): MissionSite {
      return this.new({
        missionId,
      })
    },

    many(count: number, overrides?: Partial<MissionSite>): MissionSite[] {
      return Array.from({ length: count }, () => this.new(overrides))
    },
  }
})()
