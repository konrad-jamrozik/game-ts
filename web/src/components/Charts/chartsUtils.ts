export const AXIS_TICK_FONT_SIZE = 14
export const AXIS_LABEL_FONT_SIZE = 16
export const LEGEND_FONT_SIZE = 14
export const Y_AXIS_WIDTH = 60

export const axisConfig = {
  tickLabelStyle: { fontSize: AXIS_TICK_FONT_SIZE },
  labelStyle: { fontSize: AXIS_LABEL_FONT_SIZE },
}

export const yAxisConfig = {
  ...axisConfig,
  width: Y_AXIS_WIDTH,
}

export const legendSlotProps = {
  legend: {
    sx: {
      fontSize: LEGEND_FONT_SIZE,
    },
  },
}

export function withNoMarkers<T extends Record<string, unknown>>(series: T[]): (T & { showMark: false })[] {
  return series.map((s) => ({ ...s, showMark: false }))
}

export function formatTurn(value: number): string {
  return `Turn ${value}`
}
