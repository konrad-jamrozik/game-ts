import type { Middleware } from '@reduxjs/toolkit'
import { ActionCreators } from 'redux-undo'
import { getMissionDataById } from '../lib/model_utils/missionUtils'
import { compactHistory } from './slices/historyCompaction'
import {
  addTextEvent,
  addTurnAdvancementEvent,
  clearEvents,
  compactEventsByTurn,
  truncateEventsTo,
  type EventNavigationTarget,
} from './slices/eventsSlice'
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
import type { RootReducerState } from './rootReducer'
import { fmtAgentCount } from '../lib/model_utils/formatUtils'
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
export function eventsMiddleware(): Middleware<{}, RootReducerState> {
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

    function postTextEvent(message: string, navigationTarget?: EventNavigationTarget): void {
      store.dispatch(
        addTextEvent({
          message,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
          ...(navigationTarget === undefined ? {} : { navigationTarget }),
        }),
      )
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
      // Compact undo history to keep only last state for turns N-3 and earlier
      store.dispatch(compactHistory())
      // Compact events log to remove events from turns N-3 and earlier
      store.dispatch(compactEventsByTurn({ currentTurn: gameState.turn }))
    } else if (hireAgent.match(action)) {
      postTextEvent('Agent hired', { type: 'AgentsDrilldown', filter: 'all' })
    } else if (sackAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Sacked ${fmtAgentCount(agentCount)}`, { type: 'AgentsDrilldown', filter: 'terminated' })
    } else if (assignAgentsToContracting.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Asgn. ${fmtAgentCount(agentCount)} to contracting`, { type: 'AgentsDrilldown', filter: 'away' })
    } else if (assignAgentsToTraining.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Asgn. ${fmtAgentCount(agentCount)} to training`, { type: 'AgentsDrilldown', filter: 'away' })
    } else if (recallAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Recalled ${fmtAgentCount(agentCount)}`, { type: 'AgentsDrilldown', filter: 'all' })
    } else if (startLeadInvestigation.match(action)) {
      const { leadId, agentIds } = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Invst. lead: ${leadId} with ${fmtAgentCount(agentCount)}`, {
        type: 'LeadsDrilldown',
        filter: 'activeInvestigations',
      })
    } else if (deployAgentsToMission.match(action)) {
      const { missionId, agentIds } = action.payload
      const agentCount = agentIds.length

      // Find the mission to get the mission info for logging
      const mission = gameState.missions.find((m) => m.id === missionId)
      assertDefined(mission, `Mission with id ${missionId} not found when logging deploy action`)
      const missionName = getMissionDataById(mission.missionDataId).name

      postTextEvent(`Deployed ${fmtAgentCount(agentCount)} to mission: ${missionName}`, {
        type: 'MissionsDrilldown',
        filter: 'deployed',
      })
    } else if (buyUpgrade.match(action)) {
      const upgradeName = action.payload
      postTextEvent(`Bought upg.: ${upgradeName}`, { type: 'UpgradesDrilldown', upgradeName })
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
