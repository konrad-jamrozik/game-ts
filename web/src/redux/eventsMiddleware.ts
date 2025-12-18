import type { Middleware } from '@reduxjs/toolkit'
import { ActionCreators } from 'redux-undo'
import { getMissionDataById } from '../lib/dataTables/dataTables'
import { addTextEvent, addTurnAdvancementEvent, clearEvents, truncateEventsTo } from './slices/eventsSlice'
import {
  advanceTurn,
  assignAgentsToContracting,
  assignAgentsToTraining,
  buyUpgrade,
  deployAgentsToMission,
  hireAgent,
  startLeadInvestigation,
  recallAgents,
  reset,
  sackAgents,
} from './slices/gameStateSlice'
import { isPlayerAction } from './reducer_utils/asPlayerAction'
import type { RootState } from './rootReducer'
import { fmtAgentCount } from '../lib/model_utils/formatModelUtils'
import { assertDefined } from '../lib/primitives/assertPrimitives'

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
  // eslint-disable-next-line unicorn/consistent-function-scoping
  return (store) => (next) => (action) => {
    // Get the state before the action for comparison
    const previousState = store.getState()
    const previousGameState = previousState.undoable.present.gameState

    // Before we apply any player action or turn advancement,
    // truncate any events that occurred after it.
    // This ensures the event log remains consistent with the undo/redo timeline.
    if (isPlayerAction(action) || advanceTurn.match(action)) {
      store.dispatch(truncateEventsTo({ turn: previousGameState.turn, actionsCount: previousGameState.actionsCount }))
    }

    // Call the next middleware/reducer to update the state
    const result = next(action)

    // Get the updated state
    const state = store.getState()
    const { gameState } = state.undoable.present

    function postTextEvent(message: string): void {
      store.dispatch(addTextEvent({ message, turn: gameState.turn, actionsCount: gameState.actionsCount }))
    }

    // Dispatch events based on the action
    if (advanceTurn.match(action)) {
      assertDefined(gameState.turnStartReport)
      // Record turn advancement event (report data is available in game state)
      store.dispatch(
        addTurnAdvancementEvent({
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    } else if (hireAgent.match(action)) {
      postTextEvent('Agent hired')
    } else if (sackAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Sacked ${fmtAgentCount(agentCount)}`)
    } else if (assignAgentsToContracting.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Assigned ${fmtAgentCount(agentCount)} to contracting`)
    } else if (assignAgentsToTraining.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Assigned ${fmtAgentCount(agentCount)} to training`)
    } else if (recallAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Recalled ${fmtAgentCount(agentCount)}`)
    } else if (startLeadInvestigation.match(action)) {
      const { leadId, agentIds } = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Started investigating lead: ${leadId} with ${fmtAgentCount(agentCount)}`)
    } else if (deployAgentsToMission.match(action)) {
      const { missionId, agentIds } = action.payload
      const agentCount = agentIds.length

      // Find the mission to get the mission info for logging
      const mission = gameState.missions.find((m) => m.id === missionId)
      const missionName = mission ? getMissionDataById(mission.missionDataId).name : 'Unknown Mission'

      postTextEvent(`Deployed ${fmtAgentCount(agentCount)} to mission: ${missionName}`)
    } else if (buyUpgrade.match(action)) {
      const upgradeName = action.payload
      postTextEvent(`Bought upgrade: ${upgradeName}`)
    } else if (reset.match(action)) {
      // Clear all events on full game reset
      store.dispatch(clearEvents())
    } else if (hasType(action) && ActionCreators.undo().type === action.type) {
      // Do not create events for undo
    } else if (hasType(action) && ActionCreators.redo().type === action.type) {
      // Do not create events for redo
    } else if (hasType(action) && ActionCreators.jumpToPast(0).type === action.type) {
      // Do not create events for reset turn
    }

    return result
  }
}
