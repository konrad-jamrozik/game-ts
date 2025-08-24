import { faker } from '@faker-js/faker'
import type { Enemy, EnemyType } from '../../src/lib/model/model'
import { WeaponFixture } from './weaponFixtures'
import { ENEMY_TYPES } from '../../src/lib/model/model'

export class EnemyFixture {
  private static idCounter = 0

  static resetIdCounter(): void {
    this.idCounter = 0
  }

  static default(): Enemy {
    return {
      id: `enemy-${++this.idCounter}`,
      type: 'Soldier',
      skill: 50,
      hitPoints: 20,
      maxHitPoints: 20,
      exhaustion: 0,
      weapon: WeaponFixture.default(),
      isOfficer: false,
    }
  }

  static new(overrides?: Partial<Enemy>): Enemy {
    return {
      ...this.default(),
      ...overrides,
    }
  }

  static random(): Enemy {
    const maxHitPoints = faker.number.int({ min: 10, max: 40 })
    const type = faker.helpers.arrayElement(ENEMY_TYPES)
    
    return this.new({
      id: faker.string.uuid(),
      type,
      skill: faker.number.int({ min: 30, max: 100 }),
      hitPoints: faker.number.int({ min: 1, max: maxHitPoints }),
      maxHitPoints,
      exhaustion: faker.number.int({ min: 0, max: 50 }),
      weapon: WeaponFixture.random(),
      isOfficer: ['Lieutenant', 'Elite', 'Commander', 'HighCommander'].includes(type),
    })
  }

  static ofType(type: EnemyType): Enemy {
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
      weapon: isOfficer ? WeaponFixture.powerful() : WeaponFixture.default(),
    })
  }

  static initiate(): Enemy {
    return this.ofType('Initiate')
  }

  static soldier(): Enemy {
    return this.ofType('Soldier')
  }

  static lieutenant(): Enemy {
    return this.ofType('Lieutenant')
  }

  static elite(): Enemy {
    return this.ofType('Elite')
  }

  static commander(): Enemy {
    return this.ofType('Commander')
  }

  static highCommander(): Enemy {
    return this.ofType('HighCommander')
  }

  static wounded(hitPointsLost = 10): Enemy {
    const enemy = this.default()
    return this.new({
      ...enemy,
      hitPoints: Math.max(1, enemy.maxHitPoints - hitPointsLost),
    })
  }

  static squad(types?: EnemyType[]): Enemy[] {
    const defaultSquad: EnemyType[] = ['Lieutenant', 'Soldier', 'Soldier', 'Operative']
    const squadTypes = types ?? defaultSquad
    return squadTypes.map(type => this.ofType(type))
  }

  static eliteSquad(): Enemy[] {
    return this.squad(['Commander', 'Elite', 'Elite', 'Lieutenant'])
  }

  static many(count: number, overrides?: Partial<Enemy>): Enemy[] {
    return Array.from({ length: count }, () => this.new(overrides))
  }

  static mixedForce(size = 6): Enemy[] {
    const force: Enemy[] = []
    const distribution = {
      Initiate: Math.floor(size * 0.2),
      Operative: Math.floor(size * 0.2),
      Soldier: Math.floor(size * 0.3),
      Lieutenant: Math.floor(size * 0.2),
      Elite: Math.floor(size * 0.1),
    }

    for (const [type, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        force.push(this.ofType(type as EnemyType))
      }
    }

    while (force.length < size) {
      force.push(this.soldier())
    }

    return force.slice(0, size)
  }
}