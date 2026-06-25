import { describe, expect, test } from 'vitest'
import { isGameEnded, isGameLost, isGameWon } from '../../src/lib/game_utils/gameStateChecks'
import { bldGameState } from '../../src/lib/factories/gameStateFactory'
import { toF6 } from '../../src/lib/primitives/fixed6'

describe(isGameLost, () => {
  test('lost when money is negative', () => {
    expect.hasAssertions()
    expect(isGameLost(bldGameState({ money: -1 }))).toBe(true)
  })

  test('lost when panic reaches 100%', () => {
    expect.hasAssertions()
    expect(isGameLost(bldGameState({ panic: toF6(1) }))).toBe(true)
  })

  test('not lost in a healthy state', () => {
    expect.hasAssertions()
    expect(isGameLost(bldGameState({ money: 100, panic: toF6(0.5) }))).toBe(false)
  })
})

describe(isGameWon, () => {
  test('won when "Peace on Earth" lead has been investigated', () => {
    expect.hasAssertions()
    expect(isGameWon(bldGameState({ leadInvestigationCounts: { 'lead-peace-on-earth': 1 } }))).toBe(true)
  })

  test('not won when "Peace on Earth" lead has not been investigated', () => {
    expect.hasAssertions()
    expect(isGameWon(bldGameState())).toBe(false)
  })
})

describe(isGameEnded, () => {
  test('ended when the game is lost', () => {
    expect.hasAssertions()
    expect(isGameEnded(bldGameState({ money: -1 }))).toBe(true)
  })

  test('ended when the game is won', () => {
    expect.hasAssertions()
    expect(isGameEnded(bldGameState({ leadInvestigationCounts: { 'lead-peace-on-earth': 1 } }))).toBe(true)
  })

  test('not ended in a healthy in-progress state', () => {
    expect.hasAssertions()
    expect(isGameEnded(bldGameState())).toBe(false)
  })
})
