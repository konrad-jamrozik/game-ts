import { describe, expect, test, beforeEach } from 'vitest'
import {
  AgentFixture,
  GameStateFixture,
  MissionSiteFixture,
  EnemyFixture,
  LeadFixture,
  FactionFixture,
  resetAllFixtures,
} from '../fixtures'
import { assertDefined } from '../../src/lib/utils/assert'

describe('Fixture Usage Examples', () => {
  beforeEach(() => {
    resetAllFixtures()
  })

  describe('Agent Fixtures', () => {
    test('create different agent types', () => {
      const rookie = AgentFixture.rookie()

      expect(rookie.skill).toBe(60)
      expect(rookie.missionsSurvived).toBe(0)

      const elite = AgentFixture.elite()

      expect(elite.skill).toBe(150)
      expect(elite.missionsSurvived).toBe(10)

      const wounded = AgentFixture.wounded(15)

      expect(wounded.hitPoints).toBe(15)
      expect(wounded.maxHitPoints).toBe(30)
    })

    test('create agent teams', () => {
      const team = AgentFixture.team3()

      expect(team).toHaveLength(3)
      expect(team[0].skill).toBeGreaterThan(team[2].skill) // Elite > Rookie
    })

    test('compose agent states', () => {
      // To properly compose, we need to merge specific properties
      const veteran = AgentFixture.veteran()
      const exhaustedVeteran = AgentFixture.new({
        ...veteran,
        exhaustion: 70,
      })

      expect(exhaustedVeteran.missionsSurvived).toBe(5)
      expect(exhaustedVeteran.exhaustion).toBe(70)
    })
  })

  describe('Game State Fixtures', () => {
    test('create different game phases', () => {
      const early = GameStateFixture.default()

      expect(early.turn).toBe(1)
      expect(early.agents).toHaveLength(4)

      const mid = GameStateFixture.midGame()

      expect(mid.turn).toBe(20)
      expect(mid.agents.length).toBeGreaterThan(4)

      const crisis = GameStateFixture.crisis()

      expect(crisis.panic).toBeGreaterThanOrEqual(90)
      expect(crisis.money).toBeLessThan(1000)
    })

    test('compose game states with specific conditions', () => {
      const midGame = GameStateFixture.midGame()
      const customState = GameStateFixture.new({
        ...midGame,
        agents: AgentFixture.team6(),
        missionSites: [MissionSiteFixture.deployed(['agent-1', 'agent-2']), MissionSiteFixture.active()],
      })

      expect(customState.turn).toBe(20)
      expect(customState.agents).toHaveLength(6)
      expect(customState.missionSites).toHaveLength(2)
    })

    test('use builder methods for specific scenarios', () => {
      const crisis = GameStateFixture.crisis()
      const wealthy = GameStateFixture.wealthy()
      const wealthyCrisis = GameStateFixture.new({
        ...crisis,
        money: wealthy.money,
        intel: wealthy.intel,
        funding: wealthy.funding,
      })

      expect(wealthyCrisis.panic).toBeGreaterThanOrEqual(90)
      expect(wealthyCrisis.money).toBe(50_000)
    })
  })

  describe('Mission and Enemy Fixtures', () => {
    test('create mission sites with different enemy compositions', () => {
      const easy = MissionSiteFixture.new({
        enemies: EnemyFixture.squad(['Initiate', 'Initiate', 'Operative']),
      })
      assertDefined(easy.enemies[0])

      expect(easy.enemies).toHaveLength(3)
      expect(easy.enemies[0].type).toBe('Initiate')

      const hard = MissionSiteFixture.withEliteEnemies()

      expect(hard.enemies.some((enemy) => enemy.type === 'Commander')).toBe(true)
    })

    test('create enemy forces for testing combat', () => {
      const mixedForce = EnemyFixture.mixedForce(10)

      expect(mixedForce).toHaveLength(10)

      const initiates = mixedForce.filter((enemy) => enemy.type === 'Initiate')
      const elites = mixedForce.filter((enemy) => enemy.type === 'Elite')

      expect(initiates.length).toBeLessThan(elites.length + 5) // Balanced distribution
    })
  })

  describe('Lead Campaign Fixtures', () => {
    test('create lead dependency chains', () => {
      const campaign = LeadFixture.campaign(3)
      assertDefined(campaign[0])
      assertDefined(campaign[1])
      assertDefined(campaign[2])

      expect(campaign).toHaveLength(3)
      expect(campaign[0].dependsOn).toHaveLength(0)
      expect(campaign[1].dependsOn).toContain('campaign-lead-1')
      expect(campaign[2].dependsOn).toContain('campaign-lead-2')
    })
  })

  describe('Fixture Composition', () => {
    test('create complex test scenario', () => {
      // Scenario: Mid-game with active mission against high-threat faction
      const gameState = GameStateFixture.new({
        ...GameStateFixture.midGame(),
        factions: [
          FactionFixture.highThreat(),
          FactionFixture.suppressed(),
          FactionFixture.lowThreat(),
          FactionFixture.hidden('lead-secret'),
        ],
        agents: [
          AgentFixture.elite(),
          AgentFixture.veteran(),
          AgentFixture.onMission('mission-site-alpha'),
          AgentFixture.onMission('mission-site-alpha'),
          AgentFixture.recovering(2),
          AgentFixture.onAssignment('Espionage'),
        ],
        missionSites: [
          MissionSiteFixture.new({
            id: 'mission-site-alpha',
            state: 'Deployed',
            agentIds: ['agent-3', 'agent-4'],
            enemies: EnemyFixture.eliteSquad(),
          }),
        ],
      })

      // Verify complex state
      const deployedAgents = gameState.agents.filter((agent) => agent.state === 'OnMission')

      expect(deployedAgents).toHaveLength(2)

      const [activeMission] = gameState.missionSites
      assertDefined(activeMission)

      expect(activeMission.enemies.some((enemy) => enemy.isOfficer)).toBe(true)

      const [highThreatFaction] = gameState.factions
      assertDefined(highThreatFaction)

      expect(highThreatFaction.threatLevel).toBeGreaterThanOrEqual(80)
    })
  })

  describe('Test Data Generation', () => {
    test('generate multiple unique entities', () => {
      const agents = AgentFixture.many(10)
      const uniqueIds = new Set(agents.map((agent) => agent.id))

      expect(uniqueIds.size).toBe(10) // All IDs are unique

      const leads = LeadFixture.many(5, { intelCost: 20 })

      expect(leads.every((lead) => lead.intelCost === 20)).toBe(true)
    })

    test('reset counters for test isolation', () => {
      const agent1 = AgentFixture.default()

      expect(agent1.id).toBe('agent-1')

      resetAllFixtures()

      const agent2 = AgentFixture.default()

      expect(agent2.id).toBe('agent-1') // Counter reset
    })
  })
})
