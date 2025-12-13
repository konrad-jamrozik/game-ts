import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { toF6, f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import type { AgentState } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { assertDefined } from '../../lib/primitives/assertPrimitives'
import { fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import { columnWidths } from '../Common/columnWidths'
import { getModelPalette } from '../styling/modelPaletteUtils'
import { MyChip } from '../Common/MyChip'
import type { AgentRow } from './AgentsDataGrid'
import { effectiveSkill } from '../../lib/ruleset/skillRuleset'
import { getRemainingRecoveryTurns } from '../../lib/ruleset/recoveryRuleset'
import { createFixed6SortComparator } from '../Common/dataGridSortUtils'
import { ColorBar } from '../ColorBar/ColorBar'
import { AGENTS_SKILL_BAR_GREY, getColorBarFillColor } from '../ColorBar/colorBarUtils'

export function getAgentsColumns(
  rows: AgentRow[],
  maxSkillNonTerminated: Fixed6,
  missionSites: GameState['missionSites'],
  currentTurn: number,
  hitPointsRecoveryPct: Fixed6,
): GridColDef[] {
  // Return all columns - visibility will be controlled by filterVisibleAgentColumns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: columnWidths['agents.id'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>) => (
        <span aria-label={`agents-row-agent-id-${params.id}`}>{params.value}</span>
      ),
    },
    {
      field: 'state',
      headerName: 'State',
      width: columnWidths['agents.state'],
      renderCell: (params: GridRenderCellParams<AgentRow, AgentState>): React.JSX.Element => {
        const state = params.value
        if (state === undefined) {
          return <span aria-label={`agents-row-state-${params.id}`}>-</span>
        }
        const paletteColorName = getModelPalette()[state]
        return (
          <span aria-label={`agents-row-state-${params.id}`}>
            <MyChip chipValue={state} paletteColorName={paletteColorName} />
          </span>
        )
      },
    },
    {
      field: 'assignment',
      headerName: 'Assignment',
      width: columnWidths['agents.assignment'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const assignment = params.value ?? ''
        let displayValue = assignment
        if (assignment.startsWith('investigation-')) {
          displayValue = assignment.replace('investigation-', 'invst-')
        } else if (assignment.startsWith('mission-')) {
          displayValue = fmtNoPrefix(assignment, 'mission-')
        }
        return <span aria-label={`agents-row-assignment-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'skill',
      headerName: 'Skill',
      width: columnWidths['agents.skill'],
      cellClassName: 'agents-color-bar-cell',
      sortComparator: createFixed6SortComparator(
        rows,
        (row) => effectiveSkill(row),
        (row) => row.skill,
        (row) => row.rowId, // agentId
      ),
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed6>): React.JSX.Element => {
        const effectiveSkillVal = effectiveSkill(params.row)
        const baselineSkill = params.value ?? toF6(0)
        const percentage = f6fmtPctDec0(effectiveSkillVal, baselineSkill)
        const { fillPct, colorPct, backgroundOverride } = getSkillBarDisplay(
          effectiveSkillVal,
          baselineSkill,
          maxSkillNonTerminated,
        )
        return (
          <ColorBar fillPct={fillPct} colorPct={colorPct} backgroundOverride={backgroundOverride}>
            <div
              aria-label={`agents-row-skill-${params.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '3ch 1ch 3ch 7ch',
                gap: '5px',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <span style={{ textAlign: 'right' }}>{f6fmtInt(effectiveSkillVal)}</span>
              <span style={{ textAlign: 'center' }}>/</span>
              <span style={{ textAlign: 'right' }}>{f6fmtInt(baselineSkill)}</span>
              <span style={{ textAlign: 'right' }}>({percentage})</span>
            </div>
          </ColorBar>
        )
      },
    },
    {
      field: 'hitPoints',
      headerName: 'HP',
      width: columnWidths['agents.hit_points'],
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed6>): React.JSX.Element => {
        if (params.value === undefined) {
          return <span />
        }
        return (
          <div
            aria-label={`agents-row-hit-points-${params.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '2ch 1ch 2ch',
              gap: '2px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <span style={{ textAlign: 'right' }}>{f6fmtInt(params.value)}</span>
            <span style={{ textAlign: 'center' }}>/</span>
            <span style={{ textAlign: 'right' }}>{params.row.maxHitPoints}</span>
          </div>
        )
      },
    },
    {
      field: 'recoveryTurns',
      headerName: 'Recovery',
      width: columnWidths['agents.recovery'],
      renderCell: (params: GridRenderCellParams<AgentRow>): React.JSX.Element => {
        const remainingTurns = getRemainingRecoveryTurns(params.row, hitPointsRecoveryPct)
        return (
          <span aria-label={`agents-row-recovery-${params.id}`}>
            {remainingTurns > 0 ? `${remainingTurns} turns` : '-'}
          </span>
        )
      },
    },
    {
      field: 'exhaustionPct',
      headerName: 'Exh.',
      width: columnWidths['agents.exhaustionPct'],
      cellClassName: 'agents-color-bar-cell',
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => {
        const exhaustionPct = params.value ?? 0
        const { fillPct, colorPct } = getExhaustionBarPcts(exhaustionPct)
        return (
          <ColorBar fillPct={fillPct} colorPct={colorPct} linearYellowToRed>
            <span aria-label={`agents-row-exhaustion-${params.id}`}>{exhaustionPct}%</span>
          </ColorBar>
        )
      },
    },
    {
      field: 'skillSimple',
      headerName: 'Skill',
      width: columnWidths['agents.skill_simple'],
      valueGetter: (_value, row: AgentRow) => f6fmtInt(row.skill),
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-skill-simple-${params.id}`}>{params.value ?? 0}</span>
      ),
    },
    {
      field: 'hitPointsMax',
      headerName: 'HP',
      width: columnWidths['agents.hit_points_max'],
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-hp-${params.id}`}>{params.row.maxHitPoints}</span>
      ),
    },
    {
      field: 'service',
      headerName: 'Service',
      width: columnWidths['agents.service'],
      valueGetter: (_value, row: AgentRow): number => {
        const { turnHired, turnTerminated } = row
        if (turnTerminated !== undefined) {
          return turnTerminated - turnHired + 1
        }
        return currentTurn - turnHired + 1
      },
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const { turnHired, turnTerminated } = params.row
        if (turnTerminated !== undefined) {
          // Terminated agent: show turnHired - turnTerminated (totalTurnsServed)
          const totalTurnsServed = turnTerminated - turnHired + 1
          return (
            <span aria-label={`agents-row-service-${params.id}`}>
              {turnHired}-{turnTerminated} ({totalTurnsServed})
            </span>
          )
        }
        // Active agent: show turnHired - currentTurn (totalTurnsServed)
        const totalTurnsServed = currentTurn - turnHired + 1
        return (
          <span aria-label={`agents-row-service-${params.id}`}>
            {turnHired}-{currentTurn} ({totalTurnsServed})
          </span>
        )
      },
    },
    {
      field: 'missionsTotal',
      headerName: 'Mis #',
      width: columnWidths['agents.missions_total'],
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => (
        <span aria-label={`agents-row-missions-total-${params.id}`}>{params.row.missionsTotal}</span>
      ),
    },
    {
      field: 'mission',
      headerName: 'Mis',
      width: columnWidths['agents.mission'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const { terminatedOnMissionSiteId, assignment } = params.row

        if (terminatedOnMissionSiteId !== undefined) {
          const missionSite = missionSites.find((site) => site.id === terminatedOnMissionSiteId)
          assertDefined(missionSite, `Mission site not found for id: ${terminatedOnMissionSiteId}`)
          const displayValue = fmtNoPrefix(missionSite.id, 'mission-site-')
          return <span aria-label={`agents-row-mission-${params.id}`}>{displayValue}</span>
        }
        // If agent was sacked (assignment is 'Sacked'), show "-"
        if (assignment === 'Sacked') {
          return <span aria-label={`agents-row-mission-${params.id}`}>Sacked</span>
        }
        // Fallback (shouldn't happen for terminated agents, but just in case)
        return <span aria-label={`agents-row-mission-${params.id}`}>-</span>
      },
    },
    {
      field: 'by',
      headerName: 'By',
      width: columnWidths['agents.by'],
      valueGetter: (_value, row: AgentRow): string => {
        const { terminatedBy } = row
        // Return display value without prefix for sorting and filtering
        if (terminatedBy !== undefined) {
          return fmtNoPrefix(terminatedBy, 'enemy-')
        }
        return '-'
      },
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const displayValue = params.value ?? '-'
        return <span aria-label={`agents-row-by-${params.id}`}>{displayValue}</span>
      },
    },
  ]

  return columns
}

function getSkillBarDisplay(
  effective: Fixed6,
  baseline: Fixed6,
  maxSkillNonTerminated: Fixed6,
): { fillPct: number; colorPct: number; backgroundOverride: string } {
  const maxDenom = maxSkillNonTerminated.value
  const effectiveFillPct = maxDenom > 0 ? Math.min(100, (effective.value / maxDenom) * 100) : 0
  const baselineFillPct = maxDenom > 0 ? Math.min(100, (baseline.value / maxDenom) * 100) : 0

  if (baseline.value <= 0) {
    const backgroundOverride = `linear-gradient(90deg, ${AGENTS_SKILL_BAR_GREY} 0%, ${AGENTS_SKILL_BAR_GREY} ${effectiveFillPct}%, transparent ${effectiveFillPct}%, transparent 100%)`
    return { fillPct: effectiveFillPct, colorPct: 0, backgroundOverride }
  }

  const ratio = effective.value / baseline.value
  const colorPct = Math.max(0, Math.min(1, ratio))

  const fillColor = getColorBarFillColor(colorPct)
  const greyEndPct = Math.max(effectiveFillPct, baselineFillPct)

  // Colored portion: effective skill vs max roster skill.
  // Grey portion: missing to reach baseline skill for this agent (still vs max roster skill).
  const backgroundOverride = `linear-gradient(90deg, ${fillColor} 0%, ${fillColor} ${effectiveFillPct}%, ${AGENTS_SKILL_BAR_GREY} ${effectiveFillPct}%, ${AGENTS_SKILL_BAR_GREY} ${greyEndPct}%, transparent ${greyEndPct}%, transparent 100%)`

  return { fillPct: effectiveFillPct, colorPct, backgroundOverride }
}

function getExhaustionBarPcts(exhaustion: number): { fillPct: number; colorPct: number } {
  const fillPct = Math.max(0, Math.min(100, exhaustion))
  // Exhaustion: yellow at 0%, red at 100% (linearYellowToRed maps 0->yellow, 1->red)
  const colorPct = fillPct / 100
  return { fillPct, colorPct }
}
