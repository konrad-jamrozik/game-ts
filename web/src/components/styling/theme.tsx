/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {
  createTheme,
  type ColorSystemOptions,
  type Components,
  type CssVarsTheme,
  type PaletteColor,
  type PaletteColorOptions,
  type Theme,
} from '@mui/material/styles'
import { createPaletteOptions } from './palette'

// https://mui.com/material-ui/customization/theming/#typescript
declare module '@mui/material/styles' {
  // Defined in game-ts/web/node_modules/mui/material/esm/styles/createPalette.d.ts
  // export default function createPalette(palette: PaletteOptions): Palette;
  interface Palette {
    agentStateAvailable: PaletteColor
    agentStateInTransit: PaletteColor
    agentStateOnAssignment: PaletteColor
    agentStateOnMission: PaletteColor
    agentStateRecovering: PaletteColor
    agentStateInTraining: PaletteColor
    agentStateTerminated: PaletteColor
    agentStateDefault: PaletteColor
    moneyBalance: PaletteColor
    moneyFunding: PaletteColor
    moneyContracting: PaletteColor
    moneyUpkeep: PaletteColor
    moneyRewards: PaletteColor
    moneyExpenditures: PaletteColor
    balanceIncomeFunding: PaletteColor
    balanceIncomeContracting: PaletteColor
    balanceIncomeRewards: PaletteColor
    balanceExpenseUpkeep: PaletteColor
    balanceExpenseAgentHiring: PaletteColor
    balanceExpenseCapIncreases: PaletteColor
    balanceExpenseUpgrades: PaletteColor
  }

  // Defined in game-ts/web/node_modules/mui/material/esm/styles/createPalette.d.ts
  // export default function createPalette(palette: PaletteOptions): Palette;
  interface PaletteOptions {
    background?: Partial<TypeBackground>
    agentStateAvailable?: PaletteColorOptions
    agentStateInTransit?: PaletteColorOptions
    agentStateOnAssignment?: PaletteColorOptions
    agentStateOnMission?: PaletteColorOptions
    agentStateRecovering?: PaletteColorOptions
    agentStateInTraining?: PaletteColorOptions
    agentStateTerminated?: PaletteColorOptions
    agentStateDefault?: PaletteColorOptions
    moneyBalance?: PaletteColorOptions
    moneyFunding?: PaletteColorOptions
    moneyContracting?: PaletteColorOptions
    moneyUpkeep?: PaletteColorOptions
    moneyRewards?: PaletteColorOptions
    moneyExpenditures?: PaletteColorOptions
    balanceIncomeFunding?: PaletteColorOptions
    balanceIncomeContracting?: PaletteColorOptions
    balanceIncomeRewards?: PaletteColorOptions
    balanceExpenseUpkeep?: PaletteColorOptions
    balanceExpenseAgentHiring?: PaletteColorOptions
    balanceExpenseCapIncreases?: PaletteColorOptions
    balanceExpenseUpgrades?: PaletteColorOptions
  }
}

// Defined in game-ts/web/node_modules/@mui/material/esm/Chip/Chip.d.ts
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    agentStateAvailable: true
    agentStateInTransit: true
    agentStateOnAssignment: true
    agentStateOnMission: true
    agentStateRecovering: true
    agentStateInTraining: true
    agentStateTerminated: true
    agentStateDefault: true
  }
}

// Card content padding constant used across card components
export const CARD_CONTENT_PADDING = 1

const colorSystemOptions: ColorSystemOptions = {
  palette: createPaletteOptions(),
}

let theme = createTheme({
  typography: {
    fontFamily: '"JetBrains Mono"',
    //fontFamily: 'monospace',
    //fontFamily: 'Roboto',
    //fontFamily: 'Calibri',
    //fontFamily: 'Lekton',
    //fontFamily: '"Fira Code"',
  },
  colorSchemes: {
    dark: colorSystemOptions,
    // We set light to dark because we don't really support light, but the values
    // must be the same for light and dark for the component overrides to work well.
    light: colorSystemOptions,
  },
})

const components: Components<Omit<Theme, 'components' | 'palette'> & CssVarsTheme> = {
  // MuiDialog: {
  //   styleOverrides: {
  //     paper: {
  //       backgroundColor: theme.palette.background.paper,
  //     },
  //     paperFullScreen: {
  //       backgroundColor: theme.palette.background.paper,
  //     },
  //   },
  // },
  // MuiDialogTitle: {
  //   styleOverrides: {
  //     root: {
  //       backgroundColor: theme.palette.background.paper,
  //     },
  //   },
  // },
  // MuiDialogActions: {
  //   styleOverrides: {
  //     root: {
  //       backgroundColor: theme.palette.background.paper,
  //     },
  //   },
  // },
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
