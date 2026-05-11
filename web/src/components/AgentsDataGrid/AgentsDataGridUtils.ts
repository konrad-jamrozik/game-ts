import type { GridColDef } from '@mui/x-data-grid'
import {
  isAwayAgentForLeadsPanel,
  isExhaustedAgentForLeadsPanel,
  isReadyAgentForLeadsPanel,
  isRecoveringAgentForLeadsPanel,
} from '../../lib/model_utils/agentReadinessUtils'
import type { AgentsFilterType } from '../../redux/slices/selectionSlice'
import type { AgentRow } from './getAgentsColumns'

export function filterAgentRows(
  allRows: AgentRow[],
  filterType: AgentsFilterType,
  agentsTerminatedThisTurnIds: Set<string>,
): AgentRow[] {
  if (filterType === 'ready') {
    return allRows.filter((agent) => isReadyAgentForLeadsPanel(agent))
  }

  if (filterType === 'exhausted') {
    return allRows.filter((agent) => isExhaustedAgentForLeadsPanel(agent))
  }

  if (filterType === 'away') {
    return allRows.filter((agent) => isAwayAgentForLeadsPanel(agent))
  }

  if (filterType === 'terminated') {
    return allRows.filter((agent) => agent.state === 'KIA' || agent.state === 'Sacked')
  }

  if (filterType === 'recovering') {
    return allRows.filter((agent) => isRecoveringAgentForLeadsPanel(agent))
  }

  // Default: show all non-terminated agents, plus agents terminated this turn
  return allRows.filter(
    (agent) => (agent.state !== 'KIA' && agent.state !== 'Sacked') || agentsTerminatedThisTurnIds.has(agent.id),
  )
}

export function filterVisibleAgentColumns(columns: GridColDef[], filterType: AgentsFilterType): GridColDef[] {
  if (filterType === 'terminated') {
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'skillSimple' ||
        col.field === 'hitPointsMax' ||
        col.field === 'service' ||
        col.field === 'missionsTotal' ||
        col.field === 'mission' ||
        col.field === 'by' ||
        col.field === 'terminated',
    )
  }

  if (filterType === 'recovering') {
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'state' ||
        col.field === 'recoveryTurns' ||
        col.field === 'exhaustionPct' ||
        col.field === 'hitPoints' ||
        col.field === 'skillSimple',
    )
  }

  if (filterType === 'stats') {
    // When "stats" is selected, show only: id, skillSimple, experience, training, hitPointsMax, service, kills, damageDealt, damageReceived, missionsTotal
    return columns.filter(
      (col) =>
        col.field === 'id' ||
        col.field === 'skillSimple' ||
        col.field === 'experience' ||
        col.field === 'training' ||
        col.field === 'hitPointsMax' ||
        col.field === 'missionsTotal' ||
        col.field === 'service' ||
        col.field === 'kills' ||
        col.field === 'damageDealt' ||
        col.field === 'damageReceived',
    )
  }
  return columns.filter(
    (col) =>
      col.field === 'id' ||
      col.field === 'state' ||
      col.field === 'assignment' ||
      col.field === 'skill' ||
      col.field === 'exhaustionPct',
  )
}
