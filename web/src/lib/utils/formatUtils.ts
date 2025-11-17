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
  rollResult: RollResult
  damageInfo?: { damage: number; damagePct: string }
  hpRemainingInfo?: { current: number; max: number; percentage: string }
}

/**
 * Formats attack log message for console output
 *
 * Example outputs for agents attacking enemies:
 *
 * ➖ 👤 agent-023 (294) misses     👺 enemy-commander-32     (242)                       [❌ roll  22.09% is <=  40.39% threshold]
 * 🩸 👤 agent-013 (291) hits       👺 enemy-commander-32     (240)  for  5  (50%) damage [✅ roll  52.47% is >   40.49% threshold] (35/40 (88%) HP remaining)
 * 🩸 👤 agent-021 (244) hits       👺 enemy-highcommander-33  (72)  for  6  (60%) damage [✅ roll  45.35% is >    8.01% threshold] ( 4/50  (8%) HP remaining)
 * ☠️ 👤 agent-031 (244) terminates 👺 enemy-highcommander-33  (28) with  6  (60%) damage [✅ roll   1.96% is >    1.30% threshold]
 *
 * Example outputs for enemies attacking agents:
 *
 * ☠️ 👺 enemy-highcommander-33 (400) terminates 👤 agent-010 (220) with 44 (147%) damage [✅ roll  31.38% is >   23.23% threshold]
 * ➖ 👺 enemy-commander-32      (18) misses     👤 agent-029  (47)                       [❌ roll   3.97% is <=  87.21% threshold]
 */
function buildAttackResultIcon(kind: AttackLogKind): string {
  if (kind.includes('terminates')) return '☠️'
  if (kind.includes('hits')) return '🩸'
  return '➖'
}

function buildAttackVerb(kind: AttackLogKind): string {
  if (kind.includes('terminates')) return 'terminates'
  if (kind.includes('hits')) return 'hits      '
  return 'misses    '
}

function buildActorInfoPart(
  actorIsAgent: boolean,
  actorIcon: string,
  actorName: string,
  actorEffectiveSkill: number,
): string {
  const actorEffectiveSkillStr = `(${actorEffectiveSkill})`.padStart(5)
  const actorNameStr = actorIsAgent ? actorName : actorName.padEnd(22)
  return `${actorIcon} ${actorNameStr} ${actorEffectiveSkillStr}`
}

export function fmtAttackLog(params: AttackLogParams): string {
  const {
    kind,
    attackerName,
    attackerEffectiveSkill,
    defenderName,
    defenderEffectiveSkill,
    defenderIsAgent,
    rollResult,
    damageInfo,
    hpRemainingInfo,
  } = params

  const { basicInfoStr, attackVerb } = buildBasicInfoStr(
    kind,
    attackerName,
    attackerEffectiveSkill,
    defenderName,
    defenderEffectiveSkill,
    defenderIsAgent,
  )
  const damageStr = buildDamageStr(damageInfo, attackVerb)
  const rollResultStr = buildRollResultStr(rollResult)
  const hpStr = buildHpStr(hpRemainingInfo)

  return `${basicInfoStr}${damageStr}${rollResultStr}${hpStr}`
}

function buildBasicInfoStr(
  kind: AttackLogKind,
  attackerName: string,
  attackerEffectiveSkill: number,
  defenderName: string,
  defenderEffectiveSkill: number,
  defenderIsAgent: boolean,
): { basicInfoStr: string; attackVerb: string } {
  const attackerIsAgent = kind.startsWith('agent')
  const attackerIcon = attackerIsAgent ? '👤' : '👺'
  const defenderIcon = defenderIsAgent ? '👤' : '👺'

  const attackResultIcon = buildAttackResultIcon(kind)
  const attackVerb = buildAttackVerb(kind)
  const attackerPart = buildActorInfoPart(attackerIsAgent, attackerIcon, attackerName, attackerEffectiveSkill)
  const defenderPart = buildActorInfoPart(!attackerIsAgent, defenderIcon, defenderName, defenderEffectiveSkill)

  const basicInfoStr = `${attackResultIcon} ${attackerPart} ${attackVerb} ${defenderPart}`
  return { basicInfoStr, attackVerb }
}

function buildDamageStr(damageInfo: { damage: number; damagePct: string } | undefined, attackVerb: string): string {
  if (!damageInfo) {
    return '                       '
  }
  const damagePreposition = attackVerb === 'terminates' ? 'with' : 'for '
  const attackDamage = String(damageInfo.damage).padStart(2)
  const weaponRangePct = `(${damageInfo.damagePct})`.padStart(6)
  return ` ${damagePreposition} ${attackDamage} ${weaponRangePct} damage `
}

function buildRollResultStr(rollResult: RollResult): string {
  const rollResultIcon = rollResult.success ? '✅' : '❌'
  const rollPercentage = addPctSignDec2(rollResult.rollPct).padStart(7)
  const rollRelation = rollResult.success ? '> ' : '<='
  const thresholdPercentage = addPctSignDec2(rollResult.failureProbabilityPct).padStart(7)
  return `[${rollResultIcon} roll ${rollPercentage} is ${rollRelation} ${thresholdPercentage} threshold]`
}

function buildHpStr(hpRemainingInfo: { current: number; max: number; percentage: string } | undefined): string {
  if (!hpRemainingInfo) {
    return ''
  }
  const hpOpeningParen = ' ('
  const currMaxHp = ` ${String(hpRemainingInfo.current).padStart(3)} / ${String(hpRemainingInfo.max).padStart(3)}`
  const hpPercentage = `(${hpRemainingInfo.percentage})`.padStart(5)
  const hpRemainingPhrase = 'HP remaining)'
  return `${hpOpeningParen}${currMaxHp} ${hpPercentage} ${hpRemainingPhrase}`
}
