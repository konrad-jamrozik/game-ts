import type { SxProps, Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'

export const destructiveButtonSx = {
  backgroundColor: (theme: Theme): string => theme.palette.error.dark,
  '&:hover': { backgroundColor: (theme: Theme): string => theme.palette.error.main },
}

type SxArray = readonly (boolean | SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>))[]

function isSxArray(sx: SxProps<Theme>): sx is SxArray {
  return Array.isArray(sx)
}

export function combineSx(sx1?: SxProps<Theme>, sx2?: SxProps<Theme>): SxProps<Theme> {
  const resolvedSx1 = sx1 ? (isSxArray(sx1) ? [...sx1] : [sx1]) : []
  const resolvedSx2 = sx2 ? (isSxArray(sx2) ? [...sx2] : [sx2]) : []
  const combinedSx: SxProps<Theme> = [...resolvedSx1, ...resolvedSx2]
  return combinedSx
}
