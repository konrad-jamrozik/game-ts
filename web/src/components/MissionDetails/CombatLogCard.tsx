import type { GridRowClassNameParams } from '@mui/x-data-grid'
import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { COMBAT_LOG_CARD_WIDTH } from '../Common/widthConstants'
import type { MissionSiteId } from '../../lib/model/missionSiteModel'
import { useMissionReport } from './useMissionReport'
import { CombatLogToolbar } from './CombatLogToolbar'
import { getCombatLogColumns, type CombatLogRow } from './getCombatLogColumns'
import { f6max, toF6 } from '../../lib/primitives/fixed6'

type CombatLogCardProps = {
  missionSiteId: MissionSiteId
}

export function CombatLogCard({ missionSiteId }: CombatLogCardProps): React.JSX.Element {
  const [showAgentAttacks, setShowAgentAttacks] = React.useState(true)
  const [showEnemyAttacks, setShowEnemyAttacks] = React.useState(true)

  const missionReport = useMissionReport(missionSiteId)
  const attackLogs = missionReport?.battleStats.attackLogs ?? []

  const allRows: CombatLogRow[] = attackLogs.map((log, index) => ({
    id: index,
    attackId: index + 1,
    ...log,
  }))

  // Compute combat-wide max effective skill from all rows (unfiltered)
  const combatMaxSkill = allRows.reduce((max, row) => {
    const maxAttackerDefender = f6max(row.attackerSkill, row.defenderSkill)
    return f6max(max, maxAttackerDefender)
  }, toF6(0))

  // Filter rows based on checkbox states
  const rows: CombatLogRow[] = allRows.filter((row) =>
    row.attackerType === 'Agent' ? showAgentAttacks : showEnemyAttacks,
  )

  const columns = getCombatLogColumns({ rows, combatMaxSkill })

  return (
    <ExpandableCard id="combat-log" title="Combat Log" defaultExpanded={true} sx={{ width: COMBAT_LOG_CARD_WIDTH }}>
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
          '& .combat-log-skill-cell': {
            padding: '4px',
          },
        }}
      />
    </ExpandableCard>
  )
}
