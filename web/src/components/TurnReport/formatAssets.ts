import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import type { AgentsReport, IntelBreakdown, MoneyBreakdown, ValueChange } from '../../lib/model/turnReportModel'
import { fmtValueChange } from '../../lib/utils/formatUtils'
import type { TurnReportTreeViewModelProps } from './TurnReportTreeView'

/**
 * Format assets report (money, intel, and agents) as a tree structure for the MUI Tree View,
 * for the TurnReportTreeView component, to display it as part of the TurnReportDisplay component.
 */
export function formatAssets(assetsReport: {
  moneyChange: ValueChange
  intelChange: ValueChange
  agentsReport: AgentsReport
  moneyBreakdown: MoneyBreakdown
  intelBreakdown: IntelBreakdown
}): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  return [
    formatMoneyReport(assetsReport.moneyChange, assetsReport.moneyBreakdown),
    formatIntelReport(assetsReport.intelChange, assetsReport.intelBreakdown),
    formatAgentsReport(assetsReport.agentsReport),
  ]
}

function formatMoneyReport(
  moneyChange: ValueChange,
  moneyBreakdown: MoneyBreakdown,
): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: 'money-summary',
    label: `Money: ${fmtValueChange(moneyChange)}`,
    chipValue: moneyChange.delta,
    children: formatMoneyBreakdown(moneyBreakdown),
  }
}

function formatIntelReport(
  intelChange: ValueChange,
  intelBreakdown: IntelBreakdown,
): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: 'intel-summary',
    label: `Intel: ${fmtValueChange(intelChange)}`,
    chipValue: intelChange.delta,
    children: formatIntelBreakdown(intelBreakdown),
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
    { id: 'fundingIncome', label: 'Funding Income', chipValue: breakdown.fundingIncome },
    { id: 'contractingEarnings', label: 'Contracting Earnings', chipValue: breakdown.contractingEarnings },
    { id: 'missionRewards', label: 'Mission Rewards', chipValue: breakdown.missionRewards },
    { id: 'agentUpkeep', label: 'Agent Upkeep', chipValue: breakdown.agentUpkeep },
    { id: 'hireCosts', label: 'Hire Costs', chipValue: breakdown.hireCosts },
  ]
}

function formatIntelBreakdown(breakdown: IntelBreakdown): TurnReportTreeViewModelProps[] {
  return [
    { id: 'intel-espionageGathered', label: 'Espionage Gathered', chipValue: breakdown.espionageGathered },
    { id: 'intel-missionRewards', label: 'Mission Rewards', chipValue: breakdown.missionRewards },
  ]
}

function formatAgentsBreakdown(agentsReport: AgentsReport): TurnReportTreeViewModelProps[] {
  const { total, available, inTransit, recovering, wounded, unscathed, terminated } = agentsReport

  return [
    {
      id: 'agents-total',
      label: `Total: ${fmtValueChange(total)}`,
      chipValue: total.delta,
    },
    {
      id: 'agents-available',
      label: `Available: ${fmtValueChange(available)}`,
      chipValue: available.delta,
    },
    {
      id: 'agents-in-transit',
      label: `In transit: ${fmtValueChange(inTransit)}`,
      chipValue: inTransit.delta,
      noColor: true,
    },
    {
      id: 'agents-recovering',
      label: `Recovering: ${fmtValueChange(recovering)}`,
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
      label: 'Terminated',
      chipValue: terminated.delta,
      reverseColor: true,
      noPlusSign: true,
    },
  ]
}
