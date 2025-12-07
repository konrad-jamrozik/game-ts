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
  columnWidths['combat_log.attack_id_width'] +
  columnWidths['combat_log.round_number_width'] +
  columnWidths['combat_log.agent_id_width'] +
  columnWidths['combat_log.enemy_id_width'] +
  columnWidths['combat_log.attacker_type_width'] +
  columnWidths['combat_log.outcome_width'] +
  columnWidths['combat_log.attacker_skill_width'] +
  columnWidths['combat_log.defender_skill_width'] +
  columnWidths['combat_log.roll_width'] +
  columnWidths['combat_log.threshold_width'] +
  columnWidths['combat_log.damage_width'] +
  columnWidths['combat_log.defender_hp_width'] // borders + padding + filler + columns

export const BATTLE_LOG_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['battle_log.round_number_width'] +
  columnWidths['battle_log.status_width'] +
  columnWidths['battle_log.agent_count_width'] +
  columnWidths['battle_log.agent_skill_width'] +
  columnWidths['battle_log.agent_hp_width'] +
  columnWidths['battle_log.enemy_count_width'] +
  columnWidths['battle_log.enemy_skill_width'] +
  columnWidths['battle_log.enemy_hp_width'] +
  columnWidths['battle_log.skill_ratio_width'] // borders + padding + filler + columns

export const MISSION_SITE_DETAILS_CARD_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['mission_site_details.key_width'] +
  columnWidths['mission_site_details.value_width'] // borders + padding + filler + columns
