// ===== SHARED BATTLE/MISSION OUTCOMES =====

/**
 * How a battle or deployed mission ended.
 * - Won: Mission completed successfully, enemies defeated
 * - Retreated: Withdrew from battle before completion
 * - Wiped: All agents were terminated
 */
export const BATTLE_OUTCOMES = ['Won', 'Retreated', 'Wiped'] as const
export type BattleOutcome = (typeof BATTLE_OUTCOMES)[number]

/**
 * Outcome of an individual attack during combat.
 * - Hit: Attack succeeded, defender took damage
 * - Miss: Attack failed, no damage dealt
 * - Incapacitated: Attack succeeded and defender's effective skill dropped to 10% or less of base skill
 * - KIA: Attack succeeded and defender's HP reached 0 or below
 */
export const ATTACK_OUTCOMES = ['Hit', 'Miss', 'Incapacitated', 'KIA'] as const
export type AttackOutcome = (typeof ATTACK_OUTCOMES)[number]

/**
 * Round-by-round battle status (includes ongoing battles).
 */
export type BattleStatus = 'Ongoing' | BattleOutcome

// ===== MISSION SITE LIFECYCLE =====

/**
 * Mission site phases before completion.
 */
export const MISSION_SITE_PHASES = ['Active', 'Deployed'] as const
export type MissionSitePhase = (typeof MISSION_SITE_PHASES)[number]

/**
 * Complete mission site state, combining phase and outcome.
 * - Active: Discovered but not engaged
 * - Deployed: Combat in progress
 * - Won: Mission completed successfully
 * - Retreated: Withdrew from mission
 * - Wiped: All agents lost
 * - Expired: Time ran out before deployment
 */
export const ALL_MISSION_SITE_STATES = [...MISSION_SITE_PHASES, ...BATTLE_OUTCOMES, 'Expired'] as const
export type MissionSiteState = (typeof ALL_MISSION_SITE_STATES)[number]

// ===== LEAD INVESTIGATION LIFECYCLE =====

/**
 * Lead investigation states.
 * - Active: Investigation ongoing
 * - Done: Investigation succeeded, mission sites created
 * - Abandoned: Player cancelled the investigation
 */
export const LEAD_INVESTIGATION_STATES = ['Active', 'Done', 'Abandoned'] as const
export type LeadInvestigationState = (typeof LEAD_INVESTIGATION_STATES)[number]
