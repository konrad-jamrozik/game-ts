import { sum } from 'radash'
import { getMissionById } from '../collections/missions'
import { MISSION_SURVIVAL_SKILL_GAIN } from '../model/ruleset/constants'
import type { GameState, MissionRewards, MissionSite, Agent, MissionSiteId } from '../model/model'
import { f2add, f2fmt } from '../model/fixed2'
import { getRecoveryTurns } from '../model/ruleset/ruleset'
import { agsV } from '../model/agents/AgentsView'
import { evaluateBattle, type BattleReport } from './evaluateBattle'
import { assertDefined } from '../utils/assert'
import { addSkill } from '../utils/actorUtils'

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
  const deployedAgentsView = agsV(state.agents).withIds(missionSite.agentIds)
  const deployedAgents = deployedAgentsView.toAgentArray()

  const battleReport = evaluateBattle(deployedAgentsView, missionSite.enemies)

  const { agentsWounded, agentsUnscathed } = updateAgentsAfterBattle(
    deployedAgents,
    battleReport,
    state.turn,
    missionSite.id,
    state.exhaustionRecovery,
    state.hitPointsRecoveryPct,
  )
  battleReport.agentsWounded = agentsWounded
  battleReport.agentsUnscathed = agentsUnscathed

  battleReport.agentExhaustionAfterBattle = calculateAgentExhaustionAfterBattle(
    deployedAgents,
    battleReport.initialAgentExhaustionByAgentId,
  )

  // Determine mission outcome
  const allEnemiesNeutralized = missionSite.enemies.every((enemy) => enemy.hitPoints <= 0)
  missionSite.state = allEnemiesNeutralized ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  const rewards = missionSite.state === 'Successful' ? mission.rewards : undefined

  return { rewards, battleReport }
}

function calculateAgentExhaustionAfterBattle(
  deployedAgents: Agent[],
  initialAgentExhaustionByAgentId: Record<string, number>,
): number {
  // Calculate final exhaustion gain AFTER updateAgentsAfterBattle (which includes casualty penalty)
  // Only count surviving agents (terminated agents don't contribute to exhaustion gain)
  const survivingAgentsView = agsV(deployedAgents).notTerminated()
  const survivingAgents = survivingAgentsView.toAgentArray()
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
  exhaustionRecovery: number,
  hitPointsRecoveryPct: number,
): {
  agentsWounded: number
  agentsUnscathed: number
} {
  let agentsWounded = 0
  let agentsUnscathed = 0
  deployedAgents.forEach((agent) => {
    const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
    assertDefined(battleSkillGain)

    const isTerminated = agent.hitPoints <= 0

    if (!isTerminated) {
      const wasWounded = updateSurvivingAgent(agent, battleReport, exhaustionRecovery, hitPointsRecoveryPct)
      if (wasWounded) {
        agentsWounded += 1
      } else {
        agentsUnscathed += 1
      }
    } else {
      agent.state = 'Terminated'
      agent.assignment = 'KIA'
      agent.turnTerminated = currentTurn
      agent.terminatedOnMissionSiteId = missionSiteId
    }
  })
  return { agentsWounded, agentsUnscathed }
}

function updateSurvivingAgent(
  agent: Agent,
  battleReport: BattleReport,
  exhaustionRecovery: number,
  hitPointsRecoveryPct: number,
): boolean {
  // ----------------------------------------
  // Update exhaustion
  // ----------------------------------------

  // Apply mission conclusion exhaustion
  agent.exhaustion += exhaustionRecovery

  // Additional exhaustion for each terminated agent
  agent.exhaustion += battleReport.agentsTerminated * exhaustionRecovery

  // ----------------------------------------
  // Update skill
  // ----------------------------------------

  // Skill from battle combat
  const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
  assertDefined(battleSkillGain)
  addSkill(agent, battleSkillGain)

  // Skill from mission survival
  // missionsTotal was already incremented when agent was deployed to the mission
  const survivalIndex = Math.min(agent.missionsTotal - 1, MISSION_SURVIVAL_SKILL_GAIN.length - 1)
  const survivalSkillGain = MISSION_SURVIVAL_SKILL_GAIN[survivalIndex]
  assertDefined(survivalSkillGain)
  addSkill(agent, survivalSkillGain)

  const totalSkillGain = f2add(battleSkillGain, survivalSkillGain)
  console.log(
    `📈 Agent ${agent.id} gained ${f2fmt(totalSkillGain)} skill (${f2fmt(battleSkillGain)} from combat, ${f2fmt(survivalSkillGain)} from survival)`,
  )

  // ----------------------------------------
  // Update state and assignment
  // ----------------------------------------

  agent.state = 'InTransit'

  // If agent took damage they need to recover
  const tookDamage = agent.hitPoints < agent.maxHitPoints
  if (tookDamage) {
    agent.assignment = 'Recovery'
    agent.hitPointsLostBeforeRecovery = agent.maxHitPoints - agent.hitPoints
    agent.recoveryTurns = getRecoveryTurns(agent.hitPointsLostBeforeRecovery, agent.maxHitPoints, hitPointsRecoveryPct)
    return true // Agent was wounded
  }
  agent.assignment = 'Standby'
  return false // Agent was not wounded
}
