import type { RollResult } from '../turn_advancement/rolls'
import { addPctSignDec2, fmtInt } from './formatUtils'

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
  attackCount: number
  damageInfo?: { damage: number; damagePct: string }
  hpRemainingInfo?: { current: number; max: number; percentage: string }
}

/**
 * Formats attack log message for console output.
 */
export function fmtAttackLog(params: AttackLogParams): string {
  const {
    kind,
    attackerName,
    attackerEffectiveSkill,
    defenderName,
    defenderEffectiveSkill,
    defenderIsAgent,
    rollResult,
    attackCount,
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
  const attackCountStr = buildAttackCountStr(attackCount)
  const damageStr = buildDamageStr(damageInfo, attackVerb)
  const rollResultStr = buildRollResultStr(rollResult)
  const hpStr = buildHpStr(hpRemainingInfo)

  return `${basicInfoStr}${attackCountStr}${damageStr}${rollResultStr}${hpStr}`
}

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
  // KJA problem: there are many numbers displayed now that are now decimals, so they all need fmtDec2 or fmtInt.
  // This is because they were derived from Fixed2 with f2AsFloat so now they are just number
  // and the info that they are in fact float is lost on them.
  const actorEffectiveSkillStr = `(${fmtInt(actorEffectiveSkill)})`.padStart(5)
  const actorNameStr = actorIsAgent ? actorName : actorName.padEnd(22)
  return `${actorIcon} ${actorNameStr} ${actorEffectiveSkillStr}`
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

function buildAttackCountStr(attackCount: number): string {
  const attackCountStr = `${attackCount}`.padStart(2)
  return ` [AC: ${attackCountStr}] `
}

function buildHpStr(hpRemainingInfo: { current: number; max: number; percentage: string } | undefined): string {
  if (!hpRemainingInfo) {
    return ''
  }
  const hpRatio = `${String(hpRemainingInfo.current).padStart(3)} / ${String(hpRemainingInfo.max).padStart(3)}`
  const hpPercentage = `(${hpRemainingInfo.percentage})`.padStart(6)
  const hpRemainingPhrase = 'HP remaining)'
  return ` ( ${hpRatio} ${hpPercentage} ${hpRemainingPhrase}`
}
