import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { missions } from '../collections/missions'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
} from '../ruleset/constants'
import initialState, { makeInitialState } from '../ruleset/initialState'
import advanceTurnImpl from './advanceTurnImpl'
import type { Agent, MissionSite } from './model'

// 🚧KJA 2 Dedup the "prepare" be using something like "withPlayerAction" https://chatgpt.com/c/687c730e-12d4-8011-96fc-be2be1ef5e94
// Also style guide says many reducers should work with same player action: https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
// See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
// See https://redux.js.org/understanding/history-and-design/middleware
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: {
      reducer(state) {
        advanceTurnImpl(state)
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    hireAgent: {
      reducer(state) {
        const newAgent: Agent = {
          id: `agent-${state.nextAgentId.toString().padStart(3, '0')}`,
          turnHired: state.turn,
          state: 'InTransit',
          assignment: 'Standby',
          skill: AGENT_INITIAL_SKILL,
          exhaustion: AGENT_INITIAL_EXHAUSTION,
          hitPoints: AGENT_INITIAL_HIT_POINTS,
          maxHitPoints: AGENT_INITIAL_HIT_POINTS,
          recoveryTurns: 0,
          hitPointsLostBeforeRecovery: 0,
          missionsSurvived: 0,
        }
        state.agents.push(newAgent)
        state.nextAgentId += 1
        state.actionsCount += 1
        state.hireCost += AGENT_HIRE_COST
      },
      prepare() {
        return { payload: undefined, meta: { playerAction: true } }
      },
    },
    sackAgents: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToSack = action.payload
        for (const agent of state.agents) {
          if (agentIdsToSack.includes(agent.id)) {
            agent.state = 'Terminated'
            agent.assignment = 'Sacked'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    assignAgentsToContracting: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToAssign = action.payload
        for (const agent of state.agents) {
          if (agentIdsToAssign.includes(agent.id)) {
            agent.assignment = 'Contracting'
            agent.state = 'InTransit'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    assignAgentsToEspionage: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToAssign = action.payload
        for (const agent of state.agents) {
          if (agentIdsToAssign.includes(agent.id)) {
            agent.assignment = 'Espionage'
            agent.state = 'InTransit'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    recallAgents: {
      reducer(state, action: PayloadAction<string[]>) {
        const agentIdsToRecall = action.payload
        for (const agent of state.agents) {
          if (agentIdsToRecall.includes(agent.id)) {
            agent.assignment = 'Standby'
            agent.state = 'InTransit'
          }
        }
        state.actionsCount += 1
      },
      prepare(agentIds: string[]) {
        return { payload: agentIds, meta: { playerAction: true } }
      },
    },
    setMoney(state, action: PayloadAction<number>) {
      state.money = action.payload
    },
    setFunding(state, action: PayloadAction<number>) {
      state.funding = action.payload
    },
    reset(state, action: PayloadAction<{ debug?: boolean } | undefined>) {
      const stateAfterReset = makeInitialState({ debug: action.payload?.debug === true })

      Object.assign(state, stateAfterReset)
    },
    investigateLead: {
      reducer(state, action: PayloadAction<{ leadId: string; intelCost: number }>) {
        const { leadId, intelCost } = action.payload

        // Add to investigatedLeadIds if not already there (for all leads)
        if (!state.investigatedLeadIds.includes(leadId)) {
          state.investigatedLeadIds.push(leadId)
        }

        // Track investigation count for all leads
        const currentCount = state.leadInvestigationCounts[leadId] ?? 0
        state.leadInvestigationCounts[leadId] = currentCount + 1

        // Find missions that depend on this lead and create mission sites for them
        const dependentMissions = missions.filter((mission) => mission.dependsOn.includes(leadId))
        for (const mission of dependentMissions) {
          const missionSiteId = `mission-site-${state.nextMissionSiteId.toString().padStart(3, '0')}`
          const newMissionSite: MissionSite = {
            id: missionSiteId,
            missionId: mission.id,
            agentIds: [],
            state: 'Active',
            expiresIn: mission.expiresIn,
            objectives: mission.objectives.map((objective) => ({
              id: objective.id,
              difficulty: objective.difficulty, // KJA mission-site ideally this is not copied, just retrieved by reference to mission
              fulfilled: false,
            })),
          }
          state.missionSites.push(newMissionSite)
          state.nextMissionSiteId += 1
        }

        state.intel -= intelCost
        state.actionsCount += 1
      },
      prepare(leadId: string, intelCost: number) {
        return { payload: { leadId, intelCost }, meta: { playerAction: true } }
      },
    },
    deployAgentsToMission: {
      reducer(state, action: PayloadAction<{ missionSiteId: string; agentIds: string[] }>) {
        const { missionSiteId, agentIds } = action.payload

        // Find the mission site and update it
        const missionSite = state.missionSites.find((site) => site.id === missionSiteId)
        if (missionSite) {
          missionSite.agentIds = [...agentIds]
          missionSite.state = 'Deployed'

          // Assign agents to the mission site
          for (const agent of state.agents) {
            if (agentIds.includes(agent.id)) {
              agent.assignment = missionSiteId
              agent.state = 'OnMission'
            }
          }
        }

        state.actionsCount += 1
      },
      prepare(missionSiteId: string, agentIds: string[]) {
        return { payload: { missionSiteId, agentIds }, meta: { playerAction: true } }
      },
    },
  },
})

export const {
  advanceTurn,
  hireAgent,
  sackAgents,
  assignAgentsToContracting,
  assignAgentsToEspionage,
  recallAgents,
  setMoney,
  setFunding,
  reset,
  investigateLead,
  deployAgentsToMission,
} = gameStateSlice.actions
export default gameStateSlice.reducer
