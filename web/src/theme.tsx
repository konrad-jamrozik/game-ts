import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: '#556cd6',
        },
        // secondary: {
        //   main: '#19857b',
        // },
        error: {
          main: red.A400,
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
      },
    },
  },
})

export default theme
