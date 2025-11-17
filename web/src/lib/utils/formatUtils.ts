import pluralize from 'pluralize'
import type { MissionSiteId } from '../model/model'
import { isBps, type Bps } from '../model/bps'
import type { ValueChange } from '../model/turnReportModel'
import type { RollResult } from '../turn_advancement/rolls'
import { div } from './mathUtils'

export function str(value: unknown): string {
  if (isBps(value)) {
    return addPctSignDiv100Dec2(value)
  }
  if (typeof value === 'number' && value % 1 !== 0) {
    return fmtDec2(value)
  }
  return String(value)
}

/**
 * @returns The value, divided by 100, formatted as percentage with 2 decimal places.
 * For example, 12345 will be formatted as "123.45%"
 */
export function addPctSignDiv100Dec2(value: Bps): string {
  return addPctSignDiv100(value.value, 2)
}

/**
 * @returns The value, multiple  by 100, formatted as percentage with 2 decimal places.
 * For example, 0.12345 will be formatted as "12.34%"
 */
export function addPctSignMult100Dec2(value: number): string {
  return addPctSign(value * 100, 2)
}

export function addPctSignDiv100(value: number, decimals: number): string {
  return addPctSign(value, decimals, 100)
}

export function addPctSignDec2(value: number): string {
  return addPctSign(value, 2, 1)
}

/**
 * Formats a number to 2 decimal places.
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places (e.g., "3.67")
 */
export function fmtDec2(value: number): string {
  return value.toFixed(2)
}

export function addPctSign(value: number, decimals = 0, denominator = 1): string {
  return `${div(value, denominator).toFixed(decimals)}%`
}

export function fmtDec1(value: number): string {
  return value.toFixed(1)
}

/**
 * Formats string by removing common prefixes
 */
export function fmtNoPrefix(id: string, prefix: string): string {
  return id.replace(new RegExp(`^${prefix}`, 'u'), '')
}

/**
 * Formats mission site target for display (removes '-site-' patterns)
 */
export function fmtMissionTarget(missionSiteId: MissionSiteId | undefined): string {
  if (missionSiteId === undefined) {
    return 'mission ?'
  }
  const displayId = missionSiteId.replaceAll('-site-', ' ')
  return ` on ${displayId}`
}

export function fmtAgentCount(count: number): string {
  return `${count} ${pluralize('agent', count)}`
}

/**
 * Formats a value change as "previous → current"
 * @param change - The value change to format
 * @returns Formatted string in the format "previous → current"
 */
export function fmtValueChange<TNumber extends number | Bps = number>(change: ValueChange<TNumber>): string {
  return `${str(change.previous)} → ${str(change.current)}`
}

/**
 * Formats roll result information
 * @param rollResult - The roll result
 * @returns Formatted string in the format "[roll% vs threshold% threshold]"
 */
export function fmtRollResult(rollResult: RollResult): string {
  const icon = rollResult.success ? '✅' : '❌'
  const relation = rollResult.success ? '> ' : '<='
  return `[${icon} roll ${addPctSignDec2(rollResult.rollPct)} is ${relation} ${addPctSignDec2(rollResult.failureProbabilityPct)} threshold]`
}

export type AttackLogKind =
  | 'agent misses'
  | 'agent hits'
  | 'agent terminates'
  | 'enemy misses'
  | 'enemy hits'
  | 'enemy terminates'

export type AttackLogParams = {
  kind: AttackLogKind
  attackerName: string
  attackerEffectiveSkill: number
  defenderName: string
  defenderEffectiveSkill: number
  defenderIsAgent: boolean
  rollResultStr: string
  damageInfo?: { damage: number; damagePct: string }
  hpRemainingInfo?: { current: number; max: number; percentage: string }
}

/**
 * Formats attack log message for console output
 * @param params - Attack log parameters
 * @returns Formatted attack log message
 */
export function fmtAttackLog(params: AttackLogParams): string {
  const {
    kind,
    attackerName,
    attackerEffectiveSkill,
    defenderName,
    defenderEffectiveSkill,
    defenderIsAgent,
    rollResultStr,
    damageInfo,
    hpRemainingInfo,
  } = params

  const attackerIsAgent = kind.startsWith('agent')
  const attackerIcon = attackerIsAgent ? '👤' : '👺'
  const defenderIcon = defenderIsAgent ? '👤' : '👺'

  let emoji = '➖'
  let actionVerb = 'misses'

  if (kind.includes('terminates')) {
    emoji = '☠️'
    actionVerb = 'terminates'
  } else if (kind.includes('hits')) {
    emoji = '🩸'
    actionVerb = 'hits'
  }

  const attackerPart = `${attackerIcon} ${attackerName} (${attackerEffectiveSkill})`
  const defenderPart = `${defenderIcon} ${defenderName} (${defenderEffectiveSkill})`

  let message = `${emoji} ${attackerPart} ${actionVerb} ${defenderPart}`

  if (damageInfo) {
    const preposition = actionVerb === 'terminates' ? 'with' : 'for'
    message += ` ${preposition} ${damageInfo.damage} (${damageInfo.damagePct}) damage`
  }

  message += ` ${rollResultStr}`

  if (hpRemainingInfo) {
    message += ` (${hpRemainingInfo.current}/${hpRemainingInfo.max} (${hpRemainingInfo.percentage}%) HP remaining)`
  }

  return message
}
