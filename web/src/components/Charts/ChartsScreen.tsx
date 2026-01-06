import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearViewCharts,
  setChartsTurnRangeFilter,
  type ChartsTurnRangeFilter,
} from '../../redux/slices/selectionSlice'
import { selectChartsDatasets, selectTurnSnapshotsForCharts } from '../../redux/selectors/chartsSelectors'
import { AgentSkillChart } from './AgentSkillChart'
import { AgentStatusChart } from './AgentStatusChart'
import { AgentReadinessChart } from './AgentReadinessChart'
import { CombatRatingChart } from './CombatRatingChart'
import { AssetsChart } from './AssetsChart'
import { CashFlowChart } from './CashFlowChart'
import { MissionsChart, MissionsChartControls } from './MissionsChart'
import { ChartsPanel } from './ChartsPanel'
import { UpgradesChart } from './UpgradesChart'
import { AgentOutcomesChart } from './AgentOutcomesChart'
import { EnemiesKilledChart } from './EnemiesKilledChart'
import { DamageByEnemyChart } from './DamageByEnemyChart'
import { PanicChart } from './PanicChart'
import { LeadsChart } from './LeadsChart'
import { FactionsChart } from './FactionsChart'

export function ChartsScreen(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const turnRangeFilter = useAppSelector((state) => state.selection.chartsTurnRangeFilter ?? 'all')
  const datasets = useAppSelector(selectChartsDatasets)
  const gameStates = useAppSelector(selectTurnSnapshotsForCharts)

  // Filter data based on turn range
  const currentTurn = gameStates.at(-1)?.turn ?? 1
  const filteredGameStates = filterByTurnRange(gameStates, turnRangeFilter, currentTurn)
  const filteredDatasets = {
    assets: filterByTurnRange(datasets.assets, turnRangeFilter, currentTurn),
    missions: filterByTurnRange(datasets.missions, turnRangeFilter, currentTurn),
    missionsOutcome: filterByTurnRange(datasets.missionsOutcome, turnRangeFilter, currentTurn),
    balanceSheet: filterByTurnRange(datasets.balanceSheet, turnRangeFilter, currentTurn),
  }

  function handleBackClick(): void {
    dispatch(clearViewCharts())
  }

  function handleTurnRangeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value
    if (value === 'all' || value === 'last100' || value === 'currentTurn') {
      dispatch(setChartsTurnRangeFilter(value))
    }
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
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ marginBottom: 2 }}>
        <Button variant="contained" onClick={handleBackClick}>
          Back to command center
        </Button>
        <RadioGroup row value={turnRangeFilter} onChange={handleTurnRangeChange}>
          <FormControlLabel value="all" control={<Radio size="small" />} label="All turns" />
          <FormControlLabel value="last100" control={<Radio size="small" />} label="Last 100 turns" />
          <FormControlLabel value="currentTurn" control={<Radio size="small" />} label="Current turn" />
        </RadioGroup>
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
          renderChart={(height) => <AssetsChart dataset={filteredDatasets.assets} height={height} />}
        />

        <ChartsPanel
          title="Cash Flow"
          renderChart={(height) => <CashFlowChart dataset={filteredDatasets.balanceSheet} height={height} />}
        />

        <ChartsPanel
          title="Skill Ranges Covered by Agent Skill Percentiles"
          renderChart={(height) => <AgentSkillChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Agent status distribution"
          renderChart={(height) => <AgentStatusChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Agent readiness"
          renderChart={(height) => <AgentReadinessChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Combat rating"
          renderChart={(height) => <CombatRatingChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Missions"
          renderChart={(height) => <MissionsChart height={height} />}
          headerControls={<MissionsChartControls />}
        />

        <ChartsPanel
          title="Upgrades"
          renderChart={(height) => <UpgradesChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Agent Outcomes (cumulative)"
          renderChart={(height) => <AgentOutcomesChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Enemies Killed by Type (cumulative)"
          renderChart={(height) => <EnemiesKilledChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Damage by Enemy Type (cumulative)"
          renderChart={(height) => <DamageByEnemyChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Panic by Faction (cumulative)"
          renderChart={(height) => <PanicChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Lead Investigations"
          renderChart={(height) => <LeadsChart gameStates={filteredGameStates} height={height} />}
        />

        <ChartsPanel
          title="Factions"
          renderChart={(height) => <FactionsChart gameStates={filteredGameStates} height={height} />}
        />
      </Box>
    </Box>
  )
}

function filterByTurnRange<T extends { turn: number }>(
  data: T[],
  filter: ChartsTurnRangeFilter,
  currentTurn: number,
): T[] {
  switch (filter) {
    case 'all':
      return data
    case 'last100':
      return data.filter((item) => item.turn > currentTurn - 100)
    case 'currentTurn':
      return data.filter((item) => item.turn === currentTurn)
  }
}
