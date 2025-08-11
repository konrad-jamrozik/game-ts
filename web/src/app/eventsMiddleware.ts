import type { Middleware } from '@reduxjs/toolkit'
import pluralize from 'pluralize'
import { ActionCreators } from 'redux-undo'
import { getMissionById } from '../collections/missions'
import { addMissionCompletedEvent, addTextEvent, clearEvents, truncateEventsTo } from '../model/eventsSlice'
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
import isPlayerAction from '../model/isPlayerAction'
import type { Agent, MissionRewards, MissionSite, MissionSiteState } from '../model/model'
import { isMissionSiteConcluded } from '../model/ruleset'
import { agsV } from '../model/views/AgentsView'
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
  // eslint-disable-next-line max-statements
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

    // eslint-disable-next-line @typescript-eslint/max-params
    function postMissionCompletedEvent(
      missionTitle: string,
      rewards: MissionRewards,
      missionSiteId: string,
      finalState: MissionSiteState,
      agentsLost: number,
      agentsWounded: number,
      agentsUnscathed: number,
    ): void {
      store.dispatch(
        addMissionCompletedEvent({
          missionTitle,
          rewards,
          missionSiteId,
          finalState,
          agentsLost,
          agentsWounded,
          agentsUnscathed,
          turn: gameState.turn,
          actionsCount: gameState.actionsCount,
        }),
      )
    }

    // Dispatch events based on the action
    if (advanceTurn.match(action)) {
      postTextEvent(`Turn ${gameState.turn} started`)

      // Check for newly concluded mission sites and log mission completion event with details
      const previouslyConcludedMissionSiteIds = new Set(
        previousGameState.missionSites
          .filter((site: MissionSite) => isMissionSiteConcluded(site))
          .map((site) => site.id),
      )

      const newlyConcludedMissionSites = gameState.missionSites.filter(
        (site: MissionSite) => isMissionSiteConcluded(site) && !previouslyConcludedMissionSiteIds.has(site.id),
      )

      for (const missionSite of newlyConcludedMissionSites) {
        const mission = getMissionById(missionSite.missionId)
        // Compute agent outcome counts for this mission site
        const deployedAgents = agsV(gameState.agents).deployedOnMissionSite(missionSite.id).toAgentArray()

        const agentsLost = deployedAgents.filter((agent: Agent) => agent.state === 'Terminated').length
        const agentsWounded = deployedAgents.filter(
          (agent: Agent) => agent.state !== 'Terminated' && agent.recoveryTurns > 0,
        ).length
        const agentsUnscathed = deployedAgents.filter(
          (agent: Agent) => agent.state !== 'Terminated' && agent.recoveryTurns === 0,
        ).length

        postMissionCompletedEvent(
          mission.title,
          mission.rewards,
          missionSite.id,
          missionSite.state,
          agentsLost,
          agentsWounded,
          agentsUnscathed,
        )
      }
    } else if (hireAgent.match(action)) {
      postTextEvent('Agent hired')
    } else if (sackAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Sacked ${agentCount} ${pluralize('agent', agentCount)}`)
    } else if (assignAgentsToContracting.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`OnAssignment ${agentCount} ${pluralize('agent', agentCount)} to contracting`)
    } else if (assignAgentsToEspionage.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`OnAssignment ${agentCount} ${pluralize('agent', agentCount)} to espionage`)
    } else if (recallAgents.match(action)) {
      const agentIds = action.payload
      const agentCount = agentIds.length
      postTextEvent(`Recalled ${agentCount} ${pluralize('agent', agentCount)}`)
    } else if (investigateLead.match(action)) {
      const { leadId, intelCost } = action.payload
      postTextEvent(`Investigated lead: ${leadId} (cost: ${intelCost} intel)`)
    } else if (deployAgentsToMission.match(action)) {
      const { missionSiteId, agentIds } = action.payload
      const agentCount = agentIds.length

      // Find the mission site to get the mission info for logging
      const missionSite = gameState.missionSites.find((site) => site.id === missionSiteId)
      const missionTitle = missionSite ? getMissionById(missionSite.missionId).title : 'Unknown Mission'

      postTextEvent(`Deployed ${agentCount} ${pluralize('agent', agentCount)} to mission: ${missionTitle}`)
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
