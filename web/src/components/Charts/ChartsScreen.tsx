import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewCharts } from '../../redux/slices/selectionSlice'
import { selectChartsDatasets, selectTurnSnapshotsForCharts } from '../../redux/selectors/chartsSelectors'
import { AgentSkillChart } from './AgentSkillChart'
import { AgentStatusChart } from './AgentStatusChart'
import { AgentReadinessChart } from './AgentReadinessChart'
import { CombatRatingChart } from './CombatRatingChart'
import { AssetsChart } from './AssetsChart'
import { CashFlowChart } from './CashFlowChart'
import { MissionsChart, MissionsChartControls } from './MissionsChart'
import { ChartsPanel } from './ChartsPanel'
import { axisConfig, formatTurn, legendSlotProps, withNoMarkers, yAxisConfig } from './chartsUtils'

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
          title="Combat rating"
          renderChart={(height) => <CombatRatingChart gameStates={gameStates} height={height} />}
        />

        <ChartsPanel
          title="Missions"
          renderChart={(height) => <MissionsChart height={height} />}
          headerControls={<MissionsChartControls />}
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
