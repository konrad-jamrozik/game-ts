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
 * Returns the mission rewards to be applied later in the turn advancement process.
 */
export function evaluateDeployedMissionSite(state: GameState, missionSite: MissionSite): MissionRewards | undefined {
  // Get the mission to access enemy units
  const mission = getMissionById(missionSite.missionId)

  // Get agents deployed to this mission site
  const deployedAgentsView = agsV(state.agents).withIds(missionSite.agentIds)
  const deployedAgents = deployedAgentsView.toAgentArray()

  const battleReport = evaluateBattle(deployedAgentsView, missionSite.enemies)

  updateAgentsAfterBattle(deployedAgents, battleReport)

  // Determine mission outcome
  const allEnemiesNeutralized = missionSite.enemies.every((enemy) => enemy.hitPoints <= 0)
  missionSite.state = allEnemiesNeutralized ? 'Successful' : 'Failed'

  // Return mission rewards to be applied later, don't apply them immediately
  if (missionSite.state === 'Successful') {
    return mission.rewards
  }

  return undefined
}

function updateAgentsAfterBattle(deployedAgents: Agent[], battleReport: BattleReport): void {
  deployedAgents.forEach((agent) => {
    const battleSkillGain = battleReport.agentSkillUpdates[agent.id]
    assertDefined(battleSkillGain)

    const isTerminated = agent.hitPoints <= 0
    if (!isTerminated) {
      updateSurvivingAgent(agent, battleReport)
    } else {
      agent.state = 'Terminated'
      agent.assignment = 'KIA'
    }
  })
}

function updateSurvivingAgent(agent: Agent, battleReport: BattleReport): void {
  // ----------------------------------------
  // Update exhaustion
  // ----------------------------------------

  // Apply mission conclusion exhaustion
  agent.exhaustion += AGENT_EXHAUSTION_RECOVERY_PER_TURN

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
  } else {
    agent.assignment = 'Standby'
  }
}
