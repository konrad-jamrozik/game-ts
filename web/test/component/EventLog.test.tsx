import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { store } from '../../src/app/store'
import { EventLog } from '../../src/components/EventLog'
import { clearEvents } from '../../src/app/slices/eventsSlice'
import { reset } from '../../src/app/slices/gameStateSlice'

function renderEventLog(): void {
  render(
    <Provider store={store}>
      <EventLog />
    </Provider>,
  )
}

describe(EventLog, () => {
  beforeEach(() => {
    // Reset the store before each test
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

  test('happy path: no events', () => {
    expect.hasAssertions()

    renderEventLog()

    expect(screen.getByText('Event Log')).toBeInTheDocument()
    expect(screen.getByText('No events yet')).toBeInTheDocument()
  })

  test('happy path: events', async () => {
    expect.hasAssertions()

    const { hireAgent } = await import('../../src/app/slices/gameStateSlice')
    store.dispatch(hireAgent())

    renderEventLog()

    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })

  test('happy path: new game started', async () => {
    expect.hasAssertions()

    const { addTextEvent: addEvent } = await import('../../src/app/slices/eventsSlice')
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
