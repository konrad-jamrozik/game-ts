import { faker } from '@faker-js/faker'
import type { Mission, MissionRewards, FactionId } from '../../src/lib/model/model'

export const MissionFixture = (() => {
  let missionIdCounter = 0

  return {
    resetIdCounter(): void {
      missionIdCounter = 0
    },

    defaultRewards(): MissionRewards {
      return {
        money: 100,
        intel: 10,
        funding: 0,
        panicReduction: 0,
        factionRewards: [],
      }
    },

    default(): Mission {
      missionIdCounter += 1
      return {
        id: `mission-${missionIdCounter}`,
        title: 'Test Mission',
        description: 'A test mission for testing',
        expiresIn: 'never',
        dependsOn: [],
        enemyUnitsSpec: '2 Soldier, 1 Lieutenant',
        rewards: this.defaultRewards(),
      }
    },

    new(overrides?: Partial<Mission>): Mission {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    random(): Mission {
      const factionIds: FactionId[] = [
        'faction-red-dawn',
        'faction-black-lotus',
        'faction-exalt',
        'faction-followers-of-dagon',
      ]

      return this.new({
        id: faker.string.uuid(),
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        expiresIn: faker.helpers.arrayElement(['never', 5, 10, 15] as const),
        dependsOn: faker.helpers.arrayElements(['lead-1', 'lead-2', 'mission-1'], { min: 0, max: 2 }),
        enemyUnitsSpec: faker.helpers.arrayElement([
          '3 Soldier',
          '2 Soldier, 1 Lieutenant',
          '1 Elite, 2 Operative',
          '1 Commander, 2 Elite, 3 Soldier',
        ]),
        rewards: {
          money: faker.number.int({ min: 50, max: 500 }),
          intel: faker.number.int({ min: 0, max: 50 }),
          funding: faker.number.int({ min: 0, max: 20 }),
          panicReduction: faker.number.int({ min: 0, max: 5 }),
          factionRewards: faker.datatype.boolean()
            ? [
                {
                  factionId: faker.helpers.arrayElement(factionIds),
                  threatReduction: faker.number.int({ min: 5, max: 20 }),
                  suppression: faker.number.int({ min: 0, max: 10 }),
                },
              ]
            : [],
        },
      })
    },

    withRewards(rewards: Partial<MissionRewards>): Mission {
      return this.new({
        rewards: {
          ...this.defaultRewards(),
          ...rewards,
        },
      })
    },

    highValue(): Mission {
      return this.new({
        title: 'High Value Target',
        enemyUnitsSpec: '1 Commander, 2 Elite, 4 Soldier',
        rewards: {
          money: 500,
          intel: 50,
          funding: 20,
          panicReduction: 5,
          factionRewards: [
            {
              factionId: 'faction-exalt',
              threatReduction: 20,
              suppression: 10,
            },
          ],
        },
      })
    },

    easy(): Mission {
      return this.new({
        title: 'Routine Patrol',
        enemyUnitsSpec: '2 Initiate, 1 Operative',
        rewards: {
          money: 50,
          intel: 5,
          funding: 0,
          panicReduction: 0,
          factionRewards: [],
        },
      })
    },

    expiring(turnsLeft = 3): Mission {
      return this.new({
        expiresIn: turnsLeft,
        title: 'Time Sensitive Operation',
      })
    },

    withDependencies(...dependsOn: string[]): Mission {
      return this.new({
        dependsOn,
        title: 'Dependent Mission',
      })
    },

    againstFaction(factionId: FactionId): Mission {
      return this.new({
        title: `Strike Against ${factionId}`,
        rewards: {
          ...this.defaultRewards(),
          factionRewards: [
            {
              factionId,
              threatReduction: 15,
              suppression: 5,
            },
          ],
        },
      })
    },

    many(count: number, overrides?: Partial<Mission>): Mission[] {
      return Array.from({ length: count }, () => this.new(overrides))
    },
  }
})()
