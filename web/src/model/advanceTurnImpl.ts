import { getMissionById } from '../collections/missions'
import {
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  SUPPRESSION_DECAY_PCT,
} from '../ruleset/constants'
import { applyMissionRewards } from './applyMissionRewards'
import type { GameState } from './model'
import { getMoneyNewBalance, getIntelNewBalance } from './modelDerived'

// Helper functions for turn advancement
function updateAgentStatesAndExhaustion(state: GameState): void {
  for (const agent of state.agents) {
    // Update exhaustion based on agent state and assignment
    if (agent.state === 'OnAssignment' && (agent.assignment === 'Contracting' || agent.assignment === 'Espionage')) {
      agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
    } else if (agent.state === 'OnMission') {
      agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
    } else if (agent.state === 'Available' && agent.assignment === 'Standby') {
      agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)
    }
    if (agent.state === 'InTransit') {
      agent.state =
        agent.assignment === 'Contracting' || agent.assignment === 'Espionage' ? 'OnAssignment' : 'Available'
    } else if (agent.state === 'OnMission') {
      // Agents on mission return to standby after one turn
      agent.state = 'InTransit'
      agent.assignment = 'Standby'
    }
  }
}

function updateFactionsAndPanic(state: GameState): void {
  // Increase panic by the sum of (threat level - suppression) for all factions
  // This uses current suppression values, exactly as displayed in SituationReportCard
  const totalPanicIncrease = state.factions.reduce(
    (sum, faction) => sum + Math.max(0, faction.threatLevel - faction.suppression),
    0,
  )
  state.panic += totalPanicIncrease

  // Apply suppression decay AFTER panic calculation
  for (const faction of state.factions) {
    faction.suppression = Math.floor(faction.suppression * (1 - SUPPRESSION_DECAY_PCT / 100))
  }

  // Increment faction threat levels
  for (const faction of state.factions) {
    faction.threatLevel += faction.threatIncrease
  }
}

function updateMissionSites(state: GameState): void {
  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      // Check if mission site should be marked as successful or failed
      const newState = missionSite.agentIds.length >= 2 ? 'Successful' : 'Failed'

      // If mission becomes successful, apply rewards
      if (newState === 'Successful') {
        const mission = getMissionById(missionSite.missionId)
        applyMissionRewards(state, mission.rewards)
      }

      missionSite.state = newState
    } else if (missionSite.state === 'Active') {
      // Handle mission site expiration countdown
      // eslint-disable-next-line unicorn/no-lonely-if
      if (missionSite.expiresIn !== 'never') {
        missionSite.expiresIn -= 1
        if (missionSite.expiresIn <= 0) {
          missionSite.state = 'Expired'
        }
      }
    }
  }
}

export default function advanceTurnImpl(state: GameState): void {
  state.turn += 1
  state.actionsCount = 0

  // Update agent states and exhaustion
  updateAgentStatesAndExhaustion(state)

  // Update factions and panic (uses current suppression, then applies decay)
  updateFactionsAndPanic(state)

  // Update mission sites and apply rewards (including new suppression after decay)
  updateMissionSites(state)

  // Update money, intel, and hire cost
  state.money = getMoneyNewBalance(state)
  state.intel = getIntelNewBalance(state)
  state.hireCost = 0
}
