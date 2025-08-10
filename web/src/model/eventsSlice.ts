import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MissionRewards } from './model'

export type BaseEventFields = {
  id: number
  timestamp: number
  turn: number
  actionsCount: number
}

export type TextEvent = BaseEventFields & {
  type: 'Text'
  message: string
}

export type MissionCompletedEvent = BaseEventFields & {
  type: 'MissionCompleted'
  missionTitle: string
  rewards: MissionRewards
}

export type GameEvent = TextEvent | MissionCompletedEvent

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
    addTextEvent(state, action: PayloadAction<{ message: string; turn: number; actionsCount: number }>) {
      const event: TextEvent = {
        id: state.nextEventId,
        type: 'Text',
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
    addMissionCompletedEvent(
      state,
      action: PayloadAction<{ turn: number; actionsCount: number; missionTitle: string; rewards: MissionRewards }>,
    ) {
      const event: MissionCompletedEvent = {
        id: state.nextEventId,
        type: 'MissionCompleted',
        missionTitle: action.payload.missionTitle,
        rewards: action.payload.rewards,
        timestamp: Date.now(),
        turn: action.payload.turn,
        actionsCount: action.payload.actionsCount,
      }
      state.events.unshift(event)
      state.nextEventId += 1

      if (state.events.length > MAX_EVENTS) {
        state.events.splice(MAX_EVENTS)
      }
    },
    clearEvents(state) {
      state.events = []
    },
  },
})

export const { addTextEvent, addMissionCompletedEvent, clearEvents } = eventsSlice.actions
export default eventsSlice.reducer
