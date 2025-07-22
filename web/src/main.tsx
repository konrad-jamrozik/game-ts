import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './app/App.tsx'
import { store } from './app/store'
import theme from './styling/theme.tsx'

const rootElement = document.querySelector('#root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider theme={theme} defaultMode="dark">
        <CssBaseline enableColorScheme>
          <Provider store={store}>
            <App />
          </Provider>
        </CssBaseline>
      </ThemeProvider>
    </StrictMode>,
  )
} else {
  console.error('Could not find #root element! Ensure that index.html has an element with id="root"')
}
