import type { Faction } from '../model/model'

export const factions: Faction[] = [
  {
    id: 'faction-red-dawn',
    name: 'Red Dawn',
    threatLevel: 100,
    threatIncrement: 5,
    suppression: 0,
    discoveryPrerequisite: ['lead-red-dawn-profile'],
  },
]
