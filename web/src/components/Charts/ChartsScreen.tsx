import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import * as React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { clearViewCharts } from '../../redux/slices/selectionSlice'
import { selectChartsDatasets } from '../../redux/selectors/chartsSelectors'
// Import theme to ensure module augmentation is visible to TypeScript

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
    <Box>
      <Grid
        container
        direction="row"
        spacing={2}
        padding={2}
        paddingX={1}
        bgcolor={'#30303052'}
        flexWrap={'wrap'}
        justifyContent={'center'}
      >
        <Grid>
          <Stack spacing={2} alignItems="center">
            <Button variant="contained" onClick={handleBackClick}>
              Back to command center
            </Button>
          </Stack>
        </Grid>

        <Grid sx={{ width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              justifyItems: 'center',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '1fr 1fr',
                xl: '1fr 1fr 1fr',
              },
            }}
          >
            <ChartsPanel title="Money">
              <LineChart
                dataset={datasets.assets}
                xAxis={[{ dataKey: 'turn', label: 'Turn', valueFormatter: formatTurn }]}
                series={[
                  { dataKey: 'money', label: 'Money', color: theme.palette.moneyBalance.main },
                  { dataKey: 'funding', label: 'Funding', color: theme.palette.moneyFunding.main },
                  { dataKey: 'contracting', label: 'Contracting', color: theme.palette.moneyContracting.main },
                  { dataKey: 'upkeep', label: 'Upkeep', color: theme.palette.moneyUpkeep.main },
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
                  { dataKey: 'maxEffectiveSkillMin', label: 'Max eff. skill (min)' },
                  { dataKey: 'maxEffectiveSkillAvg', label: 'Max eff. skill (avg)' },
                  { dataKey: 'maxEffectiveSkillMedian', label: 'Max eff. skill (median)' },
                  { dataKey: 'maxEffectiveSkillP90', label: 'Max eff. skill (p90)' },
                  { dataKey: 'maxEffectiveSkillSum', label: 'Max eff. skill (sum)' },
                  { dataKey: 'currentEffectiveSkillSum', label: 'Current eff. skill (sum)' },
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
                  { dataKey: 'maxHitPointsAvg', label: 'Max HP (avg)' },
                  { dataKey: 'maxHitPointsMax', label: 'Max HP (max)' },
                  { dataKey: 'hitPointsAvg', label: 'HP (avg)' },
                  { dataKey: 'hitPointsMax', label: 'HP (max)' },
                  { dataKey: 'exhaustionAvg', label: 'Exhaustion (avg)' },
                  { dataKey: 'exhaustionMax', label: 'Exhaustion (max)' },
                  { dataKey: 'recoveryTurnsAvg', label: 'Recovery turns (avg)' },
                  { dataKey: 'recoveryTurnsMax', label: 'Recovery turns (max)' },
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
                  { dataKey: 'spawned', label: 'Spawned (total)' },
                  { dataKey: 'expired', label: 'Expired (total)' },
                  { dataKey: 'won', label: 'Completed successfully (total)' },
                  { dataKey: 'retreated', label: 'Retreated (total)' },
                  { dataKey: 'wiped', label: 'Wiped (total)' },
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
                  { dataKey: 'agentsDeployed', label: 'Agents deployed' },
                  { dataKey: 'agentsKia', label: 'Agents KIA' },
                  { dataKey: 'agentsWounded', label: 'Agents wounded' },
                  { dataKey: 'agentsUnscathed', label: 'Agents unscathed' },
                  { dataKey: 'enemiesKia', label: 'Enemies KIA' },
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
                  },
                ]}
                height={300}
                grid={{ horizontal: true }}
                slotProps={{ tooltip: { trigger: 'axis' } }}
              />
            </ChartsPanel>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

function ChartsPanel(props: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <Paper
      elevation={2}
      sx={{
        width: 'min(700px, 100%)',
        padding: 2,
      }}
    >
      <Stack spacing={1}>
        <Typography variant="h6">{props.title}</Typography>
        <Box sx={{ width: '100%' }}>{props.children}</Box>
      </Stack>
    </Paper>
  )
}

function formatTurn(value: number): string {
  return value.toString()
}
