import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ExpansionState = {
  cards: Record<string, boolean>
}

export const ALL_CARD_IDS = [
  'game-controls',
  'player-actions',
  'ai-player-section',
  'event-log',
  'debug',
  'missions',
  'leads',
  'lead-investigations',
  'agents',
  'assets',
  'capacities',
  'upgrades',
  'situation-report',
  'turn-report',
  'turn-report-assets',
  'turn-report-situation',
  'deprecated-missions',
  'deprecated-archived-missions',
] as const

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
    expandAllCards(state) {
      for (const id of ALL_CARD_IDS) {
        state.cards[id] = true
      }
    },
    collapseAllCards(state) {
      for (const id of ALL_CARD_IDS) {
        state.cards[id] = false
      }
    },
  },
})

export const { setCardExpanded, expandAllCards, collapseAllCards } = expansionSlice.actions
export default expansionSlice.reducer
