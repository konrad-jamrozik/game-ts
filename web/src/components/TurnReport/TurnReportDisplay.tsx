import { Box } from '@mui/material'
import * as React from 'react'
import { useAppSelector } from '../../app/hooks'
import type { IntelBreakdown, MoneyBreakdown, PanicBreakdown, FactionDetails } from '../../lib/model/reportModel'
import { ExpandableCard } from '../ExpandableCard'
import { ValueChangeCard, type BreakdownRow } from './ValueChangeCard'

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
          <ValueChangeCard
            id="money"
            title="Money"
            valueChange={report.assets.money}
            breakdownRows={formatMoneyBreakdown(report.assets.moneyDetails)}
            expanded={expandedCards.has('money')}
            onChange={handleCardChange('money')}
          />

          <ValueChangeCard
            id="intel"
            title="Intel"
            valueChange={report.assets.intel}
            breakdownRows={formatIntelBreakdown(report.assets.intelDetails)}
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
 * Format money breakdown details
 */
function formatMoneyBreakdown(breakdown: MoneyBreakdown): BreakdownRow[] {
  return [
    { id: 'agentUpkeep', label: 'Agent Upkeep', value: breakdown.agentUpkeep },
    { id: 'contractingEarnings', label: 'Contracting Earnings', value: breakdown.contractingEarnings },
    { id: 'fundingIncome', label: 'Funding Income', value: breakdown.fundingIncome },
    { id: 'hireCosts', label: 'Hire Costs', value: breakdown.hireCosts },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ].filter((item) => item.value !== 0)
}

/**
 * Format intel breakdown details
 */
function formatIntelBreakdown(breakdown: IntelBreakdown): BreakdownRow[] {
  return [
    { id: 'espionageGathered', label: 'Espionage Gathered', value: breakdown.espionageGathered },
    { id: 'missionRewards', label: 'Mission Rewards', value: breakdown.missionRewards },
  ].filter((item) => item.value !== 0)
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
