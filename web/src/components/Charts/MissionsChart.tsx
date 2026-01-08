import * as React from 'react'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { green, red, grey, blue } from '@mui/material/colors'
import { LineChart, lineElementClasses } from '@mui/x-charts/LineChart'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { setMissionsChartShowOffensive, setMissionsChartShowDefensive } from '../../redux/slices/selectionSlice'
import { selectChartsDatasets } from '../../redux/selectors/chartsSelectors'
import { axisConfig, formatTurn, legendSlotProps, Y_AXIS_WIDTH } from './chartsUtils'

export function MissionsChartControls(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const showOffensive = useAppSelector((state) => state.selection.missionsChartShowOffensive) ?? true
  const showDefensive = useAppSelector((state) => state.selection.missionsChartShowDefensive) ?? true

  function handleOffensiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setMissionsChartShowOffensive(event.target.checked))
  }

  function handleDefensiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setMissionsChartShowDefensive(event.target.checked))
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <FormControlLabel
        control={<Checkbox checked={showOffensive} onChange={handleOffensiveChange} size="small" />}
        label="Offensive"
        sx={{ margin: 0 }}
      />
      <FormControlLabel
        control={<Checkbox checked={showDefensive} onChange={handleDefensiveChange} size="small" />}
        label="Defensive"
        sx={{ margin: 0 }}
      />
    </Box>
  )
}

type MissionsChartProps = {
  height: number
}

export function MissionsChart(props: MissionsChartProps): React.JSX.Element {
  const { height } = props
  const datasets = useAppSelector(selectChartsDatasets)
  const showOffensive = useAppSelector((state) => state.selection.missionsChartShowOffensive) ?? true
  const showDefensive = useAppSelector((state) => state.selection.missionsChartShowDefensive) ?? true

  const series = []

  // Interleave defensive and offensive by outcome type
  // Order: Won (both), Lost (both), Expired (both)

  // Won - Defensive first
  if (showDefensive) {
    series.push({
      dataKey: 'defensiveWon',
      label: 'Defensive Won',
      stack: 'total',
      area: true,
      showMark: false,
      color: green[700],
    })
  }

  // Won - Offensive second
  if (showOffensive) {
    series.push({
      dataKey: 'offensiveWon',
      label: 'Offensive Won',
      stack: 'total',
      area: true,
      showMark: false,
      color: green[500],
    })
  }

  // Lost - Defensive first
  if (showDefensive) {
    series.push({
      dataKey: 'defensiveLost',
      label: 'Defensive Lost',
      stack: 'total',
      area: true,
      showMark: false,
      color: red[700],
    })
  }

  // Lost - Offensive second
  if (showOffensive) {
    series.push({
      dataKey: 'offensiveLost',
      label: 'Offensive Lost',
      stack: 'total',
      area: true,
      showMark: false,
      color: red[500],
    })
  }

  // Expired - Defensive first (gray)
  if (showDefensive) {
    series.push({
      dataKey: 'defensiveExpired',
      label: 'Defensive Expired',
      stack: 'total',
      area: true,
      showMark: false,
      color: grey[700],
    })
  }

  // Expired - Offensive second (lighter gray)
  if (showOffensive) {
    series.push({
      dataKey: 'offensiveExpired',
      label: 'Offensive Expired',
      stack: 'total',
      area: true,
      showMark: false,
      color: grey[500],
    })
  }

  // Cumulative discovered missions line (no area, no stack)
  series.push({
    id: 'discovered',
    dataKey: 'discovered',
    label: 'Discovered',
    showMark: false,
    color: blue[700],
  })

  return (
    <LineChart
      dataset={datasets.missionsOutcome}
      xAxis={[
        {
          dataKey: 'turn',
          label: 'Turn',
          valueFormatter: formatTurn,
          ...axisConfig,
        },
      ]}
      yAxis={[
        {
          ...axisConfig,
          width: Y_AXIS_WIDTH,
        },
      ]}
      series={series}
      height={height}
      grid={{ horizontal: true }}
      sx={{
        // Hide lines for stacked area series (they only have area fill)
        [`& .${lineElementClasses.root}`]: {
          display: 'none',
        },
        // Show the discovered line with thick stroke
        '& .MuiLineElement-series-discovered': {
          display: 'initial',
          strokeWidth: 3,
        },
      }}
      slotProps={{
        tooltip: { trigger: 'axis' },
        ...legendSlotProps,
      }}
    />
  )
}
