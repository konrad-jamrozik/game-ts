import type { PayloadAction } from '@reduxjs/toolkit'
import type { GameState } from '../../lib/model/gameStateModel'
import { bldInitialState } from '../../lib/ruleset/initialState'
import evaluateTurn from '../../lib/game_utils/turn_advancement/evaluateTurn'

export function advanceTurn(state: GameState): void {
  const turnReport = evaluateTurn(state)
  state.turnStartReport = turnReport
}

export function reset(
  state: GameState,
  action: PayloadAction<{ debug?: boolean; customState?: GameState } | undefined>,
): void {
  const stateAfterReset = action.payload?.customState ?? bldInitialState({ debug: action.payload?.debug === true })
  Object.assign(state, stateAfterReset)
}
