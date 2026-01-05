import type { RootReducerState } from '../rootReducer'
import type { GameState } from '../../lib/model/gameStateModel'
import type { BattleOutcome } from '../../lib/model/outcomeTypes'
import type { Agent } from '../../lib/model/agentModel'
import { effectiveSkill } from '../../lib/ruleset/skillRuleset'
import { f6c0, toF } from '../../lib/primitives/fixed6'
import { quantileSorted } from '../../lib/primitives/mathPrimitives'
import { getContractingIncome, getAgentUpkeep } from '../../lib/ruleset/moneyRuleset'

export type ChartsDatasets = {
  assets: AssetsDatasetRow[]
  agentSkill: AgentSkillDatasetRow[]
  missions: MissionsDatasetRow[]
  battleStats: BattleStatsDatasetRow[]
  situationReport: SituationReportDatasetRow[]
  balanceSheet: BalanceSheetDatasetRow[]
}

export type AssetsDatasetRow = {
  turn: number
  agentCount: number
  funding: number
  money: number
  contracting: number
  upkeep: number
  rewards: number
  expenditures: number
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

export type BalanceSheetDatasetRow = {
  turn: number
  funding: number // positive
  contracting: number // positive
  rewards: number // positive
  upkeep: number // negative (stored as negative)
  agentHiring: number // negative (stored as negative)
  upgrades: number // negative (stored as negative)
  capIncreases: number // negative (stored as negative)
  netFlow: number // sum of all above (income - expenses)
}

export function selectChartsDatasets(state: RootReducerState): ChartsDatasets {
  const statesByTurn = selectTurnSnapshotsForCharts(state)
  const { firstByTurn, lastByTurn } = selectTurnSnapshotsWithFirst(state)

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
  const missions: MissionsDatasetRow[] = []
  const battleStats: BattleStatsDatasetRow[] = []
  const situationReport: SituationReportDatasetRow[] = []
  const balanceSheet: BalanceSheetDatasetRow[] = []

  for (const gameState of statesByTurn) {
    const { turn, agents, funding, money, panic, turnStartReport } = gameState

    // Get rewards from turn report (per-turn, not cumulative)
    const turnRewards = turnStartReport?.assets.moneyBreakdown.missionRewards ?? 0

    // Calculate expenditures: compare money at start vs end of turn
    // First snapshot of turn N: right after turn advancement from N-1 (includes income)
    // Last snapshot of turn N: right before turn advancement to N+1 (includes expenditures from player actions)
    // Expenditures = money at start of turn - money at end of turn
    const firstSnapshot = firstByTurn.get(turn)
    const lastSnapshot = lastByTurn.get(turn)
    let expenditures = 0
    if (firstSnapshot !== undefined && lastSnapshot !== undefined) {
      // Money decreases during player actions (hiring agents, buying upgrades)
      // So expenditures = firstSnapshot.money - lastSnapshot.money
      expenditures = Math.max(0, firstSnapshot.money - lastSnapshot.money)
    }

    // --- Asset totals (direct from state)
    assets.push({
      turn,
      agentCount: agents.length,
      funding,
      money,
      contracting: getContractingIncome(gameState),
      upkeep: getAgentUpkeep(gameState),
      rewards: turnRewards,
      expenditures,
    })

    // --- Agent skill (derived)
    agentSkill.push(bldAgentSkillRow(gameState))

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

    // --- Cash Flow (income and expenses per turn)
    const contractingIncome = getContractingIncome(gameState)
    const upkeepCost = getAgentUpkeep(gameState)
    const netFlow =
      gameState.funding +
      contractingIncome +
      turnRewards -
      upkeepCost -
      gameState.turnExpenditures.agentHiring -
      gameState.turnExpenditures.upgrades -
      gameState.turnExpenditures.capIncreases
    balanceSheet.push({
      turn,
      funding: gameState.funding,
      contracting: contractingIncome,
      rewards: turnRewards,
      upkeep: -upkeepCost, // negative
      agentHiring: -gameState.turnExpenditures.agentHiring, // negative
      upgrades: -gameState.turnExpenditures.upgrades, // negative
      capIncreases: -gameState.turnExpenditures.capIncreases, // negative
      netFlow,
    })
  }

  return {
    assets,
    agentSkill,
    missions,
    battleStats,
    situationReport,
    balanceSheet,
  }
}

export function selectTurnSnapshotsForCharts(state: RootReducerState): GameState[] {
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

function selectTurnSnapshotsWithFirst(state: RootReducerState): {
  firstByTurn: Map<number, GameState>
  lastByTurn: Map<number, GameState>
} {
  const allSnapshotsInOrder: GameState[] = [
    ...state.undoable.past.map((s) => s.gameState),
    state.undoable.present.gameState,
  ]

  // Keep the first and last snapshot for each turn
  const firstByTurn = new Map<number, GameState>()
  const lastByTurn = new Map<number, GameState>()

  for (const snapshot of allSnapshotsInOrder) {
    if (!firstByTurn.has(snapshot.turn)) {
      firstByTurn.set(snapshot.turn, snapshot)
    }
    lastByTurn.set(snapshot.turn, snapshot)
  }

  return { firstByTurn, lastByTurn }
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

function sumNumbers(values: readonly number[]): number {
  let acc = 0
  for (const value of values) {
    acc += value
  }
  return acc
}
