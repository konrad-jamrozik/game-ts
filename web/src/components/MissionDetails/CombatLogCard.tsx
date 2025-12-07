import type { GridRowClassNameParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import {
  COMBAT_LOG_AGENT_ID_WIDTH,
  COMBAT_LOG_ATTACKER_SKILL_WIDTH,
  COMBAT_LOG_ATTACKER_TYPE_WIDTH,
  COMBAT_LOG_ATTACK_ID_WIDTH,
  COMBAT_LOG_DAMAGE_WIDTH,
  COMBAT_LOG_DEFENDER_HP_WIDTH,
  COMBAT_LOG_DEFENDER_SKILL_WIDTH,
  COMBAT_LOG_ENEMY_ID_WIDTH,
  COMBAT_LOG_OUTCOME_WIDTH,
  COMBAT_LOG_ROLL_WIDTH,
  COMBAT_LOG_ROUND_NUMBER_WIDTH,
  COMBAT_LOG_THRESHOLD_WIDTH,
} from '../Common/columnWidths'
import type { MissionSiteId } from '../../lib/model/model'
import { CombatLogToolbar } from './CombatLogToolbar'
import { getCombatLogColumns, type CombatLogRow } from './getCombatLogColumns'

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

  const columns = getCombatLogColumns()

  const CARD_WIDTH =
    2 +
    16 +
    19 +
    COMBAT_LOG_ATTACK_ID_WIDTH +
    COMBAT_LOG_ROUND_NUMBER_WIDTH +
    COMBAT_LOG_AGENT_ID_WIDTH +
    COMBAT_LOG_ENEMY_ID_WIDTH +
    COMBAT_LOG_ATTACKER_TYPE_WIDTH +
    COMBAT_LOG_OUTCOME_WIDTH +
    COMBAT_LOG_ATTACKER_SKILL_WIDTH +
    COMBAT_LOG_DEFENDER_SKILL_WIDTH +
    COMBAT_LOG_ROLL_WIDTH +
    COMBAT_LOG_THRESHOLD_WIDTH +
    COMBAT_LOG_DAMAGE_WIDTH +
    COMBAT_LOG_DEFENDER_HP_WIDTH // borders + padding + filler + columns

  return (
    <ExpandableCard id="combat-log" title="Combat Log" defaultExpanded={true} sx={{ width: CARD_WIDTH }}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        aria-label="Combat Log"
        hideFooter={false}
        disableColumnMenu={false}
        // Error: MUI X: `pageSize` cannot exceed 100 in the MIT version of the DataGrid.
        // You need to upgrade to DataGridPro or DataGridPremium component to unlock this feature.
        // paginationModel={{ page: 0, pageSize: 100 }}
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
