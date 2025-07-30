import type { GameState, MissionRewards } from './model'

// 🚧 KJA rename file to applyMissionRewards
// Helper function to apply mission rewards to game state
export function applyMissionRewards(state: GameState, rewards: MissionRewards): void {
  // Apply basic rewards
  if (rewards.money !== undefined) {
    state.money += rewards.money
  }
  if (rewards.intel !== undefined) {
    state.intel += rewards.intel
  }
  if (rewards.funding !== undefined) {
    state.funding += rewards.funding
  }
  if (rewards.panicReduction !== undefined) {
    state.panic = Math.max(0, state.panic - rewards.panicReduction)
  }

  // Apply faction rewards
  if (rewards.factionRewards) {
    for (const factionReward of rewards.factionRewards) {
      const targetFaction = state.factions.find((faction) => faction.id === factionReward.factionId)
      // 🚧 KJA throw assertion error if faction not found. Probs capture in relevant "getFaction" function.
      if (targetFaction) {
        if (factionReward.threatReduction !== undefined) {
          targetFaction.threatLevel = Math.max(0, targetFaction.threatLevel - factionReward.threatReduction)
        }
        if (factionReward.suppression !== undefined) {
          targetFaction.suppressionLevel += factionReward.suppression
        }
      }
    }
  }
}
