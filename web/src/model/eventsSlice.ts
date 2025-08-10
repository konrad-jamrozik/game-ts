import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MissionRewards, MissionSiteState } from './model'

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
  missionSiteId: string
  finalState: MissionSiteState
  agentsLost: number
  agentsWounded: number
  agentsUnscathed: number
}

export type GameEvent = TextEvent | MissionCompletedEvent

export type EventsState = {
  events: GameEvent[]
  nextEventId: number
}

const initialEventsState: EventsState = {
  events: [],
  nextEventId: 1,
}

const MAX_EVENTS = 10

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
        missionTitle: string
        rewards: MissionRewards
        missionSiteId: string
        finalState: MissionSiteState
        agentsLost: number
        agentsWounded: number
        agentsUnscathed: number
      }>,
    ) {
      const event: MissionCompletedEvent = {
        id: state.nextEventId,
        type: 'MissionCompleted',
        missionTitle: action.payload.missionTitle,
        rewards: action.payload.rewards,
        missionSiteId: action.payload.missionSiteId,
        finalState: action.payload.finalState,
        agentsLost: action.payload.agentsLost,
        agentsWounded: action.payload.agentsWounded,
        agentsUnscathed: action.payload.agentsUnscathed,
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
  },
})

export const { addTextEvent, addMissionCompletedEvent, truncateEventsTo, clearEvents } = eventsSlice.actions
export default eventsSlice.reducer
