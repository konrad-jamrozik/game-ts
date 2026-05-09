import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { f6c0, f6fmtInt, f6fmtPctDec0, toF, type Fixed6 } from '../../lib/primitives/fixed6'
import type { AgentState } from '../../lib/model/agentModel'
import type { GameState } from '../../lib/model/gameStateModel'
import { fmtIdForDisplay } from '../../lib/model_utils/formatUtils'
import { fmtDec1 } from '../../lib/primitives/formatPrimitives'
import { getMissionAgentUnavailableReason } from '../../lib/model_utils/agentReadinessUtils'
import { calculateCombatRating } from '../../lib/ruleset/combatRatingRuleset'
import { effectiveSkill } from '../../lib/ruleset/skillRuleset'
import { columnWidths } from '../Common/columnWidths'
import { getModelPalette } from '../styling/modelPaletteUtils'
import { MyChip } from '../Common/MyChip'
import { bldFixed6SortComparator } from '../Common/dataGridSortUtils'
import { ColorBar } from '../ColorBar/ColorBar'
import { AGENTS_SKILL_BAR_GREY, getColorBarFillColor } from '../ColorBar/colorBarUtils'
import type { AgentRow } from '../AgentsDataGrid/getAgentsColumns'

export function getAgentsColumnsForMissions(
  rows: AgentRow[],
  maxSkillNonTerminated: Fixed6,
  _missions: GameState['missions'],
): GridColDef<AgentRow>[] {
  return [
    {
      field: 'id',
      headerName: 'ID',
      width: columnWidths['agents.id'],
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => {
        const displayValue = fmtIdForDisplay(params.row.id)
        return <span aria-label={`missions-agents-row-agent-id-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'state',
      headerName: 'State',
      width: columnWidths['agents.state'],
      renderCell: (params: GridRenderCellParams<AgentRow, AgentState>): React.JSX.Element => {
        const state = params.value
        if (state === undefined) {
          return <span aria-label={`missions-agents-row-state-${params.id}`}>-</span>
        }
        const paletteColorName = getModelPalette()[state]
        return (
          <span aria-label={`missions-agents-row-state-${params.id}`}>
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
        }
        return <span aria-label={`missions-agents-row-assignment-${params.id}`}>{displayValue}</span>
      },
    },
    {
      field: 'combatRating',
      headerName: 'CR',
      width: columnWidths['agents.missions.cr'],
      align: 'center',
      headerAlign: 'center',
      type: 'number',
      valueGetter: (_value, row: AgentRow): number => calculateCombatRating(row),
      renderCell: (params: GridRenderCellParams<AgentRow, number>): React.JSX.Element => {
        const cr = params.value ?? calculateCombatRating(params.row)
        return <span aria-label={`missions-agents-row-cr-${params.id}`}>{fmtDec1(cr)}</span>
      },
    },
    {
      field: 'skill',
      headerName: 'Skill',
      width: columnWidths['agents.skill'],
      cellClassName: 'agents-color-bar-cell',
      sortComparator: bldFixed6SortComparator(
        rows,
        (row) => effectiveSkill(row),
        (row) => row.skill,
        (row) => row.rowId,
      ),
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed6>): React.JSX.Element => {
        const effectiveSkillVal = effectiveSkill(params.row)
        const baselineSkill = params.value ?? f6c0
        const percentage = f6fmtPctDec0(effectiveSkillVal, baselineSkill)
        const { fillPct, colorPct, backgroundOverride } = getSkillBarDisplay(
          effectiveSkillVal,
          baselineSkill,
          maxSkillNonTerminated,
        )
        return (
          <ColorBar fillPct={fillPct} colorPct={colorPct} backgroundOverride={backgroundOverride}>
            <div
              aria-label={`missions-agents-row-skill-${params.id}`}
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
            aria-label={`missions-agents-row-hit-points-${params.id}`}
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
            <span style={{ textAlign: 'right' }}>{f6fmtInt(params.row.maxHitPoints)}</span>
          </div>
        )
      },
    },
    {
      field: 'exhaustionPct',
      headerName: 'Exh.',
      width: columnWidths['agents.exhaustionPct'],
      cellClassName: 'agents-color-bar-cell',
      sortComparator: bldFixed6SortComparator(
        rows,
        (row) => row.exhaustionPct,
        undefined,
        (row) => row.rowId,
      ),
      renderCell: (params: GridRenderCellParams<AgentRow, Fixed6>): React.JSX.Element => {
        const exhaustionPctF6 = params.value ?? f6c0
        const exhaustionPct = toF(exhaustionPctF6)
        const { fillPct, colorPct } = getExhaustionBarPcts(exhaustionPct)
        return (
          <ColorBar fillPct={fillPct} colorPct={colorPct} linearYellowToRed>
            <span aria-label={`missions-agents-row-exhaustion-${params.id}`}>{exhaustionPct}%</span>
          </ColorBar>
        )
      },
    },
    {
      field: 'unavailable',
      headerName: 'Unavailable',
      width: columnWidths['agents.missions.unavailable'],
      sortable: false,
      valueGetter: (_value, row: AgentRow): string => getMissionAgentUnavailableReason(row),
      renderCell: (params: GridRenderCellParams<AgentRow, string>): React.JSX.Element => (
        <span aria-label={`missions-agents-row-unavailable-${params.id}`}>{params.value ?? ''}</span>
      ),
    },
  ]
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

  const backgroundOverride = `linear-gradient(90deg, ${fillColor} 0%, ${fillColor} ${effectiveFillPct}%, ${AGENTS_SKILL_BAR_GREY} ${effectiveFillPct}%, ${AGENTS_SKILL_BAR_GREY} ${greyEndPct}%, transparent ${greyEndPct}%, transparent 100%)`

  return { fillPct: effectiveFillPct, colorPct, backgroundOverride }
}

function getExhaustionBarPcts(exhaustion: number): { fillPct: number; colorPct: number } {
  const fillPct = Math.max(0, Math.min(100, exhaustion))
  const colorPct = fillPct / 100
  return { fillPct, colorPct }
}
