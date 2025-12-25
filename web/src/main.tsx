import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './components/App'
import { store } from './redux/store'
import { ErrorBoundary } from './components/Error/ErrorBoundary'
import { showErrorToast } from './components/utils/errorToast'
import theme from './components/styling/theme'

// Global error handler for unhandled promise rejections
globalThis.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason instanceof Error ? event.reason.message : String(event.reason)
  console.error('Unhandled promise rejection:', event.reason)
  showErrorToast(`Unhandled Promise Rejection: ${errorMessage}`)
  // Force a React error boundary to catch this
  throw new Error(`Unhandled Promise Rejection: ${errorMessage}`)
})

// Global error handler for uncaught errors
globalThis.addEventListener('error', (event) => {
  const errorMessage = event.error instanceof Error ? event.error.message : String(event.error)
  console.error('Uncaught error:', event.error)
  showErrorToast(`Error: ${errorMessage}`)
})

const rootElement = document.querySelector('#root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider theme={theme} defaultMode="dark">
          <CssBaseline enableColorScheme>
            <Provider store={store}>
              <App />
            </Provider>
          </CssBaseline>
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
} else {
  console.error('Could not find #root element! Ensure that index.html has an element with id="root"')
}
