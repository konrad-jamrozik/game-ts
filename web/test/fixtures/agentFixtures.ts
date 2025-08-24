import { faker } from '@faker-js/faker'
import type { Agent, AgentState, AgentAssignment } from '../../src/lib/model/model'
import { WeaponFixture } from './weaponFixtures'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../../src/lib/model/ruleset/constants'
import { createWeapon } from '../../src/lib/utils/weaponUtils'

export class AgentFixture {
  private static idCounter = 0

  static resetIdCounter(): void {
    this.idCounter = 0
  }

  static default(): Agent {
    return {
      id: `agent-${++this.idCounter}`,
      turnHired: 1,
      skill: 100,
      exhaustion: 0,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      state: 'Available',
      assignment: 'Standby',
      weapon: createWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
    }
  }

  static new(overrides?: Partial<Agent>): Agent {
    return {
      ...this.default(),
      ...overrides,
    }
  }

  static random(): Agent {
    const maxHitPoints = faker.number.int({ min: 20, max: 40 })
    const hitPoints = faker.number.int({ min: 0, max: maxHitPoints })
    
    return this.new({
      id: faker.string.uuid(),
      turnHired: faker.number.int({ min: 1, max: 100 }),
      skill: faker.number.int({ min: 50, max: 150 }),
      exhaustion: faker.number.int({ min: 0, max: 100 }),
      hitPoints,
      maxHitPoints,
      recoveryTurns: faker.number.int({ min: 0, max: 5 }),
      hitPointsLostBeforeRecovery: faker.number.int({ min: 0, max: maxHitPoints }),
      missionsSurvived: faker.number.int({ min: 0, max: 10 }),
      weapon: WeaponFixture.random(),
    })
  }

  static withState(state: AgentState, assignment?: AgentAssignment): Agent {
    const validAssignment = assignment ?? (state === 'Recovering' ? 'Recovery' : 'Standby')
    return this.new({
      state,
      assignment: validAssignment,
    })
  }

  static available(): Agent {
    return this.withState('Available', 'Standby')
  }

  static recovering(recoveryTurns = 3): Agent {
    return this.new({
      state: 'Recovering',
      assignment: 'Recovery',
      recoveryTurns,
      hitPoints: 15,
      maxHitPoints: 30,
      hitPointsLostBeforeRecovery: 15,
    })
  }

  static onMission(missionSiteId = 'mission-site-test'): Agent {
    return this.new({
      state: 'OnMission',
      assignment: missionSiteId as `mission-site-${string}`,
    })
  }

  static onAssignment(activity: 'Contracting' | 'Espionage' = 'Contracting'): Agent {
    return this.new({
      state: 'OnAssignment',
      assignment: activity,
    })
  }

  static inTransit(): Agent {
    return this.new({
      state: 'InTransit',
      assignment: 'Standby',
    })
  }

  static terminated(): Agent {
    return this.new({
      state: 'Terminated',
      assignment: 'KIA',
      hitPoints: 0,
    })
  }

  static wounded(hitPointsLost = 10): Agent {
    const maxHitPoints = 30
    return this.new({
      hitPoints: Math.max(0, maxHitPoints - hitPointsLost),
      maxHitPoints,
    })
  }

  static exhausted(exhaustion = 50): Agent {
    return this.new({
      exhaustion,
    })
  }

  static veteran(missionsSurvived = 5): Agent {
    return this.new({
      missionsSurvived,
      skill: 120,
    })
  }

  static rookie(): Agent {
    return this.new({
      skill: 60,
      missionsSurvived: 0,
      turnHired: 1,
    })
  }

  static elite(): Agent {
    return this.new({
      skill: 150,
      missionsSurvived: 10,
      weapon: WeaponFixture.powerful(),
    })
  }

  static many(count: number, overrides?: Partial<Agent>): Agent[] {
    return Array.from({ length: count }, () => this.new(overrides))
  }

  static team(size = 4): Agent[] {
    const baseTeam = [
      this.elite(),
      this.veteran(),
      this.default(),
      this.rookie(),
    ]
    
    if (size <= 4) {
      return baseTeam.slice(0, size)
    }
    
    // For larger teams, add more default agents
    const team = [...baseTeam]
    while (team.length < size) {
      team.push(this.default())
    }
    return team
  }
}