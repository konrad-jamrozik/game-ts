import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { store } from '../src/app/store'
import { EventLog } from '../src/components/EventLog'
import { clearEvents } from '../src/model/eventsSlice'
import { reset } from '../src/model/gameStateSlice'

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

  test('displays "No events yet" when there are no events', () => {
    expect.hasAssertions()

    renderEventLog()

    expect(screen.getByText('Event Log')).toBeInTheDocument()
    expect(screen.getByText('No events yet')).toBeInTheDocument()
  })

  test('displays events when they exist in the state', async () => {
    expect.hasAssertions()

    const { hireAgent } = await import('../src/model/gameStateSlice')
    store.dispatch(hireAgent())

    renderEventLog()

    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })

  test('shows "New game started" event when store initializes without persisted state', async () => {
    expect.hasAssertions()

    const { addEvent } = await import('../src/model/eventsSlice')
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
