import type { GameState } from '../model/model'

const initialAssets: Pick<
  GameState,
  | 'agents'
  | 'money'
  | 'intel'
  | 'funding'
  | 'investigatedLeadIds'
  | 'leadInvestigationCounts'
  | 'missionSites'
  | 'factions'
> = {
  agents: [],
  money: 500,
  intel: 0,
  funding: 20,
  investigatedLeadIds: [],
  leadInvestigationCounts: {},
  missionSites: [],
  factions: [
    {
      id: 'faction-red-dawn',
      name: 'Red Dawn',
      threatLevel: 0,
      suppressionLevel: 0,
    },
  ],
}

const debugInitialAssets = { ...initialAssets, intel: 500 }

export default debugInitialAssets
