import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

// Mock the wipeStorage function - must be defined outside to avoid hoisting issues
vi.mock('../src/app/persist', () => ({
  wipeStorage: vi.fn<() => Promise<void>>(async (): Promise<void> => {
    // Mock implementation that returns void
  }),
}))

// Component that throws an error when shouldError is true
function ErrorThrowingComponent({ shouldError }: { shouldError: boolean }): React.JSX.Element {
  if (shouldError) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

const describeName = 'ErrorBoundary'

describe(describeName, () => {
  test('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldError={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  test('should render error UI with Wipe IndexedDB button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldError={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText('An unexpected error occurred. You can try wiping the stored data to recover.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wipe IndexedDB' })).toBeInTheDocument()
  })

  test('should have clickable Wipe IndexedDB button', () => {
    expect.hasAssertions()

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldError={true} />
      </ErrorBoundary>,
    )

    const wipeButton = screen.getByRole('button', { name: 'Wipe IndexedDB' })

    expect(wipeButton).toBeInTheDocument()

    // Just verify the button can be clicked without error
    fireEvent.click(wipeButton)

    expect(wipeButton).toBeInTheDocument()
  })
})
