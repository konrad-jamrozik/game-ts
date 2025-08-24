import { describe, expect, test, beforeEach } from 'vitest'
import { agV } from '../src/lib/model/agents/AgentView'
import { AgentFixture, resetAllFixtures } from './fixtures'

describe('effectiveSkill', () => {
  beforeEach(() => {
    resetAllFixtures()
  })

  test('calculate effective skill correctly with no exhaustion and no hit points lost', () => {
    const agent = AgentFixture.default()

    // effective_skill = floor(100 * (1 - 0/30) * (1 - 0/100)) = floor(100 * 1 * 1) = 100
    expect(agV(agent).effectiveSkill()).toBe(100)
  })

  test('calculate effective skill correctly with exhaustion only', () => {
    const agent = AgentFixture.new({
      skill: 116,
      exhaustion: 20,
    })

    // effective_skill = floor(116 * (1 - 0/30) * (1 - 15/100)) = floor(116 * 1 * 0.85) = floor(98.6) = 98
    expect(agV(agent).effectiveSkill()).toBe(98)
  })

  test('calculate effective skill correctly with hit points lost only', () => {
    const agent = AgentFixture.wounded(7) // Creates agent with 7 HP lost (23/30 HP)

    // hit points lost = 30 - 23 = 7
    // effective_skill = floor(100 * (1 - 7/30) * (1 - 0/100)) = floor(100 * 0.76666... * 1) = floor(76.666...) = 76
    expect(agV(agent).effectiveSkill()).toBe(76)
  })

  test('calculate effective skill correctly with both exhaustion and hit points lost', () => {
    const agent = AgentFixture.new({
      skill: 150,
      exhaustion: 20,
      hitPoints: 23,
      maxHitPoints: 30,
    })

    // hit points lost = 30 - 23 = 7
    // effective_skill = floor(150 * (1 - 7/30) * (1 - 15/100)) = floor(150 * 0.76666... * 0.85) = floor(97.75) = 97
    expect(agV(agent).effectiveSkill()).toBe(97)
  })

  test('handle high exhaustion correctly', () => {
    const agent = AgentFixture.exhausted(85)

    // effective_skill = floor(100 * (1 - 0/30) * (1 - 80/100)) = floor(100 * 1 * 0.2) = floor(20) = 20
    expect(agV(agent).effectiveSkill()).toBe(20)
  })

  test('handle 100% exhaustion correctly', () => {
    const agent = AgentFixture.exhausted(100)

    // effective_skill = floor(100 * (1 - 0/30) * (1 - 95/100)) = floor(100 * 1 * 0.95) = floor(5) = 5
    expect(agV(agent).effectiveSkill()).toBe(5)
  })

  test('handle zero hit points correctly', () => {
    const agent = AgentFixture.new({
      hitPoints: 0,
      maxHitPoints: 30,
    })

    // hit points lost = 30 - 0 = 30
    // effective_skill = floor(100 * (1 - 30/30) * (1 - 0/100)) = floor(100 * 0 * 1) = floor(0) = 0
    expect(agV(agent).effectiveSkill()).toBe(0)
  })

  test('handle zero max hit points correctly', () => {
    const agent = AgentFixture.new({
      hitPoints: 0,
      maxHitPoints: 0,
    })

    // effective_skill = floor(100 * (1 - 0) * (1 - 0/100)) = floor(100 * 1 * 1) = floor(100) = 100
    expect(agV(agent).effectiveSkill()).toBe(100)
  })
})
