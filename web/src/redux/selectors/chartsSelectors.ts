import type { RootReducerState } from '../rootReducer'
import type { GameState } from '../../lib/model/gameStateModel'
import type { BattleOutcome } from '../../lib/model/outcomeTypes'
import type { Agent } from '../../lib/model/agentModel'
import { effectiveSkill } from '../../lib/ruleset/skillRuleset'
import { getRemainingRecoveryTurns } from '../../lib/ruleset/recoveryRuleset'
import { f6c0, toF } from '../../lib/primitives/fixed6'
import { getContractingIncome, getAgentUpkeep } from '../../lib/ruleset/moneyRuleset'

export type ChartsDatasets = {
  assets: AssetsDatasetRow[]
  agentSkill: AgentSkillDatasetRow[]
  agentReadiness: AgentReadinessDatasetRow[]
  missions: MissionsDatasetRow[]
  battleStats: BattleStatsDatasetRow[]
  situationReport: SituationReportDatasetRow[]
}

export type AssetsDatasetRow = {
  turn: number
  agentCount: number
  funding: number
  money: number
  contracting: number
  upkeep: number
  rewards: number
}

export type AgentSkillDatasetRow = {
  turn: number
  maxEffectiveSkillMin: number
  maxEffectiveSkillAvg: number
  maxEffectiveSkillMedian: number
  maxEffectiveSkillP90: number
  maxEffectiveSkillSum: number
  currentEffectiveSkillSum: number
}

export type AgentReadinessDatasetRow = {
  turn: number
  maxHitPointsAvg: number
  maxHitPointsMax: number
  hitPointsAvg: number
  hitPointsMax: number
  exhaustionAvg: number
  exhaustionMax: number
  recoveryTurnsAvg: number
  recoveryTurnsMax: number
}

export type MissionsDatasetRow = {
  turn: number
  spawned: number
  expired: number
  won: number
  retreated: number
  wiped: number
}

export type BattleStatsDatasetRow = {
  turn: number
  agentsDeployed: number
  agentsKia: number
  agentsWounded: number
  agentsUnscathed: number
  enemiesKia: number
}

export type SituationReportDatasetRow = {
  turn: number
  panicPct: number
}

export function selectChartsDatasets(state: RootReducerState): ChartsDatasets {
  const statesByTurn = selectTurnSnapshotsForCharts(state)

  const missionIds = new Set<string>()
  const expiredMissionIds = new Set<string>()
  const wonMissionIds = new Set<string>()
  const retreatedMissionIds = new Set<string>()
  const wipedMissionIds = new Set<string>()

  const processedBattleMissionIds = new Set<string>()
  let agentsDeployed = 0
  let agentsKia = 0
  let agentsWounded = 0
  let agentsUnscathed = 0
  let enemiesKia = 0

  const assets: AssetsDatasetRow[] = []
  const agentSkill: AgentSkillDatasetRow[] = []
  const agentReadiness: AgentReadinessDatasetRow[] = []
  const missions: MissionsDatasetRow[] = []
  const battleStats: BattleStatsDatasetRow[] = []
  const situationReport: SituationReportDatasetRow[] = []

  for (const gameState of statesByTurn) {
    const { turn, agents, funding, money, panic, turnStartReport } = gameState

    // Get rewards from turn report (per-turn, not cumulative)
    const turnRewards = turnStartReport?.assets.moneyBreakdown.missionRewards ?? 0

    // --- Asset totals (direct from state)
    assets.push({
      turn,
      agentCount: agents.length,
      funding,
      money,
      contracting: getContractingIncome(gameState),
      upkeep: getAgentUpkeep(gameState),
      rewards: turnRewards,
    })

    // --- Agent skill (derived)
    agentSkill.push(bldAgentSkillRow(gameState))

    // --- Agent readiness (derived)
    agentReadiness.push(bldAgentReadinessRow(gameState))

    // --- Missions + battle stats (cumulative over mission lifecycle, derived from state + turn reports)
    const missionBattleDeltas = updateMissionAndBattleAccumulators({
      gameState,
      missionIds,
      expiredMissionIds,
      wonMissionIds,
      retreatedMissionIds,
      wipedMissionIds,
      processedBattleMissionIds,
    })

    agentsDeployed += missionBattleDeltas.agentsDeployed
    agentsKia += missionBattleDeltas.agentsTerminated
    agentsWounded += missionBattleDeltas.agentsWounded
    agentsUnscathed += missionBattleDeltas.agentsUnscathed
    enemiesKia += missionBattleDeltas.enemiesTerminated

    missions.push({
      turn,
      spawned: missionIds.size,
      expired: expiredMissionIds.size,
      won: wonMissionIds.size,
      retreated: retreatedMissionIds.size,
      wiped: wipedMissionIds.size,
    })

    battleStats.push({
      turn,
      agentsDeployed,
      agentsKia,
      agentsWounded,
      agentsUnscathed,
      enemiesKia,
    })

    // --- Situation report (direct from state)
    situationReport.push({
      turn,
      panicPct: toF(panic) * 100,
    })
  }

  return { assets, agentSkill, agentReadiness, missions, battleStats, situationReport }
}

function selectTurnSnapshotsForCharts(state: RootReducerState): GameState[] {
  const allSnapshotsInOrder: GameState[] = [
    ...state.undoable.past.map((s) => s.gameState),
    state.undoable.present.gameState,
  ]

  // Keep the last snapshot for each turn (this avoids duplicate x-axis points).
  const byTurn = new Map<number, GameState>()
  for (const snapshot of allSnapshotsInOrder) {
    byTurn.set(snapshot.turn, snapshot)
  }

  const turnsAscending = [...byTurn.keys()].toSorted((a, b) => a - b)
  return turnsAscending.map((turn) => byTurn.get(turn)).filter((x) => x !== undefined)
}

function bldAgentSkillRow(gameState: GameState): AgentSkillDatasetRow {
  const agents = gameState.agents
  const maxEffSkills = agents.map((agent) => getMaxEffectiveSkill(agent))
  const currentEffSkills = agents.map((agent) => toF(effectiveSkill(agent)))

  const maxEffStats = getSummaryStats(maxEffSkills)

  const currentEffectiveSkillSum = sumNumbers(currentEffSkills)

  return {
    turn: gameState.turn,
    maxEffectiveSkillMin: maxEffStats.min,
    maxEffectiveSkillAvg: maxEffStats.avg,
    maxEffectiveSkillMedian: maxEffStats.median,
    maxEffectiveSkillP90: maxEffStats.p90,
    maxEffectiveSkillSum: maxEffStats.sum,
    currentEffectiveSkillSum,
  }
}

function bldAgentReadinessRow(gameState: GameState): AgentReadinessDatasetRow {
  const agents = gameState.agents

  const maxHitPoints = agents.map((agent) => toF(agent.maxHitPoints))
  const hitPoints = agents.map((agent) => toF(agent.hitPoints))
  const exhaustion = agents.map((agent) => toF(agent.exhaustionPct))
  const recoveryTurns = agents.map((agent) => getRemainingRecoveryTurns(agent, gameState.hitPointsRecoveryPct))

  return {
    turn: gameState.turn,
    maxHitPointsAvg: avgNumbers(maxHitPoints),
    maxHitPointsMax: maxNumbers(maxHitPoints),
    hitPointsAvg: avgNumbers(hitPoints),
    hitPointsMax: maxNumbers(hitPoints),
    exhaustionAvg: avgNumbers(exhaustion),
    exhaustionMax: maxNumbers(exhaustion),
    recoveryTurnsAvg: avgNumbers(recoveryTurns),
    recoveryTurnsMax: maxNumbers(recoveryTurns),
  }
}

function updateMissionAndBattleAccumulators(args: {
  gameState: GameState
  missionIds: Set<string>
  expiredMissionIds: Set<string>
  wonMissionIds: Set<string>
  retreatedMissionIds: Set<string>
  wipedMissionIds: Set<string>
  processedBattleMissionIds: Set<string>
}): {
  agentsDeployed: number
  agentsTerminated: number
  agentsWounded: number
  agentsUnscathed: number
  enemiesTerminated: number
} {
  const {
    gameState,
    missionIds,
    expiredMissionIds,
    wonMissionIds,
    retreatedMissionIds,
    wipedMissionIds,
    processedBattleMissionIds,
  } = args

  const deltas = {
    agentsDeployed: 0,
    agentsTerminated: 0,
    agentsWounded: 0,
    agentsUnscathed: 0,
    enemiesTerminated: 0,
  }

  for (const mission of gameState.missions) {
    missionIds.add(mission.id)
  }

  const report = gameState.turnStartReport
  if (!report) {
    return deltas
  }

  for (const expired of report.expiredMissions) {
    const id = normalizeMissionId(expired.missionId)
    if (id !== undefined) {
      missionIds.add(id)
      expiredMissionIds.add(id)
    }
  }

  for (const mission of report.missions) {
    const id = normalizeMissionId(mission.missionId)
    if (id !== undefined) {
      missionIds.add(id)

      applyBattleOutcomeToSets(mission.outcome, id, {
        wonMissionIds,
        retreatedMissionIds,
        wipedMissionIds,
      })

      if (!processedBattleMissionIds.has(id)) {
        processedBattleMissionIds.add(id)
        deltas.agentsDeployed += mission.battleStats.agentsDeployed
        deltas.agentsTerminated += mission.battleStats.agentsTerminated
        deltas.agentsWounded += mission.battleStats.agentsWounded
        deltas.agentsUnscathed += mission.battleStats.agentsUnscathed
        deltas.enemiesTerminated += mission.battleStats.enemiesTerminated
      }
    }
  }

  return deltas
}

function applyBattleOutcomeToSets(
  outcome: BattleOutcome,
  missionId: string,
  sets: {
    wonMissionIds: Set<string>
    retreatedMissionIds: Set<string>
    wipedMissionIds: Set<string>
  },
): void {
  if (outcome === 'Won') {
    sets.wonMissionIds.add(missionId)
    return
  }
  if (outcome === 'Retreated') {
    sets.retreatedMissionIds.add(missionId)
    return
  }
  sets.wipedMissionIds.add(missionId)
}

function getMaxEffectiveSkill(agent: Agent): number {
  return toF(effectiveSkill({ ...agent, hitPoints: agent.maxHitPoints, exhaustionPct: f6c0 }))
}

function getSummaryStats(values: readonly number[]): {
  min: number
  avg: number
  median: number
  p90: number
  sum: number
} {
  if (values.length === 0) {
    return { min: 0, avg: 0, median: 0, p90: 0, sum: 0 }
  }

  const sorted = [...values].toSorted((a, b) => a - b)
  const sum = sumNumbers(sorted)
  return {
    min: sorted[0] ?? 0,
    avg: sum / sorted.length,
    median: quantileSorted(sorted, 0.5),
    p90: quantileSorted(sorted, 0.9),
    sum,
  }
}

function normalizeMissionId(value: string): string | undefined {
  if (value === '') {
    return undefined
  }
  if (!value.startsWith('mission-')) {
    return undefined
  }
  return value
}

function quantileSorted(sortedAscending: readonly number[], q: number): number {
  if (sortedAscending.length === 0) {
    return 0
  }
  if (sortedAscending.length === 1) {
    return sortedAscending[0] ?? 0
  }

  const clampedQ = Math.min(1, Math.max(0, q))
  const pos = (sortedAscending.length - 1) * clampedQ
  const lower = Math.floor(pos)
  const upper = Math.ceil(pos)
  const weight = pos - lower

  const lowerVal = sortedAscending[lower] ?? 0
  const upperVal = sortedAscending[upper] ?? lowerVal
  return lowerVal + (upperVal - lowerVal) * weight
}

function sumNumbers(values: readonly number[]): number {
  let acc = 0
  for (const value of values) {
    acc += value
  }
  return acc
}

function avgNumbers(values: readonly number[]): number {
  if (values.length === 0) {
    return 0
  }
  return sumNumbers(values) / values.length
}

function maxNumbers(values: readonly number[]): number {
  if (values.length === 0) {
    return 0
  }
  let max = values[0] ?? 0
  for (const value of values) {
    if (value > max) {
      max = value
    }
  }
  return max
}
