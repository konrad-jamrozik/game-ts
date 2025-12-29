import { createSlice } from '@reduxjs/toolkit'
import { initialGameState } from '../../lib/factories/gameStateFactory'
import { reset as resetGameState } from './gameStateSlice'

export type DesiredCountName =
  | 'agentCount'
  | 'agentCapUpgrades'
  | 'transportCapUpgrades'
  | 'trainingCapUpgrades'
  | 'weaponDamageUpgrades'
  | 'trainingSkillGainUpgrades'
  | 'exhaustionRecoveryUpgrades'
  | 'hitPointsRecoveryUpgrades'

export type BasicIntellectState = {
  desiredAgentCount: number
  // Cap upgrade counts (number of upgrades bought/to buy)
  desiredAgentCapUpgrades: number
  desiredTransportCapUpgrades: number
  desiredTrainingCapUpgrades: number
  // Upgrade counts (number of upgrades bought/to buy)
  desiredWeaponDamageUpgrades: number
  desiredTrainingSkillGainUpgrades: number
  desiredExhaustionRecoveryUpgrades: number
  desiredHitPointsRecoveryUpgrades: number
  // Actual cap upgrade counts (number of upgrades bought so far)
  actualAgentCapUpgrades: number
  actualTransportCapUpgrades: number
  actualTrainingCapUpgrades: number
  // Actual upgrade counts (number of upgrades bought so far)
  actualWeaponDamageUpgrades: number
  actualTrainingSkillGainUpgrades: number
  actualExhaustionRecoveryUpgrades: number
  actualHitPointsRecoveryUpgrades: number
}

function createInitialState(): BasicIntellectState {
  return {
    // This is set to +1 to maintain the invariant that there is always at least one desired count above actual count.
    desiredAgentCount: initialGameState.agents.length + 1,
    desiredAgentCapUpgrades: 0,
    desiredTransportCapUpgrades: 0,
    desiredTrainingCapUpgrades: 0,
    desiredWeaponDamageUpgrades: 0,
    desiredTrainingSkillGainUpgrades: 0,
    desiredExhaustionRecoveryUpgrades: 0,
    desiredHitPointsRecoveryUpgrades: 0,
    actualAgentCapUpgrades: 0,
    actualTransportCapUpgrades: 0,
    actualTrainingCapUpgrades: 0,
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
    incrementActualAgentCapUpgrades(state) {
      state.actualAgentCapUpgrades += 1
    },
    incrementActualTransportCapUpgrades(state) {
      state.actualTransportCapUpgrades += 1
    },
    incrementActualTrainingCapUpgrades(state) {
      state.actualTrainingCapUpgrades += 1
    },
    incrementDesiredAgentCount(state) {
      state.desiredAgentCount += 1
    },
    incrementDesiredAgentCapUpgrades(state) {
      state.desiredAgentCapUpgrades += 1
    },
    incrementDesiredTransportCapUpgrades(state) {
      state.desiredTransportCapUpgrades += 1
    },
    incrementDesiredTrainingCapUpgrades(state) {
      state.desiredTrainingCapUpgrades += 1
    },
    incrementDesiredWeaponDamageUpgrades(state) {
      state.desiredWeaponDamageUpgrades += 1
    },
    incrementDesiredTrainingSkillGainUpgrades(state) {
      state.desiredTrainingSkillGainUpgrades += 1
    },
    incrementDesiredExhaustionRecoveryUpgrades(state) {
      state.desiredExhaustionRecoveryUpgrades += 1
    },
    incrementDesiredHitPointsRecoveryUpgrades(state) {
      state.desiredHitPointsRecoveryUpgrades += 1
    },
    reset(state) {
      const initialState = createInitialState()
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    // Also reset AI state when game state is reset
    // KJA3 should this be made in cleaner way like gameControlsReducers.ts / reset ?
    builder.addCase(resetGameState, (state) => {
      const initialState = createInitialState()
      Object.assign(state, initialState)
    })
  },
})

export const {
  incrementActualWeaponDamageUpgrades,
  incrementActualTrainingSkillGainUpgrades,
  incrementActualExhaustionRecoveryUpgrades,
  incrementActualHitPointsRecoveryUpgrades,
  incrementActualAgentCapUpgrades,
  incrementActualTransportCapUpgrades,
  incrementActualTrainingCapUpgrades,
  incrementDesiredAgentCount,
  incrementDesiredAgentCapUpgrades,
  incrementDesiredTransportCapUpgrades,
  incrementDesiredTrainingCapUpgrades,
  incrementDesiredWeaponDamageUpgrades,
  incrementDesiredTrainingSkillGainUpgrades,
  incrementDesiredExhaustionRecoveryUpgrades,
  incrementDesiredHitPointsRecoveryUpgrades,
  reset: resetAiState,
} = aiStateSlice.actions

export default aiStateSlice.reducer
