import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { SUPPRESSION_DECAY_PCT } from '../model/lib/ruleset/constants'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtPctDiv100, fmtPct } from '../model/lib/utils/formatUtils'
import { assertDefined } from '../model/lib/utils/assert'

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts } = gameState

  // Calculate panic as percentage from accumulated panic value
  // 100% panic = 10,000, so divide by 100 to get percentage with 2 decimal places
  const panicPercentage = fmtPctDiv100(panic)

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 120 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
  ]

  const panicRows = [{ id: 1, metric: 'Panic', value: panicPercentage }]

  // Get Red Dawn faction data and check if it's discovered
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  // KJA LATER move this assertDefined inside augmented FactionsView find. Basically .net .Single()
  assertDefined(redDawnFaction, 'Red Dawn faction should be defined')
  const isRedDawnDiscovered = redDawnFaction.discoveryPrerequisite.every(
    (leadId) => (leadInvestigationCounts[leadId] ?? 0) > 0,
  )
  // Only calculate faction-specific data if Red Dawn is discovered
  const redDawnRows = isRedDawnDiscovered
    ? (() => {
        const panicIncrease = Math.max(0, redDawnFaction.threatLevel - redDawnFaction.suppression)
        return [
          { id: 1, metric: 'Threat level', value: fmtPctDiv100(redDawnFaction.threatLevel) },
          {
            id: 2,
            metric: 'Threat increase',
            value: fmtPctDiv100(redDawnFaction.threatIncrease),
          },
          { id: 3, metric: 'Suppression', value: fmtPctDiv100(redDawnFaction.suppression) },
          {
            id: 4,
            metric: 'Suppr. decay',
            value: fmtPct(SUPPRESSION_DECAY_PCT),
          },
          {
            id: 5,
            metric: 'Panic increase',
            value: fmtPctDiv100(panicIncrease),
          },
        ]
      })()
    : []

  return (
    <Card>
      <CardHeader title="Situation Report" />
      <CardContent>
        <Stack spacing={2}>
          <StyledDataGrid rows={panicRows} columns={columns} aria-label="Panic data" />
          {isRedDawnDiscovered && (
            <>
              <Typography variant="h5">{redDawnFaction.name} faction</Typography>
              <StyledDataGrid rows={redDawnRows} columns={columns} aria-label={`${redDawnFaction.name} Report data`} />
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
