import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type GameEvent = {
  id: number
  message: string
  timestamp: number
  turn: number
  actionsCount: number
}

export type GameState = {
  actionsCount: number
  turn: number
  agents: number
  money: number
  events: GameEvent[]
  nextEventId: number
}

const initialState: GameState = {
  actionsCount: 0,
  turn: 1,
  agents: 0,
  money: 100,
  events: [],
  nextEventId: 1,
}

const MAX_EVENTS = 10

function addEvent(state: GameState, message: string, options?: { turn?: number; actionsCount?: number }): void {
  const event: GameEvent = {
    id: state.nextEventId,
    message,
    timestamp: Date.now(),
    turn: options?.turn ?? state.turn,
    actionsCount: options?.actionsCount ?? state.actionsCount,
  }
  state.events.unshift(event)
  state.nextEventId += 1

  // Keep only the most recent events
  if (state.events.length > MAX_EVENTS) {
    state.events.splice(MAX_EVENTS)
  }
}

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: {
      // 🚧KJA Dedup this prepare be using something like "withPlayerAction" https://chatgpt.com/c/687c730e-12d4-8011-96fc-be2be1ef5e94
      // Also style guide says many reducers should work with same player action: https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
      // See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
      reducer(state) {
        const previousTurn = state.turn
        const previousActionsCount = state.actionsCount
        state.turn += 1
        state.actionsCount = 0
        addEvent(state, `Turn ${state.turn} started`, { turn: previousTurn, actionsCount: previousActionsCount })
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    hireAgent: {
      reducer(state) {
        state.agents += 1
        state.actionsCount += 1
        addEvent(state, 'Agent hired')
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    setMoney(state, action: PayloadAction<number>) {
      state.money = action.payload
    },
    reset(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { advanceTurn, hireAgent, setMoney, reset } = gameStateSlice.actions
export default gameStateSlice.reducer
