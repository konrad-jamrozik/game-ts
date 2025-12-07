import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ExpansionState = {
  cards: Record<string, boolean>
}

const initialState: ExpansionState = {
  cards: {},
}

const expansionSlice = createSlice({
  name: 'expansion',
  initialState,
  reducers: {
    setCardExpanded(state, action: PayloadAction<{ id: string; expanded: boolean }>) {
      state.cards[action.payload.id] = action.payload.expanded
    },
  },
})

export const { setCardExpanded } = expansionSlice.actions
export default expansionSlice.reducer
