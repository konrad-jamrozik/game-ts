import { toF2 } from '../fixed2'

export const AGENT_UPKEEP_COST = 5
export const AGENT_CONTRACTING_INCOME = AGENT_UPKEEP_COST * 3
export const AGENT_ESPIONAGE_INTEL = 5
export const AGENT_HIRE_COST = 50

export const AGENT_INITIAL_SKILL = toF2(100)
export const AGENT_INITIAL_EXHAUSTION = 0
export const AGENT_INITIAL_HIT_POINTS = 30

// First 5 points of exhaustion have no impact
export const NO_IMPACT_EXHAUSTION = 5

export const AGENT_EXHAUSTION_INCREASE_PER_TURN = 1
export const AGENT_EXHAUSTION_INCREASE_PER_ATTACK = 1
export const AGENT_EXHAUSTION_INCREASE_PER_DEFENSE = 1
export const AGENT_EXHAUSTION_RECOVERY_PER_TURN = 5

export const AGENT_RECOVERY_TURNS_FACTOR = 2

export const AGENT_CAP = 20
export const TRANSPORT_CAP = 6
export const TRAINING_CAP = 0
export const TRAINING_SKILL_GAIN = toF2(1)

// 100, 130, 155, 175, 190, 205
export const MISSION_SURVIVAL_SKILL_GAIN = [toF2(30), toF2(25), toF2(20), toF2(15)]
export const AGENT_SUCCESSFUL_ATTACK_SKILL_REWARD = toF2(4)
export const AGENT_FAILED_ATTACK_SKILL_REWARD = toF2(2)
export const AGENT_SUCCESSFUL_DEFENSE_SKILL_REWARD = toF2(2)
export const AGENT_FAILED_DEFENSE_SKILL_REWARD = toF2(1)

export const SUPPRESSION_DECAY_PCT = 10

// Weapon damage ranges are +/- 50% of base damage
export const WEAPON_DAMAGE_RANGE_FACTOR = 0.5

// Agent weapon stats
export const AGENT_INITIAL_WEAPON_DAMAGE = 10

// Precision of 0.01%. 10_000 = 100%
export const BPS_PRECISION = 10_000

// When agents' total effective skill is less than this threshold, they will retreat.
export const RETREAT_THRESHOLD = 0.5
// Retreat also occurs when enemy effective skill is at least this percentage of agents' current effective skill.
export const RETREAT_ENEMY_SKILL_THRESHOLD = 0.8

// Intel decay constants (in basis points)
// So if 1 intel = 1%, and 5 intel decays by 0.5% or 0.025, rounded up (see calculateIntelDecayRounded),
// to 1, it decays by 1 from 5 to 4, resulting in 4% success chance.
// (without rounding, it would be 4.97%).
export const INTEL_DECAY = 10 // 0.1% decay per intel point
export const MAX_INTEL_DECAY = 5000 // hard cap on decay: 50%
