import { faker } from '@faker-js/faker'
import type { Lead } from '../../src/lib/model/model'

export class LeadFixture {
  private static idCounter = 0

  static resetIdCounter(): void {
    this.idCounter = 0
  }

  static default(): Lead {
    return {
      id: `lead-${++this.idCounter}`,
      title: 'Test Lead',
      intelCost: 10,
      description: 'A test lead for investigation',
      expiresIn: 'never',
      dependsOn: [],
      repeatable: false,
    }
  }

  static new(overrides?: Partial<Lead>): Lead {
    return {
      ...this.default(),
      ...overrides,
    }
  }

  static random(): Lead {
    return this.new({
      id: faker.string.uuid(),
      title: `${faker.company.name()  } Operation`,
      intelCost: faker.number.int({ min: 5, max: 50 }),
      description: faker.lorem.sentence(),
      expiresIn: faker.helpers.arrayElement(['never', 3, 5, 10] as const),
      dependsOn: faker.helpers.arrayElements(['lead-1', 'lead-2', 'lead-3'], { min: 0, max: 2 }),
      repeatable: faker.datatype.boolean(),
    })
  }

  static expiring(turnsLeft = 3): Lead {
    return this.new({
      expiresIn: turnsLeft,
    })
  }

  static expensive(intelCost = 50): Lead {
    return this.new({
      intelCost,
      title: 'High Value Target',
    })
  }

  static cheap(): Lead {
    return this.new({
      intelCost: 5,
      title: 'Low Priority Lead',
    })
  }

  static repeatable(): Lead {
    return this.new({
      repeatable: true,
      title: 'Recurring Operation',
    })
  }

  static withDependencies(...dependsOn: string[]): Lead {
    return this.new({
      dependsOn,
      title: 'Dependent Lead',
    })
  }

  static campaign(chainLength = 3): Lead[] {
    const leads: Lead[] = []
    for (let i = 0; i < chainLength; i++) {
      leads.push(
        this.new({
          id: `campaign-lead-${i + 1}`,
          title: `Campaign Part ${i + 1}`,
          dependsOn: i > 0 ? [`campaign-lead-${i}`] : [],
        })
      )
    }
    return leads
  }

  static many(count: number, overrides?: Partial<Lead>): Lead[] {
    return Array.from({ length: count }, () => this.new(overrides))
  }
}