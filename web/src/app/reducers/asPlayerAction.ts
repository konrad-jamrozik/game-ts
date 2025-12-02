import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import type { GameState } from '../../lib/model/gameStateModel'

export type PlayerActionResult<T = undefined> = {
  payload: T
  meta: { playerAction: boolean }
}

export function asPlayerAction(reducer: CaseReducer<GameState, PayloadAction<undefined>>): {
  reducer: typeof reducer
  prepare: () => PlayerActionResult
}
export function asPlayerAction<TPayload>(reducer: CaseReducer<GameState, PayloadAction<TPayload>>): {
  reducer: typeof reducer
  prepare: (payload: TPayload) => PlayerActionResult<TPayload>
}
export function asPlayerAction<TPayload>(reducer: CaseReducer<GameState, PayloadAction<TPayload>>): {
  reducer: typeof reducer
  prepare: (...args: [] | [TPayload]) => PlayerActionResult | PlayerActionResult<TPayload>
} {
  return {
    reducer(state: GameState, action: PayloadAction<TPayload>): void {
      reducer(state, action)
      state.actionsCount += 1
    },
    prepare: (...args: [] | [TPayload]) =>
      (args.length === 0
        ? { payload: undefined, meta: { playerAction: true } }
        : { payload: args[0], meta: { playerAction: true } }) as PlayerActionResult | PlayerActionResult<TPayload>,
  }
}

export function isPlayerAction(action: unknown): action is { meta: { playerAction: boolean } } {
  return (
    typeof action === 'object' &&
    action !== null &&
    'meta' in action &&
    typeof action.meta === 'object' &&
    action.meta !== null &&
    'playerAction' in action.meta
  )
}
