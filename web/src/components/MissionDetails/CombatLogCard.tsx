import type { GridColDef, GridRenderCellParams, GridRowClassNameParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtPctDec0, fmtDec1, fmtDec2, fmtInt, fmtNoPrefix } from '../../lib/primitives/formatPrimitives'
import type { MissionSiteId } from '../../lib/model/model'
import { CombatLogToolbar } from './CombatLogToolbar'

type CombatLogRow = {
  id: number
  attackId: number
  roundNumber: number
  agentId: string
  enemyId: string
  attackerType: 'Agent' | 'Enemy'
  attackerSkill: Fixed6
  attackerSkillAtStart: Fixed6
  defenderSkill: Fixed6
  defenderSkillAtStart: Fixed6
  roll: number
  threshold: number
  outcome: 'Hit' | 'Miss' | 'Terminate'
  damage: number | undefined
  damageMin: number
  damageMax: number
  defenderHp: number
  defenderHpMax: number
}

type CombatLogCardProps = {
  missionSiteId: MissionSiteId
}

export function CombatLogCard({ missionSiteId }: CombatLogCardProps): React.JSX.Element {
  const turnStartReport = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)
  const [showAgentAttacks, setShowAgentAttacks] = React.useState(true)
  const [showEnemyAttacks, setShowEnemyAttacks] = React.useState(true)

  const missionReport = turnStartReport?.missions.find((m) => m.missionSiteId === missionSiteId)
  const attackLogs = missionReport?.battleStats.attackLogs ?? []

  const allRows: CombatLogRow[] = attackLogs.map((log, index) => ({
    id: index,
    attackId: index + 1,
    ...log,
  }))

  // Filter rows based on checkbox states
  const rows: CombatLogRow[] = allRows.filter((row) =>
    row.attackerType === 'Agent' ? showAgentAttacks : showEnemyAttacks,
  )

  const columns: GridColDef<CombatLogRow>[] = [
    {
      field: 'attackId',
      headerName: 'ID',
      width: 50,
      type: 'number',
    },
    {
      field: 'roundNumber',
      headerName: 'R',
      width: 50,
      type: 'number',
    },
    {
      field: 'agentId',
      headerName: 'Agent',
      width: 100,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const isDefenderDead = params.row.attackerType === 'Enemy' && params.row.defenderHp <= 0
        return <span style={{ color: isDefenderDead ? 'hsl(4, 90%, 58%)' : undefined }}>{params.row.agentId}</span>
      },
    },
    {
      field: 'enemyId',
      headerName: 'Enemy',
      width: 150,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const isDefenderDead = params.row.attackerType === 'Agent' && params.row.defenderHp <= 0
        return (
          <span style={{ color: isDefenderDead ? 'hsl(4, 90%, 58%)' : undefined }}>
            {fmtNoPrefix(params.row.enemyId, 'enemy-')}
          </span>
        )
      },
    },
    {
      field: 'attackerType',
      headerName: 'Attacker',
      width: 80,
    },
    {
      field: 'outcome',
      headerName: 'Outcome',
      width: 90,
    },
    {
      field: 'attackerSkill',
      headerName: 'Att Skill',
      width: 130,
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.attackerSkill, params.row.attackerSkillAtStart)
        return (
          <span>
            {f6fmtInt(params.row.attackerSkill)}/{f6fmtInt(params.row.attackerSkillAtStart)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'defenderSkill',
      headerName: 'Def Skill',
      width: 130,
      renderCell: (params: GridRenderCellParams<CombatLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.defenderSkill, params.row.defenderSkillAtStart)
        return (
          <span>
            {f6fmtInt(params.row.defenderSkill)}/{f6fmtInt(params.row.defenderSkillAtStart)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'roll',
      headerName: 'Att Roll',
      width: 70,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => (
        <span>{fmtDec2(params.row.roll)}%</span>
      ),
    },
    {
      field: 'threshold',
      headerName: '> Threshold',
      width: 110,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const exceeded = params.row.roll > params.row.threshold
        return (
          <span style={{ color: exceeded ? 'hsl(122, 39%, 49%)' : 'hsl(4, 90%, 58%)' }}>
            {exceeded ? '✅' : '❌'} {fmtDec2(params.row.threshold)}%
          </span>
        )
      },
    },
    {
      field: 'damage',
      headerName: 'Damage',
      width: 180,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        if (params.row.damage === undefined) {
          return <span>-</span>
        }
        const damageRangePct =
          params.row.damageMax === params.row.damageMin
            ? 50
            : ((params.row.damage - params.row.damageMin) / (params.row.damageMax - params.row.damageMin)) * 100
        const damagePct = Math.round(50 + damageRangePct)
        const damageAverage = (params.row.damageMin + params.row.damageMax) / 2
        const damageAverageFormatted = Number.isInteger(damageAverage) ? fmtInt(damageAverage) : fmtDec1(damageAverage)
        return (
          <span>
            {params.row.damage} ({params.row.damageMin}-{params.row.damageMax}, {damagePct}% of {damageAverageFormatted}
            )
          </span>
        )
      },
    },
    {
      field: 'defenderHp',
      headerName: 'HP',
      width: 110,
      renderCell: (params: GridRenderCellParams<CombatLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.defenderHp, params.row.defenderHpMax)
        const isZeroOrLess = params.row.defenderHp <= 0
        return (
          <span style={{ color: isZeroOrLess ? 'hsl(4, 90%, 58%)' : undefined }}>
            {Math.round(params.row.defenderHp)}/{params.row.defenderHpMax} ({hpPct})
          </span>
        )
      },
    },
  ]

  const CARD_WIDTH = 2 + 16 + 19 + 50 + 50 + 100 + 150 + 80 + 90 + 130 + 130 + 70 + 110 + 180 + 110 // borders + padding + filler + columns

  return (
    <ExpandableCard id="combat-log" title="Combat Log" defaultExpanded={true} sx={{ width: CARD_WIDTH }}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        aria-label="Combat Log"
        hideFooter
        disableColumnMenu={false}
        // Error: MUI X: `pageSize` cannot exceed 100 in the MIT version of the DataGrid.
        // You need to upgrade to DataGridPro or DataGridPremium component to unlock this feature.
        paginationModel={{ page: 0, pageSize: 100 }}
        getRowClassName={(params: GridRowClassNameParams<CombatLogRow>) =>
          params.row.attackerType === 'Agent' ? 'combat-log-row-agent' : 'combat-log-row-enemy'
        }
        slots={{ toolbar: CombatLogToolbar }}
        slotProps={{
          toolbar: {
            showAgentAttacks,
            onToggleAgentAttacks: setShowAgentAttacks,
            showEnemyAttacks,
            onToggleEnemyAttacks: setShowEnemyAttacks,
          },
        }}
        showToolbar
        sx={{
          '& .combat-log-row-agent': {
            backgroundColor: 'hsl(120, 15.00%, 17.00%)',
            '&:hover': {
              backgroundColor: 'hsl(120, 30.00%, 22.00%)',
            },
          },
          '& .combat-log-row-enemy': {
            backgroundColor: 'hsl(4, 15.00%, 17.00%)',
            '&:hover': {
              backgroundColor: 'hsl(4, 30.00%, 22.00%)',
            },
          },
        }}
      />
    </ExpandableCard>
  )
}
