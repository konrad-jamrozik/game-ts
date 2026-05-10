import { columnWidths } from './columnWidths'

const CHECKMARK_COLUMN_WIDTH = 50
const BORDER_WIDTH = 1
const PADDING_WIDTH = 8
const MUI_DATA_GRID_COLUMN_FILLER = 19
const DATA_GRID_BASE_WIDTH = 2 * BORDER_WIDTH + 2 * PADDING_WIDTH + MUI_DATA_GRID_COLUMN_FILLER

export const MISSIONS_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['missions.id'] +
  columnWidths['missions.combat_rating'] +
  columnWidths['missions.state'] +
  columnWidths['missions.expires_in'] +
  // columnWidths['missions.enemies'] +
  // columnWidths['missions.avg_skill'] +
  columnWidths['missions.details'] +
  CHECKMARK_COLUMN_WIDTH

export const LEADS_SCREEN_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['leads_screen.lead'] +
  columnWidths['leads_screen.difficulty'] +
  columnWidths['leads_screen.repeatable'] +
  columnWidths['leads_screen.investigation'] +
  columnWidths['leads_screen.investigation_id'] +
  columnWidths['leads_screen.agents'] +
  columnWidths['leads_screen.progress'] +
  columnWidths['leads_screen.projected'] +
  columnWidths['leads_screen.efficiency'] +
  columnWidths['leads_screen.success_chance'] +
  CHECKMARK_COLUMN_WIDTH

export const AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['agents.id'] +
  columnWidths['agents.state'] +
  columnWidths['agents.assignment'] +
  columnWidths['agents.skill'] +
  columnWidths['agents.exhaustionPct'] +
  CHECKMARK_COLUMN_WIDTH

export const AGENTS_TERMINATED_VIEW_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['agents.id'] +
  columnWidths['agents.skill_simple'] +
  columnWidths['agents.hit_points_max'] +
  columnWidths['agents.service'] +
  columnWidths['agents.missions_total'] +
  columnWidths['agents.mission'] +
  columnWidths['agents.by']

export const ASSETS_DATA_GRID_WIDTH = DATA_GRID_BASE_WIDTH + columnWidths['assets.name'] + columnWidths['assets.value']

export const CAPABILITIES_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH + columnWidths['capabilities.name'] + columnWidths['capabilities.value']

export const SITUATION_REPORT_PANIC_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH + columnWidths['situation_report.metric'] + columnWidths['situation_report.value']

export const SITUATION_REPORT_FACTION_DATA_GRID_WIDTH = SITUATION_REPORT_PANIC_DATA_GRID_WIDTH

// ========================================
// Card widths
// ========================================

export const LEFT_COLUMN_CARD_WIDTH = 480

export const CONTROLS_COLUMN_CARD_WIDTH = 300

export const MIDDLE_COLUMN_CARD_WIDTH = Math.max(
  MISSIONS_DATA_GRID_WIDTH,
  LEADS_SCREEN_DATA_GRID_WIDTH,
  AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH,
  AGENTS_TERMINATED_VIEW_DATA_GRID_WIDTH,
)

export const ASSETS_CARD_WIDTH = Math.max(ASSETS_DATA_GRID_WIDTH, CAPABILITIES_DATA_GRID_WIDTH)

export const SITUATION_REPORT_CARD_WIDTH = SITUATION_REPORT_PANIC_DATA_GRID_WIDTH

export const TURN_REPORT_CARD_WIDTH = Math.max(600)

export const RIGHT_COLUMN_CARD_WIDTH = Math.max(ASSETS_CARD_WIDTH, SITUATION_REPORT_CARD_WIDTH, TURN_REPORT_CARD_WIDTH)

export const COMBAT_LOG_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['combat_log.attack_id'] +
  columnWidths['combat_log.round_number'] +
  columnWidths['combat_log.agent_id'] +
  columnWidths['combat_log.enemy_id'] +
  columnWidths['combat_log.attacker_type'] +
  columnWidths['combat_log.effect'] +
  columnWidths['combat_log.attacker_skill'] +
  columnWidths['combat_log.defender_skill'] +
  columnWidths['combat_log.roll'] +
  columnWidths['combat_log.roll_diff'] +
  columnWidths['combat_log.damage'] +
  columnWidths['combat_log.defender_hp'] // borders + padding + filler + columns

export const BATTLE_LOG_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['battle_log.round_number'] +
  columnWidths['battle_log.agent_count'] +
  columnWidths['battle_log.agent_skill'] +
  columnWidths['battle_log.agent_hp'] +
  columnWidths['battle_log.enemy_count'] +
  columnWidths['battle_log.enemy_skill'] +
  columnWidths['battle_log.enemy_hp'] +
  columnWidths['battle_log.combat_rating_ratio'] // borders + padding + filler + columns

export const MISSION_DETAILS_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH + columnWidths['mission_details.key'] + columnWidths['mission_details.value'] // borders + padding + filler + columns
