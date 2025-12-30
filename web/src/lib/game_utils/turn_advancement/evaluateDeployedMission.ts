import { getMissionDataById } from '../../model_utils/missionUtils'
import { MISSION_SURVIVAL_SKILL_GAIN, EXHAUSTION_PENALTY } from '../../data_tables/constants'
import type { Mission, MissionRewards } from '../../model/missionModel'
import type { MissionId } from '../../model/modelIds'
import type { OffensiveMissionData } from '../../data_tables/offensiveMissionsDataTable'
import type { Agent } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import {
  f6add,
  f6fmtInt,
  f6c0,
  toF6,
  f6lt,
  f6le,
  f6sumBy,
  f6sub,
  f6mult,
  toF,
  type Fixed6,
  toF6r,
} from '../../primitives/fixed6'
import { addSkill, notTerminated, withIds } from '../../model_utils/agentUtils'
import { evaluateBattle, type BattleReport } from './evaluateBattle'
import { assertDefined, assertNotBothTrue } from '../../primitives/assertPrimitives'
import { canParticipateInBattle } from '../../ruleset/missionRuleset'
import type { DefensiveMissionData } from '../../data_tables/defensiveMissionsDataTable'
import { getMoneyRewardForOperation, getFundingRewardForOperation } from '../../ruleset/factionOperationLevelRuleset'
import type { AttackLog } from '../../model/turnReportModel'

/**
 * Evaluates a deployed mission according to about_deployed_mission.md.
 * This includes the mission battle, agent updates, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process, count of agents wounded, and battle report.
 */
export function evaluateDeployedMission(
  state: GameState,
  mission: Mission,
): { rewards: MissionRewards | undefined; battleReport: BattleReport } {
  // Get the mission data to access enemy units and rewards
  const missionData = getMissionDataById(mission.missionDataId)

  // Get agents deployed to this mission
  const deployedAgents = withIds(state.agents, mission.agentIds)

  const battleReport = evaluateBattle(deployedAgents, mission.enemies)

  const { agentsWounded, agentsUnscathed } = updateAgentsAfterBattle(
    deployedAgents,
    battleReport,
    state.turn,
    mission.id,
    state.hitPointsRecoveryPct,
  )
  battleReport.agentsWounded = agentsWounded
  battleReport.agentsUnscathed = agentsUnscathed

  battleReport.agentExhaustionAfterBattle = getAgentExhaustionAfterBattle(
    deployedAgents,
    battleReport.initialAgentExhaustionByAgentId,
  )

  // Determine mission outcome
  // Enemies are neutralized if they are either terminated (HP <= 0) or incapacitated (effective skill <= 10% base)
  const allEnemiesNeutralized = mission.enemies.every(
    (enemy) => f6le(enemy.hitPoints, f6c0) || !canParticipateInBattle(enemy),
  )
  assertNotBothTrue(allEnemiesNeutralized, battleReport.retreated, 'Both enemies neutralized and retreated')
  if (allEnemiesNeutralized) {
    mission.state = 'Won'
  } else if (battleReport.retreated) {
    mission.state = 'Retreated'
  } else {
    mission.state = 'Wiped'
  }

  // Return mission rewards to be applied later, don't apply them immediately
  // For offensive missions, rewards come from mission data
  // For defensive missions, rewards are calculated dynamically based on operation level
  const rewards = mission.state === 'Won' ? bldRewardsFromMissionData(missionData, mission.operationLevel) : undefined

  return { rewards, battleReport }
}

function getAgentExhaustionAfterBattle(
  deployedAgents: Agent[],
  initialAgentExhaustionByAgentId: Record<string, Fixed6>,
): number {
  // Calculate final exhaustion gain AFTER updateAgentsAfterBattle (which includes casualty penalty)
  // Only count surviving agents (terminated agents don't contribute to exhaustion gain)
  const survivingAgents = notTerminated(deployedAgents)
  const finalAgentExhaustion = f6sumBy(survivingAgents, (agent) => agent.exhaustionPct)
  // Calculate initial exhaustion for only the surviving agents
  const initialSurvivingAgentExhaustion = f6sumBy(
    survivingAgents,
    (agent) => initialAgentExhaustionByAgentId[agent.id] ?? f6c0,
  )
  return toF(f6sub(finalAgentExhaustion, initialSurvivingAgentExhaustion))
}

function updateAgentsAfterBattle(
  deployedAgents: Agent[],
  battleReport: BattleReport,
  currentTurn: number,
  missionId: MissionId,
  hitPointsRecoveryPct: Fixed6,
): {
  agentsWounded: number
  agentsUnscathed: number
} {
  let agentsWounded = 0
  let agentsUnscathed = 0
  const totalAgents = deployedAgents.length

  // Calculate combat stats from attack logs
  const combatStatsByAgentId = calculateCombatStats(deployedAgents, battleReport.attackLogs)

  deployedAgents.forEach((agent) => {
    const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
    assertDefined(battleSkillGain)

    // Update combat stats
    const stats = combatStatsByAgentId.get(agent.id)
    if (stats !== undefined) {
      agent.kills += stats.kills
      agent.damageDealt += stats.damageDealt
      agent.damageReceived += stats.damageReceived
    }

    const isTerminated = f6le(agent.hitPoints, f6c0)

    if (isTerminated) {
      agent.state = 'KIA'
      agent.assignment = 'KIA'
      agent.turnTerminated = currentTurn
      agent.terminatedOnMissionId = missionId
    } else {
      // Incapacitated agents are still alive and processed normally (wounded or unscathed)
      const wasWounded = updateSurvivingAgent(agent, battleReport, hitPointsRecoveryPct, totalAgents)
      if (wasWounded) {
        agentsWounded += 1
      } else {
        agentsUnscathed += 1
      }
    }
  })
  return { agentsWounded, agentsUnscathed }
}

function calculateCombatStats(
  deployedAgents: Agent[],
  attackLogs: AttackLog[],
): Map<string, { kills: number; damageDealt: number; damageReceived: number }> {
  const statsByAgentId = new Map<string, { kills: number; damageDealt: number; damageReceived: number }>()

  // Initialize stats for all deployed agents
  for (const agent of deployedAgents) {
    statsByAgentId.set(agent.id, { kills: 0, damageDealt: 0, damageReceived: 0 })
  }

  // Process attack logs
  for (const log of attackLogs) {
    if (log.attackerType === 'Agent') {
      // Agent attacking enemy
      const stats = statsByAgentId.get(log.agentId)
      if (stats !== undefined) {
        // Add damage dealt
        if (log.damage !== undefined) {
          stats.damageDealt += log.damage
        }
        // Check for kill (defender HP <= 0 after damage)
        if (log.defenderHpAfterDamage <= 0) {
          stats.kills += 1
        }
      }
    } else {
      // Enemy attacking agent
      const stats = statsByAgentId.get(log.agentId)
      if (stats !== undefined && log.damage !== undefined) {
        stats.damageReceived += log.damage
      }
    }
  }

  return statsByAgentId
}

function updateSurvivingAgent(
  agent: Agent,
  battleReport: BattleReport,
  _hitPointsRecoveryPct: Fixed6,
  totalAgents: number,
): boolean {
  // ----------------------------------------
  // Update exhaustion
  // ----------------------------------------

  // Apply mission conclusion exhaustion
  agent.exhaustionPct = f6add(agent.exhaustionPct, EXHAUSTION_PENALTY)

  // Additional exhaustion based on percentage of agents lost
  // Calculate percentage lost, round up to nearest 5%, then apply EXHAUSTION_PENALTY per 5% increment
  if (battleReport.agentsTerminated > 0 && totalAgents > 0) {
    const percentageLost = battleReport.agentsTerminated / totalAgents
    // Round up to nearest 5% (0.05): multiply by 20, round up, divide by 20
    const roundedPercentage = Math.ceil(percentageLost * 20) / 20
    // Divide by 0.05 to get number of 5% increments
    const increments = roundedPercentage / 0.05
    // Multiply by EXHAUSTION_PENALTY (convert increments count to Fixed6, then multiply)
    const incrementsCount = Math.round(increments)
    const additionalExhaustion = f6mult(EXHAUSTION_PENALTY, incrementsCount)
    agent.exhaustionPct = f6add(agent.exhaustionPct, toF6r(additionalExhaustion))
  }

  // ----------------------------------------
  // Update skill
  // ----------------------------------------

  // Skill from battle combat
  const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
  assertDefined(battleSkillGain)
  addSkill(agent, battleSkillGain)

  // Skill from mission survival
  // missionsTotal was already incremented when agent was deployed to the mission
  const survivalIndex = Math.max(0, Math.min(agent.missionsTotal - 1, MISSION_SURVIVAL_SKILL_GAIN.length - 1))
  const survivalSkillGain = MISSION_SURVIVAL_SKILL_GAIN[survivalIndex]
  assertDefined(survivalSkillGain)
  addSkill(agent, survivalSkillGain)

  const totalSkillGain = f6add(battleSkillGain, survivalSkillGain)
  console.log(
    `📈 Agent ${agent.id} gained ${f6fmtInt(totalSkillGain)} skill (${f6fmtInt(battleSkillGain)} from combat, ${f6fmtInt(survivalSkillGain)} from survival)`,
  )

  // ----------------------------------------
  // Update state and assignment
  // ----------------------------------------

  agent.state = 'InTransit'

  // If agent took damage they need to recover
  const tookDamage = f6lt(agent.hitPoints, agent.maxHitPoints)
  if (tookDamage) {
    agent.assignment = 'Recovery'
    return true // Agent was wounded
  }
  agent.assignment = 'Standby'
  return false // Agent was not wounded
}

function parseSuppression(suppression: string): number {
  if (suppression === 'N/A') {
    return 0
  }
  const match = /^(?<value>\d+)/u.exec(suppression)
  const value = match?.groups?.['value']
  if (value !== undefined && value !== '') {
    return Number.parseInt(value, 10)
  }
  return 0
}

function bldRewardsFromMissionData(
  missionData: OffensiveMissionData | DefensiveMissionData,
  operationLevel?: number,
): MissionRewards {
  // Defensive missions: rewards calculated from operation level
  if (operationLevel !== undefined) {
    return {
      money: getMoneyRewardForOperation(operationLevel),
      funding: getFundingRewardForOperation(operationLevel),
      panicReduction: f6c0,
      factionRewards: [],
    }
  }

  // Offensive missions: rewards from mission data
  // Type guard: defensive missions don't have these fields
  if (!('moneyReward' in missionData)) {
    throw new Error('Expected offensive mission data but got defensive mission data')
  }
  const offensiveData = missionData
  const suppressionValue = parseSuppression(offensiveData.suppression)

  return {
    money: offensiveData.moneyReward,
    funding: offensiveData.fundingReward,
    panicReduction: toF6(offensiveData.panicReductionPct / 100),
    factionRewards:
      suppressionValue > 0
        ? [
            {
              factionId: offensiveData.factionId,
              suppression: suppressionValue,
            },
          ]
        : [],
  }
}
