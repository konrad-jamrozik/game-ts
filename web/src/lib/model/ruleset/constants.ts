import { toF6 } from '../../primitives/fixed6Primitives'

export const AGENT_UPKEEP_COST = 5
export const AGENT_CONTRACTING_INCOME = AGENT_UPKEEP_COST * 3
export const AGENT_ESPIONAGE_INTEL = 5
export const AGENT_HIRE_COST = 50

export const AGENT_INITIAL_SKILL = toF6(100)
export const AGENT_INITIAL_EXHAUSTION = 0
export const AGENT_INITIAL_HIT_POINTS = 30

// First 5 points of exhaustion have no impact
export const NO_IMPACT_EXHAUSTION = 5

export const AGENT_EXHAUSTION_INCREASE_PER_TURN = 1
export const AGENT_EXHAUSTION_INCREASE_PER_ATTACK = 1
export const AGENT_EXHAUSTION_INCREASE_PER_DEFENSE = 1
export const AGENT_EXHAUSTION_RECOVERY_PER_TURN = 5

export const AGENT_HIT_POINTS_RECOVERY_PCT = 2

export const AGENT_CAP = 20
export const TRANSPORT_CAP = 6
export const TRAINING_CAP = 0
export const TRAINING_SKILL_GAIN = toF6(1)

// 100, 130, 155, 175, 190, 205
export const MISSION_SURVIVAL_SKILL_GAIN = [toF6(30), toF6(25), toF6(20), toF6(15)]
export const AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD = toF6(4)
export const AGENT_FAILED_ATTACK_SKILL_REWARD = toF6(2)
export const AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD = toF6(2)
export const AGENT_FAILED_DEFENSE_SKILL_REWARD = toF6(1)

export const SUPPRESSION_DECAY = 0.1

// Weapon damage ranges are +/- 50% of base damage
export const WEAPON_DAMAGE_RANGE_FACTOR = 0.5

// Agent weapon stats
export const AGENT_INITIAL_WEAPON_DAMAGE = 10

// When agents' total effective skill is less than this threshold, they will retreat.
export const AGENTS_SKILL_RETREAT_THRESHOLD = 0.5
// Retreat also occurs when enemy effective skill is at least this percentage of agents' current effective skill.
export const RETREAT_ENEMY_TO_AGENTS_SKILL_THRESHOLD = 0.8

/** The total accumulated lead intel decays by this amount per 1 accumulated intel.
 * Refer to getLeadIntelDecayPct and its test for examples.
 */
export const LEAD_INTEL_DECAY_PER_ONE_INTEL = 0.001 // 0.1% decay per intel point
/**
 * The maximum amount of intel that can be lost through decay.
 * This cap exists to prevent intel decaying too fast, see comment on getLeadIntelDecayPct.
 */
export const MAX_INTEL_DECAY = 0.5
