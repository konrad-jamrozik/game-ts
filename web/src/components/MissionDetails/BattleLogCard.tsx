import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { BATTLE_LOG_CARD_WIDTH } from '../Common/widthConstants'
import type { MissionSiteId } from '../../lib/model/model'
import { useMissionReport } from './useMissionReport'
import { getBattleLogColumns, type BattleLogRow } from './getBattleLogColumns'
import { f6max, toF6 } from '../../lib/primitives/fixed6'

type BattleLogCardProps = {
  missionSiteId: MissionSiteId
}

export function BattleLogCard({ missionSiteId }: BattleLogCardProps): React.JSX.Element {
  const missionReport = useMissionReport(missionSiteId)
  const roundLogs = missionReport?.battleStats.roundLogs ?? []

  const rows: BattleLogRow[] = roundLogs.map((log, index) => ({
    id: index,
    ...log,
  }))

  // Compute battle-wide max initial skill from all rows
  const maxInitialSkill = rows.reduce((max, row) => {
    const maxAgentEnemy = f6max(row.agentSkillTotal, row.enemySkillTotal)
    return f6max(max, maxAgentEnemy)
  }, toF6(0))

  // Compute battle-wide max HP from all rows
  const maxHp = rows.reduce((max, row) => Math.max(max, Math.max(row.agentHpTotal, row.enemyHpTotal)), 0)

  // Compute battle-wide max count from all rows
  const maxCount = rows.reduce((max, row) => Math.max(max, Math.max(row.agentCountTotal, row.enemyCountTotal)), 0)

  // Compute battle-wide max ratio from all rows (ratio can go up and down, so we need the max across all rounds)
  const maxRatio = rows.reduce((max, row) => f6max(max, row.skillRatio), toF6(0))

  const columns = getBattleLogColumns({ rows, maxInitialSkill, maxHp, maxCount, maxRatio })

  return (
    <ExpandableCard id="battle-log" title="Battle Log" defaultExpanded={true} sx={{ width: BATTLE_LOG_CARD_WIDTH }}>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        aria-label="Battle Log"
        hideFooter
        sx={{
          '& .battle-log-skill-cell': {
            padding: '4px',
          },
        }}
      />
    </ExpandableCard>
  )
}
