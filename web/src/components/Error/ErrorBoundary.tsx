import { Component, type ReactNode, type ErrorInfo } from 'react'
import { wipeStorage } from '../../redux/persist'
import { showErrorToast } from '../utils/errorToast'

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

type ErrorBoundaryProps = {
  children: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  private static handleWipeIndexedDB(): void {
    wipeStorage()
      .then(() => {
        // Reload the page after wiping IndexedDB
        globalThis.location.reload()
      })
      .catch((error: unknown) => {
        console.error('Failed to wipe IndexedDB:', error)
        // Use console.error instead of alert for better UX
        console.error('Failed to wipe IndexedDB. Please try refreshing the page manually.')
      })
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo)
    showErrorToast(error.message)
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            An unexpected error occurred. You can try wiping the stored data to recover.
          </p>
          {this.state.error && (
            <details style={{ marginBottom: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#007bff' }}>Error details</summary>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxWidth: '80vw',
                }}
              >
                {(this.state.error.stack ?? this.state.error.message) || 'Unknown error'}
              </pre>
            </details>
          )}
          <button
            type="button"
            onClick={() => {
              ErrorBoundary.handleWipeIndexedDB()
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(event) => {
              event.currentTarget.style.backgroundColor = '#c82333'
            }}
            onMouseOut={(event) => {
              event.currentTarget.style.backgroundColor = '#dc3545'
            }}
          >
            Wipe IndexedDB
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
