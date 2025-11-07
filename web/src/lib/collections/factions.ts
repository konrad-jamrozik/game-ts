import { bps } from '../model/bps'
import type { Faction } from '../model/model'

export const factions: Faction[] = [
  {
    id: 'faction-red-dawn',
    name: 'Red Dawn',
    threatLevel: bps(100),
    threatIncrease: bps(5),
    suppression: bps(0),
    discoveryPrerequisite: ['lead-red-dawn-profile'],
  },
]
