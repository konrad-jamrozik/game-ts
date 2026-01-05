import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewCharts } from '../../redux/slices/selectionSlice'
import { selectChartsDatasets, selectTurnSnapshotsForCharts } from '../../redux/selectors/chartsSelectors'
import { AgentSkillChart } from './AgentSkillChart'
import { AgentStatusChart } from './AgentStatusChart'
import { AgentReadinessChart } from './AgentReadinessChart'
import { AgentCombatRatingChart } from './AgentCombatRatingChart'
import { AssetsChart } from './AssetsChart'
import { CashFlowChart } from './CashFlowChart'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, yAxisConfig } from './chartsUtils'

const CHART_HEIGHT = 300

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
  const gameStates = useAppSelector(selectTurnSnapshotsForCharts)

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
          renderChart={(height) => <AssetsChart dataset={datasets.assets} height={height} />}
        />

        <ChartsPanel
          title="Cash Flow"
          renderChart={(height) => <CashFlowChart dataset={datasets.balanceSheet} height={height} />}
        />

        <ChartsPanel
          title="Skill Ranges Covered by Agent Skill Percentiles"
          renderChart={(height) => <AgentSkillChart gameStates={gameStates} height={height} />}
        />

        <ChartsPanel
          title="Agent status distribution"
          renderChart={(height) => <AgentStatusChart gameStates={gameStates} height={height} />}
        />

        <ChartsPanel
          title="Agent readiness"
          renderChart={(height) => <AgentReadinessChart gameStates={gameStates} height={height} />}
        />

        <ChartsPanel
          title="Agent combat rating"
          renderChart={(height) => <AgentCombatRatingChart gameStates={gameStates} height={height} />}
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
