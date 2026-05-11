import {
  createTheme,
  type ColorSystemOptions,
  type Components,
  type CssVarsTheme,
  type Theme,
} from '@mui/material/styles'
import { createPaletteOptions } from './palette'
import {
  ACCORDION_DETAILS_PADDING,
  ACCORDION_HEADER_CONTENT_MARGIN_Y,
  ACCORDION_HEADER_MIN_HEIGHT_PX,
  ACCORDION_HEADER_PADDING_X,
  BUTTON_LABEL_PADDING_X,
  BUTTON_LABEL_PADDING_Y,
  CARD_CONTENT_PADDING,
  CARD_HEADER_PADDING_X,
  CARD_HEADER_PADDING_Y,
  FIELD_LABEL_PADDING_X,
  FIELD_LABEL_PADDING_Y,
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
  MuiAccordion: {
    styleOverrides: {
      root: {
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        minHeight: ACCORDION_HEADER_MIN_HEIGHT_PX,
        paddingLeft: theme.spacing(ACCORDION_HEADER_PADDING_X),
        paddingRight: theme.spacing(ACCORDION_HEADER_PADDING_X),
        '&.Mui-expanded': {
          minHeight: ACCORDION_HEADER_MIN_HEIGHT_PX,
        },
      },
      content: {
        marginTop: theme.spacing(ACCORDION_HEADER_CONTENT_MARGIN_Y),
        marginBottom: theme.spacing(ACCORDION_HEADER_CONTENT_MARGIN_Y),
        '&.Mui-expanded': {
          marginTop: theme.spacing(ACCORDION_HEADER_CONTENT_MARGIN_Y),
          marginBottom: theme.spacing(ACCORDION_HEADER_CONTENT_MARGIN_Y),
        },
      },
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        padding: theme.spacing(ACCORDION_DETAILS_PADDING),
      },
    },
  },
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
  MuiInputLabel: {
    styleOverrides: {
      root: {
        '&.MuiInputLabel-shrink': {
          paddingLeft: theme.spacing(FIELD_LABEL_PADDING_X),
          paddingRight: theme.spacing(FIELD_LABEL_PADDING_X),
          paddingTop: theme.spacing(FIELD_LABEL_PADDING_Y),
          paddingBottom: theme.spacing(FIELD_LABEL_PADDING_Y),
        },
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
