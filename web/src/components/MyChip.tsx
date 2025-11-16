import { Chip } from '@mui/material'
import * as React from 'react'
import type { Bps } from '../lib/model/bps'
import { str } from '../lib/utils/formatUtils'
import { val } from '../lib/utils/mathUtils'
import type { MyPaletteColor } from '../styling/modelPaletteUtils'

export type MyChipProps = {
  chipValue?: number | Bps | string | undefined
  /** If true, never display "+" sign for positive values */
  noPlusSign?: boolean
  /** If true, reverse color semantics: positive = bad/red, negative = good/green. Default false = positive good/green, negative bad/red */
  reverseColor?: boolean
  /** If true, always display as gray/default color regardless of value */
  noColor?: boolean
  /** If true, display using warning color (orange/yellow) */
  useWarningColor?: boolean
  /** Custom color from theme palette (e.g., 'agentAvailable', 'agentTerminated', 'agentRecovering') */
  paletteColorName?: MyPaletteColor
}

export type ChipColor = MyPaletteColor

export function MyChip({
  chipValue,
  noPlusSign = false,
  reverseColor = false,
  noColor = false,
  useWarningColor = false,
  paletteColorName,
}: MyChipProps): React.JSX.Element {
  const chipLabel = formatChipLabel(chipValue, noPlusSign)
  const chipColor: ChipColor = determineChipColor(chipLabel, noColor, reverseColor, useWarningColor, paletteColorName)

  return <Chip label={chipLabel} size="small" sx={{ fontSize: '0.875rem', height: 18 }} color={chipColor} />
}

/**
 * Formats a numeric or string value into a chip label string.
 */
function formatChipLabel(chipValue: number | Bps | string | undefined, noPlusSign?: boolean): string | undefined {
  if (chipValue === undefined) {
    return undefined
  }

  // Handle strings directly
  if (typeof chipValue === 'string') {
    return chipValue
  }

  // Handle numbers and Bps
  const value = val(chipValue)
  const sign = (noPlusSign ?? false) ? '' : value > 0 ? '+' : ''
  return `${sign}${str(chipValue)}`
}

/**
 * Determines the chip color based on the label content and color settings.
 */
function determineChipColor(
  chipLabel: string | undefined,
  noColor: boolean,
  reverseColor: boolean,
  useWarningColor: boolean,
  paletteColorName?: ChipColor,
): ChipColor {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let returnedColor: ChipColor

  if (paletteColorName !== undefined) {
    returnedColor = paletteColorName
  } else if (noColor || chipLabel === undefined) {
    returnedColor = 'default'
  } else {
    // For string labels (non-numeric), use default color unless reverseColor is set
    // Check if the label is numeric (starts with +, -, or is a number)
    const isNumericLabel = /^[+-]?\d/u.test(chipLabel)

    if (!isNumericLabel) {
      if (chipLabel.includes('Success') || chipLabel.includes('Done')) {
        returnedColor = 'success'
      } else if (chipLabel.includes('Retreated')) {
        returnedColor = 'error'
      } else if (
        chipLabel.includes('All agents lost') ||
        chipLabel.includes('Failed') ||
        chipLabel.includes('Expired')
      ) {
        returnedColor = 'error'
      } else {
        returnedColor = 'default'
      }
    } else {
      // Determine if the value is positive, negative, or zero based on the label
      const isPositive = chipLabel.startsWith('+') || (!chipLabel.startsWith('-') && chipLabel !== '0')
      const isZero = ['0', '+0', '-0', '0.00%', '+0.00%', '-0.00%'].includes(chipLabel)

      if (isZero) {
        returnedColor = 'default'
      } else if (useWarningColor) {
        returnedColor = 'warning'
      } else if (reverseColor) {
        returnedColor = isPositive ? 'error' : 'success'
      } else {
        returnedColor = isPositive ? 'success' : 'error'
      }
    }
  }
  return returnedColor
}
