// Constants for computeMinimumRequiredSavings function
export const REQUIRED_TURNS_OF_SAVINGS = 5

// Constants for canDeployMissionWithCurrentResources function
export const MAX_ENEMIES_PER_AGENT = 3
export const TARGET_COMBAT_RATING_MULTIPLIER = 1.2

// Constants for assignToContracting and assignToContractingWithPriority functions
export const TARGET_UPKEEP_CONTRACTING_COVERAGE_MULTIPLIER = 1.2
export const MAX_READY_URGENT_EXHAUSTION_PCT = 25

// Constants for assignToLeadInvestigation function
export const NON_REPEATABLE_LEAD_DIFFICULTY_DIVISOR = 8

// Constants for selectNextBestReadyAgents function
export const MAX_READY_EXHAUSTION_PCT = 5
export const AGENT_RESERVE_PCT = 0.2

// Constants for manageAgents function
export const MAX_EXHAUSTION_ALLOWED_ON_ASSIGNMENT = 30

// Constants for decideSomeDesiredCount function
export const TRANSPORT_CAP_RATIO = 0.25
export const TRAINING_CAP_RATIO = 0.3
export const AGENT_COUNT_BASE = 8
export const AGENT_HIRING_PURCHASED_UPGRADES_MULTIPLIER = 3

// Maximum caps for AI desires - AI will stop desiring more than these values
export const MAX_DESIRED_WEAPON_DAMAGE = 80
export const MAX_DESIRED_AGENT_COUNT = 1000
export const MAX_DESIRED_TRANSPORT_CAP = 1000
export const MAX_DESIRED_TRAINING_CAP = 1000
export const MAX_DESIRED_EXHAUSTION_RECOVERY_PCT = 50
export const MAX_DESIRED_HIT_POINTS_RECOVERY_PCT = 50
