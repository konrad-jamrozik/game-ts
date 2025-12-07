import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import {
  BATTLE_LOG_AGENT_COUNT_WIDTH,
  BATTLE_LOG_AGENT_HP_WIDTH,
  BATTLE_LOG_AGENT_SKILL_WIDTH,
  BATTLE_LOG_ENEMY_COUNT_WIDTH,
  BATTLE_LOG_ENEMY_HP_WIDTH,
  BATTLE_LOG_ENEMY_SKILL_WIDTH,
  BATTLE_LOG_ROUND_NUMBER_WIDTH,
  BATTLE_LOG_SKILL_RATIO_WIDTH,
  BATTLE_LOG_STATUS_WIDTH,
} from '../Common/columnWidths'
import type { MissionSiteId } from '../../lib/model/model'
import { getBattleLogColumns, type BattleLogRow } from './getBattleLogColumns'

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

  const columns = getBattleLogColumns()

  const CARD_WIDTH =
    2 +
    16 +
    19 +
    BATTLE_LOG_ROUND_NUMBER_WIDTH +
    BATTLE_LOG_STATUS_WIDTH +
    BATTLE_LOG_AGENT_COUNT_WIDTH +
    BATTLE_LOG_AGENT_SKILL_WIDTH +
    BATTLE_LOG_AGENT_HP_WIDTH +
    BATTLE_LOG_ENEMY_COUNT_WIDTH +
    BATTLE_LOG_ENEMY_SKILL_WIDTH +
    BATTLE_LOG_ENEMY_HP_WIDTH +
    BATTLE_LOG_SKILL_RATIO_WIDTH // borders + padding + filler + columns

  return (
    <ExpandableCard id="battle-log" title="Battle Log" defaultExpanded={true} sx={{ width: CARD_WIDTH }}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Battle Log" hideFooter />
    </ExpandableCard>
  )
}
