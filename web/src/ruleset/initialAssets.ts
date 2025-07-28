import type { GameState } from '../model/model'

const initialAssets: Pick<
  GameState,
  'agents' | 'money' | 'intel' | 'funding' | 'investigatedLeadIds' | 'leadInvestigationCounts' | 'missionSites'
> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeadIds: [],
  leadInvestigationCounts: {},
  missionSites: [],
}

const debugInitialAssets = {
  ...initialAssets,
  intel: 500,
  investigatedLeadIds: ['lead-red-dawn-profile'],
  leadInvestigationCounts: { 'lead-red-dawn-profile': 1 },
}

export default debugInitialAssets
