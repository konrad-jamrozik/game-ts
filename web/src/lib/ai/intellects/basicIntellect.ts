import {
  hireAgent,
  assignAgentsToContracting,
  deployAgentsToMission,
  startLeadInvestigation,
  buyUpgrade,
} from '../../../redux/slices/gameStateSlice'
import { AGENT_HIRE_COST } from '../../data_tables/constants'
import { available, notTerminated } from '../../model_utils/agentUtils'
import {
  filterMissionsByState,
  getRemainingTransportCap,
  validateMissionDeployment,
} from '../../model_utils/missionUtils'
import { dataTables } from '../../data_tables/dataTables'
import { UPGRADE_PRICES } from '../../data_tables/upgrades'
import type { AIPlayerIntellect } from '../types'
import type { GameState } from '../../model/gameStateModel'
import type { AppDispatch } from '../../../redux/store'

export const basicIntellect: AIPlayerIntellect = {
  name: 'Basic',
  playTurn: (getState, dispatch) => {
    basicIntellectPlayTurn(getState, dispatch)
  },
}

function basicIntellectPlayTurn(getState: () => GameState, dispatch: AppDispatch): void {
  let state = getState()

  // 1. Hire agents if we have money and are below cap
  const nonTerminatedAgents = notTerminated(state.agents)
  while (state.money >= AGENT_HIRE_COST && nonTerminatedAgents.length < state.agentCap) {
    dispatch(hireAgent())
    state = getState()
    // Update nonTerminatedAgents after hiring
    const updatedNonTerminated = notTerminated(state.agents)
    if (updatedNonTerminated.length >= state.agentCap) {
      break
    }
  }

  state = getState()
  let availableAgents = available(state.agents)

  // 2. Prioritize defensive missions (faction operations) - especially high operation levels
  const activeMissions = filterMissionsByState(state.missions, ['Active'])
  availableAgents = deployToDefensiveMissions(getState, dispatch, availableAgents, activeMissions)

  // 3. Deploy to offensive missions (apprehend/raid) if we have transport capacity
  availableAgents = deployToOffensiveMissions(getState, dispatch, availableAgents, activeMissions)

  // 4. Start investigating leads if we have available agents and no active investigations for that lead
  availableAgents = startLeadInvestigations(getState, dispatch, availableAgents)

  // 5. Assign remaining available agents to contracting for income
  if (availableAgents.length > 0) {
    const agentIds = availableAgents.map((a) => a.id)
    dispatch(assignAgentsToContracting(agentIds))
    state = getState()
  }

  // 6. Consider buying upgrades if we have excess money
  // Prioritize agent cap and transport cap upgrades
  const upgradePriority: (keyof typeof UPGRADE_PRICES)[] = [
    'Agent cap',
    'Transport cap',
    'Training cap',
    'Weapon damage',
    'Exhaustion recovery',
    'Training skill gain',
    'Hit points recovery %',
  ]

  for (const upgradeName of upgradePriority) {
    const price = UPGRADE_PRICES[upgradeName]
    if (state.money >= price) {
      dispatch(buyUpgrade(upgradeName))
      // state = getState()
      // Only buy one upgrade per turn to be conservative
      break
    }
  }
}

function deployToDefensiveMissions(
  getState: () => GameState,
  dispatch: AppDispatch,
  availableAgents: ReturnType<typeof available>,
  activeMissions: ReturnType<typeof filterMissionsByState>,
): ReturnType<typeof available> {
  let state = getState()
  let currentAvailableAgents = availableAgents

  const defensiveMissions = activeMissions.filter((m) => typeof m.operationLevel === 'number')

  // Sort defensive missions by priority: higher operation level first, then by expiry (sooner first)
  const prioritizedDefensiveMissions = defensiveMissions.toSorted((a, b) => {
    const levelDiff = (b.operationLevel ?? 0) - (a.operationLevel ?? 0)
    if (levelDiff !== 0) {
      return levelDiff
    }
    // Sort by expiry: sooner expiring first
    if (a.expiresIn === 'never' && b.expiresIn === 'never') return 0
    if (a.expiresIn === 'never') return 1
    if (b.expiresIn === 'never') return -1
    return a.expiresIn - b.expiresIn
  })

  // Deploy agents to high-priority defensive missions
  for (const mission of prioritizedDefensiveMissions) {
    if (currentAvailableAgents.length === 0) break

    const validation = validateMissionDeployment(mission)
    if (!validation.isValid) continue

    const remainingTransportCap = getRemainingTransportCap(state.missions, state.transportCap)
    if (remainingTransportCap === 0) break

    // Deploy up to remaining transport cap, but prioritize having some agents available for other tasks
    const agentsToDeploy = Math.min(remainingTransportCap, currentAvailableAgents.length, 3)
    const agentIds = currentAvailableAgents.slice(0, agentsToDeploy).map((a) => a.id)

    dispatch(deployAgentsToMission({ missionId: mission.id, agentIds }))
    state = getState()
    currentAvailableAgents = available(state.agents)
  }

  return currentAvailableAgents
}

function deployToOffensiveMissions(
  getState: () => GameState,
  dispatch: AppDispatch,
  availableAgents: ReturnType<typeof available>,
  activeMissions: ReturnType<typeof filterMissionsByState>,
): ReturnType<typeof available> {
  let state = getState()
  let currentAvailableAgents = availableAgents

  const offensiveMissions = activeMissions.filter((m) => m.operationLevel === undefined)
  for (const mission of offensiveMissions) {
    if (currentAvailableAgents.length === 0) break

    const validation = validateMissionDeployment(mission)
    if (!validation.isValid) continue

    const remainingTransportCap = getRemainingTransportCap(state.missions, state.transportCap)
    if (remainingTransportCap === 0) break

    const agentsToDeploy = Math.min(remainingTransportCap, currentAvailableAgents.length, 2)
    const agentIds = currentAvailableAgents.slice(0, agentsToDeploy).map((a) => a.id)

    dispatch(deployAgentsToMission({ missionId: mission.id, agentIds }))
    state = getState()
    currentAvailableAgents = available(state.agents)
  }

  return currentAvailableAgents
}

function startLeadInvestigations(
  getState: () => GameState,
  dispatch: AppDispatch,
  availableAgents: ReturnType<typeof available>,
): ReturnType<typeof available> {
  let state = getState()
  let currentAvailableAgents = availableAgents

  const allLeads = dataTables.leads
  for (const lead of allLeads) {
    if (currentAvailableAgents.length === 0) break

    // Check if lead can be investigated
    const hasActiveInvestigation = Object.values(state.leadInvestigations).some(
      (inv) => inv.leadId === lead.id && inv.state === 'Active',
    )
    if (hasActiveInvestigation) continue

    // Check if lead is repeatable or hasn't been investigated
    const investigationCount = state.leadInvestigationCounts[lead.id] ?? 0
    if (!lead.repeatable && investigationCount > 0) continue

    // Check if dependencies are met
    const dependenciesMet = lead.dependsOn.every((depId) => {
      // Check if it's a mission dependency (starts with 'missiondata-')
      if (depId.startsWith('missiondata-')) {
        // For mission dependencies, check if any mission with that missionDataId has been won
        return state.missions.some((m) => m.missionDataId === depId && m.state === 'Won')
      }
      // For lead dependencies, check if lead has been investigated
      return (state.leadInvestigationCounts[depId] ?? 0) > 0
    })

    if (!dependenciesMet) continue

    // Start investigation with 1-2 agents
    const agentsToInvestigate = Math.min(currentAvailableAgents.length, 2)
    const agentIds = currentAvailableAgents.slice(0, agentsToInvestigate).map((a) => a.id)

    dispatch(startLeadInvestigation({ leadId: lead.id, agentIds }))
    state = getState()
    currentAvailableAgents = available(state.agents)
  }

  return currentAvailableAgents
}
