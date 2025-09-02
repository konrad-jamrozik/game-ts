/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { red } from '@mui/material/colors'
import {
  createTheme,
  type ColorSystemOptions,
  type Components,
  type CssVarsTheme,
  type Theme,
} from '@mui/material/styles'

// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
  // Defined in game-ts\web\node_modules\@mui\material\esm\styles\createPalette.d.ts
  interface TypeBackground {
    cardHeader: string
    cardContent: string
    leadCardHeader: string
    leadCardContent: string
    missionCardHeader: string
    missionCardContent: string
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
    // https://colors.artyclick.com/color-shades-finder/?color=#404040
    background: {
      default: 'hsl(0,0%,12.9%)',
      paper: 'hsl(0, 0%, 16%)',
      cardContent: 'hsl(0, 0.00%, 25.10%)',
      cardHeader: 'hsl(0, 0%, 20%)', // Two shades darker than #404040
      leadCardHeader: 'hsl(213, 19%, 22%)', // https://chatgpt.com/c/68808403-ffb0-8011-aa20-553a38ab2621
      leadCardContent: 'hsl(212.7,15.9%,27.1%)', // https://chatgpt.com/c/68808403-ffb0-8011-aa20-553a38ab2621
      missionCardHeader: 'hsl(0, 19%, 22%)', // Red variant of leadCardHeader
      missionCardContent: 'hsl(0, 16%, 27%)', // Red variant of leadCardContent
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

const components: Components<Omit<Theme, 'components' | 'palette'> & CssVarsTheme> = {
  MuiCardHeader: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.cardHeader,
        // https://mui.com/material-ui/customization/theme-components/#the-sx-syntax-experimental
        ...theme.unstable_sx({
          paddingY: 1,
        }),
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.cardContent,
        ...theme.unstable_sx({
          // https://stackoverflow.com/a/71251997/986533
          '&:last-child': { paddingBottom: 2 },
        }),
      },
    },
  },
  MuiStack: {
    defaultProps: {
      spacing: 1,
    },
  },
}

// https://mui.com/material-ui/customization/theming/#createtheme-options-args-theme
theme = createTheme(theme, { components })

export default theme
