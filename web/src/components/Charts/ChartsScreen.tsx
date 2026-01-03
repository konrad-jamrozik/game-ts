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
import { LineChart, LinePlot } from '@mui/x-charts/LineChart'
import { ChartContainer } from '@mui/x-charts/ChartContainer'
import { BarPlot } from '@mui/x-charts/BarChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsLegend } from '@mui/x-charts/ChartsLegend'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewCharts } from '../../redux/slices/selectionSlice'
import { selectChartsDatasets } from '../../redux/selectors/chartsSelectors'
import { purple } from '@mui/material/colors'

const CHART_HEIGHT = 300
const AXIS_TICK_FONT_SIZE = 14
const AXIS_LABEL_FONT_SIZE = 16
const LEGEND_FONT_SIZE = 14
const Y_AXIS_WIDTH = 60

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
          title="Assets"
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
              yAxis={[
                { id: 'moneyAxisId', ...yAxisConfig },
                { id: 'agentAxisId', position: 'right', ...yAxisConfig },
              ]}
              series={withNoMarkers([
                { dataKey: 'money', label: 'Money', color: theme.palette.moneyBalance.main, yAxisId: 'moneyAxisId' },
                { dataKey: 'agentCount', label: 'Agents', color: theme.palette.primary.main, yAxisId: 'agentAxisId' },
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
          title="Cash Flow"
          renderChart={(height) => (
            <ChartContainer
              dataset={datasets.balanceSheet}
              xAxis={[
                {
                  scaleType: 'band',
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
                  type: 'bar',
                  dataKey: 'funding',
                  label: 'Funding',
                  stack: 'balance',
                  stackOffset: 'diverging',
                  color: theme.palette.balanceIncomeFunding.dark,
                },
                {
                  type: 'bar',
                  dataKey: 'contracting',
                  label: 'Contracting income',
                  stack: 'balance',
                  color: theme.palette.balanceIncomeContracting.main,
                },
                {
                  type: 'bar',
                  dataKey: 'rewards',
                  label: 'Rewards from missions',
                  stack: 'balance',
                  color: theme.palette.balanceIncomeRewards.light,
                },
                // Negative values (stack below zero, first touches zero)
                {
                  type: 'bar',
                  dataKey: 'upkeep',
                  label: 'Upkeep',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseUpkeep.main,
                },
                {
                  type: 'bar',
                  dataKey: 'agentHiring',
                  label: 'Agent hiring expenditures',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseAgentHiring.main,
                },
                {
                  type: 'bar',
                  dataKey: 'capIncreases',
                  label: 'Cap increase expenditures',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseCapIncreases.main,
                },
                {
                  type: 'bar',
                  dataKey: 'upgrades',
                  label: 'Upgrade expenditures',
                  stack: 'balance',
                  color: theme.palette.balanceExpenseUpgrades.main,
                },
                // Net flow line (golden)
                {
                  type: 'line',
                  dataKey: 'netFlow',
                  label: 'Net flow',
                  showMark: false,
                  color: theme.palette.balanceNetFlow.main,
                },
              ]}
              height={height}
            >
              <ChartsGrid horizontal />
              <BarPlot />
              <LinePlot />
              <ChartsXAxis />
              <ChartsYAxis />
              <ChartsTooltip trigger="axis" />
              <ChartsLegend
                sx={{
                  fontSize: LEGEND_FONT_SIZE,
                }}
              />
            </ChartContainer>
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
          title="Agent skill distribution"
          renderChart={(height) => {
            function createSkillValueFormatter(
              minSkillKey: 'minP0' | 'minP10' | 'minP20' | 'minP30' | 'minP40' | 'minP50' | 'minP60' | 'minP70' | 'minP80' | 'minP90',
              countKey: 'countP0to10' | 'countP10to20' | 'countP20to30' | 'countP30to40' | 'countP40to50' | 'countP50to60' | 'countP60to70' | 'countP70to80' | 'countP80to90' | 'countP90to100',
            ): (value: number | null, context: { dataIndex: number }) => string {
              return (_value, context): string => {
                const datasetItem = datasets.agentSkillDistribution[context.dataIndex]
                if (datasetItem === undefined) {
                  return ''
                }
                const minSkill: number = datasetItem[minSkillKey]
                const agentCount: number = datasetItem[countKey]
                return `Min skill: ${minSkill.toFixed(1)}, Agents: ${agentCount}`
              }
            }

            function formatTurnWithTotalAgents(turn: number): string {
              const datasetItem = datasets.agentSkillDistribution.find((item) => item.turn === turn)
              if (datasetItem === undefined) {
                return formatTurn(turn)
              }
              return `${formatTurn(turn)} (Total agents: ${datasetItem.totalAgents}, Max skill: ${datasetItem.maxSkill.toFixed(1)})`
            }

            return (
              <LineChart
                dataset={datasets.agentSkillDistribution}
                xAxis={[
                  {
                    dataKey: 'turn',
                    label: 'Turn',
                    valueFormatter: formatTurnWithTotalAgents,
                    ...axisConfig,
                  },
                ]}
                yAxis={[yAxisConfig]}
                series={withNoMarkers([
                  {
                    dataKey: 'p0to10',
                    label: '0-10%',
                    stack: 'skill',
                    area: true,
                    color: purple[50],
                    valueFormatter: createSkillValueFormatter('minP0', 'countP0to10'),
                  },
                  {
                    dataKey: 'p10to20',
                    label: '10-20%',
                    stack: 'skill',
                    area: true,
                    color: purple[100],
                    valueFormatter: createSkillValueFormatter('minP10', 'countP10to20'),
                  },
                  {
                    dataKey: 'p20to30',
                    label: '20-30%',
                    stack: 'skill',
                    area: true,
                    color: purple[200],
                    valueFormatter: createSkillValueFormatter('minP20', 'countP20to30'),
                  },
                  {
                    dataKey: 'p30to40',
                    label: '30-40%',
                    stack: 'skill',
                    area: true,
                    color: purple[300],
                    valueFormatter: createSkillValueFormatter('minP30', 'countP30to40'),
                  },
                  {
                    dataKey: 'p40to50',
                    label: '40-50%',
                    stack: 'skill',
                    area: true,
                    color: purple[400],
                    valueFormatter: createSkillValueFormatter('minP40', 'countP40to50'),
                  },
                  {
                    dataKey: 'p50to60',
                    label: '50-60%',
                    stack: 'skill',
                    area: true,
                    color: purple[500],
                    valueFormatter: createSkillValueFormatter('minP50', 'countP50to60'),
                  },
                  {
                    dataKey: 'p60to70',
                    label: '60-70%',
                    stack: 'skill',
                    area: true,
                    color: purple[600],
                    valueFormatter: createSkillValueFormatter('minP60', 'countP60to70'),
                  },
                  {
                    dataKey: 'p70to80',
                    label: '70-80%',
                    stack: 'skill',
                    area: true,
                    color: purple[700],
                    valueFormatter: createSkillValueFormatter('minP70', 'countP70to80'),
                  },
                  {
                    dataKey: 'p80to90',
                    label: '80-90%',
                    stack: 'skill',
                    area: true,
                    color: purple[800],
                    valueFormatter: createSkillValueFormatter('minP80', 'countP80to90'),
                  },
                  {
                    dataKey: 'p90to100',
                    label: '90-100%',
                    stack: 'skill',
                    area: true,
                    color: purple[900],
                    valueFormatter: createSkillValueFormatter('minP90', 'countP90to100'),
                  },
                ])}
                height={height}
                grid={{ horizontal: true }}
                slotProps={{
                  tooltip: { trigger: 'axis' },
                  ...legendSlotProps,
                }}
              />
            )
          }}
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
        <Paper elevation={2} sx={{ position: 'relative', height: '100%', p: 2 }}>
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
        </Paper>
      </Dialog>
    </>
  )
}

function formatTurn(value: number): string {
  return `Turn ${value}`
}
