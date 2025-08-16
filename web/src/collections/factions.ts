import type { Faction } from '../model/lib/model'

export const factions: Faction[] = [
  {
    id: 'faction-red-dawn',
    name: 'Red Dawn',
    threatLevel: 100,
    threatIncrease: 5,
    suppression: 0,
    discoveryPrerequisite: ['lead-red-dawn-profile'],
  },
]
