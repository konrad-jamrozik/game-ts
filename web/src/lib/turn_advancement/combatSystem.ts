import {
  AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD,
  AGENT_FAILED_ATTACK_SKILL_REWARD,
  AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD,
  AGENT_FAILED_DEFENSE_SKILL_REWARD,
  AGENT_EXHAUSTION_INCREASE_PER_ATTACK,
  AGENT_EXHAUSTION_INCREASE_PER_DEFENSE,
} from '../model/ruleset/constants'
import { rollContest } from './Roll'
import { rollWeaponDamage } from '../utils/weaponUtils'
import type { Weapon } from '../model/model'

export type CombatParticipant = {
  id: string
  type: 'agent' | 'enemy'
  skill: number
  effectiveSkill: number
  hitPoints: number
  maxHitPoints: number
  weapon: Weapon
  exhaustion: number
  skillGained: number
  isTerminated: boolean
}

export type CombatReport = {
  rounds: number
  agentsCasualties: number
  enemiesCasualties: number
  retreated: boolean
  agentSkillUpdates: Record<string, number>
}

export function conductMissionSiteBattle(agents: CombatParticipant[], enemies: CombatParticipant[]): CombatReport {
  let rounds = 0
  let retreated = false
  const agentSkillUpdates: Record<string, number> = {}

  // Battle continues until one side is eliminated or agents retreat
  while (!shouldBattleEnd(agents, enemies)) {
    rounds += 1
    console.log(`\n⚔️ Combat Round ${rounds}`)

    // Execute combat round
    executeCombatRound(agents, enemies)

    // Check for retreat condition
    if (shouldRetreat(agents)) {
      console.log('🏃 Agent mission commander orders retreat!')
      retreated = true
      break
    }
  }

  // Count casualties
  const agentsCasualties = agents.filter((agent) => agent.isTerminated).length
  const enemiesCasualties = enemies.filter((enemy) => enemy.isTerminated).length

  // Collect skill updates
  agents.forEach((agent) => {
    if (agent.skillGained > 0) {
      agentSkillUpdates[agent.id] = agent.skillGained
    }
  })

  console.log(`\n📊 Battle concluded after ${rounds} rounds`)
  console.log(`   Agent casualties: ${agentsCasualties}`)
  console.log(`   Enemy casualties: ${enemiesCasualties}`)

  return {
    rounds,
    agentsCasualties,
    enemiesCasualties,
    retreated,
    agentSkillUpdates,
  }
}

function shouldBattleEnd(agents: CombatParticipant[], enemies: CombatParticipant[]): boolean {
  const allAgentsTerminated = agents.every((agent) => agent.isTerminated)
  const allEnemiesTerminated = enemies.every((enemy) => enemy.isTerminated)
  return allAgentsTerminated || allEnemiesTerminated
}

function shouldRetreat(agents: CombatParticipant[]): boolean {
  const totalOriginalSkill = agents.reduce((sum, agent) => sum + agent.skill, 0)
  const totalCurrentEffectiveSkill = agents
    .filter((agent) => !agent.isTerminated)
    .reduce((sum, agent) => sum + agent.effectiveSkill, 0)

  return totalCurrentEffectiveSkill < totalOriginalSkill * 0.5
}

function executeCombatRound(agents: CombatParticipant[], enemies: CombatParticipant[]): void {
  // Agents attack in order of least skilled to most skilled
  const activeAgents = agents.filter((agent) => !agent.isTerminated)
  activeAgents.sort((agentA, agentB) => {
    if (agentA.skill === agentB.skill) return agentA.id.localeCompare(agentB.id)
    return agentA.skill - agentB.skill
  })

  // Each agent attacks
  for (const agent of activeAgents) {
    // Skip if terminated during this round
    if (!agent.isTerminated) {
      const target = selectTarget(enemies.filter((enemy) => !enemy.isTerminated))
      if (target) {
        executeAttack(agent, target)
      }
    }
  }

  // Enemies attack back
  const activeEnemies = enemies.filter((enemy) => !enemy.isTerminated)
  activeEnemies.sort((enemyA, enemyB) => {
    if (enemyA.skill === enemyB.skill) return enemyA.id.localeCompare(enemyB.id)
    return enemyA.skill - enemyB.skill
  })

  for (const enemy of activeEnemies) {
    // Skip if terminated during this round
    if (!enemy.isTerminated) {
      const target = selectTarget(agents.filter((agent) => !agent.isTerminated))
      if (target) {
        executeAttack(enemy, target)
      }
    }
  }
}

function selectTarget(potentialTargets: CombatParticipant[]): CombatParticipant | undefined {
  if (potentialTargets.length === 0) return undefined

  // Target the unit with lowest effective skill
  const sorted = [...potentialTargets].sort((targetA, targetB) => {
    if (targetA.effectiveSkill === targetB.effectiveSkill) return targetA.id.localeCompare(targetB.id)
    return targetA.effectiveSkill - targetB.effectiveSkill
  })

  return sorted[0]
}

function executeAttack(attacker: CombatParticipant, defender: CombatParticipant): void {
  // Contest roll
  const contestResult = rollContest(attacker.effectiveSkill, defender.effectiveSkill)

  // Apply exhaustion
  attacker.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_ATTACK
  if (attacker.type === 'agent') {
    attacker.effectiveSkill = Math.max(1, attacker.skill - attacker.exhaustion)
  }

  if (contestResult.success) {
    // Successful attack - roll damage
    const damage = rollWeaponDamage(attacker.weapon)
    defender.hitPoints = Math.max(0, defender.hitPoints - damage)

    // Update skill gains
    if (attacker.type === 'agent') {
      attacker.skillGained += AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD
    }
    if (defender.type === 'agent') {
      defender.skillGained += AGENT_FAILED_DEFENSE_SKILL_REWARD
    }

    // Check if defender is terminated
    if (defender.hitPoints <= 0) {
      defender.isTerminated = true
      console.log(
        `💀 ${attacker.type} ${attacker.id} terminates ${defender.type} ${defender.id} with ${damage} damage!`,
      )
    } else {
      console.log(
        `🩸 ${attacker.type} ${attacker.id} hits ${defender.type} ${defender.id} for ${damage} damage (${defender.hitPoints}/${defender.maxHitPoints} HP remaining)`,
      )
    }

    // Apply defender exhaustion only if not terminated
    if (!defender.isTerminated) {
      defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
      if (defender.type === 'agent') {
        defender.effectiveSkill = Math.max(1, defender.skill - defender.exhaustion)
      }
    }
  } else {
    // Failed attack
    console.log(`❌ ${attacker.type} ${attacker.id} misses ${defender.type} ${defender.id}`)

    // Update skill gains
    if (attacker.type === 'agent') {
      attacker.skillGained += AGENT_FAILED_ATTACK_SKILL_REWARD
    }
    if (defender.type === 'agent') {
      defender.skillGained += AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD
    }

    // Apply defender exhaustion
    defender.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_DEFENSE
    if (defender.type === 'agent') {
      defender.effectiveSkill = Math.max(1, defender.skill - defender.exhaustion)
    }
  }
}
