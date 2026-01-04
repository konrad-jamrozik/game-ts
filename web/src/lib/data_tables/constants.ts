import { toF6 } from '../primitives/fixed6'

export const AGENT_UPKEEP_COST = 10
export const AGENT_CONTRACTING_INCOME = AGENT_UPKEEP_COST * 3
export const AGENT_HIRE_COST = 50

// Divisor used in skill-based value calculations. Each extra 100 effective skill adds 20% efficiency bonus.
export const AGENT_SKILL_VALUE_DIVISOR = 500

// First 5 points of exhaustion have no impact
export const NO_IMPACT_EXHAUSTION = toF6(5)

export const AGENT_EXHAUSTION_INCREASE_PER_TURN = toF6(1)
export const AGENT_EXHAUSTION_INCREASE_PER_ATTACK = toF6(1)
export const AGENT_EXHAUSTION_INCREASE_PER_DEFENSE = toF6(1)
export const AGENT_EXHAUSTION_RECOVERY_PER_TURN = toF6(5)
export const EXHAUSTION_PENALTY = toF6(5)

export const AGENT_HIT_POINTS_RECOVERY_PCT = toF6(2)

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

/**
 * Base suppression turns gained per mission reward level.
 * The actual suppression from missions is specified in mission rewards directly.
 */
export const BASE_SUPPRESSION_TURNS = 5

// Weapon damage ranges are +/- 50% of base damage
// See also `Weapon damage roll` in docs.
export const WEAPON_DAMAGE_RANGE_FACTOR = 0.5

// When agents' total combat rating is less than this threshold, they will retreat.
export const AGENTS_COMBAT_RATING_RETREAT_THRESHOLD = 0.5
// Retreat also occurs when enemy combat rating is at least this percentage of agents' current combat rating.
export const RETREAT_ENEMY_TO_AGENTS_COMBAT_RATING_THRESHOLD = 0.8
// Units with effective skill at or below this percentage of their base skill are incapacitated and cannot participate in battle.
export const COMBAT_INCAPACITATION_THRESHOLD = 0.1

// Lead investigation tuning constants
export const AGENT_LEAD_INVESTIGATION_INTEL = 10
export const LEAD_DIFFICULTY_MULTIPLIER = 100
export const LEAD_RESISTANCE_EXPONENT = 0.5
export const LEAD_SCALING_EXPONENT = 0.8
