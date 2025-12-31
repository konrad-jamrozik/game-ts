import type { PayloadAction } from '@reduxjs/toolkit'
import type { GameState } from '../../lib/model/gameStateModel'
import { bldInitialState } from '../../lib/factories/gameStateFactory'
import evaluateTurn from '../../lib/game_utils/turn_advancement/evaluateTurn'
import { isGameLost, isGameWon } from '../../lib/game_utils/gameStateChecks'
import { log } from '../../lib/primitives/logger'

export function advanceTurn(state: GameState): void {
  log.info('game', `Advance to turn ${state.turn + 1}`)
  const turnReport = evaluateTurn(state)
  state.turnStartReport = turnReport

  // Check for game win/loss after turn advancement
  if (isGameWon(state)) {
    log.info('game', 'Game won!')
  } else if (isGameLost(state)) {
    log.info('game', 'Game lost!')
  }
}

export function reset(
  state: GameState,
  action: PayloadAction<{ debug?: boolean; customState?: GameState } | undefined>,
): void {
  log.info('game', 'Reset to turn 1')
  const stateAfterReset = action.payload?.customState ?? bldInitialState({ debug: action.payload?.debug === true })
  Object.assign(state, stateAfterReset)
}
