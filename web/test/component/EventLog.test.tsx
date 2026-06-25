import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { ActionCreators } from 'redux-undo'
import { getStore } from '../../src/redux/store'
import { EventLog } from '../../src/components/EventLog'
import { hireAgent, reset } from '../../src/redux/slices/gameStateSlice'
import { addTextEvent, addWorldTextEvent } from '../../src/redux/slices/eventsSlice'
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
  })

  test('happy path: events', () => {
    expect.hasAssertions()
    const store = getStore()

    store.dispatch(hireAgent())

    renderEventLog()

    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  test('world events render without actions count or time travel button', () => {
    expect.hasAssertions()
    const store = getStore()

    store.dispatch(hireAgent())
    const { gameState } = store.getState().undoable.present
    store.dispatch(
      addWorldTextEvent({
        message: 'New mission site available: Downtown',
        turn: gameState.turn,
        actionsCount: gameState.actionsCount,
      }),
    )

    renderEventLog()

    const actionRow = getEventLogRowByText('Agent hired')
    const actionCells = within(actionRow).getAllByRole('gridcell')
    expect(actionCells[1]).toHaveTextContent('1')
    expect(within(actionRow).getByRole('button', { name: 'Undo' })).toBeInTheDocument()

    const worldEventRow = getEventLogRowByText('New mission site available: Downtown')
    const worldEventCells = within(worldEventRow).getAllByRole('gridcell')
    expect(worldEventCells[1]).toHaveTextContent(/^$/u)
    expect(within(worldEventRow).queryByRole('button', { name: /Undo|Redo/u })).not.toBeInTheDocument()
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

function getEventLogRowByText(text: string): HTMLElement {
  const row = screen.getAllByRole('row').find((candidate) => within(candidate).queryByText(text) !== null)
  assertDefined(row)
  return row
}
