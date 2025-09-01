import { faker } from '@faker-js/faker'
import type { Agent, AgentState, AgentAssignment } from '../../src/lib/model/model'
import { wpnFix } from './weaponFixture'
import { newHiredAgent } from '../../src/lib/slices/reducers/agentReducers'

// KJA fixtures should not be capitalized. So AgentFixture -> agentFixture.
export const agFix = (() => {
  let agentIdCounter = 0

  const agentFixture = {
    resetIdCounter(): void {
      agentIdCounter = 0
    },

    default(): Agent {
      agentIdCounter += 1
      return newHiredAgent(`agent-${agentIdCounter}`, 1)
    },

    new(overrides?: Partial<Agent>): Agent {
      return {
        ...this.default(),
        ...overrides,
      }
    },

    random(): Agent {
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
        weapon: wpnFix.random(),
      })
    },

    withState(state: AgentState, assignment?: AgentAssignment): Agent {
      const validAssignment = assignment ?? (state === 'Recovering' ? 'Recovery' : 'Standby')
      return this.new({
        state,
        assignment: validAssignment,
      })
    },

    available(): Agent {
      return this.withState('Available', 'Standby')
    },

    recovering(recoveryTurns = 3): Agent {
      return this.new({
        state: 'Recovering',
        assignment: 'Recovery',
        recoveryTurns,
        hitPoints: 15,
        maxHitPoints: 30,
        hitPointsLostBeforeRecovery: 15,
      })
    },

    onMission(missionSiteId = 'mission-site-test'): Agent {
      return this.new({
        state: 'OnMission',
        assignment: `mission-site-${missionSiteId.replace('mission-site-', '')}`,
      })
    },

    onAssignment(activity: 'Contracting' | 'Espionage' = 'Contracting'): Agent {
      return this.new({
        state: 'OnAssignment',
        assignment: activity,
      })
    },

    inTransit(): Agent {
      return this.new({
        state: 'InTransit',
        assignment: 'Standby',
      })
    },

    terminated(): Agent {
      return this.new({
        state: 'Terminated',
        assignment: 'KIA',
        hitPoints: 0,
      })
    },

    wounded(hitPointsLost = 10): Agent {
      const maxHitPoints = 30
      return this.new({
        hitPoints: Math.max(0, maxHitPoints - hitPointsLost),
        maxHitPoints,
      })
    },

    exhausted(exhaustion = 50): Agent {
      return this.new({
        exhaustion,
      })
    },

    veteran(missionsSurvived = 5): Agent {
      return this.new({
        missionsSurvived,
        skill: 120,
      })
    },

    rookie(): Agent {
      return this.new({
        skill: 60,
        missionsSurvived: 0,
        turnHired: 1,
      })
    },

    elite(): Agent {
      return this.new({
        skill: 150,
        missionsSurvived: 10,
        weapon: wpnFix.powerful(),
      })
    },

    many(count: number, overrides?: Partial<Agent>): Agent[] {
      return Array.from({ length: count }, () => this.new(overrides))
    },

    team1(): [Agent] {
      return [this.elite()]
    },

    team2(): [Agent, Agent] {
      return [this.elite(), this.veteran()]
    },

    team3(): [Agent, Agent, Agent] {
      return [this.elite(), this.veteran(), this.default()]
    },

    team4(): [Agent, Agent, Agent, Agent] {
      return [this.elite(), this.veteran(), this.default(), this.rookie()]
    },

    team5(): [Agent, Agent, Agent, Agent, Agent] {
      return [this.elite(), this.veteran(), this.default(), this.rookie(), this.default()]
    },

    team6(): [Agent, Agent, Agent, Agent, Agent, Agent] {
      return [this.elite(), this.veteran(), this.default(), this.rookie(), this.default(), this.default()]
    },
  }

  return agentFixture
})()
