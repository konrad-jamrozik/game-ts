import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { missions, getMissionById } from '../collections/missions'
import {
  AGENT_HIRE_COST,
  AGENT_INITIAL_SKILL,
  AGENT_INITIAL_EXHAUSTION,
  AGENT_EXHAUSTION_INCREASE_PER_TURN,
  AGENT_EXHAUSTION_RECOVERY_PER_TURN,
} from '../ruleset/constants'
import initialAssets from '../ruleset/initialAssets'
import { applyMissionRewards } from './missionRewards'
import type { GameState, Agent, MissionSite } from './model'
import { getMoneyNewBalance, getIntelNewBalance } from './modelDerived'

const initialState: GameState = {
  turn: 1,
  actionsCount: 0,
  nextAgentId: 0,
  nextMissionSiteId: 0,
  hireCost: 50,
  panic: 0,
  factions: [
    {
      id: 'faction-red-dawn',
      name: 'Red Dawn',
      threatLevel: 100,
      threatIncrement: 5,
      suppressionLevel: 0,
      discoveryPrerequisite: ['lead-red-dawn-profile'],
    },
  ],
  ...initialAssets,
}

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState,
  reducers: {
    advanceTurn: {
      // 🚧KJA 2 Dedup this "prepare" be using something like "withPlayerAction" https://chatgpt.com/c/687c730e-12d4-8011-96fc-be2be1ef5e94
      // Also style guide says many reducers should work with same player action: https://redux.js.org/style-guide/#allow-many-reducers-to-respond-to-the-same-action
      // See https://redux-toolkit.js.org/usage/usage-with-typescript#wrapping-createslice
      // See https://redux.js.org/understanding/history-and-design/middleware
      reducer(state) {
        state.turn += 1
        state.actionsCount = 0
        // Handle InTransit agents based on their assignment and update exhaustion
        for (const agent of state.agents) {
          // Update exhaustion based on agent state and assignment
          if (
            agent.state === 'OnAssignment' &&
            (agent.assignment === 'Contracting' || agent.assignment === 'Espionage')
          ) {
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

        // Update mission site states and apply rewards for successful missions
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
        state.money = getMoneyNewBalance(state)
        state.intel = getIntelNewBalance(state)
        state.hireCost = 0

        // Increase panic by the sum of all faction threat levels
        const totalThreatLevel = state.factions.reduce((sum, faction) => sum + faction.threatLevel, 0)
        state.panic += totalThreatLevel

        // Increment faction threat levels
        for (const faction of state.factions) {
          faction.threatLevel += faction.threatIncrement
        }
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
        state.agents = state.agents.filter((agent) => !agentIdsToSack.includes(agent.id))
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
    reset(state) {
      Object.assign(state, initialState)
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
