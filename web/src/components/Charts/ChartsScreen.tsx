import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'
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

function getFullscreenHeight(): number {
  if (typeof globalThis !== 'undefined' && 'innerHeight' in globalThis) {
    const windowLike = globalThis as { innerHeight: number }
    return windowLike.innerHeight - 100
  }
  return 600
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
        <ChartsPanel
          title="Money"
          renderChart={(height) => (
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
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />

        <ChartsPanel
          title="Balance sheet"
          renderChart={(height) => (
            <BarChart
              dataset={datasets.balanceSheet}
              xAxis={[
                {
                  dataKey: 'turn',
                  label: 'Turn',
                  valueFormatter: formatTurn,
                  ...axisConfig,
                },
              ]}
              yAxis={[yAxisConfig]}
              series={[
                // Positive values (stack above zero, first touches zero)
                {
                  dataKey: 'funding',
                  label: 'Funding',
                  stack: 'balance',
                  stackOffset: 'diverging',
                  color: theme.palette.balanceIncomeFunding.dark,
                },
                {
                  dataKey: 'contracting',
                  label: 'Contracting income',
                  stack: 'balance',
                  color: theme.palette.balanceIncomeContracting.main,
                },
                {
                  dataKey: 'rewards',
                  label: 'Rewards from missions',
                  stack: 'balance',
                  color: theme.palette.balanceIncomeRewards.light,
                },
                // Negative values (stack below zero, first touches zero)
                {
                  dataKey: 'upkeep',
                  label: 'Upkeep',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseUpkeep.main,
                },
                {
                  dataKey: 'agentHiring',
                  label: 'Agent hiring expenditures',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseAgentHiring.main,
                },
                {
                  dataKey: 'capIncreases',
                  label: 'Cap increase expenditures',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseCapIncreases.main,
                },
                {
                  dataKey: 'upgrades',
                  label: 'Upgrade expenditures',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseUpgrades.main,
                },
              ]}
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />

        <ChartsPanel
          title="Agent skill"
          renderChart={(height) => (
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
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />

        <ChartsPanel
          title="Agent readiness"
          renderChart={(height) => (
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
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />

        <ChartsPanel
          title="Missions"
          renderChart={(height) => (
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
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />

        <ChartsPanel
          title="Battle stats (total over missions)"
          renderChart={(height) => (
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
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />

        <ChartsPanel
          title="Situation report"
          renderChart={(height) => (
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
                  valueFormatter: (v: number | null): string => (typeof v === 'number' ? `${v.toFixed(2)}%` : ''),
                },
              ])}
              height={height}
              grid={{ horizontal: true }}
              slotProps={{
                tooltip: { trigger: 'axis' },
                ...legendSlotProps,
              }}
            />
          )}
        />
      </Box>
    </Box>
  )
}

function ChartsPanel(props: { title: string; renderChart: (height: number) => React.ReactNode }): React.JSX.Element {
  const [zoomed, setZoomed] = React.useState(false)

  function handleZoomClick(): void {
    setZoomed(true)
  }

  function handleCloseZoom(): void {
    setZoomed(false)
  }

  function handleDialogKeyDown(event: React.KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation()
      handleCloseZoom()
    }
  }

  return (
    <>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{props.title}</Typography>
            <IconButton onClick={handleZoomClick} aria-label="Zoom in" size="small">
              <ZoomInIcon />
            </IconButton>
          </Box>
          <Box sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {props.renderChart(CHART_HEIGHT)}
          </Box>
        </Stack>
      </Paper>
      <Dialog fullScreen open={zoomed} onClose={handleCloseZoom} onKeyDown={handleDialogKeyDown}>
        <Box sx={{ position: 'relative', height: '100%', p: 2, bgcolor: 'background.paper' }}>
          <IconButton
            onClick={handleCloseZoom}
            aria-label="Close"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'red',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {props.title}
          </Typography>
          <Box sx={{ height: 'calc(100% - 60px)' }}>{props.renderChart(getFullscreenHeight())}</Box>
        </Box>
      </Dialog>
    </>
  )
}

function formatTurn(value: number): string {
  return value.toString()
}
