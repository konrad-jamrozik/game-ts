import { ActionCreators } from 'redux-undo'
import { reset } from '../model/gameStateSlice'
import type { AppDispatch } from './store'

// Using thunk here avoid double dispatch. There are many ways to do it,
// but here thunk works best because we have to invoke ActionCreators.clearHistory(),
// whose logic we don't control/
// Reference:
// https://redux.js.org/style-guide/#avoid-dispatching-many-actions-sequentially
// Cannot call dispatch from reducer:
// https://redux.js.org/api/store#dispatchaction
// https://redux.js.org/usage/writing-logic-thunks
// 🚧 KJA this is not actually a Thunk
export function resetGameThunk(dispatch: AppDispatch): void {
  dispatch(reset())
  dispatch(ActionCreators.clearHistory())
}
