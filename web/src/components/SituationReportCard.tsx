import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../app/hooks'
import { SUPPRESSION_DECAY_PCT } from '../lib/model/ruleset/constants'
import { StyledDataGrid } from './StyledDataGrid'
import { fmtPct, str } from '../lib/utils/formatUtils'
import { assertDefined } from '../lib/utils/assert'
import {
  calculatePanicIncrease,
  getPanicNewBalance,
  decaySuppression,
  calculateLeadSuccessChance,
} from '../lib/model/ruleset/ruleset'
import { MyChip } from './MyChip'
import { bps, type Bps } from '../lib/model/bps'
import { getLeadById } from '../lib/collections/leads'
import { ExpandableCard } from './ExpandableCard'

export type SituationReportRow = {
  id: number
  metric: string
  value: string
  projected?: string
  diff?: number | Bps
  reverseColor?: boolean
}

export type LeadInvestigationRow = {
  id: string
  leadTitle: string
  intel: number
  successChance: Bps
  agents: number
  turns: number
}

export function SituationReportCard(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { panic, factions, leadInvestigationCounts, leadInvestigations } = gameState

  const panicPercentage = str(panic)
  const panicProjected = getPanicNewBalance(gameState)
  const panicProjectedStr = str(panicProjected)
  const panicDiff = bps(panicProjected.value - panic.value)

  const columns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', minWidth: 120 },
    { field: 'value', headerName: 'Value', minWidth: 80 },
    {
      field: 'projected',
      headerName: 'Projected',
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<SituationReportRow>): React.JSX.Element => {
        const { diff, metric, projected, reverseColor } = params.row

        if (projected === undefined) {
          return <span />
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-label={`situation-report-row-${metric.toLowerCase().replaceAll(' ', '-')}-projected`}>
              {projected}
            </span>
            {diff !== undefined && <MyChip chipValue={diff} reverseColor={reverseColor ?? false} />}
          </div>
        )
      },
    },
  ]

  const panicRows: SituationReportRow[] = [
    {
      id: 1,
      metric: 'Panic',
      value: panicPercentage,
      projected: panicProjectedStr,
      diff: panicDiff,
      reverseColor: true,
    },
  ]

  const leadInvestigationColumns: GridColDef[] = [
    { field: 'leadTitle', headerName: 'Lead', width: 200 },
    { field: 'intel', headerName: 'Intel', width: 40, type: 'number' },
    {
      field: 'successChance',
      headerName: 'Succ. %',
      width: 100,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => (
        <span>{str(params.row.successChance)}</span>
      ),
    },
    {
      field: 'agents',
      headerName: 'Agents',
      width: 80,
      renderCell: (params: GridRenderCellParams<LeadInvestigationRow>): React.JSX.Element => (
        <span>{params.row.agents}</span>
      ),
    },
  ]

  const leadInvestigationRows: LeadInvestigationRow[] = Object.values(leadInvestigations).map((investigation) => {
    const lead = getLeadById(investigation.leadId)
    const successChance = calculateLeadSuccessChance(investigation.accumulatedIntel, lead.difficultyConstant)
    return {
      id: investigation.id,
      leadTitle: lead.title,
      intel: investigation.accumulatedIntel,
      successChance,
      agents: investigation.agentIds.length,
      turns: investigation.turnsInvestigated,
    }
  })

  // Get Red Dawn faction data and check if it's discovered
  const redDawnFaction = factions.find((faction) => faction.id === 'faction-red-dawn')
  assertDefined(redDawnFaction, 'Red Dawn faction should be defined')
  const isRedDawnDiscovered = redDawnFaction.discoveryPrerequisite.every(
    (leadId) => (leadInvestigationCounts[leadId] ?? 0) > 0,
  )
  // Only calculate faction-specific data if Red Dawn is discovered
  const redDawnRows: SituationReportRow[] = isRedDawnDiscovered
    ? (() => {
        const panicIncrease = calculatePanicIncrease(redDawnFaction.threatLevel, redDawnFaction.suppression)
        const threatLevelProjected = bps(redDawnFaction.threatLevel.value + redDawnFaction.threatIncrease.value)
        const threatLevelDiff = bps(redDawnFaction.threatIncrease.value)
        const suppressionProjected = decaySuppression(redDawnFaction.suppression)
        const suppressionDiff = bps(suppressionProjected.value - redDawnFaction.suppression.value)
        const panicIncreaseProjected = calculatePanicIncrease(threatLevelProjected, suppressionProjected)
        const panicIncreaseDiff = bps(panicIncreaseProjected.value - panicIncrease.value)
        return [
          {
            id: 1,
            metric: 'Threat level',
            value: str(redDawnFaction.threatLevel),
            projected: str(threatLevelProjected),
            diff: threatLevelDiff,
            reverseColor: true,
          },
          {
            id: 2,
            metric: 'Threat increase',
            value: str(redDawnFaction.threatIncrease),
            reverseColor: true,
          },
          {
            id: 3,
            metric: 'Suppression',
            value: str(redDawnFaction.suppression),
            projected: str(suppressionProjected),
            diff: suppressionDiff,
          },
          {
            id: 4,
            metric: 'Suppr. decay',
            value: fmtPct(SUPPRESSION_DECAY_PCT),
          },
          {
            id: 5,
            metric: 'Panic increase',
            value: str(panicIncrease),
            projected: str(panicIncreaseProjected),
            diff: panicIncreaseDiff,
            reverseColor: true,
          },
        ]
      })()
    : []

  return (
    <ExpandableCard title="Situation Report" defaultExpanded={true}>
      <Stack spacing={2}>
        <StyledDataGrid rows={panicRows} columns={columns} aria-label="Panic data" />
        <Typography variant="h5">Lead Investigations</Typography>
        <StyledDataGrid
          rows={leadInvestigationRows}
          columns={leadInvestigationColumns}
          aria-label="Lead investigations data"
        />
        {isRedDawnDiscovered && (
          <>
            <Typography variant="h5">{redDawnFaction.name} faction</Typography>
            <StyledDataGrid rows={redDawnRows} columns={columns} aria-label={`${redDawnFaction.name} Report data`} />
          </>
        )}
      </Stack>
    </ExpandableCard>
  )
}
