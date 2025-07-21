import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SerializableGridRowSelectionModel = {
  type: 'include' | 'exclude'
  ids: (string | number)[]
}

export type SelectionState = {
  agents: SerializableGridRowSelectionModel
}

const initialState: SelectionState = {
  agents: {
    ids: [],
    type: 'include',
  },
}

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setAgentSelection(state, action: PayloadAction<SerializableGridRowSelectionModel>) {
      state.agents = action.payload
    },
    clearAgentSelection(state) {
      state.agents = {
        ids: [],
        type: 'include',
      }
    },
  },
})

export const { setAgentSelection, clearAgentSelection } = selectionSlice.actions
export default selectionSlice.reducer
