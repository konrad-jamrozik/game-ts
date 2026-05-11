import {
  type ColumnWidthKey,
  EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX,
  getDataGridCardWidthForColumnKeys,
  getDataGridWidthForColumnKeys,
  getHorizontalStackWidth,
  getSpacingPx,
} from './dataGridLayout'
import { CARD_GAP } from '../styling/spacing'

const CAPACITIES_READ_ONLY_COLUMN_KEYS = ['capacities.name', 'capacities.value'] satisfies readonly ColumnWidthKey[]

const CAPACITIES_SHOP_COLUMN_KEYS = [
  'capacities.name',
  'capacities.value',
  'capacities.upgrade',
  'capacities.price',
] satisfies readonly ColumnWidthKey[]

const SITUATION_REPORT_NEXT_OPERATIONS_COLUMN_KEYS = [
  'situation_report.next_operations.metric',
  'situation_report.next_operations.turns',
] satisfies readonly ColumnWidthKey[]

const SITUATION_REPORT_METRICS_COLUMN_KEYS = [
  'situation_report.metrics.metric',
  'situation_report.metrics.value',
] satisfies readonly ColumnWidthKey[]

const EVENT_LOG_COLUMN_KEYS = [
  'event_log.event',
  'event_log.turn',
  'event_log.actions_count',
  'event_log.undo',
] satisfies readonly ColumnWidthKey[]

const OPERATIONS_AGENTS_MINI_GRID_WIDTH = getDataGridWidthForColumnKeys([
  'operations_agents.name',
  'operations_agents.value',
] satisfies readonly ColumnWidthKey[])

const OPERATIONS_FINANCES_MINI_GRID_WIDTH = getDataGridWidthForColumnKeys([
  'operations_finances.name',
  'operations_finances.value',
] satisfies readonly ColumnWidthKey[])

const OPERATIONS_LEADS_SUMMARY_GRID_WIDTH = getDataGridWidthForColumnKeys([
  'operations_leads_summary.metric',
  'operations_leads_summary.count',
] satisfies readonly ColumnWidthKey[])

const OPERATIONS_MISSIONS_SUMMARY_GRID_WIDTH = getDataGridWidthForColumnKeys([
  'operations_missions_summary.metric',
  'operations_missions_summary.count',
] satisfies readonly ColumnWidthKey[])

const OPERATIONS_CAPACITIES_MINI_GRID_WIDTH = getDataGridWidthForColumnKeys(CAPACITIES_READ_ONLY_COLUMN_KEYS)

const SITUATION_REPORT_NEXT_OPERATIONS_GRID_WIDTH = getDataGridWidthForColumnKeys(
  SITUATION_REPORT_NEXT_OPERATIONS_COLUMN_KEYS,
)

const SITUATION_REPORT_METRICS_GRID_WIDTH = getDataGridWidthForColumnKeys(SITUATION_REPORT_METRICS_COLUMN_KEYS)

const OPERATIONS_INNER_COLUMNS_GAP_PX = getSpacingPx(CARD_GAP)

const OPERATIONS_SUMMARY_WIDTH = getHorizontalStackWidth(
  [
    Math.max(OPERATIONS_AGENTS_MINI_GRID_WIDTH, OPERATIONS_CAPACITIES_MINI_GRID_WIDTH),
    Math.max(
      OPERATIONS_FINANCES_MINI_GRID_WIDTH,
      OPERATIONS_LEADS_SUMMARY_GRID_WIDTH,
      OPERATIONS_MISSIONS_SUMMARY_GRID_WIDTH,
    ),
  ],
  OPERATIONS_INNER_COLUMNS_GAP_PX,
)

export const SITUATION_REPORT_EXPANDABLE_CARD_WIDTH =
  EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX +
  getHorizontalStackWidth(
    [SITUATION_REPORT_NEXT_OPERATIONS_GRID_WIDTH, SITUATION_REPORT_METRICS_GRID_WIDTH],
    OPERATIONS_INNER_COLUMNS_GAP_PX,
  )

export const OPERATIONS_CARD_WIDTH =
  EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX +
  Math.max(OPERATIONS_SUMMARY_WIDTH, SITUATION_REPORT_EXPANDABLE_CARD_WIDTH)

export const ASSETS_CARD_WIDTH =
  EXPANDABLE_CARD_CONTENT_HORIZONTAL_INSET_PX +
  getHorizontalStackWidth(
    [OPERATIONS_AGENTS_MINI_GRID_WIDTH, OPERATIONS_FINANCES_MINI_GRID_WIDTH],
    OPERATIONS_INNER_COLUMNS_GAP_PX,
  )

export const CAPACITIES_CARD_WIDTH = getDataGridCardWidthForColumnKeys(CAPACITIES_READ_ONLY_COLUMN_KEYS)

export const UPGRADES_CARD_WIDTH = getDataGridCardWidthForColumnKeys(CAPACITIES_SHOP_COLUMN_KEYS, {
  checkboxSelection: true,
})

export const EVENT_LOG_DATA_GRID_WIDTH = getDataGridWidthForColumnKeys(EVENT_LOG_COLUMN_KEYS)

export const CONTROLS_COLUMN_CARD_WIDTH = 300

export const SITUATION_REPORT_CARD_WIDTH = SITUATION_REPORT_EXPANDABLE_CARD_WIDTH

export const TURN_REPORT_CARD_WIDTH = 600

export const RIGHT_COLUMN_CARD_WIDTH = Math.max(
  OPERATIONS_CARD_WIDTH,
  ASSETS_CARD_WIDTH,
  CAPACITIES_CARD_WIDTH,
  UPGRADES_CARD_WIDTH,
  SITUATION_REPORT_CARD_WIDTH,
  TURN_REPORT_CARD_WIDTH,
)

export const COMBAT_LOG_CARD_WIDTH = getDataGridCardWidthForColumnKeys([
  'combat_log.attack_id',
  'combat_log.round_number',
  'combat_log.agent_id',
  'combat_log.enemy_id',
  'combat_log.attacker_type',
  'combat_log.effect',
  'combat_log.attacker_skill',
  'combat_log.defender_skill',
  'combat_log.roll',
  'combat_log.roll_diff',
  'combat_log.damage',
  'combat_log.defender_hp',
] satisfies readonly ColumnWidthKey[])

export const BATTLE_LOG_CARD_WIDTH = getDataGridCardWidthForColumnKeys([
  'battle_log.round_number',
  'battle_log.agent_count',
  'battle_log.agent_skill',
  'battle_log.agent_hp',
  'battle_log.enemy_count',
  'battle_log.enemy_skill',
  'battle_log.enemy_hp',
  'battle_log.combat_rating_ratio',
] satisfies readonly ColumnWidthKey[])

export const MISSION_DETAILS_CARD_WIDTH = getDataGridCardWidthForColumnKeys([
  'mission_details.key',
  'mission_details.value',
] satisfies readonly ColumnWidthKey[])
