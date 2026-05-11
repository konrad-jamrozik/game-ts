import { columnWidths } from './columnWidths'
import theme, { CARD_CONTENT_PADDING } from '../styling/theme'

const CHECKMARK_COLUMN_WIDTH = 50
const BORDER_WIDTH = 1
const PADDING_WIDTH = 8
const MUI_DATA_GRID_COLUMN_FILLER = 19
const DATA_GRID_BASE_WIDTH = 2 * BORDER_WIDTH + 2 * PADDING_WIDTH + MUI_DATA_GRID_COLUMN_FILLER
const OPERATIONS_DATA_GRID_BASE_WIDTH = 10

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

export const LEADS_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH +
  columnWidths['leads.lead'] +
  columnWidths['leads.difficulty'] +
  columnWidths['leads.repeatable'] +
  columnWidths['leads.investigation'] +
  columnWidths['leads.investigation_id'] +
  columnWidths['leads.agents'] +
  columnWidths['leads.progress'] +
  columnWidths['leads.projected'] +
  columnWidths['leads.efficiency'] +
  columnWidths['leads.success_chance'] +
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

const OPERATIONS_AGENTS_MINI_GRID_WIDTH =
  OPERATIONS_DATA_GRID_BASE_WIDTH + columnWidths['operations_agents.name'] + columnWidths['operations_agents.value']

const OPERATIONS_FINANCES_MINI_GRID_WIDTH =
  OPERATIONS_DATA_GRID_BASE_WIDTH + columnWidths['operations_finances.name'] + columnWidths['operations_finances.value']

export const AGENTS_AND_FINANCES_ROW_GRID_WIDTH =
  OPERATIONS_AGENTS_MINI_GRID_WIDTH + OPERATIONS_FINANCES_MINI_GRID_WIDTH + 16

export const CAPACITIES_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH + columnWidths['capacities.name'] + columnWidths['capacities.value']

const OPERATIONS_LEADS_SUMMARY_GRID_WIDTH =
  OPERATIONS_DATA_GRID_BASE_WIDTH +
  columnWidths['operations_leads_summary.metric'] +
  columnWidths['operations_leads_summary.count']

const OPERATIONS_MISSIONS_SUMMARY_GRID_WIDTH =
  OPERATIONS_DATA_GRID_BASE_WIDTH +
  columnWidths['operations_missions_summary.metric'] +
  columnWidths['operations_missions_summary.count']

const OPERATIONS_CAPACITIES_MINI_GRID_WIDTH =
  OPERATIONS_DATA_GRID_BASE_WIDTH + columnWidths['capacities.name'] + columnWidths['capacities.value']

/** Matches ExpandableCard CardContent `padding: CARD_CONTENT_PADDING` on every side. */
const EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX = 2 * Number.parseFloat(theme.spacing(CARD_CONTENT_PADDING))

// Matches OperationsCard layout: left Stack (Agents, Capacities) | gap | right Stack (Finances, summaries).
// Capacities sits below Agents, not in a third horizontal column — do not add its width again across the row.
const OPERATIONS_INNER_COLUMNS_GAP_PX = 16

export const OPERATIONS_CARD_WIDTH =
  EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX +
  Math.max(OPERATIONS_AGENTS_MINI_GRID_WIDTH, OPERATIONS_CAPACITIES_MINI_GRID_WIDTH) +
  OPERATIONS_INNER_COLUMNS_GAP_PX +
  Math.max(
    OPERATIONS_FINANCES_MINI_GRID_WIDTH,
    OPERATIONS_LEADS_SUMMARY_GRID_WIDTH,
    OPERATIONS_MISSIONS_SUMMARY_GRID_WIDTH,
  )

export const SITUATION_REPORT_PANIC_DATA_GRID_WIDTH =
  DATA_GRID_BASE_WIDTH + columnWidths['situation_report.metric'] + columnWidths['situation_report.value']

export const SITUATION_REPORT_FACTION_DATA_GRID_WIDTH = SITUATION_REPORT_PANIC_DATA_GRID_WIDTH

/** Matches StyledDataGrid body width (`OPERATIONS_DATA_GRID_BASE_WIDTH` + situation_report columns). */
export const SITUATION_REPORT_STYLED_DATA_GRID_WIDTH =
  OPERATIONS_DATA_GRID_BASE_WIDTH + columnWidths['situation_report.metric'] + columnWidths['situation_report.value']

/** ExpandableCard width: grid body + horizontal CardContent inset from ExpandableCard. */
export const SITUATION_REPORT_EXPANDABLE_CARD_WIDTH =
  EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX + SITUATION_REPORT_STYLED_DATA_GRID_WIDTH

// ========================================
// Card widths
// ========================================

export const LEFT_COLUMN_CARD_WIDTH = 480

export const CONTROLS_COLUMN_CARD_WIDTH = 300

export const MIDDLE_COLUMN_CARD_WIDTH = Math.max(
  MISSIONS_DATA_GRID_WIDTH,
  LEADS_DATA_GRID_WIDTH,
  AGENTS_DEFAULT_VIEW_DATA_GRID_WIDTH,
  AGENTS_TERMINATED_VIEW_DATA_GRID_WIDTH,
)

/** Max layout width driven by Agents+Finances row vs Capacities DataGrid on Resources / upgrades column */
export const AGENTS_FINANCES_OR_CAPACITIES_MAX_GRID_WIDTH = Math.max(
  AGENTS_AND_FINANCES_ROW_GRID_WIDTH,
  CAPACITIES_DATA_GRID_WIDTH,
)

export const SITUATION_REPORT_CARD_WIDTH = SITUATION_REPORT_EXPANDABLE_CARD_WIDTH

export const TURN_REPORT_CARD_WIDTH = Math.max(600)

export const RIGHT_COLUMN_CARD_WIDTH = Math.max(
  OPERATIONS_CARD_WIDTH,
  AGENTS_FINANCES_OR_CAPACITIES_MAX_GRID_WIDTH,
  SITUATION_REPORT_CARD_WIDTH,
  TURN_REPORT_CARD_WIDTH,
)

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
