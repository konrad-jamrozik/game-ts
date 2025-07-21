import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, test } from 'vitest'
import { store } from '../src/app/store'
import { EventLog } from '../src/components/EventLog'
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
})
