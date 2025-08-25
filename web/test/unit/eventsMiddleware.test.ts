import { ActionCreators } from 'redux-undo'
import { beforeEach, describe, expect, test } from 'vitest'
import { store } from '../../src/app/store'
import { clearEvents } from '../../src/lib/slices/eventsSlice'
import { advanceTurn, hireAgent, reset } from '../../src/lib/slices/gameStateSlice'

describe('Events Middleware', () => {
  beforeEach(() => {
    // Reset the store and clear events before each test
    store.dispatch(ActionCreators.clearHistory())
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
    const { events } = store.getState().events
    const [first] = events

    expect(events).toHaveLength(1)
    expect(first?.type).toBe('Text')
    expect(first && first.type === 'Text' ? first.message : undefined).toBe('Turn 2 started')
    expect(first?.turn).toBe(2)
  })

  test('creates event when hiring agent', () => {
    expect.hasAssertions()

    store.dispatch(clearEvents())

    // Hire agent
    store.dispatch(hireAgent())

    // Should create an agent hired event
    const { events } = store.getState().events
    const [first] = events

    expect(events).toHaveLength(1)
    expect(first?.type).toBe('Text')
    expect(first && first.type === 'Text' ? first.message : undefined).toBe('Agent hired')
    expect(first?.turn).toBe(1)
  })

  test('does not create event when resetting game and clears events', () => {
    expect.hasAssertions()

    // First make some changes
    store.dispatch(advanceTurn())
    store.dispatch(hireAgent())
    store.dispatch(clearEvents()) // Clear events from those actions

    // Reset game
    store.dispatch(reset())

    // Should not create a game reset event; events are cleared
    const { events } = store.getState().events

    expect(events).toHaveLength(0)
  })

  test('does not create event when undoing action', () => {
    expect.hasAssertions()

    // First perform an undoable action
    store.dispatch(hireAgent())
    store.dispatch(clearEvents()) // Clear events from that action

    // Undo the action
    store.dispatch(ActionCreators.undo())

    // Should not create an undo event
    const { events } = store.getState().events

    expect(events).toHaveLength(0)
  })

  test('does not create event when redoing action', () => {
    expect.hasAssertions()

    // First perform an action, then undo it
    store.dispatch(hireAgent())
    store.dispatch(ActionCreators.undo())
    store.dispatch(clearEvents()) // Clear events from those actions

    // Redo the action
    store.dispatch(ActionCreators.redo())

    // Should not create a redo event
    const { events } = store.getState().events

    expect(events).toHaveLength(0)
  })

  test('does not create event when resetting turn', () => {
    expect.hasAssertions()

    // First make some actions in the current turn
    store.dispatch(hireAgent())
    store.dispatch(hireAgent())
    store.dispatch(clearEvents()) // Clear events from those actions

    // Reset turn (jump to past index 0)
    store.dispatch(ActionCreators.jumpToPast(0))

    // Should not create a turn reset event
    const { events } = store.getState().events

    expect(events).toHaveLength(0)
  })
})
