import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { getStore } from '../../src/redux/store'
import { EventLog } from '../../src/components/EventLog'
import { reset } from '../../src/redux/slices/gameStateSlice'

function renderEventLog(): void {
  const store = getStore()
  render(
    <Provider store={store}>
      <EventLog />
    </Provider>,
  )
}

describe(EventLog, () => {
  beforeEach(() => {
    const store = getStore()
    // Reset the store before each test
    store.dispatch(reset())
  })

  test('happy path: no events', () => {
    expect.hasAssertions()

    renderEventLog()

    expect(screen.getByText('Event Log')).toBeInTheDocument()
    expect(screen.getByText('No events yet')).toBeInTheDocument()
  })

  test('happy path: events', async () => {
    expect.hasAssertions()
    const store = getStore()

    const { hireAgent } = await import('../../src/redux/slices/gameStateSlice')
    store.dispatch(hireAgent())

    renderEventLog()

    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })

  test('happy path: new game started', async () => {
    expect.hasAssertions()
    const store = getStore()

    const { addTextEvent: addEvent } = await import('../../src/redux/slices/eventsSlice')
    const state = store.getState()
    const { gameState } = state.undoable.present

    // Manually add the "New game started" event to simulate store initialization
    store.dispatch(
      addEvent({
        message: 'New game started',
        turn: gameState.turn,
        actionsCount: gameState.actionsCount,
      }),
    )

    renderEventLog()

    expect(screen.getByText('New game started')).toBeInTheDocument()
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })
})
