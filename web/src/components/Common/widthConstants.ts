import { columnWidths } from './columnWidths'

const CHECKMARK_COLUMN_WIDTH = 50
const BORDER_WIDTH = 1
const PADDING_WIDTH = 8
const MUI_DATA_GRID_COLUMN_FILLER = 19
const DATA_GRID_BASE_WIDTH = 2 * BORDER_WIDTH + 2 * PADDING_WIDTH + MUI_DATA_GRID_COLUMN_FILLER
export const EXPECTED_MISSIONS_COLUMN_WIDTH = 710
export const EXPECTED_LEADS_COLUMN_WIDTH = 620
export const EXPECTED_LEAD_INVESTIGATIONS_COLUMN_WIDTH = 670
export const EXPECTED_AGENTS_DEFAULT_VIEW_COLUMN_WIDTH = 640
export const EXPECTED_AGENTS_TERMINATED_VIEW_COLUMN_WIDTH = 720
export const EXPECTED_ASSETS_COLUMN_WIDTH = 380
export const EXPECTED_CAPABILITIES_COLUMN_WIDTH = 440
export const EXPECTED_SITUATION_REPORT_COLUMN_WIDTH = 350

export const LEFT_COLUMN_CARD_WIDTH = 380

export const MIDDLE_COLUMN_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  Math.max(
    EXPECTED_MISSIONS_COLUMN_WIDTH + CHECKMARK_COLUMN_WIDTH,
    EXPECTED_LEADS_COLUMN_WIDTH + CHECKMARK_COLUMN_WIDTH,
    EXPECTED_LEAD_INVESTIGATIONS_COLUMN_WIDTH + CHECKMARK_COLUMN_WIDTH,
    EXPECTED_AGENTS_DEFAULT_VIEW_COLUMN_WIDTH + CHECKMARK_COLUMN_WIDTH,
    EXPECTED_AGENTS_TERMINATED_VIEW_COLUMN_WIDTH,
  )

export const RIGHT_COLUMN_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  Math.max(
    EXPECTED_ASSETS_COLUMN_WIDTH,
    EXPECTED_CAPABILITIES_COLUMN_WIDTH + CHECKMARK_COLUMN_WIDTH,
    EXPECTED_SITUATION_REPORT_COLUMN_WIDTH,
  )

export const COMBAT_LOG_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['combat_log.attack_id'] +
  columnWidths['combat_log.round_number'] +
  columnWidths['combat_log.agent_id'] +
  columnWidths['combat_log.enemy_id'] +
  columnWidths['combat_log.attacker_type'] +
  columnWidths['combat_log.outcome'] +
  columnWidths['combat_log.attacker_skill'] +
  columnWidths['combat_log.defender_skill'] +
  columnWidths['combat_log.roll'] +
  columnWidths['combat_log.threshold'] +
  columnWidths['combat_log.damage'] +
  columnWidths['combat_log.defender_hp'] // borders + padding + filler + columns

export const BATTLE_LOG_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['battle_log.round_number'] +
  columnWidths['battle_log.status'] +
  columnWidths['battle_log.agent_count'] +
  columnWidths['battle_log.agent_skill'] +
  columnWidths['battle_log.agent_hp'] +
  columnWidths['battle_log.enemy_count'] +
  columnWidths['battle_log.enemy_skill'] +
  columnWidths['battle_log.enemy_hp'] +
  columnWidths['battle_log.skill_ratio'] // borders + padding + filler + columns

export const MISSION_SITE_DETAILS_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH + columnWidths['mission_site_details.key'] + columnWidths['mission_site_details.value'] // borders + padding + filler + columns
