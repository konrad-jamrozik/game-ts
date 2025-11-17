import { getMissionById } from '../collections/missions'
import { AGENT_EXHAUSTION_RECOVERY_PER_TURN, MISSION_SURVIVAL_SKILL_GAIN } from '../model/ruleset/constants'
import type { GameState, MissionRewards, MissionSite, Agent } from '../model/model'
import { getRecoveryTurns } from '../model/ruleset/ruleset'
import { agsV } from '../model/agents/AgentsView'
import { evaluateBattle, type BattleReport } from './evaluateBattle'
import { assertDefined } from '../utils/assert'

/**
 * Evaluates a deployed mission site according to about_deployed_mission_sites.md.
 * This includes the mission site battle, agent updates, and rewards.
 * Returns the mission rewards to be applied later in the turn advancement process, count of agents wounded, and battle report.
 */
export function evaluateDeployedMissionSite(
  state: GameState,
  missionSite: MissionSite,
): { rewards: MissionRewards | undefined; agentsWounded: number; agentsUnscathed: number; battleReport: BattleReport } {
  // Get the mission to access enemy units
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgentsView = agsV(state.agents).withIds(missionSite.agentIds)
  const deployedAgents = deployedAgentsView.toAgentArray()

  const battleReport = evaluateBattle(deployedAgentsView, missionSite.enemies)

  const { agentsWounded, agentsUnscathed } = updateAgentsAfterBattle(deployedAgents, battleReport)

  // Determine mission outcome
  const allEnemiesNeutralized = missionSite.enemies.every((enemy) => enemy.hitPoints <= 0)
  missionSite.state = allEnemiesNeutralized ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  const rewards = missionSite.state === 'Successful' ? mission.rewards : undefined

  return { rewards, agentsWounded, agentsUnscathed, battleReport }
}

function updateAgentsAfterBattle(
  deployedAgents: Agent[],
  battleReport: BattleReport,
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
      const wasWounded = updateSurvivingAgent(agent, battleReport)
      if (wasWounded) {
        agentsWounded += 1
      } else {
        agentsUnscathed += 1
      }
    } else {
      agent.state = 'Terminated'
      agent.assignment = 'KIA'
    }
  })
  return { agentsWounded, agentsUnscathed }
}

function updateSurvivingAgent(agent: Agent, battleReport: BattleReport): boolean {
  // ----------------------------------------
  // Update exhaustion
  // ----------------------------------------

  // Apply mission conclusion exhaustion
  agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

  // KJA 3 here is where we compute the agentCasualties penalty
  //   see todo in evaluateBattle
  // KJA 3 note it should not be casualties, but terminated only
  // Additional exhaustion for each terminated agent
  agent.exhaustion += battleReport.agentCasualties * AGENT_EXHAUSTION_RECOVERY_PER_TURN

  // ----------------------------------------
  // Update skill
  // ----------------------------------------

  // Skill from battle combat
  const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
  assertDefined(battleSkillGain)
  agent.skill += battleSkillGain

  // Skill from mission survival
  agent.missionsSurvived += 1
  const survivalIndex = Math.min(agent.missionsSurvived - 1, MISSION_SURVIVAL_SKILL_GAIN.length - 1)
  const survivalSkillGain = MISSION_SURVIVAL_SKILL_GAIN[survivalIndex]
  assertDefined(survivalSkillGain)
  agent.skill += survivalSkillGain

  console.log(
    `📈 Agent ${agent.id} gained ${battleSkillGain + survivalSkillGain} skill (${battleSkillGain} from combat, ${survivalSkillGain} from survival)`,
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
    agent.recoveryTurns = getRecoveryTurns(agent.hitPointsLostBeforeRecovery, agent.maxHitPoints)
    return true // Agent was wounded
  }
  agent.assignment = 'Standby'
  return false // Agent was not wounded
}
