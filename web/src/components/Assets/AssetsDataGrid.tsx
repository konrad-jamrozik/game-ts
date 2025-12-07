import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMoneyNewBalance } from '../../lib/ruleset/moneyRuleset'
import { getIntelNewBalance } from '../../lib/ruleset/intelRuleset'
import { notTerminated } from '../../lib/model_utils/agentUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getAssetsColumns } from './getAssetsColumns'

export type AssetRow = {
  id: number
  name: 'Money' | 'Intel' | 'Agents' | 'Funding'
  displayedName?: string
  value: number
  projected?: number
  diff?: number
}

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const intelProjected = getIntelNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const intelDiff = intelProjected - gameState.intel
  const agentCount = notTerminated(gameState.agents).length

  const assetRows: AssetRow[] = [
    { name: 'Agents', id: 1, value: agentCount },
    { name: 'Funding', id: 4, value: gameState.funding },
    { name: 'Money', id: 2, value: gameState.money, projected: moneyProjected, diff: moneyDiff },
    { name: 'Intel', id: 3, value: gameState.intel, projected: intelProjected, diff: intelDiff },
  ]

  const assetColumns = getAssetsColumns()

  return <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
}
