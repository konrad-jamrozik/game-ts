import { dataTables } from '../../data_tables/dataTables'
import { getMissionDataById } from '../../model_utils/missionUtils'
import { getActivityLevelByOrd } from '../../model_utils/factionActivityLevelUtils'
import { getFactionName } from '../../model_utils/factionUtils'
import { isFactionDiscovered } from '../../ruleset/factionRuleset'
import { withIds, onStandbyAssignment, recovering } from '../../model_utils/agentUtils'
import { toF6, f6add, f6max, f6sub, f6sum, f6gt, toF } from '../../primitives/fixed6'
import type { Faction } from '../../model/factionModel'
import type { FactionRewards, MissionRewards } from '../../model/missionModel'
import type { AgentState } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import { calculateProgressionTurns, nextActivityLevelOrd } from '../../ruleset/factionActivityLevelRuleset'
import {
  getPanicIncreaseForOperation,
  getFundingDecreaseForOperation,
  getMoneyRewardForOperation,
  getFundingRewardForOperation,
  calculateOperationTurns,
  rollOperationLevel,
} from '../../ruleset/factionOperationLevelRuleset'
import { bldMission } from '../../factories/missionFactory'
import type {
  AgentsReport,
  AssetsReport,
  BattleStats,
  ExpiredMissionReport,
  FactionReport,
  MissionReport,
  MoneyBreakdown,
  PanicReport,
  TurnReport,
} from '../../model/turnReportModel'
import { bldValueChange } from '../../model_utils/turnReportUtils'
import type { BattleOutcome } from '../../model/outcomeTypes'
import { validateGameStateInvariants } from '../../model_utils/validateGameStateInvariants'
import { evaluateDeployedMission } from './evaluateDeployedMission'
import {
  updateAvailableAgents,
  updateContractingAgents,
  updateInTransitAgents,
  updateRecoveringAgents,
  updateTrainingAgents,
} from './updateAgents'
import { updateLeadInvestigations } from './updateLeadInvestigations'
import { getAgentUpkeep } from '../../ruleset/moneyRuleset'
import { assertDefined, assertNotEmpty } from '../../primitives/assertPrimitives'

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

  // 9. Update active non-deployed missions
  const expiredMissionReports = updateActiveMissions(state)

  // 10. Evaluate deployed missions (and agents deployed to them)
  const { rewards: missionRewards, agentsWounded, agentsUnscathed, missionReports } = evaluateDeployedMissions(state)

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
  const panicReport = updatePanic(state, missionRewards, expiredMissionReports)

  // 14. Update factions (activity levels, suppression, etc.)
  const factionsReport = updateFactions(state, missionRewards)

  // 15. Apply funding penalties from expired missions
  applyFundingPenalties(state, expiredMissionReports)

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
    expiredMissions: expiredMissionReports,
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
 * Updates active non-deployed missions - apply expiration countdown
 * Returns reports for missions that expired this turn, including penalties
 */
function updateActiveMissions(state: GameState): ExpiredMissionReport[] {
  const expiredReports: ExpiredMissionReport[] = []
  for (const mission of state.missions) {
    if (mission.state === 'Active' && mission.expiresIn !== 'never') {
      mission.expiresIn -= 1
      if (mission.expiresIn <= 0) {
        mission.state = 'Expired'
        const missionData = getMissionDataById(mission.missionDataId)

        // Only defensive missions (faction operations) have operationLevel and apply penalties
        // Offensive missions (apprehend/raid) have undefined operationLevel and no penalties
        const { operationLevel, id: missionId } = mission
        if (typeof operationLevel === 'number') {
          // Level 6 existential mission expired - game over
          if (operationLevel === 6) {
            // Set panic to 1.0 (100%) to trigger game over condition
            state.panic = toF6(1)
          }

          // Get faction info for the report
          const { factionId } = missionData
          const faction = state.factions.find((f) => f.id === factionId)
          assertDefined(faction, `Faction with id ${factionId} not found for expired mission ${missionId}`)
          const factionName = getFactionName(faction)

          // Calculate penalties based on operation level
          const panicPenalty = getPanicIncreaseForOperation(operationLevel)
          const fundingPenalty = getFundingDecreaseForOperation(operationLevel)

          expiredReports.push({
            missionId,
            missionName: missionData.name,
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
 * Evaluates deployed missions and their agents
 * Returns collected mission rewards with mission information, count of agents wounded, and mission reports
 */
function evaluateDeployedMissions(state: GameState): {
  rewards: { rewards: MissionRewards; missionId: string; missionName: string }[]
  agentsWounded: number
  agentsUnscathed: number
  missionReports: MissionReport[]
} {
  const missionRewards: { rewards: MissionRewards; missionId: string; missionName: string }[] = []
  const missionReports: MissionReport[] = []
  let totalAgentsWounded = 0
  let totalAgentsUnscathed = 0

  for (const mission of state.missions) {
    if (mission.state === 'Deployed') {
      const { id: missionId, missionDataId, agentIds, enemies } = mission
      const missionData = getMissionDataById(missionDataId)
      const { name: missionName } = missionData
      const deployedAgents = withIds(state.agents, agentIds)

      // Capture agent states before battle
      const agentsDeployed = deployedAgents.length

      const { battleReport, rewards } = evaluateDeployedMission(state, mission)
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
        initialAgentHitPoints: initialAgentHitPointsF6,
        initialEnemyHitPoints: initialEnemyHitPointsF6,
        totalDamageInflicted,
        totalDamageTaken,
        rounds,
        roundLogs,
        attackLogs,
      } = battleReport
      const initialAgentHitPoints = toF(initialAgentHitPointsF6)
      const initialEnemyHitPoints = toF(initialEnemyHitPointsF6)

      // Determine mission outcome
      const outcome: BattleOutcome = retreated ? 'Retreated' : agentsTerminated === agentsDeployed ? 'Wiped' : 'Won'

      // Get faction name from mission data
      const { factionId } = missionData
      const faction = state.factions.find((factionItem) => factionItem.id === factionId)
      assertDefined(faction, `Faction with id ${factionId} not found for deployed mission ${missionId}`)
      const factionName = getFactionName(faction)

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
      const { operationLevel } = mission
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
        missionId,
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
          missionId,
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
    missionRewards: { rewards: MissionRewards; missionId: string; missionName: string }[]
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
  missionRewards: { rewards: MissionRewards; missionId: string; missionName: string }[],
  expiredMissions: ExpiredMissionReport[],
): PanicReport {
  const previousPanic = state.panic

  // Track faction operation penalties (from expired missions)
  const factionOperationPenalties = expiredMissions
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
  for (const { rewards, missionId, missionName } of missionRewards) {
    if (rewards.panicReduction !== undefined) {
      missionReductions.push({
        missionId,
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
function applyFundingPenalties(state: GameState, expiredMissions: ExpiredMissionReport[]): void {
  for (const expired of expiredMissions) {
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
 * Spawns a defensive mission for a faction when their operation counter reaches 0.
 * Picks the mission based on activity level probabilities and avoids repeating the same operation type.
 */
function spawnDefensiveMission(state: GameState, faction: Faction): void {
  // Roll for operation level based on activity level probabilities
  const operationLevel = rollOperationLevel(faction.activityLevel)

  // Filter defensive mission data by operation level
  const availableMissionData = dataTables.defensiveMissions.filter(
    (data) => data.level === operationLevel && data.factionId === faction.id,
  )

  assertNotEmpty(
    availableMissionData,
    `No defensive mission data available for faction ${faction.id} at operation level ${operationLevel}`,
  )

  // Filter out the last operation type if there are multiple options
  let candidateMissionData = availableMissionData
  if (availableMissionData.length > 1 && faction.lastOperationTypeName !== undefined) {
    candidateMissionData = availableMissionData.filter((data) => data.name !== faction.lastOperationTypeName)
    // If filtering removed all options, use all available mission data (can repeat if only one option)
    if (candidateMissionData.length === 0) {
      candidateMissionData = availableMissionData
    }
  }

  // Pick a random mission data from candidates
  // KJA3 put this random into an until function
  const selectedMissionData = candidateMissionData[Math.floor(Math.random() * candidateMissionData.length)]
  assertDefined(
    selectedMissionData,
    `Failed to select mission data: candidateMissionData.length=${candidateMissionData.length}, faction ${faction.id}, operation level ${operationLevel}`,
  )

  const newMission = bldMission({
    missionCount: state.missions.length,
    missionDataId: selectedMissionData.id,
    operationLevel,
  })
  state.missions.push(newMission)

  // Update faction's last operation type name
  faction.lastOperationTypeName = selectedMissionData.name
}

/**
 * Updates factions - activity level progression and suppression
 * Returns detailed FactionReport[] tracking all changes
 */
function updateFactions(
  state: GameState,
  missionRewards: { rewards: MissionRewards; missionId: string; missionName: string }[],
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
    for (const { rewards, missionId, missionName } of missionRewards) {
      if (rewards.factionRewards) {
        for (const factionReward of rewards.factionRewards) {
          if (factionReward.factionId === faction.id) {
            const impact: {
              missionId: string
              missionName: string
              suppressionAdded?: number
            } = {
              missionId,
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
      const config = getActivityLevelByOrd(faction.activityLevel)
      if (faction.activityLevel < 7 && config.turnsMin !== Infinity) {
        // Calculate the target turns for this faction if not already calculated
        const targetTurns = calculateProgressionTurns(faction.activityLevel)
        if (faction.turnsAtCurrentLevel >= targetTurns) {
          faction.activityLevel = nextActivityLevelOrd(faction.activityLevel)
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
        spawnDefensiveMission(state, faction)
        faction.turnsUntilNextOperation = calculateOperationTurns(faction.activityLevel)
      }
    }

    // Check if faction is discovered by verifying all discovery prerequisites are met
    const isDiscovered = isFactionDiscovered(faction, state.leadInvestigationCounts)

    // Create faction report
    factionReports.push({
      factionId: faction.id,
      factionName: getFactionName(faction),
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
