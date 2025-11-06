import { Box } from '@mui/material'
import * as React from 'react'
import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import { useAppSelector } from '../../app/hooks'
import type {
  IntelBreakdown,
  MoneyBreakdown,
  PanicBreakdown,
  FactionDetails,
  ValueChange,
} from '../../lib/model/reportModel'
import { ExpandableCard } from '../ExpandableCard'
import { ValueChangeCard, type BreakdownRow } from './ValueChangeCard'
import ExampleTreeView from './ExampleTreeView'
import { TurnReportTreeView, type ValueChangeTreeItemModelProps } from './TurnReportTreeView'

/**
 * CSS Grid component for displaying turn advancement reports
 */
export function TurnReportDisplay(): React.ReactElement {
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(() => new Set())
  const report = useAppSelector((state) => state.undoable.present.gameState.turnStartReport)

  console.log('TurnReportDisplay!')

  function handleCardChange(cardId: string) {
    return (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      setExpandedCards((prevExpanded) => {
        const newExpanded = new Set(prevExpanded)
        if (isExpanded) {
          newExpanded.add(cardId)
        } else {
          newExpanded.delete(cardId)
        }
        return newExpanded
      })
    }
  }

  // Find Red Dawn faction for display
  const redDawnFaction = report?.factions.find((faction) => faction.factionId === 'faction-red-dawn')

  // Format money and intel breakdowns for tree view
  const assetsTreeData = report
    ? [
        ...formatMoneyBreakdownAsTree(report.assets.moneyChange, report.assets.moneyBreakdown),
        ...formatIntelBreakdownAsTree(report.assets.intelChange, report.assets.intelBreakdown),
      ]
    : []

  return (
    <ExpandableCard title="Turn Report" defaultExpanded={true}>
      {report && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: 2, // `gap` adds spacing between grid items (2 is equivalent to 16px)
            // Thanks to `alignItems: 'start'` each row will only take the space its content needs,
            // preventing other rows from expanding when a card in one row is expanded.
            alignItems: 'start',
          }}
        >
          <ExpandableCard title="Assets" defaultExpanded={true}>
            <TurnReportTreeView items={assetsTreeData} defaultExpandedItems={['money-summary', 'intel-summary']} />
          </ExpandableCard>

          {/* KJA have 4 cards: Summary, Assets, Balance Sheet, Situation Report. Each of them will have appropriate tree view. */}
          <ValueChangeCard
            id="money"
            title="Money"
            valueChange={report.assets.moneyChange}
            breakdownRows={formatMoneyBreakdown(report.assets.moneyBreakdown)}
            expanded={expandedCards.has('money')}
            onChange={handleCardChange('money')}
          />

          <ExpandableCard title="Example Tree View" defaultExpanded={true}>
            <ExampleTreeView />
          </ExpandableCard>

          <ValueChangeCard
            id="intel"
            title="Intel"
            valueChange={report.assets.intelChange}
            breakdownRows={formatIntelBreakdown(report.assets.intelBreakdown)}
            expanded={expandedCards.has('intel')}
            onChange={handleCardChange('intel')}
          />

          <ValueChangeCard
            id="panic"
            title="Panic"
            valueChange={report.panic.change}
            breakdownRows={formatPanicBreakdown(report.panic.breakdown)}
            expanded={expandedCards.has('panic')}
            onChange={handleCardChange('panic')}
            reverseMainColors={true}
            showPercentage={true}
            percentageOnly={true}
          />

          <ExpandableCard title="Faction threat levels" defaultExpanded={true}>
            {redDawnFaction && (
              <ValueChangeCard
                id="red-dawn-threat"
                title="Red Dawn"
                valueChange={redDawnFaction.threatLevel}
                breakdownRows={formatFactionDetails(redDawnFaction.details)}
                expanded={expandedCards.has('red-dawn-threat')}
                onChange={handleCardChange('red-dawn-threat')}
                reverseMainColors={true}
                showPercentage={true}
                percentageOnly={true}
              />
            )}
          </ExpandableCard>
        </Box>
      )}
    </ExpandableCard>
  )
}

/**
 * Shorten mission titles for display in breakdown tables
 */
function shortenMissionTitle(title: string): string {
  // Remove common prefixes and make titles more concise
  return title
    .replaceAll(/^mission:\s*/giu, '')
    .replaceAll(/^raid\s+/giu, '')
    .replaceAll(/^apprehend\s+/giu, 'Capture ')
    .replaceAll(/red dawn\s+/giu, 'RD ')
    .replaceAll(/\s+safehouse$/giu, ' Safe')
    .replaceAll(/\s+outpost$/giu, ' Out')
    .replaceAll(/\s+base$/giu, ' Base')
    .replaceAll(/\s+hq$/giu, ' HQ')
}

/**
 * Format money breakdown as tree structure for MUI Tree View with chips
 */
function formatMoneyBreakdownAsTree(
  moneyChange: ValueChange,
  moneyBreakdown: MoneyBreakdown,
): TreeViewBaseItem<ValueChangeTreeItemModelProps>[] {
  const treeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = formatMoneyBreakdown(moneyBreakdown).map(
    (row) => {
      const item: ValueChangeTreeItemModelProps = {
        id: row.id,
        label: row.label,
        value: row.value,
        reverseColor: row.reverseColor ?? false,
      }
      return item
    },
  )

  return [
    {
      id: 'money-summary',
      label: `Money: ${moneyChange.previous} → ${moneyChange.current}`,
      value: moneyChange.delta,
      children: treeItems,
    },
  ]
}

/**
 * Format intel breakdown as tree structure for MUI Tree View with chips
 */
function formatIntelBreakdownAsTree(
  intelChange: ValueChange,
  intelBreakdown: IntelBreakdown,
): TreeViewBaseItem<ValueChangeTreeItemModelProps>[] {
  const treeItems: TreeViewBaseItem<ValueChangeTreeItemModelProps>[] = formatIntelBreakdown(intelBreakdown).map(
    (row) => {
      const item: ValueChangeTreeItemModelProps = {
        id: `intel-${row.id}`,
        label: row.label,
        value: row.value,
        reverseColor: row.reverseColor ?? false,
      }
      return item
    },
  )

  return [
    {
      id: 'intel-summary',
      label: `Intel: ${intelChange.previous} → ${intelChange.current}`,
      value: intelChange.delta,
      children: treeItems,
    },
  ]
}

/**
 * Format money breakdown details
 */
function formatMoneyBreakdown(breakdown: MoneyBreakdown): BreakdownRow[] {
  return [
    { id: 'fundingIncome', label: 'Funding Income', value: breakdown.fundingIncome },
    { id: 'contractingEarnings', label: 'Contracting Earnings', value: breakdown.contractingEarnings },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
    { id: 'agentUpkeep', label: 'Agent Upkeep', value: breakdown.agentUpkeep },
    { id: 'hireCosts', label: 'Hire Costs', value: breakdown.hireCosts },
  ]
}

/**
 * Format intel breakdown details
 */
function formatIntelBreakdown(breakdown: IntelBreakdown): BreakdownRow[] {
  return [
    { id: 'espionageGathered', label: 'Espionage Gathered', value: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ]
}

/**
 * Format panic breakdown details
 */
function formatPanicBreakdown(breakdown: PanicBreakdown): BreakdownRow[] {
  const rows: BreakdownRow[] = []

  // Add faction contributions
  breakdown.factionContributions.forEach((faction) => {
    if (faction.contribution !== 0) {
      rows.push({
        id: `faction-${faction.factionId}`,
        label: `${faction.factionName} Contribution`,
        value: faction.contribution,
        reverseColor: true, // Panic increase is bad
      })
    }
  })

  // Add mission reductions (shown as negative values)
  breakdown.missionReductions.forEach((mission) => {
    if (mission.reduction !== 0) {
      rows.push({
        id: `mission-${mission.missionSiteId}`,
        label: `${shortenMissionTitle(mission.missionTitle)} Reduction`,
        value: mission.reduction,
        reverseColor: false, // Panic reduction is good (default)
      })
    }
  })

  return rows
}

/**
 * Format faction details breakdown
 */
function formatFactionDetails(details: FactionDetails): BreakdownRow[] {
  const rows: BreakdownRow[] = []

  // Add base threat increase
  if (details.baseThreatIncrease !== 0) {
    rows.push({
      id: 'baseThreatIncrease',
      label: 'Base Threat Increase',
      value: details.baseThreatIncrease,
      reverseColor: true, // Threat increase is bad
    })
  }

  // Add mission impacts
  details.missionImpacts.forEach((impact) => {
    if (impact.threatReduction !== undefined && impact.threatReduction !== 0) {
      rows.push({
        id: `mission-threat-${impact.missionSiteId}`,
        label: `${shortenMissionTitle(impact.missionTitle)} Threat Reduction`,
        value: impact.threatReduction,
        reverseColor: false, // Threat reduction is good (default)
      })
    }
    if (impact.suppressionAdded !== undefined && impact.suppressionAdded !== 0) {
      rows.push({
        id: `mission-suppression-${impact.missionSiteId}`,
        label: `${shortenMissionTitle(impact.missionTitle)} Suppression`,
        value: impact.suppressionAdded,
        reverseColor: false, // Suppression increase is good (default)
      })
    }
  })

  // Add suppression decay
  if (details.suppressionDecay !== 0) {
    rows.push({
      id: 'suppressionDecay',
      label: 'Suppression Decay',
      value: details.suppressionDecay,
      reverseColor: true, // Suppression decay is bad
    })
  }

  return rows
}
