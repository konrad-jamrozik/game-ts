import * as React from 'react'
import Box from '@mui/material/Box'

// Color constants for skill and HP bars
export const SKILL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
export const SKILL_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'
export const HP_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
export const HP_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'
export const ROLL_BAR_GREY = 'hsla(0, 0%, 50%, 0.3)'
export const ROLL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.3)'
export const ROLL_BAR_RED = 'hsla(0, 90%, 58%, 0.4)'

export type ColorBarProps = {
  fillPct: number
  colorPct: number
  fillFromRight?: boolean
  children: React.ReactNode
}

export function ColorBar({ fillPct, colorPct, fillFromRight = false, children }: ColorBarProps): React.JSX.Element {
  // Convert color percentage to HSL hue: interpolate between red (0°) and green (120°)
  const { hue: redHue, alpha: redAlpha } = skillBarRedComponents
  const { hue: greenHue, saturation, lightness, alpha: greenAlpha } = skillBarGreenComponents
  const hue = redHue + colorPct * (greenHue - redHue)
  // Interpolate alpha between red and green
  const alpha = Number.parseFloat(redAlpha) + colorPct * (Number.parseFloat(greenAlpha) - Number.parseFloat(redAlpha))

  // Create gradient background: filled portion with color, rest transparent
  // If fillFromRight is true, fill from right to left; otherwise fill from left to right
  const background = fillFromRight
    ? `linear-gradient(90deg, transparent 0%, transparent ${100 - fillPct}%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) ${100 - fillPct}%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) 100%)`
    : `linear-gradient(90deg, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) 0%, hsla(${hue}, ${saturation}, ${lightness}, ${alpha}) ${fillPct}%, transparent ${fillPct}%, transparent 100%)`

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid rgba(128, 128, 128, 0.3)',
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

// Extract color components from constants
function parseHslaColor(color: string): { hue: number; saturation: string; lightness: string; alpha: string } {
  const regex = /hsla\((?<hue>\d+),\s*(?<saturation>\d+%),\s*(?<lightness>\d+%),\s*(?<alpha>[\d.]+)\)/u
  const match = regex.exec(color)
  const groups = match?.groups
  const hueStr = groups?.['hue']
  const saturationStr = groups?.['saturation']
  const lightnessStr = groups?.['lightness']
  const alphaStr = groups?.['alpha']
  if (hueStr === undefined || saturationStr === undefined || lightnessStr === undefined || alphaStr === undefined) {
    throw new Error(`Invalid HSLA color format: ${color}`)
  }
  return {
    hue: Number.parseInt(hueStr, 10),
    saturation: saturationStr,
    lightness: lightnessStr,
    alpha: alphaStr,
  }
}

const skillBarGreenComponents = parseHslaColor(SKILL_BAR_GREEN)
const skillBarRedComponents = parseHslaColor(SKILL_BAR_RED)
