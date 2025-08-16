import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import type { GameState } from '../lib/model'

export type PlayerActionResult<T = undefined> = {
  payload: T
  meta: { playerAction: boolean }
}

function asPlayerAction(reducer: CaseReducer<GameState, PayloadAction<undefined>>): {
  reducer: typeof reducer
  prepare: () => PlayerActionResult
}
function asPlayerAction<TPayload>(reducer: CaseReducer<GameState, PayloadAction<TPayload>>): {
  reducer: typeof reducer
  prepare: (payload: TPayload) => PlayerActionResult<TPayload>
}
function asPlayerAction<TPayload>(reducer: CaseReducer<GameState, PayloadAction<TPayload>>): {
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

export default asPlayerAction
