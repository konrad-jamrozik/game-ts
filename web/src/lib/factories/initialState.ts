import type { GameState } from '../model/gameStateModel'
import { bldInitialState } from './gameStateFactory'

const initialState: GameState = bldInitialState()

export default initialState

export { bldInitialState } from './gameStateFactory'
