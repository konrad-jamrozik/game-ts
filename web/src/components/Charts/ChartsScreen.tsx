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
            xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
            series={[
              { dataKey: 'money', label: 'Money', color: theme.palette.moneyBalance.main, showMark: false },
              { dataKey: 'funding', label: 'Funding', color: theme.palette.moneyFunding.main, showMark: false },
              {
                dataKey: 'contracting',
                label: 'Contracting',
                color: theme.palette.moneyContracting.main,
                showMark: false,
              },
              { dataKey: 'upkeep', label: 'Upkeep', color: theme.palette.moneyUpkeep.main, showMark: false },
            ]}
            height={300}
            grid={{ horizontal: true }}
            slotProps={{ tooltip: { trigger: 'axis' } }}
          />
        </ChartsPanel>

        <ChartsPanel title="Agent skill">
          <LineChart
            dataset={datasets.agentSkill}
            xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
            series={[
              { dataKey: 'maxEffectiveSkillMin', label: 'Max eff. skill (min)', showMark: false },
              { dataKey: 'maxEffectiveSkillAvg', label: 'Max eff. skill (avg)', showMark: false },
              { dataKey: 'maxEffectiveSkillMedian', label: 'Max eff. skill (median)', showMark: false },
              { dataKey: 'maxEffectiveSkillP90', label: 'Max eff. skill (p90)', showMark: false },
              { dataKey: 'maxEffectiveSkillSum', label: 'Max eff. skill (sum)', showMark: false },
              { dataKey: 'currentEffectiveSkillSum', label: 'Current eff. skill (sum)', showMark: false },
            ]}
            height={300}
            grid={{ horizontal: true }}
            slotProps={{ tooltip: { trigger: 'axis' } }}
          />
        </ChartsPanel>

        <ChartsPanel title="Agent readiness">
          <LineChart
            dataset={datasets.agentReadiness}
            xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
            series={[
              { dataKey: 'maxHitPointsAvg', label: 'Max HP (avg)', showMark: false },
              { dataKey: 'maxHitPointsMax', label: 'Max HP (max)', showMark: false },
              { dataKey: 'hitPointsAvg', label: 'HP (avg)', showMark: false },
              { dataKey: 'hitPointsMax', label: 'HP (max)', showMark: false },
              { dataKey: 'exhaustionAvg', label: 'Exhaustion (avg)', showMark: false },
              { dataKey: 'exhaustionMax', label: 'Exhaustion (max)', showMark: false },
              { dataKey: 'recoveryTurnsAvg', label: 'Recovery turns (avg)', showMark: false },
              { dataKey: 'recoveryTurnsMax', label: 'Recovery turns (max)', showMark: false },
            ]}
            height={300}
            grid={{ horizontal: true }}
            slotProps={{ tooltip: { trigger: 'axis' } }}
          />
        </ChartsPanel>

        <ChartsPanel title="Missions">
          <LineChart
            dataset={datasets.missions}
            xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
            series={[
              { dataKey: 'spawned', label: 'Spawned (total)', showMark: false },
              { dataKey: 'expired', label: 'Expired (total)', showMark: false },
              { dataKey: 'won', label: 'Completed successfully (total)', showMark: false },
              { dataKey: 'retreated', label: 'Retreated (total)', showMark: false },
              { dataKey: 'wiped', label: 'Wiped (total)', showMark: false },
            ]}
            height={300}
            grid={{ horizontal: true }}
            slotProps={{ tooltip: { trigger: 'axis' } }}
          />
        </ChartsPanel>

        <ChartsPanel title="Battle stats (total over missions)">
          <LineChart
            dataset={datasets.battleStats}
            xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
            series={[
              { dataKey: 'agentsDeployed', label: 'Agents deployed', showMark: false },
              { dataKey: 'agentsKia', label: 'Agents KIA', showMark: false },
              { dataKey: 'agentsWounded', label: 'Agents wounded', showMark: false },
              { dataKey: 'agentsUnscathed', label: 'Agents unscathed', showMark: false },
              { dataKey: 'enemiesKia', label: 'Enemies KIA', showMark: false },
            ]}
            height={300}
            grid={{ horizontal: true }}
            slotProps={{ tooltip: { trigger: 'axis' } }}
          />
        </ChartsPanel>

        <ChartsPanel title="Situation report">
          <LineChart
            dataset={datasets.situationReport}
            xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
            series={[
              {
                dataKey: 'panicPct',
                label: 'Panic (%)',
                valueFormatter: (v: number | null) => (typeof v === 'number' ? `${v.toFixed(2)}%` : ''),
                showMark: false,
              },
            ]}
            height={300}
            grid={{ horizontal: true }}
            slotProps={{ tooltip: { trigger: 'axis' } }}
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
