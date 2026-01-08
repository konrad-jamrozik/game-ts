import type { RootReducerState } from '../rootReducer'
import type { GameState } from '../../lib/model/gameStateModel'
import type { BattleOutcome } from '../../lib/model/outcomeTypes'
import { getContractingIncome, getAgentUpkeep } from '../../lib/ruleset/moneyRuleset'

export type ChartsDatasets = {
  assets: AssetsDatasetRow[]
  missions: MissionsDatasetRow[]
  missionsOutcome: MissionsOutcomeDatasetRow[]
  balanceSheet: BalanceSheetDatasetRow[]
}

export type AssetsDatasetRow = {
  turn: number
  agentCount: number
  agentCap: number
  transportCap: number
  trainingCap: number
  funding: number
  money: number
  contracting: number
  upkeep: number
  rewards: number
  expenditures: number
}

export type MissionsDatasetRow = {
  turn: number
  spawned: number
  expired: number
  won: number
  retreated: number
  wiped: number
}

export type MissionsOutcomeDatasetRow = {
  turn: number
  offensiveWon: number
  offensiveLost: number
  offensiveExpired: number
  defensiveWon: number
  defensiveLost: number
  defensiveExpired: number
  discovered: number
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

  const offensiveWonMissionIds = new Set<string>()
  const offensiveLostMissionIds = new Set<string>()
  const offensiveExpiredMissionIds = new Set<string>()
  const defensiveWonMissionIds = new Set<string>()
  const defensiveLostMissionIds = new Set<string>()
  const defensiveExpiredMissionIds = new Set<string>()

  const assets: AssetsDatasetRow[] = []
  const missions: MissionsDatasetRow[] = []
  const missionsOutcome: MissionsOutcomeDatasetRow[] = []
  const balanceSheet: BalanceSheetDatasetRow[] = []

  for (const gameState of statesByTurn) {
    const { turn, agents, funding, money, turnStartReport } = gameState

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
      agentCap: gameState.agentCap,
      transportCap: gameState.transportCap,
      trainingCap: gameState.trainingCap,
      funding,
      money,
      contracting: getContractingIncome(gameState),
      upkeep: getAgentUpkeep(gameState),
      rewards: turnRewards,
      expenditures,
    })

    // --- Missions (cumulative over mission lifecycle, derived from state + turn reports)
    updateMissionAccumulators({
      gameState,
      missionIds,
      expiredMissionIds,
      wonMissionIds,
      retreatedMissionIds,
      wipedMissionIds,
      offensiveWonMissionIds,
      offensiveLostMissionIds,
      offensiveExpiredMissionIds,
      defensiveWonMissionIds,
      defensiveLostMissionIds,
      defensiveExpiredMissionIds,
    })

    missions.push({
      turn,
      spawned: missionIds.size,
      expired: expiredMissionIds.size,
      won: wonMissionIds.size,
      retreated: retreatedMissionIds.size,
      wiped: wipedMissionIds.size,
    })

    missionsOutcome.push({
      turn,
      offensiveWon: offensiveWonMissionIds.size,
      offensiveLost: offensiveLostMissionIds.size,
      offensiveExpired: offensiveExpiredMissionIds.size,
      defensiveWon: defensiveWonMissionIds.size,
      defensiveLost: defensiveLostMissionIds.size,
      defensiveExpired: defensiveExpiredMissionIds.size,
      discovered: missionIds.size,
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
    missions,
    missionsOutcome,
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

function updateMissionAccumulators(args: {
  gameState: GameState
  missionIds: Set<string>
  expiredMissionIds: Set<string>
  wonMissionIds: Set<string>
  retreatedMissionIds: Set<string>
  wipedMissionIds: Set<string>
  offensiveWonMissionIds: Set<string>
  offensiveLostMissionIds: Set<string>
  offensiveExpiredMissionIds: Set<string>
  defensiveWonMissionIds: Set<string>
  defensiveLostMissionIds: Set<string>
  defensiveExpiredMissionIds: Set<string>
}): void {
  const {
    gameState,
    missionIds,
    expiredMissionIds,
    wonMissionIds,
    retreatedMissionIds,
    wipedMissionIds,
    offensiveWonMissionIds,
    offensiveLostMissionIds,
    offensiveExpiredMissionIds,
    defensiveWonMissionIds,
    defensiveLostMissionIds,
    defensiveExpiredMissionIds,
  } = args

  for (const mission of gameState.missions) {
    missionIds.add(mission.id)
  }

  const report = gameState.turnStartReport
  if (!report) {
    return
  }

  for (const expired of report.expiredMissions) {
    const id = normalizeMissionId(expired.missionId)
    if (id !== undefined) {
      missionIds.add(id)
      expiredMissionIds.add(id)
      // Classify by offensive/defensive
      const mission = gameState.missions.find((m) => m.id === id)
      if (mission !== undefined) {
        if (mission.operationLevel === undefined) {
          offensiveExpiredMissionIds.add(id)
        } else {
          defensiveExpiredMissionIds.add(id)
        }
      }
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

      // Classify by offensive/defensive
      const missionData = gameState.missions.find((m) => m.id === id)
      const isOffensive = missionData?.operationLevel === undefined
      applyBattleOutcomeToOutcomeSets(mission.outcome, id, isOffensive, {
        offensiveWonMissionIds,
        offensiveLostMissionIds,
        defensiveWonMissionIds,
        defensiveLostMissionIds,
      })
    }
  }
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

function applyBattleOutcomeToOutcomeSets(
  outcome: BattleOutcome,
  missionId: string,
  isOffensive: boolean,
  sets: {
    offensiveWonMissionIds: Set<string>
    offensiveLostMissionIds: Set<string>
    defensiveWonMissionIds: Set<string>
    defensiveLostMissionIds: Set<string>
  },
): void {
  if (outcome === 'Won') {
    if (isOffensive) {
      sets.offensiveWonMissionIds.add(missionId)
    } else {
      sets.defensiveWonMissionIds.add(missionId)
    }
    return
  }
  // Lost includes both Retreated and Wiped
  if (isOffensive) {
    sets.offensiveLostMissionIds.add(missionId)
  } else {
    sets.defensiveLostMissionIds.add(missionId)
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
