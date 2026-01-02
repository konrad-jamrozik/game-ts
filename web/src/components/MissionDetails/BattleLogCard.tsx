import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { BATTLE_LOG_CARD_WIDTH } from '../Common/widthConstants'
import type { MissionId } from '../../lib/model/modelIds'
import { useMissionReport } from './useMissionReport'
import { getBattleLogColumns, type BattleLogRow } from './getBattleLogColumns'
import { f6c0, f6max } from '../../lib/primitives/fixed6'
import {
  AGENTS_COMBAT_RATING_RETREAT_THRESHOLD,
  RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD,
} from '../../lib/data_tables/constants'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { fmtPctDec0 } from '../../lib/primitives/formatPrimitives'
import { MyChip } from '../Common/MyChip'
import type { BattleOutcome } from '../../lib/model/outcomeTypes'

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

  // Compute battle-wide max combat rating ratio from all rows (ratio can go up and down, so we need the max across all rounds)
  const maxCombatRatingRatio = rows.reduce((max, row) => Math.max(max, row.combatRatingRatio), 0)

  const columns = getBattleLogColumns({ rows, maxInitialSkill, maxHp, maxCount, maxCombatRatingRatio })

  // Determine battle outcome and summary message
  const lastRoundLog = roundLogs.at(-1)
  let battleSummary: { outcome: BattleOutcome; message: string } | undefined = undefined
  if (lastRoundLog !== undefined && lastRoundLog.status !== 'Ongoing') {
    const outcome = lastRoundLog.status
    if (outcome === 'Retreated') {
      // Calculate agent combat rating percentage (current vs original)
      // We need to reconstruct this from the battle report or calculate it
      // For now, we'll use a simplified message based on the combat rating ratio
      const enemyToAgentCombatRatingRatio = lastRoundLog.combatRatingRatio
      const enemyToAgentCombatRatingRatioFmt = fmtPctDec0(enemyToAgentCombatRatingRatio)
      const enemyToAgentCombatRatingThresholdFmt = fmtPctDec0(RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD)
      const agentsCombatRatingThresholdFmt = fmtPctDec0(AGENTS_COMBAT_RATING_RETREAT_THRESHOLD)

      battleSummary = {
        outcome: 'Retreated',
        message: `The mission commander ordered a retreat because the agents' combat rating had dropped below ${agentsCombatRatingThresholdFmt} of their original combat rating, while the enemy force remained at ${enemyToAgentCombatRatingRatioFmt} of the agents' current combat rating (at or above the ${enemyToAgentCombatRatingThresholdFmt} threshold).`,
      }
    } else if (outcome === 'Won') {
      battleSummary = {
        outcome: 'Won',
        message: 'The mission was completed successfully. All enemy units were eliminated.',
      }
    } else if (outcome === 'Wiped') {
      battleSummary = {
        outcome: 'Wiped',
        message: 'All agents were terminated in battle.',
      }
    }
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
      {battleSummary !== undefined && (
        <Box sx={{ mt: 2, mb: 1, px: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MyChip chipValue={battleSummary.outcome} />
          <Typography variant="body2" color="text.secondary">
            {battleSummary.message}
          </Typography>
        </Box>
      )}
    </ExpandableCard>
  )
}
