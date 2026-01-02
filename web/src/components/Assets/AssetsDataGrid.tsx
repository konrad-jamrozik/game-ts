import * as React from 'react'
import { useAppSelector } from '../../redux/hooks'
import { getMoneyNewBalance } from '../../lib/ruleset/moneyRuleset'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getAssetsColumns, type AssetRow } from './getAssetsColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const moneyProjected = getMoneyNewBalance(gameState)
  const moneyDiff = moneyProjected - gameState.money
  const agentCount = gameState.agents.length

  const assetRows: AssetRow[] = [
    { name: 'Agents', id: 1, value: agentCount },
    { name: 'Funding', id: 4, value: gameState.funding },
    { name: 'Money', id: 2, value: gameState.money, projected: moneyProjected, diff: moneyDiff },
  ]

  const assetColumns = getAssetsColumns()

  return <StyledDataGrid rows={assetRows} columns={assetColumns} aria-label="Assets" />
}
