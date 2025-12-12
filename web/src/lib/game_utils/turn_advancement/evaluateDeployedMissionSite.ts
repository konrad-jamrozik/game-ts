import { sum } from 'radash'
import { getMissionById } from '../../collections/missions'
import { MISSION_SURVIVAL_SKILL_GAIN, EXHAUSTION_PENALTY } from '../../ruleset/constants'
import type { MissionRewards, MissionSite, MissionSiteId } from '../../model/model'
import type { Agent } from '../../model/agentModel'
import type { GameState } from '../../model/gameStateModel'
import { f6add, f6fmtInt, toF6, f6sub, f6lt, f6le, type Fixed6 } from '../../primitives/fixed6'
import { addSkill, notTerminated, withIds } from '../../model_utils/agentUtils'
import { evaluateBattle, type BattleReport } from './evaluateBattle'
import { assertDefined, assertNotBothTrue } from '../../primitives/assertPrimitives'
import { canParticipateInBattle } from '../../ruleset/missionRuleset'

/**
 * Evaluates a deployed mission site according to about_deployed_mission_sites.md.
 * This includes the mission site battle, agent updates, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process, count of agents wounded, and battle report.
 */
export function evaluateDeployedMissionSite(
  state: GameState,
  missionSite: MissionSite,
): { rewards: MissionRewards | undefined; battleReport: BattleReport } {
  // Get the mission to access enemy units
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgents = withIds(state.agents, missionSite.agentIds)

  const battleReport = evaluateBattle(deployedAgents, missionSite.enemies)

  const { agentsWounded, agentsUnscathed } = updateAgentsAfterBattle(
    deployedAgents,
    battleReport,
    state.turn,
    missionSite.id,
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
  const allEnemiesNeutralized = missionSite.enemies.every(
    (enemy) => f6le(enemy.hitPoints, toF6(0)) || !canParticipateInBattle(enemy),
  )
  assertNotBothTrue(allEnemiesNeutralized, battleReport.retreated, 'Both enemies neutralized and retreated')
  if (allEnemiesNeutralized) {
    missionSite.state = 'Won'
  } else if (battleReport.retreated) {
    missionSite.state = 'Retreated'
  } else {
    missionSite.state = 'Wiped'
  }

  // Return mission rewards to be applied later, don't apply them immediately
  const rewards = missionSite.state === 'Won' ? mission.rewards : undefined

  return { rewards, battleReport }
}

function getAgentExhaustionAfterBattle(
  deployedAgents: Agent[],
  initialAgentExhaustionByAgentId: Record<string, number>,
): number {
  // Calculate final exhaustion gain AFTER updateAgentsAfterBattle (which includes casualty penalty)
  // Only count surviving agents (terminated agents don't contribute to exhaustion gain)
  const survivingAgents = notTerminated(deployedAgents)
  const finalAgentExhaustion = sum(survivingAgents, (agent) => agent.exhaustion)
  // Calculate initial exhaustion for only the surviving agents
  const initialSurvivingAgentExhaustion = sum(
    survivingAgents,
    (agent) => initialAgentExhaustionByAgentId[agent.id] ?? 0,
  )
  return finalAgentExhaustion - initialSurvivingAgentExhaustion
}

function updateAgentsAfterBattle(
  deployedAgents: Agent[],
  battleReport: BattleReport,
  currentTurn: number,
  missionSiteId: MissionSiteId,
  hitPointsRecoveryPct: Fixed6,
): {
  agentsWounded: number
  agentsUnscathed: number
} {
  let agentsWounded = 0
  let agentsUnscathed = 0
  const totalAgents = deployedAgents.length
  deployedAgents.forEach((agent) => {
    const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
    assertDefined(battleSkillGain)

    const isTerminated = f6le(agent.hitPoints, toF6(0))

    if (isTerminated) {
      agent.state = 'Terminated'
      agent.assignment = 'KIA'
      agent.turnTerminated = currentTurn
      agent.terminatedOnMissionSiteId = missionSiteId
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
  agent.exhaustion += EXHAUSTION_PENALTY

  // Additional exhaustion based on percentage of agents lost
  // Calculate percentage lost, round up to nearest 5%, then apply EXHAUSTION_PENALTY per 5% increment
  if (battleReport.agentsTerminated > 0 && totalAgents > 0) {
    const percentageLost = battleReport.agentsTerminated / totalAgents
    // Round up to nearest 5% (0.05): multiply by 20, round up, divide by 20
    const roundedPercentage = Math.ceil(percentageLost * 20) / 20
    // Divide by 0.05 to get number of 5% increments
    const increments = roundedPercentage / 0.05
    // Multiply by EXHAUSTION_PENALTY
    agent.exhaustion += Math.round(increments) * EXHAUSTION_PENALTY
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
  const maxHitPointsF6 = toF6(agent.maxHitPoints)
  const tookDamage = f6lt(agent.hitPoints, maxHitPointsF6)
  if (tookDamage) {
    agent.assignment = 'Recovery'
    const damage = f6sub(maxHitPointsF6, agent.hitPoints)
    agent.hitPointsLostBeforeRecovery = damage
    return true // Agent was wounded
  }
  agent.assignment = 'Standby'
  return false // Agent was not wounded
}
