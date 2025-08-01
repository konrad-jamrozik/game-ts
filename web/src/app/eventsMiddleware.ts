import type { Middleware } from '@reduxjs/toolkit'
import { ActionCreators } from 'redux-undo'
import { getMissionById } from '../collections/missions'
import { addEvent } from '../model/eventsSlice'
import {
  advanceTurn,
  hireAgent,
  reset,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToEspionage,
  recallAgents,
  investigateLead,
  deployAgentsToMission,
} from '../model/gameStateSlice'
import type { RootState } from './store'

// Type guard for action
// Redux actions are defined by having "type" property of type "string".
function hasType(obj: unknown): obj is { type: string } {
  return typeof obj === 'object' && obj !== null && 'type' in obj && typeof (obj as { type: unknown }).type === 'string'
}

// eslint disabled per https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function eventsMiddleware(): Middleware<{}, RootState> {
  // eslint-disable-next-line complexity, max-statements
  return (store) => (next) => (action) => {
    // Get the state before the action for comparison
    const previousState = store.getState()
    const previousGameState = previousState.undoable.present.gameState

    // Call the next middleware/reducer first to update the state
    const result = next(action)

    // Get the updated state
    const state = store.getState()
    const { gameState } = state.undoable.present

    // Dispatch events based on the action
    // eslint-disable-next-line unicorn/prefer-regexp-test
    if (advanceTurn.match(action)) {
      store.dispatch(
        addEvent({
          message: `Turn ${gameState.turn} started`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )

      // Check for newly successful missions and log their rewards
      const previouslySuccessfulMissionIds = new Set(
        previousGameState.missionSites.filter((site) => site.state === 'Successful').map((site) => site.missionId),
      )

      const newlySuccessfulMissions = gameState.missionSites
        .filter((site) => site.state === 'Successful' && !previouslySuccessfulMissionIds.has(site.missionId))
        .map((site) => getMissionById(site.missionId))

      // 🚧KJA consolidate these into one event "mission completion" and make it new type of event, not player action event.
      for (const mission of newlySuccessfulMissions) {
        store.dispatch(
          addEvent({
            message: `Mission "${mission.title}" completed successfully!`,
            turn: gameState.turn,
            actionsCount: gameState.actionsCount,
          }),
        )

        // Log individual rewards
        const { rewards } = mission
        if (rewards.money !== undefined) {
          store.dispatch(
            addEvent({
              message: `Received $${rewards.money} from mission completion`,
              turn: gameState.turn,
              actionsCount: gameState.actionsCount,
            }),
          )
        }
        if (rewards.intel !== undefined) {
          store.dispatch(
            addEvent({
              message: `Gained ${rewards.intel} intel from mission completion`,
              turn: gameState.turn,
              actionsCount: gameState.actionsCount,
            }),
          )
        }
        if (rewards.funding !== undefined) {
          store.dispatch(
            addEvent({
              message: `Received ${rewards.funding} funding from mission completion`,
              turn: gameState.turn,
              actionsCount: gameState.actionsCount,
            }),
          )
        }
        if (rewards.panicReduction !== undefined) {
          store.dispatch(
            addEvent({
              message: `Panic reduced by ${rewards.panicReduction} from mission completion`,
              turn: gameState.turn,
              actionsCount: gameState.actionsCount,
            }),
          )
        }
      }
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (hireAgent.match(action)) {
      store.dispatch(
        addEvent({
          message: 'Agent hired',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (sackAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      store.dispatch(
        addEvent({
          message: `Sacked ${agentCount} agent${agentCount > 1 ? 's' : ''}`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (assignAgentsToContracting.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      store.dispatch(
        addEvent({
          message: `OnAssignment ${agentCount} agent${agentCount > 1 ? 's' : ''} to contracting`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (assignAgentsToEspionage.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      store.dispatch(
        addEvent({
          message: `OnAssignment ${agentCount} agent${agentCount > 1 ? 's' : ''} to espionage`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (recallAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      store.dispatch(
        addEvent({
          message: `Recalled ${agentCount} agent${agentCount > 1 ? 's' : ''}`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (investigateLead.match(action)) {
      const { leadId, intelCost } = action.payload
      store.dispatch(
        addEvent({
          message: `Investigated lead: ${leadId} (cost: ${intelCost} intel)`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (deployAgentsToMission.match(action)) {
      const { missionSiteId, agentIds } = action.payload
      const agentCount = agentIds.length

      // Find the mission site to get the mission info for logging
      const missionSite = gameState.missionSites.find((site) => site.id === missionSiteId)
      const missionTitle = missionSite ? getMissionById(missionSite.missionId).title : 'Unknown Mission'

      store.dispatch(
        addEvent({
          message: `Deployed ${agentCount} agent${agentCount > 1 ? 's' : ''} to mission: ${missionTitle}`,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
      // eslint-disable-next-line unicorn/prefer-regexp-test
    } else if (reset.match(action)) {
      store.dispatch(
        addEvent({
          message: 'Game reset',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hasType(action) && ActionCreators.undo().type === action.type) {
      store.dispatch(
        addEvent({
          message: 'Action undone',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hasType(action) && ActionCreators.redo().type === action.type) {
      store.dispatch(
        addEvent({
          message: 'Action redone',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hasType(action) && ActionCreators.jumpToPast(0).type === action.type) {
      store.dispatch(
        addEvent({
          message: 'Turn reset',
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    }

    return result
  }
}
