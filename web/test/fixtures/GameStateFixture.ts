import { faker } from '@faker-js/faker'
import type { GameState } from '../../src/lib/model/model'
import { AgentFixture } from './AgentFixture'
import { FactionFixture } from './FactionFixture'
import { MissionSiteFixture } from './MissionSiteFixture'

export const GameStateFixture = {
  default(): GameState {
    return {
      // Session
      turn: 1,
      actionsCount: 0,
      // Situation
      panic: 0,
      factions: FactionFixture.all(),
      // Assets
      money: 1000,
      intel: 100,
      funding: 50,
      agents: AgentFixture.team(4),
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
      agents: AgentFixture.many(faker.number.int({ min: 1, max: 8 })),
      currentTurnTotalHireCost: faker.number.int({ min: 0, max: 500 }),
      leadInvestigationCounts: this.randomInvestigationCounts(),
      missionSites: MissionSiteFixture.many(faker.number.int({ min: 0, max: 5 })),
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
      agents: [
        AgentFixture.elite(),
        AgentFixture.veteran(),
        AgentFixture.veteran(3),
        AgentFixture.default(),
        AgentFixture.rookie(),
        AgentFixture.recovering(2),
      ],
      factions: [
        FactionFixture.withThreat(45),
        FactionFixture.withThreat(30),
        FactionFixture.suppressed(),
        FactionFixture.lowThreat(),
      ],
      leadInvestigationCounts: {
        'lead-1': 2,
        'lead-2': 1,
        'lead-3': 3,
      },
      missionSites: [MissionSiteFixture.active(), MissionSiteFixture.deployed(['agent-1', 'agent-2'])],
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
        AgentFixture.elite(),
        AgentFixture.elite(),
        AgentFixture.veteran(8),
        AgentFixture.veteran(6),
        AgentFixture.veteran(5),
        AgentFixture.veteran(4),
        AgentFixture.default(),
        AgentFixture.recovering(1),
      ],
      factions: [
        FactionFixture.highThreat(),
        FactionFixture.withThreat(65),
        FactionFixture.withThreat(50),
        FactionFixture.suppressed(),
      ],
      leadInvestigationCounts: {
        'lead-1': 5,
        'lead-2': 4,
        'lead-3': 6,
        'lead-4': 2,
        'lead-5': 1,
      },
      missionSites: [
        MissionSiteFixture.active(),
        MissionSiteFixture.active(),
        MissionSiteFixture.deployed(['agent-1', 'agent-2', 'agent-3']),
        MissionSiteFixture.successful(),
      ],
    })
  },

  crisis(): GameState {
    return this.new({
      panic: 90,
      money: 100,
      intel: 10,
      funding: 10,
      agents: [AgentFixture.wounded(15), AgentFixture.exhausted(80), AgentFixture.recovering(4), AgentFixture.rookie()],
      factions: [
        FactionFixture.highThreat(),
        FactionFixture.highThreat(),
        FactionFixture.withThreat(75),
        FactionFixture.withThreat(70),
      ],
    })
  },

  wealthy(): GameState {
    return this.new({
      money: 50_000,
      intel: 1000,
      funding: 500,
    })
  },

  withAgents(...agents: ReturnType<typeof AgentFixture.new>[]): GameState {
    return this.new({
      agents,
    })
  },

  withMissions(...missionSites: ReturnType<typeof MissionSiteFixture.new>[]): GameState {
    return this.new({
      missionSites,
    })
  },

  withFactions(...factions: ReturnType<typeof FactionFixture.new>[]): GameState {
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
