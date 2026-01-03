import {
  createTheme,
  type ColorSystemOptions,
  type Components,
  type CssVarsTheme,
  type Theme,
} from '@mui/material/styles'
import { createPaletteOptions } from './palette'

// Card content padding constant used across card components
export const CARD_CONTENT_PADDING = 1

const colorSystemOptions: ColorSystemOptions = {
  palette: createPaletteOptions(),
}

let theme = createTheme({
  typography: {
    fontFamily: '"JetBrains Mono"',
  },
  colorSchemes: {
    dark: colorSystemOptions,
    // We set light to dark because we don't really support light, but the values
    // must be the same for light and dark for the component overrides to work well.
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
          '&:last-child': { paddingBottom: CARD_CONTENT_PADDING },
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
