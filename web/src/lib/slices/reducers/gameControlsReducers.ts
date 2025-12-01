import type { PayloadAction } from '@reduxjs/toolkit'
import type { GameState } from '../../model/gameStateModel'
import { makeInitialState } from '../../ruleset/initialState'
import evaluateTurn from '../../turn_advancement/evaluateTurn'

export function advanceTurn(state: GameState): void {
  const turnReport = evaluateTurn(state)
  state.turnStartReport = turnReport
}

export function reset(
  state: GameState,
  action: PayloadAction<{ debug?: boolean; customState?: GameState } | undefined>,
): void {
  const stateAfterReset = action.payload?.customState ?? makeInitialState({ debug: action.payload?.debug === true })
  Object.assign(state, stateAfterReset)
}
