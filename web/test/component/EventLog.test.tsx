import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { getStore } from '../../src/redux/store'
import { EventLog } from '../../src/components/EventLog'
import { clearEvents } from '../../src/redux/slices/eventsSlice'
import { reset } from '../../src/redux/slices/gameStateSlice'

async function renderEventLog(): Promise<void> {
  const store = await getStore()
  render(
    <Provider store={store}>
      <EventLog />
    </Provider>,
  )
}

describe(EventLog, () => {
  beforeEach(async () => {
    const store = await getStore()
    // Reset the store before each test
    store.dispatch(reset())
    store.dispatch(clearEvents())
  })

  test('happy path: no events', async () => {
    expect.hasAssertions()

    await renderEventLog()

    expect(screen.getByText('Event Log')).toBeInTheDocument()
    expect(screen.getByText('No events yet')).toBeInTheDocument()
  })

  test('happy path: events', async () => {
    expect.hasAssertions()
    const store = await getStore()

    const { hireAgent } = await import('../../src/redux/slices/gameStateSlice')
    store.dispatch(hireAgent())

    await renderEventLog()

    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })

  test('happy path: new game started', async () => {
    expect.hasAssertions()
    const store = await getStore()

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

    await renderEventLog()

    expect(screen.getByText('New game started')).toBeInTheDocument()
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })
})
