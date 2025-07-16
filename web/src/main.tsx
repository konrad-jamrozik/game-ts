import { ThemeProvider } from '@mui/material'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App.tsx'
import { GameStateContextProvider } from './contexts/GameStateContextProvider.tsx'
import './index.css'
import theme from './theme'

const rootElement = document.querySelector('#root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <GameStateContextProvider>
          <App />
        </GameStateContextProvider>
      </ThemeProvider>
    </StrictMode>,
  )
} else {
  console.error('Could not find #root element! Ensure that index.html has an element with id="root"')
}

