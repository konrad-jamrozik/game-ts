import {
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
  SUPPRESSION_DECAY_PCT,
} from '../ruleset/constants'
import { assertEqual } from '../utils/assert'
import { floor } from '../utils/mathUtils'
import type { GameState } from './model'
import { getIntelNewBalance, getMoneyNewBalance } from './modelDerived'
import { updateDeployedMissionSite } from './updateDeployedMissionSite'

// Helper functions for turn advancement
function updateAgentStatesAndExhaustion(state: GameState): void {
  for (const agent of state.agents) {
    // Handle recovery countdown and hit point restoration
    if (agent.state === 'Recovering') {
      if (agent.recoveryTurns > 0) {
        agent.recoveryTurns -= 1

        // Calculate total recovery turns originally needed
        const originalHitPointsLost = agent.hitPointsLostBeforeRecovery
        const totalRecoveryTurns = Math.ceil(((originalHitPointsLost / agent.maxHitPoints) * 100) / 2)

        // Calculate which turn of recovery we just completed
        const turnsCompletedSoFar = totalRecoveryTurns - agent.recoveryTurns

        // Calculate cumulative hit points to restore based on linear progression
        const hitPointsPerTurn = originalHitPointsLost / totalRecoveryTurns
        const totalHitPointsToRestoreSoFar = floor(hitPointsPerTurn * turnsCompletedSoFar)

        // Set current hit points based on cumulative restoration
        agent.hitPoints = agent.maxHitPoints - originalHitPointsLost + totalHitPointsToRestoreSoFar
      }

      if (agent.recoveryTurns <= 0) {
        assertEqual(
          agent.hitPoints,
          agent.maxHitPoints,
          'Agent hit points should be fully restored on recovery completion',
        )
        // Reset recovery state
        agent.hitPointsLostBeforeRecovery = 0
        agent.state = 'Available'
        agent.assignment = 'Standby'
      }
    }

    // Update exhaustion based on agent state and assignment
    if (agent.state === 'OnAssignment' && (agent.assignment === 'Contracting' || agent.assignment === 'Espionage')) {
      agent.exhaustion += AGENT_EXHAUSTION_INCREASE_PER_TURN
    } else if ((agent.state === 'Available' && agent.assignment === 'Standby') || agent.state === 'Recovering') {
      agent.exhaustion = Math.max(0, agent.exhaustion - AGENT_EXHAUSTION_RECOVERY_PER_TURN)
    }

    // Handle state transitions
    if (agent.state === 'InTransit') {
      if (agent.assignment === 'Contracting' || agent.assignment === 'Espionage') {
        agent.state = 'OnAssignment'
      } else if (agent.assignment === 'Recovery') {
        agent.state = 'Recovering'
      } else {
        agent.state = 'Available'
      }
    } else if (agent.state === 'OnMission') {
      // Deployed mission site update will handle these agents, so we just set them to transit for now
      // The actual deployed mission site update will set their proper state
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
    faction.suppression = floor(faction.suppression * (1 - SUPPRESSION_DECAY_PCT / 100))
  }

  // Increment faction threat levels
  for (const faction of state.factions) {
    faction.threatLevel += faction.threatIncrease
  }
}

function updateMissionSites(state: GameState): void {
  for (const missionSite of state.missionSites) {
    if (missionSite.state === 'Deployed') {
      updateDeployedMissionSite(state, missionSite)
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

  // Update money, intel, and hire cost
  state.money = getMoneyNewBalance(state)
  state.intel = getIntelNewBalance(state)

  // KJA This must be reviewed and potentially split: exhaustion computation must happen AFTER mission site computation,
  // but some things may need to happen before.
  //
  // Update agent states and exhaustion
  updateAgentStatesAndExhaustion(state)

  // Update factions and panic (uses current suppression, then applies decay)
  updateFactionsAndPanic(state)

  // Update mission sites and apply rewards (including new suppression after decay)
  updateMissionSites(state)

  state.hireCost = 0
}
