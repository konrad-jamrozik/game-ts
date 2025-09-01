import { faker } from '@faker-js/faker'
import type { Lead } from '../../src/lib/model/model'

export const leadFix = (() => {
  let leadIdCounter = 0

  return {
    resetIdCounter(): void {
      leadIdCounter = 0
    },

    default(): Lead {
      leadIdCounter += 1
      return {
        id: `lead-${leadIdCounter}`,
        title: 'Test Lead',
        intelCost: 10,
        description: 'A test lead for investigation',
        dependsOn: [],
        repeatable: false,
      }
    },

    new(overrides?: Partial<Lead>): Lead {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    random(): Lead {
      return this.new({
        id: faker.string.uuid(),
        title: `${faker.company.name()} Operation`,
        intelCost: faker.number.int({ min: 5, max: 50 }),
        description: faker.lorem.sentence(),
        dependsOn: faker.helpers.arrayElements(['lead-1', 'lead-2', 'lead-3'], { min: 0, max: 2 }),
        repeatable: faker.datatype.boolean(),
      })
    },

    expensive(intelCost = 50): Lead {
      return this.new({
        intelCost,
        title: 'High Value Target',
      })
    },

    cheap(): Lead {
      return this.new({
        intelCost: 5,
        title: 'Low Priority Lead',
      })
    },

    repeatable(): Lead {
      return this.new({
        repeatable: true,
        title: 'Recurring Operation',
      })
    },

    withDependencies(...dependsOn: string[]): Lead {
      return this.new({
        dependsOn,
        title: 'Dependent Lead',
      })
    },

    campaign(chainLength = 3): Lead[] {
      const leads: Lead[] = []
      for (let index = 0; index < chainLength; index += 1) {
        leads.push(
          this.new({
            id: `campaign-lead-${index + 1}`,
            title: `Campaign Part ${index + 1}`,
            dependsOn: index > 0 ? [`campaign-lead-${index}`] : [],
          }),
        )
      }
      return leads
    },

    many(count: number, overrides?: Partial<Lead>): Lead[] {
      return Array.from({ length: count }, () => this.new(overrides))
    },
  }
})()
