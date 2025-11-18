import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { ErrorBoundary } from '../../src/components/ErrorBoundary'

// Mock the wipeStorage function - must be defined outside to avoid hoisting issues
vi.mock(import('../../src/app/persist'), () => ({
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

describe(ErrorBoundary, () => {
  test('happy path (no error)', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldError={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  test('error', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldError={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText('An unexpected error occurred. You can try wiping the stored data to recover.'),
    ).toBeInTheDocument()

    const wipeButton = screen.getByRole('button', { name: 'Wipe IndexedDB' })

    expect(wipeButton).toBeInTheDocument()

    // Just verify the button can be clicked without error
    fireEvent.click(wipeButton)

    expect(wipeButton).toBeInTheDocument()
  })
})
