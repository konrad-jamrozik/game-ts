import type { Theme } from '@mui/material/styles'

export const destructiveButtonSx = {
  backgroundColor: (theme: Theme): string => theme.palette.error.dark,
  '&:hover': { backgroundColor: (theme: Theme): string => theme.palette.error.main },
}
