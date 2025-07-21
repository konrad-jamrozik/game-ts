import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type GameEvent = {
  id: number
  message: string
  timestamp: number
  turn: number
  actionsCount: number
}

export type EventsState = {
  events: GameEvent[]
  nextEventId: number
}

const initialState: EventsState = {
  events: [],
  nextEventId: 1,
}

const MAX_EVENTS = 10

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent(state, action: PayloadAction<{ message: string; turn: number; actionsCount: number }>) {
      const event: GameEvent = {
        id: state.nextEventId,
        message: action.payload.message,
        timestamp: Date.now(),
        turn: action.payload.turn,
        actionsCount: action.payload.actionsCount,
      }
      state.events.unshift(event)
      state.nextEventId += 1

      // Keep only the most recent events
      if (state.events.length > MAX_EVENTS) {
        state.events.splice(MAX_EVENTS)
      }
    },
    clearEvents(state) {
      state.events = []
    },
  },
})

export const { addEvent, clearEvents } = eventsSlice.actions
export default eventsSlice.reducer
