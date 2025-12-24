import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import type { AgentsReport, MoneyBreakdown, ValueChange } from '../../lib/model/turnReportModel'
import { f6fmtValueChange } from '../../lib/data_table_utils/formatModelUtils'
import type { TurnReportTreeViewModelProps } from './TurnReportTreeView'

/**
 * Format assets report (money, intel, and agents) as a tree structure for the MUI Tree View,
 * for the TurnReportTreeView component, to display it as part of the TurnReportCard component.
 */
export function formatAssets(assetsReport: {
  moneyChange: ValueChange
  agentsReport: AgentsReport
  moneyBreakdown: MoneyBreakdown
}): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  return [
    formatMoneyReport(assetsReport.moneyChange, assetsReport.moneyBreakdown),
    formatAgentsReport(assetsReport.agentsReport),
  ]
}

function formatMoneyReport(
  moneyChange: ValueChange,
  moneyBreakdown: MoneyBreakdown,
): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: 'money-summary',
    label: `Money: ${f6fmtValueChange(moneyChange)}`,
    chipValue: moneyChange.delta,
    children: formatMoneyBreakdown(moneyBreakdown),
  }
}

function formatAgentsReport(agentsReport: AgentsReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: 'agents-summary',
    label: 'Agents',
    children: formatAgentsBreakdown(agentsReport),
  }
}

function formatMoneyBreakdown(breakdown: MoneyBreakdown): TurnReportTreeViewModelProps[] {
  return [
    { id: 'fundingIncome', label: 'Funding income', chipValue: breakdown.fundingIncome },
    { id: 'contractingEarnings', label: 'Contracting earnings', chipValue: breakdown.contractingEarnings },
    { id: 'missionRewards', label: 'Mission rewards', chipValue: breakdown.missionRewards },
    { id: 'agentUpkeep', label: 'Agent upkeep', chipValue: breakdown.agentUpkeep },
  ]
}

function formatAgentsBreakdown(agentsReport: AgentsReport): TurnReportTreeViewModelProps[] {
  const { total, available, inTransit, recovering, wounded, unscathed, terminated } = agentsReport

  return [
    {
      id: 'agents-total',
      label: `Total: ${f6fmtValueChange(total)}`,
      chipValue: total.delta,
    },
    {
      id: 'agents-available',
      label: `Available: ${f6fmtValueChange(available)}`,
      chipValue: available.delta,
    },
    {
      id: 'agents-in-transit',
      label: `In transit: ${f6fmtValueChange(inTransit)}`,
      chipValue: inTransit.delta,
      noColor: true,
    },
    {
      id: 'agents-recovering',
      label: `Recovering: ${f6fmtValueChange(recovering)}`,
      chipValue: recovering.delta,
      reverseColor: true,
    },
    {
      id: 'agents-unscathed',
      label: 'Unscathed',
      chipValue: unscathed.delta,
      noPlusSign: true,
    },
    {
      id: 'agents-wounded',
      label: 'Wounded',
      chipValue: wounded.delta,
      useWarningColor: true,
      noPlusSign: true,
    },
    {
      id: 'agents-terminated',
      label: 'KIA',
      chipValue: terminated.delta,
      reverseColor: true,
      noPlusSign: true,
    },
  ]
}
