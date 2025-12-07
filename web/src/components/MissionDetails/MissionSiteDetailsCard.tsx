import type { GridColDef } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMissionById } from '../../lib/collections/missions'
import { getFactionById } from '../../lib/collections/factions'
import { fmtNoPrefix, fmtDec1 } from '../../lib/primitives/formatPrimitives'
import { f6sum, toF, f6fmtPctDec2 } from '../../lib/primitives/fixed6'
import { div } from '../../lib/primitives/mathPrimitives'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import type { MissionSiteId } from '../../lib/model/model'
import { assertDefined } from '../../lib/primitives/assertPrimitives'

type MissionSiteDetailsRow = {
  id: number
  item: string
  value: string
}

type MissionSiteDetailsCardProps = {
  missionSiteId: MissionSiteId
}

export function MissionSiteDetailsCard({ missionSiteId }: MissionSiteDetailsCardProps): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { missionSites } = gameState

  const missionSite = missionSites.find((site) => site.id === missionSiteId)
  assertDefined(missionSite, `Mission site with id ${missionSiteId} not found`)

  const mission = getMissionById(missionSite.missionId)

  const displayId = fmtNoPrefix(missionSite.id, 'mission-site-')
  const missionName = mission.title
  const { state } = missionSite
  const expiresIn =
    state === 'Active' ? (missionSite.expiresIn === 'never' ? 'Never' : String(missionSite.expiresIn)) : '-'
  const agentsDeployed = missionSite.agentIds.length

  const enemyFactionId = mission.rewards.factionRewards?.[0]?.factionId
  const enemyFaction = enemyFactionId ? getFactionById(enemyFactionId).name : '-'
  const enemyCount = missionSite.enemies.length

  const enemyAverageSkill =
    missionSite.enemies.length > 0
      ? (() => {
          const totalSkill = toF(f6sum(...missionSite.enemies.map((enemy) => enemy.skill)))
          return fmtDec1(div(totalSkill, missionSite.enemies.length))
        })()
      : '-'

  const rewardMoney = mission.rewards.money ?? 0
  const rewardSuppression = mission.rewards.factionRewards?.[0]?.suppression
  const rewardSuppressionStr = rewardSuppression ? f6fmtPctDec2(rewardSuppression) : '-'

  const rows: MissionSiteDetailsRow[] = [
    { id: 1, item: 'ID', value: displayId },
    { id: 2, item: 'Name', value: missionName },
    { id: 3, item: 'Faction', value: enemyFaction },
    { id: 4, item: 'State', value: state },
    { id: 5, item: 'Expires in', value: expiresIn },
    { id: 6, item: 'Agents deployed', value: String(agentsDeployed) },
    { id: 7, item: 'Enemy count', value: String(enemyCount) },
    { id: 8, item: 'Enemy avg. skill', value: enemyAverageSkill },
    { id: 9, item: 'Reward money', value: String(rewardMoney) },
    { id: 10, item: 'Reward suppr.', value: rewardSuppressionStr },
  ]

  const columns: GridColDef<MissionSiteDetailsRow>[] = [
    { field: 'item', headerName: 'Item', width: 140 },
    { field: 'value', headerName: 'Value', width: 240 },
  ]

  return (
    <ExpandableCard id="mission-site-details" title="Mission Site Details" defaultExpanded={true}>
      <StyledDataGrid rows={rows} columns={columns} aria-label="Mission Site Details" hideFooter />
    </ExpandableCard>
  )
}
