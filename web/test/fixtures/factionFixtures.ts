import { faker } from '@faker-js/faker'
import type { Faction, FactionId } from '../../src/lib/model/model'

export const FactionFixture = {
  default(): Faction {
    return {
      id: 'faction-red-dawn',
      name: 'Red Dawn',
      threatLevel: 10,
      threatIncrease: 2,
      suppression: 0,
      discoveryPrerequisite: [],
    }
  },

  new(overrides?: Partial<Faction>): Faction {
    return {
      ...this.default(),
      ...overrides,
    }
  },

  random(): Faction {
    const factionIds: FactionId[] = ['faction-red-dawn', 'faction-black-lotus', 'faction-exalt', 'faction-followers-of-dagon']
    const factionNames = ['Red Dawn', 'Black Lotus', 'EXALT', 'Followers of Dagon']
    const index = faker.number.int({ min: 0, max: 3 })
    
    return this.new({
      id: factionIds[index],
      name: factionNames[index],
      threatLevel: faker.number.int({ min: 0, max: 100 }),
      threatIncrease: faker.number.int({ min: 1, max: 5 }),
      suppression: faker.number.int({ min: 0, max: 50 }),
      discoveryPrerequisite: faker.helpers.arrayElements(['lead-1', 'mission-1'], { min: 0, max: 2 }),
    })
  },

  redDawn(): Faction {
    return this.new({
      id: 'faction-red-dawn',
      name: 'Red Dawn',
    })
  },

  blackLotus(): Faction {
    return this.new({
      id: 'faction-black-lotus',
      name: 'Black Lotus',
    })
  },

  exalt(): Faction {
    return this.new({
      id: 'faction-exalt',
      name: 'EXALT',
    })
  },

  followersOfDagon(): Faction {
    return this.new({
      id: 'faction-followers-of-dagon',
      name: 'Followers of Dagon',
    })
  },

  withThreat(threatLevel: number): Faction {
    return this.new({
      threatLevel,
      threatIncrease: Math.ceil(threatLevel / 10),
    })
  },

  highThreat(): Faction {
    return this.new({
      threatLevel: 80,
      threatIncrease: 5,
      name: 'High Threat Faction',
    })
  },

  lowThreat(): Faction {
    return this.new({
      threatLevel: 10,
      threatIncrease: 1,
      name: 'Low Threat Faction',
    })
  },

  suppressed(): Faction {
    return this.new({
      suppression: 30,
      threatLevel: 20,
      name: 'Suppressed Faction',
    })
  },

  discovered(): Faction {
    return this.new({
      discoveryPrerequisite: [],
    })
  },

  hidden(...prerequisites: string[]): Faction {
    return this.new({
      discoveryPrerequisite: prerequisites,
      name: 'Hidden Faction',
    })
  },

  all(): Faction[] {
    return [
      this.redDawn(),
      this.blackLotus(),
      this.exalt(),
      this.followersOfDagon(),
    ]
  },

  many(count: number, overrides?: Partial<Faction>): Faction[] {
    const factions = this.all()
    const result: Faction[] = []
    
    for (let i = 0; i < count; i++) {
      const base = factions[i % factions.length]
      result.push(this.new({ ...base, ...overrides }))
    }
    
    return result
  },
};