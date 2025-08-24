import { faker } from '@faker-js/faker'
import type { Agent, AgentState, AgentAssignment } from '../../src/lib/model/model'
import { WeaponFixture } from './WeaponFixture'
import { AGENT_INITIAL_WEAPON_DAMAGE } from '../../src/lib/model/ruleset/constants'
import { createWeapon } from '../../src/lib/utils/weaponUtils'

export const AgentFixture = (() => {
  let agentIdCounter = 0

  const agentFixture = {
    resetIdCounter(): void {
      agentIdCounter = 0
    },

    default(): Agent {
      agentIdCounter += 1
      return {
        id: `agent-${agentIdCounter}`,
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
        weapon: WeaponFixture.random(),
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
        weapon: WeaponFixture.powerful(),
      })
    },

    many(count: number, overrides?: Partial<Agent>): Agent[] {
      return Array.from({ length: count }, () => this.new(overrides))
    },

    // Placeholder team method - will be replaced with overloaded version
    team(_size: number): Agent[] {
      return [] // Placeholder implementation
    },
  }

  // Function with overloads for team method
  function team(size: 1): [Agent]
  function team(size: 2): [Agent, Agent]
  function team(size: 3): [Agent, Agent, Agent]
  function team(size: 4): [Agent, Agent, Agent, Agent]
  function team(size: 5): [Agent, Agent, Agent, Agent, Agent]
  function team(size: 6): [Agent, Agent, Agent, Agent, Agent, Agent]
  function team(size?: number): Agent[]
  function team(size = 4): Agent[] {
    const baseTeam = [agentFixture.elite(), agentFixture.veteran(), agentFixture.default(), agentFixture.rookie()]

    if (size <= 4) {
      return baseTeam.slice(0, size)
    }

    // For larger teams, add more default agents
    const teamArray = [...baseTeam]
    while (teamArray.length < size) {
      teamArray.push(agentFixture.default())
    }
    return teamArray
  }

  // Assign the overloaded function to the object
  agentFixture.team = team

  return agentFixture
})()
