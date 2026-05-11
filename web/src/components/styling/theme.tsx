import {
  createTheme,
  type ColorSystemOptions,
  type Components,
  type CssVarsTheme,
  type Theme,
} from '@mui/material/styles'
import { createPaletteOptions } from './palette'
import {
  BUTTON_LABEL_PADDING_X,
  BUTTON_LABEL_PADDING_Y,
  CARD_CONTENT_PADDING,
  CARD_HEADER_PADDING_X,
  CARD_HEADER_PADDING_Y,
  SECTION_GAP,
} from './spacing'

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
  MuiButton: {
    styleOverrides: {
      root: {
        ...theme.unstable_sx({
          paddingX: BUTTON_LABEL_PADDING_X,
          paddingY: BUTTON_LABEL_PADDING_Y,
        }),
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.cardHeader,
        // https://mui.com/material-ui/customization/theme-components/#the-sx-syntax-experimental
        ...theme.unstable_sx({
          paddingX: CARD_HEADER_PADDING_X,
          paddingY: CARD_HEADER_PADDING_Y,
        }),
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.cardContent,
        ...theme.unstable_sx({
          padding: CARD_CONTENT_PADDING,
          // https://stackoverflow.com/a/71251997/986533
          '&:last-child': { paddingBottom: CARD_CONTENT_PADDING },
        }),
      },
    },
  },
  MuiStack: {
    defaultProps: {
      spacing: SECTION_GAP,
    },
  },
}

// https://mui.com/material-ui/customization/theming/#createtheme-options-args-theme
theme = createTheme(theme, { components })

export default theme
