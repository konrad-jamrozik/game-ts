/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {
  createTheme,
  type ColorSystemOptions,
  type Components,
  type CssVarsTheme,
  type PaletteColorOptions,
  type Theme,
} from '@mui/material/styles'

// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
  // Defined in game-ts\web\node_modules\@mui\material\esm\styles\createPalette.d.ts
  // export default function createPalette(palette: PaletteOptions): Palette;
  interface Palette {
    agentStateAvailable: PaletteColorOptions
    agentStateTerminated: PaletteColorOptions
    agentStateRecovering: PaletteColorOptions
    agentStateDefault: PaletteColorOptions
  }

  // Defined in game-ts\web\node_modules\@mui\material\esm\styles\createPalette.d.ts
  // export default function createPalette(palette: PaletteOptions): Palette;
  interface PaletteOptions {
    background?: Partial<TypeBackground>
    agentStateAvailable?: PaletteColorOptions
    agentStateTerminated?: PaletteColorOptions
    agentStateRecovering?: PaletteColorOptions
    agentStateDefault?: PaletteColorOptions
  }

  // Defined in game-ts\web\node_modules\@mui\material\esm\styles\createPalette.d.ts
  // TypeBackground is a member of export interface Palette {
  interface TypeBackground {
    cardHeader: string
    cardContent: string
    nestedCardContent: string
    leadCardHeader: string
    leadCardContent: string
    missionCardHeader: string
    missionCardContent: string
  }
}

// Defined in game-ts/web/node_modules/@mui/material/esm/Chip/Chip.d.ts
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    agentStateAvailable: true
    agentStateTerminated: true
    agentStateRecovering: true
    agentStateDefault: true
  }
}

const defaultTheme = createTheme()

const colorSystemOptions: ColorSystemOptions = {
  palette: {
    primary: {
      main: defaultTheme.palette.primary.main,
    },
    error: {
      main: defaultTheme.palette.error.main,
    },
    success: {
      main: defaultTheme.palette.success.main,
    },
    // https://colors.artyclick.com/color-shades-finder/?color=#404040
    background: {
      default: 'hsl(0, 0%, 12.9%)',
      paper: 'hsl(0, 0%, 16%)',
      cardHeader: 'hsl(0, 0%, 20%)', // Two shades darker than hsl(0, 0%, 25.10%)
      cardContent: 'hsl(0, 0.00%, 25.10%)',
      nestedCardContent: 'hsl(0, 0.00%, 22.10%)',
      leadCardHeader: 'hsl(213, 19%, 22%)', // https://chatgpt.com/c/68808403-ffb0-8011-aa20-553a38ab2621
      leadCardContent: 'hsl(212.7,15.9%,27.1%)', // https://chatgpt.com/c/68808403-ffb0-8011-aa20-553a38ab2621
      missionCardHeader: 'hsl(0, 19%, 22%)', // Red variant of leadCardHeader
      missionCardContent: 'hsl(0, 16%, 27%)', // Red variant of leadCardContent
    },
    agentStateAvailable: {
      main: defaultTheme.palette.success.main,
      light: defaultTheme.palette.success.light,
      dark: defaultTheme.palette.success.dark,
      contrastText: defaultTheme.palette.success.contrastText,
    },
    agentStateTerminated: {
      main: defaultTheme.palette.error.main,
      light: defaultTheme.palette.error.light,
      dark: defaultTheme.palette.error.dark,
      contrastText: defaultTheme.palette.error.contrastText,
    },
    agentStateRecovering: {
      main: defaultTheme.palette.error.main,
      light: defaultTheme.palette.error.light,
      dark: defaultTheme.palette.error.dark,
      contrastText: defaultTheme.palette.error.contrastText,
    },
    agentStateDefault: defaultTheme.palette.augmentColor({
      color: {
        main: defaultTheme.palette.grey[800],
      },
      name: 'agentStateDefault',
    }),
  },
}

let theme = createTheme({
  colorSchemes: {
    dark: colorSystemOptions,
    // We set light to dark because we don't really support light, but the values
    // must be the same for light and dark for the component overrides to work well.
    light: colorSystemOptions,
  },
})

const components: Components<Omit<Theme, 'components' | 'palette'> & CssVarsTheme> = {
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.paper,
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.paper,
      },
    },
  },
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
          '&:last-child': { paddingBottom: 1 },
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
