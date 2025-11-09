import type { TreeViewBaseItem } from '@mui/x-tree-view/models'
import type { BattleStats, MissionReport } from '../../lib/model/turnReportModel'
import { bps } from '../../lib/model/bps'
import { fmtPctDec2 } from '../../lib/utils/formatUtils'
import { divMult100Round } from '../../lib/utils/mathUtils'
import type { TurnReportTreeViewModelProps } from './TurnReportTreeView'

/**
 * Format missions report as a tree structure for the MUI Tree View,
 * for the TurnReportTreeView component, to display it as part of the TurnReportDisplay component.
 */
export function formatMissions(missions: readonly MissionReport[]): TreeViewBaseItem<TurnReportTreeViewModelProps>[] {
  return missions.map((mission) => formatMissionReport(mission))
}

function formatMissionReport(mission: MissionReport): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  return {
    id: `mission-${mission.missionSiteId}`,
    label: `${mission.missionTitle} (${mission.faction})`,
    children: [
      {
        id: `mission-${mission.missionSiteId}-outcome`,
        label: 'Outcome',
        chipValue: mission.outcome,
      },
      {
        id: `mission-${mission.missionSiteId}-rounds`,
        label: 'Rounds',
        chipValue: mission.rounds,
        noColor: true,
        noPlusSign: true,
      },
      ...(mission.rewards !== undefined ? [formatRewards(mission.missionSiteId, mission.rewards)] : []),
      formatBattleStats(mission.missionSiteId, mission.battleStats),
    ],
  }
}

function formatRewards(
  missionSiteId: string,
  rewards: NonNullable<MissionReport['rewards']>,
): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  const children: TurnReportTreeViewModelProps[] = []

  if (rewards.money !== undefined) {
    children.push({
      id: `mission-${missionSiteId}-reward-money`,
      label: 'Money',
      chipValue: rewards.money,
    })
  }

  if (rewards.intel !== undefined) {
    children.push({
      id: `mission-${missionSiteId}-reward-intel`,
      label: 'Intel',
      chipValue: rewards.intel,
    })
  }

  if (rewards.funding !== undefined) {
    children.push({
      id: `mission-${missionSiteId}-reward-funding`,
      label: 'Funding',
      chipValue: rewards.funding,
    })
  }

  if (rewards.panicReduction !== undefined) {
    children.push({
      id: `mission-${missionSiteId}-reward-panic-reduction`,
      label: 'Panic',
      chipValue: bps(-rewards.panicReduction.value),
      reverseColor: true, // Negative values (reductions) should be green
    })
  }

  // Faction rewards - assume single faction (the one the mission is against)
  if (rewards.factionRewards !== undefined && rewards.factionRewards.length > 0) {
    const [factionReward] = rewards.factionRewards
    if (factionReward !== undefined) {
      if (factionReward.threatReduction !== undefined) {
        children.push({
          id: `mission-${missionSiteId}-reward-faction-threat-reduction`,
          label: 'Faction threat',
          chipValue: bps(-factionReward.threatReduction.value),
          reverseColor: true, // Negative values (reductions) should be green
        })
      }
      if (factionReward.suppression !== undefined) {
        children.push({
          id: `mission-${missionSiteId}-reward-faction-suppression`,
          label: 'Faction suppression',
          chipValue: factionReward.suppression,
          reverseColor: false, // Suppression increase is good (default)
        })
      }
    }
  }

  return {
    id: `mission-${missionSiteId}-rewards`,
    label: 'Rewards',
    children,
  }
}

function formatBattleStats(
  missionSiteId: string,
  battleStats: BattleStats,
): TreeViewBaseItem<TurnReportTreeViewModelProps> {
  const {
    agentsDeployed,
    agentsUnscathed,
    agentsWounded,
    agentsTerminated,
    enemiesTotal,
    enemiesUnscathed,
    enemiesWounded,
    enemiesTerminated,
    totalAgentSkillAtBattleStart,
    totalEnemySkillAtBattleStart,
    initialAgentHitPoints,
    initialEnemyHitPoints,
    totalDamageInflicted,
    totalDamageTaken,
    totalAgentSkillGain,
    averageAgentExhaustionGain,
  } = battleStats

  // Calculate percentages
  const damageInflictedPct =
    initialEnemyHitPoints > 0 ? divMult100Round(totalDamageInflicted, initialEnemyHitPoints) : 0
  const damageTakenPct = initialAgentHitPoints > 0 ? divMult100Round(totalDamageTaken, initialAgentHitPoints) : 0
  const skillGainPct =
    totalAgentSkillAtBattleStart > 0 ? divMult100Round(totalAgentSkillGain, totalAgentSkillAtBattleStart) : 0

  return {
    id: `mission-${missionSiteId}-battle-stats`,
    label: 'Battle stats',
    children: [
      {
        id: `mission-${missionSiteId}-battle-stats-agents-deployed`,
        label: 'Agents deployed',
        chipValue: agentsDeployed,
        noColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-agents-unscathed`,
        label: 'Agents unscathed',
        chipValue: agentsUnscathed,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-agents-wounded`,
        label: 'Agents wounded',
        chipValue: agentsWounded,
        useWarningColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-agents-terminated`,
        label: 'Agents terminated',
        chipValue: agentsTerminated,
        reverseColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-enemies-total`,
        label: 'Enemies total',
        chipValue: enemiesTotal,
        noColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-enemies-unscathed`,
        label: 'Enemies unscathed',
        chipValue: enemiesUnscathed,
        reverseColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-enemies-wounded`,
        label: 'Enemies wounded',
        chipValue: enemiesWounded,
        useWarningColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-enemies-terminated`,
        label: 'Enemies terminated',
        chipValue: enemiesTerminated,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-agent-hp-at-battle-start`,
        label: 'Total agent hp at battle start',
        chipValue: initialAgentHitPoints,
        noColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-enemy-hp-at-battle-start`,
        label: 'Total enemy hp at battle start',
        chipValue: initialEnemyHitPoints,
        noColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-agent-skill-at-battle-start`,
        label: 'Total agent skill at battle start',
        chipValue: totalAgentSkillAtBattleStart,
        noColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-enemy-skill-at-battle-start`,
        label: 'Total enemy skill at battle start',
        chipValue: totalEnemySkillAtBattleStart,
        noColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-damage-inflicted`,
        label: `Total damage inflicted (${fmtPctDec2(damageInflictedPct)} of enemy HP)`,
        chipValue: totalDamageInflicted,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-damage-taken`,
        label: `Total damage taken (${fmtPctDec2(damageTakenPct)} of agent HP)`,
        chipValue: totalDamageTaken,
        reverseColor: true,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-total-agent-skill-gain`,
        label: `Total agent skill gain (${fmtPctDec2(skillGainPct)} of initial skill)`,
        chipValue: totalAgentSkillGain,
        noPlusSign: true,
      },
      {
        id: `mission-${missionSiteId}-battle-stats-average-agent-exhaustion-gain`,
        label: 'Average agent exhaustion gain',
        chipValue: averageAgentExhaustionGain,
        reverseColor: true,
        noPlusSign: true,
      },
    ],
  }
}
