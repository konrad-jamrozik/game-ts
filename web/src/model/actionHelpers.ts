/**
 * Helper functions for Redux action creators to reduce boilerplate
 */

type PlayerActionResult<T = undefined> = {
  payload: T
  meta: { playerAction: boolean }
}

/**
 * Creates a prepare function for player actions with no payload
 */
export function withPlayerAction(): PlayerActionResult {
  return { payload: undefined, meta: { playerAction: true } }
}

/**
 * Creates a prepare function for player actions with a single payload
 */
export function withPlayerActionPayload<T>(payload: T): PlayerActionResult<T> {
  return { payload, meta: { playerAction: true } }
}

/**
 * Creates a prepare function factory for player actions with specific payload types
 */
export function createPlayerActionPrepare<T>(): (payload: T) => PlayerActionResult<T> {
  return (payload: T): PlayerActionResult<T> => ({ payload, meta: { playerAction: true } })
}
