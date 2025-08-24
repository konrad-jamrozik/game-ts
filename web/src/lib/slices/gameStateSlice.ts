import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { missions } from '../collections/missions'
import { createWeapon } from '../utils/weaponUtils'
import { createEnemiesFromSpec } from '../utils/enemyUtils'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_INITIAL_HIT_POINTS,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_WEAPON_DAMAGE,
} from '../model/ruleset/constants'
import initialState, { makeInitialState } from '../model/ruleset/initialState'
import advanceTurnImpl from '../turn_advancement/advanceTurnImpl'
import asPlayerAction from './asPlayerAction'
import type { Agent, MissionSite, MissionSiteId } from '../model/model'

// Relevant docs on createSlice:
// https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
// See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
// See https://redux.js.org/understanding/history-and-design/middleware
const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: (state) => advanceTurnImpl(state),
    hireAgent: asPlayerAction((state) => {
      const nextAgentNumericId = state.agents.length
      const newAgentId = `agent-${nextAgentNumericId.toString().padStart(3, '0')}`

      const newAgent: Agent = {
        id: newAgentId,
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
        weapon: createWeapon(AGENT_INITIAL_WEAPON_DAMAGE),
      }
      state.agents.push(newAgent)
      state.currentTurnTotalHireCost += AGENT_HIRE_COST
    }),
    sackAgents: asPlayerAction<string[]>((state, action) => {
      const agentIdsToSack = action.payload
      for (const agent of state.agents) {
        if (agentIdsToSack.includes(agent.id)) {
          agent.state = 'Terminated'
          agent.assignment = 'Sacked'
        }
      }
    }),
    assignAgentsToContracting: asPlayerAction<string[]>((state, action) => {
      const agentIdsToAssign = action.payload
      for (const agent of state.agents) {
        if (agentIdsToAssign.includes(agent.id)) {
          agent.assignment = 'Contracting'
          agent.state = 'InTransit'
        }
      }
    }),
    assignAgentsToEspionage: asPlayerAction<string[]>((state, action) => {
      const agentIdsToAssign = action.payload
      for (const agent of state.agents) {
        if (agentIdsToAssign.includes(agent.id)) {
          agent.assignment = 'Espionage'
          agent.state = 'InTransit'
        }
      }
    }),
    recallAgents: asPlayerAction<string[]>((state, action) => {
      const agentIdsToRecall = action.payload
      for (const agent of state.agents) {
        if (agentIdsToRecall.includes(agent.id)) {
          agent.assignment = 'Standby'
          agent.state = 'InTransit'
        }
      }
    }),
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
    investigateLead: asPlayerAction<{ leadId: string; intelCost: number }>((state, action) => {
      const { leadId, intelCost } = action.payload

      // Track investigation count for all leads
      const currentCount = state.leadInvestigationCounts[leadId] ?? 0
      state.leadInvestigationCounts[leadId] = currentCount + 1

      // Find missions that depend on this lead and create mission sites for them
      const dependentMissions = missions.filter((mission) => mission.dependsOn.includes(leadId))
      for (const mission of dependentMissions) {
        // Invariant: next mission site numeric id is always the current number of mission sites
        const nextMissionNumericId = state.missionSites.length
        const missionSiteId: MissionSiteId = `mission-site-${nextMissionNumericId.toString().padStart(3, '0')}`
        const newMissionSite: MissionSite = {
          id: missionSiteId,
          missionId: mission.id,
          agentIds: [],
          state: 'Active',
          expiresIn: mission.expiresIn,
          enemies: createEnemiesFromSpec(mission.enemyUnitsSpec), // Create enemies from spec
        }
        state.missionSites.push(newMissionSite)
      }

      state.intel -= intelCost
    }),
    deployAgentsToMission: asPlayerAction<{ missionSiteId: MissionSiteId; agentIds: string[] }>((state, action) => {
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
    }),
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
