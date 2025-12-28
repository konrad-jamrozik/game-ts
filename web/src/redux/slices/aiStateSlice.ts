import { createSlice } from '@reduxjs/toolkit'
import { AGENT_CAP, TRAINING_CAP, TRANSPORT_CAP } from '../../lib/data_tables/constants'
import { initialGameState } from '../../lib/factories/gameStateFactory'
import { reset as resetGameState } from './gameStateSlice'

export type BasicIntellectState = {
  desiredAgentCount: number
  desiredAgentCap: number
  desiredTransportCap: number
  desiredTrainingCap: number
  // Upgrade counts (number of upgrades bought/to buy)
  desiredWeaponDamageUpgrades: number
  desiredTrainingSkillGainUpgrades: number
  desiredExhaustionRecoveryUpgrades: number
  desiredHitPointsRecoveryUpgrades: number
  // Actual upgrade counts (number of upgrades bought so far)
  actualWeaponDamageUpgrades: number
  actualTrainingSkillGainUpgrades: number
  actualExhaustionRecoveryUpgrades: number
  actualHitPointsRecoveryUpgrades: number
}

function createInitialState(): BasicIntellectState {
  return {
    desiredAgentCount: initialGameState.agents.length,
    desiredAgentCap: AGENT_CAP,
    desiredTransportCap: TRANSPORT_CAP,
    desiredTrainingCap: TRAINING_CAP,
    desiredWeaponDamageUpgrades: 0,
    desiredTrainingSkillGainUpgrades: 0,
    desiredExhaustionRecoveryUpgrades: 0,
    desiredHitPointsRecoveryUpgrades: 0,
    actualWeaponDamageUpgrades: 0,
    actualTrainingSkillGainUpgrades: 0,
    actualExhaustionRecoveryUpgrades: 0,
    actualHitPointsRecoveryUpgrades: 0,
  }
}

const aiStateSlice = createSlice({
  name: 'aiState',
  initialState: createInitialState(),
  reducers: {
    incrementActualWeaponDamageUpgrades(state) {
      state.actualWeaponDamageUpgrades += 1
    },
    incrementActualTrainingSkillGainUpgrades(state) {
      state.actualTrainingSkillGainUpgrades += 1
    },
    incrementActualExhaustionRecoveryUpgrades(state) {
      state.actualExhaustionRecoveryUpgrades += 1
    },
    incrementActualHitPointsRecoveryUpgrades(state) {
      state.actualHitPointsRecoveryUpgrades += 1
    },
    increaseDesiredCounts(state) {
      increaseSomeDesiredCount(state)
    },
    reset(state) {
      const initialState = createInitialState()
      Object.assign(state, initialState)
      increaseSomeDesiredCount(state)
    },
  },
  extraReducers: (builder) => {
    // Also reset AI state when game state is reset
    // KJA3 should this be made in cleaner way like gameControlsReducers.ts / reset ?
    builder.addCase(resetGameState, (state) => {
      const initialState = createInitialState()
      Object.assign(state, initialState)
      increaseSomeDesiredCount(state)
    })
  },
})

function increaseSomeDesiredCount(state: BasicIntellectState): void {
  // Priority picks (deterministic, checked first)
  const targetTransportCap = Math.ceil(state.desiredAgentCount * 0.5)
  if (state.desiredTransportCap < targetTransportCap) {
    state.desiredTransportCap += 1
    return
  }

  const targetTrainingCap = Math.ceil(state.desiredAgentCount * 0.5)
  if (state.desiredTrainingCap < targetTrainingCap) {
    state.desiredTrainingCap += 1
    return
  }

  // Calculate sum of all purchased upgrades (excluding caps)
  const sumTotalAllAlreadyPurchasedUpgraded =
    state.actualWeaponDamageUpgrades +
    state.actualTrainingSkillGainUpgrades +
    state.actualExhaustionRecoveryUpgrades +
    state.actualHitPointsRecoveryUpgrades

  // Always roll for desiredAgentCount if condition is met
  if (state.desiredAgentCount <= 8 + sumTotalAllAlreadyPurchasedUpgraded * 2) {
    increaseDesiredAgentCount(state)
    return
  }

  // Weighted random (if no priority pick and condition not met)
  // Agents: 50%, Weapon damage: 12.5%, Training skill gain: 12.5%,
  // Exhaustion recovery: 12.5%, Hit points recovery: 12.5%
  const random = Math.random()

  if (random < 0.5) {
    increaseDesiredAgentCount(state)
    return
  }

  if (random < 0.625) {
    state.desiredWeaponDamageUpgrades += 1
    return
  }

  if (random < 0.75) {
    state.desiredTrainingSkillGainUpgrades += 1
    return
  }

  if (random < 0.875) {
    state.desiredExhaustionRecoveryUpgrades += 1
    return
  }

  state.desiredHitPointsRecoveryUpgrades += 1
}

function increaseDesiredAgentCount(state: BasicIntellectState): void {
  // Special case: if at cap, increase agent cap instead
  if (state.desiredAgentCount === state.desiredAgentCap) {
    state.desiredAgentCap += 1
    return
  }
  state.desiredAgentCount += 1
}

export const {
  incrementActualWeaponDamageUpgrades,
  incrementActualTrainingSkillGainUpgrades,
  incrementActualExhaustionRecoveryUpgrades,
  incrementActualHitPointsRecoveryUpgrades,
  increaseDesiredCounts,
  reset: resetAiState,
} = aiStateSlice.actions

export default aiStateSlice.reducer
