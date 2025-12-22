import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMissionDataById, getFactionName } from '../../lib/data_tables/dataTables'
import { fmtNoPrefix, fmtDec1 } from '../../lib/primitives/formatPrimitives'
import { f6sum, toF, f6fmtPctDec2, toF6 } from '../../lib/primitives/fixed6'
import { div } from '../../lib/primitives/mathPrimitives'
import type { OffensiveMissionData } from '../../lib/data_tables/offensiveMissionsDataTable'
import type { DefensiveMissionData } from '../../lib/data_tables/defensiveMissionsDataTable'
import {
  getMoneyRewardForOperation,
  getFundingRewardForOperation,
} from '../../lib/ruleset/factionOperationLevelRuleset'

function parseSuppression(suppression: string): number {
  if (suppression === 'N/A') {
    return 0
  }
  const match = /^(?<value>\d+)/u.exec(suppression)
  const value = match?.groups?.['value']
  if (value !== undefined && value !== '') {
    return Number.parseInt(value, 10)
  }
  return 0
}

function bldRewardsFromMissionData(
  missionData: OffensiveMissionData | DefensiveMissionData,
  operationLevel?: number,
): MissionRewards {
  // Defensive missions: rewards calculated from operation level
  if (operationLevel !== undefined) {
    return {
      money: getMoneyRewardForOperation(operationLevel),
      funding: getFundingRewardForOperation(operationLevel),
      panicReduction: toF6(0),
      factionRewards: [],
    }
  }

  // Offensive missions: rewards from mission data
  // Type guard: defensive missions don't have these fields
  if (!('moneyReward' in missionData)) {
    throw new Error('Expected offensive mission data but got defensive mission data')
  }
  const offensiveData = missionData
  const suppressionValue = parseSuppression(offensiveData.suppression)

  return {
    money: offensiveData.moneyReward,
    funding: offensiveData.fundingReward,
    panicReduction: toF6(offensiveData.panicReductionPct / 100),
    factionRewards:
      suppressionValue > 0
        ? [
            {
              factionId: offensiveData.factionId,
              suppression: suppressionValue,
            },
          ]
        : [],
  }
}
import { ExpandableCard } from '../Common/ExpandableCard'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { MyChip } from '../Common/MyChip'
import { columnWidths } from '../Common/columnWidths'
import { MISSION_DETAILS_CARD_WIDTH } from '../Common/widthConstants'
import type { MissionId, MissionRewards } from '../../lib/model/missionModel'
import type { MissionState } from '../../lib/model/outcomeTypes'
import { assertDefined } from '../../lib/primitives/assertPrimitives'
import { Stack } from '@mui/material'
import { isConcludedMissionState } from '../../lib/ruleset/missionRuleset'

type MissionDetailsRow = {
  id: number
  key: string
  value: string
  state?: MissionState
}

type MissionDetailsCardProps = {
  missionId: MissionId
}

export function MissionDetailsCard({ missionId }: MissionDetailsCardProps): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const { missions } = gameState

  const mission = missions.find((m) => m.id === missionId)
  assertDefined(mission, `Mission with id ${missionId} not found`)

  const missionData = getMissionDataById(mission.missionDataId)

  const displayId = fmtNoPrefix(mission.id, 'mission-')
  const { state, expiresIn: expiresInValue, agentIds, enemies } = mission
  const expiresIn = state === 'Active' ? (expiresInValue === 'never' ? 'Never' : String(expiresInValue)) : '-'
  const agentsDeployed = agentIds.length
  const agentsDeployedStr = agentsDeployed !== 0 ? String(agentsDeployed) : '-'

  const { factionId } = missionData
  const { factions } = gameState
  const faction = factions.find((f) => f.id === factionId)
  // KJA2 Unknown here should fail assertion
  const enemyFaction = faction ? getFactionName(faction) : 'Unknown'
  const enemyCount = enemies.length

  const enemyAverageSkill =
    enemies.length > 0
      ? (() => {
          const totalSkill = toF(f6sum(...enemies.map((enemy) => enemy.skill)))
          return fmtDec1(div(totalSkill, enemies.length))
        })()
      : '-'

  const { operationLevel } = mission
  const rewards = bldRewardsFromMissionData(missionData, operationLevel)
  const rewardMoney = rewards.money ?? 0
  const rewardFunding = rewards.funding
  const rewardPanicReduction = rewards.panicReduction
  const rewardPanicReductionStr = rewardPanicReduction ? f6fmtPctDec2(rewardPanicReduction) : '-'

  const factionReward = rewards.factionRewards?.[0]
  const rewardSuppression = factionReward?.suppression
  const rewardSuppressionStr = rewardSuppression !== undefined ? `${rewardSuppression} turns` : '-'

  const detailsRows: MissionDetailsRow[] = [
    { id: 1, key: 'ID', value: displayId },
    { id: 2, key: 'Name', value: missionData.name },
    { id: 3, key: 'Faction', value: enemyFaction },
    { id: 4, key: 'State', value: state, state },
    { id: 5, key: 'Expires in', value: expiresIn },
    { id: 6, key: 'Agents deployed', value: agentsDeployedStr },
    { id: 7, key: 'Enemy count', value: String(enemyCount) },
    { id: 8, key: 'Enemy avg. skill', value: enemyAverageSkill },
  ]

  const rewardRows: MissionDetailsRow[] = [
    { id: 1, key: 'Money', value: rewardMoney !== 0 ? String(rewardMoney) : '-' },
    { id: 2, key: 'Funding', value: rewardFunding !== undefined ? String(rewardFunding) : '-' },
    { id: 3, key: 'Panic reduction', value: rewardPanicReductionStr },
    { id: 4, key: 'Suppression', value: rewardSuppressionStr },
  ]

  const detailsColumns: GridColDef<MissionDetailsRow>[] = [
    { field: 'key', headerName: 'Property', width: columnWidths['mission_details.key'] },
    {
      field: 'value',
      headerName: 'Value',
      width: columnWidths['mission_details.value'],
      renderCell: (params: GridRenderCellParams<MissionDetailsRow>): React.JSX.Element => {
        if (params.row.key === 'State' && params.row.state !== undefined) {
          const { state: stateValue } = params.row
          if (isConcludedMissionState(stateValue)) {
            return <MyChip chipValue={stateValue} />
          }
        }
        return <span>{params.value}</span>
      },
    },
  ]

  const rewardColumns: GridColDef<MissionDetailsRow>[] = [
    { field: 'key', headerName: 'Reward', width: columnWidths['mission_details.key'] },
    { field: 'value', headerName: 'Value', width: columnWidths['mission_details.value'] },
  ]

  return (
    <ExpandableCard
      id="mission-details"
      title="Mission Details"
      defaultExpanded={true}
      sx={{ width: MISSION_DETAILS_CARD_WIDTH }}
    >
      <Stack spacing={2}>
        <StyledDataGrid rows={detailsRows} columns={detailsColumns} aria-label="Mission Details" hideFooter />
        <StyledDataGrid rows={rewardRows} columns={rewardColumns} aria-label="Mission Rewards" hideFooter />
      </Stack>
    </ExpandableCard>
  )
}
