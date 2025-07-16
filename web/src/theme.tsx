import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#556cd6',
        },
        error: {
          main: red.A400,
        },
        background: {
          default: '#212121',
          paper: '#424242',
        },
      },
    },
    light: {
      palette: {
        primary: {
          main: '#8593d3ff',
        },
        error: {
          main: red.A400,
        },
        background: {
          default: '#f5f5f5',
          paper: '#fff',
        },
      },
    },
  },
})

export default theme
