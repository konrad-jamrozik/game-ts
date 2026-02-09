import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { buyUpgrade, reset as gameStateReset } from './gameStateSlice'

// KJA2 move this to web/src/lib so that I can introduce utils on top of it akin to gameState Utils,
// e,g, for hasUnfulfilledDesiredPurchaseGoal (this function already exists but only in tests)
export type BasicIntellectState = {
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

export const { loadState: loadAiState } = aiStateSlice.actions

export default aiStateSlice.reducer
