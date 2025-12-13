import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMoneyNewBalance } from '../../lib/ruleset/moneyRuleset'
import { notTerminated } from '../../lib/model_utils/agentUtils'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getAssetsColumns } from './getAssetsColumns'

export type AssetRow = {
  id: number
  name: 'Money' | 'Agents' | 'Funding'
  displayedName?: string
  value: number
  projected?: number
  diff?: number
}

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector((state) => state.undoable.present.gameState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const agentCount = notTerminated(gameState.agents).length

  const assetRows: AssetRow[] = [
    { name: 'Agents', id: 1, value: agentCount },
    { name: 'Funding', id: 4, value: gameState.funding },
    { name: 'Money', id: 2, value: gameState.money, projected: moneyProjected, diff: moneyDiff },
  ]

  const assetColumns = getAssetsColumns()

  return <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
}
