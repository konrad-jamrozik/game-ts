/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
  // Defined in game-ts\web\node_modules\@mui\material\esm\styles\createPalette.d.ts
  interface TypeBackground {
    cardHeader: string
    cardContents: string
  }

  // Defined in game-ts\web\node_modules\@mui\material\esm\styles\createPalette.d.ts
  interface PaletteOptions {
    background?: Partial<TypeBackground>
  }
}

const customTheme = createTheme({
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
          cardHeader: '#343434ff',
          cardContents: '#343434ff',
        },
      },
    },
  },
})

// https://mui.com/material-ui/customization/theming/#createtheme-options-args-theme
const customTheme2 = createTheme(customTheme, {
  colorSchemes: {
    dark: {
      components: {
        MuiCardContent: {
          styleOverrides: {
            root: {
              backgroundColor: customTheme.palette.background.cardContents,
            },
          },
        },
      },
    },
  },
})

export default customTheme2
