import type { GameState } from '../../model/model'
import { bps } from '../../model/bps'
import { asPlayerAction } from './asPlayerAction'

export const debugSetPanicToZero = asPlayerAction((state: GameState) => {
  state.panic = bps(0)
})

export const debugSetAllFactionsSuppressionTo1000Percent = asPlayerAction((state: GameState) => {
  // 1000% = 100,000 basis points
  for (const faction of state.factions) {
    faction.suppression = bps(100_000)
  }
})

export const debugAddMoney = asPlayerAction((state: GameState) => {
  state.money += 10_000
})
