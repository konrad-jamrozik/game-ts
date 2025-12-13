import * as React from 'react'
import Box from '@mui/material/Box'
import { getSkillBarFillColor } from './colorBarUtils'

export type ColorBarProps = {
  fillPct: number
  colorPct: number
  fillFromRight?: boolean
  backgroundOverride?: string
  children: React.ReactNode
}

export function ColorBar({
  fillPct,
  colorPct,
  fillFromRight = false,
  backgroundOverride,
  children,
}: ColorBarProps): React.JSX.Element {
  // KJA "Skill" should be decoupled from ColorBar
  const fillColor = getSkillBarFillColor(colorPct)

  // Create gradient background: filled portion with color, rest transparent
  // If fillFromRight is true, fill from right to left; otherwise fill from left to right
  const background =
    backgroundOverride ??
    (fillFromRight
      ? `linear-gradient(90deg, transparent 0%, transparent ${100 - fillPct}%, ${fillColor} ${100 - fillPct}%, ${fillColor} 100%)`
      : `linear-gradient(90deg, ${fillColor} 0%, ${fillColor} ${fillPct}%, transparent ${fillPct}%, transparent 100%)`)

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
