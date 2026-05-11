import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { EventLog } from '../../src/components/EventLog'
import { hireAgent, reset } from '../../src/redux/slices/gameStateSlice'
import { addTextEvent } from '../../src/redux/slices/eventsSlice'
import { assertDefined } from '../../src/lib/primitives/assertPrimitives'

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
    store.dispatch(reset())
    store.dispatch(ActionCreators.clearHistory())
  })

  test('happy path: no events', () => {
    expect.hasAssertions()

    renderEventLog()

    expect(screen.getByText('Event Log')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Event' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'T#' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'A#' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Undo' })).toBeInTheDocument()
  })

  test('happy path: events', () => {
    expect.hasAssertions()
    const store = getStore()

    store.dispatch(hireAgent())

    renderEventLog()

    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  test('happy path: new game started', () => {
    expect.hasAssertions()
    const store = getStore()

    const state = store.getState()
    const { gameState } = state.undoable.present

    // Manually add the "New game started" event to simulate store initialization
    store.dispatch(
      addTextEvent({
        message: 'New game started',
        turn: gameState.turn,
        actionsCount: gameState.actionsCount,
      }),
    )

    renderEventLog()

    expect(screen.getByText('New game started')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  test('row undo can jump over multiple top events and branching removes redo rows', async () => {
    expect.hasAssertions()
    const store = getStore()

    store.dispatch(hireAgent())
    store.dispatch(hireAgent())
    store.dispatch(hireAgent())

    renderEventLog()

    const undoButtons = screen.getAllByRole('button', { name: 'Undo' })
    const thirdNewestEventUndoButton = undoButtons[2]
    assertDefined(thirdNewestEventUndoButton)

    await userEvent.click(thirdNewestEventUndoButton)

    expect(store.getState().undoable.present.gameState.actionsCount).toBe(0)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Redo' })).toHaveLength(3)
    })

    store.dispatch(hireAgent())

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Redo' })).not.toBeInTheDocument()
    })
    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
  })
})
