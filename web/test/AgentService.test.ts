import { describe, expect, test } from 'vitest'
import { getEffectiveSkill } from '../src/model/AgentService'
import type { Agent } from '../src/model/model'

describe(getEffectiveSkill, () => {
  test('should calculate effective skill correctly with no exhaustion', () => {
    const agent: Agent = {
      id: 'test-agent',
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
    }

    expect(getEffectiveSkill(agent)).toBe(100)
  })

  test('should calculate effective skill correctly with exhaustion', () => {
    const agent: Agent = {
      id: 'test-agent',
      turnHired: 1,
      skill: 116,
      exhaustion: 15,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      state: 'Available',
      assignment: 'Standby',
    }

    // effective_skill = floor(116 * (1 - 15/100)) = floor(116 * 0.85) = floor(98.6) = 98
    expect(getEffectiveSkill(agent)).toBe(98)
  })

  test('should handle high exhaustion correctly', () => {
    const agent: Agent = {
      id: 'test-agent',
      turnHired: 1,
      skill: 100,
      exhaustion: 80,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      state: 'Available',
      assignment: 'Standby',
    }

    // effective_skill = floor(100 * (1 - 80/100)) = floor(100 * 0.2) = floor(19.999999999999996) = 19
    // Note: Due to floating point precision, 100 * (1 - 80/100) equals 19.999999999999996, not exactly 20
    expect(getEffectiveSkill(agent)).toBe(19)
  })

  test('should handle 100% exhaustion correctly', () => {
    const agent: Agent = {
      id: 'test-agent',
      turnHired: 1,
      skill: 100,
      exhaustion: 100,
      hitPoints: 30,
      maxHitPoints: 30,
      recoveryTurns: 0,
      hitPointsLostBeforeRecovery: 0,
      missionsSurvived: 0,
      state: 'Available',
      assignment: 'Standby',
    }

    // effective_skill = floor(100 * (1 - 100/100)) = floor(100 * 0) = floor(0) = 0
    expect(getEffectiveSkill(agent)).toBe(0)
  })
})
