import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MissionRewards } from '../../lib/model/missionModel'
import type { MissionId } from '../../lib/model/modelIds'
import type { MissionState } from '../../lib/model/outcomeTypes'

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
  missionName: string
  rewards: MissionRewards
  missionId: MissionId
  finalState: MissionState
}

export type TurnAdvancementEvent = BaseEventFields & {
  type: 'TurnAdvancement'
}

export type GameEvent = TextEvent | MissionCompletedEvent | TurnAdvancementEvent

export type EventsState = {
  events: GameEvent[]
  nextEventId: number
}

const initialEventsState: EventsState = {
  events: [],
  nextEventId: 1,
}

const MAX_EVENTS = 1000

// Keep events for the last 3 turns (N, N-1, N-2)
// This must match RECENT_TURNS_TO_KEEP in historyCompaction.ts
const RECENT_TURNS_TO_KEEP = 3

const eventsSlice = createSlice({
  name: 'events',
  initialState: initialEventsState,
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
      action: PayloadAction<{
        turn: number
        actionsCount: number
        missionName: string
        rewards: MissionRewards
        missionId: MissionId
        finalState: MissionState
      }>,
    ) {
      const event: MissionCompletedEvent = {
        id: state.nextEventId,
        type: 'MissionCompleted',
        missionName: action.payload.missionName,
        rewards: action.payload.rewards,
        missionId: action.payload.missionId,
        finalState: action.payload.finalState,
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
    addTurnAdvancementEvent(
      state,
      action: PayloadAction<{
        turn: number
        actionsCount: number
      }>,
    ) {
      const event: TurnAdvancementEvent = {
        id: state.nextEventId,
        type: 'TurnAdvancement',
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
    // Permanently remove any events that occur after the specified timeline pointer
    // Events strictly after (turn, actionsCount) are dropped. Events at the same
    // (turn, actionsCount) or earlier are preserved.
    truncateEventsTo(
      state,
      action: PayloadAction<{
        turn: number
        actionsCount: number
      }>,
    ) {
      const { turn, actionsCount } = action.payload
      state.events = state.events.filter(
        (event) => event.turn < turn || (event.turn === turn && event.actionsCount <= actionsCount),
      )
    },
    clearEvents(state) {
      state.events = []
    },
    // Remove events from turns older than the last 3 turns (N-3 and earlier)
    compactEventsByTurn(state, action: PayloadAction<{ currentTurn: number }>) {
      const { currentTurn } = action.payload
      // Turns at or below this threshold will have their events removed
      const oldTurnThreshold = currentTurn - RECENT_TURNS_TO_KEEP

      // Remove events from old turns
      state.events = state.events.filter((event) => event.turn > oldTurnThreshold)

      // Also enforce overall limit
      if (state.events.length > MAX_EVENTS) {
        state.events.splice(MAX_EVENTS)
      }
    },
  },
})

export const {
  addTextEvent,
  addMissionCompletedEvent,
  addTurnAdvancementEvent,
  truncateEventsTo,
  clearEvents,
  compactEventsByTurn,
} = eventsSlice.actions
export default eventsSlice.reducer
