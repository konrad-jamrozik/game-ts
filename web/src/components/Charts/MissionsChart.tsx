import * as React from 'react'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import { green, red } from '@mui/material/colors'
import { BarChart } from '@mui/x-charts/BarChart'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  setMissionsChartShowOffensive,
  setMissionsChartShowDefensive,
} from '../../redux/slices/selectionSlice'
import { selectChartsDatasets } from '../../redux/selectors/chartsSelectors'
import { axisConfig, formatTurn, legendSlotProps, Y_AXIS_WIDTH } from './chartsUtils'

type MissionsChartProps = {
  height: number
}

export function MissionsChart(props: MissionsChartProps): React.JSX.Element {
  const { height } = props
  const dispatch = useAppDispatch()
  const datasets = useAppSelector(selectChartsDatasets)
  const showOffensive = useAppSelector((state) => state.selection.missionsChartShowOffensive) ?? true
  const showDefensive = useAppSelector((state) => state.selection.missionsChartShowDefensive) ?? true

  function handleOffensiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setMissionsChartShowOffensive(event.target.checked))
  }

  function handleDefensiveChange(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch(setMissionsChartShowDefensive(event.target.checked))
  }

  const series = []

  // Defensive missions (left bar)
  if (showDefensive) {
    series.push(
      {
        dataKey: 'defensiveWon',
        label: 'Defensive Won',
        stack: 'defensive',
        color: green[600],
      },
      {
        dataKey: 'defensiveLost',
        label: 'Defensive Lost',
        stack: 'defensive',
        color: red[600],
      },
      {
        dataKey: 'defensiveExpired',
        label: 'Defensive Expired',
        stack: 'defensive',
        color: red[900],
      },
    )
  }

  // Offensive missions (right bar)
  if (showOffensive) {
    series.push(
      {
        dataKey: 'offensiveWon',
        label: 'Offensive Won',
        stack: 'offensive',
        color: green[600],
      },
      {
        dataKey: 'offensiveLost',
        label: 'Offensive Lost',
        stack: 'offensive',
        color: red[600],
      },
      {
        dataKey: 'offensiveExpired',
        label: 'Offensive Expired',
        stack: 'offensive',
        color: red[900],
      },
    )
  }

  return (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <FormControlLabel
          control={<Checkbox checked={showOffensive} onChange={handleOffensiveChange} />}
          label="Offensive"
        />
        <FormControlLabel
          control={<Checkbox checked={showDefensive} onChange={handleDefensiveChange} />}
          label="Defensive"
        />
      </Box>
      <BarChart
        dataset={datasets.missionsOutcome}
        xAxis={[
          {
            scaleType: 'band',
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
        slotProps={{
          tooltip: { trigger: 'axis' },
          ...legendSlotProps,
        }}
      />
    </Stack>
  )
}
