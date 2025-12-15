import { getMissionById, generateMissionId } from '../../collections/missions'
import { DEFENSIVE_MISSIONS_DATA } from '../../collections/missionStatsTables'
import { withIds, onStandbyAssignment, recovering } from '../../model_utils/agentUtils'
import { toF6, f6add, f6max, f6sub, f6sum, f6gt } from '../../primitives/fixed6'
import type { Faction } from '../../model/factionModel'
import type { FactionRewards, MissionRewards } from '../../model/missionSiteModel'
import type { AgentState } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import {
  getActivityLevelConfig,
  getPanicIncreaseForOperation,
  getFundingDecreaseForOperation,
  getMoneyRewardForOperation,
  getFundingRewardForOperation,
  calculateOperationTurns,
  calculateProgressionTurns,
  nextActivityLevel,
  rollOperationLevel,
} from '../../ruleset/activityLevelRuleset'
import { bldMissionSite } from '../missionSiteFactory'
import {
  bldValueChange,
  type AgentsReport,
  type AssetsReport,
  type BattleStats,
  type ExpiredMissionSiteReport,
  type FactionReport,
  type MissionReport,
  type MoneyBreakdown,
  type PanicReport,
  type TurnReport,
} from '../../model/turnReportModel'
import type { BattleOutcome } from '../../model/outcomeTypes'
import { validateGameStateInvariants } from '../../model_utils/validateGameStateInvariants'
import { evaluateDeployedMissionSite } from './evaluateDeployedMissionSite'
import {
  updateAvailableAgents,
  updateContractingAgents,
  updateInTransitAgents,
  updateRecoveringAgents,
  updateTrainingAgents,
} from './updateAgents'
import { updateLeadInvestigations } from './updateLeadInvestigations'
import { getAgentUpkeep } from '../../ruleset/moneyRuleset'
import { FACTION_DATA } from '../../collections/factionStatsTables'
import { assertDefined } from '../../primitives/assertPrimitives'

/**
 * This function is documented by the about_turn_advancement.md document.
 */
export default function evaluateTurn(state: GameState): TurnReport {
  validateGameStateInvariants(state)

  // The step and their numbers are taken from the documented describing this function.

  // 1. Update turn and actions counter

  const timestamp = Date.now()
  const turn = state.turn + 1
  state.turn = turn
  state.actionsCount = 0

  // 2. Compute agent upkeep
  const agentUpkeep = getAgentUpkeep(state)

  // Capture agent counts and agents list before turn advancement
  const previousAgentCounts = getAgentCounts(state.agents)
  const previousAgents = state.agents.map((agent) => ({ id: agent.id, state: agent.state }))

  // 3. Update all agents in Available state
  updateAvailableAgents(state)

  // 4. Update all agents in Recovering state
  updateRecoveringAgents(state)

  // 5. Update all agents on Contracting assignment
  const contractingResults = updateContractingAgents(state)

  // 6.5. Update all agents in Training
  updateTrainingAgents(state)

  // 7. Update lead investigations (agents completing investigations go to InTransit)
  const leadInvestigationReports = updateLeadInvestigations(state)

  // 8. Update all agents in InTransit state (after investigations complete)
  updateInTransitAgents(state)

  // 9. Update active non-deployed mission sites
  const expiredMissionSiteReports = updateActiveMissionSites(state)

  // 10. Evaluate deployed mission sites (and agents deployed to them)
  const {
    rewards: missionRewards,
    agentsWounded,
    agentsUnscathed,
    missionReports,
  } = evaluateDeployedMissionSites(state)

  // 11. Update player assets
  const assetsReportPartial = updatePlayerAssets(state, {
    agentUpkeep,
    moneyEarned: contractingResults.moneyEarned,
    missionRewards,
  })

  // 12. Get agents report
  const agentsReport = getAgentsReport(state, previousAgentCounts, previousAgents, agentsWounded, agentsUnscathed)

  // Combine assets and agents reports
  const assetsReport: AssetsReport = {
    ...assetsReportPartial,
    agentsReport,
  }

  // 13. Update panic (from expired missions and mission rewards)
  const panicReport = updatePanic(state, missionRewards, expiredMissionSiteReports)

  // 14. Update factions (activity levels, suppression, etc.)
  const factionsReport = updateFactions(state, missionRewards)

  // 15. Apply funding penalties from expired missions
  applyFundingPenalties(state, expiredMissionSiteReports)

  validateGameStateInvariants(state)

  // Build and return TurnReport
  const turnReport: TurnReport = {
    timestamp,
    turn,
    assets: assetsReport,
    panic: panicReport,
    factions: factionsReport,
    missions: missionReports,
    leadInvestigations: leadInvestigationReports,
    expiredMissionSites: expiredMissionSiteReports,
  }

  return turnReport
}

/**
 * Count agents by state and assignment
 */
function getAgentCounts(agents: GameState['agents']): {
  total: number
  available: number
  inTransit: number
  standby: number
  recovering: number
  wounded: number
  terminated: number
} {
  return {
    total: agents.filter((agent) => agent.state !== 'KIA' && agent.state !== 'Sacked').length,
    available: agents.filter((agent) => agent.state === 'Available').length,
    inTransit: agents.filter((agent) => agent.state === 'InTransit').length,
    standby: onStandbyAssignment(agents).length,
    recovering: recovering(agents).length,
    wounded: recovering(agents).length,
    terminated: agents.filter((agent) => agent.state === 'KIA').length,
  }
}

/**
 * Updates active non-deployed mission sites - apply expiration countdown
 * Returns reports for mission sites that expired this turn, including penalties
 */
function updateActiveMissionSites(state: GameState): ExpiredMissionSiteReport[] {
  const expiredReports: ExpiredMissionSiteReport[] = []
  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Active' && missionSite.expiresIn !== 'never') {
      missionSite.expiresIn -= 1
      if (missionSite.expiresIn <= 0) {
        missionSite.state = 'Expired'
        const mission = getMissionById(missionSite.missionId)

        // Only defensive missions (faction operations) have operationLevel and apply penalties
        // Offensive missions (apprehend/raid) have undefined operationLevel and no penalties
        const { operationLevel, id } = missionSite
        if (typeof operationLevel === 'number') {
          // Level 6 existential mission expired - game over
          if (operationLevel === 6) {
            // Set panic to 1.0 (100%) to trigger game over condition
            state.panic = toF6(1)
          }

          // Get faction info for the report
          const factionReward = mission.rewards.factionRewards?.[0]
          const factionId = factionReward?.factionId ?? ''
          const faction = state.factions.find((f) => f.id === factionId)
          const factionName = faction?.name ?? 'Unknown'

          // Calculate penalties based on operation level
          const panicPenalty = getPanicIncreaseForOperation(operationLevel)
          const fundingPenalty = getFundingDecreaseForOperation(operationLevel)

          expiredReports.push({
            missionSiteId: id,
            missionName: mission.name,
            factionId,
            factionName,
            operationLevel,
            panicPenalty,
            fundingPenalty,
          })
        }
      }
    }
  }
  return expiredReports
}

/**
 * Evaluates deployed mission sites and their agents
 * Returns collected mission rewards with site information, count of agents wounded, and mission reports
 */
function evaluateDeployedMissionSites(state: GameState): {
  rewards: { rewards: MissionRewards; missionSiteId: string; missionName: string }[]
  agentsWounded: number
  agentsUnscathed: number
  missionReports: MissionReport[]
} {
  const missionRewards: { rewards: MissionRewards; missionSiteId: string; missionName: string }[] = []
  const missionReports: MissionReport[] = []
  let totalAgentsWounded = 0
  let totalAgentsUnscathed = 0

  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      const { id: missionSiteId, missionId, agentIds, enemies } = missionSite
      const mission = getMissionById(missionId)
      const { name: missionName } = mission
      const deployedAgents = withIds(state.agents, agentIds)

      // Capture agent states before battle
      const agentsDeployed = deployedAgents.length

      const { battleReport, rewards } = evaluateDeployedMissionSite(state, missionSite)
      const {
        agentsWounded,
        agentsUnscathed,
        retreated,
        agentsTerminated,
        enemyCasualties,
        agentSkillUpdates,
        agentExhaustionAfterBattle,
        initialAgentEffectiveSkill,
        initialEnemySkill,
        initialAgentHitPoints,
        initialEnemyHitPoints,
        totalDamageInflicted,
        totalDamageTaken,
        rounds,
        roundLogs,
        attackLogs,
      } = battleReport

      // Determine mission outcome
      const outcome: BattleOutcome = retreated ? 'Retreated' : agentsTerminated === agentsDeployed ? 'Wiped' : 'Won'

      // Get faction name from mission rewards
      let factionName = 'Unknown'
      const { factionRewards } = mission.rewards
      if (factionRewards !== undefined && factionRewards.length > 0) {
        const [firstReward] = factionRewards
        if (firstReward !== undefined) {
          const { factionId } = firstReward
          const faction = state.factions.find((factionItem) => factionItem.id === factionId)
          if (faction !== undefined) {
            factionName = faction.name
          }
        }
      }

      // Calculate battle stats

      // Calculate enemy stats
      const enemiesTotal = enemies.length
      const enemiesTerminated = enemyCasualties
      const enemiesWounded = enemiesTotal - enemiesTerminated
      const enemiesUnscathed = enemiesTotal - enemiesTerminated

      // Calculate total agent skill gain
      const totalAgentSkillGain = f6sum(...Object.values(agentSkillUpdates))

      // Calculate average agent exhaustion gain (after battle, including casualty penalty)
      const averageAgentExhaustionGain = agentsDeployed > 0 ? agentExhaustionAfterBattle / agentsDeployed : 0

      const battleStats: BattleStats = {
        agentsDeployed,
        agentsUnscathed,
        agentsWounded,
        agentsTerminated,
        enemiesTotal,
        enemiesUnscathed,
        enemiesWounded,
        enemiesTerminated,
        totalAgentSkillAtBattleStart: initialAgentEffectiveSkill,
        totalEnemySkillAtBattleStart: initialEnemySkill,
        initialAgentHitPoints,
        initialEnemyHitPoints,
        totalDamageInflicted,
        totalDamageTaken,
        totalAgentSkillGain,
        averageAgentExhaustionGain,
        roundLogs,
        attackLogs,
      }

      // For defensive missions (with operationLevel), add operation-level rewards on success
      // or check for game over on level 6 failure
      const { operationLevel } = missionSite
      let finalRewards = rewards

      if (typeof operationLevel === 'number') {
        // Defensive mission
        const missionWon = outcome === 'Won'
        if (missionWon && rewards !== undefined) {
          // Mission succeeded - add operation-level money and funding rewards
          const moneyReward = getMoneyRewardForOperation(operationLevel)
          const fundingReward = getFundingRewardForOperation(operationLevel)

          finalRewards = {
            ...rewards,
            money: (rewards.money ?? 0) + moneyReward,
            funding: (rewards.funding ?? 0) + fundingReward,
          }
        } else if (operationLevel === 6 && !missionWon) {
          // Level 6 existential mission failed - game over
          // Set panic to 1.0 (100%) to trigger game over condition
          state.panic = toF6(1)
        }
      }

      const missionReport: MissionReport = {
        missionSiteId,
        missionName,
        faction: factionName,
        outcome,
        rounds,
        ...(finalRewards !== undefined && { rewards: finalRewards }),
        battleStats,
      }

      missionReports.push(missionReport)

      if (finalRewards !== undefined) {
        missionRewards.push({
          rewards: finalRewards,
          missionSiteId,
          missionName,
        })
      }
      totalAgentsWounded += agentsWounded
      totalAgentsUnscathed += agentsUnscathed
    }
  }

  return {
    rewards: missionRewards,
    agentsWounded: totalAgentsWounded,
    agentsUnscathed: totalAgentsUnscathed,
    missionReports,
  }
}

/**
 * Updates player assets based on the results of agent assignments and mission rewards
 * Returns partial AssetsReport without agentsReport (money and breakdowns only)
 */
function updatePlayerAssets(
  state: GameState,
  income: {
    agentUpkeep: number
    moneyEarned: number
    missionRewards: { rewards: MissionRewards; missionSiteId: string; missionName: string }[]
  },
): Omit<AssetsReport, 'agentsReport'> {
  // Capture previous values
  const previousMoney = state.money

  // Track mission reward amounts for breakdown
  let missionMoneyRewards = 0

  // Subtract agent upkeep costs (calculated at turn start before any agents were terminated)
  state.money -= income.agentUpkeep

  // Add money earned by contracting agents
  state.money += income.moneyEarned

  // Add funding income
  state.money += state.funding

  // Apply mission rewards for money and funding only
  // Panic and faction rewards are applied in their respective update functions
  for (const { rewards } of income.missionRewards) {
    if (rewards.money !== undefined) {
      state.money += rewards.money
      missionMoneyRewards += rewards.money
    }
    if (rewards.funding !== undefined) {
      state.funding += rewards.funding
    }
  }

  const moneyChange = bldValueChange(previousMoney, state.money)

  // Create detailed breakdowns
  const moneyDetails: MoneyBreakdown = {
    agentUpkeep: -income.agentUpkeep,
    contractingEarnings: income.moneyEarned,
    fundingIncome: state.funding,
    missionRewards: missionMoneyRewards,
  }

  return {
    moneyChange,
    moneyBreakdown: moneyDetails,
  }
}

/**
 * Updates agent counts and returns AgentsReport tracking all changes
 */
function getAgentsReport(
  state: GameState,
  previousAgentCounts: {
    total: number
    available: number
    inTransit: number
    standby: number
    recovering: number
    wounded: number
    terminated: number
  },
  previousAgents: { id: string; state: AgentState }[],
  agentsWounded: number,
  agentsUnscathed: number,
): AgentsReport {
  // Capture agent counts after turn advancement
  const currentAgentCounts = getAgentCounts(state.agents)

  // Calculate wounded counts: wounded should only increase from missions, not decrease from recovery
  // Previous wounded = 0 (we track delta only, reset each turn)
  // Current wounded = agents wounded from missions this turn
  // Delta = agents wounded from missions this turn
  const previousWounded = 0
  const currentWounded = agentsWounded

  // Calculate unscathed counts: unscathed should only increase from missions, not decrease
  // Previous unscathed = 0 (we track delta only, reset each turn)
  // Current unscathed = agents unscathed from missions this turn
  // Delta = agents unscathed from missions this turn
  const previousUnscathed = 0
  const currentUnscathed = agentsUnscathed

  // Identify agents terminated during this turn advancement
  const previousAgentsById = new Map(previousAgents.map((agent) => [agent.id, agent]))
  const terminatedAgentIds: string[] = []
  for (const currentAgent of state.agents) {
    const previousAgent = previousAgentsById.get(currentAgent.id)
    if (currentAgent.state === 'KIA' && previousAgent && previousAgent.state !== 'KIA') {
      terminatedAgentIds.push(currentAgent.id)
    }
  }

  return {
    total: bldValueChange(previousAgentCounts.total, currentAgentCounts.total),
    available: bldValueChange(previousAgentCounts.available, currentAgentCounts.available),
    inTransit: bldValueChange(previousAgentCounts.inTransit, currentAgentCounts.inTransit),
    standby: bldValueChange(previousAgentCounts.standby, currentAgentCounts.standby),
    recovering: bldValueChange(previousAgentCounts.recovering, currentAgentCounts.recovering),
    wounded: bldValueChange(previousWounded, currentWounded),
    unscathed: bldValueChange(previousUnscathed, currentUnscathed),
    terminated: bldValueChange(previousAgentCounts.terminated, currentAgentCounts.terminated),
    terminatedAgentIds,
  }
}

/**
 * Updates panic based on expired mission penalties and mission rewards
 * Returns detailed PanicReport tracking all changes
 */
function updatePanic(
  state: GameState,
  missionRewards: { rewards: MissionRewards; missionSiteId: string; missionName: string }[],
  expiredMissionSites: ExpiredMissionSiteReport[],
): PanicReport {
  const previousPanic = state.panic

  // Track faction operation penalties (from expired missions)
  const factionOperationPenalties = expiredMissionSites
    .filter((expired) => expired.panicPenalty !== undefined && f6gt(expired.panicPenalty, toF6(0)))
    .map((expired) => ({
      factionId: expired.factionId,
      factionName: expired.factionName,
      operationLevel: expired.operationLevel ?? 1,
      panicIncrease: expired.panicPenalty ?? toF6(0),
    }))

  // Apply panic increases from expired missions
  for (const penalty of factionOperationPenalties) {
    state.panic = f6add(state.panic, penalty.panicIncrease)
  }

  // Track mission reductions and apply them
  const missionReductions = []
  for (const { rewards, missionSiteId, missionName } of missionRewards) {
    if (rewards.panicReduction !== undefined) {
      missionReductions.push({
        missionSiteId,
        missionName,
        reduction: rewards.panicReduction,
      })
      state.panic = f6max(toF6(0), f6sub(state.panic, rewards.panicReduction))
    }
  }

  return {
    change: bldValueChange(previousPanic, state.panic),
    breakdown: {
      factionOperationPenalties,
      missionReductions,
    },
  }
}

/**
 * Apply funding penalties from expired missions
 */
function applyFundingPenalties(state: GameState, expiredMissionSites: ExpiredMissionSiteReport[]): void {
  for (const expired of expiredMissionSites) {
    if (expired.fundingPenalty !== undefined && expired.fundingPenalty > 0) {
      state.funding = Math.max(0, state.funding - expired.fundingPenalty)
    }
  }
}

/**
 * Apply faction reward (suppression) to a target faction
 */
function applyFactionReward(targetFaction: Faction, factionReward: FactionRewards): void {
  if (factionReward.suppression !== undefined) {
    targetFaction.suppressionTurns += factionReward.suppression
  }
}

/**
 * Spawns a defensive mission site for a faction when their operation counter reaches 0.
 * Picks the mission based on activity level probabilities and avoids repeating the same operation type.
 */
function spawnDefensiveMissionSite(state: GameState, faction: Faction): void {
  // Roll for operation level based on activity level probabilities
  const operationLevel = rollOperationLevel(faction.activityLevel)

  // Filter defensive missions by operation level
  const availableMissions = DEFENSIVE_MISSIONS_DATA.filter((stats) => stats.level === operationLevel)

  if (availableMissions.length === 0) {
    // No missions available for this operation level - should not happen, but handle gracefully
    return
  }

  // Filter out the last operation type if there are multiple options
  let candidateMissions = availableMissions
  if (availableMissions.length > 1 && faction.lastOperationTypeName !== undefined) {
    candidateMissions = availableMissions.filter((stats) => stats.name !== faction.lastOperationTypeName)
    // If filtering removed all options, use all available missions (can repeat if only one option)
    if (candidateMissions.length === 0) {
      candidateMissions = availableMissions
    }
  }

  // Pick a random mission from candidates
  // KJA3 put this random into an until function
  const selectedMission = candidateMissions[Math.floor(Math.random() * candidateMissions.length)]
  if (selectedMission === undefined) {
    // KJA3 should assert fail. Also search for other palaces like that and update Agents.md
    // Should not happen, but handle gracefully
    return
  }

  // Convert mission stats to enemy counts object
  const enemyCounts = selectedMission

  // Generate missionId using the same pattern as offensive missions
  const factionTemplate = FACTION_DATA.find((def) => def.id === faction.id)
  assertDefined(factionTemplate, `Faction template not found for ${faction.id}`)
  const missionId = generateMissionId(selectedMission.name, factionTemplate)

  bldMissionSite({
    state,
    missionId,
    expiresIn: selectedMission.expiresIn,
    enemyCounts,
    operationLevel,
  })

  // Update faction's last operation type name
  faction.lastOperationTypeName = selectedMission.name
}

/**
 * Updates factions - activity level progression and suppression
 * Returns detailed FactionReport[] tracking all changes
 */
function updateFactions(
  state: GameState,
  missionRewards: { rewards: MissionRewards; missionSiteId: string; missionName: string }[],
): FactionReport[] {
  const factionReports: FactionReport[] = []

  for (const faction of state.factions) {
    // Capture previous values
    const previousActivityLevel = faction.activityLevel
    const previousTurnsAtCurrentLevel = faction.turnsAtCurrentLevel
    const previousTurnsUntilNextOperation = faction.turnsUntilNextOperation
    const previousSuppressionTurns = faction.suppressionTurns

    // Track mission impacts on this faction
    const missionImpacts = []
    for (const { rewards, missionSiteId, missionName } of missionRewards) {
      if (rewards.factionRewards) {
        for (const factionReward of rewards.factionRewards) {
          if (factionReward.factionId === faction.id) {
            const impact: {
              missionSiteId: string
              missionName: string
              suppressionAdded?: number
            } = {
              missionSiteId,
              missionName,
            }

            if (factionReward.suppression !== undefined) {
              impact.suppressionAdded = factionReward.suppression
            }

            missionImpacts.push(impact)
            applyFactionReward(faction, factionReward)
          }
        }
      }
    }

    // Update activity level progression (only for non-dormant factions)
    let activityLevelIncreased = false
    if (faction.activityLevel >= 0) {
      faction.turnsAtCurrentLevel += 1

      // Check if faction should advance to next activity level
      const config = getActivityLevelConfig(faction.activityLevel)
      if (faction.activityLevel < 7 && config.minTurns !== Infinity) {
        // Calculate the target turns for this faction if not already calculated
        const targetTurns = calculateProgressionTurns(faction.activityLevel)
        if (faction.turnsAtCurrentLevel >= targetTurns) {
          faction.activityLevel = nextActivityLevel(faction.activityLevel)
          faction.turnsAtCurrentLevel = 0
          faction.turnsUntilNextOperation = calculateOperationTurns(faction.activityLevel)
          activityLevelIncreased = true
        }
      }
    }

    // Update suppression (decay by 1 each turn if > 0)
    if (faction.suppressionTurns > 0) {
      faction.suppressionTurns -= 1
    }

    // Update turns until next operation (only if not suppressed and not dormant)
    if (faction.activityLevel > 0 && faction.suppressionTurns === 0) {
      // KJA3 Why I need turnsUntilNextOperationBeforeDecrement?
      const turnsUntilNextOperationBeforeDecrement = faction.turnsUntilNextOperation
      faction.turnsUntilNextOperation -= 1

      // Check if it's time to perform an operation (when counter goes from 1 to 0)
      if (turnsUntilNextOperationBeforeDecrement === 1 && faction.turnsUntilNextOperation === 0) {
        spawnDefensiveMissionSite(state, faction)
        faction.turnsUntilNextOperation = calculateOperationTurns(faction.activityLevel)
      }
    }

    // Check if faction is discovered by verifying all discovery prerequisites are met
    const isDiscovered = faction.discoveryPrerequisite.every(
      (leadId) => (state.leadInvestigationCounts[leadId] ?? 0) > 0,
    )

    // Create faction report
    factionReports.push({
      factionId: faction.id,
      factionName: faction.name,
      isDiscovered,
      activityLevel: bldValueChange(previousActivityLevel, faction.activityLevel),
      turnsAtCurrentLevel: bldValueChange(previousTurnsAtCurrentLevel, faction.turnsAtCurrentLevel),
      turnsUntilNextOperation: bldValueChange(previousTurnsUntilNextOperation, faction.turnsUntilNextOperation),
      suppressionTurns: bldValueChange(previousSuppressionTurns, faction.suppressionTurns),
      missionImpacts,
      activityLevelIncreased,
    })
  }

  return factionReports
}

// KJA3 review which functions should be moved out from evaluateTurn.s
