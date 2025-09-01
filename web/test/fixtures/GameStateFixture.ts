import { faker } from '@faker-js/faker'
import type { GameState } from '../../src/lib/model/model'
import { agFix } from './agFix'
import { facFix } from './facFix'
import { misStFix } from './misStFix'

export const GameStateFixture = {
  default(): GameState {
    return {
      // Session
      turn: 1,
      actionsCount: 0,
      // Situation
      panic: 0,
      factions: facFix.all(),
      // Assets
      money: 1000,
      intel: 100,
      funding: 50,
      agents: agFix.team4(),
      // Liabilities
      currentTurnTotalHireCost: 0,
      // Archive
      leadInvestigationCounts: {},
      missionSites: [],
    }
  },

  new(overrides?: Partial<GameState>): GameState {
    return {
      ...this.default(),
      ...overrides,
    }
  },

  random(): GameState {
    return this.new({
      turn: faker.number.int({ min: 1, max: 100 }),
      actionsCount: faker.number.int({ min: 0, max: 10 }),
      panic: faker.number.int({ min: 0, max: 100 }),
      money: faker.number.int({ min: 0, max: 10_000 }),
      intel: faker.number.int({ min: 0, max: 500 }),
      funding: faker.number.int({ min: 0, max: 200 }),
      agents: agFix.many(faker.number.int({ min: 1, max: 8 })),
      currentTurnTotalHireCost: faker.number.int({ min: 0, max: 500 }),
      leadInvestigationCounts: this.randomInvestigationCounts(),
      missionSites: misStFix.many(faker.number.int({ min: 0, max: 5 })),
    })
  },

  empty(): GameState {
    return this.new({
      agents: [],
      missionSites: [],
      money: 0,
      intel: 0,
      funding: 0,
    })
  },

  midGame(): GameState {
    return this.new({
      turn: 20,
      actionsCount: 45,
      panic: 35,
      money: 3000,
      intel: 250,
      funding: 100,
      agents: [agFix.elite(), agFix.veteran(), agFix.veteran(3), agFix.default(), agFix.rookie(), agFix.recovering(2)],
      factions: [facFix.withThreat(45), facFix.withThreat(30), facFix.suppressed(), facFix.lowThreat()],
      leadInvestigationCounts: {
        'lead-1': 2,
        'lead-2': 1,
        'lead-3': 3,
      },
      missionSites: [misStFix.active(), misStFix.deployed(['agent-1', 'agent-2'])],
    })
  },

  lateGame(): GameState {
    return this.new({
      turn: 50,
      actionsCount: 150,
      panic: 60,
      money: 8000,
      intel: 500,
      funding: 200,
      agents: [
        agFix.elite(),
        agFix.elite(),
        agFix.veteran(8),
        agFix.veteran(6),
        agFix.veteran(5),
        agFix.veteran(4),
        agFix.default(),
        agFix.recovering(1),
      ],
      factions: [facFix.highThreat(), facFix.withThreat(65), facFix.withThreat(50), facFix.suppressed()],
      leadInvestigationCounts: {
        'lead-1': 5,
        'lead-2': 4,
        'lead-3': 6,
        'lead-4': 2,
        'lead-5': 1,
      },
      missionSites: [
        misStFix.active(),
        misStFix.active(),
        misStFix.deployed(['agent-1', 'agent-2', 'agent-3']),
        misStFix.successful(),
      ],
    })
  },

  crisis(): GameState {
    return this.new({
      panic: 90,
      money: 100,
      intel: 10,
      funding: 10,
      agents: [agFix.wounded(15), agFix.exhausted(80), agFix.recovering(4), agFix.rookie()],
      factions: [facFix.highThreat(), facFix.highThreat(), facFix.withThreat(75), facFix.withThreat(70)],
    })
  },

  wealthy(): GameState {
    return this.new({
      money: 50_000,
      intel: 1000,
      funding: 500,
    })
  },

  withAgents(...agents: ReturnType<typeof agFix.new>[]): GameState {
    return this.new({
      agents,
    })
  },

  withMissions(...missionSites: ReturnType<typeof misStFix.new>[]): GameState {
    return this.new({
      missionSites,
    })
  },

  withFactions(...factions: ReturnType<typeof facFix.new>[]): GameState {
    return this.new({
      factions,
    })
  },

  atTurn(turn: number): GameState {
    return this.new({
      turn,
      actionsCount: turn * 2,
    })
  },

  withPanic(panic: number): GameState {
    return this.new({
      panic,
    })
  },

  withResources(money: number, intel: number, funding = 50): GameState {
    return this.new({
      money,
      intel,
      funding,
    })
  },

  randomInvestigationCounts(): Record<string, number> {
    const counts: Record<string, number> = {}
    const leadCount = faker.number.int({ min: 0, max: 10 })

    for (let index = 0; index < leadCount; index += 1) {
      counts[`lead-${index + 1}`] = faker.number.int({ min: 1, max: 5 })
    }

    return counts
  },
}
