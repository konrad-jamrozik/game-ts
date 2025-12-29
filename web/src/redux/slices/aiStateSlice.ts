import { createSlice } from '@reduxjs/toolkit'
import { AGENT_CAP, TRAINING_CAP, TRANSPORT_CAP } from '../../lib/data_tables/constants'
import { initialGameState } from '../../lib/factories/gameStateFactory'
import { reset as resetGameState } from './gameStateSlice'
import { ceil } from '../../lib/primitives/mathPrimitives'

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
  const state: BasicIntellectState = {
    desiredAgentCount: initialGameState.agents.length,
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
  // Increase desired counts once to match reset behavior
  increaseSomeDesiredCount(state)
  return state
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
    increaseDesiredCounts(state) {
      increaseSomeDesiredCount(state)
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

// KJA2 the logic for that should be in basic intellect; this should only mechanistically update
// relevant field, with no validation logic
function increaseSomeDesiredCount(state: BasicIntellectState): void {
  // Priority picks (deterministic, checked first)
  const targetTransportCap = ceil(state.desiredAgentCount * 0.25)
  // KJA2 these constants (for caps) should come from relevant upgrades data table
  const currentTransportCap = TRANSPORT_CAP + state.desiredTransportCapUpgrades * 2
  if (currentTransportCap < targetTransportCap) {
    state.desiredTransportCapUpgrades += 1
    return
  }

  const targetTrainingCap = ceil(state.desiredAgentCount * 0.3)
  const currentTrainingCap = TRAINING_CAP + state.desiredTrainingCapUpgrades * 4
  if (currentTrainingCap < targetTrainingCap) {
    state.desiredTrainingCapUpgrades += 1
    return
  }

  // Calculate sum of all purchased upgrades (including caps)
  const sumTotalAllAlreadyPurchasedUpgraded =
    state.actualAgentCapUpgrades +
    state.actualTransportCapUpgrades +
    state.actualTrainingCapUpgrades +
    state.actualWeaponDamageUpgrades +
    state.actualTrainingSkillGainUpgrades +
    state.actualExhaustionRecoveryUpgrades +
    state.actualHitPointsRecoveryUpgrades

  // KJA2 make these 8 and 4 and ratios above and below into constants, once this is moved to AI
  // Note: if the multiplier for sumTotalAllAlreadyPurchasedUpgraded is too large,
  // then the AI player spends all money just buying agents and catching up with transport and training cap.
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
  const currentAgentCap = AGENT_CAP + state.desiredAgentCapUpgrades * 4
  if (state.desiredAgentCount === currentAgentCap) {
    state.desiredAgentCapUpgrades += 1
    return
  }
  state.desiredAgentCount += 1
}

export const {
  incrementActualWeaponDamageUpgrades,
  incrementActualTrainingSkillGainUpgrades,
  incrementActualExhaustionRecoveryUpgrades,
  incrementActualHitPointsRecoveryUpgrades,
  incrementActualAgentCapUpgrades,
  incrementActualTransportCapUpgrades,
  incrementActualTrainingCapUpgrades,
  increaseDesiredCounts,
  reset: resetAiState,
} = aiStateSlice.actions

export default aiStateSlice.reducer
