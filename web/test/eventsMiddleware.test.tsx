import { beforeEach, describe, expect, test } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { store } from '../src/app/store'
import { clearEvents } from '../src/model/eventsSlice'
import { advanceTurn, hireAgent, reset } from '../src/model/gameStateSlice'

describe('Events Middleware', () => {
  beforeEach(() => {
    // Reset the store and clear events before each test
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

  test('creates event when advancing turn', () => {
    expect.hasAssertions()

    // Initial state should have no events
    expect(store.getState().events.events).toHaveLength(0)

    // Advance turn
    store.dispatch(advanceTurn())

    // Should create a turn advance event
    const events = store.getState().events.events
    expect(events).toHaveLength(1)
    expect(events[0]?.message).toBe('Turn 2 started')
    expect(events[0]?.turn).toBe(1) // Previous turn
  })

  test('creates event when hiring agent', () => {
    expect.hasAssertions()

    store.dispatch(clearEvents())

    // Hire agent
    store.dispatch(hireAgent())

    // Should create an agent hired event
    const events = store.getState().events.events
    expect(events).toHaveLength(1)
    expect(events[0]?.message).toBe('Agent hired')
    expect(events[0]?.turn).toBe(1)
  })

  test('creates event when resetting game', () => {
    expect.hasAssertions()

    // First make some changes
    store.dispatch(advanceTurn())
    store.dispatch(hireAgent())
    store.dispatch(clearEvents()) // Clear events from those actions

    // Reset game
    store.dispatch(reset())

    // Should create a game reset event
    const events = store.getState().events.events
    expect(events).toHaveLength(1)
    expect(events[0]?.message).toBe('Game reset')
  })

  test('creates event when undoing action', () => {
    expect.hasAssertions()

    // First perform an undoable action
    store.dispatch(hireAgent())
    store.dispatch(clearEvents()) // Clear events from that action

    // Undo the action
    store.dispatch(ActionCreators.undo())

    // Should create an undo event
    const events = store.getState().events.events
    expect(events).toHaveLength(1)
    expect(events[0]?.message).toBe('Action undone')
  })

  test('creates event when redoing action', () => {
    expect.hasAssertions()

    // First perform an action, then undo it
    store.dispatch(hireAgent())
    store.dispatch(ActionCreators.undo())
    store.dispatch(clearEvents()) // Clear events from those actions

    // Redo the action
    store.dispatch(ActionCreators.redo())

    // Should create a redo event
    const events = store.getState().events.events
    expect(events).toHaveLength(1)
    expect(events[0]?.message).toBe('Action redone')
  })

  test('creates event when resetting turn', () => {
    expect.hasAssertions()

    // First make some actions in the current turn
    store.dispatch(hireAgent())
    store.dispatch(hireAgent())
    store.dispatch(clearEvents()) // Clear events from those actions

    // Reset turn (jump to past index 0)
    store.dispatch(ActionCreators.jumpToPast(0))

    // Should create a turn reset event
    const events = store.getState().events.events
    expect(events).toHaveLength(1)
    expect(events[0]?.message).toBe('Turn reset')
  })
})
