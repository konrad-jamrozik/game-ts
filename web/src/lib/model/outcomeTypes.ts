// ===== SHARED BATTLE/MISSION OUTCOMES =====

/**
 * How a battle or deployed mission ended.
 * - Won: Mission completed successfully, enemies defeated
 * - Retreated: Withdrew from battle before completion
 * - Wiped: All agents were terminated
 */
export type BattleOutcome = 'Won' | 'Retreated' | 'Wiped'

/**
 * Round-by-round battle status (includes ongoing battles).
 */
export type BattleStatus = 'Ongoing' | BattleOutcome

// ===== MISSION SITE LIFECYCLE =====

/**
 * Mission site phases before completion.
 */
export type MissionSitePhase = 'Active' | 'Deployed'

/**
 * Complete mission site state, combining phase and outcome.
 * - Active: Discovered but not engaged
 * - Deployed: Combat in progress
 * - Won: Mission completed successfully
 * - Retreated: Withdrew from mission
 * - Wiped: All agents lost
 * - Expired: Time ran out before deployment
 */
export type MissionSiteState = MissionSitePhase | BattleOutcome | 'Expired'

// ===== LEAD INVESTIGATION LIFECYCLE =====

/**
 * Lead investigation states.
 * - Active: Investigation ongoing
 * - Done: Investigation succeeded, mission sites created
 * - Abandoned: Player cancelled the investigation
 */
export type LeadInvestigationState = 'Active' | 'Done' | 'Abandoned'
