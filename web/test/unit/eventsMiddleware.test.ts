import { beforeEach, describe, expect, test } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { debugAddMoney, debugSpawnMissions, reset } from '../../src/redux/slices/gameStateSlice'
import { getStore } from '../../src/redux/store'

describe('eventsMiddleware', () => {
  beforeEach(() => {
    const store = getStore()
    store.dispatch(reset())
    store.dispatch(clearEvents())
    store.dispatch(ActionCreators.clearHistory())
  })

  test('logs debug actions as action-controlled player actions', () => {
    const store = getStore()

    store.dispatch(debugAddMoney())

    const event = store.getState().events.events.find((candidate) => candidate.type === 'Text')
    expect(event).toMatchObject({
      type: 'Text',
      message: 'Debug: add money',
      actionsCount: 1,
      eventRowControl: 'ActionControlled',
    })
  })

  test('keeps world events from the same dispatch non-action controlled', () => {
    const store = getStore()

    store.dispatch(debugSpawnMissions())

    const events = store.getState().events.events
    const debugEvent = events.find((event) => event.type === 'Text' && event.message === 'Debug: spawn missions')
    const worldEvent = events.find(
      (event) => event.type === 'Text' && event.message.startsWith('New mission site available:'),
    )
    expect(debugEvent).toMatchObject({
      actionsCount: 1,
      eventRowControl: 'ActionControlled',
    })
    expect(worldEvent).toMatchObject({
      actionsCount: 1,
      eventRowControl: 'WorldEvent',
    })
  })
})
