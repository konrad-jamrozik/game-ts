import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './components/App'
import { store } from './redux/store'
import { ErrorBoundary } from './components/Error/ErrorBoundary'
import theme from './components/styling/theme'

// Global error handler for unhandled promise rejections
globalThis.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Force a React error boundary to catch this
  throw new Error(`Unhandled Promise Rejection: ${String(event.reason)}`)
})

// Global error handler for uncaught errors
globalThis.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
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
