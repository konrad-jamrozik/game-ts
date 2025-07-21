/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { red } from '@mui/material/colors'
import { createTheme, type ColorSystemOptions } from '@mui/material/styles'

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

const colorSystemOptions: ColorSystemOptions = {
  palette: {
    primary: {
      main: '#556cd6',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#212121',
      paper: '#282828ff',
      cardHeader: '#343434ff',
      cardContents: 'rgba(67, 67, 67, 1)',
    },
  },
}

let theme = createTheme({
  colorSchemes: {
    dark: colorSystemOptions,
    // We set light to dark because we don't really support light, but the values
    // must be the same for light and dark for the component overrides to work.
    light: colorSystemOptions,
  },
})

// https://mui.com/material-ui/customization/theming/#createtheme-options-args-theme
theme = createTheme(theme, {
  components: {
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.cardHeader,
          ...theme.unstable_sx({
            paddingY: 1,
          }),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.cardContents,
        },
      },
    },
    MuiStack: {
      defaultProps: {
        spacing: 2,
      },
    },
  },
})

export default theme
