import Stack from '@mui/material/Stack'
import * as React from 'react'
import {
  isExhaustedAgentForLeadsPanel,
  isReadyAgentForLeadsPanel,
  isRecoveringAgentForLeadsPanel,
} from '../../lib/model_utils/agentReadinessUtils'
import { useAppSelector } from '../../redux/hooks'
import { getMoneyNewBalance } from '../../lib/ruleset/moneyRuleset'
import { StyledDataGrid } from '../Common/StyledDataGrid'
import { getAssetsColumns, type AssetRow } from './getAssetsColumns'
import { getCurrentTurnState } from '../../redux/storeUtils'

export function AssetsDataGrid(): React.JSX.Element {
  const gameState = useAppSelector(getCurrentTurnState)
  const projectedBalanceDiff = getMoneyNewBalance(gameState) - gameState.money

  const readyAgents = gameState.agents.filter(isReadyAgentForLeadsPanel).length
  const exhaustedAgents = gameState.agents.filter(isExhaustedAgentForLeadsPanel).length
  const recoveringAgents = gameState.agents.filter(isRecoveringAgentForLeadsPanel).length
  const activeAgents = gameState.agents.filter((agent) => agent.state !== 'KIA' && agent.state !== 'Sacked').length
  const awayAgents = activeAgents - readyAgents - exhaustedAgents - recoveringAgents

  const agentsRows: AssetRow[] = [
    { name: 'Ready', id: 2, value: readyAgents },
    { name: 'Exhausted', id: 3, value: exhaustedAgents },
    { name: 'Away', id: 4, value: awayAgents },
    { name: 'Recovering', id: 5, value: recoveringAgents },
    { name: 'Total', id: 1, value: activeAgents },
  ]
  const financesRows: AssetRow[] = [
    { name: 'Money', id: 1, value: gameState.money },
    { name: 'Projected', id: 2, diff: projectedBalanceDiff },
  ]

  const agentsColumns = getAssetsColumns({ nameHeaderName: 'Agents', valueHeaderName: 'Count' })
  const financesColumns = getAssetsColumns({ nameHeaderName: 'Finances', valueHeaderName: 'Value' })

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <StyledDataGrid rows={agentsRows} columns={agentsColumns} aria-label="Agents" />
      <StyledDataGrid rows={financesRows} columns={financesColumns} aria-label="Finances" />
    </Stack>
  )
}
