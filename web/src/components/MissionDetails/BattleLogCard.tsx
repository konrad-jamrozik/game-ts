import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { MyChip } from '../Common/MyChip'
import { f6fmtInt, f6fmtPctDec0, type Fixed6 } from '../../lib/primitives/fixed6'
import { fmtPctDec0 } from '../../lib/primitives/formatPrimitives'
import type { MissionSiteId } from '../../lib/model/model'

type BattleLogRow = {
  id: number
  roundNumber: number
  status: 'Ongoing' | 'Retreated' | 'Won' | 'Lost'
  agentCount: number
  agentCountTotal: number
  agentSkill: Fixed6
  agentSkillTotal: Fixed6
  agentHp: number
  agentHpTotal: number
  enemyCount: number
  enemyCountTotal: number
  enemySkill: Fixed6
  enemySkillTotal: Fixed6
  enemyHp: number
  enemyHpTotal: number
  skillRatio: Fixed6
}

type BattleLogCardProps = {
  missionSiteId: MissionSiteId
}

export function BattleLogCard({ missionSiteId }: BattleLogCardProps): React.JSX.Element {
  const turnStartReport = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  const missionReport = turnStartReport?.missions.find((m) => m.missionSiteId === missionSiteId)
  const roundLogs = missionReport?.battleStats.roundLogs ?? []

  const rows: BattleLogRow[] = roundLogs.map((log, index) => ({
    id: index,
    ...log,
  }))

  const columns: GridColDef<BattleLogRow>[] = [
    {
      field: 'roundNumber',
      headerName: 'R',
      width: 50,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <MyChip chipValue={params.row.status} />
      ),
    },
    {
      field: 'agentCount',
      headerName: 'Agents',
      width: 70,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <span>
          {params.row.agentCount}/{params.row.agentCountTotal}
        </span>
      ),
    },
    {
      field: 'agentSkill',
      headerName: 'Agent Skill',
      width: 150,
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.agentSkill, params.row.agentSkillTotal)
        return (
          <span>
            {f6fmtInt(params.row.agentSkill)}/{f6fmtInt(params.row.agentSkillTotal)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'agentHp',
      headerName: 'Agent HP',
      width: 140,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.agentHp, params.row.agentHpTotal)
        return (
          <span>
            {Math.round(params.row.agentHp)}/{params.row.agentHpTotal} ({hpPct})
          </span>
        )
      },
    },
    {
      field: 'enemyCount',
      headerName: 'Enem.',
      width: 70,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => (
        <span>
          {params.row.enemyCount}/{params.row.enemyCountTotal}
        </span>
      ),
    },
    {
      field: 'enemySkill',
      headerName: 'Enemy Skill',
      width: 150,
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => {
        const skillPct = f6fmtPctDec0(params.row.enemySkill, params.row.enemySkillTotal)
        return (
          <span>
            {f6fmtInt(params.row.enemySkill)}/{f6fmtInt(params.row.enemySkillTotal)} ({skillPct})
          </span>
        )
      },
    },
    {
      field: 'enemyHp',
      headerName: 'Enemy HP',
      width: 140,
      renderCell: (params: GridRenderCellParams<BattleLogRow>): React.JSX.Element => {
        const hpPct = fmtPctDec0(params.row.enemyHp, params.row.enemyHpTotal)
        return (
          <span>
            {Math.round(params.row.enemyHp)}/{params.row.enemyHpTotal} ({hpPct})
          </span>
        )
      },
    },
    {
      field: 'skillRatio',
      headerName: 'Ratio',
      width: 60,
      renderCell: (params: GridRenderCellParams<BattleLogRow, Fixed6>): React.JSX.Element => (
        <span>{f6fmtPctDec0(params.row.skillRatio)}</span>
      ),
    },
  ]

  const CARD_WIDTH = 2 + 16 + 19 + 50 + 100 + 70 + 150 + 140 + 70 + 150 + 140 + 60 // borders + padding + filler + columns

  return (
    <ExpandableCard id="battle-log" title="Battle Log" defaultExpanded={true} sx={{ width: CARD_WIDTH }}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Battle Log" hideFooter />
    </ExpandableCard>
  )
}
