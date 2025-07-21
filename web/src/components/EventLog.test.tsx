import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it, beforeEach } from 'vitest'
import { store } from '../app/store'
import { reset } from '../model/gameStateSlice'
import { EventLog } from './EventLog'

function renderEventLog(): void {
  render(
    <Provider store={store}>
      <EventLog />
    </Provider>
  )
}

describe('EventLog', () => {
  beforeEach(() => {
    // Reset the store before each test
    store.dispatch(reset())
  })

  it('displays "No events yet" when there are no events', () => {
    renderEventLog()
    
    expect(screen.getByText('Event Log')).toBeInTheDocument()
    expect(screen.getByText('No events yet')).toBeInTheDocument()
  })

  it('displays events when they exist in the state', async () => {
    const { hireAgent } = await import('../model/gameStateSlice')
    store.dispatch(hireAgent())
    
    renderEventLog()
    
    expect(screen.getAllByText('Agent hired')).toHaveLength(1)
    expect(screen.queryByText('No events yet')).not.toBeInTheDocument()
  })
})
