import * as React from 'react'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { BATTLE_LOG_CARD_WIDTH } from '../Common/widthConstants'
import type { MissionSiteId } from '../../lib/model/model'
import { useMissionReport } from './useMissionReport'
import { getBattleLogColumns, type BattleLogRow } from './getBattleLogColumns'

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

  const columns = getBattleLogColumns(rows)

  return (
    <ExpandableCard id="battle-log" title="Battle Log" defaultExpanded={true} sx={{ width: BATTLE_LOG_CARD_WIDTH }}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Battle Log" hideFooter />
    </ExpandableCard>
  )
}
