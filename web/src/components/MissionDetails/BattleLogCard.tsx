import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { BATTLE_LOG_CARD_WIDTH } from '../Common/widthConstants'
import type { MissionId } from '../../lib/model/modelIds'
import { useMissionReport } from './useMissionReport'
import { getBattleLogColumns, type BattleLogRow } from './getBattleLogColumns'
import { f6c0, f6max, f6div } from '../../lib/primitives/fixed6'
import {
  AGENTS_SKILL_RETREAT_THRESHOLD,
  RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD,
} from '../../lib/data_tables/constants'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { fmtPctDec0 } from '../../lib/primitives/formatPrimitives'

type BattleLogCardProps = {
  missionId: MissionId
}

export function BattleLogCard({ missionId }: BattleLogCardProps): React.JSX.Element {
  const missionReport = useMissionReport(missionId)
  const roundLogs = missionReport?.battleStats.roundLogs ?? []

  const rows: BattleLogRow[] = roundLogs.map((log, index) => ({
    id: index,
    ...log,
  }))

  // Compute battle-wide max initial skill from all rows
  const maxInitialSkill = rows.reduce((max, row) => {
    const maxAgentEnemy = f6max(row.agentSkillTotal, row.enemySkillTotal)
    return f6max(max, maxAgentEnemy)
  }, f6c0)

  // Compute battle-wide max HP from all rows
  const maxHp = rows.reduce((max, row) => Math.max(max, Math.max(row.agentHpTotal, row.enemyHpTotal)), 0)

  // Compute battle-wide max count from all rows
  const maxCount = rows.reduce((max, row) => Math.max(max, Math.max(row.agentCountTotal, row.enemyCountTotal)), 0)

  // Compute battle-wide max ratio from all rows (ratio can go up and down, so we need the max across all rounds)
  const maxRatio = rows.reduce((max, row) => f6max(max, row.skillRatio), f6c0)

  const columns = getBattleLogColumns({ rows, maxInitialSkill, maxHp, maxCount, maxRatio })

  // Check if battle ended in retreat and calculate explanation
  const lastRoundLog = roundLogs.at(-1)
  let retreatExplanation: string | undefined = undefined
  if (lastRoundLog?.status === 'Retreated') {
    const agentSkillCurrent = lastRoundLog.agentSkill
    const agentSkillOriginal = lastRoundLog.agentSkillTotal
    const enemySkillCurrent = lastRoundLog.enemySkill

    // Calculate agent skill percentage (current vs original)
    const agentSkillPct = f6div(agentSkillCurrent, agentSkillOriginal)
    const agentSkillPctFmt = fmtPctDec0(agentSkillPct)
    const agentSkillThresholdFmt = fmtPctDec0(AGENTS_SKILL_RETREAT_THRESHOLD)

    // Calculate enemy to agent skill ratio
    const enemyToAgentRatio = f6div(enemySkillCurrent, agentSkillCurrent)
    const enemyToAgentRatioFmt = fmtPctDec0(enemyToAgentRatio)
    const enemyToAgentThresholdFmt = fmtPctDec0(RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD)

    retreatExplanation = `The mission commander ordered a retreat because the agents' combat effectiveness had dropped to ${agentSkillPctFmt} of their original strength (below the ${agentSkillThresholdFmt} threshold), while the enemy force remained at ${enemyToAgentRatioFmt} of the agents' current strength (at or above the ${enemyToAgentThresholdFmt} threshold).`
  }

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
      {retreatExplanation !== undefined && (
        <Box sx={{ mt: 2, mb: 1, px: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {retreatExplanation}
          </Typography>
        </Box>
      )}
    </ExpandableCard>
  )
}
