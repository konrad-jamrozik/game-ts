import Stack from '@mui/material/Stack'
import * as React from 'react'
import { getAvailableLeadsForInvestigation } from '../../lib/model_utils/leadUtils'
import type { Mission } from '../../lib/model/missionModel'
import { useAppSelector } from '../../redux/hooks'
import { getCurrentTurnState } from '../../redux/storeUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { columnWidths } from '../Common/columnWidths'
import { getSituationReportColumns, type SituationReportRow } from '../SituationReport/getSituationReportColumns'
import { CARD_GAP } from '../styling/spacing'

export function OperationsSummaryDataGrids(): React.JSX.Element {
  return (
    <Stack direction="row" spacing={CARD_GAP} alignItems="flex-start">
      <LeadsSummaryDataGrid />
      <MissionsSummaryDataGrid />
    </Stack>
  )
}

export function LeadsSummaryDataGrid(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const leadsSummaryColumns = getSituationReportColumns({
    metricHeaderName: 'Leads',
    valueHeaderName: 'Count',
    metricWidth: columnWidths['operations_leads_summary.metric'],
    valueWidth: columnWidths['operations_leads_summary.count'],
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

  return <StyledDataGrid rows={leadsSummaryRows} columns={leadsSummaryColumns} aria-label="Leads summary data" />
}

export function MissionsSummaryDataGrid(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const missionsSummaryColumns = getSituationReportColumns({
    metricHeaderName: 'Missions',
    valueHeaderName: 'Count',
    metricWidth: columnWidths['operations_missions_summary.metric'],
    valueWidth: columnWidths['operations_missions_summary.count'],
  })
  const missionsSummaryRows = buildMissionsSummaryRows(gameState.missions)

  return <StyledDataGrid rows={missionsSummaryRows} columns={missionsSummaryColumns} aria-label="Missions summary data" />
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
