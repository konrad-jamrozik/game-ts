import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewCharts } from '../../redux/slices/selectionSlice'
import { selectChartsDatasets } from '../../redux/selectors/chartsSelectors'

const CHART_HEIGHT = 300
const AXIS_TICK_FONT_SIZE = 14
const AXIS_LABEL_FONT_SIZE = 16
const LEGEND_FONT_SIZE = 14
const Y_AXIS_WIDTH = 55

const axisConfig = {
  tickLabelStyle: { fontSize: AXIS_TICK_FONT_SIZE },
  labelStyle: { fontSize: AXIS_LABEL_FONT_SIZE },
}

const yAxisConfig = {
  ...axisConfig,
  width: Y_AXIS_WIDTH,
}

const legendSlotProps = {
  legend: {
    sx: {
      fontSize: LEGEND_FONT_SIZE,
    },
  },
}

function withNoMarkers<T extends Record<string, unknown>>(series: T[]): (T & { showMark: false })[] {
  return series.map((s) => ({ ...s, showMark: false }))
}

export function ChartsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const datasets = useAppSelector(selectChartsDatasets)
  const theme = useTheme()

  function handleBackClick(): void {
    dispatch(clearViewCharts())
  }

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        dispatch(clearViewCharts())
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    return (): void => {
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatch])

  return (
    <Box
      sx={{
        padding: 2,
        paddingX: 1,
        bgcolor: '#30303052',
        minHeight: '100vh',
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
        <Button variant="contained" onClick={handleBackClick}>
          Back to command center
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, 1fr)',
            xl: 'repeat(3, 1fr)',
          },
          width: '100%',
        }}
      >
        <ChartsPanel title="Money">
          <LineChart
            dataset={datasets.assets}
            xAxis={[
              {
                dataKey: 'turn',
                label: 'Turn',
                valueFormatter: formatTurn,
                ...axisConfig,
              },
            ]}
            yAxis={[yAxisConfig]}
            series={withNoMarkers([
              { dataKey: 'money', label: 'Money', color: theme.palette.moneyBalance.main },
              { dataKey: 'funding', label: 'Funding', color: theme.palette.moneyFunding.main },
              {
                dataKey: 'contracting',
                label: 'Contracting',
                color: theme.palette.moneyContracting.main,
              },
              { dataKey: 'upkeep', label: 'Upkeep', color: theme.palette.moneyUpkeep.main },
              { dataKey: 'rewards', label: 'Rewards', color: theme.palette.moneyRewards.main },
              { dataKey: 'expenditures', label: 'Expenditures', color: theme.palette.moneyExpenditures.main },
            ])}
            height={CHART_HEIGHT}
            grid={{ horizontal: true }}
            slotProps={{
              tooltip: { trigger: 'axis' },
              ...legendSlotProps,
            }}
          />
        </ChartsPanel>

        <ChartsPanel title="Agent skill">
          <LineChart
            dataset={datasets.agentSkill}
            xAxis={[
              {
                dataKey: 'turn',
                label: 'Turn',
                valueFormatter: formatTurn,
                ...axisConfig,
              },
            ]}
            yAxis={[yAxisConfig]}
            series={withNoMarkers([
              { dataKey: 'maxEffectiveSkillMin', label: 'Max eff. skill (min)' },
              { dataKey: 'maxEffectiveSkillAvg', label: 'Max eff. skill (avg)' },
              { dataKey: 'maxEffectiveSkillMedian', label: 'Max eff. skill (median)' },
              { dataKey: 'maxEffectiveSkillP90', label: 'Max eff. skill (p90)' },
              { dataKey: 'maxEffectiveSkillSum', label: 'Max eff. skill (sum)' },
              { dataKey: 'currentEffectiveSkillSum', label: 'Current eff. skill (sum)' },
            ])}
            height={CHART_HEIGHT}
            grid={{ horizontal: true }}
            slotProps={{
              tooltip: { trigger: 'axis' },
              ...legendSlotProps,
            }}
          />
        </ChartsPanel>

        <ChartsPanel title="Agent readiness">
          <LineChart
            dataset={datasets.agentReadiness}
            xAxis={[
              {
                dataKey: 'turn',
                label: 'Turn',
                valueFormatter: formatTurn,
                ...axisConfig,
              },
            ]}
            yAxis={[yAxisConfig]}
            series={withNoMarkers([
              { dataKey: 'maxHitPointsAvg', label: 'Max HP (avg)' },
              { dataKey: 'maxHitPointsMax', label: 'Max HP (max)' },
              { dataKey: 'hitPointsAvg', label: 'HP (avg)' },
              { dataKey: 'hitPointsMax', label: 'HP (max)' },
              { dataKey: 'exhaustionAvg', label: 'Exhaustion (avg)' },
              { dataKey: 'exhaustionMax', label: 'Exhaustion (max)' },
              { dataKey: 'recoveryTurnsAvg', label: 'Recovery turns (avg)' },
              { dataKey: 'recoveryTurnsMax', label: 'Recovery turns (max)' },
            ])}
            height={CHART_HEIGHT}
            grid={{ horizontal: true }}
            slotProps={{
              tooltip: { trigger: 'axis' },
              ...legendSlotProps,
            }}
          />
        </ChartsPanel>

        <ChartsPanel title="Missions">
          <LineChart
            dataset={datasets.missions}
            xAxis={[
              {
                dataKey: 'turn',
                label: 'Turn',
                valueFormatter: formatTurn,
                ...axisConfig,
              },
            ]}
            yAxis={[yAxisConfig]}
            series={withNoMarkers([
              { dataKey: 'spawned', label: 'Spawned (total)' },
              { dataKey: 'expired', label: 'Expired (total)' },
              { dataKey: 'won', label: 'Completed successfully (total)' },
              { dataKey: 'retreated', label: 'Retreated (total)' },
              { dataKey: 'wiped', label: 'Wiped (total)' },
            ])}
            height={CHART_HEIGHT}
            grid={{ horizontal: true }}
            slotProps={{
              tooltip: { trigger: 'axis' },
              ...legendSlotProps,
            }}
          />
        </ChartsPanel>

        <ChartsPanel title="Battle stats (total over missions)">
          <LineChart
            dataset={datasets.battleStats}
            xAxis={[
              {
                dataKey: 'turn',
                label: 'Turn',
                valueFormatter: formatTurn,
                ...axisConfig,
              },
            ]}
            yAxis={[yAxisConfig]}
            series={withNoMarkers([
              { dataKey: 'agentsDeployed', label: 'Agents deployed' },
              { dataKey: 'agentsKia', label: 'Agents KIA' },
              { dataKey: 'agentsWounded', label: 'Agents wounded' },
              { dataKey: 'agentsUnscathed', label: 'Agents unscathed' },
              { dataKey: 'enemiesKia', label: 'Enemies KIA' },
            ])}
            height={CHART_HEIGHT}
            grid={{ horizontal: true }}
            slotProps={{
              tooltip: { trigger: 'axis' },
              ...legendSlotProps,
            }}
          />
        </ChartsPanel>

        <ChartsPanel title="Situation report">
          <LineChart
            dataset={datasets.situationReport}
            xAxis={[
              {
                dataKey: 'turn',
                label: 'Turn',
                valueFormatter: formatTurn,
                ...axisConfig,
              },
            ]}
            yAxis={[yAxisConfig]}
            series={withNoMarkers([
              {
                dataKey: 'panicPct',
                label: 'Panic (%)',
                valueFormatter: (v: number | null) => (typeof v === 'number' ? `${v.toFixed(2)}%` : ''),
              },
            ])}
            height={CHART_HEIGHT}
            grid={{ horizontal: true }}
            slotProps={{
              tooltip: { trigger: 'axis' },
              ...legendSlotProps,
            }}
          />
        </ChartsPanel>
      </Box>
    </Box>
  )
}

function ChartsPanel(props: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        height: '100%',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
        <Typography variant="h6">{props.title}</Typography>
        <Box sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {props.children}
        </Box>
      </Stack>
    </Paper>
  )
}

function formatTurn(value: number): string {
  return value.toString()
}
