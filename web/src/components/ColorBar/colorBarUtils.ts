// Color constants for skill and HP bars
export const SKILL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
export const SKILL_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'
export const HP_BAR_GREEN = 'hsla(120, 90%, 58%, 0.5)'
export const HP_BAR_RED = 'hsla(0, 90%, 58%, 0.5)'
export const ROLL_BAR_GREY = 'hsla(0, 0%, 50%, 0.3)'
export const ROLL_BAR_GREEN = 'hsla(120, 90%, 58%, 0.3)'
export const ROLL_BAR_RED = 'hsla(0, 90%, 58%, 0.4)'

// Agents-specific grey for the "missing to baseline" segment in the Agents skill bar
export const AGENTS_SKILL_BAR_GREY = 'hsla(0, 0%, 70%, 0.45)'

export function getColorBarFillColor(colorPct: number): string {
  const clampedColorPct = Math.max(0, Math.min(1, colorPct))
  const adjustedColorPct = adjustColorPctForAggressiveRedness(clampedColorPct)

  // Convert color percentage to HSL hue: interpolate between red (0°) and green (120°)
  const { hue: redHue, alpha: redAlpha } = skillBarRedComponents
  const { hue: greenHue, saturation, lightness, alpha: greenAlpha } = skillBarGreenComponents

  // Non-linear mapping: make colors become redder faster.
  // We want the "yellow" midpoint (~60° hue, i.e. 50% between red and green) to happen at ~80% colorPct.
  // That effectively compresses the old [0..50%] span into [0..80%] and leaves [80..100%] for yellow->green.
  const hue = redHue + adjustedColorPct * (greenHue - redHue)

  // Interpolate alpha between red and green
  const alpha =
    Number.parseFloat(redAlpha) + adjustedColorPct * (Number.parseFloat(greenAlpha) - Number.parseFloat(redAlpha))

  return `hsla(${hue}, ${saturation}, ${lightness}, ${alpha})`
}

function adjustColorPctForAggressiveRedness(colorPct: number): number {
  // Piecewise linear mapping:
  // - Map [0.0 .. 0.8] -> [0.0 .. 0.5]
  // - Map [0.8 .. 1.0] -> [0.5 .. 1.0]
  // So 0.8 becomes 0.5 (yellow), making the scale redder for most of the range.
  if (colorPct <= 0.8) {
    return colorPct * 0.625
  }
  return 0.5 + (colorPct - 0.8) * 2.5
}

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

export function getLinearYellowToRedColor(colorPct: number): string {
  const clampedColorPct = Math.max(0, Math.min(1, colorPct))
  const { saturation, lightness, alpha: redAlpha } = skillBarRedComponents

  // Linear mapping from yellow (60°) to red (0°)
  // colorPct = 0 → yellow (60°), colorPct = 1 → red (0°)
  const yellowHue = 60
  const hue = yellowHue - clampedColorPct * yellowHue

  return `hsla(${hue}, ${saturation}, ${lightness}, ${redAlpha})`
}
