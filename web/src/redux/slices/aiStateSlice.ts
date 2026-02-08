import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { initialGameState } from '../../lib/factories/gameStateFactory'
import { buyUpgrade, reset as gameStateReset } from './gameStateSlice'

export type DesiredCountName =
  | 'agentCount'
  | 'agentCapUpgrades'
  | 'transportCapUpgrades'
  | 'trainingCapUpgrades'
  | 'weaponDamageUpgrades'
  | 'trainingSkillGainUpgrades'
  | 'exhaustionRecoveryUpgrades'
  | 'hitPointsRecoveryUpgrades'
  | 'hitPointsUpgrades'

// KJA move this to web/src/lib so that I can introduce utils on top of it akin to gameState Utils,
// e,g, for hasUnfulfilledDesiredPurchaseGoal (this function already exists but only in tests)
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
  desiredHitPointsUpgrades: number
  // Actual cap upgrade counts (number of upgrades bought so far)
  actualAgentCapUpgrades: number
  actualTransportCapUpgrades: number
  actualTrainingCapUpgrades: number
  // Actual upgrade counts (number of upgrades bought so far)
  actualWeaponDamageUpgrades: number
  actualTrainingSkillGainUpgrades: number
  actualExhaustionRecoveryUpgrades: number
  actualHitPointsRecoveryUpgrades: number
  actualHitPointsUpgrades: number
}

export function createInitialAiState(): BasicIntellectState {
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
    desiredHitPointsUpgrades: 0,
    actualAgentCapUpgrades: 0,
    actualTransportCapUpgrades: 0,
    actualTrainingCapUpgrades: 0,
    actualWeaponDamageUpgrades: 0,
    actualTrainingSkillGainUpgrades: 0,
    actualExhaustionRecoveryUpgrades: 0,
    actualHitPointsRecoveryUpgrades: 0,
    actualHitPointsUpgrades: 0,
  }
}

function createInitialState(): BasicIntellectState {
  return createInitialAiState()
}

const aiStateSlice = createSlice({
  name: 'aiState',
  initialState: createInitialState(),
  reducers: {
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
    incrementDesiredHitPointsUpgrades(state) {
      state.desiredHitPointsUpgrades += 1
    },
    loadState(state, action: PayloadAction<BasicIntellectState>) {
      Object.assign(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(buyUpgrade, (state, action) => {
      const upgradeName = action.payload
      switch (upgradeName) {
        case 'Agent cap':
          state.actualAgentCapUpgrades += 1
          break
        case 'Transport cap':
          state.actualTransportCapUpgrades += 1
          break
        case 'Training cap':
          state.actualTrainingCapUpgrades += 1
          break
        case 'Weapon damage':
          state.actualWeaponDamageUpgrades += 1
          break
        case 'Training skill gain':
          state.actualTrainingSkillGainUpgrades += 1
          break
        case 'Exhaustion recovery %':
          state.actualExhaustionRecoveryUpgrades += 1
          break
        case 'Hit points recovery %':
          state.actualHitPointsRecoveryUpgrades += 1
          break
        case 'Hit points':
          state.actualHitPointsUpgrades += 1
          break
      }
    })
    builder.addCase(gameStateReset, (state) => {
      const initialState = createInitialState()
      Object.assign(state, initialState)
    })
  },
})

export const {
  incrementDesiredAgentCount,
  incrementDesiredAgentCapUpgrades,
  incrementDesiredTransportCapUpgrades,
  incrementDesiredTrainingCapUpgrades,
  incrementDesiredWeaponDamageUpgrades,
  incrementDesiredTrainingSkillGainUpgrades,
  incrementDesiredExhaustionRecoveryUpgrades,
  incrementDesiredHitPointsRecoveryUpgrades,
  incrementDesiredHitPointsUpgrades,
  loadState: loadAiState,
} = aiStateSlice.actions

export default aiStateSlice.reducer
