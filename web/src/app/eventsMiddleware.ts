import type { Middleware } from '@reduxjs/toolkit'
import pluralize from 'pluralize'
import { ActionCreators } from 'redux-undo'
import { getMissionById } from '../collections/missions'
import { addEvent } from '../model/eventsSlice'
import {
  advanceTurn,
  assignAgentsToContracting,
  assignAgentsToEspionage,
  deployAgentsToMission,
  hireAgent,
  investigateLead,
  recallAgents,
  reset,
  sackAgents,
} from '../model/gameStateSlice'
import type { RootState } from './store'

// This unicorn prefer-regexp-test rule [1] incorrectly thinks that "match" comes from String and not from Redux actionCreator [2].
// [1] https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v57.0.0/docs/rules/prefer-regexp-test.md
// [2] https://redux-toolkit.js.org/api/createAction?utm_source=chatgpt.com#actioncreatormatch
/* eslint-disable unicorn/prefer-regexp-test */

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

    // Single helper to post an event using current turn/actionsCount
    function postEvent(message: string): void {
      store.dispatch(addEvent({ message, turn: gameState.turn, actionsCount: gameState.actionsCount }))
    }

    // Dispatch events based on the action
    if (advanceTurn.match(action)) {
      postEvent(`Turn ${gameState.turn} started`)

      // Check for newly successful missions and log their rewards
      const previouslySuccessfulMissionIds = new Set(
        previousGameState.missionSites.filter((site) => site.state === 'Successful').map((site) => site.missionId),
      )

      const newlySuccessfulMissions = gameState.missionSites
        .filter((site) => site.state === 'Successful' && !previouslySuccessfulMissionIds.has(site.missionId))
        .map((site) => getMissionById(site.missionId))

      // 🚧KJA consolidate these into one event "mission completion" and make it new type of event, not player action event.
      for (const mission of newlySuccessfulMissions) {
        postEvent(`Mission "${mission.title}" completed successfully!`)

        // Log individual rewards
        const { rewards } = mission
        if (rewards.money !== undefined) {
          postEvent(`Received $${rewards.money} from mission completion`)
        }
        if (rewards.intel !== undefined) {
          postEvent(`Gained ${rewards.intel} intel from mission completion`)
        }
        if (rewards.funding !== undefined) {
          postEvent(`Received ${rewards.funding} funding from mission completion`)
        }
        if (rewards.panicReduction !== undefined) {
          postEvent(`Panic reduced by ${rewards.panicReduction} from mission completion`)
        }
      }
    } else if (hireAgent.match(action)) {
      postEvent('Agent hired')
    } else if (sackAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postEvent(`Sacked ${agentCount} ${pluralize('agent', agentCount)}`)
    } else if (assignAgentsToContracting.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postEvent(`OnAssignment ${agentCount} ${pluralize('agent', agentCount)} to contracting`)
    } else if (assignAgentsToEspionage.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postEvent(`OnAssignment ${agentCount} ${pluralize('agent', agentCount)} to espionage`)
    } else if (recallAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postEvent(`Recalled ${agentCount} ${pluralize('agent', agentCount)}`)
    } else if (investigateLead.match(action)) {
      const { leadId, intelCost } = action.payload
      postEvent(`Investigated lead: ${leadId} (cost: ${intelCost} intel)`)
    } else if (deployAgentsToMission.match(action)) {
      const { missionSiteId, agentIds } = action.payload
      const agentCount = agentIds.length

      // Find the mission site to get the mission info for logging
      const missionSite = gameState.missionSites.find((site) => site.id === missionSiteId)
      const missionTitle = missionSite ? getMissionById(missionSite.missionId).title : 'Unknown Mission'

      postEvent(`Deployed ${agentCount} ${pluralize('agent', agentCount)} to mission: ${missionTitle}`)
    } else if (reset.match(action)) {
      postEvent('Game reset')
    } else if (hasType(action) && ActionCreators.undo().type === action.type) {
      postEvent('Action undone')
    } else if (hasType(action) && ActionCreators.redo().type === action.type) {
      postEvent('Action redone')
    } else if (hasType(action) && ActionCreators.jumpToPast(0).type === action.type) {
      postEvent('Turn reset')
    }

    return result
  }
}
