import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMoneyNewBalance } from '../../lib/ruleset/moneyRuleset'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getAssetsColumns, type AssetRow } from './getAssetsColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const projectedBalanceDiff = getMoneyNewBalance(gameState) - gameState.money
  const agentCount = gameState.agents.length

  const assetRows: AssetRow[] = [
    { name: 'Agents', id: 1, value: agentCount },
    { name: 'Money', id: 2, value: gameState.money },
    { name: 'Projected', id: 3, diff: projectedBalanceDiff },
  ]

  const assetColumns = getAssetsColumns()

  return <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
}
