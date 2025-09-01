import { faker } from '@faker-js/faker'
import { ENEMY_TYPES, type Enemy, type EnemyType } from '../../src/lib/model/model'
import { wpnFix } from './wpnFix'

export const enFix = (() => {
  let enemyIdCounter = 0

  return {
    resetIdCounter(): void {
      enemyIdCounter = 0
    },

    default(): Enemy {
      enemyIdCounter += 1
      return {
        id: `enemy-${enemyIdCounter}`,
        type: 'Soldier',
        skill: 50,
        hitPoints: 20,
        maxHitPoints: 20,
        exhaustion: 0,
        weapon: wpnFix.default(),
        isOfficer: false,
      }
    },

    new(overrides?: Partial<Enemy>): Enemy {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    random(): Enemy {
      const maxHitPoints = faker.number.int({ min: 10, max: 40 })
      const type = faker.helpers.arrayElement(ENEMY_TYPES)

      return this.new({
        id: faker.string.uuid(),
        type,
        skill: faker.number.int({ min: 30, max: 100 }),
        hitPoints: faker.number.int({ min: 1, max: maxHitPoints }),
        maxHitPoints,
        exhaustion: faker.number.int({ min: 0, max: 50 }),
        weapon: wpnFix.random(),
        isOfficer: ['Lieutenant', 'Elite', 'Commander', 'HighCommander'].includes(type),
      })
    },

    ofType(type: EnemyType): Enemy {
      const skillByType: Record<EnemyType, number> = {
        Initiate: 30,
        Operative: 40,
        Handler: 45,
        Soldier: 50,
        Lieutenant: 60,
        Elite: 70,
        Commander: 80,
        HighCommander: 90,
      }

      const hpByType: Record<EnemyType, number> = {
        Initiate: 10,
        Operative: 15,
        Handler: 15,
        Soldier: 20,
        Lieutenant: 25,
        Elite: 30,
        Commander: 35,
        HighCommander: 40,
      }

      const isOfficer = ['Lieutenant', 'Elite', 'Commander', 'HighCommander'].includes(type)

      return this.new({
        type,
        skill: skillByType[type],
        hitPoints: hpByType[type],
        maxHitPoints: hpByType[type],
        isOfficer,
        weapon: isOfficer ? wpnFix.powerful() : wpnFix.default(),
      })
    },

    initiate(): Enemy {
      return this.ofType('Initiate')
    },

    soldier(): Enemy {
      return this.ofType('Soldier')
    },

    lieutenant(): Enemy {
      return this.ofType('Lieutenant')
    },

    elite(): Enemy {
      return this.ofType('Elite')
    },

    commander(): Enemy {
      return this.ofType('Commander')
    },

    highCommander(): Enemy {
      return this.ofType('HighCommander')
    },

    wounded(hitPointsLost = 10): Enemy {
      const enemy = this.default()
      return this.new({
        ...enemy,
        hitPoints: Math.max(1, enemy.maxHitPoints - hitPointsLost),
      })
    },

    squad(types?: EnemyType[]): Enemy[] {
      const defaultSquad: EnemyType[] = ['Lieutenant', 'Soldier', 'Soldier', 'Operative']
      const squadTypes = types ?? defaultSquad
      return squadTypes.map((type) => this.ofType(type))
    },

    eliteSquad(): Enemy[] {
      return this.squad(['Commander', 'Elite', 'Elite', 'Lieutenant'])
    },

    many(count: number, overrides?: Partial<Enemy>): Enemy[] {
      return Array.from({ length: count }, () => this.new(overrides))
    },

    mixedForce(size = 6): Enemy[] {
      const force: Enemy[] = []
      const distribution: Record<EnemyType, number> = {
        Initiate: Math.floor(size * 0.2),
        Operative: Math.floor(size * 0.2),
        Handler: 0,
        Soldier: Math.floor(size * 0.3),
        Lieutenant: Math.floor(size * 0.2),
        Elite: Math.floor(size * 0.1),
        Commander: 0,
        HighCommander: 0,
      }

      for (const type of ENEMY_TYPES) {
        const count = distribution[type]
        for (let index = 0; index < count; index += 1) {
          force.push(this.ofType(type))
        }
      }

      while (force.length < size) {
        force.push(this.soldier())
      }

      return force.slice(0, size)
    },
  }
})()
