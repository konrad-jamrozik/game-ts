import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMissionById } from '../../lib/collections/missions'
import { getFactionById } from '../../lib/collections/factions'
import { fmtNoPrefix, fmtDec1 } from '../../lib/primitives/formatPrimitives'
import { f6sum, toF, f6fmtPctDec2 } from '../../lib/primitives/fixed6'
import { div } from '../../lib/primitives/mathPrimitives'
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { MyChip } from '../Common/MyChip'
import type { MissionSiteId } from '../../lib/model/model'
import { assertDefined } from '../../lib/primitives/assertPrimitives'
import { Stack } from '@mui/material'

const KEY_WIDTH = 140
const VALUE_WIDTH = 240

type MissionSiteDetailsRow = {
  id: number
  key: string
  value: string
  state?: string
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
  const { state, expiresIn: expiresInValue, agentIds, enemies } = missionSite
  const expiresIn = state === 'Active' ? (expiresInValue === 'never' ? 'Never' : String(expiresInValue)) : '-'
  const agentsDeployed = agentIds.length
  const agentsDeployedStr = agentsDeployed !== 0 ? String(agentsDeployed) : '-'

  const { rewards } = mission
  const enemyFactionId = rewards.factionRewards?.[0]?.factionId
  const enemyFaction = enemyFactionId ? getFactionById(enemyFactionId).name : '-'
  const enemyCount = enemies.length

  const enemyAverageSkill =
    enemies.length > 0
      ? (() => {
          const totalSkill = toF(f6sum(...enemies.map((enemy) => enemy.skill)))
          return fmtDec1(div(totalSkill, enemies.length))
        })()
      : '-'

  const rewardMoney = rewards.money ?? 0
  const rewardIntel = rewards.intel
  const rewardFunding = rewards.funding
  const rewardPanicReduction = rewards.panicReduction
  const rewardPanicReductionStr = rewardPanicReduction ? f6fmtPctDec2(rewardPanicReduction) : '-'

  const factionReward = rewards.factionRewards?.[0]
  const rewardThreatReduction = factionReward?.threatReduction
  const rewardThreatReductionStr = rewardThreatReduction ? f6fmtPctDec2(rewardThreatReduction) : '-'
  const rewardSuppression = factionReward?.suppression
  const rewardSuppressionStr = rewardSuppression ? f6fmtPctDec2(rewardSuppression) : '-'

  const detailsRows: MissionSiteDetailsRow[] = [
    { id: 1, key: 'ID', value: displayId },
    { id: 2, key: 'Name', value: missionName },
    { id: 3, key: 'Faction', value: enemyFaction },
    { id: 4, key: 'State', value: state, state },
    { id: 5, key: 'Expires in', value: expiresIn },
    { id: 6, key: 'Agents deployed', value: agentsDeployedStr },
    { id: 7, key: 'Enemy count', value: String(enemyCount) },
    { id: 8, key: 'Enemy avg. skill', value: enemyAverageSkill },
  ]

  const rewardRows: MissionSiteDetailsRow[] = [
    { id: 1, key: 'Money', value: rewardMoney !== 0 ? String(rewardMoney) : '-' },
    { id: 2, key: 'Intel', value: rewardIntel !== undefined ? String(rewardIntel) : '-' },
    { id: 3, key: 'Funding', value: rewardFunding !== undefined ? String(rewardFunding) : '-' },
    { id: 4, key: 'Panic reduction', value: rewardPanicReductionStr },
    { id: 5, key: 'Threat reduction', value: rewardThreatReductionStr },
    { id: 6, key: 'Suppression', value: rewardSuppressionStr },
  ]

  const detailsColumns: GridColDef<MissionSiteDetailsRow>[] = [
    { field: 'key', headerName: 'Property', width: KEY_WIDTH },
    {
      field: 'value',
      headerName: 'Value',
      width: VALUE_WIDTH,
      renderCell: (params: GridRenderCellParams<MissionSiteDetailsRow>): React.JSX.Element => {
        if (params.row.key === 'State' && params.row.state !== undefined) {
          const stateValue = params.row.state
          if (stateValue === 'Successful' || stateValue === 'Failed' || stateValue === 'Expired') {
            return <MyChip chipValue={stateValue} />
          }
        }
        return <span>{params.value}</span>
      },
    },
  ]

  const rewardColumns: GridColDef<MissionSiteDetailsRow>[] = [
    { field: 'key', headerName: 'Reward', width: KEY_WIDTH },
    { field: 'value', headerName: 'Value', width: VALUE_WIDTH },
  ]

  const CARD_WIDTH = 2 + 16 + 19 + KEY_WIDTH + VALUE_WIDTH // borders + padding + filler + columns

  return (
    <ExpandableCard
      id="mission-site-details"
      title="Mission Site Details"
      defaultExpanded={true}
      sx={{ width: CARD_WIDTH }}
    >
      <Stack spacing={2}>
        <StyledDataGrid rows={detailsRows} columns={detailsColumns} aria-label="Mission Site Details" hideFooter />
        <StyledDataGrid rows={rewardRows} columns={rewardColumns} aria-label="Mission Rewards" hideFooter />
      </Stack>
    </ExpandableCard>
  )
}
