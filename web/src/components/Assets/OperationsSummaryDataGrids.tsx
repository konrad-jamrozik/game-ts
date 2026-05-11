import Stack from '@mui/material/Stack'
import * as React from 'react'
import { getAvailableLeadsForInvestigation } from '../../lib/model_utils/leadUtils'
import type { Mission } from '../../lib/model/missionModel'
import { useAppSelector } from '../../redux/hooks'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { columnWidths } from '../Common/columnWidths'
import { getSituationReportColumns, type SituationReportRow } from '../SituationReport/getSituationReportColumns'

export function OperationsSummaryDataGrids(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const leadsSummaryColumns = getSituationReportColumns({
    metricHeaderName: 'Leads',
    valueHeaderName: 'Count',
    metricWidth: columnWidths['operations_summary.name'],
    valueWidth: columnWidths['operations_summary.count'],
  })
  const missionsSummaryColumns = getSituationReportColumns({
    metricHeaderName: 'Missions',
    valueHeaderName: 'Count',
    metricWidth: columnWidths['operations_summary.name'],
    valueWidth: columnWidths['operations_summary.count'],
  })

  const leadsSummaryRows: SituationReportRow[] = [
    {
      id: 1,
      metric: 'Investigations',
      value: `${Object.values(gameState.leadInvestigations).filter((investigation) => investigation.state === 'Active').length}`,
    },
    {
      id: 2,
      metric: 'Available',
      value: `${getAvailableLeadsForInvestigation(gameState).length}`,
    },
  ]

  const missionsSummaryRows = buildMissionsSummaryRows(gameState.missions)

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <StyledDataGrid rows={leadsSummaryRows} columns={leadsSummaryColumns} aria-label="Leads summary data" />
      <StyledDataGrid rows={missionsSummaryRows} columns={missionsSummaryColumns} aria-label="Missions summary data" />
    </Stack>
  )
}

function buildMissionsSummaryRows(missions: Mission[]): SituationReportRow[] {
  const missionSites = missions.filter((mission) => mission.state === 'Active').length
  const expiringSoon = missions.filter(
    (mission) =>
      mission.state === 'Active' &&
      mission.expiresIn !== 'never' &&
      typeof mission.expiresIn === 'number' &&
      mission.expiresIn <= 3,
  ).length
  const deployedMissions = missions.filter((mission) => mission.state === 'Deployed').length
  return [
    { id: 1, metric: 'Sites', value: String(missionSites) },
    { id: 2, metric: 'Expiring soon', value: String(expiringSoon) },
    { id: 3, metric: 'Deployed', value: String(deployedMissions) },
  ]
}
